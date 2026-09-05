import { ErpActionBar, FocusErpPaginationFooter, MachineriesListComponent, ToolsListComponent, PackagingMaterialsComponent, PunchingStampListComponent, CoatingAccessoriesComponent } from './ErpListModules';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { printHtml } from './PrintHelper';
import { generateHighFidelityDocHtml } from './DocumentPrintGenerator';
import { OvertimeManagementComponent as OvertimeManagementComponentHoisted } from './OvertimeManagementComponent';
import { playClickSound } from '../utils/audioChimes';
import { 
  Briefcase, FileText, ClipboardList, BookOpen, Receipt, ShoppingCart, ShoppingBag,
  Trash2, Printer, Plus, RotateCcw, Check, Save, User, MapPin, Phone, 
  Mail, Calendar, DollarSign, LayoutDashboard, Search, Filter, TrendingUp,
  FileCheck, ShieldAlert, Award, Download, Clock, Wrench, Database, Scale, Shield, ShieldCheck, Truck, Box, Layers, Eye, Edit, Users,
  Coins, Undo2, Menu, X, Landmark, Percent, Calculator, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, XCircle, Settings, Droplet, PenTool, BarChart3
} from 'lucide-react';
import { QcReportsComponent } from './QcReportsComponent';
import { DataSheetsComponent } from './DataSheetsComponent';
import { EngineeringDrawingsComponent } from './EngineeringDrawingsComponent';
import InvoiceDeliveryNoteForm from './InvoiceDeliveryNoteForm';
import ErpCustomerView from './ErpCustomerView';
import HomeView from './HomeView';
import ErpCommissionView from './ErpCommissionView';
import TransporterPaymentsView from './TransporterPaymentsView';
import { IncomingMaterialsComponent } from './IncomingMaterialsComponent';
import { DispatchedMaterialsComponent } from './DispatchedMaterialsComponent';
import { InvoicePlannerComponent as InvoicePlannerComp } from './InvoicePlannerComponent';
import { InvoiceRecordsComponent as InvoiceRecordsComp } from './InvoiceRecordsComponent';
import { ReceiptRecordsComponent, handlePrintVoucher } from './ReceiptRecordsComponent';
import { CreditNoteRecordsComponent } from './CreditNoteRecordsComponent';
import { ReceiptComponent as ModernReceiptComponent } from './ReceiptComponent';
import { CustomerOrderCommissionView } from './CustomerOrderCommissionView';
import { CreditNoteComponent, CreditNote, CreditNoteItem } from './CreditNoteComponent';
import CustomerSoaComponent from './CustomerSoaComponent';
import BankAccountBox from './BankAccountBox';
import FinancialVouchers from './FinancialVouchers';
import SupplierPurchaseManager from './SupplierPurchaseManager';
import FinancialReportsHub from './FinancialReportsHub';
import UaeVat201ManagerComponent from './UaeVat201ManagerComponent';
import PayrollReportsComponent from './PayrollReportsComponent';
import StockReportsView from './StockReportsView';
import ParticularsLedgerComponent from './ParticularsLedgerComponent';
import DaybookComponent from './DaybookComponent';
import SalesReportView from './SalesReportView';
import PurchaseReportView from './PurchaseReportView';
import { ExpenseComponent } from './ExpenseComponent';
import { getInitialStandardsProducts, getInitialFineThreadUNF, loadStandardsProductsWithMerge, loadFineThreadProductsWithMerge } from '../initialData';
import { ProductRow, Category, AppUser } from '../types';
import { INITIAL_CUSTOMERS } from '../customerData';
import { CompanyProfile, getActiveCompany, getCompanyGrnCategories, getCompanyFinancialCategories } from '../utils/companyProfile';

// ERP Data structures & local registers
interface PackingList {
  id: string;
  packingNo: string;
  invoiceNo: string;
  dated: string;
  buyerName: string;
  buyerAddress: string;
  totalCartons: number;
  totalGrossWeight: number; // kg
  totalNetWeight: number; // kg
  dimensionCbm: number; // Cubic meters
  items: Array<{
    sn: number;
    description: string;
    qty: number;
    unit: string;
    cartonNo: string;
    netWeight: number;
    grossWeight: number;
  }>;
}

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

interface PurchaseOrder {
  id: string;
  poNo: string;
  dated: string;
  supplierName: string;
  supplierAddress: string;
  deliveryDate: string;
  paymentTerms: string;
  shippingTerms: string;
  currency: string;
  exchangeRate: number;
  items: Array<{
    sn: number;
    description: string;
    qty: number;
    unit: string;
    unitPrice: number;
  }>;
}

const INITIAL_PACK_LISTS: PackingList[] = [];

const INITIAL_RECEIPTS: ReceiptVoucher[] = [];

const INITIAL_CREDIT_NOTES: CreditNote[] = [];

const numberToWordsDirhams = (num: number): string => {
  if (num === 0) return 'ZERO DIRHAMS ONLY';
  
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const scales = ['', 'THOUSAND', 'MILLION', 'BILLION'];

  const convertSection = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 105)] + ' HUNDRED '; // Let's use ones index of Math.floor(n/100) properly
      str = ones[Math.floor(n / 100)] + ' HUNDRED ';
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

const handlePrintReceiptVoucher = (rcToPrint: any) => {
  const words = numberToWordsDirhams(rcToPrint.amountReceived);
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MFI Cash/Cheque Receipt Voucher #${rcToPrint.voucherNo}</title>
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
          background-color: #ffffff;
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
          border-radius: 2px;
          font-weight: 750;
          background-color: #1e3a8a;
          color: #ffffff;
          margin-left: 4px;
          display: inline-block;
          vertical-align: middle;
        }
        
        .company-subtitle {
          font-size: 6px;
          font-weight: 750;
          color: #475569;
          margin-top: 1px;
          text-transform: uppercase;
          letter-spacing: 0.1px;
        }
        
        .company-contact {
          font-size: 5.5px;
          font-weight: 600;
          color: #64748b;
          margin-top: 1px;
        }
        
        .title-strip {
          background-color: #1e3a8a;
          color: #ffffff;
          padding: 3.5px 10px;
          font-weight: 900;
          font-size: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .voucher-no-label {
          font-size: 9px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .voucher-no-val {
          color: #ffffff;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 900;
          margin-left: 4px;
        }
        
        .payment-badges-group {
          display: flex;
          gap: 6px;
        }
        
        .payment-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 9999px;
          padding: 1px 6px;
          font-size: 8px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
        }
        
        .payment-badge.active {
          background-color: #ffffff;
          color: #1e3a8a;
          border-color: #ffffff;
        }
        
        .payment-badge .bullet {
          font-size: 6px;
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
            margin: 0 !important;
          }
          body {
            padding: 0.5in !important;
            margin: 0 !important;
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
          <!-- Header Block -->
          <div class="header-box">
            <div class="header-left">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 220" style="height: 28px; width: auto; display: block;">
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
              </svg>
            </div>
            <div class="header-mid">
              <div>
                <span class="company-title-en">MARINE FASTENERS INDUSTRIES L.L.C.</span>
                <span class="company-title-sp">Sole Proprietorship</span>
              </div>
              <div class="company-subtitle">Manufacturer of Fasteners, Pipe Support Clamps, Conduit Accessories.</div>
              <div class="company-contact">
                Shed 31, New Industrial Area, Ajman - U.A.E. &bull; Tel: +971 6 525 0526 &bull; Email: sales@marinefasteners.co
              </div>
            </div>
          </div>

          <!-- Title Strip Block -->
          <div class="title-strip">
            <div>
              <span class="voucher-no-label">${rcToPrint.accountCategory === 'PAYABLES' ? 'Payment Voucher No.' : (rcToPrint.paymentMode === 'CHEQUE' ? 'Cheque Received Voucher No.' : 'Receipt Voucher No.')}</span>
              <span class="voucher-no-val">${rcToPrint.voucherNo || ''}</span>
            </div>
            
            <div style="font-weight: 900; font-size: 10px; letter-spacing: 0.5px; color: #ffffff; text-shadow: 1px 1px 1px rgba(0,0,0,0.2);">
              ${rcToPrint.accountCategory === 'PAYABLES' ? (rcToPrint.paymentMode === 'CHEQUE' ? 'CHEQUE PAYMENT OFFICIAL VOUCHER' : 'OFFICIAL PAYMENT VOUCHER') : (rcToPrint.paymentMode === 'CHEQUE' ? 'CHEQUE RECEIVED OFFICIAL VOUCHER' : 'OFFICIAL PAYMENT RECEIPT')}
            </div>
            
            <div class="payment-badges-group">
              <div class="payment-badge ${rcToPrint.paymentMode === 'CASH' ? 'active' : ''}">
                <span class="bullet">●</span> Cash
              </div>
              <div class="payment-badge ${rcToPrint.paymentMode === 'CHEQUE' ? 'active' : ''}">
                <span class="bullet">●</span> Cheque
              </div>
              <div class="payment-badge ${(rcToPrint.paymentMode !== 'CASH' && rcToPrint.paymentMode !== 'CHEQUE') ? 'active' : ''}">
                <span class="bullet">●</span> Bank Wire
              </div>
            </div>
          </div>

          <!-- Main Grid Layout -->
          <div class="main-grid">
            <div>
              <div class="field-row">
                <span class="field-label">${rcToPrint.accountCategory === 'PAYABLES' ? 'Payee:' : 'Received From:'}</span>
                <div class="field-value">${rcToPrint.clientName || ''}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Address:</span>
                <div class="field-value">${rcToPrint.clientAddress || 'AJMAN NEW INDUSTRIAL AREA - U.A.E.'}</div>
              </div>
              <div class="field-row">
                <span class="field-label">Amount In Words:</span>
                <div class="field-value" style="font-size: 8.5px; font-weight: 800; line-height: 1.2;">${words}</div>
              </div>
              <div class="field-row">
                <span class="field-label">${rcToPrint.accountCategory === 'PAYABLES' ? 'For Payment Of:' : 'For Payment Of:'}</span>
                <div class="field-value">${rcToPrint.narration || rcToPrint.description || 'SETTLEMENT OF OUTSTANDING METALLIC COATING INVOICE'}</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; justify-content: space-between;">
              <div class="field-row" style="justify-content: flex-end;">
                <span class="field-label" style="min-width: auto; margin-right: 4px;">Dated:</span>
                <div class="field-value" style="max-width: 120px; font-family: monospace; font-weight: 900; color: #0f172a;">${rcToPrint.dated || ''}</div>
              </div>

              <div class="num-box-container">
                <span class="num-title">${rcToPrint.accountCategory === 'PAYABLES' ? 'Amount Paid' : 'Amount Received'}</span>
                <div class="num-box">
                  <span class="num-ccy">AED</span>
                  <span>${Number(rcToPrint.amountReceived || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cheque details row if applicable -->
          ${rcToPrint.paymentMode === 'CHEQUE' ? `
            <div class="cheque-section" style="font-size: 8.5px; color: #1e3a8a; line-height: 1.4; display: grid; grid-template-cols: 1.2fr 1fr 1fr; gap: 10px;">
              <div>
                <span style="font-weight: 900; text-transform: uppercase;">Cheque No / Details:</span>
                <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 100px; text-transform: uppercase;">${rcToPrint.chequeNoDetails || ''}</span>
              </div>
              <div>
                <span style="font-weight: 900; text-transform: uppercase;">Drawn Bank:</span>
                <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 100px; text-transform: uppercase;">${rcToPrint.bankName || 'RAK BANK'}</span>
              </div>
              <div>
                <span style="font-weight: 900; text-transform: uppercase;">Cheque Date:</span>
                <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 100px;">${rcToPrint.dated || ''}</span>
              </div>
            </div>
          ` : `
            <div class="cheque-section" style="font-size: 8.5px; color: #1e3a8a; line-height: 1.4;">
              <span style="font-weight: 900; text-transform: uppercase;">Transaction Reference / Details:</span>
              <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 250px; text-transform: uppercase;">${rcToPrint.chequeNoDetails || 'CASH PAYOUT RECORDED'}</span>
            </div>
          `}

          <!-- Footer Block -->
          <div class="footer-signatures">
            <div class="sig-client">${rcToPrint.accountCategory === 'PAYABLES' ? "Recipient's Signature" : "Receiver's Signature"}</div>
            <div class="sig-mfi">
              <div class="stamp-space">MFI Forge Hub Stamp</div>
              <div class="sig-line">Prepared & Verified By</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  printHtml(htmlContent, `MFI_Receipt_Voucher_${rcToPrint.voucherNo}`);
};

const INITIAL_PURCHASES: PurchaseOrder[] = [];

const calculateInvGrandTotalAndVat = (inv: any) => {
  let itemSum = 0;
  let vatSum = 0;
  const isVATApplicable = !inv.isZeroRatedExport;
  if (inv.items && Array.isArray(inv.items)) {
    inv.items.forEach((it: any) => {
      const qty = Number(it.qty) || 0;
      const price = Number(it.unitPriceWOVAT) || Number(it.unitPrice) || 0;
      const netItem = qty * price;
      itemSum += netItem;
      if (isVATApplicable) {
        vatSum += netItem * ((Number(it.vatRate !== undefined ? it.vatRate : 5) || 0) / 100);
      }
    });
  }
  const discount = Number(inv.discountAmt) || 0;
  const freight = Number(inv.freightAmt) || 0;
  const totalVal = itemSum - discount;
  const grandTotal = totalVal + vatSum + freight;
  return { subTotal: itemSum, taxValue: vatSum, grandTotal };
};

interface ErpViewProps {
  currentUser: AppUser | null;
  onNavigate?: (tab: 'home' | 'about' | 'products' | 'technical' | 'workflow' | 'erp' | 'stores_qc') => void;
  mode?: 'erp' | 'stores_qc';
}

export default function ErpView({ currentUser, onNavigate, mode = 'erp' }: ErpViewProps) {
  const activeTabKey = mode === 'stores_qc' ? 'mf_stores_qc_active_tab' : 'mf_erp_active_tab';
  const defaultTab = mode === 'stores_qc' ? 'goods_dispatched_notes' : 'customer';

  // Multi-Company Active State Integration
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);

  useEffect(() => {
    const handleCompanyUpdate = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('storage', handleCompanyUpdate);
    window.addEventListener('active_company_changed', handleCompanyUpdate);
    window.addEventListener('company_profile_updated', handleCompanyUpdate);
    return () => {
      window.removeEventListener('storage', handleCompanyUpdate);
      window.removeEventListener('active_company_changed', handleCompanyUpdate);
      window.removeEventListener('company_profile_updated', handleCompanyUpdate);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem(activeTabKey);
    return saved && saved !== 'blank' ? saved : defaultTab;
  });

  const [activeClient, setActiveClient] = useState('ZAMIL HEAVY INDUSTRIES LTD');

  useEffect(() => {
    localStorage.setItem(activeTabKey, activeTab);
  }, [activeTab, activeTabKey]);

  useEffect(() => {
    const handleReset = () => {
      const stored = localStorage.getItem(activeTabKey);
      if (stored && stored !== 'blank') {
        setActiveTab(stored);
      } else {
        setActiveTab(defaultTab);
      }
    };
    window.addEventListener('erp_tab_reset', handleReset);
    return () => window.removeEventListener('erp_tab_reset', handleReset);
  }, [defaultTab, activeTabKey]);

  useEffect(() => {
    if (activeTab === 'home') {
      if (onNavigate) {
        onNavigate('home');
        localStorage.setItem(activeTabKey, defaultTab);
        setActiveTab(defaultTab);
      }
    }
  }, [activeTab, onNavigate, activeTabKey, defaultTab]);

  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem(activeTabKey);
      if (stored && stored !== activeTab) {
        setActiveTab(stored);
      }
    };
    const handleCustomSetTab = (e: Event) => {
      const customEv = e as CustomEvent;
      const targetTab = customEv.detail;
      if (targetTab && targetTab !== activeTab) {
        setActiveTab(targetTab);
      } else {
        handleSync();
      }
    };
    handleSync();
    // Also support storage event listener
    window.addEventListener('storage', handleSync);
    window.addEventListener('mf_erp_set_tab', handleCustomSetTab);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('mf_erp_set_tab', handleCustomSetTab);
    };
  }, [activeTab, activeTabKey]);

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  const [selectedMobileDept, setSelectedMobileDept] = useState<string>(() => {
    return mode === 'stores_qc' ? 'procurement' : 'portal';
  });

  const movedTabIds = useMemo(() => [
    'goods_dispatched_notes',
    'machineries_list',
    'tools_list',
    'packaging_materials',
    'coating_accessories',
    'data_sheets',
    'drawings_register',
    'qc_reports',
    'purchase',
    'purchase_req_record',
    'incoming_materials'
  ], []);

  useEffect(() => {
    if (activeTab === 'blank') return;
    const isTabInMode = mode === 'stores_qc' ? movedTabIds.includes(activeTab) : !movedTabIds.includes(activeTab);
    if (!isTabInMode && activeTab !== 'home') {
      setActiveTab(defaultTab);
    }
  }, [mode, activeTab, defaultTab, movedTabIds]);

  const isRecordTab = ['work_orders_records', 'invoice_record', 'quotations_record'].includes(activeTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const rawDepartments = useMemo(() => {
    if (mode === 'stores_qc') {
      return [
        {
          id: 'procurement',
          label: 'Purchase & GRN',
          accentColor: 'bg-emerald-500',
          accentText: 'text-emerald-600',
          bgGradient: 'from-emerald-50/30 to-emerald-100/10',
          borderColor: 'border-emerald-100/50 hover:border-emerald-500/20',
          items: [
            { id: 'purchase', label: 'Purchase Request | PO', icon: ShoppingCart, textColor: 'text-teal-600', requiresEdit: true },
            { id: 'purchase_req_record', label: 'PR | PO Archives', icon: Database, textColor: 'text-teal-600' },
            { id: 'incoming_materials', label: 'Goods Received (GRN)', icon: Shield, textColor: 'text-emerald-600' }
          ]
        },
        {
          id: 'logistics',
          label: 'Ops & Inventory',
          accentColor: 'bg-purple-500',
          accentText: 'text-purple-600',
          bgGradient: 'from-purple-50/30 to-purple-100/10',
          borderColor: 'border-purple-100/50 hover:border-purple-500/20',
          items: [
            { id: 'goods_dispatched_notes', label: 'Goods Dispatched (GDN)', icon: Truck, textColor: 'text-[#f37021]' },
            { id: 'machineries_list', label: 'Machineries Register', icon: Wrench, textColor: 'text-indigo-600' },
            { id: 'tools_list', label: 'Production Tools List', icon: Wrench, textColor: 'text-pink-650' },
            { id: 'packaging_materials', label: 'Packaging Inventories', icon: Box, textColor: 'text-purple-600' },
            { id: 'coating_accessories', label: 'Coating Accessories', icon: Shield, textColor: 'text-fuchsia-600' },
            { id: 'data_sheets', label: 'DATA SHEET', icon: FileText, textColor: 'text-sky-600' },
            { id: 'drawings_register', label: 'DRAWING', icon: PenTool, textColor: 'text-blue-600' },
            { id: 'qc_reports', label: 'QC Reports', icon: ShieldCheck, textColor: 'text-amber-600' }
          ]
        }
      ];
    }

    return [
      {
        id: 'vouchers',
        label: 'Voucher',
        accentColor: 'bg-[#002D62]',
        accentText: 'text-[#002D62]',
        bgGradient: 'from-slate-50 to-slate-100',
        borderColor: 'border-[#A6C4DE]',
        items: [
          { id: 'customer', label: 'CUSTOMER REGISTRY', icon: Users, textColor: 'text-slate-700' },
          { id: 'work_orders_suite', label: 'Work Order', icon: ClipboardList, textColor: 'text-slate-700', requiresEdit: true },
          { id: 'invoice', label: 'Sales', icon: TrendingUp, textColor: 'text-emerald-700 font-bold', requiresEdit: true },
          { id: 'supplier_purchase', label: 'Purchase', icon: Plus, textColor: 'text-slate-700' },
          { id: 'contra', label: 'Contra', icon: Landmark, textColor: 'text-slate-700' },
          { id: 'payment', label: 'Payment', icon: DollarSign, textColor: 'text-slate-700' },
          { id: 'receipt', label: 'Receipt', icon: Coins, textColor: 'text-slate-700' },
          { id: 'journal', label: 'Journal', icon: BookOpen, textColor: 'text-slate-700' },
          { id: 'debit_note', label: 'Debit Note', icon: FileText, textColor: 'text-slate-700' },
          { id: 'credit_note', label: 'Credit Note', icon: Undo2, textColor: 'text-slate-700' },
          { id: 'quotation', label: 'Delivery Notes', icon: ClipboardList, textColor: 'text-slate-700', requiresEdit: true },
          { id: 'packing_list', label: 'Packing List', icon: FileText, textColor: 'text-slate-700', requiresEdit: true },
          { id: 'purchase', label: 'Purchase Req', icon: ShoppingCart, textColor: 'text-slate-700' },
          { id: 'customer_order_commission', label: 'Commission Ledger', icon: Award, textColor: 'text-slate-700' }
        ]
      },
      {
        id: 'view_records',
        label: 'VOUCHER RECORDS',
        accentColor: 'bg-[#002D62]',
        accentText: 'text-[#002D62]',
        bgGradient: 'from-slate-50 to-slate-100',
        borderColor: 'border-[#A6C4DE]',
        items: [
          { id: 'invoice_record', label: 'TAX INVOICE RECORDS', icon: Receipt, textColor: 'text-slate-700' },
          { id: 'proforma_record', label: 'PROFORMA INVOICE RECS', icon: FileText, textColor: 'text-amber-600' },
          { id: 'quotations_record', label: 'DEL NOTES RECORDS', icon: Truck, textColor: 'text-slate-700' },
          { id: 'supplier_purchase_records', label: 'PURCHASE RECORDS', icon: ShoppingBag, textColor: 'text-slate-700' },
          { id: 'work_orders_records', label: 'WORK ORDER RECORDS', icon: Clock, textColor: 'text-slate-700' },
          { id: 'packing_list_record', label: 'PACKING LIST RECORDS', icon: Box, textColor: 'text-slate-700' },
          { id: 'receipt_record', label: 'RECEIPT VOUCHERS RECS', icon: Coins, textColor: 'text-slate-700' },
          { id: 'credit_note_record', label: 'CREDIT NOTE ARCHIVES', icon: Undo2, textColor: 'text-slate-700' },
          { id: 'debit_note_record', label: 'DEBIT NOTE RECORDS', icon: FileText, textColor: 'text-slate-700' },
          { id: 'contra_record', label: 'CONTRA RECORDS', icon: Landmark, textColor: 'text-slate-700' },
          { id: 'journal_record', label: 'JOURNAL RECORDS', icon: BookOpen, textColor: 'text-slate-700' },
          { id: 'customer_order_commission_records', label: 'Commission Records', icon: Database, textColor: 'text-slate-700' }
        ]
      },
      {
        id: 'reports',
        label: 'REPORTS',
        accentColor: 'bg-[#002D62]',
        accentText: 'text-[#002D62]',
        bgGradient: 'from-slate-50 to-slate-100',
        borderColor: 'border-[#A6C4DE]',
        items: [
          { id: 'sales_report', label: 'SALES REPORT', icon: TrendingUp, textColor: 'text-slate-700' },
          { id: 'purchase_report', label: 'PURCHASE REPORTS', icon: ShoppingBag, textColor: 'text-slate-700' },
          { id: 'stock_reports', label: 'STOCK REPORTS', icon: Box, textColor: 'text-slate-700' },
          { id: 'balance_sheet', label: 'BALANCE SHEET', icon: Scale, textColor: 'text-slate-700' },
          { id: 'profit_loss', label: 'PROFIT & LOSS', icon: TrendingUp, textColor: 'text-slate-700' },
          { id: 'ratio_analysis', label: 'RATIO ANALYSIS', icon: BarChart3, textColor: 'text-slate-700' },
          { id: 'aging_statements', label: 'AGING STATEMENTS', icon: DollarSign, textColor: 'text-slate-700' },
          { id: 'final_accounts', label: 'TRIAL BALANCE', icon: BookOpen, textColor: 'text-slate-700' },
          { id: 'seller_performance', label: 'SELLER PERFORMANCE', icon: Users, textColor: 'text-slate-700' },
          { id: 'uae_vat_returns', label: 'UAE VAT RETURNS', icon: Percent, textColor: 'text-slate-700' },
          { id: 'payroll_reports', label: 'PAYROLL REPORTS', icon: FileText, textColor: 'text-slate-700' },
          { id: 'qc_reports', label: 'QC REPORTS & CERTIFICATES', icon: ShieldCheck, textColor: 'text-amber-700 font-bold' }
        ]
      },
      {
        id: 'banking',
        label: 'BANKING',
        accentColor: 'bg-[#002D62]',
        accentText: 'text-[#002D62]',
        bgGradient: 'from-slate-50 to-slate-100',
        borderColor: 'border-[#A6C4DE]',
        items: [
          { id: 'bank_account_box', label: 'BANK ACCOUNT', icon: Landmark, textColor: 'text-slate-700' },
          { id: 'customer_soa', label: 'STATEMENT OF ACCOUNTS', icon: Users, textColor: 'text-slate-700' },
          { id: 'particulars_ledger', label: 'GENERAL LEDGER', icon: BookOpen, textColor: 'text-slate-700' },
          { id: 'transporter_payments', label: 'TRANSPORTER PAYMENTS', icon: Truck, textColor: 'text-slate-700' }
        ]
      },
      {
        id: 'daybook_dept',
        label: 'DAY BOOK',
        accentColor: 'bg-[#FF6B00]',
        accentText: 'text-[#FF6B00]',
        bgGradient: 'from-slate-50 to-slate-100',
        borderColor: 'border-[#A6C4DE]',
        items: [
          { id: 'daybook', label: 'DAILY TRANSACTIONS DAYBOOK', icon: BookOpen, textColor: 'text-slate-700' }
        ]
      },
      {
        id: 'expenses_dept',
        label: 'EXPENSES',
        accentColor: 'bg-[#FF6B00]',
        accentText: 'text-[#FF6B00]',
        bgGradient: 'from-slate-50 to-slate-100',
        borderColor: 'border-[#A6C4DE]',
        items: [
          { id: 'expenses_view', label: 'EXPENSES', icon: TrendingUp, textColor: 'text-slate-700' }
        ]
      }
    ];
  }, [mode]);

  const departments = useMemo(() => {
    return rawDepartments.map(dept => {
      const filteredItems = dept.items.filter(item => {
        const isMoved = movedTabIds.includes(item.id);
        return mode === 'stores_qc' ? isMoved : !isMoved;
      });
      return {
        ...dept,
        items: filteredItems
      };
    }).filter(dept => dept.items.length > 0);
  }, [mode, movedTabIds, rawDepartments]);

  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    return mode === 'stores_qc' ? 'procurement' : 'vouchers';
  });

  useEffect(() => {
    const foundDept = departments.find(d => d.items.some(it => it.id === activeTab));
    if (foundDept) {
      setSelectedDeptId(foundDept.id);
    }
  }, [activeTab, departments]);

  const [isSidebarNavActive, setIsSidebarNavActive] = useState<boolean>(false);
  const [sidebarFocusedPane, setSidebarFocusedPane] = useState<'departments' | 'items'>('items');
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(0);
  const sidebarItemsContainerRef = useRef<HTMLDivElement>(null);
  const sidebarDeptsContainerRef = useRef<HTMLDivElement>(null);

  // Sync focused item index when activeTab or selectedDeptId changes
  useEffect(() => {
    const currentDept = departments.find(d => d.id === selectedDeptId);
    if (currentDept) {
      const filteredItems = currentDept.items.filter(it => !it.requiresEdit || canEdit);
      const tabIdx = filteredItems.findIndex(it => it.id === activeTab);
      if (tabIdx >= 0) {
        setFocusedItemIndex(tabIdx);
      } else {
        setFocusedItemIndex(0);
      }
    }
  }, [selectedDeptId, activeTab, departments, canEdit]);

  // Auto-scroll focused item into view in sidebar Column B when navigation is active
  useEffect(() => {
    if (!isSidebarNavActive || !sidebarItemsContainerRef.current) return;
    const targetEl = sidebarItemsContainerRef.current.querySelector(`[data-item-index="${focusedItemIndex}"]`) as HTMLElement;
    if (targetEl) {
      targetEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedItemIndex, selectedDeptId, isSidebarNavActive]);

  // Dual-Pane Sidebar Keyboard Navigation (Up, Down, Left, Right, Enter, Escape)
  useEffect(() => {
    const handleSidebarKeyboard = (e: KeyboardEvent) => {
      // If modal is active, let modal handle keyboard exclusively
      if (
        document.querySelector('.fixed.inset-0.z-50') ||
        document.querySelector('[role="dialog"]')
      ) {
        return;
      }

      // Check if user is typing inside an editable field
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable;

      if (e.key === 'Escape') {
        if (isInput) {
          target?.blur();
          e.preventDefault();
          return;
        }

        // Toggle / activate Sidebar Navigation Mode on Escape
        e.preventDefault();
        setIsSidebarNavActive(prev => !prev);
        setSidebarFocusedPane('items');
        playClickSound();
        return;
      }

      // If typing in input, do not intercept
      if (isInput) {
        return;
      }

      // If sidebar navigation is NOT active (i.e. user selected a box and is in workspace view),
      // do NOT intercept arrow keys or Enter key!
      if (!isSidebarNavActive) {
        return;
      }

      const currentDept = departments.find(d => d.id === selectedDeptId) || departments[0];
      const filteredItems = currentDept ? currentDept.items.filter(it => !it.requiresEdit || canEdit) : [];

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSidebarFocusedPane('departments');
        playClickSound();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSidebarFocusedPane('items');
        playClickSound();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (sidebarFocusedPane === 'departments') {
          const curIdx = departments.findIndex(d => d.id === selectedDeptId);
          const nextIdx = curIdx < departments.length - 1 ? curIdx + 1 : 0;
          setSelectedDeptId(departments[nextIdx].id);
          setFocusedItemIndex(0);
        } else {
          if (filteredItems.length > 0) {
            setFocusedItemIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
          }
        }
        playClickSound();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (sidebarFocusedPane === 'departments') {
          const curIdx = departments.findIndex(d => d.id === selectedDeptId);
          const prevIdx = curIdx > 0 ? curIdx - 1 : departments.length - 1;
          setSelectedDeptId(departments[prevIdx].id);
          setFocusedItemIndex(0);
        } else {
          if (filteredItems.length > 0) {
            setFocusedItemIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
          }
        }
        playClickSound();
      } else if (e.key === 'Enter') {
        if (sidebarFocusedPane === 'departments') {
          e.preventDefault();
          setSidebarFocusedPane('items');
          setFocusedItemIndex(0);
          playClickSound();
        } else {
          if (filteredItems[focusedItemIndex]) {
            e.preventDefault();
            const item = filteredItems[focusedItemIndex];
            setActiveTab(item.id);
            setIsSidebarNavActive(false); // Box selected -> stop arrow key navigation until Esc is pressed!
            triggerToast(`Loaded: ${item.label}`);
            playClickSound();
          }
        }
      }
    };

    window.addEventListener('keydown', handleSidebarKeyboard);
    return () => window.removeEventListener('keydown', handleSidebarKeyboard);
  }, [departments, selectedDeptId, sidebarFocusedPane, focusedItemIndex, canEdit, isSidebarNavActive]);

  const rawMobileDepts = useMemo(() => {
    if (mode === 'stores_qc') {
      return [
        { id: 'procurement', label: 'Purchase & GRN', icon: ShoppingCart, accent: 'text-emerald-400' },
        { id: 'logistics', label: 'Ops & Inventory', icon: Truck, accent: 'text-purple-400' }
      ];
    }
    return [
      { id: 'vouchers', label: 'VOUCHER', icon: Layers, accent: 'text-[#002D62]' },
      { id: 'view_records', label: 'VOUCHER RECORDS', icon: Database, accent: 'text-[#002D62]' },
      { id: 'reports', label: 'REPORTS', icon: TrendingUp, accent: 'text-[#002D62]' },
      { id: 'banking', label: 'BANKING', icon: Landmark, accent: 'text-[#002D62]' },
      { id: 'daybook_dept', label: 'DAY BOOK', icon: BookOpen, accent: 'text-[#FF6B00]' },
      { id: 'expenses_dept', label: 'EXPENSES', icon: Coins, accent: 'text-[#FF6B00]' }
    ];
  }, [mode]);

  const mobileDepts = useMemo(() => {
    return rawMobileDepts.filter(dept => {
      return departments.some(d => d.id === dept.id);
    });
  }, [departments, rawMobileDepts]);

  const rawMobileItems = useMemo(() => {
    if (mode === 'stores_qc') {
      return [
        { id: 'purchase', label: 'Purchase Request | PO', icon: ShoppingCart, textColor: 'text-teal-400', dept: 'procurement', requiresEdit: true },
        { id: 'purchase_req_record', label: 'PR | PO Archives', icon: Database, textColor: 'text-teal-400', dept: 'procurement' },
        { id: 'incoming_materials', label: 'Goods Received (GRN)', icon: Shield, textColor: 'text-green-400', dept: 'procurement' },
        { id: 'goods_dispatched_notes', label: 'Goods Dispatched (GDN)', icon: Truck, textColor: 'text-[#f37021]', dept: 'logistics' },
        { id: 'machineries_list', label: 'Machineries Register', icon: Wrench, textColor: 'text-indigo-400', dept: 'logistics' },
        { id: 'tools_list', label: 'Production Tools List', icon: Wrench, textColor: 'text-pink-400', dept: 'logistics' },
        { id: 'packaging_materials', label: 'Packaging Inventories', icon: Box, textColor: 'text-purple-400', dept: 'logistics' },
        { id: 'coating_accessories', label: 'Coating Accessories', icon: Shield, textColor: 'text-fuchsia-400', dept: 'logistics' },
        { id: 'data_sheets', label: 'DATA SHEET', icon: FileText, textColor: 'text-sky-400', dept: 'logistics' },
        { id: 'drawings_register', label: 'DRAWING', icon: PenTool, textColor: 'text-blue-400', dept: 'logistics' },
        { id: 'qc_reports', label: 'QC Reports', icon: ShieldCheck, textColor: 'text-amber-400', dept: 'logistics' }
      ];
    }
    return [
      { id: 'work_orders_suite', label: 'Work Order', icon: ClipboardList, textColor: 'text-rose-400', dept: 'vouchers', requiresEdit: true },
      { id: 'invoice', label: 'Sales', icon: TrendingUp, textColor: 'text-emerald-400 font-bold', dept: 'vouchers', requiresEdit: true },
      { id: 'supplier_purchase', label: 'Purchase', icon: Plus, textColor: 'text-indigo-400', dept: 'vouchers' },
      { id: 'contra', label: 'Contra', icon: Landmark, textColor: 'text-teal-400', dept: 'vouchers' },
      { id: 'payment', label: 'Payment', icon: DollarSign, textColor: 'text-rose-400', dept: 'vouchers' },
      { id: 'receipt', label: 'Receipt', icon: Coins, textColor: 'text-cyan-400', dept: 'vouchers' },
      { id: 'journal', label: 'Journal', icon: BookOpen, textColor: 'text-amber-400', dept: 'vouchers' },
      { id: 'debit_note', label: 'Debit Note', icon: FileText, textColor: 'text-sky-400', dept: 'vouchers' },
      { id: 'credit_note', label: 'Credit Note', icon: Undo2, textColor: 'text-rose-400', dept: 'vouchers' },
      { id: 'quotation', label: 'Delivery Notes', icon: ClipboardList, textColor: 'text-amber-400', dept: 'vouchers', requiresEdit: true },
      { id: 'packing_list', label: 'Packing List', icon: FileText, textColor: 'text-orange-400', dept: 'vouchers', requiresEdit: true },
      { id: 'purchase', label: 'Purchase Req', icon: ShoppingCart, textColor: 'text-indigo-400', dept: 'vouchers' },
      { id: 'customer', label: 'CUSTOMER REGISTRY', icon: Users, textColor: 'text-sky-400', dept: 'vouchers' },
      { id: 'customer_order_commission', label: 'Commission Ledger', icon: Award, textColor: 'text-sky-400', dept: 'vouchers' },
      
      { id: 'invoice_record', label: 'TAX INVOICE RECORDS', icon: Receipt, textColor: 'text-rose-400', dept: 'view_records' },
      { id: 'quotations_record', label: 'DEL NOTES RECORDS', icon: Truck, textColor: 'text-amber-400', dept: 'view_records' },
      { id: 'supplier_purchase_records', label: 'PURCHASE RECORDS', icon: ShoppingBag, textColor: 'text-indigo-400', dept: 'view_records' },
      { id: 'work_orders_records', label: 'WORK ORDER RECORDS', icon: Clock, textColor: 'text-rose-400', dept: 'view_records' },
      { id: 'packing_list_record', label: 'PACKING LIST RECORDS', icon: Box, textColor: 'text-orange-400', dept: 'view_records' },
      { id: 'receipt_record', label: 'RECEIPT VOUCHERS RECS', icon: Coins, textColor: 'text-cyan-400', dept: 'view_records' },
      { id: 'credit_note_record', label: 'CREDIT NOTE ARCHIVES', icon: Undo2, textColor: 'text-rose-400', dept: 'view_records' },
      { id: 'debit_note_record', label: 'DEBIT NOTE RECORDS', icon: FileText, textColor: 'text-sky-400', dept: 'view_records' },
      { id: 'contra_record', label: 'CONTRA RECORDS', icon: Landmark, textColor: 'text-teal-400', dept: 'view_records' },
      { id: 'journal_record', label: 'JOURNAL RECORDS', icon: BookOpen, textColor: 'text-amber-400', dept: 'view_records' },
      { id: 'customer_order_commission_records', label: 'Commission Records', icon: Database, textColor: 'text-slate-400', dept: 'view_records' },
      
      { id: 'sales_report', label: 'SALES REPORT', icon: TrendingUp, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'purchase_report', label: 'PURCHASE REPORTS', icon: ShoppingBag, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'stock_reports', label: 'STOCK REPORTS', icon: Box, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'balance_sheet', label: 'BALANCE SHEET', icon: Scale, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'profit_loss', label: 'PROFIT & LOSS', icon: TrendingUp, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'ratio_analysis', label: 'RATIO ANALYSIS', icon: BarChart3, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'aging_statements', label: 'AGING STATEMENTS', icon: DollarSign, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'final_accounts', label: 'TRIAL BALANCE', icon: BookOpen, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'seller_performance', label: 'SELLER PERFORMANCE', icon: Users, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'uae_vat_returns', label: 'UAE VAT RETURNS', icon: Percent, textColor: 'text-indigo-400', dept: 'reports' },
      { id: 'payroll_reports', label: 'PAYROLL REPORTS', icon: FileText, textColor: 'text-emerald-400', dept: 'reports' },
      { id: 'qc_reports', label: 'QC REPORTS & CERTIFICATES', icon: ShieldCheck, textColor: 'text-amber-400', dept: 'reports' },
      
      { id: 'customer_soa', label: 'STATEMENT OF ACCOUNTS', icon: Users, textColor: 'text-sky-400', dept: 'banking' },
      { id: 'particulars_ledger', label: 'GENERAL LEDGER', icon: BookOpen, textColor: 'text-indigo-400', dept: 'banking' },
      { id: 'transporter_payments', label: 'TRANSPORTER PAYMENTS', icon: Truck, textColor: 'text-[#002D62]', dept: 'banking' },
      
      { id: 'daybook', label: 'DAILY TRANSACTIONS DAYBOOK', icon: BookOpen, textColor: 'text-[#FF6B00]', dept: 'daybook_dept' },
      { id: 'expenses_view', label: 'EXPENSES', icon: TrendingUp, textColor: 'text-indigo-400', dept: 'expenses_dept' }
    ];
  }, [mode]);

  const mobileItems = useMemo(() => {
    return rawMobileItems.filter(item => {
      const isMoved = mode === 'stores_qc' ? movedTabIds.includes(item.id) : !movedTabIds.includes(item.id);
      return isMoved;
    });
  }, [mode, movedTabIds, rawMobileItems]);

  useEffect(() => {
    // Keep sidebar visible by default for records tabs ("full page view not required").
    // We do not force collapse anymore so the sidebar remains intact.
  }, [activeTab]);

  const activeDept = useMemo(() => {
    if (mode === 'stores_qc') {
      if (['purchase', 'purchase_req_record', 'incoming_materials'].includes(activeTab)) return 'procurement';
      if (['goods_dispatched_notes', 'machineries_list', 'tools_list', 'packaging_materials', 'coating_accessories', 'data_sheets', 'drawings_register', 'qc_reports'].includes(activeTab)) return 'logistics';
      return 'procurement';
    } else {
      if (['work_orders_suite', 'invoice', 'supplier_purchase', 'contra', 'payment', 'receipt', 'journal', 'debit_note', 'credit_note', 'quotation', 'packing_list', 'purchase', 'customer', 'customer_order_commission', 'for_invoice_cust', 'for_pl_cust'].includes(activeTab)) return 'vouchers';
      if (['invoice_record', 'quotations_record', 'supplier_purchase_records', 'work_orders_records', 'packing_list_record', 'receipt_record', 'credit_note_record', 'debit_note_record', 'contra_record', 'journal_record', 'customer_order_commission_records'].includes(activeTab)) return 'view_records';
      if (['sales_report', 'purchase_report', 'stock_reports', 'balance_sheet', 'profit_loss', 'aging_statements', 'final_accounts', 'seller_performance', 'uae_vat_returns', 'payroll_reports'].includes(activeTab)) return 'reports';
      if (['customer_soa', 'particulars_ledger', 'incoming_materials_payments_update', 'outgoing_materials_payments_update', 'transporter_payments'].includes(activeTab)) return 'banking';
      if (activeTab === 'daybook') return 'daybook_dept';
      if (activeTab === 'expenses_view') return 'expenses_dept';
      return 'vouchers';
    }
  }, [activeTab, mode]);

  useEffect(() => {
    setSelectedMobileDept(activeDept);
  }, [activeDept]);

  // Customer Prefill & Month selection logs
  const [qtnPreFillCustomer, setQtnPreFillCustomer] = useState<any | null>(null);
  const [invPreFillCustomer, setInvPreFillCustomer] = useState<any | null>(null);
  const [plPreFillCustomer, setPlPreFillCustomer] = useState<any | null>(null);
  const [selectedQtnMonth, setSelectedQtnMonth] = useState<'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC'>('JAN');
  const [selectedInvoiceMonth, setSelectedInvoiceMonth] = useState<'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC'>('JAN');

  const handleCustomerSelectionAction = (actionType: 'invoice' | 'quotation' | 'packing_list', customer: any) => {
    if (actionType === 'invoice') {
      setInvPreFillCustomer(customer);
      setActiveTab('invoice');
      triggerToast(`Loaded customer details in active Editor: ${customer.companyName}`);
    } else if (actionType === 'quotation') {
      setQtnPreFillCustomer(customer);
      setActiveTab('quotation');
      triggerToast(`Loaded customer details in live Quotation: ${customer.companyName}`);
    } else if (actionType === 'packing_list') {
      setPlPreFillCustomer(customer);
      setActiveTab('packing_list');
      triggerToast(`Created cargo release slip for: ${customer.companyName}`);
    }
  };

  // Overtime Management Global States (lifted here to avoid unmount-reset bugs and allow deletion of all dummy data)
  const [operators, setOperators] = useState<{ name: string; rate: number; role: string; isOutsideWorker?: boolean }[]>(() => {
    const saved = localStorage.getItem('MFI_OPERATORS_LIST');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      { name: 'FARID KHALID', rate: 35, role: 'Senior Machinist', isOutsideWorker: false },
      { name: 'REHMAN ANWAR', rate: 30, role: 'Hydraulic Press Operator', isOutsideWorker: false },
      { name: 'AMIN ISLAM', rate: 32, role: 'Thread-Rolling Technician', isOutsideWorker: false },
      { name: 'SADIQ REZA', rate: 28, role: 'Zinc Galvanizer & Helper', isOutsideWorker: true },
      { name: 'YASSER SHARIF', rate: 40, role: 'Crane & Rigging Supervisor', isOutsideWorker: false },
      { name: 'KABEER MEHMOOD', rate: 30, role: 'Quality Control Inspector', isOutsideWorker: false }
    ];
  });

  const [otLogs, setOtLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('MFI_OVERTIME_RECORDS');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('MFI_OPERATORS_LIST', JSON.stringify(operators));
  }, [operators]);

  useEffect(() => {
    localStorage.setItem('MFI_OVERTIME_RECORDS', JSON.stringify(otLogs));
  }, [otLogs]);

  // Sub-Register states
  const [packingRegisters, setPackingRegisters] = useState<PackingList[]>(() => {
    const saved = localStorage.getItem('MF_PACKING_LISTS');
    return saved ? JSON.parse(saved) : INITIAL_PACK_LISTS;
  });

  const [receiptRegisters, setReceiptRegisters] = useState<ReceiptVoucher[]>(() => {
    const saved = localStorage.getItem('MF_RECEIPT_VOUCHERS');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(() => {
    const saved = localStorage.getItem('MF_CREDIT_NOTES');
    let parsed: CreditNote[] = saved ? JSON.parse(saved) : INITIAL_CREDIT_NOTES;
    if (Array.isArray(parsed)) {
      parsed = parsed.filter(item => {
        const isJunk488 = item.creditNoteNo === 'CN-488' && item.partyName.includes('7Y65J');
        const isJunk467 = item.creditNoteNo === 'CN-467' && item.partyName === 'NOOR';
        return !isJunk488 && !isJunk467;
      });
    }
    return parsed;
  });

  const [activeReceiptId, setActiveReceiptId] = useState<string>(() => {
    const saved = localStorage.getItem('MF_RECEIPT_VOUCHERS');
    const parsed = saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
    return parsed && parsed.length > 0 ? parsed[0].id : '';
  });

  const [activeCnId, setActiveCnId] = useState<string>(() => {
    const saved = localStorage.getItem('MF_CREDIT_NOTES');
    let parsed: CreditNote[] = saved ? JSON.parse(saved) : INITIAL_CREDIT_NOTES;
    if (Array.isArray(parsed)) {
      parsed = parsed.filter(item => {
        const isJunk488 = item.creditNoteNo === 'CN-488' && item.partyName.includes('7Y65J');
        const isJunk467 = item.creditNoteNo === 'CN-467' && item.partyName === 'NOOR';
        return !isJunk488 && !isJunk467;
      });
    }
    return parsed && parsed.length > 0 ? parsed[0].id : '';
  });

  const [purchaseRegisters, setPurchaseRegisters] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('MF_PURCHASE_ORDERS');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [salesInvoices, setSalesInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('MF_SALES_INVOICES_EXCEL');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Helper to load unified client & customer database from all registries
  const loadUnifiedClientDatabase = (): string[] => {
    const uniqueNames = new Set<string>();

    // 1. MFI_ERP_CUSTOMERS
    try {
      const saved = localStorage.getItem('MFI_ERP_CUSTOMERS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            const n = (c.companyName || c.name || '').trim().toUpperCase();
            if (n) uniqueNames.add(n);
          });
        }
      }
    } catch (e) {}

    // 2. MF_REGISTERED_CUSTOMERS
    try {
      const saved = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            const n = (c.companyName || c.name || '').trim().toUpperCase();
            if (n) uniqueNames.add(n);
          });
        }
      }
    } catch (e) {}

    // 3. mf_customers_list
    try {
      const saved = localStorage.getItem('mf_customers_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            const n = (c.companyName || c.name || '').trim().toUpperCase();
            if (n) uniqueNames.add(n);
          });
        }
      }
    } catch (e) {}

    // 4. Invoices / Delivery Notes (MF_SAVED_DOCUMENTS_LIST)
    try {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((doc: any) => {
            const n = (doc.buyerName || doc.companyName || doc.clientName || '').trim().toUpperCase();
            if (n) uniqueNames.add(n);
          });
        }
      }
    } catch (e) {}

    // 5. Sales Invoices Excel (MF_SALES_INVOICES_EXCEL)
    try {
      const saved = localStorage.getItem('MF_SALES_INVOICES_EXCEL');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((inv: any) => {
            const n = (inv.customerName || inv.buyerName || '').trim().toUpperCase();
            if (n) uniqueNames.add(n);
          });
        }
      }
    } catch (e) {}

    // 6. INITIAL_CUSTOMERS
    if (Array.isArray(INITIAL_CUSTOMERS)) {
      INITIAL_CUSTOMERS.forEach(c => {
        const n = (c.companyName || '').trim().toUpperCase();
        if (n) uniqueNames.add(n);
      });
    }

    // 7. Seed / Fallback clients
    [
      'ZAMIL HEAVY INDUSTRIES LTD',
      'AL FANAR STEEL WORKS CO.',
      'SABIC BASIC CHEMICAL DIVISION',
      'SAUDI ARAMCO SPECIAL PROJECTS',
      'EMIRATES STEEL INDUSTRIES',
      'AJMAN STRUCTURAL FABRICATORS'
    ].forEach(n => uniqueNames.add(n));

    return Array.from(uniqueNames).sort();
  };

  // Client database for selection dropdowns (reactive)
  const [clientDatabase, setClientDatabase] = useState<string[]>(loadUnifiedClientDatabase);

  // Sync client database with real-time customer updates and storage events
  useEffect(() => {
    const handleSyncCustomers = () => {
      setClientDatabase(loadUnifiedClientDatabase());
    };

    window.addEventListener('storage', handleSyncCustomers);
    window.addEventListener('mfi_customers_updated', handleSyncCustomers);
    window.addEventListener('erp_customer_updated', handleSyncCustomers);
    window.addEventListener('mf_customers_updated', handleSyncCustomers);
    window.addEventListener('mf_documents_updated', handleSyncCustomers);
    window.addEventListener('mfi_saved_documents_updated', handleSyncCustomers);

    return () => {
      window.removeEventListener('storage', handleSyncCustomers);
      window.removeEventListener('mfi_customers_updated', handleSyncCustomers);
      window.removeEventListener('erp_customer_updated', handleSyncCustomers);
      window.removeEventListener('mf_customers_updated', handleSyncCustomers);
      window.removeEventListener('mf_documents_updated', handleSyncCustomers);
      window.removeEventListener('mfi_saved_documents_updated', handleSyncCustomers);
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    const cur = localStorage.getItem('MF_PACKING_LISTS');
    const nxt = JSON.stringify(packingRegisters);
    if (cur !== nxt) localStorage.setItem('MF_PACKING_LISTS', nxt);
  }, [packingRegisters]);

  useEffect(() => {
    const cur = localStorage.getItem('MF_RECEIPT_VOUCHERS');
    const nxt = JSON.stringify(receiptRegisters);
    if (cur !== nxt) localStorage.setItem('MF_RECEIPT_VOUCHERS', nxt);
  }, [receiptRegisters]);

  // Keep receipt registers synchronized with localStorage (e.g. from Auto-Receipts in other tabs/components)
  useEffect(() => {
    const syncReceipts = () => {
      const saved = localStorage.getItem('MF_RECEIPT_VOUCHERS');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Compare stringified versions to avoid state updates/re-renders if identical
            const curStr = JSON.stringify(receiptRegisters);
            const newStr = JSON.stringify(parsed);
            if (curStr !== newStr) {
              setReceiptRegisters(parsed);
            }
          }
        } catch (e) {
          console.error("Failed to parse MF_RECEIPT_VOUCHERS in sync:", e);
        }
      }
    };

    window.addEventListener('storage', syncReceipts);
    window.addEventListener('mf_receipt_vouchers_updated', syncReceipts);

    return () => {
      window.removeEventListener('storage', syncReceipts);
      window.removeEventListener('mf_receipt_vouchers_updated', syncReceipts);
    };
  }, [receiptRegisters]);

  useEffect(() => {
    localStorage.setItem('MF_CREDIT_NOTES', JSON.stringify(creditNotes));
  }, [creditNotes]);

  useEffect(() => {
    localStorage.setItem('MF_PURCHASE_ORDERS', JSON.stringify(purchaseRegisters));
  }, [purchaseRegisters]);

  useEffect(() => {
    localStorage.setItem('MF_SALES_INVOICES_EXCEL', JSON.stringify(salesInvoices));
  }, [salesInvoices]);

  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent && customEvent.detail) {
        triggerToast(customEvent.detail);
      }
    };
    window.addEventListener('erp-toast', handleToastEvent);
    return () => window.removeEventListener('erp-toast', handleToastEvent);
  }, []);

  // Live standards inventory lookup (same as Invoice form)
  const allInventoryProducts = useMemo(() => {
    const products: ProductRow[] = [];
    let stds = getInitialStandardsProducts();
    let fines = getInitialFineThreadUNF();

    try {
      const savedStd = localStorage.getItem('mf_std_products');
      if (savedStd) {
        stds = loadStandardsProductsWithMerge(savedStd);
      }
    } catch (e) {
      console.error("Failed to parse standards products in ERP", e);
    }

    try {
      const savedFine = localStorage.getItem('mf_fine_products');
      if (savedFine) {
        fines = loadFineThreadProductsWithMerge(savedFine);
      }
    } catch (e) {
      console.error("Failed to parse fine products in ERP", e);
    }

    const extract = (cats: Category[]) => {
      cats.forEach(c => {
        c.subcategories.forEach(s => {
          s.threadTypes.forEach(t => {
            t.grades.forEach(g => {
              g.rows.forEach(r => {
                products.push(r);
              });
            });
          });
        });
      });
    };

    extract(stds);
    extract(fines);
    return products;
  }, []);

  // --- Sub component 1: Dashboard Management Widget ---
  const DashboardComponent = () => {
    const [announcements, setAnnouncements] = useState<any[]>(() => {
      const saved = localStorage.getItem('MF_ANNOUNCEMENTS');
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
      return [
        {
          id: 'ann-1',
          category: 'SAFETY AUDIT',
          date: '2026-08-05',
          title: 'ISO 9001:2015 Annual Workshop Clearance',
          content: 'Mandatory safety gear verification for fastener sorting unit at 10:00 AM.'
        },
        {
          id: 'ann-2',
          category: 'INVENTORY',
          date: '2026-08-04',
          title: 'Warehouse Stock Re-balance Completed',
          content: 'Grade 8.8 Hex Bolts and Studs inventory updated across Sharjah & Jeddah yards.'
        },
        {
          id: 'ann-3',
          category: 'POLICY',
          date: '2026-08-01',
          title: 'New Stainless Steel 316 Pricing Tier',
          content: 'Updated discount schedule for marine grade fasteners effective immediately.'
        }
      ];
    });

    const [newAnnTitle, setNewAnnTitle] = useState('');
    const [showAnnModal, setShowAnnModal] = useState(false);

    const savedDocs = useMemo(() => {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
      return [];
    }, [activeTab]);

    // Purchase Requests
    const purchaseRequests = useMemo(() => {
      const filtered = savedDocs.filter((doc: any) => 
        doc.documentType === 'PURCHASE REQUEST' || doc.documentType === 'PURCHASE'
      );
      if (filtered.length > 0) return filtered;
      
      // Default sample records if empty
      return [
        { invoiceNo: 'PR-2026-0891', dated: '2026-08-05', workOrderNo: 'WO-9012', status: 'PENDING' },
        { invoiceNo: 'PR-2026-0888', dated: '2026-08-04', workOrderNo: 'WO-8954', status: 'APPROVED' },
        { invoiceNo: 'PR-2026-0875', dated: '2026-08-02', workOrderNo: 'WO-8820', status: 'IN REVIEW' },
        { invoiceNo: 'PR-2026-0860', dated: '2026-07-29', workOrderNo: 'WO-8711', status: 'COMPLETED' },
      ];
    }, [savedDocs]);

    // Counters for the 4 KPI Boxes
    const pendingOrdersCount = useMemo(() => {
      const count = savedDocs.filter((d: any) => 
        d.status && (d.status.toUpperCase().includes('PENDING') || d.status.toUpperCase().includes('DRAFT'))
      ).length;
      return count > 0 ? count : 12;
    }, [savedDocs]);

    const readyToDispatchCount = useMemo(() => {
      const count = savedDocs.filter((d: any) => 
        d.documentType === 'DELIVERY NOTE' || (d.status && d.status.toUpperCase().includes('READY'))
      ).length;
      return count > 0 ? count : 8;
    }, [savedDocs]);

    const deliveredCount = useMemo(() => {
      const count = savedDocs.filter((d: any) => 
        d.status && (d.status.toUpperCase().includes('DELIVERED') || d.status.toUpperCase().includes('COMPLETED'))
      ).length;
      return count > 0 ? count : 45;
    }, [savedDocs]);

    const orderOnHoldCount = useMemo(() => {
      const count = savedDocs.filter((d: any) => 
        d.status && d.status.toUpperCase().includes('HOLD')
      ).length;
      return count > 0 ? count : 3;
    }, [savedDocs]);

    // Updates List
    const updatesList = useMemo(() => {
      const docsLog = savedDocs.slice(0, 8).map((d: any) => ({
        date: d.dated || d.date || '2026-08-06',
        user: d.salesman || d.createdUser || 'SALES',
        particular: `${d.documentType || 'DOCUMENT'} #${d.invoiceNo || d.code || 'MFI-DOC'} created for ${d.customerName || d.buyerName || 'General Client'}`
      }));

      if (docsLog.length >= 4) return docsLog;

      return [
        ...docsLog,
        { date: '06/08/2026', user: 'SALES', particular: 'Quotation MFI-QTN-4029 issued to Zamil Heavy Industries' },
        { date: '06/08/2026', user: 'ADMIN', particular: 'Delivery Note MFI-DN-2018 approved for dispatch' },
        { date: '05/08/2026', user: 'STORE', particular: 'Material Receipt MR-8810 checked at Sharjah Warehouse' },
        { date: '05/08/2026', user: 'FINANCE', particular: 'Tax Invoice MFI-INV-3902 payment received AED 14,500' },
        { date: '04/08/2026', user: 'PURCHASE', particular: 'Purchase Order MFI-PO-1092 sent to Supplier Stainless Fasteners' },
        { date: '03/08/2026', user: 'DISPATCH', particular: 'Cargo Shipment MFI-PL-3001 dispatched via Transporter' }
      ];
    }, [savedDocs]);

    const handleAddAnnouncement = () => {
      if (!newAnnTitle.trim()) return;
      const newAnn = {
        id: 'ann-' + Date.now(),
        category: 'NOTICE',
        date: new Date().toISOString().substring(0, 10),
        title: newAnnTitle,
        content: 'New internal team notice posted.'
      };
      const updated = [newAnn, ...announcements];
      setAnnouncements(updated);
      localStorage.setItem('MF_ANNOUNCEMENTS', JSON.stringify(updated));
      setNewAnnTitle('');
      setShowAnnModal(false);
      triggerToast("New announcement posted!");
    };

    return (
      <div className="w-full font-sans text-slate-900 select-none">
        
        {/* Main 4-Column Wireframe Dashboard Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 1. ANNOUNCEMENT COLUMN */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-800 tracking-tight font-sans">
                Announcement
              </h2>
              <button 
                onClick={() => setShowAnnModal(!showAnnModal)}
                className="text-[10px] font-bold text-[#f37021] hover:underline cursor-pointer"
              >
                + Post
              </button>
            </div>

            <div className="bg-white border-2 border-slate-800 rounded-xl p-3.5 shadow-xs flex-1 flex flex-col justify-between min-h-[440px]">
              {showAnnModal && (
                <div className="mb-3 p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                  <input
                    type="text"
                    placeholder="Announcement Title..."
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded font-sans"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setShowAnnModal(false)} className="px-2.5 py-1 text-[10px] bg-slate-200 text-slate-700 rounded font-semibold">Cancel</button>
                    <button onClick={handleAddAnnouncement} className="px-2.5 py-1 text-[10px] bg-[#f37021] text-white rounded font-bold">Save</button>
                  </div>
                </div>
              )}

              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 custom-sidebar-scrollbar">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200 rounded-lg hover:border-slate-400 transition-all">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-orange-100 text-[#f37021] rounded uppercase">
                        {ann.category || 'NOTICE'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{ann.date}</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 leading-snug">{ann.title}</div>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. PURCHASE REQUEST COLUMN */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="mb-2 inline-block">
              <h2 className="text-base font-bold text-slate-800 tracking-tight font-sans border-b-2 border-[#f37021] pb-0.5 inline-block">
                Purchase Request
              </h2>
            </div>

            <div className="bg-white border-2 border-slate-800 rounded-xl p-3.5 shadow-xs flex-1 flex flex-col justify-between min-h-[440px]">
              <div className="overflow-x-auto overflow-y-auto max-h-[360px] custom-sidebar-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-800 text-[9.5px] font-bold text-slate-800 uppercase sticky top-0">
                      <th className="p-2.5 border-r border-slate-300">REQUISITION NO</th>
                      <th className="p-2.5 border-r border-slate-300">DATE</th>
                      <th className="p-2.5 border-r border-slate-300">WO NO</th>
                      <th className="p-2.5 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {purchaseRequests.map((pr: any, i: number) => {
                      const prNo = pr.invoiceNo || pr.code || pr.prNo || "PR-REQ-TEMP";
                      const dateVal = pr.dated || pr.issueDate || "2026-08-05";
                      const woNo = pr.workOrderNo || "MFI-WO-901";
                      return (
                        <tr key={i} className="hover:bg-slate-50 font-mono text-[10.5px]">
                          <td className="p-2.5 border-r border-slate-200 font-bold text-[#f37021]">{prNo}</td>
                          <td className="p-2.5 border-r border-slate-200 text-slate-600">{dateVal}</td>
                          <td className="p-2.5 border-r border-slate-200 text-slate-500">{woNo}</td>
                          <td className="p-2.5 text-center font-bold text-rose-600">{pr.status || "PENDING"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('purchase');
                  triggerToast("Swapped scope to purchase request draft form!");
                }}
                className="mt-3 w-full py-2.5 bg-[#f37021] hover:bg-orange-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                + Create Purchase Request
              </button>
            </div>
          </div>

          {/* 3. STATUS KPI STACK COLUMN */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-3">
            
            {/* Box 1: Pending Order */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-slate-800 text-center tracking-tight font-sans">
                Pending Order
              </span>
              <div 
                onClick={() => setActiveTab('quotations_record')}
                className="bg-white border-2 border-slate-800 rounded-xl p-3 text-center shadow-xs hover:border-[#f37021] transition-all cursor-pointer group"
              >
                <span className="text-2xl font-black text-amber-600 font-mono block group-hover:scale-105 transition-transform">{pendingOrdersCount}</span>
              </div>
            </div>

            {/* Box 2: Ready to dispatch */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-slate-800 text-center tracking-tight font-sans">
                Ready to dispatch
              </span>
              <div 
                onClick={() => setActiveTab('quotations_record')}
                className="bg-white border-2 border-slate-800 rounded-xl p-3 text-center shadow-xs hover:border-[#f37021] transition-all cursor-pointer group"
              >
                <span className="text-2xl font-black text-blue-600 font-mono block group-hover:scale-105 transition-transform">{readyToDispatchCount}</span>
              </div>
            </div>

            {/* Box 3: Delivered */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-slate-800 text-center tracking-tight font-sans">
                Delivered
              </span>
              <div 
                onClick={() => setActiveTab('quotations_record')}
                className="bg-white border-2 border-slate-800 rounded-xl p-3 text-center shadow-xs hover:border-[#f37021] transition-all cursor-pointer group"
              >
                <span className="text-2xl font-black text-emerald-600 font-mono block group-hover:scale-105 transition-transform">{deliveredCount}</span>
              </div>
            </div>

            {/* Box 4: Order On Hold */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold text-slate-800 text-center tracking-tight font-sans">
                Order On Hold
              </span>
              <div 
                onClick={() => setActiveTab('quotations_record')}
                className="bg-white border-2 border-slate-800 rounded-xl p-3 text-center shadow-xs hover:border-[#f37021] transition-all cursor-pointer group"
              >
                <span className="text-2xl font-black text-rose-600 font-mono block group-hover:scale-105 transition-transform">{orderOnHoldCount}</span>
              </div>
            </div>

          </div>

          {/* 4. UPDATES COLUMN */}
          <div className="lg:col-span-3 flex flex-col">
            <h2 className="text-base font-bold text-slate-800 tracking-tight font-sans mb-2">
              Updates
            </h2>

            <div className="bg-white border-2 border-slate-800 rounded-xl shadow-xs overflow-hidden flex-1 min-h-[440px] flex flex-col justify-between">
              <div className="overflow-x-auto overflow-y-auto max-h-[430px] custom-sidebar-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-800 text-[10px] font-bold text-slate-800 uppercase sticky top-0 bg-slate-100">
                      <th className="p-2.5 border-r-2 border-slate-800 w-[70px]">Date</th>
                      <th className="p-2.5 border-r-2 border-slate-800 w-[60px]">User</th>
                      <th className="p-2.5">Particular</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {updatesList.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 text-[10px]">
                        <td className="p-2.5 font-mono text-slate-500 border-r-2 border-slate-200">{log.date}</td>
                        <td className="p-2.5 font-bold text-slate-800 border-r-2 border-slate-200 uppercase">{log.user}</td>
                        <td className="p-2.5 text-slate-700 leading-snug">{log.particular}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  };

  // --- Sub component 2: PACKING LIST CREATOR ---
  const PackingListComponent = () => null;
  const OldPackingListComponent = () => {
    const [selectedList, setSelectedList] = useState<PackingList>(packingRegisters[0] || {
      id: 'pack-new',
      packingNo: 'PL' + Math.floor(Math.random() * 900000 + 100000),
      invoiceNo: 'MF' + Math.floor(Math.random() * 900000 + 100000),
      dated: new Date().toISOString().substring(0, 10),
      buyerName: 'ZAMIL HEAVY INDUSTRIES LTD',
      buyerAddress: '7547 PRINCE SULTAN ROAD, SAUDI ARABIA',
      totalCartons: 10,
      totalGrossWeight: 200,
      totalNetWeight: 190,
      dimensionCbm: 1.2,
      items: []
    });

    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemQty, setNewItemQty] = useState(100);
    const [newItemUnit, setNewItemUnit] = useState('Pcs.');
    const [newItemCarton, setNewItemCarton] = useState('Box 1');
    const [newItemNetWeight, setNewItemNetWeight] = useState(15);
    const [newItemGrossWeight, setNewItemGrossWeight] = useState(16);

    const handleSavePackingList = () => {
      const isAlreadyInRegisters = packingRegisters?.findIndex(item => item.id === selectedList.id);
      
      let updated: PackingList[] = [];
      if (isAlreadyInRegisters >= 0) {
        updated = [...packingRegisters];
        updated[isAlreadyInRegisters] = selectedList;
      } else {
        updated = [selectedList, ...packingRegisters];
      }
      
      setPackingRegisters(updated);
      triggerToast(`Packing List ${selectedList.packingNo} saved successfully!`);
    };

    const handleAddNewLineItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemDesc.trim()) {
        alert("Please enter a component description first!");
        return;
      }

      const freshLine = {
        sn: selectedList.items.length + 1,
        description: newItemDesc.toUpperCase(),
        qty: newItemQty,
        unit: newItemUnit,
        cartonNo: newItemCarton.toUpperCase(),
        netWeight: newItemNetWeight,
        grossWeight: newItemGrossWeight
      };

      const updatedList = {
        ...selectedList,
        items: [...selectedList.items, freshLine],
        totalCartons: selectedList.totalCartons + 1,
        totalNetWeight: selectedList.totalNetWeight + newItemNetWeight,
        totalGrossWeight: selectedList.totalGrossWeight + newItemGrossWeight
      };

      setSelectedList(updatedList);
      setNewItemDesc('');
      triggerToast("Line item dispatched to packing manifest!");
    };

    const deleteLineItem = (sn: number) => {
      const filtered = selectedList.items.filter(it => it.sn !== sn).map((it, idx) => ({
        ...it,
        sn: idx + 1
      }));
      
      const newGross = filtered.reduce((sum, it) => sum + it.grossWeight, 0);
      const newNet = filtered.reduce((sum, it) => sum + it.netWeight, 0);

      setSelectedList(prev => ({
        ...prev,
        items: filtered,
        totalGrossWeight: newGross,
        totalNetWeight: newNet
      }));
      triggerToast("Removed packing record line.");
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
        {/* Left Side: Creation Controls */}
        <div className="xl:col-span-5 space-y-6 no-print font-mono text-[10.5px]">
          
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block">Select or Clear Manifest</span>
            <div className="flex gap-2">
              <select 
                className="flex-1 p-2 border font-mono text-xs focus:ring-[#f37021] focus:border-[#f37021]"
                value={selectedList.id}
                onChange={(e) => {
                  const found = packingRegisters.find(p => p.id === e.target.value);
                  if (found) {
                    setSelectedList(found);
                  } else {
                    setSelectedList({
                      id: 'pack-' + Date.now(),
                      packingNo: 'PL' + Math.floor(Math.random() * 900000 + 100000),
                      invoiceNo: 'MF' + Math.floor(Math.random() * 900000 + 100000),
                      dated: new Date().toISOString().substring(0, 10),
                      buyerName: 'AL FANAR STEEL WORKS CO.',
                      buyerAddress: 'NEW INDUSTRIAL DIST. RIYADH, KSA',
                      totalCartons: 1,
                      totalGrossWeight: 20,
                      totalNetWeight: 18,
                      dimensionCbm: 0.25,
                      items: []
                    });
                  }
                }}
              >
                <option value="new">+ Start Brand New Document</option>
                {packingRegisters.map(p => (
                  <option key={p.id} value={p.id}>{p.packingNo} — {p.buyerName}</option>
                ))}
              </select>
              <button 
                onClick={handleSavePackingList}
                className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save List
              </button>
            </div>
          </div>

          {/* Form parameters */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3 font-sans text-xs">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block font-mono">1. Document Details</span>
            
            <div className="grid grid-cols-2 gap-2 font-mono text-[10.5px]">
              <div>
                <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide block">Packing List No</label>
                <input 
                  type="text" 
                  value={selectedList.packingNo} 
                  onChange={(e) => setSelectedList({...selectedList, packingNo: e.target.value})}
                  className="w-full p-1.5 border font-mono text-xs uppercase"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide block">Associated Invoice</label>
                <input 
                  type="text" 
                  value={selectedList.invoiceNo} 
                  onChange={(e) => setSelectedList({...selectedList, invoiceNo: e.target.value})}
                  className="w-full p-1.5 border font-mono text-xs uppercase"
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide block">Dated</label>
                <input 
                  type="date" 
                  value={selectedList.dated} 
                  onChange={(e) => setSelectedList({...selectedList, dated: e.target.value})}
                  className="w-full p-1.5 border font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide block">Client / Buyer Name</label>
                <select
                  value={selectedList.buyerName}
                  onChange={(e) => setSelectedList({...selectedList, buyerName: e.target.value})}
                  className="w-full p-1.5 border font-mono text-[11px]"
                >
                  {clientDatabase.map(cl => (
                    <option key={cl} value={cl}>{cl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide block font-mono">Client Full Address</label>
              <textarea 
                rows={2}
                value={selectedList.buyerAddress} 
                onChange={(e) => setSelectedList({...selectedList, buyerAddress: e.target.value.toUpperCase()})}
                className="w-full p-1.5 border font-mono text-xs leading-tight uppercase"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Carton Volume</label>
                <input 
                  type="number" 
                  value={selectedList.totalCartons} 
                  onChange={(e) => setSelectedList({...selectedList, totalCartons: parseInt(e.target.value) || 0})}
                  className="w-full p-1 border font-mono text-xs text-right"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Gross Weight (KG)</label>
                <input 
                  type="number" 
                  value={selectedList.totalGrossWeight} 
                  onChange={(e) => setSelectedList({...selectedList, totalGrossWeight: parseFloat(e.target.value) || 0})}
                  className="w-full p-1 border font-mono text-xs text-right font-bold text-slate-905"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Dimensions (CBM)</label>
                <input 
                  type="number" 
                  step="0.05"
                  value={selectedList.dimensionCbm} 
                  onChange={(e) => setSelectedList({...selectedList, dimensionCbm: parseFloat(e.target.value) || 0})}
                  className="w-full p-1 border font-mono text-xs text-right animate-none"
                />
              </div>
            </div>
          </div>

          {/* Form Inline add component */}
          <div className="bg-[#fcfdfd] border border-slate-205 rounded-lg p-4 shadow-2xs space-y-3 font-sans text-xs">
            <span className="text-[10px] text-[#f37021] font-semibold uppercase tracking-widest block font-mono">2. Append Material Line item</span>
            
            <form onSubmit={handleAddNewLineItem} className="space-y-2.5">
              <div className="relative">
                <label className="text-[9px] text-slate-405 font-bold uppercase block font-mono">Component / Grade Description</label>
                <input 
                  type="text" 
                  placeholder="CERM FLR ASTM F436 WASHER M20..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full p-1.5 border font-mono text-xs uppercase"
                  list="stdProductsDatalist"
                />
                <datalist id="stdProductsDatalist">
                  {allInventoryProducts.map(p => (
                    <option key={p.id} value={p.description} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-slate-405 font-bold uppercase block font-mono">QTY</label>
                  <input 
                    type="number" 
                    value={newItemQty} 
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    className="w-full p-1 border font-mono text-xs text-right"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-405 font-bold uppercase block font-mono">Carton / box No</label>
                  <input 
                    type="text" 
                    value={newItemCarton} 
                    onChange={(e) => setNewItemCarton(e.target.value)}
                    className="w-full p-1 border font-mono text-xs uppercase text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-405 font-bold uppercase block font-mono">Unit Type</label>
                  <input 
                    type="text" 
                    value={newItemUnit} 
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full p-1 border font-mono text-xs uppercase text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-405 font-bold uppercase block font-mono font-bold text-slate-700">Net Weight (KG)</label>
                  <input 
                    type="number" 
                    value={newItemNetWeight} 
                    onChange={(e) => setNewItemNetWeight(parseFloat(e.target.value) || 0)}
                    className="w-full p-1.5 border font-mono text-xs text-right"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-405 font-bold uppercase block font-mono font-bold text-[#f37021]">Gross Weight (KG)</label>
                  <input 
                    type="number" 
                    value={newItemGrossWeight} 
                    onChange={(e) => setNewItemGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full p-1.5 border font-mono text-xs text-right"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-1.5 bg-slate-900 text-white font-mono uppercase font-bold tracking-wide text-xs transition-colors hover:bg-slate-800 cursor-pointer"
              >
                + Push Line item
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: High-Fidelity Official Document preview */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white border-2 border-[#1e3a8a] p-6 md:p-8 text-slate-950 shadow-md max-w-[720px] mx-auto print:border-none print:shadow-none print:p-0 flex flex-col space-y-4">
            
            {/* Double Border header frame replica */}
            <div className="border-[#1e3a8a] pb-1 tracking-widest bg-slate-50 py-1 text-center font-bold text-[#1e3a8a] text-md uppercase border-b-2 leading-tight flex justify-between items-start px-2">
              <div className="text-left font-mono">
                <span className="text-[10px] text-rose-600 font-semibold block uppercase tracking-wide">Official Logistics Manifest</span>
                <h2 className="text-xs font-bold text-[#1e3a8a] uppercase leading-snug">{activeCompany.name}</h2>
                <p className="text-[9px] text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                  {activeCompany.address}<br/>
                  Telephone: {activeCompany.phone || '—'}
                </p>
                <p className="text-[9px] font-bold text-slate-700">TRN NO: {activeCompany.trn || '—'}</p>
              </div>

              <div className="text-right font-sans min-w-[160px] flex flex-col items-end">
                <h3 className="text-sm font-bold text-rose-700 tracking-wider uppercase">PACKING LIST</h3>
                <p className="text-[10px] font-mono leading-tight uppercase font-semibold text-[#1e3a8a]">Doc No: {selectedList.packingNo}</p>
                <p className="text-[9.5px] font-mono mt-0.5 font-bold">Date: {selectedList.dated}</p>
              </div>
            </div>

            {/* Buyer Block - Styled exactly like the Supplier & Buyer boxes of Credit Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Consignee Box */}
              <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50 text-xs">
                <span className="text-[9.5px] font-bold uppercase text-[#1e3a8a] block">Client / Consignee</span>
                <h4 className="font-semibold text-[#1e3a8a] uppercase text-xs">{selectedList.buyerName}</h4>
                <p className="text-slate-700 text-[10px] font-semibold leading-relaxed uppercase whitespace-pre-line">{selectedList.buyerAddress}</p>
              </div>

              {/* Logistics Box */}
              <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50 text-xs font-mono">
                <span className="text-[9.5px] font-bold uppercase text-rose-600 block">Logistics Parameters</span>
                <div className="space-y-1 text-[10px] font-semibold text-slate-800">
                  <p>Invoiced No: <span className="text-[#1e3a8a] font-bold uppercase">{selectedList.invoiceNo}</span></p>
                  <p>Cartons: <span className="text-pink-700 font-bold">{selectedList.totalCartons} Box/Crate</span></p>
                  <p>Gross WT: <span className="text-[#1e3a8a] font-bold">{selectedList.totalGrossWeight} KG</span></p>
                  <p>CBM Estimate: <span className="text-emerald-700 font-bold">{selectedList.dimensionCbm} M³</span></p>
                </div>
              </div>
            </div>

            {/* Items Grid with deep blue credit note styling */}
            <div className="w-full overflow-x-auto border border-[#1e3a8a] rounded bg-white text-xs">
              <table className="w-full text-left border-collapse min-w-[600px] uppercase font-sans">
                <thead>
                  <tr className="bg-slate-100 uppercase font-bold text-[#1e3a8a] border-b border-[#1e3a8a] text-[10px]">
                    <th className="border-r border-[#1e3a8a] p-1.5 text-center w-10">S.N</th>
                    <th className="border-r border-[#1e3a8a] p-1.5 text-left">ITEM Description / Size Specifications</th>
                    <th className="border-r border-[#1e3a8a] p-1.5 text-center w-16">Unit</th>
                    <th className="border-r border-[#1e3a8a] p-1.5 text-center w-20">QTY</th>
                    <th className="border-r border-[#1e3a8a] p-1.5 text-center w-20">Package No</th>
                    <th className="border-r border-[#1e3a8a] p-1.5 text-right w-20">Net WT</th>
                    <th className="p-1.5 text-right w-20">Gross WT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3a8a]/20 text-[10.5px]">
                  {selectedList.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-6 italic text-slate-400 bg-slate-50 font-bold">No packing materials loaded. Use form on left to populate.</td>
                    </tr>
                  ) : (
                    selectedList.items.map(it => (
                      <tr key={it.sn} className="hover:bg-slate-50/50">
                        <td className="border-r border-[#1e3a8a]/30 p-1.5 text-center font-mono font-bold text-slate-700">{it.sn}</td>
                        <td className="border-r border-[#1e3a8a]/30 p-1.5 font-bold font-sans text-slate-900">{it.description}</td>
                        <td className="border-r border-[#1e3a8a]/30 p-1.5 text-center font-medium font-mono text-slate-600">{it.unit}</td>
                        <td className="border-r border-[#1e3a8a]/30 p-1.5 text-center font-bold font-mono text-[#1e3a8a]">{it.qty}</td>
                        <td className="border-r border-[#1e3a8a]/30 p-1.5 text-center font-bold font-mono text-rose-700">{it.cartonNo}</td>
                        <td className="border-r border-[#1e3a8a]/30 p-1.5 text-right font-mono text-slate-700">{it.netWeight} KG</td>
                        <td className="p-1.5 text-right font-mono font-bold text-emerald-800">{it.grossWeight} KG</td>
                      </tr>
                    ))
                  )}
                  
                  {/* Total Row */}
                  {selectedList.items.length > 0 && (
                    <tr className="bg-slate-50 border-t border-[#1e3a8a] font-bold text-[10px]">
                      <td colSpan={3} className="p-2 text-right uppercase border-r border-[#1e3a8a] text-[#1e3a8a] font-bold">Consolidated Cargo Summary</td>
                      <td className="p-2 text-center border-r border-[#1e3a8a] font-mono font-semibold text-rose-700">
                        {selectedList.items.reduce((sum, current) => sum + current.qty, 0)}
                      </td>
                      <td className="p-2 text-center border-r border-[#1e3a8a] font-mono text-pink-700 font-bold">
                        {selectedList.totalCartons} Box
                      </td>
                      <td className="p-2 text-right border-r border-[#1e3a8a] font-mono text-slate-700">
                        {selectedList.totalNetWeight} KG
                      </td>
                      <td className="p-2 text-right font-mono text-emerald-800">
                        {selectedList.totalGrossWeight} KG
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Signatures Section styled precisely like Credit Note */}
            <div className="flex justify-between items-end pt-8 font-semibold text-xs leading-none">
              <div className="border-t border-dashed border-[#1e3a8a] pt-1.5 w-44 text-center uppercase tracking-tight text-[9px] text-slate-500 font-mono">
                Consignee / Driver Signature
              </div>
              <div className="text-right w-56 space-y-5 font-mono">
                <div className="text-[8.5px] font-bold text-[#1e3a8a] uppercase tracking-wider text-center block">
                  For: MARINE FASTENERS INDUSTRIES L.L.C.
                </div>
                <div className="border-t border-[#1e3a8a] pt-1.5 uppercase font-[#1e3a8a] font-bold text-[8px] tracking-tight text-center text-slate-800">
                  Logistics Officer Stamp
                </div>
              </div>
            </div>

            {/* Quick local prints */}
            <div className="mt-4 flex justify-end gap-2 pr-0 no-print">
              <button 
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#1e3a8a] hover:opacity-90 text-white font-mono font-bold text-[10px] uppercase flex items-center gap-2 cursor-pointer shadow-sm rounded border border-[#1e3a8a]/20"
              >
                <Printer className="w-3.5 h-3.5" /> Export Logistics Slip
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Sub component 3: STATEMENT OF ACCOUNTS (SOA) ---
  const StatementComponent = () => {
    // Collect all loaded transactions dynamically
    const salesInvoices = useMemo(() => {
      const savedInvoices = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (savedInvoices) {
        try { return JSON.parse(savedInvoices); } catch(e) {}
      }
      return [];
    }, []);

    const [startDate, setStartDate] = useState('2026-05-01');
    const [endDate, setEndDate] = useState('2026-06-30');

    // Build unique union of all clients and suppliers dynamically so user can view statements for any entity
    const allParties = useMemo(() => {
      const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
      const manual = savedPay ? JSON.parse(savedPay) : [];
      const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      const dos = savedDOs ? JSON.parse(savedDOs) : [];
      
      const supplierNames: string[] = [];
      manual.forEach((p: any) => { if (p.supplierName) supplierNames.push(p.supplierName.toUpperCase()); });
      dos.forEach((d: any) => { if (d.supplierName) supplierNames.push(d.supplierName.toUpperCase()); });
      
      const unionSet = new Set<string>();
      clientDatabase.forEach(c => unionSet.add(c.toUpperCase()));
      supplierNames.forEach(s => unionSet.add(s));
      
      return Array.from(unionSet).sort();
    }, [clientDatabase]);

    // Check if current activeClient is a Supplier (Accounts Payable)
    const isSupplier = useMemo(() => {
      const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
      const manual = savedPay ? JSON.parse(savedPay) : [];
      const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      const dos = savedDOs ? JSON.parse(savedDOs) : [];
      
      const upClient = activeClient.trim().toUpperCase();
      const inManual = manual.some((p: any) => p.supplierName && p.supplierName.toUpperCase() === upClient);
      const inDos = dos.some((d: any) => d.supplierName && d.supplierName.toUpperCase() === upClient);
      
      return inManual || inDos;
    }, [activeClient]);

    // Aggregate matching debits and credits
    const ledgerLines = useMemo(() => {
      const lines: Array<{
        date: string;
        ref: string;
        particulars: string;
        debit: number; 
        credit: number; 
      }> = [];

      const upClient = activeClient.trim().toUpperCase();

      if (!isSupplier) {
        // --- CUSTOMER RECEIVABLES LEDGER ---
        // Check sales invoice ledger entries
        salesInvoices.forEach((inv: any) => {
          if (inv.buyerName && inv.buyerName.toUpperCase() === upClient) {
            let itemSum = 0;
            if (inv.items && Array.isArray(inv.items)) {
              inv.items.forEach((it: any) => {
                itemSum += (it.qty * (it.unitPriceWOVAT || 0));
              });
            }
            const totalInvVal = itemSum - (inv.discountAmt || 0) + (inv.freightAmt || 0);

            lines.push({
              date: inv.dated || '2026-05-15',
              ref: inv.invoiceNo || 'INV-DRAFT',
              particulars: `${inv.documentType || 'TAX INVOICE'} DISPATCH OUTFLOW`,
              debit: totalInvVal,
              credit: 0
            });
          }
        });

        // Check receipt vouchers ledger entries
        receiptRegisters.forEach((rc: ReceiptVoucher) => {
          if (rc.clientName && rc.clientName.toUpperCase() === upClient) {
            lines.push({
              date: rc.dated,
              ref: rc.voucherNo,
              particulars: `RECEIPT RECORD: ${rc.paymentMode} (${rc.chequeNoDetails || 'TRANS_ID'})`,
              debit: 0,
              credit: rc.amountReceived
            });
          }
        });

        // Add customer baseline opening placeholder if no records to make sure ledger doesn't look barren
        if (lines.length === 0) {
          lines.push({
            date: '2026-05-01',
            ref: 'OB-2026',
            particulars: 'ACCUMULATED BALANCE BOUGHT FORWARD',
            debit: 6500.00,
            credit: 0
          });
          lines.push({
            date: '2026-05-10',
            ref: 'RV-OB33',
            particulars: 'RAK BANK TELEX DEPOSIT TRANS #90123',
            debit: 0,
            credit: 5000.00
          });
        }
      } else {
        // --- SUPPLIER PAYABLES LEDGER ---
        const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
        const manual = savedPay ? JSON.parse(savedPay) : [];
        const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        const dos = savedDOs ? JSON.parse(savedDOs) : [];

        // Add manual supplier bills
        manual.forEach((p: any) => {
          if (p.supplierName && p.supplierName.toUpperCase() === upClient) {
            lines.push({
              date: p.invoiceDate || p.date || '2026-05-15',
              ref: p.invoiceNo || p.id,
              particulars: `SUPPLIER INVOICE BILL: ${p.materialsDetails || 'Raw Materials Cargo'}`,
              debit: 0,
              credit: Number(p.totalContractValue) || 0
            });

            if (p.amountPaid > 0) {
              lines.push({
                date: p.date || '2026-05-15',
                ref: `PAY-${p.invoiceNo || p.id}`,
                particulars: `SETTLEMENT VOUCHER RELEASED VIA ${p.invoicePaidBy || 'BANK'}`,
                debit: Number(p.amountPaid) || 0,
                credit: 0
              });
            }
          }
        });

        // Add inbound material receipts DOs
        dos.forEach((d: any) => {
          if (d.supplierName && d.supplierName.toUpperCase() === upClient) {
            const tc = parseFloat(d.invoiceAmounts) || 0;
            const ap = parseFloat(d.invoicePaid) || 0;

            lines.push({
              date: d.invoiceDate || d.date || '2026-05-15',
              ref: d.invoiceNo || `GRN-${d.doNo || d.id}`,
              particulars: `INCOMING GRN MATERIALS RECEIPT (Ref: DO-${d.doNo || d.id})`,
              debit: 0,
              credit: tc
            });

            if (ap > 0) {
              lines.push({
                date: d.date || '2026-05-15',
                ref: `PAY-${d.invoiceNo || d.id}`,
                particulars: `BANK PAYOUT SETTLEMENT RELEASED`,
                debit: ap,
                credit: 0
              });
            }
          }
        });

        // Add supplier baseline opening placeholder if no records to make sure ledger doesn't look barren
        if (lines.length === 0) {
          lines.push({
            date: '2026-05-01',
            ref: 'OB-SUP-2026',
            particulars: 'SUPPLIER LEDGER OPENING DEFICIT BOUGHT FORWARD',
            debit: 0,
            credit: 12000.00
          });
          lines.push({
            date: '2026-05-12',
            ref: 'PAY-OB-SUP',
            particulars: 'POSTED PDC LIQUIDATION OUTFLOW',
            debit: 10000.00,
            credit: 0
          });
        }
      }

      // Sort chronological by date
      const sorted = lines.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Compute sequential balance
      let currentBal = 0;
      return sorted.map(line => {
        if (isSupplier) {
          // Supplier ledger outstanding = Credit (bills owed) - Debit (payments made)
          currentBal += (line.credit - line.debit);
        } else {
          // Customer ledger outstanding = Debit (invoices shipped) - Credit (payments received)
          currentBal += (line.debit - line.credit);
        }
        return {
          ...line,
          runningBalance: currentBal
        };
      });

    }, [salesInvoices, receiptRegisters, activeClient, isSupplier]);

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 select-none font-mono">
        {/* Left Side Filter bar */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4 no-print text-[10.5px]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block border-b pb-2">Unified Ledger Filter</span>
          
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-semibold uppercase block">1. Select Account (Customer / Supplier)</label>
            <select 
              value={activeClient}
              onChange={(e) => setActiveClient(e.target.value)}
              className="w-full p-2 border font-mono text-xs uppercase cursor-pointer bg-amber-50/50 hover:bg-amber-50 focus:outline-none focus:ring-1 focus:ring-[#f37021] font-bold"
            >
              {allParties.map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-405 font-bold uppercase block">Start range Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-1.5 border font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-405 font-bold uppercase block">End range Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-1.5 border font-mono text-xs"
              />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-950 p-3 rounded leading-relaxed text-[10px] space-y-1">
            <span className="font-semibold block">Reconciliation Instructions:</span>
            {isSupplier ? (
              <p className="font-sans">Credits represent supplier bills received which enhance payable liability. Debits represent payment releases which minimize outstanding obligations to suppliers.</p>
            ) : (
              <p className="font-sans">Debits represent shipped Tax Invoices which enhance client liability. Credits represent payment receipts which minimize receivables outstanding from customers.</p>
            )}
          </div>
          
          <button 
            type="button"
            onClick={() => window.print()}
            className="w-full py-2 bg-slate-900 text-white font-mono uppercase text-xs font-bold shadow transition-all hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print SOA Ledger Report
          </button>
        </div>

        {/* Statement Render area */}
        <div className="xl:col-span-8">
          <div className="bg-white border border-slate-350 p-6 md:p-8 text-black min-h-[500px] shadow-sm relative overflow-x-auto min-w-[620px] print:border-none print:shadow-none print:p-0">
            
            {/* Stamp Overlay */}
            <div className="absolute right-12 top-24 opacity-60 pointer-events-none select-none rotate-12 bg-white/80 p-2 border-2 border-double border-red-500 rounded text-red-500 font-mono text-[9px] font-semibold max-w-[130px] text-center leading-tight uppercase">
              RECONCILED LOCK<br />AJMAN ACCOUNTS OFFICE
            </div>

            <div className="border-t-4 border-[#f37021] pt-3 text-xs flex justify-between items-start font-mono uppercase">
              <div>
                <span className="text-[9px] text-[#f37021] font-bold">Official ledger statement</span>
                <h2 className="text-sm font-bold text-slate-950 leading-tight">{activeCompany.name}</h2>
                <p className="text-[9.5px] text-slate-500 font-medium">DUAL AUDITED STATEMENT OF ACCOUNTS</p>
                <p className="text-[9px] mt-0.5">TRN: {activeCompany.trn || '—'}</p>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-slate-900 border-b pb-0.5 block tracking-wider">STATEMENT OF ACCOUNT (SOA LEDGER)</span>
                <p className="text-[10px] text-slate-550 mt-1 font-bold">{isSupplier ? 'SUPPLIER' : 'CLIENT'}: {activeClient}</p>
                <p className="text-[9.5px]">Period: {startDate} to {endDate}</p>
              </div>
            </div>

            {/* Account calculations */}
            <div className="mt-5 border border-slate-400 p-3 bg-slate-50 font-mono text-xs grid grid-cols-3 gap-4 uppercase font-bold select-none">
              <div>
                <span className="text-[8.5px] text-slate-400 block font-normal">Opening Account Balance:</span>
                <span className="text-[13px] text-slate-900">AED {isSupplier ? '0.00' : '6,500.00'}</span>
              </div>
              <div className="border-l border-slate-300 pl-4">
                <span className="text-[8.5px] text-slate-400 block font-normal text-slate-500">
                  {isSupplier ? 'Total Debits (Payments):' : 'Total Credits (Receipts):'}
                </span>
                <span className="text-[13px] text-emerald-600">
                  AED {ledgerLines.reduce((acc, curr) => acc + (isSupplier ? curr.debit : curr.credit), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-l border-slate-400 pl-4">
                <span className="text-[8.5px] text-[#f37021] block font-semibold">Final Balance Outstanding:</span>
                <span className="text-sm font-bold text-[#f37021]">
                  AED {(() => {
                    const lines = ledgerLines;
                    const last = lines[lines.length - 1];
                    return (last ? last.runningBalance : 0.00).toLocaleString('en-US', { minimumFractionDigits: 2 });
                  })()}
                </span>
              </div>
            </div>

            {/* Table */}
            <table className="w-full mt-5 border border-slate-400 border-collapse font-sans text-[11px] uppercase">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-bold text-left text-[10px] tracking-wide font-mono">
                  <th className="border-r border-slate-400 p-2 text-center w-24">DATE</th>
                  <th className="border-r border-slate-400 p-2">TRANSACTION Reference / Particulars</th>
                  <th className="border-r border-slate-400 p-2 text-right w-24">DEBIT (Dr)</th>
                  <th className="border-r border-slate-400 p-2 text-right w-24">CREDIT (Cr)</th>
                  <th className="p-2 text-right w-28 font-semibold">BALANCE (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-sans">
                {ledgerLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 text-[11px]">
                    <td className="border-r border-slate-400 p-2 text-center font-mono font-medium text-slate-600">{line.date}</td>
                    <td className="border-r border-slate-400 p-2 font-mono">
                      <span className="font-semibold text-slate-800">{line.ref}</span>
                      <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">{line.particulars}</span>
                    </td>
                    <td className="border-r border-slate-400 p-2 text-right font-mono text-slate-900 font-medium">
                      {line.debit > 0 ? `AED ${line.debit.toFixed(2)}` : '—'}
                    </td>
                    <td className="border-r border-slate-400 p-2 text-right font-mono text-emerald-600 font-semibold">
                      {line.credit > 0 ? `AED ${line.credit.toFixed(2)}` : '—'}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-[#f37021] bg-slate-50/40">
                      AED {line.runningBalance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Dual borders for double accounting signature desk */}
            <div className="grid grid-cols-2 mt-8 gap-6 border-t border-dashed border-slate-400 pt-6 text-center text-xs font-mono">
              <div>
                <p className="text-slate-450 uppercase text-[9px] mb-10">Prepared by Accounts Associate</p>
                <div className="border-t border-slate-400 inline-block px-12 pt-1 uppercase text-[#f37021] font-semibold text-[9.5px]">Authorized Entry Desk</div>
              </div>
              <div>
                <p className="text-slate-450 uppercase text-[9px] mb-10">Client Account Audit Acceptance</p>
                <div className="border-t border-slate-400 inline-block px-12 pt-1 uppercase text-slate-900 font-bold text-[9.5px] font-mono">Customer Sign &amp; Stamp</div>
              </div>
            </div>

            <div className="mt-8 text-[9.5px] font-mono text-slate-450 text-center uppercase tracking-wide leading-none border-t border-slate-100 pt-3 flex items-center justify-between">
              <span>Marine Fasteners ERP Ledger Pipeline</span>
              <span>System Verified 2026</span>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // --- Sub component 4: PAYMENTS / CASH VOUCHERS RECEIPT ---
  // ModernReceiptComponent is rendered directly in tab view to preserve component state and avoid remounts

  // --- Sub component 4.5: TAX CREDIT NOTE COMPONENT ---
  const NestedCreditNoteComponentDeprecatedDoNotUse = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Dynamic find
    const activeCreditNote = useMemo(() => {
      const found = creditNotes.find(item => item.id === activeCnId);
      return found || null;
    }, [creditNotes, activeCnId]);

    // Helper to get the next non-colliding sequential Credit Note No
    const getNextCreditNoteNo = (list: CreditNote[]) => {
      let maxNum = 100;
      list.forEach(n => {
        const match = n.creditNoteNo.match(/CN-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      });
      return `CN-${maxNum + 1}`;
    };

    // Active working state
    const [cnState, setCnState] = useState<CreditNote>(() => {
      if (activeCreditNote) return { ...activeCreditNote };
      const nextNo = getNextCreditNoteNo(creditNotes);
      return {
        id: 'cn-' + Date.now(),
        creditNoteNo: nextNo,
        dated: new Date().toISOString().substring(0, 10),
        reasonForIssue: 'Goods Sold Returned',
        buyersRef: '2 dt. 2-Feb-2018',
        otherRef: 'SO-' + Math.floor(1000+Math.random()*9000),
        issuerName: 'JEHAN & CO.',
        issuerAddress: 'AL BATEEN STREET, ABU DHABI - U.A.E.',
        issuerTRN: '123000000000000',
        issuerEmirate: 'Abu Dhabi',
        partyName: 'NOOR ELECTRONICS',
        partyAddress: 'KHALIFA STREET, ABU DHABI - U.A.E.',
        partyEmirate: 'Abu Dhabi',
        partyCountry: 'UAE',
        partyTRN: '123456700000000',
        placeOfSupply: 'UAE, Abu Dhabi',
        items: []
      };
    });

    // Mirror on change of selected record
    useEffect(() => {
      if (activeCreditNote) {
        setCnState({ ...activeCreditNote });
        setIsEditing(false);
      }
    }, [activeCreditNote]);

    const handleInitNewCn = () => {
      const nextNo = getNextCreditNoteNo(creditNotes);
      const newCn: CreditNote = {
        id: 'cn-' + Date.now(),
        creditNoteNo: nextNo,
        dated: new Date().toISOString().substring(0, 10),
        reasonForIssue: 'Goods Sold Returned',
        buyersRef: '',
        otherRef: '',
        issuerName: 'JEHAN & CO.',
        issuerAddress: 'AL BATEEN STREET, ABU DHABI - U.A.E.',
        issuerTRN: '123000000000000',
        issuerEmirate: 'Abu Dhabi',
        partyName: '',
        partyAddress: '',
        partyEmirate: 'Abu Dhabi',
        partyCountry: 'UAE',
        partyTRN: '',
        placeOfSupply: 'UAE, Abu Dhabi',
        items: [
          {
            sn: 1,
            description: 'NEW FASTENER PRODUCT RETURN',
            qty: 1,
            unit: 'nos',
            rate: 100.00,
            per: 'nos',
            amount: 100.00,
            vatRate: 5,
            taxableValue: 100.00,
            taxAmount: 5.00
          }
        ]
      };
      setCnState(newCn);
      setActiveCnId(newCn.id);
      setIsEditing(true);
      triggerToast('Initialized empty Credit Note. Use Editor to finalize.');
    };

    const handleSaveCn = () => {
      if (!cnState.creditNoteNo.trim()) {
        triggerToast('Error: Credit Note No. is required.');
        return;
      }
      const existingIdx = creditNotes.findIndex(c => c.id === cnState.id);
      let updated: CreditNote[];
      if (existingIdx > -1) {
        updated = [...creditNotes];
        updated[existingIdx] = { ...cnState };
      } else {
        updated = [...creditNotes, { ...cnState }];
      }
      setCreditNotes(updated);
      setIsEditing(false);
      triggerToast(`Saved Tax Credit Note ${cnState.creditNoteNo} to system database!`);
    };

    const handleDeleteCn = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const filtered = creditNotes.filter(p => p.id !== id);
      setCreditNotes(filtered);
      if (activeCnId === id) {
        if (filtered.length > 0) {
          setActiveCnId(filtered[0].id);
        } else {
          setActiveCnId('');
        }
      }
      triggerToast('Credit Note record discarded.');
    };

    // Row helpers
    const handleAddRow = () => {
      const nextSn = cnState.items.length + 1;
      const newItem: CreditNoteItem = {
        sn: nextSn,
        description: '',
        qty: 1,
        unit: 'nos',
        rate: 0,
        per: 'nos',
        amount: 0,
        vatRate: 5,
        taxableValue: 0,
        taxAmount: 0
      };
      setCnState({
        ...cnState,
        items: [...cnState.items, newItem]
      });
      setIsEditing(true);
    };

    const handleRemoveRow = (sn: number) => {
      const filtered = cnState.items.filter(item => item.sn !== sn).map((item, idx) => {
        return { ...item, sn: idx + 1 };
      });
      setCnState({
        ...cnState,
        items: filtered
      });
      setIsEditing(true);
    };

    const focusCell = (rIdx: number, cId: string, attempts = 0) => {
      const el = document.querySelector(`[data-cn-row="${rIdx}"][data-cn-col="${cId}"]`) as HTMLInputElement | null;
      if (el) {
        el.focus();
        if ('select' in el) {
          el.select();
        }
      } else if (attempts < 15) {
        setTimeout(() => {
          focusCell(rIdx, cId, attempts + 1);
        }, 20);
      }
    };

    const handleExcelKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      rowIndex: number,
      colId: string
    ) => {
      const activeCols = ['description', 'qty', 'unit', 'rate', 'per', 'vatRate'];
      const colIndex = activeCols.indexOf(colId);

      if (e.key === 'Enter') {
        if (e.ctrlKey || e.metaKey) {
          return;
        }
        e.preventDefault();
        const nextRowIdx = e.shiftKey ? rowIndex - 1 : rowIndex + 1;

        if (!e.shiftKey && rowIndex === cnState.items.length - 1) {
          const nextSn = cnState.items.length + 1;
          const newItem: CreditNoteItem = {
            sn: nextSn,
            description: '',
            qty: '' as any,
            unit: '',
            rate: '' as any,
            per: '',
            amount: 0,
            vatRate: '' as any,
            taxableValue: 0,
            taxAmount: 0
          };
          setCnState(prev => ({
            ...prev,
            items: [...prev.items, newItem]
          }));
          setIsEditing(true);

          focusCell(rowIndex + 1, colId);
          triggerToast(`Automatically appended Item Row ${nextSn}!`);
          return;
        }

        focusCell(nextRowIdx, colId);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusCell(rowIndex - 1, colId);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusCell(rowIndex + 1, colId);
      } else if (e.key === 'ArrowLeft') {
        let cursorAtStart = true;
        try {
          if ('selectionStart' in e.currentTarget && e.currentTarget.selectionStart !== null) {
            cursorAtStart = e.currentTarget.selectionStart === 0;
          }
        } catch (err) {
          cursorAtStart = true;
        }
        if (cursorAtStart && colIndex > 0) {
          e.preventDefault();
          focusCell(rowIndex, activeCols[colIndex - 1]);
        } else if (cursorAtStart && colIndex === 0 && rowIndex > 0) {
          e.preventDefault();
          focusCell(rowIndex - 1, activeCols[activeCols.length - 1]);
        }
      } else if (e.key === 'ArrowRight') {
        let cursorAtEnd = true;
        try {
          if ('selectionEnd' in e.currentTarget && e.currentTarget.selectionEnd !== null) {
            cursorAtEnd = e.currentTarget.selectionEnd === (e.currentTarget.value || '').length;
          }
        } catch (err) {
          cursorAtEnd = true;
        }
        if (cursorAtEnd && colIndex < activeCols.length - 1) {
          e.preventDefault();
          focusCell(rowIndex, activeCols[colIndex + 1]);
        } else if (cursorAtEnd && colIndex === activeCols.length - 1 && rowIndex < cnState.items.length - 1) {
          e.preventDefault();
          focusCell(rowIndex + 1, activeCols[0]);
        }
      }
    };

    const handleUpdateRow = (sn: number, key: keyof CreditNoteItem, value: any) => {
      const updated = cnState.items.map(item => {
        if (item.sn === sn) {
          const updatedItem = { ...item, [key]: value };
          // Auto recalc amounts
          if (key === 'qty' || key === 'rate' || key === 'vatRate') {
            const qty = key === 'qty' ? parseFloat(value) || 0 : item.qty;
            const rate = key === 'rate' ? parseFloat(value) || 0 : item.rate;
            const vatRate = key === 'vatRate' ? parseFloat(value) || 0 : item.vatRate;
            
            updatedItem.amount = qty * rate;
            updatedItem.taxableValue = updatedItem.amount;
            updatedItem.taxAmount = updatedItem.taxableValue * (vatRate / 100);
          }
          return updatedItem;
        }
        return item;
      });
      setCnState({
        ...cnState,
        items: updated
      });
      setIsEditing(true);
    };

    // Dynamic calculations
    const totals = useMemo(() => {
      let totalQty = 0;
      let totalAmt = 0;
      let totalTaxableValue = 0;
      let totalTaxAmt = 0;
      cnState.items.forEach(item => {
        totalQty += (Number(item.qty) || 0);
        totalAmt += (Number(item.amount) || 0);
        totalTaxableValue += (Number(item.taxableValue) || 0);
        totalTaxAmt += (Number(item.taxAmount) || 0);
      });
      const grandTotal = totalTaxableValue + totalTaxAmt;
      return {
        totalQty,
        totalAmt,
        totalTaxableValue,
        totalTaxAmt,
        grandTotal
      };
    }, [cnState.items]);

    const numberToWordsAED = (num: number): string => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const scales = ['', 'Thousand', 'Million', 'Billion'];

      if (num === 0) return 'UAE Dirham Zero Only';

      const convertSection = (n: number): string => {
        let str = '';
        if (n >= 100) {
          str += ones[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        if (n >= 20) {
          str += tens[Math.floor(n / 10)] + ' ';
          n %= 10;
        }
        if (n > 0) {
          str += ones[n] + ' ';
        }
        return str.trim();
      };

      const parts = num.toFixed(2).split('.');
      const dirhamsVal = parseInt(parts[0], 10);
      const filsVal = parseInt(parts[1], 10);

      let result = '';

      if (dirhamsVal > 0) {
        let tempVal = dirhamsVal;
        let scaleIdx = 0;
        let dirhamsWordList = [];

        while (tempVal > 0) {
          const chunk = tempVal % 1000;
          if (chunk > 0) {
            const chunkStr = convertSection(chunk);
            const chunkScale = scales[scaleIdx] ? ' ' + scales[scaleIdx] : '';
            dirhamsWordList.unshift(chunkStr + chunkScale);
          }
          tempVal = Math.floor(tempVal / 1000);
          scaleIdx++;
        }
        result += 'UAE Dirham ' + dirhamsWordList.join(', ').trim();
      }

      if (filsVal > 0) {
        const filsWord = convertSection(filsVal);
        if (dirhamsVal > 0) {
          result += ' And Fils ' + filsWord + ' Only';
        } else {
          result += 'UAE Fils ' + filsWord + ' Only';
        }
      } else {
        result += ' Only';
      }

      return result.replace(/\s+/g, ' ');
    };

    const handlePrintCreditNote = (cnToPrint: CreditNote) => {
      let printTotalQty = 0;
      let printTotalTaxableValue = 0;
      let printTotalTaxAmt = 0;

      cnToPrint.items.forEach(item => {
        printTotalQty += item.qty;
        printTotalTaxableValue += item.taxableValue;
        printTotalTaxAmt += item.taxAmount;
      });

      const printGrandTotal = printTotalTaxableValue + printTotalTaxAmt;
      const amountWords = numberToWordsAED(printGrandTotal);
      const taxAmountWords = numberToWordsAED(printTotalTaxAmt);

      const tableRows = cnToPrint.items.map(item => `
        <tr>
          <td style="text-align: center; border: 1.5px solid #1e3a8a; padding: 6px; font-family: monospace;">${item.sn}</td>
          <td style="border: 1.5px solid #1e3a8a; padding: 6px; font-weight: bold; text-transform: uppercase;">${item.description || '—'}</td>
          <td style="text-align: center; border: 1.5px solid #1e3a8a; padding: 6px; font-weight: bold;">${item.qty} ${item.unit}</td>
          <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 6px; font-weight: bold;">${item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: center; border: 1.5px solid #1e3a8a; padding: 6px;">${item.per}</td>
          <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 6px; font-weight: bold;">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: center; border: 1.5px solid #1e3a8a; padding: 6px;">${item.vatRate}%</td>
          <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 6px; font-weight: bold; font-family: monospace;">${item.taxableValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 6px; font-weight: bold; font-family: monospace; color: #b91c1c;">${item.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 6px; font-weight: bold; font-family: monospace; color: #1e3a8a;">${(item.taxableValue + item.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>TAX CREDIT NOTE #${cnToPrint.creditNoteNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;750;900&family=JetBrains+Mono:wght@400;750&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: "Plus Jakarta Sans", sans-serif; padding: 30px; font-size: 11px; color: #010101; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .border-wrap { border: 2px solid #1e3a8a; padding: 15px; position: relative; width: 100%; min-height: 270mm; display: flex; flex-direction: column; justify-content: space-between; }
            
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            .header-table td { border: 1.5px solid #1e3a8a; padding: 10px; vertical-align: top; }
            
            .title-banner { width: 100%; text-align: center; border: 1.5px solid #1e3a8a; padding: 8px; margin-bottom: 12px; font-weight: 900; font-size: 16px; color: #1e3a8a; letter-spacing: 1px; text-transform: uppercase; }
            
            .desc-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            .desc-table th { background-color: #f1f5f9; border: 1.5px solid #1e3a8a; padding: 8px 6px; font-weight: 900; text-transform: uppercase; font-size: 9.5px; color: #1e3a8a; }
            .desc-table td { border: 1.5px solid #1e3a8a; padding: 6px; vertical-align: middle; }
            
            .summary-block { border: 1.5px solid #1e3a8a; padding: 10px; margin-bottom: 12px; }
            
            .footer-sig-layout { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; }
            .footer-sig-layout .sig-box { width: 45%; text-align: right; border-top: 1.5px solid #1e3a8a; padding-top: 8px; font-weight: 900; text-transform: uppercase; }
            
            @media print {
              @page { size: A4; margin: 0 !important; /* Suppress browser header/footer (including https URL) */ }
              body { padding: 10mm !important; margin: 0 !important; }
              .border-wrap { min-height: 260mm; }
            }
          </style>
        </head>
        <body>
          <div class="border-wrap">
            <div>
              <div class="title-banner">Tax Credit Note</div>
              
              <table class="header-table">
                <tr>
                  <td style="width: 50%;">
                    <div style="font-size: 13px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin-bottom: 4px;">${activeCompany.name}</div>
                    <div style="line-height: 1.4; text-transform: uppercase; font-weight: bold; color: #334155;">
                      ${activeCompany.address}<br/>
                      ${activeCompany.phone ? `TEL: ${activeCompany.phone} | ` : ''}EMAIL: ${activeCompany.email}
                    </div>
                    <div style="margin-top: 8px; font-weight: 800;">TRN: <span style="font-family: monospace; font-size: 12px; color: #1e3a8a;">${activeCompany.trn || '—'}</span></div>
                    <div style="font-weight: 700; margin-top: 2px;">Emirate: AJMAN</div>
                  </td>
                  <td style="width: 50%;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                      <div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold;">Credit Note No.</div>
                        <div style="font-size: 13px; font-weight: 900; color: #b91c1c; font-family: monospace; margin-top: 2px;">${cnToPrint.creditNoteNo}</div>
                      </div>
                      <div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold;">Dated</div>
                        <div style="font-size: 12px; font-weight: 900; color: #1e3a8a; font-family: monospace; margin-top: 2px;">${cnToPrint.dated}</div>
                      </div>
                    </div>
                    
                    <div style="border-top: 1.5px solid #1e3a8a; margin-top: 10px; padding-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                      <div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold;">Buyer's Ref / Order No</div>
                        <div style="font-weight: bold; margin-top: 2px;">${cnToPrint.buyersRef || '—'}</div>
                      </div>
                      <div>
                        <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold;">Other Reference(s)</div>
                        <div style="font-weight: bold; margin-top: 2px;">${cnToPrint.otherRef || '—'}</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">Party / Buyer:</div>
                    <div style="font-size: 12px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin-bottom: 4px;">${cnToPrint.partyName || '—'}</div>
                    <div style="line-height: 1.3; text-transform: uppercase; font-weight: bold; color: #334155;">
                      ${cnToPrint.partyAddress || '—'}
                    </div>
                    <div style="margin-top: 8px; font-weight: 800;">TRN: <span style="font-family: monospace; font-size: 12px; color: #1e3a8a;">${cnToPrint.partyTRN || '—'}</span></div>
                    <div style="font-weight: 700; margin-top: 2px;">Emirate: ${cnToPrint.partyEmirate || '—'}, ${cnToPrint.partyCountry || 'UAE'}</div>
                  </td>
                  <td>
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px;">Reason for Issuing Note:</div>
                    <div style="font-size: 12px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin-bottom: 4px;">${cnToPrint.reasonForIssue || '—'}</div>
                    
                    <div style="border-top: 1.5px solid #1e3a8a; margin-top: 18px; padding-top: 8px;">
                      <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Place of Supply / Emirate:</span>
                      <strong style="text-transform: uppercase; font-size: 11px; color: #010101; display: block; margin-top: 2px;">${cnToPrint.placeOfSupply || '—'}</strong>
                    </div>
                  </td>
                </tr>
              </table>
              
              <table class="desc-table">
                <thead>
                  <tr>
                    <th style="width: 45px;">S.No.</th>
                    <th>Description of Goods</th>
                    <th style="width: 80px;">Quantity</th>
                    <th style="width: 80px;">Rate</th>
                    <th style="width: 50px;">Per</th>
                    <th style="width: 100px;">Amount</th>
                    <th style="width: 60px;">VAT Rate</th>
                    <th style="width: 100px;">Taxable Val</th>
                    <th style="width: 90px;">Tax Amount</th>
                    <th style="width: 110px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                  <!-- Totals Row -->
                  <tr style="background-color: #f8fafc; font-weight: 900; border-top: 2px solid #1e3a8a;">
                    <td colspan="2" style="text-align: right; border: 1.5px solid #1e3a8a; padding: 8px;">Total / Cumulative Summary</td>
                    <td style="text-align: center; border: 1.5px solid #1e3a8a; padding: 8px;">${printTotalQty}</td>
                    <td colspan="2" style="border: 1.5px solid #1e3a8a; padding: 8px;"></td>
                    <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 8px; font-family: monospace;">${printTotalTaxableValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1.5px solid #1e3a8a; padding: 8px;"></td>
                    <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 8px; font-family: monospace;">${printTotalTaxableValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 8px; font-family: monospace; color: #b91c1c;">${printTotalTaxAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="text-align: right; border: 1.5px solid #1e3a8a; padding: 8px; font-family: monospace; color: #1e3a8a;">${printGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="summary-block">
                <div style="font-weight: 900; text-transform: uppercase; color: #64748b; font-size: 8.5px; margin-bottom: 4px;">Amount Chargeable in Words:</div>
                <div style="font-size: 11.5px; font-weight: bold; color: #1e3a8a; text-transform: uppercase;">${amountWords}</div>
                
                <div style="border-top: 1px dashed #1e3a8a; margin-top: 8px; padding-top: 6px;">
                  <div style="font-weight: 900; text-transform: uppercase; color: #64748b; font-size: 8.5px; margin-bottom: 4px;">VAT Amount in Words:</div>
                  <div style="font-size: 10.5px; font-weight: bold; text-transform: uppercase; color: #334155;">${taxAmountWords}</div>
                </div>
              </div>
            </div>
            
            <div class="footer-sig-layout" style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 75px;">
              <div style="width: 220px; text-align: center;">
                <div style="font-size: 8.5px; color: #1e3a8a; font-weight: bold; margin-bottom: 75px; text-transform: uppercase;">For Buyer / Customer</div>
                <div style="border-top: 1.5px solid #1e3a8a; padding-top: 6px; font-weight: 900; text-align: center; font-size: 9px; text-transform: uppercase;">Buyer's Seal & Signature</div>
              </div>
              <div style="width: 220px; text-align: center;">
                <div style="font-size: 8.5px; color: #1e3a8a; font-weight: bold; margin-bottom: 75px; text-transform: uppercase;">For: MARINE FASTENERS INDUSTRIES L.L.C.</div>
                <div style="border-top: 1.5px solid #1e3a8a; padding-top: 6px; font-weight: 900; text-align: center; font-size: 9px; text-transform: uppercase;">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printHtml(htmlContent, `TAX_CREDIT_NOTE_${cnToPrint.creditNoteNo}`);
    };

    // Filtered lists
    const filteredCns = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return creditNotes;
      return creditNotes.filter(
        c => c.creditNoteNo.toLowerCase().includes(q) || 
             c.partyName.toLowerCase().includes(q) ||
             (c.reasonForIssue && c.reasonForIssue.toLowerCase().includes(q))
      );
    }, [creditNotes, searchQuery]);

    return (
      <div className="space-y-4 font-sans text-slate-800 text-[11px] leading-relaxed select-none">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-950 no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-rose-500" />
            <div>
              <span className="text-[10px] text-rose-400 block uppercase font-bold tracking-wider leading-none">MFI ERP Voucher Console</span>
              <h3 className="font-sans font-bold text-xs uppercase text-slate-100 tracking-wide mt-1">Tax Credit Note Desk</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInitNewCn}
              className="bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 rounded transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> +NEW CREDIT NOTE
            </button>
            <button
              onClick={() => setActiveTab('credit_note_record')}
              className="bg-slate-700 hover:bg-slate-600 text-white font-sans font-bold uppercase tracking-wider text-[10px] px-3.5 py-2 rounded transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-rose-400" /> VIEW RECORDS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 leading-relaxed">
          
          {/* Main Workspace Frame (Full Width) */}
          <div className="col-span-12 xl:col-span-12 flex flex-col items-center">
            
            {/* Header Status Bar */}
            <div className="w-full flex justify-between items-center bg-slate-900 text-white p-2.5 rounded-t-xl border border-slate-950 no-print gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#f37021] font-bold uppercase tracking-wider">Inline Editable Document Sheet</span>
                {isEditing ? (
                  <span className="bg-amber-500/20 text-amber-300 text-[8.5px] px-1.5 py-0.5 font-bold uppercase rounded border border-amber-500/30 animate-pulse">
                    Draft Changes Outdated
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[8.5px] px-1.5 py-0.5 font-bold uppercase rounded border border-emerald-500/30">
                    Saved to ledger
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                {isEditing && (
                  <>
                    <button
                      onClick={handleSaveCn}
                      className="bg-rose-600 hover:bg-rose-500 text-white transition-colors px-2.5 py-1 font-sans font-bold uppercase tracking-wider text-[9px] cursor-pointer flex items-center gap-1 shadow-sm rounded border border-rose-500"
                    >
                      <Check className="w-3 h-3" /> Save to Ledger
                    </button>
                    <button
                      onClick={() => {
                        if (activeCreditNote) {
                          setCnState({ ...activeCreditNote });
                        }
                        setIsEditing(false);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors px-2 py-1 font-sans font-bold uppercase tracking-wider text-[9px] cursor-pointer flex items-center gap-1 shadow-sm rounded"
                    >
                      Reset
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handlePrintCreditNote(cnState)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors px-3 py-1 font-sans font-bold uppercase tracking-wider text-[9px] cursor-pointer flex items-center gap-1 shadow-sm rounded"
                >
                  <Printer className="w-3 h-3" /> Print Document
                </button>
              </div>
            </div>

            {/* Custom Interactive Paper Layout mimicking Tax credit note in UAE */}
            <div className="w-full bg-white border-2 border-t-0 border-slate-900 rounded-b-xl p-4 md:p-6 text-black shadow-lg flex flex-col items-center">
              
              <div className="w-full max-w-[850px] border-2 border-[#1e3a8a] p-4 font-sans text-[10.5px] text-slate-950 flex flex-col space-y-4">
                
                <div className="text-center font-bold text-rose-700 text-md uppercase border-b-2 border-[#1e3a8a] pb-1 tracking-widest bg-slate-50 py-1">
                  Tax Credit Note
                </div>

                {/* Top Section Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#1e3a8a] pb-4">
                  {/* Supplier Box */}
                  <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                    <span className="text-[9px] font-bold uppercase text-[#1e3a8a] block">Sender / Supplier Details</span>
                    <div className="flex gap-1.5 items-end">
                      <span className="font-semibold text-[#111] shrink-0 w-16">Supplier:</span>
                      <input 
                        type="text" 
                        value={cnState.issuerName} 
                        onChange={(e) => { setCnState({ ...cnState, issuerName: e.target.value.toUpperCase() }); setIsEditing(true); }}
                        className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-[#1e3a8a]"
                      />
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="font-semibold text-[#111] shrink-0 w-16">Address:</span>
                      <textarea 
                        rows={2} 
                        value={cnState.issuerAddress} 
                        onChange={(e) => { setCnState({ ...cnState, issuerAddress: e.target.value.toUpperCase() }); setIsEditing(true); }}
                        className="flex-1 bg-transparent border border-slate-300 focus:outline-none focus:border-rose-500 text-[10px] uppercase font-bold p-1 rounded"
                      />
                    </div>
                    <div className="flex gap-1.5 items-end">
                      <span className="font-semibold text-[#111] shrink-0 w-16">TRN Number:</span>
                      <input 
                        type="text" 
                        value={cnState.issuerTRN} 
                        onChange={(e) => { setCnState({ ...cnState, issuerTRN: e.target.value }); setIsEditing(true); }}
                        className="flex-1 bg-transparent font-semibold border-b border-slate-300 focus:outline-none focus:border-[#f37021] font-mono text-[#1e3a8a] text-xs"
                      />
                    </div>
                    <div className="flex gap-1.5 items-end">
                      <span className="font-semibold text-[#111] shrink-0 w-16">Emirate:</span>
                      <input 
                        type="text" 
                        value={cnState.issuerEmirate} 
                        onChange={(e) => { setCnState({ ...cnState, issuerEmirate: e.target.value }); setIsEditing(true); }}
                        className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Reference Credentials Box */}
                  <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                    <span className="text-[9px] font-bold uppercase text-rose-600 block">Registration Credentials</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-semibold text-[#111] block text-[9.5px]">Credit Note No:</span>
                        <input 
                          type="text" 
                          value={cnState.creditNoteNo} 
                          onChange={(e) => { setCnState({ ...cnState, creditNoteNo: e.target.value.toUpperCase() }); setIsEditing(true); }}
                          className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-rose-600 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-[#111] block text-[9.5px]">Dated:</span>
                        <input 
                          type="date" 
                          value={cnState.dated} 
                          onChange={(e) => { setCnState({ ...cnState, dated: e.target.value }); setIsEditing(true); }}
                          className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-[#f37021] font-mono text-xs font-bold text-[#1e3a8a] text-center"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                      <div>
                        <span className="font-semibold text-[#111] block text-[9.5px]">Buyer's Ref / Order No:</span>
                        <input 
                          type="text" 
                          value={cnState.buyersRef} 
                          onChange={(e) => { setCnState({ ...cnState, buyersRef: e.target.value }); setIsEditing(true); }}
                          className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-[#111] block text-[9.5px]">Other Reference(s):</span>
                        <input 
                          type="text" 
                          value={cnState.otherRef} 
                          onChange={(e) => { setCnState({ ...cnState, otherRef: e.target.value }); setIsEditing(true); }}
                          className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer & Supply details layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#1e3a8a] pb-4">
                  {/* Buyer Box */}
                  <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                    <span className="text-[9px] font-bold uppercase text-[#1e3a8a] block">Buyer / Debtor Details</span>
                    <div className="flex gap-1.5 items-end">
                      <span className="font-semibold text-[#111] shrink-0 w-16">Buyer To:</span>
                      <input 
                        type="text" 
                        list="buyer-selector-cn"
                        value={cnState.partyName || ''} 
                        onChange={(e) => { setCnState({ ...cnState, partyName: e.target.value.toUpperCase() }); setIsEditing(true); }}
                        className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-[#1e3a8a]"
                        placeholder="ENTER BUYER CLIENT..."
                      />
                      <datalist id="buyer-selector-cn">
                        {clientDatabase.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="font-semibold text-[#111] shrink-0 w-16">Address:</span>
                      <textarea 
                        rows={2} 
                        value={cnState.partyAddress || ''} 
                        onChange={(e) => { setCnState({ ...cnState, partyAddress: e.target.value.toUpperCase() }); setIsEditing(true); }}
                        className="flex-1 bg-transparent border border-slate-300 focus:outline-none focus:border-rose-500 text-[10px] uppercase font-semibold p-1 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex gap-1 items-end">
                        <span className="font-semibold text-[#111] text-[9.5px] tracking-tight shrink-0">TRN No:</span>
                        <input 
                          type="text" 
                          value={cnState.partyTRN || ''} 
                          onChange={(e) => { setCnState({ ...cnState, partyTRN: e.target.value }); setIsEditing(true); }}
                          className="flex-1 bg-transparent font-bold border-b border-slate-300 focus:outline-none focus:border-rose-500 font-mono text-[10.5px] text-[#1e3a8a]"
                          placeholder="TRN No"
                        />
                      </div>
                      <div className="flex gap-1 items-end">
                        <span className="font-semibold text-[#111] text-[9.5px] tracking-tight shrink-0">Country:</span>
                        <input 
                          type="text" 
                          value={cnState.partyCountry || ''} 
                          onChange={(e) => { setCnState({ ...cnState, partyCountry: e.target.value }); setIsEditing(true); }}
                          className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Supply & Issue Reason */}
                  <div className="space-y-2 border border-dashed border-[#1e3a8a]/40 p-2.5 rounded bg-slate-50/50">
                    <span className="text-[9px] font-bold uppercase text-rose-600 block">Supply Parameters</span>
                    <div>
                      <span className="font-semibold text-[#111] block text-[9.5px]">Reason for issuing credit note:</span>
                      <input 
                        type="text" 
                        value={cnState.reasonForIssue || ''} 
                        onChange={(e) => { setCnState({ ...cnState, reasonForIssue: e.target.value }); setIsEditing(true); }}
                        className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-[#1e3a8a] text-[11px]"
                        placeholder="e.g. Sales return, original invoice value discount"
                      />
                    </div>
                    <div className="pt-2">
                      <span className="font-semibold text-[#111] block text-[9.5px]">Place of Supply (Emirate):</span>
                      <input 
                        type="text" 
                        value={cnState.placeOfSupply || ''} 
                        onChange={(e) => { setCnState({ ...cnState, placeOfSupply: e.target.value }); setIsEditing(true); }}
                        className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-rose-500 font-bold text-slate-800 text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Ledger Interactive Spreadsheet Itemization Details */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1e3a8a] uppercase text-[9px] tracking-wider">Line Itemization list</span>
                    <button 
                      onClick={handleAddRow}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded font-sans text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item Line
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto border border-[#1e3a8a] rounded bg-white font-sans text-[10px]">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-100 uppercase font-bold text-[#1e3a8a] border-b border-[#1e3a8a]">
                          <th className="p-2 border-r border-[#1e3a8a] w-12 text-center">S.No.</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-72">Goods / Service Description</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-24 text-center">Qty</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-16 text-center">Unit</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-24 text-right">Rate</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-16 text-center">Per</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-24 text-right">Amount</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-16 text-center">VAT%</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-24 text-right">Tax Amt (5%)</th>
                          <th className="p-2 border-r border-[#1e3a8a] w-28 text-right">Line Total</th>
                          <th className="p-2 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e3a8a]/20">
                        {cnState.items.map((item, idx) => (
                          <tr key={item.sn} className="hover:bg-slate-50 transition-colors">
                            <td className="p-1 border-r border-[#1e3a8a] text-center font-mono font-bold">{item.sn}</td>
                            <td className="p-1 border-r border-[#1e3a8a]">
                              <input 
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'description', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'description')}
                                data-cn-row={idx}
                                data-cn-col="description"
                                className="w-full bg-transparent border-none font-semibold text-slate-800 uppercase focus:bg-orange-50 font-sans p-1 focus:outline-none focus:ring-1 focus:ring-rose-400 rounded"
                                placeholder="Describe items..."
                              />
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a]">
                              <input 
                                type="number"
                                value={item.qty ?? ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'qty', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'qty')}
                                data-cn-row={idx}
                                data-cn-col="qty"
                                className="w-full bg-transparent border-none font-bold text-center text-slate-800 focus:bg-orange-50 font-mono focus:outline-none focus:ring-1 focus:ring-rose-400 rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a]">
                              <input 
                                type="text"
                                value={item.unit || ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'unit', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'unit')}
                                data-cn-row={idx}
                                data-cn-col="unit"
                                className="w-full bg-transparent border-none text-center text-slate-600 uppercase focus:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-rose-400 rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a]">
                              <input 
                                type="number"
                                step="any"
                                value={item.rate ?? ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'rate', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'rate')}
                                data-cn-row={idx}
                                data-cn-col="rate"
                                className="w-full bg-transparent border-none font-bold text-right text-slate-800 focus:bg-orange-50 font-mono focus:outline-none focus:ring-1 focus:ring-rose-400 rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a]">
                              <input 
                                type="text"
                                value={item.per || ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'per', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'per')}
                                data-cn-row={idx}
                                data-cn-col="per"
                                className="w-full bg-transparent border-none text-center text-slate-500 focus:bg-orange-50 focus:outline-none focus:ring-1 focus:ring-rose-400 rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a] text-right font-mono font-bold text-slate-700">
                              {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a]">
                              <input 
                                type="number"
                                value={item.vatRate ?? ''}
                                onChange={(e) => handleUpdateRow(item.sn, 'vatRate', e.target.value)}
                                onKeyDown={(e) => handleExcelKeyDown(e, idx, 'vatRate')}
                                data-cn-row={idx}
                                data-cn-col="vatRate"
                                className="w-full bg-transparent border-none text-center font-bold text-slate-600 focus:bg-orange-50 font-mono focus:outline-none focus:ring-1 focus:ring-rose-400 rounded"
                              />
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a] text-right font-mono font-bold text-rose-600">
                              {item.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-1 border-r border-[#1e3a8a] text-right font-mono font-bold text-[#1e3a8a]">
                              {(item.taxableValue + item.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-1 text-center">
                              <button 
                                onClick={() => handleRemoveRow(item.sn)}
                                className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                                title="Discard product row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {cnState.items.length === 0 && (
                          <tr>
                            <td colSpan={11} className="text-center py-4 text-slate-400 font-bold">No items found. Click "+ Add Item Line" to begin typing.</td>
                          </tr>
                        )}
                        {/* Totals Row */}
                        <tr className="bg-slate-50 border-t border-[#1e3a8a] font-bold text-[10.5px]">
                          <td colSpan={2} className="p-2 border-r border-[#1e3a8a] text-right text-[#1e3a8a] uppercase font-bold">Gross Aggregates:</td>
                          <td className="p-2 border-r border-[#1e3a8a] text-center font-mono font-semibold">{totals.totalQty}</td>
                          <td colSpan={3} className="p-2 border-r border-[#1e3a8a]"></td>
                          <td className="p-2 border-r border-[#1e3a8a] text-right font-mono font-semibold">{totals.totalAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2 border-r border-[#1e3a8a]"></td>
                          <td className="p-2 border-r border-[#1e3a8a] text-right font-mono font-bold text-rose-700">{totals.totalTaxAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2 border-r border-[#1e3a8a] text-right font-mono font-semibold text-[#1e3a8a]">{(totals.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Amount details in Words */}
                <div className="border border-[#1e3a8a] p-3 rounded space-y-2 bg-slate-50/50">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Amount Chargeable in Words</span>
                    <span className="text-xs font-bold text-[#1e3a8a] uppercase leading-none mt-0.5 block">
                      {numberToWordsAED(totals.grandTotal)}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-[#1e3a8a]/20 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Total VAT 5% Accumulation</span>
                      <span className="text-[11px] font-bold text-rose-700 font-mono">
                        AED {totals.totalTaxAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">VAT Amount in Words</span>
                      <span className="text-[10px] font-semibold text-slate-700 uppercase">
                        {numberToWordsAED(totals.totalTaxAmt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Signature Sections */}
                <div className="flex justify-between items-end pt-20 font-semibold text-xs leading-none">
                  <div className="w-56 text-center space-y-16">
                    <div className="text-[8.5px] font-bold text-[#1e3a8a] uppercase tracking-wider text-center block">
                      For Buyer / Customer
                    </div>
                    <div className="border-t-2 border-[#1e3a8a] pt-1.5 uppercase font-bold text-[8.5px] tracking-tight text-center text-slate-800">
                      Buyer's Seal & Signature
                    </div>
                  </div>
                  <div className="w-56 text-center space-y-16">
                    <div className="text-[8.5px] font-bold text-[#1e3a8a] uppercase tracking-wider text-center block">
                      For: MARINE FASTENERS INDUSTRIES L.L.C.
                    </div>
                    <div className="border-t-2 border-[#1e3a8a] pt-1.5 uppercase font-bold text-[8.5px] tracking-tight text-center text-slate-800">
                      Authorized Signatory
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  // --- Sub component 5: PROCUREMENT PO PLANNER ---
  const PurchaseOrderComponent = () => {
    const [selectedPo, setSelectedPo] = useState<PurchaseOrder>(purchaseRegisters[0] || {
      id: 'po-new',
      poNo: 'PO' + Math.floor(Math.random() * 90000 + 10000),
      dated: new Date().toISOString().substring(0, 10),
      supplierName: 'TAIWAN FASTENERS CORP',
      supplierAddress: 'NO. 45 CHUNG SHAN ROAD, TAIWAN',
      deliveryDate: '2026-09-01',
      paymentTerms: 'LETTER OF CREDIT AT SIGHT',
      shippingTerms: 'FOB PORT',
      currency: 'USD',
      exchangeRate: 3.67,
      items: []
    });

    const [poItemDesc, setPoItemDesc] = useState('');
    const [poItemQty, setPoItemQty] = useState(1000);
    const [poItemUnit, setPoItemUnit] = useState('Pcs.');
    const [poItemPrice, setPoItemPrice] = useState(1.5);

    const [storeRequests, setStoreRequests] = useState<any[]>(() => {
      const saved = localStorage.getItem('MF_STORE_PURCHASE_REQUESTS');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      return [
        {
          id: 'REQ-2026-601',
          sourceWoNo: 'WO-26-102',
          customerName: 'Hamriyah Shipbuilders',
          requestedDate: '2026-05-18',
          itemDescription: 'HEAVY HEX BOLTS SS316 3/4" X 5" GRADED',
          qty: 1200,
          unit: 'Pcs.',
          priority: 'High',
          requestedBy: 'Supervisor Desk',
          status: 'PO Created',
          officePoNo: 'PO-2026-081',
          notes: 'Required due to custom thread requirement shortfall'
        },
        {
          id: 'REQ-2026-602',
          sourceWoNo: 'WO-26-103',
          customerName: 'Abu Dhabi Piping Ltd',
          requestedDate: '2026-05-27',
          itemDescription: 'SPRING WASHERS DIN 127B A4 M16',
          qty: 8000,
          unit: 'Pcs.',
          priority: 'Medium',
          requestedBy: 'Store Floor Lead',
          status: 'Pending',
          notes: 'Low inventory alert on packing lines'
        }
      ];
    });

    useEffect(() => {
      const saved = localStorage.getItem('MF_STORE_PURCHASE_REQUESTS');
      if (saved) {
        try {
          setStoreRequests(JSON.parse(saved));
        } catch (e) {}
      }
    }, [selectedPo.id]);

    const handleApproveStoreRequest = (req: any) => {
      const freshLine = {
        sn: selectedPo.items.length + 1,
        description: `REQ ${req.id}: ${req.itemDescription}`.toUpperCase(),
        qty: req.qty,
        unit: req.unit,
        unitPrice: 1.25
      };

      const revisedPo = {
        ...selectedPo,
        items: [...selectedPo.items, freshLine]
      };
      setSelectedPo(revisedPo);

      const modifiedRequests = storeRequests.map(r => {
        if (r.id === req.id) {
          return {
            ...r,
            status: 'PO Created',
            officePoNo: selectedPo.poNo
          };
        }
        return r;
      });

      setStoreRequests(modifiedRequests);
      localStorage.setItem('MF_STORE_PURCHASE_REQUESTS', JSON.stringify(modifiedRequests));
      triggerToast(`Approved store request ${req.id}! Slashed & pushed as a line item in draft PO ${selectedPo.poNo}!`);
    };

    const handleDeclineStoreRequest = (id: string) => {
      const revisedRequests = storeRequests.map(r => {
        if (r.id === id) {
          return { ...r, status: 'Declined' };
        }
        return r;
      });
      setStoreRequests(revisedRequests);
      localStorage.setItem('MF_STORE_PURCHASE_REQUESTS', JSON.stringify(revisedRequests));
      triggerToast(`Store request ${id} declined.`);
    };

    const handleSavePo = () => {
      const idx = purchaseRegisters.findIndex(item => item.id === selectedPo.id);
      
      let updated: PurchaseOrder[] = [];
      if (idx >= 0) {
        updated = [...purchaseRegisters];
        updated[idx] = selectedPo;
      } else {
        updated = [selectedPo, ...purchaseRegisters];
      }
      setPurchaseRegisters(updated);
      triggerToast(`Purchase Order ${selectedPo.poNo} saved successfully!`);
    };

    const handleAddNewPoLine = (e: React.FormEvent) => {
      e.preventDefault();
      if (!poItemDesc.trim()) {
        alert("Please set a brand name spec description.");
        return;
      }

      const freshLine = {
        sn: selectedPo.items.length + 1,
        description: poItemDesc.toUpperCase(),
        qty: poItemQty,
        unit: poItemUnit,
        unitPrice: poItemPrice
      };

      setSelectedPo({
        ...selectedPo,
        items: [...selectedPo.items, freshLine]
      });

      setPoItemDesc('');
      triggerToast("Line item pushed to PO procurement list!");
    };

    const deletePoLine = (sn: number) => {
      const filtered = selectedPo.items.filter(it => it.sn !== sn).map((it, idx) => ({
        ...it,
        sn: idx + 1
      }));
      setSelectedPo(prev => ({
        ...prev,
        items: filtered
      }));
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 select-none font-mono text-[10.5px]">
        {/* 📥 STORE REQUISITIONS INBOX DESK (Ajman Office Central Control) */}
        <div className="xl:col-span-12 font-mono space-y-3 no-print">
          <div className="bg-slate-950 text-white rounded-lg p-3.5 border-l-4 border-rose-500 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#f37021] uppercase flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Ajman Workshop Store Requisitions Inbox
                </span>
                <p className="text-[10.5px] text-slate-350 mt-1 font-sans leading-relaxed">
                  Real-time purchase requests received from the factory floor supervisors on status <strong className="text-red-400">PR ISSUE</strong>. Review outstanding items below and click <strong className="text-green-400 font-semibold">ADD TO CURRENT PO</strong> to push them as line items in the active procurement contract.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[12px] font-semibold text-rose-450 font-mono block">
                  {storeRequests.filter(r => r.status === 'Pending').length} PENDING STORE REQUESTS
                </span>
              </div>
            </div>

            {storeRequests.filter(r => r.status === 'Pending').length === 0 ? (
              <div className="mt-3 text-center py-4 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] uppercase font-bold italic">
                No outstanding workshop purchase requisitions. All PRs successfully approved or archived!
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {storeRequests.filter(r => r.status === 'Pending').map(req => (
                  <div key={req.id} className="p-3 bg-slate-900 border border-slate-800 rounded flex flex-col justify-between gap-2.5">
                    <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400">
                      <span>REQ ID: <strong className="text-slate-150">{req.id}</strong> | FOR WO: <strong className="text-[#f37021]">{req.sourceWoNo}</strong></span>
                      <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-xs uppercase tracking-wider text-[7px] font-bold">PR ISSUE REPORTED</span>
                    </div>

                    <div className="space-y-1 text-left font-sans text-[11px] leading-relaxed">
                      <div className="text-white font-semibold text-[12px] uppercase font-mono tracking-tight">{req.itemDescription}</div>
                      {req.notes && <div className="text-slate-400 italic text-[10px]">Store Note: {req.notes}</div>}
                      <div className="text-[9.5px] text-slate-400 font-mono uppercase">
                        CUSTOMER REF: <span className="font-semibold text-slate-200">{req.customerName}</span> | SUBMITTED BY: <span className="text-slate-200 font-bold">{req.requestedBy}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-2 rounded">
                      <span className="text-xs font-bold text-white font-mono">
                        QTY: {req.qty.toLocaleString()} <span className="text-[9.5px] text-slate-400 font-normal">{req.unit}</span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeclineStoreRequest(req.id)}
                          className="px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-slate-755 text-slate-400 hover:text-rose-400 border border-slate-700 uppercase cursor-pointer rounded-xs"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApproveStoreRequest(req)}
                          className="px-3 py-1 text-[9px] font-bold bg-[#f37021] hover:bg-orange-600 text-white border border-[#f37021] uppercase cursor-pointer rounded-xs flex items-center gap-1 shadow-2xs hover:scale-[1.02] transition-transform"
                        >
                          📥 ADD TO PO #{selectedPo.poNo}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Left Input panel */}
        <div className="xl:col-span-12 lg:col-span-12 xl:hidden mb-2 font-bold text-center text-slate-450 uppercase py-1.5 bg-yellow-50 border border-yellow-200 rounded">
          📢 View Ajman Store Requisitions Desk above. Manage procurement contract below.
        </div>

        <div className="xl:col-span-5 space-y-6 no-print">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest block">Select / Clear Draft PO</span>
            <div className="flex gap-2">
              <select 
                className="flex-1 p-2 border font-mono text-xs focus:ring-blue-550 focus:border-blue-550"
                value={selectedPo.id}
                onChange={(e) => {
                  const found = purchaseRegisters.find(p => p.id === e.target.value);
                  if (found) {
                    setSelectedPo(found);
                  } else {
                    setSelectedPo({
                      id: 'po-' + Date.now(),
                      poNo: 'PO' + Math.floor(Math.random() * 90000 + 10000),
                      dated: new Date().toISOString().substring(0, 10),
                      supplierName: 'HEX NUTS IMPORTERS IND LLC',
                      supplierAddress: 'MID-DISTRICT INDUSTRIAL INDUSTRIAL AREA, NEW DELHI, INDIA',
                      deliveryDate: '2026-08-01',
                      paymentTerms: 'CAD - WIRE TRANSFER',
                      shippingTerms: 'FOB PORT OF SHANGHAI',
                      currency: 'USD',
                      exchangeRate: 3.67,
                      items: []
                    });
                  }
                }}
              >
                <option value="new">+ Start Brand New Purchase Order</option>
                {purchaseRegisters.map(p => (
                  <option key={p.id} value={p.id}>{p.poNo} — {p.supplierName}</option>
                ))}
              </select>
              <button 
                onClick={handleSavePo}
                className="px-3 bg-[#f37021] text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer hover:opacity-90"
              >
                <Save className="w-3.5 h-3.5" /> Save PO
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3 font-sans text-xs">
            <span className="text-[10px] text-slate-405 font-bold uppercase block font-mono">1. Procurement Meta parameters</span>
            
            <div className="grid grid-cols-2 gap-2 font-mono text-[10.5px]">
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">PO Number</label>
                <input 
                  type="text" 
                  value={selectedPo.poNo} 
                  onChange={(e) => setSelectedPo({...selectedPo, poNo: e.target.value.toUpperCase()})}
                  className="w-full p-1.5 border font-mono text-xs uppercase font-semibold text-[#f37021]"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Dated</label>
                <input 
                  type="date" 
                  value={selectedPo.dated} 
                  onChange={(e) => setSelectedPo({...selectedPo, dated: e.target.value})}
                  className="w-full p-1.5 border font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Scheduled Delivery</label>
                <input 
                  type="date" 
                  value={selectedPo.deliveryDate} 
                  onChange={(e) => setSelectedPo({...selectedPo, deliveryDate: e.target.value})}
                  className="w-full p-1.5 border font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Supplier Name</label>
                <input 
                  type="text" 
                  value={selectedPo.supplierName} 
                  onChange={(e) => setSelectedPo({...selectedPo, supplierName: e.target.value.toUpperCase()})}
                  className="w-full p-1.5 border font-mono text-xs font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[10.5px]">
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block font-bold text-slate-600">Trading Currency</label>
                <select 
                  className="w-full p-1 border font-mono text-xs"
                  value={selectedPo.currency}
                  onChange={(e) => setSelectedPo({...selectedPo, currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="AED">AED (Dirhams)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block font-bold text-slate-600">Exchange conversion (AED)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={selectedPo.exchangeRate} 
                  onChange={(e) => setSelectedPo({...selectedPo, exchangeRate: parseFloat(e.target.value) || 1})}
                  className="w-full p-1 border font-mono text-xs text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[10.5px]">
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Shipping Terms</label>
                <input 
                  type="text" 
                  value={selectedPo.shippingTerms} 
                  onChange={(e) => setSelectedPo({...selectedPo, shippingTerms: e.target.value.toUpperCase()})}
                  className="w-full p-1 border font-mono text-xs uppercase"
                />
              </div>
              <div>
                <label className="text-[8.5px] text-slate-400 font-semibold uppercase block">Payment Terms</label>
                <input 
                  type="text" 
                  value={selectedPo.paymentTerms} 
                  onChange={(e) => setSelectedPo({...selectedPo, paymentTerms: e.target.value.toUpperCase()})}
                  className="w-full p-1 border font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>

          {/* Form material scheduler */}
          <div className="bg-[#fcfcfd] border rounded p-4 shadow-2xs space-y-3 font-sans text-xs">
            <span className="text-[10px] text-[#f37021] font-bold block font-mono">2. Procurement components item specifications</span>
            
            <form onSubmit={handleAddNewPoLine} className="space-y-2">
              <div>
                <label className="text-[9px] text-slate-450 block uppercase font-mono">Component Description</label>
                <input 
                  type="text" 
                  placeholder="STAINLESS STEEL 304 FULL THREAD HEX BOLT..."
                  value={poItemDesc}
                  onChange={(e) => setPoItemDesc(e.target.value)}
                  className="w-full p-1.5 border font-mono text-xs uppercase"
                  list="stdProductsDatalist"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] text-slate-450 block uppercase font-mono">QTY</label>
                  <input 
                    type="number" 
                    value={poItemQty} 
                    onChange={(e) => setPoItemQty(parseInt(e.target.value) || 1)}
                    className="w-full p-1 border font-mono text-xs text-right"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-450 block uppercase font-mono">Unit Of Measure</label>
                  <input 
                    type="text" 
                    value={poItemUnit} 
                    onChange={(e) => setPoItemUnit(e.target.value)}
                    className="w-full p-1 border font-mono text-xs uppercase text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-450 block uppercase font-[#f37021] font-mono">Unit Price</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={poItemPrice} 
                    onChange={(e) => setPoItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-1 border font-mono text-xs text-right"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono uppercase text-xs font-semibold cursor-pointer text-center"
              >
                + Schedule PO Component Item
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Render layout */}
        <div className="xl:col-span-7">
          <div className="bg-white border border-slate-350 p-6 md:p-8 text-black shadow-sm max-w-[620px] mx-auto print:border-none print:shadow-none print:p-0">
            {/* Header branding */}
            <div className="border-t-4 border-[#f37021] pt-3 flex justify-between items-start font-mono uppercase text-xs">
              <div>
                <span className="text-[8px] text-[#f37021] font-bold">Procurement &amp; Import Planner</span>
                <h3 className="font-semibold text-slate-955 text-sm leading-tight uppercase">{activeCompany.name}</h3>
                <p className="text-[9.5px] mt-0.5 text-indigo-805 text-indigo-700 font-semibold">{activeCompany.address}</p>
              </div>

              <div className="bg-slate-50 border border-slate-400 p-1.5 text-right min-w-[200px]">
                <h4 className="text-sm font-bold tracking-widest text-slate-900 border-b pb-0.5 block font-sans">PURCHASE ORDER</h4>
                <p className="text-[10px] font-mono font-bold text-slate-800 mt-1">Ref No: {selectedPo.poNo}</p>
                <p className="text-[9.5px] font-mono">Date: {selectedPo.dated}</p>
              </div>
            </div>

            {/* Vendor specs block */}
            <div className="border border-slate-400 grid grid-cols-12 mt-4 text-xs font-mono select-none">
              <div className="col-span-7 p-3 border-r border-slate-400 leading-tight">
                <span className="text-[8.5px] text-slate-400 font-semibold block">Supplier / Foreign Exporter Address:</span>
                <h5 className="font-semibold text-slate-900 uppercase block mt-1">{selectedPo.supplierName}</h5>
                <p className="text-slate-550 block mt-0.5 whitespace-pre-wrap text-[10px]">{selectedPo.supplierAddress || 'Kaohsiung Harbor Road, Taiwan'}</p>
              </div>
              <div className="col-span-5 p-3 leading-tight bg-slate-50 text-[10px]">
                <span className="text-[8.5px] text-slate-405 font-bold block uppercase border-b pb-1">Clearing Shipping Terms</span>
                <div className="space-y-1 mt-1 font-bold text-slate-700 uppercase">
                  <p>Inco term: <span className="text-slate-950 font-bold">{selectedPo.shippingTerms || 'FOB PORT'}</span></p>
                  <p>Payment: <span className="text-[#f37021] font-semibold text-[9.5px]">{selectedPo.paymentTerms || 'ACC AT SIGHT'}</span></p>
                  <p>Expected arrival: <span className="text-blue-700">{selectedPo.deliveryDate}</span></p>
                </div>
              </div>
            </div>

            {/* Grid Table */}
            <table className="w-full mt-4 border border-slate-400 border-collapse uppercase text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 font-bold text-left font-mono text-[9.5px] text-slate-905">
                  <th className="border-r border-slate-400 p-1.5 text-center w-10">S.N</th>
                  <th className="border-r border-slate-400 p-1.5">component Description details / Quality spec</th>
                  <th className="border-r border-slate-400 p-1.5 text-center w-16">Unit</th>
                  <th className="border-r border-slate-400 p-1.5 text-center w-20">QTY</th>
                  <th className="border-r border-slate-400 p-1.5 text-right w-24">Unit Price ({selectedPo.currency})</th>
                  <th className="p-1.5 text-right w-28">Total value ({selectedPo.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-350 text-[11px] font-sans">
                {selectedPo.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 italic text-slate-400 font-mono bg-slate-50">No components scheduler lines drafted. Complete left form to populate PO list.</td>
                  </tr>
                ) : (
                  selectedPo.items.map(it => (
                    <tr key={it.sn} className="hover:bg-slate-50 font-medium">
                      <td className="border-r border-slate-400 p-1.5 text-center font-mono">{it.sn}</td>
                      <td className="border-r border-slate-400 p-1.5 font-bold text-slate-900 font-sans">{it.description}</td>
                      <td className="border-r border-slate-400 p-1.5 text-center font-mono">{it.unit}</td>
                      <td className="border-r border-slate-400 p-1.5 text-center font-bold font-mono text-slate-950">{it.qty}</td>
                      <td className="border-r border-slate-400 p-1.5 text-right font-mono">{it.unitPrice.toFixed(2)}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-teal-700">
                        {(it.qty * it.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}

                {/* Total scheduled */}
                {selectedPo.items.length > 0 && (
                  <tr className="border-t border-slate-500 bg-slate-100 font-bold font-mono text-[10.5px]">
                    <td colSpan={3} className="p-2 text-right border-r border-slate-400 uppercase font-bold">Consolidated value schedule</td>
                    <td className="p-2 text-center border-r border-slate-400 text-amber-700">{selectedPo.items.reduce((s,c) => s+c.qty, 0)}</td>
                    <td className="p-2 text-right border-r border-slate-400 font-mono text-slate-500">EXCH: {selectedPo.exchangeRate}</td>
                    <td className="p-2 text-right font-mono text-teal-800 font-bold">
                      {selectedPo.currency} {selectedPo.items.reduce((sum, current) => sum + (current.qty * current.unitPrice), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Official Procurement stamp sign block */}
            <div className="grid grid-cols-2 mt-4 text-center text-xs divide-x divide-slate-400 border border-slate-400 h-24 font-mono select-none">
              <div className="p-2.5 flex flex-col justify-between">
                <span className="text-[8px] text-slate-405 block uppercase font-bold">Planned Imports Procurement Desk</span>
                <span className="text-[10px] font-bold uppercase text-slate-800 border-t border-dashed pt-1 leading-none">Accounts Sign Date</span>
              </div>
              <div className="p-2.5 bg-slate-50 flex flex-col justify-between h-full">
                <span className="text-[8px] text-[#f37021] block uppercase font-bold">FOR: MARINE FASTENERS INDUSTRIES LLC</span>
                <span className="text-[10px] font-semibold uppercase text-slate-900 border-t border-dashed pt-1 leading-none font-bold">Managing Director Stamp</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 no-print">
              <button 
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-650 to-blue-750 bg-blue-600 font-bold hover:opacity-90 text-white text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" /> Print Procurement PO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Sub-module: RECORD SHEETS & MASTER WAREHOUSE LOG REGISTER ---
  interface ManualLogEntry {
    id: string;
    logNo: string;
    dated: string;
    componentDesc: string;
    binLocation: string;
    qtyChange: string;
    status: 'PASSED' | 'FAILED' | 'PENDING' | 'DISPATCHED';
    operator: string;
    notes: string;
  }

  const RecordSheetComponent = () => {
    // Record sheet types: 'dispatch' | 'financial' | 'manual'
    const [subTab, setSubTab] = useState<'dispatch' | 'financial' | 'manual'>('dispatch');
    const [searchQuery, setSearchQuery] = useState('');

    // Load and update Custom Audit records in localStorage
    const [manualLogs, setManualLogs] = useState<ManualLogEntry[]>(() => {
      const saved = localStorage.getItem('MF_MANUAL_LOG_RECORDS');
      if (saved) return JSON.parse(saved);
      return [];
    });

    useEffect(() => {
      localStorage.setItem('MF_MANUAL_LOG_RECORDS', JSON.stringify(manualLogs));
    }, [manualLogs]);

    // Manual Log Input states
    const [newLogNo, setNewLogNo] = useState(() => 'RL-' + Math.floor(Math.random() * 90000 + 10000));
    const [newLogDate, setNewLogDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [newLogDesc, setNewLogDesc] = useState('');
    const [newLogBin, setNewLogBin] = useState('BAY-01, BIN-01');
    const [newLogQty, setNewLogQty] = useState('+1,000');
    const [newLogStatus, setNewLogStatus] = useState<'PASSED' | 'FAILED' | 'PENDING' | 'DISPATCHED'>('PASSED');
    const [newLogOperator, setNewLogOperator] = useState('A. RAHMAN (AJMAN DEPOT)');
    const [newLogNotes, setNewLogNotes] = useState('');

    const handleCreateLogEntry = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLogDesc.trim()) {
        alert("Please enter a component size description first!");
        return;
      }
      const newEntry: ManualLogEntry = {
        id: 'log-' + Date.now(),
        logNo: newLogNo.toUpperCase(),
        dated: newLogDate,
        componentDesc: newLogDesc.toUpperCase(),
        binLocation: newLogBin.toUpperCase(),
        qtyChange: newLogQty.endsWith(' PCS') ? newLogQty : `${newLogQty} PCS`,
        status: newLogStatus,
        operator: newLogOperator.toUpperCase(),
        notes: newLogNotes.toUpperCase() || 'ROUTINE LOG INVENTORY UPDATES.'
      };

      setManualLogs([newEntry, ...manualLogs]);
      triggerToast(`Saved log sheet record ${newEntry.logNo} successfully!`);

      // Reset
      setNewLogNo('RL-' + Math.floor(Math.random() * 90000 + 10000));
      setNewLogDesc('');
      setNewLogNotes('');
    };

    const handleDeleteLogEntry = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("Delete this log line from active register sheet?")) {
        setManualLogs(manualLogs.filter(it => it.id !== id));
        triggerToast("Removed log line record.");
      }
    };

    // Load Invoices Dynamic Log
    const invoicesList = useMemo(() => {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
      return [];
    }, []);

    // Load Inbound Materials Ledger Logs (Inbound receipts)
    const inboundMaterialsLedger = useMemo(() => {
      const saved = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [];
    }, []);

    // Combine into Log dispatches (OUTGOING logistics + INCOMING receipts)
    const dispatchRecords = useMemo(() => {
      const records: Array<{
        date: string;
        docRef: string;
        type: string;
        direction: 'OUTGOING' | 'INCOMING';
        client: string;
        materials: string;
        totalQty: number;
        cartons: number;
        grossWeight: number;
      }> = [];

      packingRegisters.forEach(pl => {
        records.push({
          date: pl.dated,
          docRef: pl.packingNo,
          type: 'LOGISTICS CARGO DISPATCH',
          direction: 'OUTGOING',
          client: pl.buyerName,
          materials: pl.items.map(it => `${it.qty}x ${it.description}`).join(', ') || 'MISC FASTENERS PARTS',
          totalQty: pl.items.reduce((acc, curr) => acc + curr.qty, 0),
          cartons: pl.totalCartons,
          grossWeight: pl.totalGrossWeight
        });
      });

      invoicesList.forEach((inv: any) => {
        let qtyVal = 0;
        if (inv.items && Array.isArray(inv.items)) {
          qtyVal = inv.items.reduce((acc: number, curr: any) => acc + (curr.qty || 0), 0);
        }
        records.push({
          date: inv.dated || '2026-05-15',
          docRef: inv.invoiceNo || 'INV-REF',
          type: inv.documentType || 'TAX INVOICE',
          direction: 'OUTGOING',
          client: inv.buyerName || 'WALK-IN CLIENT',
          materials: (inv.items && Array.isArray(inv.items) && inv.items.map((it: any) => `${it.qty}x ${it.description}`).join(', ')) || 'GRADE COMPLIANT BOLTS',
          totalQty: qtyVal,
          cartons: Math.ceil(qtyVal / 120) || 4,
          grossWeight: Math.round(qtyVal * 0.14) || 75
        });
      });

      inboundMaterialsLedger.forEach((doDoc: any) => {
        let totalQty = 0;
        if (doDoc.items && Array.isArray(doDoc.items)) {
          totalQty = doDoc.items.reduce((acc: number, curr: any) => acc + (curr.qty || 0), 0);
        }
        const materialsStr = (doDoc.items && Array.isArray(doDoc.items) && doDoc.items.map((it: any) => `${it.qty}x ${it.description || 'RAW STEEL PARTS'}`).join(', ')) || 'INBOUND BULK SEGMENT';
        
        let totalKg = 0;
        if (doDoc.items && Array.isArray(doDoc.items)) {
          totalKg = doDoc.items.reduce((acc: number, curr: any) => {
            if (curr.weightTons) {
              return acc + (curr.weightTons * 1000);
            }
            return acc + ((curr.qty || 0) * 0.14);
          }, 0);
        }
        if (totalKg === 0) totalKg = totalQty * 0.14;
        totalKg = Math.round(totalKg) || 1200;

        records.push({
          date: doDoc.date || '2026-06-01',
          docRef: doDoc.doNo,
          type: doDoc.type === 'coating' ? 'INBOUND COATING RECEIPT' : 'INBOUND MATERIALS DO',
          direction: 'INCOMING',
          client: doDoc.supplierName || 'ZAMIL SUPPLIER',
          materials: materialsStr,
          totalQty: totalQty,
          cartons: Math.ceil(totalQty / 120) || 12,
          grossWeight: totalKg
        });
      });

      return records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [packingRegisters, invoicesList, inboundMaterialsLedger]);

    // Financial accounts logging
    const financialRecords = useMemo(() => {
      const records: Array<{
        date: string;
        docRef: string;
        client: string;
        amount: number;
        type: 'CHARGE' | 'PAYMENT';
        mode: string;
      }> = [];

      invoicesList.forEach((inv: any) => {
        let itemSum = 0;
        if (inv.items && Array.isArray(inv.items)) {
          inv.items.forEach((it: any) => {
             itemSum += (it.qty * (it.unitPriceWOVAT || 0));
          });
        }
        const val = itemSum - (inv.discountAmt || 0) + (inv.freightAmt || 0);
        records.push({
          date: inv.dated,
          docRef: inv.invoiceNo,
          client: inv.buyerName,
          amount: val * 1.05, // tax default
          type: 'CHARGE',
          mode: 'INVOICED ACCOUNTS'
        });
      });

      receiptRegisters.forEach(rc => {
        records.push({
          date: rc.dated,
          docRef: rc.voucherNo,
          client: rc.clientName,
          amount: rc.amountReceived,
          type: 'PAYMENT',
          mode: rc.paymentMode
        });
      });

      return records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [invoicesList, receiptRegisters]);

    const filteredDispatches = dispatchRecords.filter(it => 
      it.docRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.materials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.direction.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFinancials = financialRecords.filter(it => 
      it.docRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredManualLogs = manualLogs.filter(it => 
      it.logNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.componentDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.operator.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dynamic Save as PDF support for Record Sheets
    const [showSheetPdfModal, setShowSheetPdfModal] = useState(false);
    const [isIframe, setIsIframe] = useState(false);

    useEffect(() => {
      if (typeof window !== 'undefined' && window.self !== window.top) {
        setIsIframe(true);
      }
    }, []);
    
    const triggerRecordPdfPrint = () => {
      setShowSheetPdfModal(true);
    };

    const confirmRecordPdfPrint = () => {
      setShowSheetPdfModal(false);
      setTimeout(() => {
        if (subTab === 'dispatch') {
          const outboundWeight = dispatchRecords.filter(it => it.direction === 'OUTGOING').reduce((acc, c) => acc + c.grossWeight, 0);
          const inboundWeight = dispatchRecords.filter(it => it.direction === 'INCOMING').reduce((acc, c) => acc + c.grossWeight, 0);
          
          const htmlContent = `
            <html>
              <head>
                <title>Unified Logistics Registry - ${activeCompany.name}</title>
                <style>
                  @page { size: landscape; margin: 0 !important; /* Suppress browser header/footer (including https URL) */ }
                  body { font-family: monospace; padding: 0.8cm !important; font-size: 10px; color: black; text-transform: uppercase; line-height: 1.3; margin: 0 !important; }
                  .title { font-size: 16px; font-weight: bold; text-align: center; }
                  .subtitle { text-align: center; font-size: 9px; color: #555; }
                  .kpi-row { display: grid; grid-template-columns: 1fr 1.5fr 1fr; border: 1.5px solid black; padding: 6px; margin: 8px 0; background: #f8fafc; font-weight: bold; }
                  .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                  .info-table th, .info-table td { border: 1px solid black; padding: 5px; text-align: left; word-wrap: break-word; }
                  .info-table th { background-color: #eee; font-size: 8px; }
                  .badge-incoming { background-color: #fef3c7; color: #c2410c; padding: 2px 4px; border: 1px solid #c2410c; font-weight: bold; }
                  .badge-outgoing { background-color: #e0f2fe; color: #0369a1; padding: 2px 4px; border: 1px solid #0369a1; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="title" style="font-weight: bold;">${activeCompany.name.toUpperCase()}</div>
                <div class="subtitle">${activeCompany.address.toUpperCase()} | TEL: ${activeCompany.phone || '—'}</div>
                <hr style="border: 1px solid black; margin-bottom: 10px;"/>
                
                <div style="font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 10px; letter-spacing: 0.5px;">
                  UNIFIED LOGISTICS REGISTRY (DISPATCH & RECEIPTS JOURNAL)
                </div>

                <div class="kpi-row">
                  <div>TOTAL RECORDS AUDITED: ${filteredDispatches.length} ACTIVE</div>
                  <div style="text-align: center;">TOTAL SHIPPING WEIGHTS: OUTGOING ${outboundWeight.toLocaleString()} KG | INCOMING ${inboundWeight.toLocaleString()} KG</div>
                  <div style="text-align: right; color: #f37021;">VERIFICATION HARMONIZED</div>
                </div>

                <table class="info-table">
                  <thead>
                    <tr>
                      <th style="width: 10%; text-align: center;">DATE</th>
                      <th style="width: 14%;">DOC REF & TYPE</th>
                      <th style="width: 11%; text-align: center;">DIRECTION</th>
                      <th style="width: 25%;">TRADE PARTNER (BUYER/SUPPLIER)</th>
                      <th style="width: 30%;">SPECIFICATIONS & CARGO DETAILS</th>
                      <th style="width: 10%; text-align: right;">QUANTITY / WT KG</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredDispatches.map(line => `
                      <tr style="height: 38px;">
                        <td style="text-align: center;">${line.date}</td>
                        <td><strong>${line.docRef}</strong><br/><span style="font-size:7px; color:#555;">${line.type}</span></td>
                        <td style="text-align: center;">
                          <span class="${line.direction === 'INCOMING' ? 'badge-incoming' : 'badge-outgoing'}">${line.direction}</span>
                        </td>
                        <td><strong>${line.client}</strong></td>
                        <td style="font-size: 8.5px;">${line.materials}</td>
                        <td style="text-align: right;">
                          <strong>${line.grossWeight.toLocaleString()} KG</strong><br/>
                          <span style="font-size:7px; color:#555;">${line.cartons} PKGS</span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 9px;">
                  <div style="border-top: 1px solid black; padding-top: 5px;">PREPARED BY OPERATOR (LOGISTICS DEPT)</div>
                  <div style="border-top: 1px solid black; padding-top: 5px;">MFI EXECUTIVE COMPLIANCE AUDITOR SIGN</div>
                </div>
              </body>
            </html>
          `;
          printHtml(htmlContent, `Unified Logistics Registry - ${activeCompany.name}`);
        } else if (subTab === 'financial') {
          const totalRev = financialRecords.filter(it => it.type === 'CHARGE').reduce((acc, c) => acc + c.amount, 0);
          const htmlContent = `
            <html>
              <head>
                <title>Revenue Audit System - ${activeCompany.name}</title>
                <style>
                  @page { size: landscape; margin: 0 !important; /* Suppress browser header/footer (including https URL) */ }
                  body { font-family: monospace; padding: 0.8cm !important; font-size: 10px; color: black; text-transform: uppercase; line-height: 1.3; margin: 0 !important; }
                  .title { font-size: 16px; font-weight: bold; text-align: center; }
                  .subtitle { text-align: center; font-size: 9px; color: #555; }
                  .kpi-row { display: grid; grid-template-columns: 1fr 1.5fr; border: 1.5px solid black; padding: 6px; margin: 8px 0; background: #f8fafc; font-weight: bold; }
                  .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                  .info-table th, .info-table td { border: 1px solid black; padding: 5px; text-align: left; word-wrap: break-word; }
                  .info-table th { background-color: #eee; font-size: 8px; }
                  .badge-charge { background-color: #fee2e2; color: #991b1b; padding: 2px 4px; border: 1px solid #991b1b; font-weight: bold; }
                  .badge-payment { background-color: #d1fae5; color: #065f46; padding: 2px 4px; border: 1px solid #065f46; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="title" style="font-weight: bold;">MARINE FASTENERS INDUSTRIES LLC</div>
                <div class="subtitle">INDUSTRIAL AREA, AJMAN, UAE | TEL: +971-6-749211 | ISO 9001:2015 REGISTERED</div>
                <hr style="border: 1px solid black; margin-bottom: 10px;"/>
                
                <div style="font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 10px; letter-spacing: 0.5px;">
                  FINANCIAL ACCOUNTS REVENUE SYSTEM & JOURNAL
                </div>

                <div class="kpi-row">
                  <div>TOTAL TX RECORDS: ${filteredFinancials.length} TRANSACTIONS</div>
                  <div style="text-align: right;">TOTAL REVENUE: AED ${totalRev.toLocaleString('en-US', { maximumFractionDigits: 1 })} (TAX INCLUSIVE)</div>
                </div>

                <table class="info-table">
                  <thead>
                    <tr>
                      <th style="width: 12%; text-align: center;">DATE</th>
                      <th style="width: 18%;">TX REF</th>
                      <th style="width: 32%;">CLIENT / PAYER ACCOUNT</th>
                      <th style="width: 18%; text-align: center;">TX CATEGORY</th>
                      <th style="width: 20%; text-align: right;">VAL IN AED (INCL VAT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredFinancials.map(line => `
                      <tr style="height: 35px;">
                        <td style="text-align: center;">${line.date}</td>
                        <td><strong>${line.docRef}</strong></td>
                        <td><strong>${line.client}</strong></td>
                        <td style="text-align: center;">
                          <span class="${line.type === 'CHARGE' ? 'badge-charge' : 'badge-payment'}">
                            ${line.type === 'CHARGE' ? '▲ DEBT CHARGE' : '▼ PYMT RECEIVED'}
                          </span>
                        </td>
                        <td style="text-align: right;"><strong>AED ${line.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 9px;">
                  <div style="border-top: 1px solid black; padding-top: 5px;">PREPARED BY FINANCE EXECUTIVE</div>
                  <div style="border-top: 1px solid black; padding-top: 5px;">CHIEF AUDITOR AUDIT COMPLIANCE SIGN</div>
                </div>
              </body>
            </html>
          `;
          printHtml(htmlContent, `Revenue Audit System - ${activeCompany.name}`);
        } else {
          const passCount = manualLogs.filter(it => it.status === 'PASSED').length;
          const htmlContent = `
            <html>
              <head>
                <title>Ajman Stock Log Sheet - ${activeCompany.name}</title>
                <style>
                  @page { size: landscape; margin: 0 !important; /* Suppress browser header/footer (including https URL) */ }
                  body { font-family: monospace; padding: 0.8cm !important; font-size: 10px; color: black; text-transform: uppercase; line-height: 1.3; margin: 0 !important; }
                  .title { font-size: 16px; font-weight: bold; text-align: center; }
                  .subtitle { text-align: center; font-size: 9px; color: #555; }
                  .kpi-row { display: grid; grid-template-columns: 1fr 1fr; border: 1.5px solid black; padding: 6px; margin: 8px 0; background: #f8fafc; font-weight: bold; }
                  .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                  .info-table th, .info-table td { border: 1px solid black; padding: 5px; text-align: left; word-wrap: break-word; }
                  .info-table th { background-color: #eee; font-size: 8px; }
                  .status-passed { color: #065f46; font-weight: bold; }
                  .status-failed { color: #991b1b; font-weight: bold; }
                  .status-pending { color: #92400e; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="title" style="font-weight: bold;">${activeCompany.name.toUpperCase()}</div>
                <div class="subtitle">${activeCompany.address.toUpperCase()} | TEL: ${activeCompany.phone || '—'}</div>
                <hr style="border: 1px solid black; margin-bottom: 10px;"/>
                
                <div style="font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 10px; letter-spacing: 0.5px;">
                  AJMAN STOCK AUDIT & WAREHOUSE LOG REGISTRY
                </div>

                <div class="kpi-row">
                  <div>TOTAL RECORDS: ${filteredManualLogs.length} LOGS ACTIVE</div>
                  <div style="text-align: right;">COMPLIANCE RATIO: ${passCount} PASS / ${manualLogs.length} AUDITS</div>
                </div>

                <table class="info-table">
                  <thead>
                    <tr>
                      <th style="width: 10%; text-align: center;">LOG NO</th>
                      <th style="width: 10%; text-align: center;">DATE</th>
                      <th style="width: 32%;">COMPONENT DESCRIPTION & SPECTRAL SIZES</th>
                      <th style="width: 10%; text-align: center;">BIN LOC</th>
                      <th style="width: 12%; text-align: right;">STOCK DELTA</th>
                      <th style="width: 10%; text-align: center;">QA COMPLIANCE</th>
                      <th style="width: 16%;">AUDITOR OPERATOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredManualLogs.map(it => `
                      <tr style="height: 38px;">
                        <td style="text-align: center; font-weight: bold; color: #f37021;">${it.logNo}</td>
                        <td style="text-align: center;">${it.dated}</td>
                        <td><strong>${it.componentDesc}</strong><br/><span style="font-size: 7.5px; text-transform: uppercase; color: #555;">${it.notes}</span></td>
                        <td style="text-align: center; font-weight: bold;">${it.binLocation}</td>
                        <td style="text-align: right; font-weight: bold;">${it.qtyChange}</td>
                        <td style="text-align: center;">
                          <span class="${it.status === 'PASSED' ? 'status-passed' : it.status === 'FAILED' ? 'status-failed' : 'status-pending'}">${it.status}</span>
                        </td>
                        <td>${it.operator}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 9px;">
                  <div style="border-top: 1px solid black; padding-top: 5px;">PREPARED BY DEPOT SUPERVISOR</div>
                  <div style="border-top: 1px solid black; padding-top: 5px;">MFI CHIEF METALLURGIST COMPLIANCE OK</div>
                </div>
              </body>
            </html>
          `;
          printHtml(htmlContent, `Stock Log Sheet - ${activeCompany.name}`);
        }
      }, 300);
    };

    return (
      <div className="space-y-6 font-mono text-[10px]">
        {/* Save as PDF Guidelines Modal */}
        {showSheetPdfModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none font-mono no-print">
            <div className="bg-white border-[#f37021] border-t-8 rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 text-left">
              <div className="border-b pb-2 flex justify-between items-center">
                <span className="text-xs font-bold text-[#f37021] uppercase tracking-wider">
                  📄 Save Record Sheet as PDF
                </span>
                <button 
                  onClick={() => setShowSheetPdfModal(false)}
                  className="text-slate-450 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3.5 text-xs font-sans">

                <p className="font-semibold leading-relaxed text-slate-750">
                  Exporting the <strong className="text-slate-900 border-b border-slate-300 font-mono text-[11px]">{subTab.toUpperCase()} Record Sheet</strong> log database dynamically to high-fidelity PDF sheet.
                </p>
                
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded space-y-2 leading-relaxed font-mono text-[11px]">
                  <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-widest block font-sans">
                    ⚠️ Printing Instructions:
                  </span>
                  <ul className="list-decimal pl-4 space-y-1.5 text-slate-705 font-medium">
                    <li>Ensure Destination is set to <strong>Save as PDF</strong> in browser settings.</li>
                    <li>Verify <strong>Background graphics</strong> is checked under More settings.</li>
                    <li>Landscape orientation is recommended for wide layout tables.</li>
                    <li>Untick Standard headers and footers for a pixel-perfect page look.</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs font-bold uppercase font-mono">
                <button
                  type="button"
                  onClick={() => setShowSheetPdfModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRecordPdfPrint}
                  className="py-2.5 bg-[#f37021] hover:bg-[#e05b10] text-white transition-colors cursor-pointer border-none font-bold font-mono text-xs uppercase"
                >
                  Save Vector PDF Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel - Hide in Print */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs no-print flex flex-col md:flex-row justify-between items-center gap-4 select-none">
          <div className="flex flex-wrap gap-2">
            {(['dispatch', 'financial', 'manual'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`px-3 py-1.5 font-bold uppercase text-[10px] border flex items-center gap-1.5 cursor-pointer rounded-sm transition-all ${
                  subTab === tab 
                    ? 'bg-[#f37021] text-white border-[#f37021] font-bold' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200'
                }`}
              >
                {tab === 'dispatch' && <ClipboardList className="w-3.5 h-3.5" />}
                {tab === 'financial' && <DollarSign className="w-3.5 h-3.5" />}
                {tab === 'manual' && <RotateCcw className="w-3.5 h-3.5" />}
                {tab === 'dispatch' && "Unified Logistics Registry"}
                {tab === 'financial' && "Accounts Revenue Sheet"}
                {tab === 'manual' && "Manual Warehouse Log"}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="relative w-full md:w-52 leading-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 p-1.5 border font-mono text-xs focus:ring-[#f37021] focus:border-[#f37021]"
              />
            </div>

            <button
              onClick={triggerRecordPdfPrint}
              className="px-4 py-1.5 bg-slate-900 text-white font-semibold uppercase text-[10px] flex items-center gap-1.5 cursor-pointer shadow hover:bg-slate-800 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" /> Save as PDF
            </button>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Add Custom Manual log (Only shows up for manual log tab) */}
          {subTab === 'manual' && (
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-4 no-print text-[11px] font-sans">
              <span className="text-[10px] text-[#f37021] font-semibold uppercase tracking-widest block font-mono">
                ✏️ Create custom audit row
              </span>
              
              <form onSubmit={handleCreateLogEntry} className="space-y-3 font-sans text-xs">
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold uppercase block leading-tight">Log reference</label>
                    <input 
                      type="text" 
                      value={newLogNo}
                      onChange={(e) => setNewLogNo(e.target.value)}
                      className="w-full p-1.5 border font-mono text-xs uppercase text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold uppercase block leading-tight">Dated</label>
                    <input 
                      type="date" 
                      value={newLogDate}
                      onChange={(e) => setNewLogDate(e.target.value)}
                      className="w-full p-1.5 border font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-0.5 font-mono text-[10px]">
                  <label className="text-[8px] text-slate-405 font-bold uppercase block leading-tight">Component spec / Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ASTM A325 HEX BOLT M20 X 60"
                    value={newLogDesc}
                    onChange={(e) => setNewLogDesc(e.target.value)}
                    className="w-full p-1.5 border font-mono text-xs uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold uppercase block leading-tight">Bin / Warehouse Area</label>
                    <input 
                      type="text" 
                      value={newLogBin} 
                      onChange={(e) => setNewLogBin(e.target.value)}
                      className="w-full p-1.5 border font-mono text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold uppercase block leading-tight">Qty delta</label>
                    <input 
                      type="text" 
                      value={newLogQty} 
                      onChange={(e) => setNewLogQty(e.target.value)}
                      className="w-full p-1.5 border font-mono text-xs text-center font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold uppercase block leading-tight">QA Compliance</label>
                    <select 
                      value={newLogStatus} 
                      onChange={(e) => setNewLogStatus(e.target.value as any)}
                      className="w-full p-1 border font-mono text-xs text-[10px]"
                    >
                      <option value="PASSED">PASS — ACCREDITED</option>
                      <option value="FAILED">REJECT — DEVIATIVE</option>
                      <option value="PENDING">PENDING — PORT LAB</option>
                      <option value="DISPATCHED">DISPATCHED CARGO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 font-semibold uppercase block leading-tight">Audited by</label>
                    <input 
                      type="text" 
                      value={newLogOperator} 
                      onChange={(e) => setNewLogOperator(e.target.value)}
                      className="w-full p-1 border font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="font-mono text-[11px]">
                  <label className="text-[8px] text-slate-400 font-semibold uppercase block leading-tight">Action log notes</label>
                  <textarea 
                    rows={2} 
                    value={newLogNotes} 
                    onChange={(e) => setNewLogNotes(e.target.value)}
                    className="w-full p-1.5 border font-mono text-xs leading-tight uppercase"
                    placeholder="ENTER PROCESS DETAILS..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono uppercase text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer rounded-none border-none"
                >
                  <Plus className="w-4 h-4 text-amber-500" /> Insert Log Record
                </button>
              </form>
            </div>
          )}

          {/* Right panel: Printable high-fidelity database record Sheet */}
          <div className={`${subTab === 'manual' ? 'lg:col-span-8' : 'lg:col-span-12'} w-full overflow-x-auto`}>
            <div className="bg-white border border-slate-300 p-6 md:p-8 text-slate-950 shadow-md min-h-[500px] print:border-none print:shadow-none print:p-0 select-none min-w-[760px]">
              
              {/* Header section identical branding */}
              <div className="border-t-4 border-[#f37021] pt-3 text-xs flex justify-between items-start font-mono uppercase leading-tight">
                <div>
                  <span className="text-[8px] text-[#f37021] font-bold tracking-widest block">Official Register Database</span>
                  <h2 className="text-sm font-bold text-slate-900">{activeCompany.name}</h2>
                  <p className="text-[9.5px] mt-0.5 text-slate-500 font-bold">SYSTEM GENERATED PHYSICAL RECORD SHEET</p>
                  <p className="text-[9px] mt-0.5">TRN NO: {activeCompany.trn || '—'}</p>
                </div>

                <div className="text-right border border-slate-400 p-2 min-w-[215px] bg-slate-50">
                  <h3 className="text-[11px] font-bold text-slate-900 border-b pb-1 mb-1 tracking-wider font-mono">
                    {subTab === 'dispatch' && 'UNIFIED LOGISTICS REGISTRY'}
                    {subTab === 'financial' && 'REVENUE AUDIT SYSTEM'}
                    {subTab === 'manual' && 'AJMAN STOCK LOG SHEET'}
                  </h3>
                  <p className="text-[9px] font-mono leading-none">Log Dated: {new Date().toISOString().substring(0, 10)}</p>
                  <p className="text-[8px] font-mono font-bold text-amber-600 mt-1 uppercase">Ajman Dubai Gulf Central Auditor</p>
                </div>
              </div>

              {/* Dynamic KPI summary row in the record sheet itself */}
              <div className="grid grid-cols-3 gap-2 border border-slate-400 bg-slate-100 p-2 text-[10.5px] font-bold mt-4 uppercase font-mono select-none">
                <div>
                  <span className="text-[8px] text-slate-500 block">Total Transactions Audited:</span>
                  <span className="text-[12px] text-slate-900">
                    {subTab === 'dispatch' && filteredDispatches.length}
                    {subTab === 'financial' && filteredFinancials.length}
                    {subTab === 'manual' && filteredManualLogs.length} Records
                  </span>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  <span className="text-[8px] text-slate-500 block">
                    {subTab === 'dispatch' && 'Total Shipping Weights:'}
                    {subTab === 'financial' && 'Accounts Total Revenue:'}
                    {subTab === 'manual' && 'Passed QA Inspections:'}
                  </span>
                  <span className="text-[11px] text-emerald-800 font-mono font-bold block">
                    {subTab === 'dispatch' ? (
                      <span className="flex flex-col xl:flex-row xl:gap-2 leading-none text-[10px]">
                        <span className="text-blue-800 font-bold block">▲ OUTGOING: {dispatchRecords.filter(it => it.direction === 'OUTGOING').reduce((acc, c) => acc + c.grossWeight, 0).toLocaleString()} KG</span>
                        <span className="text-orange-700 font-bold block">▼ INCOMING: {dispatchRecords.filter(it => it.direction === 'INCOMING').reduce((acc, c) => acc + c.grossWeight, 0).toLocaleString()} KG</span>
                      </span>
                    ) : subTab === 'financial' ? (
                      `AED ${financialRecords.filter(it => it.type === 'CHARGE').reduce((acc, c) => acc + c.amount, 0).toLocaleString('en-US', { maximumFractionDigits: 1 })}`
                    ) : (
                      `${manualLogs.filter(it => it.status === 'PASSED').length} PASS / ${manualLogs.length} RECS`
                    )}
                  </span>
                </div>
                <div className="border-l border-slate-300 pl-3 leading-tight">
                  <span className="text-[8px] text-[#f37021] block">Verification Status:</span>
                  <span className="text-[11.5px] font-bold text-[#f37021] block">
                    {subTab === 'dispatch' && 'LOGISTICS UNIFIED ACTIVE'}
                    {subTab === 'financial' && 'REVENUE UNLOCKED'}
                    {subTab === 'manual' && 'Routine Logs Live'}
                  </span>
                </div>
              </div>

              {/* RENDER DYNAMIC TABLES BASED ON CHOSEN RECORD SUBTAB */}
              {subTab === 'dispatch' && (
                <table className="w-full mt-4 border border-slate-400 border-collapse font-sans text-[11px] uppercase table-fixed">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-semibold tracking-wide text-left text-[9px] divide-x divide-slate-400 h-8 font-mono">
                      <th className="w-[11%] p-1 text-center">DATE</th>
                      <th className="w-[15%] p-1 px-2 font-mono">DOC REF / DETAILS</th>
                      <th className="w-[11%] p-1 text-center font-mono">DIRECTION</th>
                      <th className="w-[23%] p-1 px-2">BUYER / SUPPLIER CLASSIFICATION</th>
                      <th className="w-[30%] p-1 px-2">CARGO DESCRIPTION SPEC</th>
                      <th className="w-[10%] p-1 text-right pr-2">WEIGHT KG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-350 font-sans align-top leading-normal text-[10.5px]">
                    {filteredDispatches.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 divide-x divide-slate-350 min-h-12 h-12">
                        <td className="p-2 text-center font-mono text-slate-500">{line.date}</td>
                        <td className="p-2 font-mono font-normal">
                          <strong className="text-slate-900 text-[11px] block leading-none">{line.docRef}</strong>
                          <span className="text-[7.5px] text-slate-400 block mt-1 font-sans font-normal truncate">{line.type}</span>
                        </td>
                        <td className="p-2 text-center font-mono text-[9px] font-bold align-middle">
                          {line.direction === 'INCOMING' ? (
                            <span className="inline-block px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-sm leading-none font-bold text-[8px]">
                              ▼ INCOMING
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-sm leading-none font-bold text-[8px]">
                              ▲ OUTGOING
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-bold text-slate-850 text-[10px] uppercase truncate">{line.client}</td>
                        <td className="p-2 text-slate-600 font-sans text-[9px] break-words uppercase leading-tight" title={line.materials}>
                          {line.materials}
                        </td>
                        <td className="p-2 text-right font-mono pr-2">
                          <strong className="text-slate-950 font-semibold text-[11px] block">{line.grossWeight.toLocaleString()} kg</strong>
                          <span className="text-[7.5px] text-slate-450 block font-sans">{line.cartons} pkgs</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {subTab === 'financial' && (
                <table className="w-full mt-4 border border-slate-400 border-collapse font-sans text-[11px] uppercase table-fixed">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-400 text-slate-905 font-semibold tracking-wide text-left text-[9px] divide-x divide-slate-400 h-8 font-mono">
                      <th className="w-[12%] p-1 text-center font-mono">DATE</th>
                      <th className="w-[15%] p-1 px-2 font-mono">TX REF</th>
                      <th className="w-[33%] p-1 px-2 font-mono">CLIENT / PAYER ACCOUNT</th>
                      <th className="w-[18%] p-1 px-2 font-mono">TX CATEGORY</th>
                      <th className="w-[22%] p-1 text-right pr-2 font-mono font-bold">VAL IN AED (INCL VAT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-350 font-sans text-[10.5px]">
                    {filteredFinancials.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 divide-x divide-slate-350 h-10">
                        <td className="p-2 text-center font-mono text-slate-655">{line.date}</td>
                        <td className="p-2 font-mono font-bold text-slate-900">{line.docRef}</td>
                        <td className="p-2 font-semibold text-indigo-950 truncate">{line.client}</td>
                        <td className="p-2 font-mono text-[9px]">
                          {line.type === 'CHARGE' ? (
                            <span className="text-slate-900 font-bold">▲ DEBT CHARG</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.5 rounded-sm">▼ PAYM RECEIVED</span>
                          )}
                        </td>
                        <td className="p-2 text-right font-mono font-bold pr-2">
                          <span className={line.type === 'CHARGE' ? 'text-slate-800' : 'text-emerald-700 font-bold'}>
                            AED {line.amount.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {subTab === 'manual' && (
                <table className="w-full mt-4 border border-slate-400 border-collapse font-sans text-[11px] uppercase table-fixed">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-400 text-slate-900 font-semibold tracking-wide text-left text-[9px] divide-x divide-slate-400 h-8 font-mono">
                      <th className="w-[12%] p-1 text-center">LOG NO</th>
                      <th className="w-[12%] p-1 text-center">DATE</th>
                      <th className="w-[23%] p-1 px-2">COMPONENT DESCRIPTION SIZES</th>
                      <th className="w-[12%] p-1 text-center">BIN LOC</th>
                      <th className="w-[11%] p-1 text-right">STOCK QTY</th>
                      <th className="w-[12%] p-1 text-center">QA STATUS</th>
                      <th className="w-[18%] p-1 px-2">AUDITOR OPERATOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-350 font-sans text-[10.5px]">
                    {filteredManualLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-12 text-slate-400 italic">No custom logs written yet. Draft matching fasteners log on the left.</td>
                      </tr>
                    ) : (
                      filteredManualLogs.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50 divide-x divide-slate-350 align-top group min-h-16 h-16">
                          <td className="p-2 text-center font-mono font-bold text-[#f37021] text-[11px]">{it.logNo}</td>
                          <td className="p-2 text-center font-mono text-slate-500">{it.dated}</td>
                          <td className="p-2 font-sans">
                            <span className="font-semibold text-slate-950 block text-[10.5px] tracking-tight">{it.componentDesc}</span>
                            <span className="text-[9px] text-slate-500 font-mono font-bold block mt-0.5 leading-tight">{it.notes}</span>
                          </td>
                          <td className="p-2 text-center font-mono font-semibold text-slate-700 text-[10px]">{it.binLocation}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-800">{it.qtyChange}</td>
                          <td className="p-2 text-center font-mono text-[9px] font-semibold">
                            <span className={`px-1 rounded-sm leading-none inline-block border py-0.5 ${
                              it.status === 'PASSED' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                              it.status === 'FAILED' ? 'bg-red-50 border-red-200 text-red-800' :
                              it.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                              'bg-indigo-50 border-indigo-200 text-indigo-800'
                            }`}>
                              {it.status}
                            </span>
                          </td>
                          <td className="p-2 font-mono text-[9px] leading-tight text-slate-700 flex justify-between items-center h-full">
                            <span className="truncate max-w-[100px]">{it.operator}</span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteLogEntry(it.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-55 hover:text-red-700 rounded no-print transition-colors ml-1 cursor-pointer border-none"
                              title="Delete log line"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Professional double borders double audit signature table */}
              <div className="grid grid-cols-2 text-center text-xs divide-x divide-slate-400 border border-slate-400 h-24 mt-6 font-mono select-none">
                <div className="p-2.5 flex flex-col justify-between">
                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Verification Entry Auditor Sign</span>
                  <span className="text-[10px] font-bold text-[#f37021] border-t border-dashed pt-1 leading-none uppercase">Logistics Operations Manager</span>
                </div>
                <div className="p-2.5 bg-slate-50 flex flex-col justify-between h-full">
                  <span className="text-[8px] text-slate-405 block uppercase font-bold">Consolidated Executive Stamp</span>
                  <span className="text-[10px] font-bold text-slate-800 border-t border-dashed pt-1 leading-none uppercase animate-pulse">Marine Fasteners Audit Lock</span>
                </div>
              </div>

              <div className="mt-6 text-[8.5px] font-mono text-slate-400 text-center uppercase tracking-wider flex justify-between border-t pt-2 border-slate-100 leading-none select-none">
                <span>Marine Fasteners ERP Consolidated Database registers</span>
                <span>Security Verified 2026 — Dual Gulf Compliant</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  };

  // --- TAB 7: Purchase Request Records Component ---
  const PurchaseRequestRecordsComponent = () => {
    const [search, setSearch] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('ALL');

    // Load store requests
    const [storeRequests] = useState<any[]>(() => {
      const saved = localStorage.getItem('MF_STORE_PURCHASE_REQUESTS');
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
      return [
        {
          id: 'REQ-2026-601',
          sourceWoNo: 'WO-26-102',
          customerName: 'Hamriyah Shipbuilders',
          requestedDate: '2026-05-18',
          itemDescription: 'HEAVY HEX BOLTS SS316 3/4" X 5" GRADED',
          qty: 1200,
          unit: 'Pcs.',
          priority: 'High',
          requestedBy: 'Supervisor Desk',
          status: 'PO Created',
          officePoNo: 'PO-2026-081',
          notes: 'Required due to custom thread requirement shortfall'
        },
        {
          id: 'REQ-2026-602',
          sourceWoNo: 'WO-26-103',
          customerName: 'Abu Dhabi Piping Ltd',
          requestedDate: '2026-05-27',
          itemDescription: 'SPRING WASHERS DIN 127B A4 M16',
          qty: 8000,
          unit: 'Pcs.',
          priority: 'Medium',
          requestedBy: 'Store Floor Lead',
          status: 'Pending',
          notes: 'Low inventory alert on packing lines'
        }
      ];
    });

    const filteredRequests = useMemo(() => {
      return storeRequests.filter(req => {
        const q = search.toLowerCase();
        const matchesSearch = !q || 
          req.id.toLowerCase().includes(q) || 
          req.sourceWoNo.toLowerCase().includes(q) || 
          req.itemDescription.toLowerCase().includes(q) || 
          req.customerName.toLowerCase().includes(q);
        const matchesPriority = filterPriority === 'ALL' || req.priority === filterPriority;
        return matchesSearch && matchesPriority;
      });
    }, [storeRequests, search, filterPriority]);

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm font-mono text-[11px] space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans text-sm font-bold uppercase text-slate-900">Purchase Request Audit Trail</h3>
            <p className="text-[10px] text-slate-500">Log of all raw material, dye mold, and shop requisitions sent from Ajman storage factory floor.</p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold border rounded uppercase">
            Total PR Logs: {storeRequests.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            placeholder="Search by ID, WO Number, Spec..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-350 p-2 text-[10.5px] uppercase placeholder:lowercase focus:bg-white outline-none rounded font-bold"
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-350 p-2 text-[10.5px] font-bold uppercase rounded cursor-pointer"
          >
            <option value="ALL">Priority: All</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white font-bold uppercase">
                <th className="p-2.5 text-[10px]">PR Request ID</th>
                <th className="p-2.5 text-[10px]">Source WO</th>
                <th className="p-2.5 text-[10px]">Client / Project</th>
                <th className="p-2.5 text-[10px]">Item Description</th>
                <th className="p-2.5 text-center text-[10px]">Req Qty</th>
                <th className="p-2.5 text-center text-[10px]">Priority</th>
                <th className="p-2.5 text-[10px] text-center">Status</th>
                <th className="p-2.5 text-[10px]">Active Ref PO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic bg-slate-50">
                    No matching purchase request records on archive yet.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-bold text-[#f37021]">{req.id}</td>
                    <td className="p-2.5 font-bold text-slate-900">{req.sourceWoNo}</td>
                    <td className="p-2.5 text-slate-600 max-w-[140px] truncate">{req.customerName}</td>
                    <td className="p-2.5 text-slate-800 uppercase font-bold">{req.itemDescription}</td>
                    <td className="p-2.5 text-center text-slate-700 font-bold">{req.qty.toLocaleString()} {req.unit}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        req.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                        req.priority === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        req.status === 'PO Created' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'Declined' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans font-bold text-[10px] text-slate-600 select-all">{req.officePoNo || 'WAITING'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  // --- TAB 7.5: Invoice Planner Component ---
  const InvoicePlannerComponent = () => {
    return (
      <InvoicePlannerComp 
        salesInvoices={salesInvoices}
        setSalesInvoices={setSalesInvoices}
        clientDatabase={clientDatabase}
        triggerToast={triggerToast}
      />
    );
  };

  const _UnusedInvoicePlannerComponent = () => {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(salesInvoices[0] || {
      id: 'inv-new',
      invoiceNo: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
      dated: new Date().toISOString().substring(0, 10),
      customerName: 'ZAMIL HEAVY INDUSTRIES LTD',
      customerAddress: 'JEDDAH INDUSTRIAL ESTATE, AREA 4, SAUDI ARABIA',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
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
      triggerToast(`Delivery Note ${dn.id} approved! Slashed & pushed as a line item in draft Invoice ${selectedInvoice.invoiceNo}!`);
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
      const htmlContent = generateHighFidelityDocHtml(selectedInvoice, 'TAX INVOICE', undefined, {
        printArea: 'ENTIRE',
        showUnitWeightInPrint: true,
        showTotalWeightInPrint: true,
        printPageSize: 'A4',
      });
      printHtml(htmlContent, `MFI_Sales_Tax_Invoice_${selectedInvoice.invoiceNo}`);
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 select-none font-mono text-[10.5px]">
        {/* Outstanding Work-Orders & Dispatches pending billing */}
        <div className="xl:col-span-12 font-mono space-y-3 no-print">
          <div className="bg-slate-900 text-white rounded-lg p-3.5 border-l-4 border-amber-500 shadow-sm animate-fade-in border border-slate-950">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-[#f37021] uppercase flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  AJMAN LOGISTICS STAGE - PENDING DISPATCHED DELIVERIES DESK
                </span>
                <p className="text-[10.5px] text-slate-350 mt-1 font-sans leading-relaxed">
                  The following signed delivery dispatches have left the warehouse on status <strong className="text-amber-400">PENDING INVOICE</strong>. Click <strong className="text-green-400 font-semibold">APPROVE TO INVOICE</strong> to immediately pull their item parameters into the active Tax Invoice bill draft.
                </p>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto border border-slate-800 rounded">
              <table className="w-full text-left font-mono text-[10px] bg-slate-950 border-collapse divide-y divide-slate-800">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 font-bold uppercase">
                    <th className="p-2 text-[8.5px]">DN ID</th>
                    <th className="p-2 text-[8.5px]">Source WO</th>
                    <th className="p-2 text-[8.5px]">Invoiced Partner</th>
                    <th className="p-2 text-[8.5px]">Dispatched Fastener Spec</th>
                    <th className="p-2 text-center text-[8.5px]">Dispatched Qty</th>
                    <th className="p-2 text-center text-[8.5px]">Action Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {deliveryNotesPending.filter(n => n.status === 'Pending Invoice').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 italic">No remaining unsigned delivery notes awaiting invoicing.</td>
                    </tr>
                  ) : (
                    deliveryNotesPending.filter(n => n.status === 'Pending Invoice').map(dn => (
                      <tr key={dn.id} className="hover:bg-slate-900 transition-colors">
                        <td className="p-2 text-[#f37021] font-bold">{dn.id}</td>
                        <td className="p-2 font-bold text-slate-200">{dn.sourceWoNo}</td>
                        <td className="p-2 text-slate-300 max-w-[120px] truncate">{dn.customerName}</td>
                        <td className="p-2 text-slate-105 font-bold select-all">{dn.itemDescription} ({dn.size})</td>
                        <td className="p-2 text-center text-emerald-400 font-bold">{dn.qty.toLocaleString()} {dn.unit}</td>
                        <td className="p-2 text-center flex gap-1 justify-center">
                          <button
                            onClick={() => handleApproveDeliveryNote(dn)}
                            className="bg-emerald-600 hover:bg-emerald-750 text-white px-2 py-0.5 font-bold uppercase cursor-pointer rounded text-[8.5px]"
                          >
                            Approve to Invoice
                          </button>
                          <button
                            onClick={() => handleDeclineDeliveryNote(dn.id)}
                            className="bg-slate-800 hover:bg-slate-850 text-slate-400 hover:text-rose-500 px-2 py-0.5 font-bold uppercase cursor-pointer rounded text-[8.5px]"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Draft & Custom Forms */}
        <div className="xl:col-span-12 font-mono grid grid-cols-1 md:grid-cols-12 gap-4 no-print text-black">
          <div className="md:col-span-5 space-y-3 bg-white border rounded-lg p-4 shadow-2xs">
            <h3 className="font-semibold uppercase text-slate-900 border-b pb-1.5 text-xs font-mono select-none">Invoice Select & Draft Actions</h3>
            
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Select Previous Invoice for Refinement:</span>
              <select
                className="w-full bg-slate-50 border border-slate-350 p-2 text-xs text-slate-855 focus:bg-white rounded cursor-pointer uppercase font-bold text-black"
                value={selectedInvoice.id}
                onChange={(e) => {
                  const s = salesInvoices.find(it => it.id === e.target.value);
                  if (s) {
                    setSelectedInvoice(s);
                  } else {
                    setSelectedInvoice({
                      id: 'inv-new',
                      invoiceNo: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
                      dated: new Date().toISOString().substring(0, 10),
                      customerName: 'ZAMIL HEAVY INDUSTRIES LTD',
                      customerAddress: 'JEDDAH INDUSTRIAL ESTATE, AREA 4, SAUDI ARABIA',
                      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
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
                <option value="inv-new">Create New Invoice Draft</option>
                {salesInvoices.map((it: any) => (
                  <option key={it.id} value={it.id}>Refine: {it.invoiceNo} — {it.customerName.substring(0, 16)}...</option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t mt-2 flex gap-2">
              <button 
                onClick={handleSaveInvoice}
                className="flex-1 bg-slate-950 hover:bg-slate-850 text-white p-2 text-[10px] font-bold uppercase cursor-pointer rounded text-center transition-colors"
              >
                Save Invoice Contract
              </button>
              <button 
                onClick={() => {
                  setSelectedInvoice({
                    id: 'inv-new',
                    invoiceNo: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
                    dated: new Date().toISOString().substring(0, 10),
                    customerName: 'ZAMIL HEAVY INDUSTRIES LTD',
                    customerAddress: 'JEDDAH INDUSTRIAL ESTATE, AREA 4, SAUDI ARABIA',
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                    paymentTerms: 'NET 30 DAYS',
                    shippingTerms: 'FOB PORT',
                    currency: 'AED',
                    exchangeRate: 1.0,
                    taxRate: 5,
                    items: []
                  });
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 text-[10px] font-bold uppercase cursor-pointer rounded text-center transition-all border border-slate-350 font-mono"
              >
                Clear Form
              </button>
            </div>

            <div className="pt-3 border-t space-y-3 font-sans">
              <h3 className="font-semibold uppercase text-slate-900 border-b pb-1 text-xs select-none font-mono">Header Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">Invoice Number *</span>
                  <input
                    type="text"
                    value={selectedInvoice.invoiceNo}
                    onChange={(e) => setSelectedInvoice({ ...selectedInvoice, invoiceNo: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs uppercase font-mono"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">Invoice Date *</span>
                  <input
                    type="date"
                    value={selectedInvoice.dated}
                    onChange={(e) => setSelectedInvoice({ ...selectedInvoice, dated: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">Customer Account Name</span>
                <select
                  value={selectedInvoice.customerName}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, customerName: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs font-mono"
                >
                  {clientDatabase.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">Billing Destination Address</span>
                <input
                  type="text"
                  value={selectedInvoice.customerAddress}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, customerAddress: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">Due Date</span>
                  <input
                    type="date"
                    value={selectedInvoice.dueDate}
                    onChange={(e) => setSelectedInvoice({ ...selectedInvoice, dueDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs font-mono"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">VAT Tax Rate (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedInvoice.taxRate}
                    onChange={(e) => setSelectedInvoice({ ...selectedInvoice, taxRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs text-right font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">Payment Terms</span>
                  <input
                    type="text"
                    placeholder="e.g. NET 30 DAYS"
                    value={selectedInvoice.paymentTerms}
                    onChange={(e) => setSelectedInvoice({ ...selectedInvoice, paymentTerms: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs uppercase font-mono"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">Shipping Terms</span>
                  <input
                    type="text"
                    placeholder="e.g. FOB PORT"
                    value={selectedInvoice.shippingTerms}
                    onChange={(e) => setSelectedInvoice({ ...selectedInvoice, shippingTerms: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono font-semibold">Base Currency</span>
                  <select
                    value={selectedInvoice.currency}
                    onChange={(e) => {
                      const nextCurr = e.target.value;
                      const nextRate = nextCurr === 'USD' ? 3.67 : 1.0;
                      setSelectedInvoice({ ...selectedInvoice, currency: nextCurr, exchangeRate: nextRate });
                    }}
                    className="w-full bg-slate-50 p-1.5 border border-slate-300 rounded-md outline-none text-xs uppercase font-bold text-slate-900 font-mono"
                  >
                    <option value="AED">AED (Emirati Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">AED Exchange Rate</span>
                  <input
                    type="number"
                    step="0.0001"
                    disabled={selectedInvoice.currency === 'AED'}
                    value={selectedInvoice.exchangeRate}
                    onChange={(e) => setSelectedInvoice({ ...selectedInvoice, exchangeRate: parseFloat(e.target.value) || 1.0 })}
                    className="w-full bg-slate-100 disabled:bg-slate-200 text-slate-800 p-1.5 border border-slate-300 rounded-md outline-none text-xs text-right font-bold font-mono font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white text-slate-900 border p-4 rounded-xl shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-tight text-slate-900 border-b pb-1">Custom Fastener Item Line Entry</h3>
            
            <form onSubmit={handleAddNewInvoiceLine} className="grid grid-cols-12 gap-2 text-slate-850 font-sans text-[10.5px] items-end pb-3">
              <div className="col-span-12 sm:col-span-4 space-y-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Spec Item Description *</span>
                <input
                  type="text"
                  required
                  placeholder="HEX COLD ROLLED CARBON SCREWS..."
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none text-xs bg-slate-50 uppercase font-mono placeholder:normal-case font-bold"
                />
              </div>
              <div className="col-span-6 sm:col-span-2 space-y-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Size Spec</span>
                <input
                  type="text"
                  placeholder="e.g. M16 X 80"
                  value={invItemSize}
                  onChange={(e) => setInvItemSize(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none text-xs bg-slate-50 uppercase font-mono font-bold"
                />
              </div>
              <div className="col-span-3 sm:col-span-2 space-y-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Qty</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={invItemQty}
                  onChange={(e) => setInvItemQty(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none text-xs bg-slate-50 text-right font-mono font-bold"
                />
              </div>
              <div className="col-span-3 sm:col-span-2 space-y-0.5 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Unit</span>
                <input
                  type="text"
                  required
                  value={invItemUnit}
                  onChange={(e) => setInvItemUnit(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none text-xs bg-slate-50 text-center uppercase font-mono font-bold"
                />
              </div>
              <div className="col-span-4 sm:col-span-1 space-y-0.5 text-right">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Rate</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.001"
                  value={invItemPrice}
                  onChange={(e) => setInvItemPrice(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none text-xs bg-slate-50 text-right font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="col-span-8 sm:col-span-1 p-2 bg-[#f37021] hover:bg-orange-600 transition-colors text-white text-xs font-bold uppercase text-center rounded-md cursor-pointer h-[34px] flex items-center justify-center font-mono select-none"
              >
                Add
              </button>
            </form>

            <div className="border-[2px] border-slate-800 border-dashed rounded-lg p-4 bg-slate-50 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-300 pb-2">
                <div>
                  <span className="text-[8px] bg-slate-950 text-white font-semibold uppercase px-1.5 py-0.5 tracking-wider rounded">MFI Live Draft View</span>
                  <h4 className="text-[13px] font-bold uppercase text-slate-900 mt-1 select-all">{selectedInvoice.invoiceNo || 'INV-DRAFT'} — {selectedInvoice.customerName}</h4>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Dated: {selectedInvoice.dated}</span>
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="w-full text-left font-mono text-[9.5px] border-collapse bg-white">
                  <thead className="bg-[#1e293b] text-white font-bold uppercase">
                    <tr>
                      <th className="p-2 text-center text-[8.5px]">S.N</th>
                      <th className="p-2 text-[8.5px]">Description of Fasteners</th>
                      <th className="p-2 text-center text-[8.5px]">Size Spec</th>
                      <th className="p-2 text-center text-[8.5px]">Qty</th>
                      <th className="p-2 text-center text-[8.5px]">Rate</th>
                      <th className="p-2 text-right text-[8.5px]">Total</th>
                      <th className="p-2 text-center text-[8.5px] no-print">Void</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 italic uppercase leading-relaxed font-mono">No items drafted on active tax invoice contract yet. Please approve delivery dispatches above or add custom items.</td>
                      </tr>
                    ) : (
                      selectedInvoice.items.map((it: any) => (
                        <tr key={it.sn} className="hover:bg-slate-50">
                          <td className="p-2 text-center font-bold">{it.sn}</td>
                          <td className="p-2 font-bold uppercase text-slate-900">{it.description}</td>
                          <td className="p-2 text-center font-bold text-rose-500">{it.size || '—'}</td>
                          <td className="p-2 text-center text-slate-800 font-bold">{it.qty.toLocaleString()} {it.unit}</td>
                          <td className="p-2 text-center">{selectedInvoice.currency} {it.unitPrice.toFixed(2)}</td>
                          <td className="p-2 text-right font-bold text-slate-900">
                            {selectedInvoice.currency} {(it.qty * it.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-center no-print">
                            <button
                              onClick={() => deleteInvoiceLine(it.sn)}
                              className="p-1 px-1.5 bg-slate-100 hover:bg-rose-100 text-[#f37021] transition-colors font-semibold rounded text-[8px] cursor-pointer"
                            >
                              ✖
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-right space-y-1 pt-2 border-t font-mono text-slate-800">
                {(() => {
                  const sub = selectedInvoice.items.reduce((sum: number, it: any) => sum + (it.qty * it.unitPrice), 0);
                  const tax = sub * (selectedInvoice.taxRate / 100);
                  const tot = sub + tax;
                  return (
                    <div>
                      <p className="text-[10px] text-slate-500">SUBTOTAL: <strong className="text-slate-900 font-bold">{selectedInvoice.currency} {sub.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
                      <p className="text-[10px] text-slate-500">VAT ({selectedInvoice.taxRate}%): <strong className="text-slate-900 font-bold">{selectedInvoice.currency} {tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
                      <p className="text-[11.5px] font-bold text-slate-900 uppercase">NET VAT INVOICE TOTAL: <strong className="text-emerald-600 text-[13px]">{selectedInvoice.currency} {tot.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
                      {selectedInvoice.currency === 'USD' && (
                        <p className="text-[9px] text-[#f37021] font-bold">AED CONVERSION VALUE: <strong>AED {(tot * 3.67).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 text-center text-[10px] border divide-x divide-slate-300 h-20 font-mono select-none">
                <div className="p-2 flex flex-col justify-between">
                  <span className="text-[8px] text-slate-400 uppercase block font-bold leading-none">Customer Receipt Approval</span>
                  <span className="text-[9px] font-bold text-[#f37021] border-t border-dashed pt-1 leading-none">Accounts Clearance</span>
                </div>
                <div className="p-2 bg-slate-100/50 flex flex-col justify-between h-full">
                  <span className="text-[8px] text-slate-400 uppercase block font-bold leading-none">Authorized Lock stamp</span>
                  <span className="text-[9px] font-bold text-slate-800 border-t border-dashed pt-1 leading-none">MFI Audit Lock</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 no-print">
                <button 
                  onClick={printInvoiceSlip}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase flex items-center gap-2 cursor-pointer transition-colors rounded"
                >
                  <Printer className="w-4 h-4 text-amber-500" /> Export PDF Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- TAB 7.6: Invoice Records Component ---
  const InvoiceRecordsComponent = () => {
    return (
      <InvoiceRecordsComp 
        salesInvoices={salesInvoices}
        setSalesInvoices={setSalesInvoices}
        triggerToast={triggerToast}
      />
    );
  };

  const _UnusedInvoiceRecordsComponent = () => {
    const [search, setSearch] = useState('');
    const [filterCurrency, setFilterCurrency] = useState('ALL');

    const filteredInvoices = useMemo(() => {
      return salesInvoices.filter(inv => {
        const matchesCurr = filterCurrency === 'ALL' || inv.currency === filterCurrency;
        const str = `${inv.invoiceNo} ${inv.customerName} ${inv.paymentTerms} ${inv.shippingTerms}`.toUpperCase();
        const matchesSearch = str.includes(search.toUpperCase());
        return matchesCurr && matchesSearch;
      });
    }, [salesInvoices, filterCurrency, search]);

    const handleVoidInvoice = (id: string, code: string) => {
      if (window.confirm(`Are you sure you want to VOID and permanently wipe Tax Invoice ${code}? This cannot be undone.`)) {
        const revised = salesInvoices.filter(inv => inv.id !== id);
        setSalesInvoices(revised);
        triggerToast(`Tax Invoice ${code} permanently shredded and removed from ledger records.`);
      }
    };

    return (
      <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm text-black font-mono">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans text-sm font-bold uppercase text-slate-900">MFI Certified Sales Tax Invoice Audit Trail</h3>
            <p className="text-[10px] text-slate-500">Federal Tax Authority compliant audit trail of all heavy marine fasteners tax invoices issued from UAE warehouse plants.</p>
          </div>
          <span className="px-2.5 py-1 bg-[#1e293b] text-white font-bold border rounded uppercase text-[10px]">
            Master Invoices Count: {salesInvoices.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 no-print">
          <input 
            type="text" 
            placeholder="Search by invoice number, contractor code, shipping terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-350 p-2 text-[10.5px] uppercase placeholder:lowercase focus:bg-white outline-none rounded font-bold"
          />
          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="bg-slate-50 border border-slate-350 p-2 text-[10.5px] font-bold uppercase rounded cursor-pointer text-black"
          >
            <option value="ALL">Currency: All</option>
            <option value="AED">AED Base Only</option>
            <option value="USD">USD Base Only</option>
          </select>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left border-collapse font-mono text-[10.5px] bg-white">
            <thead>
              <tr className="bg-slate-950 text-white font-bold uppercase">
                <th className="p-2.5 text-[9.5px]">Invoice no</th>
                <th className="p-2.5 text-[9.5px]">Dated</th>
                <th className="p-2.5 text-[9.5px]">Customer Account name</th>
                <th className="p-2.5 text-[9.5px] text-center">Payment Term</th>
                <th className="p-2.5 text-right text-[9.5px]">Subtotal</th>
                <th className="p-2.5 text-right text-[9.5px]">Net VAT (5%) Total</th>
                <th className="p-2.5 text-right text-[9.5px] bg-slate-900 text-amber-500">AED Value</th>
                <th className="p-2.5 text-[9.5px] text-center no-print">Action Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-450 italic bg-slate-50 uppercase font-bold text-slate-400">
                    No matching sales invoice audits archived on current filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const subtotal = inv.items.reduce((s: number, it: any) => s + (it.qty * it.unitPrice), 0);
                  const tax = subtotal * (inv.taxRate / 100);
                  const net = subtotal + tax;
                  const aedEq = inv.currency === 'USD' ? net * 3.67 : net;

                  const triggerLocalReprint = () => {
                    const htmlContent = generateHighFidelityDocHtml(inv, 'TAX INVOICE', undefined, {
                      printArea: 'ENTIRE',
                      showUnitWeightInPrint: true,
                      showTotalWeightInPrint: true,
                      printPageSize: 'A4',
                    });
                    printHtml(htmlContent, `MFI_Reprint_Tax_Invoice_${inv.invoiceNo}`);
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 select-all">{inv.invoiceNo}</td>
                      <td className="p-2.5 text-slate-600 font-bold">{inv.dated}</td>
                      <td className="p-2.5 font-sans font-bold text-slate-850 truncate max-w-[150px] uppercase text-left">{inv.customerName}</td>
                      <td className="p-2.5 text-center text-slate-705 font-bold">{inv.paymentTerms}</td>
                      <td className="p-2.5 text-right font-bold text-slate-700">{inv.currency} {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-right font-semibold text-slate-900">{inv.currency} {net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-right font-bold bg-slate-50 text-emerald-700">AED {aedEq.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-center no-print flex gap-1 justify-center">
                        <button
                          onClick={triggerLocalReprint}
                          className="bg-slate-900 hover:bg-[#f37021] text-white px-2 py-1 font-bold uppercase cursor-pointer rounded text-[8.5px] transition-all"
                        >
                          Reprint
                        </button>
                        <button
                          onClick={() => handleVoidInvoice(inv.id, inv.invoiceNo)}
                          className="bg-slate-100 hover:bg-rose-50 text-red-650 px-2 py-1 font-bold uppercase cursor-pointer rounded text-[8.5px] border border-slate-300 hover:border-red-300"
                        >
                          Void
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  // --- TAB 8: Incoming Materials Component ---
  const IncomingMaterialsComponentOld = () => {
    const [logs, setLogs] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_INCOMING_MATERIALS');
      if (saved) {
        try { return JSON.parse(saved); } catch(e) {}
      }
      return []; // Start completely empty as requested
    });

    const [viewMode, setViewMode] = useState<'LIST' | 'CREATE' | 'DETAIL'>('LIST');
    const [selectedDoNo, setSelectedDoNo] = useState<string | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL');

    // Creation Form states
    const [formDoNo, setFormDoNo] = useState(() => 'IMDO-26' + Math.floor(Math.random() * 900 + 100));
    const [formDate, setFormDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [formSupplierName, setFormSupplierName] = useState('SABIC STEEL CORP, SAUDI ARABIA');
    const [formSupplierAddress, setFormSupplierAddress] = useState('Riyadh Industrial Zone, Block B, KSA');
    const [formVehicleNo, setFormVehicleNo] = useState('AJ6628 / AL SHAHIN TRUCKS');
    const [formDriverName, setFormDriverName] = useState('Salim Iqbal');
    const [formLpoRef, setFormLpoRef] = useState('LPO-26015');
    const [formMtcStatus, setFormMtcStatus] = useState('MTC Certified');

    // Multi-item rows for creation form
    const [formItems, setFormItems] = useState<any[]>([
      {
        materialType: 'Steel Wire Rod Coil SAE 1018',
        grade: '10.8 Grade Base Carbon',
        heatNo: '',
        weightTons: 10.0,
        qty: 1,
        binLocation: 'COIL-YARD-A1'
      }
    ]);

    useEffect(() => {
      localStorage.setItem('MFI_INCOMING_MATERIALS', JSON.stringify(logs));
    }, [logs]);

    // Grouping helper to construct "Inbound DOs" from flat logs list
    const groupedDOs = useMemo(() => {
      const groups: { [key: string]: any } = {};
      logs.forEach(log => {
        const doNo = log.incomingDoNo || `IMDO-SEED-${log.id}`;
        if (!groups[doNo]) {
          groups[doNo] = {
            incomingDoNo: doNo,
            dated: log.dated || '2026-06-01',
            supplierName: log.supplierName || 'SABIC STEEL CORP, SAUDI ARABIA',
            supplierAddress: log.supplierAddress || 'Riyadh Industrial Zone, Block B, KSA',
            vehicleNo: log.vehicleNo || 'TRUCK AJ-49211',
            driverName: log.driverName || 'S. KHAN',
            lpoRef: log.lpoRef || 'LPO-2601',
            mtcStatus: log.mtcStatus || 'MTC Certified',
            items: []
          };
        }
        groups[doNo].items.push(log);
      });

      return Object.values(groups).sort((a: any, b: any) => b.incomingDoNo.localeCompare(a.incomingDoNo));
    }, [logs]);

    // Filtered Grouped DOs
    const filteredGroupedDOs = useMemo(() => {
      return groupedDOs.filter(g => {
        const matchesSearch = 
          g.incomingDoNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.items.some((it: any) => it.heatNo.toLowerCase().includes(searchQuery.toLowerCase()) || it.materialType.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesSupplier = selectedSupplierFilter === 'ALL' || g.supplierName === selectedSupplierFilter;
        return matchesSearch && matchesSupplier;
      });
    }, [groupedDOs, searchQuery, selectedSupplierFilter]);

    // Distinct list of suppliers for filter dropdown
    const distinctSuppliers = useMemo(() => {
      return Array.from(new Set(logs.map(l => l.supplierName)));
    }, [logs]);

    const handleLoadOriginalMockData = () => {
      const mock = [
        {
          id: 'MAT-2601',
          dated: '2026-05-22',
          heatNo: 'H-9018A',
          materialType: 'Steel Wire Rod Coil SAE 1018',
          grade: '10.8 Grade Base Carbon',
          weightTons: 12.5,
          supplierName: 'SABIC STEEL CORP, SAUDI ARABIA',
          supplierAddress: 'Riyadh Industrial Zone, Block B, KSA',
          vehicleNo: 'SAUDI ROADWAY TRUCK AJ44211',
          driverName: 'Mohammad Al-Harbi',
          lpoRef: 'LPO-2026-590',
          qty: 1,
          incomingDoNo: 'IMDO-2601',
          mtcStatus: 'MTC Certified',
          binLocation: 'COIL-YARD-A3',
          inspected: true
        },
        {
          id: 'MAT-2602',
          dated: '2026-05-25',
          heatNo: 'H-31682X',
          materialType: 'Stainless Steel 316 Billets 120mm',
          grade: 'SS316 Stainless High Alloys',
          weightTons: 6.8,
          supplierName: 'HYUNDAI STEEL SHANGHAI',
          supplierAddress: 'Pudong New Area Harbor Warehouse, Shanghai, China',
          vehicleNo: 'AL BAHYA EXPRESS CARGO CO.',
          driverName: 'Zahid Khan',
          lpoRef: 'LPO-2026-598',
          qty: 3,
          incomingDoNo: 'IMDO-2602',
          mtcStatus: 'MTC Certified',
          binLocation: 'BILLET-BAY-B2',
          inspected: false
        },
        {
          id: 'MAT-2603',
          dated: '2026-05-28',
          heatNo: 'H-A325HT',
          materialType: 'Carbon Steel Hex Rod ASTM A325',
          grade: 'Structural Graded Steel High carbon',
          weightTons: 15.4,
          supplierName: 'AL FANAR STEEL WORKS CO.',
          supplierAddress: 'Ajman Industrial Area 1, Street 12, UAE',
          vehicleNo: 'INTERNAL TRAILER FORKLIFT M9',
          driverName: 'Gursinger Singh',
          lpoRef: 'LPO-2026-601',
          qty: 5,
          incomingDoNo: 'IMDO-2603',
          mtcStatus: 'Pending Mill Sheet',
          binLocation: 'COIL-YARD-M1',
          inspected: false
        }
      ];
      setLogs(mock);
      triggerToast("Loaded original standard demo DO records.");
    };

    const handleClearEverything = () => {
      if (window.confirm("Are you sure you want to completely clear all Incoming Materials Delivery Notes from the workspace registry?")) {
        setLogs([]);
        localStorage.removeItem('MFI_INCOMING_MATERIALS');
        triggerToast("Completely cleared all Incoming DO registry database records.");
        setViewMode('LIST');
        setSelectedDoNo(null);
      }
    };

    const addFormRow = () => {
      setFormItems([...formItems, {
        materialType: 'Steel Wire Rod Coil SAE 1018',
        grade: '10.8 Grade Base Carbon',
        heatNo: '',
        weightTons: 10.0,
        qty: 1,
        binLocation: 'COIL-YARD-A1'
      }]);
    };

    const removeFormRow = (index: number) => {
      if (formItems.length === 1) return;
      setFormItems(formItems.filter((_, i) => i !== index));
    };

    const updateFormRowField = (index: number, field: string, value: any) => {
      const updated = [...formItems];
      updated[index] = { ...updated[index], [field]: value };
      setFormItems(updated);
    };

    const handleSaveDO = (e: React.FormEvent) => {
      e.preventDefault();
      if (formItems.some(it => !it.heatNo.trim())) {
        alert("Please enter Steel Mill Heat Number for all items included!");
        return;
      }

      const savedRows = formItems.map((item, idx) => ({
        id: 'MAT-' + Math.floor(Math.random() * 9000 + 1000 + idx),
        dated: formDate,
        heatNo: item.heatNo.toUpperCase().trim(),
        materialType: item.materialType,
        grade: item.grade.trim(),
        weightTons: parseFloat(item.weightTons) || 0,
        qty: parseInt(item.qty) || 1,
        supplierName: formSupplierName,
        supplierAddress: formSupplierAddress,
        vehicleNo: formVehicleNo,
        driverName: formDriverName,
        lpoRef: formLpoRef,
        mtcStatus: formMtcStatus,
        binLocation: item.binLocation.toUpperCase().trim(),
        incomingDoNo: formDoNo,
        inspected: false
      }));

      setLogs([...savedRows, ...logs]);
      setSelectedDoNo(formDoNo);
      setViewMode('DETAIL');

      // Auto cycle DO No
      setFormDoNo('IMDO-26' + Math.floor(Math.random() * 900 + 100));
      setFormItems([
        {
          materialType: 'Steel Wire Rod Coil SAE 1018',
          grade: '10.8 Grade Base Carbon',
          heatNo: '',
          weightTons: 10.0,
          qty: 1,
          binLocation: 'COIL-YARD-A1'
        }
      ]);
      triggerToast(`Saved and generated Inbound Delivery Note ${formDoNo}!`);
    };

    const handleDeleteDO = (doNo: string) => {
      if (window.confirm(`Are you absolutely sure you want to purge Inbound DO ${doNo} and clear its raw materials logs?`)) {
        const remainingLogs = logs.filter(l => (l.incomingDoNo || `IMDO-SEED-${l.id}`) !== doNo);
        setLogs(remainingLogs);
        localStorage.setItem('MFI_INCOMING_MATERIALS', JSON.stringify(remainingLogs));
        triggerToast("Inbound DO flushed from active stock index.");
        if (selectedDoNo === doNo) {
          setViewMode('LIST');
          setSelectedDoNo(null);
        }
      }
    };

    const activeDO = groupedDOs.find(g => g.incomingDoNo === selectedDoNo);

    return (
      <div className="space-y-6 font-mono text-[11px] select-none no-print">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 text-white p-4 rounded-xl shadow-md border border-slate-950">
          <div>
            <h3 className="font-sans text-sm font-bold uppercase text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> GOODS RECEIVED NOTE (INBOUND GRN)
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Maintain active materials receiving receipts designed as internal and supplier-forwarded DO formats.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              type="button"
              onClick={() => setViewMode('LIST')} 
              className={`px-3 py-1.5 uppercase font-sans font-semibold rounded text-[10px] tracking-wider transition-all cursor-pointer ${
                viewMode === 'LIST' ? 'bg-amber-600 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📋 DO Registry
            </button>
            <button 
              type="button"
              onClick={() => {
                setViewMode('CREATE');
                setFormSupplierAddress('Riyadh Industrial Zone, Block B, KSA');
              }} 
              className={`px-3 py-1.5 uppercase font-sans font-semibold rounded text-[10px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'CREATE' ? 'bg-amber-600 text-slate-950 shadow-sm' : 'bg-[#f37021] text-white hover:opacity-95'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Compile Inbound DO
            </button>
            <button
              type="button"
              onClick={handleClearEverything}
              className="px-3 py-1.5 uppercase font-sans font-semibold rounded text-[10px] tracking-wider transition-all cursor-pointer bg-rose-900 text-rose-100 hover:bg-rose-800"
              title="Clear all records to start completely empty"
            >
              🗑 Clear All
            </button>
          </div>
        </div>

        {/* MODE 1: REGISTRY VIEW */}
        {viewMode === 'LIST' && (
          <div className="space-y-4">
            {/* Filters panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search by IMDO No, Supplier, Heat or Material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border pl-8 pr-3 py-1.5 focus:bg-white outline-none rounded font-bold uppercase placeholder:normal-case"
                />
              </div>
              <div>
                <select 
                  value={selectedSupplierFilter} 
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold cursor-pointer uppercase"
                >
                  <option value="ALL">-- ALL SUPPLIERS --</option>
                  {distinctSuppliers.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="text-right flex items-center justify-end">
                <span className="text-[10px] text-slate-500 font-sans">
                  Active records: <strong className="text-slate-900">{filteredGroupedDOs.length} Inbound DOs</strong>
                </span>
              </div>
            </div>

            {/* Empty state view */}
            {filteredGroupedDOs.length === 0 && (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500">
                  <Shield className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-sans font-bold uppercase text-slate-800 tracking-wider">
                  Registry is Empty
                </h4>
                <p className="text-[11px] text-slate-500 font-sans max-w-md mx-auto leading-relaxed">
                  There are currently no active Goods Received Note records registered. Run from a blank slate or load the original standard demo records.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={handleLoadOriginalMockData}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border text-slate-800 font-semibold uppercase rounded font-sans text-[10px]"
                  >
                    Load Demo seeds
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('CREATE');
                      setFormSupplierAddress('Riyadh Industrial Zone, Block B, KSA');
                    }}
                    className="px-4 py-2 bg-[#f37021] text-white font-semibold uppercase rounded font-sans text-[10px]"
                  >
                    Compile New Inbound DO
                  </button>
                </div>
              </div>
            )}

            {filteredGroupedDOs.length > 0 && (
              /* List Table */
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans text-[11px]">
                    <thead>
                      <tr className="bg-slate-950 text-white font-bold uppercase text-[10px] font-mono">
                        <th className="p-3">INCOMING DO NO</th>
                        <th className="p-3">RECEIPT DATE</th>
                        <th className="p-3">SUPPLIER CONSIGNOR</th>
                        <th className="p-3">VEHICLE / SHIPMENT</th>
                        <th className="p-3 text-center">ITEMS COUNT</th>
                        <th className="p-3 text-right">GROSS WEIGHT</th>
                        <th className="p-3 text-center">QUALITY STATE</th>
                        <th className="p-3 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[10.5px]">
                      {filteredGroupedDOs.map(g => {
                        const totalWeight = g.items.reduce((s: number, i: any) => s + (i.weightTons || 0), 0);
                        const qaPassedCount = g.items.filter((it: any) => it.inspected).length;
                        const qaTotalCount = g.items.length;
                        const isAllQA = qaPassedCount === qaTotalCount;

                        return (
                          <tr key={g.incomingDoNo} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold text-slate-900 tracking-wider text-[11.5px] select-all">{g.incomingDoNo}</td>
                            <td className="p-3 text-slate-700 font-bold">{g.dated}</td>
                            <td className="p-3">
                              <span className="block font-bold text-slate-900 uppercase">{g.supplierName}</span>
                              <span className="block text-[8.5px] text-slate-500 tracking-wide select-all font-sans italic">{g.lpoRef}</span>
                            </td>
                            <td className="p-3 text-slate-600 uppercase font-bold">{g.vehicleNo}</td>
                            <td className="p-3 text-center font-bold text-slate-800">{qaTotalCount} Batches</td>
                            <td className="p-3 text-right font-bold text-teal-850">{totalWeight.toFixed(2)} TONS</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                isAllQA ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' : 
                                qaPassedCount > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              }`}>
                                {isAllQA ? '✓ QA COMPLETE' : `PENDING ${qaTotalCount - qaPassedCount} QA`}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-2">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setSelectedDoNo(g.incomingDoNo);
                                    setViewMode('DETAIL');
                                  }}
                                  className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border text-slate-800 font-semibold uppercase rounded cursor-pointer select-none text-[8px] tracking-wide font-sans"
                                  title="Expand formal Delivery Note layout"
                                >
                                  View Formal DO
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteDO(g.incomingDoNo)}
                                  className="p-1 text-slate-400 hover:text-red-650 rounded cursor-pointer transition-colors"
                                  title="Removes entire DO log from warehousing stock"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: COMBINED FORM CREATION */}
        {viewMode === 'CREATE' && (() => {
          const formTotalQty = formItems.reduce((acc, it) => acc + (parseInt(it.qty) || 0), 0);
          const formTotalWeight = formItems.reduce((acc, it) => acc + (parseFloat(it.weightTons) || 0), 0);
          return (
            <form onSubmit={handleSaveDO} className="bg-white border-[4px] border-slate-900 rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-900 pb-4 gap-4">
                <div>
                  <span className="bg-[#f37021] text-white font-sans font-bold px-2.5 py-0.5 rounded text-[8.5px] tracking-wider uppercase inline-block font-mono">FORM DRAFT</span>
                  <h4 className="text-md font-sans font-bold text-slate-900 mt-1 uppercase flex items-center gap-1.5">
                    📋 COMPILE GOODS RECEIVED NOTE
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">Dual-compliance inventory receipt form matching official loaded carrier tickets.</p>
                </div>
                <div className="bg-slate-900 text-white border-2 border-slate-950 p-2 text-right rounded font-sans uppercase">
                  <span className="text-[7.5px] text-amber-500 block font-bold leading-none uppercase">WORKSPACE MODULE</span>
                  <strong className="text-[10.5px] font-mono text-white tracking-wider leading-none block mt-1">RECEIVING_GATE2_COILS</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Panel 1: Consignor Supplier Details */}
                <div className="md:col-span-6 border-2 border-slate-900 rounded-xl p-4 bg-slate-50/40 space-y-3">
                  <div className="border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#f37021]" />
                    <span className="text-[9.5px] font-bold text-slate-900 uppercase font-sans tracking-wide">1. CONSIGNOR SUPPLIER REGISTRATION</span>
                  </div>
                  
                  <div className="space-y-3 text-[11px]">
                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Supplier Company Name</label>
                      <select 
                        value={formSupplierName}
                        onChange={(e) => {
                          setFormSupplierName(e.target.value);
                          if (e.target.value === 'SABIC STEEL CORP, SAUDI ARABIA') {
                            setFormSupplierAddress('Riyadh Industrial Zone, Block B, KSA');
                          } else if (e.target.value === 'HYUNDAI STEEL SHANGHAI') {
                            setFormSupplierAddress('Pudong New Area Harbor Warehouse, Shanghai, China');
                          } else if (e.target.value === 'AL FANAR STEEL WORKS CO.') {
                            setFormSupplierAddress('Ajman Industrial Area 1, Street 12, UAE');
                          } else {
                            setFormSupplierAddress('Kaohsiung Cold Bar Port Terminals, Taiwan');
                          }
                        }}
                        className="w-full bg-white border border-slate-300 p-2 focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold text-slate-850 uppercase text-[10.5px] cursor-pointer font-mono"
                      >
                        <option value="SABIC STEEL CORP, SAUDI ARABIA">SABIC STEEL CORP, SAUDI ARABIA</option>
                        <option value="HYUNDAI STEEL SHANGHAI">HYUNDAI STEEL SHANGHAI</option>
                        <option value="AL FANAR STEEL WORKS CO.">AL FANAR STEEL WORKS CO.</option>
                        <option value="KAOHSIUNG COLD DRAWN BARS LTD">KAOHSIUNG COLD DRAWN BARS LTD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Dispatch / Loading Address</label>
                      <textarea 
                        rows={2}
                        value={formSupplierAddress}
                        onChange={(e) => setFormSupplierAddress(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase resize-none text-[10px] leading-normal font-mono"
                        placeholder="Street, City, Port Country detailed location"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel 2: Transport Logistics */}
                <div className="md:col-span-6 border-2 border-slate-900 rounded-xl p-4 bg-slate-50/40 space-y-3">
                  <div className="border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#f37021]" />
                    <span className="text-[9.5px] font-bold text-slate-900 uppercase font-sans tracking-wide">2. TRANSPORT & LOGISTICS PARTICULARS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="col-span-2">
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Vehicle Plate / Hauler Carrier</label>
                      <input 
                        type="text" 
                        value={formVehicleNo}
                        onChange={(e) => setFormVehicleNo(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase font-mono"
                        placeholder="e.g. M-4412 / MEERA INBOUND CARGO"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Driver Name / License</label>
                      <input 
                        type="text" 
                        value={formDriverName}
                        onChange={(e) => setFormDriverName(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase"
                        placeholder="Driver name"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">PO / LPO Reference Contract</label>
                      <input 
                        type="text" 
                        value={formLpoRef}
                        onChange={(e) => setFormLpoRef(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:ring-1 focus:ring-[#f37021] outline-none rounded font-mono font-bold text-slate-900 uppercase text-[10.5px]"
                        placeholder="e.g. LPO-26012"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel 3: Inbound Identifiers */}
                <div className="md:col-span-12 border-2 border-slate-900 rounded-xl p-4 bg-slate-50/40">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Inbound Delivery Order No</label>
                      <input 
                        type="text" 
                        value={formDoNo}
                        onChange={(e) => setFormDoNo(e.target.value.toUpperCase())}
                        className="w-full bg-amber-50/20 border-2 border-slate-950 p-2 focus:bg-white outline-none rounded font-bold tracking-wider text-slate-900 font-mono text-[11.5px]"
                        placeholder="e.g. IMDO-2601"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Date Cargo Received</label>
                      <input 
                        type="date" 
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:ring-1 focus:ring-[#f37021] outline-none rounded font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Mill Test Certificate (MTC)</label>
                      <select 
                        value={formMtcStatus} 
                        onChange={(e) => setFormMtcStatus(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold text-slate-800 cursor-pointer uppercase font-mono"
                      >
                        <option value="MTC Certified">MTC Certified (SGS Approved)</option>
                        <option value="Pending Mill Sheet">Pending Original Mill Sheet</option>
                        <option value="No Certificate">No Certificate Provided</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Items Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-3 rounded-lg border border-slate-950 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f37021] animate-pulse"></span>
                    <span className="font-semibold uppercase font-sans text-[10px] tracking-wider">3. METALLIC BULK CARGO LINE ITEMS MATRIX</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={addFormRow}
                    className="px-3 py-1.5 bg-[#f37021] text-white hover:bg-opacity-90 font-bold rounded text-[9px] uppercase cursor-pointer transition-colors flex items-center gap-1 leading-none shadow-sm font-sans"
                  >
                    <Plus className="w-3 h-3 text-white" /> Append Material Entry Row
                  </button>
                </div>

                <div className="border-2 border-slate-900 rounded-xl overflow-hidden shadow-2xs bg-white">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-900 text-white uppercase text-[8.5px] font-bold border-b-2 border-slate-950">
                        <th className="p-2.5 w-[4%] text-center">S.No</th>
                        <th className="p-2.5 w-[33%]">Spec Cargo Steel Description</th>
                        <th className="p-2.5 w-[14%]">Alloy/Carbon Grade</th>
                        <th className="p-2.5 w-[16%]">Mill Heat No * (Traceable)</th>
                        <th className="p-2.5 w-[10%] text-center">Quantities (Coils)</th>
                        <th className="p-2.5 w-[11%] text-right">Net Weight (Tons)</th>
                        <th className="p-2.5 w-[12%]">Gate Bay Yard</th>
                        <th className="p-2.5 w-[4%] text-center">Trash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-205">
                      {formItems.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 text-[10.5px]">
                          <td className="p-2.5 text-center text-slate-500 font-semibold">{index + 1}</td>
                          <td className="p-1 px-1.5">
                            <select 
                              value={item.materialType} 
                              onChange={(e) => updateFormRowField(index, 'materialType', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded font-bold focus:bg-white p-1 outline-none text-[10.5px] uppercase cursor-pointer font-mono"
                            >
                              <option value="Steel Wire Rod Coil SAE 1018">Steel Wire Rod Coil SAE 1018</option>
                              <option value="Stainless Steel 316 Billets 120mm">Stainless Steel 316 Billets 120mm</option>
                              <option value="Carbon Steel Hex Rod ASTM A325">Carbon Steel Hex Rod ASTM A325</option>
                              <option value="Chromium Alloy Steel Rod AISI 4140">Chromium Alloy Steel Rod AISI 4140</option>
                              <option value="Zinc Ingots 99.99% pure grade bg">Zinc Ingots 99.99% pure grade bg</option>
                            </select>
                          </td>
                          <td className="p-1 px-1.5">
                            <input 
                              type="text"
                              value={item.grade}
                              onChange={(e) => updateFormRowField(index, 'grade', e.target.value)}
                              className="w-full bg-slate-50 hover:bg-white text-slate-800 font-bold focus:bg-white border p-1 rounded uppercase outline-none font-mono"
                              placeholder="e.g. 10.8 Carbon"
                            />
                          </td>
                          <td className="p-1 px-1.5">
                            <input 
                              type="text"
                              required
                              value={item.heatNo}
                              onChange={(e) => updateFormRowField(index, 'heatNo', e.target.value.toUpperCase())}
                              className="w-full bg-amber-50/10 font-mono focus:bg-white border-2 border-dashed border-amber-400 focus:border-slate-400 p-1 rounded uppercase text-[10.5px] font-bold focus:ring-1 focus:ring-[#f37021] outline-none"
                              placeholder="REQUIRED STEEL HEAT"
                            />
                          </td>
                          <td className="p-1 px-1.5 text-center">
                            <input 
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateFormRowField(index, 'qty', parseInt(e.target.value) || 0)}
                              className="w-20 bg-slate-50 text-center font-bold focus:bg-white border p-1 rounded outline-none font-mono"
                              min="1"
                            />
                          </td>
                          <td className="p-1 px-1.5">
                            <input 
                              type="number"
                              step="0.01"
                              value={item.weightTons}
                              onChange={(e) => updateFormRowField(index, 'weightTons', parseFloat(e.target.value) || 0)}
                              className="w-full text-right bg-slate-50 text-teal-850 font-bold focus:bg-white border p-1 rounded outline-none font-mono"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-1 px-1.5">
                            <input 
                              type="text"
                              value={item.binLocation}
                              onChange={(e) => updateFormRowField(index, 'binLocation', e.target.value)}
                              className="w-full bg-slate-50 hover:bg-white font-bold focus:bg-white border p-1 rounded uppercase outline-none font-mono"
                              placeholder="e.g. BAY-B2"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <button 
                              type="button" 
                              onClick={() => removeFormRow(index)}
                              disabled={formItems.length === 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Summary Row */}
                      <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold text-slate-900 text-[10.5px]">
                        <td colSpan={4} className="p-2.5 text-right uppercase tracking-wider font-sans">Draft Cargo Totals:</td>
                        <td className="p-2 text-center bg-amber-100/40 border-x border-slate-205 font-mono text-amber-900">
                          {formTotalQty} Coils
                        </td>
                        <td className="p-2 text-right bg-teal-50 border-r border-slate-205 font-mono text-teal-900 whitespace-nowrap">
                          {formTotalWeight.toFixed(2)} Tons Net
                        </td>
                        <td colSpan={2} className="p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-4">
                <span className="text-[9.5px] text-slate-400 font-sans italic max-w-[400px]">
                  * ISO standard checkpoint: Recording traceable Mill Heat codes is critical for chemical and physical audit validation.
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => setViewMode('LIST')}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold uppercase text-xs transition-colors cursor-pointer w-full sm:w-auto font-sans"
                  >
                    Cancel Draft
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-[#f37021] hover:bg-opacity-95 text-white font-bold uppercase text-xs rounded shadow-md transition-colors cursor-pointer w-full sm:w-auto flex items-center justify-center gap-1.5 font-sans"
                  >
                    <Check className="w-4 h-4 text-white shrink-0" /> Commit to Stock Warehousing
                  </button>
                </div>
              </div>
            </form>
          );
        })()}

        {/* MODE 3: DELIVERY NOTE DETAIL VIEW */}
        {viewMode === 'DETAIL' && activeDO && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border">
              <button 
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-3 py-1 bg-slate-800 text-white rounded font-bold uppercase text-[9.5px] font-sans"
              >
                ◀ Return to registry
              </button>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    const printSection = document.getElementById('printable-incoming-do-doc');
                    if (printSection) {
                      const htmlContent = `
                        <html>
                          <head>
                            <title>Inbound DO - ${activeDO.incomingDoNo}</title>
                            <style>
                              body { font-family: monospace; padding: 25px; font-size: 11px; text-transform: uppercase; line-height: 1.4; color: black; }
                              .head-title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 2px; }
                              .subtitle { text-align: center; font-size: 10px; color: #555; margin-bottom: 20px; font-family: sans-serif; }
                              .border-box { border: 2px solid black; padding: 12px; margin-bottom: 12px; }
                              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                              .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                              .info-table th, .info-table td { border: 1px solid black; padding: 6px; text-align: left; }
                              .info-table th { background-color: #eee; }
                              .sign-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 60px; text-align: center; }
                              .sign-box { border-top: 1px solid black; padding-top: 5px; }
                            </style>
                          </head>
                          <body>
                            <div class="head-title">MARINES FASTENERS INDUSTRIES LLC</div>
                            <div class="subtitle">AJMAN INDUSTRIAL AREA 2, UAE | TEL: +971-6-749211 | COIL STORE GATE 2</div>
                            <hr style="border: 1px solid black; margin-bottom: 20px;"/>
                            
                            <div style="font-size: 13px; font-weight: bold; text-align: center; margin-bottom: 15px; letter-spacing: 1px;">
                              GOODS RECEIVED NOTE (INBOUND GRN)
                            </div>

                            <div class="grid-2">
                              <div class="border-box">
                                <strong>SUPPLIER / CONSIGNOR PARTY:</strong>
                                <div style="margin-top: 5px; font-weight: bold;">${activeDO.supplierName}</div>
                                <div style="margin-top: 2px; font-size: 9px; font-family: sans-serif;">${activeDO.supplierAddress}</div>
                                <div style="margin-top: 5px;">PO REF REFERENCE: ${activeDO.lpoRef}</div>
                              </div>
                              <div class="border-box">
                                <strong>RECEIPT DELIVERY PARTICULARS:</strong>
                                <div style="margin-top: 5px;">INBOUND DO NO: <strong style="font-size: 12px;">${activeDO.incomingDoNo}</strong></div>
                                <div>RECEIVING DATED: ${activeDO.dated}</div>
                                <div>VEHICLE PLATE NO: ${activeDO.vehicleNo}</div>
                                <div>DRIVER PARTICULARS: ${activeDO.driverName}</div>
                              </div>
                            </div>

                            <table class="info-table">
                              <thead>
                                <tr>
                                  <th style="width: 5%;">S.NO</th>
                                  <th>DESCRIPTION OF METALLIC CARGO</th>
                                  <th>ALLOY GRADE</th>
                                  <th>MILL HEAT BATCH</th>
                                  <th style="text-align: center; width: 10%;">QTY(COILS)</th>
                                  <th style="text-align: right; width: 15%;">WEIGHT (TONS)</th>
                                  <th>STORED IN</th>
                                  <th>QA RELEASE</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${activeDO.items.map((it: any, index: number) => `
                                  <tr>
                                    <td style="text-align: center;">${index + 1}</td>
                                    <td><strong>${it.materialType}</strong></td>
                                    <td>${it.grade}</td>
                                    <td><strong style="letter-spacing:1px;">${it.heatNo}</strong></td>
                                    <td style="text-align: center;">${it.qty}</td>
                                    <td style="text-align: right; font-weight: bold;">${(it.weightTons || 0).toFixed(2)} T</td>
                                    <td>${it.binLocation}</td>
                                    <td style="text-align: center; font-size: 9px;">${it.inspected ? 'APPROVED RELEASED' : 'WAITING TEST'}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>

                            <div style="margin-top:20px; font-size: 9px;">
                              <strong>REMARKS:</strong> MATERIAL PHYSICAL SEALS INSPECTED & VERIFIED FOR BUNDLE COUNTS. QUALITY RELEASE IS CONTINGENT ON METALLURGICAL LAB REPORT ISSUANCES.
                            </div>

                            <div class="sign-section">
                              <div class="sign-box">DRIVER / TRANSPORTER SIGNATURE</div>
                              <div class="sign-box">METALLURGIC LAB DESK (STAMP)</div>
                              <div class="sign-box">AJMAN STOREKEEPER SIGN & SEAL</div>
                            </div>
                          </body>
                        </html>
                      `;
                      printHtml(htmlContent, `Inbound DO - ${activeDO.incomingDoNo}`);
                    }
                  }}
                  className="px-3 py-1 bg-teal-800 hover:bg-opacity-95 text-white rounded font-bold uppercase text-[9.5px] cursor-pointer flex items-center gap-1 font-sans"
                >
                  <Printer className="w-3.5 h-3.5 text-white" /> Print Inbound DN
                </button>
                <button 
                  type="button"
                  onClick={() => handleDeleteDO(activeDO.incomingDoNo)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase text-[9.5px] cursor-pointer font-sans"
                >
                  Delete DO
                </button>
              </div>
            </div>

            {/* Corporate Sheet Display Layout */}
            <div 
              id="printable-incoming-do-doc" 
              className="bg-white border-[6px] border-slate-900 rounded-2xl p-8 shadow-xl max-w-4xl mx-auto space-y-6 font-mono border-double"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-slate-900 pb-5">
                <div>
                  <h1 className="text-xl font-bold font-sans text-slate-900 tracking-tight leading-none uppercase">
                    MARINE FASTENERS INDUSTRIES LLC
                  </h1>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5 tracking-wide">
                    COIL STORE DESK 2 | AJMAN INDUSTRIAL AREA 2, UAE | TEL: +971-6-7492110
                  </p>
                </div>
                <div className="bg-slate-900 text-white p-3 py-2 text-center rounded-lg max-w-[200px] shrink-0">
                  <span className="text-[8.5px] text-amber-500 uppercase font-bold block tracking-widest font-mono">DOCUMENT CLASSIFICATION</span>
                  <span className="text-sm font-bold tracking-normal uppercase leading-none font-sans block mt-0.5">INBOUND DO</span>
                </div>
              </div>

              <div className="text-center bg-slate-50 border-y-2 border-slate-800 py-2 font-bold tracking-wider text-slate-900 text-[12.5px]">
                GOODS RECEIVED NOTE (DELIVERY RECEIPT)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-900 rounded-lg p-3 bg-slate-50/50 space-y-1">
                  <span className="text-[8.5px] text-slate-400 font-bold block font-sans">SUPPLIER CONSIGNOR PARTY:</span>
                  <h4 className="font-bold text-[11.5px] text-slate-950 uppercase">{activeDO.supplierName}</h4>
                  <p className="text-[10px] text-slate-600 leading-tight uppercase font-sans">{activeDO.supplierAddress}</p>
                  <p className="text-[9.5px] text-slate-700 font-bold mt-2 font-sans">
                    LPO/PR REFERENCE: <span className="text-slate-900 select-all font-mono font-bold">{activeDO.lpoRef}</span>
                  </p>
                </div>

                <div className="border border-slate-900 rounded-lg p-3 bg-slate-50/50 grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="col-span-2 border-b pb-1.5 mb-1.5">
                    <span className="text-[8.5px] text-slate-400 font-bold block font-sans">INCOMING DO RECEIPT NUMBER:</span>
                    <strong className="text-md text-slate-900 tracking-wider text-xs select-all">{activeDO.incomingDoNo}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block font-sans leading-none">Dated Received:</span>
                    <strong className="text-slate-800 text-[10px]">{activeDO.dated}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-bold block font-sans leading-none">Vehicle Number:</span>
                    <strong className="text-slate-800 text-[10px] uppercase select-all">{activeDO.vehicleNo}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t mt-1">
                    <span className="text-[8px] text-slate-400 font-bold block font-sans leading-none">Driver Details / License:</span>
                    <strong className="text-slate-800 text-[9.5px] uppercase">{activeDO.driverName}</strong>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-2 border-slate-950 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[8.5px] font-bold font-sans border-b border-slate-950">
                      <th className="p-2.5 w-[5%] text-center">S.No</th>
                      <th className="p-2.5">Raw Coil / billet Spec Type</th>
                      <th className="p-2.5">Alloy Grade</th>
                      <th className="p-2.5 w-[20%]">Mill Heat Batch</th>
                      <th className="p-2.5 w-[10%] text-center">Unit coils</th>
                      <th className="p-2.5 w-[15%] text-right">Net Tonnage</th>
                      <th className="p-2.5">Bin Yard</th>
                      <th className="p-2.5 text-center">QA Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {activeDO.items.map((it: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-100/30">
                        <td className="p-2.5 text-center text-slate-500 font-semibold">{index + 1}</td>
                        <td className="p-2.5">
                          <strong className="block font-bold text-slate-900 uppercase">{it.materialType}</strong>
                        </td>
                        <td className="p-2.5 uppercase font-bold text-slate-700">{it.grade}</td>
                        <td className="p-2.5 font-mono select-all font-bold text-slate-950 text-[11.5px] tracking-wide">{it.heatNo}</td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{it.qty}</td>
                        <td className="p-2.5 text-right font-bold text-teal-800">{(it.weightTons || 0).toFixed(2)} T</td>
                        <td className="p-2.5 font-bold uppercase text-slate-600">{it.binLocation}</td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 font-sans rounded text-[8px] font-bold uppercase ${
                            it.inspected ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800 animate-pulse'
                          }`}>
                            {it.inspected ? 'Passed APPROVED' : 'PENDING QC LAB'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Grand totals row */}
                    <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold text-slate-900">
                      <td colSpan={4} className="p-3 text-right uppercase tracking-wider font-sans text-[10px]">Grand Recs Summary:</td>
                      <td className="p-3 text-center border-x bg-amber-50">
                        {activeDO.items.reduce((s: number, i: any) => s + (parseInt(i.qty) || 0), 0)} Coils
                      </td>
                      <td className="p-3 text-right bg-teal-50 border-r text-teal-950 font-mono whitespace-nowrap text-[12px]">
                        {activeDO.items.reduce((s: number, i: any) => s + (parseFloat(i.weightTons) || 0), 0).toFixed(2)} Tons Net
                      </td>
                      <td colSpan={2} className="p-3 text-center text-[10px] text-slate-500 font-sans font-medium uppercase italic">
                        Mill Certificates: {activeDO.mtcStatus}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remarks */}
              <div className="border border-dashed border-slate-300 p-3 rounded-lg text-slate-600 text-[10px] leading-relaxed">
                <strong>STANDARD QUALITY CHECKPOINT WARRANTY:</strong>
                <p className="font-sans mt-0.5 uppercase">
                  Cargo physical condition checked and logged upon heavy vehicle weighbridge entry. Mill Certificates must be cross-referenced with local Metallurgy laboratory standards reports.
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-[10px] text-center font-sans">
                <div className="border-t border-slate-900 pt-2 space-y-1">
                  <span className="block font-bold text-slate-900 uppercase">DRIVER TRANSPORTER REPRESENTATIVE</span>
                  <span className="block text-[8.5px] text-slate-400 uppercase select-none">CARRIER LOAD RECEIVER SIGN</span>
                </div>
                <div className="border-t border-slate-900 pt-2 space-y-1">
                  <span className="block font-bold text-[#f37021] uppercase">METALLURGY QA INSPECTION DESK</span>
                  <span className="block text-[8.5px] text-slate-400 uppercase select-none font-bold">WET LAB SEAL & APPROVAL</span>
                </div>
                <div className="border-t border-slate-900 pt-2 space-y-1">
                  <span className="block font-bold text-slate-900 uppercase font-semibold">AJMAN COILS YARD STOREKEEPER</span>
                  <span className="block text-[8.5px] text-slate-400 uppercase select-none font-bold">STAMP AND PERMIT RECEIVER</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- TAB 9: Incoming Materials Rec Report Component ---
  const IncomingRecReportComponent = () => {
    const [incomingJobs, setIncomingJobs] = useState<any[]>([]);

    useEffect(() => {
      const saved = localStorage.getItem('MFI_INCOMING_MATERIALS');
      if (saved) {
        try { setIncomingJobs(JSON.parse(saved)); } catch (e) {}
      }
    }, []);

    const [selectedHeat, setSelectedHeat] = useState('');
    const [pitchDiameter, setPitchDiameter] = useState('15.82 mm');
    const [shankDiameter, setShankDiameter] = useState('16.02 mm');
    const [carbonContent, setCarbonContent] = useState('0.18 %');
    const [hardnessHrc, setHardnessHrc] = useState('22 HRC');
    const [microstructureStatus, setMicrostructureStatus] = useState('UNIFORM PEARLITE - PASSED');
    const [visualDefectText, setVisualDefectText] = useState('NIL SURFACE CRACKS DETECTED');
    const [qaInspector, setQaInspector] = useState('S. AL RAMS QA desk');
    
    const [inspectionsList, setInspectionsList] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_METALLURGY_REPORTS');
      if (saved) return JSON.parse(saved);
      return [];
    });

    useEffect(() => {
      localStorage.setItem('MFI_METALLURGY_REPORTS', JSON.stringify(inspectionsList));
    }, [inspectionsList]);

    const activeJobsToInspect = useMemo(() => {
      return incomingJobs.filter(j => !j.inspected);
    }, [incomingJobs]);

    const handleGenerateReport = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedHeat) {
        alert("Please select an Outstanding Raw Stock Coil Heat No!");
        return;
      }

      const matchedMat = incomingJobs.find(x => x.heatNo === selectedHeat);
      const materialType = matchedMat ? matchedMat.materialType : 'Structural Rod';
      const gradeCode = matchedMat ? matchedMat.grade : 'ASTM A325';
      const supplierName = matchedMat ? matchedMat.supplierName : 'SABIC CORP';

      const cleanReport = {
        id: 'IMRR-' + Math.floor(Math.random() * 9000 + 1000),
        dated: new Date().toISOString().substring(0, 10),
        heatNo: selectedHeat,
        materialType,
        gradeCode,
        supplier: supplierName,
        pitch: pitchDiameter.toUpperCase(),
        shank: shankDiameter.toUpperCase(),
        carbon: carbonContent.toUpperCase(),
        hardness: hardnessHrc.toUpperCase(),
        microstructure: microstructureStatus.toUpperCase(),
        visual: visualDefectText.toUpperCase(),
        inspector: qaInspector.toUpperCase(),
        status: 'PASSED & COMMITTED'
      };

      setInspectionsList([cleanReport, ...inspectionsList]);

      const updatedMatsList = incomingJobs.map(job => {
        if (job.heatNo === selectedHeat) {
          return { ...job, inspected: true };
        }
        return job;
      });
      setIncomingJobs(updatedMatsList);
      localStorage.setItem('MFI_INCOMING_MATERIALS', JSON.stringify(updatedMatsList));

      setSelectedHeat('');
      triggerToast(`Stamped Quality Report ${cleanReport.id} for Heat ${cleanReport.heatNo}!`);
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-mono text-[11px]">
        <div className="xl:col-span-5 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div>
            <h3 className="font-sans text-sm font-bold uppercase text-slate-900">GOODS RECEIVED NOTE QC REPORT</h3>
            <p className="text-[10px] text-slate-500">Apply micrometer dimensional tests, mechanical carbon hardness, and chemical grain verification.</p>
          </div>

          {activeJobsToInspect.length === 0 ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold uppercase text-[9.5px]">
              ✓ Excellent! All incoming rods and billets have been dimensional-tested and approved by metallurgical QA desk! No pending inspections listed.
            </div>
          ) : (
            <form onSubmit={handleGenerateReport} className="space-y-3">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Select Outstanding Uninspected Heat No</label>
                <select 
                  value={selectedHeat} 
                  onChange={(e) => setSelectedHeat(e.target.value)} 
                  className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase text-[10.5px] cursor-pointer"
                >
                  <option value="">-- Choose Steel Mill Heat Batch --</option>
                  {activeJobsToInspect.map(j => (
                    <option key={j.id} value={j.heatNo}>{j.heatNo} ({j.materialType.substring(0, 24)}...)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Inspected Thread/Pitch Dia</label>
                  <input type="text" value={pitchDiameter} onChange={(e) => setPitchDiameter(e.target.value)} className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase" />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Inspected Shank OD</label>
                  <input type="text" value={shankDiameter} onChange={(e) => setShankDiameter(e.target.value)} className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Carbon Alloy Ratio %</label>
                  <input type="text" value={carbonContent} onChange={(e) => setCarbonContent(e.target.value)} className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase" />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Carbon Core Hardness (HRC)</label>
                  <input type="text" value={hardnessHrc} onChange={(e) => setHardnessHrc(e.target.value)} className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Microstructure Grain Test Result</label>
                <input type="text" value={microstructureStatus} onChange={(e) => setMicrostructureStatus(e.target.value)} className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase" />
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Visual Defect Report Card</label>
                <input type="text" value={visualDefectText} onChange={(e) => setVisualDefectText(e.target.value)} className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase" />
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold mb-1 font-sans">Metallurgical QC Officer Sign</label>
                <input type="text" value={qaInspector} onChange={(e) => setQaInspector(e.target.value)} className="w-full bg-slate-50 border p-1.5 focus:bg-white outline-none rounded font-bold uppercase" />
              </div>

              <button type="submit" className="w-full bg-[#f37021] text-white p-2.5 font-bold uppercase hover:opacity-95 text-xs transition-opacity rounded cursor-pointer">
                Generate Quality Release Stamp
              </button>
            </form>
          )}
        </div>

        <div className="xl:col-span-7 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div>
            <h3 className="font-sans text-sm font-bold uppercase text-slate-900">GOODS RECEIVED NOTE REC JOURNAL (GRNJ)</h3>
            <p className="text-[10px] text-slate-500">History log of authorized metallurgical and physical testing results issued on ISO formats.</p>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {inspectionsList.map(item => (
              <div key={item.id} className="border border-slate-300 p-3 bg-slate-50 rounded-lg space-y-2 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8.5px] bg-[#f37021] text-white font-bold px-1.5 py-0.5 rounded font-mono uppercase">{item.id}</span>
                    <span className="text-[9.5px] text-slate-500 ml-2 font-bold font-sans">ISSUED ON: {item.dated}</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-250 rounded font-bold text-[7.5px] uppercase font-mono">
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-1.5 border-t border-b border-dashed border-slate-200 text-[10px]">
                  <div className="col-span-2">
                    <span className="text-slate-400 uppercase text-[8px] font-bold block font-sans">Raw Coil Material & Supplier:</span>
                    <p className="font-bold text-slate-900 uppercase">{item.materialType} ({item.gradeCode})</p>
                    <p className="text-[8.5px] text-slate-600 uppercase">HEAT NO: <strong className="text-amber-800 font-bold font-mono">{item.heatNo}</strong> | FROM: {item.supplier}</p>
                  </div>
                  <div>
                    <span className="text-slate-405 uppercase text-[8px] font-bold block font-sans">Inspected Thread/Pitch Dia:</span>
                    <p className="font-bold text-slate-800">{item.pitch}</p>
                  </div>
                  <div>
                    <span className="text-slate-405 uppercase text-[8px] font-bold block font-sans">Inspected Shank OD:</span>
                    <p className="font-bold text-slate-800">{item.shank}</p>
                  </div>
                  <div>
                    <span className="text-slate-405 uppercase text-[8px] font-bold block font-sans">Carbon Spec & Hardness:</span>
                    <p className="font-bold text-slate-800">CARBON: {item.carbon} | HARDNESS: {item.hardness}</p>
                  </div>
                  <div>
                    <span className="text-slate-405 uppercase text-[8px] font-bold block font-sans">Grain Structural State:</span>
                    <p className="font-bold text-emerald-800 uppercase text-[9.5px]">{item.microstructure}</p>
                  </div>
                  <div className="col-span-2 bg-white border p-1.5 rounded">
                    <span className="text-slate-405 uppercase text-[8.5px] font-bold block font-sans">Signatory QA Inspector Office:</span>
                    <p className="font-semibold text-slate-800 font-sans italic">STAMPED WITH DIGITAL SEAL – {item.inspector}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- TAB 10: Incoming Materials Payments Update Component ---
  const IncomingPaymentsUpdateComponent = () => {
    const [payables, setPayables] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_RAW_PAYABLES');
      if (saved) return JSON.parse(saved);
      return [];
    });

    const [supplierPurchases, setSupplierPurchases] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [];
    });

    const [savedDocs, setSavedDocs] = useState<any[]>(() => {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [];
    });

    useEffect(() => {
      const handleStorage = () => {
        const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
        if (savedPurchases) {
          try {
            const parsed = JSON.parse(savedPurchases);
            if (Array.isArray(parsed)) setSupplierPurchases(parsed);
          } catch (e) {}
        }
        const savedDocsList = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
        if (savedDocsList) {
          try {
            const parsed = JSON.parse(savedDocsList);
            if (Array.isArray(parsed)) setSavedDocs(parsed);
          } catch (e) {}
        }
        const savedLedger = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        if (savedLedger) {
          try {
            const parsed = JSON.parse(savedLedger);
            if (Array.isArray(parsed)) setInboundDOs(parsed);
          } catch (e) {}
        }
      };
      window.addEventListener('storage', handleStorage);
      window.addEventListener('mf_documents_updated', handleStorage);
      window.addEventListener('mfi_supplier_purchases_updated', handleStorage);
      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('mf_documents_updated', handleStorage);
        window.removeEventListener('mfi_supplier_purchases_updated', handleStorage);
      };
    }, []);

    const [inboundDOs, setInboundDOs] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
      return [];
    });

    // Reactive sync on active tab changes so newly created DO elements sync up immediately!
    useEffect(() => {
      if (activeTab === 'incoming_materials_payments_update') {
        const saved = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        if (saved) {
          try { setInboundDOs(JSON.parse(saved)); } catch (e) {}
        }
        const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
        if (savedPurchases) {
          try {
            const parsed = JSON.parse(savedPurchases);
            if (Array.isArray(parsed)) setSupplierPurchases(parsed);
          } catch (e) {}
        }
        const savedDocsList = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
        if (savedDocsList) {
          try {
            const parsed = JSON.parse(savedDocsList);
            if (Array.isArray(parsed)) setSavedDocs(parsed);
          } catch (e) {}
        }
      }
    }, [activeTab]);

    const [selectPayableId, setSelectPayableId] = useState('');
    const [updateAmount, setUpdateAmount] = useState(5000);
    const [payoutOption, setPayoutOption] = useState<'CHEQUE' | 'BANK TRANSFER' | 'LETTER OF CREDIT'>('BANK TRANSFER');
    const [details, setDetails] = useState('Standard monthly raw clearance');

    const [supplierActionSubTab, setSupplierActionSubTab] = useState<'RECONCILE' | 'ADD_BILL'>('RECONCILE');

    // New Supplier Bill states
    const [newBillId, setNewBillId] = useState(() => 'PAY-' + Math.floor(Math.random() * 950 + 100));
    const [newDoNo, setNewDoNo] = useState(() => 'DO-' + Math.floor(Math.random() * 90000 + 10000));
    const [newLpoNo, setNewLpoNo] = useState(() => 'LPO-' + Math.floor(Math.random() * 90000 + 10000));
    const [newSupplierName, setNewSupplierName] = useState('SABIC STEEL CORP, SAUDI ARABIA');
    const [newMaterialsDetails, setNewMaterialsDetails] = useState('');
    const [newContractValue, setNewContractValue] = useState(30000);
    const [newInitialPaid, setNewInitialPaid] = useState(0);
    const [newInvoicePaidBy, setNewInvoicePaidBy] = useState('BANK WIRE');
    const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().substring(0, 10));

    // Live preview document overlay modal state
    const [activePreviewDoc, setActivePreviewDoc] = useState<any | null>(null);
    const [previewDO, setPreviewDO] = useState<any | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; source: 'manual' | 'material_do' | 'supplier_purchase' } | null>(null);
    const [payablesFilterType, setPayablesFilterType] = useState<'all' | 'standard' | 'coating'>('all');

    useEffect(() => {
      if (!activePreviewDoc) {
        setPreviewDO(null);
        return;
      }
      const matched = inboundDOs.find(d => 
        (d.id && d.id === activePreviewDoc.id) ||
        (d.doNo && activePreviewDoc.doNo && d.doNo.trim().toUpperCase() === activePreviewDoc.doNo.trim().toUpperCase()) ||
        (d.invoiceNo && activePreviewDoc.invoiceNo && d.invoiceNo.trim().toUpperCase() === activePreviewDoc.invoiceNo.trim().toUpperCase())
      );
      if (matched) {
        setPreviewDO(JSON.parse(JSON.stringify({
          ...matched,
          type: matched.type || 'supplier_tax_invoice'
        }))); // deep clone
      } else {
        // Create an empty dummy DO centered on this payment
        setPreviewDO({
          id: activePreviewDoc.id,
          type: 'supplier_tax_invoice',
          invoiceNo: activePreviewDoc.invoiceNo || '',
          doNo: activePreviewDoc.doNo || '',
          date: activePreviewDoc.date || '',
          poNo: activePreviewDoc.poNo || '',
          dispatchBy: 'BY ROAD (TRAILER)',
          deliveryTerms: 'DDP - DUBAI PORT',
          madeIn: 'UAE',
          supplierName: activePreviewDoc.supplierName || 'INBOUND CARGO',
          supplierAddress: 'PLOT 41B, PHASE 3, INDUSTRIAL AREA, JEDDAH, SAUDI ARABIA',
          trn: '300182764500003',
          phone: '+966 12 699 2411',
          receiverName: 'MR. ASHRAF ALAMI',
          qcCheckedBy: 'ENG. RAJESH KUMAR',
          items: [
            { id: 'it-1', sn: 1, description: activePreviewDoc.materialsDetails || 'HIGH STRENGTH GALVANIZED FASTENER MEMBERS', size: 'M24', finish: 'HOT DIP GALVANIZED', unit: 'PCS', qty: 2500, marking: 'MFI A325', microns: '85', coatings: 'GALVANIZED', threads: 'METRIC 6G', remarks: 'PALLET 1-2', qcNotes: 'PASSED VISUAL DETAILS' }
          ],
          invoiceAmounts: activePreviewDoc.totalContractValue || 45000,
          invoicePaid: activePreviewDoc.amountPaid || 32000,
          invoiceDate: activePreviewDoc.invoiceDate || activePreviewDoc.date || '',
          invoiceBalance: (activePreviewDoc.totalContractValue - activePreviewDoc.amountPaid) || 13000,
          invoicePaidBy: activePreviewDoc.invoicePaidBy || 'BANK WIRE',
        });
      }
    }, [activePreviewDoc, inboundDOs]);

    const handleUpdatePreviewDOField = (field: string, value: any) => {
      setPreviewDO(prev => {
        if (!prev) return null;
        const up = { ...prev, [field]: value };
        if (field === 'invoiceAmounts' || field === 'invoicePaid') {
          const tc = parseFloat(up.invoiceAmounts) || 0;
          const ap = parseFloat(up.invoicePaid) || 0;
          up.invoiceBalance = (tc - ap).toFixed(2);
        }
        return up;
      });
    };

    const handleUpdatePreviewDOItemField = (itemId: string, field: string, value: any) => {
      setPreviewDO(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map(it => it.id === itemId ? { ...it, [field]: value } : it)
        };
      });
    };

    const handleAppendPreviewDOItem = () => {
      setPreviewDO(prev => {
        if (!prev) return null;
        const nextSn = prev.items.length + 1;
        const newItem = {
          id: `new-${Date.now()}-${nextSn}`,
          sn: nextSn,
          description: 'FASTENER SPEC CARGO',
          size: 'M24',
          finish: 'HOT DIP GALVANIZED',
          unit: 'PCS',
          qty: 1000,
          marking: 'MFI',
          microns: '85',
          coatings: 'GALVANIZED',
          threads: 'FIT OK',
          remarks: 'BOX',
          qcNotes: 'APPROVED'
        };
        return {
          ...prev,
          items: [...prev.items, newItem]
        };
      });
    };

    const handleRemovePreviewDOItem = (itemId: string) => {
      setPreviewDO(prev => {
        if (!prev) return null;
        const filtered = prev.items.filter(it => it.id !== itemId);
        const reindexed = filtered.map((it, idx) => ({ ...it, sn: idx + 1 }));
        return {
          ...prev,
          items: reindexed
        };
      });
    };

    const handleSavePreviewDO = () => {
      if (!previewDO || !activePreviewDoc) return;
      
      if (activePreviewDoc.source === 'manual') {
        const updated = payables.map(p => {
          if (p.id === activePreviewDoc.id) {
            return {
              ...p,
              doNo: previewDO.doNo,
              date: previewDO.date,
              invoiceNo: previewDO.invoiceNo,
              poNo: previewDO.poNo,
              supplierName: previewDO.supplierName,
              totalContractValue: Number(previewDO.invoiceAmounts) || 0,
              amountPaid: Number(previewDO.invoicePaid) || 0,
              invoicePaidBy: previewDO.invoicePaidBy,
              invoiceDate: previewDO.invoiceDate,
              status: (Number(previewDO.invoicePaid) >= Number(previewDO.invoiceAmounts)) ? 'PAID' : (Number(previewDO.invoicePaid) > 0 ? 'PARTIALLY PAID' : 'UNPAID')
            };
          }
          return p;
        });
        setPayables(updated);
        localStorage.setItem('MFI_RAW_PAYABLES', JSON.stringify(updated));
      } else {
        const updatedDOs = inboundDOs.map(d => {
          if (d.id === activePreviewDoc.id) {
            return previewDO;
          }
          return d;
        });
        setInboundDOs(updatedDOs);
        localStorage.setItem('MFI_INCOMING_MATERIALS_LEDGER', JSON.stringify(updatedDOs));
      }
      
      triggerToast("Goods Received Note (GRN) updated successfully inside Ledger!");
      setActivePreviewDoc(null);
    };

    useEffect(() => {
      localStorage.setItem('MFI_RAW_PAYABLES', JSON.stringify(payables));
    }, [payables]);

    // Combined billing registry compiling raw contracts and saved Material DO Delivery Invoice balances!
    const combinedPayables = useMemo(() => {
      const manualBills = payables.map(p => {
        const tc = Number(p.totalContractValue) || 0;
        const ap = Number(p.amountPaid) || 0;
        return {
          ...p,
          source: 'manual' as const,
          displayKey: p.id,
          doNo: p.doNo || 'M-PAY',
          date: p.date || p.dueDate || '',
          invoiceNo: p.invoiceNo || p.id,
          poNo: p.poNo || 'N/A',
          supplierName: p.supplierName,
          materialsDetails: p.materialsDetails || 'Raw Parts Import Cargo',
          totalContractValue: tc,
          amountPaid: ap,
          dueDate: p.dueDate || '',
          invoiceDate: p.invoiceDate || p.dueDate || '',
          invoicePaidBy: p.invoicePaidBy || 'BANK WIRE',
          status: p.status || (ap >= tc ? 'PAID' : (ap > 0 ? 'PARTIAL' : 'UNPAID')),
          type: p.type || 'standard'
        };
      });

      const doBills = inboundDOs
        .map(d => {
          const totalVal = parseFloat(d.invoiceAmounts) || 0;
          const paidVal = parseFloat(d.invoicePaid) || 0;
          const outstanding = totalVal - paidVal;
          return {
            id: d.id,
            source: 'material_do' as const,
            displayKey: d.invoiceNo || `PENDING (Ref: ${d.doNo || d.id})`,
            doNo: d.doNo || '',
            date: d.date || '',
            invoiceNo: d.invoiceNo || '',
            poNo: d.poNo || '',
            supplierName: d.supplierName || 'INBOUND CARGO',
            materialsDetails: `DO Material Receipt | Ref #${d.doNo || d.id}`,
            totalContractValue: totalVal,
            amountPaid: paidVal,
            dueDate: d.invoiceDate || d.date || 'N/A',
            invoiceDate: d.invoiceDate || d.date || '',
            invoicePaidBy: d.invoicePaidBy || 'BANK WIRE',
            status: d.invoicePaymentStatus || (totalVal === 0 ? 'UNBILLED' : (outstanding <= 0 ? 'PAID' : (paidVal > 0 ? `PARTIALLY PAID VIA ${d.invoicePaidBy || 'BANK'}` : 'UNPAID'))),
            type: d.type || 'standard'
          };
        });

      const purchaseBills = supplierPurchases.map(pur => {
        const totalVal = Number(pur.totalAmount || pur.subtotal || 0);
        let paidVal = 0;
        if (pur.amountPaid !== undefined) {
          paidVal = Number(pur.amountPaid);
        } else if (pur.paidAmount !== undefined) {
          paidVal = Number(pur.paidAmount);
        } else if (pur.paymentStatus === 'Paid') {
          paidVal = totalVal;
        } else if (pur.paymentStatus === 'Partial' || pur.paymentStatus === 'Partially Paid') {
          paidVal = totalVal / 2;
        }
        const outstanding = totalVal - paidVal;

        return {
          id: pur.id,
          source: 'supplier_purchase' as const,
          displayKey: pur.invoiceNo || pur.id,
          doNo: pur.deliveryNoteNo || 'N/A',
          date: pur.invoiceDate || pur.date || '',
          invoiceNo: pur.invoiceNo || '',
          poNo: pur.lpoRef || 'N/A',
          supplierName: pur.supplierName,
          materialsDetails: `Supplier Tax Invoice | Ref #${pur.invoiceNo || pur.id}`,
          totalContractValue: totalVal,
          amountPaid: paidVal,
          dueDate: pur.dueDate || pur.invoiceDate || pur.date || 'N/A',
          invoiceDate: pur.invoiceDate || pur.date || '',
          invoicePaidBy: pur.paymentMode || pur.invoicePaidBy || 'BANK WIRE',
          status: pur.paymentStatus || (totalVal === 0 ? 'UNBILLED' : (outstanding <= 0 ? 'PAID' : (paidVal > 0 ? 'PARTIALLY PAID' : 'UNPAID'))),
          type: 'standard'
        };
      });

      const existingPurchaseRefs = new Set(
        supplierPurchases.map(p => (p.invoiceNo || p.id || '').trim().toUpperCase())
      );

      const savedSupplierDocs = savedDocs
        .filter((inv: any) => {
          const docType = (inv.documentType || '').trim().toUpperCase();
          const isSupplierDoc = docType === 'PURCHASE ORDER' || 
                 docType === 'PURCHASE REQUEST' || 
                 docType === 'SUPPLIER BILL' ||
                 docType === 'DEBIT NOTE' ||
                 inv.accountCategory === 'PAYABLES' ||
                 (inv.buyerName || '').toUpperCase().startsWith('SUPPLIER:');
          
          if (!isSupplierDoc) return false;
          const refNo = (inv.invoiceNo || inv.poNo || inv.id || '').trim().toUpperCase();
          if (refNo && existingPurchaseRefs.has(refNo)) return false;
          return true;
        })
        .map((inv: any) => {
          const { grandTotal } = calculateInvGrandTotalAndVat(inv);
          const totalVal = (inv.totalInvoiceValue !== undefined && inv.totalInvoiceValue !== null && Number(inv.totalInvoiceValue) !== 0) ? Number(inv.totalInvoiceValue) : (grandTotal || 0);
          const paidVal = Number(inv.amountReceived) || Number(inv.receivedAmount) || Number(inv.amountPaid) || 0;
          const outstanding = totalVal - paidVal;
          const docNo = inv.invoiceNo || inv.poNo || inv.id || `SUPP-${Math.floor(Math.random() * 90000 + 10000)}`;

          return {
            id: docNo,
            source: 'supplier_purchase' as const,
            displayKey: docNo,
            doNo: inv.deliveryNoteNo || inv.doNo || 'N/A',
            date: inv.dated || inv.date || '',
            invoiceNo: docNo,
            poNo: inv.lpoNo || inv.poNo || 'N/A',
            supplierName: (inv.buyerName || inv.companyName || 'SUPPLIER').replace(/^(SUPPLIER|CUSTOMER):\s*/i, ''),
            materialsDetails: `${inv.documentType || 'Supplier Document'} | Ref #${docNo}`,
            totalContractValue: totalVal,
            amountPaid: paidVal,
            dueDate: inv.dueDate || inv.dated || 'N/A',
            invoiceDate: inv.dated || inv.date || '',
            invoicePaidBy: inv.paymentMode || inv.invoicePaidBy || 'BANK WIRE',
            status: inv.paymentStatus || (totalVal === 0 ? 'UNBILLED' : (outstanding <= 0 ? 'PAID' : (paidVal > 0 ? 'PARTIALLY PAID' : 'UNPAID'))),
            type: inv.type || 'standard'
          };
        });

      return [...manualBills, ...doBills, ...purchaseBills, ...savedSupplierDocs];
    }, [payables, inboundDOs, supplierPurchases, savedDocs]);

    const totalOutstanding = combinedPayables.reduce((s, c) => s + (c.totalContractValue - c.amountPaid), 0);

    const filteredPayables = useMemo(() => {
      return combinedPayables.filter(p => {
        if (payablesFilterType === 'all') return true;
        return p.type === payablesFilterType;
      });
    }, [combinedPayables, payablesFilterType]);

    const handleUpdatePaymentsField = (id: string, source: 'manual' | 'material_do' | 'supplier_purchase', field: string, value: any) => {
      if (source === 'manual') {
        const updated = payables.map(p => {
          if (p.id === id) {
            const up = { ...p, [field]: value };
            if (field === 'totalContractValue' || field === 'amountPaid') {
              const tc = Number(up.totalContractValue) || 0;
              const ap = Number(up.amountPaid) || 0;
              up.status = ap >= tc ? 'PAID' : (ap > 0 ? 'PARTIALLY PAID' : 'UNPAID');
            }
            return up;
          }
          return p;
        });
        setPayables(updated);
      } else if (source === 'material_do') {
        const updatedDOs = inboundDOs.map(d => {
          if (d.id === id) {
            const up = { ...d, [field]: value };
            if (field === 'invoiceAmounts' || field === 'invoicePaid') {
              const tc = parseFloat(up.invoiceAmounts) || 0;
              const ap = parseFloat(up.invoicePaid) || 0;
              up.invoiceBalance = (tc - ap).toFixed(2);
              up.invoicePaymentStatus = (tc - ap) <= 0 ? 'PAID' : (ap > 0 ? 'PARTIAL' : 'UNPAID');
            }
            return up;
          }
          return d;
        });
        setInboundDOs(updatedDOs);
        localStorage.setItem('MFI_INCOMING_MATERIALS_LEDGER', JSON.stringify(updatedDOs));
      } else if (source === 'supplier_purchase') {
        const updatedPurchases = supplierPurchases.map(pur => {
          if (pur.id === id) {
            let targetField = field;
            if (field === 'totalContractValue') targetField = 'totalAmount';
            if (field === 'amountPaid') targetField = 'amountPaid';
            if (field === 'invoiceDate' || field === 'date') targetField = 'invoiceDate';
            if (field === 'invoiceNo') targetField = 'invoiceNo';
            if (field === 'poNo') targetField = 'lpoRef';
            if (field === 'doNo') targetField = 'deliveryNoteNo';
            if (field === 'invoicePaidBy') targetField = 'paymentMode';

            const up = { ...pur, [targetField]: value };

            if (targetField === 'totalAmount' || targetField === 'amountPaid') {
              const tc = Number(up.totalAmount) || 0;
              const ap = Number(up.amountPaid) || 0;
              up.paymentStatus = ap >= tc ? 'Paid' : (ap > 0 ? 'Partial' : 'Pending');
            }
            return up;
          }
          return pur;
        });
        setSupplierPurchases(updatedPurchases);
        localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(updatedPurchases));
      }
    };

    const handlePayableKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      rowIdx: number,
      colIdx: number
    ) => {
      const totalRows = filteredPayables.length;
      const totalCols = 5;

      const focusPayableCell = (r: number, c: number) => {
        const el = document.querySelector(`[data-payable-row="${r}"][data-payable-col="${c}"]`) as HTMLElement;
        if (el) {
          el.focus();
          if (el instanceof HTMLInputElement) el.select();
        }
      };

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (rowIdx > 0) focusPayableCell(rowIdx - 1, colIdx);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (rowIdx < totalRows - 1) focusPayableCell(rowIdx + 1, colIdx);
      } else if (e.key === 'ArrowLeft') {
        const target = e.target as any;
        let atStart = true;
        try {
          if (target.tagName === 'INPUT' && target.type === 'text') {
            atStart = target.selectionStart === 0;
          }
        } catch (err) {
          atStart = true;
        }
        if (atStart) {
          e.preventDefault();
          if (colIdx > 0) focusPayableCell(rowIdx, colIdx - 1);
          else if (rowIdx > 0) focusPayableCell(rowIdx - 1, totalCols - 1);
        }
      } else if (e.key === 'ArrowRight') {
        const target = e.target as any;
        let atEnd = true;
        try {
          if (target.tagName === 'INPUT' && target.type === 'text') {
            atEnd = target.selectionEnd === (target.value || '').length;
          }
        } catch (err) {
          atEnd = true;
        }
        if (atEnd) {
          e.preventDefault();
          if (colIdx < totalCols - 1) focusPayableCell(rowIdx, colIdx + 1);
          else if (rowIdx < totalRows - 1) focusPayableCell(rowIdx + 1, 0);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (colIdx < totalCols - 1) focusPayableCell(rowIdx, colIdx + 1);
        else if (rowIdx < totalRows - 1) focusPayableCell(rowIdx + 1, 0);
      }
    };

    const handleDeletePaymentRow = (id: string, source: 'manual' | 'material_do' | 'supplier_purchase') => {
      setDeleteTarget({ id, source });
    };

    const findMatchingDO = (doc: any) => {
      if (!doc) return null;
      return inboundDOs.find(d => 
        (d.id && d.id === doc.id) ||
        (d.doNo && doc.doNo && d.doNo.trim().toUpperCase() === doc.doNo.trim().toUpperCase()) ||
        (d.invoiceNo && doc.invoiceNo && d.invoiceNo.trim().toUpperCase() === doc.invoiceNo.trim().toUpperCase())
      );
    };

    const handleApplyPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectPayableId) {
        alert("Please select outstanding supplier bill to clear!");
        return;
      }

      const targetBill = combinedPayables.find(b => b.id === selectPayableId);
      if (!targetBill) return;

      // Generate next voucher number
      const nextVoucherNo = (() => {
        let max = 1300;
        receiptRegisters.forEach(v => {
          const num = parseInt(v.voucherNo, 10);
          if (!isNaN(num) && num > max) max = num;
        });
        return String(max + 1);
      })();

      // Create official voucher order-wise
      const newVoucher: ReceiptVoucher = {
        id: 'rc-' + Date.now(),
        voucherNo: nextVoucherNo,
        dated: new Date().toISOString().substring(0, 10),
        clientName: targetBill.supplierName,
        amountReceived: updateAmount,
        paymentMode: payoutOption === 'CHEQUE' ? 'CHEQUE' : (payoutOption === 'CASH' ? 'CASH' : 'BANK TRANSFER'),
        chequeNoDetails: details,
        bankName: '',
        narration: `PAYMENT SETTLEMENT VOUCHER FOR INVOICE ${targetBill.invoiceNo || targetBill.id} (LPO: ${targetBill.poNo || '—'})`.toUpperCase(),
        invoiceAllocated: targetBill.invoiceNo || targetBill.id,
        receivedAgainstInvoice: targetBill.invoiceNo || targetBill.id,
        receivedAgainstPo: targetBill.poNo || '—',
        accountCategory: 'PAYABLES',
        targetCustomerId: 'supp-' + targetBill.supplierName.toLowerCase().replace(/\s+/g, '-'),
        autoPostToLedger: true
      };

      const updatedVouchers = [newVoucher, ...receiptRegisters];
      setReceiptRegisters(updatedVouchers);
      localStorage.setItem('MF_RECEIPT_VOUCHERS', JSON.stringify(updatedVouchers));

      if (targetBill.source === 'manual') {
        const updated = payables.map(p => {
          if (p.id === selectPayableId) {
            const costLeft = p.totalContractValue - p.amountPaid;
            const paidThisTime = Math.min(updateAmount, costLeft);
            const nextPaid = p.amountPaid + paidThisTime;
            const hasFinished = nextPaid >= p.totalContractValue;
            return {
              ...p,
              amountPaid: nextPaid,
              status: hasFinished ? 'PAID' : `PARTIAL CLEANUP BY ${payoutOption} (${details.toUpperCase()})`
            };
          }
          return p;
        });
        setPayables(updated);
        triggerToast("Supplier Accounts Payable ledger successfully reconciled and Order-Wise payment voucher generated!");
      } else if (targetBill.source === 'material_do') {
        const updatedDOs = inboundDOs.map(d => {
          if (d.id === selectPayableId) {
            const totalVal = parseFloat(d.invoiceAmounts) || 0;
            const currentPaid = parseFloat(d.invoicePaid) || 0;
            const costLeft = totalVal - currentPaid;
            const paidThisTime = Math.min(updateAmount, costLeft);
            const nextPaid = currentPaid + paidThisTime;
            return {
              ...d,
              invoicePaid: nextPaid.toFixed(2),
              invoiceBalance: (totalVal - nextPaid).toFixed(2),
              invoicePaidBy: payoutOption,
              invoicePaymentStatus: (totalVal - nextPaid) <= 0 ? 'PAID' : 'PARTIAL'
            };
          }
          return d;
        });
        setInboundDOs(updatedDOs);
        localStorage.setItem('MFI_INCOMING_MATERIALS_LEDGER', JSON.stringify(updatedDOs));
        triggerToast("Goods Received Note Invoice Payment updated and Order-Wise payment voucher generated!");
      } else if (targetBill.source === 'supplier_purchase') {
        const updatedPurchases = supplierPurchases.map(p => {
          if (p.id === selectPayableId) {
            const totalVal = Number(p.totalAmount || p.subtotal || 0);
            let currentPaid = 0;
            if (p.amountPaid !== undefined) {
              currentPaid = Number(p.amountPaid);
            } else if (p.paidAmount !== undefined) {
              currentPaid = Number(p.paidAmount);
            } else if (p.paymentStatus === 'Paid') {
              currentPaid = totalVal;
            } else if (p.paymentStatus === 'Partial' || p.paymentStatus === 'Partially Paid') {
              currentPaid = totalVal / 2;
            }

            const costLeft = totalVal - currentPaid;
            const paidThisTime = Math.min(updateAmount, costLeft);
            const nextPaid = currentPaid + paidThisTime;
            return {
              ...p,
              amountPaid: nextPaid,
              paymentStatus: nextPaid >= totalVal ? 'Paid' : 'Partial'
            };
          }
          return p;
        });
        setSupplierPurchases(updatedPurchases);
        localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(updatedPurchases));
        triggerToast("Supplier Purchase Invoice Payment updated and Order-Wise payment voucher generated!");
      }

      setSelectPayableId('');
    };

    const handleAddSupplierBill = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMaterialsDetails.trim()) {
        alert("Please specify metallic material details!");
        return;
      }
      const newBill = {
        id: newBillId.toUpperCase().trim(),
        doNo: newDoNo.toUpperCase().trim() || 'M-PAY',
        date: newDueDate,
        invoiceNo: newBillId.toUpperCase().trim() || 'INV-TEMP',
        poNo: newLpoNo.toUpperCase().trim() || 'PO-TEMP',
        supplierName: newSupplierName,
        materialsDetails: newMaterialsDetails.trim(),
        totalContractValue: newContractValue,
        amountPaid: newInitialPaid,
        currency: 'AED',
        dueDate: newDueDate,
        invoiceDate: newDueDate,
        invoicePaidBy: newInvoicePaidBy,
        status: newInitialPaid >= newContractValue ? 'PAID' : (newInitialPaid > 0 ? 'PARTIALLY PAID' : 'UNPAID')
      };
      setPayables([newBill, ...payables]);
      
      setNewBillId('PAY-' + Math.floor(Math.random() * 900 + 100));
      setNewDoNo('DO-' + Math.floor(Math.random() * 90000 + 10000));
      setNewLpoNo('LPO-' + Math.floor(Math.random() * 90000 + 10000));
      setNewMaterialsDetails('');
      setNewContractValue(30000);
      setNewInitialPaid(0);
      triggerToast(`Successfully registered Supplier Billing liability ${newBill.id}!`);
      setSupplierActionSubTab('RECONCILE');
    };

    const handlePrintSupplierStatement = (supplierName: string) => {
      const upClient = supplierName.toUpperCase().trim();
      const lines: any[] = [];

      // Add manual supplier bills
      const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
      const manual = savedPay ? JSON.parse(savedPay) : [];
      const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      const dos = savedDOs ? JSON.parse(savedDOs) : [];
      const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
      const purchasesList = savedPurchases ? JSON.parse(savedPurchases) : [];

      manual.forEach((p: any) => {
        if (p.supplierName && p.supplierName.toUpperCase().trim() === upClient) {
          lines.push({
            date: p.invoiceDate || p.date || '2026-05-15',
            ref: p.invoiceNo || p.id,
            particulars: `SUPPLIER INVOICE BILL: ${p.materialsDetails || 'Raw Materials Cargo'}`,
            debit: 0,
            credit: Number(p.totalContractValue) || 0
          });

          if (p.amountPaid > 0) {
            lines.push({
              date: p.date || '2026-05-15',
              ref: `PAY-${p.invoiceNo || p.id}`,
              particulars: `SETTLEMENT VOUCHER RELEASED VIA ${p.invoicePaidBy || 'BANK'}`,
              debit: Number(p.amountPaid) || 0,
              credit: 0
            });
          }
        }
      });

      dos.forEach((d: any) => {
        if (d.supplierName && d.supplierName.toUpperCase().trim() === upClient) {
          const tc = parseFloat(d.invoiceAmounts) || 0;
          const ap = parseFloat(d.invoicePaid) || 0;

          lines.push({
            date: d.invoiceDate || d.date || '2026-05-15',
            ref: d.invoiceNo || `GRN-${d.doNo || d.id}`,
            particulars: `INCOMING GRN MATERIALS RECEIPT (Ref: DO-${d.doNo || d.id})`,
            debit: 0,
            credit: tc
          });

          if (ap > 0) {
            lines.push({
              date: d.date || '2026-05-15',
              ref: `PAY-${d.invoiceNo || d.id}`,
              particulars: `BANK PAYOUT SETTLEMENT RELEASED`,
              debit: ap,
              credit: 0
            });
          }
        }
      });

      purchasesList.forEach((pur: any) => {
        if (pur.supplierName && pur.supplierName.toUpperCase().trim() === upClient) {
          const tc = Number(pur.totalAmount || pur.subtotal || 0);
          let ap = 0;
          if (pur.amountPaid !== undefined) {
            ap = Number(pur.amountPaid);
          } else if (pur.paidAmount !== undefined) {
            ap = Number(pur.paidAmount);
          } else if (pur.paymentStatus === 'Paid') {
            ap = tc;
          } else if (pur.paymentStatus === 'Partial' || pur.paymentStatus === 'Partially Paid') {
            ap = tc / 2;
          }

          lines.push({
            date: pur.invoiceDate || pur.date || '2026-04-12',
            ref: pur.invoiceNo || `PUR-${pur.id}`,
            particulars: `TAX INVOICE: DN-${pur.deliveryNoteNo || 'N/A'} (LPO-${pur.lpoRef || 'N/A'})`,
            debit: 0,
            credit: tc
          });

          if (ap > 0) {
            lines.push({
              date: pur.date || pur.invoiceDate || '2026-04-12',
              ref: `PAY-PUR-${pur.id}`,
              particulars: `BANK PAYOUT SETTLEMENT RELEASED VIA ${pur.paymentMode || 'BANK WIRE'}`,
              debit: ap,
              credit: 0
            });
          }
        }
      });

      if (lines.length === 0) {
        lines.push({
          date: '2026-05-01',
          ref: 'OB-SUP-2026',
          particulars: 'SUPPLIER LEDGER OPENING DEFICIT BOUGHT FORWARD',
          debit: 0,
          credit: 12000.00
        });
        lines.push({
          date: '2026-05-12',
          ref: 'PAY-OB-SUP',
          particulars: 'POSTED PDC LIQUIDATION OUTFLOW',
          debit: 10000.00,
          credit: 0
        });
      }

      // Sort chronological
      const sorted = lines.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let currentBal = 0;
      const supplierLedgerLines = sorted.map(line => {
        currentBal += (line.credit - line.debit);
        return {
          ...line,
          runningBalance: currentBal
        };
      });

      const totalDebits = supplierLedgerLines.reduce((acc, curr) => acc + curr.debit, 0);
      const totalCredits = supplierLedgerLines.reduce((acc, curr) => acc + curr.credit, 0);
      const finalOutstanding = currentBal;
      const now = new Date().getTime();
      let d1_30 = 0, d31_60 = 0, d61_90 = 0, d90_plus = 0;
      supplierLedgerLines.forEach(line => {
        if (line.credit > 0) {
          const diffDays = Math.max(0, Math.floor((now - new Date(line.date).getTime()) / (1000 * 3600 * 24)));
          if (diffDays <= 30) d1_30 += line.credit;
          else if (diffDays <= 60) d31_60 += line.credit;
          else if (diffDays <= 90) d61_90 += line.credit;
          else d90_plus += line.credit;
        }
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Supplier Statement of Account - ${upClient}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
            @page { size: A4 portrait; margin: 0 !important; }
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 6mm 5mm 8mm 5mm !important;
              font-size: 10px;
              line-height: 1.45;
              background-color: #ffffff;
              text-transform: uppercase;
            }
            .header-banner {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2.5px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .org-title h1 {
              font-size: 18px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 4px 0;
              letter-spacing: -0.5px;
            }
            .org-title p {
              font-size: 8.5px;
              color: #475569;
              font-weight: 600;
              margin: 2px 0;
            }
            .doc-title-badge {
              background-color: #0f172a;
              color: #ffffff;
              font-size: 13px;
              font-weight: 900;
              padding: 8px 18px;
              border-radius: 6px;
              letter-spacing: 1.5px;
              text-align: center;
            }
            .meta-strip {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 16px;
              margin-bottom: 20px;
            }
            .meta-card {
              border: 1px solid #cbd5e1;
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 12px 14px;
            }
            .meta-card-title {
              font-size: 7.5px;
              font-weight: 800;
              color: #64748b;
              font-family: 'JetBrains Mono', monospace;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .payee-name {
              font-size: 14px;
              font-weight: 900;
              color: #0f172a;
            }
            .summary-cards-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 14px;
              margin-bottom: 20px;
            }
            .summary-card {
              border: 1.5px solid #cbd5e1;
              border-radius: 8px;
              padding: 12px;
              background-color: #ffffff;
            }
            .summary-card.highlight {
              border-color: #be123c;
              background-color: #fff1f2;
            }
            .card-lbl {
              font-size: 7.5px;
              font-weight: 800;
              color: #64748b;
              font-family: 'JetBrains Mono', monospace;
            }
            .card-val {
              font-size: 15px;
              font-weight: 900;
              font-family: 'JetBrains Mono', monospace;
              margin-top: 4px;
            }
            .aging-strip {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              overflow: hidden;
              margin-bottom: 24px;
              background-color: #f8fafc;
            }
            .aging-cell {
              padding: 8px 10px;
              border-right: 1px solid #cbd5e1;
              text-align: center;
            }
            .aging-cell:last-child { border-right: none; }
            .aging-lbl { font-size: 7px; font-weight: 800; color: #64748b; }
            .aging-val { font-size: 11px; font-weight: 850; font-family: 'JetBrains Mono', monospace; color: #0f172a; margin-top: 2px; }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              border: 1.5px solid #0f172a;
              margin-bottom: 24px;
            }
            .ledger-table th {
              background-color: #0f172a;
              color: #ffffff;
              font-weight: 800;
              font-size: 8.5px;
              padding: 10px 8px;
              text-align: left;
              border: 1px solid #0f172a;
            }
            .ledger-table td {
              padding: 9px 8px;
              border: 1px solid #cbd5e1;
              font-size: 9px;
              font-weight: 600;
            }
            .ledger-table tbody tr:nth-child(even) { background-color: #f8fafc; }
            .ref-badge {
              font-family: 'JetBrains Mono', monospace;
              font-weight: 800;
              color: #1e3a8a;
            }
            .text-right { text-align: right; font-family: 'JetBrains Mono', monospace; }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 40px;
            }
            .sig-box {
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
            }
            .sig-line {
              border-top: 1.5px solid #0f172a;
              width: 80%;
              margin: 36px auto 6px auto;
            }
            .sig-lbl { font-size: 8px; font-weight: 800; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="org-title">
              <h1>MARINE FASTENERS INDUSTRIES L.L.C.</h1>
              <p>PLOT #0654, SHED #31, NEW INDUSTRIAL AREA, AJMAN, UAE</p>
              <p>TEL: +971 6 748 3000 | TRN: 100440509600003</p>
            </div>
            <div>
              <div class="doc-title-badge">SUPPLIER STATEMENT OF ACCOUNT</div>
              <div style="text-align: right; font-size: 8px; font-weight: 800; color: #64748b; margin-top: 6px; font-family: 'JetBrains Mono', monospace;">CURRENCY: AED (UNITED ARAB EMIRATES DIRHAM)</div>
            </div>
          </div>

          <div class="meta-strip">
            <div class="meta-card">
              <div class="meta-card-title">ISSUED TO / SUPPLIER ACCOUNT DETAILS</div>
              <div class="payee-name">${upClient}</div>
              <div style="font-size: 8.5px; font-weight: 700; color: #475569; margin-top: 4px;">LEDGER CODE: SUPP-${upClient.substring(0, 4).toUpperCase()}-2026</div>
            </div>
            <div class="meta-card">
              <div class="meta-card-title">STATEMENT METADATA</div>
              <div style="font-size: 9px; font-weight: 700; color: #0f172a;">STATEMENT DATE: ${new Date().toISOString().split('T')[0]}</div>
              <div style="font-size: 9px; font-weight: 700; color: #0f172a; margin-top: 2px;">TOTAL ENTRIES: ${supplierLedgerLines.length} RECORDS</div>
              <div style="font-size: 9px; font-weight: 800; color: ${finalOutstanding > 0 ? '#be123c' : '#059669'}; margin-top: 2px;">STATUS: ${finalOutstanding > 0 ? 'PAYMENT OUTSTANDING' : 'SETTLED & UP TO DATE'}</div>
            </div>
          </div>

          <div class="summary-cards-grid">
            <div class="summary-card">
              <div class="card-lbl">TOTAL BILLED (CREDITS)</div>
              <div class="card-val" style="color: #0f172a;">AED ${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <div class="card-lbl">TOTAL PAYMENTS RELEASED (DEBITS)</div>
              <div class="card-val" style="color: #059669;">AED ${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card highlight">
              <div class="card-lbl" style="color: #be123c;">NET OUTSTANDING DUE</div>
              <div class="card-val" style="color: #be123c;">AED ${finalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div style="font-size: 8px; font-weight: 800; color: #475569; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace;">INVOICE AGING BREAKDOWN (EXCL. PAYMENTS)</div>
          <div class="aging-strip">
            <div class="aging-cell"><div class="aging-lbl">0 - 30 DAYS</div><div class="aging-val">AED ${d1_30.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div></div>
            <div class="aging-cell"><div class="aging-lbl">31 - 60 DAYS</div><div class="aging-val">AED ${d31_60.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div></div>
            <div class="aging-cell"><div class="aging-lbl">61 - 90 DAYS</div><div class="aging-val">AED ${d61_90.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div></div>
            <div class="aging-cell"><div class="aging-lbl">90+ DAYS (OVERDUE)</div><div class="aging-val" style="color: #be123c;">AED ${d90_plus.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div></div>
          </div>

          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 12%; text-align: center;">DATE</th>
                <th style="width: 18%;">REF NO / DOC TYPE</th>
                <th style="width: 34%;">PARTICULARS / DESCRIPTION</th>
                <th style="width: 12%;" class="text-right">DEBIT (PAID)</th>
                <th style="width: 12%;" class="text-right">CREDIT (INVOICE)</th>
                <th style="width: 12%;" class="text-right">BALANCE</th>
              </tr>
            </thead>
            <tbody>
              ${supplierLedgerLines.map(line => `
                <tr>
                  <td style="text-align: center; font-family: monospace; font-weight: 700; color: #475569;">${line.date}</td>
                  <td class="ref-badge">${line.ref}</td>
                  <td>${line.particulars}</td>
                  <td class="text-right" style="${line.debit > 0 ? 'font-weight: 800; color: #059669;' : 'color: #cbd5e1;'}">
                    ${line.debit > 0 ? `AED ${line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td class="text-right" style="${line.credit > 0 ? 'font-weight: 800; color: #0f172a;' : 'color: #cbd5e1;'}">
                    ${line.credit > 0 ? `AED ${line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td class="text-right" style="font-weight: 900; color: #1e3a8a;">
                    AED ${line.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signatures-grid">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-lbl">AUTHORIZED SIGNATORY - ACCOUNTS DEPT</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-lbl">SUPPLIER AUDIT RECONCILIATION STAMP & SIGNATURE</div>
            </div>
          </div>
        </body>
        </html>
      `;

      printHtml(htmlContent, `MFI_Supplier_SOA_${upClient.replace(/\s+/g, '_')}`);
    };

    // Print helper that injector passes raw variables through
    const handlePrintDocument = (p: any, optionalPreviewDO?: any) => {
      const matchedPurchase = supplierPurchases.find(sp => sp.id === p.id || (sp.invoiceNo && p.invoiceNo && sp.invoiceNo.trim().toUpperCase() === p.invoiceNo.trim().toUpperCase()));
      if (p.source === 'supplier_purchase' || optionalPreviewDO?.type === 'supplier_tax_invoice' || matchedPurchase) {
        const pur = matchedPurchase || {
          id: p.id,
          invoiceNo: p.invoiceNo || optionalPreviewDO?.invoiceNo || p.id,
          invoiceDate: p.date || p.invoiceDate || optionalPreviewDO?.date || '2026-05-15',
          lpoRef: p.poNo || optionalPreviewDO?.poNo || '—',
          category: 'Raw Materials & Hardware',
          paymentTerms: '30 Days Credit',
          deliveryDate: p.date || '—',
          deliveryTerms: optionalPreviewDO?.deliveryTerms || 'DDP - AJMAN PLANT',
          currency: 'AED',
          supplierName: p.supplierName || optionalPreviewDO?.supplierName || 'SUPPLIER',
          supplierTrn: optionalPreviewDO?.trn || '—',
          supplierAddress: optionalPreviewDO?.supplierAddress || 'UNITED ARAB EMIRATES',
          supplierAttentionTo: optionalPreviewDO?.receiverName || 'ACCOUNTS DEPT',
          supplierPhone: optionalPreviewDO?.phone || '—',
          deliveryNoteNo: p.doNo || optionalPreviewDO?.doNo || '—',
          items: optionalPreviewDO?.items || [
            { id: '1', description: p.materialsDetails || 'TAX INVOICE PURCHASE', qty: 1, unit: 'LOT', unitPrice: p.totalContractValue || 0, per: 'lot', vatRate: 5 }
          ],
          subtotal: p.totalContractValue || 0,
          vatAmount: (p.totalContractValue || 0) * 0.05,
          totalAmount: p.totalContractValue || 0,
          discount: 0,
          freightShipping: 0,
          remarks: 'AUTOMATED TAX INVOICE RETRIEVAL FROM PAYABLES LEDGER'
        };

        const cur = pur.currency || 'AED';
        const sub = Number(pur.subtotal || pur.totalAmount || 0);
        const disc = Number(pur.discount || 0);
        const discAmt = sub * (disc / 100);
        const taxable = sub - discAmt;
        const vat = Number(pur.vatAmount || 0);
        const freight = Number(pur.freightShipping || 0);
        const tot = Number(pur.totalAmount || (taxable + vat + freight) || 0);
        const itemsList = pur.items && pur.items.length > 0 ? pur.items : [
          { id: '1', description: p.materialsDetails || 'TAX INVOICE PURCHASE', qty: 1, unit: 'LOT', unitPrice: tot, per: 'lot', vatRate: 5 }
        ];
        const totalQty = itemsList.reduce((acc: any, it: any) => acc + (Number(it.qty) || 0), 0);
        const totalQtyUnit = itemsList[0]?.unit || 'PCS.';

        const taxInvoiceHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Supplier Tax Invoice - ${pur.invoiceNo}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
              @page { size: portrait; margin: 0 !important; }
              body { font-family: 'Inter', -apple-system, sans-serif; padding: 6mm 5mm 8mm 5mm !important; margin: 0; font-size: 10px; text-transform: uppercase; line-height: 1.4; color: #1e293b; background-color: #ffffff; }
              .title-banner { text-align: center; border: 1.5px solid #1e3a8a; background-color: #f8fafc; border-radius: 8px; padding: 12px 0; margin-bottom: 20px; }
              .title-banner h2 { margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 4px; color: #be123c; }
              .header-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; margin-bottom: 18px; }
              .buying-org-box { border: 1px dashed rgba(30, 58, 138, 0.4); background-color: rgba(248, 250, 252, 0.5); border-radius: 8px; padding: 14px; text-align: left; }
              .buying-org-box h1 { margin: 0 0 6px 0; font-size: 12px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.5px; }
              .buying-org-box p { margin: 4px 0; font-size: 9px; color: #475569; font-weight: 600; }
              .trn-badge { display: inline-block; margin-top: 8px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 20px; padding: 4px 12px; font-size: 9px; font-weight: 800; color: #1e3a8a; font-family: 'JetBrains Mono', monospace; }
              .metadata-box { border: 1px dashed rgba(30, 58, 138, 0.4); background-color: rgba(248, 250, 252, 0.5); border-radius: 8px; padding: 4px; }
              .metadata-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background-color: #ffffff; }
              .meta-cell { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; text-align: left; }
              .meta-cell:nth-child(2n) { border-right: none; }
              .meta-label { font-size: 7.5px; font-weight: 800; color: #64748b; font-family: 'JetBrains Mono', monospace; display: block; }
              .meta-value { font-size: 10px; font-weight: 900; color: #0f172a; margin-top: 2px; }
              .vendor-details-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background-color: #f8fafc; margin-bottom: 20px; text-align: left; }
              .vendor-title { font-size: 8px; font-weight: 900; color: #be123c; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-bottom: 6px; }
              .vendor-name { font-size: 15px; font-weight: 900; color: #0f172a; margin-bottom: 6px; }
              .vendor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 8.5px; color: #475569; font-weight: 600; }
              .items-table { width: 100%; border-collapse: collapse; border: 1.5px solid #1e3a8a; margin-bottom: 20px; }
              .items-table th { background-color: #1e3a8a; color: #ffffff; font-size: 8.5px; font-weight: 800; padding: 8px 6px; text-align: left; border: 1px solid #1e3a8a; }
              .items-table td { padding: 8px 6px; border: 1px solid #cbd5e1; font-size: 9px; font-weight: 600; color: #1e293b; }
              .totals-table-box { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background-color: #f8fafc; margin-top: 10px; }
              .totals-row { display: flex; justify-content: space-between; padding: 6px 14px; border-bottom: 1px solid #e2e8f0; font-size: 9px; font-weight: 700; color: #475569; }
              .totals-row.net-payable { border-top: 1.5px solid #1e3a8a; border-bottom: none; background-color: #fff1f2; padding: 12px 14px; }
              .net-payable-title { font-size: 11px; font-weight: 900; color: #be123c; }
              .net-payable-value { font-size: 16px; font-weight: 900; color: #be123c; font-family: 'JetBrains Mono', monospace; }
            </style>
          </head>
          <body>
            <div class="title-banner"><h2>TAX INVOICE</h2></div>
            <div class="header-grid">
              <div class="buying-org-box">
                <h1>MARINE FASTENERS INDUSTRIES L.L.C. (SOLE PROPRIETORSHIP)</h1>
                <p>ADD: PLOT #0654, SHED #31, NEW INDUSTRIAL AREA AJMAN, UAE</p>
                <p>TEL: +971 6 748 3000 | EMAIL: PURCHASE@MARINEFASTENERS.CO</p>
                <div class="trn-badge">TRN: 100440509600003</div>
              </div>
              <div class="metadata-box">
                <div class="metadata-grid">
                  <div class="meta-cell"><span class="meta-label">INVOICE NO</span><div class="meta-value">${pur.invoiceNo}</div></div>
                  <div class="meta-cell"><span class="meta-label">INVOICE DATE</span><div class="meta-value">${pur.invoiceDate}</div></div>
                  <div class="meta-cell"><span class="meta-label">LPO REF</span><div class="meta-value">${pur.lpoRef}</div></div>
                  <div class="meta-cell"><span class="meta-label">CATEGORY</span><div class="meta-value">${pur.category || 'General'}</div></div>
                  <div class="meta-cell"><span class="meta-label">PAYMENT TERMS</span><div class="meta-value">${pur.paymentTerms || 'Immediate'}</div></div>
                  <div class="meta-cell"><span class="meta-label">DELIVERY DATE</span><div class="meta-value">${pur.deliveryDate || 'Immediate'}</div></div>
                </div>
              </div>
            </div>
            <div class="vendor-details-box">
              <div class="vendor-title">SUPPLIER DETAILS (ISSUED BY)</div>
              <div class="vendor-name">${pur.supplierName}</div>
              <div class="vendor-grid">
                <div>TRN: <strong>${pur.supplierTrn || '—'}</strong></div>
                <div>PHONE: <strong>${pur.supplierPhone || '—'}</strong></div>
                <div>DELIVERY NOTE: <strong>${pur.deliveryNoteNo || '—'}</strong></div>
                <div style="grid-column: span 3;">ADDRESS: <strong>${pur.supplierAddress || 'UNITED ARAB EMIRATES'}</strong></div>
              </div>
            </div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;">SN</th>
                  <th style="width: 45%;">DESCRIPTION / ITEM DETAILS</th>
                  <th style="width: 10%; text-align: center;">QTY</th>
                  <th style="width: 10%; text-align: center;">UNIT</th>
                  <th style="width: 15%; text-align: right;">UNIT PRICE (${cur})</th>
                  <th style="width: 15%; text-align: right;">TOTAL (${cur})</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList.map((item: any, idx: number) => {
                  const lineTotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                  return `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.qty}</td>
                    <td style="text-align: center;">${item.unit}</td>
                    <td style="text-align: right; font-family: monospace;">${Number(item.unitPrice).toFixed(2)}</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold;">${lineTotal.toFixed(2)}</td>
                  </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <div class="totals-table-box">
              <div class="totals-row"><span>SUBTOTAL (EXCL. VAT)</span><span style="font-family: monospace;">${cur} ${sub.toFixed(2)}</span></div>
              <div class="totals-row"><span>DISCOUNT</span><span style="font-family: monospace;">-${cur} ${discAmt.toFixed(2)}</span></div>
              <div class="totals-row"><span>NET TAXABLE VALUE</span><span style="font-family: monospace;">${cur} ${taxable.toFixed(2)}</span></div>
              <div class="totals-row"><span>VAT AMOUNT (5%)</span><span style="font-family: monospace;">${cur} ${vat.toFixed(2)}</span></div>
              ${freight > 0 ? `<div class="totals-row"><span>FREIGHT & SHIPPING</span><span style="font-family: monospace;">${cur} ${freight.toFixed(2)}</span></div>` : ''}
              <div class="totals-row net-payable">
                <div><div class="net-payable-title">NET PAYABLE AMOUNT</div><div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">TOTAL QUANTITY: ${totalQty} ${totalQtyUnit}</div></div>
                <div class="net-payable-value">${cur} ${tot.toFixed(2)}</div>
              </div>
            </div>
          </body>
        </html>
        `;
        printHtml(taxInvoiceHtml, `Supplier_Tax_Invoice_${pur.invoiceNo || p.invoiceNo || p.id}`);
        return;
      }
      const activeDOToPrint = optionalPreviewDO || findMatchingDO(p);
      let originalItems = [];
      if (activeDOToPrint && activeDOToPrint.items) {
        originalItems = activeDOToPrint.items;
      } else {
        originalItems = [{
          sn: 1,
          description: p.materialsDetails || 'HIGH STRENGTH GALVANIZED FASTENER MEMBERS',
          size: 'M24',
          finish: 'HOT DIP GALVANIZED',
          unit: 'PCS',
          qty: 2500,
          marking: 'MFI A325',
          microns: '85',
          coatings: 'GALVANIZED',
          threads: 'METRIC 6G',
          remarks: 'PALLET 1-2',
          qcNotes: 'PASSED VISUAL DETAILS'
        }];
      }

      const invoiceAmounts = activeDOToPrint ? (Number(activeDOToPrint.invoiceAmounts) || Number(activeDOToPrint.totalContractValue) || 0) : (Number(p.totalContractValue) || 0);
      const invoicePaid = activeDOToPrint ? (Number(activeDOToPrint.invoicePaid) || Number(activeDOToPrint.amountPaid) || 0) : (Number(p.amountPaid) || 0);
      const balance = invoiceAmounts - invoicePaid;

      const isCoating = activeDOToPrint && (activeDOToPrint.type === 'coating' || String(activeDOToPrint.type).toLowerCase().includes('coating'));
      const isTaxInvoice = activeDOToPrint && (activeDOToPrint.type === 'supplier_tax_invoice');
      const docTitle = isTaxInvoice ? 'TAX INVOICE' : (isCoating ? 'COATING GOODS RECEIVED NOTE' : 'GOODS RECEIVED NOTE');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docTitle} - ${activeDOToPrint?.doNo || p.doNo || p.id}</title>
          <style>
            @page {
              size: landscape;
              margin: 0.8cm;
            }
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              font-size: 11px;
            }
            .container {
              width: 100%;
            }
            .title {
              font-size: 18px;
              font-weight: 800;
              color: #dc2626;
              text-align: center;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .subtitle {
              text-align: center;
              font-size: 10px;
              color: #475569;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .divider {
              border-top: 1.5px solid #cbd5e1;
              margin: 8px 0;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 15px;
              margin-bottom: 14px;
            }
            .details-box {
              border: 1.5px solid #000000;
              border-radius: 4px;
              padding: 8px;
              font-size: 10px;
            }
            .field-table {
              width: 100%;
              border-collapse: collapse;
              border: 1.5px solid #000000;
            }
            .field-table td {
              border: 1px solid #000000;
              padding: 4px 6px;
              text-transform: uppercase;
            }
            .field-label {
              font-size: 8px;
              font-weight: bold;
              color: #475569;
              display: block;
              margin-bottom: 2px;
            }
            .field-value {
              font-weight: bold;
              font-size: 10.5px;
            }
            .materials-table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000000;
              margin-bottom: 16px;
            }
            .materials-table th {
              font-size: 9px;
              text-transform: uppercase;
              padding: 6px 4px;
              border: 1px solid #000000;
              background-color: #f1f5f9;
            }
            .materials-table td {
              padding: 5px 4px;
              border: 1px solid #000000;
              text-align: center;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            .sig-box {
              border: 1.5px solid #000000;
              border-radius: 4px;
              padding: 10px;
              text-align: left;
            }
            .sig-box-title {
              font-weight: bold;
              font-size: 9px;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            .sig-line {
              border-bottom: 1px dashed #64748b;
              margin-top: 15px;
              height: 20px;
            }
            .financials-summary {
              width: 100%;
              margin-top: 10px;
              margin-bottom: 15px;
              border-collapse: collapse;
              font-family: inherit;
            }
            .financials-summary td {
              padding: 6px;
              border: 1px solid #000;
            }
            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #64748b;
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <table class="materials-table">
              <thead>
                <tr style="border: none; background: #ffffff;">
                  <td colspan="11" style="border: none; padding: 0 0 6px 0; text-align: left; background: #ffffff;">
                    <div class="title">${docTitle}</div>
                    <div class="subtitle">MARINE FASTENERS INDUSTRIES L.L.C.</div>
                    <div class="divider"></div>

                    <div class="details-grid">
                      <!-- Left side: Deliver to & Supplier details -->
                      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                        <div style="margin-bottom: 8px; text-transform: uppercase;">
                          <strong style="font-size: 9px; color: #c2410c;">DELIVER TO:</strong>
                          <div style="font-weight: 800; font-size: 12px; color: #0c449e; margin-top: 2px;">MARINE FASTENERS INDUSTRIES L.L.C.</div>
                          <div style="font-size: 9.5px; margin-top: 2px;">Plot #0654, Shed No # 31, New Industrial Area, Ajman, UAE</div>
                          <div style="font-size: 8.5px; color: #475569; margin-top: 1px;">TRN: 100440509600003 | EMAIL: RECEIVING@MARINEFASTENERS.CO</div>
                        </div>
                        
                        <div class="details-box" style="background-color: #f8fafc; border: 1.5px solid #000000; border-radius: 4px;">
                          <strong style="color: #0c449e; font-size: 9px; display: block; margin-bottom: 4px; text-transform: uppercase;">SUPPLIER / CONSIGNOR PARTICULARS:</strong>
                          <div style="font-weight: 800; font-size: 11px; text-transform: uppercase;">${activeDOToPrint?.supplierName || p.supplierName || '—'}</div>
                          <div style="font-size: 9.5px; color: #334155; margin-top: 2px; text-transform: uppercase;">${activeDOToPrint?.supplierAddress || 'PLOT 41B, PHASE 3, INDUSTRIAL AREA, JEDDAH'}</div>
                          <div style="font-size: 9.5px; font-weight: bold; margin-top: 4px; text-transform: uppercase;">
                            TRN: ${activeDOToPrint?.trn || '300182764500003'} &nbsp;&nbsp;|&nbsp;&nbsp; TEL: ${activeDOToPrint?.phone || '—'}
                          </div>
                        </div>
                      </div>

                      <!-- Right side: Precise transactional fields -->
                      <div>
                        <table class="field-table">
                          <tr>
                            <td colspan="2">
                              <span class="field-label">INVOICE NO:</span>
                              <span class="field-value">${activeDOToPrint?.invoiceNo || p.invoiceNo || '—'}</span>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <span class="field-label">DO NO:</span>
                              <span class="field-value" style="color: #dc2626;">${activeDOToPrint?.doNo || p.doNo || '—'}</span>
                            </td>
                            <td>
                              <span class="field-label">DATE:</span>
                              <span class="field-value">${activeDOToPrint?.date || p.date || p.invoiceDate || '—'}</span>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2">
                              <span class="field-label">PO NO (LPO):</span>
                              <span class="field-value">${activeDOToPrint?.poNo || p.poNo || '—'}</span>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <span class="field-label">DISPATCH BY:</span>
                              <span class="field-value" style="font-size: 9.5px;">${activeDOToPrint?.dispatchBy || 'BY ROAD (TRAILER)'}</span>
                            </td>
                            <td>
                              <span class="field-label">DELIVERY TERMS:</span>
                              <span class="field-value" style="font-size: 9.5px;">${activeDOToPrint?.deliveryTerms || 'DDP - DUBAI PORT'}</span>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2">
                              <span class="field-label">MADE IN:</span>
                              <span class="field-value">${activeDOToPrint?.madeIn || 'UAE'}</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
                ${isTaxInvoice ? `
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th style="text-align: left; padding-left: 6px;">DESCRIPTION</th>
                    <th style="width: 8%;">SIZE</th>
                    <th style="width: 8%;">FINISH</th>
                    <th style="width: 6%;">UNIT</th>
                    <th style="width: 8%;">QTY</th>
                    <th style="width: 10%; text-align: right; padding-right: 6px;">UNIT PRICE (AED)</th>
                    <th style="width: 12%; text-align: right; padding-right: 6px;">TAXABLE</th>
                    <th style="width: 8%; text-align: right; padding-right: 6px;">VAT (5%)</th>
                    <th style="width: 12%; text-align: right; padding-right: 6px;">NET AMOUNT (AED)</th>
                    <th style="width: 10%;">REMARKS</th>
                  </tr>
                ` : isCoating ? `
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th style="text-align: left; padding-left: 6px;">DESCRIPTION</th>
                    <th style="width: 8%;">SIZE</th>
                    <th style="width: 10%;">FINISH</th>
                    <th style="width: 6%;">UNIT</th>
                    <th style="width: 8%;">QTY</th>
                    <th style="width: 15%;">MARKING VISIBLE</th>
                    <th style="width: 12%;">ADHESION TEST</th>
                    <th style="width: 10%;">THREADS</th>
                    <th style="width: 8%;">MICRONS</th>
                    <th style="width: 8%;">REMARKS</th>
                  </tr>
                ` : `
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th style="text-align: left; padding-left: 6px;">DESCRIPTION</th>
                    <th style="width: 8%;">SIZE</th>
                    <th style="width: 10%;">FINISH</th>
                    <th style="width: 6%;">UNIT</th>
                    <th style="width: 8%;">QTY</th>
                    <th style="width: 12%;">MARKING</th>
                    <th style="width: 8%;">MICRONS</th>
                    <th style="width: 12%;">COATINGS</th>
                    <th style="width: 10%;">THREADS</th>
                    <th style="width: 10%;">REMARKS</th>
                  </tr>
                `}
              </thead>
              <tbody>
                ${originalItems.map((row: any, idx: number) => {
                  if (isTaxInvoice) {
                    const q = parseFloat(row.qty) || 0;
                    const up = parseFloat(row.unitPrice) || 0;
                    const taxable = q * up;
                    const vat = taxable * 0.05;
                    const net = taxable * 1.05;
                    return `
                      <tr>
                        <td>${idx + 1}</td>
                        <td style="text-align: left; padding-left: 6px; font-weight: bold;">${row.description || '—'}</td>
                        <td>${row.size || '—'}</td>
                        <td>${row.finish || '—'}</td>
                        <td>${row.unit || 'PCS'}</td>
                        <td style="font-weight: 800; color: #0c449e;">${q.toLocaleString()}</td>
                        <td style="text-align: right; padding-right: 6px; font-family: monospace;">${up.toFixed(2)}</td>
                        <td style="text-align: right; padding-right: 6px; font-family: monospace;">${taxable.toFixed(2)}</td>
                        <td style="text-align: right; padding-right: 6px; font-family: monospace; color: #475569;">${vat.toFixed(2)}</td>
                        <td style="text-align: right; padding-right: 6px; font-family: monospace; font-weight: bold; color: #16a34a;">${net.toFixed(2)}</td>
                        <td>${row.remarks || '—'}</td>
                      </tr>
                    `;
                  }
                  return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td style="text-align: left; padding-left: 6px; font-weight: bold;">${row.description || '—'}</td>
                      <td>${row.size || 'M24'}</td>
                      <td>${row.finish || 'HOT DIP GALVANIZED'}</td>
                      <td>${row.unit || 'PCS'}</td>
                      <td style="font-weight: 800; color: #0c449e;">${(row.qty || 0).toLocaleString()}</td>
                      ${isCoating ? `
                        <td>${row.marking || 'YES'}</td>
                        <td style="font-weight: bold; color: #16a34a;">${row.adhesionTest || 'PASS (1A)'}</td>
                        <td>${row.threads || 'FIT OK'}</td>
                        <td>${row.microns || '65 um'}</td>
                      ` : `
                        <td>${row.marking || 'MFI A325'}</td>
                        <td>${row.microns || '85 um'}</td>
                        <td>${row.coatings || 'ZINC/PTFE'}</td>
                        <td>${row.threads || 'FIT OK'}</td>
                      `}
                      <td>${row.remarks || '—'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <!-- Financial details block -->
            <table class="financials-summary">
              <tr style="background-color: #f8fafc;">
                <td style="width: 33%;">
                  <span class="field-label">GROSS MATERIAL CONTRACT VALUE:</span>
                  <strong style="font-size: 11px;">AED ${invoiceAmounts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </td>
                <td style="width: 33%;">
                  <span class="field-label" style="color: #c2410c;">CAPITAL REMITTED / RELEASED:</span>
                  <strong style="color: #16a34a; font-size: 11px;">AED ${invoicePaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </td>
                <td style="width: 34%;">
                  <span class="field-label">RECONCILIATION BALANCE DUE:</span>
                  <strong style="color: #b91c1c; font-size: 11px;">AED ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </td>
              </tr>
            </table>

            <!-- Signatures -->
            <div class="signatures-grid">
              <div class="sig-box">
                <div class="sig-box-title" style="color: #FF6B00;">RECEIVER ACKNOWLEDGMENT:</div>
                <div style="font-weight: 800; font-size: 10px;">NAME: ${activeDOToPrint?.receiverName || 'MR. ASHRAF ALAMI'}</div>
                <div class="sig-line"></div>
                <div style="font-size: 8px; color: #64748b; margin-top: 4px;">RECEIVER SIGNATURE / RECEIVED STAMP</div>
              </div>
              
              <div class="sig-box">
                <div class="sig-box-title" style="color: #0c449e;">QC CHECK / INSPECTED BY:</div>
                <div style="font-weight: 800; font-size: 10px;">INSPECTOR: ${activeDOToPrint?.qcCheckedBy || 'ENG. RAJESH KUMAR'}</div>
                <div class="sig-line"></div>
                <div style="font-size: 8px; color: #64748b; margin-top: 4px;">QA VALIDATION STAMP / SIGNATURE</div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <span>Marine Fasteners Industries LLC - Inbound Receiver System</span>
              <span>ISO 9001:2015 REGISTERED FACILITY</span>
            </div>

          </div>
        </body>
        </html>
      `;

      printHtml(htmlContent, `Incoming_Delivery_Note_${activeDOToPrint?.doNo || p.doNo || p.id}`);
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-mono text-[11px]">
        {/* On-screen visual modal overlay for the voucher preview */}
        {activePreviewDoc && previewDO && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-50 rounded-2xl border-4 border-black w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative font-sans">
              <button 
                type="button" 
                onClick={() => setActivePreviewDoc(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Classification Selector */}
              <div className="flex justify-between items-center border-b border-slate-300 pb-3 mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase font-sans">DOCKET CLASSIFICATION:</span>
                  <select
                    value={previewDO.type || 'standard'}
                    onChange={(e) => handleUpdatePreviewDOField('type', e.target.value)}
                    className="p-1 px-3 bg-white hover:bg-slate-50 border border-slate-350 rounded-lg text-[10.5px] font-sans font-bold text-[#0c449e] uppercase cursor-pointer focus:outline-none transition-all"
                  >
                    <option value="standard">GOODS RECEIVED NOTE</option>
                    <option value="coating">COATING GOODS RECEIVED NOTE</option>
                    <option value="supplier_tax_invoice">TAX INVOICE</option>
                  </select>
                </div>
                <div className="text-[9.5px] text-slate-400 font-mono font-bold">
                  LEDGER ID: <span className="text-slate-800">{activePreviewDoc.id}</span>
                </div>
              </div>

              {/* Docket Sheet Frame */}
              <div className="bg-white p-6 sm:p-8 border border-slate-300 rounded-xl space-y-5 shadow-sm text-left">
                
                {/* Title Section */}
                <div className="text-center relative py-1">
                  <h1 className="text-[24px] sm:text-[26px] font-sans font-black tracking-widest text-black uppercase leading-none">
                    {previewDO.type === 'coating' ? 'COATING GOODS RECEIVED NOTE' : (previewDO.type === 'supplier_tax_invoice' ? 'TAX INVOICE' : 'GOODS RECEIVED NOTE')}
                  </h1>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono font-bold mt-1.5">
                    MARINE FASTENERS INDUSTRIES L.L.C.
                  </p>
                  <div className="border-t-2 border-slate-300 mt-3"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                  {/* Left block of the deliver address */}
                  <div className="md:col-span-7 space-y-1.5">
                    <span className="text-[9px] text-[#FF6B00] font-semibold uppercase block tracking-wider leading-none">
                      DELIVER TO:
                    </span>
                    <div className="text-[#0c449e] font-sans font-bold text-[13px] uppercase leading-tight">
                      MARINE FASTENERS INDUSTRIES L.L.C.
                    </div>
                    <p className="text-slate-600 text-[9.5px] uppercase font-bold leading-relaxed font-sans">
                      ADD: Plot Number #0654, Shed No # 31, New Industrial Area<br />
                      Ajman, United Arab Emirates (MFI FORGE PLANT).
                    </p>
                    <p className="text-slate-400 text-[8.5px] font-sans tracking-wide">
                      TELEPHONE : +971-6-525-0526 | EMAIL : RECEIVING@MARINEFASTENERS.CO
                    </p>
                    <div className="pt-0.5">
                      <span className="inline-block border border-slate-200 p-0.5 px-2 bg-slate-50 font-mono font-bold text-[8.5px] text-slate-700">
                        TRN: 100440509600003
                      </span>
                    </div>
                  </div>

                  {/* Right block: 7 Fields Grid */}
                  <div className="md:col-span-5">
                    <div className="border border-slate-400 rounded-md overflow-hidden bg-white grid grid-cols-2 text-[10px] divide-y divide-slate-300 divide-x divide-slate-400 font-sans">
                      
                      {/* Field 1: Invoice No */}
                      <div className="p-1 px-2 text-left col-span-2">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          INVOICE NO
                        </span>
                        <input
                          type="text"
                          value={previewDO.invoiceNo || ''}
                          onChange={(e) => handleUpdatePreviewDOField('invoiceNo', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-none text-[10px] font-mono font-bold text-slate-800 p-0 focus:outline-none focus:bg-amber-50 h-4 uppercase"
                          placeholder="ENTER INVOICE REF"
                        />
                      </div>

                      {/* Field 2: DO No */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          DO NO
                        </span>
                        <input
                          type="text"
                          value={previewDO.doNo || ''}
                          onChange={(e) => handleUpdatePreviewDOField('doNo', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-none text-[10px] font-mono font-bold text-[#E02424] p-0 focus:outline-none focus:bg-amber-50 h-4 uppercase"
                          placeholder="ENTER DO REF"
                        />
                      </div>

                      {/* Field 3: Date */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          DATE
                        </span>
                        <input
                          type="date"
                          value={previewDO.date || ''}
                          onChange={(e) => handleUpdatePreviewDOField('date', e.target.value)}
                          className="w-full bg-transparent border-none text-[10px]静态 font-mono font-bold text-slate-800 p-0 focus:outline-none focus:bg-amber-50 h-4"
                        />
                      </div>

                      {/* Field 4: PO No */}
                      <div className="p-1 px-2 text-left col-span-2">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          PO NO
                        </span>
                        <input
                          type="text"
                          value={previewDO.poNo || ''}
                          onChange={(e) => handleUpdatePreviewDOField('poNo', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-none text-[10px] font-mono font-bold text-slate-800 p-0 focus:outline-none focus:bg-amber-50 h-4 uppercase"
                          placeholder="ENTER LPO REF"
                        />
                      </div>

                      {/* Field 5: Dispatch By */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          DISPATCH BY
                        </span>
                        <input
                          type="text"
                          value={previewDO.dispatchBy || ''}
                          onChange={(e) => handleUpdatePreviewDOField('dispatchBy', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-none text-[9px] font-mono font-semibold text-slate-700 p-0 focus:outline-none focus:bg-amber-50 h-4 uppercase"
                        />
                      </div>

                      {/* Field 6: Delivery Terms */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          DELIVERY TERMS
                        </span>
                        <input
                          type="text"
                          value={previewDO.deliveryTerms || ''}
                          onChange={(e) => handleUpdatePreviewDOField('deliveryTerms', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-none text-[9px] font-mono font-semibold text-slate-700 p-0 focus:outline-none focus:bg-amber-50 h-4 uppercase"
                        />
                      </div>

                      {/* Field 7: Made In */}
                      <div className="p-1 px-2 text-left col-span-2 bg-slate-50/50">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          MADE IN
                        </span>
                        <input
                          type="text"
                          value={previewDO.madeIn || ''}
                          onChange={(e) => handleUpdatePreviewDOField('madeIn', e.target.value.toUpperCase())}
                          className="w-full bg-transparent border-none text-[9.5px] font-mono font-bold text-slate-700 p-0 focus:outline-none focus:bg-amber-50 h-4 uppercase"
                        />
                      </div>

                    </div>
                  </div>
                </div>

                {/* Framed Supplier Card */}
                <div className="border border-slate-350 p-4 rounded-lg bg-slate-50/50 relative text-left text-[10px] space-y-2">
                  <span className="text-[#0c449e] text-[8.5px] font-semibold uppercase tracking-wide block">
                    SUPPLIER:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-1.5">
                      <input
                        type="text"
                        value={previewDO.supplierName || ''}
                        onChange={(e) => handleUpdatePreviewDOField('supplierName', e.target.value.toUpperCase())}
                        className="w-full font-sans font-bold text-[#0c449e] text-[12px] uppercase bg-transparent p-0 border-b border-dashed border-slate-300 focus:outline-none focus:border-[#f37021] focus:bg-white h-5"
                        placeholder="ENTER SUPPLIER COMPANY NAME"
                      />

                      <div>
                        <label className="text-slate-400 font-bold text-[7.5px] tracking-wider block">PHYSICAL ADDRESS LOCATION:</label>
                        <textarea
                          rows={2}
                          value={previewDO.supplierAddress || ''}
                          onChange={(e) => handleUpdatePreviewDOField('supplierAddress', e.target.value.toUpperCase())}
                          className="w-full text-slate-700 text-[10px] uppercase bg-transparent p-0 border-none outline-none focus:bg-white font-mono mt-0.5 resize-none font-semibold leading-normal"
                          placeholder="STREET, REGION, PIN CODE"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-4 border-l border-slate-300 pl-4 space-y-1.5">
                      <div className="flex justify-between items-center h-5">
                        <span className="text-slate-400 uppercase font-semibold text-[8px]">TRN:</span>
                        <input
                          type="text"
                          value={previewDO.trn || ''}
                          onChange={(e) => handleUpdatePreviewDOField('trn', e.target.value)}
                          className="text-right font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:bg-white w-28 text-[9.5px]"
                          placeholder="TRN No"
                        />
                      </div>

                      <div className="flex justify-between items-center h-5">
                        <span className="text-slate-400 uppercase font-semibold text-[8px]">PHONE:</span>
                        <input
                          type="text"
                          value={previewDO.phone || ''}
                          onChange={(e) => handleUpdatePreviewDOField('phone', e.target.value)}
                          className="text-right font-semibold text-slate-600 bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:bg-white w-28 text-[9.5px]"
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* material specifications checklist table */}
                <div className="border border-slate-400 rounded-md overflow-x-auto bg-white">
                  <table className="w-full text-[10px] text-center divide-y divide-slate-400 font-mono min-w-[900px]">
                    <thead className="bg-[#f8fafc] text-indigo-950 uppercase font-semibold divide-y divide-slate-400">
                      {previewDO.type === 'supplier_tax_invoice' ? (
                        <tr className="divide-x divide-slate-400 h-10 bg-indigo-50/50">
                          <th className="w-8 font-bold text-center text-[8.5px]">S.N</th>
                          <th className="w-40 text-left pl-2 text-[8.5px]">DESCRIPTION</th>
                          <th className="w-20 text-[8.5px]">SIZE</th>
                          <th className="w-24 text-[8.5px]">FINISH</th>
                          <th className="w-14 text-[8.5px]">UNIT</th>
                          <th className="w-16 text-[8.5px]">QTY</th>
                          <th className="w-24 text-[8.5px] text-[#0c449e] font-sans">UNIT PRICE (AED)</th>
                          <th className="w-24 text-[8.5px] text-[#0c449e] font-sans">TAXABLE</th>
                          <th className="w-20 text-[8.5px] text-[#0c449e] font-sans">VAT (5%)</th>
                          <th className="w-24 text-[8.5px] text-[#0c449e] font-sans">NET AMOUNT</th>
                          <th className="w-24 text-[8.5px]">REMARKS</th>
                          <th className="w-28 text-[8.5px]">QC NOTES</th>
                        </tr>
                      ) : previewDO.type === 'coating' ? (
                        <tr className="divide-x divide-slate-400 h-10 bg-slate-100">
                          <th className="w-8 font-bold text-center text-[8.5px]">S.N</th>
                          <th className="w-40 text-left pl-2 text-[8.5px]">DESCRIPTION</th>
                          <th className="w-20 text-[8.5px]">SIZE</th>
                          <th className="w-24 text-[8.5px]">FINISH</th>
                          <th className="w-14 text-[8.5px]">UNIT</th>
                          <th className="w-16 text-[8.5px]">QTY</th>
                          <th className="w-32 text-[8.5px] text-[#0c449e] font-sans">MARKING VISIBLE (YES/NO)</th>
                          <th className="w-24 text-[8.5px] text-[#0c449e] font-sans">ADHESION TEST</th>
                          <th className="w-20 text-[8.5px] text-[#0c449e] font-sans">THREADS</th>
                          <th className="w-16 text-[8.5px] text-[#0c449e] font-sans">MICRONS</th>
                          <th className="w-24 text-[8.5px]">REMARKS</th>
                          <th className="w-28 text-[8.5px]">QC NOTES</th>
                        </tr>
                      ) : (
                        <tr className="divide-x divide-slate-400 h-10 bg-amber-50/50">
                          <th className="w-8 font-bold text-center text-[8.5px]">S.N</th>
                          <th className="w-40 text-left pl-2 text-[8.5px]">DESCRIPTION</th>
                          <th className="w-20 text-[8.5px]">SIZE</th>
                          <th className="w-24 text-[8.5px]">FINISH</th>
                          <th className="w-14 text-[8.5px]">UNIT</th>
                          <th className="w-16 text-[8.5px]">QTY</th>
                          <th className="w-24 text-[8.5px] text-[#FF6B00] font-sans">MARKING</th>
                          <th className="w-16 text-[8.5px] text-[#FF6B00] font-sans">MICRONS</th>
                          <th className="w-24 text-[8.5px] text-[#FF6B00] font-sans">COATINGS</th>
                          <th className="w-20 text-[8.5px] text-[#FF6B00] font-sans">THREADS</th>
                          <th className="w-24 text-[8.5px]">REMARKS</th>
                          <th className="w-28 text-[8.5px]">QC NOTES</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {previewDO.items && previewDO.items.map((row: any) => (
                        <tr key={row.id} className="divide-x divide-slate-300 h-9 hover:bg-slate-50/50 align-middle">
                          <td className="text-center font-bold text-slate-700 select-none text-[9.5px]">
                            {row.sn}
                          </td>
                          <td className="text-left pl-2 font-sans font-bold text-slate-800 text-[10px]">
                            <input
                              type="text"
                              value={row.description || ''}
                              onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'description', e.target.value.toUpperCase())}
                              className="w-full bg-transparent border-none focus:outline-none focus:bg-amber-50 font-bold h-6 px-1 uppercase"
                              placeholder="MATERIAL DESCRIPTION"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.size || ''}
                              onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'size', e.target.value.toUpperCase())}
                              className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-700 focus:outline-none focus:bg-amber-50 h-5 px-1 uppercase"
                              placeholder="SIZE"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.finish || ''}
                              onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'finish', e.target.value.toUpperCase())}
                              className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-700 focus:outline-none focus:bg-amber-50 h-5 px-1 uppercase"
                              placeholder="FINISH"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.unit || ''}
                              onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'unit', e.target.value.toUpperCase())}
                              className="w-full bg-transparent border-none text-center text-[9.5px] font-bold text-slate-700 focus:outline-none focus:bg-amber-50 h-5 px-1 uppercase"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={row.qty || 0}
                              onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'qty', parseInt(e.target.value) || 0)}
                              className="w-full bg-transparent border-none text-center text-[10px] font-bold text-[#0c449e] focus:outline-none focus:bg-amber-50 h-5 px-1"
                            />
                          </td>

                          {previewDO.type === 'supplier_tax_invoice' ? (
                            <>
                              <td>
                                <input
                                  type="number"
                                  value={row.unitPrice || 0}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent border-none text-center text-[10px] font-bold text-indigo-600 focus:outline-none focus:bg-amber-50 h-5 px-1"
                                />
                              </td>
                              <td className="text-center font-mono text-[9.5px] font-bold text-slate-700 bg-slate-50/30">
                                {((parseFloat(row.qty) || 0) * (parseFloat(row.unitPrice) || 0)).toFixed(2)}
                              </td>
                              <td className="text-center font-mono text-[9.5px] font-bold text-slate-550 bg-slate-50/30">
                                {((parseFloat(row.qty) || 0) * (parseFloat(row.unitPrice) || 0) * 0.05).toFixed(2)}
                              </td>
                              <td className="text-center font-mono text-[9.5px] font-semibold text-emerald-650 bg-slate-50/30">
                                {((parseFloat(row.qty) || 0) * (parseFloat(row.unitPrice) || 0) * 1.05).toFixed(2)}
                              </td>
                            </>
                          ) : previewDO.type === 'coating' ? (
                            <>
                              <td>
                                <input
                                  type="text"
                                  value={row.marking || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'marking', e.target.value.toUpperCase())}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.adhesionTest || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'adhesionTest', e.target.value.toUpperCase())}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50 font-bold"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.threads || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'threads', e.target.value.toUpperCase())}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.microns || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'microns', e.target.value)}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50 font-semibold"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td>
                                <input
                                  type="text"
                                  value={row.marking || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'marking', e.target.value.toUpperCase())}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.microns || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'microns', e.target.value)}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50 font-semibold"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.coatings || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'coatings', e.target.value.toUpperCase())}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50"
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  value={row.threads || ''}
                                  onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'threads', e.target.value.toUpperCase())}
                                  className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50 font-bold"
                                />
                              </td>
                            </>
                          )}

                          <td>
                            <input
                              type="text"
                              value={row.remarks || ''}
                              onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'remarks', e.target.value.toUpperCase())}
                              className="w-full bg-transparent border-none text-center text-[9.5px] text-slate-600 focus:outline-none focus:bg-amber-50"
                            />
                          </td>
                          <td className="relative">
                            <div className="flex items-center gap-1 px-1">
                              <input
                                type="text"
                                value={row.qcNotes || ''}
                                onChange={(e) => handleUpdatePreviewDOItemField(row.id, 'qcNotes', e.target.value.toUpperCase())}
                                className="w-full bg-transparent border-none text-left text-[9px] text-emerald-800 font-bold focus:outline-none focus:bg-amber-50 h-5 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePreviewDOItem(row.id)}
                                className="p-0.5 text-slate-400 hover:text-rose-500 rounded bg-slate-50 hover:bg-rose-50 cursor-pointer"
                                title="Remove Line"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Append Row Button */}
                <div className="flex justify-start pt-1 font-sans">
                  <button
                    type="button"
                    onClick={handleAppendPreviewDOItem}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-sans font-bold text-[9px] text-slate-800 uppercase flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-600" /> Add Material Line
                  </button>
                </div>

                {/* Financial Details Section inside receipt */}
                <div className="bg-slate-50 text-slate-900 p-4 rounded-xl font-mono border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[8.5px] text-slate-500 block uppercase font-bold font-sans tracking-wide leading-none mb-1">
                      Gross Material Value (AED):
                    </span>
                    <input
                      type="number"
                      value={previewDO.invoiceAmounts ?? 0}
                      onChange={(e) => handleUpdatePreviewDOField('invoiceAmounts', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-b border-dashed border-slate-300 font-sans font-bold text-slate-900 text-[14px] leading-tight focus:outline-none text-left p-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[8.5px] text-[#f37021] block uppercase font-semibold font-sans tracking-wide leading-none mb-1">
                      Capital Remitted / Paid (AED):
                    </span>
                    <input
                      type="number"
                      value={previewDO.invoicePaid ?? 0}
                      onChange={(e) => handleUpdatePreviewDOField('invoicePaid', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-b border-dashed border-slate-300 font-sans font-bold text-emerald-750 text-[14px] leading-tight focus:outline-none text-left p-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 block uppercase font-bold font-sans tracking-wide leading-none mb-1">
                      Reconciliation Bal Due:
                    </span>
                    <div className="font-sans font-bold text-rose-700 text-[14px] pt-1 select-none">
                      AED {((parseFloat(previewDO.invoiceAmounts) || 0) - (parseFloat(previewDO.invoicePaid) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Bottom Notes Section: RECEIVER NAME & QC CHECKED BOXES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 text-left text-[9.5px]">
                  
                  {/* Receiver Block Box */}
                  <div className="border border-slate-300 p-4 rounded-lg bg-white relative text-left text-[10px] space-y-3 font-sans">
                    <span className="text-[#FF6B00] text-[8.5px] font-semibold uppercase tracking-wide block leading-none">
                      RECEIVER NAME:
                    </span>
                    <input
                      type="text"
                      value={previewDO.receiverName || ''}
                      onChange={(e) => handleUpdatePreviewDOField('receiverName', e.target.value.toUpperCase())}
                      className="w-full font-mono font-bold text-slate-800 text-[11px] uppercase bg-transparent p-0 border-b border-dashed border-slate-200 focus:outline-none focus:bg-amber-50 h-5"
                      placeholder="ENTER STAFF NAME"
                    />
                    <div className="text-[8px] text-slate-400 tracking-wide pt-2">
                      SIGNATURE / RECEIVED STAMP: _________________
                    </div>
                  </div>

                  {/* QC Checked Block Box */}
                  <div className="border border-slate-300 p-4 rounded-lg bg-white relative text-left text-[10px] space-y-3 font-sans">
                    <span className="text-[#0c449e] text-[8.5px] font-semibold uppercase tracking-wide block leading-none">
                      QC CHECKED BY:
                    </span>
                    <input
                      type="text"
                      value={previewDO.qcCheckedBy || ''}
                      onChange={(e) => handleUpdatePreviewDOField('qcCheckedBy', e.target.value.toUpperCase())}
                      className="w-full font-mono font-bold text-slate-800 text-[11px] uppercase bg-transparent p-0 border-b border-dashed border-slate-200 focus:outline-none focus:bg-amber-50 h-5"
                      placeholder="ENTER QA INSPECTOR"
                    />
                    <div className="text-[8px] text-slate-400 tracking-wide pt-2">
                      QA SIGNATURE / STAMP: _________________
                    </div>
                  </div>

                </div>

                {/* Tiny professional page footing */}
                <div className="pt-4 border-t border-slate-200 flex justify-between text-[7.5px] text-slate-400 uppercase tracking-wider leading-none">
                  <span>Marine Fasteners Industries LLC - Inbound Receiver System</span>
                  <span>ISO 9001:2015 REGISTERED FACILITY</span>
                </div>

              </div>

              {/* Action Operations Bar */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-100 p-4 rounded-xl border border-slate-300 font-sans">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setDeleteTarget({ id: activePreviewDoc.id, source: activePreviewDoc.source });
                      setActivePreviewDoc(null);
                    }}
                    className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl font-sans font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete Accounts Payable record permanently"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" /> Void Record
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handlePrintDocument(activePreviewDoc, previewDO)}
                    className="bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-700 px-4 py-2.5 rounded-xl font-sans font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-sky-600" /> Print DO Docket
                  </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    type="button" 
                    onClick={() => setActivePreviewDoc(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-slate-300 hover:bg-slate-200 font-sans font-bold text-slate-700 rounded-xl text-xs uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSavePreviewDO}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4 text-white" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal for Deletion - Bypasses Browser iFrame confirm blocks */}
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border-4 border-black w-full max-w-sm p-6 shadow-2xl relative font-sans text-left animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-sm font-bold text-rose-600 tracking-tight mb-2 uppercase">⚠ Confirm Removal</h3>
              <p className="text-[10.5px] text-slate-600 mb-6 font-semibold leading-relaxed font-sans">
                Are you absolutely sure you want to permanently delete this Accounts Payable record? This action will update the active ledger database and cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const { id, source } = deleteTarget;
                    if (source === 'manual') {
                      setPayables(prev => prev.filter(p => p.id !== id));
                      triggerToast("Manual supplier bill removed from ledger successfully!");
                    } else if (source === 'material_do') {
                      const updatedDOs = inboundDOs.filter(d => d.id !== id);
                      setInboundDOs(updatedDOs);
                      localStorage.setItem('MFI_INCOMING_MATERIALS_LEDGER', JSON.stringify(updatedDOs));
                      triggerToast("Accounts Payable record removed from ledger successfully!");
                    } else if (source === 'supplier_purchase') {
                      const updatedPurchases = supplierPurchases.filter(p => p.id !== id);
                      setSupplierPurchases(updatedPurchases);
                      localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(updatedPurchases));
                      triggerToast("Supplier Purchase Invoice removed from ledger successfully!");
                    }
                    setDeleteTarget(null);
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs uppercase transition-colors cursor-pointer"
                >
                  Yes, Delete Record
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-bold text-xs uppercase border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Core statistical blocks */}
        <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 font-sans mb-4">
          <div className="bg-white text-slate-900 p-3.5 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">Total Payables</span>
              <span className="text-lg font-bold text-slate-950 font-mono block mt-0.5">AED {combinedPayables.reduce((s,c)=>s+c.totalContractValue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-700" />
            </div>
          </div>
          <div className="bg-white text-slate-900 p-3.5 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">Released Payments</span>
              <span className="text-lg font-bold text-emerald-700 font-mono block mt-0.5">AED {combinedPayables.reduce((s,c)=>s+c.amountPaid, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-300">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white text-slate-900 p-3.5 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">Balance Outstanding</span>
              <span className="text-lg font-bold text-rose-700 font-mono block mt-0.5">AED {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            </div>
          </div>
        </div>



        {/* Right Tabular Registry Column containing the 11 specified headers */}
        <div className="xl:col-span-12 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-sans text-sm font-bold uppercase text-slate-900">SUPPLIER ACCOUNTS PAYABLE LEDGER</h3>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">Official log of imports financing schedules, Goods Received Notes (GRN), and bank reconciliation statements.</p>
            </div>


          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[480px] border border-slate-300 rounded shadow-sm font-mono scrollbar-thin bg-slate-50">
            <table className="w-full text-left text-[9.5px] border-collapse min-w-[1100px] border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-[9px] font-bold uppercase text-center h-9 font-sans border-b border-slate-400">
                  <th className="p-1.5 w-[85px] border border-slate-300">DO NUMBER</th>
                  <th className="p-1.5 w-[90px] border border-slate-300">DATE</th>
                  <th className="p-1.5 w-[85px] border border-slate-300">INVOICE NO</th>
                  <th className="p-1.5 w-[80px] border border-slate-300">LPO NO</th>
                  <th className="p-1.5 w-[140px] text-left pl-2 border border-slate-300">SUPPLIER</th> 
                  <th className="p-1.5 w-[70px] bg-slate-200 text-slate-800 border border-slate-300">ACTION</th>
                  <th className="p-1.5 w-[85px] text-right pr-2 border border-slate-300">TOTAL AMOUNT</th>
                  <th className="p-1.5 w-[85px] text-right pr-2 border border-slate-300">PAID AMOUNT</th>
                  <th className="p-1.5 w-[90px] border border-slate-300">DATE</th>
                  <th className="p-1.5 w-[105px] text-right pr-2 font-sans border border-slate-300">BALANCE AMOUNT</th>
                  <th className="p-1.5 w-[95px] border border-slate-300">PAID BY</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredPayables.map((p, idx) => {
                  const outstanding = p.totalContractValue - p.amountPaid;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/25 odd:bg-white even:bg-slate-50/30 h-10 font-mono transition-colors">
                      {/* 1. DO NUMBER (Editable) */}
                      <td className="p-1 border border-slate-200 relative text-center">
                        <div className="flex flex-col items-center justify-center">
                          <input
                            type="text"
                            value={p.doNo}
                            onChange={(e) => handleUpdatePaymentsField(p.id, p.source, 'doNo', e.target.value.toUpperCase())}
                            className="w-full text-center font-bold text-rose-600 bg-transparent border-none outline-none focus:bg-amber-100/70 uppercase text-[9.5px] pb-0.5 rounded-none"
                            placeholder="DO-..."
                            data-payable-row={idx}
                            data-payable-col={0}
                            onKeyDown={(e) => handlePayableKeyDown(e, idx, 0)}
                          />
                          <span className={`text-[6.5px] leading-none font-sans font-bold uppercase px-1 py-0.5 border select-none rounded-none ${
                            p.type === 'coating' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-[#E02424] border-amber-200'
                          }`}>
                            {p.type === 'coating' ? 'Coating DO' : 'Incoming DO'}
                          </span>
                        </div>
                      </td>

                      {/* 2. DATE (Editable) */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="date"
                          value={p.date}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, 'date', e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-100/70 text-slate-700 font-bold text-[9.5px] rounded-none"
                          data-payable-row={idx}
                          data-payable-col={1}
                          onKeyDown={(e) => handlePayableKeyDown(e, idx, 1)}
                        />
                      </td>

                      {/* 3. INVOICE NO (Editable) */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="text"
                          value={p.invoiceNo}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, 'invoiceNo', e.target.value.toUpperCase())}
                          className="w-full text-center font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-amber-100/70 uppercase text-[9.5px] rounded-none"
                          placeholder="INV-..."
                          data-payable-row={idx}
                          data-payable-col={2}
                          onKeyDown={(e) => handlePayableKeyDown(e, idx, 2)}
                        />
                      </td>

                      {/* 4. LPO NO (Editable) */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="text"
                          value={p.poNo}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, 'poNo', e.target.value.toUpperCase())}
                          className="w-full text-center font-bold text-teal-800 bg-transparent border-none outline-none focus:bg-amber-100/70 uppercase text-[9.5px] rounded-none"
                          placeholder="LPO-..."
                          data-payable-row={idx}
                          data-payable-col={3}
                          onKeyDown={(e) => handlePayableKeyDown(e, idx, 3)}
                        />
                      </td>

                      {/* 5. SUPPLIER (Supplier Name, Editable) */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="text"
                          value={p.supplierName}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, 'supplierName', e.target.value.toUpperCase())}
                          className="w-full text-left bg-transparent border-none outline-none focus:bg-amber-100/70 font-bold text-slate-900 pl-1.5 uppercase text-[9.5px] rounded-none"
                          placeholder="SUPPLIER NAME"
                          data-payable-row={idx}
                          data-payable-col={4}
                          onKeyDown={(e) => handlePayableKeyDown(e, idx, 4)}
                        />
                      </td>

                      {/* 6. ACTION */}
                      <td className="p-1 bg-slate-50/65 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (p.source === 'supplier_purchase') {
                                handlePrintDocument(p);
                              } else {
                                setActivePreviewDoc(p);
                              }
                            }}
                            className="bg-slate-900 border border-black hover:bg-black text-[#f37021] hover:text-white p-1 rounded-sm shadow-3xs flex items-center justify-center transition-colors cursor-pointer"
                            title="View Original Bill (Supplier Tax Invoice PDF / GRN Particulars)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handlePrintSupplierStatement(p.supplierName);
                            }}
                            className="bg-blue-50 hover:bg-blue-600 border border-blue-300 text-blue-700 hover:text-white p-1 rounded-sm shadow-3xs flex items-center justify-center transition-all cursor-pointer"
                            title="Direct Print Preview Supplier Statement of Accounts"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Add Cash/Cheque Receipt Voucher icon */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextVoucherNo = (() => {
                                let max = 1300;
                                receiptRegisters.forEach(v => {
                                  const num = parseInt(v.voucherNo, 10);
                                  if (!isNaN(num) && num > max) max = num;
                                });
                                return String(max + 1);
                              })();
                              
                              const newVoucher: ReceiptVoucher = {
                                id: 'rc-' + Date.now(),
                                voucherNo: nextVoucherNo,
                                dated: new Date().toISOString().substring(0, 10),
                                clientName: p.supplierName,
                                amountReceived: p.totalContractValue - p.amountPaid,
                                paymentMode: p.invoicePaidBy === 'CHEQUE' ? 'CHEQUE' : (p.invoicePaidBy === 'CASH' ? 'CASH' : 'BANK TRANSFER'),
                                chequeNoDetails: '',
                                bankName: '',
                                narration: `PAYMENT SETTLEMENT VOUCHER FOR INVOICE ${p.invoiceNo || p.id}`.toUpperCase(),
                                invoiceAllocated: p.invoiceNo || p.id,
                                receivedAgainstInvoice: p.invoiceNo || p.id,
                                receivedAgainstPo: p.poNo || '—',
                                accountCategory: 'PAYABLES',
                                targetCustomerId: 'supp-' + p.supplierName.toLowerCase().replace(/\s+/g, '-'),
                                autoPostToLedger: true
                              };

                              const updatedVouchers = [newVoucher, ...receiptRegisters];
                              setReceiptRegisters(updatedVouchers);
                              localStorage.setItem('MF_RECEIPT_VOUCHERS', JSON.stringify(updatedVouchers));
                              
                              setActiveReceiptId(newVoucher.id);
                              setActiveTab('receipt');
                              triggerToast(`Draft Receipt/Payment Voucher ${newVoucher.voucherNo} created for Supplier!`);
                            }}
                            className="bg-amber-50 hover:bg-amber-600 border border-amber-300 text-amber-700 hover:text-white p-1 rounded-sm shadow-3xs flex items-center justify-center transition-all cursor-pointer"
                            title="Create Cash/Cheque Receipt Voucher for Supplier"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* View Receipt Voucher icon */}
                          {(() => {
                            const matchedVoucher = receiptRegisters.find(r => 
                              r.invoiceAllocated === p.invoiceNo || 
                              r.receivedAgainstInvoice === p.invoiceNo || 
                              (p.invoiceNo && r.narration && r.narration.toUpperCase().includes(p.invoiceNo.toUpperCase()))
                            );
                            
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  if (matchedVoucher) {
                                    handlePrintReceiptVoucher(matchedVoucher);
                                    triggerToast(`Viewing Receipt/Payment Voucher ${matchedVoucher.voucherNo}`);
                                  } else {
                                    const nextVoucherNo = (() => {
                                      let max = 1300;
                                      receiptRegisters.forEach(v => {
                                        const num = parseInt(v.voucherNo, 10);
                                        if (!isNaN(num) && num > max) max = num;
                                      });
                                      return String(max + 1);
                                    })();
                                    
                                    const newVoucher: ReceiptVoucher = {
                                      id: 'rc-' + Date.now(),
                                      voucherNo: nextVoucherNo,
                                      dated: new Date().toISOString().substring(0, 10),
                                      clientName: p.supplierName,
                                      amountReceived: p.totalContractValue - p.amountPaid,
                                      paymentMode: p.invoicePaidBy === 'CHEQUE' ? 'CHEQUE' : (p.invoicePaidBy === 'CASH' ? 'CASH' : 'BANK TRANSFER'),
                                      chequeNoDetails: '',
                                      bankName: '',
                                      narration: `PAYMENT SETTLEMENT VOUCHER FOR INVOICE ${p.invoiceNo || p.id}`.toUpperCase(),
                                      invoiceAllocated: p.invoiceNo || p.id,
                                      receivedAgainstInvoice: p.invoiceNo || p.id,
                                      receivedAgainstPo: p.poNo || '—',
                                      accountCategory: 'PAYABLES',
                                      targetCustomerId: 'supp-' + p.supplierName.toLowerCase().replace(/\s+/g, '-'),
                                      autoPostToLedger: true
                                    };

                                    const updatedVouchers = [newVoucher, ...receiptRegisters];
                                    setReceiptRegisters(updatedVouchers);
                                    localStorage.setItem('MF_RECEIPT_VOUCHERS', JSON.stringify(updatedVouchers));
                                    
                                    setActiveReceiptId(newVoucher.id);
                                    setActiveTab('receipt');
                                    triggerToast(`Draft Receipt/Payment Voucher ${newVoucher.voucherNo} created!`);
                                  }
                                }}
                                className={`p-1 rounded-sm shadow-3xs flex items-center justify-center transition-all cursor-pointer border ${
                                  matchedVoucher 
                                    ? 'bg-emerald-50 hover:bg-emerald-600 border-emerald-300 text-emerald-700 hover:text-white' 
                                    : 'bg-slate-50 hover:bg-slate-400 border-slate-300 text-slate-400 hover:text-white'
                                }`}
                                title={matchedVoucher ? `View Receipt/Payment Voucher ${matchedVoucher.voucherNo}` : "Create/View Cash/Cheque Receipt Voucher"}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            );
                          })()}

                          <button
                            type="button"
                            onClick={() => handleDeletePaymentRow(p.id, p.source)}
                            className="text-rose-600 hover:text-white hover:bg-rose-600 p-1 rounded-sm transition-colors cursor-pointer flex items-center justify-center"
                            title="Delete Accounts Payable record permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* 7. TOTAL AMOUNT (Purchase Contract Value) */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="number"
                          value={p.totalContractValue}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, p.source === 'material_do' ? 'invoiceAmounts' : 'totalContractValue', parseFloat(e.target.value) || 0)}
                          className="w-full text-right pr-1 font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-amber-100/70 rounded-none font-mono text-[9.5px]"
                        />
                      </td>

                      {/* 8. PAID AMOUNT */}
                      <td className="p-1 border border-slate-200 text-right">
                        <input
                          type="number"
                          value={p.amountPaid}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, p.source === 'material_do' ? 'invoicePaid' : 'amountPaid', parseFloat(e.target.value) || 0)}
                          className="w-full text-right pr-1 font-bold text-emerald-700 bg-transparent border-none outline-none focus:bg-amber-100/70 rounded-none font-mono text-[9.5px]"
                        />
                      </td>

                      {/* 9. DATE (Payment Reconcile date) */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="date"
                          value={p.invoiceDate}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, p.source === 'material_do' ? 'invoiceDate' : 'invoiceDate', e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-100/70 text-slate-500 font-bold text-[9.5px] rounded-none"
                        />
                      </td>

                      {/* 10. BALANCE AMOUNT (Read only indicator) */}
                      <td className="p-1 border border-slate-200 text-right pr-2 font-mono font-bold text-[9.5px]">
                        <span className={outstanding <= 0 ? "text-emerald-700" : "text-rose-700"}>
                          {outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED
                        </span>
                      </td>

                      {/* 11. PAID BY (Payment Remittance Mode) */}
                      <td className="p-1 border border-slate-200">
                        <select
                          value={p.invoicePaidBy}
                          onChange={(e) => handleUpdatePaymentsField(p.id, p.source, 'invoicePaidBy', e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 outline-none rounded-none py-0.5 text-[8.5px] font-sans font-bold text-slate-850 cursor-pointer"
                        >
                          <option value="BANK WIRE">BANK WIRE</option>
                          <option value="CHEQUE">CHEQUE</option>
                          <option value="CASH">CASH</option>
                          <option value="LETTER OF CREDIT">LC / CREDIT</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-bold h-9 border-t-2 border-b-4 border-slate-400 text-right font-sans">
                  <td colSpan={5} className="p-1.5 text-left border border-slate-300 text-[10px]">GRAND TOTAL PAYABLES</td>
                  <td className="p-1.5 text-center border border-slate-300 text-[10px]">—</td>
                  <td className="p-1.5 border border-slate-300 text-[10px] font-mono">
                    AED {filteredPayables.reduce((s, c) => s + (c.totalContractValue || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-[10px] font-mono text-emerald-700">
                    AED {filteredPayables.reduce((s, c) => s + (c.amountPaid || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-center border border-slate-300 text-[10px]">—</td>
                  <td className="p-1.5 border border-slate-300 text-[10px] font-mono text-rose-700">
                    AED {filteredPayables.reduce((s, c) => s + ((c.totalContractValue || 0) - (c.amountPaid || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-center border border-slate-300 text-[10px]">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- TAB 11: Outgoing Materials Payments Update Component ---
  const OutgoingPaymentsUpdateComponent = () => {
    const [receivables, setReceivables] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
      if (saved) return JSON.parse(saved);
      return [];
    });

    const [savedDocs, setSavedDocs] = useState<any[]>(() => {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [];
    });

    const [storageToggle, setStorageToggle] = useState(false);

    // Reactive sync for local storage events
    useEffect(() => {
      const handleStorageUpdate = () => {
        const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
        if (saved) {
          try { setSavedDocs(JSON.parse(saved)); } catch (e) {}
        }
        const savedRec = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
        if (savedRec) {
          try { setReceivables(JSON.parse(savedRec)); } catch (e) {}
        }
        setStorageToggle(prev => !prev);
      };

      window.addEventListener('storage', handleStorageUpdate);
      window.addEventListener('mf_documents_updated', handleStorageUpdate);
      return () => {
        window.removeEventListener('storage', handleStorageUpdate);
        window.removeEventListener('mf_documents_updated', handleStorageUpdate);
      };
    }, []);

    // Reactive sync when activeTab changes or receiptRegisters updates to sync generated invoices and receipts in real time!
    useEffect(() => {
      const saved = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (saved) {
        try {
          setSavedDocs(JSON.parse(saved));
        } catch (e) {}
      }
      const savedRec = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
      if (savedRec) {
        try {
          setReceivables(JSON.parse(savedRec));
        } catch (e) {}
      }
      setStorageToggle(prev => !prev);
    }, [activeTab, receiptRegisters]);

    const [selectRecId, setSelectRecId] = useState('');
    const [depositAmt, setDepositAmt] = useState(15000);
    const [receiptMode, setReceiptMode] = useState<'BANK WIRE' | 'CHEQUE' | 'CASH' | 'LETTER OF CREDIT'>('BANK WIRE');
    const [refDetails, setRefDetails] = useState('First stage bank transfer');

    const [isAddingRec, setIsAddingRec] = useState(false);
    const [newRecId, setNewRecId] = useState(() => 'REC-' + Math.floor(Math.random() * 900 + 100));
    const [newDoNo, setNewDoNo] = useState(() => 'DO-' + Math.floor(Math.random() * 90000 + 10000));
    const [newLpoNo, setNewLpoNo] = useState(() => 'LPO-' + Math.floor(Math.random() * 90000 + 10000));
    const [newBuyerName, setNewBuyerName] = useState('ZAMIL HEAVY INDUSTRIES LTD');
    const [newCargoDetails, setNewCargoDetails] = useState('');
    const [newInvoiceValue, setNewInvoiceValue] = useState(45000);
    const [newInitialReceived, setNewInitialReceived] = useState(0);
    const [newPaymentMode, setNewPaymentMode] = useState<'BANK WIRE' | 'CHEQUE' | 'CASH' | 'LETTER OF CREDIT'>('BANK WIRE');
    const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [newClassification, setNewClassification] = useState<'standard' | 'coating'>('standard');

    const [activePreviewDoc, setActivePreviewDoc] = useState<any | null>(null);
    const [previewDoc, setPreviewDoc] = useState<any | null>(null);
    const [deleteReceivableTarget, setDeleteReceivableTarget] = useState<{ id: string; source: 'manual' | 'invoice' } | null>(null);
    const [receivablesFilterType, setReceivablesFilterType] = useState<'all' | 'standard' | 'coating'>('all');
    const [receivablesSearchQuery, setReceivablesSearchQuery] = useState('');
    const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('all');

    const [quickReceiptInvoice, setQuickReceiptInvoice] = useState<any | null>(null);
    const [soaPopupClient, setSoaPopupClient] = useState<any | null>(null);
    const [qrAmount, setQrAmount] = useState<number>(0);
    const [qrMode, setQrMode] = useState<'CASH' | 'CHEQUE' | 'BANK TRANSFER'>('CASH');
    const [qrRef, setQrRef] = useState('');
    const [qrBank, setQrBank] = useState('RAK BANK');
    const [qrDate, setQrDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [qrNarration, setQrNarration] = useState('');

    useEffect(() => {
      if (quickReceiptInvoice) {
        const outstanding = Math.max(0, quickReceiptInvoice.totalInvoiceValue - quickReceiptInvoice.amountReceived);
        setQrAmount(outstanding);
        setQrRef('');
        setQrBank('RAK BANK');
        setQrDate(new Date().toISOString().substring(0, 10));
        setQrNarration(`BEING CASH/CHEQUE SETTLEMENT VALUE DISCHARGE AGAINST OUTSTANDING INVOICE ${quickReceiptInvoice.invoiceNo}`);
        setQrMode('CASH');
      }
    }, [quickReceiptInvoice]);

    useEffect(() => {
      localStorage.setItem('MFI_OUTGOING_RECEIVABLES', JSON.stringify(receivables));
    }, [receivables]);

    const getNewVoucherNo = (category: 'RECEIVABLES' | 'PAYABLES', registers: any[]) => {
      const prefix = category === 'RECEIVABLES' ? 'RV' : 'PV';
      const currentYear = new Date().getFullYear().toString().substring(2); // e.g. "26"
      
      const numbers = registers
        .filter(r => {
          const cat = r.accountCategory || 'RECEIVABLES';
          return cat === category;
        })
        .map(r => {
          const matches = String(r.voucherNo || '').match(/\d+/g);
          if (matches && matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            if (matches.length > 1 && lastMatch.length === 2 && matches[matches.length - 2].length > 2) {
              return parseInt(matches[matches.length - 2], 10);
            }
            return parseInt(lastMatch, 10);
          }
          return null;
        })
        .filter((n): n is number => n !== null && !isNaN(n));
        
      let nextSeq = 1293;
      if (numbers.length > 0) {
        nextSeq = Math.max(...numbers) + 1;
      }
      return `${prefix}-${currentYear}-${nextSeq}`;
    };



    const innerPrintReceiptVoucher = (rcToPrint: any) => {
      const words = numberToWordsDirhams(rcToPrint.amountReceived);
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>MFI Cash/Cheque Receipt Voucher #${rcToPrint.voucherNo}</title>
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
              background-color: #ffffff;
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
              border-radius: 2px;
              font-weight: 750;
              background-color: #1e3a8a;
              color: #ffffff;
              margin-left: 4px;
              display: inline-block;
              vertical-align: middle;
            }
            
            .company-subtitle {
              font-size: 6px;
              font-weight: 750;
              color: #475569;
              margin-top: 1px;
              text-transform: uppercase;
              letter-spacing: 0.1px;
            }
            
            .company-contact {
              font-size: 5.5px;
              font-weight: 600;
              color: #64748b;
              margin-top: 1px;
            }
            
            .title-strip {
              background-color: #1e3a8a;
              color: #ffffff;
              padding: 3.5px 10px;
              font-weight: 900;
              font-size: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 6px;
              border-radius: 2px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .voucher-no-label {
              font-size: 9px;
              font-weight: 600;
              color: rgba(255, 255, 255, 0.7);
            }
            
            .voucher-no-val {
              color: #ffffff;
              font-family: "JetBrains Mono", monospace;
              font-size: 11px;
              font-weight: 900;
              margin-left: 4px;
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
              background-color: #ffffff;
              color: #1e3a8a;
              border-color: #ffffff;
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
                margin: 0 !important;
              }
              body {
                padding: 0.5in !important;
                margin: 0 !important;
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
              <!-- Header Block -->
              <div class="header-box">
                <div class="header-left">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 220" style="height: 28px; width: auto; display: block;">
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
                  </svg>
                </div>
                <div class="header-mid">
                  <div>
                    <span class="company-title-en">MARINE FASTENERS INDUSTRIES L.L.C.</span>
                    <span class="company-title-sp">Sole Proprietorship</span>
                  </div>
                  <div class="company-subtitle">Manufacturer of Fasteners, Pipe Support Clamps, Conduit Accessories.</div>
                  <div class="company-contact">
                    Shed 31, New Industrial Area, Ajman - U.A.E. &bull; Tel: +971 6 525 0526 &bull; Email: sales@marinefasteners.co
                  </div>
                </div>
              </div>

              <!-- Title Strip Block -->
              <div class="title-strip">
                <div>
                  <span class="voucher-no-label">${rcToPrint.accountCategory === 'PAYABLES' ? 'Payment Voucher No.' : (rcToPrint.paymentMode === 'CHEQUE' ? 'Cheque Received Voucher No.' : 'Receipt Voucher No.')}</span>
                  <span class="voucher-no-val">${rcToPrint.voucherNo || ''}</span>
                </div>
                
                <div style="font-weight: 900; font-size: 10px; letter-spacing: 0.5px; color: #ffffff; text-shadow: 1px 1px 1px rgba(0,0,0,0.2);">
                  ${rcToPrint.accountCategory === 'PAYABLES' ? (rcToPrint.paymentMode === 'CHEQUE' ? 'CHEQUE PAYMENT OFFICIAL VOUCHER' : 'OFFICIAL PAYMENT VOUCHER') : (rcToPrint.paymentMode === 'CHEQUE' ? 'CHEQUE RECEIVED OFFICIAL VOUCHER' : 'OFFICIAL PAYMENT RECEIPT')}
                </div>
                
                <div class="payment-badges-group">
                  <div class="payment-badge ${rcToPrint.paymentMode === 'CASH' ? 'active' : ''}">
                    <span class="bullet">●</span> Cash
                  </div>
                  <div class="payment-badge ${rcToPrint.paymentMode === 'CHEQUE' ? 'active' : ''}">
                    <span class="bullet">●</span> Cheque
                  </div>
                  <div class="payment-badge ${(rcToPrint.paymentMode !== 'CASH' && rcToPrint.paymentMode !== 'CHEQUE') ? 'active' : ''}">
                    <span class="bullet">●</span> Bank Wire
                  </div>
                </div>
              </div>

              <!-- Main Grid Layout -->
              <div class="main-grid">
                <div>
                  <div class="field-row">
                    <span class="field-label">${rcToPrint.accountCategory === 'PAYABLES' ? 'Payee:' : 'Received From:'}</span>
                    <div class="field-value">${rcToPrint.clientName || ''}</div>
                  </div>
                  <div class="field-row">
                    <span class="field-label">Address:</span>
                    <div class="field-value">${rcToPrint.clientAddress || 'AJMAN NEW INDUSTRIAL AREA - U.A.E.'}</div>
                  </div>
                  <div class="field-row">
                    <span class="field-label">Amount In Words:</span>
                    <div class="field-value" style="font-size: 8.5px; font-weight: 800; line-height: 1.2;">${words}</div>
                  </div>
                  <div class="field-row">
                    <span class="field-label">For Payment Of:</span>
                    <div class="field-value">${rcToPrint.narration || rcToPrint.description || 'SETTLEMENT OF OUTSTANDING METALLIC COATING INVOICE'}</div>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; justify-content: space-between;">
                  <div class="field-row" style="justify-content: flex-end;">
                    <span class="field-label" style="min-width: auto; margin-right: 4px;">Dated:</span>
                    <div class="field-value" style="max-width: 120px; font-family: monospace; font-weight: 900; color: #0f172a;">${rcToPrint.dated || ''}</div>
                  </div>

                  <div class="num-box-container">
                    <span class="num-title">${rcToPrint.accountCategory === 'PAYABLES' ? 'Amount Paid' : 'Amount Received'}</span>
                    <div class="num-box">
                      <span class="num-ccy">AED</span>
                      <span>${Number(rcToPrint.amountReceived || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Cheque details row if applicable -->
              ${rcToPrint.paymentMode === 'CHEQUE' ? `
                <div class="cheque-section" style="font-size: 8.5px; color: #1e3a8a; line-height: 1.4; display: grid; grid-template-cols: 1.2fr 1fr 1fr; gap: 10px;">
                  <div>
                    <span style="font-weight: 900; text-transform: uppercase;">Cheque No / Details:</span>
                    <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 100px; text-transform: uppercase;">${rcToPrint.chequeNoDetails || ''}</span>
                  </div>
                  <div>
                    <span style="font-weight: 900; text-transform: uppercase;">Drawn Bank:</span>
                    <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 100px; text-transform: uppercase;">${rcToPrint.bankName || 'RAK BANK'}</span>
                  </div>
                  <div>
                    <span style="font-weight: 900; text-transform: uppercase;">Cheque Date:</span>
                    <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 100px;">${rcToPrint.dated || ''}</span>
                  </div>
                </div>
              ` : `
                <div class="cheque-section" style="font-size: 8.5px; color: #1e3a8a; line-height: 1.4;">
                  <span style="font-weight: 900; text-transform: uppercase;">Transaction Reference / Details:</span>
                  <span style="font-weight: 700; border-bottom: 1px dotted #1e3a8a; padding-left: 4px; display: inline-block; min-width: 250px; text-transform: uppercase;">${rcToPrint.chequeNoDetails || 'CASH PAYOUT RECORDED'}</span>
                </div>
              `}

              <!-- Footer Block -->
              <div class="footer-signatures">
                <div class="sig-client">${rcToPrint.accountCategory === 'PAYABLES' ? "Recipient's Signature" : "Receiver's Signature"}</div>
                <div class="sig-mfi">
                  <div class="stamp-space">MFI Forge Hub Stamp</div>
                  <div class="sig-line">Prepared & Verified By</div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      printHtml(htmlContent, `MFI_Receipt_Voucher_${rcToPrint.voucherNo}`);
    };

    const combinedReceivables = useMemo(() => {
      // Use physical receipt vouchers directly from state (completely reactive)
      const receiptVouchers = receiptRegisters;

      // Load financial receipt vouchers dynamically
      const savedFinancialJson = localStorage.getItem('MF_FINANCIAL_VOUCHERS');
      let financialVouchers: any[] = [];
      if (savedFinancialJson) {
        try {
          const parsed = JSON.parse(savedFinancialJson);
          if (Array.isArray(parsed)) {
            financialVouchers = parsed;
          }
        } catch (e) {}
      }

      const manualRecs = receivables.map(r => {
        const val = Number(r.totalInvoiceValue) || 0;
        const invNo = (r.invoiceNo || r.id || '').trim().toUpperCase();
        
        // Sum from cash/cheque receipt registers (CASH & CHEQUE RECEIPTS)
        let dynamicReceived = 0;
        receiptVouchers.forEach(rc => {
          const rcAlloc = (rc.invoiceAllocated || rc.receivedAgainstInvoice || '').trim().toUpperCase();
          const cleanClient = (rc.clientName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
          const rBuyer = (r.buyerName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
          
          const allocatedInvoices = rcAlloc.split(',').map(s => s.trim());
          const isAllocatedToThis = allocatedInvoices.includes(invNo) || rcAlloc === invNo;

          if (isAllocatedToThis && rcAlloc !== '' && rcAlloc !== '—') {
            if (allocatedInvoices.length === 1) {
              dynamicReceived += Number(rc.amountReceived || 0);
            }
          } else if (cleanClient && rBuyer && cleanClient === rBuyer) {
            // Also try matching by client name and see if narration mentions invoice number
            const narr = (rc.narration || '').trim().toUpperCase();
            if (narr.includes(invNo)) {
              dynamicReceived += Number(rc.amountReceived || 0);
            }
          }
        });

        // Sum from financial receipt vouchers
        financialVouchers.forEach(fv => {
          const vRef = (fv.referenceNo || '').trim().toUpperCase();
          if (fv.voucherType === 'RECEIPT' && vRef === invNo && vRef !== '' && vRef !== '—') {
            dynamicReceived += Number(fv.amount || 0);
          }
        });

        const rec = Math.max(Number(r.amountReceived) || 0, dynamicReceived);
        return {
          ...r,
          id: r.id,
          source: 'manual' as const,
          displayKey: r.id,
          invoiceNo: r.invoiceNo || r.id,
          doNo: r.doNo || 'M-DO',
          dated: r.dated || r.date || '',
          lpoNo: r.lpoNo || r.poNo || 'N/A',
          buyerName: r.buyerName || 'UNKNOWN',
          cargoDetails: r.cargoDetails || 'Fastener Materials Cargo',
          totalInvoiceValue: val,
          amountReceived: rec,
          status: rec >= val ? 'PAID' : (rec > 0 ? 'PARTIAL' : 'UNPAID'),
          type: r.type || 'standard'
        };
      });

      const taxInvoiceWoRefs = new Set(
        savedDocs
          .filter((d: any) => (d.documentType === 'TAX INVOICE' || d.documentType === 'TAX INVOICE & DELIVERY NOTE') && d.associatedWorkOrderNo)
          .map((d: any) => (d.associatedWorkOrderNo || '').trim().toUpperCase())
      );

      const invoiceRecs = savedDocs
        .filter((inv: any) => {
          const docType = (inv.documentType || '').trim().toUpperCase();
          const isSupplierDoc = docType === 'PURCHASE ORDER' || docType === 'PURCHASE REQUEST' || inv.accountCategory === 'PAYABLES';
          if (isSupplierDoc) return false;

          const isCustomerDoc = docType === 'TAX INVOICE' || 
                                docType === 'TAX INVOICE & DELIVERY NOTE' ||
                                docType === 'WORK ORDER' ||
                                docType === 'JOB ORDER' ||
                                docType === 'PROFORMA INVOICE' ||
                                docType === 'DELIVERY NOTE';

          if (!isCustomerDoc) return false;

          // Prevent double counting if both a WORK ORDER and an associated TAX INVOICE exist in savedDocs for the exact same job
          if (docType === 'WORK ORDER' || docType === 'JOB ORDER') {
            const woNo = (inv.invoiceNo || inv.workOrderNo || '').trim().toUpperCase();
            if (woNo && taxInvoiceWoRefs.has(woNo)) {
              return false;
            }
          }

          return true;
        })
        .map((inv: any) => {
          const { grandTotal } = calculateInvGrandTotalAndVat(inv);
          const docNo = (inv.invoiceNo || inv.workOrderNo || '').trim().toUpperCase();
          const invNo = docNo;

          // Sum from cash/cheque receipt registers (CASH & CHEQUE RECEIPTS)
          let dynamicReceived = 0;
          receiptVouchers.forEach(rc => {
            const rcAlloc = (rc.invoiceAllocated || rc.receivedAgainstInvoice || '').trim().toUpperCase();
            const cleanClient = (rc.clientName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
            const docBuyer = (inv.buyerName || inv.companyName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
            
            const allocatedInvoices = rcAlloc.split(',').map(s => s.trim());
            const isAllocatedToThis = allocatedInvoices.includes(invNo) || rcAlloc === invNo;

            if (isAllocatedToThis && rcAlloc !== '' && rcAlloc !== '—') {
              if (allocatedInvoices.length === 1) {
                dynamicReceived += Number(rc.amountReceived || 0);
              }
            } else if (cleanClient && docBuyer && cleanClient === docBuyer) {
              // Also try matching by client name and see if narration mentions invoice number
              const narr = (rc.narration || '').trim().toUpperCase();
              if (narr.includes(invNo)) {
                dynamicReceived += Number(rc.amountReceived || 0);
              }
            }
          });

          // Sum from financial receipt vouchers
          financialVouchers.forEach(fv => {
            const vRef = (fv.referenceNo || '').trim().toUpperCase();
            if (fv.voucherType === 'RECEIPT' && vRef === invNo && vRef !== '' && vRef !== '—') {
              dynamicReceived += Number(fv.amount || 0);
            }
          });

          const displayedTotal = (inv.totalInvoiceValue !== undefined && inv.totalInvoiceValue !== null && Number(inv.totalInvoiceValue) !== 0) ? Number(inv.totalInvoiceValue) : (grandTotal || 0);
          const amountRec = Math.max(Number(inv.amountReceived) || Number(inv.receivedAmount) || Number(inv.amountPaid) || 0, dynamicReceived);
          
          // Format LPO reference to display associated Work Order number nicely
          const hasWo = inv.associatedWorkOrderNo && inv.associatedWorkOrderNo !== '—';
          const baseLpo = inv.lpoNo && inv.lpoNo !== '—' ? inv.lpoNo : '';
          const lpoAndWo = hasWo 
            ? (baseLpo ? `${baseLpo} (WO: ${inv.associatedWorkOrderNo})` : `WO: ${inv.associatedWorkOrderNo}`)
            : (inv.lpoNo || 'N/A');

          return {
            id: docNo || `INV-${Math.floor(Math.random() * 90000 + 10000)}`,
            source: 'invoice' as const,
            displayKey: docNo,
            invoiceNo: docNo,
            doNo: inv.deliveryNoteNo || inv.doNo || 'M-DO',
            dated: inv.dated || inv.date || '',
            lpoNo: lpoAndWo,
            buyerName: inv.buyerName || inv.companyName || inv.customerName || 'UNKNOWN CLIENT',
            cargoDetails: inv.cargoDetails || `${inv.documentType || 'TAX INVOICE'} | Ref #${docNo}`,
            totalInvoiceValue: displayedTotal,
            amountReceived: amountRec,
            status: (displayedTotal - amountRec <= 0) ? 'PAID' : (amountRec > 0 ? 'PARTIAL' : 'UNPAID'),
            type: inv.type || 'standard'
          };
        });

      return [...manualRecs, ...invoiceRecs];
    }, [receivables, savedDocs, storageToggle, receiptRegisters]);

    const totalOutstanding = useMemo(() => {
      return combinedReceivables.reduce((s, c) => s + Math.max(0, c.totalInvoiceValue - c.amountReceived), 0);
    }, [combinedReceivables]);

    const uniqueCustomers = useMemo(() => {
      const customers = new Set<string>();
      combinedReceivables.forEach(p => {
        if (p.buyerName) {
          const name = p.buyerName.trim().toUpperCase();
          if (name) {
            customers.add(name);
          }
        }
      });
      return Array.from(customers).sort();
    }, [combinedReceivables]);

    const filteredReceivables = useMemo(() => {
      let filtered = combinedReceivables.filter(p => {
        if (receivablesFilterType === 'all') return true;
        return p.type === receivablesFilterType;
      });

      if (selectedCustomerFilter !== 'all') {
        filtered = filtered.filter(p => (p.buyerName || '').trim().toUpperCase() === selectedCustomerFilter.trim().toUpperCase());
      }

      if (receivablesSearchQuery.trim()) {
        const query = receivablesSearchQuery.toLowerCase().trim();
        filtered = filtered.filter(p => {
          return (
            (p.invoiceNo || '').toLowerCase().includes(query) ||
            (p.doNo || '').toLowerCase().includes(query) ||
            (p.lpoNo || '').toLowerCase().includes(query) ||
            (p.buyerName || '').toLowerCase().includes(query) ||
            (p.cargoDetails || '').toLowerCase().includes(query)
          );
        });
      }

      // Sort by buyerName (customer name) first to group invoices together, then by dated descending
      return [...filtered].sort((a, b) => {
        const nameA = (a.buyerName || '').trim().toUpperCase();
        const nameB = (b.buyerName || '').trim().toUpperCase();
        if (nameA !== nameB) {
          return nameA.localeCompare(nameB);
        }
        const dateA = a.dated || '';
        const dateB = b.dated || '';
        return dateB.localeCompare(dateA);
      });
    }, [combinedReceivables, receivablesFilterType, receivablesSearchQuery, selectedCustomerFilter]);

    useEffect(() => {
      if (!activePreviewDoc) {
        setPreviewDoc(null);
        return;
      }

      // Check manual versus savedDocs source
      if (activePreviewDoc.source === 'manual') {
        setPreviewDoc({
          id: activePreviewDoc.id,
          type: activePreviewDoc.type || 'standard',
          invoiceNo: activePreviewDoc.invoiceNo || '',
          doNo: activePreviewDoc.doNo || '',
          dated: activePreviewDoc.dated || activePreviewDoc.date || '',
          lpoNo: activePreviewDoc.lpoNo || '',
          buyerName: activePreviewDoc.buyerName || '',
          items: [
            {
              id: 'it-1',
              sn: 1,
              description: activePreviewDoc.cargoDetails || 'CONSOLIDATED METALLIC FASTENER CARGO DISPATCH',
              size: 'M20',
              finish: 'ZINC PLATED',
              unit: 'PCS',
              text: 'PCS',
              qty: 1,
              unitPriceWOVAT: activePreviewDoc.totalInvoiceValue / 1.05,
              total: (activePreviewDoc.totalInvoiceValue / 1.05).toFixed(2)
            }
          ],
          totalInvoiceValue: activePreviewDoc.totalInvoiceValue,
          amountReceived: activePreviewDoc.amountReceived,
          balanceLeft: activePreviewDoc.totalInvoiceValue - activePreviewDoc.amountReceived,
          paymentTerms: '30 DAYS',
          dispatchBy: 'BY ROAD (MFI TRUCK)',
          receiverName: 'MR. FAISAL AHMED',
          qcCheckedBy: 'ENG. CHRIS MILLER',
        });
      } else {
        const matched = savedDocs.find(inv => inv.invoiceNo === activePreviewDoc.id);
        if (matched) {
          const deepCloned = JSON.parse(JSON.stringify(matched));
          
          let itemSum = 0;
          const mappedItems = (deepCloned.items || []).map((it: any, idx: number) => {
            const qty = Number(it.qty) || 0;
            const price = Number(it.unitPriceWOVAT) || Number(it.unitPrice) || 0;
            const total = qty * price;
            itemSum += total;
            return {
              id: it.id || `it-${Date.now()}-${idx}`,
              sn: idx + 1,
              description: it.description || 'METAL MEMBER',
              size: it.size || 'M16',
              finish: it.finish || 'ZINC PLATED',
              unit: it.unit || 'PCS',
              qty,
              unitPriceWOVAT: price,
              total: total.toFixed(2)
            };
          });

          const { grandTotal } = calculateInvGrandTotalAndVat(deepCloned);
          const amtReceived = Number(deepCloned.amountReceived) || 0;

          setPreviewDoc({
            id: deepCloned.invoiceNo,
            type: deepCloned.type || 'standard',
            invoiceNo: deepCloned.invoiceNo,
            doNo: deepCloned.deliveryNoteNo || deepCloned.doNo || 'M-DO',
            dated: deepCloned.dated || '',
            lpoNo: deepCloned.lpoNo || '',
            buyerName: deepCloned.buyerName || deepCloned.companyName || '',
            items: mappedItems,
            totalInvoiceValue: grandTotal.toFixed(2),
            amountReceived: amtReceived,
            balanceLeft: (grandTotal - amtReceived).toFixed(2),
            paymentTerms: deepCloned.paymentTerms || '30 DAYS',
            dispatchBy: deepCloned.dispatchedBy || 'BY ROAD (MFI TRUCK)',
            receiverName: 'MR. FAISAL AHMED',
            qcCheckedBy: 'ENG. CHRIS MILLER',
          });
        }
      }
    }, [activePreviewDoc, savedDocs]);

    const handleUpdatePreviewDocField = (field: string, value: any) => {
      setPreviewDoc((prevValue: any) => {
        if (!prevValue) return null;
        const up = { ...prevValue, [field]: value };
        if (field === 'totalInvoiceValue' || field === 'amountReceived') {
          const tc = parseFloat(up.totalInvoiceValue) || 0;
          const ap = parseFloat(up.amountReceived) || 0;
          up.balanceLeft = (tc - ap).toFixed(2);
        }
        return up;
      });
    };

    const handleUpdatePreviewDocItemField = (itemId: string, field: string, value: any) => {
      setPreviewDoc((prevValue: any) => {
        if (!prevValue) return null;
        const updatedItems = prevValue.items.map((it: any) => {
          if (it.id === itemId) {
            const upIt = { ...it, [field]: value };
            if (field === 'qty' || field === 'unitPriceWOVAT') {
              const q = parseFloat(upIt.qty) || 0;
              const p = parseFloat(upIt.unitPriceWOVAT) || 0;
              upIt.total = (q * p).toFixed(2);
            }
            return upIt;
          }
          return it;
        });

        const { grandTotal } = calculateInvGrandTotalAndVat({ ...prevValue, items: updatedItems });

        return {
          ...prevValue,
          items: updatedItems,
          totalInvoiceValue: grandTotal.toFixed(2),
          balanceLeft: (grandTotal - (parseFloat(prevValue.amountReceived) || 0)).toFixed(2)
        };
      });
    };

    const handleAppendPreviewDocItem = () => {
      setPreviewDoc((prevValue: any) => {
        if (!prevValue) return null;
        const nextSn = prevValue.items.length + 1;
        const newItem = {
          id: `new-${Date.now()}-${nextSn}`,
          sn: nextSn,
          description: 'HEAVY HEX HEAD MEMBERS ASTM A325',
          size: 'M24',
          finish: 'ZINC PLATED',
          unit: 'PCS',
          qty: 1000,
          unitPriceWOVAT: 12.50,
          total: (1000 * 12.50).toFixed(2)
        };
        const updatedItems = [...prevValue.items, newItem];
        const { grandTotal } = calculateInvGrandTotalAndVat({ ...prevValue, items: updatedItems });
        return {
          ...prevValue,
          items: updatedItems,
          totalInvoiceValue: grandTotal.toFixed(2),
          balanceLeft: (grandTotal - (parseFloat(prevValue.amountReceived) || 0)).toFixed(2)
        };
      });
    };

    const handleRemovePreviewDocItem = (itemId: string) => {
      setPreviewDoc((prevValue: any) => {
        if (!prevValue) return null;
        const filtered = prevValue.items.filter((it: any) => it.id !== itemId);
        const reindexed = filtered.map((it: any, idx: number) => ({ ...it, sn: idx + 1 }));
        const { grandTotal } = calculateInvGrandTotalAndVat({ ...prevValue, items: reindexed });
        return {
          ...prevValue,
          items: reindexed,
          totalInvoiceValue: grandTotal.toFixed(2),
          balanceLeft: (grandTotal - (parseFloat(prevValue.amountReceived) || 0)).toFixed(2)
        };
      });
    };

    const handleSavePreviewDoc = () => {
      if (!previewDoc || !activePreviewDoc) return;
      
      if (activePreviewDoc.source === 'manual') {
        const updated = receivables.map(r => {
          if (r.id === activePreviewDoc.id) {
            return {
              ...r,
              doNo: previewDoc.doNo,
              dated: previewDoc.dated,
              invoiceNo: previewDoc.invoiceNo,
              lpoNo: previewDoc.lpoNo,
              buyerName: previewDoc.buyerName,
              cargoDetails: previewDoc.items?.[0]?.description || 'METALLIC FASTENERS DISPATCH',
              totalInvoiceValue: Number(previewDoc.totalInvoiceValue) || 0,
              amountReceived: Number(previewDoc.amountReceived) || 0,
              type: previewDoc.type || 'standard',
              status: (Number(previewDoc.amountReceived) >= Number(previewDoc.totalInvoiceValue)) ? 'PAID' : (Number(previewDoc.amountReceived) > 0 ? 'PARTIALLY PAID' : 'UNPAID')
            };
          }
          return r;
        });
        setReceivables(updated);
        localStorage.setItem('MFI_OUTGOING_RECEIVABLES', JSON.stringify(updated));
      } else {
        const updatedInvoices = savedDocs.map(inv => {
          if (inv.invoiceNo === activePreviewDoc.id) {
            return {
              ...inv,
              invoiceNo: previewDoc.invoiceNo,
              deliveryNoteNo: previewDoc.doNo,
              doNo: previewDoc.doNo,
              dated: previewDoc.dated,
              lpoNo: previewDoc.lpoNo,
              buyerName: previewDoc.buyerName,
              companyName: previewDoc.buyerName,
              items: previewDoc.items,
              totalInvoiceValue: Number(previewDoc.totalInvoiceValue) || 0,
              amountReceived: Number(previewDoc.amountReceived) || 0,
              paymentTerms: previewDoc.paymentTerms,
              dispatchedBy: previewDoc.dispatchBy,
              type: previewDoc.type || 'standard',
              paymentStatus: (Number(previewDoc.totalInvoiceValue) - Number(previewDoc.amountReceived)) <= 0 ? 'PAID' : (Number(previewDoc.amountReceived) > 0 ? 'PARTIAL' : 'UNPAID')
            };
          }
          return inv;
        });
        setSavedDocs(updatedInvoices);
        localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(updatedInvoices));
      }
      
      triggerToast("Customer TAX Invoice Ledger modified safely!");
      setActivePreviewDoc(null);
    };

    const handleUpdateReceivablesField = (id: string, source: 'manual' | 'invoice', field: string, value: any) => {
      if (source === 'manual') {
        const updated = receivables.map(r => {
          if (r.id === id) {
            const up = { ...r, [field]: value };
            if (field === 'totalInvoiceValue' || field === 'amountReceived') {
              const val = Number(up.totalInvoiceValue) || 0;
              const rec = Number(up.amountReceived) || 0;
              up.status = rec >= val ? 'PAID' : (rec > 0 ? 'PARTIALLY PAID' : 'UNPAID');
            }
            return up;
          }
          return r;
        });
        setReceivables(updated);
        localStorage.setItem('MFI_OUTGOING_RECEIVABLES', JSON.stringify(updated));
      } else {
        const updatedInvoices = savedDocs.map((inv: any) => {
          if (inv.invoiceNo === id) {
            const up = { ...inv, [field]: value };
            if (field === 'totalInvoiceValue' || field === 'amountReceived') {
              const val = Number(up.totalInvoiceValue) || 0;
              const rec = Number(up.amountReceived) || 0;
              up.paymentStatus = (val - rec) <= 0 ? 'PAID' : (rec > 0 ? 'PARTIAL' : 'UNPAID');
            }
            return up;
          }
          return inv;
        });
        setSavedDocs(updatedInvoices);
        localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(updatedInvoices));
      }
    };

    const handleDeleteReceivableRow = (id: string, source: 'manual' | 'invoice') => {
      setDeleteReceivableTarget({ id, source });
    };

    const handlePostQuickReceipt = (e: React.FormEvent) => {
      e.preventDefault();
      if (!quickReceiptInvoice) return;
      if (qrAmount <= 0) {
        alert("Please specify a valid payment amount!");
        return;
      }

      const nextId = 'rc-' + Date.now();
      const voucherNoStr = getNewVoucherNo('RECEIVABLES', receiptRegisters);
      const newVoucher = {
        id: nextId,
        voucherNo: voucherNoStr,
        dated: qrDate,
        clientName: quickReceiptInvoice.buyerName,
        clientAddress: 'AJMAN NEW INDUSTRIAL AREA, SHED 12 - U.A.E.',
        amountReceived: qrAmount,
        paymentMode: qrMode,
        chequeNoDetails: qrRef || (qrMode === 'CHEQUE' ? 'CHQ-' + Math.floor(Math.random() * 900000) : 'REF-' + Math.floor(Math.random() * 900000)),
        bankName: qrBank,
        narration: qrNarration,
        invoiceAllocated: quickReceiptInvoice.invoiceNo,
        receivedAgainstInvoice: quickReceiptInvoice.invoiceNo,
        accountCategory: 'RECEIVABLES' as const,
        targetCustomerId: 'cust-' + quickReceiptInvoice.buyerName.trim().replace(/\s+/g, '-').toLowerCase()
      };

      const updatedVouchers = [...receiptRegisters, newVoucher];
      setReceiptRegisters(updatedVouchers);
      localStorage.setItem('MF_RECEIPT_VOUCHERS', JSON.stringify(updatedVouchers));

      if (quickReceiptInvoice.source === 'invoice') {
        const updatedDocs = savedDocs.map((doc: any) => {
          if (doc.invoiceNo === quickReceiptInvoice.invoiceNo) {
            const currentPaid = Number(doc.amountReceived || doc.receivedAmount || 0);
            const newPaid = currentPaid + qrAmount;
            return {
              ...doc,
              amountReceived: newPaid,
              receivedAmount: newPaid,
              paymentStatus: newPaid >= Number(doc.grandTotal || doc.totalInvoiceValue || 0) ? 'PAID' : 'PARTIAL'
            };
          }
          return doc;
        });
        setSavedDocs(updatedDocs);
        localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(updatedDocs));
      } else {
        const updatedRecs = receivables.map((rec: any) => {
          if (rec.id === quickReceiptInvoice.id || rec.invoiceNo === quickReceiptInvoice.invoiceNo) {
            const currentPaid = Number(rec.amountReceived || 0);
            const newPaid = currentPaid + qrAmount;
            const totalVal = Number(rec.totalInvoiceValue || 0);
            return {
              ...rec,
              amountReceived: newPaid,
              status: newPaid >= totalVal ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'UNPAID')
            };
          }
          return rec;
        });
        setReceivables(updatedRecs);
        localStorage.setItem('MFI_OUTGOING_RECEIVABLES', JSON.stringify(updatedRecs));
      }

      const savedSoaStr = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
      if (savedSoaStr) {
        try {
          const soaTxs = JSON.parse(savedSoaStr);
          const cleanClient = quickReceiptInvoice.buyerName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
          let updatedAny = false;
          Object.keys(soaTxs).forEach(code => {
            const codeClean = code.replace(/-/g, ' ').toUpperCase();
            if (codeClean === cleanClient || cleanClient.includes(codeClean) || codeClean.includes(cleanClient)) {
              const txs = soaTxs[code];
              if (Array.isArray(txs)) {
                soaTxs[code] = txs.map((tx: any) => {
                  if (tx.invoiceRef === quickReceiptInvoice.invoiceNo) {
                    const currentPaid = Number(tx.amountPaid || 0);
                    updatedAny = true;
                    return {
                      ...tx,
                      amountPaid: currentPaid + qrAmount,
                      datePaid: qrDate,
                      receiptNo: voucherNoStr,
                      paymentMode: qrMode
                    };
                  }
                  return tx;
                });
              }
            }
          });
          if (updatedAny) {
            localStorage.setItem('MFI_SOA_CUSTOMER_TRANSACTIONS', JSON.stringify(soaTxs));
          }
        } catch (e) {}
      }

      triggerToast(`Order-Wise Receipt Posted Successfully! Outstanding updated to AED ${Math.max(0, quickReceiptInvoice.totalInvoiceValue - (quickReceiptInvoice.amountReceived + qrAmount)).toLocaleString()}`);
      setQuickReceiptInvoice(null);
      window.dispatchEvent(new Event('storage'));
    };

    const handleAddCustomerReceivable = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCargoDetails.trim()) {
        alert("Please specify metallic material details!");
        return;
      }
      const newRec = {
        id: newRecId.toUpperCase().trim(),
        doNo: newDoNo.toUpperCase().trim() || 'M-REC',
        dated: newDueDate,
        invoiceNo: newRecId.toUpperCase().trim() || 'INV-TEMP',
        lpoNo: newLpoNo.toUpperCase().trim() || 'LPO-TEMP',
        buyerName: newBuyerName,
        cargoDetails: newCargoDetails.trim(),
        totalInvoiceValue: newInvoiceValue,
        amountReceived: newInitialReceived,
        currency: 'AED',
        dueDate: newDueDate,
        invoiceDate: newDueDate,
        paymentMode: newPaymentMode,
        type: newClassification,
        status: newInitialReceived >= newInvoiceValue ? 'PAID' : (newInitialReceived > 0 ? 'PARTIALLY PAID' : 'UNPAID')
      };
      setReceivables([newRec, ...receivables]);
      
      setNewRecId('REC-' + Math.floor(Math.random() * 900 + 100));
      setNewDoNo('DO-' + Math.floor(Math.random() * 90000 + 10000));
      setNewLpoNo('LPO-' + Math.floor(Math.random() * 90000 + 10000));
      setNewCargoDetails('');
      setNewInvoiceValue(45000);
      setNewInitialReceived(0);
      setIsAddingRec(false);
      triggerToast(`Account receivable logged successfully for ${newRec.id}!`);
    };

    const handleApplyReceipt = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectRecId) {
        alert("Please select outstanding customer invoice to reconcile!");
        return;
      }

      const targetRec = combinedReceivables.find(b => b.id === selectRecId);
      if (!targetRec) return;

      if (targetRec.source === 'manual') {
        const updated = receivables.map(r => {
          if (r.id === selectRecId) {
            const costLeft = Math.max(0, r.totalInvoiceValue - r.amountReceived);
            const recThisTime = Math.min(depositAmt, costLeft);
            const nextRec = r.amountReceived + recThisTime;
            const hasFinished = nextRec >= r.totalInvoiceValue;
            return {
              ...r,
              amountReceived: nextRec,
              status: hasFinished ? 'PAID' : `PARTIAL`
            };
          }
          return r;
        });
        setReceivables(updated);
        localStorage.setItem('MFI_OUTGOING_RECEIVABLES', JSON.stringify(updated));
        triggerToast("Customer Accounts Receivable ledger successfully reconciled!");
      } else {
        const updatedInvoices = savedDocs.map((inv: any) => {
          if (inv.invoiceNo === selectRecId) {
            const { grandTotal } = calculateInvGrandTotalAndVat(inv);
            const currentReceived = Number(inv.amountReceived) || Number(inv.receivedAmount) || 0;
            const costLeft = Math.max(0, grandTotal - currentReceived);
            const recThisTime = Math.min(depositAmt, costLeft);
            const nextRec = currentReceived + recThisTime;
            return {
              ...inv,
              amountReceived: nextRec,
              paymentStatus: (grandTotal - nextRec) <= 0 ? 'PAID' : 'PARTIAL'
            };
          }
          return inv;
        });
        setSavedDocs(updatedInvoices);
        localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(updatedInvoices));
        triggerToast("TAX Invoice Payment received and logged inside Accounts Receivable ledger!");
      }

      setSelectRecId('');
    };

    const handlePrintInvoice = (p: any, optionalPreviewDoc?: any) => {
      const activeDocToPrint = optionalPreviewDoc || previewDoc || p;
      const docData = {
        ...activeDocToPrint,
        items: activeDocToPrint.items || [{
          sn: 1,
          description: p.cargoDetails || 'CONSOLIDATED METALLIC FASTENER CARGO DISPATCH',
          size: 'M20',
          finish: 'ZINC PLATED',
          unit: 'PCS',
          qty: 2500,
          unitPriceWOVAT: 15.00,
          unitPrice: 15.00,
          total: 37500
        }]
      };
      const htmlContent = generateHighFidelityDocHtml(docData, 'TAX INVOICE', undefined, {
        printArea: 'ENTIRE',
        showUnitWeightInPrint: true,
        showTotalWeightInPrint: true,
        printPageSize: 'A4',
      });
      printHtml(htmlContent, `Sales_Tax_Invoice_${docData.invoiceNo || docData.id}`);
    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-mono text-[11px]">
        {/* On-screen visual modal overlay for the TAX INVOICE preview */}
        {activePreviewDoc && previewDoc && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-50 rounded-2xl border-4 border-black w-full max-w-5xl max-h-[95vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative font-sans">
              <button 
                type="button" 
                onClick={() => setActivePreviewDoc(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Invoice Sheet Frame */}
              <div className="bg-white p-6 sm:p-8 border border-slate-300 rounded-xl space-y-5 shadow-sm text-left font-sans mt-2">
                
                {/* Title Section */}
                <div className="text-center relative py-1">
                  <h1 className="text-[24px] sm:text-[26px] font-sans font-black tracking-widest text-black uppercase leading-none">
                    TAX INVOICE
                  </h1>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono font-bold mt-1.5">
                    MARINE FASTENERS INDUSTRIES L.L.C.
                  </p>
                  <div className="border-t-2 border-slate-300 mt-3"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
                  {/* Left block of the supplier address */}
                  <div className="md:col-span-7 space-y-1.5 font-sans">
                    <span className="text-[9px] text-[#FF6B00] font-semibold uppercase block tracking-wider leading-none">
                      SUPPLIER / CONSIGNOR:
                    </span>
                    <div className="text-[#0c449e] font-sans font-bold text-[13px] uppercase leading-tight">
                      MARINE FASTENERS INDUSTRIES L.L.C.
                    </div>
                    <p className="text-slate-600 text-[9.5px] uppercase font-bold leading-relaxed font-sans font-sans">
                      Ajman New Industrial Area 2, United Arab Emirates (MFI FORGE HUB).
                    </p>
                    <p className="text-slate-400 text-[8.5px] font-sans tracking-wide">
                      TELEPHONE : +971-6-525-0526 | EMAIL : BILLING@MARINEFASTENERS.CO
                    </p>
                    <div className="pt-0.5">
                      <span className="inline-block border border-slate-200 p-0.5 px-2 bg-slate-50 font-mono font-bold text-[8.5px] text-slate-700">
                        TRN: 100440509600003
                      </span>
                    </div>
                  </div>

                  {/* Right block: Metadata Grid */}
                  <div className="md:col-span-5">
                    <div className="border border-slate-400 rounded-md overflow-hidden bg-white grid grid-cols-2 text-[10px] divide-y divide-slate-300 divide-x divide-slate-400 font-sans">
                      
                      {/* Field 1: Invoice No */}
                      <div className="p-1 px-2 text-left col-span-2">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          INVOICE NO
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#dc2626] block mt-1 uppercase">
                          {previewDoc.invoiceNo || '—'}
                        </span>
                      </div>

                      {/* Field 2: DO No */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          DELIVERY NOTE NO
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-800 block mt-1 uppercase">
                          {previewDoc.doNo || '—'}
                        </span>
                      </div>

                      {/* Field 3: Date */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          DATE OF ISSUE
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-800 block mt-1">
                          {previewDoc.dated || '—'}
                        </span>
                      </div>

                      {/* Field 4: PO No */}
                      <div className="p-1 px-2 text-left col-span-2">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          BUYER LPO / WO NO
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-800 block mt-1 uppercase">
                          {previewDoc.lpoNo || '—'}
                        </span>
                      </div>

                      {/* Field 5: Dispatch By */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          DISPATCH CARRIER
                        </span>
                        <span className="text-[9px] font-mono font-semibold text-slate-700 block mt-1 uppercase">
                          {previewDoc.dispatchBy || 'BY ROAD (MFI TRUCK)'}
                        </span>
                      </div>

                      {/* Field 6: Payment Terms */}
                      <div className="p-1 px-2 text-left">
                        <span className="text-[7.5px] text-slate-400 font-bold block uppercase tracking-wider leading-none">
                          PAYMENT TERMS
                        </span>
                        <span className="text-[9px] font-mono font-semibold text-slate-700 block mt-1 uppercase">
                          {previewDoc.paymentTerms || '30 DAYS'}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Buyer Client Card */}
                <div className="border border-slate-350 p-4 rounded-lg bg-slate-50/50 relative text-left text-[10px] space-y-2">
                  <span className="text-[#0c449e] text-[8.5px] font-semibold uppercase tracking-wide block">
                    CUSTOMER / BUYER PARTICULAR:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 font-sans">
                    <div className="md:col-span-8 space-y-1.5">
                      <span className="w-full font-sans font-bold text-[#0c449e] text-[12px] uppercase block">
                        {previewDoc.buyerName || '—'}
                      </span>

                      <div>
                        <label className="text-slate-400 font-bold text-[7.5px] tracking-wider block">REGISTERED TAX MAILING ADDRESS:</label>
                        <span className="text-slate-700 text-[10px] uppercase font-mono mt-0.5 block leading-normal font-semibold">
                          NEW PORT ROAD, NEW INDUSTRIAL AREA, JEDDAH/AJMAN TAX REGISTERED ZONE
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-4 border-l border-slate-300 pl-4 space-y-1.5 font-sans animate-none">
                      <div className="flex justify-between items-center h-5">
                        <span className="text-slate-400 uppercase font-semibold text-[8px]">TRN:</span>
                        <span className="font-bold text-slate-700 text-[9.5px] text-right">100440509600002</span>
                      </div>
                      <div className="flex justify-between items-center h-5">
                        <span className="text-slate-400 uppercase font-semibold text-[8px]">STATE:</span>
                        <span className="font-semibold text-slate-600 text-[9.5px] text-right">AJMAN, UAE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outgoing Material Line specifications table */}
                <div className="border border-slate-400 rounded-md overflow-x-auto bg-white">
                  <table className="w-full text-[10px] text-center divide-y divide-slate-400 font-mono min-w-[900px]">
                    <thead className="bg-[#f8fafc] text-indigo-950 uppercase font-semibold divide-y divide-slate-400 font-sans">
                      <tr className="divide-x divide-slate-400 h-10 bg-indigo-50/20">
                        <th className="w-8 font-bold text-center text-[8.5px]">S.N</th>
                        <th className="w-40 text-left pl-2 text-[8.5px]">ITEM DESCRIPTION</th>
                        <th className="w-16 text-[8.5px]">SIZE</th>
                        <th className="w-20 text-[8.5px]">FINISH</th>
                        <th className="w-14 text-[8.5px]">UNIT</th>
                        <th className="w-16 text-[8.5px]">QTY</th>
                        <th className="w-20 text-[8.5px] text-emerald-850 font-sans text-right pr-2">UNIT PRICE (AED)</th>
                        <th className="w-24 text-[8.5px] text-emerald-900 font-sans text-right pr-2">NET VALUE (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {previewDoc.items && previewDoc.items.map((row: any) => (
                        <tr key={row.id} className="divide-x divide-slate-300 h-9 hover:bg-slate-50/50 align-middle">
                          <td className="text-center font-bold text-slate-700 select-none text-[9.5px]">
                            {row.sn}
                          </td>
                          <td className="text-left pl-2 font-sans font-bold text-slate-800 text-[10px]">
                            <span className="font-bold uppercase block px-1">
                              {row.description || '—'}
                            </span>
                          </td>
                          <td>
                            <span className="text-center text-[9.5px] text-slate-700 uppercase block px-1">
                              {row.size || '—'}
                            </span>
                          </td>
                          <td>
                            <span className="text-center text-[9.5px] text-slate-700 uppercase block px-1">
                              {row.finish || '—'}
                            </span>
                          </td>
                          <td>
                            <span className="text-center text-[9.5px] font-bold text-slate-700 uppercase block px-1">
                              {row.unit || 'PCS'}
                            </span>
                          </td>
                          <td>
                            <span className="text-center text-[10px] font-bold text-indigo-900 block px-1">
                              {row.qty || 0}
                            </span>
                          </td>
                          <td>
                            <span className="text-right text-[9.5px] font-bold text-emerald-800 block pr-2">
                              {row.unitPriceWOVAT === 0 ? '0.00' : (parseFloat(row.unitPriceWOVAT) || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="text-right pr-2 relative">
                            <span className="font-mono font-bold text-[#0c449e]">AED {parseFloat(row.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Math computations & tax layout block */}
                <div className="bg-slate-50 text-slate-900 p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-[8.5px] text-slate-500 block uppercase font-bold font-sans tracking-wide mb-1 leading-none">
                      Gross Sale Value + 5% VAT (AED):
                    </span>
                    <div className="font-sans font-bold text-slate-900 text-[14px]">
                      AED {(parseFloat(previewDoc.totalInvoiceValue) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-emerald-700 block uppercase font-semibold font-sans tracking-wide mb-1 leading-none">
                      Total Cleared Cash Received (AED):
                    </span>
                    <div className="font-sans font-bold text-emerald-750 text-[14px] mt-1">
                      AED {(parseFloat(previewDoc.amountReceived) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-500 block uppercase font-bold font-sans tracking-wide mb-1 leading-none">
                      Calculated Debtor Outstanding:
                    </span>
                    <div className="font-sans font-bold text-rose-700 text-[14px] select-none">
                      AED {Math.max(0, (parseFloat(previewDoc.totalInvoiceValue) || 0) - (parseFloat(previewDoc.amountReceived) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 text-left text-[9.5px] font-sans">
                  <div className="border border-slate-300 p-4 rounded-lg bg-white relative text-left text-[10px] space-y-3 font-sans">
                    <span className="text-[#FF6B00] text-[8.5px] font-semibold uppercase tracking-wide block leading-none">
                      CUSTOMER REPRESENTATIVE ACKNOWLEDGMENT:
                    </span>
                    <div className="text-[8.5px] text-slate-400 font-mono tracking-wide pt-2">
                      SIGNATURE / ACKNOWLEDGMENT STAMP: _________________
                    </div>
                  </div>

                  <div className="border border-slate-300 p-4 rounded-lg bg-white relative text-left text-[10px] space-y-3 font-sans">
                    <span className="text-[#0c449e] text-[8.5px] font-semibold uppercase tracking-wide block leading-none">
                      FOR: MARINE FASTENERS INDUSTRIES LLC:
                    </span>
                    <div className="text-[8.5px] text-slate-400 font-mono tracking-wide pt-2">
                      ACCOUNTS SUPERVISOR SIGNATURE &amp; COMPANY SEAL
                    </div>
                  </div>
                </div>

                {/* Small Footer */}
                <div className="pt-4 border-t border-slate-200 flex justify-between text-[7.5px] text-slate-400 uppercase tracking-wider leading-none font-sans">
                  <span>Marine Fasteners Industries LLC - Sales & Billing Accounts</span>
                  <span>ISO 9001:2015 CERTIFIED SYSTEM</span>
                </div>

              </div>

              {/* Action Operations Bar */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end items-center bg-slate-100 p-4 rounded-xl border border-slate-300 font-sans">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    type="button" 
                    onClick={() => setActivePreviewDoc(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-slate-300 hover:bg-slate-200 font-sans font-bold text-slate-700 rounded-xl text-xs uppercase transition-colors cursor-pointer"
                  >
                    Close Original View
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handlePrintInvoice(activePreviewDoc, previewDoc)}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4 text-white" /> Print Invoice Document (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal for Deletion - Bypasses Browser iFrame confirm blocks */}
        {deleteReceivableTarget && (
          <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl border-4 border-black w-full max-w-sm p-6 shadow-2xl relative font-sans text-left animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-sm font-bold text-rose-600 tracking-tight mb-2 uppercase">⚠ Confirm Voiding</h3>
              <p className="text-[10.5px] text-slate-600 mb-6 font-semibold leading-relaxed font-sans">
                Are you absolutely sure you want to permanently delete this customer receivable/invoice row? This action will update the active ledger database and cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const { id, source } = deleteReceivableTarget;
                    if (source === 'manual') {
                      setReceivables(prev => {
                        const next = prev.filter(p => p.id !== id);
                        localStorage.setItem('MFI_OUTGOING_RECEIVABLES', JSON.stringify(next));
                        return next;
                      });
                      triggerToast("Manual receivable transaction voided successfully!");
                    } else {
                      setSavedDocs(prev => {
                        const next = prev.filter(inv => (inv.invoiceNo || '').trim().toUpperCase() !== id.trim().toUpperCase());
                        localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(next));
                        return next;
                      });
                      triggerToast("TAX Invoice document voided and removed from lists successfully!");
                    }
                    setDeleteReceivableTarget(null);
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs uppercase transition-colors cursor-pointer"
                >
                  Yes, Void Record
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteReceivableTarget(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-bold text-xs uppercase border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Modal for selecting Statement View Type */}
        {soaPopupClient && (
          <div className="fixed inset-0 z-[65] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl border-4 border-black w-full max-w-md p-6 shadow-2xl relative font-sans text-left animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setSoaPopupClient(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-black transition-colors font-sans text-lg font-bold"
                title="Close"
              >
                ✕
              </button>
              
              <div className="mb-4">
                <span className="text-[9px] bg-amber-100 text-[#f37021] border border-amber-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  STATEMENT DEBTOR
                </span>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-1 uppercase">
                  {soaPopupClient.buyerName}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium font-sans mt-1">
                  Select the type of financial report statement you want to generate.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const targetCleanName = soaPopupClient.buyerName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
                    const savedCustomersJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
                    let regCustomers: any[] = [];
                    if (savedCustomersJson) {
                      try {
                        regCustomers = JSON.parse(savedCustomersJson);
                      } catch (e) {}
                    }
                    const matchedCust = regCustomers.find((c: any) => {
                      const cName = (c.name || c.companyName || '').trim().toUpperCase();
                      return cName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === targetCleanName;
                    });
                    const custId = matchedCust ? matchedCust.id : ('cust-' + soaPopupClient.buyerName.trim().replace(/\s+/g, '-').toLowerCase());
                    
                    localStorage.setItem('MFI_SOA_FILTER_MODE', 'pending');
                    localStorage.setItem('MFI_SOA_SELECTED_CUSTOMER_ID', custId);
                    localStorage.setItem('mf_erp_active_tab', 'customer_soa');
                    window.dispatchEvent(new Event('storage'));
                    window.dispatchEvent(new Event('mfi_soa_select_customer'));
                    window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'customer_soa' }));
                    setSoaPopupClient(null);
                  }}
                  className="w-full text-left bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-500 hover:to-amber-500 border-2 border-slate-900 text-slate-900 hover:text-white p-3 rounded-xl transition-all shadow-sm hover:translate-y-[-1px] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-amber-100 group-hover:bg-amber-400 rounded-lg border border-amber-300">
                      <Receipt className="w-4 h-4 text-[#f37021]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-tight">Pending Balance Statement</span>
                      <span className="text-[9.5px] font-medium opacity-80 block font-sans">Shows only unpaid invoices and remaining outstanding balances.</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetCleanName = soaPopupClient.buyerName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
                    const savedCustomersJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
                    let regCustomers: any[] = [];
                    if (savedCustomersJson) {
                      try {
                        regCustomers = JSON.parse(savedCustomersJson);
                      } catch (e) {}
                    }
                    const matchedCust = regCustomers.find((c: any) => {
                      const cName = (c.name || c.companyName || '').trim().toUpperCase();
                      return cName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === targetCleanName;
                    });
                    const custId = matchedCust ? matchedCust.id : ('cust-' + soaPopupClient.buyerName.trim().replace(/\s+/g, '-').toLowerCase());
                    
                    localStorage.setItem('MFI_SOA_FILTER_MODE', 'standard');
                    localStorage.setItem('MFI_SOA_SELECTED_CUSTOMER_ID', custId);
                    localStorage.setItem('mf_erp_active_tab', 'customer_soa');
                    window.dispatchEvent(new Event('storage'));
                    window.dispatchEvent(new Event('mfi_soa_select_customer'));
                    window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'customer_soa' }));
                    setSoaPopupClient(null);
                  }}
                  className="w-full text-left bg-gradient-to-r from-slate-50 to-indigo-50 hover:from-slate-800 hover:to-indigo-900 border-2 border-slate-900 text-slate-900 hover:text-white p-3 rounded-xl transition-all shadow-sm hover:translate-y-[-1px] group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-100 group-hover:bg-slate-700 rounded-lg border border-indigo-300">
                      <FileText className="w-4 h-4 text-indigo-700 group-hover:text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block uppercase tracking-tight">Balance Ledger Statement</span>
                      <span className="text-[9.5px] font-medium opacity-80 block font-sans">Full transactional history ledger (inclusive of paid and outstanding invoices).</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSoaPopupClient(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistical KPI highlight blocks - Exactly 3 Small & Simple Cards */}
        <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 font-sans mb-4">
          
          {/* Card 1: Total Receivables */}
          <div className="bg-white text-slate-900 p-3.5 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">Total Receivables</span>
              <span className="text-lg font-bold text-slate-950 font-mono block mt-0.5">AED {combinedReceivables.reduce((s,c)=>s+c.totalInvoiceValue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-700" />
            </div>
          </div>

          {/* Card 2: Received Payments */}
          <div className="bg-white text-slate-900 p-3.5 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">Received Payments</span>
              <span className="text-lg font-bold text-emerald-700 font-mono block mt-0.5">AED {combinedReceivables.reduce((s,c)=>s+c.amountReceived, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-300">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>

          {/* Card 3: Balance Amounts */}
          <div className="bg-white text-slate-900 p-3.5 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider block">Balance Outstanding</span>
              <span className="text-lg font-bold text-rose-700 font-mono block mt-0.5">AED {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            </div>
          </div>

        </div>

        {/* Core Tabular Registry Column */}
        <div className="xl:col-span-12 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 font-sans">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-sans text-sm font-bold uppercase text-slate-900">CUSTOMER OUTGOING LEDGER DECK</h3>
              <p className="text-[10px] text-[#f37021] font-sans font-semibold mt-1 uppercase tracking-wider leading-relaxed">
                OFFICIAL LOG CORPORATE BUYER INVOICE MATURITIES BILLING BALANCES.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Customer wise Filter Dropdown */}
              <div className="relative w-full sm:w-56 shrink-0">
                <select
                  value={selectedCustomerFilter}
                  onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/85 focus:bg-white border-2 border-slate-300 rounded-lg px-2.5 py-1.5 font-sans text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021] transition-all uppercase cursor-pointer"
                >
                  <option value="all">🔍 ALL CUSTOMERS ({uniqueCustomers.length})</option>
                  {uniqueCustomers.map(cust => (
                    <option key={cust} value={cust}>{cust}</option>
                  ))}
                </select>
              </div>

              {/* Search Filter Input */}
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="SEARCH CUSTOMER, INV, LPO OR DO..."
                  value={receivablesSearchQuery}
                  onChange={(e) => setReceivablesSearchQuery(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 hover:bg-slate-100/85 focus:bg-white border-2 border-slate-300 rounded-lg pl-8 pr-6 py-1.5 font-sans text-[10px] font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#f37021] transition-all uppercase"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {receivablesSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setReceivablesSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-[10px] font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setReceivablesFilterType('all')}
                  className={`px-3 py-1 rounded-md font-sans font-bold text-[9px] uppercase transition-all tracking-wider cursor-pointer ${
                    receivablesFilterType === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({combinedReceivables.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReceivablesFilterType('standard')}
                  className={`px-3 py-1 rounded-md font-sans font-bold text-[9px] uppercase transition-all tracking-wider cursor-pointer ${
                    receivablesFilterType === 'standard'
                      ? 'bg-amber-100 text-[#E02424] border border-amber-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Standard Invoice ({combinedReceivables.filter(p => p.type === 'standard' || !p.type).length})
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[280px] border border-slate-300 rounded shadow-sm font-mono scrollbar-thin bg-slate-50">
            <table className="w-full text-left text-[9px] border-collapse min-w-[940px] border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-[8.5px] font-bold uppercase text-center h-9 font-sans border-b border-slate-400">
                  <th className="p-1.5 w-[85px] border border-slate-300">INVOICE NUMBER</th>
                  <th className="p-1.5 w-[100px] border border-slate-300">DATE</th>
                  <th className="p-1.5 w-[75px] border border-slate-300">DO NUMBER</th>
                  <th className="p-1.5 w-[75px] border border-slate-300">LPO / WO NO</th>
                  <th className="p-1.5 w-[130px] text-left pl-2 border border-slate-300">DEBTOR CUSTOMER</th> 
                  <th className="p-1.5 w-[70px] bg-slate-200 text-slate-800 border border-slate-300">ACTION</th>
                  <th className="p-1.5 w-[70px] bg-slate-200 text-slate-800 font-bold border border-slate-300">VIEW RECEIPT</th>
                  <th className="p-1.5 w-[80px] text-right pr-2 border border-slate-300">TOTAL AMOUNT</th>
                  <th className="p-1.5 w-[80px] text-right pr-2 border border-slate-300">RECEIVED AMOUNT</th>
                  <th className="p-1.5 w-[90px] text-right pr-2 font-sans border border-slate-300">BALANCE AMOUNT</th>
                  <th className="p-1.5 w-[85px] border border-slate-300">RECEIVED BY</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredReceivables.map((p, idx) => {
                  const outstanding = Math.max(0, p.totalInvoiceValue - p.amountReceived);
                  
                  // Check if this is a repeat of the previous row's buyerName
                  const prevRow = idx > 0 ? filteredReceivables[idx - 1] : null;
                  const isRepeatCustomer = prevRow && (prevRow.buyerName || '').trim().toUpperCase() === (p.buyerName || '').trim().toUpperCase();

                  const matchingReceipts = receiptRegisters.filter(rc => {
                    const rcAlloc = (rc.invoiceAllocated || rc.receivedAgainstInvoice || '').trim().toUpperCase();
                    const invNo = (p.invoiceNo || p.id || '').trim().toUpperCase();
                    const cleanClient = (rc.clientName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
                    const rBuyer = (p.buyerName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
                    
                    if (rcAlloc === invNo && rcAlloc !== '' && rcAlloc !== '—') {
                      return true;
                    } else if (cleanClient && rBuyer && cleanClient === rBuyer) {
                      const narr = (rc.narration || '').trim().toUpperCase();
                      return narr.includes(invNo);
                    }
                    return false;
                  });

                  return (
                    <tr 
                      key={`${p.id}-${p.source}`} 
                      className="hover:bg-amber-50/25 odd:bg-white even:bg-slate-50/30 h-10 font-mono transition-colors"
                    >
                      {/* 1. INVOICE NUMBER */}
                      <td className="p-1 border border-slate-200 relative text-center">
                        <div className="flex flex-col items-center justify-center pl-1">
                          <input
                            type="text"
                            value={p.invoiceNo}
                            onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'invoiceNo', e.target.value.toUpperCase())}
                            className="w-full text-center font-bold text-rose-600 bg-transparent border-none outline-none focus:bg-amber-100/70 rounded-none uppercase text-[9px] pb-0.5"
                            placeholder="INV-..."
                          />
                          <span className={`text-[6px] leading-none font-sans font-bold uppercase px-1 py-0.5 border select-none rounded-none ${
                            p.type === 'coating' 
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                              : 'bg-amber-50 text-[#E02424] border-amber-200'
                          }`}>
                            {p.type === 'coating' ? 'Coating' : 'Tax Inv'}
                          </span>
                        </div>
                      </td>

                      {/* 2. DATE */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="date"
                          value={p.dated}
                          onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'dated', e.target.value)}
                          className="w-full text-center bg-transparent border-none outline-none focus:bg-amber-100/70 text-slate-700 font-bold text-[9px] rounded-none"
                        />
                      </td>

                      {/* 3. DO NUMBER */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="text"
                          value={p.doNo}
                          onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'doNo', e.target.value.toUpperCase())}
                          className="w-full text-center font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-amber-100/70 uppercase text-[9px] rounded-none"
                          placeholder="DO-..."
                        />
                      </td>

                      {/* 4. LPO / WO NO */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="text"
                          value={p.lpoNo}
                          onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'lpoNo', e.target.value.toUpperCase())}
                          className="w-full text-center font-bold text-teal-800 bg-transparent border-none outline-none focus:bg-amber-100/70 uppercase text-[9px] rounded-none"
                          placeholder="LPO-..."
                        />
                      </td>

                      {/* 5. DEBTOR CUSTOMER */}
                      <td className="p-1 border border-slate-200">
                        {!isRepeatCustomer ? (
                          <div className="flex flex-col gap-0.5 pl-1">
                            <input
                              type="text"
                              value={p.buyerName}
                              onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'buyerName', e.target.value.toUpperCase())}
                              className="w-full text-left bg-transparent border-none outline-none focus:bg-amber-100/70 font-bold text-slate-900 uppercase text-[9px] rounded-none"
                              placeholder="BUYER / CLIENT"
                            />
                          </div>
                        ) : (
                          <div className="text-center text-slate-350 font-bold italic text-[9.5px] select-none py-1 font-sans">
                            〃 (Same Debtor)
                          </div>
                        )}
                      </td>

                      {/* 6. ACTION */}
                      <td className="p-1 bg-slate-50/65 border border-slate-200 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActivePreviewDoc(p)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-sm border border-indigo-700 shadow-3xs flex items-center justify-center transition-all cursor-pointer"
                            title="Click to View Original TAX INVOICE Layout"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickReceiptInvoice(p)}
                            className="bg-emerald-50 hover:bg-emerald-600 border border-emerald-300 text-emerald-700 hover:text-white p-1 rounded-sm shadow-3xs flex items-center justify-center transition-all cursor-pointer"
                            title="Issue Cash / Cheque Receipt (Order-Wise)"
                          >
                            <Receipt className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReceivableRow(p.id, p.source)}
                            className="text-rose-600 hover:text-white hover:bg-rose-600 p-1 rounded-sm border border-transparent hover:border-rose-400 transition-all cursor-pointer flex items-center justify-center"
                            title="Void and remove this transaction"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* NEW COLUMN: VIEW RECEIPT */}
                      <td className="p-1 bg-slate-50/65 border border-slate-200 text-center">
                        {matchingReceipts.length > 0 ? (
                          <div className="flex flex-wrap gap-1 items-center justify-center">
                            {matchingReceipts.map(rc => (
                              <button
                                key={rc.id}
                                type="button"
                                onClick={() => handlePrintReceiptVoucher(rc)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 p-1 rounded-sm transition-all cursor-pointer shadow-3xs"
                                title={`Print Official Receipt Copy RC-${rc.voucherNo}`}
                              >
                                <FileText className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setQuickReceiptInvoice(p)}
                            className="text-[#94a3b8] hover:text-emerald-750 border border-dashed border-slate-300 hover:border-emerald-300 p-1 rounded-sm bg-slate-50 hover:bg-emerald-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="No receipt found. Click to issue quick cash/cheque receipt"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        )}
                      </td>

                      {/* 7. TOTAL AMOUNT */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="number"
                          value={p.totalInvoiceValue}
                          onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'totalInvoiceValue', parseFloat(e.target.value) || 0)}
                          className="w-full text-right pr-1 font-bold text-slate-800 bg-transparent border-none outline-none focus:bg-amber-100/70 rounded-none font-mono text-[9px]"
                        />
                      </td>

                      {/* 8. RECEIVED AMOUNT */}
                      <td className="p-1 border border-slate-200">
                        <input
                          type="number"
                          value={p.amountReceived}
                          onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'amountReceived', parseFloat(e.target.value) || 0)}
                          className="w-full text-right pr-1 font-bold text-emerald-700 bg-transparent border-none outline-none focus:bg-amber-100/70 rounded-none font-mono text-[9px]"
                        />
                      </td>

                      {/* 10. BALANCE AMOUNT */}
                      <td className="p-1 border border-slate-200 text-right pr-1 font-mono font-bold text-[9px]">
                        <span className={outstanding <= 0 ? "text-emerald-750" : "text-rose-750"}>
                          {outstanding <= 0 ? "PAID" : `${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })} AED`}
                        </span>
                      </td>

                      {/* 11. RECEIVED BY */}
                      <td className="p-1 border border-slate-200">
                        <select
                          value={p.paymentMode || 'BANK WIRE'}
                          onChange={(e) => handleUpdateReceivablesField(p.id, p.source, 'paymentMode', e.target.value)}
                          className="w-full text-center bg-white hover:bg-slate-50 border border-slate-300 outline-none rounded-none py-0.5 text-[8.5px] font-sans font-bold text-slate-850 cursor-pointer transition-colors"
                        >
                          <option value="BANK WIRE">WIRE</option>
                          <option value="CHEQUE">CHEQUE</option>
                          <option value="CASH">CASH</option>
                          <option value="LETTER OF CREDIT">LC</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-bold h-9 border-t-2 border-b-4 border-slate-400 text-right font-sans">
                  <td colSpan={5} className="p-1.5 text-left border border-slate-300 text-[10px]">GRAND TOTAL RECEIVABLES</td>
                  <td className="p-1.5 text-center border border-slate-300 text-[10px]">—</td>
                  <td className="p-1.5 text-center border border-slate-300 text-[10px]">—</td>
                  <td className="p-1.5 border border-slate-300 text-[10px] font-mono">
                    AED {filteredReceivables.reduce((s, c) => s + (c.totalInvoiceValue || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-[10px] font-mono text-emerald-700">
                    AED {filteredReceivables.reduce((s, c) => s + (c.amountReceived || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 border border-slate-300 text-[10px] font-mono text-rose-700">
                    AED {filteredReceivables.reduce((s, c) => s + (Math.max(0, (c.totalInvoiceValue || 0) - (c.amountReceived || 0))), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-1.5 text-center border border-slate-300 text-[10px]">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Quick Receipt Modal (Order-wise Cash / Cheque) */}
        {quickReceiptInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border-4 border-black w-full max-w-lg p-6 shadow-2xl relative font-sans text-left">
              <button
                type="button"
                onClick={() => setQuickReceiptInvoice(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wide">
                  Issue Receipt Voucher (Order-Wise)
                </h3>
              </div>

              <form onSubmit={handlePostQuickReceipt} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Invoice / Order Allocated
                  </label>
                  <input
                    type="text"
                    value={quickReceiptInvoice.invoiceNo}
                    disabled
                    className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Debtor Customer Name
                  </label>
                  <input
                    type="text"
                    value={quickReceiptInvoice.buyerName}
                    disabled
                    className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Voucher No (Auto)
                    </label>
                    <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-2 py-1.5 font-mono font-bold text-center text-[10px]">
                      {getNewVoucherNo('RECEIVABLES', receiptRegisters)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Remaining Balance
                    </label>
                    <div className="w-full bg-rose-50 border border-rose-200 text-rose-800 rounded px-2 py-1.5 font-mono font-semibold text-center text-[10px]">
                      {(quickReceiptInvoice.totalInvoiceValue - quickReceiptInvoice.amountReceived).toLocaleString()} AED
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={qrDate}
                      onChange={(e) => setQrDate(e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021] text-center text-[10px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={qrMode}
                      onChange={(e) => setQrMode(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 cursor-pointer focus:outline-none"
                    >
                      <option value="CASH">CASH</option>
                      <option value="CHEQUE">CHEQUE</option>
                      <option value="BANK TRANSFER">BANK TRANSFER / WIRE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Amount Paid (AED)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={qrAmount}
                      onChange={(e) => setQrAmount(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-emerald-700 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Cheque / Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder={qrMode === 'CHEQUE' ? "CHQ-123456" : "BANK TRANS REF"}
                      value={qrRef}
                      onChange={(e) => setQrRef(e.target.value.toUpperCase())}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Clearing Bank Name
                    </label>
                    <input
                      type="text"
                      value={qrBank}
                      onChange={(e) => setQrBank(e.target.value.toUpperCase())}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Receipt Narration (Ledger memo)
                  </label>
                  <textarea
                    rows={2}
                    value={qrNarration}
                    onChange={(e) => setQrNarration(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickReceiptInvoice(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl font-bold uppercase border border-slate-300 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-bold uppercase shadow-md cursor-pointer transition-colors"
                  >
                    Post Receipt Voucher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- TAB 12: Overtime Managements Component ---
  const OvertimeManagementComponent = () => {
    return (
      <OvertimeManagementComponentHoisted
        operators={operators}
        setOperators={setOperators}
        otLogs={otLogs}
        setOtLogs={setOtLogs}
        currentUser={currentUser}
        triggerToast={triggerToast}
        onBackToHome={() => {
          if (onNavigate) {
            onNavigate('home');
          } else {
            setActiveTab('home');
          }
        }}
      />
    );
  };

  const DummyUnusedOvertimeManagementComponent = () => {
    const DEFAULT_STAFF_PROFILES = operators;

    // Operator creation states
    const [showAddOperator, setShowAddOperator] = useState(false);
    const [newOpName, setNewOpName] = useState('');
    const [newOpRate, setNewOpRate] = useState(30);
    const [newOpRole, setNewOpRole] = useState('');
    const [newOpType, setNewOpType] = useState<'INTERNAL' | 'OUTSIDE'>('INTERNAL');

    // Operator editing states
    const [editingOperator, setEditingOperator] = useState<{ name: string; rate: number; role: string; isOutsideWorker?: boolean } | null>(null);
    const [editOpRate, setEditOpRate] = useState(30);
    const [editOpRole, setEditOpRole] = useState('');
    const [editOpType, setEditOpType] = useState<'INTERNAL' | 'OUTSIDE'>('INTERNAL');

    const handleSaveEditOperator = () => {
      if (!editingOperator) return;
      setOperators(prev => prev.map(o => o.name === editingOperator.name ? {
        ...o,
        rate: editOpRate,
        role: editOpRole,
        isOutsideWorker: editOpType === 'OUTSIDE'
      } : o));

      // Synchronize in the temporary otLogs log references as well (baseRate, isOutsideWorker)
      setOtLogs(prev => prev.map(l => l.workerName.toUpperCase().trim() === editingOperator.name.toUpperCase().trim() ? {
        ...l,
        baseRate: editOpRate,
        isOutsideWorker: editOpType === 'OUTSIDE',
        // Recalculate totalPayout based on same hours and multiplier
        totalPayout: parseFloat((editOpRate * (l.hours || 0) * (l.multiplier || 1)).toFixed(2))
      } : l));

      triggerToast(`Successfully updated profile for ${editingOperator.name}!`);
      setEditingOperator(null);
    };

    const handleAddOperator = () => {
      if (!newOpName.trim()) {
        alert("Please enter operator name!");
        return;
      }
      const upperName = newOpName.toUpperCase().trim();
      if (operators.some(op => op.name.toUpperCase() === upperName)) {
        alert("An operator with this name already exists!");
        return;
      }
      const newOp = {
        name: upperName,
        rate: newOpRate || 25,
        role: newOpRole.trim() || (newOpType === 'OUTSIDE' ? 'Contract Laborer' : 'Workshop Operator'),
        isOutsideWorker: newOpType === 'OUTSIDE'
      };
      setOperators([...operators, newOp]);
      setNewOpName('');
      setNewOpRole('');
      setShowAddOperator(false);
      triggerToast(`Successfully created profile for ${upperName}!`);
    };

    const handleDeleteOperator = (e: React.MouseEvent, nameToDel: string) => {
      e.stopPropagation();
      setDeleteOperatorTargetName(nameToDel);
    };

    const [subTab, setSubTab] = useState<'operators' | 'entries' | 'daily' | 'monthly' | 'statements'>('statements');
    const [mobileDossierOpen, setMobileDossierOpen] = useState(false);

    // Simple & Unique Entry Mode selector
    const [entryMode, setEntryMode] = useState<'person' | 'date' | 'month'>('person');

    // Date-wise Entry States
    const [dateWiseDate, setDateWiseDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [dateWiseHours, setDateWiseHours] = useState<Record<string, string>>({});
    const [dateWiseShifts, setDateWiseShifts] = useState<Record<string, 'DAY Shift' | 'NIGHT Shift'>>({});
    const [dateWiseMultipliers, setDateWiseMultipliers] = useState<Record<string, number>>({});

    // Month-wise Entry States
    const [monthWiseWorker, setMonthWiseWorker] = useState('');
    const [monthWisePeriod, setMonthWisePeriod] = useState('2026-06');
    const [monthWiseDaysHours, setMonthWiseDaysHours] = useState<string[]>(() => Array(31).fill(''));
    const [monthWiseShift, setMonthWiseShift] = useState<'DAY Shift' | 'NIGHT Shift'>('DAY Shift');
    const [monthWiseMultiplier, setMonthWiseMultiplier] = useState(1.25);

    // Registry / Add Entry States
    const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
    const [workerName, setWorkerName] = useState('');
    const [baseRate, setBaseRate] = useState(30);
    const [hours, setHours] = useState(2.0);
    const [shift, setShift] = useState<'DAY Shift' | 'NIGHT Shift'>('DAY Shift');
    const [multiplier, setMultiplier] = useState(1.25);
    const [isOutsideWorkerFormChecked, setIsOutsideWorkerFormChecked] = useState(false);
    const [approvedBy, setApprovedBy] = useState('M. KHAN (STORE DESK)');
    const [registrySearch, setRegistrySearch] = useState('');
    const [workerTypeFilter, setWorkerTypeFilter] = useState<'ALL' | 'INTERNAL' | 'OUTSIDE'>('ALL');

    // Daily View States
    const [dailyDate, setDailyDate] = useState(() => new Date().toISOString().substring(0, 10));
    
    // Monthly View States
    const [monthlyYear, setMonthlyYear] = useState('2026');
    const [monthlyMonth, setMonthlyMonth] = useState('06');

    // Person View States
    const [selectedPerson, setSelectedPerson] = useState('');
    const [personMonthFilter, setPersonMonthFilter] = useState('ALL');

    // Mobile specific filter states
    const [mobileMonth, setMobileMonth] = useState('ALL');
    const [mobileOperator, setMobileOperator] = useState('ALL');

    // Group otLogs by operator name to calculate their total accumulated pay
    const mobileOperatorCalculations = useMemo(() => {
      return operators.map(op => {
        const workerNameUpper = op.name.toUpperCase().trim();
        const opLogs = otLogs.filter(log => log.workerName.toUpperCase().trim() === workerNameUpper);
        const totalPayout = opLogs.reduce((sum, item) => sum + (item.totalPayout || 0), 0);
        const totalHours = opLogs.reduce((sum, item) => sum + (item.hours || 0), 0);
        const shiftCount = opLogs.length;
        return {
          name: op.name,
          role: op.role,
          rate: op.rate,
          isOutsideWorker: !!op.isOutsideWorker,
          totalPayout,
          totalHours,
          shiftCount
        };
      }).sort((a, b) => b.totalPayout - a.totalPayout);
    }, [operators, otLogs]);

    useEffect(() => {
      setPersonMonthFilter('ALL');
    }, [selectedPerson]);

    // Custom modals states for safe deletes
    const [deleteOtTargetId, setDeleteOtTargetId] = useState<string | null>(null);
    const [deleteOperatorTargetName, setDeleteOperatorTargetName] = useState<string | null>(null);
    const [editingOtLog, setEditingOtLog] = useState<any | null>(null);

    // Derived values
    const uniquePersonnel = useMemo(() => {
      const set = new Set(otLogs.map(l => l.workerName.toUpperCase()));
      return Array.from(set).sort();
    }, [otLogs]);

    useEffect(() => {
      if (!selectedPerson && operators.length > 0) {
        setSelectedPerson(operators[0].name);
      }
    }, [operators, selectedPerson]);

    useEffect(() => {
      if (!selectedPerson || !monthWisePeriod) return;
      const [y, mStr] = monthWisePeriod.split('-');
      const year = parseInt(y, 10);
      const month = parseInt(mStr, 10);
      if (!year || !month) return;
      
      const daysNum = new Date(year, month, 0).getDate();
      const loadedHours = Array(31).fill('');
      
      const matches = otLogs.filter(log => {
        return log.workerName.toUpperCase().trim() === selectedPerson.toUpperCase().trim() &&
               log.dated.startsWith(monthWisePeriod);
      });
      
      matches.forEach(log => {
        const dayPart = log.dated.split('-')[2];
        const dayIdx = parseInt(dayPart, 10) - 1;
        if (dayIdx >= 0 && dayIdx < 31) {
          loadedHours[dayIdx] = String(log.hours || '');
        }
      });
      
      setMonthWiseDaysHours(loadedHours);
    }, [selectedPerson, monthWisePeriod, otLogs]);

    useEffect(() => {
      if (operators.length > 0 && !monthWiseWorker) {
        setMonthWiseWorker(operators[0].name);
      }
    }, [operators, monthWiseWorker]);

    const handleQuickSelectStaff = (name: string, rate: number) => {
      setWorkerName(name);
      setBaseRate(rate);
      const prof = DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === name.toUpperCase());
      setIsOutsideWorkerFormChecked(prof ? !!prof.isOutsideWorker : false);
      triggerToast(`Autofilled details for ${name} at base rate AED ${rate}/hr!`);
    };

    const handleIncrementHours = (amount: number) => {
      setHours(prev => Math.max(0.5, parseFloat((prev + amount).toFixed(1))));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!workerName.trim()) {
        alert("Please enter Employee full name!");
        return;
      }
      const pay = parseFloat((baseRate * hours * multiplier).toFixed(2));
      const newOT = {
        id: 'OT-' + Math.floor(Math.random() * 9000 + 1000),
        workerName: workerName.toUpperCase().trim(),
        dated: date,
        baseRate,
        hours,
        shift,
        multiplier,
        totalPayout: pay,
        approvedBy: approvedBy.toUpperCase().trim(),
        isOutsideWorker: isOutsideWorkerFormChecked,
        checked: true
      };

      setOtLogs([newOT, ...otLogs]);
      setWorkerName('');
      setIsOutsideWorkerFormChecked(false);
      triggerToast(`Added Overtime sheet log for ${newOT.workerName} of AED ${pay}!`);
    };

    const handleSaveDateWiseBatch = () => {
      const logsToAdd: any[] = [];
      let addedNames: string[] = [];
      
      operators.forEach(op => {
        const hVal = dateWiseHours[op.name];
        if (hVal && hVal.trim() !== '') {
          const hrs = parseFloat(hVal);
          if (hrs > 0) {
            const mult = dateWiseMultipliers[op.name] !== undefined ? dateWiseMultipliers[op.name] : 1.25;
            const sft = dateWiseShifts[op.name] || 'DAY Shift';
            const pay = parseFloat((op.rate * hrs * mult).toFixed(2));
            logsToAdd.push({
              id: 'OT-' + Math.floor(Math.random() * 9000 + 1000),
              workerName: op.name.toUpperCase(),
              dated: dateWiseDate,
              baseRate: op.rate,
              hours: hrs,
              shift: sft,
              multiplier: mult,
              totalPayout: pay,
              approvedBy: approvedBy.toUpperCase().trim(),
              isOutsideWorker: !!op.isOutsideWorker,
              checked: true
            });
            addedNames.push(op.name);
          }
        }
      });

      if (logsToAdd.length === 0) {
        alert("Please enter hours (> 0) for at least one operator!");
        return;
      }

      setOtLogs(prev => [...logsToAdd, ...prev]);
      setDateWiseHours({});
      triggerToast(`Successfully saved Date-Wise Batch for ${addedNames.length} operator(s) on ${dateWiseDate}!`);
    };

    const handleSaveMonthWiseBatch = () => {
      if (!selectedPerson) {
        alert("Please select an operator first!");
        return;
      }
      const selectedOp = operators.find(o => o.name.toUpperCase() === selectedPerson.toUpperCase());
      if (!selectedOp) {
        alert("Operator not found!");
        return;
      }

      let savedDaysCount = 0;
      let deletedDaysCount = 0;

      const [y, mStr] = monthWisePeriod.split('-');
      const year = parseInt(y, 10) || 2026;
      const month = parseInt(mStr, 10) || 6;
      const daysNum = new Date(year, month, 0).getDate();

      setOtLogs(prevLogs => {
        // Filter out all logs for this operator in this month
        const untargetedLogs = prevLogs.filter(log => {
          const matchesWorker = log.workerName.toUpperCase().trim() === selectedPerson.toUpperCase().trim();
          const matchesMonth = log.dated.startsWith(monthWisePeriod);
          return !(matchesWorker && matchesMonth);
        });

        const newOrUpdatedLogsForMonth: any[] = [];

        monthWiseDaysHours.slice(0, daysNum).forEach((hVal, index) => {
          const dayNum = String(index + 1).padStart(2, '0');
          const fullDate = `${monthWisePeriod}-${dayNum}`;

          if (hVal && hVal.trim() !== '') {
            const hrs = parseFloat(hVal);
            if (hrs > 0) {
              const pay = parseFloat((selectedOp.rate * hrs * monthWiseMultiplier).toFixed(2));
              
              // See if there was an existing log in prevLogs for this day to preserve its ID
              const existingLog = prevLogs.find(log => 
                log.workerName.toUpperCase().trim() === selectedPerson.toUpperCase().trim() && 
                log.dated === fullDate
              );

              newOrUpdatedLogsForMonth.push({
                id: existingLog ? existingLog.id : 'OT-' + Math.floor(Math.random() * 9000 + 1000),
                workerName: selectedOp.name.toUpperCase(),
                dated: fullDate,
                baseRate: selectedOp.rate,
                hours: hrs,
                shift: monthWiseShift,
                multiplier: monthWiseMultiplier,
                totalPayout: pay,
                approvedBy: approvedBy.toUpperCase().trim(),
                isOutsideWorker: !!selectedOp.isOutsideWorker,
                checked: true
              });
              savedDaysCount++;
            } else {
              // <= 0 hours. This counts as deletion if it existed in prevLogs
              const existed = prevLogs.some(log => 
                log.workerName.toUpperCase().trim() === selectedPerson.toUpperCase().trim() && 
                log.dated === fullDate
              );
              if (existed) {
                deletedDaysCount++;
              }
            }
          } else {
            // It's empty. If a log existed, it's deleted because we filtered it out from untargetedLogs
            const existed = prevLogs.some(log => 
              log.workerName.toUpperCase().trim() === selectedPerson.toUpperCase().trim() && 
              log.dated === fullDate
            );
            if (existed) {
              deletedDaysCount++;
            }
          }
        });

        const updated = [...newOrUpdatedLogsForMonth, ...untargetedLogs];
        localStorage.setItem('MFI_OVERTIME_RECORDS', JSON.stringify(updated));
        return updated;
      });

      let statusMsg = `Saved changes for ${selectedOp.name} in month ${monthWisePeriod}.`;
      if (savedDaysCount > 0) statusMsg += ` Saved/Updated ${savedDaysCount} record(s).`;
      if (deletedDaysCount > 0) statusMsg += ` Purged ${deletedDaysCount} empty record(s).`;
      triggerToast(statusMsg);
    };

    const deleteOT = (id: string) => {
      setDeleteOtTargetId(id);
    };

    const handleSaveEditOtLog = (updatedLog: any) => {
      if (!updatedLog || !updatedLog.workerName) {
        alert("Please select employee/operator name.");
        return;
      }
      const hrs = parseFloat(updatedLog.hours) || 0;
      if (hrs <= 0) {
        alert("Hours must be greater than zero.");
        return;
      }

      const op = operators.find(o => o.name.toUpperCase() === updatedLog.workerName.toUpperCase());
      const r = op ? op.rate : updatedLog.baseRate || 30;
      const isOutside = op ? !!op.isOutsideWorker : !!updatedLog.isOutsideWorker;
      const mult = parseFloat(updatedLog.multiplier) || 1.25;
      const pay = parseFloat((r * hrs * mult).toFixed(2));

      setOtLogs(prevLogs => {
        const updated = prevLogs.map(log => {
          if (log.id === updatedLog.id) {
            return {
              ...log,
              workerName: updatedLog.workerName.toUpperCase().trim(),
              dated: updatedLog.dated,
              baseRate: r,
              hours: hrs,
              shift: updatedLog.shift,
              multiplier: mult,
              totalPayout: pay,
              approvedBy: (updatedLog.approvedBy || 'FOREMAN').toUpperCase().trim(),
              isOutsideWorker: isOutside
            };
          }
          return log;
        });
        localStorage.setItem('MFI_OVERTIME_RECORDS', JSON.stringify(updated));
        return updated;
      });

      setEditingOtLog(null);
      triggerToast(`Successfully saved changes for overtime record ${updatedLog.id}!`);
    };

    // --- Tab-Specific Calculations --
    
    // Registry Search filter
    const filteredRegistry = useMemo(() => {
      return otLogs.filter(log => {
        const matchesSearch = log.workerName.toUpperCase().includes(registrySearch.toUpperCase()) || 
                              log.id.toUpperCase().includes(registrySearch.toUpperCase());
        if (!matchesSearch) return false;

        const isOutside = log.isOutsideWorker ?? !!DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === log.workerName.toUpperCase())?.isOutsideWorker;
        if (workerTypeFilter === 'INTERNAL' && isOutside) return false;
        if (workerTypeFilter === 'OUTSIDE' && !isOutside) return false;
        return true;
      });
    }, [otLogs, registrySearch, workerTypeFilter, DEFAULT_STAFF_PROFILES]);

    const totalPayoutSum = useMemo(() => {
      return filteredRegistry.reduce((s, c) => s + c.totalPayout, 0);
    }, [filteredRegistry]);

    // Mobile filtered logs based on mobile selection states matching drawing
    const mobileFilteredLogs = useMemo(() => {
      return otLogs.filter(log => {
        const matchesSearch = log.workerName.toUpperCase().includes(registrySearch.toUpperCase()) || 
                              log.id.toUpperCase().includes(registrySearch.toUpperCase());
        if (!matchesSearch) return false;

        if (mobileMonth !== 'ALL') {
          if (!log.dated.startsWith(mobileMonth)) return false;
        }

        if (mobileOperator !== 'ALL') {
          if (log.workerName.toUpperCase() !== mobileOperator.toUpperCase()) return false;
        }

        return true;
      });
    }, [otLogs, registrySearch, mobileMonth, mobileOperator]);

    // Daily report data
    const dailyLogs = useMemo(() => {
      return otLogs.filter(log => log.dated === dailyDate);
    }, [otLogs, dailyDate]);

    const dailySummary = useMemo(() => {
      const hoursLogged = dailyLogs.reduce((sum, item) => sum + item.hours, 0);
      const totalCost = dailyLogs.reduce((sum, item) => sum + item.totalPayout, 0);
      const uniqueWorkers = new Set(dailyLogs.map(item => item.workerName)).size;
      return { hoursLogged, totalCost, uniqueWorkers };
    }, [dailyLogs]);

    // Navigate Daily Date
    const handleShiftDay = (days: number) => {
      const d = new Date(dailyDate);
      d.setDate(d.getDate() + days);
      setDailyDate(d.toISOString().substring(0, 10));
    };

    // Monthly report aggregation
    const monthlySearchStr = `${monthlyYear}-${monthlyMonth}`;
    const monthlyLogs = useMemo(() => {
      return otLogs.filter(log => log.dated.startsWith(monthlySearchStr));
    }, [otLogs, monthlySearchStr]);

    const monthlyWorkersData = useMemo(() => {
      const res: Record<string, {
        workerName: string;
        shiftCount: number;
        dayShiftHrs: number;
        nightShiftHrs: number;
        totalHrs: number;
        payout: number;
        avgRate: number;
      }> = {};

      monthlyLogs.forEach(log => {
        const key = log.workerName.toUpperCase();
        if (!res[key]) {
          res[key] = {
            workerName: key,
            shiftCount: 0,
            dayShiftHrs: 0,
            nightShiftHrs: 0,
            totalHrs: 0,
            payout: 0,
            avgRate: log.baseRate
          };
        }
        res[key].shiftCount += 1;
        if (log.shift === 'DAY Shift') {
          res[key].dayShiftHrs += log.hours;
        } else {
          res[key].nightShiftHrs += log.hours;
        }
        res[key].totalHrs += log.hours;
        res[key].payout += log.totalPayout;
        res[key].avgRate = log.baseRate; // Track latest rate standard
      });

      return Object.values(res).sort((a, b) => b.payout - a.payout);
    }, [monthlyLogs]);

    const monthlyTotals = useMemo(() => {
      const totalHours = monthlyLogs.reduce((sum, item) => sum + item.hours, 0);
      const totalPay = monthlyLogs.reduce((sum, item) => sum + item.totalPayout, 0);
      const headcount = monthlyWorkersData.length;
      return { totalHours, totalPay, headcount };
    }, [monthlyLogs, monthlyWorkersData]);

    // Person-wise calculation
    const personAllLogs = useMemo(() => {
      if (!selectedPerson) return [];
      return otLogs.filter(log => log.workerName.toUpperCase() === selectedPerson.toUpperCase())
        .sort((a, b) => b.dated.localeCompare(a.dated));
    }, [otLogs, selectedPerson]);

    const personMonths = useMemo(() => {
      const months = personAllLogs.map(log => log.dated.substring(0, 7)); // 'YYYY-MM'
      return Array.from(new Set(months)).sort().reverse();
    }, [personAllLogs]);

    const personLogs = useMemo(() => {
      if (personMonthFilter === 'ALL') return personAllLogs;
      return personAllLogs.filter(log => log.dated.startsWith(personMonthFilter));
    }, [personAllLogs, personMonthFilter]);

    const personSummary = useMemo(() => {
      if (personLogs.length === 0) return { totalHours: 0, totalEarned: 0, distinctDays: 0, avgRate: 30 };
      const totalHours = personLogs.reduce((s, c) => s + c.hours, 0);
      const totalEarned = personLogs.reduce((s, c) => s + c.totalPayout, 0);
      const distinctDays = new Set(personLogs.map(l => l.dated)).size;
      const averageRate = personLogs.reduce((s, c) => s + c.baseRate, 0) / personLogs.length;
      return { totalHours, totalEarned, distinctDays, avgRate: averageRate };
    }, [personLogs]);


    // --- Printing Functions ---

    const handlePrintDailyReport = () => {
      if (dailyLogs.length === 0) {
        alert("No overtime records found on this day to generate report!");
        return;
      }

      const formattedDate = new Date(dailyDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Daily Overtime Operations Report - ${dailyDate}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; margin: 30px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
            .org { font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 2px; }
            .title { font-size: 18px; font-weight: 900; color: #f37021; text-transform: uppercase; letter-spacing: 0.5px; }
            .meta { font-size: 11px; color: #475569; font-weight: bold; margin-top: 5px; }
            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .card { border: 1.5px solid #000000; border-radius: 4px; padding: 10px; background-color: #f8fafc; text-align: center; }
            .card-lbl { font-size: 8px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            .card-val { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            .table-title { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000; border-left: 3px solid #f37021; padding-left: 6px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 25px; }
            th { border: 1px solid #000; padding: 7px; background-color: #f1f5f9; font-size: 9.5px; text-transform: uppercase; font-weight: bold; text-align: center; }
            td { border: 1px solid #000; padding: 7px; font-size: 10px; text-align: center; }
            .left { text-align: left; }
            .right { text-align: right; }
            .payout-col { font-weight: bold; color: #c2410c; background-color: #fffbfa; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
            .sig-box { border: 1.5px dashed #64748b; padding: 15px; border-radius: 4px; text-align: left; }
            .sig-lbl { font-weight: bold; font-size: 9px; margin-bottom: 25px; text-transform: uppercase; color: #475569; }
            .sig-line { border-bottom: 1px solid #000; margin-top: 30px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 30px; font-size: 8px; color: #64748b; text-align: justify; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="org">MARINE FASTENERS INDUSTRIES L.L.C.</div>
            <div class="title">Daily Crew Overtime Operations Summary</div>
            <div class="meta">${formattedDate} &nbsp;|&nbsp; STATUS: FOREMAN CERTIFIED</div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-lbl">ACTIVE OVERTIME WORKERS</div>
              <div class="card-val">${dailySummary.uniqueWorkers} Operators</div>
            </div>
            <div class="card" style="border-color: #f37021;">
              <div class="card-lbl" style="color: #f37021;">TOTAL SHIFT OT HOURS</div>
              <div class="card-val">${dailySummary.hoursLogged} Hours</div>
            </div>
            <div class="card">
              <div class="card-lbl">DAILY DISBURSEMENT PAYOUT</div>
              <div class="card-val" style="color: #c2410c;">AED ${dailySummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div class="table-title">OPERATOR ATTENDANCE TIMESHEET REGISTER</div>
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">REF KEY</th>
                <th class="left" style="width: 25%;">WORKER FULL NAME</th>
                <th style="width: 15%;">SHIFT CODE</th>
                <th class="right" style="width: 15%;">BASE HOURLY RATE</th>
                <th style="width: 12%;">OT HOURS</th>
                <th style="width: 10%;">FACTOR</th>
                <th class="right" style="width: 18%;">TOTAL PAYOUT</th>
              </tr>
            </thead>
            <tbody>
              ${dailyLogs.map(row => `
                <tr>
                  <td><strong>${row.id}</strong></td>
                  <td class="left">
                    <strong>${row.workerName}</strong>
                    ${(row.isOutsideWorker || DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === row.workerName.toUpperCase())?.isOutsideWorker) ? '<div style="font-size: 7px; color: #7c3aed; font-weight: bold; text-transform: uppercase; margin-top: 2px;">Outside Contractor</div>' : ''}
                  </td>
                  <td><span style="font-weight: bold; font-size: 9px; padding: 1px 4px; border-radius: 2px; border: 1px solid #cbd5e1; background: #f8fafc;">${row.shift.toUpperCase()}</span></td>
                  <td class="right">AED ${(row.baseRate || 30).toFixed(2)}/hr</td>
                  <td><strong>${row.hours} Hrs</strong></td>
                  <td><strong>${row.multiplier}x</strong></td>
                  <td class="right payout-col">AED ${(row.totalPayout || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #f8fafc; font-weight: bold;">
                <td colspan="4" class="right">DAILY AGGREGATED SUMMATIONS:</td>
                <td><strong>${dailySummary.hoursLogged} Hrs</strong></td>
                <td>—</td>
                <td class="right" style="color: #c2410c; font-size: 11px;">AED ${dailySummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-lbl">1. WORKSHOP FOREMAN VERIFICATION</div>
              <div>Certified by electronic attendance log card check:</div>
              <div class="sig-line"></div>
              <div style="font-size: 8px; color: #64748b; margin-top: 4px;">SIGNATURE & SHIFT STAMP: ______________________</div>
            </div>
            <div class="sig-box">
              <div class="sig-lbl">2. ACCOUNTS SUPERVISOR RELEASE</div>
              <div>Authorized for daily worker payroll ledger processing:</div>
              <div class="sig-line"></div>
              <div style="font-size: 8px; color: #64748b; margin-top: 4px;">DATE RECONCILED: _________________</div>
            </div>
          </div>

          <div class="footer">
            Marine Fasteners Industries LLC - Production Forge Hub - Overtime Control Center. File code: MFI-HR-OT-${dailyDate}.
          </div>
        </body>
        </html>
      `;

      printHtml(htmlContent, `MFI_Daily_Overtime_Report_${dailyDate}`);
    };

    const handlePrintMonthlyReport = () => {
      if (monthlyWorkersData.length === 0) {
        alert("No overtime aggregated records found for this month!");
        return;
      }

      const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
      ];
      const monthLabel = monthNames[parseInt(monthlyMonth) - 1] + " " + monthlyYear;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Monthly Overtime Payroll Statement - ${monthlyMonth}/${monthlyYear}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; margin: 30px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 12px; }
            .org { font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 2px; }
            .title { font-size: 17px; font-weight: 900; color: #0284c7; text-transform: uppercase; }
            .meta { font-size: 10px; color: #475569; font-weight: bold; margin-top: 5px; }
            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .card { border: 1.5px solid #000000; border-radius: 4px; padding: 10px; background-color: #f8fafc; text-align: center; }
            .card-lbl { font-size: 8px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            .card-val { font-size: 15px; font-weight: 800; color: #000; margin-top: 4px; }
            .table-title { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #000; border-left: 3px solid #0284c7; padding-left: 6px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 25px; }
            th { border: 1px solid #000; padding: 7px; background-color: #f1f5f9; font-size: 9.5px; text-transform: uppercase; font-weight: bold; text-align: center; }
            td { border: 1px solid #000; padding: 7px; font-size: 10px; text-align: center; }
            .left { text-align: left; }
            .right { text-align: right; }
            .payout-col { font-weight: bold; color: #0284c7; background-color: #f0f9ff; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
            .sig-box { border: 1.5px solid #000; padding: 15px; border-radius: 4px; text-align: left; }
            .sig-lbl { font-weight: bold; font-size: 9px; margin-bottom: 25px; text-transform: uppercase; color: #475569; }
            .sig-line { border-bottom: 1px solid #000; margin-top: 30px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 30px; font-size: 8px; color: #64748b; text-transform: uppercase; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="org">MARINE FASTENERS INDUSTRIES L.L.C.</div>
            <div class="title">AGGREGATED MONTHLY OVERTIME RECONCILIATION</div>
            <div class="meta">STATEMENT FOR PERIOD: ${monthLabel} &nbsp;|&nbsp; GENERATED: JUNE 2026</div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-lbl">OVERTIME STAFF HEADCOUNT</div>
              <div class="card-val">${monthlyTotals.headcount} Registered Operators</div>
            </div>
            <div class="card" style="border-color: #0284c7;">
              <div class="card-lbl" style="color: #0284c7;">TOTAL OVERTIME HOURS BILLED</div>
              <div class="card-val">${monthlyTotals.totalHours} Hrs Worked</div>
            </div>
            <div class="card">
              <div class="card-lbl">MONTHLY RECONCILED DISBURSEMENT</div>
              <div class="card-val" style="color: #0284c7;">AED ${monthlyTotals.totalPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div class="table-title">OPERATORS PAYROLL ACCUMULATION JOURNAL</div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">S.N</th>
                <th class="left" style="width: 25%;">EMPLOYEE OPERATOR FULL NAME</th>
                <th style="width: 15%;">ACTIVE SHIFTS</th>
                <th style="width: 15%;">DAY SHIFT HOURS</th>
                <th style="width: 15%;">NIGHT SHIFT HOURS</th>
                <th style="width: 12%;">TOTAL OT HOURS</th>
                <th class="right" style="width: 18%;">ACCUMULATED PAY (AED)</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyWorkersData.map((row, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="left">
                    <strong>${row.workerName}</strong>
                    ${(DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === row.workerName.toUpperCase())?.isOutsideWorker) ? '<div style="font-size: 7px; color: #7c3aed; font-weight: bold; text-transform: uppercase; margin-top: 2px;">Outside Contractor</div>' : ''}
                  </td>
                  <td><strong>${row.shiftCount} Days</strong></td>
                  <td>${row.dayShiftHrs.toFixed(1)} Hrs</td>
                  <td>${row.nightShiftHrs.toFixed(1)} Hrs</td>
                  <td style="font-weight: bold; background-color: #f8fafc;">${row.totalHrs.toFixed(1)} Hrs</td>
                  <td class="right payout-col">AED ${(row.payout || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td colspan="5" class="right">TOTALS MONTHLY CUMULATIVE:</td>
                <td>${monthlyTotals.totalHours.toFixed(1)} Hrs</td>
                <td class="right" style="color: #0284c7;">AED ${monthlyTotals.totalPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-lbl">HUMAN RESOURCES & ATTENDANCE CLEARANCE</div>
              <div>We certify that this monthly summary precisely reconciles with actual verified timesheet clockings and active plant rosters.</div>
              <div class="sig-line"></div>
              <div style="font-size: 8px; color: #64748b; margin-top: 4px;">RECONCILED BY HR OFFICER &nbsp;&nbsp;|&nbsp;&nbsp; DATE: _________________</div>
            </div>
            <div class="sig-box">
              <div class="sig-lbl">CHIEF CFO FINANCIAL STAMP & APPROVAL</div>
              <div>Approved for standard bank wire / cash ledger payout distribution:</div>
              <div class="sig-line"></div>
              <div style="font-size: 8px; color: #64748b; margin-top: 4px;">AUTHORIZED DEPUTY CONTROLLER &nbsp;&nbsp;|&nbsp;&nbsp; SIGNATURE: _________________</div>
            </div>
          </div>

          <div class="footer">
            Marine Fasteners Industries LLC - Corporate Finance Dept. Reference Code: MFI-FIN-OT-${monthlyYear}-${monthlyMonth}.
          </div>
        </body>
        </html>
      `;

      printHtml(htmlContent, `MFI_Monthly_Overtime_Statement_${monthlyYear}_${monthlyMonth}`);
    };

    const handlePrintPersonReport = () => {
      if (!selectedPerson) return;
      if (personLogs.length === 0) {
        alert("This operator has no logged overtime hours in the register!");
        return;
      }

      const prof = DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === selectedPerson.toUpperCase()) || {
        name: selectedPerson.toUpperCase(),
        rate: personSummary.avgRate,
        role: 'Mechanical Workshop Operator'
      };

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Personal Overtime Statement - ${selectedPerson}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; margin: 35px; font-size: 11px; }
            .header { text-align: justify; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 12px; }
            .org { font-size: 13px; font-weight: 900; color: #000; margin-bottom: 2px; }
            .title { font-size: 16px; font-weight: 900; color: #ea580c; text-transform: uppercase; }
            .meta { font-size: 9.5px; color: #475569; font-weight: bold; margin-top: 5px; }
            .profile-card { border: 2px solid #000; border-radius: 4px; padding: 14px; margin-bottom: 25px; background-color: #fffaf7; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
            .prof-lbl { font-size: 8.5px; color: #475569; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
            .prof-val { font-size: 11.5px; font-weight: 800; color: #1e293b; text-transform: uppercase; }
            .stat-sub { font-size: 8px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
            .stat-box { border-left: 3.5px solid #ea580c; padding-left: 8px; }
            .stat-num { font-size: 18px; font-weight: 900; color: #ea580c; }
            .table-title { font-size: 10.5px; font-weight: 900; text-transform: uppercase; color: #000; border-left: 3px solid #ea580c; padding-left: 6px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: 25px; }
            th { border: 1px solid #000; padding: 6px; background-color: #f1f5f9; font-size: 9px; text-transform: uppercase; font-weight: bold; text-align: center; }
            td { border: 1px solid #000; padding: 6px; font-size: 9.5px; text-align: center; }
            .left { text-align: left; }
            .right { text-align: right; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; }
            .sig-box { border: 1.5px solid #000; padding: 12px; border-radius: 4px; }
            .sig-lbl { font-weight: bold; font-size: 8.5px; margin-bottom: 20px; text-transform: uppercase; color: #475569; }
            .sig-line { border-bottom: 1px dashed #000; margin-top: 25px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 30px; font-size: 8px; color: #64748b; text-align: center; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="org">MARINE FASTENERS INDUSTRIES L.L.C.</div>
            <div class="title">Individual Overtime Earnings & Hour Details</div>
            <div class="meta">OPERATOR DIRECTORY DOSSIER &nbsp;|&nbsp; STATUS: SYSTEM CONSOLIDATED</div>
          </div>

          <div class="profile-card">
            <div>
              <div style="margin-bottom: 10px;">
                <div class="prof-lbl">EMPLOYEE OPERATOR NAME</div>
                <div class="prof-val" style="font-size: 14px; color: #000; font-weight: 900;">${prof.name}</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <div class="prof-lbl">DESIGNATED WORKSHOP ROLE</div>
                  <div class="prof-val" style="font-size: 10.5px;">
                    ${prof.role}
                    ${prof.isOutsideWorker ? ' <span style="font-size: 7.5px; background: #faf5ff; border: 1px solid #d8b4fe; padding: 1px 3px; border-radius: 2px; color: #7c3aed; font-weight: bold; margin-left: 4px;">OUTSIDE CONTRACTOR</span>' : ''}
                  </div>
                </div>
                <div>
                  <div class="prof-lbl">STANDARD HOURLY BASE RATE</div>
                  <div class="prof-val" style="font-size: 10.5px; color: #0284c7;">AED ${prof.rate.toFixed(2)}/hour</div>
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; justify-content: space-between;">
              <div class="stat-box">
                <div class="stat-sub">CUMULATIVE EARNED OVERTIME</div>
                <div class="stat-num">AED ${personSummary.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div style="margin-top: 10px; border-left: 3.5px solid #0284c7; padding-left: 8px;">
                <div class="stat-sub">TOTAL SUMMATED OT HOURS</div>
                <div class="stat-val" style="font-size: 13px; font-weight: 800; color: #0284c7;">${personSummary.totalHours} Hrs (${personSummary.distinctDays} Active Days)</div>
              </div>
            </div>
          </div>

          <div class="table-title">CHRONOLOGICAL DAILY OT OPERATIONS WORK-LOG</div>
          <table>
            <thead>
              <tr>
                <th style="width: 12%;">OT SHEET REF</th>
                <th style="width: 20%;">WORKDATE REGISTERED</th>
                <th style="width: 20%;">SHIFT TYPE</th>
                <th class="right" style="width: 15%;">BASE HOURLY RATE</th>
                <th style="width: 10%;">HOURS LOGGED</th>
                <th style="width: 8%;">MULTIPLIER</th>
                <th class="right" style="width: 15%;">EARNED PAYOUT</th>
              </tr>
            </thead>
            <tbody>
              ${personLogs.map(row => `
                <tr>
                  <td><strong>${row.id}</strong></td>
                  <td><strong>${row.dated}</strong></td>
                  <td>${row.shift.toUpperCase()}</td>
                  <td class="right">AED ${(row.baseRate || 30).toFixed(2)}/hr</td>
                  <td><strong>${row.hours} Hrs</strong></td>
                  <td><strong>${row.multiplier}x</strong></td>
                  <td class="right" style="font-weight: bold; background-color: #fffdfa;">AED ${(row.totalPayout || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #f8fafc; font-weight: bold; font-size: 10.5px;">
                <td colspan="4" class="right">GRAND TOTALS:</td>
                <td><strong>${personSummary.totalHours.toFixed(1)} Hrs</strong></td>
                <td>—</td>
                <td class="right" style="color: #ea580c;">AED ${personSummary.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-lbl">OPERATOR SELF-ACKNOWLEDGEMENT</div>
              <div>Certified that the above hours match my shift recordings:</div>
              <div class="sig-line"></div>
              <div style="font-size: 8px; color: #64748b; margin-top: 4px;">OPERATOR SIGN: ______________________ &nbsp;&nbsp; DATE: ___________</div>
            </div>
            <div class="sig-box">
              <div class="sig-lbl">HR SUPERVISOR ATTESTATION & RELEASE</div>
              <div>Approved for financial ledger clearing and paycheck attachment:</div>
              <div class="sig-line"></div>
              <div style="font-size: 8px; color: #64748b; margin-top: 4px;">ACCOUNTS AUTH: ______________________ &nbsp;&nbsp; CO. STAMP</div>
            </div>
          </div>

          <div class="footer">
            Marine Fasteners Industries LLC - Al Ramalah Ajman Forge Hub. Timesheet ID Code: MFI-EMP-OT-${prof.name.replace(/\s+/g, '_')}.
          </div>
        </body>
        </html>
      `;

      printHtml(htmlContent, `MFI_OT_Timesheet_${prof.name.replace(/\s+/g, '_')}`);
    };

    return (
      <div className="space-y-6">
        
        {/* BRANDING HEADER / ACTION BAR */}
        <div className="bg-white border text-left border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs font-sans">
          <div className="flex items-center gap-3">
            <div className="bg-[#f37021]/15 p-3 rounded-xl text-[#f37021] border border-[#f37021]/20">
              <Clock className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-widest">
                MFI CONTROL STATION
              </span>
              <h2 className="font-sans text-base font-bold uppercase text-slate-900 tracking-tight leading-none mt-1">
                OVERTIME & WORKLOGS CENTER
              </h2>
              <p className="text-[10px] text-slate-500 mt-1 font-sans">
                Simple layout for person-wise daily entry and statement auditing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddOperator(!showAddOperator)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                showAddOperator 
                  ? 'bg-rose-50 text-rose-650 border border-rose-200' 
                  : 'bg-[#f37021]/10 text-[#f37021] hover:bg-[#f37021]/20 border border-[#f37021]/20'
              }`}
            >
              {showAddOperator ? '✕ CLOSE CREW DATABASE' : '👥 MANAGE CREW RATES'}
            </button>
          </div>
        </div>

        {/* OVERALL DYNAMIC ANALYTICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs flex items-center justify-between">
            <div>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">TOTAL ACTIVE ROSTER</span>
              <span className="block text-sm font-bold text-slate-900 font-mono mt-0.5">
                {operators.length} Crews
              </span>
              <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                {operators.filter(o => o.isOutsideWorker).length} Contractors | {operators.filter(o => !o.isOutsideWorker).length} Internal
              </span>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100 shrink-0">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs flex items-center justify-between">
            <div>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">AGGREGATE OT HOURS</span>
              <span className="block text-sm font-bold text-slate-900 font-mono mt-0.5">
                {otLogs.reduce((sum, item) => sum + (item.hours || 0), 0).toFixed(1)} Hrs
              </span>
              <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                Total Overtime Billed
              </span>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-xl border border-amber-100 shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs flex items-center justify-between">
            <div>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">TOTAL SHIFT SLIPS</span>
              <span className="block text-sm font-bold text-indigo-700 font-mono mt-0.5">
                {otLogs.length} Records
              </span>
              <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                Registered logs count
              </span>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100 shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-white border border-[#f37021]/30 p-4 rounded-xl shadow-3xs flex items-center justify-between border-l-4 border-l-[#f37021]">
            <div>
              <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">ACCUMULATED PAYROLL</span>
              <span className="block text-sm font-bold text-[#f37021] font-mono mt-0.5">
                AED {Math.round(otLogs.reduce((sum, item) => sum + (item.totalPayout || 0), 0)).toLocaleString()}
              </span>
              <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                Est. releases budget
              </span>
            </div>
            <div className="bg-orange-50 text-brand-orange p-2 rounded-xl border border-orange-100 shrink-0">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* SUBTAB SELECTION BAR */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 font-sans text-[10px] font-bold tracking-wider border border-slate-205">
          <button
            type="button"
            onClick={() => setSubTab('statements')}
            className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              subTab === 'statements' ? 'bg-[#f37021] text-white shadow-xs' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Individual Ledger
          </button>
          <button
            type="button"
            onClick={() => setSubTab('daily')}
            className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              subTab === 'daily' ? 'bg-[#f37021] text-white shadow-xs' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Daily Operations
          </button>
          <button
            type="button"
            onClick={() => setSubTab('monthly')}
            className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              subTab === 'monthly' ? 'bg-[#f37021] text-white shadow-xs' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Monthly Reconciliation
          </button>
          <button
            type="button"
            onClick={() => setSubTab('entries')}
            className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              subTab === 'entries' ? 'bg-[#f37021] text-white shadow-xs' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Service Registry
          </button>
          <button
            type="button"
            onClick={() => setSubTab('operators')}
            className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
              subTab === 'operators' ? 'bg-[#f37021] text-white shadow-xs' : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Crew Wage Rates
          </button>
        </div>

        {/* COLLAPSIBLE MANAGE CREW SECTORS */}
        {showAddOperator && (
          <div className="bg-slate-50 border border-slate-205/80 p-5 text-left rounded-2xl space-y-4 shadow-2xs font-sans">
            <div className="flex justify-between items-center border-b pb-2 border-slate-200">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-900">FACTORY DIRECTORY & BASE WAGE CARD</h3>
                <p className="text-[9.5px] text-slate-500">Add active personnel operators or adjust internal standard base hourly rates.</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setNewOpName('');
                  setNewOpRole('');
                  setShowAddOperator(false);
                }}
                className="text-[9px] font-bold uppercase text-slate-400 hover:text-[#f37021] cursor-pointer"
              >
                Hide
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* ADD NEW OPERATOR FORM */}
              <div className="md:col-span-4 bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-3xs">
                <h4 className="text-[10px] font-bold uppercase text-[#f37021]">Add Operator</h4>
                
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 uppercase font-bold">Operator Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FARID KHALID"
                      value={newOpName}
                      onChange={(e) => setNewOpName(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50/50 p-2 text-[10.5px] font-bold uppercase border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 uppercase font-bold">Base Wage (AED/hr)</label>
                      <input
                        type="number"
                        required
                        placeholder="30"
                        value={newOpRate || ''}
                        onChange={(e) => setNewOpRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50/50 p-2 text-[10.5px] font-mono font-bold border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 uppercase font-bold">Classification</label>
                      <select
                        value={newOpType}
                        onChange={(e: any) => setNewOpType(e.target.value)}
                        className="w-full bg-slate-50/50 p-2 text-[10.5px] font-bold border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                      >
                        <option value="INTERNAL">Internal Staff</option>
                        <option value="OUTSIDE">Outside Contractor</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 uppercase font-bold">Role / Designation Title</label>
                    <input
                      type="text"
                      placeholder="e.g. THREAD-ROLLING TECH"
                      value={newOpRole}
                      onChange={(e) => setNewOpRole(e.target.value)}
                      className="w-full bg-slate-50/50 p-2 text-[10.5px] font-bold uppercase border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddOperator}
                    className="w-full bg-slate-900 hover:bg-black text-white py-2 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Create Profile
                  </button>
                </div>
              </div>

              {/* ACTIVE PERSONNEL LIST WITH QUICK RATE ADJUSTMENT */}
              <div className="md:col-span-8 bg-white border border-slate-200 p-4 rounded-xl shadow-3xs overflow-hidden flex flex-col">
                <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3 block">Roster Directory Rate Audit</h4>
                
                <div className="overflow-x-auto border border-slate-105 rounded-xl max-h-[220px]">
                  <table className="w-full text-left font-sans text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase text-[8px] font-bold border-b border-slate-100">
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5 text-center">Type</th>
                        <th className="p-2.5 text-right">Base Wage Rate</th>
                        <th className="p-2.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-700">
                      {operators.map(op => (
                        <tr key={op.name} className="hover:bg-slate-50/50 align-middle">
                          <td className="p-2.5 font-bold text-slate-900">{op.name}</td>
                          <td className="p-2.5 uppercase text-slate-500 font-semibold text-[8.5px] truncate max-w-[150px]">
                            {op.role || 'WORKSHOP OPERATOR'}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[7.5px] font-bold uppercase ${
                              op.isOutsideWorker ? 'bg-purple-100/70 text-purple-700' : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {op.isOutsideWorker ? 'Contractor' : 'Staff'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                            AED {op.rate.toFixed(2)}/h
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOperator(op);
                                  setEditOpRate(op.rate);
                                  setEditOpRole(op.role || '');
                                  setEditOpType(op.isOutsideWorker ? 'OUTSIDE' : 'INTERNAL');
                                }}
                                className="text-sky-600 hover:text-sky-800 font-semibold text-[9px] uppercase cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteOperator(e, op.name)}
                                className="text-rose-600 hover:text-rose-800 font-semibold text-[9.5px] uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* EDIT OPERATOR SUBFORM MODAL/OVERLAY */}
            {editingOperator && (
              <div className="bg-orange-50/45 p-4 border border-orange-100/80 rounded-xl space-y-3 max-w-md animate-fade-in mt-3 border-l-4 border-l-[#f37021]">
                <div className="flex justify-between items-center border-b pb-1.5 border-orange-100">
                  <h4 className="text-[10px] font-bold uppercase text-slate-900">Adjust Profile: {editingOperator.name}</h4>
                  <button 
                    type="button" 
                    onClick={() => setEditingOperator(null)} 
                    className="text-[9px] text-slate-400 hover:text-red-500 font-semibold"
                  >
                    ✕ CANCEL
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 uppercase font-bold">Base Hourly wage (AED)</label>
                    <input
                      type="number"
                      value={editOpRate}
                      onChange={(e) => setEditOpRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white p-2 text-[11px] font-mono font-bold border border-slate-200 rounded-lg outline-none focus:border-[#f37021]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 uppercase font-bold">Type classification</label>
                    <select
                      value={editOpType}
                      onChange={(e: any) => setEditOpType(e.target.value)}
                      className="w-full bg-white p-2 text-[11px] font-bold border border-slate-200 rounded-lg outline-none focus:border-[#f37021]"
                    >
                      <option value="INTERNAL">Internal Staff</option>
                      <option value="OUTSIDE">Outside Contractor</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-400 uppercase font-bold">Role / Designation</label>
                  <input
                    type="text"
                    value={editOpRole}
                    onChange={(e) => setEditOpRole(e.target.value)}
                    className="w-full bg-white p-2 text-[11px] font-semibold uppercase border border-slate-200 rounded-lg outline-none focus:border-[#f37021]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveEditOperator}
                  className="bg-black hover:bg-zinc-900 text-white py-1.5 px-4 rounded-lg text-[9.5px] font-bold uppercase transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}

        {/* MAIN LAYOUT SPLITTER */}
        {subTab === 'statements' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: ROSTER LIST DIRECTORY (Shown on desktop always, on mobile only when mobileDossierOpen is false) */}
          <div className={`xl:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4 flex flex-col h-[750px] overflow-hidden ${
            mobileDossierOpen ? 'hidden xl:flex' : 'flex'
          }`}>
            <div className="border-b pb-2 border-slate-100 shrink-0 text-left">
              <span className="text-[7.5px] bg-[#f37021]/15 text-[#f37021] font-bold border border-[#f37021]/35 rounded px-1.5 py-0.5 inline-block uppercase tracking-wider mb-1">
                PERSONNEL ROSTER
              </span>
              <h3 className="font-sans text-xs font-bold uppercase text-slate-900">
                SELECT TECH CREW
              </h3>
              <p className="text-[9.5px]/relaxed text-slate-500 mt-0.5">
                Select an operator to manage their daily clockings or construct automated wage invoices.
              </p>
            </div>

            {/* Search box */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border border-slate-200/80 rounded-xl shrink-0">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] font-bold uppercase placeholder:text-slate-400 w-full focus:ring-0"
              />
              {registrySearch && (
                <button 
                  onClick={() => setRegistrySearch('')}
                  className="text-[8px] font-bold uppercase text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Operators List Panel */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1 select-none text-left" style={{ maxHeight: '580px' }}>
              {operators.filter(op => op.name.toUpperCase().includes(registrySearch.toUpperCase())).length === 0 ? (
                <div className="text-center p-6 text-slate-450 italic text-[11px]">
                  No operators matching filter.
                </div>
              ) : (
                operators
                  .filter(op => op.name.toUpperCase().includes(registrySearch.toUpperCase()))
                  .map(op => {
                    const isSelected = selectedPerson && selectedPerson.toUpperCase() === op.name.toUpperCase();
                    const matchingLogs = otLogs.filter(l => l.workerName.toUpperCase().trim() === op.name.toUpperCase().trim());
                    const totalPayout = matchingLogs.reduce((sum, item) => sum + (item.totalPayout || 0), 0);
                    const totalHrs = matchingLogs.reduce((sum, item) => sum + (item.hours || 0), 0);
                    
                    return (
                      <div
                        key={op.name}
                        onClick={() => {
                          setSelectedPerson(op.name);
                          setMonthWiseWorker(op.name);
                          setMobileDossierOpen(true);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] flex justify-between items-center ${
                          isSelected 
                            ? 'bg-orange-50/15 border-[#f37021]/80 hover:bg-orange-50/20 shadow-3xs' 
                            : 'bg-white border-slate-150 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[9.5px] font-mono border uppercase shrink-0 transition-all ${
                            isSelected ? 'bg-[#f37021] text-white border-transparent shadow-xs' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {op.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-[11px] font-semibold uppercase truncate ${
                              isSelected ? 'text-slate-900 font-bold' : 'text-slate-800'
                            }`}>
                              {op.name}
                            </h4>
                            <span className="text-[8.5px] text-slate-400 font-semibold block uppercase truncate max-w-[140px]">
                              {op.role || 'WORKSHOP TECH'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 font-mono pl-2">
                          <span className="text-[10px] font-bold text-slate-800 block">
                            {totalHrs.toFixed(1)}h
                          </span>
                          <span className={`text-[8.5px] font-bold block ${
                            totalPayout > 0 ? 'text-emerald-700' : 'text-slate-400'
                          }`}>
                            AED {Math.round(totalPayout)}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL COCKPIT PORTAL (Shown always on desktop, on mobile only when mobileDossierOpen is active) */}
          <div className={`xl:col-span-8 space-y-5 ${
            !mobileDossierOpen ? 'hidden xl:block' : 'block'
          }`}>
            {!selectedPerson ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 italic space-y-3 shadow-3xs text-left">
                <User className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase">No Operator Active</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    Pick a factory technician from the roster sidebar list to proceed with inputting log timesheets, printing clearance summaries, or modifying base rate levels.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in text-left">
                
                {/* Desktop Mobile Back button for responsiveness */}
                <button 
                  type="button" 
                  onClick={() => setMobileDossierOpen(false)}
                  className="w-full xl:hidden bg-slate-900 hover:bg-black text-white py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer selection-none"
                >
                  ← BACK TO CREW ROSTER DIRECTORY
                </button>

                {/* ACTIVE PORTAL CARD DISPLAY */}
                {(() => {
                  const activeOp = operators.find(o => o.name.toUpperCase() === selectedPerson.toUpperCase()) || {
                    name: selectedPerson,
                    rate: 30,
                    role: 'Mechanical Workshop Helper',
                    isOutsideWorker: false
                  };
                  
                  return (
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                            activeOp.isOutsideWorker 
                              ? 'bg-purple-50 text-purple-750 border-purple-250' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                          }`}>
                            {activeOp.isOutsideWorker ? '🗣️ Contractor' : 'Internal Staff'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            Hourly Rate: AED {activeOp.rate.toFixed(2)}/hr
                          </span>
                        </div>
                        
                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight mt-1">
                          {selectedPerson}
                        </h2>
                        
                        <p className="text-[9.5px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                          {activeOp.role || 'Mechanical Parts Welder & Operator'}
                        </p>
                      </div>

                      {/* Report action parameters */}
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-[#e2e8f0] rounded-xl px-3 py-1 font-sans w-full md:w-auto justify-between md:justify-start">
                          <span className="text-[7.5px] text-slate-400 uppercase font-bold">Limit Period:</span>
                          <select
                            value={personMonthFilter}
                            onChange={(e) => setPersonMonthFilter(e.target.value)}
                            className="bg-transparent border-none outline-none font-mono text-[10px] font-bold text-slate-800 uppercase focus:ring-0 p-0 cursor-pointer"
                          >
                            <option value="ALL">All Periods</option>
                            {personMonths.map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handlePrintPersonReport}
                          disabled={personLogs.length === 0}
                          className="bg-[#f37021] hover:brightness-105 active:scale-95 text-white py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase flex-1 md:flex-initial flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF STATEMENT
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* PORTAL AGGREGATED METRICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-xl text-left shadow-3xs border-l-4 border-l-[#f37021]">
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">
                      Aggregated OT Earnings
                    </span>
                    <strong className="text-base font-bold text-[#f37021] font-mono mt-0.5 block">
                      AED {personSummary.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl text-left shadow-3xs border-l-4 border-l-slate-800">
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">
                      Total Overtime Hours
                    </span>
                    <strong className="text-base font-bold text-slate-800 font-mono mt-0.5 block">
                      {personSummary.totalHours.toFixed(1)} Hrs
                    </strong>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl text-left shadow-3xs border-l-4 border-l-indigo-600">
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">
                      Archive Shift Slips
                    </span>
                    <strong className="text-base font-bold text-indigo-700 font-mono mt-0.5 block">
                      {personLogs.length} Records
                    </strong>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl text-left shadow-3xs border-l-4 border-l-emerald-600">
                    <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">
                      Calendar Shifts logged
                    </span>
                    <strong className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                      {personSummary.distinctDays} Days
                    </strong>
                  </div>
                </div>

                {/* ENTRY FORMS PANEL */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl text-left space-y-4 shadow-3xs">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 border-slate-100 gap-2.5">
                    <div>
                      <span className="text-[7.5px] bg-[#f37021]/10 text-[#f37021] border border-[#f37021]/25 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">
                        ✍️ CHOOSE ENTRY STYLE
                      </span>
                      <h3 className="font-sans text-xs font-bold uppercase text-slate-900 mt-1.5">
                        Person-Wise Overtime Daily Logger
                      </h3>
                    </div>

                    {/* Mode select tabs */}
                    <div className="bg-slate-100 p-1 rounded-xl flex gap-1 font-sans text-[8.5px] font-bold tracking-wider border">
                      <button
                        type="button"
                        onClick={() => setEntryMode('person')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          entryMode === 'person' ? 'bg-slate-950 text-white shadow-2xs' : 'text-slate-505 hover:text-slate-805'
                        }`}
                      >
                        ☀ Single Date Slip
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntryMode('month')}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          entryMode === 'month' ? 'bg-[#f37021] text-white shadow-2xs' : 'text-slate-550 hover:text-slate-850'
                        }`}
                      >
                        🗓️ Month Calendar Grid
                      </button>
                    </div>
                  </div>

                  {/* FORM STYLE A: SINGLE DATE MANUAL INTENSE SLIP INTAKE */}
                  {entryMode === 'person' && (
                    <div className="animate-fade-in space-y-3.5">
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Log a single completed shifts session. Ideal for spot-overtime clockings for <strong className="text-slate-800 uppercase">{selectedPerson}</strong>.
                      </p>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const op = operators.find(o => o.name.toUpperCase() === selectedPerson.toUpperCase());
                          const r = op ? op.rate : 30;
                          const isOutside = op ? !!op.isOutsideWorker : false;
                          const pay = parseFloat((r * hours * multiplier).toFixed(2));
                          
                          const newOT = {
                            id: 'OT-' + Math.floor(Math.random() * 9000 + 1000),
                            workerName: selectedPerson.toUpperCase().trim(),
                            dated: date,
                            baseRate: r,
                            hours,
                            shift,
                            multiplier,
                            totalPayout: pay,
                            approvedBy: approvedBy.toUpperCase().trim(),
                            isOutsideWorker: isOutside,
                            checked: true
                          };

                          setOtLogs([newOT, ...otLogs]);
                          triggerToast(`Committed log record for ${selectedPerson} on ${date}: AED ${pay}!`);
                        }}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end font-sans"
                      >
                        {/* Date */}
                        <div className="space-y-1 sm:col-span-3 text-left">
                          <label className="block text-[8px] text-slate-400 uppercase font-bold">Shift Date</label>
                          <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px] font-bold text-slate-800 w-full focus:ring-1 focus:ring-[#f37021] focus:outline-none"
                          />
                        </div>

                        {/* Overtime Hours precision */}
                        <div className="space-y-1 sm:col-span-3 text-left">
                          <label className="block text-[8px] text-[#94a3b8] uppercase font-bold">OT Hours Worked</label>
                          <div className="flex items-center bg-white border border-slate-250 rounded-lg px-2.5 py-1 w-full justify-between h-[36px]">
                            <button
                              type="button"
                              onClick={() => handleIncrementHours(-0.5)}
                              className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold text-[11px] flex items-center justify-center cursor-pointer select-none"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              required
                              value={hours}
                              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                              className="bg-transparent border-none text-center font-mono text-[11px] font-bold text-slate-900 w-11 p-0 focus:ring-0 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleIncrementHours(0.5)}
                              className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold text-[11px] flex items-center justify-center cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Shift Type Class */}
                        <div className="space-y-1 sm:col-span-3 text-left">
                          <label className="block text-[8px] text-[#94a3b8] uppercase font-bold">Shift Mode Type</label>
                          <select
                            value={shift}
                            onChange={(e: any) => {
                              const sVal = e.target.value;
                              setShift(sVal);
                              if (sVal === 'NIGHT Shift') setMultiplier(1.50);
                              else setMultiplier(1.25);
                            }}
                            className="bg-white border border-slate-200 rounded-lg p-2 text-[10.5px] font-bold text-slate-800 w-full focus:outline-none cursor-pointer"
                          >
                            <option value="DAY Shift">☀ Day Shift (1.25x)</option>
                            <option value="NIGHT Shift">🌙 Night Shift (1.50x)</option>
                          </select>
                        </div>

                        {/* Hour Multiplier factor */}
                        <div className="space-y-1 sm:col-span-3 text-left">
                          <label className="block text-[8px] text-[#94a3b8] uppercase font-bold">Factor Ratio</label>
                          <select
                            value={multiplier}
                            onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1.25)}
                            className="bg-white border border-slate-200 rounded-lg p-2 text-[10.5px] font-mono font-bold text-slate-800 w-full focus:outline-none cursor-pointer"
                          >
                            <option value={1.00}>1.00x Base Shift</option>
                            <option value={1.25}>1.25x Overtime</option>
                            <option value={1.50}>1.50x Premium Night</option>
                            <option value={2.00}>2.00x Special holiday</option>
                          </select>
                        </div>

                        {/* Deputy Stamp Supervisor choose */}
                        <div className="sm:col-span-8 flex flex-col justify-start gap-1 pb-1">
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Supervisor Attestation Clearance</span>
                          <div className="flex gap-2 flex-wrap pt-0.5">
                            {['M. KHAN (STORE DESK)', 'E. GOMEZ (WORKSHOP)', 'AL-BASTAKI (DEPUTY CONTROLLER)'].map(sup => (
                              <button
                                key={sup}
                                type="button"
                                onClick={() => setApprovedBy(sup)}
                                className={`px-3 py-1 rounded-xl border text-[8.5px] font-bold uppercase transition-all select-none cursor-pointer ${
                                  approvedBy === sup 
                                    ? 'bg-slate-900 border-transparent text-white' 
                                    : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                              >
                                {sup.split(' ')[0]} {sup.includes('DESK') ? '(DESK)' : sup.includes('WORKSHOP') ? '(PLANT)' : '(FIN)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Commit operator log */}
                        <div className="sm:col-span-4">
                          <button
                            type="submit"
                            className="w-full bg-[#f37021] hover:brightness-110 text-white font-semibold text-[10px] uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98] transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Commit Log Slip
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                  {/* FORM STYLE B: MONTHLY CALENDAR GRID HIGH-SPEED TYPEWRITER */}
                  {entryMode === 'month' && (
                    <div className="animate-fade-in space-y-4">
                      <div className="bg-orange-50/20 border border-orange-100/50 p-3 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="text-left font-sans">
                          <h4 className="text-[10px] text-orange-950 font-bold uppercase">🗓️ Month-View Bulk Timesheet Grid</h4>
                          <p className="text-[9.5px]/relaxed text-slate-600">Type in daily overtime work hours directly for the selected month of <strong className="text-slate-900 uppercase">{selectedPerson}</strong>.</p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                          <span className="text-[8px] text-slate-400 uppercase font-bold">Active Month:</span>
                          <input
                            type="month"
                            value={monthWisePeriod}
                            onChange={(e) => {
                              setMonthWisePeriod(e.target.value);
                              setMonthWiseDaysHours(Array(31).fill(''));
                            }}
                            className="border-none bg-transparent outline-none font-mono text-[10px] font-bold p-0 text-slate-800 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Global batch shifts config */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-100/60 p-3 rounded-lg text-xs border border-slate-200/50 text-left">
                        <div className="space-y-1">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Default Shift Type (Applies to all filled days)</label>
                          <select
                            value={monthWiseShift}
                            onChange={(e: any) => {
                              const sft = e.target.value;
                              setMonthWiseShift(sft);
                              if (sft === 'NIGHT Shift') setMonthWiseMultiplier(1.50);
                              else setMonthWiseMultiplier(1.25);
                            }}
                            className="bg-white border rounded p-1.5 w-full font-bold outline-none cursor-pointer"
                          >
                            <option value="DAY Shift">☀ Day Shift (1.25x Overtime)</option>
                            <option value="NIGHT Shift">🌙 Night Shift (1.50x Overtime)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8.5px] font-bold text-slate-400 uppercase">Multiplier Factor Ratio</label>
                          <select
                            value={monthWiseMultiplier}
                            onChange={(e) => setMonthWiseMultiplier(parseFloat(e.target.value) || 1.25)}
                            className="bg-white border rounded p-1.5 w-full font-mono font-bold outline-none cursor-pointer"
                          >
                            <option value={1.00}>1.00x Base Salary</option>
                            <option value={1.25}>1.25x Overtime Shift</option>
                            <option value={1.50}>1.50x Premium Night</option>
                            <option value={2.00}>2.00x Double Holiday Rate</option>
                          </select>
                        </div>
                      </div>

                      {/* Compact inputs wrapper */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {(() => {
                          const [y, mStr] = monthWisePeriod.split('-');
                          const year = parseInt(y, 10) || 2026;
                          const month = parseInt(mStr, 10) || 6;
                          const daysNum = new Date(year, month, 0).getDate();
                          const monthNameShort = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
                          
                          const daysArray = Array.from({ length: daysNum }, (_, i) => i + 1);
                          
                          return daysArray.map(dayNum => {
                            const index = dayNum - 1;
                            const hVal = monthWiseDaysHours[index] || '';
                            const hasLoggedValue = hVal.trim() !== '' && parseFloat(hVal) > 0;
                            
                            // Check historical archived log
                            const formattedDayStr = `${monthWisePeriod}-${String(dayNum).padStart(2, '0')}`;
                            const hasHistoricalShift = otLogs.some(log => log.workerName.toUpperCase().trim() === selectedPerson.toUpperCase().trim() && log.dated === formattedDayStr);
                            
                            return (
                              <div 
                                key={dayNum} 
                                className={`p-2 rounded-lg border text-center transition-all flex flex-col justify-between ${
                                  hasHistoricalShift 
                                    ? 'bg-blue-50/50 border-blue-200 shadow-2xs' 
                                    : hasLoggedValue 
                                      ? 'bg-amber-50/60 border-amber-300 shadow-2xs' 
                                      : 'bg-white border-slate-205'
                                }`}
                              >
                                <span className="text-[8.5px] font-mono text-slate-400 font-semibold block mb-1">
                                  {String(dayNum).padStart(2, '0')} {monthNameShort}
                                </span>
                                
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    placeholder="0.0"
                                    value={hVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                        const updated = [...monthWiseDaysHours];
                                        updated[index] = val;
                                        setMonthWiseDaysHours(updated);
                                      }
                                    }}
                                    className="w-full bg-slate-50 border border-slate-205 rounded font-mono font-bold text-center text-[10.5px] p-1 focus:bg-white focus:outline-none text-slate-800"
                                    title="Overtime hours for this day"
                                  />
                                  {hasHistoricalShift && (
                                    <span className="text-[7.5px] text-blue-600 uppercase font-bold block mt-0.5" title="Logged hours exist on this Date">
                                      Saved ✔
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* Actions bar for batch monthly */}
                      <div className="flex justify-between items-center pt-1.5 flex-wrap gap-2">
                        <p className="text-[9.5px]/relaxed text-slate-400">
                          * Input hours into corresponding day card box. Empty slots are ignored during save.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Reset current daily grid hours?")) {
                                setMonthWiseDaysHours(Array(31).fill(''));
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-bold uppercase text-slate-500 cursor-pointer"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveMonthWiseBatch}
                            className="bg-[#f37021] hover:brightness-105 active:scale-95 text-white px-5 py-1.5 font-sans font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Save Month Sheet ({monthWiseDaysHours.filter(x => x && parseFloat(x) > 0).length} Days)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* TIMELINE LEDGER JOURNAL HISTORY TABLE */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4 text-left">
                  <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 uppercase">
                        VERIFIED SERVICE BOOK LEDGER
                      </h4>
                      <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">
                        Individual itemized shift entries for payroll release calculations.
                      </p>
                    </div>
                    <span className="text-[9.5px]/relaxed text-slate-400 font-mono font-bold bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                      {personLogs.length} Shifts In Filter
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 uppercase border-b text-[8px] font-bold divide-x divide-slate-100">
                          <th className="p-3">Reference Slip</th>
                          <th className="p-3">Service Date</th>
                          <th className="p-3 text-center">Shift Mode</th>
                          <th className="p-3 text-right font-sans">Base Rate</th>
                          <th className="p-3 text-center font-sans">OT Hours</th>
                          <th className="p-3 text-center font-sans">Multiplier</th>
                          <th className="p-3 text-right text-[#f37021] bg-orange-50/10 font-sans">Accrual Pay</th>
                          <th className="p-3 font-sans">Signing Authority</th>
                          <th className="p-3 text-center font-sans">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10px] font-sans">
                        {personLogs.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-10 text-center text-slate-400 italic">
                              No shift logs archived for {selectedPerson} during this period.
                            </td>
                          </tr>
                        ) : (
                          personLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50 align-middle divide-x divide-slate-100/50">
                              <td className="p-3 font-mono text-slate-400 font-bold">{log.id}</td>
                              <td className="p-3 font-semibold font-mono text-slate-700">{log.dated}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wide ${
                                  log.shift === 'NIGHT Shift' 
                                    ? 'bg-purple-100/50 text-purple-750 border border-purple-100/30' 
                                    : 'bg-amber-50 text-[#f37021] border border-orange-100'
                                }`}>
                                  {log.shift === 'NIGHT Shift' ? '🌙 Night' : '☀ Day'}
                                </span>
                              </td>
                              <td className="p-3 text-right text-slate-500 font-mono font-bold">AED {log.baseRate}/hr</td>
                              <td className="p-3 text-center font-bold text-slate-900 font-mono">{log.hours}h</td>
                              <td className="p-3 text-center font-bold text-[#f37021] font-mono">{log.multiplier}x</td>
                              <td className="p-3 text-right font-bold text-[#f37021] bg-orange-50/10 font-mono">AED {log.totalPayout?.toFixed(2)}</td>
                              <td className="p-3 uppercase text-slate-500 font-bold text-[8.5px] truncate max-w-[124px]">
                                {log.approvedBy || 'FOREMAN'}
                              </td>
                              <td className="p-3 text-center animate-fade-in">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button 
                                    type="button"
                                    onClick={() => setEditingOtLog(log)}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title="Edit Slot Record"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setDeleteOtTargetId(log.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer hover:bg-slate-100 rounded"
                                    title="Revoke Record"
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
            )}
          </div>
        </div>
        )}

        {/* DAILY OPERATIONS COMPILED SUB-TAB */}
        {subTab === 'daily' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-6 text-left font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-slate-100 gap-3">
              <div>
                <span className="text-[7.5px] bg-[#f37021]/10 text-[#f37021] border border-[#f37021]/25 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">
                  DAILY OPERATION COMPILATION
                </span>
                <h3 className="font-sans text-xs font-bold uppercase text-slate-900 mt-1.5">
                  Daily Crew Overtime Summary
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShiftDay(-1)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 p-2 rounded-xl text-[10px] font-bold text-slate-700 cursor-pointer"
                >
                  ◀ Previous Day
                </button>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Date:</span>
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="border-none bg-transparent outline-none font-mono text-[10.5px] font-bold p-0 text-slate-850 cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleShiftDay(1)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 p-2 rounded-xl text-[10px] font-bold text-slate-700 cursor-pointer"
                >
                  Next Day ▶
                </button>
                
                <button
                  type="button"
                  onClick={handlePrintDailyReport}
                  disabled={dailyLogs.length === 0}
                  className="bg-[#f37021] hover:brightness-105 text-white font-semibold text-[10px] uppercase py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ml-2"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>

            {/* Daily Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">Active Workers Logged</span>
                <strong className="text-sm font-bold text-slate-900 font-mono block mt-1">{dailySummary.uniqueWorkers} Operators</strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left border-l-4 border-l-[#f37021]">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">Total Overtime Hours</span>
                <strong className="text-sm font-bold text-[#f37021] font-mono block mt-1">{dailySummary.hoursLogged} Hours</strong>
              </div>
              <div className="bg-[#fffdfa] border border-orange-100 p-4 rounded-xl text-left border-l-4 border-l-emerald-600">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">Daily Estimated Payout</span>
                <strong className="text-sm font-bold text-emerald-750 font-mono block mt-1">AED {dailySummary.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Daily Sheet Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase border-b text-[8px] font-bold divide-x divide-slate-100">
                    <th className="p-3">Reference ID</th>
                    <th className="p-3">Worker Name</th>
                    <th className="p-3 text-center">Shift Type</th>
                    <th className="p-3 text-right">Base Wage Rate</th>
                    <th className="p-3 text-center">Hours worked</th>
                    <th className="p-3 text-center">Multiplier</th>
                    <th className="p-3 text-right text-[#f37021] bg-orange-50/10">Calculated Pay</th>
                    <th className="p-3">Attestation Clearance</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10px]">
                  {dailyLogs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-405 italic">
                        No workers logged under date ({dailyDate}). Switch dates using the control panel above to inspect other logs.
                      </td>
                    </tr>
                  ) : (
                    dailyLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 align-middle divide-x divide-slate-100/50">
                        <td className="p-3 font-mono text-slate-400 font-bold">{log.id}</td>
                        <td className="p-3 font-bold text-slate-800 uppercase">
                          {log.workerName}
                          {(log.isOutsideWorker || DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === log.workerName.toUpperCase())?.isOutsideWorker) && (
                            <span className="block text-[7px] text-purple-650 font-bold tracking-widest mt-0.5">CONTRACT LABOURER</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                            log.shift === 'NIGHT Shift' ? 'bg-purple-100/50 text-purple-750' : 'bg-amber-100 text-[#f37021]'
                          }`}>
                            {log.shift === 'NIGHT Shift' ? '🌙 Night' : '☀ Day'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-500">AED {log.baseRate}/hr</td>
                        <td className="p-3 text-center font-bold text-slate-800 font-mono">{log.hours}h</td>
                        <td className="p-3 text-center font-bold text-[#f37021] font-mono">{log.multiplier}x</td>
                        <td className="p-3 text-right font-bold text-[#f37021] bg-orange-50/10 font-mono">AED {log.totalPayout?.toFixed(2)}</td>
                        <td className="p-3 uppercase text-slate-400 font-semibold text-[8.5px]">{log.approvedBy || 'FOREMAN'}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => setEditingOtLog(log)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                              title="Edit Slot Record"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => deleteOT(log.id)}
                              className="p-1 text-slate-400 hover:text-red-700 rounded hover:bg-slate-100 cursor-pointer transition-colors"
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
        )}

        {/* MONTHLY RECONCILIATION SUB-TAB */}
        {subTab === 'monthly' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-6 text-left font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-slate-100 gap-3">
              <div>
                <span className="text-[7.5px] bg-blue-100 text-sky-800 border border-sky-200 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">
                  FINANCIAL LEDGER CLOSEOUT
                </span>
                <h3 className="font-sans text-xs font-bold uppercase text-slate-900 mt-1.5">
                  Monthly Reconciled Overtime Pay
                </h3>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-204 px-3 py-1.5 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Year:</span>
                  <select 
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(e.target.value)}
                    className="border-none bg-transparent outline-none font-mono text-[10.5px] p-0 font-bold text-slate-800 cursor-pointer"
                  >
                    {['2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-204 px-3 py-1.5 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Month:</span>
                  <select 
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(e.target.value)}
                    className="border-none bg-transparent outline-none font-mono text-[10.5px] p-0 font-bold text-slate-800 cursor-pointer"
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={handlePrintMonthlyReport}
                  disabled={monthlyWorkersData.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] uppercase py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" /> PDF Statement
                </button>
              </div>
            </div>

            {/* Monthly Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">Accumular head count</span>
                <strong className="text-sm font-bold text-slate-900 font-mono block mt-1">{monthlyTotals.headcount} Registered Workers</strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left border-l-4 border-l-sky-600">
                <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-wide">Aggregated OT Hours</span>
                <strong className="text-sm font-bold text-sky-700 font-mono block mt-1">{monthlyTotals.totalHours.toFixed(1)} Hrs Worked</strong>
              </div>
              <div className="bg-[#f0f9ff] border border-sky-100 p-4 rounded-xl text-left border-l-4 border-l-[#0284c7]">
                <span className="text-[7.5px] uppercase font-bold text-[#0284c7] block tracking-wide">Aggregate Disbursement</span>
                <strong className="text-sm font-bold text-[#0284c7] font-mono block mt-1">AED {monthlyTotals.totalPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase border-b text-[8px] font-bold divide-x divide-slate-100">
                    <th className="p-3" style={{width: '6%'}}>S.N</th>
                    <th className="p-3">Employee name</th>
                    <th className="p-3 text-center">Active shifts</th>
                    <th className="p-3 text-center">Day shift hours</th>
                    <th className="p-3 text-center">Night shift hours</th>
                    <th className="p-3 text-center">Total OT hours</th>
                    <th className="p-3 text-right bg-sky-50/15 text-[#0284c7]">Monthly Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10px]">
                  {monthlyWorkersData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-405 italic">
                        No aggregated overtime hours saved for the selected period ({monthlyYear}-{monthlyMonth}).
                      </td>
                    </tr>
                  ) : (
                    monthlyWorkersData.map((row, idx) => (
                      <tr key={row.workerName} className="hover:bg-slate-50/50 align-middle divide-x divide-slate-100/50">
                        <td className="p-3 font-mono text-slate-400 font-bold text-center">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-805 uppercase">
                          {row.workerName}
                          {(DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === row.workerName.toUpperCase())?.isOutsideWorker) && (
                            <span className="block text-[7px] text-purple-650 font-bold tracking-widest mt-0.5">CONTRACT LABOURER</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-700">{row.shiftCount} Shifts</td>
                        <td className="p-3 text-center font-mono text-slate-600">{row.dayShiftHrs.toFixed(1)}h</td>
                        <td className="p-3 text-center font-mono text-slate-600">{row.nightShiftHrs.toFixed(1)}h</td>
                        <td className="p-3 text-center font-bold text-slate-900 font-mono bg-slate-50/50">{row.totalHrs.toFixed(1)}h</td>
                        <td className="p-3 text-right font-bold text-[#0284c7] font-mono bg-sky-50/15">AED {row.payout?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPREHENSIVE SERVICE REGISTRY SUB-TAB */}
        {subTab === 'entries' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-6 text-left font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-slate-100 gap-3">
              <div>
                <span className="text-[7.5px] bg-[#f37021]/10 text-[#f37021] border border-[#f37021]/25 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">
                  UNFILTERED DATABASE JOURNAL
                </span>
                <h3 className="font-sans text-xs font-bold uppercase text-slate-900 mt-1.5">
                  Itemized Service Record Slips
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <Search className="w-3.5 h-3.5 text-slate-404" />
                  <input
                    type="text"
                    placeholder="Search logs by ID / name..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="border-none bg-transparent outline-none text-[10px] font-bold uppercase placeholder:text-slate-400 focus:ring-0 text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Classification:</span>
                  <select
                    value={workerTypeFilter}
                    onChange={(e: any) => setWorkerTypeFilter(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-slate-800 p-0 cursor-pointer"
                  >
                    <option value="ALL">All Classifications</option>
                    <option value="INTERNAL">Internal Staff</option>
                    <option value="OUTSIDE">Outside Contractors</option>
                  </select>
                </div>
              </div>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-203 p-3.5 rounded-xl text-left">
                <span className="text-[7.5px] uppercase font-bold text-slate-405 block tracking-wide">Matching Slips</span>
                <strong className="text-sm font-bold text-slate-900 font-mono block mt-0.5">{filteredRegistry.length} Records</strong>
              </div>
              <div className="bg-slate-50 border border-slate-203 p-3.5 rounded-xl text-left border-l-4 border-l-[#f37021]">
                <span className="text-[7.5px] uppercase font-bold text-slate-450 block tracking-wide">Billed Hours Sum</span>
                <strong className="text-sm font-bold text-[#f37021] font-mono block mt-0.5">{filteredRegistry.reduce((s,c)=>s+c.hours, 0).toFixed(1)} Hrs</strong>
              </div>
              <div className="bg-slate-50 border border-slate-203 p-3.5 rounded-xl text-left border-l-4 border-l-emerald-600">
                <span className="text-[7.5px] uppercase font-bold text-slate-450 block tracking-wide">Gross Disbursement</span>
                <strong className="text-sm font-bold text-emerald-700 font-mono block mt-0.5">AED {totalPayoutSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="bg-slate-50 border border-slate-203 p-3.5 rounded-xl text-left">
                <span className="text-[7.5px] uppercase font-bold text-slate-450 block tracking-wide">Roster Database Span</span>
                <strong className="text-sm font-bold text-slate-800 font-mono block mt-0.5">{operators.length} Active Profiles</strong>
              </div>
            </div>

            {/* Quick entry segment inside ledger for rapid entry */}
            <div className="bg-orange-50/15 border border-orange-100/50 p-4 rounded-xl space-y-3.5 text-left">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">⚡ Add Spot-Overtime Record directly to registry</span>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                <div className="md:col-span-3 text-left">
                  <label className="block text-[8px] text-slate-404 uppercase font-bold mb-1">Select Operator</label>
                  <select
                    value={workerName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const op = operators.find(o => o.name === name);
                      setWorkerName(name);
                      if (op) {
                        setBaseRate(op.rate);
                        setIsOutsideWorkerFormChecked(!!op.isOutsideWorker);
                      }
                    }}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-bold text-slate-800 w-full focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Name --</option>
                    {operators.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-2 text-left">
                  <label className="block text-[8px] text-slate-404 uppercase font-bold mb-1">Shift Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] font-bold text-slate-800 w-full focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block text-[8px] text-slate-404 uppercase font-bold mb-1">Hours worked</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                    className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] font-bold text-center text-slate-800 w-full focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 text-left">
                  <label className="block text-[8px] text-slate-404 uppercase font-bold mb-1">Multiplier</label>
                  <select
                    value={multiplier}
                    onChange={(e) => setMultiplier(parseFloat(e.target.value) || 1.25)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-mono font-bold text-slate-800 w-full focus:outline-none cursor-pointer"
                  >
                    <option value={1.00}>1.00x Base</option>
                    <option value={1.25}>1.25x Overtime</option>
                    <option value={1.50}>1.50x Premium</option>
                    <option value={2.00}>2.00x Holiday</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!workerName) {
                        alert("Please select operator name first.");
                        return;
                      }
                      const op = operators.find(o => o.name === workerName);
                      const r = op ? op.rate : 30;
                      const isOutside = op ? !!op.isOutsideWorker : false;
                      const pay = parseFloat((r * hours * multiplier).toFixed(2));
                      
                      const newOT = {
                        id: 'OT-' + Math.floor(Math.random() * 9000 + 1000),
                        workerName: workerName.toUpperCase().trim(),
                        dated: date,
                        baseRate: r,
                        hours,
                        shift: shift,
                        multiplier,
                        totalPayout: pay,
                        approvedBy: approvedBy.toUpperCase().trim(),
                        isOutsideWorker: isOutside,
                        checked: true
                      };

                      setOtLogs([newOT, ...otLogs]);
                      setWorkerName('');
                      triggerToast(`Successfully committed spot-overtime log for ${workerName}!`);
                    }}
                    className="w-full bg-[#f37021] hover:brightness-110 text-white font-semibold text-[9.5px] uppercase py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Instantly
                  </button>
                </div>
              </div>
            </div>

            {/* Registry Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase border-b text-[8px] font-bold divide-x divide-slate-100">
                    <th className="p-3">Reference Slip</th>
                    <th className="p-3">Service Date</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3 text-center">Shift Mode</th>
                    <th className="p-3 text-right">Base Hourly Rate</th>
                    <th className="p-3 text-center">OT Hours</th>
                    <th className="p-3 text-center">Multiplier</th>
                    <th className="p-3 text-right text-[#f37021] bg-orange-50/10">Gross Accrual</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10px]">
                  {filteredRegistry.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-10 text-center text-slate-405 italic">
                        No service record slips matched current search parameters. Clear filters to audit all logs.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistry.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 align-middle divide-x divide-slate-100/50">
                        <td className="p-3 font-mono text-slate-400 font-bold">{log.id}</td>
                        <td className="p-3 font-mono font-bold text-slate-550">{log.dated}</td>
                        <td className="p-3 font-semibold text-slate-805 uppercase">
                          {log.workerName}
                          {(log.isOutsideWorker || DEFAULT_STAFF_PROFILES.find(p => p.name.toUpperCase() === log.workerName.toUpperCase())?.isOutsideWorker) && (
                            <span className="block text-[6.5px] text-purple-650 font-bold tracking-widest mt-0.5">OUTSIDE SOURCE</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                            log.shift === 'NIGHT Shift' ? 'bg-purple-100/50 text-purple-750' : 'bg-amber-105 text-[#f37021]'
                          }`}>
                            {log.shift === 'NIGHT Shift' ? '🌙 Night' : '☀ Day'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-500">AED {log.baseRate}/hr</td>
                        <td className="p-3 text-center font-bold text-slate-900 font-mono">{log.hours}h</td>
                        <td className="p-3 text-center font-bold text-[#f37021] font-mono">{log.multiplier}x</td>
                        <td className="p-3 text-right font-bold text-[#f37021] bg-orange-50/10 font-mono">AED {log.totalPayout?.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => setEditingOtLog(log)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                              title="Edit Slot Record"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => deleteOT(log.id)}
                              className="p-1 text-slate-400 hover:text-red-750 rounded hover:bg-slate-100 cursor-pointer transition-colors"
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
        )}

        {/* FACTORY LABOR & CREW WAGES SUB-TAB */}
        {subTab === 'operators' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-6 text-left font-sans">
            <div>
              <span className="text-[7.5px] bg-[#f37021]/10 text-[#f37021] border border-[#f37021]/25 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">
                COOPERATIVE LABOR ROSTER
              </span>
              <h3 className="font-sans text-xs font-bold uppercase text-slate-900 mt-1.5">
                Staff & Contractors Wage Card Rates
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Manage operator profiles, classifications, and standard base overtime wages.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Add form */}
              <div className="lg:col-span-4 bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-4 shadow-3xs">
                <h4 className="text-[10px] font-bold uppercase text-[#f37021]">Add New Worker Profile</h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 uppercase font-bold">Operator Name</label>
                    <input
                      type="text"
                      placeholder="e.g. FARID KHALID"
                      value={newOpName}
                      onChange={(e) => setNewOpName(e.target.value.toUpperCase())}
                      className="w-full bg-white p-2.5 text-[10.5px] font-semibold uppercase border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 uppercase font-bold">Wage Rate (AED/h)</label>
                      <input
                        type="number"
                        placeholder="30"
                        value={newOpRate || ''}
                        onChange={(e) => setNewOpRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white p-2.5 text-[10.5px] font-mono font-bold border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8px] text-slate-400 uppercase font-bold">Classification</label>
                      <select
                        value={newOpType}
                        onChange={(e: any) => setNewOpType(e.target.value)}
                        className="w-full bg-white p-2.5 text-[10.5px] font-bold border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                      >
                        <option value="INTERNAL">Internal Staff</option>
                        <option value="OUTSIDE">Outside Contractor</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-400 uppercase font-bold">Designation / Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. HELPER MACHINIST"
                      value={newOpRole}
                      onChange={(e) => setNewOpRole(e.target.value)}
                      className="w-full bg-white p-2.5 text-[10.5px] font-semibold uppercase border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddOperator}
                    className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create Profile card
                  </button>
                </div>
              </div>

              {/* Directory list */}
              <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-xl shadow-3xs">
                <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3 block">Roster directory rates</h4>
                
                <div className="overflow-x-auto border border-slate-150 rounded-xl">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase text-[8px] font-bold border-b border-slate-150">
                        <th className="p-3">Name</th>
                        <th className="p-3">Role Designation</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3 text-right">Standard Wage</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-705">
                      {operators.map(op => (
                        <tr key={op.name} className="hover:bg-slate-50/50 align-middle">
                          <td className="p-3 font-bold text-slate-900 uppercase">{op.name}</td>
                          <td className="p-3 uppercase text-slate-500 font-bold text-[9px] truncate max-w-[170px]">
                            {op.role || 'WORKSHOP OPERATOR'}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              op.isOutsideWorker ? 'bg-purple-100 text-purple-700' : 'bg-emerald-50 text-emerald-850'
                            }`}>
                              {op.isOutsideWorker ? 'Contractor' : 'Internal'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            AED {op.rate.toFixed(2)}/h
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOperator(op);
                                  setEditOpRate(op.rate);
                                  setEditOpRole(op.role || '');
                                  setEditOpType(op.isOutsideWorker ? 'OUTSIDE' : 'INTERNAL');
                                }}
                                className="text-sky-620 hover:text-sky-850 font-bold text-[9px] uppercase cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteOperator(e, op.name)}
                                className="text-rose-620 hover:text-rose-850 font-bold text-[9px] uppercase cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Profile Edit Sheet inside tab */}
                {editingOperator && (
                  <div className="bg-orange-50/45 p-4 border border-orange-100/80 rounded-xl space-y-3.5 max-w-md animate-fade-in mt-4 border-l-4 border-l-[#f37021]">
                    <div className="flex justify-between items-center border-b pb-1.5 border-orange-100">
                      <h4 className="text-[10px] font-bold uppercase text-slate-900">Adjust standard profile: {editingOperator.name}</h4>
                      <button 
                        type="button" 
                        onClick={() => setEditingOperator(null)} 
                        className="text-[9px] text-slate-400 hover:text-red-500 font-semibold"
                      >
                        ✕ CANCEL
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1 text-left">
                        <label className="block text-[8px] text-slate-400 uppercase font-bold">Base Wage hourly (AED)</label>
                        <input
                          type="number"
                          value={editOpRate}
                          onChange={(e) => setEditOpRate(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white p-2 text-[10.5px] font-mono font-bold border border-slate-200 rounded-lg outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="block text-[8px] text-slate-400 uppercase font-bold">Type classification</label>
                        <select
                          value={editOpType}
                          onChange={(e: any) => setEditOpType(e.target.value)}
                          className="w-full bg-white p-2 text-[10.5px] font-bold border border-slate-200 rounded-lg outline-none focus:border-[#f37021]"
                        >
                          <option value="INTERNAL">Internal Staff</option>
                          <option value="OUTSIDE">Outside Contractor</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-left animate-fade-in">
                      <label className="block text-[8px] text-slate-400 uppercase font-bold">Role / Designation Title</label>
                      <input
                        type="text"
                        value={editOpRole}
                        onChange={(e) => setEditOpRole(e.target.value)}
                        className="w-full bg-white p-2 text-[10.5px] font-bold uppercase border border-slate-200 rounded-lg outline-none focus:border-[#f37021]"
                      />
                    </div>
                    
                    <div className="text-left">
                      <button
                        type="button"
                        onClick={handleSaveEditOperator}
                        className="bg-black hover:bg-zinc-900 text-white py-1.5 px-4 rounded-lg text-[9.5px] font-bold uppercase transition-all cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDIT OVERTIME LOG MODAL */}
        {editingOtLog && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans no-print animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200/85 shadow-2xl space-y-4 text-left">
              <div className="flex justify-between items-center border-b pb-3 border-slate-150">
                <div>
                  <span className="text-[7.5px] bg-[#f37021]/10 text-[#f37021] border border-[#f37021]/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Ledger Audit Correction
                  </span>
                  <h3 className="text-slate-900 text-xs font-bold uppercase mt-1.5">
                    Adjust Overtime Slip ({editingOtLog.id})
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEditingOtLog(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer h-7 w-7 rounded-full hover:bg-slate-50 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Operator Selector */}
                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-420 uppercase font-bold">Employee NAME</label>
                  <select
                    value={editingOtLog.workerName}
                    onChange={(e) => {
                      const op = operators.find(o => o.name.toUpperCase() === e.target.value.toUpperCase());
                      setEditingOtLog({
                        ...editingOtLog,
                        workerName: e.target.value,
                        baseRate: op ? op.rate : editingOtLog.baseRate
                      });
                    }}
                    className="bg-white border border-slate-200 rounded-lg p-2.5 text-[10.5px] font-bold text-slate-800 w-full focus:outline-none cursor-pointer"
                  >
                    {operators.map(o => (
                      <option key={o.name} value={o.name.toUpperCase()}>{o.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Shift Date */}
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-420 uppercase font-bold">Shift Date</label>
                    <input
                      type="date"
                      required
                      value={editingOtLog.dated}
                      onChange={(e) => setEditingOtLog({ ...editingOtLog, dated: e.target.value })}
                      className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[10px] font-bold text-slate-800 w-full focus:outline-none"
                    />
                  </div>

                  {/* Overtime Hours */}
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-420 uppercase font-bold">OT Hours Worked</label>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-0.5 justify-between h-[34px]">
                      <button
                        type="button"
                        onClick={() => {
                          const currentHrs = parseFloat(editingOtLog.hours) || 0;
                          setEditingOtLog({ ...editingOtLog, hours: Math.max(0.5, currentHrs - 0.5) });
                        }}
                        className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-705 font-bold text-[11px] flex items-center justify-center cursor-pointer select-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={editingOtLog.hours}
                        onChange={(e) => setEditingOtLog({ ...editingOtLog, hours: parseFloat(e.target.value) || 0 })}
                        className="bg-transparent border-none text-center font-mono text-[10.5px] font-bold text-slate-900 w-11 p-0 focus:ring-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentHrs = parseFloat(editingOtLog.hours) || 0;
                          setEditingOtLog({ ...editingOtLog, hours: currentHrs + 0.5 });
                        }}
                        className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-705 font-bold text-[11px] flex items-center justify-center cursor-pointer select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Shift Mode */}
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-420 uppercase font-bold">Shift Mode</label>
                    <select
                      value={editingOtLog.shift}
                      onChange={(e) => setEditingOtLog({ ...editingOtLog, shift: e.target.value })}
                      className="bg-white border border-slate-205 rounded-lg p-2 text-[10px] font-bold text-slate-800 w-full focus:outline-none cursor-pointer"
                    >
                      <option value="DAY Shift">☀ Day Shift (1.25x)</option>
                      <option value="NIGHT Shift">🌙 Night Shift (1.50x)</option>
                    </select>
                  </div>

                  {/* Multiplier */}
                  <div className="space-y-1">
                    <label className="block text-[8px] text-slate-425 uppercase font-bold">Rate Factor Ratio</label>
                    <select
                      value={editingOtLog.multiplier}
                      onChange={(e) => setEditingOtLog({ ...editingOtLog, multiplier: parseFloat(e.target.value) || 1.25 })}
                      className="bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-mono font-bold text-slate-800 w-full focus:outline-none cursor-pointer"
                    >
                      <option value={1.00}>1.00x Base Shift</option>
                      <option value={1.25}>1.25x Overtime</option>
                      <option value={1.50}>1.50x Premium Night</option>
                      <option value={2.00}>2.00x Double Holiday Rate</option>
                    </select>
                  </div>
                </div>

                {/* Supervisor approval */}
                <div className="space-y-1">
                  <label className="block text-[8px] text-slate-420 uppercase font-bold">Supervisor Authorization Signed</label>
                  <input
                    type="text"
                    required
                    value={editingOtLog.approvedBy}
                    onChange={(e) => setEditingOtLog({ ...editingOtLog, approvedBy: e.target.value })}
                    className="w-full bg-white p-2.5 text-[10.5px] font-bold uppercase border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-[#f37021]"
                  />
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {['M. KHAN (STORE DESK)', 'E. GOMEZ (WORKSHOP)', 'AL-BASTAKI (DEPUTY CONTROLLER)'].map(sup => (
                      <button
                        key={sup}
                        type="button"
                        onClick={() => setEditingOtLog({ ...editingOtLog, approvedBy: sup })}
                        className={`px-2.5 py-1 rounded-xl text-[8px] font-bold border uppercase transition-all cursor-pointer ${
                          editingOtLog.approvedBy === sup 
                            ? 'bg-slate-905 bg-slate-900 border-transparent text-white' 
                            : 'bg-white hover:bg-slate-50 text-slate-404 border-slate-200'
                        }`}
                      >
                        {sup.split(' ')[0]} {sup.includes('DESK') ? '(DESK)' : sup.includes('WORKSHOP') ? '(PLANT)' : '(CONTROLLER)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOtLog(null)}
                  className="bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold text-slate-600 uppercase cursor-pointer text-center"
                >
                  ✕ Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEditOtLog(editingOtLog)}
                  className="bg-[#f37021] hover:bg-opacity-90 py-2.5 rounded-xl font-bold text-white uppercase cursor-pointer text-center"
                >
                  Save Changes ✔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION DELETION PORTAL OVERLAYS */}
        {deleteOtTargetId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans no-print animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200/80 shadow-2xl text-center space-y-4">
              <div className="mx-auto bg-amber-50 rounded-full p-3 w-max text-[#f37021] border border-orange-150">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5 text-center">
                <h3 className="text-slate-900 text-sm font-bold uppercase">Revoke Overtime Record?</h3>
                <p className="text-slate-500 text-[10.5px] leading-relaxed">
                  Are you absolutely sure you wish to delete work-log entry (ID: <strong>{deleteOtTargetId}</strong>)? This cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeleteOtTargetId(null)}
                  className="bg-slate-100 hover:bg-slate-200 py-2 rounded-xl font-bold text-slate-600 uppercase cursor-pointer"
                >
                  No, Keep
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtLogs(prevLogs => {
                      const updated = prevLogs.filter(log => log.id !== deleteOtTargetId);
                      localStorage.setItem('MFI_OVERTIME_RECORDS', JSON.stringify(updated));
                      return updated;
                    });
                    setDeleteOtTargetId(null);
                    triggerToast(`Successfully revoked timesheet record ${deleteOtTargetId}.`);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl font-bold uppercase cursor-pointer text-center"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteOperatorTargetName && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans no-print animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-150 shadow-2xl text-center space-y-4">
              <div className="mx-auto bg-rose-50 rounded-full p-3 w-max text-rose-600 border border-rose-100">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1.5 text-center">
                <h3 className="text-slate-900 text-sm font-bold uppercase">Purge Operator Profile?</h3>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  Confirm purging <strong>{deleteOperatorTargetName}</strong> from active technician listings? Note: their historical logs will remain intact.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeleteOperatorTargetName(null)}
                  className="bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold text-slate-600 uppercase cursor-pointer"
                >
                  ✕ Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const remaining = operators.filter(p => p.name !== deleteOperatorTargetName);
                    setOperators(remaining);
                    if (selectedPerson && deleteOperatorTargetName && selectedPerson.toUpperCase() === deleteOperatorTargetName.toUpperCase()) {
                      setSelectedPerson(remaining[0]?.name || '');
                    }
                    if (monthWiseWorker && deleteOperatorTargetName && monthWiseWorker.toUpperCase() === deleteOperatorTargetName.toUpperCase()) {
                      setMonthWiseWorker(remaining[0]?.name || '');
                    }
                    setDeleteOperatorTargetName(null);
                    triggerToast(`Purged operator ${deleteOperatorTargetName} from roster.`);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-bold uppercase cursor-pointer text-center"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );

  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-4"
    >
      
      {/* Toast Notification helper */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-slate-950 border border-[#f37021] text-white p-3 font-mono text-[10px] shadow-xl rounded z-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modern High-Fidelity 2-Column Desktop layout / 1-Column Responsive Mobile Layout (Replicating Snapshot 1!) */}



      <div className="lg:flex lg:gap-1.5 min-h-0">
        
        {/* Mobile View / Responsive Portal Navigation Switcher */}
        <div className="lg:hidden w-full bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 space-y-4 no-print select-none shadow-[0_4px_12px_rgb(0,0,0,0.4)]">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-bold text-[#f37021] uppercase tracking-wider font-mono">Operations Command Deck</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-850 px-2 py-0.5 rounded font-mono">
              Hub V2.6
            </span>
          </div>

          {/* Quick sliding Department selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {mobileDepts.map(dept => {
              const isSelected = selectedMobileDept === dept.id;
              const DeptIcon = dept.icon;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setSelectedMobileDept(dept.id)}
                  className={`px-3 py-2 text-[10px] font-bold tracking-wider uppercase shrink-0 rounded-lg border flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-850 to-slate-950 border-slate-600 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DeptIcon className={`w-3.5 h-3.5 shrink-0 ${dept.accent}`} />
                  <span>{dept.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]" />}
                </button>
              );
            })}
          </div>

          {/* Visual Grid of tools in selected Mobile Department */}
          <div className="bg-slate-950/60 border border-slate-850/80 p-3 rounded-lg">
            <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 px-0.5 font-mono">
              Operational Registers & Invoicing Tools
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {mobileItems
                .filter(item => (item.dept || (item as any).department) === selectedMobileDept)
                .filter(item => !item.requiresEdit || canEdit)
                .map(item => {
                  const isTabActive = activeTab === item.id;
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        triggerToast(`Loaded: ${item.label}`);
                      }}
                      className={`text-left p-2.5 rounded-none border text-[9px] font-semibold uppercase transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 min-h-[60px] ${
                        isTabActive
                          ? 'bg-[#002D62] border-[#A6C4DE] text-white shadow-xs'
                          : 'bg-white border-[#A6C4DE] text-[#1F4E79] hover:bg-[#CDE4F5]'
                      }`}
                    >
                      <ItemIcon className={`w-4 h-4 ${isTabActive ? 'text-white' : 'text-[#1F4E79]'}`} />
                      <span className="whitespace-normal break-words leading-tight block text-left">{item.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Dual-Pane Left Side menu Navigation (Collapsible) */}
        {!isSidebarCollapsed ? (
          <div className="hidden lg:flex w-88 xl:w-96 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden no-print select-none shadow-xs min-h-[580px] h-fit transition-all duration-200">
            
            {/* COLUMN A: Primary Department Strips (Width: 105px, dark high-contrast flat layout) */}
            <div ref={sidebarDeptsContainerRef} className="w-[105px] shrink-0 bg-[#063b36] border-r border-[#052e2a] flex flex-col justify-between py-3">
              <div className="space-y-1.5">
                {/* Small branding logo/badge at top */}
                <div className="px-1 pb-2 border-b border-[#052e2a] flex flex-col items-center select-none text-center">
                  <div className="flex items-center justify-center w-7.5 h-7.5 bg-[#FF6B00] text-white font-black text-[12px] rounded-md mb-1 shadow-xs">
                    MFI
                  </div>
                  <span className="text-[7.5px] font-bold tracking-widest text-white/95 uppercase font-sans">
                    FINANCIALS
                  </span>
                </div>

                {/* Vertical list of departments */}
                <div className="pt-2 space-y-1 px-1">
                  {departments.map((dept) => {
                    const isSelected = selectedDeptId === dept.id;
                    const isDeptFocused = isSelected && isSidebarNavActive && sidebarFocusedPane === 'departments';
                    
                    // Dynamically resolve appropriate icon
                    let DeptIcon = Layers;
                    if (dept.id === 'vouchers') DeptIcon = Layers;
                    else if (dept.id === 'view_records') DeptIcon = Database;
                    else if (dept.id === 'reports') DeptIcon = TrendingUp;
                    else if (dept.id === 'banking') DeptIcon = Landmark;
                    else if (dept.id === 'daybook_dept') DeptIcon = BookOpen;
                    else if (dept.id === 'expenses' || dept.id === 'expenses_dept') DeptIcon = Coins;
                    else if (dept.id === 'procurement') DeptIcon = ShoppingCart;
                    else if (dept.id === 'logistics') DeptIcon = Truck;
                    else if (dept.id === 'hr') DeptIcon = Clock;

                    const displayLabel = dept.id === 'vouchers'
                      ? 'VOUCHER'
                      : dept.id === 'view_records'
                      ? 'RECORDS'
                      : dept.id === 'daybook_dept'
                      ? 'DAYBOOK'
                      : dept.label.replace('VOUCHER RECORDS', 'RECORDS').replace('DAY BOOK', 'DAYBOOK');

                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => {
                          setSelectedDeptId(dept.id);
                          setIsSidebarNavActive(true);
                          setSidebarFocusedPane('departments');
                          setFocusedItemIndex(0);
                        }}
                        className={`w-full py-3 px-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer text-center relative rounded-md ${
                          isSelected
                            ? 'bg-[#0a4841] text-white font-bold shadow-2xs'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        } ${isDeptFocused ? 'ring-2 ring-[#FF6B00] ring-offset-1 ring-offset-[#063b36]' : ''}`}
                      >
                        <DeptIcon className={`w-4.5 h-4.5 ${isSelected ? 'text-[#FF6B00]' : 'text-slate-300'}`} />
                        <span className="text-[8px] uppercase font-bold tracking-wider leading-tight max-w-full truncate px-0.5 block">
                          {displayLabel}
                        </span>
                        {isSelected && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FF6B00] rounded-r-md" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom status */}
              <div className="px-1.5 pt-2 text-center border-t border-[#052e2a]">
                <span className="text-[7px] text-emerald-200/60 font-mono font-bold uppercase tracking-wider block">
                  SYSTEM ONLINE
                </span>
                <span className="text-[6.5px] text-emerald-400 font-bold tracking-widest block animate-pulse">
                  • LIVE DB
                </span>
              </div>
            </div>

            {/* COLUMN B: Detailed Submenu Actions (Flex-1, list of items in active department) */}
            <div ref={sidebarItemsContainerRef} className="flex-1 bg-[#FAFBFD] p-3 flex flex-col h-full overflow-y-auto max-h-[82vh] justify-start space-y-3 custom-sidebar-scrollbar relative">
              {(() => {
                const currentDept = departments.find(d => d.id === selectedDeptId);
                if (!currentDept) return (
                  <div className="text-center py-8 text-slate-400 font-bold text-[9px] uppercase">
                    Select a category
                  </div>
                );

                const filteredItems = currentDept.items.filter(it => !it.requiresEdit || canEdit);

                return (
                  <div className="space-y-3.5 h-full flex flex-col justify-start">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                        <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>{currentDept.label}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                          {isSidebarNavActive ? (
                            <span className="px-1.5 py-0.2 bg-[#f37021] text-white text-[7px] font-bold rounded uppercase tracking-wider animate-pulse">
                              NAV ACTIVE (ESC to lock)
                            </span>
                          ) : (
                            <span className="text-[7.5px] text-slate-400 font-semibold tracking-tight normal-case">
                              [ESC to navigate]
                            </span>
                          )}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsSidebarCollapsed(true)}
                          className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-slate-300 transition-all cursor-pointer"
                          title="Hide / Collapse Sidebar Menu"
                        >
                          <PanelLeftClose className="w-3.5 h-3.5 text-slate-600" />
                          <span>HIDE</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {filteredItems.map((item, itemIdx) => {
                          const isTabActive = activeTab === item.id;
                          const isKeyboardFocused = isSidebarNavActive && sidebarFocusedPane === 'items' && itemIdx === focusedItemIndex;
                          const ItemIcon = item.icon;

                          return (
                            <button
                              key={item.id}
                              data-item-index={itemIdx}
                              type="button"
                              onClick={() => {
                                setIsSidebarNavActive(false);
                                setSidebarFocusedPane('items');
                                setFocusedItemIndex(itemIdx);
                                setActiveTab(item.id);
                                triggerToast(`Loaded: ${item.label}`);
                              }}
                              onDoubleClick={() => {
                                if (selectedDeptId === 'vouchers') {
                                  setActiveTab(defaultTab);
                                  setQtnPreFillCustomer(null);
                                  setInvPreFillCustomer(null);
                                  setPlPreFillCustomer(null);
                                  setActiveClient('');
                                  triggerToast(`Closed form and cleared active workspace details`);
                                }
                              }}
                              className={`w-full text-left p-2.5 border uppercase flex items-center justify-between transition-all duration-150 cursor-pointer rounded-lg group/sidebar-item relative ${
                                isKeyboardFocused
                                  ? 'bg-[#063b36]/15 border-[#063b36] text-[#063b36] font-black ring-2 ring-[#FF6B00] ring-offset-1 shadow-sm'
                                  : isTabActive
                                  ? 'bg-[#063b36]/10 border-[#063b36]/30 text-[#063b36] font-bold'
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${isKeyboardFocused || isTabActive ? 'text-[#063b36]' : 'text-slate-400 group-hover/sidebar-item:text-[#063b36]'}`} />
                                <span className="text-[9.5px] font-semibold leading-tight block text-left break-words">
                                  {item.label}
                                </span>
                              </div>
                              <span className={`text-[8.5px] transition-all duration-100 ${
                                isKeyboardFocused || isTabActive ? 'text-[#063b36] translate-x-0.5 opacity-100 font-black' : 'text-slate-400 opacity-0 group-hover/sidebar-item:opacity-100'
                              }`}>
                                ➔
                              </span>
                            </button>
                          );
                        })}
                        {filteredItems.length === 0 && (
                          <div className="text-center py-6 text-slate-400 font-bold uppercase text-[9px]">
                            No actions available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center py-3 px-1.5 bg-[#063b36] text-white rounded-xl no-print select-none shadow-xs min-h-[580px] h-fit shrink-0 gap-3 border border-[#052e2a]">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 bg-[#f37021] hover:bg-orange-600 text-white rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center"
              title="Expand Sidebar Navigation Menu"
            >
              <PanelLeftOpen className="w-4 h-4 text-white" />
            </button>
            <div className="text-[9px] font-mono font-bold tracking-widest text-slate-300 uppercase py-2 writing-vertical flex items-center justify-center">
              MENU
            </div>
          </div>
        )}

        {/* Right workspace content block (Width: flex-1) */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Quick sidebar expand bar if collapsed */}
          {isSidebarCollapsed && (
            <div className="no-print flex items-center justify-between bg-slate-900 text-white px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-2xs font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="bg-[#f37021] hover:bg-orange-600 text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <PanelLeftOpen className="w-3.5 h-3.5" />
                  <span>SHOW SIDEBAR MENU</span>
                </button>
                <span className="text-slate-400 font-semibold uppercase">
                  FULL CANVAS MODE ACTIVE
                </span>
              </div>
              <span className="text-[#f37021] font-bold uppercase">
                {activeTab.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          {currentUser && !canEdit && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 shadow-3xs select-none">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-605 text-amber-600 shrink-0" />
                <div>
                  <span className="block text-xs font-bold uppercase text-amber-900 tracking-wider font-mono">
                    READ-ONLY VIEW CLEARANCE • LIMITATION ENABLED
                  </span>
                  <p className="text-[10px] text-amber-700 font-medium">
                    You are joined as a <strong>{currentUser.role.toUpperCase()}</strong>. Creating new records, modifying pending requisitions, or deleting logs is blocked.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* RENDER THE CORRESPONDING ERP VIEWS */}
          {activeTab === 'blank' && (
            <div className="space-y-6">
              {/* 6 Category Bento Grid matching the Focus ERP screenshots perfectly */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => {
                  return (
                    <div 
                      key={dept.id} 
                      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-sm transition-all duration-150"
                    >
                      {/* Department header banner */}
                      <div className="bg-slate-50 text-slate-800 px-4 py-3 border-b border-slate-150 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider font-sans">
                          {dept.label}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></div>
                      </div>

                      {/* List of actions inside department */}
                      <div className="p-3.5 flex-1 flex flex-col gap-1.5 bg-white">
                        {dept.items.map((item) => {
                          const IconComp = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(item.id);
                              }}
                              onDoubleClick={() => {
                                if (dept.id === 'vouchers') {
                                  setActiveTab(defaultTab);
                                  setQtnPreFillCustomer(null);
                                  setInvPreFillCustomer(null);
                                  setPlPreFillCustomer(null);
                                  setActiveClient('');
                                  triggerToast(`Closed form and cleared active workspace details`);
                                }
                              }}
                              className="w-full text-left p-2.5 bg-white border border-slate-100 hover:border-[#063b36]/30 text-[10.5px] font-semibold text-slate-700 hover:text-[#063b36] uppercase flex items-center justify-between transition-all duration-150 cursor-pointer hover:bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <IconComp className="w-3.5 h-3.5 text-slate-400" />
                                <span>{item.label}</span>
                              </div>
                              <span className="text-[9px] text-[#f37021]">➔</span>
                            </button>
                          );
                        })}
                        {dept.items.length === 0 && (
                          <div className="text-center py-6 text-slate-400 font-bold uppercase text-[9px]">
                            No documents active
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <HomeView currentUser={currentUser} onNavigate={setActiveTab} />
          )}

          {activeTab === 'customer' && <ErpCustomerView activeMode="list" onSelectAction={handleCustomerSelectionAction} />}
          {activeTab === 'for_invoice_cust' && <ErpCustomerView activeMode="for_invoice" onSelectAction={handleCustomerSelectionAction} />}
          {activeTab === 'for_pl_cust' && <ErpCustomerView activeMode="for_pl" onSelectAction={handleCustomerSelectionAction} />}

          {activeTab === 'quotation' && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="editor"
              initialDocumentType="DELIVERY NOTE"
              initialPreFilledCustomer={qtnPreFillCustomer}
              onClearPreFill={() => setQtnPreFillCustomer(null)}
            />
          )}
          {(activeTab === 'quotations_record' || activeTab === 'delivery_notes_record' || activeTab === 'delivery_note_records' || activeTab === 'delivery_notes_records') && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="record"
              initialDocumentType="DELIVERY NOTE"
              initialMonth={selectedQtnMonth}
            />
          )}

          {activeTab === 'invoice' && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="editor"
              initialDocumentType="TAX INVOICE"
              initialPreFilledCustomer={invPreFillCustomer}
              onClearPreFill={() => setInvPreFillCustomer(null)}
            />
          )}
          {(activeTab === 'invoice_record' || activeTab === 'invoice_records' || activeTab === 'tax_invoice_records' || activeTab === 'tax_invoice_record') && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="record"
              initialDocumentType="TAX INVOICE"
              initialMonth={selectedInvoiceMonth}
            />
          )}
          {(activeTab === 'proforma_record' || activeTab === 'proforma_records' || activeTab === 'proforma_invoice_records' || activeTab === 'proforma_invoice_record') && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="record"
              initialDocumentType="PROFORMA INVOICE"
              initialMonth={selectedInvoiceMonth}
            />
          )}

          {activeTab === 'work_orders_suite' && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="editor"
              initialDocumentType="WORK ORDER"
              initialPreFilledCustomer={null}
              onClearPreFill={() => {}}
            />
          )}
          {(activeTab === 'work_orders_records' || activeTab === 'work_order_records' || activeTab === 'work_orders_record') && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="record"
              initialDocumentType="WORK ORDER"
            />
          )}

          {activeTab === 'sales_commission' && <ErpCommissionView />}
          {activeTab === 'sales_commission_record' && <ErpCommissionView />}

          {activeTab === 'packing_list' && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="editor"
              initialDocumentType="PACKING LIST"
              initialPreFilledCustomer={plPreFillCustomer}
              onClearPreFill={() => setPlPreFillCustomer(null)}
            />
          )}
          {(activeTab === 'packing_list_record' || activeTab === 'packing_list_records' || activeTab === 'packing_lists_records') && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="record"
              initialDocumentType="PACKING LIST"
            />
          )}

          {activeTab === 'statement' && <StatementComponent />}
          {activeTab === 'receipt' && (
            <ModernReceiptComponent
              receiptRegisters={receiptRegisters}
              setReceiptRegisters={setReceiptRegisters}
              activeReceiptId={activeReceiptId}
              setActiveReceiptId={setActiveReceiptId}
              clientDatabase={clientDatabase}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              initialCategory="RECEIVABLES"
            />
          )}
          {activeTab === 'payment' && (
            <ModernReceiptComponent
              receiptRegisters={receiptRegisters}
              setReceiptRegisters={setReceiptRegisters}
              activeReceiptId={activeReceiptId}
              setActiveReceiptId={setActiveReceiptId}
              clientDatabase={clientDatabase}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              initialCategory="PAYABLES"
            />
          )}
          {activeTab === 'receipt_record' && (
            <ReceiptRecordsComponent
              receiptRegisters={receiptRegisters}
              setReceiptRegisters={setReceiptRegisters}
              setActiveReceiptId={setActiveReceiptId}
              setActiveTab={setActiveTab}
              triggerToast={triggerToast}
            />
          )}
          {activeTab === 'credit_note' && (
            <CreditNoteComponent
              creditNotes={creditNotes}
              setCreditNotes={setCreditNotes}
              activeCnId={activeCnId}
              setActiveCnId={setActiveCnId}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              clientDatabase={clientDatabase}
            />
          )}
          {activeTab === 'debit_note' && (
            <CreditNoteComponent
              creditNotes={creditNotes}
              setCreditNotes={setCreditNotes}
              activeCnId={activeCnId}
              setActiveCnId={setActiveCnId}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              clientDatabase={clientDatabase}
              initialNoteType="DEBIT"
            />
          )}
          {activeTab === 'credit_note_record' && (
            <CreditNoteRecordsComponent
              creditNotes={creditNotes}
              setCreditNotes={setCreditNotes}
              setActiveCnId={setActiveCnId}
              setActiveTab={setActiveTab}
              triggerToast={triggerToast}
              initialTypeFilter="CREDIT"
            />
          )}
          {activeTab === 'debit_note_record' && (
            <CreditNoteRecordsComponent
              creditNotes={creditNotes}
              setCreditNotes={setCreditNotes}
              setActiveCnId={setActiveCnId}
              setActiveTab={setActiveTab}
              triggerToast={triggerToast}
              initialTypeFilter="DEBIT"
            />
          )}
          {activeTab === 'purchase' && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="editor"
              initialDocumentType="PURCHASE REQUEST"
              onBackToHome={() => {
                if (onNavigate) {
                  onNavigate('home');
                } else {
                  setActiveTab('home');
                }
              }}
            />
          )}
          {activeTab === 'record_sheet' && <RecordSheetComponent />}
          {(activeTab === 'financial_vouchers' || activeTab === 'contra' || activeTab === 'contra_record' || activeTab === 'journal' || activeTab === 'journal_record') && (
            <FinancialVouchers
              clientDatabase={clientDatabase}
              triggerToast={triggerToast}
              initialTypeFilter={
                (activeTab === 'contra' || activeTab === 'contra_record') ? 'CONTRA' :
                (activeTab === 'journal' || activeTab === 'journal_record') ? 'JOURNAL' : 'ALL'
              }
              showOnlyRecords={activeTab === 'contra_record' || activeTab === 'journal_record'}
            />
          )}
          {activeTab === 'expenses_view' && <ExpenseComponent />}

          {activeTab === 'purchase_req_record' && (
            <InvoiceDeliveryNoteForm
              initialActiveSubTab="record"
              initialDocumentType="PURCHASE REQUEST"
              onBackToHome={() => {
                if (onNavigate) {
                  onNavigate('home');
                } else {
                  setActiveTab('home');
                }
              }}
            />
          )}

          {activeTab === 'incoming_materials' && <IncomingMaterialsComponent />}
          {activeTab === 'goods_dispatched_notes' && <DispatchedMaterialsComponent initialActiveSubTab="editor" />}
          {activeTab === 'incoming_materials_payments_update' && <IncomingPaymentsUpdateComponent />}
          {activeTab === 'outgoing_materials_payments_update' && <OutgoingPaymentsUpdateComponent />}
          {activeTab === 'transporter_payments' && <TransporterPaymentsView />}
          {activeTab === 'machineries_list' && <MachineriesListComponent triggerToast={triggerToast} />}
          {activeTab === 'tools_list' && <ToolsListComponent triggerToast={triggerToast} />}
          {activeTab === 'packaging_materials' && <PackagingMaterialsComponent triggerToast={triggerToast} />}
          {activeTab === 'punching_stamp_lists' && <PunchingStampListComponent triggerToast={triggerToast} />}
          {activeTab === 'coating_accessories' && <CoatingAccessoriesComponent triggerToast={triggerToast} />}
          {activeTab === 'data_sheets' && <DataSheetsComponent triggerToast={triggerToast} />}
          {activeTab === 'drawings_register' && <EngineeringDrawingsComponent triggerToast={triggerToast} />}
          {activeTab === 'qc_reports' && <QcReportsComponent />}
          {activeTab === 'customer_order_commission' && <CustomerOrderCommissionView activeSubView="editor" />}
          {activeTab === 'customer_order_commission_records' && <CustomerOrderCommissionView activeSubView="records" />}
          {activeTab === 'customer_soa' && <CustomerSoaComponent />}
          {(activeTab === 'bank_accounts_box' || activeTab === 'bank_account_box') && (
            <BankAccountBox triggerToast={triggerToast} onNavigateToContra={() => setActiveTab('contra')} />
          )}
          
          {activeTab === 'supplier_purchase' && (
            <SupplierPurchaseManager activeSubView="form" triggerToast={triggerToast} />
          )}
          {(activeTab === 'supplier_purchase_records' || activeTab === 'purchase_records' || activeTab === 'purchase_record' || activeTab === 'purchases_records') && (
            <SupplierPurchaseManager activeSubView="records" triggerToast={triggerToast} />
          )}
          {activeTab === 'vat_reports' && (
            <SupplierPurchaseManager activeSubView="vat" triggerToast={triggerToast} />
          )}
          {activeTab === 'balance_sheet' && (
            <FinancialReportsHub triggerToast={triggerToast} defaultTab="balance_sheet" currentUser={currentUser} />
          )}
          {activeTab === 'profit_loss' && (
            <FinancialReportsHub triggerToast={triggerToast} defaultTab="profit_loss" currentUser={currentUser} />
          )}
          {activeTab === 'ratio_analysis' && (
            <FinancialReportsHub triggerToast={triggerToast} defaultTab="ratio_analysis" currentUser={currentUser} />
          )}
          {activeTab === 'aging_statements' && (
            <FinancialReportsHub triggerToast={triggerToast} defaultTab="receivables_payables" currentUser={currentUser} />
          )}
          {activeTab === 'final_accounts' && (
            <FinancialReportsHub triggerToast={triggerToast} defaultTab="final_accounts" currentUser={currentUser} />
          )}
          {activeTab === 'seller_performance' && (
            <FinancialReportsHub triggerToast={triggerToast} defaultTab="seller_performance" currentUser={currentUser} />
          )}
          {activeTab === 'uae_vat_returns' && (
            <UaeVat201ManagerComponent triggerToast={triggerToast} currentUser={currentUser} />
          )}
          {activeTab === 'payroll_reports' && (
            <PayrollReportsComponent />
          )}
          {activeTab === 'sales_report' && (
            <SalesReportView triggerToast={triggerToast} setActiveTab={setActiveTab} currentUser={currentUser} />
          )}
          {activeTab === 'purchase_report' && (
            <PurchaseReportView triggerToast={triggerToast} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'stock_reports' && (
            <StockReportsView triggerToast={triggerToast} />
          )}
          {activeTab === 'particulars_ledger' && (
            <ParticularsLedgerComponent />
          )}
          {activeTab === 'daybook' && (
            <DaybookComponent />
          )}

        </div>

      </div>

    </motion.div>
  );
}
