import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Printer, Download, Plus, Building2, Edit3, X, Check, Trash2, FileEdit, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, updateCompany, CompanyProfile, getCompanyIsoText } from '../utils/companyProfile';

interface DaybookEntry {
  id: string;
  companyId: string;
  date: string;
  particulars: string;
  voucherType: 'TAX INVOICE' | 'DELIVERY NOTE' | 'PURCHASE' | 'WORK ORDER' | 'RECEIPT VOUCHER' | 'CREDIT NOTE';
  voucherNo: string;
  debit: number | null;
  credit: number | null;
  status: 'POSTED' | 'PENDING' | 'DRAFT';
}

const INITIAL_DAYBOOK_ENTRIES: DaybookEntry[] = [
  // Marine Fasteners (comp-mfi)
  { id: 'mfi-db-1', companyId: 'comp-mfi', date: '2026-07-16', particulars: 'ZAMIL HEAVY INDUSTRIES LTD', voucherType: 'TAX INVOICE', voucherNo: 'MFI-INV-2026-042', debit: 45200.00, credit: null, status: 'POSTED' },
  { id: 'mfi-db-2', companyId: 'comp-mfi', date: '2026-07-16', particulars: 'AL SHOLA STEEL TRADING LLC', voucherType: 'RECEIPT VOUCHER', voucherNo: 'MFI-RV-2026-081', debit: null, credit: 15000.00, status: 'POSTED' },
  { id: 'mfi-db-3', companyId: 'comp-mfi', date: '2026-07-15', particulars: 'NIPPON STEEL ASIA LLC', voucherType: 'PURCHASE', voucherNo: 'MFI-PO-2026-015', debit: 112000.00, credit: null, status: 'POSTED' },
  { id: 'mfi-db-4', companyId: 'comp-mfi', date: '2026-07-15', particulars: 'EMIRATES FASTENERS FACTORY', voucherType: 'WORK ORDER', voucherNo: 'MFI-WO-2026-105', debit: 8500.00, credit: null, status: 'POSTED' },
  { id: 'mfi-db-5', companyId: 'comp-mfi', date: '2026-07-14', particulars: 'GULF FASTENERS DISTRIBUTORS', voucherType: 'DELIVERY NOTE', voucherNo: 'MFI-DN-2026-302', debit: null, credit: null, status: 'POSTED' },
  { id: 'mfi-db-6', companyId: 'comp-mfi', date: '2026-07-14', particulars: 'AL JABER MARINE SERVICES', voucherType: 'TAX INVOICE', voucherNo: 'MFI-INV-2026-041', debit: 22450.00, credit: null, status: 'POSTED' },
  { id: 'mfi-db-7', companyId: 'comp-mfi', date: '2026-07-13', particulars: 'ZAMIL HEAVY INDUSTRIES LTD', voucherType: 'RECEIPT VOUCHER', voucherNo: 'MFI-RV-2026-080', debit: null, credit: 30000.00, status: 'POSTED' },
  { id: 'mfi-db-8', companyId: 'comp-mfi', date: '2026-07-13', particulars: 'CRESCENT METAL INDUSTRIES', voucherType: 'CREDIT NOTE', voucherNo: 'MFI-CN-2026-004', debit: null, credit: 4100.00, status: 'POSTED' },
  { id: 'mfi-db-9', companyId: 'comp-mfi', date: '2026-07-17', particulars: 'AJMAN MARITIME REPAIR YARD', voucherType: 'TAX INVOICE', voucherNo: 'MFI-INV-2026-043', debit: 18750.00, credit: null, status: 'DRAFT' },

  // Boltmaster (comp-bmm)
  { id: 'bmm-db-1', companyId: 'comp-bmm', date: '2026-07-16', particulars: 'EMIRATES BUILDING CONTRACTING LLC', voucherType: 'TAX INVOICE', voucherNo: 'BMM-INV-2026-101', debit: 34500.00, credit: null, status: 'POSTED' },
  { id: 'bmm-db-2', companyId: 'comp-bmm', date: '2026-07-15', particulars: 'DUBAI HARDWARE WHOLESALERS', voucherType: 'RECEIPT VOUCHER', voucherNo: 'BMM-RV-2026-055', debit: null, credit: 20000.00, status: 'POSTED' },
  { id: 'bmm-db-3', companyId: 'comp-bmm', date: '2026-07-14', particulars: 'GLOBAL FASTENERS SUPPLIES FZE', voucherType: 'PURCHASE', voucherNo: 'BMM-PO-2026-033', debit: 58000.00, credit: null, status: 'POSTED' },
  { id: 'bmm-db-4', companyId: 'comp-bmm', date: '2026-07-13', particulars: 'AL QUOZ CONTRACTING EST', voucherType: 'DELIVERY NOTE', voucherNo: 'BMM-DN-2026-112', debit: null, credit: null, status: 'POSTED' },
  { id: 'bmm-db-5', companyId: 'comp-bmm', date: '2026-07-12', particulars: 'AL SHOLA HARDWARE TRADING', voucherType: 'TAX INVOICE', voucherNo: 'BMM-INV-2026-100', debit: 18900.00, credit: null, status: 'POSTED' },

  // United Metal (comp-umi)
  { id: 'umi-db-1', companyId: 'comp-umi', date: '2026-07-16', particulars: 'HABTOOR HEAVY ENGINEERING PJSC', voucherType: 'TAX INVOICE', voucherNo: 'UMI-INV-2026-008', debit: 88400.00, credit: null, status: 'POSTED' },
  { id: 'umi-2', companyId: 'comp-umi', date: '2026-07-15', particulars: 'NATIONAL GALVANIZING WORKS LLC', voucherType: 'WORK ORDER', voucherNo: 'UMI-WO-2026-012', debit: 26500.00, credit: null, status: 'POSTED' },
  { id: 'umi-3', companyId: 'comp-umi', date: '2026-07-14', particulars: 'MIDDLE EAST STEEL FABRICATORS', voucherType: 'RECEIPT VOUCHER', voucherNo: 'UMI-RV-2026-044', debit: null, credit: 50000.00, status: 'POSTED' },
  { id: 'umi-4', companyId: 'comp-umi', date: '2026-07-13', particulars: 'SABIC HEAVY BILLET SUPPLIES', voucherType: 'PURCHASE', voucherNo: 'UMI-PO-2026-009', debit: 195000.00, credit: null, status: 'POSTED' }
];

export default function DaybookComponent() {
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Editable Header State
  const [headerTitle, setHeaderTitle] = useState(() => {
    return localStorage.getItem(`DAYBOOK_HEADER_TITLE_${getActiveCompany().id}`) || 'DAILY TRANSACTIONAL DAYBOOK';
  });
  const [headerSubtitle, setHeaderSubtitle] = useState(() => {
    return localStorage.getItem(`DAYBOOK_HEADER_SUBTITLE_${getActiveCompany().id}`) || '';
  });
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState(activeCompany.name);
  const [editAddress, setEditAddress] = useState(activeCompany.address);
  const [editPhone, setEditPhone] = useState(activeCompany.phone);
  const [editTrn, setEditTrn] = useState(activeCompany.trn);

  // Sync active company from localStorage / storage events
  useEffect(() => {
    const handleSync = () => {
      const comp = getActiveCompany();
      setActiveCompany(comp);
      setHeaderTitle(localStorage.getItem(`DAYBOOK_HEADER_TITLE_${comp.id}`) || 'DAILY TRANSACTIONAL DAYBOOK');
      setHeaderSubtitle(localStorage.getItem(`DAYBOOK_HEADER_SUBTITLE_${comp.id}`) || '');
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    window.addEventListener('active_company_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
      window.removeEventListener('active_company_changed', handleSync);
    };
  }, []);

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`DAYBOOK_HEADER_TITLE_${activeCompany.id}`, headerTitle);
    localStorage.setItem(`DAYBOOK_HEADER_SUBTITLE_${activeCompany.id}`, headerSubtitle);

    updateCompany({
      ...activeCompany,
      name: editCompanyName,
      address: editAddress,
      phone: editPhone,
      trn: editTrn
    });

    setShowHeaderModal(false);
  };

  const [entries, setEntries] = useState<DaybookEntry[]>(() => {
    const saved = localStorage.getItem('MFI_DAYBOOK_RECORDS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_DAYBOOK_ENTRIES;
  });

  // Save changes
  useEffect(() => {
    localStorage.setItem('MFI_DAYBOOK_RECORDS', JSON.stringify(entries));
  }, [entries]);

  const [showAdd, setShowAdd] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newParticulars, setNewParticulars] = useState('');
  const [newType, setNewType] = useState<DaybookEntry['voucherType']>('TAX INVOICE');
  const [newNo, setNewNo] = useState('');
  const [newDebit, setNewDebit] = useState('');
  const [newCredit, setNewCredit] = useState('');
  const [newStatus, setNewStatus] = useState<DaybookEntry['status']>('POSTED');

  // Edit Entry Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DaybookEntry | null>(null);

  const codePrefix = activeCompany.code || 'MFI';

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticulars.trim() || !newNo.trim()) return;

    const entry: DaybookEntry = {
      id: `${activeCompany.code.toLowerCase()}-db-${Date.now()}`,
      companyId: activeCompany.id,
      date: newDate,
      particulars: newParticulars.trim(),
      voucherType: newType,
      voucherNo: newNo.trim(),
      debit: newDebit ? Number(newDebit) : null,
      credit: newCredit ? Number(newCredit) : null,
      status: newStatus
    };

    setEntries([entry, ...entries]);
    setNewParticulars('');
    setNewNo('');
    setNewDebit('');
    setNewCredit('');
    setShowAdd(false);
  };

  const handleStartEdit = (entry: DaybookEntry) => {
    setEditingEntry({ ...entry });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    setEntries(prev => prev.map(entry => entry.id === editingEntry.id ? editingEntry : entry));
    setShowEditModal(false);
    setEditingEntry(null);
  };

  const handleQuickPost = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, status: 'POSTED' } : entry));
  };

  const handleDeleteEntry = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this Daybook entry?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
      if (editingEntry?.id === id) {
        setShowEditModal(false);
        setEditingEntry(null);
      }
    }
  };

  // Strictly filter by active company!
  const companyEntries = entries.filter(e => {
    return (e.companyId === activeCompany.id) ||
      (!e.companyId && e.voucherNo.startsWith(activeCompany.code || 'MFI'));
  });

  const draftCount = companyEntries.filter(e => e.status === 'DRAFT').length;
  const pendingCount = companyEntries.filter(e => e.status === 'PENDING').length;
  const postedCount = companyEntries.filter(e => e.status === 'POSTED').length;

  const filtered = companyEntries.filter(e => {
    const matchesSearch = e.particulars.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.voucherNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || e.voucherType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || e.status === selectedStatus;
    const matchesDate = !dateFilter || e.date === dateFilter;
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handlePrint = () => {
    const isoText = getCompanyIsoText(activeCompany);
    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; padding: 25px;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #002D62; padding-bottom: 12px;">
          <h1 style="color: #002D62; margin: 0; font-size: 20px; text-transform: uppercase;">${activeCompany.name}</h1>
          <p style="margin: 4px 0; font-size: 11px; color: #555;">${activeCompany.address || 'United Arab Emirates (UAE)'} | Phone: ${activeCompany.phone || '+971 6 525 0526'} | TRN: ${activeCompany.trn || '100440509600003'}</p>
          ${isoText ? `<p style="margin: 3px 0; font-size: 9.5px; font-weight: bold; color: #1e3a8a; letter-spacing: 0.5px;">${isoText}</p>` : ''}
          <h2 style="color: #FF6B00; margin: 8px 0 0 0; font-size: 14px; letter-spacing: 1.5px;">${headerTitle.toUpperCase()} (${activeCompany.code})</h2>
          ${headerSubtitle ? `<p style="margin: 3px 0 0 0; font-size: 10px; color: #64748b; font-style: italic;">${headerSubtitle}</p>` : ''}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px;">
          <thead>
            <tr style="background-color: #CDE4F5; color: #002D62;">
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: center;">Date</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: left;">Particulars Name</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: center;">Voucher Type</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: center;">Voucher No</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: right;">Debit (AED)</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: right;">Credit (AED)</th>
              <th style="border: 1px solid #A6C4DE; padding: 8px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(entry => `
              <tr>
                <td style="border: 1px solid #A6C4DE; padding: 7px; text-align: center;">${entry.date}</td>
                <td style="border: 1px solid #A6C4DE; padding: 7px; text-align: left;">${entry.particulars}</td>
                <td style="border: 1px solid #A6C4DE; padding: 7px; text-align: center;">${entry.voucherType}</td>
                <td style="border: 1px solid #A6C4DE; padding: 7px; text-align: center; font-family: monospace;">${entry.voucherNo}</td>
                <td style="border: 1px solid #A6C4DE; padding: 7px; text-align: right;">${entry.debit ? entry.debit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
                <td style="border: 1px solid #A6C4DE; padding: 7px; text-align: right;">${entry.credit ? entry.credit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
                <td style="border: 1px solid #A6C4DE; padding: 7px; text-align: center; font-weight: bold; color: ${entry.status === 'POSTED' ? 'green' : entry.status === 'DRAFT' ? '#be123c' : 'orange'}">${entry.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    printHtml(htmlContent, `${activeCompany.code || 'MFI'}_Daybook`);
  };

  return (
    <div className="box-shaped bg-white border border-[#A6C4DE] p-6 space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#A6C4DE]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#002D62] uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-6 bg-[#FF6B00] inline-block"></span>
              {headerTitle || 'Chronological Daily Daybook'}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#002D62] border border-blue-200">
              <Building2 className="w-3 h-3 text-[#FF6B00]" />
              {activeCompany.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">
            {headerSubtitle || `Track, query, edit drafts, and verify real-time debits and credits for ${activeCompany.shortName || activeCompany.name}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditCompanyName(activeCompany.name);
              setEditAddress(activeCompany.address);
              setEditPhone(activeCompany.phone);
              setEditTrn(activeCompany.trn);
              setShowHeaderModal(true);
            }}
            className="btn px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-all"
            title="Edit Daybook Header & Company Information"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>EDIT HEADER</span>
          </button>
          <button
            onClick={() => {
              if (!showAdd) {
                setNewNo(`${codePrefix}-INV-2026-${Math.floor(100 + Math.random() * 900)}`);
              }
              setShowAdd(!showAdd);
            }}
            className="btn px-3.5 py-1.5 bg-[#002D62] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-[#1F4E79]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Transaction / Draft</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn px-3.5 py-1.5 bg-[#FF6B00] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-orange-600"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Daybook</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAddEntry} className="bg-slate-50 border border-[#A6C4DE] p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-4 pb-1 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#002D62] uppercase">Manually Record Daybook Entry / Draft ({activeCompany.name})</h3>
            <span className="text-[10px] text-slate-500 font-mono">You can set status as DRAFT to edit and post later</span>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Posting Date</label>
            <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Particulars / Client</label>
            <input type="text" required value={newParticulars} onChange={e => setNewParticulars(e.target.value)} placeholder="Client / Supplier Name" className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Voucher Type</label>
            <select value={newType} onChange={e => setNewType(e.target.value as any)} className="w-full">
              <option value="TAX INVOICE">TAX INVOICE</option>
              <option value="DELIVERY NOTE">DELIVERY NOTE</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="WORK ORDER">WORK ORDER</option>
              <option value="RECEIPT VOUCHER">RECEIPT VOUCHER</option>
              <option value="CREDIT NOTE">CREDIT NOTE</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Voucher No</label>
            <input type="text" required value={newNo} onChange={e => setNewNo(e.target.value)} placeholder={`${codePrefix}-INV-2026-001`} className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Debit Amount (AED)</label>
            <input type="number" step="0.01" value={newDebit} onChange={e => setNewDebit(e.target.value)} placeholder="0.00" className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Credit Amount (AED)</label>
            <input type="number" step="0.01" value={newCredit} onChange={e => setNewCredit(e.target.value)} placeholder="0.00" className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as any)} className="w-full font-bold">
              <option value="POSTED">POSTED (Final Entry)</option>
              <option value="DRAFT">DRAFT (Editable Later)</option>
              <option value="PENDING">PENDING (Pending Approval)</option>
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-trojan-reset text-xs">Cancel</button>
            <button type="submit" className="btn-trojan-search text-xs flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Options & Quick Status Tabs */}
      <div className="space-y-2">
        {/* Status Filter Tabs with Counts */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-[10px] font-bold text-slate-500 uppercase font-mono mr-1">Status Filter:</span>
          <button
            type="button"
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-[#002D62] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Entries ({companyEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('DRAFT')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'DRAFT'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Drafts ({draftCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('POSTED')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'POSTED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Posted ({postedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('PENDING')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'PENDING'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-3 border border-[#A6C4DE]/60">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeCompany.shortName || activeCompany.name} particulars name or voucher no...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Type:</span>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="text-xs bg-white border border-slate-300 py-1 px-2">
                <option value="ALL">ALL VOUCHERS</option>
                <option value="TAX INVOICE">TAX INVOICES</option>
                <option value="DELIVERY NOTE">DELIVERY NOTES</option>
                <option value="PURCHASE">PURCHASES</option>
                <option value="WORK ORDER">WORK ORDERS</option>
                <option value="RECEIPT VOUCHER">RECEIPTS</option>
                <option value="CREDIT NOTE">CREDIT NOTES</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="text-xs border border-slate-300 py-1 px-2"
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="text-red-500 text-xs font-bold hover:underline cursor-pointer">Clear</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Daybook table with Actions (Edit Draft / Post / Delete) */}
      <div className="overflow-x-auto shadow-xs border border-[#A6C4DE]">
        <table className="box-shaped-table m-0">
          <thead>
            <tr>
              <th className="w-[95px]">Date</th>
              <th className="text-left">Particulars / Client Name</th>
              <th>Voucher Type</th>
              <th>Voucher No</th>
              <th className="text-right">Debit (AED)</th>
              <th className="text-right">Credit (AED)</th>
              <th className="w-[90px]">Status</th>
              <th className="text-center w-[130px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => {
              const isDraft = e.status === 'DRAFT';
              const isPending = e.status === 'PENDING';
              return (
                <tr key={e.id} className={isDraft ? 'bg-rose-50/40 hover:bg-rose-50/80' : 'hover:bg-slate-50/60'}>
                  <td className="text-center font-mono text-slate-600">{e.date}</td>
                  <td className="text-left font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span>{e.particulars}</span>
                      {isDraft && (
                        <span className="text-[8px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-black uppercase tracking-tight">
                          Draft
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase font-mono">
                      {e.voucherType}
                    </span>
                  </td>
                  <td className="text-center font-mono font-bold text-slate-900">{e.voucherNo}</td>
                  <td className="text-right font-mono text-green-700 font-semibold">
                    {e.debit ? e.debit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}
                  </td>
                  <td className="text-right font-mono text-indigo-700 font-semibold">
                    {e.credit ? e.credit.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}
                  </td>
                  <td className="text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded ${
                      e.status === 'POSTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      e.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-rose-50 text-rose-700 border-rose-300 font-black'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(e)}
                        className={`p-1 px-2 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-all ${
                          isDraft
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                        title={isDraft ? "Edit this Draft Daybook entry" : "Edit Daybook entry"}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isDraft ? 'Edit Draft' : 'Edit'}</span>
                      </button>

                      {isDraft && (
                        <button
                          type="button"
                          onClick={(evt) => handleQuickPost(e.id, evt)}
                          className="p-1 px-1.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition-all shadow-2xs"
                          title="Post this draft directly to final Daybook"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(evt) => handleDeleteEntry(e.id, evt)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer transition-all"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-400 text-xs">
                  No transaction entries found for {activeCompany.name} matching the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT DAYBOOK ENTRY / DRAFT MODAL */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-5 border border-slate-300 font-sans animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-[#002D62]">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase">
                    {editingEntry.status === 'DRAFT' ? 'Edit Daybook Draft Entry' : 'Edit Daybook Transaction Entry'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    ID: {editingEntry.id} &bull; Company: {activeCompany.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    Posting Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingEntry.date}
                    onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    Voucher Type
                  </label>
                  <select
                    value={editingEntry.voucherType}
                    onChange={(e) => setEditingEntry({ ...editingEntry, voucherType: e.target.value as any })}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-semibold"
                  >
                    <option value="TAX INVOICE">TAX INVOICE</option>
                    <option value="DELIVERY NOTE">DELIVERY NOTE</option>
                    <option value="PURCHASE">PURCHASE</option>
                    <option value="WORK ORDER">WORK ORDER</option>
                    <option value="RECEIPT VOUCHER">RECEIPT VOUCHER</option>
                    <option value="CREDIT NOTE">CREDIT NOTE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Particulars / Client or Supplier Name
                </label>
                <input
                  type="text"
                  required
                  value={editingEntry.particulars}
                  onChange={(e) => setEditingEntry({ ...editingEntry, particulars: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold uppercase"
                  placeholder="Client / Supplier Name"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Voucher No / Document Ref
                </label>
                <input
                  type="text"
                  required
                  value={editingEntry.voucherNo}
                  onChange={(e) => setEditingEntry({ ...editingEntry, voucherNo: e.target.value.toUpperCase() })}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold"
                  placeholder="e.g. MFI-INV-2026-042"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    Debit Amount (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.debit !== null && editingEntry.debit !== undefined ? editingEntry.debit : ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, debit: e.target.value ? Number(e.target.value) : null })}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono text-green-700 font-bold"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    Credit Amount (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingEntry.credit !== null && editingEntry.credit !== undefined ? editingEntry.credit : ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, credit: e.target.value ? Number(e.target.value) : null })}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono text-indigo-700 font-bold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Entry Status
                </label>
                <select
                  value={editingEntry.status}
                  onChange={(e) => setEditingEntry({ ...editingEntry, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                >
                  <option value="POSTED">POSTED — Finalized in Official Ledger</option>
                  <option value="DRAFT">DRAFT — Incomplete / Work In Progress</option>
                  <option value="PENDING">PENDING — Waiting for Verification</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(editingEntry.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Entry</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEntry(null);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Update Entry</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DAYBOOK HEADER MODAL */}
      {showHeaderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 border border-slate-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#002D62]" />
                <h3 className="font-bold text-sm text-slate-800 uppercase">
                  Edit Daily Transaction Daybook Header
                </h3>
              </div>
              <button
                onClick={() => setShowHeaderModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHeader} className="mt-4 space-y-3 font-sans">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Daybook Document Header Title
                </label>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  placeholder="e.g. DAILY TRANSACTIONAL DAYBOOK"
                  required
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Header Subtitle / Notes
                </label>
                <input
                  type="text"
                  value={headerSubtitle}
                  onChange={(e) => setHeaderSubtitle(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  placeholder="e.g. Chronological audit register of company vouchers"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Registered Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    TRN Number
                  </label>
                  <input
                    type="text"
                    value={editTrn}
                    onChange={(e) => setEditTrn(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                    Telephone / Contact
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowHeaderModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002D62] hover:bg-[#001f44] text-white text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Header Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


