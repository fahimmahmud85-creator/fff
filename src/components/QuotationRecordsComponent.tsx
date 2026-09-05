import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Search, Plus, Trash2, Printer, Download, Eye, Edit, Copy, Check,
  ArrowUpDown, Filter, ChevronDown, CheckCircle, CheckCircle2, Clock, XCircle,
  FileSpreadsheet, FileText, Building, Phone, Mail, RotateCcw,
  SlidersHorizontal, X, ArrowUpRight, ShieldCheck, CheckSquare,
  Square, Calendar, Sparkles, Lock, Unlock, UserCheck, Shield, Building2,
  Briefcase, User
} from 'lucide-react';
import { CustomerRecord, QuotationRecord, INITIAL_QUOTATIONS } from '../customerData';
import { AppUser } from '../types';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';
import { RecordsFooterShortcutsBar } from './RecordsFooterShortcutsBar';

interface QuotationRecordsComponentProps {
  quotationRecords: QuotationRecord[];
  setQuotationRecords: React.Dispatch<React.SetStateAction<QuotationRecord[]>>;
  customers: CustomerRecord[];
  onNavigateToQuoteForm: () => void;
  onLoadQuoteIntoForm: (quote: QuotationRecord) => void;
  onViewQuotePreview: (quote: QuotationRecord) => void;
  triggerToast?: (msg: string) => void;
  currentUser?: AppUser | null;
}

type DensityMode = 'ultra' | 'compact' | 'standard';
type StatusFilter = 'all' | 'win' | 'open' | 'lost' | 'closed';
type SortField = 'date' | 'ref' | 'client' | 'amount' | 'status';

export default function QuotationRecordsComponent({
  quotationRecords,
  setQuotationRecords,
  customers,
  onNavigateToQuoteForm,
  onLoadQuoteIntoForm,
  onViewQuotePreview,
  triggerToast,
  currentUser
}: QuotationRecordsComponentProps) {
  // Active logged-in company with real-time state sync
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);

  useEffect(() => {
    const handleCompanyUpdate = () => {
      setActiveCompany(getActiveCompany());
    };

    window.addEventListener('active_company_changed', handleCompanyUpdate);
    window.addEventListener('company_profile_updated', handleCompanyUpdate);
    window.addEventListener('companies_list_updated', handleCompanyUpdate);
    return () => {
      window.removeEventListener('active_company_changed', handleCompanyUpdate);
      window.removeEventListener('company_profile_updated', handleCompanyUpdate);
      window.removeEventListener('companies_list_updated', handleCompanyUpdate);
    };
  }, []);

  // User Role & Clearance Identification
  const isAdmin = useMemo(() => {
    if (!currentUser) return true; // Default admin if no gate
    return currentUser.role === 'Admin';
  }, [currentUser]);

  const isViewer = currentUser?.role === 'Viewer';
  const isEditor = currentUser?.role === 'Editor';

  // Current calendar month & year for default view
  const currentCalendarMonth = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  }, []);
  const currentCalendarYear = useMemo(() => {
    return new Date().getFullYear().toString();
  }, []);

  // Filters & Search: Default to Current Month & Current Year
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>(currentCalendarYear);
  const [monthFilter, setMonthFilter] = useState<string>(currentCalendarMonth);
  const [sellerFilter, setSellerFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [density, setDensity] = useState<DensityMode>('compact');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [hiddenQuoteIds, setHiddenQuoteIds] = useState<string[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Multi-Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Edit / Add Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<QuotationRecord | null>(null);
  const [isNewRecordMode, setIsNewRecordMode] = useState(false);

  // Form fields for modal
  const [modalForm, setModalForm] = useState<Partial<QuotationRecord>>({
    rfqDate: '',
    rfqNumber: '',
    tenderNo: '',
    tenderDate: '',
    quotationRef: '',
    quotationDate: '',
    amount: 0,
    client: '',
    inquiryBy: '',
    seller: 'MR. ASIF',
    companyId: 'comp-mfi',
    email: '',
    mobile: '',
    phone: '',
    steelOpen: true,
    closed: false,
    win: false,
    lost: false,
    notes: '',
    month: currentCalendarMonth
  });

  // Check if a record is assigned/owned by the currently logged-in user
  const isRecordOwnedByUser = (q: QuotationRecord): boolean => {
    if (isAdmin) return true; // Admin can view all data every seller
    if (!currentUser) return true;

    const userKeywords = [
      currentUser.firstName,
      currentUser.secondName,
      `${currentUser.firstName || ''} ${currentUser.secondName || ''}`.trim(),
      currentUser.uniqueId,
      currentUser.email,
      currentUser.position
    ].filter(Boolean).map(k => k.toLowerCase());

    const recordSeller = (q.seller || q.inquiryBy || '').toLowerCase();
    if (!recordSeller) return true; // Fallback to accessible if unassigned

    return userKeywords.some(keyword => {
      if (!keyword || keyword.length < 2) return false;
      return recordSeller.includes(keyword) || keyword.includes(recordSeller);
    });
  };

  // Helper to extract year from record
  const getRecordYear = (q: QuotationRecord): string => {
    if (q.quotationDate) {
      const match4 = q.quotationDate.match(/20\d{2}/);
      if (match4) return match4[0];
      const match2 = q.quotationDate.match(/(?:^|[-/])(\d{2})$/);
      if (match2 && match2[1]) {
        const num = parseInt(match2[1], 10);
        if (num >= 20 && num <= 50) return `20${match2[1]}`;
      }
    }
    if (q.quotationRef) {
      const match4 = q.quotationRef.match(/20\d{2}/);
      if (match4) return match4[0];
    }
    if (q.rfqDate) {
      const match4 = q.rfqDate.match(/20\d{2}/);
      if (match4) return match4[0];
      const match2 = q.rfqDate.match(/(?:^|[-/])(\d{2})$/);
      if (match2 && match2[1]) {
        const num = parseInt(match2[1], 10);
        if (num >= 20 && num <= 50) return `20${match2[1]}`;
      }
    }
    return '2026';
  };

  // Helper to normalize month from record
  const getRecordMonth = (q: QuotationRecord): string => {
    if (q.month && q.month.trim()) {
      const found = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ].find(m => m.toLowerCase() === q.month?.toLowerCase().trim());
      if (found) return found;
      return q.month.trim();
    }
    if (q.quotationDate) {
      const d = q.quotationDate.toLowerCase();
      if (d.includes('jan')) return 'January';
      if (d.includes('feb')) return 'February';
      if (d.includes('mar')) return 'March';
      if (d.includes('apr')) return 'April';
      if (d.includes('may')) return 'May';
      if (d.includes('jun')) return 'June';
      if (d.includes('jul')) return 'July';
      if (d.includes('aug')) return 'August';
      if (d.includes('sep')) return 'September';
      if (d.includes('oct')) return 'October';
      if (d.includes('nov')) return 'November';
      if (d.includes('dec')) return 'December';
    }
    return currentCalendarMonth;
  };

  // Available Years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>(['2026', '2025', '2024']);
    quotationRecords.forEach(r => {
      const yr = getRecordYear(r);
      if (yr) yearsSet.add(yr);
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [quotationRecords]);

  // Available Sellers List for Admin Dropdown
  const availableSellers = useMemo(() => {
    const sellers = new Set<string>(['MR. ASIF', 'FAISAL', 'FAHIM', 'STAFF']);
    quotationRecords.forEach(r => {
      if (r.seller && r.seller.trim()) sellers.add(r.seller.trim().toUpperCase());
      else if (r.inquiryBy && r.inquiryBy.trim()) sellers.add(r.inquiryBy.trim().toUpperCase());
    });
    return Array.from(sellers).sort();
  }, [quotationRecords]);

  // Filtered and Sorted Records with Strict Role & Company Clearance
  const filteredRecords = useMemo(() => {
    const compId = activeCompany.id || 'comp-mfi';
    const compCode = (activeCompany.code || 'MFI').toUpperCase();

    return quotationRecords.filter(q => {
      if (hiddenQuoteIds.includes(q.id)) return false;

      // 1. Strict Company Data Segregation: Only show records for the logged-in company
      if (q.companyId) {
        if (q.companyId !== compId) return false;
      } else {
        if (compCode === 'MFI' && (q.quotationRef?.startsWith('BMM') || q.quotationRef?.startsWith('UMI'))) return false;
        if (compCode === 'BMM' && !q.quotationRef?.startsWith('BMM')) return false;
        if (compCode === 'UMI' && !q.quotationRef?.startsWith('UMI')) return false;
      }

      // 2. Role-based clearance: If Viewer or Editor, can ONLY see their own records
      if (!isRecordOwnedByUser(q)) {
        return false;
      }

      // From / To date filter if specified
      if (fromDate || toDate) {
        const qDate = q.quotationDate || q.rfqDate || '';
        if (qDate) {
          if (fromDate && qDate < fromDate) return false;
          if (toDate && qDate > toDate) return false;
        }
      }

      // 3. Admin Seller Filter
      if (isAdmin && sellerFilter !== 'All') {
        const qSeller = (q.seller || q.inquiryBy || '').toUpperCase();
        if (!qSeller.includes(sellerFilter.toUpperCase())) {
          return false;
        }
      }

      // 4. Year Filter (only when custom date range is not explicitly overriding)
      if (!fromDate && !toDate && yearFilter !== 'All') {
        const qYear = getRecordYear(q);
        if (qYear !== yearFilter) return false;
      }

      // 5. Month Filter (only when custom date range is not explicitly overriding)
      if (!fromDate && !toDate && monthFilter !== 'All') {
        const qMonth = getRecordMonth(q);
        if (qMonth.toLowerCase() !== monthFilter.toLowerCase()) {
          return false;
        }
      }

      // 6. Status Filter
      if (statusFilter === 'win' && !q.win) return false;
      if (statusFilter === 'open' && !q.steelOpen) return false;
      if (statusFilter === 'lost' && !q.lost) return false;
      if (statusFilter === 'closed' && !q.closed) return false;

      // 7. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesClient = q.client?.toLowerCase().includes(query);
        const matchesRef = q.quotationRef?.toLowerCase().includes(query);
        const matchesRfq = q.rfqNumber?.toLowerCase().includes(query);
        const matchesTender = q.tenderNo?.toLowerCase().includes(query);
        const matchesInquiry = q.inquiryBy?.toLowerCase().includes(query);
        const matchesSeller = q.seller?.toLowerCase().includes(query);
        const matchesEmail = q.email?.toLowerCase().includes(query);
        const matchesNotes = q.notes?.toLowerCase().includes(query);
        const matchesAmount = String(q.amount).includes(query);

        if (!matchesClient && !matchesRef && !matchesRfq && !matchesTender && !matchesInquiry && !matchesSeller && !matchesEmail && !matchesNotes && !matchesAmount) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'amount') {
        comparison = (a.amount || 0) - (b.amount || 0);
      } else if (sortField === 'client') {
        comparison = (a.client || '').localeCompare(b.client || '');
      } else if (sortField === 'ref') {
        comparison = (a.quotationRef || '').localeCompare(b.quotationRef || '');
      } else if (sortField === 'status') {
        const getStatusVal = (r: QuotationRecord) => (r.win ? 3 : r.steelOpen ? 2 : r.lost ? 1 : 0);
        comparison = getStatusVal(a) - getStatusVal(b);
      } else {
        // Default: date sorting
        comparison = (a.quotationDate || '').localeCompare(b.quotationDate || '');
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [quotationRecords, yearFilter, monthFilter, statusFilter, sellerFilter, searchQuery, sortField, sortAsc, currentUser, isAdmin, activeCompany]);

  // Overall & Filtered KPI Metrics
  const metrics = useMemo(() => {
    const totalCount = filteredRecords.length;
    const totalAmount = filteredRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const wonList = filteredRecords.filter(r => r.win);
    const wonAmount = wonList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const openList = filteredRecords.filter(r => r.steelOpen);
    const openAmount = openList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const lostList = filteredRecords.filter(r => r.lost);
    const lostAmount = lostList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const closedList = filteredRecords.filter(r => r.closed);
    const winRate = totalCount > 0 ? ((wonList.length / totalCount) * 100).toFixed(1) : '0.0';
    const avgAmount = totalCount > 0 ? (totalAmount / totalCount) : 0;

    return {
      totalCount,
      totalAmount,
      wonCount: wonList.length,
      wonAmount,
      openCount: openList.length,
      openAmount,
      lostCount: lostList.length,
      lostAmount,
      closedCount: closedList.length,
      winRate,
      avgAmount
    };
  }, [filteredRecords]);

  // Multi-Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredRecords.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Status Fast Toggles
  const handleSetStatus = (id: string, type: 'win' | 'steelOpen' | 'lost' | 'closed') => {
    setQuotationRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (type === 'win') {
        return { ...r, win: !r.win, steelOpen: false, lost: false };
      }
      if (type === 'steelOpen') {
        return { ...r, steelOpen: !r.steelOpen, win: false, lost: false };
      }
      if (type === 'lost') {
        return { ...r, lost: !r.lost, win: false, steelOpen: false };
      }
      if (type === 'closed') {
        return { ...r, closed: !r.closed };
      }
      return r;
    }));
  };

  // Bulk Status Update
  const handleBulkStatusChange = (status: 'win' | 'steelOpen' | 'lost' | 'closed') => {
    if (isViewer) {
      if (triggerToast) triggerToast('Viewer Role: Read-only access. Modification is not permitted.');
      return;
    }
    if (selectedIds.size === 0) return;
    setQuotationRecords(prev => prev.map(r => {
      if (!selectedIds.has(r.id)) return r;
      if (status === 'win') return { ...r, win: true, steelOpen: false, lost: false };
      if (status === 'steelOpen') return { ...r, steelOpen: true, win: false, lost: false };
      if (status === 'lost') return { ...r, lost: true, win: false, steelOpen: false };
      if (status === 'closed') return { ...r, closed: true };
      return r;
    }));
    if (triggerToast) triggerToast(`Updated status for ${selectedIds.size} records`);
    setSelectedIds(new Set());
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (isViewer) {
      if (triggerToast) triggerToast('Viewer Role: Read-only access. Deletion is not permitted.');
      return;
    }
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} selected quotation log(s)?`)) return;
    setQuotationRecords(prev => prev.filter(r => !selectedIds.has(r.id)));
    if (triggerToast) triggerToast(`Deleted ${selectedIds.size} quotation logs`);
    setSelectedIds(new Set());
  };

  // Single Delete
  const handleDeleteRecord = (id: string, ref: string) => {
    if (isViewer) {
      if (triggerToast) triggerToast('Viewer Role: Read-only access. Deletion is not permitted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete quotation record ${ref}?`)) return;
    setQuotationRecords(prev => prev.filter(r => r.id !== id));
    if (triggerToast) triggerToast(`Deleted quotation ${ref}`);
  };

  // Direct Print Single Quote PDF (Matches official MFI Quotation PDF format from image)
  const handlePrintDirectQuotePdf = (q: QuotationRecord) => {
    const currentComp = getActiveCompany();
    const matchCust = customers.find(c => c.companyName.toLowerCase().trim() === q.client?.toLowerCase().trim());
    const clientAddr = matchCust?.address || 'I Cad-1, Musaffah M41, Abu Dhabi, UAE';
    const clientPo = matchCust?.poBox || '9050';
    const clientPhone = q.phone || matchCust?.phone || '+971 2 550 1366';
    const clientTrn = matchCust?.trn || '100046686000003';
    const clientContact = q.inquiryBy || matchCust?.contactPerson || 'Mr. G Mohammed Irfan';
    const clientDesignation = matchCust?.designation || 'Procurement Manager';
    const clientEmail = q.email || matchCust?.email || 'store@SuperEng.ae';
    const clientMob = q.mobile || matchCust?.mobile || '+971 55 224 6344';

    const rfqNum = q.rfqNumber || 'IND-SEI-SH-26-102';
    const rfqDt = q.rfqDate || '23-Jul-26';
    const totalGross = Number(q.amount) || 998.98;
    const vatRate = 0.05;
    const netBeforeTax = totalGross / (1 + vatRate);
    const vatAmount = totalGross - netBeforeTax;

    // Items list: If custom line items exist on record, use them; otherwise generate standard Grade 8.8 Hex Bolt items matching the quote
    let printableItems: Array<{
      sn: number;
      description: string;
      finish: string;
      unit: string;
      qty: number;
      unitPrice: number;
      extPrice: number;
      discount: number;
      totalExclVat: number;
      vat: number;
      total: number;
    }> = [];

    if ((q as any).items && Array.isArray((q as any).items) && (q as any).items.length > 0) {
      printableItems = (q as any).items.map((it: any, idx: number) => {
        const qty = Number(it.qty) || 1;
        const up = Number(it.unitPrice) || 0;
        const ext = qty * up;
        const disc = Number(it.discount) || 0;
        const excl = Math.max(0, ext - disc);
        const vat = excl * 0.05;
        const tot = excl + vat;
        return {
          sn: idx + 1,
          description: it.description || 'GRADE 8.8 HEX BOLT',
          finish: it.finish || 'HDG',
          unit: it.unit || 'SETS',
          qty,
          unitPrice: up,
          extPrice: ext,
          discount: disc,
          totalExclVat: excl,
          vat,
          total: tot
        };
      });
    } else if (q.client?.toLowerCase().includes('super engineering') || Math.abs(totalGross - 998.98) < 5) {
      printableItems = [
        { sn: 1, description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 40MM', finish: 'HDG', unit: 'SETS', qty: 20, unitPrice: 1.90, extPrice: 38.00, discount: 0, totalExclVat: 38.00, vat: 1.90, total: 39.90 },
        { sn: 2, description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 45MM', finish: 'HDG', unit: 'SETS', qty: 80, unitPrice: 2.05, extPrice: 164.00, discount: 0, totalExclVat: 164.00, vat: 8.20, total: 172.20 },
        { sn: 3, description: 'GRADE 8.8 HEX BOLT WITH 1N + 2W, M16 X 50MM', finish: 'HDG', unit: 'SETS', qty: 250, unitPrice: 2.10, extPrice: 525.00, discount: 0, totalExclVat: 525.00, vat: 26.25, total: 551.25 },
        { sn: 4, description: 'GRADE 8.8 HEX BOLT, M16 X 70MM', finish: 'HDG', unit: 'PCS', qty: 20, unitPrice: 1.80, extPrice: 36.00, discount: 0, totalExclVat: 36.00, vat: 1.80, total: 37.80 },
        { sn: 5, description: 'GRADE 8.8 HEX BOLT, M16 X 50MM', finish: 'HDG', unit: 'PCS', qty: 50, unitPrice: 1.45, extPrice: 72.50, discount: 0, totalExclVat: 72.50, vat: 3.63, total: 76.13 },
        { sn: 6, description: 'GRADE 8.8 HEX BOLT WITH 1 WASHER, M20 X 45MM', finish: 'HDG', unit: 'SETS', qty: 30, unitPrice: 2.60, extPrice: 78.00, discount: 0, totalExclVat: 78.00, vat: 3.90, total: 81.90 }
      ];
    } else {
      // Dynamic proportional breakdown matching exact quote amount
      const unitP = Number((netBeforeTax / 100).toFixed(2)) || 1.90;
      const calcExt = 100 * unitP;
      const calcVat = calcExt * 0.05;
      printableItems = [
        {
          sn: 1,
          description: `GRADE 8.8 HIGH STRENGTH STRUCTURAL HEX BOLTS WITH 1N + 2W, HDG FINISH${q.notes ? ' (' + q.notes + ')' : ''}`,
          finish: 'HDG',
          unit: 'SETS',
          qty: 100,
          unitPrice: unitP,
          extPrice: calcExt,
          discount: 0,
          totalExclVat: calcExt,
          vat: calcVat,
          total: calcExt + calcVat
        }
      ];
    }

    const calcSubtotal = printableItems.reduce((s, it) => s + it.extPrice, 0);
    const calcBeforeTax = printableItems.reduce((s, it) => s + it.totalExclVat, 0);
    const calcVatTotal = printableItems.reduce((s, it) => s + it.vat, 0);
    const calcGrandTotal = printableItems.reduce((s, it) => s + it.total, 0);

    const docTitle = `QUOTATION_${q.quotationRef.replace(/[\/:]/g, '_')}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docTitle}</title>
      <style>
        @page { size: A4 portrait; margin: 0 !important; }
        * { box-sizing: border-box; }
        html, body { width: 100%; margin: 0; padding: 0 6mm 10mm 6mm !important; font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; color: #000; background: #fff; line-height: 1.3; }
        
        .header-title { font-size: 13.5px; font-weight: bold; color: #083c54; text-align: center; margin: 6px 0 3px 0; letter-spacing: 0.8px; text-decoration: underline; }
        .intro-text { font-size: 9.5px; font-weight: bold; font-style: italic; color: #000; margin: 3px 0 6px 0; text-align: left; }
        
        .meta-container { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; margin-top: 0 !important; margin-bottom: 4px; table-layout: fixed; page-break-inside: avoid; }
        .meta-box { padding: 4px 5px !important; vertical-align: top; word-wrap: break-word; font-size: 9px; line-height: 1.3; background: #fff; box-sizing: border-box; }
        .meta-box table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
        .meta-box table td { border: none !important; padding: 0.5px 0 !important; font-size: 8.5px !important; vertical-align: top; }
        
        .grid-table { width: 100%; border-collapse: collapse; margin-top: 0 !important; margin-bottom: 4px; font-size: 9px; table-layout: fixed; }
        .grid-table thead { display: table-header-group; margin: 0 !important; padding: 0 !important; }
        .grid-table tfoot { display: table-footer-group; }
        .grid-table tfoot tr { page-break-inside: avoid !important; }
        .grid-table tfoot td { border: none !important; background: transparent !important; padding: 0 !important; }
        .grid-table tr { page-break-inside: avoid !important; }
        .grid-table th { border: 1px solid #000; background-color: #f2f2f2; padding: 3px 2px; text-align: center; font-weight: bold; word-wrap: break-word; font-size: 8.5px; }
        .grid-table tr.repeating-meta-row { margin: 0 !important; padding: 0 !important; }
        .grid-table tr.repeating-meta-row th { border: none !important; background: transparent !important; padding: 8mm 0 2px 0 !important; margin: 0 !important; font-weight: normal !important; text-align: left !important; vertical-align: top !important; }
        .grid-table > tbody > tr > td { border: 1px solid #000; padding: 3px 4px; word-wrap: break-word; overflow-wrap: break-word; font-size: 9px; }
        
        .summary-footer-block { width: 100%; margin-top: 2px; margin-bottom: 2mm; page-break-inside: avoid !important; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 0; font-size: 9px; table-layout: fixed; }
        .summary-table td { padding: 3px 5px; border: 1px solid #000; word-wrap: break-word; }
        
        .notes-box { font-size: 8.5px; border: 1px solid #000; padding: 5px; margin-top: 0; line-height: 1.35; }
        .notes-box ul { margin: 2px 0; padding-left: 12px; }
        
        .sig-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9px; table-layout: fixed; }
        .sig-table td { width: 50%; border: 1px solid #000; padding: 6px; vertical-align: top; word-wrap: break-word; }
      </style>
    </head>
    <body>
      <table class="grid-table">
        <colgroup>
          <col style="width: 4%;" />
          <col style="width: 27%;" />
          <col style="width: 8%;" />
          <col style="width: 6%;" />
          <col style="width: 6%;" />
          <col style="width: 8%;" />
          <col style="width: 9%;" />
          <col style="width: 7%;" />
          <col style="width: 9%;" />
          <col style="width: 8%;" />
          <col style="width: 8%;" />
        </colgroup>
        <thead>
          <tr class="repeating-meta-row">
            <th colspan="11">
              <table class="meta-container">
                <tr>
                  <!-- Left: Client & Seller Details -->
                  <td style="width: 53%; vertical-align: top; padding: 4px 6px; border-right: 1px solid #000;">
                    <div style="font-size: 8.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px;">SUPPLIER / EXPORTER:</div>
                    <div style="font-size: 11px; font-weight: 900; color: #000; margin-bottom: 2px;">${currentComp.name}</div>
                    ${currentComp.address}<br/>
                    Telephone: ${currentComp.phone || '+971-6-5250526'} | Email: ${currentComp.email || 'sales@marinefasteners.co'}<br/>
                    <b>VAT TRN:</b> ${currentComp.trn || '100440509600003'}
                    <hr style="margin: 3px 0; border: 0; border-top: 1px solid #ccc;"/>
                    <div style="font-size: 8.5px; font-weight: bold; text-decoration: underline; margin-bottom: 2px;">CLIENT / BUYER:</div>
                    <div style="font-size: 11px; font-weight: 900; color: #000; margin-bottom: 2px;">M/s. ${q.client}</div>
                    Address: ${clientAddr}<br/>
                    PO Box: ${clientPo} | Phone: ${clientPhone}<br/>
                    TRN: ${clientTrn}
                  </td>

                  <!-- Right: Quote Ref & Commercial Terms -->
                  <td style="width: 47%; vertical-align: top; padding: 4px 6px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 8.5px;">
                      <tr><td style="width: 45%; font-weight: bold;">DATE:</td><td><b>${q.quotationDate}</b></td></tr>
                      <tr><td style="font-weight: bold;">Quotation Ref Num:</td><td><b>${q.quotationRef}</b></td></tr>
                      <tr><td style="font-weight: bold;">RFQ No.:</td><td>${rfqNum}</td></tr>
                      <tr><td style="font-weight: bold;">RFQ Date:</td><td>${rfqDt}</td></tr>
                      ${q.tenderNo ? `<tr><td style="font-weight: bold;">Tender No.:</td><td><b>${q.tenderNo}</b></td></tr>` : ''}
                      ${q.tenderDate ? `<tr><td style="font-weight: bold;">Tender Date:</td><td><b>${q.tenderDate}</b></td></tr>` : ''}
                      <tr><td style="font-weight: bold;">S.ACC.:</td><td>FHM</td></tr>
                      <tr><td colspan="2"><hr style="margin: 2px 0; border: 0; border-top: 1px solid #aaa;"/></td></tr>
                      <tr><td style="font-weight: bold;">Offer Validity:</td><td>5 Days from the date of quotation</td></tr>
                      <tr><td>Delivery Terms:</td><td>Ex Works</td></tr>
                      <tr><td>Delivery Lead Time:</td><td>3-4 Working Days</td></tr>
                      <tr><td>Payment Terms:</td><td>Standard TT</td></tr>
                      <tr><td>Currency:</td><td><b>AED</b></td></tr>
                      <tr><td>Country of Origin:</td><td><b>U.A.E.</b></td></tr>
                      <tr><td>H.S. CODE:</td><td>73181500</td></tr>
                      <tr><td style="font-weight: bold; white-space: nowrap;">PAGE NO.:</td><td style="font-weight: bold; white-space: nowrap;">Page 1 of 1</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- QUOTATION LINE DESIGN -->
              <div style="display: flex; align-items: center; width: 100%; margin: 6px 0 4px 0;">
                <div style="flex: 1; border-top: 3px double #083c54; margin-right: 12px;"></div>
                <span style="font-size: 13.5px; font-weight: bold; font-style: italic; color: #083c54; white-space: nowrap; padding: 0 4px;">Quotation</span>
                <div style="width: 75px; border-top: 3px double #083c54; margin-left: 12px;"></div>
              </div>

              <div style="font-size: 9.5px; font-weight: bold; font-style: italic; color: #000; text-align: left; margin: 3px 0 2px 0;">
                We are pleased to quote our best prices as below:
              </div>
            </th>
          </tr>

          <!-- Table Column Headers -->
          <tr>
            <th style="width: 4%;">S/L</th>
            <th style="width: 27%;">ITEM DESCRIPTION</th>
            <th style="width: 8%;">FINISH</th>
            <th style="width: 6%;">UNIT</th>
            <th style="width: 6%;">QTY</th>
            <th style="width: 8%;">U. PRICE</th>
            <th style="width: 9%;">EXT. PRICE</th>
            <th style="width: 7%;">DISCOUNT</th>
            <th style="width: 9%;">TOTAL EXCL. VAT</th>
            <th style="width: 8%;">VAT (AED)</th>
            <th style="width: 8%;">TOTAL (AED)</th>
          </tr>
        </thead>
        <tbody>
          ${printableItems.map((it) => `
            <tr>
              <td style="text-align: center;">${it.sn}</td>
              <td style="font-weight: bold;">${it.description}</td>
              <td style="text-align: center;">${it.finish}</td>
              <td style="text-align: center;">${it.unit}</td>
              <td style="text-align: center; font-weight: bold;">${it.qty}</td>
              <td style="text-align: right;">${it.unitPrice.toFixed(2)}</td>
              <td style="text-align: right;">${it.extPrice.toFixed(2)}</td>
              <td style="text-align: right;">${it.discount.toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold;">${it.totalExclVat.toFixed(2)}</td>
              <td style="text-align: right;">${it.vat.toFixed(2)}</td>
              <td style="text-align: right; font-weight: bold; color: #083c54;">${it.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Unified summary footer block containing Notes, Totals, Purchaser Contact, and For Marine Fasteners -->
      <div class="summary-footer-block">
        <table class="summary-table">
          <tr>
            <!-- Notes Box (Left) -->
            <td style="width: 53%; vertical-align: top;">
              <div class="notes-box">
                <div style="font-weight: bold; text-decoration: underline; margin-bottom: 2px;">Notes:-</div>
                <ul style="margin: 0; padding-left: 12px;">
                  <li>5% Vat to be charged Extra for local Sales and overseas if export Bayan unable to provide!</li>
                  <li>Offered rates are based on a complete closed order only.</li>
                  <li>Availability subject to prior sales.</li>
                  <li>BS EN 10204,3.1 Material Test Certificates shall be given.</li>
                  <li>Any Repeated Order on Old supplied price,subject to prior approval!</li>
                  ${q.notes ? `<li><b>Log Notes:</b> ${q.notes}</li>` : ''}
                </ul>
              </div>
            </td>

            <!-- Totals Box (Right) -->
            <td style="width: 47%; vertical-align: top; padding: 2px 4px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 8.5px;">
                <tr><td style="padding: 1.5px 0; font-weight: bold;">TOTAL IN AED :</td><td style="text-align: right; font-weight: bold;">${calcSubtotal.toFixed(2)}</td></tr>
                <tr><td style="padding: 1.5px 0;">DISCOUNT IN AED :</td><td style="text-align: right;">0.00</td></tr>
                <tr><td style="padding: 1.5px 0;">FREIGHT/EXTRA CHARGES IN AED :</td><td style="text-align: right;">0.00</td></tr>
                <tr><td style="padding: 1.5px 0; border-top: 1px solid #ccc; font-weight: bold;">TOTAL AED BEFORE TAX :</td><td style="text-align: right; font-weight: bold; border-top: 1px solid #ccc;">${calcBeforeTax.toFixed(2)}</td></tr>
                <tr><td style="padding: 1.5px 0;">5% TAX AMOUNT IN AED :</td><td style="text-align: right;">${calcVatTotal.toFixed(2)}</td></tr>
                <tr style="background-color: #f2f2f2; font-weight: 900; font-size: 9.5px;">
                  <td style="padding: 3px 2px; border-top: 1px solid #000;">TOTAL AMOUNT IN AED :</td>
                  <td style="text-align: right; padding: 3px 2px; border-top: 1px solid #000; color: #083c54;">${calcGrandTotal.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <div style="font-size: 7.5px; text-align: right; font-weight: bold; margin-top: 8px; margin-bottom: 3px;">E. & O.E</div>

        <!-- Signature Footer -->
        <table class="sig-table">
          <tr>
            <td>
              <b>Purchaser Contact Info:-</b><br/><br/>
              <b>${clientContact}</b><br/>
              ${clientDesignation}<br/>
              Phone: ${clientPhone}<br/>
              Mobile: ${clientMob}<br/>
              Email: ${clientEmail}
            </td>
            <td>
              <b>For : ${currentComp.name}</b><br/><br/>
              <b>${currentComp.sellerName || 'Mr. Fahim'}</b> (${currentComp.sellerDesignation || 'Sales Executive'})<br/>
              Mobile: ${currentComp.sellerMobile || '+971-52-3627048 / 056-4857501'}<br/>
              Phone: ${currentComp.sellerPhone || currentComp.phone || '+971-6-5250526'}<br/>
              Email: ${currentComp.sellerEmail || currentComp.email || 'sales@marinefasteners.co'}<br/>
              Website: ${currentComp.sellerWebsite || currentComp.website || 'www.marinefasteners.co'}
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    `;

    printHtml(html, docTitle);
    if (triggerToast) triggerToast(`Printing PDF for ${q.quotationRef}`);
  };

  // Duplicate Record
  const handleDuplicateRecord = (record: QuotationRecord) => {
    if (isViewer) {
      if (triggerToast) triggerToast('Viewer Role: Read-only access. Duplication is not permitted.');
      return;
    }
    const seq = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const compCode = (activeCompany.code || 'MFI').toUpperCase();
    const newRef = `${compCode}:J-${seq}/${mm}/${yyyy}`;

    const cloned: QuotationRecord = {
      ...record,
      id: `quote-${Date.now()}`,
      quotationRef: newRef,
      quotationDate: `${String(now.getDate()).padStart(2, '0')}-${now.toLocaleString('default', { month: 'short' })}-${String(yyyy).slice(-2)}`,
      steelOpen: true,
      win: false,
      lost: false,
      closed: false,
      companyId: activeCompany.id || 'comp-mfi',
      notes: `Cloned from ${record.quotationRef}`
    };

    setQuotationRecords(prev => [cloned, ...prev]);
    if (triggerToast) triggerToast(`Duplicated into new quote ${newRef}`);
  };

  // Open Quick Edit Modal
  const handleOpenEditModal = (record: QuotationRecord) => {
    if (isViewer) {
      onViewQuotePreview(record);
      return;
    }
    setEditingRecord(record);
    setIsNewRecordMode(false);
    setModalForm({ ...record });
    setIsEditModalOpen(true);
  };

  // Open Quick Add Modal
  const handleOpenAddModal = () => {
    if (isViewer) {
      if (triggerToast) triggerToast('Viewer Role: Read-only access. Creating quotations is not permitted.');
      return;
    }
    const seq = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const mon = now.toLocaleString('default', { month: 'short' });
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');

    setEditingRecord(null);
    setIsNewRecordMode(true);
    const compCode = (activeCompany.code || 'MFI').toUpperCase();
    setModalForm({
      id: `quote-${Date.now()}`,
      rfqDate: `${day}-${mon}-${yy}`,
      rfqNumber: `RFQ-${seq}`,
      tenderNo: '',
      tenderDate: '',
      quotationRef: `${compCode}:J-${seq}/${mm}/${now.getFullYear()}`,
      quotationDate: `${day}-${mon}-${yy}`,
      amount: 0,
      client: customers[0]?.companyName || '',
      inquiryBy: customers[0]?.contactPerson || '',
      email: customers[0]?.email || '',
      mobile: customers[0]?.mobile || '',
      phone: customers[0]?.phone || '',
      seller: currentUser ? `${currentUser.firstName} ${currentUser.secondName || ''}`.trim().toUpperCase() : 'MR. ASIF',
      companyId: activeCompany.id || 'comp-mfi',
      steelOpen: true,
      closed: false,
      win: false,
      lost: false,
      notes: '',
      month: monthFilter !== 'All' ? monthFilter : currentCalendarMonth
    });
    setIsEditModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.quotationRef?.trim() || !modalForm.client?.trim()) {
      if (triggerToast) triggerToast('Quotation Ref and Client name are required!');
      return;
    }

    const payload: QuotationRecord = {
      id: modalForm.id || `quote-${Date.now()}`,
      rfqDate: modalForm.rfqDate || '',
      rfqNumber: modalForm.rfqNumber || '',
      tenderNo: modalForm.tenderNo || '',
      tenderDate: modalForm.tenderDate || '',
      quotationRef: modalForm.quotationRef || '',
      quotationDate: modalForm.quotationDate || '',
      amount: Number(modalForm.amount) || 0,
      client: modalForm.client || '',
      inquiryBy: modalForm.inquiryBy || '',
      seller: modalForm.seller || (currentUser ? `${currentUser.firstName} ${currentUser.secondName || ''}`.trim().toUpperCase() : 'MR. ASIF'),
      companyId: modalForm.companyId || activeCompany.id || 'comp-mfi',
      email: modalForm.email || '',
      mobile: modalForm.mobile || '',
      phone: modalForm.phone || '',
      steelOpen: !!modalForm.steelOpen,
      closed: !!modalForm.closed,
      win: !!modalForm.win,
      lost: !!modalForm.lost,
      notes: modalForm.notes || '',
      month: modalForm.month || currentCalendarMonth
    };

    if (isNewRecordMode) {
      setQuotationRecords(prev => [payload, ...prev]);
      if (triggerToast) triggerToast(`Added quote ${payload.quotationRef} to records`);
    } else {
      setQuotationRecords(prev => prev.map(r => r.id === payload.id ? payload : r));
      if (triggerToast) triggerToast(`Updated quote ${payload.quotationRef}`);
    }

    setIsEditModalOpen(false);
  };

  // 1-Click Copy Quotation Ref
  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    if (triggerToast) triggerToast(`Copied ref "${ref}" to clipboard`);
  };

  // Export to Excel (.xlsx) using SheetJS
  const handleExportExcel = () => {
    const rowsToExport = selectedIds.size > 0
      ? filteredRecords.filter(r => selectedIds.has(r.id))
      : filteredRecords;

    const data = rowsToExport.map((q, idx) => ({
      'S.N.': idx + 1,
      'RFQ Date': q.rfqDate || '—',
      'RFQ Number': q.rfqNumber || '—',
      'Tender Date': q.tenderDate || '—',
      'Tender No': q.tenderNo || '—',
      'Quotation Ref Number': q.quotationRef,
      'Quotation Date': q.quotationDate,
      'Quotation Amount (AED)': q.amount,
      'Client Company': q.client,
      'Inquiry Contact': q.inquiryBy || '—',
      'Contact Mobile': q.mobile || '—',
      'Contact Phone': q.phone || '—',
      'Contact Email': q.email || '—',
      'Status': q.win ? 'WIN' : q.lost ? 'LOST' : q.steelOpen ? 'STEEL OPEN' : 'PENDING',
      'Steel Open': q.steelOpen ? 'YES' : 'NO',
      'Closed': q.closed ? 'YES' : 'NO',
      'Win': q.win ? 'YES' : 'NO',
      'Lost': q.lost ? 'YES' : 'NO',
      'Month': q.month || '—',
      'Notes / Remarks': q.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Quotation_Records`);
    XLSX.writeFile(wb, `MFI_Quotation_Records_${monthFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);

    if (triggerToast) triggerToast(`Exported ${data.length} quotation records to Excel!`);
  };

  const handlePrintQuotationsLedger = () => {
    const rowsToPrint = selectedIds.size > 0
      ? filteredRecords.filter(r => selectedIds.has(r.id))
      : filteredRecords;

    if (rowsToPrint.length === 0) {
      if (triggerToast) triggerToast('No quotation records available to print.');
      return;
    }

    if (triggerToast) triggerToast(`Preparing Quotations Log Printout (${rowsToPrint.length} records)...`);

    const rowsHtml = rowsToPrint.map((q, idx) => {
      const statusLabel = q.win ? 'WON' : q.lost ? 'LOST' : q.steelOpen ? 'STEEL OPEN' : 'PENDING';
      const statusColor = q.win ? '#059669' : q.lost ? '#dc2626' : '#d97706';

      return `
        <tr style="border-bottom: 1px solid #cbd5e1; height: 24px; font-size: 9.5px; text-align: center; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #083c54;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace; font-weight: 900; color: #f37021;">${q.quotationRef}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${q.quotationDate || '—'}</td>
          <td style="border: 1px solid #cbd5e1; text-align: left; padding: 3px 6px; font-weight: bold; text-transform: uppercase;">${q.client || 'UNTITLED'}</td>
          <td style="border: 1px solid #cbd5e1; font-family: monospace;">${q.rfqNumber || '—'}</td>
          <td style="border: 1px solid #cbd5e1; font-weight: bold; color: ${statusColor};">${statusLabel}</td>
          <td style="border: 1px solid #cbd5e1; text-align: right; padding-right: 6px; font-family: monospace; font-weight: bold;">AED ${(q.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const totalAmt = rowsToPrint.reduce((s, q) => s + (q.amount || 0), 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MFI Quotations Directory Report</title>
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
              font-size: 9px;
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
              <div class="subtitle">ESTIMATION & SALES QUOTATION DIRECTORY AUDIT LOG</div>
            </div>
            <div style="text-align: right; font-size: 9px; font-family: monospace; font-weight: bold;">
              <div>Records: <strong>${rowsToPrint.length}</strong></div>
              <div>Month: ${monthFilter || 'ALL'} | Period: ${fromDate || 'Start'} to ${toDate || 'Present'}</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 4%;">SN</th>
                <th style="width: 16%;">QUOTATION REF</th>
                <th style="width: 11%;">DATE</th>
                <th style="width: 35%; text-align: left; padding-left: 6px;">CLIENT / PROSPECT</th>
                <th style="width: 14%;">RFQ NUMBER</th>
                <th style="width: 9%;">STATUS</th>
                <th style="width: 11%; text-align: right; padding-right: 6px;">AMOUNT (AED)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align: right; font-weight: 900;">TOTAL PIPELINE VALUE (AED):</td>
                <td style="text-align: right; font-family: monospace; color: #083c54;">AED ${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <span>OFFICIAL MFI ESTIMATION REGISTER</span>
            <span>DUBAI, UNITED ARAB EMIRATES</span>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `MFI_Quotations_Register_${new Date().toISOString().slice(0, 10)}`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const rowsToExport = selectedIds.size > 0
      ? filteredRecords.filter(r => selectedIds.has(r.id))
      : filteredRecords;

    const headers = ['S.N.', 'RFQ Date', 'RFQ Number', 'Tender Date', 'Tender No', 'Quotation Ref', 'Quotation Date', 'Amount AED', 'Client', 'Contact', 'Email', 'Status', 'Notes'];
    const rows = rowsToExport.map((q, idx) => [
      idx + 1,
      `"${q.rfqDate || ''}"`,
      `"${q.rfqNumber || ''}"`,
      `"${q.tenderDate || ''}"`,
      `"${q.tenderNo || ''}"`,
      `"${q.quotationRef || ''}"`,
      `"${q.quotationDate || ''}"`,
      q.amount,
      `"${q.client || ''}"`,
      `"${q.inquiryBy || ''}"`,
      `"${q.email || ''}"`,
      q.win ? 'WIN' : q.lost ? 'LOST' : 'OPEN',
      `"${(q.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Quotation_Records_${monthFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (triggerToast) triggerToast('Downloaded CSV records log!');
  };

  // Print Clean Records Summary Sheet
  const handlePrintLog = () => {
    const activeCompany = getActiveCompany();
    const rowsToExport = selectedIds.size > 0
      ? filteredRecords.filter(r => selectedIds.has(r.id))
      : filteredRecords;

    const printHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation Records Log - ${activeCompany.name}</title>
        <style>
          @page { size: landscape; margin: 8mm; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 8.5pt; color: #000; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #083c54; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; }
          .title { font-size: 14pt; font-weight: bold; color: #083c54; }
          .subtitle { font-size: 8pt; color: #555; }
          .metrics { display: flex; gap: 15px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 12px; margin-bottom: 12px; font-family: monospace; font-size: 8pt; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; font-size: 8pt; }
          th { background: #083c54; color: #ffffff; text-align: left; padding: 4px 6px; font-size: 7.5pt; font-weight: bold; border: 1px solid #083c54; }
          td { padding: 3px 6px; border: 1px solid #cbd5e1; vertical-align: top; }
          tr:nth-child(even) { background: #f9fafb; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .status-win { color: #059669; font-weight: bold; }
          .status-open { color: #d97706; font-weight: bold; }
          .status-lost { color: #e11d48; font-weight: bold; }
          .footer { margin-top: 15px; font-size: 7.5pt; color: #64748b; text-align: right; border-top: 1px solid #cbd5e1; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${activeCompany.name}</div>
            <div class="subtitle">Official Quotation Records & RFQ Proposal Register • Cycle: ${monthFilter}</div>
          </div>
          <div style="text-align: right; font-size: 8pt;">
            <div><b>Printed on:</b> ${new Date().toLocaleString()}</div>
            <div><b>Total Quotes:</b> ${rowsToExport.length}</div>
          </div>
        </div>

        <div class="metrics">
          <div>TOTAL QUOTED: <b>AED ${metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></div>
          <div>• WON: <b>AED ${metrics.wonAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${metrics.wonCount})</b></div>
          <div>• STEEL OPEN: <b>AED ${metrics.openAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${metrics.openCount})</b></div>
          <div>• LOST: <b>AED ${metrics.lostAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${metrics.lostCount})</b></div>
          <div>• WIN RATE: <b>${metrics.winRate}%</b></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px;">#</th>
              <th>RFQ / TENDER REF</th>
              <th>QUOTATION REF</th>
              <th>DATE</th>
              <th>CLIENT / BUYER</th>
              <th>INQUIRY CONTACT</th>
              <th class="text-right">AMOUNT (AED)</th>
              <th class="text-center">STATUS</th>
              <th class="text-center">OPEN</th>
              <th class="text-center">WIN</th>
              <th class="text-center">LOST</th>
              <th>NOTES</th>
            </tr>
          </thead>
          <tbody>
            ${rowsToExport.map((q, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>
                  <b>${q.rfqNumber || q.tenderNo || '—'}</b>
                  <div style="font-size: 7pt; color: #666;">${q.tenderNo ? 'Tender: ' + q.tenderDate : 'RFQ: ' + q.rfqDate}</div>
                </td>
                <td><b>${q.quotationRef}</b></td>
                <td>${q.quotationDate}</td>
                <td><b>${q.client}</b></td>
                <td>${q.inquiryBy || '—'}<br/><span style="font-size: 7pt; color: #666;">${q.mobile || q.phone || ''}</span></td>
                <td class="text-right font-bold">${q.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td class="text-center ${q.win ? 'status-win' : q.lost ? 'status-lost' : 'status-open'}">
                  ${q.win ? 'WON' : q.lost ? 'LOST' : 'STEEL OPEN'}
                </td>
                <td class="text-center">${q.steelOpen ? '✓' : '—'}</td>
                <td class="text-center">${q.win ? '✓' : '—'}</td>
                <td class="text-center">${q.lost ? '✓' : '—'}</td>
                <td style="font-size: 7.5pt;">${q.notes || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: bold;">
              <td colspan="6" class="text-right">FILTERED TOTAL:</td>
              <td class="text-right">AED ${metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td colspan="5"></td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          Marine Fasteners Industries LLC • Plot #0654, Shed #31, New Industrial Area Ajman UAE • Telephone: +971-6-5250526
        </div>
      </body>
      </html>
    `;

    printHtml(printHtmlContent, `Quotation_Records_Log_${monthFilter}`);
  };

  // Restore Default Samples
  const handleResetDefaults = () => {
    if (window.confirm('Reset quotation records to initial default master entries?')) {
      setQuotationRecords(INITIAL_QUOTATIONS);
      if (triggerToast) triggerToast('Quotation records reset to defaults');
    }
  };

  // Dynamic density classes
  const densityStyles = {
    ultra: {
      cellPy: 'py-1',
      cellPx: 'px-1.5',
      fontSize: 'text-[8px]',
      headerFont: 'text-[7.5px]',
      badgeSize: 'text-[7.5px] px-1 py-0.2',
      actionIcon: 'w-2.5 h-2.5',
      rowHeight: 'h-7'
    },
    compact: {
      cellPy: 'py-1.5',
      cellPx: 'px-2',
      fontSize: 'text-[9.5px]',
      headerFont: 'text-[8.5px]',
      badgeSize: 'text-[8px] px-1.5 py-0.5',
      actionIcon: 'w-3 h-3',
      rowHeight: 'h-8'
    },
    standard: {
      cellPy: 'py-2',
      cellPx: 'px-3',
      fontSize: 'text-xs',
      headerFont: 'text-[9.5px]',
      badgeSize: 'text-[9px] px-2 py-0.5',
      actionIcon: 'w-3.5 h-3.5',
      rowHeight: 'h-10'
    }
  }[density];

  return (
    <div className="bg-white border border-slate-300 shadow-sm space-y-3 font-mono antialiased">
      {/* 1. TOP HEADER & MULTI-FILTER CONTROL BAR */}
      <div className="bg-slate-900 text-white px-3.5 py-2.5 border-b-2 border-[#f37021] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#f37021]" />
            <h2 className="text-xs font-black uppercase tracking-wider font-mono">
              QUOTATION RECORDS & RFQ PROPOSAL REGISTER
            </h2>
          </div>
          <span className="text-[9px] bg-[#083c54] text-sky-200 px-2 py-0.5 rounded-full border border-sky-400/30 font-bold">
            {filteredRecords.length} / {quotationRecords.length} Records
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-all"
            title="Quickly add a quotation record without leaving records screen"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Log</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToQuoteForm}
            className="px-2.5 py-1 bg-[#f37021] hover:bg-[#d95d13] text-white text-[10px] font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-all"
            title="Open Quotation Generator Form"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>New Quote Form</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1 bg-[#083c54] hover:bg-[#0a4d6b] text-white text-[10px] font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-all border border-sky-700/50"
            title="Export filtered records to Excel Workbook (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrintLog}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1 shadow-2xs transition-all border border-slate-700"
            title="Print compact Records Log Report"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Log</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
            title="Reset to sample master data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Close Sheet Icon Button */}
          <button
            type="button"
            onClick={onNavigateToQuoteForm}
            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer flex items-center justify-center shadow-2xs transition-all border border-rose-400"
            title="Close Sheet (Return to Quotation Form)"
            aria-label="Close Sheet"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="px-3.5 space-y-2.5">
        {/* 2. ULTRA-COMPACT KPI METRIC STRIP (Single Line High-Density Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-slate-800">
          <div className="bg-slate-50 border border-slate-200 p-2 rounded-xs">
            <div className="text-[8px] font-bold uppercase text-slate-500 flex items-center justify-between">
              <span>Total Quoted</span>
              <span className="text-[7.5px] bg-slate-200 px-1 py-0.2 rounded font-mono">{metrics.totalCount} Quotes</span>
            </div>
            <div className="text-xs font-black text-[#083c54] mt-0.5 truncate">
              AED {metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[7.5px] text-slate-500 font-mono mt-0.5 truncate">
              Avg: AED {metrics.avgAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-2 rounded-xs">
            <div className="text-[8px] font-bold uppercase text-emerald-800 flex items-center justify-between">
              <span>Won Deals</span>
              <span className="text-[7.5px] bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded font-mono">{metrics.wonCount}</span>
            </div>
            <div className="text-xs font-black text-emerald-700 mt-0.5 truncate">
              AED {metrics.wonAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[7.5px] text-emerald-800 font-mono mt-0.5 font-bold">
              Win Rate: {metrics.winRate}%
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 p-2 rounded-xs">
            <div className="text-[8px] font-bold uppercase text-amber-800 flex items-center justify-between">
              <span>Steel Open / Pending</span>
              <span className="text-[7.5px] bg-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-mono">{metrics.openCount}</span>
            </div>
            <div className="text-xs font-black text-amber-700 mt-0.5 truncate">
              AED {metrics.openAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[7.5px] text-amber-800 font-mono mt-0.5">
              Active Pipeline
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 p-2 rounded-xs">
            <div className="text-[8px] font-bold uppercase text-rose-800 flex items-center justify-between">
              <span>Lost Quotes</span>
              <span className="text-[7.5px] bg-rose-200/80 text-rose-900 px-1 py-0.2 rounded font-mono">{metrics.lostCount}</span>
            </div>
            <div className="text-xs font-black text-rose-700 mt-0.5 truncate">
              AED {metrics.lostAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[7.5px] text-rose-800 font-mono mt-0.5">
              Loss Review
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-300 p-2 rounded-xs col-span-2 sm:col-span-1">
            <div className="text-[8px] font-bold uppercase text-slate-600 flex items-center justify-between">
              <span>Closed Archive</span>
              <span className="text-[7.5px] bg-slate-300 text-slate-800 px-1 py-0.2 rounded font-mono">{metrics.closedCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {metrics.closedCount} / {metrics.totalCount} Closed
            </div>
            <div className="text-[7.5px] text-slate-500 font-mono mt-0.5">
              Archived Logs
            </div>
          </div>
        </div>

        {/* 3. SIMPLIFIED FILTER BAR WITH DROPDOWN MENUS, CURRENT MONTH/YEAR DEFAULT, SELLER & COMPANY FILTERS */}
        <div className="bg-white border border-slate-300 p-3 rounded-lg shadow-sm space-y-2.5">
          {/* Top Row: Context Badge, Quick Current Period Button, User Clearance Indicator, & Quick Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-md shadow-2xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#f37021]" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Quotation Records Filter
                </span>
                <span className="px-1.5 py-0.2 bg-[#f37021] text-white text-[8px] font-bold rounded-full font-mono">
                  {filteredRecords.length} / {quotationRecords.length}
                </span>
              </div>

              {/* 1-Click Current Month & Year Button */}
              <button
                type="button"
                onClick={() => {
                  setMonthFilter(currentCalendarMonth);
                  setYearFilter(currentCalendarYear);
                  if (triggerToast) triggerToast(`Showing current period: ${currentCalendarMonth} ${currentCalendarYear}`);
                }}
                className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer shadow-3xs ${
                  monthFilter.toLowerCase() === currentCalendarMonth.toLowerCase() && yearFilter === currentCalendarYear
                    ? 'bg-emerald-700 text-white shadow-2xs font-black ring-1 ring-emerald-500'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
                title="Switch to Current Calendar Month & Year"
              >
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>Current Period ({currentCalendarMonth} {currentCalendarYear})</span>
              </button>

              {/* Reset to All */}
              {(yearFilter !== 'All' || monthFilter !== 'All' || sellerFilter !== 'All' || statusFilter !== 'all' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setYearFilter('All');
                    setMonthFilter('All');
                    setSellerFilter('All');
                    setStatusFilter('all');
                    setSearchQuery('');
                    if (triggerToast) triggerToast('All filters set to View All');
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-[8.5px] font-bold uppercase cursor-pointer flex items-center gap-1 transition-colors shadow-3xs"
                  title="Show all records without date or seller filters"
                >
                  <RotateCcw className="w-3 h-3 text-slate-600" />
                  <span>Show All Records</span>
                </button>
              )}
            </div>

            {/* User Clearance Info Badge */}
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              {isAdmin ? (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-md font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ADMIN ACCESS: All Sellers Visible</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>SELLER CLEARANCE: Only Your Logs ({currentUser?.firstName || 'Current User'})</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls Row: Simple Dropdown Menus */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 items-center text-xs">
            {/* 1. Month Dropdown Menu */}
            <div className="space-y-0.5">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-[#083c54]" />
                <span>Month</span>
              </label>
              <div className="relative">
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full appearance-none pl-2 pr-6 py-1.5 bg-slate-50 hover:bg-white border border-slate-300 text-slate-800 text-[10px] font-bold rounded-md focus:outline-hidden focus:border-[#083c54] focus:ring-1 focus:ring-[#083c54] transition-all cursor-pointer"
                >
                  <option value={currentCalendarMonth}>★ Current Month ({currentCalendarMonth})</option>
                  <option value="All">All Months (Entire Year)</option>
                  <option disabled>──────────</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 2. Year Dropdown Menu */}
            <div className="space-y-0.5">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-[#083c54]" />
                <span>Year</span>
              </label>
              <div className="relative">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full appearance-none pl-2 pr-6 py-1.5 bg-slate-50 hover:bg-white border border-slate-300 text-slate-800 text-[10px] font-bold rounded-md focus:outline-hidden focus:border-[#083c54] focus:ring-1 focus:ring-[#083c54] transition-all cursor-pointer"
                >
                  <option value={currentCalendarYear}>★ Current Year ({currentCalendarYear})</option>
                  <option value="All">All Years</option>
                  <option disabled>──────────</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 3. Seller Filter Dropdown Menu */}
            <div className="space-y-0.5">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-[#f37021]" />
                <span>Seller</span>
              </label>
              {isAdmin ? (
                <div className="relative">
                  <select
                    value={sellerFilter}
                    onChange={(e) => setSellerFilter(e.target.value)}
                    className="w-full appearance-none pl-2 pr-6 py-1.5 bg-slate-50 hover:bg-white border border-slate-300 text-slate-800 text-[10px] font-bold rounded-md focus:outline-hidden focus:border-[#083c54] focus:ring-1 focus:ring-[#083c54] transition-all cursor-pointer"
                  >
                    <option value="All">All Sellers / All Staff</option>
                    <option disabled>──────────</option>
                    {availableSellers.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
                </div>
              ) : (
                <div className="px-2 py-1.5 bg-slate-100 border border-slate-300 rounded-md text-[9.5px] font-bold text-slate-700 flex items-center justify-between" title="Your role is restricted to viewing only your own quotations">
                  <span className="truncate">{currentUser?.firstName || 'My Quotes'}</span>
                  <Lock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                </div>
              )}
            </div>

            {/* 4. Active Company Entity Indicator (Strictly isolated by login) */}
            <div className="space-y-0.5">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5 text-[#083c54]" />
                <span>Active Entity</span>
              </label>
              <div className="px-2 py-1.5 bg-slate-100 border border-slate-300 rounded-md text-[9.5px] font-bold text-slate-800 flex items-center justify-between truncate" title={`Showing records exclusively for ${activeCompany.name}`}>
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`px-1 py-0.2 rounded text-[7.5px] font-black uppercase text-white ${
                    (activeCompany.code || 'MFI') === 'MFI' ? 'bg-blue-600' :
                    (activeCompany.code || 'MFI') === 'BMM' ? 'bg-amber-600' :
                    'bg-purple-600'
                  }`}>
                    {activeCompany.code || 'MFI'}
                  </span>
                  <span className="truncate">{activeCompany.shortName || activeCompany.name}</span>
                </div>
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
              </div>
            </div>

            {/* 5. Status Filter Dropdown Menu */}
            <div className="space-y-0.5">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                <Filter className="w-2.5 h-2.5 text-emerald-600" />
                <span>Status</span>
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full appearance-none pl-2 pr-6 py-1.5 bg-slate-50 hover:bg-white border border-slate-300 text-slate-800 text-[10px] font-bold rounded-md focus:outline-hidden focus:border-[#083c54] focus:ring-1 focus:ring-[#083c54] transition-all cursor-pointer"
                >
                  <option value="all">All Statuses ({quotationRecords.length})</option>
                  <option value="win">✓ WON Deals ({quotationRecords.filter(r => r.win).length})</option>
                  <option value="open">⏳ Steel Open ({quotationRecords.filter(r => r.steelOpen).length})</option>
                  <option value="lost">✕ Lost Quotes ({quotationRecords.filter(r => r.lost).length})</option>
                  <option value="closed">🔒 Closed Archive ({quotationRecords.filter(r => r.closed).length})</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 6. Quick Search Input */}
            <div className="space-y-0.5 col-span-2 sm:col-span-1 lg:col-span-1">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                <Search className="w-2.5 h-2.5 text-slate-500" />
                <span>Search</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ref, client, rfq, seller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-2.5 pr-6 py-1.5 bg-white border border-slate-300 text-[10px] font-medium rounded-md focus:outline-hidden focus:border-[#083c54] focus:ring-1 focus:ring-[#083c54] transition-all shadow-3xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Clear search query"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* 7. Density Selector */}
            <div className="space-y-0.5 col-span-2 sm:col-span-1 lg:col-span-1">
              <label className="text-[8.5px] font-extrabold uppercase text-slate-600 block">
                Layout Density
              </label>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-300" title="Table Density">
                <button
                  type="button"
                  onClick={() => setDensity('ultra')}
                  className={`flex-1 py-1 text-[8px] font-bold uppercase rounded cursor-pointer transition-all ${
                    density === 'ultra' ? 'bg-[#083c54] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Ultra-compact dense view"
                >
                  Ultra
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className={`flex-1 py-1 text-[8px] font-bold uppercase rounded cursor-pointer transition-all ${
                    density === 'compact' ? 'bg-[#083c54] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Compact view (Default)"
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('standard')}
                  className={`flex-1 py-1 text-[8px] font-bold uppercase rounded cursor-pointer transition-all ${
                    density === 'standard' ? 'bg-[#083c54] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Standard spacious view"
                >
                  Std
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MULTI-SELECT BULK ACTIONS BAR (When 1+ rows selected) */}
        {selectedIds.size > 0 && (
          <div className="bg-amber-100 border border-amber-300 p-2 rounded-xs flex flex-wrap items-center justify-between gap-2 text-xs font-mono animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-[10px]">
              <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>{selectedIds.size} quotation record(s) selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleBulkStatusChange('win')}
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[8.5px] uppercase rounded-xs cursor-pointer shadow-3xs"
              >
                Mark Won
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('steelOpen')}
                className="px-2 py-0.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[8.5px] uppercase rounded-xs cursor-pointer shadow-3xs"
              >
                Mark Steel Open
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('lost')}
                className="px-2 py-0.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[8.5px] uppercase rounded-xs cursor-pointer shadow-3xs"
              >
                Mark Lost
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('closed')}
                className="px-2 py-0.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[8.5px] uppercase rounded-xs cursor-pointer shadow-3xs"
              >
                Mark Closed
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-2 py-0.5 bg-[#083c54] hover:bg-[#0a4d6b] text-white font-bold text-[8.5px] uppercase rounded-xs cursor-pointer shadow-3xs flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export Selected</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[8.5px] uppercase rounded-xs cursor-pointer shadow-3xs flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Selected</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-1.5 py-0.5 text-slate-600 hover:text-slate-900 font-bold text-[8.5px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 5. COMPACT SPREADSHEET TABLE WITH SELLER & COMPANY INTEGRATION */}
        <div className="overflow-x-auto border border-slate-300 shadow-3xs rounded-xs">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-[#083c54] text-white font-extrabold uppercase border-b border-slate-900">
                {/* Select All Checkbox */}
                <th className={`${densityStyles.cellPy} ${densityStyles.cellPx} w-7 text-center border-r border-slate-700`}>
                  <input
                    type="checkbox"
                    checked={filteredRecords.length > 0 && selectedIds.size === filteredRecords.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-400 text-[#f37021] focus:ring-0 cursor-pointer"
                  />
                </th>

                {/* S/N */}
                <th className={`${densityStyles.cellPy} ${densityStyles.cellPx} w-7 text-center border-r border-slate-700 ${densityStyles.headerFont}`}>
                  #
                </th>

                {/* RFQ / Tender */}
                <th className={`${densityStyles.cellPy} ${densityStyles.cellPx} min-w-[110px] border-r border-slate-700 ${densityStyles.headerFont}`}>
                  <div className="flex items-center justify-between">
                    <span>RFQ / TENDER REF</span>
                  </div>
                </th>

                {/* Quotation Ref & Date */}
                <th
                  onClick={() => {
                    if (sortField === 'ref') setSortAsc(!sortAsc);
                    else { setSortField('ref'); setSortAsc(true); }
                  }}
                  className={`${densityStyles.cellPy} ${densityStyles.cellPx} w-28 min-w-[105px] max-w-[125px] border-r border-slate-700 ${densityStyles.headerFont} cursor-pointer hover:bg-[#0a4d6b] transition-colors`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>REF & DATE</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-70" />
                  </div>
                </th>

                {/* Client Company & Inquiry Contact */}
                <th
                  onClick={() => {
                    if (sortField === 'client') setSortAsc(!sortAsc);
                    else { setSortField('client'); setSortAsc(true); }
                  }}
                  className={`${densityStyles.cellPy} ${densityStyles.cellPx} min-w-[150px] border-r border-slate-700 ${densityStyles.headerFont} cursor-pointer hover:bg-[#0a4d6b] transition-colors`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>CLIENT & CONTACT</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-70" />
                  </div>
                </th>

                {/* Seller & Entity Column */}
                <th className={`${densityStyles.cellPy} ${densityStyles.cellPx} min-w-[100px] border-r border-slate-700 ${densityStyles.headerFont}`}>
                  <div className="flex items-center justify-between gap-1">
                    <span>SELLER & ENTITY</span>
                  </div>
                </th>

                {/* Amount */}
                <th
                  onClick={() => {
                    if (sortField === 'amount') setSortAsc(!sortAsc);
                    else { setSortField('amount'); setSortAsc(false); }
                  }}
                  className={`${densityStyles.cellPy} ${densityStyles.cellPx} text-right min-w-[90px] border-r border-slate-700 ${densityStyles.headerFont} cursor-pointer hover:bg-[#0a4d6b] transition-colors`}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AMOUNT (AED)</span>
                    <ArrowUpDown className="w-2.5 h-2.5 opacity-70" />
                  </div>
                </th>

                {/* Status Column */}
                <th className={`${densityStyles.cellPy} px-1.5 text-center w-20 min-w-[70px] max-w-[85px] border-r border-slate-700 ${densityStyles.headerFont}`}>
                  <span>STATUS</span>
                </th>

                {/* Outcome Column */}
                <th className={`${densityStyles.cellPy} ${densityStyles.cellPx} text-center min-w-[105px] w-28 max-w-[125px] border-r border-slate-700 ${densityStyles.headerFont}`}>
                  <span>OUTCOME</span>
                </th>

                {/* Notes Column */}
                <th className={`${densityStyles.cellPy} ${densityStyles.cellPx} text-left min-w-[150px] max-w-[280px] border-r border-slate-700 ${densityStyles.headerFont}`}>
                  <span>NOTES / REMARKS</span>
                </th>

                {/* Actions Column */}
                <th className={`${densityStyles.cellPy} ${densityStyles.cellPx} text-center w-[125px] min-w-[115px] ${densityStyles.headerFont}`}>
                  <span>ACTIONS</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 bg-slate-50">
                    <div className="max-w-sm mx-auto space-y-2">
                      <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-bold text-xs text-slate-700">No quotation logs match your filter criteria</p>
                      <p className="text-[10px] text-slate-500">Try adjusting month filter, selecting 'Show All Records', or logging a new quote.</p>
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="px-3 py-1 bg-[#083c54] text-white text-[10px] font-bold uppercase rounded-xs cursor-pointer inline-flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log New Quotation</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((q, idx) => {
                  const isSelected = selectedIds.has(q.id) || selectedRowIndex === idx;
                  const isWon = q.win;
                  const isLost = q.lost;
                  const isOpen = q.steelOpen;
                  const isClosed = q.closed;

                  // Determine company tag
                  const companyTag = q.companyId === 'comp-bmm' || q.quotationRef?.startsWith('BMM') ? 'BMM'
                    : q.companyId === 'comp-umi' || q.quotationRef?.startsWith('UMI') ? 'UMI'
                    : 'MFI';

                  return (
                    <tr
                      key={q.id}
                      onClick={() => setSelectedRowIndex(idx)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100/80 ring-1 ring-amber-400 ring-inset border-l-2 border-amber-600'
                          : idx % 2 === 0 ? 'bg-white hover:bg-sky-50/50' : 'bg-slate-50/60 hover:bg-sky-50/50'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} text-center border-r border-slate-200`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(q.id)}
                          className="rounded border-slate-300 text-[#083c54] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Index */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} text-center font-bold text-slate-400 border-r border-slate-200 ${densityStyles.fontSize}`}>
                        {idx + 1}
                      </td>

                      {/* RFQ / Tender Details */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} border-r border-slate-200`}>
                        {q.tenderNo ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[7.5px] bg-amber-200 text-amber-900 font-extrabold px-1 rounded-xs">TENDER</span>
                              <span className="font-bold text-amber-950 text-[9px] truncate" title={q.tenderNo}>{q.tenderNo}</span>
                            </div>
                            <div className="text-[7.5px] text-amber-800/80 font-mono">
                              Date: {q.tenderDate || q.rfqDate || '—'}
                            </div>
                            {q.rfqNumber && (
                              <div className="text-[7.5px] text-slate-500 truncate" title={`RFQ: ${q.rfqNumber}`}>
                                RFQ: {q.rfqNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800 text-[9px] truncate" title={q.rfqNumber || 'Direct Proposal'}>
                              {q.rfqNumber || 'Direct Inquiry'}
                            </div>
                            <div className="text-[7.5px] text-slate-500 font-mono">
                              Date: {q.rfqDate || '—'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Quotation Ref & Date (With 1-Click Copy) */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} border-r border-slate-200`}>
                        <div className="flex items-center justify-between gap-1 group">
                          <span
                            className="font-extrabold text-[#083c54] hover:text-[#f37021] cursor-pointer transition-colors text-[9.5px]"
                            onClick={() => onViewQuotePreview(q)}
                            title="Click to view full preview"
                          >
                            {q.quotationRef}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyRef(q.quotationRef)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy Ref"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="text-[7.5px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                          <span>{q.quotationDate}</span>
                          {q.month && (
                            <span className="text-[7px] bg-slate-200 text-slate-700 px-1 rounded-xs">{q.month}</span>
                          )}
                        </div>
                      </td>

                      {/* Client Company & Inquiry Contact */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} border-r border-slate-200`}>
                        <div className="font-extrabold text-slate-900 text-[9.5px] leading-tight truncate flex items-center gap-1" title={q.client}>
                          <Building className="w-2.5 h-2.5 text-[#083c54] shrink-0" />
                          <span className="truncate">{q.client}</span>
                        </div>
                        <div className="text-[8px] text-slate-600 truncate mt-0.5 flex items-center gap-1 font-mono">
                          <span className="font-bold text-slate-800">{q.inquiryBy || 'Procurement'}</span>
                          {(q.mobile || q.phone) && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">{q.mobile || q.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Seller & Entity Column */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} border-r border-slate-200`}>
                        <div className="flex items-center gap-1">
                          <span className={`text-[7.5px] font-black px-1 py-0.2 rounded font-mono ${
                            companyTag === 'MFI' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            companyTag === 'BMM' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            'bg-purple-100 text-purple-900 border border-purple-300'
                          }`}>
                            {companyTag}
                          </span>
                          <span className="font-bold text-slate-800 text-[8.5px] truncate" title={q.seller || q.inquiryBy || 'MR. ASIF'}>
                            {q.seller || 'MR. ASIF'}
                          </span>
                        </div>
                      </td>

                      {/* Amount (AED) */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} border-r border-slate-200 text-right`}>
                        <div className="font-black text-slate-950 text-[10px] font-mono tabular-nums">
                          {q.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[7px] text-slate-500 font-mono">
                          AED (Incl VAT)
                        </div>
                      </td>

                      {/* Compact Small STATUS Column */}
                      <td className={`${densityStyles.cellPy} px-1.5 border-r border-slate-200 text-center w-20 min-w-[70px] max-w-[85px]`}>
                        {isClosed ? (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(q.id, 'closed')}
                            className="inline-flex items-center justify-center gap-1 w-full px-1.5 py-0.5 bg-[#6c7787] hover:bg-[#5b6574] text-white font-bold rounded text-[9px] transition-all shadow-3xs cursor-pointer select-none"
                            title="Status: CLOSED (Click to toggle)"
                          >
                            <Lock className="w-2.5 h-2.5 text-white" />
                            <span>CLOSED</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(q.id, 'closed')}
                            className="inline-flex items-center justify-center gap-1 w-full px-1.5 py-0.5 bg-[#dff0fa] hover:bg-[#cbe7f7] text-[#0070ba] border border-[#a8daf7] font-bold rounded text-[9px] transition-all shadow-3xs cursor-pointer select-none"
                            title="Status: OPEN (Click to toggle)"
                          >
                            <Unlock className="w-2.5 h-2.5 text-[#0070ba]" />
                            <span>OPEN</span>
                          </button>
                        )}
                      </td>

                      {/* OUTCOME Column (Enlarged width) */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} border-r border-slate-200 text-center min-w-[105px] w-28 max-w-[125px]`}>
                        {isWon ? (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(q.id, 'win')}
                            className="inline-flex items-center justify-center gap-1.5 w-full px-2 py-1 bg-[#23783b] hover:bg-[#1c6430] text-white font-black rounded-md text-[10px] transition-all shadow-2xs cursor-pointer select-none"
                            title="Outcome: WON (Click to change)"
                          >
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            <span>WON</span>
                          </button>
                        ) : isLost ? (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(q.id, 'lost')}
                            className="inline-flex items-center justify-center gap-1.5 w-full px-2 py-1 bg-[#b92c2c] hover:bg-[#9d2424] text-white font-black rounded-md text-[10px] transition-all shadow-2xs cursor-pointer select-none"
                            title="Outcome: LOST (Click to change)"
                          >
                            <XCircle className="w-3 h-3 text-white" />
                            <span>LOST</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-1 w-full">
                            <button
                              type="button"
                              onClick={() => handleSetStatus(q.id, 'win')}
                              className="flex-1 py-1 px-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-300 font-extrabold rounded text-[8.5px] cursor-pointer transition-colors shadow-3xs"
                              title="Mark deal as WON"
                            >
                              WON
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(q.id, 'lost')}
                              className="flex-1 py-1 px-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 border border-slate-300 font-extrabold rounded text-[8.5px] cursor-pointer transition-colors shadow-3xs"
                              title="Mark deal as LOST"
                            >
                              LOST
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Big Spacious NOTES Column */}
                      <td
                        className={`${densityStyles.cellPy} ${densityStyles.cellPx} border-r border-slate-200 text-slate-700 text-[8.5px] font-sans min-w-[170px] max-w-[320px] cursor-pointer hover:bg-slate-100/80 transition-colors`}
                        title={q.notes || 'No notes (Click to edit)'}
                        onClick={() => handleOpenEditModal(q)}
                      >
                        <div className="line-clamp-2 leading-relaxed" title={q.notes}>
                          {q.notes || <span className="text-slate-400 italic">No notes recorded (click to edit)</span>}
                        </div>
                      </td>

                      {/* Redesigned ACTION Column with Icons: VIEW QUOTE | PRINT PDF | DELETE */}
                      <td className={`${densityStyles.cellPy} ${densityStyles.cellPx} text-center w-[125px] min-w-[115px]`}>
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* VIEW QUOTE ICON */}
                          <button
                            type="button"
                            onClick={() => onViewQuotePreview(q)}
                            className="p-1.5 bg-[#083c54] hover:bg-[#0c4d6c] text-white rounded-md cursor-pointer inline-flex items-center justify-center shadow-2xs transition-all border border-[#083c54]"
                            title="View Quote breakdown & details"
                            aria-label="View Quote"
                          >
                            <Eye className="w-3.5 h-3.5 text-sky-200" />
                          </button>

                          {/* PRINT PDF ICON */}
                          <button
                            type="button"
                            onClick={() => handlePrintDirectQuotePdf(q)}
                            className="p-1.5 bg-[#f37021] hover:bg-[#d95d13] text-white rounded-md cursor-pointer inline-flex items-center justify-center shadow-2xs transition-all border border-[#d95d13]"
                            title={`Print PDF Quotation (${activeCompany.name})`}
                            aria-label="Print PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-white" />
                          </button>

                          {/* LOAD/EDIT IN FORM ICON */}
                          {!isViewer && (
                            <button
                              type="button"
                              onClick={() => onLoadQuoteIntoForm(q)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-300 rounded-md cursor-pointer inline-flex items-center justify-center shadow-2xs transition-all"
                              title="Load into Quotation Form & Edit"
                              aria-label="Load into Form"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-700" />
                            </button>
                          )}

                          {/* DELETE ICON */}
                          {!isViewer && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord(q.id, q.quotationRef)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-md cursor-pointer inline-flex items-center justify-center shadow-2xs transition-all"
                              title="Delete quotation record"
                              aria-label="Delete Quotation"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* STICKY / COMPACT TOTALS FOOTER */}
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-[8.5px] uppercase font-mono text-slate-900">
              <tr>
                <td colSpan={5} className="p-1.5 text-right text-slate-700 font-bold">
                  TOTAL FILTERED ({filteredRecords.length} QUOTATIONS):
                </td>
                <td className="p-1.5 text-right font-black text-[#083c54] text-[10px]">
                  AED {metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="p-1.5 text-center text-[7.5px] text-slate-600">
                  <span className="text-amber-700 font-bold">OPEN: {metrics.openCount}</span>
                </td>
                <td className="p-1.5 text-center text-[7.5px] text-slate-600">
                  <span className="text-emerald-700 font-bold">WON: AED {metrics.wonAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </td>
                <td colSpan={2} className="p-1.5 text-right text-slate-500 text-[7.5px]">
                  WIN RATIO: {metrics.winRate}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* TALLY SHORTCUTS BAR */}
        <RecordsFooterShortcutsBar
          onQuit={() => {
            localStorage.setItem('mf_erp_active_tab', 'home');
            window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'home' }));
          }}
          onSelectColumn={() => {
            if (filteredRecords.length > 0) {
              setSelectedRowIndex(prev => (prev + 1) % filteredRecords.length);
            }
          }}
          selectColumnLabel="Select Row"
          onDrillDown={() => {
            const sel = filteredRecords[selectedRowIndex];
            if (sel) {
              onViewQuotePreview(sel);
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
            if (hiddenQuoteIds.length > 0) {
              setHiddenQuoteIds([]);
              triggerToast?.('All hidden quotation lines restored.');
            } else {
              const sel = filteredRecords[selectedRowIndex];
              if (sel) {
                setHiddenQuoteIds(prev => [...prev, sel.id]);
                triggerToast?.(`Quotation ${sel.quotationRef} hidden from view (Press U to restore).`);
              }
            }
          }}
          isLineRemoved={hiddenQuoteIds.length > 0}
          removeLineLabel="Remove Line"
          restoreLineLabel="Restore Line"
          onPrint={handlePrintQuotationsLedger}
          onExport={handleExportExcel}
          totalRecordsCount={filteredRecords.length}
        />
      </div>

      {/* 6. COMPACT QUICK ADD / EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 font-mono">
          <div className="bg-white border-2 border-slate-900 rounded-xs shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#083c54] text-white p-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#f37021]" />
                <span className="font-extrabold text-xs uppercase tracking-tight">
                  {isNewRecordMode ? 'Add Quotation Log Entry' : `Edit Quotation Log: ${modalForm.quotationRef}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveModal} className="p-4 overflow-y-auto space-y-3 text-xs">
              {/* Client Selector / Input */}
              <div>
                <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">
                  Client / Buyer Company *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={modalForm.client || ''}
                    onChange={(e) => setModalForm({ ...modalForm, client: e.target.value })}
                    placeholder="e.g. Super Engineering Industry L.L.C"
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-xs text-xs font-bold text-slate-900"
                  />
                  <select
                    onChange={(e) => {
                      const found = customers.find(c => c.companyName === e.target.value);
                      if (found) {
                        setModalForm({
                          ...modalForm,
                          client: found.companyName,
                          inquiryBy: found.contactPerson || '',
                          email: found.email || '',
                          mobile: found.mobile || '',
                          phone: found.phone || ''
                        });
                      }
                    }}
                    className="w-36 px-2 py-1 bg-slate-100 border border-slate-300 text-[10px] rounded-xs cursor-pointer"
                  >
                    <option value="">Quick Pick Client...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.companyName}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quotation Ref, Date, Company & Seller Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Quotation Ref *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.quotationRef || ''}
                    onChange={(e) => setModalForm({ ...modalForm, quotationRef: e.target.value })}
                    placeholder="MFI:J-0719/07/2026"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs font-bold text-amber-900 bg-amber-50/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Quotation Date</label>
                  <input
                    type="text"
                    value={modalForm.quotationDate || ''}
                    onChange={(e) => setModalForm({ ...modalForm, quotationDate: e.target.value })}
                    placeholder="24-Jul-26"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Company Entity</label>
                  <select
                    value={modalForm.companyId || 'comp-mfi'}
                    onChange={(e) => setModalForm({ ...modalForm, companyId: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs font-bold bg-white"
                  >
                    <option value="comp-mfi">Marine Fasteners (MFI)</option>
                    <option value="comp-bmm">Boltmaster (BMM)</option>
                    <option value="comp-umi">United Metal (UMI)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Seller / Sales Rep</label>
                  <input
                    type="text"
                    value={modalForm.seller || ''}
                    onChange={(e) => setModalForm({ ...modalForm, seller: e.target.value })}
                    placeholder="MR. ASIF / FAISAL / FAHIM"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* RFQ & Tender Info */}
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xs">
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">RFQ Number</label>
                  <input
                    type="text"
                    value={modalForm.rfqNumber || ''}
                    onChange={(e) => setModalForm({ ...modalForm, rfqNumber: e.target.value })}
                    placeholder="IND-SEI-SH-26-102"
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">RFQ Date</label>
                  <input
                    type="text"
                    value={modalForm.rfqDate || ''}
                    onChange={(e) => setModalForm({ ...modalForm, rfqDate: e.target.value })}
                    placeholder="23-Jul-26"
                    className="w-full px-2 py-1 border border-slate-300 rounded-xs text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-amber-900 uppercase block mb-0.5">Tender Number</label>
                  <input
                    type="text"
                    value={modalForm.tenderNo || ''}
                    onChange={(e) => setModalForm({ ...modalForm, tenderNo: e.target.value })}
                    placeholder="TND-2026-08"
                    className="w-full px-2 py-1 border border-amber-300 rounded-xs text-xs bg-amber-50/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-amber-900 uppercase block mb-0.5">Tender Date</label>
                  <input
                    type="text"
                    value={modalForm.tenderDate || ''}
                    onChange={(e) => setModalForm({ ...modalForm, tenderDate: e.target.value })}
                    placeholder="18-Jun-26"
                    className="w-full px-2 py-1 border border-amber-300 rounded-xs text-xs bg-amber-50/20"
                  />
                </div>
              </div>

              {/* Amount & Contact Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Quotation Amount (AED) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={modalForm.amount || ''}
                    onChange={(e) => setModalForm({ ...modalForm, amount: Number(e.target.value) })}
                    placeholder="959.18"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs font-black text-[#083c54]"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Inquiry Contact Person</label>
                  <input
                    type="text"
                    value={modalForm.inquiryBy || ''}
                    onChange={(e) => setModalForm({ ...modalForm, inquiryBy: e.target.value })}
                    placeholder="Mr. G Mohammed Irfan"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Email</label>
                  <input
                    type="email"
                    value={modalForm.email || ''}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    placeholder="store@SuperEng.ae"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Mobile / Phone</label>
                  <input
                    type="text"
                    value={modalForm.mobile || modalForm.phone || ''}
                    onChange={(e) => setModalForm({ ...modalForm, mobile: e.target.value, phone: e.target.value })}
                    placeholder="+971 55 224 6344"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xs text-xs"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs space-y-1.5">
                <span className="text-[9px] font-bold uppercase text-slate-600 block">Status & Follow-up State:</span>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalForm.steelOpen}
                      onChange={(e) => setModalForm({ ...modalForm, steelOpen: e.target.checked, win: false, lost: false })}
                      className="rounded text-amber-600"
                    />
                    <span className="font-bold text-amber-800">Steel Open</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalForm.win}
                      onChange={(e) => setModalForm({ ...modalForm, win: e.target.checked, steelOpen: false, lost: false })}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-emerald-800">Win Deal</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalForm.lost}
                      onChange={(e) => setModalForm({ ...modalForm, lost: e.target.checked, win: false, steelOpen: false })}
                      className="rounded text-rose-600"
                    />
                    <span className="font-bold text-rose-800">Lost Quote</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalForm.closed}
                      onChange={(e) => setModalForm({ ...modalForm, closed: e.target.checked })}
                      className="rounded text-slate-600"
                    />
                    <span className="font-bold text-slate-700">Closed</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[9px] font-bold text-slate-600 uppercase block mb-0.5">Notes / Follow-up Remarks</label>
                <textarea
                  rows={2}
                  value={modalForm.notes || ''}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  placeholder="e.g. Grade 8.8 HDG Hex bolts & nuts order approved..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xs text-xs font-sans"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#f37021] hover:bg-[#d95d13] text-white text-xs font-black uppercase rounded-xs cursor-pointer shadow-2xs"
                >
                  {isNewRecordMode ? 'Add to Log' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
