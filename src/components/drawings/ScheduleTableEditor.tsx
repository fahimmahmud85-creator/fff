import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Plus, RotateCcw, Sparkles, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ScheduleColumn, DynamicScheduleRow } from './drawingTypes';

interface ScheduleTableEditorProps {
  tableTitle?: string;
  setTableTitle?: (val: string) => void;
  scheduleColumns: ScheduleColumn[];
  setScheduleColumns: React.Dispatch<React.SetStateAction<ScheduleColumn[]>>;
  sizeSchedule: DynamicScheduleRow[];
  setSizeSchedule: React.Dispatch<React.SetStateAction<DynamicScheduleRow[]>>;
  onOpenAddColumnModal: () => void;
  onQuickAddPresetColumn: (label: string, width?: string) => void;
  triggerToast?: (msg: string) => void;
}

export const SCHEDULE_PRESETS = [
  { label: 'WASHER DIA', width: '65px' },
  { label: 'GRADE / SPEC', width: '75px' },
  { label: 'PROJECTION (P)', width: '65px' },
  { label: 'NUT QTY', width: '50px' },
  { label: 'WASHER QTY', width: '55px' },
  { label: 'THREAD 2 (T2)', width: '65px' },
  { label: 'COATING', width: '65px' },
  { label: 'WEIGHT (KG)', width: '60px' }
];

export const DEFAULT_SCHEDULE_COLUMNS: ScheduleColumn[] = [
  { id: 'c-sl', key: 'sl', label: 'SL', width: '26px' },
  { id: 'c-mark', key: 'mark', label: 'MARK', width: '60px' },
  { id: 'c-dia', key: 'dia', label: 'DIA', width: '55px' },
  { id: 'c-pitch', key: 'pitch', label: 'PITCH', width: '50px' },
  { id: 'c-len', key: 'length', label: 'LENGTH', width: '65px' },
  { id: 'c-thrd', key: 'thread', label: 'THREAD', width: '60px' },
  { id: 'c-bend', key: 'bend', label: 'BEND', width: '55px' },
  { id: 'c-qty', key: 'qty', label: 'QTY', width: '45px' },
  { id: 'c-notes', key: 'notes', label: 'NOTES', width: 'auto' }
];

export const ScheduleTableEditor: React.FC<ScheduleTableEditorProps> = ({
  tableTitle = 'DIMENSIONS',
  setTableTitle,
  scheduleColumns,
  setScheduleColumns,
  sizeSchedule,
  setSizeSchedule,
  onOpenAddColumnModal,
  onQuickAddPresetColumn,
  triggerToast
}) => {
  // Column Drag-Resizing State
  const [resizingColId, setResizingColId] = useState<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(60);
  const activeColIdRef = useRef<string | null>(null);

  // Column width step adjuster
  const handleAdjustColumnWidth = (colId: string, deltaPx: number) => {
    setScheduleColumns(scheduleColumns.map(c => {
      if (c.id !== colId) return c;
      const currentWidthPx = parseInt(c.width || '60', 10) || 60;
      const newWidthPx = Math.max(24, Math.min(300, currentWidthPx + deltaPx));
      return { ...c, width: `${newWidthPx}px` };
    }));
  };

  // Direct column width change
  const handleSetExactColumnWidth = (colId: string, widthStr: string) => {
    setScheduleColumns(scheduleColumns.map(c => c.id === colId ? { ...c, width: widthStr } : c));
  };

  // Mouse Down on Column Divider (Start Resizing)
  const handleStartResize = (e: React.MouseEvent, col: ScheduleColumn) => {
    e.preventDefault();
    e.stopPropagation();
    activeColIdRef.current = col.id;
    setResizingColId(col.id);
    startXRef.current = e.clientX;
    startWidthRef.current = parseInt(col.width || '60', 10) || 60;
  };

  // Global mousemove & mouseup listeners during resize
  useEffect(() => {
    if (!resizingColId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!activeColIdRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(24, Math.min(350, startWidthRef.current + deltaX));
      
      setScheduleColumns(cols => cols.map(c => 
        c.id === activeColIdRef.current ? { ...c, width: `${newWidth}px` } : c
      ));
    };

    const handleMouseUp = () => {
      setResizingColId(null);
      activeColIdRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColId, setScheduleColumns]);

  // Update Column Header Label
  const handleUpdateColumnLabel = (colId: string, newLabel: string) => {
    setScheduleColumns(scheduleColumns.map(c => c.id === colId ? { ...c, label: newLabel } : c));
  };

  // Move Column (Reorder)
  const handleMoveColumn = (colIndex: number, direction: 'left' | 'right') => {
    if (direction === 'left' && colIndex > 0) {
      const copy = [...scheduleColumns];
      const temp = copy[colIndex - 1];
      copy[colIndex - 1] = copy[colIndex];
      copy[colIndex] = temp;
      setScheduleColumns(copy);
    } else if (direction === 'right' && colIndex < scheduleColumns.length - 1) {
      const copy = [...scheduleColumns];
      const temp = copy[colIndex + 1];
      copy[colIndex + 1] = copy[colIndex];
      copy[colIndex] = temp;
      setScheduleColumns(copy);
    }
  };

  // Remove Column
  const handleDeleteColumn = (colId: string, colLabel: string) => {
    if (scheduleColumns.length <= 2) {
      if (triggerToast) triggerToast('Table must have at least 2 columns.');
      return;
    }
    setScheduleColumns(scheduleColumns.filter(c => c.id !== colId));
    if (triggerToast) triggerToast(`Removed column "${colLabel}".`);
  };

  // Reset Default Schedule Columns
  const handleResetDefaultColumns = () => {
    setScheduleColumns(DEFAULT_SCHEDULE_COLUMNS);
    if (triggerToast) triggerToast('Reset schedule table to standard 9 columns.');
  };

  // Add Row
  const handleAddSizeRow = () => {
    const nextSl = sizeSchedule.length + 1;
    const newRow: DynamicScheduleRow = {
      id: `sz-${Date.now()}`,
      sl: nextSl,
      mark: `AB-${nextSl}`,
      dia: 'M30',
      pitch: '3.5',
      length: '750mm',
      thread: '150mm',
      bend: '120mm',
      qty: 50,
      notes: ''
    };
    setSizeSchedule([...sizeSchedule, newRow]);
    if (triggerToast) triggerToast(`Added Row #${nextSl} to schedule table.`);
  };

  // Update Row Cell
  const handleUpdateRowCell = (rowId: string, colKey: string, val: any) => {
    setSizeSchedule(sizeSchedule.map(r => r.id === rowId ? { ...r, [colKey]: val } : r));
  };

  // Delete Row
  const handleDeleteSizeRow = (rowId: string) => {
    setSizeSchedule(sizeSchedule.filter(r => r.id !== rowId).map((r, idx) => ({ ...r, sl: idx + 1 })));
  };

  return (
    <div className="mt-1.5 border-2 border-black bg-white">
      {/* 1. Quick Add Column Pills Bar */}
      <div className="bg-slate-100 border-b border-black px-2 py-1 flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[9px] font-bold text-slate-600 uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            <span>+ Quick Add Column:</span>
          </span>
          {SCHEDULE_PRESETS.map(preset => {
            const exists = scheduleColumns.some(c => c.label.toUpperCase() === preset.label);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onQuickAddPresetColumn(preset.label, preset.width)}
                className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer border ${
                  exists 
                    ? 'bg-slate-200 text-slate-500 border-slate-300' 
                    : 'bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 border-blue-200 shadow-2xs'
                }`}
                title={`Click to immediately add column "${preset.label}"`}
              >
                + {preset.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenAddColumnModal}
          className="text-[9px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
        >
          <PlusCircle className="w-2.5 h-2.5" />
          <span>+ Custom Column</span>
        </button>
      </div>

      {/* 2. Top Header Strip */}
      <div className="bg-black text-white text-[9.5px] font-bold px-2 py-1 flex items-center justify-between uppercase tracking-wider flex-wrap gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          {setTableTitle ? (
            <input
              type="text"
              value={tableTitle}
              onChange={(e) => setTableTitle(e.target.value.toUpperCase())}
              className="bg-transparent text-white font-black uppercase text-[10.5px] tracking-wider outline-none border-b border-transparent hover:border-slate-500 focus:border-blue-400 py-0.5 cursor-text"
              title="Click to edit schedule title (DIMENSIONS)"
            />
          ) : (
            <span className="font-black text-[10.5px] tracking-wider">{tableTitle || 'DIMENSIONS'}</span>
          )}
          {sizeSchedule.length > 5 ? (
            <span className="text-[8px] bg-blue-900/90 text-blue-200 border border-blue-400/40 px-1.5 py-0.5 rounded font-mono font-semibold">
              {sizeSchedule.length} SIZES • PAGE 1 + NEXT PAGE OVERFLOW AUTO-SPLIT
            </span>
          ) : (
            <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-normal">
              {sizeSchedule.length} SIZES
            </span>
          )}
          <span className="text-[8px] text-slate-400 hidden lg:inline font-mono">
            Drag Column Borders ⇹ to Adjust Width
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleAddSizeRow}
            className="text-[9px] bg-white text-black px-2 py-0.5 rounded font-bold hover:bg-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>+ Add Row</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefaultColumns}
            className="text-[8.5px] bg-slate-800 text-slate-300 hover:text-white px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 cursor-pointer"
            title="Reset standard 9 schedule columns"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 3. Dynamic Schedule Table Grid with Column Resizers */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[9.5px] text-center table-fixed">
          <thead>
            <tr className="bg-white border-b-2 border-black font-bold">
              {scheduleColumns.map((col, idx) => {
                const isSL = col.key === 'sl';
                const colWidth = col.width && col.width !== 'auto' ? col.width : undefined;
                const widthPx = parseInt(col.width || '60', 10) || 60;

                return (
                  <th 
                    key={col.id} 
                    className={`group relative select-none ${isSL ? 'p-0.5' : 'p-1'} ${idx < scheduleColumns.length - 1 ? 'border-r border-black' : ''}`}
                    style={{ width: colWidth }}
                  >
                    <div className="flex items-center justify-between gap-0.5">
                      {/* Left reorder arrow */}
                      {!isSL && idx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveColumn(idx, 'left');
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 text-[8px] p-0.5 cursor-pointer leading-none shrink-0"
                          title="Move column left"
                        >
                          ◀
                        </button>
                      )}

                      {/* Column header label input */}
                      <input
                        type="text"
                        value={col.label}
                        onChange={(e) => handleUpdateColumnLabel(col.id, e.target.value.toUpperCase())}
                        className={`w-full text-center font-black bg-transparent outline-none uppercase text-[9.5px] tracking-tight ${isSL ? 'min-w-[20px] px-0' : 'min-w-[28px]'}`}
                        title={`Click to edit column header "${col.label}" (${col.width || 'auto'})`}
                      />

                      <div className="flex items-center shrink-0">
                        {/* Right reorder arrow */}
                        {!isSL && idx < scheduleColumns.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveColumn(idx, 'right');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 text-[8px] p-0.5 cursor-pointer leading-none"
                            title="Move column right"
                          >
                            ▶
                          </button>
                        )}

                        {/* Delete column button */}
                        {!isSL && scheduleColumns.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteColumn(col.id, col.label)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] font-bold p-0.5 cursor-pointer"
                            title={`Remove column "${col.label}"`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Width Adjustment Quick Stepper Controls on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1 py-0.5 rounded shadow-lg flex items-center gap-1 z-40 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdjustColumnWidth(col.id, -5);
                        }}
                        className="hover:text-amber-300 font-bold px-0.5 cursor-pointer"
                        title="Make column 5px narrower"
                      >
                        -
                      </button>
                      <span className="font-mono text-[7.5px]">{col.width || `${widthPx}px`}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdjustColumnWidth(col.id, 5);
                        }}
                        className="hover:text-amber-300 font-bold px-0.5 cursor-pointer"
                        title="Make column 5px wider"
                      >
                        +
                      </button>
                    </div>

                    {/* Interactive Drag-to-Resize Column Handle on Right Border */}
                    <div
                      onMouseDown={(e) => handleStartResize(e, col)}
                      title={`Drag to resize column "${col.label}" (current: ${col.width || 'auto'})`}
                      className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500/80 active:bg-blue-600 transition-colors z-30 flex items-center justify-center group-hover:opacity-100"
                    >
                      <div className="w-[1.5px] h-3 bg-slate-300 group-hover:bg-white rounded" />
                    </div>
                  </th>
                );
              })}
              <th className="w-6 p-0.5 bg-slate-100 border-l border-black text-[9px] text-slate-600">
                <button
                  type="button"
                  onClick={onOpenAddColumnModal}
                  className="w-full text-blue-600 hover:text-blue-800 font-black cursor-pointer text-center text-[10px]"
                  title="Add Custom Column"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sizeSchedule.map((row) => (
              <tr key={row.id} className="border-b border-black hover:bg-slate-50/80 transition-colors">
                {scheduleColumns.map((col, cIdx) => {
                  const val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '';
                  const isSL = col.key === 'sl';
                  const isBold = isSL || col.key === 'mark' || col.key === 'dia' || col.key === 'qty';
                  const isLeft = col.key === 'notes';
                  return (
                    <td 
                      key={col.id} 
                      className={`${isSL ? 'p-0.5 text-center' : 'p-0.5'} ${cIdx < scheduleColumns.length - 1 ? 'border-r border-black' : ''}`}
                    >
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleUpdateRowCell(row.id, col.key, e.target.value)}
                        className={`w-full p-0.5 bg-transparent outline-none text-[9.5px] ${
                          isBold ? 'font-bold' : 'font-normal'
                        } ${isLeft ? 'text-left pl-1.5' : 'text-center'} ${isSL ? 'px-0' : ''}`}
                      />
                    </td>
                  );
                })}
                <td className="p-0.5 border-l border-black bg-slate-50 text-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteSizeRow(row.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer"
                    title="Delete row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

