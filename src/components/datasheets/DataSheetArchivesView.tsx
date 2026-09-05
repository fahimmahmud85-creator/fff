import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Printer, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Calendar,
  Building2
} from 'lucide-react';
import { DataSheetRecord } from './dataSheetTypes';
import { printDataSheet } from './dataSheetPrintHelper';

interface DataSheetArchivesViewProps {
  archives: DataSheetRecord[];
  onSelectRecord: (record: DataSheetRecord) => void;
  onEditRecord: (record: DataSheetRecord) => void;
  onDuplicateRecord: (record: DataSheetRecord) => void;
  onDeleteRecord: (id: string) => void;
  onCreateNew: () => void;
  onImportRecords?: (records: DataSheetRecord[]) => void;
}

export const DataSheetArchivesView: React.FC<DataSheetArchivesViewProps> = ({
  archives,
  onSelectRecord,
  onEditRecord,
  onDuplicateRecord,
  onDeleteRecord,
  onCreateNew,
  onImportRecords
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewRecord, setPreviewRecord] = useState<DataSheetRecord | null>(null);

  // Extract unique standards
  const standardsList = useMemo(() => {
    const set = new Set<string>();
    archives.forEach(item => {
      if (item.standard) set.add(item.standard);
    });
    return Array.from(set);
  }, [archives]);

  // Filtered archives
  const filteredArchives = useMemo(() => {
    return archives.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        (item.dataSheetNo || '').toLowerCase().includes(q) ||
        (item.customer || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q) ||
        (item.standard || '').toLowerCase().includes(q) ||
        (item.date || '').toLowerCase().includes(q);

      const matchesStandard = selectedStandard === 'ALL' || item.standard === selectedStandard;

      return matchesQuery && matchesStandard;
    });
  }, [archives, searchQuery, selectedStandard]);

  // Export all archives as JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(archives, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MFI_DATA_SHEET_ARCHIVES_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['DATA SHEET NO', 'DATE', 'COMPANY NAME', 'SUBJECT', 'STANDARD', 'MTC_PAGE_INCLUDED'];
    const rows = filteredArchives.map(item => [
      `"${item.dataSheetNo || ''}"`,
      `"${item.date || ''}"`,
      `"${(item.customer || '').replace(/"/g, '""')}"`,
      `"${(item.subject || '').replace(/"/g, '""')}"`,
      `"${item.standard || ''}"`,
      `"${item.includeMtcPage ? 'YES' : 'NO'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DATA_SHEET_ARCHIVES_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-wide uppercase">
              DATA SHEET ARCHIVES
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              {archives.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Central registry of technical data sheets, QA drawings, and inspection reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Data Sheet
          </button>

          <button
            onClick={handleExportCsv}
            title="Export CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            CSV
          </button>

          <button
            onClick={handleExportJson}
            title="Export JSON Backup"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            JSON
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Data Sheet No, Company Name, Standard, or Subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {standardsList.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-auto"
            >
              <option value="ALL">All Standards ({archives.length})</option>
              {standardsList.map(std => (
                <option key={std} value={std}>{std}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Archives Table - Spreadsheet Grid Style (Exact columns: # | DATA SHEET NO | DATE | COMPANY NAME | ACTION) */}
      <div className="bg-white rounded-lg border border-[#a6c3e3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#a6c3e3]">
            <thead>
              <tr className="bg-[#f0f5fc] text-slate-800 text-xs font-bold divide-x divide-[#a6c3e3] border-b border-[#a6c3e3]">
                <th className="py-2.5 px-3 w-12 text-center text-slate-600 bg-[#e4eef9]">#</th>
                <th className="py-2.5 px-4 w-1/4 font-semibold text-slate-800">DATA SHEET NO</th>
                <th className="py-2.5 px-4 w-1/6 font-semibold text-slate-800">DATE</th>
                <th className="py-2.5 px-4 w-1/3 font-semibold text-slate-800">COMPANY NAME</th>
                <th className="py-2.5 px-4 text-center w-40 font-semibold text-slate-800">ACTION</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-800 divide-y divide-[#c3d7ee]">
              {filteredArchives.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 bg-slate-50/50">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p className="font-semibold text-slate-600">No Data Sheet Records Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? 'Try adjusting your search criteria or standard filter.' : 'Click "New Data Sheet" above to create your first specification.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredArchives.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="divide-x divide-[#c3d7ee] hover:bg-[#edf5fd] transition-colors group h-10"
                  >
                    {/* ROW NUMBER */}
                    <td className="py-2 px-3 text-center text-slate-600 font-mono text-[11px] bg-[#f8fbfe] font-medium select-none">
                      {index + 1}
                    </td>

                    {/* DATA SHEET NO (Spreadsheet Hyperlink Style) */}
                    <td className="py-2 px-4">
                      <button
                        onClick={() => onEditRecord(item)}
                        className="font-medium text-[#185abd] hover:text-[#0f3c80] hover:underline text-left cursor-pointer transition-colors"
                      >
                        {item.dataSheetNo || 'UNASSIGNED'}
                      </button>
                    </td>

                    {/* DATE */}
                    <td className="py-2 px-4 text-slate-700 font-mono text-[11px]">
                      {item.date && item.date !== '—' ? item.date : '—'}
                    </td>

                    {/* COMPANY NAME */}
                    <td className="py-2 px-4 text-slate-800 font-medium">
                      {item.customer || 'GENERIC / UNASSIGNED'}
                    </td>

                    {/* ACTION */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Preview / Quick View */}
                        <button
                          onClick={() => setPreviewRecord(item)}
                          title="Quick Preview"
                          className="p-1 text-slate-600 hover:text-sky-700 hover:bg-sky-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit in Editor */}
                        <button
                          onClick={() => onEditRecord(item)}
                          title="Open in Data Sheet Editor"
                          className="p-1 text-slate-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Print / Save PDF */}
                        <button
                          onClick={() => printDataSheet(item)}
                          title="Print / Save PDF"
                          className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicateRecord(item)}
                          title="Duplicate Data Sheet"
                          className="p-1 text-slate-600 hover:text-amber-700 hover:bg-amber-100 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded border border-red-200">
                            <span className="text-[9px] font-bold text-red-700 px-0.5">Del?</span>
                            <button
                              onClick={() => {
                                onDeleteRecord(item.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-1 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold hover:bg-red-700"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold hover:bg-slate-300"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            title="Delete Data Sheet"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-[#f8fbfe] px-4 py-2 border-t border-[#a6c3e3] flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredArchives.length}</span> of{' '}
            <span className="font-bold text-slate-800">{archives.length}</span> records
          </div>
          <div className="text-[11px] text-slate-500">
            Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 text-slate-700 rounded font-mono text-[10px]">Ctrl+D</kbd> for Fill Down & <kbd className="px-1 py-0.5 bg-white border border-slate-300 text-slate-700 rounded font-mono text-[10px]">Ctrl+V</kbd> for Excel Paste in Editor
          </div>
        </div>
      </div>

      {/* Quick Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  {previewRecord.dataSheetNo} - PREVIEW
                </h3>
                <p className="text-xs text-slate-500">{previewRecord.customer}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printDataSheet(previewRecord)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => {
                    onEditRecord(previewRecord);
                    setPreviewRecord(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Open in Editor
                </button>
                <button
                  onClick={() => setPreviewRecord(null)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                <div><strong>Subject:</strong> {previewRecord.subject}</div>
                <div><strong>Date:</strong> {previewRecord.date || '—'}</div>
                <div><strong>Standard:</strong> {previewRecord.standard || '—'}</div>
                <div><strong>Pages:</strong> {previewRecord.includeMtcPage ? '2 Pages (Includes MTC)' : '1 Page'}</div>
              </div>

              {previewRecord.showObjective && (
                <div className="border border-slate-200 rounded-lg p-3">
                  <div className="font-bold text-slate-900 mb-1 uppercase">Objective:</div>
                  <p className="text-slate-700">{previewRecord.objectiveContent}</p>
                </div>
              )}

              {previewRecord.showDimensionalInspection && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 uppercase">
                    Dimensional Inspections ({previewRecord.dimensionalInspections?.length || 0} checks)
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-2">Characteristic</th>
                        <th className="p-2">Requirements</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRecord.dimensionalInspections?.map((row, idx) => (
                        <tr key={idx} className={row.selected ? '' : 'opacity-40 line-through'}>
                          <td className="p-2 font-medium">{row.characteristic}</td>
                          <td className="p-2 font-mono text-slate-800">{row.requirements}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
