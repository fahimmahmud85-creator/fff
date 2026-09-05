import React from 'react';
import { Plus, Trash2, Copy, RotateCcw, CheckSquare, Square, Eye, EyeOff } from 'lucide-react';
import { DataSheetRecord, MultiSizeInspectionRow } from './dataSheetTypes';
import { 
  MULTI_SIZE_DEFAULT_HEADERS, 
  MULTI_SIZE_DEFAULT_SELECTED_COLUMNS, 
  MULTI_SIZE_FIELDS 
} from './dataSheetPresets';

interface Template2MultiSizeViewProps {
  record: DataSheetRecord;
  setRecord: React.Dispatch<React.SetStateAction<DataSheetRecord>>;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const Template2MultiSizeView: React.FC<Template2MultiSizeViewProps> = ({
  record,
  setRecord,
  showToast
}) => {
  const rows = record.multiSizeRows || [];
  const headers = record.multiSizeHeaders && record.multiSizeHeaders.length === 11
    ? record.multiSizeHeaders
    : MULTI_SIZE_DEFAULT_HEADERS;
  
  const selectedColumns = record.multiSizeSelectedColumns && record.multiSizeSelectedColumns.length === 11
    ? record.multiSizeSelectedColumns
    : MULTI_SIZE_DEFAULT_SELECTED_COLUMNS;

  // Add empty row
  const handleAddRow = () => {
    const nextItem = (rows.length + 1).toString().padStart(2, '0');
    const newRow: MultiSizeInspectionRow = {
      id: `ms-${Date.now()}`,
      itemNo: nextItem,
      size: `M${(rows.length + 1) * 2}`,
      length: '—',
      acrossFlat: '—',
      acrossCorner: '—',
      thickness: '—',
      threadPitch: '—',
      standardGrade: record.standard || 'DIN 934',
      sampleQty: '20 PCS',
      visualFinish: 'PASS',
      remarks: 'CONFORMS'
    };
    setRecord(prev => ({
      ...prev,
      multiSizeRows: [...(prev.multiSizeRows || []), newRow]
    }));
    showToast(`Added row #${nextItem}`, 'info');
  };

  // Duplicate Row
  const handleDuplicateRow = (index: number) => {
    const target = rows[index];
    if (!target) return;
    const duplicated: MultiSizeInspectionRow = {
      ...target,
      id: `ms-${Date.now()}`,
      itemNo: (rows.length + 1).toString().padStart(2, '0')
    };
    const updated = [...rows];
    updated.splice(index + 1, 0, duplicated);
    setRecord(prev => ({ ...prev, multiSizeRows: updated }));
    showToast(`Duplicated size row`, 'info');
  };

  // Delete Row
  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) {
      showToast('At least one size row is required', 'error');
      return;
    }
    const filtered = rows.filter(r => r.id !== id);
    setRecord(prev => ({ ...prev, multiSizeRows: filtered }));
  };

  // Toggle column print visibility
  const handleToggleColumn = (colIdx: number, isChecked: boolean) => {
    const current = [...selectedColumns];
    current[colIdx] = isChecked;
    setRecord(prev => ({
      ...prev,
      multiSizeSelectedColumns: current
    }));
  };

  // Update column header text
  const handleUpdateHeader = (colIdx: number, text: string) => {
    const current = [...headers];
    current[colIdx] = text;
    setRecord(prev => ({
      ...prev,
      multiSizeHeaders: current
    }));
  };

  // Reset headers to defaults
  const handleResetHeaders = () => {
    setRecord(prev => ({
      ...prev,
      multiSizeHeaders: [...MULTI_SIZE_DEFAULT_HEADERS],
      multiSizeSelectedColumns: [...MULTI_SIZE_DEFAULT_SELECTED_COLUMNS]
    }));
    showToast('Reset table headers to default', 'info');
  };

  const handleUpdateRowField = (index: number, field: keyof MultiSizeInspectionRow, value: string) => {
    const updated = [...rows];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setRecord(prev => ({ ...prev, multiSizeRows: updated }));
  };

  const columnWidths = [
    'min-w-[65px] max-w-[80px]',   // ITEM
    'min-w-[90px]',                // SIZE / DIA
    'min-w-[85px]',                // LENGTH (mm)
    'min-w-[120px]',               // ACROSS FLAT (s)
    'min-w-[120px]',               // ACROSS CORNER (e)
    'min-w-[110px]',               // THICKNESS (m)
    'min-w-[105px]',               // THREAD / PITCH
    'min-w-[110px]',               // STANDARD / GR
    'min-w-[85px]',                // QTY / LOT
    'min-w-[90px]',                // FINISH
    'min-w-[95px]'                 // REMARKS
  ];

  return (
    <div className="border-2 border-black mb-4 bg-white">
      
      {/* Header bar: DIMENSION */}
      <div className="bg-slate-900 text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-sky-300">
            DIMENSION
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            {rows.length} SIZES / ITEMS
          </span>
          <span className="text-[10px] text-slate-400">
            ({selectedColumns.filter(Boolean).length} / 11 Columns in Print PDF)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetHeaders}
            title="Reset column titles & checkboxes to standard defaults"
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Headers
          </button>
          <button
            onClick={handleAddRow}
            className="text-[11px] bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Size Row
          </button>
        </div>
      </div>

      {/* Multi-Size Matrix Spreadsheet Table with Editable Headers & Checkboxes */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs text-center">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-slate-900 font-black text-[11px]">
              {headers.map((hdr, colIdx) => {
                const isSelected = selectedColumns[colIdx] !== false;
                return (
                  <th 
                    key={colIdx} 
                    className={`p-1.5 border-r border-black ${columnWidths[colIdx] || 'min-w-[90px]'} transition-colors ${
                      isSelected ? 'bg-slate-100' : 'bg-slate-200/80 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <label 
                        className="flex items-center gap-1 cursor-pointer select-none"
                        title={isSelected ? 'Included in Print PDF (Click to hide)' : 'Hidden from Print PDF (Click to show)'}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleColumn(colIdx, e.target.checked)}
                          className="w-3.5 h-3.5 text-sky-600 rounded cursor-pointer accent-sky-600"
                        />
                        <span className="text-[9px] font-bold text-slate-500">
                          {isSelected ? 'PRINT' : 'HIDE'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={hdr}
                        onChange={(e) => handleUpdateHeader(colIdx, e.target.value)}
                        placeholder={`Col ${colIdx + 1}`}
                        title="Edit Column Header"
                        className={`w-full text-center font-black text-[10.5px] uppercase tracking-tight bg-transparent border-b border-transparent hover:border-slate-400 focus:border-sky-600 focus:bg-white px-1 py-0.5 rounded outline-none transition-colors ${
                          isSelected ? 'text-slate-900' : 'text-slate-500 line-through'
                        }`}
                      />
                    </div>
                  </th>
                );
              })}
              <th className="p-2 w-16 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-sky-50/40 transition-colors">
                
                {/* 0. Item Number */}
                <td className={`p-1 border-r border-black font-black ${selectedColumns[0] !== false ? 'bg-slate-50' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.itemNo}
                    onChange={(e) => handleUpdateRowField(idx, 'itemNo', e.target.value)}
                    className="w-full text-center font-mono font-bold text-xs bg-transparent outline-none"
                  />
                </td>

                {/* 1. Size / Dia */}
                <td className={`p-1 border-r border-black font-black ${selectedColumns[1] !== false ? 'bg-sky-50/50' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.size}
                    onChange={(e) => handleUpdateRowField(idx, 'size', e.target.value)}
                    placeholder="M8"
                    className="w-full text-center font-black text-xs text-sky-900 bg-transparent outline-none"
                  />
                </td>

                {/* 2. Length */}
                <td className={`p-1 border-r border-black ${selectedColumns[2] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.length}
                    onChange={(e) => handleUpdateRowField(idx, 'length', e.target.value)}
                    className="w-full text-center font-mono text-xs bg-transparent outline-none"
                  />
                </td>

                {/* 3. Across Flat */}
                <td className={`p-1 border-r border-black ${selectedColumns[3] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.acrossFlat}
                    onChange={(e) => handleUpdateRowField(idx, 'acrossFlat', e.target.value)}
                    placeholder="9.78 - 10.00"
                    className="w-full text-center font-mono text-xs bg-transparent outline-none"
                  />
                </td>

                {/* 4. Across Corner */}
                <td className={`p-1 border-r border-black ${selectedColumns[4] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.acrossCorner}
                    onChange={(e) => handleUpdateRowField(idx, 'acrossCorner', e.target.value)}
                    placeholder="MIN 11.05"
                    className="w-full text-center font-mono text-xs bg-transparent outline-none"
                  />
                </td>

                {/* 5. Thickness / Height */}
                <td className={`p-1 border-r border-black ${selectedColumns[5] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.thickness}
                    onChange={(e) => handleUpdateRowField(idx, 'thickness', e.target.value)}
                    placeholder="4.70 - 5.00"
                    className="w-full text-center font-mono text-xs bg-transparent outline-none"
                  />
                </td>

                {/* 6. Thread Pitch */}
                <td className={`p-1 border-r border-black ${selectedColumns[6] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.threadPitch}
                    onChange={(e) => handleUpdateRowField(idx, 'threadPitch', e.target.value)}
                    placeholder="1.25 (6H)"
                    className="w-full text-center font-mono text-xs bg-transparent outline-none"
                  />
                </td>

                {/* 7. Standard / Grade */}
                <td className={`p-1 border-r border-black ${selectedColumns[7] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.standardGrade}
                    onChange={(e) => handleUpdateRowField(idx, 'standardGrade', e.target.value)}
                    placeholder="DIN 934 / 8"
                    className="w-full text-center text-xs font-semibold bg-transparent outline-none"
                  />
                </td>

                {/* 8. Sample Qty */}
                <td className={`p-1 border-r border-black ${selectedColumns[8] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.sampleQty}
                    onChange={(e) => handleUpdateRowField(idx, 'sampleQty', e.target.value)}
                    placeholder="20 PCS"
                    className="w-full text-center text-xs font-mono bg-transparent outline-none"
                  />
                </td>

                {/* 9. Visual / Finish */}
                <td className={`p-1 border-r border-black ${selectedColumns[9] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.visualFinish}
                    onChange={(e) => handleUpdateRowField(idx, 'visualFinish', e.target.value)}
                    placeholder="HDG / PASS"
                    className="w-full text-center text-xs bg-transparent outline-none"
                  />
                </td>

                {/* 10. Remarks */}
                <td className={`p-1 border-r border-black ${selectedColumns[10] !== false ? '' : 'bg-slate-100/60 opacity-50'}`}>
                  <input
                    type="text"
                    value={row.remarks}
                    onChange={(e) => handleUpdateRowField(idx, 'remarks', e.target.value)}
                    placeholder="CONFORMS"
                    className="w-full text-center font-bold text-xs text-emerald-800 bg-transparent outline-none"
                  />
                </td>

                {/* Row Actions */}
                <td className="p-1 text-center bg-slate-50">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleDuplicateRow(idx)}
                      title="Duplicate size row"
                      className="p-1 text-slate-500 hover:text-sky-700 rounded hover:bg-slate-200"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      title="Delete size row"
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
