import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, X, Printer, Download, Filter, Eye, Layers } from 'lucide-react';

export interface RecordsFooterShortcutsBarProps {
  onQuit?: () => void;
  onSelectColumn?: () => void;
  selectColumnLabel?: string;
  onDrillDown?: () => void;
  drillDownLabel?: string;
  
  // Period (F2) Handling
  onPeriodClick?: () => void;
  fromDate?: string;
  toDate?: string;
  onDateRangeChange?: (from: string, to: string, presetLabel?: string) => void;
  
  // Remove Line (R/U) Handling
  onRemoveLine?: () => void;
  isLineRemoved?: boolean;
  removeLineLabel?: string;
  restoreLineLabel?: string;

  // Print & Export
  onPrint?: () => void;
  onExport?: () => void;
  
  // Custom or extra buttons
  customButtons?: Array<{
    keyLetter: string;
    label: string;
    action: () => void;
    icon?: React.ReactNode;
    className?: string;
  }>;

  // Information tags
  totalRecordsCount?: number;
  selectedCount?: number;
  extraInfo?: string;
  className?: string;
}

export const RecordsFooterShortcutsBar: React.FC<RecordsFooterShortcutsBarProps> = ({
  onQuit,
  onSelectColumn,
  selectColumnLabel = 'Select Column',
  onDrillDown,
  drillDownLabel = 'Drill Down',
  onPeriodClick,
  fromDate = '',
  toDate = '',
  onDateRangeChange,
  onRemoveLine,
  isLineRemoved = false,
  removeLineLabel = 'Remove Line',
  restoreLineLabel = 'Restore Line',
  onPrint,
  onExport,
  customButtons,
  totalRecordsCount,
  selectedCount,
  extraInfo,
  className = ''
}) => {
  const [showInternalPeriodModal, setShowInternalPeriodModal] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(fromDate);
  const [tempToDate, setTempToDate] = useState(toDate);
  const [activePreset, setActivePreset] = useState('Custom');

  // Sync temp dates if props change
  useEffect(() => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
  }, [fromDate, toDate]);

  const handleOpenPeriod = () => {
    if (onPeriodClick) {
      onPeriodClick();
    } else {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
      setShowInternalPeriodModal(true);
    }
  };

  const handleApplyPeriod = () => {
    if (onDateRangeChange) {
      onDateRangeChange(tempFromDate, tempToDate, activePreset);
    }
    setShowInternalPeriodModal(false);
  };

  const handleQuickPreset = (type: 'today' | 'this_month' | 'last_month' | 'this_year' | 'all') => {
    const now = new Date();
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let from = '';
    let to = '';
    let label = 'Custom';

    if (type === 'today') {
      from = toYMD(now);
      to = toYMD(now);
      label = 'Today';
    } else if (type === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      from = toYMD(firstDay);
      to = toYMD(lastDay);
      label = 'Current Month';
    } else if (type === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      from = toYMD(firstDay);
      to = toYMD(lastDay);
      label = 'Last Month';
    } else if (type === 'this_year') {
      from = `${now.getFullYear()}-01-01`;
      to = `${now.getFullYear()}-12-31`;
      label = `Year ${now.getFullYear()}`;
    } else if (type === 'all') {
      from = '';
      to = '';
      label = 'All Time';
    }

    setTempFromDate(from);
    setTempToDate(to);
    setActivePreset(label);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering shortcuts if typing in an editable field
      const target = e.target as HTMLElement;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

      if (isInput && e.key !== 'Escape' && e.key !== 'F2') {
        return;
      }

      if (e.key === 'q' || e.key === 'Q') {
        if (!isInput && onQuit) {
          e.preventDefault();
          onQuit();
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleOpenPeriod();
      } else if (e.key === ' ') {
        if (!isInput && onSelectColumn) {
          e.preventDefault();
          onSelectColumn();
        }
      } else if (e.key === 'Enter') {
        if (!isInput && onDrillDown && !showInternalPeriodModal) {
          e.preventDefault();
          onDrillDown();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (!isInput && onRemoveLine) {
          e.preventDefault();
          onRemoveLine();
        }
      } else if (e.key === 'u' || e.key === 'U') {
        if (!isInput && isLineRemoved && onRemoveLine) {
          e.preventDefault();
          onRemoveLine();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (!isInput && onPrint && (e.ctrlKey || e.metaKey || !isInput)) {
          e.preventDefault();
          onPrint();
        }
      } else if (e.key === 'e' || e.key === 'E') {
        if (!isInput && onExport) {
          e.preventDefault();
          onExport();
        }
      } else if (e.key === 'Escape') {
        if (showInternalPeriodModal) {
          e.preventDefault();
          setShowInternalPeriodModal(false);
        } else if (onQuit) {
          e.preventDefault();
          onQuit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onQuit, onSelectColumn, onDrillDown, onRemoveLine, isLineRemoved, onPrint, onExport, showInternalPeriodModal]);

  return (
    <>
      {/* TALLY-STYLE BOTTOM SHORTCUTS BAR */}
      <div 
        id="records-bottom-shortcuts-bar"
        className={`bg-slate-100 border-t border-slate-300 p-1.5 px-3 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-700 font-mono select-none no-print ${className}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Q : Quit */}
          <button
            type="button"
            onClick={onQuit || (() => window.history.back())}
            className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded font-bold text-slate-800 cursor-pointer shadow-3xs flex items-center gap-1 transition-all active:translate-y-px"
            title="Quit or Return to Dashboard (Q / Esc)"
          >
            <span className="underline">Q</span>: Quit
          </button>

          {/* Space : Select Column / Select Row */}
          <button
            type="button"
            onClick={onSelectColumn}
            className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs transition-all active:translate-y-px"
            title="Select Column or Toggle Selection (Space)"
          >
            <span className="underline">Space</span>: {selectColumnLabel}
          </button>

          {/* Enter : Drill Down */}
          <button
            type="button"
            onClick={onDrillDown}
            className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs font-bold transition-all active:translate-y-px"
            title="Drill Down into Document Details (Enter)"
          >
            <span className="underline">Enter</span>: {drillDownLabel}
          </button>

          {/* F2 : Period */}
          <button
            type="button"
            onClick={handleOpenPeriod}
            className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs transition-all active:translate-y-px"
            title="Change Date Period Filter (F2)"
          >
            <span className="underline">F2</span>: Period
          </button>

          {/* R : Remove Line / U : Restore Line */}
          <button
            type="button"
            onClick={onRemoveLine}
            className="px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs transition-all active:translate-y-px"
            title="Remove/Hide Line (R) or Restore Line (U)"
          >
            {isLineRemoved ? (
              <span><span className="underline">U</span>: {restoreLineLabel}</span>
            ) : (
              <span><span className="underline">R</span>: {removeLineLabel}</span>
            )}
          </button>

          {/* Custom user actions */}
          {customButtons?.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={btn.action}
              className={`px-2 py-0.5 bg-white border border-slate-300 hover:bg-slate-200 rounded text-slate-800 cursor-pointer shadow-3xs flex items-center gap-1 transition-all active:translate-y-px ${btn.className || ''}`}
            >
              {btn.icon}
              <span><span className="underline">{btn.keyLetter}</span>: {btn.label}</span>
            </button>
          ))}
        </div>

        {/* Right Action Icons & Counts */}
        <div className="flex items-center gap-2">
          {totalRecordsCount !== undefined && (
            <span className="text-[10px] text-slate-500 font-sans hidden md:inline">
              Records: <strong className="text-slate-800 font-mono">{totalRecordsCount}</strong>
              {selectedCount !== undefined && selectedCount > 0 && (
                <> (Selected: <strong className="text-indigo-700 font-mono">{selectedCount}</strong>)</>
              )}
            </span>
          )}

          {extraInfo && (
            <span className="text-[10px] text-slate-500 font-sans hidden lg:inline border-l border-slate-300 pl-2">
              {extraInfo}
            </span>
          )}

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="px-2.5 py-0.5 bg-[#083c54] text-white hover:bg-[#0a4a68] rounded font-bold cursor-pointer shadow-3xs flex items-center gap-1 transition-all"
              title="Print Current Records View (P / Ctrl+P)"
            >
              <Printer className="w-3 h-3" />
              <span><span className="underline">P</span>: Print</span>
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="px-2.5 py-0.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded font-bold cursor-pointer shadow-3xs flex items-center gap-1 transition-all"
              title="Export to Excel / CSV (E)"
            >
              <Download className="w-3 h-3" />
              <span><span className="underline">E</span>: Export</span>
            </button>
          )}
        </div>
      </div>

      {/* PERIOD SELECTION MODAL (F2) */}
      {showInternalPeriodModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-400 shadow-2xl w-full max-w-md p-4 font-sans space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#083c54]" />
                Change Period (F2)
              </h3>
              <button
                type="button"
                onClick={() => setShowInternalPeriodModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">From Date:</label>
                <input
                  type="date"
                  value={tempFromDate}
                  onChange={(e) => {
                    setTempFromDate(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#083c54] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">To Date:</label>
                <input
                  type="date"
                  value={tempToDate}
                  onChange={(e) => {
                    setTempToDate(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#083c54] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Quick Presets:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('today')}
                    className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded border border-slate-200 font-mono font-bold cursor-pointer text-left"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('this_month')}
                    className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded border border-slate-200 font-mono font-bold cursor-pointer text-left"
                  >
                    Current Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('last_month')}
                    className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded border border-slate-200 font-mono font-bold cursor-pointer text-left"
                  >
                    Last Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('this_year')}
                    className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded border border-slate-200 font-mono font-bold cursor-pointer text-left"
                  >
                    Full Year
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('all')}
                    className="col-span-2 p-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded border border-slate-200 font-mono font-bold cursor-pointer text-center"
                  >
                    All Historical Records (No date limit)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowInternalPeriodModal(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded cursor-pointer transition-colors"
              >
                Cancel (Esc)
              </button>
              <button
                type="button"
                onClick={handleApplyPeriod}
                className="px-3.5 py-1.5 bg-[#083c54] hover:bg-[#0a4a68] text-white text-xs font-bold rounded cursor-pointer transition-colors shadow-sm"
              >
                Apply Period (Enter)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordsFooterShortcutsBar;
