import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Printer, Edit, Trash2, Copy, FileText,
  Layers, CheckSquare, Wrench, Calendar, Eye, LayoutList, LayoutGrid, RotateCcw
} from 'lucide-react';
import { DrawingArchiveItem, DrawingSheetCategory } from './drawingTypes';
import { printLandscapeDrawing } from './drawingPrintHelper';

interface DrawingArchivesViewProps {
  archives: DrawingArchiveItem[];
  setArchives: React.Dispatch<React.SetStateAction<DrawingArchiveItem[]>>;
  onLoadDrawing: (item: DrawingArchiveItem) => void;
  onNewDrawing: (category?: DrawingSheetCategory) => void;
  triggerToast?: (msg: string) => void;
  onPreviewDrawing?: (item: DrawingArchiveItem) => void;
}

export const DrawingArchivesView: React.FC<DrawingArchivesViewProps> = ({
  archives,
  setArchives,
  onLoadDrawing,
  onNewDrawing,
  triggerToast,
  onPreviewDrawing
}) => {
  const [archiveSearch, setArchiveSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'WORK_ORDER' | 'APPROVAL'>('ALL');
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'tiles' | 'table'>('table');

  const approvalCount = archives.filter(a => a.sheetCategory === 'APPROVAL').length;
  const workOrderCount = archives.filter(a => a.sheetCategory === 'WORK_ORDER').length;

  // Extract unique customer names for filter dropdown
  const uniqueCustomers = useMemo(() => {
    const list = Array.from(new Set(archives.map(a => a.customer.trim()).filter(Boolean)));
    return list.sort();
  }, [archives]);

  const filteredArchives = useMemo(() => {
    return archives.filter(item => {
      const q = archiveSearch.toLowerCase().trim();
      const matchSearch = !q ||
        item.drawingNo.toLowerCase().includes(q) ||
        item.jobName.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.boltSpec.toLowerCase().includes(q) ||
        (item.workOrderNo && item.workOrderNo.toLowerCase().includes(q)) ||
        (item.quoteNo && item.quoteNo.toLowerCase().includes(q)) ||
        (item.salesOrderNo && item.salesOrderNo.toLowerCase().includes(q));

      const matchCategory = categoryFilter === 'ALL' || item.sheetCategory === categoryFilter;
      const matchCustomer = customerFilter === 'ALL' || item.customer === customerFilter;

      let matchDate = true;
      if (fromDate) {
        matchDate = matchDate && (item.date >= fromDate || item.createdAt >= fromDate);
      }
      if (toDate) {
        matchDate = matchDate && (item.date <= toDate || item.createdAt <= toDate);
      }

      return matchSearch && matchCategory && matchCustomer && matchDate;
    });
  }, [archives, archiveSearch, categoryFilter, customerFilter, fromDate, toDate]);

  // Duplicate Drawing
  const handleDuplicate = (item: DrawingArchiveItem) => {
    const duplicated: DrawingArchiveItem = {
      ...item,
      id: `dwg-${Date.now()}`,
      sn: archives.length + 1,
      drawingNo: `${item.drawingNo}-COPY`,
      createdAt: new Date().toISOString()
    };
    setArchives([duplicated, ...archives].map((it, idx) => ({ ...it, sn: idx + 1 })));
    if (triggerToast) triggerToast(`Duplicated ${item.drawingNo}`);
  };

  // Delete Drawing
  const handleDelete = (id: string, drawingNo: string) => {
    if (confirm(`Are you sure you want to delete drawing ${drawingNo}?`)) {
      setArchives(archives.filter(a => a.id !== id).map((it, idx) => ({ ...it, sn: idx + 1 })));
      if (triggerToast) triggerToast(`Deleted ${drawingNo}`);
    }
  };

  return (
    <div className="space-y-2.5 font-sans">
      
      {/* COMPACT & SLEEK COMMAND BAR */}
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        
        {/* Left: Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>ALL</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-slate-300 text-slate-900">
              {archives.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('APPROVAL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              categoryFilter === 'APPROVAL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <CheckSquare className="w-3 h-3 text-blue-300" />
            <span>FOR APPROVAL</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-200 text-blue-900">
              {approvalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('WORK_ORDER')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              categoryFilter === 'WORK_ORDER'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Wrench className="w-3 h-3 text-amber-300" />
            <span>WORK ORDER</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-200 text-amber-950">
              {workOrderCount}
            </span>
          </button>
        </div>

        {/* Right: Quick Search, Filter & View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search drawings..."
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer outline-none max-w-[130px]"
          >
            <option value="ALL">All Clients</option>
            {uniqueCustomers.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {(fromDate || toDate || customerFilter !== 'ALL' || archiveSearch) && (
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
                setCustomerFilter('ALL');
                setArchiveSearch('');
              }}
              className="text-[11px] text-red-600 hover:text-red-800 font-bold px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer flex items-center gap-1"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('tiles')}
              className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tiles' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Compact Tiles View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Compact Table View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New Drawing */}
          <button
            type="button"
            onClick={() => onNewDrawing(categoryFilter === 'ALL' ? 'WORK_ORDER' : categoryFilter)}
            className="px-2.5 py-1 bg-[#0B3B49] text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-[#072731] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* ARCHIVES CONTENT */}
      {filteredArchives.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-xs text-slate-700">No matching drawings found</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Try changing your search query or creating a new blueprint.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================================================================= */
        /* COMPACT LIST TABLE VIEW                                                   */
        /* ========================================================================= */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#0B3B49] text-white text-[10.5px] font-bold uppercase tracking-wider">
                <th className="py-2 px-3 border-r border-[#0e4859] w-24 text-center">Date</th>
                <th className="py-2 px-3 border-r border-[#0e4859] w-40">
                  {categoryFilter === 'WORK_ORDER' ? 'Work Order No' : categoryFilter === 'APPROVAL' ? 'Quote No' : 'Ref Number'}
                </th>
                <th className="py-2 px-3 border-r border-[#0e4859]">Customer & Job</th>
                <th className="py-2 px-3 border-r border-[#0e4859] w-48">Fastener / Spec</th>
                <th className="py-2 px-3 text-center w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredArchives.map((item, idx) => {
                const isWO = item.sheetCategory === 'WORK_ORDER';
                const numberDisplay = isWO 
                  ? (item.workOrderNo || item.salesOrderNo || item.drawingNo || 'WO-10492')
                  : (item.quoteNo || item.salesOrderNo || item.drawingNo || 'QT-8491');

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    {/* 1. DATE */}
                    <td className="py-1.5 px-3 text-center font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                        <span>{item.date || item.approvalDate || '2026-08-20'}</span>
                      </div>
                    </td>

                    {/* 2. NUMBER */}
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold border ${
                          isWO 
                            ? 'bg-amber-50 text-amber-900 border-amber-300' 
                            : 'bg-blue-50 text-blue-900 border-blue-300'
                        }`}>
                          {numberDisplay}
                        </span>
                        <span className={`text-[8.5px] font-extrabold uppercase px-1 py-0.2 rounded ${
                          isWO ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isWO ? 'WO' : 'APP'}
                        </span>
                      </div>
                    </td>

                    {/* 3. CUSTOMER & JOB */}
                    <td className="py-1.5 px-3">
                      <div className="font-extrabold text-slate-900 uppercase tracking-tight text-[11.5px] truncate max-w-sm">
                        {item.customer || 'AL HABTOOR ENGINEERING LLC'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate max-w-sm">
                        {item.jobName || 'ANCHOR BOLT SUBMITTAL'} • <span className="font-mono text-slate-400">Dwg: {item.drawingNo}</span>
                      </div>
                    </td>

                    {/* 4. FASTENER / SPEC */}
                    <td className="py-1.5 px-3">
                      <div className="text-[11px] font-bold text-slate-800 truncate">
                        {item.fastenerType.replace('_', ' ').toUpperCase()} • {item.diameter} × {item.overallLength}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">
                        {item.boltSpec}
                      </div>
                    </td>

                    {/* 5. ACTIONS */}
                    <td className="py-1.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => printLandscapeDrawing(item)}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs"
                          title="Print Blueprint PDF"
                        >
                          <Printer className="w-2.5 h-2.5" />
                          <span>PDF</span>
                        </button>

                        {onPreviewDrawing && (
                          <button
                            type="button"
                            onClick={() => onPreviewDrawing(item)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs transition-colors cursor-pointer"
                            title="Preview Blueprint"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onLoadDrawing(item)}
                          className="px-2 py-0.5 bg-[#0B3B49] hover:bg-[#072731] text-white rounded text-[10px] font-bold transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs"
                          title="Edit in Blueprint Designer"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(item)}
                          className="p-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-xs transition-colors cursor-pointer"
                          title="Duplicate record"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.drawingNo)}
                          className="p-1 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded text-xs transition-colors cursor-pointer"
                          title="Delete drawing"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ========================================================================= */
        /* COMPACT & UNIQUE GRID CARDS VIEW                                          */
        /* ========================================================================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredArchives.map((item) => {
            const isWO = item.sheetCategory === 'WORK_ORDER';
            const numberDisplay = isWO 
              ? (item.workOrderNo || item.salesOrderNo || item.drawingNo || 'WO-10492')
              : (item.quoteNo || item.salesOrderNo || item.drawingNo || 'QT-8491');

            return (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Card Top Mini Banner */}
                <div className={`px-2.5 py-1.5 border-b flex items-center justify-between gap-1.5 ${
                  isWO 
                    ? 'bg-amber-500/10 border-amber-200 text-amber-900' 
                    : 'bg-blue-500/10 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-mono font-extrabold text-[10.5px] truncate">
                      {numberDisplay}
                    </span>
                    <span className={`text-[8.5px] font-bold px-1 rounded uppercase shrink-0 ${
                      isWO ? 'bg-amber-200 text-amber-950' : 'bg-blue-200 text-blue-950'
                    }`}>
                      {isWO ? 'Work Order' : 'Approval'}
                    </span>
                  </div>
                  <span className="text-[9.5px] font-mono text-slate-500 shrink-0">
                    {item.date}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-2.5 space-y-1.5 flex-1">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-tight truncate" title={item.customer}>
                      {item.customer}
                    </h3>
                    <p className="text-[11px] text-slate-600 font-medium truncate" title={item.jobName}>
                      {item.jobName}
                    </p>
                  </div>

                  {/* Blueprint Technical Snippet */}
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 space-y-1 text-[10.5px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Type:</span>
                      <span className="font-bold text-slate-800 uppercase truncate max-w-[120px]">
                        {item.fastenerType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Size:</span>
                      <span className="font-mono font-bold text-blue-700">
                        {item.diameter} × {item.overallLength}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Dwg No:</span>
                      <span className="font-mono text-slate-600 text-[10px]">
                        {item.drawingNo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="px-2.5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(item)}
                      className="p-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-xs transition-colors cursor-pointer"
                      title="Duplicate blueprint"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.drawingNo)}
                      className="p-1 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded text-xs transition-colors cursor-pointer"
                      title="Delete blueprint"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {onPreviewDrawing && (
                      <button
                        type="button"
                        onClick={() => onPreviewDrawing(item)}
                        className="p-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs transition-colors cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => printLandscapeDrawing(item)}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10.5px] font-bold shadow-2xs transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Print PDF"
                    >
                      <Printer className="w-2.5 h-2.5" />
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoadDrawing(item)}
                      className="px-2 py-0.5 bg-[#0B3B49] hover:bg-[#072731] text-white rounded text-[10.5px] font-bold shadow-2xs transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                      <Edit className="w-2.5 h-2.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
