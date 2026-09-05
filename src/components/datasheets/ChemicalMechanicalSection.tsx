import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { DataSheetRecord } from './dataSheetTypes';

interface ChemicalMechanicalSectionProps {
  record: DataSheetRecord;
  setRecord: React.Dispatch<React.SetStateAction<DataSheetRecord>>;
  isCellSelected: (table: string, r: number, c: number) => boolean;
  selectCell: (table: string, r: number, c: number, extendRange?: boolean) => void;
  handleCellKeyDown: (e: React.KeyboardEvent, table: string, r: number, c: number, maxR: number, maxC: number) => void;
}

export const ChemicalMechanicalSection: React.FC<ChemicalMechanicalSectionProps> = ({
  record,
  setRecord,
  isCellSelected,
  selectCell,
  handleCellKeyDown
}) => {
  // Add Chemical Column
  const handleAddChemColumn = () => {
    const headerName = prompt('Enter new Chemical Element Header (e.g. %Cu, %Ni, %Cr):', '%X');
    if (!headerName) return;
    setRecord(prev => ({
      ...prev,
      chemicalHeaders: [...prev.chemicalHeaders, headerName],
      chemicalMin: [...prev.chemicalMin, '—'],
      chemicalMax: [...prev.chemicalMax, '—'],
      chemicalObserved: [...prev.chemicalObserved, '—']
    }));
  };

  // Remove Chemical Column
  const handleRemoveChemColumn = (colIdx: number) => {
    if (record.chemicalHeaders.length <= 1) return;
    setRecord(prev => ({
      ...prev,
      chemicalHeaders: prev.chemicalHeaders.filter((_, i) => i !== colIdx),
      chemicalMin: prev.chemicalMin.filter((_, i) => i !== colIdx),
      chemicalMax: prev.chemicalMax.filter((_, i) => i !== colIdx),
      chemicalObserved: prev.chemicalObserved.filter((_, i) => i !== colIdx)
    }));
  };

  // Add Mechanical Column
  const handleAddMechColumn = () => {
    const headerName = prompt('Enter new Mechanical Property Header (e.g. IMPACT TEST, SHEAR STRENGTH):', 'TEST PROPERTY');
    if (!headerName) return;
    setRecord(prev => ({
      ...prev,
      mechanicalHeaders: [...prev.mechanicalHeaders, headerName],
      mechanicalMin: [...prev.mechanicalMin, '—'],
      mechanicalMax: [...prev.mechanicalMax, '—'],
      mechanicalObserved: [...(prev.mechanicalObserved || []), '—'],
      mechanicalSelectedColumns: [...(prev.mechanicalSelectedColumns || prev.mechanicalHeaders.map(() => true)), true]
    }));
  };

  // Remove Mechanical Column
  const handleRemoveMechColumn = (colIdx: number) => {
    if (record.mechanicalHeaders.length <= 1) return;
    setRecord(prev => ({
      ...prev,
      mechanicalHeaders: prev.mechanicalHeaders.filter((_, i) => i !== colIdx),
      mechanicalMin: prev.mechanicalMin.filter((_, i) => i !== colIdx),
      mechanicalMax: prev.mechanicalMax.filter((_, i) => i !== colIdx),
      mechanicalObserved: (prev.mechanicalObserved || []).filter((_, i) => i !== colIdx),
      mechanicalSelectedColumns: (prev.mechanicalSelectedColumns || prev.mechanicalHeaders.map(() => true)).filter((_, i) => i !== colIdx)
    }));
  };

  // Toggle Mechanical Column Checkbox
  const handleToggleMechColumn = (colIdx: number) => {
    setRecord(prev => {
      const currentSelected = prev.mechanicalSelectedColumns && prev.mechanicalSelectedColumns.length === prev.mechanicalHeaders.length
        ? [...prev.mechanicalSelectedColumns]
        : prev.mechanicalHeaders.map(() => true);
      
      currentSelected[colIdx] = !currentSelected[colIdx];
      return {
        ...prev,
        mechanicalSelectedColumns: currentSelected
      };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. CHEMICAL ANALYSIS */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
              *CHEMICAL ANALYSIS
            </span>
            <span className="text-[10px] text-slate-500 font-mono">(Editable Headers & Values)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <span>SPECIFICATION:</span>
              <input
                type="text"
                value={record.chemicalSpecName}
                onChange={(e) => setRecord(prev => ({ ...prev, chemicalSpecName: e.target.value }))}
                className="border-b border-slate-400 font-black text-slate-900 px-1 outline-none text-xs bg-transparent"
              />
            </div>
            <button
              onClick={handleAddChemColumn}
              className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[10px] font-bold flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" /> Add Element
            </button>
          </div>
        </div>

        <div className="border border-black overflow-x-auto bg-white">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-black font-black text-slate-900">
                <th className="p-1.5 text-left border-r border-black w-14 bg-slate-200">SPEC</th>
                {record.chemicalHeaders.map((hdr, idx) => (
                  <th key={idx} className="p-0 border-r border-black relative group min-w-[50px]">
                    <div className="flex items-center justify-center p-1">
                      <textarea
                        rows={1}
                        value={hdr}
                        onChange={(e) => {
                          const updated = [...record.chemicalHeaders];
                          updated[idx] = e.target.value;
                          setRecord(prev => ({ ...prev, chemicalHeaders: updated }));
                        }}
                        className="w-full text-center font-mono font-bold text-xs bg-transparent outline-none resize-none whitespace-normal break-words"
                      />
                    </div>
                    {record.chemicalHeaders.length > 1 && (
                      <button
                        onClick={() => handleRemoveChemColumn(idx)}
                        title="Delete column"
                        className="absolute -top-1 right-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 p-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {/* MIN Row */}
              <tr>
                <td className="p-1 text-left font-black border-r border-black bg-slate-50">MIN</td>
                {record.chemicalMin.map((val, cIdx) => {
                  const isSelected = isCellSelected('chemical', 0, cIdx);
                  return (
                    <td 
                      key={cIdx} 
                      className={`p-0 border-r border-black transition-all ${
                        isSelected ? 'bg-sky-100 ring-2 ring-sky-600 z-10' : ''
                      }`}
                    >
                      <input
                        type="text"
                        data-cell={`chemical_0_${cIdx}`}
                        value={val}
                        onFocus={() => selectCell('chemical', 0, cIdx)}
                        onClick={(e) => selectCell('chemical', 0, cIdx, e.shiftKey)}
                        onChange={(e) => {
                          const updated = [...record.chemicalMin];
                          updated[cIdx] = e.target.value;
                          setRecord(prev => ({ ...prev, chemicalMin: updated }));
                        }}
                        onKeyDown={(e) => handleCellKeyDown(e, 'chemical', 0, cIdx, 2, record.chemicalHeaders.length)}
                        className="w-full text-center p-1 font-mono text-xs bg-transparent outline-none"
                      />
                    </td>
                  );
                })}
              </tr>

              {/* MAX Row */}
              <tr>
                <td className="p-1 text-left font-black border-r border-black bg-slate-50">MAX</td>
                {record.chemicalMax.map((val, cIdx) => {
                  const isSelected = isCellSelected('chemical', 1, cIdx);
                  return (
                    <td 
                      key={cIdx} 
                      className={`p-0 border-r border-black transition-all ${
                        isSelected ? 'bg-sky-100 ring-2 ring-sky-600 z-10' : ''
                      }`}
                    >
                      <input
                        type="text"
                        data-cell={`chemical_1_${cIdx}`}
                        value={val}
                        onFocus={() => selectCell('chemical', 1, cIdx)}
                        onClick={(e) => selectCell('chemical', 1, cIdx, e.shiftKey)}
                        onChange={(e) => {
                          const updated = [...record.chemicalMax];
                          updated[cIdx] = e.target.value;
                          setRecord(prev => ({ ...prev, chemicalMax: updated }));
                        }}
                        onKeyDown={(e) => handleCellKeyDown(e, 'chemical', 1, cIdx, 2, record.chemicalHeaders.length)}
                        className="w-full text-center p-1 font-mono text-xs bg-transparent outline-none"
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. MECHANICAL PROPERTIES */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
              *MECHANICAL PROPERTIES
            </span>
            <span className="text-[10px] text-slate-500 font-mono">(Editable Headers & Values)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <span>SPECIFICATION:</span>
              <input
                type="text"
                value={record.mechanicalSpecName}
                onChange={(e) => setRecord(prev => ({ ...prev, mechanicalSpecName: e.target.value }))}
                className="border-b border-slate-400 font-black text-slate-900 px-1 outline-none text-xs bg-transparent"
              />
            </div>
            <button
              onClick={handleAddMechColumn}
              className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[10px] font-bold flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5" /> Add Property
            </button>
          </div>
        </div>

        <div className="border border-black overflow-x-auto bg-white">
          <table className="min-w-full text-center border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100 border-b border-black font-black text-slate-900">
                <th className="p-1.5 text-left border-r border-black w-14 bg-slate-200 shrink-0">SPEC</th>
                {record.mechanicalHeaders.map((hdr, idx) => {
                  const isColChecked = record.mechanicalSelectedColumns && record.mechanicalSelectedColumns.length === record.mechanicalHeaders.length
                    ? record.mechanicalSelectedColumns[idx] !== false
                    : true;
                  return (
                    <th key={idx} className="p-0 border-r border-black relative group min-w-[100px] max-w-[160px]">
                      <div className="flex flex-col items-center justify-between p-1.5 min-h-[52px] gap-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={isColChecked}
                            onChange={() => handleToggleMechColumn(idx)}
                            title="Check/uncheck to include or exclude this property in print & view"
                            className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                          />
                          <span className="text-[9px] font-mono text-slate-500 font-semibold">#{idx + 1}</span>
                        </div>
                        <textarea
                          rows={2}
                          value={hdr}
                          onChange={(e) => {
                            const updated = [...record.mechanicalHeaders];
                            updated[idx] = e.target.value;
                            setRecord(prev => ({ ...prev, mechanicalHeaders: updated }));
                          }}
                          className={`w-full text-center text-[10px] font-bold leading-snug bg-transparent outline-none resize-none whitespace-normal break-words overflow-hidden ${
                            !isColChecked ? 'text-slate-400 line-through' : 'text-slate-900'
                          }`}
                          title="Click to edit property name"
                        />
                      </div>
                      {record.mechanicalHeaders.length > 1 && (
                        <button
                          onClick={() => handleRemoveMechColumn(idx)}
                          title="Delete column"
                          className="absolute -top-1 right-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {/* MIN Row */}
              <tr>
                <td className="p-1 text-left font-black border-r border-black bg-slate-50">MIN</td>
                {record.mechanicalMin.map((val, cIdx) => {
                  const isSelected = isCellSelected('mechanical', 0, cIdx);
                  const isColChecked = record.mechanicalSelectedColumns && record.mechanicalSelectedColumns.length === record.mechanicalHeaders.length
                    ? record.mechanicalSelectedColumns[cIdx] !== false
                    : true;
                  return (
                    <td 
                      key={cIdx} 
                      className={`p-0 border-r border-black transition-all ${
                        isSelected ? 'bg-sky-100 ring-2 ring-sky-600 z-10' : ''
                      } ${!isColChecked ? 'bg-slate-50/60 opacity-60' : ''}`}
                    >
                      <textarea
                        rows={1}
                        data-cell={`mechanical_0_${cIdx}`}
                        value={val}
                        onFocus={() => selectCell('mechanical', 0, cIdx)}
                        onClick={(e) => selectCell('mechanical', 0, cIdx, e.shiftKey)}
                        onChange={(e) => {
                          const updated = [...record.mechanicalMin];
                          updated[cIdx] = e.target.value;
                          setRecord(prev => ({ ...prev, mechanicalMin: updated }));
                        }}
                        onKeyDown={(e) => handleCellKeyDown(e, 'mechanical', 0, cIdx, 2, record.mechanicalHeaders.length)}
                        className="w-full text-center p-1.5 font-mono text-[10.5px] bg-transparent outline-none resize-none whitespace-normal break-words leading-tight"
                      />
                    </td>
                  );
                })}
              </tr>

              {/* MAX Row */}
              <tr>
                <td className="p-1 text-left font-black border-r border-black bg-slate-50">MAX</td>
                {record.mechanicalMax.map((val, cIdx) => {
                  const isSelected = isCellSelected('mechanical', 1, cIdx);
                  const isColChecked = record.mechanicalSelectedColumns && record.mechanicalSelectedColumns.length === record.mechanicalHeaders.length
                    ? record.mechanicalSelectedColumns[cIdx] !== false
                    : true;
                  return (
                    <td 
                      key={cIdx} 
                      className={`p-0 border-r border-black transition-all ${
                        isSelected ? 'bg-sky-100 ring-2 ring-sky-600 z-10' : ''
                      } ${!isColChecked ? 'bg-slate-50/60 opacity-60' : ''}`}
                    >
                      <textarea
                        rows={1}
                        data-cell={`mechanical_1_${cIdx}`}
                        value={val}
                        onFocus={() => selectCell('mechanical', 1, cIdx)}
                        onClick={(e) => selectCell('mechanical', 1, cIdx, e.shiftKey)}
                        onChange={(e) => {
                          const updated = [...record.mechanicalMax];
                          updated[cIdx] = e.target.value;
                          setRecord(prev => ({ ...prev, mechanicalMax: updated }));
                        }}
                        onKeyDown={(e) => handleCellKeyDown(e, 'mechanical', 1, cIdx, 2, record.mechanicalHeaders.length)}
                        className="w-full text-center p-1.5 font-mono text-[10.5px] bg-transparent outline-none resize-none whitespace-normal break-words leading-tight"
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
