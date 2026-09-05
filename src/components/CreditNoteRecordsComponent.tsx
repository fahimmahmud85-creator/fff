import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, Eye, Printer, FileCheck, Edit } from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getCompanyProfile } from '../utils/companyProfile';
import { RecordsFooterShortcutsBar } from './RecordsFooterShortcutsBar';

interface CreditNoteItem {
  sn: number;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  per: string;
  amount: number;
  vatRate: number;
  taxableValue: number;
  taxAmount: number;
}

interface CreditNote {
  id: string;
  creditNoteNo: string;
  dated: string;
  reasonForIssue: string;
  buyersRef: string;
  otherRef: string;
  issuerName: string;
  issuerAddress: string;
  issuerTRN: string;
  issuerEmirate: string;
  partyName: string;
  partyAddress: string;
  partyEmirate: string;
  partyCountry: string;
  partyTRN: string;
  placeOfSupply: string;
  items: CreditNoteItem[];
  noteType?: 'CREDIT' | 'DEBIT';
}

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
    return str;
  };

  const wholePart = Math.floor(num);
  const decimalPart = Math.round((num - wholePart) * 100);

  let result = 'UAE Dirhams ';

  if (wholePart > 0) {
    let temp = wholePart;
    let scaleIndex = 0;
    while (temp > 0) {
      const section = temp % 1000;
      if (section > 0) {
        result += convertSection(section) + (scales[scaleIndex] ? scales[scaleIndex] + ' ' : '') + ' ';
      }
      temp = Math.floor(temp / 1000);
      scaleIndex++;
    }
  } else {
    result += 'Zero ';
  }

  if (decimalPart > 0) {
    result += 'and ' + convertSection(decimalPart) + ' Fils ';
  }

  result += 'Only';
  return result.replace(/\s+/g, ' ');
};

const handlePrintCreditNote = (cnToPrint: CreditNote) => {
  const profile = getCompanyProfile();
  const isOldAddress = !cnToPrint.issuerAddress || cnToPrint.issuerAddress.includes('AL BATEEN');
  const isOldTRN = !cnToPrint.issuerTRN || cnToPrint.issuerTRN === '100334455600003' || cnToPrint.issuerTRN === '100412856300003';

  const printIssuerName = cnToPrint.issuerName || profile.name || 'Marine Fasteners Industries L.L.C. (Sole Proprietorship)';
  const printIssuerAddress = isOldAddress ? (profile.address || 'Industrial, Area, Ajman, UAE') : cnToPrint.issuerAddress;
  const printIssuerTRN = isOldTRN ? (profile.trn || '100440509600003') : cnToPrint.issuerTRN;

  // Helper to check if row has actual typed content
  const hasRealData = (item: CreditNoteItem) => {
    if (!item) return false;
    const cleanDesc = (item.description || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const amount = Number(item.amount) || 0;
    return cleanDesc.length > 0 || qty > 0 || rate > 0 || amount > 0;
  };

  const printableItems = cnToPrint.items.filter(hasRealData);
  const itemsToRender = printableItems;
  const ITEMS_PER_PAGE = 18;
  const totalPages = Math.max(1, Math.ceil(itemsToRender.length / ITEMS_PER_PAGE));

  let printTotalQty = 0;
  let printTotalTaxableValue = 0;
  let printTotalTaxAmt = 0;

  itemsToRender.forEach(item => {
    printTotalQty += (Number(item.qty) || 0);
    printTotalTaxableValue += (Number(item.taxableValue) || 0);
    printTotalTaxAmt += (Number(item.taxAmount) || 0);
  });

  const printGrandTotal = printTotalTaxableValue + printTotalTaxAmt;
  const amountWords = numberToWordsAED(printGrandTotal);
  const taxAmountWords = numberToWordsAED(printTotalTaxAmt);

  const pagesHtml = Array.from({ length: totalPages }).map((_, pageIdx) => {
    const pageNum = pageIdx + 1;
    const isLastPage = pageNum === totalPages;
    const pageItems = itemsToRender.slice(pageIdx * ITEMS_PER_PAGE, (pageIdx + 1) * ITEMS_PER_PAGE);

    const tableRows = pageItems.map((item, idx) => {
      const itemSN = pageIdx * ITEMS_PER_PAGE + idx + 1;
      const vatVal = (item.vatRate != null && String(item.vatRate) !== '' && item.vatRate !== 0) ? `${item.vatRate}%` : (item.vatRate === 0 ? '0%' : '');
      return `
        <tr>
          <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 8.5px; white-space: nowrap;">${itemSN}</td>
          <td style="border: 1px solid #000; padding: 4px; font-size: 8.5px; font-weight: bold; text-transform: uppercase;">${item.description || ''}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 8.5px; white-space: nowrap;">${item.qty ? item.qty : ''}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 8.5px; white-space: nowrap;">${item.unit || ''}</td>
          <td style="text-align: right; border: 1px solid #000; padding: 4px; font-size: 8.5px; white-space: nowrap;">${item.rate ? (item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 8.5px; white-space: nowrap;">${item.per || ''}</td>
          <td style="text-align: right; border: 1px solid #000; padding: 4px; font-size: 8.5px; white-space: nowrap;">${item.amount ? (item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</td>
          <td style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 8.5px; white-space: nowrap;">${vatVal}</td>
          <td style="text-align: right; border: 1px solid #000; padding: 4px; font-size: 8.5px; font-weight: bold; white-space: nowrap;">${(item.taxableValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; border: 1px solid #000; padding: 4px; font-size: 8.5px; font-weight: bold; color: #000; white-space: nowrap;">${(item.taxAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td style="text-align: right; border: 1px solid #000; padding: 4px; font-size: 8.5px; font-weight: bold; color: #000; white-space: nowrap;">${((item.taxableValue || 0) + (item.taxAmount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="print-page" style="${pageIdx > 0 ? 'page-break-before: always; break-before: page; margin-top: 38mm; padding-top: 10mm;' : ''}">
        <!-- Title Bar -->
        <div style="display: flex; align-items: center; width: 100%; margin: 6px 0 4px 0;">
          <div style="flex: 1; border-top: 3px double #000; margin-right: 12px;"></div>
          <span style="font-size: 13.5px; font-weight: bold; font-style: italic; color: #000; white-space: nowrap; padding: 0 4px; text-transform: uppercase;">
            ${cnToPrint.noteType === 'DEBIT' ? 'Tax Debit Note' : 'Tax Credit Note'}
          </span>
          <div style="width: 75px; border-top: 3px double #000; margin-left: 12px;"></div>
        </div>

        <!-- Meta Container -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 4px; font-size: 8.5px; text-align: left;">
          <tr>
            <td style="width: 53%; vertical-align: top; padding: 4px 6px; border-right: 1px solid #000;">
              <div style="font-size: 8.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px;">
                SUPPLIER / EXPORTER:
              </div>
              <div style="font-size: 11px; font-weight: 900; color: #000; margin-bottom: 2px;">
                ${printIssuerName}
              </div>
              ${printIssuerAddress}<br/>
              <b>VAT TRN:</b> ${printIssuerTRN}
              <hr style="margin: 3px 0; border: 0; border-top: 1px solid #000;"/>
              <div style="font-size: 8.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px;">
                PARTY / BUYER:
              </div>
              <div style="font-size: 11px; font-weight: 900; color: #000; margin-bottom: 2px;">
                M/s. ${cnToPrint.partyName || 'CASH CUSTOMER'}
              </div>
              Address: ${(cnToPrint.partyAddress || '—').replace(/\n/g, '<br/>')}<br/>
              TRN: ${cnToPrint.partyTRN || '—'} | Emirate: ${cnToPrint.partyEmirate || '—'}
            </td>
            <td style="width: 47%; vertical-align: top; padding: 4px 6px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 8.5px;">
                <tr><td style="width: 45%; font-weight: bold;">DATE:</td><td><b>${cnToPrint.dated || '—'}</b></td></tr>
                <tr><td style="font-weight: bold;">${cnToPrint.noteType === 'DEBIT' ? 'DEBIT NOTE NO:' : 'CREDIT NOTE NO:'}</td><td><b>${cnToPrint.creditNoteNo}</b></td></tr>
                ${cnToPrint.buyersRef ? `<tr><td style="font-weight: bold;">Buyer's Ref / Order:</td><td><b>${cnToPrint.buyersRef}</b></td></tr>` : ''}
                ${cnToPrint.otherRef ? `<tr><td style="font-weight: bold;">Other Ref:</td><td>${cnToPrint.otherRef}</td></tr>` : ''}
                <tr><td colspan="2"><hr style="margin: 2px 0; border: 0; border-top: 1px solid #000;"/></td></tr>
                <tr><td style="font-weight: bold;">Reason for Issue:</td><td>${cnToPrint.reasonForIssue || '—'}</td></tr>
                <tr><td style="font-weight: bold;">Place of Supply:</td><td><b>${cnToPrint.placeOfSupply || 'AJMAN, UAE'}</b></td></tr>
                <tr><td style="font-weight: bold;">Page No:</td><td><b>Page ${pageNum} of ${totalPages}</b></td></tr>
              </table>
            </td>
          </tr>
        </table>
        <div style="height: 6px;"></div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 8.5px;">
          <thead>
            <tr style="background-color: #d9d9d9; font-weight: bold; color: #000;">
              <th style="border: 1px solid #000; padding: 4px; text-align: center; width: 28px; white-space: nowrap;">S.N.</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: left; width: 40%; min-width: 280px;">DESCRIPTION OF GOODS / SERVICES</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: center; white-space: nowrap;">QTY</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: center; white-space: nowrap;">UNIT</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: right; white-space: nowrap;">RATE</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: center; white-space: nowrap;">PER</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: right; white-space: nowrap;">AMOUNT</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: center; white-space: nowrap;">VAT %</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: right; white-space: nowrap;">TAXABLE<br/>VALUE</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: right; white-space: nowrap;">TAX AMT</th>
              <th style="border: 1px solid #000; padding: 4px; text-align: right; white-space: nowrap;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
            ${pageItems.length === 0 ? `
              <tr>
                <td colSpan="11" style="text-align: center; border: 1px solid #000; padding: 8px; font-weight: bold;">No items entered</td>
              </tr>
            ` : ''}
            ${isLastPage ? `
              <tr style="background-color: #d9d9d9; font-weight: bold; color: #000;">
                <td colspan="2" style="text-align: right; border: 1px solid #000; padding: 4px;">TOTAL / CUMULATIVE SUMMARY</td>
                <td style="text-align: center; border: 1px solid #000; padding: 4px; white-space: nowrap;">${printTotalQty}</td>
                <td colspan="3" style="border: 1px solid #000; padding: 4px;"></td>
                <td style="text-align: right; border: 1px solid #000; padding: 4px; white-space: nowrap;">${printTotalTaxableValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="text-align: right; border: 1px solid #000; padding: 4px; white-space: nowrap;">${printTotalTaxableValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right; border: 1px solid #000; padding: 4px; color: #000; white-space: nowrap;">${printTotalTaxAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right; border: 1px solid #000; padding: 4px; color: #000; white-space: nowrap;">${printGrandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            ` : ''}
          </tbody>
        </table>

        ${isLastPage ? `
          <!-- Summary Footer Block -->
          <table style="width: 100%; border-collapse: collapse; font-size: 8.5px; margin-bottom: 6px;">
            <tr>
              <td style="width: 58%; vertical-align: top; padding-right: 6px;">
                <div style="border: 1px solid #000; padding: 6px; line-height: 1.4;">
                  <div style="font-weight: bold; text-transform: uppercase; font-size: 8px; color: #000;">Amount Chargeable in Words:</div>
                  <div style="font-size: 10px; font-weight: bold; color: #000; text-transform: uppercase; margin-bottom: 6px;">${amountWords}</div>
                  <div style="border-top: 1px solid #000; padding-top: 4px; margin-top: 4px;">
                    <div style="font-weight: bold; text-transform: uppercase; font-size: 8px; color: #000;">VAT Amount in Words:</div>
                    <div style="font-size: 9px; font-weight: bold; color: #000; text-transform: uppercase;">${taxAmountWords}</div>
                  </div>
                </div>
              </td>
              <td style="width: 42%; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse; font-size: 8.5px;">
                  <tr><td style="border: 1px solid #000; padding: 3px; font-weight: bold;">TOTAL TAXABLE VALUE:</td><td style="border: 1px solid #000; padding: 3px; text-align: right; font-weight: bold;">${printTotalTaxableValue.toFixed(2)}</td></tr>
                  <tr><td style="border: 1px solid #000; padding: 3px;">TOTAL VAT AMOUNT:</td><td style="border: 1px solid #000; padding: 3px; text-align: right; color: #000; font-weight: bold;">${printTotalTaxAmt.toFixed(2)}</td></tr>
                  <tr style="background-color: #f2f2f2;"><td style="border: 1px solid #000; padding: 4px; font-weight: bold;">NET PAYABLE TOTAL:</td><td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold; color: #000; font-size: 9.5px;">${printGrandTotal.toFixed(2)}</td></tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Signatures Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 8.5px; table-layout: fixed; margin-top: 50px;">
            <tr>
              <td style="width: 50%; border: 1px solid #000; padding: 8px; vertical-align: top;">
                <b style="text-transform: uppercase;">For Buyer / Customer</b><br/><br/><br/><br/><br/><br/><br/><br/>
                <div style="border-top: 1.5px solid #000; margin-top: 65px; text-align: center; font-size: 8.5px; font-weight: bold; text-transform: uppercase; padding-top: 4px;">Buyer's Seal & Signature</div>
              </td>
              <td style="width: 50%; border: 1px solid #000; padding: 8px; vertical-align: top; text-align: right;">
                <b style="text-transform: uppercase;">For ${printIssuerName}</b><br/><br/><br/><br/><br/><br/><br/><br/>
                <div style="border-top: 1.5px solid #000; margin-top: 65px; text-align: center; font-size: 8.5px; font-weight: bold; text-transform: uppercase; padding-top: 4px;">Authorized Signatory</div>
              </td>
            </tr>
          </table>
        ` : ''}
      </div>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cnToPrint.noteType === 'DEBIT' ? `${cnToPrint.creditNoteNo || 'DN'}-DN-${(cnToPrint.partyName || printIssuerName || '').trim().replace(/[/\\?%*:|"<>]/g, '')}` : `${cnToPrint.creditNoteNo || 'CN'}-CN-${(cnToPrint.partyName || printIssuerName || '').trim().replace(/[/\\?%*:|"<>]/g, '')}`}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: "Arial MT", "Arial", sans-serif; padding: 8mm; font-size: 8.5px; color: #000000; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        b, strong, th, h1, h2, h3, h4, .font-bold { font-family: "Arial MT Bold", "Arial Bold", "Arial MT", "Arial", sans-serif; font-weight: bold; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        .print-page + .print-page { page-break-before: always !important; break-before: page !important; margin-top: 25mm !important; padding-top: 5mm !important; }
        @media print {
          @page { size: A4 portrait; margin: 0 !important; }
          body { padding: 8mm !important; }
          .print-page + .print-page { page-break-before: always !important; break-before: page !important; margin-top: 25mm !important; padding-top: 5mm !important; }
        }
      </style>
    </head>
    <body>
      ${pagesHtml}
    </body>
    </html>
  `;

  printHtml(htmlContent, `${cnToPrint.noteType === 'DEBIT' ? 'TAX_DEBIT_NOTE' : 'TAX_CREDIT_NOTE'}_${cnToPrint.creditNoteNo}`);
};

interface CreditNoteRecordsProps {
  creditNotes: CreditNote[];
  setCreditNotes: (notes: CreditNote[]) => void;
  setActiveCnId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  triggerToast: (msg: string) => void;
  initialTypeFilter?: 'ALL' | 'CREDIT' | 'DEBIT';
}

export const CreditNoteRecordsComponent: React.FC<CreditNoteRecordsProps> = ({
  creditNotes,
  setCreditNotes,
  setActiveCnId,
  setActiveTab,
  triggerToast,
  initialTypeFilter = 'ALL'
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>(initialTypeFilter);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [hiddenCnIds, setHiddenCnIds] = useState<string[]>([]);

  useEffect(() => {
    setTypeFilter(initialTypeFilter);
  }, [initialTypeFilter]);

  const filteredCns = useMemo(() => {
    return creditNotes.filter(cn => {
      if (hiddenCnIds.includes(cn.id)) return false;
      const matchesSearch = `${cn.creditNoteNo} ${cn.partyName} ${cn.reasonForIssue} ${cn.buyersRef} ${cn.otherRef}`.toUpperCase()
        .includes(search.toUpperCase());
      const cnType = cn.noteType || 'CREDIT';
      const matchesType = typeFilter === 'ALL' || cnType === typeFilter;

      // Date filtering
      if (fromDate || toDate) {
        const cnDate = cn.dated || '';
        if (cnDate) {
          if (fromDate && cnDate < fromDate) return false;
          if (toDate && cnDate > toDate) return false;
        }
      }

      return matchesSearch && matchesType;
    });
  }, [creditNotes, search, typeFilter, fromDate, toDate, hiddenCnIds]);

  const handleDeleteCn = (id: string, creditNoteNo: string) => {
    if (window.confirm(`Are you sure you want to permanently delete Tax Credit Note #${creditNoteNo}? This is non-reversible.`)) {
      const revised = creditNotes.filter(cn => cn.id !== id);
      setCreditNotes(revised);
      localStorage.setItem('MF_CREDIT_NOTES', JSON.stringify(revised));
      triggerToast(`Tax Credit Note #${creditNoteNo} permanently removed from system database.`);
    }
  };

  const handleSelectCn = (id: string) => {
    setActiveCnId(id);
    setActiveTab('credit_note');
    triggerToast(`Loaded Credit Note in live layout editor context.`);
  };

  const getCnValues = (cn: CreditNote) => {
    let taxableTotal = 0;
    let taxTotal = 0;
    if (cn.items && Array.isArray(cn.items)) {
      cn.items.forEach(it => {
        taxableTotal += (it.qty * it.rate);
        taxTotal += ((it.qty * it.rate) * (it.vatRate / 100));
      });
    }
    const grandTotal = taxableTotal + taxTotal;
    return { taxableTotal, taxTotal, grandTotal };
  };

  const handlePrintCreditNotesLedger = () => {
    if (filteredCns.length === 0) {
      triggerToast('No credit/debit notes available in current filter to print.');
      return;
    }
    triggerToast(`Preparing Notes Ledger Printout (${filteredCns.length} records)...`);

    const rowsHtml = filteredCns.map((cn, idx) => {
      const { taxableTotal, taxTotal, grandTotal } = getCnValues(cn);
      const isDebit = cn.noteType === 'DEBIT';

      return `
        <tr style="border-bottom: 1px solid #cbd5e1; height: 26px; font-size: 10px; text-align: center; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #083c54;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: 900; color: ${isDebit ? '#0284c7' : '#e11d48'};">${cn.creditNoteNo}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold;">${isDebit ? 'DEBIT' : 'CREDIT'}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${cn.dated || '—'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding: 4px 8px; font-weight: bold; text-transform: uppercase;">${cn.partyName || 'UNTITLED'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding: 4px 6px; font-size: 9px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cn.reasonForIssue || '—'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace;">AED ${taxableTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace;">AED ${taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace; font-weight: bold; color: #0f172a;">AED ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const totalTaxable = filteredCns.reduce((s, c) => s + getCnValues(c).taxableTotal, 0);
    const totalTax = filteredCns.reduce((s, c) => s + getCnValues(c).taxTotal, 0);
    const totalGrand = filteredCns.reduce((s, c) => s + getCnValues(c).grandTotal, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFI Credit & Debit Notes Ledger Report</title>
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
              <div class="subtitle">CERTIFIED CREDIT & DEBIT NOTES REGISTRY & AUDIT LEDGER</div>
            </div>
            <div style="text-align: right; font-size: 9px; font-family: monospace; font-weight: bold;">
              <div>Records: <strong>${filteredCns.length}</strong></div>
              <div>Period: ${fromDate || 'Start'} to ${toDate || 'Present'}</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%;">SN</th>
                <th style="width: 13%;">NOTE NO</th>
                <th style="width: 8%;">CLASS</th>
                <th style="width: 10%;">DATE</th>
                <th style="width: 25%; text-align: left; padding-left: 8px;">PARTY / CUSTOMER</th>
                <th style="width: 16%; text-align: left; padding-left: 6px;">REASON FOR ISSUE</th>
                <th style="width: 8%; text-align: right; padding-right: 8px;">TAXABLE</th>
                <th style="width: 8%; text-align: right; padding-right: 8px;">VAT</th>
                <th style="width: 8%; text-align: right; padding-right: 8px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align: right; font-weight: 900;">SUMMARY TOTALS (AED):</td>
                <td style="text-align: right; font-family: monospace;">AED ${totalTaxable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="text-align: right; font-family: monospace;">AED ${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="text-align: right; font-family: monospace; color: #083c54;">AED ${totalGrand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <span>OFFICIAL MFI ADJUSTMENT LEDGER EXPORT</span>
            <span>DUBAI, UNITED ARAB EMIRATES</span>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `MFI_Credit_Notes_Ledger_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4 shadow-sm text-black font-mono select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-3 gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-5 h-5 text-rose-500" />
            <h3 className="font-sans text-sm font-bold uppercase text-slate-900 leading-none">
              MFI Certified Tax Credit & Debit Notes Register
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-sans">
            Federal Tax Authority (FTA) compliant database of commercial adjustments: Credit Notes (returns/discounts) and Debit Notes (rate/tax corrections).
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <span className="px-2.5 py-1 bg-rose-700 text-white font-bold border rounded uppercase text-[10px] font-sans">
            Credits: {creditNotes.filter(n => !n.noteType || n.noteType === 'CREDIT').length}
          </span>
          <span className="px-2.5 py-1 bg-sky-700 text-white font-bold border rounded uppercase text-[10px] font-sans">
            Debits: {creditNotes.filter(n => n.noteType === 'DEBIT').length}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 no-print">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by note #, customer / party, issue reason, refs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-350 p-2 pl-8 text-[10.5px] uppercase placeholder:lowercase focus:bg-white outline-none rounded font-bold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1.5 text-[8.5px] font-bold uppercase rounded border transition-all cursor-pointer shadow-3xs ${
              typeFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('CREDIT')}
            className={`px-2.5 py-1.5 text-[8.5px] font-bold uppercase rounded border transition-all cursor-pointer shadow-3xs ${
              typeFilter === 'CREDIT'
                ? 'bg-rose-600 text-white border border-rose-600'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Credits
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('DEBIT')}
            className={`px-2.5 py-1.5 text-[8.5px] font-bold uppercase rounded border transition-all cursor-pointer shadow-3xs ${
              typeFilter === 'DEBIT'
                ? 'bg-sky-600 text-white border border-sky-600'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Debits
          </button>
        </div>
      </div>

      <div className="box-shaped overflow-x-auto">
        <table className="box-shaped-table w-full text-left font-mono text-[10.5px] bg-white">
          <thead>
            <tr>
              <th className="p-2.5 text-[9.5px]">Note No.</th>
              <th className="p-2.5 text-[9.5px]">Class</th>
              <th className="p-2.5 text-[9.5px]">Dated</th>
              <th className="p-2.5 text-[9.5px]">Party / Customer</th>
              <th className="p-2.5 text-[9.5px]">Reason for Issue</th>
              <th className="p-2.5 text-[9.5px] text-right">Taxable (AED)</th>
              <th className="p-2.5 text-[9.5px] text-right">VAT (AED)</th>
              <th className="p-2.5 text-[9.5px] text-right">Total (AED)</th>
              <th className="p-2.5 text-center text-[9.5px] w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCns.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 italic font-mono uppercase">
                  No tax credit or debit notes matching selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredCns.map((cn, idx) => {
                const { taxableTotal, taxTotal, grandTotal } = getCnValues(cn);
                const isDebit = cn.noteType === 'DEBIT';
                const isSelected = selectedRowIndex === idx;
                return (
                  <tr 
                    key={cn.id} 
                    onClick={() => setSelectedRowIndex(idx)}
                    className={`font-bold transition-all text-slate-800 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/80 ring-1 ring-indigo-300 ring-inset' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className={`p-2.5 ${isDebit ? 'text-sky-700' : 'text-rose-600'}`}>{cn.creditNoteNo}</td>
                    <td className="p-2.5">
                      {isDebit ? (
                        <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded font-sans text-[8.5px] font-bold uppercase tracking-wide">DEBIT</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-sans text-[8.5px] font-bold uppercase tracking-wide">CREDIT</span>
                      )}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">{cn.dated}</td>
                    <td className="p-2.5 text-[#1e293b] leading-tight select-all">
                      {cn.partyName ? cn.partyName : 'UNTITLED PARTY'}
                      <span className="block text-[8px] text-slate-400 uppercase tracking-tight max-w-[160px] truncate font-sans font-medium">
                        Ref: {cn.buyersRef || '—'} | Other: {cn.otherRef || '—'}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600 leading-normal max-w-[150px] truncate select-all">{cn.reasonForIssue}</td>
                    <td className="p-2.5 text-right font-semibold select-all">
                      AED {taxableTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-bold text-rose-650 select-all">
                      AED {taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-semibold text-indigo-700 select-all">
                      AED {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSelectCn(cn.id)}
                        title="Edit Note Details"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 font-bold uppercase cursor-pointer rounded-md transition-all flex items-center justify-center shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => handlePrintCreditNote(cn)}
                        title="Preview Note Document"
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 p-1.5 font-bold uppercase cursor-pointer rounded-md transition-all flex items-center justify-center shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePrintCreditNote(cn)}
                        title="Print Document"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 p-1.5 font-bold uppercase cursor-pointer rounded-md transition-all flex items-center justify-center shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCn(cn.id, cn.creditNoteNo)}
                        title="Delete Note"
                        className="bg-slate-105 hover:bg-rose-100 text-red-655 p-1.5 font-bold uppercase cursor-pointer rounded-md border border-slate-300 hover:border-red-300 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
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
          if (filteredCns.length > 0) {
            setSelectedRowIndex(prev => (prev + 1) % filteredCns.length);
          }
        }}
        selectColumnLabel="Select Row"
        onDrillDown={() => {
          const sel = filteredCns[selectedRowIndex];
          if (sel) {
            handlePrintCreditNote(sel);
          }
        }}
        drillDownLabel="Drill Down (View)"
        fromDate={fromDate}
        toDate={toDate}
        onDateRangeChange={(from, to) => {
          setFromDate(from);
          setToDate(to);
        }}
        onRemoveLine={() => {
          if (hiddenCnIds.length > 0) {
            setHiddenCnIds([]);
            triggerToast('All hidden credit/debit note lines restored.');
          } else {
            const sel = filteredCns[selectedRowIndex];
            if (sel) {
              setHiddenCnIds(prev => [...prev, sel.id]);
              triggerToast(`Note ${sel.creditNoteNo} hidden from view (Press U to restore).`);
            }
          }
        }}
        isLineRemoved={hiddenCnIds.length > 0}
        removeLineLabel="Remove Line"
        restoreLineLabel="Restore Line"
        onPrint={handlePrintCreditNotesLedger}
        onExport={() => {
          const csvHeader = 'Note No,Type,Date,Party Name,Reason,Taxable,VAT,Total\n';
          const csvRows = filteredCns.map(cn => {
            const { taxableTotal, taxTotal, grandTotal } = getCnValues(cn);
            return `"${cn.creditNoteNo}","${cn.noteType || 'CREDIT'}","${cn.dated || ''}","${(cn.partyName || '').replace(/"/g, '""')}","${(cn.reasonForIssue || '').replace(/"/g, '""')}",${taxableTotal.toFixed(2)},${taxTotal.toFixed(2)},${grandTotal.toFixed(2)}`;
          }).join('\n');
          const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `MFI_Credit_Debit_Notes_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        totalRecordsCount={filteredCns.length}
      />
    </div>
  );
};
