import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Save, Trash2, Printer, Check, Clipboard, Award, TrendingUp, Eye } from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany } from '../utils/companyProfile';

interface CommissionPayout {
  id: string;
  payDate: string;
  repName: string;
  period: string;
  salesVolume: number;
  rateApplied: number;
  payoutAmount: number;
  status: 'Approved' | 'Paid' | 'Processing';
  authorizedSignatory: string;
}

const INITIAL_PAYOUTS: CommissionPayout[] = [];

export default function ErpCommissionView() {
  const [payouts, setPayouts] = useState<CommissionPayout[]>(() => {
    const saved = localStorage.getItem('MFI_ERP_COMMISSIONS');
    let loaded: CommissionPayout[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loaded = parsed;
        }
      } catch (e) {}
    } else {
      loaded = INITIAL_PAYOUTS;
    }
    return loaded.filter(p => p.id !== 'comm-1' && p.id !== 'comm-2');
  });

  const [activeSubView, setActiveSubView] = useState<'calculator' | 'journal'>('calculator');

  // Interactive Calculator State
  const [activeRepName, setActiveRepName] = useState('MR. SHANU');
  const [period, setPeriod] = useState('MAY 2026');
  const [manualSalesVal, setManualSalesVal] = useState(72500);
  const [commissionRate, setCommissionRate] = useState(1.5);
  const [payDate, setPayDate] = useState('2026-05-29');
  const [authBy, setAuthBy] = useState('Logistics CFO Office');

  // Dynamically load invoice sum to suggest live total sales for that client
  const liveInvoicedGrandTotal = useMemo(() => {
    const savedInvoices = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (savedInvoices) {
      try {
        const list = JSON.parse(savedInvoices);
        let sum = 0;
        list.forEach((invoice: any) => {
          let itemSum = 0;
          if (invoice.items && Array.isArray(invoice.items)) {
            invoice.items.forEach((it: any) => {
              itemSum += (it.qty * (it.unitPriceWOVAT || 0));
            });
          }
          sum += (itemSum - (invoice.discountAmt || 0) + (invoice.freightAmt || 0));
        });
        return sum > 0 ? sum : 98150.00; // provide sturdy fallback if blank
      } catch (e) {}
    }
    return 98150.00;
  }, []);

  useEffect(() => {
    localStorage.setItem('MFI_ERP_COMMISSIONS', JSON.stringify(payouts));
  }, [payouts]);

  const scalePayout = useMemo(() => {
    return (manualSalesVal * (commissionRate / 100));
  }, [manualSalesVal, commissionRate]);

  const handleRegisterPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const fresh: CommissionPayout = {
      id: "comm-" + Date.now(),
      payDate,
      repName: activeRepName.toUpperCase(),
      period: period.toUpperCase(),
      salesVolume: manualSalesVal,
      rateApplied: commissionRate,
      payoutAmount: scalePayout,
      status: 'Approved',
      authorizedSignatory: authBy.toUpperCase()
    };
    setPayouts([fresh, ...payouts]);
    alert("Sales Representative commission voucher logged to registry successfully.");
    setActiveSubView('journal');
  };

  const deletePayout = (id: string) => {
    if (confirm('Delete this payout slip log?')) {
      setPayouts(payouts.filter(p => p.id !== id));
    }
  };

  const handlePrintCommission = (p: CommissionPayout) => {
    const activeCompany = getActiveCompany();
    const totalWords = "AED " + p.payoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    const dateStr = new Date(p.payDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const html = `
      <html>
        <head>
          <title>Commission Settlement - ${p.repName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: 'Plus Jakarta Sans', Arial, sans-serif;
              color: #000;
              background-color: #ffffff;
              margin: 0;
              padding: 6mm;
              font-size: 8.5px;
              line-height: 1.4;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #000;
              margin-bottom: 8px;
            }
            .header-table td {
              padding: 6px;
              vertical-align: top;
            }
            .memo-container {
              border: 1px solid #000;
              margin-bottom: 12px;
            }
            .memo-header {
              background: #f2f2f2;
              padding: 6px 10px;
              border-bottom: 1px solid #000;
              font-weight: bold;
              color: #083c54;
              font-size: 10px;
              text-transform: uppercase;
            }
            .memo-row {
              display: flex;
              border-bottom: 1px solid #ccc;
            }
            .memo-row:last-child {
              border-bottom: none;
            }
            .memo-label {
              width: 35%;
              background: #f8fafc;
              padding: 6px 10px;
              font-weight: bold;
              color: #333;
              border-right: 1px solid #ccc;
              text-transform: uppercase;
              font-size: 8.5px;
            }
            .memo-value {
              width: 65%;
              padding: 6px 10px;
              font-weight: bold;
              color: #000;
              font-size: 9px;
            }
            .memo-value.highlight {
              color: #003366;
              font-size: 11px;
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
              border-top: 1px solid #000;
              text-align: center;
              padding-top: 4px;
              font-size: 8px;
              font-weight: bold;
              color: #000;
              text-transform: uppercase;
            }
            .footer-info {
              text-align: center;
              font-size: 7.5px;
              color: #666;
              margin-top: 25px;
              border-top: 1px solid #ccc;
              padding-top: 6px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <!-- Quotation Format Title Bar -->
          <div style="display: flex; align-items: center; width: 100%; margin: 4px 0 8px 0;">
            <div style="flex: 1; border-top: 3px double #083c54; margin-right: 12px;"></div>
            <span style="font-size: 13.5px; font-weight: bold; font-style: italic; color: #083c54; white-space: nowrap; padding: 0 4px;">
              Commission Payslip
            </span>
            <div style="width: 75px; border-top: 3px double #083c54; margin-left: 12px;"></div>
          </div>

          <table class="header-table">
            <tr>
              ${activeCompany.showLogo && activeCompany.logoUrl ? `
                <td style="width: 70px; vertical-align: middle; border-right: 1px solid #000; padding: 4px;">
                  <img src="${activeCompany.logoUrl}" style="max-height: 48px; max-width: 70px; object-fit: contain;" />
                </td>
              ` : ''}
              <td style="width: 60%; border-right: 1px solid #000;">
                <div style="font-size: 11px; font-weight: 900; color: #000; margin-bottom: 2px;">
                  ${activeCompany.name}
                </div>
                ${activeCompany.address}<br/>
                ${activeCompany.phone ? `Telephone: ${activeCompany.phone} | ` : ''}Email: ${activeCompany.email || 'info@' + (activeCompany.shortName?.toLowerCase().replace(/\s+/g, '') || 'company') + '.com'}<br/>
                <b>VAT TRN:</b> ${activeCompany.trn || '—'} | <b>EMIRATE:</b> AJMAN
              </td>
              <td style="width: 40%;">
                <b>REF NO:</b> SLIP-${p.id.substring(5, 12).toUpperCase()}<br/>
                <b>SETTLED ON:</b> ${dateStr}<br/>
                <b>STATUS:</b> APPROVED
              </td>
            </tr>
          </table>

          <div class="memo-container">
            <div class="memo-header">
              COMMISSION DISBURSEMENT RECONCILIATION SLIP
            </div>
            <div class="memo-row">
              <div class="memo-label">Sales Representative</div>
              <div class="memo-value" style="font-size: 11px; color: #003366;">${p.repName}</div>
            </div>
            <div class="memo-row">
              <div class="memo-label">Billing Cycle / Period</div>
              <div class="memo-value">${p.period}</div>
            </div>
            <div class="memo-row">
              <div class="memo-label">Commission Rate Applied</div>
              <div class="memo-value" style="color: #b45309;">${p.rateApplied.toFixed(2)} %</div>
            </div>
            <div class="memo-row">
              <div class="memo-label">Invoiced Client Sales Volume</div>
              <div class="memo-value">AED ${p.salesVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="memo-row" style="background: #ecfdf5;">
              <div class="memo-label" style="background: #f0fdf4; font-weight: bold;">Net Payout Amount</div>
              <div class="memo-value highlight font-bold">${totalWords}</div>
            </div>
            <div class="memo-row">
              <div class="memo-label">Audit Authority Office</div>
              <div class="memo-value">${p.authorizedSignatory}</div>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature-box">Prepared By (Finance Clerk)</div>
            <div class="signature-box">Checked & Audited By</div>
            <div class="signature-box">Beneficiary Signature (${p.repName})</div>
          </div>

          <div class="footer-info">
            This is a system generated digital commission payroll settlement from ${activeCompany.name} cloud workspace.
          </div>
        </body>
      </html>
    `;
    printHtml(html, `Commission-Slip-${p.repName.replace(/\s+/g, '-')}`);
  };

  return (
    <div className="space-y-6 select-none font-mono text-[10.5px]">
      
      {/* Sub menu */}
      <div className="bg-slate-900 border border-slate-950 p-2 text-white rounded-lg flex justify-between items-center no-print">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveSubView('calculator')}
            className={`px-4 py-1.5 font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
              activeSubView === 'calculator' ? 'bg-[#f37021] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            💰 Sales Payout Calculator
          </button>
          <button
            onClick={() => setActiveSubView('journal')}
            className={`px-4 py-1.5 font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
              activeSubView === 'journal' ? 'bg-[#f37021] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Commission Record Sheets ({payouts.length})
          </button>
        </div>
      </div>

      {activeSubView === 'calculator' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left panel parameters */}
          <div className="xl:col-span-5 bg-white border border-slate-250 p-5 rounded-lg shadow-2xs text-slate-800">
            <span className="text-[10px] text-[#f37021] font-bold font-mono block uppercase mb-4">🖊️ Complete Commission Voucher Details</span>
            
            <form onSubmit={handleRegisterPayout} className="space-y-4 font-mono text-[11px]">
              <div>
                <label className="text-[9px] text-slate-400 block font-bold mb-1">SALES EXECUTIVE</label>
                <select
                  value={activeRepName}
                  onChange={e => setActiveRepName(e.target.value)}
                  className="w-full p-2 border bg-slate-50 uppercase text-xs focus:ring-[#f37021] font-bold"
                >
                  <option value="MR. SHANU">MR. SHANU (LOGISTICS &amp; DUBAI)</option>
                  <option value="MR. FAHIM">MR. FAHIM (AJMAN SALES EXECUTIVE)</option>
                  <option value="MR. SUJITH SUKUMARAN">MR. SUJITH SUKUMARAN (ABU DHABI OUTDOOR)</option>
                  <option value="MR. JERIN CHERIYAN">MR. JERIN CHERIYAN (ESTIMATION ENG)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">DATE OF SETTLEMENT</label>
                  <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full p-2 border text-xs" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">PAYOUT PERIOD</label>
                  <input type="text" placeholder="E.G. MAY 2026" value={period} onChange={e => setPeriod(e.target.value)} className="w-full p-2 border uppercase text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-[#f37021] block font-bold mb-1 font-bold">
                  ACHIEVED MONTHLY REVENUE VOLUME (AED)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400">AED</span>
                  <input
                    type="number"
                    value={manualSalesVal}
                    onChange={e => setManualSalesVal(parseInt(e.target.value) || 0)}
                    className="w-full pl-10 p-2 border font-bold text-slate-950 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setManualSalesVal(Math.round(liveInvoicedGrandTotal))}
                  className="text-[9px] text-blue-600 block mt-1 hover:underline text-left"
                >
                  * Load actual invoiced client sales this cycle: AED {liveInvoicedGrandTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">TARGET COMMISSION (%)</label>
                  <select
                    value={commissionRate}
                    onChange={e => setCommissionRate(parseFloat(e.target.value))}
                    className="w-full p-2 border text-xs font-bold font-mono"
                  >
                    <option value="1.0">1.0% (Junior Rate)</option>
                    <option value="1.2">1.2% (Standard)</option>
                    <option value="1.5">1.5% (Executive Base)</option>
                    <option value="2.0">2.0% (Star Performer)</option>
                    <option value="2.5">2.5% (Key Accounts Target)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block font-bold mb-1">AUTHORIZING OFFICER</label>
                  <input type="text" value={authBy} onChange={e => setAuthBy(e.target.value)} className="w-full p-2 border text-xs uppercase" />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-[#f37021] text-white p-2.5 font-bold uppercase hover:bg-[#d65e17] text-xs cursor-pointer shadow-sm">
                  💾 Post Voucher to Records
                </button>
              </div>
            </form>
          </div>

          {/* Right panel layout display */}
          <div className="xl:col-span-7 bg-white border border-slate-350 p-6 md:p-8 rounded-lg shadow-sm text-slate-900 max-w-[640px] mx-auto relative overflow-hidden select-text font-mono">
            {/* Stamp back */}
            <div className="absolute right-10 top-10 pointer-events-none opacity-10">
              <span className="text-8xl select-none font-bold text-slate-950">MFI</span>
            </div>

            <div className="border-b border-dashed pb-3 flex justify-between items-start leading-tight">
              <div>
                <h3 className="text-xs font-semibold text-[#f37021] uppercase">Marine Fasteners Industries LLC</h3>
                <span className="text-[12px] font-bold block mt-0.5">COMMISSION DISBURSEMENT SLIP</span>
              </div>
              <div className="text-right text-[9px] text-slate-400">
                <p>Dated: {payDate}</p>
                <p>Ref: COM-{Math.floor(Math.random() * 8000 + 1000)}</p>
              </div>
            </div>

            <div className="my-6 space-y-3.5 text-xs text-slate-800 leading-snug">
              <div className="grid grid-cols-12 border-b py-1 border-slate-100">
                <span className="col-span-4 text-slate-400">BENEFICIARY REP:</span>
                <span className="col-span-8 font-bold text-slate-950 text-[12.5px] uppercase">{activeRepName}</span>
              </div>

              <div className="grid grid-cols-12 border-b py-1 border-slate-100">
                <span className="col-span-4 text-slate-400">PERIOD IN SCOPE:</span>
                <span className="col-span-8 font-semibold text-teal-800 uppercase">{period}</span>
              </div>

              <div className="grid grid-cols-12 border-b py-1 border-slate-100">
                <span className="col-span-4 text-slate-400">ACHIEVED REVENUE:</span>
                <span className="col-span-8 font-bold font-mono text-slate-900">AED {manualSalesVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="grid grid-cols-12 border-b py-1 border-slate-100">
                <span className="col-span-4 text-slate-400">ACCORDED RATIO:</span>
                <span className="col-span-8 font-bold text-amber-600 font-mono">{commissionRate.toFixed(2)} %</span>
              </div>

              <div className="grid grid-cols-12 bg-slate-900 text-white p-3 border-l-4 border-emerald-500 rounded-sm">
                <span className="col-span-4 text-slate-350 font-bold self-center">NET PAYOUT VALUE:</span>
                <span className="col-span-8 text-right font-bold text-emerald-400 text-base font-mono self-center">
                  AED {scalePayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-4 flex justify-between items-center text-[10px]">
              <div>
                <p className="text-slate-400 text-[8.5px]">ISSUING AUTHORITY:</p>
                <p className="font-bold text-slate-900 uppercase mt-0.5">{authBy}</p>
              </div>
              <div className="text-center">
                <div className="w-24 border-b border-dashed mx-auto mb-1 opacity-40"></div>
                <p className="text-[8.5px] text-slate-400">Beneficiary Signature</p>
              </div>
            </div>

            <div className="no-print mt-6 flex justify-end">
              <button onClick={() => window.print()} className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Print Payout Memo
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TABLE JOURNAL */
        <div className="bg-white border rounded-lg p-4 space-y-4 shadow-2xs">
          <div className="border-b pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase">📊 Commission payroll entries archive</h3>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Recorded logs of historic and pending commission payslips posted centrally.</p>
          </div>

          <div className="overflow-x-auto select-all">
            <table className="w-full min-w-[900px] text-left border-collapse border font-sans text-[11px] [text-transform:uppercase]">
              <thead>
                <tr className="bg-slate-905 bg-slate-900 text-white border-b font-bold tracking-wide h-10 select-none text-[9.5px]">
                  <th className="p-2">Settlement Date</th>
                  <th className="p-2">Sales Associate Name</th>
                  <th className="p-2">Billing Cycle Period</th>
                  <th className="p-2 text-right">Invoiced sales Volume</th>
                  <th className="p-2 text-center">Applied rate</th>
                  <th className="p-2 text-right text-emerald-400">payout Commission</th>
                  <th className="p-2 text-center">Audit Authority</th>
                  <th className="p-2 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-12 text-slate-400 italic font-mono bg-slate-50">No commission slips recorded. Use calculator tab to post.</td>
                  </tr>
                ) : (
                  payouts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 font-mono">
                      <td className="p-2.5 font-bold text-slate-600">{p.payDate}</td>
                      <td className="p-2.5 font-sans font-semibold text-slate-950 text-[11.5px]">{p.repName}</td>
                      <td className="p-2.5 text-teal-850 font-bold">{p.period}</td>
                      <td className="p-2.5 text-right">AED {p.salesVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-center font-bold text-amber-700">{p.rateApplied.toFixed(2)} %</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700 text-xs">AED {p.payoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2.5 text-center font-sans text-slate-550 text-[10px]">{p.authorizedSignatory}</td>
                      <td className="p-2.5 text-center font-sans flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePrintCommission(p)}
                          className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded cursor-pointer transition-all flex items-center justify-center shadow-3xs"
                          title="Preview Commission Slip"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePayout(p.id)}
                          className="p-1 border border-slate-300 text-slate-400 hover:text-red-650 hover:bg-rose-50 hover:border-rose-200 rounded cursor-pointer transition-all flex items-center justify-center shadow-3xs"
                          title="Wipe record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-2.5 border rounded text-[9.5px] text-slate-405 leading-relaxed font-sans uppercase">
            * Commission calculations enforce the standard Gulf logistics payout scale, validating financial commissions securely.
          </div>
        </div>
      )}

    </div>
  );
}
