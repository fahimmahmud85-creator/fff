import { printHtml } from '../PrintHelper';
import { AdvanceReceiptRecord, ReverseChargeRecord, CustomsVatRecord, ReturnTxItem, TaxPaymentRecord, TaxRateMaster, PartyTrnMaster } from '../UaeVat201ManagerComponent';

export const printFormVat201 = (
  company: { name: string; trn?: string; address?: string; phone?: string; ftaGiban?: string },
  periodFrom: string,
  periodTo: string,
  vatCalcs: {
    emirateBreakdown: Record<string, { net: number; vat: number; count: number }>;
    totalStandardSalesNet: number;
    totalStandardSalesVat: number;
    totalPurchasesNet: number;
    totalPurchasesVat: number;
    rcmTaxable: number;
    rcmVat: number;
    customsNet: number;
    customsVat: number;
    totalOutputVat: number;
    totalRecoverableInputVat: number;
    netVatPayable: number;
  }
) => {
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>FORM_VAT201_${company.trn}_${periodTo}</title>
        <style>
          @page { size: A4 portrait; margin: 6mm 8mm 6mm 8mm !important; }
          body { font-family: Arial, "Helvetica Neue", sans-serif; margin: 0; padding: 0; font-size: 8.5px; line-height: 1.35; color: #000; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .hdr { border: 1.5px solid #000; padding: 8px 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
          .hdr-title { font-size: 13px; font-weight: bold; }
          .hdr-sub { font-size: 8px; font-weight: bold; margin-top: 2px; }
          .tp-box { border: 1px solid #000; padding: 6px 10px; margin-bottom: 8px; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 10px; }
          .tp-row { margin-bottom: 2px; display: flex; }
          .tp-lbl { width: 140px; font-weight: bold; }
          .sec-bar { background: #000; color: #fff; font-size: 8.5px; font-weight: bold; padding: 3px 6px; text-transform: uppercase; margin-top: 6px; display: flex; justify-content: space-between; }
          .vat-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          .vat-table th { background: #f0f0f0; color: #000; font-size: 8px; font-weight: bold; text-align: left; padding: 3px 5px; border: 1px solid #000; }
          .vat-table td { padding: 3px 5px; border: 1px solid #000; font-size: 8px; }
          .vat-table tr.total-row td { font-weight: bold; background: #f9f9f9; border-top: 1.5px solid #000; border-bottom: 2.5px double #000; }
          .banner { border: 2px solid #000; padding: 6px 10px; margin-top: 6px; margin-bottom: 6px; text-align: center; }
          .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
          .sig-box { border: 1px solid #000; padding: 4px; height: 42px; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
          .sig-line { border-bottom: 1px solid #000; margin-bottom: 2px; }
        </style>
      </head>
      <body>
        <div class="hdr">
          <div>
            <div class="hdr-title">FORM VAT201 — OFFICIAL UAE TAX RETURN FILING SHEET</div>
            <div class="hdr-sub">STATE OF UNITED ARAB EMIRATES | FEDERAL TAX AUTHORITY (FTA) COMPLIANT</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; border: 1px solid #000; padding: 2px 6px; font-size: 8.5px;">FTA TAX ENGINE READY</div>
            <div style="font-size: 7.5px; margin-top: 2px;">PERIOD: ${periodFrom} TO ${periodTo}</div>
          </div>
        </div>

        <div class="tp-box">
          <div>
            <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px;">1. TAXABLE PERSON DETAILS</div>
            <div class="tp-row"><span class="tp-lbl">Taxable Person Name:</span><span><b>${company.name}</b></span></div>
            <div class="tp-row"><span class="tp-lbl">TRN (Tax Reg No):</span><span><b>${company.trn}</b></span></div>
            <div class="tp-row"><span class="tp-lbl">Registered Address:</span><span>${company.address}</span></div>
            <div class="tp-row"><span class="tp-lbl">FTA GIBAN Reference:</span><span><b>${company.ftaGiban}</b></span></div>
          </div>
          <div>
            <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px;">2. TAX AUDIT SUMMARY</div>
            <div class="tp-row"><span class="tp-lbl">Generated On:</span><span>${printDate} ${printTime}</span></div>
            <div class="tp-row"><span class="tp-lbl">Tax Period Scope:</span><span>All 7 Emirates Consolidated</span></div>
            <div class="tp-row"><span class="tp-lbl">Accounting Currency:</span><span>AED (UAE Dirham)</span></div>
          </div>
        </div>

        <div class="sec-bar">
          <span>SECTION 1: VAT ON SALES AND ALL OTHER OUTPUTS (OUTPUT TAX)</span>
          <span>STANDARD RATE 5%</span>
        </div>
        <table class="vat-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">BOX</th>
              <th>DESCRIPTION OF TAXABLE SUPPLIES (7 EMIRATES)</th>
              <th style="text-align: right; width: 120px;">TAXABLE AMOUNT (AED)</th>
              <th style="text-align: right; width: 110px;">OUTPUT VAT (AED)</th>
              <th style="text-align: center; width: 60px;">RATE</th>
            </tr>
          </thead>
          <tbody>
            ${[
              { box: '1a', em: 'Abu Dhabi' },
              { box: '1b', em: 'Dubai' },
              { box: '1c', em: 'Sharjah' },
              { box: '1d', em: 'Ajman' },
              { box: '1e', em: 'Umm Al Quwain' },
              { box: '1f', em: 'Ras Al Khaimah' },
              { box: '1g', em: 'Fujairah' }
            ].map(r => {
              const d = vatCalcs.emirateBreakdown[r.em] || { net: 0, vat: 0, count: 0 };
              return `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${r.box}</td>
                  <td>Standard Rated Supplies in ${r.em} ${r.em === 'Sharjah' ? '<b>(Primary Unit)</b>' : ''}</td>
                  <td style="text-align: right;">${d.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style="text-align: right; font-weight: bold;">${d.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style="text-align: center;">5.00%</td>
                </tr>
              `;
            }).join('')}
            <tr style="background: #fafafa;">
              <td style="text-align: center; font-weight: bold;">3</td>
              <td>Supplies Subject to Reverse Charge Provisions (RCM Overseas Services & Scrap)</td>
              <td style="text-align: right;">${vatCalcs.rcmTaxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; font-weight: bold;">${vatCalcs.rcmVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: center;">5.00%</td>
            </tr>
            <tr class="total-row">
              <td style="text-align: center;">8</td>
              <td>TOTAL VALUE OF OUTPUTS & DUE TAX (BOX 8)</td>
              <td style="text-align: right;">${(vatCalcs.totalStandardSalesNet + vatCalcs.rcmTaxable).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right;">AED ${vatCalcs.totalOutputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: center;">—</td>
            </tr>
          </tbody>
        </table>

        <div class="sec-bar">
          <span>SECTION 2: VAT ON EXPENSES AND ALL OTHER INPUTS (INPUT TAX)</span>
          <span>RECOVERABLE INPUT TAX</span>
        </div>
        <table class="vat-table">
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">BOX</th>
              <th>DESCRIPTION OF INPUT RECOVERIES</th>
              <th style="text-align: right; width: 120px;">TOTAL VALUE EXCL. VAT (AED)</th>
              <th style="text-align: right; width: 110px;">RECOVERABLE VAT (AED)</th>
              <th style="text-align: center; width: 60px;">RATE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center; font-weight: bold;">9</td>
              <td>Standard Rated Procurements, Raw Materials & Operational Expenses</td>
              <td style="text-align: right;">${vatCalcs.totalPurchasesNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; font-weight: bold;">${vatCalcs.totalPurchasesVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: center;">5.00%</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: bold;">10</td>
              <td>Supplies Subject to Reverse Charge Provisions (RCM Input Tax Recovered)</td>
              <td style="text-align: right;">${vatCalcs.rcmTaxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; font-weight: bold;">${vatCalcs.rcmVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: center;">5.00%</td>
            </tr>
            <tr>
              <td style="text-align: center; font-weight: bold;">7/11</td>
              <td>VAT Paid on Direct Customs Port Declarations (Bill of Entry Imports)</td>
              <td style="text-align: right;">${vatCalcs.customsNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right; font-weight: bold;">${vatCalcs.customsVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: center;">5.00%</td>
            </tr>
            <tr class="total-row">
              <td style="text-align: center;">13</td>
              <td>TOTAL VALUE OF RECOVERABLE TAX (BOX 13)</td>
              <td style="text-align: right;">${(vatCalcs.totalPurchasesNet + vatCalcs.rcmTaxable + vatCalcs.customsNet).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right;">AED ${vatCalcs.totalRecoverableInputVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="text-align: center;">—</td>
            </tr>
          </tbody>
        </table>

        <div class="banner">
          <div style="font-size: 9px; font-weight: bold; text-transform: uppercase;">
            BOX 14 — NET VAT DUE OR (RECOVERABLE) FOR THIS TAX PERIOD
          </div>
          <div style="font-size: 13px; font-weight: bold; margin-top: 3px;">
            AED ${Math.abs(vatCalcs.netVatPayable).toLocaleString(undefined, { minimumFractionDigits: 2 })} 
            <span style="font-size: 9px; font-weight: bold;">(${vatCalcs.netVatPayable >= 0 ? 'NET PAYABLE TO FTA GIBAN' : 'NET REFUNDABLE / CARRY FORWARD'})</span>
          </div>
        </div>

        <div class="sig-grid">
          <div class="sig-box">
            <span style="font-weight: bold; font-size: 7.5px;">PREPARED BY</span>
            <div class="sig-line"></div>
            <span style="font-size: 7px;">TAX ACCOUNTANT</span>
          </div>
          <div class="sig-box">
            <span style="font-weight: bold; font-size: 7.5px;">VERIFIED BY</span>
            <div class="sig-line"></div>
            <span style="font-size: 7px;">FINANCE MANAGER</span>
          </div>
          <div class="sig-box">
            <span style="font-weight: bold; font-size: 7.5px;">AUTHORIZED TAX AGENT</span>
            <div class="sig-line"></div>
            <span style="font-size: 7px;">TAAN REGISTERED SIGNATURE</span>
          </div>
          <div class="sig-box">
            <span style="font-weight: bold; font-size: 7.5px;">COMPANY STAMP</span>
            <div style="font-size: 6px; font-weight: bold;">[ OFFICIAL SEAL ]</div>
            <span style="font-size: 7px;">${company.name}</span>
          </div>
        </div>
      </body>
    </html>
  `;

  return printHtml(html, `FORM_VAT201_${company.trn}_${periodTo}`);
};

export const printAdvanceReceiptSchedule = (
  company: { name: string; trn?: string; address?: string; phone?: string; ftaGiban?: string },
  advances: AdvanceReceiptRecord[]
) => {
  const totalGross = advances.reduce((s, a) => s + a.advanceAmount, 0);
  const totalTaxable = advances.reduce((s, a) => s + a.taxableAmount, 0);
  const totalVat = advances.reduce((s, a) => s + a.vatAmount, 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ADVANCE_RECEIPT_TAX_SCHEDULE</title>
        <style>
          @page { size: A4 landscape; margin: 8mm !important; }
          body { font-family: Arial, sans-serif; font-size: 8.5px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #000; padding: 4px 6px; }
          th { background: #f0f0f0; font-weight: bold; text-align: left; }
          .total { font-weight: bold; background: #f9f9f9; border-top: 2px solid #000; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 4px;">
          <div>
            <div style="font-size: 13px; font-weight: bold;">ADVANCE RECEIPT TAX SCHEDULE (ARTICLE 25 COMPLIANCE)</div>
            <div style="font-size: 8.5px;"><b>${company.name}</b> | TRN: ${company.trn}</div>
          </div>
          <div style="text-align: right; font-size: 8px;">
            DATE: ${new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>VOUCHER #</th>
              <th>DATE</th>
              <th>CUSTOMER NAME</th>
              <th>CUSTOMER TRN</th>
              <th>EMIRATE</th>
              <th style="text-align: right;">GROSS (AED)</th>
              <th style="text-align: right;">TAXABLE (AED)</th>
              <th style="text-align: right;">5% VAT (AED)</th>
              <th style="text-align: center;">STATUS</th>
              <th>ALLOCATED INVOICE</th>
            </tr>
          </thead>
          <tbody>
            ${advances.map(a => `
              <tr>
                <td><b>${a.voucherNo}</b></td>
                <td>${a.date}</td>
                <td>${a.customerName}</td>
                <td>${a.customerTrn || '—'}</td>
                <td>${a.placeOfSupply}</td>
                <td style="text-align: right; font-weight: bold;">${a.advanceAmount.toFixed(2)}</td>
                <td style="text-align: right;">${a.taxableAmount.toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">${a.vatAmount.toFixed(2)}</td>
                <td style="text-align: center;"><b>${a.status}</b></td>
                <td>${a.allocatedInvoiceNo || 'Open Token Advance'}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="5" style="text-align: right;">TOTAL:</td>
              <td style="text-align: right;">AED ${totalGross.toFixed(2)}</td>
              <td style="text-align: right;">AED ${totalTaxable.toFixed(2)}</td>
              <td style="text-align: right;">AED ${totalVat.toFixed(2)}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
  return printHtml(html, `ADVANCE_RECEIPT_TAX_SCHEDULE`);
};

export const printRcmReport = (
  company: { name: string; trn?: string; address?: string; phone?: string; ftaGiban?: string },
  rcmList: ReverseChargeRecord[]
) => {
  const totalTaxable = rcmList.reduce((s, r) => s + r.taxableAmount, 0);
  const totalVat = rcmList.reduce((s, r) => s + r.rcmOutputTax, 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>REVERSE_CHARGE_MECHANISM_REPORT</title>
        <style>
          @page { size: A4 landscape; margin: 8mm !important; }
          body { font-family: Arial, sans-serif; font-size: 8.5px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #000; padding: 4px 6px; }
          th { background: #f0f0f0; font-weight: bold; text-align: left; }
          .total { font-weight: bold; background: #f9f9f9; border-top: 2px solid #000; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 4px;">
          <div>
            <div style="font-size: 13px; font-weight: bold;">REVERSE CHARGE MECHANISM (RCM) AUDIT REPORT</div>
            <div style="font-size: 8.5px;"><b>${company.name}</b> | TRN: ${company.trn || '—'}</div>
          </div>
          <div style="text-align: right; font-size: 8px;">
            DATE: ${new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>REF #</th>
              <th>DATE</th>
              <th>OVERSEAS SUPPLIER / VENDOR</th>
              <th>ORIGIN</th>
              <th>NATURE OF SERVICE / PROCUREMENT</th>
              <th style="text-align: right;">TAXABLE (AED)</th>
              <th style="text-align: right;">BOX 3 OUTPUT (5%)</th>
              <th style="text-align: right;">BOX 10 INPUT (5%)</th>
              <th>VAT BOX</th>
            </tr>
          </thead>
          <tbody>
            ${rcmList.map(r => `
              <tr>
                <td><b>${r.refNo}</b></td>
                <td>${r.date}</td>
                <td>${r.supplierName}</td>
                <td>${r.country}</td>
                <td>${r.natureOfService}</td>
                <td style="text-align: right; font-weight: bold;">${r.taxableAmount.toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">${r.rcmOutputTax.toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">${r.recoverableInputTax.toFixed(2)}</td>
                <td>${r.vatBox}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="5" style="text-align: right;">TOTAL:</td>
              <td style="text-align: right;">AED ${totalTaxable.toFixed(2)}</td>
              <td style="text-align: right;">AED ${totalVat.toFixed(2)}</td>
              <td style="text-align: right;">AED ${totalVat.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
  return printHtml(html, `REVERSE_CHARGE_MECHANISM_REPORT`);
};

export const printCustomsVatReport = (
  company: { name: string; trn?: string; address?: string; phone?: string; ftaGiban?: string },
  customs: CustomsVatRecord[]
) => {
  const totalCif = customs.reduce((s, c) => s + c.cifValue, 0);
  const totalDuty = customs.reduce((s, c) => s + c.customsDuty, 0);
  const totalVat = customs.reduce((s, c) => s + c.vatAmountPaid, 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CUSTOMS_VAT_IMPORT_DECLARATION_REPORT</title>
        <style>
          @page { size: A4 landscape; margin: 8mm !important; }
          body { font-family: Arial, sans-serif; font-size: 8.5px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #000; padding: 4px 6px; }
          th { background: #f0f0f0; font-weight: bold; text-align: left; }
          .total { font-weight: bold; background: #f9f9f9; border-top: 2px solid #000; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 4px;">
          <div>
            <div style="font-size: 13px; font-weight: bold;">VAT PAID TO CUSTOMS & PORT IMPORT DECLARATIONS</div>
            <div style="font-size: 8.5px;"><b>${company.name}</b> | TRN: ${company.trn || '—'}</div>
          </div>
          <div style="text-align: right; font-size: 8px;">
            DATE: ${new Date().toLocaleDateString('en-GB')}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>DECLARATION #</th>
              <th>BOE #</th>
              <th>DATE</th>
              <th>PORT</th>
              <th>EXPORTER</th>
              <th style="text-align: right;">CIF (AED)</th>
              <th style="text-align: right;">DUTY (5%)</th>
              <th style="text-align: right;">VAT PAID (5%)</th>
              <th style="text-align: center;">PAYMENT MODE</th>
              <th style="text-align: center;">STATUS</th>
            </tr>
          </thead>
          <tbody>
            ${customs.map(c => `
              <tr>
                <td><b>${c.declarationNo}</b></td>
                <td>${c.boeNo}</td>
                <td>${c.date}</td>
                <td>${c.customsPort}</td>
                <td>${c.supplierName}</td>
                <td style="text-align: right;">${c.cifValue.toFixed(2)}</td>
                <td style="text-align: right;">${c.customsDuty.toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">${c.vatAmountPaid.toFixed(2)}</td>
                <td style="text-align: center;">${c.paymentMode}</td>
                <td style="text-align: center;"><b>${c.reconciliationStatus}</b></td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="5" style="text-align: right;">TOTAL:</td>
              <td style="text-align: right;">AED ${totalCif.toFixed(2)}</td>
              <td style="text-align: right;">AED ${totalDuty.toFixed(2)}</td>
              <td style="text-align: right;">AED ${totalVat.toFixed(2)}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
  return printHtml(html, `CUSTOMS_VAT_IMPORT_DECLARATION_REPORT`);
};
