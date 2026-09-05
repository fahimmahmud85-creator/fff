import React, { useState, useMemo } from 'react';
import { 
  Printer, Search, Filter, Trash2, Eye, Users
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { generateHighFidelityDocHtml } from './DocumentPrintGenerator';
import { RecordsFooterShortcutsBar } from './RecordsFooterShortcutsBar';
import { getActiveCompany } from '../utils/companyProfile';

interface InvoiceRecordsProps {
  salesInvoices: any[];
  setSalesInvoices: (invoices: any[]) => void;
  triggerToast: (msg: string) => void;
}

export const InvoiceRecordsComponent: React.FC<InvoiceRecordsProps> = ({
  salesInvoices,
  setSalesInvoices,
  triggerToast
}) => {
  const [search, setSearch] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [hiddenInvoiceIds, setHiddenInvoiceIds] = useState<string[]>([]);

  const filteredInvoices = useMemo(() => {
    const list = salesInvoices.filter(inv => {
      if (hiddenInvoiceIds.includes(inv.id)) return false;
      const isTaxInvoice = inv.documentType === 'TAX INVOICE' || inv.documentType === 'TAX INVOICE & DELIVERY NOTE' || (!inv.documentType && !String(inv.invoiceNo || '').toUpperCase().startsWith('PRO') && !String(inv.invoiceNo || '').toUpperCase().startsWith('PI'));
      const matchesCurr = filterCurrency === 'ALL' || inv.currency === filterCurrency;
      
      // Date filter
      if (fromDate || toDate) {
        const invDate = inv.dated || inv.date || '';
        if (invDate) {
          if (fromDate && invDate < fromDate) return false;
          if (toDate && invDate > toDate) return false;
        }
      }

      const str = `${inv.invoiceNo} ${inv.customerName} ${inv.paymentTerms} ${inv.shippingTerms}`.toUpperCase();
      const matchesSearch = str.includes(search.toUpperCase());
      return isTaxInvoice && matchesCurr && matchesSearch;
    });

    // Sort by customerName first to group invoices of the same customer together
    return [...list].sort((a, b) => {
      const nameA = (a.customerName || '').trim().toUpperCase();
      const nameB = (b.customerName || '').trim().toUpperCase();
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }
      const dateA = a.dated || '';
      const dateB = b.dated || '';
      return dateB.localeCompare(dateA);
    });
  }, [salesInvoices, filterCurrency, search, fromDate, toDate, hiddenInvoiceIds]);

  const handleVoidInvoice = (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to VOID and permanently wipe Tax Invoice ${code}? This cannot be undone.`)) {
      const revised = salesInvoices.filter(inv => inv.id !== id);
      setSalesInvoices(revised);
      localStorage.setItem('MF_SALES_INVOICES_EXCEL', JSON.stringify(revised));
      triggerToast(`Tax Invoice ${code} permanently shredded and removed from ledger records.`);
    }
  };

  const handleReprint = (inv: any) => {
    const htmlContent = generateHighFidelityDocHtml(inv, 'TAX INVOICE', undefined, {
      printArea: 'ENTIRE',
      showUnitWeightInPrint: true,
      showTotalWeightInPrint: true,
      printPageSize: 'A4',
    });
    printHtml(htmlContent, `MFI_Reprint_Tax_Invoice_${inv.invoiceNo}`);
  };

  const handlePrintInvoicesLedger = () => {
    if (filteredInvoices.length === 0) {
      triggerToast('No invoices available in current filter to print.');
      return;
    }
    triggerToast(`Preparing Tax Invoices Printout (${filteredInvoices.length} records)...`);

    const rowsHtml = filteredInvoices.map((inv, idx) => {
      const workOrderNo = inv.workOrderNo || inv.workOrderNum || inv.sourceWoNo || '—';
      const poNumber = inv.lpoNo || inv.poNumber || inv.poNo || '—';
      const invNo = inv.invoiceNo || '—';
      const invDate = inv.dated || inv.date || '—';
      const custName = inv.customerName || inv.buyerName || '—';
      const curr = inv.currency || 'AED';
      const totalAmt = Number(inv.grandTotal || inv.totalAmount || inv.total || 0);

      return `
        <tr style="border-bottom: 1px solid #cbd5e1; height: 26px; font-size: 10px; text-align: center; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #083c54;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: 900; color: #dc2626;">${invNo}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${invDate}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding: 4px 8px; font-weight: bold; text-transform: uppercase;">${custName}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${workOrderNo}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${poNumber}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 8px; font-family: monospace; font-weight: bold;">${curr} ${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFI Tax Invoices Registry Report</title>
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
              <h1 class="title">${getActiveCompany().name}</h1>
              <div class="subtitle">CERTIFIED SALES TAX INVOICE DIRECTORY & AUDIT TRAIL</div>
            </div>
            <div style="text-align: right; font-size: 9px; font-family: monospace; font-weight: bold;">
              <div>Records: <strong>${filteredInvoices.length}</strong></div>
              <div>Period: ${fromDate || 'Start'} to ${toDate || 'Present'}</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%;">SN</th>
                <th style="width: 14%;">INVOICE NO</th>
                <th style="width: 11%;">DATE</th>
                <th style="width: 35%; text-align: left; padding-left: 8px;">CUSTOMER / BUYER NAME</th>
                <th style="width: 13%;">WORK ORDER</th>
                <th style="width: 11%;">PO NUMBER</th>
                <th style="width: 12%; text-align: right; padding-right: 8px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>OFFICIAL ${getActiveCompany().shortName || getActiveCompany().code || 'ERP'} REGISTRY EXPORT</span>
            <span>${getActiveCompany().address || 'UNITED ARAB EMIRATES'}</span>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `${(getActiveCompany().code || 'ERP')}_Tax_Invoices_Registry_${new Date().toISOString().slice(0, 10)}`);
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
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by invoice number, contractor code, shipping terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-350 p-2 pl-8 text-[10.5px] uppercase placeholder:lowercase focus:bg-white outline-none rounded font-bold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 border p-1 rounded">
          <Filter className="w-3.5 h-3.5 text-[#f37021]" />
          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="bg-transparent border-none p-1 text-[10.5px] font-bold uppercase cursor-pointer text-black"
          >
            <option value="ALL">Currency: All</option>
            <option value="AED">AED Base Only</option>
            <option value="USD">USD Base Only</option>
          </select>
        </div>
      </div>      <div className="box-shaped overflow-x-auto">
        <table className="box-shaped-table w-full text-left font-mono text-[9.5px] bg-white">
          <thead>
            <tr>
              <th className="p-1.5 text-[8.5px] w-[120px]">Invoice No</th>
              <th className="p-1.5 text-[8.5px] w-[100px]">Date</th>
              <th className="p-1.5 text-[8.5px] w-[220px]">Customer Name</th>
              <th className="p-1.5 text-[8.5px] text-center w-[120px]">Work Order No</th>
              <th className="p-1.5 text-[8.5px] text-center w-[120px]">PO Number</th>
              <th className="p-1.5 text-center text-[8.5px] w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 italic font-mono uppercase">
                  No tax invoices matching filter criteria or registered in this session context.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv, idx) => {
                const workOrderNo = inv.workOrderNo || inv.workOrderNum || inv.sourceWoNo || '—';
                const poNumber = inv.lpoNo || inv.poNumber || inv.poNo || '—';

                // Check if this is a repeat of the previous row's customerName
                const prevRow = idx > 0 ? filteredInvoices[idx - 1] : null;
                const isRepeatCustomer = prevRow && (prevRow.customerName || '').trim().toUpperCase() === (inv.customerName || '').trim().toUpperCase();

                const isSelected = selectedRowIndex === idx;
                return (
                  <tr 
                    key={inv.id} 
                    onClick={() => setSelectedRowIndex(idx)}
                    className={`font-bold transition-all text-slate-800 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/80 ring-1 ring-indigo-300 ring-inset' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-1.5 text-[#f37021]">{inv.invoiceNo}</td>
                    <td className="p-1.5 whitespace-nowrap">{inv.dated}</td>
                    <td className="p-1.5 text-[#1e293b] leading-tight select-all">
                      {!isRepeatCustomer ? (
                        <div className="flex flex-col gap-1">
                          <span>{inv.customerName}</span>

                          {inv.customerName && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const targetCleanName = inv.customerName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
                                const savedCustomersJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
                                let regCustomers: any[] = [];
                                if (savedCustomersJson) {
                                  try {
                                    regCustomers = JSON.parse(savedCustomersJson);
                                  } catch (err) {}
                                }
                                let matchedCust = regCustomers.find((c: any) => {
                                  const cName = (c.name || c.companyName || '').trim().toUpperCase();
                                  return cName.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '') === targetCleanName;
                                });
                                let custId = matchedCust ? matchedCust.id : ('cust-' + inv.customerName.trim().replace(/\s+/g, '-').toLowerCase());
                                
                                localStorage.setItem('MFI_SOA_SELECTED_CUSTOMER_ID', custId);
                                localStorage.setItem('mf_erp_active_tab', 'customer_soa');
                                window.dispatchEvent(new Event('storage'));
                                window.dispatchEvent(new Event('mfi_soa_select_customer'));
                                window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'customer_soa' }));
                              }}
                              className="text-left text-[8px] text-[#f37021] hover:text-orange-700 font-semibold hover:underline cursor-pointer flex items-center gap-0.5 mt-0.5 select-none"
                            >
                              <Users className="w-2.5 h-2.5 inline" /> VIEW SOA LEDGER
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-left text-slate-400 font-medium italic text-[10px] select-none pl-2">
                          〃
                        </div>
                      )}
                    </td>
                    <td className="p-1.5 text-center text-indigo-750">{workOrderNo}</td>
                    <td className="p-1.5 text-center text-teal-800">{poNumber}</td>
                    <td className="p-1.5 flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleReprint(inv)}
                        title="PDF View"
                        className="bg-red-650 hover:bg-red-700 text-white p-1.5 font-bold uppercase cursor-pointer rounded transition-all flex items-center justify-center gap-1 shadow-3xs font-sans text-[9px] tracking-wide"
                      >
                        <Printer className="w-3.5 h-3.5 text-white" />
                        <span>PDF VIEW</span>
                      </button>

                      <button
                        onClick={() => handleVoidInvoice(inv.id, inv.invoiceNo)}
                        title="Delete Document"
                        className="bg-slate-100 hover:bg-rose-100 text-red-600 p-1.5 font-bold uppercase cursor-pointer rounded border border-slate-300 hover:border-red-300 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          localStorage.setItem('mf_erp_active_tab', 'home');
          window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'home' }));
        }}
        onSelectColumn={() => {
          if (filteredInvoices.length > 0) {
            setSelectedRowIndex(prev => (prev + 1) % filteredInvoices.length);
          }
        }}
        selectColumnLabel="Select Row"
        onDrillDown={() => {
          const sel = filteredInvoices[selectedRowIndex];
          if (sel) {
            handleReprint(sel);
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
          if (hiddenInvoiceIds.length > 0) {
            setHiddenInvoiceIds([]);
            triggerToast('All hidden invoice lines restored.');
          } else {
            const sel = filteredInvoices[selectedRowIndex];
            if (sel) {
              setHiddenInvoiceIds(prev => [...prev, sel.id]);
              triggerToast(`Line ${sel.invoiceNo} temporarily hidden from view (Press U to restore).`);
            }
          }
        }}
        isLineRemoved={hiddenInvoiceIds.length > 0}
        removeLineLabel="Remove Line"
        restoreLineLabel="Restore Line"
        onPrint={handlePrintInvoicesLedger}
        onExport={() => {
          const csvHeader = 'Invoice No,Date,Customer Name,Work Order No,PO Number\n';
          const csvRows = filteredInvoices.map(i => `"${i.invoiceNo || ''}","${i.dated || ''}","${(i.customerName || '').replace(/"/g, '""')}","${i.workOrderNo || ''}","${i.poNumber || ''}"`).join('\n');
          const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `MFI_Tax_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        totalRecordsCount={filteredInvoices.length}
      />
    </div>
  );
};
