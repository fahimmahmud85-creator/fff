import React, { useState } from 'react';
import { Search, Printer, Download, Plus, Filter, FileSpreadsheet } from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, getCompanyIsoText } from '../utils/companyProfile';

interface LedgerRow {
  id: number;
  particulars: string;
  indent: number; // 0, 1, 2, 3 levels
  isBold?: boolean;
  totalYtd: number | null;
  currentPeriod: number | null;
  previousYear: number | null;
  comparePeriod: number | null;
}

export default function ParticularsLedgerComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'assets' | 'liabilities' | 'others'>('all');

  // Hardcoded real data replicating the second screenshot exactly
  const [rows, setRows] = useState<LedgerRow[]>([
    { id: 1, particulars: 'ABC', indent: 0, isBold: true, totalYtd: 400.50, currentPeriod: 400.50, previousYear: null, comparePeriod: null },
    { id: 2, particulars: 'ASSETS', indent: 0, isBold: true, totalYtd: 652680.00, currentPeriod: 249975.00, previousYear: 402905.00, comparePeriod: 12730.00 },
    { id: 3, particulars: 'Current Assets', indent: 1, isBold: true, totalYtd: 652680.00, currentPeriod: 249975.00, previousYear: 402905.00, comparePeriod: 12730.00 },
    { id: 4, particulars: 'Accounts Receivable', indent: 2, isBold: true, totalYtd: 651675.00, currentPeriod: 249150.00, previousYear: 402725.00, comparePeriod: 11030.00 },
    { id: 5, particulars: 'Applico Group', indent: 3, totalYtd: 17795.00, currentPeriod: null, previousYear: 19045.00, comparePeriod: 480.00 },
    { id: 6, particulars: 'Customer A', indent: 3, totalYtd: 501680.00, currentPeriod: 250000.00, previousYear: 251680.00, comparePeriod: null },
    { id: 7, particulars: 'Customer B', indent: 3, totalYtd: 200.00, currentPeriod: 400.00, previousYear: null, comparePeriod: null },
    { id: 8, particulars: 'Dalton co', indent: 3, totalYtd: 4450.00, currentPeriod: null, previousYear: 4450.00, comparePeriod: 2500.00 },
    { id: 9, particulars: 'Gene Tech', indent: 3, totalYtd: 11000.00, currentPeriod: null, previousYear: 11000.00, comparePeriod: null },
    { id: 10, particulars: 'Sharon', indent: 3, totalYtd: 2500.00, currentPeriod: null, previousYear: 2500.00, comparePeriod: null },
    { id: 11, particulars: 'Shopify', indent: 3, totalYtd: 1900.00, currentPeriod: null, previousYear: 1900.00, comparePeriod: 1900.00 },
    { id: 12, particulars: 'Tesco', indent: 3, totalYtd: 6150.00, currentPeriod: null, previousYear: 6150.00, comparePeriod: 6150.00 },
    { id: 13, particulars: 'Y5', indent: 3, totalYtd: 106000.00, currentPeriod: null, previousYear: 106000.00, comparePeriod: null },
    { id: 14, particulars: 'Cash & bank', indent: 2, isBold: true, totalYtd: 1005.00, currentPeriod: 825.00, previousYear: 180.00, comparePeriod: 1700.00 },
    { id: 15, particulars: 'Bank', indent: 3, totalYtd: 1005.00, currentPeriod: 825.00, previousYear: 180.00, comparePeriod: 1700.00 },
    { id: 16, particulars: 'Cust Test1', indent: 2, totalYtd: 2000.00, currentPeriod: 1000.00, previousYear: 1000.00, comparePeriod: 2000.00 },
    { id: 17, particulars: 'Cust1', indent: 2, totalYtd: 140.00, currentPeriod: 140.00, previousYear: null, comparePeriod: null },
    { id: 18, particulars: 'due date', indent: 2, totalYtd: 300.00, currentPeriod: 300.00, previousYear: null, comparePeriod: 300.00 },
    { id: 19, particulars: 'WA', indent: 2, totalYtd: 11759.00, currentPeriod: 11759.00, previousYear: null, comparePeriod: null },
    { id: 20, particulars: 'wa2', indent: 2, totalYtd: 3509.00, currentPeriod: 3509.00, previousYear: null, comparePeriod: null },
    { id: 21, particulars: 'Grand Total', indent: 1, isBold: true, totalYtd: 670788.50, currentPeriod: 267083.50, previousYear: 403905.00, comparePeriod: 16530.00 },
    { id: 22, particulars: 'HDFC Bank', indent: 2, totalYtd: 1500.00, currentPeriod: null, previousYear: 1500.00, comparePeriod: 1500.00 },
    { id: 23, particulars: 'LIABILITIES', indent: 0, isBold: true, totalYtd: 898878.00, currentPeriod: 27385.00, previousYear: 674925.00, comparePeriod: 5125.00 },
    { id: 24, particulars: 'Trade Payable', indent: 2, isBold: true, totalYtd: 898878.00, currentPeriod: 27385.00, previousYear: 674925.00, comparePeriod: 5125.00 }
  ]);

  // Form states to add new accounts manually
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticulars, setNewParticulars] = useState('');
  const [newIndent, setNewIndent] = useState<number>(2);
  const [newIsBold, setNewIsBold] = useState(false);
  const [newTotalYtd, setNewTotalYtd] = useState('');
  const [newCurrentPeriod, setNewCurrentPeriod] = useState('');
  const [newPreviousYear, setNewPreviousYear] = useState('');
  const [newComparePeriod, setNewComparePeriod] = useState('');

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticulars.trim()) return;

    const newRow: LedgerRow = {
      id: rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1,
      particulars: newParticulars.trim(),
      indent: Number(newIndent),
      isBold: newIsBold,
      totalYtd: newTotalYtd ? Number(newTotalYtd) : null,
      currentPeriod: newCurrentPeriod ? Number(newCurrentPeriod) : null,
      previousYear: newPreviousYear ? Number(newPreviousYear) : null,
      comparePeriod: newComparePeriod ? Number(newComparePeriod) : null
    };

    setRows([...rows, newRow]);
    setNewParticulars('');
    setNewTotalYtd('');
    setNewCurrentPeriod('');
    setNewPreviousYear('');
    setNewComparePeriod('');
    setShowAddForm(false);
  };

  const formatNumber = (num: number | null): string => {
    if (num === null) return '';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.particulars.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'assets') {
      return matchesSearch && (row.id <= 22 || row.particulars.toLowerCase().includes('asset'));
    }
    if (filterType === 'liabilities') {
      return matchesSearch && (row.id >= 23 || row.particulars.toLowerCase().includes('payable'));
    }
    return matchesSearch;
  });

  const handlePrint = () => {
    const comp = getActiveCompany();
    const isoText = getCompanyIsoText(comp);

    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #002D62; padding-bottom: 15px;">
          <h1 style="color: #002D62; margin: 0; font-size: 20px; text-transform: uppercase;">${comp.name}</h1>
          <p style="margin: 5px 0; font-size: 11px; color: #555;">${comp.address} | Phone: ${comp.phone} | TRN: ${comp.trn}</p>
          ${isoText ? `<p style="margin: 3px 0; font-size: 9.5px; font-weight: bold; color: #1e3a8a; letter-spacing: 0.5px;">${isoText}</p>` : ''}
          <h2 style="color: #FF6B00; margin: 10px 0 0 0; font-size: 15px; letter-spacing: 1px;">GENERAL LEDGER PARTICULAR COMPILATION</h2>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #CDE4F5; color: #002D62;">
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: center; width: 40px;">#</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: left;">Particulars</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: right;">Total YTD<br/><span style="font-size: 9px; font-weight: normal;">1 JAN 2021 - 31 DEC 2023</span></th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: right;">Current period<br/><span style="font-size: 9px; font-weight: normal;">JAN-DEC, 2023</span></th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: right;">Previous year I<br/><span style="font-size: 9px; font-weight: normal;">JAN-DEC, 2022</span></th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: right;">Compare period<br/><span style="font-size: 9px; font-weight: normal;">1 May 2022 - 30 APR 2023</span></th>
            </tr>
          </thead>
          <tbody>
            ${filteredRows.map(row => `
              <tr style="${row.isBold ? 'font-weight: bold; background-color: #F1F5F9;' : ''}">
                <td style="border: 1px solid #A6C4DE; padding: 6px; text-align: center;">${row.id}</td>
                <td style="border: 1px solid #A6C4DE; padding: 6px; padding-left: ${row.indent * 15 + 8}px; text-align: left;">
                  ${row.particulars}
                </td>
                <td style="border: 1px solid #A6C4DE; padding: 6px; text-align: right;">${formatNumber(row.totalYtd)}</td>
                <td style="border: 1px solid #A6C4DE; padding: 6px; text-align: right;">${formatNumber(row.currentPeriod)}</td>
                <td style="border: 1px solid #A6C4DE; padding: 6px; text-align: right;">${formatNumber(row.previousYear)}</td>
                <td style="border: 1px solid #A6C4DE; padding: 6px; text-align: right;">${formatNumber(row.comparePeriod)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 35px; display: flex; justify-content: space-between; font-size: 10px; color: #555;">
          <div>Report Compiled: ${new Date().toLocaleDateString()}</div>
          <div>Authorized Signature: _________________________</div>
        </div>
      </div>
    `;
    printHtml(htmlContent, `${comp.code || 'MFI'}_General_Ledger`);
  };

  const handleExportCSV = () => {
    let csv = '#,Particulars,Total YTD (1 JAN 2021 - 31 DEC 2023),Current period (JAN-DEC 2023),Previous year (JAN-DEC 2022),Compare period (1 May 2022 - 30 APR 2023)\n';
    rows.forEach(r => {
      const pName = ' '.repeat(r.indent * 2) + r.particulars;
      csv += `"${r.id}","${pName}","${r.totalYtd || ''}","${r.currentPeriod || ''}","${r.previousYear || ''}","${r.comparePeriod || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Particulars_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  return (
    <div className="box-shaped bg-white border border-[#A6C4DE] p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#A6C4DE]">
        <div>
          <h2 className="text-lg font-bold text-[#002D62] tracking-tight uppercase flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#002D62] inline-block"></span>
            Particulars General Ledger
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">
            Corporate comparison report & account balances for Marine Fasteners Industries LLC
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn px-3 py-1.5 bg-[#002D62] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-[#1F4E79]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn px-3 py-1.5 bg-[#1F4E79] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-[#1A5276]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn px-3 py-1.5 bg-[#FF6B00] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-orange-600"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRow} className="bg-slate-50 border border-[#A6C4DE] p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-3 pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold text-[#002D62] uppercase">Insert New Ledger Item</h3>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Particulars Name</label>
            <input
              type="text"
              required
              value={newParticulars}
              onChange={e => setNewParticulars(e.target.value)}
              placeholder="e.g. Petty Cash"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Indentation Level</label>
            <select value={newIndent} onChange={e => setNewIndent(Number(e.target.value))} className="w-full">
              <option value="0">Level 0 (Main Group, e.g. ASSETS)</option>
              <option value="1">Level 1 (Sub Group, e.g. Current Assets)</option>
              <option value="2">Level 2 (Control, e.g. Cash & Bank)</option>
              <option value="3">Level 3 (Account, e.g. Bank Account)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="isBold"
              checked={newIsBold}
              onChange={e => setNewIsBold(e.target.checked)}
              className="rounded-none accent-[#002D62]"
            />
            <label htmlFor="isBold" className="text-[10px] font-bold text-slate-600 uppercase cursor-pointer">
              Bold Font Row
            </label>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Total YTD Balance</label>
            <input
              type="number"
              step="0.01"
              value={newTotalYtd}
              onChange={e => setNewTotalYtd(e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Current Period Amt (2023)</label>
            <input
              type="number"
              step="0.01"
              value={newCurrentPeriod}
              onChange={e => setNewCurrentPeriod(e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Previous Year Amt (2022)</label>
            <input
              type="number"
              step="0.01"
              value={newPreviousYear}
              onChange={e => setNewPreviousYear(e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Compare Period Amt</label>
            <input
              type="number"
              step="0.01"
              value={newComparePeriod}
              onChange={e => setNewComparePeriod(e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-trojan-reset px-3 py-1 rounded-none text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-trojan-search px-4 py-1 rounded-none text-xs">
              Save Account Row
            </button>
          </div>
        </form>
      )}

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Particulars account..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-[#A9A9A9]"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`btn text-xs px-3 py-1.5 border ${
              filterType === 'all' ? 'bg-[#002D62] text-white border-[#002D62]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setFilterType('assets')}
            className={`btn text-xs px-3 py-1.5 border ${
              filterType === 'assets' ? 'bg-[#002D62] text-white border-[#002D62]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Assets Only
          </button>
          <button
            onClick={() => setFilterType('liabilities')}
            className={`btn text-xs px-3 py-1.5 border ${
              filterType === 'liabilities' ? 'bg-[#002D62] text-white border-[#002D62]' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Liabilities Only
          </button>
        </div>
      </div>

      {/* Structured Ledger Table strictly adhering to custom box-shaped rules */}
      <div className="overflow-x-auto shadow-xs border border-[#A6C4DE]">
        <table className="box-shaped-table m-0">
          <thead>
            <tr>
              <th rowSpan={2} className="w-[50px] border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-center text-xs font-bold font-mono">#</th>
              <th rowSpan={2} className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-left text-xs font-bold">Particulars</th>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-xs font-bold">Total YTD</th>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-xs font-bold">Current period</th>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-xs font-bold">Previous year I</th>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-xs font-bold">Compare period</th>
            </tr>
            <tr>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-[10px] font-mono font-medium">1 JAN 2021 - 31 DEC 2023</th>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-[10px] font-mono font-medium">JAN-DEC, 2023</th>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-[10px] font-mono font-medium">JAN-DEC, 2022</th>
              <th className="border border-[#A6C4DE] bg-[#CDE4F5] text-[#002D62] text-right text-[10px] font-mono font-medium">1 May 2022 - 30 APR 2023</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => {
              // Custom indent paddings based on hierarchical level
              const paddingLeftVal = row.indent * 20 + 12;
              return (
                <tr key={row.id} className={`${row.isBold ? 'font-bold bg-slate-50' : ''}`}>
                  <td className="text-center font-mono text-slate-500 border border-[#A6C4DE] py-2 text-xs">
                    {row.id}
                  </td>
                  <td 
                    className="border border-[#A6C4DE] py-2 text-xs text-left"
                    style={{ paddingLeft: `${paddingLeftVal}px` }}
                  >
                    <span className={row.isBold ? 'text-[#002D62]' : 'text-black font-medium'}>
                      {row.particulars}
                    </span>
                  </td>
                  <td className="border border-[#A6C4DE] py-2 text-xs text-right font-mono">
                    {formatNumber(row.totalYtd)}
                  </td>
                  <td className="border border-[#A6C4DE] py-2 text-xs text-right font-mono">
                    {formatNumber(row.currentPeriod)}
                  </td>
                  <td className="border border-[#A6C4DE] py-2 text-xs text-right font-mono">
                    {formatNumber(row.previousYear)}
                  </td>
                  <td className="border border-[#A6C4DE] py-2 text-xs text-right font-mono">
                    {formatNumber(row.comparePeriod)}
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                  No matching general ledger particulars accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
