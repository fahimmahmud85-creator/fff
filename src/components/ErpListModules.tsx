import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { printHtml } from './PrintHelper';
import {
  Plus, Save, Trash2, FileText, Printer, Eye, XCircle, Search, Settings,
  ShieldAlert, Check, Edit, Clock, Droplet, Layers, Box, CheckCircle2, AlertCircle,
  Upload, Download, Maximize2, ChevronLeft, ChevronRight, Image, Wrench, Zap
} from 'lucide-react';

export interface ErpHeaderConfig {
  companyName: string;
  regNo: string;
  deptName: string;
  formTitle: string;
  subtitle: string;
  userId: string;
}

export const ErpEditHeaderModal = ({
  isOpen,
  onClose,
  initialValues,
  onSave,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialValues: ErpHeaderConfig;
  onSave: (updated: ErpHeaderConfig) => void;
  defaultValues?: Partial<ErpHeaderConfig>;
}) => {
  const [companyName, setCompanyName] = useState(initialValues.companyName);
  const [regNo, setRegNo] = useState(initialValues.regNo);
  const [deptName, setDeptName] = useState(initialValues.deptName);
  const [formTitle, setFormTitle] = useState(initialValues.formTitle);
  const [subtitle, setSubtitle] = useState(initialValues.subtitle);
  const [userId, setUserId] = useState(initialValues.userId);

  useEffect(() => {
    setCompanyName(initialValues.companyName);
    setRegNo(initialValues.regNo);
    setDeptName(initialValues.deptName);
    setFormTitle(initialValues.formTitle);
    setSubtitle(initialValues.subtitle);
    setUserId(initialValues.userId);
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    setCompanyName(defaultValues?.companyName || 'MARINE FASTENERS INDUSTRIES L.L.C.');
    setRegNo(defaultValues?.regNo || 'MFI-2026');
    setDeptName(defaultValues?.deptName || initialValues.deptName);
    setFormTitle(defaultValues?.formTitle || initialValues.formTitle);
    setSubtitle(defaultValues?.subtitle || initialValues.subtitle);
    setUserId(defaultValues?.userId || 'ADMIN');
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white p-3.5 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">EDIT FORM & REPORT HEADER</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ companyName, regNo, deptName, formTitle, subtitle, userId });
            onClose();
          }}
          className="p-5 space-y-4 overflow-y-auto"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">Company / Organization Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">Registration / Code</label>
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">Department Name</label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">Form / Report Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">Form Subtitle / Notes</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">User ID / Operator Tag</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg cursor-pointer transition-colors"
            >
              Reset Defaults
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                Save Header
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

  // Reusable Corporate Identity Opening Form Header matching user requirement & screenshot
  export const OpeningFormHeader = ({
    headerConfig,
    deptName = 'LOGISTICS & PACKAGING DEPT',
    formTitle = 'PACKAGING MATERIALS OPENING FORM',
    subtitle = 'Official Entry Form - Marine Fasteners Industries L.L.C.',
    editingSn = null,
    onClose,
    onEditHeader,
  }: {
    headerConfig?: ErpHeaderConfig;
    deptName?: string;
    formTitle: string;
    subtitle?: string;
    editingSn?: number | null;
    onClose: () => void;
    onEditHeader?: () => void;
  }) => {
    const [nowStr, setNowStr] = useState(() => {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
    });

    useEffect(() => {
      const timer = setInterval(() => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        const secs = String(d.getSeconds()).padStart(2, '0');
        setNowStr(`${day}/${month}/${year} ${hours}:${mins}:${secs}`);
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const companyName = headerConfig?.companyName || 'MARINE FASTENERS INDUSTRIES L.L.C.';
    const regNo = headerConfig?.regNo || 'MFI-2026';
    const effectiveDept = headerConfig?.deptName || deptName;
    const effectiveTitle = headerConfig?.formTitle || formTitle;
    const effectiveSubtitle = headerConfig?.subtitle || subtitle;
    const effectiveUser = headerConfig?.userId || 'ADMIN';

    return (
      <div className="bg-white border-2 border-slate-900 rounded-xl p-3.5 shadow-sm mb-4 select-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
          {/* Left Column: Organization & Dept */}
          <div className="text-left font-sans">
            <div className="font-sans font-black text-[12px] text-slate-950 uppercase tracking-tight">
              {companyName}
            </div>
            <div className="text-[9px] font-bold text-slate-600 uppercase font-sans mt-0.5">
              REG: {regNo} | {effectiveDept}
            </div>
          </div>

          {/* Center Column: Form Title matching user screenshot header */}
          <div className="text-center flex-1">
            <div className="font-sans font-black text-[15px] text-slate-950 uppercase tracking-wider leading-tight">
              {editingSn !== null && editingSn !== undefined ? `${effectiveTitle} (S.N: ${editingSn})` : effectiveTitle}
            </div>
            {effectiveSubtitle && (
              <div className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wide mt-0.5 font-sans">
                {effectiveSubtitle}
              </div>
            )}
          </div>

          {/* Right Column: Meta Info & Close Button */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-right text-[9px] font-sans text-slate-700 leading-tight border-l border-slate-300 pl-3 hidden sm:block">
              <div><span className="font-bold text-slate-900">Date :</span> {nowStr}</div>
              <div><span className="font-bold text-slate-900">User ID :</span> <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded font-black text-[8px]">{effectiveUser}</span></div>
              <div><span className="font-bold text-slate-900">Form :</span> OPENING FORM</div>
            </div>
            {onEditHeader && (
              <button
                type="button"
                onClick={onEditHeader}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans text-[10px] font-black uppercase rounded-lg shadow-xs cursor-pointer flex items-center gap-1 transition-transform active:scale-95"
                title="Edit Header Information"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EDIT HEADER</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-sans text-[10px] font-black uppercase rounded-lg shadow-xs cursor-pointer flex items-center gap-1 transition-transform active:scale-95"
              title="Close Form"
            >
              <XCircle className="w-4 h-4" />
              <span>CLOSE</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Reusable Action Bar matching Image 1 (top action cards) & Image 2 (colorful action buttons)
  export const ErpActionBar = ({
    title,
    subtitle,
    onNew,
    onToggleNew,
    onWipe,
    onPrintMaster,
    onPrintSplit,
    appendLabel = 'APPEND ROW',
    onClose,
    onHeader,
    onEditHeader,
  }: {
    title: string;
    subtitle: string;
    onNew: () => void;
    onToggleNew?: () => void;
    onWipe: () => void;
    onPrintMaster: () => void;
    onPrintSplit?: () => void;
    appendLabel?: string;
    onClose?: () => void;
    onHeader?: () => void;
    onEditHeader?: () => void;
  }) => {
    const timerRef = useRef<any>(null);

    const handleNewBtnClick = (e: React.MouseEvent) => {
      if (e.detail >= 2) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (onClose) onClose();
        else if (onToggleNew) onToggleNew();
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (onToggleNew) onToggleNew();
        else if (onNew) onNew();
        timerRef.current = null;
      }, 200);
    };

    const handleNewBtnDblClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (onClose) onClose();
    };

    return (
      <div className="bg-slate-50/90 border border-slate-200/90 p-3 rounded-2xl space-y-3 shadow-xs">
        {/* Top Action Cards Row (Matching Image 1) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleNewBtnClick}
            onDoubleClick={handleNewBtnDblClick}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
            title="Click to New / Double-click to Close"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>New</span>
          </button>
        <button
          type="button"
          onClick={onNew}
          className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
        >
          <Save className="w-4 h-4 text-blue-600" />
          <span>Save</span>
        </button>
        <button
          type="button"
          onClick={onWipe}
          className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Delete</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (onHeader) {
              onHeader();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (onToggleNew) onToggleNew();
              else if (onNew) onNew();
            }
          }}
          className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
          title="Focus Header / Entry Form"
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <span>Header</span>
        </button>

        {onEditHeader && (
          <button
            type="button"
            onClick={onEditHeader}
            className="bg-white hover:bg-slate-100 border border-amber-300 hover:border-amber-400 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
            title="Edit Form & Print Header"
          >
            <Edit className="w-4 h-4 text-amber-600" />
            <span>Edit Header</span>
          </button>
        )}

        {/* Master Print Icon placed IMMEDIATELY NEXT TO HEADER ICON as requested */}
        <button
          type="button"
          onClick={onPrintMaster}
          className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
          title="Master Print"
        >
          <Printer className="w-4 h-4 text-[#f37021]" />
          <span>Master Print</span>
        </button>

        {onPrintSplit && (
          <button
            type="button"
            onClick={onPrintSplit}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
            title="Split Section Print"
          >
            <Printer className="w-4 h-4 text-[#f37021]" />
            <span>Split Print</span>
          </button>
        )}




        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold ml-auto"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Close</span>
          </button>
        )}
      </div>
    </div>
  );
};

  // Reusable Focus Softnet / FocusX List Pagination Footer matching Image 3
  export const FocusErpPaginationFooter = ({
    totalItems,
    currentPage = 1,
    rowsPerPage = 25,
    onPageChange = () => {},
    onRowsPerPageChange = () => {},
    searchQuery = '',
    onSearchChange
  }: {
    totalItems: number;
    currentPage?: number;
    rowsPerPage?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rows: number) => void;
    searchQuery?: string;
    onSearchChange?: (q: string) => void;
  }) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / (rowsPerPage || 25)));

    return (
      <div className="bg-[#f8fafc] border border-slate-300 p-2.5 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-sans text-slate-700 shadow-2xs">
        {onSearchChange ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold uppercase text-[9.5px] text-slate-500">Search:</span>
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter list records..."
                className="w-full bg-white border border-slate-300 px-2.5 py-1 rounded text-[10.5px] font-bold outline-none focus:border-[#f37021]"
              />
            </div>
          </div>
        ) : (
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            Total Entries: <span className="text-[#0d233a] font-extrabold">{totalItems} Records</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            First
          </button>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="px-3 py-1 bg-[#0d233a] text-white font-extrabold rounded text-[10.5px]">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            Next
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
          >
            Last
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="bg-white border border-slate-300 px-2 py-1 rounded text-[10.5px] font-bold text-slate-800 outline-none cursor-pointer focus:border-[#f37021]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={1000}>All</option>
          </select>
        </div>
      </div>
    );
  };

    // --- TAB 13: Machineries List Component ---
  export const MachineriesListComponent = React.memo(({ triggerToast }: { triggerToast?: (msg: string) => void }) => {
    // Standard initial records based on the user's specific fastner workshop domain/Excel columns
    const DEFAULT_MACHINES = [
      { sn: 1, description: '<span style="color:#000000">AUTOMATIC HIGH-SPEED COLD HEADING</span> MACHINE', modelNo: 'CHM-24X', make: 'SACMA / ITALY', photo: 'preset_header', unit: 'SET', openingStock: 4, incomingStocks: 1, stockUsed: 0, qty: 5, balanceQty: 5, usedFor: 'M12-M24 Hex Bolt Cold Forging', serviceStatus: 'OPERATIONAL' },
      { sn: 2, description: '<span style="color:#000000">PRECISION THREAD ROLLING</span> MACHINERY', modelNo: 'TRM-50', make: 'PARKER / TAIWAN', photo: 'preset_roller', unit: 'SET', openingStock: 6, incomingStocks: 0, stockUsed: 1, qty: 5, balanceQty: 5, usedFor: 'Precision Metric & UNC External Threading', serviceStatus: 'OPERATIONAL' },
      { sn: 3, description: '<span style="color:#000000">CONTINUOUS ROTARY RETORT HEAT TREATMENT</span> FURNACE', modelNo: 'HTF-1000', make: 'LOI THERMPROCESS', photo: 'preset_galvanizer', unit: 'SET', openingStock: 2, incomingStocks: 0, stockUsed: 0, qty: 2, balanceQty: 2, usedFor: 'Grade 8.8 / 10.9 Fastener Quenching & Tempering', serviceStatus: 'UNDER MAINTENANCE' },
      { sn: 4, description: '<span style="color:#000000">AUTOMATIC MULTI-STATION HEX NUT</span> TAPPER', modelNo: 'NT-30', make: 'SANSHING / TAIWAN', photo: 'preset_tapper', unit: 'SET', openingStock: 3, incomingStocks: 1, stockUsed: 0, qty: 4, balanceQty: 4, usedFor: 'M16-M36 Heavy Hex Nut Internal Tapping', serviceStatus: 'OPERATIONAL' },
      { sn: 5, description: '<span style="color:#000000">HOT DIP GALVANIZING CENTRIFUGAL</span> PLANT', modelNo: 'HDG-2000', make: 'EPI / GERMANY', photo: 'preset_galvanizer', unit: 'LINE', openingStock: 1, incomingStocks: 0, stockUsed: 0, qty: 1, balanceQty: 1, usedFor: 'ASTM A153 HDG Coating on Anchor Bolts', serviceStatus: 'OPERATIONAL' }
    ];

    const [machines, setMachines] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_MACHINERIES_REGISTER_UPGRADED');
      let loaded: any[] = [];
      if (saved) {
        try {
          loaded = JSON.parse(saved);
        } catch (e) {}
      }
      if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
        loaded = DEFAULT_MACHINES;
      }
      return loaded.map(m => {
        const op = m.openingStock !== undefined ? Number(m.openingStock) : Number(m.qty || 0);
        const inc = m.incomingStocks !== undefined ? Number(m.incomingStocks) : 0;
        const used = m.stockUsed !== undefined ? Number(m.stockUsed) : 0;
        return {
          ...m,
          openingStock: op,
          incomingStocks: inc,
          stockUsed: used,
          qty: op + inc - used,
          balanceQty: op + inc - used,
          serviceStatus: m.serviceStatus || 'OPERATIONAL'
        };
      });
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const lastNewClickRef = useRef<number>(0);

    // Form fields corresponding exactly to user's Excel schema
    const [description, setDescription] = useState('');
    const [modelNo, setModelNo] = useState('');
    const [make, setMake] = useState('');
    const [photo, setPhoto] = useState('preset_header');
    const [unit, setUnit] = useState('SET');
    const [qty, setQty] = useState<any>('1');
    const [openingStock, setOpeningStock] = useState<any>('1');
    const [incomingStocks, setIncomingStocks] = useState<any>('0');
    const [stockUsed, setStockUsed] = useState<any>('0');
    const [usedFor, setUsedFor] = useState('');
    const [serviceStatus, setServiceStatus] = useState('OPERATIONAL');

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [unitFilter, setUnitFilter] = useState('ALL');

    // Lightbox modal for photos
    const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string } | null>(null);

    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [headerConfig, setHeaderConfig] = useState<ErpHeaderConfig>(() => {
      try {
        const saved = localStorage.getItem('mfi_erp_header_machineries');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return {
        companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
        regNo: 'MFI-2026',
        deptName: 'MAIN WORKSHOP & PRODUCTION DEPT',
        formTitle: 'MACHINERIES REGISTER OPENING FORM',
        subtitle: 'Manage, track, and service all plant machinery & production lines.',
        userId: 'ADMIN',
      };
    });

    useEffect(() => {
      localStorage.setItem('MFI_MACHINERIES_REGISTER_UPGRADED', JSON.stringify(machines));
    }, [machines]);

    // Helpers to handle base64 image conversion on uploading
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhoto(reader.result);
            triggerToast('Physical machinery photo uploaded & compiled successfully!');
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleOpenCreateForm = () => {
      setEditingId(null);
      setDescription('');
      setModelNo('');
      setMake('');
      setPhoto('preset_header');
      setUnit('SET');
      setQty('1');
      setOpeningStock('1');
      setIncomingStocks('0');
      setStockUsed('0');
      setUsedFor('');
      setServiceStatus('OPERATIONAL');
      setFormOpen(true);
    };

    const machTimerRef = useRef<any>(null);

    const handleNewButtonClick = (e?: React.MouseEvent) => {
      if (e && e.detail >= 2) {
        if (machTimerRef.current) {
          clearTimeout(machTimerRef.current);
          machTimerRef.current = null;
        }
        setFormOpen(false);
        return;
      }
      if (machTimerRef.current) clearTimeout(machTimerRef.current);
      machTimerRef.current = setTimeout(() => {
        if (formOpen) {
          setFormOpen(false);
        } else {
          handleOpenCreateForm();
        }
        machTimerRef.current = null;
      }, 200);
    };

    const handleNewButtonDblClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (machTimerRef.current) {
        clearTimeout(machTimerRef.current);
        machTimerRef.current = null;
      }
      setFormOpen(false);
    };

    const handleToggleForm = () => {
      if (formOpen) {
        setFormOpen(false);
      } else {
        handleOpenCreateForm();
      }
    };

    const handleEditClick = (item: any) => {
      setEditingId(item.sn);
      setDescription(item.description);
      setModelNo(item.modelNo);
      setMake(item.make);
      setPhoto(item.photo);
      setUnit(item.unit);
      setQty(String(item.qty || 0));
      setOpeningStock(String(item.openingStock !== undefined ? item.openingStock : (item.qty || 0)));
      setIncomingStocks(String(item.incomingStocks !== undefined ? item.incomingStocks : 0));
      setStockUsed(String(item.stockUsed !== undefined ? item.stockUsed : 0));
      setUsedFor(item.usedFor);
      setServiceStatus(item.serviceStatus || 'OPERATIONAL');
      setFormOpen(true);
    };

    const handleDeleteClick = (sn: number) => {
      const remaining = machines.filter(m => m.sn !== sn)
        .map((m, idx) => ({ ...m, sn: idx + 1 })); // Recalculate S.N dynamically
      setMachines(remaining);
      localStorage.setItem('MFI_MACHINERIES_REGISTER_UPGRADED', JSON.stringify(remaining));
      if (editingId === sn) {
        setEditingId(null);
        setFormOpen(false);
      }
      triggerToast(`Machinery asset row #${sn} deleted successfully.`);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!description.trim()) {
        alert('Please fill the Description of Machineries.');
        return;
      }

      const opVal = Number(openingStock);
      const incVal = Number(incomingStocks);
      const usdVal = Number(stockUsed);
      const computedBalance = Math.max(0, opVal + incVal - usdVal);

      if (editingId !== null) {
        // Edit Row Action
        const updated = machines.map(m => {
          if (m.sn === editingId) {
            return {
              ...m,
              description: description.trim(),
              modelNo: modelNo.trim() || '—',
              make: make.trim() || '—',
              photo,
              unit,
              qty: computedBalance,
              openingStock: opVal,
              incomingStocks: incVal,
              stockUsed: usdVal,
              balanceQty: computedBalance,
              usedFor: usedFor.trim() || '—',
              serviceStatus
            };
          }
          return m;
        });
        setMachines(updated);
        localStorage.setItem('MFI_MACHINERIES_REGISTER_UPGRADED', JSON.stringify(updated));
        triggerToast(`Asset Row S.N ${editingId} modified and updated!`);
      } else {
        // Add Row Action
        const nextSn = machines.length > 0 ? Math.max(...machines.map(m => m.sn)) + 1 : 1;
        const newMachine = {
          sn: nextSn,
          description: description.trim(),
          modelNo: modelNo.trim() || '—',
          make: make.trim() || '—',
          photo,
          unit,
          qty: computedBalance,
          openingStock: opVal,
          incomingStocks: incVal,
          stockUsed: usdVal,
          balanceQty: computedBalance,
          usedFor: usedFor.trim() || '—',
          serviceStatus
        };
        const updated = [...machines, newMachine];
        setMachines(updated);
        localStorage.setItem('MFI_MACHINERIES_REGISTER_UPGRADED', JSON.stringify(updated));
        triggerToast('New machinery asset registry added to sheet!');
      }

      // Reset fields to ready state for next entry while keeping form open & stable
      setEditingId(null);
      setDescription('');
      setModelNo('');
      setMake('');
      setPhoto('preset_header');
      setUnit('SET');
      setQty('1');
      setOpeningStock('1');
      setIncomingStocks('0');
      setStockUsed('0');
      setUsedFor('');
      setServiceStatus('OPERATIONAL');
      setFormOpen(true);
    };

    // Reusable Focus X System & Toolbar Layout Wrapper matching the screenshot UI/UX
    const FocusXLayoutWrapper = ({
      moduleTitle,
      timestamp = "14/09/2023 14:44:56",
      countLabel = "Total machinery: ",
      totalCount = 16,
      onRefresh,
      onPrint,
      onExport,
      searchQuery,
      onSearchChange,
      currentPage = 1,
      totalPages = 1,
      rowsPerPage = 25,
      onPageChange = () => {},
      onRowsPerPageChange = () => {},
      actionBar,
      children
    }: {
      moduleTitle: string;
      timestamp?: string;
      countLabel?: string;
      totalCount?: number;
      onRefresh?: () => void;
      onPrint?: () => void;
      onExport?: () => void;
      searchQuery?: string;
      onSearchChange?: (q: string) => void;
      currentPage?: number;
      totalPages?: number;
      rowsPerPage?: number;
      onPageChange?: (page: number) => void;
      onRowsPerPageChange?: (rows: number) => void;
      actionBar?: React.ReactNode;
      children: React.ReactNode;
    }) => {
      const [topSearch, setTopSearch] = useState('');
      
      return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden font-sans space-y-0">
          {/* 3. OPTIONAL ERP ACTION BAR */}
          {actionBar && (
            <div className="p-2.5 bg-slate-50 border-b border-slate-200">
              {actionBar}
            </div>
          )}

          {/* 4. MAIN CONTENT AREA (DATA GRID / FORMS) */}
          <div className="bg-white">
            {children}
          </div>

          {/* 5. BOTTOM PAGINATION FOOTER BAR */}
          <div className="bg-[#f8fafc] border-t border-slate-300 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-sans text-slate-700">
            {/* Left: Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative w-52">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 pl-3 pr-7 py-1 rounded text-[11px] outline-none focus:border-sky-500 font-bold"
                />
                <span className="absolute right-2 top-1.5 text-slate-400 text-xs">🔍</span>
              </div>
            </div>

            {/* Center: Pagination Buttons */}
            <div className="flex items-center gap-1 font-bold">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(1)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded text-[10px] uppercase cursor-pointer transition-colors"
              >
                First
              </button>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded text-[10px] uppercase cursor-pointer transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded text-[10.5px]">
                {currentPage}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded text-[10px] uppercase cursor-pointer transition-colors"
              >
                Next
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 rounded text-[10px] uppercase cursor-pointer transition-colors"
              >
                Last
              </button>
            </div>

            {/* Right: Rows Per Page Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-medium text-slate-600">Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange && onRowsPerPageChange(Number(e.target.value))}
                className="bg-white border border-slate-300 px-2 py-1 rounded text-[10.5px] font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25 (Default)</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* 6. BOTTOM SYSTEM COPYRIGHT STRIP */}
          <div className="bg-[#e2e8f0] border-t border-slate-300 px-4 py-1.5 flex justify-between items-center text-[10px] text-slate-600 font-sans font-medium">
            <span>Macro Cloud (230)</span>
            <span>Copyright © 2026 Focus Softnet (P) Ltd. All Rights Reserved. Version 1.0.0</span>
          </div>
        </div>
      );
    };

    // Reusable Action Bar matching Image 1 (top action cards)
    const ErpActionBar = ({
      title,
      subtitle,
      onNew,
      onToggleNew,
      onWipe,
      onPrintMaster,
      onPrintSplit,
      appendLabel = 'APPEND ROW',
      onClose,
      onHeader,
      onEditHeader,
    }: {
      title: string;
      subtitle: string;
      onNew: () => void;
      onToggleNew?: () => void;
      onWipe: () => void;
      onPrintMaster: () => void;
      onPrintSplit?: () => void;
      appendLabel?: string;
      onClose?: () => void;
      onHeader?: () => void;
      onEditHeader?: () => void;
    }) => (
      <div className="bg-slate-50/90 border border-slate-200/90 p-3 rounded-2xl shadow-xs">
        {/* Top Action Cards Row (Matching Image 1) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleNew || onNew}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>New</span>
          </button>
          <button
            type="button"
            onClick={onNew}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
          >
            <Save className="w-4 h-4 text-blue-600" />
            <span>Save</span>
          </button>
          <button
            type="button"
            onClick={onWipe}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Delete</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onHeader) {
                onHeader();
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (onToggleNew) onToggleNew();
                else if (onNew) onNew();
              }
            }}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
            title="Focus Header / Entry Form"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Header</span>
          </button>
          {onEditHeader && (
            <button
              type="button"
              onClick={onEditHeader}
              className="bg-white hover:bg-slate-100 border border-amber-300 hover:border-amber-400 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
              title="Edit Form & Print Header"
            >
              <Edit className="w-4 h-4 text-amber-600" />
              <span>Edit Header</span>
            </button>
          )}
          {/* Master Print Icon placed IMMEDIATELY NEXT TO HEADER ICON as requested */}
          <button
            type="button"
            onClick={onPrintMaster}
            className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
            title="Master Print"
          >
            <Printer className="w-4 h-4 text-[#f37021]" />
            <span>Master Print</span>
          </button>
          {onPrintSplit && (
            <button
              type="button"
              onClick={onPrintSplit}
              className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold"
              title="Split Section Print"
            >
              <Printer className="w-4 h-4 text-[#f37021]" />
              <span>Split Print</span>
            </button>
          )}


          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shadow-2xs rounded-xl px-3.5 py-2 flex flex-col items-center justify-center gap-1 min-w-[72px] cursor-pointer text-slate-700 hover:text-slate-900 transition-all hover:shadow-xs text-[10.5px] font-bold ml-auto"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>
    );

    // Reusable Focus Softnet / FocusX List Pagination Footer matching Image 3
    const FocusErpPaginationFooter = ({
      totalItems,
      currentPage = 1,
      rowsPerPage = 25,
      onPageChange = () => {},
      onRowsPerPageChange = () => {},
      searchQuery = '',
      onSearchChange
    }: {
      totalItems: number;
      currentPage?: number;
      rowsPerPage?: number;
      onPageChange?: (page: number) => void;
      onRowsPerPageChange?: (rows: number) => void;
      searchQuery?: string;
      onSearchChange?: (q: string) => void;
    }) => {
      const totalPages = Math.max(1, Math.ceil(totalItems / (rowsPerPage || 25)));

      return (
        <div className="bg-[#f8fafc] border border-slate-300 p-2.5 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-sans text-slate-700 shadow-2xs">
          {onSearchChange ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold uppercase text-[9.5px] text-slate-500">Search:</span>
              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filter list records..."
                  className="w-full bg-white border border-slate-300 px-2.5 py-1 rounded text-[10.5px] font-bold outline-none focus:border-[#f37021]"
                />
              </div>
            </div>
          ) : (
            <div className="text-[10px] font-bold text-slate-500 uppercase">
              Total Entries: <span className="text-[#0d233a] font-extrabold">{totalItems} Records</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(1)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              First
            </button>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-[#0d233a] text-white font-extrabold rounded text-[10.5px]">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
            >
              Last
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                onRowsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-white border border-slate-300 px-2 py-1 rounded text-[10.5px] font-bold text-slate-800 outline-none cursor-pointer focus:border-[#f37021]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={1000}>All</option>
            </select>
          </div>
        </div>
      );
    };

    // Preset industrial graphics renderer
    const MachineryPhotoComponent = ({ path, title, size = '12' }: { path: string; title: string; size?: string }) => {
      const isCustomImage = path && (path.startsWith('data:image/') || path.startsWith('http://') || path.startsWith('https://'));
      const numSize = Number(size) || 12;
      const isLarge = numSize > 12;
      const boxDimensions = isLarge ? (numSize > 30 ? "w-56 h-36" : "w-24 h-16") : "w-14 h-9";

      if (isCustomImage) {
        return (
          <img
            src={path}
            alt={title}
            className={`${boxDimensions} object-contain rounded border border-slate-300 shadow-2xs bg-slate-100 cursor-zoom-in hover:scale-105 transition-transform mx-auto max-w-full`}
            onClick={() => setLightboxPhoto({ url: path, title })}
            referrerPolicy="no-referrer"
          />
        );
      }

      // Inline vector icons for default assets
      const renderVector = () => {
        switch (path) {
          case 'preset_header':
            return (
              <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100" fill="currentColor">
                <rect x="20" y="25" width="60" height="50" rx="3" fill="#475569" />
                <rect x="30" y="10" width="40" height="15" rx="2" fill="#1e293b" />
                <circle cx="50" cy="50" r="14" fill="#f37021" />
                <rect x="15" y="75" width="70" height="15" fill="#334155" />
                <line x1="50" y1="10" x2="50" y2="25" stroke="#f8fafc" strokeWidth="3" />
              </svg>
            );
          case 'preset_roller':
            return (
              <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="32" cy="50" r="20" fill="#0284c7" />
                <circle cx="68" cy="50" r="20" fill="#0284c7" />
                <circle cx="32" cy="50" r="8" fill="#f8fafc" />
                <circle cx="68" cy="50" r="8" fill="#f8fafc" />
                <rect x="20" y="46" width="60" height="8" fill="#ea580c" />
                <rect x="5" y="80" width="90" height="10" fill="#1e293b" />
              </svg>
            );
          case 'preset_galvanizer':
            return (
              <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100" fill="currentColor">
                <rect x="15" y="32" width="70" height="48" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                <rect x="20" y="38" width="60" height="25" fill="#0284c7" opacity="0.9" />
                <line x1="10" y1="20" x2="90" y2="20" stroke="#334155" strokeWidth="6" />
                <circle cx="30" cy="45" r="4" fill="#ffffff" opacity="0.8" />
                <circle cx="50" cy="42" r="3" fill="#ffffff" opacity="0.8" />
                <circle cx="70" cy="46" r="4" fill="#ffffff" opacity="0.8" />
                <rect x="35" y="15" width="30" height="5" fill="#f59e0b" />
              </svg>
            );
          case 'preset_tapper':
            return (
              <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100" fill="currentColor">
                <rect x="42" y="10" width="16" height="50" fill="#0d9488" />
                <polygon points="30,60 70,60 50,85" fill="#334155" />
                <rect x="15" y="80" width="70" height="12" fill="#1e293b" />
                <circle cx="50" cy="35" r="5" fill="#ea580c" />
              </svg>
            );
          case 'preset_stamper':
          default:
            return (
              <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100" fill="currentColor">
                <rect x="35" y="10" width="30" height="70" fill="#475569" />
                <rect x="20" y="80" width="60" height="10" fill="#1e293b" />
                <polygon points="35,55 65,55 50,75" fill="#e11d48" />
                <line x1="50" y1="10" x2="50" y2="55" stroke="#f43f5e" strokeWidth="4" strokeDasharray="3,3" />
              </svg>
            );
        }
      };

      return (
        <div 
          onClick={() => setLightboxPhoto({ url: path, title })}
          className={`${boxDimensions} p-0.5 rounded border border-slate-300 bg-slate-900 shadow-2xs cursor-zoom-in hover:bg-slate-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center mx-auto shrink-0 overflow-hidden`}
          title="Click to zoom machine graphic"
        >
          {renderVector()}
        </div>
      );
    };

    // Filtering logic
    const filteredMachines = useMemo(() => {
      return machines.filter(m => {
        const matchesCategory = categoryFilter === 'ALL' || (m.category || m.usedFor || '').toUpperCase().includes(categoryFilter.toUpperCase());
        const matchesUnit = unitFilter === 'ALL' || (m.unit || '').toUpperCase() === unitFilter.toUpperCase();
        const str = `${m.description || ''} ${m.modelNo || ''} ${m.make || ''} ${m.usedFor || ''} ${m.category || ''}`.toUpperCase();
        const matchesSearch = str.includes(searchQuery.toUpperCase());
        return matchesCategory && matchesUnit && matchesSearch;
      });
    }, [machines, searchQuery, categoryFilter, unitFilter]);

    // Unique units for filters
    const uniqueUnits = useMemo(() => {
      const set = new Set(machines.map(m => (m.unit || '').toUpperCase()).filter(Boolean));
      return Array.from(set);
    }, [machines]);

    // Summary calculations
    const totalAssets = machines.length;
    const totalQty = machines.reduce((sum, m) => sum + (m.qty || 0), 0);
    const uniqueMakes = new Set(machines.map(m => (m.make || '').toUpperCase()).filter(Boolean)).size;

    // Direct High-Contrast Auditable Government-Style Ledger Printing function
    const printMachineryLedger = () => {
      const ITEMS_PER_PAGE = 22;
      const totalPages = Math.max(1, Math.ceil(machines.length / ITEMS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageMachines = machines.slice(pIdx * ITEMS_PER_PAGE, (pIdx + 1) * ITEMS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageMachines, isLastPage, startIdx: pIdx * ITEMS_PER_PAGE };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Machinery & Plant Equipment Listing With Detail</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 10mm 15mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 10px; font-size: 10px; line-height: 1.3; }
            
            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; page-break-inside: avoid; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; page-break-inside: avoid; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              thead { display: table-header-group !important; }
              tfoot { display: table-footer-group !important; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table thead tr { page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: avoid !important; break-after: avoid !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <table class="report-table">
                <thead>
                  <tr class="header-repeat-row">
                    <td colspan="10" style="border: none !important; padding: 0 0 10px 0 !important; background: #ffffff !important;">
                      <div class="top-meta-bar">
                        <div class="org-left">
                          <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                          <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                        </div>
                        <div class="doc-center">
                          <div class="doc-title">${headerConfig.formTitle.toUpperCase()}</div>
                        </div>
                        <div class="meta-right">
                          <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                          <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                          <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th style="width: 12%;">Service Status</th>
                    <th class="left" style="width: 25%;">Description of Machineries</th>
                    <th style="width: 11%;">Model No</th>
                    <th style="width: 11%;">Make</th>
                    <th style="width: 7%;">Opening Stock</th>
                    <th style="width: 7%;">Incoming</th>
                    <th style="width: 7%;">Stock Used</th>
                    <th class="right" style="width: 8%;">Balance Qty</th>
                    <th class="left" style="width: 12%;">Used For</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.pageMachines.map((m, idx) => {
                    const op = m.openingStock !== undefined ? m.openingStock : (m.qty || 0);
                    const inc = m.incomingStocks !== undefined ? m.incomingStocks : 0;
                    const usd = m.stockUsed !== undefined ? m.stockUsed : 0;
                    const bal = m.balanceQty !== undefined ? m.balanceQty : (op + inc - usd);
                    return `
                      <tr>
                        <td>${p.startIdx + idx + 1}</td>
                        <td style="font-weight: bold;">${(m.serviceStatus || 'OPERATIONAL').toUpperCase()}</td>
                        <td class="left" style="font-weight: bold;">${m.description.toUpperCase()}</td>
                        <td style="font-weight: bold; color: #000;">${(m.modelNo || 'N/A').toUpperCase()}</td>
                        <td>${(m.make || 'MFI').toUpperCase()}</td>
                        <td>${op}</td>
                        <td>${inc}</td>
                        <td>${usd}</td>
                        <td class="right" style="font-weight: bold;">${bal}</td>
                        <td class="left">${(m.usedFor || '—').toUpperCase()}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${p.isLastPage ? `
                    <tr class="total-summary-row">
                      <td colspan="4" class="left"><strong>Doc Count: ${machines.length} Line Items</strong></td>
                      <td><strong>${machines.reduce((s, m) => s + (m.openingStock || m.qty || 0), 0)}</strong></td>
                      <td><strong>${machines.reduce((s, m) => s + (m.incomingStocks || 0), 0)}</strong></td>
                      <td><strong>${machines.reduce((s, m) => s + (m.stockUsed || 0), 0)}</strong></td>
                      <td class="right"><strong>Total Balance : ${totalQty}</strong></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Equipment Makes</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Make / Brand</th>
                        <th>UOM</th>
                        <th>Total Units</th>
                        <th class="right">Total Stock Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${Array.from(new Set(machines.map(m => m.make || 'GENERAL'))).map(make => {
                        const makeMachines = machines.filter(m => (m.make || 'GENERAL') === make);
                        const makeQty = makeMachines.reduce((s, m) => s + (m.balanceQty !== undefined ? m.balanceQty : ((m.openingStock || m.qty || 0) + (m.incomingStocks || 0) - (m.stockUsed || 0))), 0);
                        return `
                          <tr>
                            <td class="left" style="font-weight: bold;">${String(make).toUpperCase()}</td>
                            <td>SET</td>
                            <td>${makeMachines.length}</td>
                            <td class="right" style="font-weight: bold;">${makeQty}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>SET</td>
                        <td>${machines.length}</td>
                        <td class="right">${totalQty}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Production_Machinery_Registry');
    };

    return (
      <FocusXLayoutWrapper
        moduleTitle="Machineries List"
        timestamp="14/09/2023 14:44:56"
        countLabel="Total machinery: "
        totalCount={filteredMachines.length}
        onRefresh={() => triggerToast('Machineries list refreshed')}
        onPrint={printMachineryLedger}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div className="space-y-6 font-mono text-[11px] p-4">

        {/* Top action cards row icon bar matching user screenshot */}
        <ErpActionBar
          title="MACHINERIES REGISTER MASTER"
          subtitle="Manage, track, and service all plant machinery and production lines."
          onNew={handleOpenCreateForm}
          onToggleNew={handleToggleForm}
          onClose={() => setFormOpen(false)}
          onWipe={() => {
            if (editingId !== null) {
              handleDeleteClick(editingId);
            } else if (machines.length > 0) {
              const lastSn = machines[machines.length - 1].sn;
              handleDeleteClick(lastSn);
            } else {
              triggerToast("No machinery rows to delete.");
            }
          }}
          onPrintMaster={printMachineryLedger}
          onPrintSplit={printMachineryLedger}
          appendLabel="APPEND ASSET ROW"
          onEditHeader={() => setIsEditHeaderOpen(true)}
        />

        {/* Filters and search section with category dropdown and search */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner flex flex-col xl:flex-row xl:items-center justify-between gap-3 select-none">
          
          <div className="flex flex-wrap items-center gap-1.5">

            {/* Sub-category dropdown filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 px-2.5 py-1.5 rounded shadow-2xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white text-[#0a2342] font-extrabold text-[10.5px] outline-none cursor-pointer uppercase font-sans"
              >
                <option value="ALL">ALL LINES & SUBCATEGORIES</option>
                <option value="PRODUCTION">ALL PRODUCTION LINES</option>
                <option value="FORGING">COLD FORGING & HEADING</option>
                <option value="THREAD">THREAD ROLLING</option>
                <option value="FURNACE">HEAT TREATMENT & FURNACE</option>
                <option value="TAPPING">NUT TAPPING</option>
                <option value="GALVANIZING">HOT DIP GALVANIZING</option>
                <option value="PACKAGING">PACKAGING & WAREHOUSE</option>
                <option value="COATING">COATING & PAINTING</option>
              </select>
            </div>

            {searchQuery || categoryFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                }}
                className="text-[9.5px] text-[#f37021] hover:underline uppercase font-bold ml-1.5 cursor-pointer"
              >
                CLEAR FILTERS
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search machine, model, make..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 bg-white border border-slate-300 p-1.5 text-[11px] focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* --- ADD / EDIT MACHINERY INLINE DROPDOWN FORM --- */}
        {formOpen && (
          <form 
            onSubmit={handleSubmit}
            className="bg-sky-50/50 border-2 border-sky-200 p-5 rounded-xl shadow-md space-y-4 animate-fade-in text-[11px] w-full max-w-full"
          >
            <OpeningFormHeader
              headerConfig={headerConfig}
              deptName="MAIN WORKSHOP & PRODUCTION DEPT"
              formTitle="MACHINERIES REGISTER OPENING FORM"
              subtitle="Manage, track, and service all plant machinery & production lines."
              editingSn={editingId}
              onClose={() => setFormOpen(false)}
              onEditHeader={() => setIsEditHeaderOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Form: text fields */}
              <div className="md:col-span-8 space-y-3">
                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Description of Machinery *</label>
                  <textarea
                    rows={2}
                    placeholder="Enter precise industrial description (e.g. Hex Head Forging Cold Header Type X)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Model No</label>
                    <input
                      type="text"
                      placeholder="e.g. TR-SENY-120"
                      value={modelNo}
                      onChange={(e) => setModelNo(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Make (Manufacturer)</label>
                    <div className="space-y-1">
                      <select
                        value={['SACMA / ITALY', 'PARKER / TAIWAN', 'LOI THERMPROCESS', 'SANSHING / TAIWAN', 'EPI / GERMANY', 'SENY AUTOMATION GMBH', 'CARLO SALVI / ITALY', 'NATIONAL MACHINERY / USA', 'NEDSCHROEF / NETHERLANDS', 'CHUN ZU / TAIWAN', 'CHIA LING / TAIWAN', 'TAIWAN SELF-POWER', 'SHANGHAI HIGH-TECH'].includes(make) ? make : (make ? 'CUSTOM' : '')}
                        onChange={(e) => {
                          if (e.target.value !== 'CUSTOM') {
                            setMake(e.target.value);
                          }
                        }}
                        className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase font-sans text-[11px] cursor-pointer"
                      >
                        <option value="">-- SELECT MAKE / MANUFACTURER --</option>
                        <option value="SACMA / ITALY">SACMA / ITALY</option>
                        <option value="PARKER / TAIWAN">PARKER / TAIWAN</option>
                        <option value="LOI THERMPROCESS">LOI THERMPROCESS (GERMANY)</option>
                        <option value="SANSHING / TAIWAN">SANSHING / TAIWAN</option>
                        <option value="EPI / GERMANY">EPI / GERMANY</option>
                        <option value="SENY AUTOMATION GMBH">SENY AUTOMATION GMBH</option>
                        <option value="CARLO SALVI / ITALY">CARLO SALVI / ITALY</option>
                        <option value="NATIONAL MACHINERY / USA">NATIONAL MACHINERY / USA</option>
                        <option value="NEDSCHROEF / NETHERLANDS">NEDSCHROEF / NETHERLANDS</option>
                        <option value="CHUN ZU / TAIWAN">CHUN ZU / TAIWAN</option>
                        <option value="CHIA LING / TAIWAN">CHIA LING / TAIWAN</option>
                        <option value="TAIWAN SELF-POWER">TAIWAN SELF-POWER</option>
                        <option value="SHANGHAI HIGH-TECH">SHANGHAI HIGH-TECH</option>
                        <option value="CUSTOM">OTHER (TYPE CUSTOM MAKE...)</option>
                      </select>
                      {(!['SACMA / ITALY', 'PARKER / TAIWAN', 'LOI THERMPROCESS', 'SANSHING / TAIWAN', 'EPI / GERMANY', 'SENY AUTOMATION GMBH', 'CARLO SALVI / ITALY', 'NATIONAL MACHINERY / USA', 'NEDSCHROEF / NETHERLANDS', 'CHUN ZU / TAIWAN', 'CHIA LING / TAIWAN', 'TAIWAN SELF-POWER', 'SHANGHAI HIGH-TECH'].includes(make) || make === 'CUSTOM') && (
                        <input
                          type="text"
                          placeholder="e.g. SENY AUTOMATION GMBH"
                          value={make === 'CUSTOM' ? '' : make}
                          onChange={(e) => setMake(e.target.value)}
                          className="w-full bg-white border border-slate-300 p-1.5 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[10.5px]"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Unit (Scale)</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans text-[11px]"
                    >
                      <option value="SET">SET (HEAVY CORE MACHINE)</option>
                      <option value="UNIT">UNIT (INTEGRATED COMPONENT)</option>
                      <option value="LINE">LINE (COMPLETE SYSTEM BAY)</option>
                      <option value="PCS">PCS (DIE TOOL OR PIECES)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Service Status</label>
                    <select
                      value={serviceStatus}
                      onChange={(e) => setServiceStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans text-[11px] uppercase"
                    >
                      <option value="OPERATIONAL">OPERATIONAL (RUNNING)</option>
                      <option value="UNDER MAINTENANCE">UNDER MAINTENANCE</option>
                      <option value="BREAKDOWN / REPAIR">BREAKDOWN / REPAIR</option>
                      <option value="STANDBY">STANDBY / READY</option>
                      <option value="RETIRED">RETIRED / DECOMMISSIONED</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-100/60 p-2.5 rounded border border-slate-200">
                  <span className="block text-[8px] text-slate-500 uppercase font-bold mb-1.5 font-sans">
                    STOCK ACCOUNTS REGISTER
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <label className="block text-[7.5px] text-slate-500 uppercase font-bold text-center leading-none mb-1">OPEN</label>
                      <input
                        type="number"
                        value={openingStock}
                        onChange={(e) => setOpeningStock(e.target.value)}
                        className="w-full text-center bg-white border border-slate-300 p-1 text-[10px] font-bold rounded outline-none focus:border-[#f37021]"
                      />
                    </div>
                    <div>
                      <label className="block text-[7.5px] text-slate-500 uppercase font-bold text-center leading-none mb-1">INCOMING</label>
                      <input
                        type="number"
                        value={incomingStocks}
                        onChange={(e) => setIncomingStocks(e.target.value)}
                        className="w-full text-center bg-white border border-slate-300 p-1 text-[10px] font-bold rounded outline-none focus:border-[#f37021]"
                      />
                    </div>
                    <div>
                      <label className="block text-[7.5px] text-slate-500 uppercase font-bold text-center leading-none mb-1">USED</label>
                      <input
                        type="number"
                        value={stockUsed}
                        onChange={(e) => setStockUsed(e.target.value)}
                        className="w-full text-center bg-white border border-slate-300 p-1 text-[10px] font-bold rounded outline-none focus:border-[#f37021]"
                      />
                    </div>
                    <div>
                      <label className="block text-[7.5px] text-[#f37021] uppercase font-semibold text-center leading-none mb-1">BALANCE</label>
                      <div className="w-full text-center p-1 text-[10px] font-sans font-bold bg-amber-50 border border-amber-300 rounded text-amber-800 h-[23px] flex items-center justify-center">
                        {Math.max(0, (Number(openingStock) || 0) + (Number(incomingStocks) || 0) - (Number(stockUsed) || 0))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Used For (Purpose Specification)</label>
                  <textarea
                    rows={2}
                    placeholder="Describe how this machinery is used in the fasteners manufacturing plant..."
                    value={usedFor}
                    onChange={(e) => setUsedFor(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                  />
                </div>
              </div>

              {/* Right Form: PHOTO UPLOADING AND PRESET SECTIONS */}
              <div className="md:col-span-4 bg-sky-100/40 p-3.5 border border-sky-200 rounded-lg space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="block text-[8.5px] text-slate-600 uppercase font-bold font-sans leading-none">MACHINERY PHOTO PREVIEW / SOURCE</label>
                  
                  {/* Visual Render of Current Selection */}
                  <div className="flex items-center gap-3 bg-white p-2 border border-sky-200 rounded">
                    <MachineryPhotoComponent path={photo} title="Preview asset graphic" size="14" />
                    <div className="truncate">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Current Format:</span>
                      <span className="text-[10px] text-sky-850 font-bold tracking-tight block truncate">
                        {photo.startsWith('data:image/') ? 'Custom Base64 Image' : `System Preset Icon (${photo})`}
                      </span>
                    </div>
                  </div>

                  {/* Choose Vector Preset Option */}
                  <div className="pt-2 border-t border-sky-200">
                    <span className="text-[7.5px] block font-bold text-slate-500 uppercase font-sans mb-1.5">Choose Quick Industrial Preset Graphics:</span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: 'preset_header', label: 'HEADER' },
                        { id: 'preset_roller', label: 'ROLLER' },
                        { id: 'preset_galvanizer', label: 'ZINC' },
                        { id: 'preset_tapper', label: 'TAPPER' },
                        { id: 'preset_stamper', label: 'STAMP' }
                      ].map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setPhoto(preset.id)}
                          className={`p-1 border rounded text-[7.5px] font-bold text-center uppercase tracking-tighter cursor-pointer transition-all ${
                            photo === preset.id ? 'bg-[#f37021] text-white border-[#f37021]' : 'bg-white hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload customized file option */}
                  <div className="pt-2 border-t border-sky-200 space-y-1">
                    <span className="text-[7.5px] block font-bold text-slate-500 uppercase font-sans">Or Upload Real Machinery Photo:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-sky-200 file:text-sky-850 hover:file:bg-sky-305 cursor-pointer font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-2 font-sans pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 text-white font-bold text-[10px] uppercase p-2 hover:bg-[#f37021] active:translate-y-0.5 transition-all rounded shadow cursor-pointer"
                  >
                    💾 Save Asset Row
                  </button>
                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(editingId)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase p-2 transition-all rounded shadow cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Row
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingId(null);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] uppercase p-2 transition-all rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* --- DEDICATED AUDIT-PRACTICE DATA TABLE --- */}
        <div className="box-shaped overflow-x-auto scroll-smooth overspray-x-contain touch-pan-x bg-white select-none">
          <table className="box-shaped-table w-full text-left font-sans text-[10px] uppercase table-fixed min-w-[1080px] max-w-full">
            <colgroup>
              <col className="w-[45px]" />
              <col className="w-[120px]" />
              <col className="w-[185px]" />
              <col className="w-[100px]" />
              <col className="w-[115px]" />
              <col className="w-[85px]" />
              <col className="w-[80px]" />
              <col className="w-[80px]" />
              <col className="w-[80px]" />
              <col className="w-[90px]" />
              <col className="w-[135px]" />
              <col className="w-[90px]" />
            </colgroup>
            <thead>
              <tr className="bg-[#0d233a] text-white border-b border-slate-700 select-none text-center h-7 text-[10px] uppercase font-bold tracking-wider divide-x divide-slate-700">
                <th className="p-0.5 text-center">S.N</th>
                <th className="p-0.5 text-center">SERVICE STATUS</th>
                <th className="p-0.5 text-left pl-2">DESCRIPTION OF MACHINERIES</th>
                <th className="p-0.5 text-center">MODEL NO</th>
                <th className="p-0.5 text-center">MAKE</th>
                <th className="p-0.5 text-center">PHOTO</th>
                <th className="p-0.5 text-center">OPEN STOCK</th>
                <th className="p-0.5 text-center">INCOMING</th>
                <th className="p-0.5 text-center">STOCK USED</th>
                <th className="p-0.5 text-center text-amber-300">BALANCE QTY</th>
                <th className="p-0.5 text-left pl-2">USED FOR</th>
                <th className="p-0.5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[10.5px]">
              {filteredMachines.length > 0 ? (
                filteredMachines.map((m) => {
                  const op = m.openingStock !== undefined ? m.openingStock : (m.qty || 0);
                  const inc = m.incomingStocks !== undefined ? m.incomingStocks : 0;
                  const usd = m.stockUsed !== undefined ? m.stockUsed : 0;
                  const bal = m.balanceQty !== undefined ? m.balanceQty : (op + inc - usd);
                  const statusStr = m.serviceStatus || 'OPERATIONAL';
                  return (
                    <tr 
                      key={m.sn} 
                      className="divide-x divide-slate-300 h-6.5 hover:bg-slate-50 transition-colors group bg-white"
                    >
                      {/* S.N */}
                      <td className="p-0.5 text-center font-bold text-slate-900 bg-white select-none">
                        {m.sn}
                      </td>

                      {/* SERVICE STATUS */}
                      <td className="p-0.5 text-center align-middle">
                        <select
                          value={statusStr}
                          onChange={(e) => {
                            const updatedStatus = e.target.value;
                            const updated = machines.map(mach => mach.sn === m.sn ? { ...mach, serviceStatus: updatedStatus } : mach);
                            setMachines(updated);
                            localStorage.setItem('MFI_MACHINERIES_REGISTER_UPGRADED', JSON.stringify(updated));
                            if (typeof triggerToast === 'function') {
                              triggerToast(`Updated S.N ${m.sn} Service Status to ${updatedStatus}`);
                            }
                          }}
                          className={`px-1 py-0.5 text-[8.5px] font-extrabold rounded border uppercase tracking-tight outline-none cursor-pointer font-sans transition-all shadow-2xs w-full max-w-[118px] text-center mx-auto block ${
                            statusStr.includes('MAINTENANCE') ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' :
                            statusStr.includes('BREAKDOWN') || statusStr.includes('REPAIR') ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200' :
                            statusStr.includes('STANDBY') ? 'bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200' :
                            statusStr.includes('RETIRED') ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' :
                            'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                          }`}
                        >
                          <option value="OPERATIONAL">OPERATIONAL</option>
                          <option value="UNDER MAINTENANCE">MAINTENANCE</option>
                          <option value="BREAKDOWN / REPAIR REQ">BREAKDOWN</option>
                          <option value="STANDBY / RESERVED">STANDBY</option>
                          <option value="RETIRED / DECOMMISSIONED">RETIRED</option>
                        </select>
                      </td>

                      {/* DESCRIPTION */}
                      <td className="p-0.5 pl-2 text-left font-sans font-bold text-slate-900 leading-tight">
                        {m.description && (m.description.includes('<span') || m.description.includes('style=')) ? (
                          <span dangerouslySetInnerHTML={{ __html: m.description }} />
                        ) : (
                          m.description
                        )}
                      </td>

                      {/* MODEL NO */}
                      <td className="p-0.5 text-center font-mono font-bold text-[#0c449e]">
                        {m.modelNo || '—'}
                      </td>

                      {/* MAKE */}
                      <td className="p-0.5 text-center text-slate-700 font-semibold truncate px-1">
                        {m.make || '—'}
                      </td>

                      {/* PHOTO */}
                      <td className="p-0.5 text-center align-middle">
                        <div className="flex justify-center items-center py-0.5">
                          <MachineryPhotoComponent path={m.photo} title={m.description} size="7" />
                        </div>
                      </td>

                      {/* OPENING STOCK */}
                      <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                        {op}
                      </td>

                      {/* INCOMING */}
                      <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                        {inc}
                      </td>

                      {/* USED */}
                      <td className="p-0.5 text-center font-mono font-bold text-rose-600">
                        {usd}
                      </td>

                      {/* BALANCE */}
                      <td className="p-0.5 text-center font-mono font-bold text-[#f37021]">
                        {bal}
                      </td>

                      {/* USED FOR */}
                      <td className="p-0.5 pl-2 text-left text-[9.5px] text-slate-600 leading-tight select-text normal-case truncate max-w-[130px]" title={m.usedFor}>
                        {m.usedFor || '—'}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-0.5 text-center bg-white">
                        <div className="flex items-center justify-center gap-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(m)}
                            className="p-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Edit row details"
                          >
                            <Edit className="w-4 h-4 shrink-0 text-slate-700 hover:text-sky-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(m.sn)}
                            className="p-1 rounded border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Permanently remove row"
                          >
                            <Trash2 className="w-4 h-4 shrink-0 text-red-600 hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="p-10 text-center text-slate-500 italic bg-slate-50 font-sans">
                    No matching equipment registered in plant record ledger search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <FocusErpPaginationFooter
            totalItems={filteredMachines.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* --- FULLSCREEN LIGHTBOX PHOTO MODAL --- */}
        {lightboxPhoto && (
          <div 
            className="fixed inset-0 bg-slate-950/90 z-[9999] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm select-none cursor-zoom-out"
            onClick={() => setLightboxPhoto(null)}
          >
            <div 
              className="bg-white rounded-xl overflow-hidden max-w-lg w-full border-2 border-[#f37021] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo Area */}
              <div className="bg-slate-950 flex items-center justify-center p-8 aspect-square relative border-b">
                {/* Close Button */}
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="absolute right-3.5 top-3.5 bg-rose-600 text-white rounded-full w-7 h-7 font-bold flex items-center justify-center hover:bg-rose-750 transition-all shadow-md cursor-pointer text-xs"
                >
                  ✕
                </button>

                <div className="w-64 h-64 p-2 bg-slate-900 rounded-lg shadow-inner flex items-center justify-center border border-slate-800">
                  {lightboxPhoto.url && (lightboxPhoto.url.startsWith('data:image/') || lightboxPhoto.url.startsWith('http')) ? (
                    <img 
                      src={lightboxPhoto.url} 
                      alt={lightboxPhoto.title} 
                      className="max-w-full max-h-full object-contain rounded"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <MachineryPhotoComponent path={lightboxPhoto.url} title={lightboxPhoto.title} size="56" />
                  )}
                </div>
              </div>

              {/* Text Area */}
              <div className="p-4 flex items-center justify-between">
                <h4 className="font-sans text-sm font-bold text-slate-900 uppercase leading-snug">
                  {lightboxPhoto.title}
                </h4>
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="p-1.5 px-4 bg-slate-900 hover:bg-slate-850 text-white font-sans text-[10px] font-bold uppercase rounded shadow cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <ErpEditHeaderModal
          isOpen={isEditHeaderOpen}
          onClose={() => setIsEditHeaderOpen(false)}
          initialValues={headerConfig}
          defaultValues={{
            companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
            regNo: 'MFI-2026',
            deptName: 'MAIN WORKSHOP & PRODUCTION DEPT',
            formTitle: 'MACHINERIES REGISTER OPENING FORM',
            subtitle: 'Manage, track, and service all plant machinery & production lines.',
            userId: 'ADMIN',
          }}
          onSave={(val) => {
            setHeaderConfig(val);
            localStorage.setItem('mfi_erp_header_machineries', JSON.stringify(val));
          }}
        />
        </div>
      </FocusXLayoutWrapper>
    );
  });


  // --- TAB 14: Tools List Component ---
  export const ToolsListComponent = React.memo(({ triggerToast }: { triggerToast?: (msg: string) => void }) => {
    // Categories mentioned by the user explicitly
    const TOOL_CATEGORIES = [
      'POWER TOOLS',
      'HAND TOOLS',
      'CUTTING TOOLS',
      'MACHINE TOOLS',
      'WELDING & FABRICATION TOOLS',
      'MACHINERIES',
      'PRODUCTION',
      'PACKAGING',
      'COATING',
      'Material Handling Equipment',
      'Measuring & Inspection tools',
      'Air & Hydraulic tools',
      'Safety & Maintenance Tools'
    ];

    const DEFAULT_TOOLS = [
      { sn: 1, category: 'POWER TOOLS', size: '1/2 INCH DRIVE', description: '<span style="color:#000000">HEAVY DUTY PNEUMATIC IMPACT</span> WRENCH', modelNo: 'BOSCH-GDS-18V', make: 'BOSCH / GERMANY', photo: 'preset_power', unit: 'PCS', serviceStatus: 'OPERATIONAL', openingStock: 12, incomingStocks: 4, stockUsed: 1, qty: 15, balanceQty: 15, notes: 'Assembly Line 1 Impact Tightening' },
      { sn: 2, category: 'HAND TOOLS', size: '24 MM - 50 MM', description: '<span style="color:#000000">HEAVY STEEL SLOGGING RING</span> SPANNERS', modelNo: 'SLG-2450', make: 'GEDORE / GERMANY', photo: 'preset_hand', unit: 'SET', serviceStatus: 'OPERATIONAL', openingStock: 8, incomingStocks: 2, stockUsed: 0, qty: 10, balanceQty: 10, notes: 'Heavy Flange Bolting Torque Tools' },
      { sn: 3, category: 'CUTTING TOOLS', size: 'M24 x 3.0 MM', description: '<span style="color:#000000">TUNGSTEN CARBIDE M24 THREADING</span> TAPS', modelNo: 'TAP-M24-TC', make: 'SANDVIK / SWEDEN', photo: 'preset_cutting', unit: 'PCS', serviceStatus: 'OPERATIONAL', openingStock: 25, incomingStocks: 10, stockUsed: 5, qty: 30, balanceQty: 30, notes: 'Nut Tapping Machine Carbide Inserts' },
      { sn: 4, category: 'Measuring & Inspection tools', size: '0 - 300 MM', description: '<span style="color:#000000">HIGH PRECISION DIGITAL VERNIER</span> CALIPER', modelNo: 'MIT-500-196', make: 'MITUTOYO / JAPAN', photo: 'preset_measuring', unit: 'PCS', serviceStatus: 'OPERATIONAL', openingStock: 10, incomingStocks: 2, stockUsed: 0, qty: 12, balanceQty: 12, notes: 'QC Department Certified Calibrated' },
      { sn: 5, category: 'Air & Hydraulic tools', size: '700 BAR / 10000 PSI', description: '<span style="color:#000000">HYDRAULIC BOLT TENSIONER</span> PUMP UNIT', modelNo: 'ENERPAC-HPU', make: 'ENERPAC / USA', photo: 'preset_hydraulic', unit: 'SET', serviceStatus: 'UNDER MAINTENANCE', openingStock: 3, incomingStocks: 1, stockUsed: 0, qty: 4, balanceQty: 4, notes: 'High Pressure Wind Turbine Bolting' },
      { sn: 6, category: 'MACHINERIES', size: 'M12-M24 CAPACITY', description: '<span style="color:#000000">AUTOMATIC COLD HEADING FASTENER</span> MACHINERY', modelNo: 'MAC-CH-24', make: 'SACMA / ITALY', photo: 'preset_machinery', unit: 'SET', serviceStatus: 'OPERATIONAL', openingStock: 4, incomingStocks: 1, stockUsed: 0, qty: 5, balanceQty: 5, notes: 'Bolt Cold Forging Production Line' },
      { sn: 7, category: 'PRODUCTION', size: 'M16-M36 HEAVY HEX', description: '<span style="color:#000000">PRODUCTION LINE AUTOMATIC TAPPER</span> UNIT', modelNo: 'PROD-NT-30', make: 'SANSHING / TAIWAN', photo: 'preset_production', unit: 'UNIT', serviceStatus: 'OPERATIONAL', openingStock: 3, incomingStocks: 1, stockUsed: 0, qty: 4, balanceQty: 4, notes: 'Nut Tapping High Speed Cell' },
      { sn: 8, category: 'PACKAGING', size: '2000 KG/HR', description: '<span style="color:#000000">AUTOMATIC FASTENER WEIGHING & PACKAGING</span> SYSTEM', modelNo: 'PKG-LINE-200', make: 'OCTAGONE / GERMANY', photo: 'preset_packaging', unit: 'LINE', serviceStatus: 'STANDBY', openingStock: 2, incomingStocks: 0, stockUsed: 0, qty: 2, balanceQty: 2, notes: 'Corrugated Box Packing Station' },
      { sn: 9, category: 'COATING', size: '50 MICRON HDG', description: '<span style="color:#000000">HOT DIP GALVANIZING & COATING</span> ACCESSORY SET', modelNo: 'CTG-HDG-50', make: 'EPI / SWEDEN', photo: 'preset_coating', unit: 'SET', serviceStatus: 'OPERATIONAL', openingStock: 5, incomingStocks: 2, stockUsed: 1, qty: 6, balanceQty: 6, notes: 'ASTM A153 Surface Coating' }
    ];

    const [tools, setTools] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_TOOLS_REGISTER_EXCEL');
      let loaded: any[] = [];
      if (saved) {
        try {
          loaded = JSON.parse(saved);
        } catch (e) {}
      }
      if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
        loaded = DEFAULT_TOOLS;
      }
      return loaded.map(t => {
        const op = t.openingStock !== undefined ? Number(t.openingStock) : Number(t.qty || 0);
        const inc = t.incomingStocks !== undefined ? Number(t.incomingStocks) : 0;
        const used = t.stockUsed !== undefined ? Number(t.stockUsed) : 0;
        return {
          ...t,
          serviceStatus: t.serviceStatus || 'OPERATIONAL',
          openingStock: op,
          incomingStocks: inc,
          stockUsed: used,
          qty: op + inc - used,
          balanceQty: op + inc - used
        };
      });
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editingSn, setEditingSn] = useState<number | null>(null);
    const lastNewClickRef = useRef<number>(0);

    // Form states
    const [descriptionOfTools, setDescriptionOfTools] = useState('');
    const [size, setSize] = useState('');
    const [category, setCategory] = useState('POWER TOOLS');
    const [modelNo, setModelNo] = useState('');
    const [make, setMake] = useState('');
    const [photo, setPhoto] = useState('preset_power');
    const [unit, setUnit] = useState('PCS');
    const [serviceStatus, setServiceStatus] = useState('OPERATIONAL');
    const [qty, setQty] = useState<any>('1');
    const [openingStock, setOpeningStock] = useState<any>('1');
    const [incomingStocks, setIncomingStocks] = useState<any>('0');
    const [stockUsed, setStockUsed] = useState<any>('0');
    const [notes, setNotes] = useState('');

    // Filters and search queries
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

    // Lightbox modal for zooming tool images
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; title: string } | null>(null);

    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [headerConfig, setHeaderConfig] = useState<ErpHeaderConfig>(() => {
      try {
        const saved = localStorage.getItem('mfi_erp_header_tools');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return {
        companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
        regNo: 'MFI-2026',
        deptName: 'MAIN WORKSHOP & PRODUCTION DEPT',
        formTitle: 'PRODUCTION TOOLS & EQUIPMENT OPENING FORM',
        subtitle: 'Insert or update workshop tools & equipment specifications.',
        userId: 'ADMIN',
      };
    });

    // Sync state to local storage
    useEffect(() => {
      localStorage.setItem('MFI_TOOLS_REGISTER_EXCEL', JSON.stringify(tools));
    }, [tools]);

    // Handles user-initiated image uploading via base64 parser
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhoto(reader.result);
            triggerToast('Tooling physical photo compressed & uploaded successfully!');
          }
        };
        reader.readAsDataURL(file);
      }
    };

    // Resets form state
    const handleOpenCreateForm = () => {
      setEditingSn(null);
      setDescriptionOfTools('');
      setSize('');
      setCategory('POWER TOOLS');
      setModelNo('');
      setMake('');
      setPhoto('preset_power');
      setUnit('PCS');
      setServiceStatus('OPERATIONAL');
      setQty('1');
      setOpeningStock('1');
      setIncomingStocks('0');
      setStockUsed('0');
      setNotes('');
      setFormOpen(true);
    };

    const toolTimerRef = useRef<any>(null);

    const handleNewButtonClick = (e?: React.MouseEvent) => {
      if (e && e.detail >= 2) {
        if (toolTimerRef.current) {
          clearTimeout(toolTimerRef.current);
          toolTimerRef.current = null;
        }
        setFormOpen(false);
        return;
      }
      if (toolTimerRef.current) clearTimeout(toolTimerRef.current);
      toolTimerRef.current = setTimeout(() => {
        if (formOpen) {
          setFormOpen(false);
        } else {
          handleOpenCreateForm();
        }
        toolTimerRef.current = null;
      }, 200);
    };

    const handleNewButtonDblClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (toolTimerRef.current) {
        clearTimeout(toolTimerRef.current);
        toolTimerRef.current = null;
      }
      setFormOpen(false);
    };

    const handleToggleForm = () => {
      if (formOpen) {
        setFormOpen(false);
      } else {
        handleOpenCreateForm();
      }
    };

    // Pre-populates the editor for editing rows
    const handleEditClick = (item: any) => {
      setEditingSn(item.sn);
      setDescriptionOfTools(item.description);
      setSize(item.size);
      setCategory(item.category);
      setModelNo(item.modelNo);
      setMake(item.make);
      setPhoto(item.photo);
      setUnit(item.unit);
      setServiceStatus(item.serviceStatus || 'OPERATIONAL');
      setQty(String(item.qty || 0));
      setOpeningStock(String(item.openingStock !== undefined ? item.openingStock : (item.qty || 0)));
      setIncomingStocks(String(item.incomingStocks !== undefined ? item.incomingStocks : 0));
      setStockUsed(String(item.stockUsed !== undefined ? item.stockUsed : 0));
      setNotes(item.notes);
      setFormOpen(true);
    };

    // Row deletion with sequence adjustment
    const handleDeleteClick = (sn: number) => {
      const revised = tools.filter(t => t.sn !== sn)
        .map((t, idx) => ({ ...t, sn: idx + 1 })); // Recalculate serial numbers
      setTools(revised);
      localStorage.setItem('MFI_TOOLS_REGISTER_EXCEL', JSON.stringify(revised));
      if (editingSn === sn) {
        setEditingSn(null);
        setFormOpen(false);
      }
      triggerToast(`Tooling & Production row #${sn} deleted successfully.`);
    };

    // Commits standard inputs to the array
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!descriptionOfTools.trim()) {
        alert('Please provide the Description of Tools.');
        return;
      }

      const opVal = Number(openingStock);
      const incVal = Number(incomingStocks);
      const usdVal = Number(stockUsed);
      const computedBalance = Math.max(0, opVal + incVal - usdVal);

      if (editingSn !== null) {
        // Mode edit row
        const updated = tools.map(t => {
          if (t.sn === editingSn) {
            return {
              ...t,
              description: descriptionOfTools.trim(),
              size: size.trim() || '—',
              category,
              modelNo: modelNo.trim() || '—',
              make: make.trim() || '—',
              photo,
              unit,
              serviceStatus: serviceStatus || 'OPERATIONAL',
              qty: computedBalance,
              openingStock: opVal,
              incomingStocks: incVal,
              stockUsed: usdVal,
              balanceQty: computedBalance,
              notes: notes.trim() || '—'
            };
          }
          return t;
        });
        setTools(updated);
        localStorage.setItem('MFI_TOOLS_REGISTER_EXCEL', JSON.stringify(updated));
        triggerToast(`Tooling row S.N ${editingSn} updated into registry successfully.`);
      } else {
        // Mode insert new row
        const nextSn = tools.length > 0 ? Math.max(...tools.map(t => t.sn)) + 1 : 1;
        const newTool = {
          sn: nextSn,
          description: descriptionOfTools.trim(),
          size: size.trim() || '—',
          category,
          modelNo: modelNo.trim() || '—',
          make: make.trim() || '—',
          photo,
          unit,
          serviceStatus: serviceStatus || 'OPERATIONAL',
          qty: computedBalance,
          openingStock: opVal,
          incomingStocks: incVal,
          stockUsed: usdVal,
          balanceQty: computedBalance,
          notes: notes.trim() || '—'
        };
        const updated = [...tools, newTool];
        setTools(updated);
        localStorage.setItem('MFI_TOOLS_REGISTER_EXCEL', JSON.stringify(updated));
        triggerToast('New consumable tool row successfully appended!');
      }

      // Reset fields to ready state for next entry while keeping form open & stable
      setEditingSn(null);
      setDescriptionOfTools('');
      setSize('');
      setCategory('POWER TOOLS');
      setModelNo('');
      setMake('');
      setPhoto('preset_power');
      setUnit('PCS');
      setServiceStatus('OPERATIONAL');
      setQty('1');
      setOpeningStock('1');
      setIncomingStocks('0');
      setStockUsed('0');
      setNotes('');
      setFormOpen(true);
    };

    // Vector preset graphic rendering of industrial tools
    const ToolPhotoComponent = ({ path, title, size = '12' }: { path: string; title: string; size?: string }) => {
      const isCustomImage = path && (path.startsWith('data:image/') || path.startsWith('http://') || path.startsWith('https://'));
      const numSize = Number(size) || 12;
      const isLarge = numSize > 12;
      const boxDimensions = isLarge ? (numSize > 30 ? "w-56 h-36" : "w-24 h-16") : "w-full h-10";

      if (isCustomImage) {
        return (
          <img
            src={path}
            alt={title}
            className={`${boxDimensions} object-contain rounded border border-slate-300 shadow-2xs bg-slate-100 cursor-zoom-in hover:scale-105 transition-transform mx-auto max-w-full`}
            onClick={() => setLightboxMedia({ url: path, title })}
            referrerPolicy="no-referrer"
          />
        );
      }

      const renderVector = () => {
        switch (path) {
          case 'preset_power':
            return (
              <svg className="w-full h-full text-[#f37021]" viewBox="0 0 100 100" fill="currentColor">
                <rect x="35" y="25" width="30" height="40" rx="4" fill="#1e293b" />
                <rect x="42" y="65" width="16" height="20" rx="2" fill="#475569" />
                <circle cx="50" cy="85" r="5" fill="#f37021" />
                <rect x="25" y="35" width="50" height="8" rx="1" fill="#ea580c" />
                <polygon points="50,10 65,30 35,30" fill="#64748b" />
              </svg>
            );
          case 'preset_hand':
            return (
              <svg className="w-full h-full text-slate-400" viewBox="0 0 100 100" fill="currentColor">
                <rect x="44" y="20" width="12" height="60" fill="#64748b" rx="2" />
                <circle cx="50" cy="20" r="14" fill="#334155" />
                <circle cx="50" cy="20" r="8" fill="#f8fafc" />
                <circle cx="50" cy="80" r="14" fill="#334155" />
                <circle cx="50" cy="80" r="8" fill="#f8fafc" />
                <rect x="47" y="12" width="6" height="15" fill="#f8fafc" />
                <rect x="47" y="73" width="6" height="15" fill="#f8fafc" />
              </svg>
            );
          case 'preset_cutting':
            return (
              <svg className="w-full h-full text-indigo-450" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M50 10 L50 90" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                <path d="M40 25 L60 25" stroke="#ea580c" strokeWidth="4" />
                <path d="M40 37 L60 37" stroke="#ea580c" strokeWidth="4" />
                <path d="M40 49 L60 49" stroke="#ea580c" strokeWidth="4" />
                <path d="M40 61 L60 61" stroke="#ea580c" strokeWidth="4" />
                <circle cx="50" cy="15" r="3" fill="#ffffff" />
              </svg>
            );
          case 'preset_machine':
            return (
              <svg className="w-full h-full text-teal-600" viewBox="0 0 100 100" fill="currentColor">
                <rect x="25" y="25" width="50" height="50" rx="1" fill="#475569" />
                <polygon points="50,15 65,35 35,35" fill="#f59e0b" />
                <rect x="40" y="32" width="20" height="30" fill="#1e293b" />
                <circle cx="50" cy="45" r="4" fill="#10b981" />
              </svg>
            );
          case 'preset_welding':
            return (
              <svg className="w-full h-full text-red-500" viewBox="0 0 100 100" fill="currentColor">
                <rect x="25" y="20" width="50" height="60" rx="15" fill="#1e293b" />
                <rect x="35" y="35" width="30" height="15" fill="#0284c7" />
                <line x1="30" y1="58" x2="70" y2="58" stroke="#f37021" strokeWidth="3" />
                <circle cx="50" cy="58" r="4" fill="#f37021" />
              </svg>
            );
          case 'preset_handling':
            return (
              <svg className="w-full h-full text-yellow-500" viewBox="0 0 100 100" fill="currentColor">
                <rect x="15" y="65" width="60" height="12" rx="2" fill="#d97706" />
                <rect x="70" y="15" width="10" height="65" fill="#1e293b" />
                <rect x="50" y="45" width="25" height="6" fill="#475569" />
                <circle cx="25" cy="80" r="10" fill="#334155" />
                <circle cx="65" cy="80" r="10" fill="#334155" />
                <circle cx="25" cy="80" r="4" fill="#ffffff" />
                <circle cx="65" cy="80" r="4" fill="#ffffff" />
              </svg>
            );
          case 'preset_measuring':
            return (
              <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 100" fill="currentColor">
                <rect x="15" y="45" width="70" height="10" fill="#334155" />
                <rect x="55" y="35" width="25" height="30" fill="#1e293b" rx="2" />
                <line x1="25" y1="40" x2="25" y2="60" stroke="#f37021" strokeWidth="3" />
                <line x1="35" y1="40" x2="35" y2="50" stroke="#64748b" strokeWidth="2" />
                <line x1="45" y1="40" x2="45" y2="50" stroke="#64748b" strokeWidth="2" />
                <text x="59" y="52" fill="#10b981" fontSize="9" fontWeight="900" fontFamily="sans-serif">mm</text>
              </svg>
            );
          case 'preset_hydraulic':
            return (
              <svg className="w-full h-full text-sky-500" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="35" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <circle cx="50" cy="50" r="28" fill="#f8fafc" />
                <path d="M50 50 L75 35" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="50" r="6" fill="#1e293b" />
                <text x="32" y="65" fill="#475569" fontSize="6" fontWeight="bold">700 BAR</text>
              </svg>
            );
          case 'preset_machinery':
            return (
              <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 100" fill="currentColor">
                <rect x="20" y="30" width="60" height="40" rx="4" fill="#1e293b" />
                <circle cx="35" cy="50" r="10" fill="#f37021" />
                <circle cx="65" cy="50" r="10" fill="#38bdf8" />
                <rect x="42" y="45" width="16" height="10" fill="#f8fafc" />
                <rect x="40" y="20" width="20" height="10" rx="2" fill="#ea580c" />
              </svg>
            );
          case 'preset_production':
            return (
              <svg className="w-full h-full text-[#f37021]" viewBox="0 0 100 100" fill="currentColor">
                <rect x="15" y="40" width="70" height="40" rx="2" fill="#1e293b" />
                <polygon points="25,40 35,20 45,40" fill="#ea580c" />
                <polygon points="55,40 65,20 75,40" fill="#ea580c" />
                <circle cx="50" cy="60" r="12" fill="#f37021" />
                <circle cx="50" cy="60" r="5" fill="#1e293b" />
              </svg>
            );
          case 'preset_packaging':
            return (
              <svg className="w-full h-full text-amber-500" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20 35 L50 20 L80 35 L80 75 L50 90 L20 75 Z" fill="#d97706" />
                <path d="M20 35 L50 50 L80 35" stroke="#fef3c7" strokeWidth="3" fill="none" />
                <line x1="50" y1="50" x2="50" y2="90" stroke="#fef3c7" strokeWidth="3" />
                <path d="M35 27 L65 42" stroke="#ea580c" strokeWidth="4" />
              </svg>
            );
          case 'preset_coating':
            return (
              <svg className="w-full h-full text-cyan-500" viewBox="0 0 100 100" fill="currentColor">
                <rect x="25" y="20" width="50" height="60" rx="8" fill="#0284c7" />
                <path d="M25 40 Q 50 50 75 40 L75 80 Q 50 80 25 80 Z" fill="#06b6d4" />
                <circle cx="40" cy="30" r="3" fill="#ffffff" />
                <circle cx="60" cy="35" r="4" fill="#ffffff" />
                <path d="M30 65 Q 50 75 70 65" stroke="#ffffff" strokeWidth="3" fill="none" />
              </svg>
            );
          case 'preset_safety':
          default:
            return (
              <svg className="w-full h-full text-rose-500" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20 50 C20 20, 80 20, 80 50 L80 65 L20 65 Z" fill="#f59e0b" />
                <rect x="25" y="65" width="50" height="6" fill="#ea580c" />
                <rect x="15" y="58" width="70" height="3" fill="#b45309" />
                <circle cx="50" cy="40" r="6" fill="#ffffff" />
                <line x1="50" y1="34" x2="50" y2="46" stroke="#ea580c" strokeWidth="2" />
              </svg>
            );
        }
      };

      return (
        <div 
          onClick={() => setLightboxMedia({ url: path, title })}
          className={`${boxDimensions} p-0.5 rounded border border-slate-300 bg-slate-900 shadow-2xs cursor-zoom-in hover:bg-slate-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center mx-auto shrink-0 overflow-hidden`}
          title="Zoom item drawing"
        >
          {renderVector()}
        </div>
      );
    };

    // Filtered tools computed values
    const filteredTools = useMemo(() => {
      return tools.filter(t => {
        const matchesCategory = activeCategoryFilter === 'ALL' || (t.category || '').toUpperCase() === activeCategoryFilter.toUpperCase();
        const str = `${t.description || ''} ${t.size || ''} ${t.category || ''} ${t.modelNo || ''} ${t.make || ''} ${t.notes || ''}`.toUpperCase();
        const matchesQuery = str.includes(searchQuery.toUpperCase());
        return matchesCategory && matchesQuery;
      });
    }, [tools, activeCategoryFilter, searchQuery]);

    // KPI Metrics calculation
    const overallToolsCount = tools.length;
    const overallToolsQuantity = tools.reduce((sum, t) => sum + (t.qty || 0), 0);
    const overallUniqueMakes = new Set(tools.map(t => (t.make || '').toUpperCase()).filter(Boolean)).size;

    // Trigger structured PDF export using printHtml helper (Clean AutoCount / Focus ERP Report Style)
    const printToolsLedger = () => {
      const ITEMS_PER_PAGE = 22;
      const totalPages = Math.max(1, Math.ceil(tools.length / ITEMS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageTools = tools.slice(pIdx * ITEMS_PER_PAGE, (pIdx + 1) * ITEMS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageTools, isLastPage, startIdx: pIdx * ITEMS_PER_PAGE };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Production Tools & Equipment Register</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 10mm 15mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 10px; font-size: 10px; line-height: 1.3; }
            
            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; page-break-inside: avoid; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; page-break-inside: avoid; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              thead { display: table-header-group !important; }
              tfoot { display: table-footer-group !important; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table thead tr { page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: avoid !important; break-after: avoid !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <table class="report-table">
                <thead>
                  <tr class="header-repeat-row">
                    <td colspan="11" style="border: none !important; padding: 0 0 10px 0 !important; background: #ffffff !important;">
                      <div class="top-meta-bar">
                        <div class="org-left">
                          <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                          <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                        </div>
                        <div class="doc-center">
                          <div class="doc-title">${headerConfig.formTitle.toUpperCase()}</div>
                        </div>
                        <div class="meta-right">
                          <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                          <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                          <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th class="left" style="width: 20%;">Description / Code</th>
                    <th style="width: 9%;">Size / Spec</th>
                    <th class="left" style="width: 11%;">Category</th>
                    <th style="width: 11%;">Model / Make</th>
                    <th style="width: 5%;">UOM</th>
                    <th style="width: 11%;">Service Status</th>
                    <th style="width: 6%;">Opening</th>
                    <th style="width: 6%;">Incoming</th>
                    <th style="width: 6%;">Used</th>
                    <th class="right" style="width: 11%;">Balance Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.pageTools.map((t, idx) => {
                    const op = t.openingStock !== undefined ? t.openingStock : (t.qty || 0);
                    const inc = t.incomingStocks !== undefined ? t.incomingStocks : 0;
                    const usd = t.stockUsed !== undefined ? t.stockUsed : 0;
                    const bal = t.balanceQty !== undefined ? t.balanceQty : (op + inc - usd);
                    return `
                      <tr>
                        <td>${p.startIdx + idx + 1}</td>
                        <td class="left" style="font-weight: bold;">${t.description.toUpperCase()}</td>
                        <td style="font-weight: bold; color: #000;">${t.size || 'N/A'}</td>
                        <td class="left">${(t.category || 'GENERAL').toUpperCase()}</td>
                        <td>${(t.modelNo || '').toUpperCase()} ${t.make ? `/ ${t.make.toUpperCase()}` : ''}</td>
                        <td>${t.unit || 'PCS'}</td>
                        <td style="font-weight: bold;">${(t.serviceStatus || 'OPERATIONAL').toUpperCase()}</td>
                        <td>${op}</td>
                        <td>${inc}</td>
                        <td>${usd}</td>
                        <td class="right" style="font-weight: bold; color: #000;">${bal}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${p.isLastPage ? `
                    <tr class="total-summary-row">
                      <td colspan="5" class="left"><strong>Doc Count: ${tools.length} Line Items</strong></td>
                      <td><strong>PCS</strong></td>
                      <td><strong>—</strong></td>
                      <td><strong>${tools.reduce((s, t) => s + (t.openingStock || t.qty || 0), 0)}</strong></td>
                      <td><strong>${tools.reduce((s, t) => s + (t.incomingStocks || 0), 0)}</strong></td>
                      <td><strong>${tools.reduce((s, t) => s + (t.stockUsed || 0), 0)}</strong></td>
                      <td class="right"><strong>Total Balance : ${overallToolsQuantity}</strong></td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Categories</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Category Code</th>
                        <th>UOM</th>
                        <th>Total Items</th>
                        <th class="right">Total Stock Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${TOOL_CATEGORIES.map(cat => {
                        const catTools = tools.filter(t => (t.category || '').toUpperCase() === cat.toUpperCase());
                        if (catTools.length === 0) return '';
                        const catQty = catTools.reduce((s, t) => s + (t.balanceQty !== undefined ? t.balanceQty : ((t.openingStock || t.qty || 0) + (t.incomingStocks || 0) - (t.stockUsed || 0))), 0);
                        return `
                          <tr>
                            <td class="left" style="font-weight: bold;">${cat.toUpperCase()}</td>
                            <td>PCS</td>
                            <td>${catTools.length}</td>
                            <td class="right" style="font-weight: bold;">${catQty}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>PCS</td>
                        <td>${tools.length}</td>
                        <td class="right">${overallToolsQuantity}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Tools_Registry');
    };

    // Category Wise Print Ledger helper (Clean AutoCount / Focus ERP Report Style)
    const printCategoryWiseToolsLedger = () => {
      const activeStats = TOOL_CATEGORIES.map(cat => {
        const catTools = tools.filter(t => (t.category || '').toUpperCase() === cat.toUpperCase());
        const catQty = catTools.reduce((s, t) => s + (t.qty || 0), 0);
        return { cat, list: catTools, qty: catQty };
      }).filter(group => group.list.length > 0);

      const CATS_PER_PAGE = 3;
      const totalPages = Math.max(1, Math.ceil(activeStats.length / CATS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageGroups = activeStats.slice(pIdx * CATS_PER_PAGE, (pIdx + 1) * CATS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageGroups, isLastPage };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Category-Wise Production Tools & Equipment Listing</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 0; font-size: 10px; line-height: 1.3; }
            
            .report-page { page-break-after: always; break-after: page; padding: 10px; }
            .report-page:last-child { page-break-after: avoid; break-after: avoid; }

            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .category-section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1px solid #000; padding: 5px 8px; margin-top: 15px; background: #f8fafc; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              .category-section-block { margin-bottom: 12px; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <div class="top-meta-bar">
                <div class="org-left">
                  <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                  <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                </div>
                <div class="doc-center">
                  <div class="doc-title">${headerConfig.formTitle.toUpperCase()} (CATEGORY WISE)</div>
                </div>
                <div class="meta-right">
                  <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                  <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                  <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                </div>
              </div>

              ${p.pageGroups.map(group => `
                <div class="category-section-block">
                  <table class="report-table">
                    <thead>
                      <tr class="cat-header-repeat-row">
                        <th colspan="10" class="left" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1.5px solid #000; padding: 6px 8px; background: #f8fafc; color: #000;">
                          CATEGORY : ${group.cat.toUpperCase()} (${group.list.length} ITEMS)
                        </th>
                      </tr>
                      <tr class="col-header-row">
                        <th style="width: 5%;">S.N</th>
                        <th class="left" style="width: 22%;">Description / Item Name</th>
                        <th style="width: 10%;">Size / Spec</th>
                        <th style="width: 12%;">Model / Make</th>
                        <th style="width: 6%;">UOM</th>
                        <th style="width: 11%;">Service Status</th>
                        <th style="width: 8%;">Opening</th>
                        <th style="width: 8%;">Incoming</th>
                        <th style="width: 8%;">Used</th>
                        <th class="right" style="width: 10%;">Balance Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${group.list.map((t, idx) => {
                        const op = t.openingStock !== undefined ? t.openingStock : (t.qty || 0);
                        const inc = t.incomingStocks !== undefined ? t.incomingStocks : 0;
                        const usd = t.stockUsed !== undefined ? t.stockUsed : 0;
                        const bal = t.balanceQty !== undefined ? t.balanceQty : (op + inc - usd);
                        return `
                          <tr>
                            <td>${idx + 1}</td>
                            <td class="left" style="font-weight: bold;">${t.description.toUpperCase()}</td>
                            <td style="font-weight: bold;">${t.size || 'N/A'}</td>
                            <td>${(t.modelNo || '').toUpperCase()} ${t.make ? `/ ${t.make.toUpperCase()}` : ''}</td>
                            <td>${t.unit || 'PCS'}</td>
                            <td style="font-weight: bold;">${(t.serviceStatus || 'OPERATIONAL').toUpperCase()}</td>
                            <td>${op}</td>
                            <td>${inc}</td>
                            <td>${usd}</td>
                            <td class="right" style="font-weight: bold;">${bal}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="font-weight: bold; background: #f8fafc;">
                        <td colspan="4" class="left">Sub-Total for ${group.cat.toUpperCase()}</td>
                        <td>PCS</td>
                        <td>—</td>
                        <td>${group.list.reduce((s, t) => s + (t.openingStock || t.qty || 0), 0)}</td>
                        <td>${group.list.reduce((s, t) => s + (t.incomingStocks || 0), 0)}</td>
                        <td>${group.list.reduce((s, t) => s + (t.stockUsed || 0), 0)}</td>
                        <td class="right">${group.qty}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              `).join('')}

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Items</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Category Code</th>
                        <th>UOM</th>
                        <th>Qty Items</th>
                        <th class="right">Total Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${activeStats.map(group => `
                        <tr>
                          <td class="left" style="font-weight: bold;">${group.cat.toUpperCase()}</td>
                          <td>PCS</td>
                          <td>${group.list.length}</td>
                          <td class="right" style="font-weight: bold;">${group.qty}</td>
                        </tr>
                      `).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>PCS</td>
                        <td>${tools.length}</td>
                        <td class="right">${overallToolsQuantity}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Tools_Category_Wise_Registry');
    };

    return (
      <div className="space-y-6 font-mono text-[11px] select-none">
        
        {/* Image 1 & Image 2 Action Bar */}
        <ErpActionBar
          title="FASTENERS TOOLS LEDGER"
          subtitle="Manage and print certified workshop tools and equipment registers."
          onNew={handleOpenCreateForm}
          onToggleNew={handleToggleForm}
          onClose={() => setFormOpen(false)}
          onWipe={() => {
            if (editingSn !== null) {
              handleDeleteClick(editingSn);
            } else if (tools.length > 0) {
              const lastSn = tools[tools.length - 1].sn;
              handleDeleteClick(lastSn);
            } else {
              triggerToast("No tools rows to delete.");
            }
          }}
          onPrintMaster={printToolsLedger}
          onPrintSplit={printCategoryWiseToolsLedger}
          appendLabel="INSERT TOOL SPEC"
          onEditHeader={() => setIsEditHeaderOpen(true)}
        />

        {/* Filters and search box with category dropdown and stable +NEW button */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by description, size, model, make, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 bg-white border border-slate-300 p-2 text-[11px] focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-2xs">
              <span className="text-[10px] text-[#0a2342] font-extrabold uppercase font-sans whitespace-nowrap">
                CATEGORY:
              </span>
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="bg-white border border-[#0a2342] text-[#0a2342] px-2 py-1 rounded font-extrabold text-[11px] outline-none cursor-pointer hover:border-[#f37021] transition-colors uppercase font-sans max-w-[280px]"
              >
                <option value="ALL">ALL CATEGORIES ({overallToolsCount})</option>
                {TOOL_CATEGORIES.map(categoryName => {
                  const occurrences = tools.filter(t => (t.category || '').toUpperCase() === categoryName.toUpperCase()).length;
                  return (
                    <option key={categoryName} value={categoryName}>
                      {categoryName} ({occurrences})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Active Filter:</span>
            <span className="bg-sky-50 text-sky-850 px-2.5 py-1 rounded border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
              {activeCategoryFilter === 'ALL' ? 'Showing All Tools' : `Category: ${activeCategoryFilter}`}
            </span>
            {searchQuery || activeCategoryFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('ALL');
                }}
                className="text-[9.5px] text-[#f37021] hover:underline uppercase font-bold ml-1.5"
                title="Reset all filters"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        </div>

        {/* --- ADD / EDIT TOOL INLINE FORM CONFIGURED AS THE EXCEL COLUMN HEADERS --- */}
        {formOpen && (
          <form 
            onSubmit={handleSubmit}
            className="bg-sky-50/50 border-2 border-sky-200 p-5 rounded-xl shadow-md space-y-4 animate-fade-in text-[11px] w-full max-w-full"
          >
            <OpeningFormHeader
              headerConfig={headerConfig}
              deptName="MAIN WORKSHOP & PRODUCTION DEPT"
              formTitle="PRODUCTION TOOLS & EQUIPMENT OPENING FORM"
              subtitle="Insert or update workshop tools & equipment specifications."
              editingSn={editingSn}
              onClose={() => setFormOpen(false)}
              onEditHeader={() => setIsEditHeaderOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: major data fields representing the requested columns */}
              <div className="md:col-span-8 space-y-3.5">
                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Description of Tools *</label>
                  <textarea
                    rows={2}
                    placeholder="Enter description of tools (e.g. Tungsten M24 Thread Taps set)"
                    value={descriptionOfTools}
                    onChange={(e) => setDescriptionOfTools(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Size (E.g. 1" Drive or M24)</label>
                    <input
                      type="text"
                      placeholder="e.g. M14 x P1.5 or 300MM"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans text-[11.5px]"
                    >
                      {TOOL_CATEGORIES.map(catOpt => (
                        <option key={catOpt} value={catOpt}>{catOpt.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Model No</label>
                    <input
                      type="text"
                      placeholder="e.g. TR-SANDVIK-90"
                      value={modelNo}
                      onChange={(e) => setModelNo(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Make (Manufacturer Brand)</label>
                    <input
                      type="text"
                      placeholder="e.g. OSG INDUSTRIES, JAPAN"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Unit of Measurement</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans text-[11px]"
                    >
                      <option value="PCS">PCS (PIECES)</option>
                      <option value="SET">SET (GROUPED KIT)</option>
                      <option value="BOX (10 PCS)">BOX (10 PCS PACK)</option>
                      <option value="UNIT">UNIT (INTEGRATED DEVICE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Service Status</label>
                    <select
                      value={serviceStatus}
                      onChange={(e) => setServiceStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans text-[11px]"
                    >
                      <option value="OPERATIONAL">OPERATIONAL</option>
                      <option value="UNDER MAINTENANCE">UNDER MAINTENANCE</option>
                      <option value="OUT OF SERVICE">OUT OF SERVICE</option>
                      <option value="STANDBY">STANDBY</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-100/60 p-2 rounded border border-slate-200">
                    <span className="block text-[8px] text-slate-500 uppercase font-bold mb-1 font-sans">
                      STOCK ACCOUNTS REGISTER
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">OPEN</label>
                        <input
                          type="number"
                          value={openingStock}
                          onChange={(e) => setOpeningStock(e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">INCOMING</label>
                        <input
                          type="number"
                          value={incomingStocks}
                          onChange={(e) => setIncomingStocks(e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">USED</label>
                        <input
                          type="number"
                          value={stockUsed}
                          onChange={(e) => setStockUsed(e.target.value)}
                          className="w-full text-center bg-white border border-slate-305 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-[#f37021] uppercase font-semibold text-center leading-none mb-1">BALANCE</label>
                        <div className="w-full text-center p-1 text-[9.5px] font-sans font-bold bg-amber-50 border border-amber-300 rounded text-amber-800 h-[22px] flex items-center justify-center">
                          {Math.max(0, (Number(openingStock) || 0) + (Number(incomingStocks) || 0) - (Number(stockUsed) || 0))}
                        </div>
                      </div>
                    </div>
                  </div>

                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Notes (Specifications / Wear status / Calibration date)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide additional details, like calibration check schedules or physical compartment locations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                  />
                </div>
              </div>

              {/* Right Column: preset vector selector and custom photo upload */}
              <div className="md:col-span-4 bg-sky-100/40 p-3.5 border border-sky-200 rounded-lg space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <label className="block text-[8.5px] text-slate-600 uppercase font-bold font-sans leading-none">REAL TIME GRAPHIC SOURCE</label>
                  
                  {/* Miniature frame displaying current resolution */}
                  <div className="flex items-center gap-3 bg-white p-2 border border-sky-200 rounded">
                    <ToolPhotoComponent path={photo} title="Vibe thumbnail" size="14" />
                    <div className="truncate">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Active layout:</span>
                      <span className="text-[10px] text-sky-850 font-bold tracking-tight block truncate uppercase">
                        {photo.startsWith('data:image/') ? 'Custom Upload photo' : `${photo.replace('preset_', '')} model graphic`}
                      </span>
                    </div>
                  </div>

                  {/* Quick-choice options row of responsive vector markers */}
                  <div className="pt-2 border-t border-sky-200">
                    <span className="text-[7.5px] block font-bold text-slate-500 uppercase font-sans mb-1.5">Quick Choose Matching Graphic Preset:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                      {[
                        { id: 'preset_power', label: 'POWER' },
                        { id: 'preset_hand', label: 'HAND' },
                        { id: 'preset_cutting', label: 'CUTTING' },
                        { id: 'preset_machine', label: 'MACHINE' },
                        { id: 'preset_welding', label: 'WELDER' },
                        { id: 'preset_machinery', label: 'MACHINERIES' },
                        { id: 'preset_production', label: 'PRODUCTION' },
                        { id: 'preset_packaging', label: 'PACKAGING' },
                        { id: 'preset_coating', label: 'COATING' },
                        { id: 'preset_handling', label: 'JACK' },
                        { id: 'preset_measuring', label: 'GAUGE' },
                        { id: 'preset_hydraulic', label: 'PRESSURE' },
                        { id: 'preset_safety', label: 'SAFETY' }
                      ].map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setPhoto(preset.id)}
                          className={`p-1 border rounded text-[7.5px] font-bold text-center uppercase tracking-tighter cursor-pointer transition-all ${
                            photo === preset.id ? 'bg-[#f37021] text-white border-[#f37021]' : 'bg-white hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom upload option */}
                  <div className="pt-2 border-t border-sky-200 space-y-1">
                    <span className="text-[7.5px] block font-bold text-slate-500 uppercase font-sans">Or Upload Tool Photo:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-sky-200 file:text-sky-850 hover:file:bg-sky-305 cursor-pointer font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-2 font-sans pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 text-white font-bold text-[10px] uppercase p-2 hover:bg-[#f37021] active:translate-y-0.5 transition-all rounded shadow cursor-pointer"
                  >
                    💾 Save Tool Row
                  </button>
                  {editingSn !== null && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(editingSn)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase p-2 transition-all rounded shadow cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Row
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingSn(null);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] uppercase p-2 transition-all rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* --- EXCEL INSPIRED AUDITABLE DOCUMENT GRID --- */}
        <div className="box-shaped overflow-x-auto scroll-smooth overspray-x-contain touch-pan-x bg-white select-none">
          <table className="box-shaped-table w-full text-left font-sans text-[10px] uppercase table-fixed min-w-[1100px] max-w-full">
            <colgroup>
              <col className="w-[45px]" />
              <col className="w-[180px]" />
              <col className="w-[75px]" />
              <col className="w-[120px]" />
              <col className="w-[85px]" />
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[50px]" />
              <col className="w-[110px]" />
              <col className="w-[70px]" />
              <col className="w-[70px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[120px]" />
              <col className="w-[90px]" />
            </colgroup>
            <thead>
              <tr className="bg-[#0d233a] text-white border-b border-slate-700 select-none text-center h-7 text-[10px] uppercase font-bold tracking-wider divide-x divide-slate-700">
                <th className="p-0.5 text-center">S.N</th>
                <th className="p-0.5 text-left pl-2">DESCRIPTION OF TOOLS</th>
                <th className="p-0.5 text-center">SIZE</th>
                <th className="p-0.5 text-center">CATEGORY</th>
                <th className="p-0.5 text-center">MODEL NO</th>
                <th className="p-0.5 text-center">MAKE</th>
                <th className="p-0.5 text-center">PHOTO</th>
                <th className="p-0.5 text-center">UNIT</th>
                <th className="p-0.5 text-center">SERVICE STATUS</th>
                <th className="p-0.5 text-center">OPEN STOCK</th>
                <th className="p-0.5 text-center">INCOMING</th>
                <th className="p-0.5 text-center">STOCK USED</th>
                <th className="p-0.5 text-center text-amber-300">BALANCE QTY</th>
                <th className="p-0.5 text-left pl-2">NOTES</th>
                <th className="p-0.5 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-[10.5px]">
              {filteredTools.length > 0 ? (
                filteredTools.map((t) => {
                  const op = t.openingStock !== undefined ? t.openingStock : (t.qty || 0);
                  const inc = t.incomingStocks !== undefined ? t.incomingStocks : 0;
                  const usd = t.stockUsed !== undefined ? t.stockUsed : 0;
                  const bal = t.balanceQty !== undefined ? t.balanceQty : (op + inc - usd);
                  return (
                    <tr 
                      key={t.sn} 
                      className="divide-x divide-slate-300 h-6.5 hover:bg-slate-50 transition-colors group bg-white"
                    >
                      {/* S.N */}
                      <td className="p-0.5 text-center font-bold text-slate-900 bg-white select-none">
                        {t.sn}
                      </td>

                      {/* DESCRIPTION */}
                      <td className="p-0.5 pl-2 text-left font-sans font-bold text-slate-900 leading-tight">
                        {t.description && (t.description.includes('<span') || t.description.includes('style=')) ? (
                          <span dangerouslySetInnerHTML={{ __html: t.description }} />
                        ) : (
                          t.description
                        )}
                      </td>

                      {/* SIZE */}
                      <td className="p-0.5 text-center font-mono font-bold text-rose-700">
                        {t.size || '—'}
                      </td>

                      {/* CATEGORY */}
                      <td className="p-0.5 text-center font-sans">
                        <span className="bg-slate-100 text-slate-800 border border-slate-300 px-1 py-0.2 rounded text-[8.5px] font-bold tracking-tight">
                          {t.category}
                        </span>
                      </td>

                      {/* MODEL NO */}
                      <td className="p-0.5 text-center font-mono font-bold text-[#0c449e]">
                        {t.modelNo || '—'}
                      </td>

                      {/* MAKE */}
                      <td className="p-0.5 text-center text-slate-700 font-semibold truncate px-1">
                        {t.make || '—'}
                      </td>

                      {/* PHOTO */}
                      <td className="p-0.5 text-center">
                        <div className="flex justify-center items-center">
                          <ToolPhotoComponent path={t.photo} title={t.description} size="7" />
                        </div>
                      </td>

                      {/* UNIT */}
                      <td className="p-0.5 text-center font-bold text-slate-600">
                        {t.unit}
                      </td>

                      {/* SERVICE STATUS */}
                      <td className="p-0.5 text-center font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight ${
                          (t.serviceStatus || 'OPERATIONAL') === 'OPERATIONAL'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : (t.serviceStatus || '').includes('MAINTENANCE')
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : (t.serviceStatus || '').includes('OUT')
                            ? 'bg-rose-50 text-rose-800 border border-rose-300'
                            : 'bg-sky-50 text-sky-800 border border-sky-300'
                        }`}>
                          {t.serviceStatus || 'OPERATIONAL'}
                        </span>
                      </td>

                      {/* OPENING STOCK */}
                      <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                        {op}
                      </td>

                      {/* INCOMING */}
                      <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                        {inc}
                      </td>

                      {/* USED */}
                      <td className="p-0.5 text-center font-mono font-bold text-rose-600">
                        {usd}
                      </td>

                      {/* BALANCE */}
                      <td className="p-0.5 text-center font-mono font-bold text-[#f37021]">
                        {bal}
                      </td>

                      {/* NOTES */}
                      <td className="p-0.5 pl-2 text-left text-[9.5px] text-slate-600 leading-tight select-text normal-case truncate max-w-[120px]" title={t.notes}>
                        {t.notes || '—'}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-0.5 text-center bg-white">
                        <div className="flex items-center justify-center gap-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(t)}
                            className="p-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Edit row details"
                          >
                            <Edit className="w-4 h-4 shrink-0 text-slate-700 hover:text-sky-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(t.sn)}
                            className="p-1 rounded border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Permanently remove row"
                          >
                            <Trash2 className="w-4 h-4 shrink-0 text-red-600 hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="p-10 text-center text-slate-500 italic bg-slate-50 font-sans">
                    No tooling components registered under the selected filters. Click 'Clear Filters' to show all tools.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <FocusErpPaginationFooter
            totalItems={filteredTools.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* --- LIGHTBOX DETAIL MODAL FOR DYNAMIC SHIELD ZOOMING --- */}
        {lightboxMedia && (
          <div 
            className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fade-in"
            onClick={() => setLightboxMedia(null)}
          >
            <div 
              className="bg-white rounded-2xl border-2 border-slate-900 shadow-2xl p-5 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h4 className="font-sans text-xs font-bold uppercase text-slate-900 truncate pr-4">
                  {lightboxMedia.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setLightboxMedia(null)}
                  className="p-1 text-slate-500 hover:text-rose-600 font-bold uppercase text-[10px]"
                >
                  ✖ Close
                </button>
              </div>
              <div className="flex justify-center items-center bg-slate-100 p-8 rounded-xl border border-slate-200 max-h-[350px] overflow-hidden">
                <ToolPhotoComponent path={lightboxMedia.url} title={lightboxMedia.title} size="40" />
              </div>
            </div>
          </div>
        )}

        <ErpEditHeaderModal
          isOpen={isEditHeaderOpen}
          onClose={() => setIsEditHeaderOpen(false)}
          initialValues={headerConfig}
          defaultValues={{
            companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
            regNo: 'MFI-2026',
            deptName: 'MAIN WORKSHOP & PRODUCTION DEPT',
            formTitle: 'PRODUCTION TOOLS & EQUIPMENT OPENING FORM',
            subtitle: 'Insert or update workshop tools & equipment specifications.',
            userId: 'ADMIN',
          }}
          onSave={(val) => {
            setHeaderConfig(val);
            localStorage.setItem('mfi_erp_header_tools', JSON.stringify(val));
          }}
        />

      </div>
    );
  });


  // --- TAB 14.5: Packaging Materials Component ---
  export const PackagingMaterialsComponent = React.memo(({ triggerToast }: { triggerToast?: (msg: string) => void }) => {
    const PACKAGING_CATEGORIES = [
      'POWER STRAPPING TOOLS',
      'HAND DISPENSERS',
      'BOXES & CARTONS',
      'WOODEN CRATES / PALLETS',
      'STRETCH WRAPS & FILMS',
      'LABELS & ADHESIVE TAPES',
      'DRUMS & PP BAGS',
      'THREAD PROTECTORS & BOLT CAPS'
    ];

    const DEFAULT_PACKAGING = [
      { sn: 1, category: 'BOXES & CARTONS', size: '300x200x150 MM', description: '<span style="color:#000000">CORRUGATED DUAL-WALL PACKAGING</span> CARTON', photo: 'preset_handling', unit: 'PCS', openingStock: 500, incomingStocks: 200, stockUsed: 150, qty: 550, balanceQty: 550, notes: 'Heavy Duty 25KG Hex Bolt Capacity' },
      { sn: 2, category: 'PALLETS & CRATES', size: '1200x1000 MM', description: '<span style="color:#000000">ISPM-15 TREATED EURO WOODEN</span> PALLET', photo: 'preset_safety', unit: 'PCS', openingStock: 80, incomingStocks: 50, stockUsed: 30, qty: 100, balanceQty: 100, notes: 'Heat Treated for Export Shipping' },
      { sn: 3, category: 'STRETCH FILM', size: '500 MM x 23 MICRON', description: '<span style="color:#000000">HIGH-TENSION INDUSTRIAL STRETCH</span> WRAP FILM', photo: 'preset_cutting', unit: 'ROLL', openingStock: 120, incomingStocks: 60, stockUsed: 40, qty: 140, balanceQty: 140, notes: 'Cast LLDPE Clear Wrap Roll' },
      { sn: 4, category: 'STEEL STRAPPING', size: '19 MM x 0.8 MM', description: '<span style="color:#000000">HEAVY-DUTY HIGH TENSILE ZINC</span> STEEL STRAPPING', photo: 'preset_power', unit: 'COIL', openingStock: 35, incomingStocks: 15, stockUsed: 10, qty: 40, balanceQty: 40, notes: 'Signode Grade Steel Strapping' },
      { sn: 5, category: 'THREAD PROTECTORS', size: 'M16 - M36 RANGE', description: '<span style="color:#000000">HEAVY-DUTY PLASTIC THREAD PROTECTOR</span> CAPS', photo: 'preset_machine', unit: 'PCS', openingStock: 2500, incomingStocks: 1000, stockUsed: 800, qty: 2700, balanceQty: 2700, notes: 'Polyethylene Caps for Stud Bolts' }
    ];

    const [materials, setMaterials] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_PACK_MATERIALS_EXCEL_V3');
      let loaded: any[] = [];
      if (saved) {
        try {
          loaded = JSON.parse(saved);
        } catch (e) {}
      }
      if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
        loaded = DEFAULT_PACKAGING;
      }
      return loaded.map(m => {
        const op = m.openingStock !== undefined ? Number(m.openingStock) : Number(m.qty || 0);
        const inc = m.incomingStocks !== undefined ? Number(m.incomingStocks) : 0;
        const used = m.stockUsed !== undefined ? Number(m.stockUsed) : 0;
        return {
          ...m,
          openingStock: op,
          incomingStocks: inc,
          stockUsed: used,
          qty: op + inc - used,
          balanceQty: op + inc - used
        };
      });
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editingSn, setEditingSn] = useState<number | null>(null);
    const lastNewClickRef = useRef<number>(0);

    // Form inputs matching Excel columns
    const [description, setDescription] = useState('');
    const [size, setSize] = useState('');
    const [category, setCategory] = useState('BOXES & CARTONS');
    const [modelNo, setModelNo] = useState('');
    const [make, setMake] = useState('');
    const [photo, setPhoto] = useState('preset_handling');
    const [unit, setUnit] = useState('PCS');
    const [qty, setQty] = useState<any>('10');
    const [openingStock, setOpeningStock] = useState<any>('10');
    const [incomingStocks, setIncomingStocks] = useState<any>('0');
    const [stockUsed, setStockUsed] = useState<any>('0');
    const [notes, setNotes] = useState('');

    // Filter controls
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

    // Lightbox Zoom modal state
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; title: string } | null>(null);

    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [headerConfig, setHeaderConfig] = useState<ErpHeaderConfig>(() => {
      try {
        const saved = localStorage.getItem('mfi_erp_header_materials');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return {
        companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
        regNo: 'MFI-2026',
        deptName: 'LOGISTICS & PACKAGING DEPT',
        formTitle: 'PACKAGING MATERIALS OPENING FORM',
        subtitle: 'Insert or update cargo packaging options & stock balances.',
        userId: 'ADMIN',
      };
    });

    useEffect(() => {
      localStorage.setItem('MFI_PACK_MATERIALS_EXCEL_V3', JSON.stringify(materials));
    }, [materials]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhoto(reader.result);
            triggerToast('Packaging photo compressed & loaded.');
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleOpenCreateForm = () => {
      setEditingSn(null);
      setCategory('BOXES & CARTONS');
      setDescription('');
      setSize('');
      setModelNo('');
      setMake('');
      setPhoto('preset_handling');
      setUnit('PCS');
      setQty('100');
      setOpeningStock('100');
      setIncomingStocks('0');
      setStockUsed('0');
      setNotes('');
      setFormOpen(true);
    };

    const handleNewButtonClick = () => {
      handleOpenCreateForm();
    };

    const handleToggleForm = () => {
      handleOpenCreateForm();
    };

    const handleEditClick = (item: any) => {
      setEditingSn(item.sn);
      setCategory(item.category);
      setDescription(item.description);
      setSize(item.size);
      setModelNo(item.modelNo);
      setMake(item.make);
      setPhoto(item.photo);
      setUnit(item.unit);
      setQty(String(item.qty || 0));
      setOpeningStock(String(item.openingStock !== undefined ? item.openingStock : (item.qty || 0)));
      setIncomingStocks(String(item.incomingStocks !== undefined ? item.incomingStocks : 0));
      setStockUsed(String(item.stockUsed !== undefined ? item.stockUsed : 0));
      setNotes(item.notes);
      setFormOpen(true);
    };

    const handleDeleteClick = (sn: number) => {
      const revised = materials
        .filter(m => m.sn !== sn)
        .map((m, idx) => ({ ...m, sn: idx + 1 }));
      setMaterials(revised);
      localStorage.setItem('MFI_PACK_MATERIALS_EXCEL_V3', JSON.stringify(revised));
      if (editingSn === sn) {
        setEditingSn(null);
        setFormOpen(false);
      }
      triggerToast(`Packaging Material row #${sn} removed successfully.`);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!description.trim()) {
        alert('Please fill out the material description.');
        return;
      }

      const opVal = Number(openingStock);
      const incVal = Number(incomingStocks);
      const usdVal = Number(stockUsed);
      const computedBalance = Math.max(0, opVal + incVal - usdVal);

      if (editingSn !== null) {
        const updated = materials.map(m => {
          if (m.sn === editingSn) {
            return {
              ...m,
              category,
              description: description.trim(),
              size: size.trim() || '—',
              modelNo: modelNo.trim() || '—',
              make: make.trim() || '—',
              photo,
              unit: unit.toUpperCase(),
              qty: computedBalance,
              openingStock: opVal,
              incomingStocks: incVal,
              stockUsed: usdVal,
              balanceQty: computedBalance,
              notes: notes.trim() || '—'
            };
          }
          return m;
        });
        setMaterials(updated);
        localStorage.setItem('MFI_PACK_MATERIALS_EXCEL_V3', JSON.stringify(updated));
        triggerToast(`Logistics row S.N ${editingSn} updated successfully.`);
      } else {
        const nextSn = materials.length > 0 ? Math.max(...materials.map(m => m.sn)) + 1 : 1;
        const newMaterial = {
          sn: nextSn,
          category,
          description: description.trim(),
          size: size.trim() || '—',
          modelNo: modelNo.trim() || '—',
          make: make.trim() || '—',
          photo,
          unit: unit.toUpperCase(),
          qty: computedBalance,
          openingStock: opVal,
          incomingStocks: incVal,
          stockUsed: usdVal,
          balanceQty: computedBalance,
          notes: notes.trim() || '—'
        };
        const updated = [...materials, newMaterial];
        setMaterials(updated);
        localStorage.setItem('MFI_PACK_MATERIALS_EXCEL_V3', JSON.stringify(updated));
        triggerToast('New Packaging Material successfully registered!');
      }

      // Reset fields to ready state for next entry while keeping form open & stable
      setEditingSn(null);
      setCategory('BOXES & CARTONS');
      setDescription('');
      setSize('');
      setModelNo('');
      setMake('');
      setPhoto('preset_handling');
      setUnit('PCS');
      setQty('100');
      setOpeningStock('100');
      setIncomingStocks('0');
      setStockUsed('0');
      setNotes('');
      setFormOpen(true);
    };

    const MaterialPhotoComponent = ({ path, title, sizeCss = "10" }: { path: string; title: string; sizeCss?: string }) => {
      const isCustomImage = path && (path.startsWith('data:image/') || path.startsWith('http://') || path.startsWith('https://'));
      const numSize = Number(sizeCss) || 10;
      const isLarge = numSize > 12;
      const boxDimensions = isLarge ? (numSize > 30 ? "w-56 h-36" : "w-24 h-16") : "w-full h-10";

      if (isCustomImage) {
        return (
          <img
            src={path}
            alt={title}
            className={`${boxDimensions} object-contain rounded border border-slate-300 shadow-2xs bg-slate-100 cursor-zoom-in hover:scale-105 transition-transform mx-auto max-w-full`}
            onClick={() => setLightboxMedia({ url: path, title })}
            referrerPolicy="no-referrer"
          />
        );
      }

      const renderVector = () => {
        switch (path) {
          case 'preset_power':
            return (
              <svg className="w-full h-full text-[#f37021]" viewBox="0 0 100 100" fill="currentColor">
                <rect x="25" y="25" width="50" height="40" rx="3" fill="#1e293b" />
                <rect x="35" y="15" width="30" height="10" rx="1" fill="#475569" />
                <circle cx="50" cy="45" r="10" fill="#f37021" />
                <line x1="10" y1="45" x2="90" y2="45" stroke="#ea580c" strokeWidth="6" />
              </svg>
            );
          case 'preset_hand':
            return (
              <svg className="w-full h-full text-slate-400" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="55" r="30" fill="#334155" />
                <circle cx="50" cy="55" r="15" fill="#f8fafc" />
                <rect x="42" y="15" width="16" height="35" fill="#64748b" rx="2" />
                <rect x="30" y="10" width="40" height="8" fill="#1e293b" rx="2" />
              </svg>
            );
          case 'preset_handling':
            return (
              <svg className="w-full h-full text-amber-605" viewBox="0 0 100 100" fill="currentColor">
                <polygon points="50,15 90,30 90,70 50,85 10,70 10,30" fill="#1e293b" stroke="#f37021" strokeWidth="2" />
                <polygon points="50,15 90,30 50,45 10,30" fill="#334155" />
                <line x1="50" y1="45" x2="50" y2="85" stroke="#f37021" strokeWidth="2" />
              </svg>
            );
          case 'preset_safety':
            return (
              <svg className="w-full h-full text-emerald-600" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="70" width="80" height="15" fill="#64748b" rx="1" />
                <rect x="15" y="25" width="8" height="45" fill="#334155" />
                <rect x="46" y="25" width="8" height="45" fill="#334155" />
                <rect x="77" y="25" width="8" height="45" fill="#334155" />
                <rect x="5" y="20" width="90" height="8" fill="#1e293b" rx="0.5" />
                <rect x="5" y="45" width="90" height="8" fill="#1e293b" rx="0.5" />
              </svg>
            );
          case 'preset_cutting':
            return (
              <svg className="w-full h-full text-[#ed8936]" viewBox="0 0 100 100" fill="currentColor">
                <rect x="20" y="20" width="60" height="60" rx="5" fill="#1e293b" />
                <line x1="30" y1="30" x2="70" y2="75" stroke="#ed8936" strokeWidth="4" />
                <line x1="70" y1="35" x2="30" y2="70" stroke="#f37021" strokeWidth="2" />
              </svg>
            );
          case 'preset_measuring':
            return (
              <svg className="w-full h-full text-pink-500" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" fill="#334155" />
                <circle cx="50" cy="50" r="22" fill="#1e293b" />
                <line x1="50" y1="50" x2="80" y2="50" stroke="#f37021" strokeWidth="3" />
              </svg>
            );
          case 'preset_machine':
            return (
              <svg className="w-full h-full text-sky-500" viewBox="0 0 100 100" fill="currentColor">
                <rect x="15" y="35" width="70" height="30" rx="2" fill="#1e293b" />
                <circle cx="25" cy="50" r="8" fill="#0284c7" />
                <circle cx="75" cy="50" r="8" fill="#0284c7" />
                <line x1="40" y1="50" x2="60" y2="50" stroke="#f37021" strokeWidth="4" />
              </svg>
            );
          case 'preset_hydraulic':
            return (
              <svg className="w-full h-full text-indigo-400" viewBox="0 0 100 100" fill="currentColor">
                <rect x="25" y="15" width="50" height="70" rx="5" fill="#334155" />
                <ellipse cx="50" cy="22" rx="25" ry="6" fill="#111827" />
                <line x1="25" y1="45" x2="75" y2="45" stroke="#f37021" strokeWidth="3" />
                <line x1="25" y1="70" x2="75" y2="70" stroke="#f37021" strokeWidth="2" />
              </svg>
            );
          default:
            return (
              <svg className="w-full h-full text-[#ea580c]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                <circle cx="50" cy="50" r="30" stroke="#f37021" strokeWidth="6" />
                <path d="M50 20 L90 20" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                <circle cx="50" cy="50" r="10" fill="#334155" />
              </svg>
            );
        }
      };

      return (
        <div
          onClick={() => setLightboxMedia({ url: path, title })}
          className={`${boxDimensions} p-0.5 rounded border border-slate-300 bg-slate-900 shadow-2xs cursor-zoom-in hover:bg-slate-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center mx-auto shrink-0 overflow-hidden`}
          title="Zoom Spec Outline"
        >
          {renderVector()}
        </div>
      );
    };

    const filteredMaterials = useMemo(() => {
      return materials.filter(m => {
        const matchesCategory = activeCategoryFilter === 'ALL' || (m.category || '').toUpperCase() === activeCategoryFilter.toUpperCase();
        const str = `${m.description || ''} ${m.size || ''} ${m.category || ''} ${m.modelNo || ''} ${m.make || ''} ${m.notes || ''}`.toUpperCase();
        const matchesQuery = str.includes(searchQuery.toUpperCase());
        return matchesCategory && matchesQuery;
      });
    }, [materials, activeCategoryFilter, searchQuery]);

    const totalMaterialsCount = materials.length;
    const totalMaterialsQty = materials.reduce((sum, m) => {
      const op = m.openingStock !== undefined ? Number(m.openingStock) : Number(m.qty || 0);
      const inc = m.incomingStocks !== undefined ? m.incomingStocks : 0;
      const usd = m.stockUsed !== undefined ? m.stockUsed : 0;
      return sum + (op + inc - usd);
    }, 0);

    const uniqueBrandsCount = new Set(materials.map(m => (m.make || '').toUpperCase()).filter(Boolean)).size;

    // Trigger structured PDF export using printHtml helper
    const printMasterMaterialsLedger = () => {
      const ITEMS_PER_PAGE = 22;
      const totalPages = Math.max(1, Math.ceil(materials.length / ITEMS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageMaterials = materials.slice(pIdx * ITEMS_PER_PAGE, (pIdx + 1) * ITEMS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageMaterials, isLastPage, startIdx: pIdx * ITEMS_PER_PAGE };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Packaging Materials Master Ledger</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 10mm 15mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 10px; font-size: 10px; line-height: 1.3; }
            
            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; page-break-inside: avoid; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; page-break-inside: avoid; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              thead { display: table-header-group !important; }
              tfoot { display: table-footer-group !important; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table thead tr { page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: avoid !important; break-after: avoid !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <table class="report-table">
                <thead>
                  <tr class="header-repeat-row">
                    <td colspan="10" style="border: none !important; padding: 0 0 10px 0 !important; background: #ffffff !important;">
                      <div class="top-meta-bar">
                        <div class="org-left">
                          <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                          <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                        </div>
                        <div class="doc-center">
                          <div class="doc-title">${headerConfig.formTitle.toUpperCase()}</div>
                        </div>
                        <div class="meta-right">
                          <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                          <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                          <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th class="left" style="width: 22%;">Description of Material</th>
                    <th style="width: 10%;">Size Spec</th>
                    <th class="left" style="width: 14%;">Category</th>
                    <th style="width: 6%;">UOM</th>
                    <th style="width: 7%;">Opening</th>
                    <th style="width: 7%;">Incoming</th>
                    <th style="width: 7%;">Stock Used</th>
                    <th class="right" style="width: 9%;">Balance Qty</th>
                    <th class="left" style="width: 14%;">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.pageMaterials.map((m, idx) => {
                    const op = m.openingStock !== undefined ? m.openingStock : (m.qty || 0);
                    const inc = m.incomingStocks !== undefined ? m.incomingStocks : 0;
                    const usd = m.stockUsed !== undefined ? m.stockUsed : 0;
                    const bal = m.balanceQty !== undefined ? m.balanceQty : (op + inc - usd);

                    return `
                      <tr>
                        <td>${p.startIdx + idx + 1}</td>
                        <td class="left" style="font-weight: bold;">${m.description.toUpperCase()}</td>
                        <td style="font-weight: bold; color: #000;">${(m.size || 'N/A').toUpperCase()}</td>
                        <td class="left">${(m.category || 'PACKAGING').toUpperCase()}</td>
                        <td>${m.unit || 'PCS'}</td>
                        <td>${op}</td>
                        <td>${inc}</td>
                        <td>${usd}</td>
                        <td class="right" style="font-weight: bold;">${bal}</td>
                        <td class="left">${(m.notes || '—').toUpperCase()}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${p.isLastPage ? `
                    <tr class="total-summary-row">
                      <td colspan="4" class="left"><strong>Doc Count: ${materials.length} Line Items</strong></td>
                      <td><strong>PCS</strong></td>
                      <td><strong>${materials.reduce((s, m) => s + (m.openingStock || m.qty || 0), 0)}</strong></td>
                      <td><strong>${materials.reduce((s, m) => s + (m.incomingStocks || 0), 0)}</strong></td>
                      <td><strong>${materials.reduce((s, m) => s + (m.stockUsed || 0), 0)}</strong></td>
                      <td class="right"><strong>Total Balance : ${totalMaterialsQty.toLocaleString()}</strong></td>
                      <td></td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Categories</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Category Code</th>
                        <th>UOM</th>
                        <th>Total Items</th>
                        <th class="right">Total Stock Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${PACKAGING_CATEGORIES.map(cat => {
                        const catMats = materials.filter(m => (m.category || '').toUpperCase() === cat.toUpperCase());
                        if (catMats.length === 0) return '';
                        const catQty = catMats.reduce((s, m) => s + (m.balanceQty !== undefined ? m.balanceQty : ((m.openingStock || m.qty || 0) + (m.incomingStocks || 0) - (m.stockUsed || 0))), 0);
                        return `
                          <tr>
                            <td class="left" style="font-weight: bold;">${cat.toUpperCase()}</td>
                            <td>PCS</td>
                            <td>${catMats.length}</td>
                            <td class="right" style="font-weight: bold;">${catQty.toLocaleString()}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>PCS</td>
                        <td>${materials.length}</td>
                        <td class="right">${totalMaterialsQty.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Packaging_Materials_Master_Ledger');
    };

    const printCategoryWiseMaterialsLedger = () => {
      const groupedData = PACKAGING_CATEGORIES.map(cat => {
        const catMats = materials.filter(m => (m.category || '').toUpperCase() === cat.toUpperCase());
        const catSum = catMats.reduce((acc, m) => {
          const op = m.openingStock !== undefined ? Number(m.openingStock) : Number(m.qty || 0);
          const inc = m.incomingStocks !== undefined ? m.incomingStocks : 0;
          const usd = m.stockUsed !== undefined ? m.stockUsed : 0;
          return acc + (op + inc - usd);
        }, 0);
        return { cat, list: catMats, qty: catSum };
      }).filter(group => group.list.length > 0);

      const CATS_PER_PAGE = 3;
      const totalPages = Math.max(1, Math.ceil(groupedData.length / CATS_PER_PAGE));
      const overallMaterialsQuantity = groupedData.reduce((acc, g) => acc + g.qty, 0);
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageGroups = groupedData.slice(pIdx * CATS_PER_PAGE, (pIdx + 1) * CATS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageGroups, isLastPage };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Category-Wise Packaging Materials Listing</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 0; font-size: 10px; line-height: 1.3; }
            
            .report-page { page-break-after: always; break-after: page; padding: 10px; }
            .report-page:last-child { page-break-after: avoid; break-after: avoid; }

            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .category-section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1px solid #000; padding: 5px 8px; margin-top: 15px; background: #f8fafc; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              .category-section-block { margin-bottom: 12px; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <div class="top-meta-bar">
                <div class="org-left">
                  <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                  <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                </div>
                <div class="doc-center">
                  <div class="doc-title">${headerConfig.formTitle.toUpperCase()} (CATEGORY WISE)</div>
                </div>
                <div class="meta-right">
                  <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                  <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                  <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                </div>
              </div>

              ${p.pageGroups.map(group => `
                <div class="category-section-block">
                  <table class="report-table">
                    <thead>
                      <tr class="cat-header-repeat-row">
                        <th colspan="9" class="left" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1.5px solid #000; padding: 6px 8px; background: #f8fafc; color: #000;">
                          CATEGORY : ${group.cat.toUpperCase()} (${group.list.length} ITEMS)
                        </th>
                      </tr>
                      <tr class="col-header-row">
                        <th style="width: 5%;">S.N</th>
                        <th class="left" style="width: 25%;">Description of Material</th>
                        <th style="width: 12%;">Size Spec</th>
                        <th style="width: 8%;">UOM</th>
                        <th style="width: 8%;">Opening</th>
                        <th style="width: 8%;">Incoming</th>
                        <th style="width: 8%;">Used</th>
                        <th class="right" style="width: 11%;">Balance Qty</th>
                        <th class="left" style="width: 15%;">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${group.list.map((item, idx) => {
                        const op = item.openingStock !== undefined ? item.openingStock : (item.qty || 0);
                        const inc = item.incomingStocks !== undefined ? item.incomingStocks : 0;
                        const usd = item.stockUsed !== undefined ? item.stockUsed : 0;
                        const bal = item.balanceQty !== undefined ? item.balanceQty : (op + inc - usd);
                        return `
                          <tr>
                            <td>${idx + 1}</td>
                            <td class="left" style="font-weight: bold;">${item.description.toUpperCase()}</td>
                            <td style="font-weight: bold;">${(item.size || 'N/A').toUpperCase()}</td>
                            <td>${item.unit || 'PCS'}</td>
                            <td>${op}</td>
                            <td>${inc}</td>
                            <td>${usd}</td>
                            <td class="right" style="font-weight: bold;">${bal}</td>
                            <td class="left">${(item.notes || '—').toUpperCase()}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="font-weight: bold; background: #f8fafc;">
                        <td colspan="3" class="left">Sub-Total for ${group.cat.toUpperCase()}</td>
                        <td>PCS</td>
                        <td>${group.list.reduce((s, m) => s + (m.openingStock || m.qty || 0), 0)}</td>
                        <td>${group.list.reduce((s, m) => s + (m.incomingStocks || 0), 0)}</td>
                        <td>${group.list.reduce((s, m) => s + (m.stockUsed || 0), 0)}</td>
                        <td class="right">${group.qty.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              `).join('')}

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Items</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Category Code</th>
                        <th>UOM</th>
                        <th>Qty Items</th>
                        <th class="right">Total Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${groupedData.map(group => `
                        <tr>
                          <td class="left" style="font-weight: bold;">${group.cat.toUpperCase()}</td>
                          <td>PCS</td>
                          <td>${group.list.length}</td>
                          <td class="right" style="font-weight: bold;">${group.qty.toLocaleString()}</td>
                        </tr>
                      `).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>PCS</td>
                        <td>${materials.length}</td>
                        <td class="right">${overallMaterialsQuantity.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Packaging_Materials_Category_Wise_Ledger');
    };

    return (
      <div className="space-y-6 font-mono text-[11px] select-none">
        
        {/* Mobile Header Block exactly from 2ND PAGE drawing */}
        <div className="block md:hidden bg-white border border-slate-200 p-4 rounded-xl shadow-xs text-center space-y-3">
          <div className="space-y-1">
            <h2 className="font-sans text-xs font-bold text-slate-900 tracking-tight leading-none uppercase">
              MARINE FASTENERS INDUSTRIES LLC
            </h2>
            <p className="font-sans text-[7px] text-slate-500 font-bold tracking-tight">
              Manufacturer & Supplier of Fasteners, Fittings & Fixing Accessories
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div
              className="flex items-center gap-2 bg-white border border-slate-250 p-2 rounded-xl shadow-3xs select-none shrink-0"
            >
              <div className="w-7 h-7 rounded-full bg-orange-105 bg-orange-50 flex items-center justify-center border border-orange-200 shrink-0">
                <Clock className="w-4 h-4 text-[#f37021]" />
              </div>
              <div className="text-left font-sans text-[8.5px] font-bold uppercase text-slate-850 leading-none">
                PACKAGING
                <span className="block text-[#f37021] text-[8px] font-bold mt-0.5">MATRL</span>
              </div>
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 bg-white border border-slate-300 font-sans p-1.5 text-[10px] outline-none rounded-xl font-bold uppercase placeholder-slate-400 h-8 text-slate-900 focus:border-[#f37021]"
              />
            </div>
          </div>
        </div>

        {/* Image 1 & Image 2 Action Bar */}
        <ErpActionBar
          title="LOGISTICS & PACKAGING REGISTER"
          subtitle="Manage and print certified warehouse shipment crates, packaging, and strap bands registers."
          onNew={handleOpenCreateForm}
          onToggleNew={handleToggleForm}
          onWipe={() => {
            if (editingSn !== null) {
              handleDeleteClick(editingSn);
            } else if (materials.length > 0) {
              const lastSn = materials[materials.length - 1].sn;
              handleDeleteClick(lastSn);
            } else {
              triggerToast("No packaging material rows to delete.");
            }
          }}
          onPrintMaster={printMasterMaterialsLedger}
          onPrintSplit={printCategoryWiseMaterialsLedger}
          appendLabel="INSERT MATERIAL ROW"
          onEditHeader={() => setIsEditHeaderOpen(true)}
        />

        {/* Search controls & Category dropdown */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by description, specification, suppliers, or model codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 bg-white border border-slate-300 p-2 text-[11px] focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-2xs">
              <span className="text-[10px] text-[#0a2342] font-extrabold uppercase font-sans whitespace-nowrap">
                CATEGORY:
              </span>
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="bg-white border border-[#0a2342] text-[#0a2342] px-2 py-1 rounded font-extrabold text-[11px] outline-none cursor-pointer hover:border-[#f37021] transition-colors uppercase font-sans max-w-[280px]"
              >
                <option value="ALL">ALL ITEMS ({totalMaterialsCount})</option>
                {PACKAGING_CATEGORIES.map(categoryName => {
                  const occurrences = materials.filter(m => (m.category || '').toUpperCase() === categoryName.toUpperCase()).length;
                  return (
                    <option key={categoryName} value={categoryName}>
                      {categoryName} ({occurrences})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Active filter:</span>
            <span className="bg-sky-50 text-sky-850 px-2.5 py-1 rounded border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
              {activeCategoryFilter === 'ALL' ? 'ALL LOGISTICS CATEGORIES' : `${activeCategoryFilter}`}
            </span>
            {searchQuery || activeCategoryFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('ALL');
                }}
                className="text-[9.5px] text-[#f37021] hover:underline uppercase font-bold ml-1"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {/* CRUD Overlay / inline form identical to Punching Stamp */}
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="bg-sky-50/50 border-2 border-sky-200 p-5 rounded-xl shadow-md space-y-4 animate-fade-in text-[11px] w-full max-w-full"
          >
            <OpeningFormHeader
              headerConfig={headerConfig}
              deptName="LOGISTICS & PACKAGING DEPT"
              formTitle="PACKAGING MATERIALS OPENING FORM"
              subtitle="Insert or update cargo packaging options & stock balances."
              editingSn={editingSn}
              onClose={() => setFormOpen(false)}
              onEditHeader={() => setIsEditHeaderOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Material Category *</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        // Auto-assign corresponding graphics presets
                        if (e.target.value === 'POWER STRAPPING TOOLS') setPhoto('preset_power');
                        if (e.target.value === 'HAND DISPENSERS') setPhoto('preset_hand');
                        if (e.target.value === 'BOXES & CARTONS') setPhoto('preset_handling');
                        if (e.target.value === 'WOODEN CRATES / PALLETS') setPhoto('preset_safety');
                        if (e.target.value === 'STRETCH WRAPS & FILMS') setPhoto('preset_cutting');
                        if (e.target.value === 'LABELS & ADHESIVE TAPES') setPhoto('preset_measuring');
                        if (e.target.value === 'THREAD PROTECTORS & BOLT CAPS') setPhoto('preset_machine');
                        if (e.target.value === 'DRUMS & PP BAGS') setPhoto('preset_hydraulic');
                      }}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans"
                    >
                      {PACKAGING_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Size Specification (E.g. 500MM X 50M)</label>
                    <input
                      type="text"
                      placeholder="e.g. 300X200X120MM, 12MM STRAPPING"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">MATERIAL DESCRIPTION *</label>
                    <input
                      type="text"
                      placeholder="e.g. PET STRAPPING REEL HIGH TORQUE"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                      required
                    />
                  </div>

                  <div className="bg-slate-100/60 p-2 rounded border border-slate-200">
                    <span className="block text-[8px] text-slate-500 uppercase font-bold mb-1 font-sans">
                      STOCK ACCOUNTS REGISTER (REAL-TIME BALANCE)
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">OPEN</label>
                        <input
                          type="number"
                          value={openingStock}
                          onChange={(e) => setOpeningStock(e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">INCOMING</label>
                        <input
                          type="number"
                          value={incomingStocks}
                          onChange={(e) => setIncomingStocks(e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">USED</label>
                        <input
                          type="number"
                          value={stockUsed}
                          onChange={(e) => setStockUsed(e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-[#f37021] uppercase font-semibold text-center leading-none mb-1">BALANCE</label>
                        <div className="w-full text-center p-1 text-[9.5px] font-sans font-bold bg-amber-50 border border-amber-300 rounded text-amber-800 h-[22px] flex items-center justify-center">
                          {Math.max(0, (Number(openingStock) || 0) + (Number(incomingStocks) || 0) - (Number(stockUsed) || 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Model No</label>
                      <input
                        type="text"
                        placeholder="e.g. CTN-HEX-25"
                        value={modelNo}
                        onChange={(e) => setModelNo(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Supplying Brand</label>
                      <input
                        type="text"
                        placeholder="e.g. SIGNODE CORP"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Unit</label>
                      <input
                        type="text"
                        placeholder="PCS or ROLL"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">File specifications upload</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="w-full bg-white border border-slate-300 p-1 text-[9px] focus:border-[#f37021] outline-none rounded font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Remarks / Supply Quality & Shipment Clearance Controls</label>
                  <textarea
                    rows={2}
                    placeholder="Enter compliance rules, heavy lifting strength, and packing lines usage notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                  />
                </div>
              </div>

              {/* Layout Visual switchers */}
              <div className="md:col-span-4 bg-sky-100/40 p-3.5 border border-sky-200 rounded-lg space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="block text-[7.5px] text-slate-600 uppercase font-bold font-sans leading-none">PACKAGING SCHEMATIC PREVIEW</span>
                  
                  <div className="flex items-center gap-2.5 bg-white p-2.5 border border-sky-200 rounded">
                    <MaterialPhotoComponent path={photo} title="Schematic preview" sizeCss="12" />
                    <div className="truncate">
                      <span className="text-[7.5px] text-slate-400 uppercase font-bold block">Layout preset:</span>
                      <span className="text-[10px] text-indigo-900 font-bold truncate block uppercase font-sans">
                        {photo.startsWith('data:image/') ? 'Custom graphic uploaded' : `${photo.replace('preset_', '').replace('_', ' ')}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-sky-200">
                    <span className="text-[7.5px] block text-slate-500 font-bold uppercase mb-1.5">Switch Standard Presets:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[8.5px]">
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_power')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_power' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        STRAP TOOL
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_hand')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_hand' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        HAND DISP.
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_handling')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_handling' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        CARTONS
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_safety')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_safety' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        WOOD CRATES
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_cutting')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_cutting' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        SHRINK WRAP
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_measuring')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_measuring' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        TAPES
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_machine')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_machine' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        BOLT CAPS
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_hydraulic')}
                        className={`p-1.5 rounded font-sans font-bold border text-center text-[8.5px] cursor-pointer transition-colors leading-none ${
                          photo === 'preset_hydraulic' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        DRUMS
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-sky-200 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 text-white hover:bg-emerald-600 transition-colors p-2 rounded font-sans font-semibold uppercase text-[9.5px] tracking-wide cursor-pointer"
                  >
                    Commit Row
                  </button>
                  {editingSn !== null && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(editingSn)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9.5px] uppercase p-2 transition-all rounded shadow cursor-pointer flex items-center justify-center gap-1 font-sans"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Row
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingSn(null);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 transition-colors p-2 text-slate-800 rounded font-sans font-bold uppercase text-[9px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Excel layout display */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Full Version */}
          <div className="hidden md:block overflow-x-auto scroll-smooth overspray-x-contain touch-pan-x box-shaped bg-white select-none">
            <table className="box-shaped-table w-full text-left font-sans text-[10px] uppercase table-fixed min-w-[1150px] max-w-full">
              <colgroup>
                <col className="w-[45px]" />
                <col className="w-[140px]" />
                <col className="w-[85px]" />
                <col className="w-[180px]" />
                <col className="w-[70px]" />
                <col className="w-[50px]" />
                <col className="w-[70px]" />
                <col className="w-[70px]" />
                <col className="w-[70px]" />
                <col className="w-[80px]" />
                <col className="w-[170px]" />
                <col className="w-[90px]" />
              </colgroup>
              <thead>
                <tr className="bg-[#0d233a] text-white border-b border-slate-700 select-none text-center h-7 text-[10px] uppercase font-bold tracking-wider divide-x divide-slate-700">
                  <th className="p-0.5 text-center">S.N</th>
                  <th className="p-0.5 text-left pl-2">PACKAGING CATEGORIES</th>
                  <th className="p-0.5 text-center">SIZE SPEC</th>
                  <th className="p-0.5 text-left pl-2">DESCRIPTION</th>
                  <th className="p-0.5 text-center">PHOTO</th>
                  <th className="p-0.5 text-center">UNIT</th>
                  <th className="p-0.5 text-center">OPEN STOCK</th>
                  <th className="p-0.5 text-center">INCOMING</th>
                  <th className="p-0.5 text-center">STOCK USED</th>
                  <th className="p-0.5 text-center text-amber-300">BALANCE QTY</th>
                  <th className="p-0.5 text-left pl-2">NOTES / BRAND</th>
                  <th className="p-0.5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[10.5px]">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-10 text-center text-slate-500 italic bg-slate-50 font-sans">
                      No matching packaging material records found for criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map(m => {
                    const op = m.openingStock !== undefined ? Number(m.openingStock) : Number(m.qty || 0);
                    const inc = m.incomingStocks !== undefined ? m.incomingStocks : 0;
                    const usd = m.stockUsed !== undefined ? m.stockUsed : 0;
                    const balance = m.balanceQty !== undefined ? m.balanceQty : (op + inc - usd);

                    return (
                      <tr 
                        key={m.sn} 
                        className="divide-x divide-slate-300 h-6.5 hover:bg-slate-50 transition-colors group bg-white"
                      >
                        {/* S.N */}
                        <td className="p-1 text-center font-bold text-slate-800 bg-slate-50/30">
                          {m.sn}
                        </td>

                        {/* CATEGORY */}
                        <td className="p-1 pl-3 text-left font-sans">
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                            m.category.includes('POWER') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            m.category.includes('HAND') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            m.category.includes('BOXES') ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            m.category.includes('WOOD') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {m.category}
                          </span>
                        </td>

                        {/* SIZE SPEC */}
                        <td className="p-1 text-center font-mono font-bold text-rose-700">
                          {m.size || '—'}
                        </td>

                        {/* DESCRIPTION */}
                        <td className="p-1 pl-3 text-left font-sans font-bold text-slate-900 leading-tight">
                          <div>{m.description}</div>
                          {m.modelNo && (
                            <div className="text-[7.5px] text-slate-400 font-mono font-normal">Model: {m.modelNo}</div>
                          )}
                        </td>

                        {/* PHOTO */}
                        <td className="p-1 text-center">
                          <div className="flex justify-center items-center">
                            <MaterialPhotoComponent path={m.photo} title={`${m.category} specification`} sizeCss="9" />
                          </div>
                        </td>

                        {/* UNIT */}
                        <td className="p-1 text-center font-bold text-slate-500">
                          {m.unit}
                        </td>

                        {/* OPENING STOCK */}
                        <td className="p-1 text-center font-mono font-semibold text-slate-700">
                          {op.toLocaleString()}
                        </td>

                        {/* INCOMING STOCKS */}
                        <td className="p-1 text-center font-mono font-semibold text-slate-700">
                          {inc.toLocaleString()}
                        </td>

                        {/* STOCK USED */}
                        <td className="p-1 text-center font-mono font-semibold text-rose-650">
                          {usd.toLocaleString()}
                        </td>

                        {/* BALANCE QTY */}
                        <td className="p-1 text-center font-mono font-bold bg-amber-50/40 text-amber-900">
                          {balance.toLocaleString()}
                        </td>

                        {/* NOTES / BRAND */}
                        <td className="p-1 pl-3 text-left font-sans text-[10px] leading-snug col-notes select-text normal-case">
                          <div><strong>Brand:</strong> {m.make || '—'}</div>
                          {m.notes && <div className="text-slate-400 mt-0.5 truncate max-w-[160px]" title={m.notes}>{m.notes}</div>}
                        </td>

                        {/* ACTIONS */}
                        <td className="p-1 text-center bg-white group-hover:bg-slate-50">
                          <div className="flex items-center justify-center gap-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => handleEditClick(m)}
                              className="p-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Edit row details"
                            >
                              <Edit className="w-4 h-4 shrink-0 text-slate-700 hover:text-sky-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(m.sn)}
                              className="p-1 rounded border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Permanently remove row"
                            >
                              <Trash2 className="w-4 h-4 shrink-0 text-red-600 hover:text-red-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <FocusErpPaginationFooter
              totalItems={filteredMaterials.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Mobile Simplified Version */}
          <div className="block md:hidden overflow-x-auto">
            <table className="w-full text-left border-collapse text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-250 select-none">
                  <th className="p-2 border-r border-slate-200 text-center text-[10px] w-[14%]">S.L NO</th>
                  <th className="p-2 border-r border-slate-200 text-left text-[10px] w-[46%]">DESCRIPTION</th>
                  <th className="p-2 border-r border-slate-200 text-center text-[10px] w-[20%]">SIZE</th>
                  <th className="p-2 text-center text-[10px] text-[#f37021] w-[20%]">BALANCE QTY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono font-bold">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 uppercase italic font-sans text-[10px]">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map(m => {
                    const op = m.openingStock !== undefined ? Number(m.openingStock) : Number(m.qty || 0);
                    const inc = m.incomingStocks !== undefined ? m.incomingStocks : 0;
                    const usd = m.stockUsed !== undefined ? m.stockUsed : 0;
                    const balance = m.balanceQty !== undefined ? m.balanceQty : (op + inc - usd);

                    return (
                      <tr key={m.sn} className="hover:bg-amber-50/30 transition-colors align-middle">
                        <td className="p-2 border-r text-center font-bold text-slate-800 bg-slate-50/50">
                          {m.sn}
                        </td>
                        <td className="p-2 border-r font-bold text-slate-900 font-sans tracking-wide uppercase leading-tight">
                          {m.description}
                          <div className="text-[7.5px] text-slate-400 font-mono mt-0.5 normal-case font-normal">
                            {m.category}
                          </div>
                        </td>
                        <td className="p-2 border-r text-center font-bold text-rose-600 uppercase text-[10px]">
                          {m.size}
                        </td>
                        <td className="p-2 text-center font-sans font-bold text-[11px] text-[#f37021] bg-amber-50/50">
                          {balance.toLocaleString()}
                          <span className="text-[7px] text-slate-400 font-mono font-normal block">
                            {m.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="hidden md:flex bg-slate-50 p-3.5 border-t border-slate-200 justify-between items-center text-slate-500 text-[10px] font-bold">
            <span className="uppercase">
              Showing {filteredMaterials.length} of {totalMaterialsCount} Materials registered
            </span>
            <span className="uppercase text-slate-900 font-bold">
              Cumulative balance items in stock: {filteredMaterials.reduce((s, x) => {
                const op = x.openingStock !== undefined ? Number(x.openingStock) : Number(x.qty || 0);
                const inc = x.incomingStocks !== undefined ? x.incomingStocks : 0;
                const usd = x.stockUsed !== undefined ? x.stockUsed : 0;
                return s + (op + inc - usd);
              }, 0).toLocaleString()} {filteredMaterials[0]?.unit || 'Units'}
            </span>
          </div>
        </div>

        {/* Photo Lightbox Dialog Modal */}
        {lightboxMedia && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur z-[9999] flex items-center justify-center p-4"
            onClick={() => setLightboxMedia(null)}
          >
            <div
              className="bg-slate-900 rounded-2xl max-w-lg w-full p-4 border border-slate-800 text-white relative flex flex-col items-center gap-3 animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full flex justify-between items-center">
                <span className="font-sans font-bold text-slate-200 uppercase text-xs">
                  {lightboxMedia.title}
                </span>
                <button
                  onClick={() => setLightboxMedia(null)}
                  className="p-1 text-slate-400 hover:text-white font-sans text-xs uppercase font-bold cursor-pointer"
                >
                  ✖
                </button>
              </div>

              <div className="w-52 h-52 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-md flex items-center justify-center select-none">
                <MaterialPhotoComponent path={lightboxMedia.url} title={lightboxMedia.title} sizeCss="44" />
              </div>
            </div>
          </div>
        )}

        <ErpEditHeaderModal
          isOpen={isEditHeaderOpen}
          onClose={() => setIsEditHeaderOpen(false)}
          initialValues={headerConfig}
          defaultValues={{
            companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
            regNo: 'MFI-2026',
            deptName: 'LOGISTICS & PACKAGING DEPT',
            formTitle: 'PACKAGING MATERIALS OPENING FORM',
            subtitle: 'Insert or update cargo packaging options & stock balances.',
            userId: 'ADMIN',
          }}
          onSave={(val) => {
            setHeaderConfig(val);
            localStorage.setItem('mfi_erp_header_materials', JSON.stringify(val));
          }}
        />

      </div>
    );
  });


  export const PunchingStampListComponent = React.memo(({ triggerToast }: { triggerToast?: (msg: string) => void }) => {
    // Punching categories mentioned explicitly
    const PUNCHING_CATEGORIES = [
      'SINGLE LETTER',
      'ROUND',
      'SQUARE',
      'SMALL ROUND'
    ];

    const [stamps, setStamps] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_PUNCHING_STAMPS_EXCEL_V2');
      let loaded: any[] = [];
      if (saved) {
        try {
          loaded = JSON.parse(saved);
        } catch (e) {}
      }
      // Filter out demo/dummy data from inventory
      if (Array.isArray(loaded)) {
        loaded = loaded.filter(s => {
          const desc = String(s.description || '').toUpperCase();
          return !desc.includes("STEEL TYPE FACE INVENT LETTER") &&
                 !desc.includes("ROUND EMBOSSING DIALS") &&
                 !desc.includes("MFI LOGO ENGRAVED STEEL DIE CAP");
        });
      }
      return loaded.map(s => {
        const op = s.openingStock !== undefined ? Number(s.openingStock) : Number(s.qty || 0);
        const inc = s.incomingStocks !== undefined ? Number(s.incomingStocks) : 0;
        const used = s.stockUsed !== undefined ? Number(s.stockUsed) : 0;
        return {
          ...s,
          openingStock: op,
          incomingStocks: inc,
          stockUsed: used,
          qty: op + inc - used,
          balanceQty: op + inc - used
        };
      });
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editingSn, setEditingSn] = useState<number | null>(null);
    const lastNewClickRef = useRef<number>(0);

    // Form inputs matching Excel columns
    const [punchingType, setPunchingType] = useState('SINGLE LETTER');
    const [size, setSize] = useState('');
    const [stamp, setStamp] = useState('');
    const [photo, setPhoto] = useState('preset_single');
    const [unit, setUnit] = useState('PCS');
    const [qty, setQty] = useState<any>('10');
    const [openingStock, setOpeningStock] = useState<any>('10');
    const [incomingStocks, setIncomingStocks] = useState<any>('0');
    const [stockUsed, setStockUsed] = useState<any>('0');
    const [notes, setNotes] = useState('');

    // Filter controls
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

    // Lightbox Zoom modal state
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; title: string } | null>(null);

    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [headerConfig, setHeaderConfig] = useState<ErpHeaderConfig>(() => {
      try {
        const saved = localStorage.getItem('mfi_erp_header_punching');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return {
        companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
        regNo: 'MFI-2026',
        deptName: 'TOOLING & DIE DEPARTMENT',
        formTitle: 'PUNCHING STAMPS OPENING FORM',
        subtitle: 'Insert or update steel embossing stamp specifications & stock balances.',
        userId: 'ADMIN',
      };
    });

    useEffect(() => {
      localStorage.setItem('MFI_PUNCHING_STAMPS_EXCEL_V2', JSON.stringify(stamps));
    }, [stamps]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhoto(reader.result);
            triggerToast('Punching stamp photo parsed & loaded.');
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleOpenCreateForm = () => {
      setEditingSn(null);
      setPunchingType('SINGLE LETTER');
      setSize('');
      setStamp('');
      setPhoto('preset_single');
      setUnit('PCS');
      setQty('10');
      setOpeningStock('10');
      setIncomingStocks('0');
      setStockUsed('0');
      setNotes('');
      setFormOpen(true);
    };

    const handleNewButtonClick = () => {
      handleOpenCreateForm();
    };

    const handleToggleForm = () => {
      handleOpenCreateForm();
    };

    const handleEditClick = (item: any) => {
      setEditingSn(item.sn);
      setPunchingType(item.punchingType);
      setSize(item.size);
      setStamp(item.stamp);
      setPhoto(item.photo);
      setUnit(item.unit);
      setQty(String(item.qty || 0));
      setOpeningStock(String(item.openingStock !== undefined ? item.openingStock : (item.qty || 0)));
      setIncomingStocks(String(item.incomingStocks !== undefined ? item.incomingStocks : 0));
      setStockUsed(String(item.stockUsed !== undefined ? item.stockUsed : 0));
      setNotes(item.notes);
      setFormOpen(true);
    };

    const handleDeleteClick = (sn: number) => {
      const revised = stamps.filter(s => s.sn !== sn)
        .map((s, idx) => ({ ...s, sn: idx + 1 })); // Resequence Serial Number
      setStamps(revised);
      localStorage.setItem('MFI_PUNCHING_STAMPS_EXCEL_V2', JSON.stringify(revised));
      if (editingSn === sn) {
        setEditingSn(null);
        setFormOpen(false);
      }
      triggerToast(`Stamp record #${sn} deleted successfully.`);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const opVal = Number(openingStock);
      const incVal = Number(incomingStocks);
      const usdVal = Number(stockUsed);
      const computedBalance = Math.max(0, opVal + incVal - usdVal);
      
      if (editingSn !== null) {
        const updated = stamps.map(s => {
          if (s.sn === editingSn) {
            return {
              ...s,
              punchingType,
              size: size.trim() || '—',
              stamp: stamp.trim() || '—',
              photo,
              unit,
              qty: computedBalance,
              openingStock: opVal,
              incomingStocks: incVal,
              stockUsed: usdVal,
              balanceQty: computedBalance,
              notes: notes.trim() || '—'
            };
          }
          return s;
        });
        setStamps(updated);
        localStorage.setItem('MFI_PUNCHING_STAMPS_EXCEL_V2', JSON.stringify(updated));
        triggerToast(`Punching stamp S.N ${editingSn} updated successfully.`);
      } else {
        const nextSn = stamps.length > 0 ? Math.max(...stamps.map(s => s.sn)) + 1 : 1;
        const newStamp = {
          sn: nextSn,
          punchingType,
          size: size.trim() || '—',
          stamp: stamp.trim() || '—',
          photo,
          unit,
          qty: computedBalance,
          openingStock: opVal,
          incomingStocks: incVal,
          stockUsed: usdVal,
          balanceQty: computedBalance,
          notes: notes.trim() || '—'
        };
        const updated = [...stamps, newStamp];
        setStamps(updated);
        localStorage.setItem('MFI_PUNCHING_STAMPS_EXCEL_V2', JSON.stringify(updated));
        triggerToast('New Punching Stamp successfully registered!');
      }

      // Reset fields to ready state for next entry while keeping form open & stable
      setEditingSn(null);
      setPunchingType('SINGLE LETTER');
      setSize('');
      setStamp('');
      setPhoto('preset_single');
      setUnit('PCS');
      setQty('10');
      setOpeningStock('10');
      setIncomingStocks('0');
      setStockUsed('0');
      setNotes('');
      setFormOpen(true);
    };

    // Vector drawing components specifically for single, round, square, small round
    const StampPhotoComponent = ({ path, title, sizeCss = '10' }: { path: string; title: string; sizeCss?: string }) => {
      const isCustomImage = path && (path.startsWith('data:image/') || path.startsWith('http://') || path.startsWith('https://'));
      const numSize = Number(sizeCss) || 10;
      const isLarge = numSize > 12;
      const boxDimensions = isLarge ? (numSize > 30 ? "w-56 h-36" : "w-24 h-16") : "w-full h-10";

      if (isCustomImage) {
        return (
          <img
            src={path}
            alt={title}
            className={`${boxDimensions} object-contain rounded border border-slate-300 shadow-2xs bg-slate-100 cursor-zoom-in hover:scale-105 transition-transform mx-auto max-w-full`}
            onClick={() => setLightboxMedia({ url: path, title })}
            referrerPolicy="no-referrer"
          />
        );
      }

      const renderVector = () => {
        switch (path) {
          case 'preset_single':
            return (
              <svg className="w-full h-full text-amber-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <circle cx="50" cy="50" r="40" stroke="#f37021" strokeWidth="4" />
                <path d="M40 30 L60 30 M50 30 L50 70 M40 70 L60 70" stroke="#f37021" strokeWidth="8" strokeLinecap="round" />
              </svg>
            );
          case 'preset_round':
            return (
              <svg className="w-full h-full text-teal-650" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <circle cx="50" cy="50" r="35" stroke="#0ea5e9" strokeWidth="8" />
                <circle cx="50" cy="50" r="15" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="4 4" />
              </svg>
            );
          case 'preset_square':
            return (
              <svg className="w-full h-full text-indigo-550" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <rect x="20" y="20" width="60" height="60" rx="3" stroke="#6366f1" strokeWidth="8" />
                <rect x="35" y="35" width="30" height="30" stroke="#a5b4fc" strokeWidth="2" />
              </svg>
            );
          case 'preset_small_round':
            return (
              <svg className="w-full h-full text-rose-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <circle cx="50" cy="50" r="22" stroke="#f43f5e" strokeWidth="6" />
                <circle cx="50" cy="50" r="38" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="4" fill="#f43f5e" />
              </svg>
            );
          default:
            return (
              <svg className="w-full h-full text-slate-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                <rect x="25" y="25" width="50" height="50" stroke="#94a3b8" />
                <line x1="25" y1="25" x2="75" y2="75" stroke="#94a3b8" />
              </svg>
            );
        }
      };

      return (
        <div
          onClick={() => setLightboxMedia({ url: path, title })}
          className={`${boxDimensions} p-0.5 rounded border border-slate-300 bg-slate-900 shadow-2xs cursor-zoom-in hover:bg-slate-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center mx-auto shrink-0 overflow-hidden`}
          title="Zoom punching sketch"
        >
          {renderVector()}
        </div>
      );
    };

    const filteredStamps = useMemo(() => {
      return stamps.filter(s => {
        const matchesCategory = activeCategoryFilter === 'ALL' || (s.punchingType || '').toUpperCase() === activeCategoryFilter.toUpperCase();
        const fullTxt = `${s.punchingType || ''} ${s.size || ''} ${s.stamp || ''} ${s.notes || ''}`.toUpperCase();
        const matchesQuery = fullTxt.includes(searchQuery.toUpperCase());
        return matchesCategory && matchesQuery;
      });
    }, [stamps, activeCategoryFilter, searchQuery]);

    // KPI Summary counts
    const totalStampsCount = stamps.length;
    const totalStampsQty = stamps.reduce((sum, s) => sum + (s.qty || 0), 0);
    const uniqueTypesCount = new Set(stamps.map(s => (s.punchingType || '').toUpperCase()).filter(Boolean)).size;

    // Report print routines
    const printMasterStampsLedger = () => {
      const ITEMS_PER_PAGE = 22;
      const totalPages = Math.max(1, Math.ceil(stamps.length / ITEMS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageStamps = stamps.slice(pIdx * ITEMS_PER_PAGE, (pIdx + 1) * ITEMS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageStamps, isLastPage, startIdx: pIdx * ITEMS_PER_PAGE };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Coating & Punching Accessories Master Register</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 10mm 15mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 10px; font-size: 10px; line-height: 1.3; }
            
            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; page-break-inside: avoid; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; page-break-inside: avoid; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              thead { display: table-header-group !important; }
              tfoot { display: table-footer-group !important; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table thead tr { page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: avoid !important; break-after: avoid !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <table class="report-table">
                <thead>
                  <tr class="header-repeat-row">
                    <td colspan="10" style="border: none !important; padding: 0 0 10px 0 !important; background: #ffffff !important;">
                      <div class="top-meta-bar">
                        <div class="org-left">
                          <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                          <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                        </div>
                        <div class="doc-center">
                          <div class="doc-title">${headerConfig.formTitle.toUpperCase()}</div>
                        </div>
                        <div class="meta-right">
                          <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                          <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                          <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th class="left" style="width: 20%;">Punching / Coating Type</th>
                    <th style="width: 12%;">Size Spec</th>
                    <th style="width: 14%;">Stamp Emboss</th>
                    <th style="width: 6%;">UOM</th>
                    <th style="width: 7%;">Opening</th>
                    <th style="width: 7%;">Incoming</th>
                    <th style="width: 7%;">Stock Used</th>
                    <th class="right" style="width: 9%;">Balance Qty</th>
                    <th class="left" style="width: 14%;">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.pageStamps.map((s, idx) => {
                    const op = s.openingStock !== undefined ? s.openingStock : (s.qty || 0);
                    const inc = s.incomingStocks !== undefined ? s.incomingStocks : 0;
                    const usd = s.stockUsed !== undefined ? s.stockUsed : 0;
                    const bal = s.balanceQty !== undefined ? s.balanceQty : (op + inc - usd);

                    return `
                      <tr>
                        <td>${p.startIdx + idx + 1}</td>
                        <td class="left" style="font-weight: bold;">${(s.punchingType || 'COATING ACCESSORY').toUpperCase()}</td>
                        <td style="font-weight: bold; color: #000;">${(s.size || 'N/A').toUpperCase()}</td>
                        <td>${(s.stamp || 'STANDARD').toUpperCase()}</td>
                        <td>${s.unit || 'SET'}</td>
                        <td>${op}</td>
                        <td>${inc}</td>
                        <td>${usd}</td>
                        <td class="right" style="font-weight: bold;">${bal}</td>
                        <td class="left">${(s.notes || '—').toUpperCase()}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${p.isLastPage ? `
                    <tr class="total-summary-row">
                      <td colspan="4" class="left"><strong>Doc Count: ${stamps.length} Line Items</strong></td>
                      <td><strong>SET</strong></td>
                      <td><strong>${stamps.reduce((acc, s) => acc + (s.openingStock || s.qty || 0), 0)}</strong></td>
                      <td><strong>${stamps.reduce((acc, s) => acc + (s.incomingStocks || 0), 0)}</strong></td>
                      <td><strong>${stamps.reduce((acc, s) => acc + (s.stockUsed || 0), 0)}</strong></td>
                      <td class="right"><strong>Total Balance : ${totalStampsQty}</strong></td>
                      <td></td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Accessories Profile</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Punching / Coating Profile</th>
                        <th>UOM</th>
                        <th>Total Types</th>
                        <th class="right">Total Stock Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${PUNCHING_CATEGORIES.map(cat => {
                        const catStamps = stamps.filter(s => (s.punchingType || '').toUpperCase() === cat.toUpperCase());
                        if (catStamps.length === 0) return '';
                        const catQty = catStamps.reduce((acc, s) => acc + (s.balanceQty !== undefined ? s.balanceQty : ((s.openingStock || s.qty || 0) + (s.incomingStocks || 0) - (s.stockUsed || 0))), 0);
                        return `
                          <tr>
                            <td class="left" style="font-weight: bold;">${cat.toUpperCase()}</td>
                            <td>SET</td>
                            <td>${catStamps.length}</td>
                            <td class="right" style="font-weight: bold;">${catQty}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>SET</td>
                        <td>${stamps.length}</td>
                        <td class="right">${totalStampsQty}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Coating_Punching_Accessories_Master_Ledger');
    };

    // Category-wise print for punching stamps
    const printCategoryWiseStampsLedger = () => {
      const groupedData = PUNCHING_CATEGORIES.map(cat => {
        const catStamps = stamps.filter(s => (s.punchingType || '').toUpperCase() === cat.toUpperCase());
        const catSum = catStamps.reduce((acc, s) => {
          const op = s.openingStock !== undefined ? Number(s.openingStock) : Number(s.qty || 0);
          const inc = s.incomingStocks !== undefined ? Number(s.incomingStocks) : 0;
          const usd = s.stockUsed !== undefined ? Number(s.stockUsed) : 0;
          return acc + (op + inc - usd);
        }, 0);
        return { cat, list: catStamps, qty: catSum };
      }).filter(group => group.list.length > 0);

      const CATS_PER_PAGE = 3;
      const totalPages = Math.max(1, Math.ceil(groupedData.length / CATS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageGroups = groupedData.slice(pIdx * CATS_PER_PAGE, (pIdx + 1) * CATS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageGroups, isLastPage };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Category-Wise Coating Accessories Listing</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 0; font-size: 10px; line-height: 1.3; }
            
            .report-page { page-break-after: always; break-after: page; padding: 10px; }
            .report-page:last-child { page-break-after: avoid; break-after: avoid; }

            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .category-section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1px solid #000; padding: 5px 8px; margin-top: 15px; background: #f8fafc; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              .category-section-block { margin-bottom: 12px; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <div class="top-meta-bar">
                <div class="org-left">
                  <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                  <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                </div>
                <div class="doc-center">
                  <div class="doc-title">${headerConfig.formTitle.toUpperCase()} (CATEGORY WISE)</div>
                </div>
                <div class="meta-right">
                  <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                  <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                  <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                </div>
              </div>

              ${p.pageGroups.map(group => `
                <div class="category-section-block">
                  <table class="report-table">
                    <thead>
                      <tr class="cat-header-repeat-row">
                        <th colspan="9" class="left" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1.5px solid #000; padding: 6px 8px; background: #f8fafc; color: #000;">
                          CATEGORY / PROFILE : ${group.cat.toUpperCase()} (${group.list.length} ITEMS)
                        </th>
                      </tr>
                      <tr class="col-header-row">
                        <th style="width: 5%;">S.N</th>
                        <th class="left" style="width: 22%;">Stamp Emboss / Type</th>
                        <th style="width: 12%;">Size Spec</th>
                        <th style="width: 8%;">UOM</th>
                        <th style="width: 8%;">Opening</th>
                        <th style="width: 8%;">Incoming</th>
                        <th style="width: 8%;">Used</th>
                        <th class="right" style="width: 11%;">Balance Qty</th>
                        <th class="left" style="width: 18%;">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${group.list.map((item, idx) => {
                        const op = item.openingStock !== undefined ? item.openingStock : (item.qty || 0);
                        const inc = item.incomingStocks !== undefined ? item.incomingStocks : 0;
                        const usd = item.stockUsed !== undefined ? item.stockUsed : 0;
                        const bal = item.balanceQty !== undefined ? item.balanceQty : (op + inc - usd);
                        return `
                          <tr>
                            <td>${idx + 1}</td>
                            <td class="left" style="font-weight: bold;">${(item.stamp || item.punchingType).toUpperCase()}</td>
                            <td style="font-weight: bold;">${(item.size || 'N/A').toUpperCase()}</td>
                            <td>${item.unit || 'SET'}</td>
                            <td>${op}</td>
                            <td>${inc}</td>
                            <td>${usd}</td>
                            <td class="right" style="font-weight: bold;">${bal}</td>
                            <td class="left">${(item.notes || '—').toUpperCase()}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="font-weight: bold; background: #f8fafc;">
                        <td colspan="3" class="left">Sub-Total for ${group.cat.toUpperCase()}</td>
                        <td>SET</td>
                        <td>${group.list.reduce((s, m) => s + (m.openingStock || m.qty || 0), 0)}</td>
                        <td>${group.list.reduce((s, m) => s + (m.incomingStocks || 0), 0)}</td>
                        <td>${group.list.reduce((s, m) => s + (m.stockUsed || 0), 0)}</td>
                        <td class="right">${group.qty}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              `).join('')}

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Profiles</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Accessories Profile</th>
                        <th>UOM</th>
                        <th>Qty Types</th>
                        <th class="right">Total Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${groupedData.map(group => `
                        <tr>
                          <td class="left" style="font-weight: bold;">${group.cat.toUpperCase()}</td>
                          <td>SET</td>
                          <td>${group.list.length}</td>
                          <td class="right" style="font-weight: bold;">${group.qty}</td>
                        </tr>
                      `).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>SET</td>
                        <td>${stamps.length}</td>
                        <td class="right">${totalStampsQty}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Coating_Accessories_Category_Wise_Ledger');
    };

    return (
      <div className="space-y-6 font-mono text-[11px] select-none">
        
        {/* Image 1 & Image 2 Action Bar */}
        <ErpActionBar
          title="PUNCHING STAMPS REGISTER"
          subtitle="Manage cold forge embossing logos, types and marking profiles, track stamps, and compile logs."
          onNew={handleOpenCreateForm}
          onToggleNew={handleToggleForm}
          onWipe={() => {
            if (editingSn !== null) {
              handleDeleteClick(editingSn);
            } else if (stamps.length > 0) {
              const lastSn = stamps[stamps.length - 1].sn;
              handleDeleteClick(lastSn);
            } else {
              triggerToast("No stamp records to delete.");
            }
          }}
          onPrintMaster={printMasterStampsLedger}
          onPrintSplit={printCategoryWiseStampsLedger}
          appendLabel="+ APPEND STAMP ROW"
          onEditHeader={() => setIsEditHeaderOpen(true)}
        />

        {/* Search controls & Category dropdown */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by size, stamp text, punching type, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 bg-white border border-slate-300 p-2 text-[11px] focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-2xs">
              <span className="text-[10px] text-[#0a2342] font-extrabold uppercase font-sans whitespace-nowrap">
                PUNCH CATEGORY:
              </span>
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="bg-white border border-[#0a2342] text-[#0a2342] px-2 py-1 rounded font-extrabold text-[11px] outline-none cursor-pointer hover:border-[#f37021] transition-colors uppercase font-sans max-w-[280px]"
              >
                <option value="ALL">ALL STAMP CLASSIFICATIONS ({totalStampsCount})</option>
                {PUNCHING_CATEGORIES.map(categoryName => {
                  const occurrences = stamps.filter(s => (s.punchingType || '').toUpperCase() === categoryName.toUpperCase()).length;
                  return (
                    <option key={categoryName} value={categoryName}>
                      {categoryName} ({occurrences})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Active filter:</span>
            <span className="bg-sky-50 text-sky-850 px-2.5 py-1 rounded border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
              {activeCategoryFilter === 'ALL' ? 'ALL PUNCHING TYPES' : `${activeCategoryFilter}`}
            </span>
            {searchQuery || activeCategoryFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('ALL');
                }}
                className="text-[9.5px] text-[#f37021] hover:underline uppercase font-bold ml-1"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {/* CRUD Overlay / inline form for adding or updating row attributes */}
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="bg-sky-50/50 border-2 border-sky-200 p-5 rounded-xl shadow-md space-y-4 animate-fade-in text-[11px] w-full max-w-full"
          >
            <OpeningFormHeader
              headerConfig={headerConfig}
              deptName="TOOLING & DIE DEPARTMENT"
              formTitle="PUNCHING STAMPS & STEEL DIES OPENING FORM"
              subtitle="Insert or update hardened steel stamp mark specifications."
              editingSn={editingSn}
              onClose={() => setFormOpen(false)}
              onEditHeader={() => setIsEditHeaderOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Punching Type *</label>
                    <select
                      value={punchingType}
                      onChange={(e) => {
                        setPunchingType(e.target.value);
                        // Auto-assign corresponding graphics
                        if (e.target.value === 'SINGLE LETTER') setPhoto('preset_single');
                        if (e.target.value === 'ROUND') setPhoto('preset_round');
                        if (e.target.value === 'SQUARE') setPhoto('preset_square');
                        if (e.target.value === 'SMALL ROUND') setPhoto('preset_small_round');
                      }}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans"
                    >
                      {PUNCHING_CATEGORIES.map(po => (
                        <option key={po} value={po}>{po}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Size Designation (E.g. 2MM or 6MM)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2MM, 5MM, 10MM"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">STAMP EMBOSS TEXT / MARK *</label>
                    <input
                      type="text"
                      placeholder="e.g. 2HM, MFI, 10.9"
                      value={stamp}
                      onChange={(e) => setStamp(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                      required
                    />
                  </div>

                  <div className="bg-slate-100/60 p-2 rounded border border-slate-200">
                    <span className="block text-[8px] text-slate-500 uppercase font-bold mb-1 font-sans">
                      STOCK ACCOUNTS REGISTER
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">OPEN</label>
                        <input
                          type="number"
                          value={openingStock}
                          onChange={(e) => setOpeningStock(e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">INCOMING</label>
                        <input
                          type="number"
                          value={incomingStocks}
                          onChange={(e) => setIncomingStocks(e.target.value)}
                          className="w-full text-center bg-white border border-slate-300 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-slate-500 uppercase font-bold text-center leading-none mb-1">USED</label>
                        <input
                          type="number"
                          value={stockUsed}
                          onChange={(e) => setStockUsed(e.target.value)}
                          className="w-full text-center bg-white border border-slate-305 p-1 text-[9.5px] font-bold rounded outline-none focus:border-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[7px] text-[#f37021] uppercase font-semibold text-center leading-none mb-1">BALANCE</label>
                        <div className="w-full text-center p-1 text-[9.5px] font-sans font-bold bg-amber-50 border border-amber-300 rounded text-amber-800 h-[22px] flex items-center justify-center">
                          {Math.max(0, (Number(openingStock) || 0) + (Number(incomingStocks) || 0) - (Number(stockUsed) || 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Unit of measure</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans"
                    >
                      <option value="PCS">PCS (PIECES)</option>
                      <option value="SET">SET (ENGRAVED PACKAGE)</option>
                      <option value="UNIT">UNIT (HEAVY TEMPLATE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Engraved sketches / photo upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full bg-white border border-slate-300 p-1 text-[9px] focus:border-[#f37021] outline-none rounded font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Stamping notes (Hardness, matrix specifications, wear rates)</label>
                  <textarea
                    rows={2}
                    placeholder="Enter process mechanics notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                  />
                </div>
              </div>

              {/* Preset sketch visuals on the right */}
              <div className="md:col-span-4 bg-sky-100/40 p-3.5 border border-sky-200 rounded-lg space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="block text-[7.5px] text-slate-600 uppercase font-bold font-sans leading-none">STAMP VISUAL MAPPER</span>
                  
                  <div className="flex items-center gap-2.5 bg-white p-2.5 border border-sky-200 rounded">
                    <StampPhotoComponent path={photo} title="Stamping sketch" sizeCss="12" />
                    <div className="truncate">
                      <span className="text-[7.5px] text-slate-400 uppercase font-bold block">Layout category:</span>
                      <span className="text-[10px] text-indigo-900 font-bold truncate block uppercase font-sans">
                        {photo.startsWith('data:image/') ? 'Custom upload preview' : `${photo.replace('preset_', '').replace('_', ' ')}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-sky-200">
                    <span className="text-[7.5px] block text-slate-500 font-bold uppercase mb-1.5">Switch Standard Layouts:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[8.5px]">
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_single')}
                        className={`p-1 rounded font-sans font-bold border text-center cursor-pointer transition-colors ${
                          photo === 'preset_single' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        SINGLE LETTER
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_round')}
                        className={`p-1 rounded font-sans font-bold border text-center cursor-pointer transition-colors ${
                          photo === 'preset_round' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ROUND
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_square')}
                        className={`p-1 rounded font-sans font-bold border text-center cursor-pointer transition-colors ${
                          photo === 'preset_square' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        SQUARE
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoto('preset_small_round')}
                        className={`p-1 rounded font-sans font-bold border text-center cursor-pointer transition-colors ${
                          photo === 'preset_small_round' ? 'bg-[#f37021] text-white border-transparent' : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        SMALL ROUND
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-sky-200 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 text-white hover:bg-emerald-600 transition-colors p-2 rounded font-sans font-semibold uppercase text-[9.5px] tracking-wide cursor-pointer"
                  >
                    Commit row
                  </button>
                  {editingSn !== null && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(editingSn)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9.5px] uppercase p-2 transition-all rounded shadow cursor-pointer flex items-center justify-center gap-1 font-sans"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Row
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingSn(null);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 transition-colors p-2 text-slate-800 rounded font-sans font-bold uppercase text-[9px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Excel layout display */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto scroll-smooth overspray-x-contain touch-pan-x">
            <table className="w-full text-left border-collapse text-[10.5px]">
              <thead>
                <tr className="bg-[#0d233a] text-white border-b border-slate-700 select-none text-center h-7 text-[10px] uppercase font-bold tracking-wider divide-x divide-slate-700">
                  <th className="p-0.5 text-center w-[4%]">S.N</th>
                  <th className="p-0.5 text-left pl-2 w-[18%]">PUNCHING TYPES</th>
                  <th className="p-0.5 text-center w-[8%]">SIZE</th>
                  <th className="p-0.5 text-left pl-2 w-[11%]">STAMP</th>
                  <th className="p-0.5 text-center w-[7%]">PHOTO</th>
                  <th className="p-0.5 text-center w-[5%]">UNIT</th>
                  <th className="p-0.5 text-center w-[6%]">OPEN STOCK</th>
                  <th className="p-0.5 text-center w-[6%]">INCOMING</th>
                  <th className="p-0.5 text-center w-[6%]">STOCK USED</th>
                  <th className="p-0.5 text-center text-amber-300 w-[6%]">BALANCE QTY</th>
                  <th className="p-0.5 text-left pl-2 w-[13%]">NOTES</th>
                  <th className="p-0.5 text-center print:hidden w-[10%]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[10.5px]">
                {filteredStamps.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-400 uppercase font-bold">
                      No matching punching stamp records found for criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStamps.map(s => {
                    return (
                      <tr key={s.sn} className="divide-x divide-slate-300 h-6.5 hover:bg-slate-50 transition-colors bg-white">
                        <td className="p-0.5 text-center font-bold text-slate-900 bg-white select-none">
                          {s.sn}
                        </td>
                        <td className="p-0.5 pl-2 font-bold text-slate-900 uppercase">
                          <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${
                            s.punchingType === 'SINGLE LETTER' ? 'bg-amber-100 text-amber-800' :
                            s.punchingType === 'ROUND' ? 'bg-blue-100 text-blue-800' :
                            s.punchingType === 'SQUARE' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.punchingType}
                          </span>
                        </td>
                        <td className="p-0.5 text-center font-mono font-bold text-rose-700 uppercase">
                          {s.size}
                        </td>
                        <td className="p-0.5 pl-2 font-bold text-slate-900 font-sans tracking-wide">
                          {s.stamp && (s.stamp.includes('<span') || s.stamp.includes('style=')) ? (
                            <span dangerouslySetInnerHTML={{ __html: s.stamp }} />
                          ) : (
                            s.stamp
                          )}
                        </td>
                        <td className="p-0.5 text-center">
                          <div className="flex justify-center">
                            <StampPhotoComponent path={s.photo} title={`${s.punchingType} stamp`} sizeCss="7" />
                          </div>
                        </td>
                        <td className="p-0.5 text-center font-bold text-slate-600 uppercase">
                          {s.unit}
                        </td>
                        <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                          {s.openingStock !== undefined ? s.openingStock : (s.qty || 0)}
                        </td>
                        <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                          {s.incomingStocks !== undefined ? s.incomingStocks : 0}
                        </td>
                        <td className="p-0.5 text-center font-mono font-bold text-rose-600">
                          {s.stockUsed !== undefined ? s.stockUsed : 0}
                        </td>
                        <td className="p-0.5 text-center font-mono font-bold text-[#f37021]">
                          {s.balanceQty !== undefined ? s.balanceQty : ((s.openingStock !== undefined ? s.openingStock : (s.qty || 0)) + (s.incomingStocks || 0) - (s.stockUsed || 0))}
                        </td>
                        <td className="p-0.5 pl-2 text-left max-w-sm text-slate-600 font-sans text-[9.5px] leading-tight select-text">
                          {s.notes}
                        </td>
                        <td className="p-0.5 text-center bg-white print:hidden">
                          <div className="flex items-center justify-center gap-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => handleEditClick(s)}
                              className="p-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Edit row details"
                            >
                              <Edit className="w-4 h-4 shrink-0 text-slate-700 hover:text-sky-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(s.sn)}
                              className="p-1 rounded border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Permanently remove row"
                            >
                              <Trash2 className="w-4 h-4 shrink-0 text-red-600 hover:text-red-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <FocusErpPaginationFooter
              totalItems={filteredStamps.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Photo Lightbox Dialog Modal */}
        {lightboxMedia && (
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur z-[9999] flex items-center justify-center p-4"
            onClick={() => setLightboxMedia(null)}
          >
            <div
              className="bg-slate-900 rounded-2xl max-w-lg w-full p-4 border border-slate-800 text-white relative flex flex-col items-center gap-3 animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full flex justify-between items-center">
                <span className="font-sans font-bold text-slate-200 uppercase text-xs">
                  {lightboxMedia.title}
                </span>
                <button
                  onClick={() => setLightboxMedia(null)}
                  className="p-1 text-slate-400 hover:text-white font-sans text-xs uppercase font-bold cursor-pointer"
                >
                  ✖
                </button>
              </div>

              <div className="w-52 h-52 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-md flex items-center justify-center select-none">
                <StampPhotoComponent path={lightboxMedia.url} title={lightboxMedia.title} sizeCss="44" />
              </div>
            </div>
          </div>
        )}

        <ErpEditHeaderModal
          isOpen={isEditHeaderOpen}
          onClose={() => setIsEditHeaderOpen(false)}
          initialValues={headerConfig}
          defaultValues={{
            companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
            regNo: 'MFI-2026',
            deptName: 'TOOLING & DIE DEPARTMENT',
            formTitle: 'PUNCHING STAMPS OPENING FORM',
            subtitle: 'Insert or update steel embossing stamp specifications & stock balances.',
            userId: 'ADMIN',
          }}
          onSave={(val) => {
            setHeaderConfig(val);
            localStorage.setItem('mfi_erp_header_punching', JSON.stringify(val));
          }}
        />

      </div>
    );
  });

  // --- TAB 16: Coating & Plating Accessories Component ---
  export const CoatingAccessoriesComponent = React.memo(({ triggerToast }: { triggerToast?: (msg: string) => void }) => {
    // Standard coating categories requested in Excel
    const COATING_CATEGORIES = [
      'SPRAY NOZZLE',
      'GUN',
      'XYLAN PAINTS',
      'SPRAY PAINTS',
      'ACID',
      'PAINTS'
    ];

    // Read and persist state under custom key to avoid previous data conflicts
    const DEFAULT_COATING = [
      { sn: 1, category: 'XYLAN PAINTS', description: '<span style="color:#000000">XYLAN 1424 PTFE FLUOROPOLYMER</span> COATING PAINTS', code: 'XYL-1424-BLK', brand: 'WHITFORD / PPG', make: 'USA', unit: 'LTR', openingStock: 150, incomingStocks: 50, stockUsed: 30, qty: 170, balanceQty: 170, productionDate: '2025-01-10', expiryDate: '2028-01-10', notes: 'Marine Subsea Stud Bolt Coating' },
      { sn: 2, category: 'SPRAY NOZZLE', description: '<span style="color:#000000">HIGH-PRESSURE TUNGSTEN CARBIDE</span> SPRAY NOZZLE 0.017 INCH', code: 'NZL-TC-17', brand: 'GRACO', make: 'USA', unit: 'PCS', openingStock: 40, incomingStocks: 20, stockUsed: 8, qty: 52, balanceQty: 52, productionDate: '2025-02-01', expiryDate: '2030-02-01', notes: 'Automatic Reciprocating Spray Line' },
      { sn: 3, category: 'GUN', description: '<span style="color:#000000">AIRLESS ELECTROSTATIC POWDER SPRAY</span> GUN ASSEMBLY', code: 'GUN-GEMA-900', brand: 'GEMA / SWITZERLAND', make: 'SWITZERLAND', unit: 'SET', openingStock: 6, incomingStocks: 2, stockUsed: 1, qty: 7, balanceQty: 7, productionDate: '2024-11-15', expiryDate: '2032-11-15', notes: 'Coating Line 2 Automatic Gun' },
      { sn: 4, category: 'ACID', description: '<span style="color:#000000">INHIBITED HYDROCHLORIC PICKLING ACID</span> 33%', code: 'ACD-HCL-33', brand: 'BASF CHEMICALS', make: 'GERMANY', unit: 'DRUM', openingStock: 25, incomingStocks: 10, stockUsed: 5, qty: 30, balanceQty: 30, productionDate: '2025-03-01', expiryDate: '2026-09-01', notes: 'Surface Degreasing & Rust Removal' },
      { sn: 5, category: 'SPRAY PAINTS', description: '<span style="color:#000000">ZINC RICH EPOXY PRIMER HIGH</span> SOLIDS 80%', code: 'ZNC-EPX-80', brand: 'JOTUN PAINTS', make: 'NORWAY', unit: 'LTR', openingStock: 300, incomingStocks: 100, stockUsed: 80, qty: 320, balanceQty: 320, productionDate: '2025-01-20', expiryDate: '2027-01-20', notes: 'Offshore Fastener Anti-Corrosion Primer' }
    ];

    const [items, setItems] = useState<any[]>(() => {
      const saved = localStorage.getItem('MFI_COATING_ACCESSORIES_V2');
      let loaded: any[] = [];
      if (saved) {
        try {
          loaded = JSON.parse(saved);
        } catch (e) {}
      }
      if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
        loaded = DEFAULT_COATING;
      }
      return loaded.map(item => {
        const op = item.openingStock !== undefined ? Number(item.openingStock) : Number(item.qty || 0);
        const inc = item.incomingStocks !== undefined ? Number(item.incomingStocks) : 0;
        const used = item.stockUsed !== undefined ? Number(item.stockUsed) : 0;
        return {
          ...item,
          openingStock: op,
          incomingStocks: inc,
          stockUsed: used,
          qty: op + inc - used
        };
      });
    });

    const [formOpen, setFormOpen] = useState(false);
    const [editingSn, setEditingSn] = useState<number | null>(null);
    const lastNewClickRef = useRef<number>(0);

    // Form inputs matching Excel columns
    const [category, setCategory] = useState('SPRAY NOZZLE');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [brand, setBrand] = useState('');
    const [make, setMake] = useState('');
    const [unit, setUnit] = useState('PCS');
    const [openingStock, setOpeningStock] = useState<any>('25');
    const [incomingStocks, setIncomingStocks] = useState<any>('0');
    const [stockUsed, setStockUsed] = useState<any>('0');
    const [productionDate, setProductionDate] = useState('2025-01-01');
    const [expiryDate, setExpiryDate] = useState('2028-01-01');
    const [notes, setNotes] = useState('');

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

    // Zoom sketch preview modal state
    const [zoomSketch, setZoomSketch] = useState<{ path: string; label: string } | null>(null);

    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [headerConfig, setHeaderConfig] = useState<ErpHeaderConfig>(() => {
      try {
        const saved = localStorage.getItem('mfi_erp_header_coating');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return {
        companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
        regNo: 'MFI-2026',
        deptName: 'COATING & SURFACE TREATMENT DEPT',
        formTitle: 'COATING & PLATING ACCESSORIES OPENING FORM',
        subtitle: 'Insert or update coating paints, spray nozzles & chemicals inventory.',
        userId: 'ADMIN',
      };
    });

    useEffect(() => {
      localStorage.setItem('MFI_COATING_ACCESSORIES_V2', JSON.stringify(items));
    }, [items]);

    const handleOpenCreateForm = () => {
      setEditingSn(null);
      setCategory('SPRAY NOZZLE');
      setDescription('');
      setCode('');
      setBrand('');
      setMake('');
      setUnit('PCS');
      setOpeningStock('25');
      setIncomingStocks('0');
      setStockUsed('0');
      setProductionDate('2025-03-01');
      setExpiryDate('2028-03-01');
      setNotes('');
      setFormOpen(true);
    };

    const handleNewButtonClick = () => {
      handleOpenCreateForm();
    };

    const handleToggleForm = () => {
      handleOpenCreateForm();
    };

    const handleEditClick = (item: any) => {
      setEditingSn(item.sn);
      setCategory(item.category);
      setDescription(item.description);
      setCode(item.code);
      setBrand(item.brand);
      setMake(item.make);
      setUnit(item.unit);
      setOpeningStock(String(item.openingStock !== undefined ? item.openingStock : (item.qty || 0)));
      setIncomingStocks(String(item.incomingStocks || 0));
      setStockUsed(String(item.stockUsed || 0));
      setProductionDate(item.productionDate);
      setExpiryDate(item.expiryDate);
      setNotes(item.notes);
      setFormOpen(true);
    };

    const handleDeleteClick = (sn: number) => {
      const revised = items.filter(t => t.sn !== sn)
        .map((t, idx) => ({ ...t, sn: idx + 1 })); // Sequential S.N
      setItems(revised);
      localStorage.setItem('MFI_COATING_ACCESSORIES_V2', JSON.stringify(revised));
      if (editingSn === sn) {
        setEditingSn(null);
        setFormOpen(false);
      }
      triggerToast(`Coating accessory row #${sn} deleted successfully.`);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!description.trim()) {
        alert("Description is required.");
        return;
      }

      const opVal = Math.max(0, Number(openingStock));
      const incVal = Math.max(0, Number(incomingStocks));
      const usdVal = Math.max(0, Number(stockUsed));
      const balVal = Math.max(0, opVal + incVal - usdVal);

      if (editingSn !== null) {
        const updated = items.map(s => {
          if (s.sn === editingSn) {
            return {
              ...s,
              category,
              description: description.toUpperCase().trim(),
              code: code.toUpperCase().trim() || '—',
              brand: brand.toUpperCase().trim() || '—',
              make: make.toUpperCase().trim() || '—',
              unit,
              openingStock: opVal,
              incomingStocks: incVal,
              stockUsed: usdVal,
              qty: balVal,
              productionDate,
              expiryDate,
              notes: notes.toUpperCase().trim() || '—'
            };
          }
          return s;
        });
        setItems(updated);
        localStorage.setItem('MFI_COATING_ACCESSORIES_V2', JSON.stringify(updated));
        triggerToast(`Coating row #${editingSn} updated successfully.`);
      } else {
        const nextSn = items.length > 0 ? Math.max(...items.map(s => s.sn)) + 1 : 1;
        const newItemObj = {
          sn: nextSn,
          category,
          description: description.toUpperCase().trim(),
          code: code.toUpperCase().trim() || '—',
          brand: brand.toUpperCase().trim() || '—',
          make: make.toUpperCase().trim() || '—',
          unit,
          openingStock: opVal,
          incomingStocks: incVal,
          stockUsed: usdVal,
          qty: balVal,
          productionDate,
          expiryDate,
          notes: notes.toUpperCase().trim() || '—'
        };
        const updated = [...items, newItemObj];
        setItems(updated);
        localStorage.setItem('MFI_COATING_ACCESSORIES_V2', JSON.stringify(updated));
        triggerToast("New coating accessory recorded successfully.");
      }

      // Reset fields to ready state for next entry while keeping form open & stable
      setEditingSn(null);
      setCategory('SPRAY NOZZLE');
      setDescription('');
      setCode('');
      setBrand('');
      setMake('');
      setUnit('PCS');
      setOpeningStock('25');
      setIncomingStocks('0');
      setStockUsed('0');
      setProductionDate('2025-03-01');
      setExpiryDate('2028-03-01');
      setNotes('');
      setFormOpen(true);
    };

    const filteredItems = useMemo(() => {
      return items.filter(item => {
        const matchesCategory = activeCategoryFilter === 'ALL' || (item.category || '').toUpperCase() === activeCategoryFilter.toUpperCase();
        const fullTxt = `${item.category || ''} ${item.description || ''} ${item.code || ''} ${item.brand || ''} ${item.make || ''} ${item.notes || ''}`.toUpperCase();
        const matchesQuery = fullTxt.includes(searchQuery.toUpperCase());
        return matchesCategory && matchesQuery;
      });
    }, [items, activeCategoryFilter, searchQuery]);

    // Summary calculation counters
    const totalLinesCount = items.length;
    const totalStockQty = items.reduce((sum, s) => sum + (s.qty || 0), 0);
    const uniqueBrandsCount = new Set(items.map(s => (s.brand || '').toUpperCase()).filter(b => b && b !== '—')).size;

    // Check near expiry batches (e.g. within current target year 2026 or outdated)
    const lowStockOrExpiringCount = items.filter(s => {
      const isLowStock = (s.qty || 0) < 15;
      const cat = s.category || '';
      const isAcidOrPaint = cat.includes('PAINTS') || cat === 'ACID';
      const year = parseInt((s.expiryDate || '').split('-')[0]) || 2029;
      const isExpiringSoon = isAcidOrPaint && year <= 2026;
      return isLowStock || isExpiringSoon;
    }).length;

    // Vector Graphics mapping for custom sketches of categories
    const CategorySketchComponent = ({ type, cssSize = '10' }: { type: string; cssSize?: string }) => {
      const renderSvg = () => {
        switch (type.toUpperCase()) {
          case 'SPRAY NOZZLE':
            return (
              <svg className="w-full h-full text-sky-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <path d="M50 15 L50 45" strokeWidth="8" strokeLinecap="round" />
                <path d="M35 50 L65 50 M30 65 L70 65 M20 80 L80 80" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="8" fill="currentColor" />
              </svg>
            );
          case 'GUN':
            return (
              <svg className="w-full h-full text-purple-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <path d="M25 30 L65 30 L65 45 L50 45 L50 80" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M50 45 L35 45 L25 30" strokeWidth="5" />
                <circle cx="43" cy="55" r="5" stroke="#f37021" />
              </svg>
            );
          case 'XYLAN PAINTS':
            return (
              <svg className="w-full h-full text-indigo-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5">
                <path d="M30 80 L70 80 L70 45 L55 20 L45 20 L30 45 Z" strokeWidth="7" strokeLinejoin="round" />
                <line x1="30" y1="55" x2="70" y2="55" strokeWidth="3" strokeDasharray="5 5" />
                <rect x="42" y="14" width="16" height="6" fill="currentColor" />
                <circle cx="50" cy="65" r="8" stroke="#38bdf8" strokeWidth="2" />
              </svg>
            );
          case 'SPRAY PAINTS':
            return (
              <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <rect x="30" y="30" width="40" height="55" rx="5" strokeWidth="7" />
                <path d="M42 30 L42 16 L58 16 L58 30" strokeWidth="5" />
                <circle cx="50" cy="12" r="4" fill="#10b981" />
                <path d="M50 15 C 65 15, 75 10, 85 20" strokeWidth="2" strokeDasharray="2 2" />
              </svg>
            );
          case 'ACID':
            return (
              <svg className="w-full h-full text-rose-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <polygon points="50,15 85,80 15,80" strokeWidth="8" strokeLinejoin="round" />
                <line x1="50" y1="38" x2="50" y2="58" strokeWidth="9" strokeLinecap="round" />
                <circle cx="50" cy="70" r="5" fill="currentColor" />
              </svg>
            );
          case 'PAINTS':
            return (
              <svg className="w-full h-full text-amber-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                <path d="M25 40 C25 25, 75 25, 75 40 L70 85 L30 85 Z" strokeWidth="8" strokeLinejoin="round" />
                <path d="M20 40 L80 40" strokeWidth="5" />
                <path d="M30 25 C40 10, 60 10, 70 25" strokeWidth="3" strokeLinecap="round" />
              </svg>
            );
          default:
            return (
              <svg className="w-full h-full text-slate-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5">
                <circle cx="50" cy="50" r="30" />
                <line x1="30" y1="30" x2="70" y2="70" />
              </svg>
            );
        }
      };

      return (
        <div 
          onClick={() => setZoomSketch({ path: type, label: type })}
          className={`w-${cssSize} h-${cssSize} p-1 rounded border border-slate-700 bg-slate-950 flex items-center justify-center cursor-zoom-in hover:bg-black transition-colors shrink-0`}
          title={`Zoom category ${type}`}
        >
          {renderSvg()}
        </div>
      );
    };

    // Print routine for Master Spreadsheet lists
    const printMasterLedger = () => {
      const ITEMS_PER_PAGE = 22;
      const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageItems = items.slice(pIdx * ITEMS_PER_PAGE, (pIdx + 1) * ITEMS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageItems, isLastPage, startIdx: pIdx * ITEMS_PER_PAGE };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Coating Accessories Master Ledger</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 0; font-size: 10px; line-height: 1.3; }
            
            .report-page { page-break-after: always; break-after: page; padding: 10px; }
            .report-page:last-child { page-break-after: avoid; break-after: avoid; }

            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .final-summary-section { margin-top: 25px; width: 60%; }
            .final-summary-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase; }
            table.summary-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            table.summary-table th { border: 1px solid #000; padding: 5px 4px; font-weight: bold; text-align: center; }
            table.summary-table td { border: 1px solid #000; padding: 4px; text-align: center; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <div class="top-meta-bar">
                <div class="org-left">
                  <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                  <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                </div>
                <div class="doc-center">
                  <div class="doc-title">${headerConfig.formTitle.toUpperCase()}</div>
                </div>
                <div class="meta-right">
                  <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                  <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                  <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                </div>
              </div>

              <table class="report-table">
                <thead>
                  <tr>
                    <th style="width: 4%;">S.N</th>
                    <th class="left" style="width: 12%;">Category</th>
                    <th class="left" style="width: 22%;">Description of Material</th>
                    <th style="width: 8%;">Code</th>
                    <th style="width: 8%;">Brand / Make</th>
                    <th style="width: 5%;">Unit</th>
                    <th style="width: 6%;">Opening</th>
                    <th style="width: 6%;">Incoming</th>
                    <th style="width: 6%;">Used</th>
                    <th class="right" style="width: 8%;">Balance Qty</th>
                    <th style="width: 7%;">Prod Date</th>
                    <th style="width: 8%;">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${p.pageItems.map((s, idx) => {
                    const op = s.openingStock !== undefined ? s.openingStock : (s.qty || 0);
                    const inc = s.incomingStocks !== undefined ? s.incomingStocks : 0;
                    const usd = s.stockUsed !== undefined ? s.stockUsed : 0;
                    const bal = s.qty !== undefined ? s.qty : (op + inc - usd);
                    return `
                      <tr>
                        <td>${p.startIdx + idx + 1}</td>
                        <td class="left" style="font-weight: bold;">${(s.category || 'GENERAL').toUpperCase()}</td>
                        <td class="left" style="font-weight: bold;">${(s.description || '').toUpperCase()}</td>
                        <td style="font-weight: bold; color: #000;">${(s.code || '—').toUpperCase()}</td>
                        <td>${(s.brand || 'MFI').toUpperCase()} ${(s.make ? `/ ${s.make}` : '').toUpperCase()}</td>
                        <td>${s.unit || 'PCS'}</td>
                        <td>${op}</td>
                        <td>${inc}</td>
                        <td>${usd}</td>
                        <td class="right" style="font-weight: bold;">${bal}</td>
                        <td>${s.productionDate || '—'}</td>
                        <td>${s.expiryDate || '—'}</td>
                      </tr>
                    `;
                  }).join('')}
                  ${p.isLastPage ? `
                    <tr class="total-summary-row">
                      <td colspan="6" class="left"><strong>Doc Count: ${items.length} Line Items</strong></td>
                      <td><strong>${items.reduce((s, item) => s + (item.openingStock || item.qty || 0), 0)}</strong></td>
                      <td><strong>${items.reduce((s, item) => s + (item.incomingStocks || 0), 0)}</strong></td>
                      <td><strong>${items.reduce((s, item) => s + (item.stockUsed || 0), 0)}</strong></td>
                      <td class="right"><strong>Total Balance : ${totalStockQty}</strong></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              ${p.isLastPage ? `
                <div class="final-summary-section">
                  <div class="final-summary-title">Final Summary By Material Categories</div>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th class="left">Category Class</th>
                        <th>UOM</th>
                        <th>Total Items</th>
                        <th class="right">Total Stock Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${COATING_CATEGORIES.map(cat => {
                        const catItems = items.filter(s => (s.category || '').toUpperCase() === cat.toUpperCase());
                        if (catItems.length === 0) return '';
                        const catQty = catItems.reduce((acc, s) => acc + (s.qty || 0), 0);
                        return `
                          <tr>
                            <td class="left" style="font-weight: bold;">${cat.toUpperCase()}</td>
                            <td>PCS</td>
                            <td>${catItems.length}</td>
                            <td class="right" style="font-weight: bold;">${catQty}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr style="border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold;">
                        <td class="left">Total :</td>
                        <td>PCS</td>
                        <td>${items.length}</td>
                        <td class="right">${totalStockQty}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Coating_Accessories_Master_Ledger');
    };

    // Category-wise print split for Spray Nozzle, Gun, Xylan, etc.
    const printCategoryWiseLedger = () => {
      const groupedData = COATING_CATEGORIES.map(cat => {
        const catItems = items.filter(s => (s.category || '').toUpperCase() === cat.toUpperCase());
        const sumQty = catItems.reduce((acc, s) => acc + (s.qty || 0), 0);
        return { cat, list: catItems, qty: sumQty };
      }).filter(group => group.list.length > 0);

      const CATS_PER_PAGE = 3;
      const totalPages = Math.max(1, Math.ceil(groupedData.length / CATS_PER_PAGE));
      const pagesArr = Array.from({ length: totalPages }, (_, pIdx) => {
        const pageGroups = groupedData.slice(pIdx * CATS_PER_PAGE, (pIdx + 1) * CATS_PER_PAGE);
        const isLastPage = pIdx === totalPages - 1;
        return { pageNum: pIdx + 1, pageGroups, isLastPage };
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Category-Wise Coating Accessories Register</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
            body { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #000; margin: 0; padding: 0; font-size: 10px; line-height: 1.3; }
            
            .report-page { page-break-after: always; break-after: page; padding: 10px; }
            .report-page:last-child { page-break-after: avoid; break-after: avoid; }

            .top-meta-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
            .org-left { text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .doc-center { text-align: center; flex: 1; }
            .doc-title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #000; }
            .meta-right { text-align: right; font-size: 9px; line-height: 1.4; }

            table.report-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 15px; font-size: 9.5px; }
            table.report-table th { border: 1px solid #000; padding: 6px 4px; font-weight: bold; text-transform: uppercase; text-align: center; background: #ffffff; color: #000; }
            table.report-table td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; text-align: center; }
            table.report-table td.left, table.report-table th.left { text-align: left; }
            table.report-table td.right, table.report-table th.right { text-align: right; }

            .category-section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1px solid #000; padding: 5px 8px; margin-top: 15px; background: #f8fafc; }

            .total-summary-row { border-top: 1.5px solid #000; border-bottom: 3px double #000; font-weight: bold; font-size: 10px; }
            .total-summary-row td { padding: 8px 4px; border: 1px solid #000; }

            .end-report-line { text-align: center; margin: 25px 0 15px 0; font-size: 9.5px; font-weight: bold; position: relative; }
            .end-report-line::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #000; z-index: 1; }
            .end-report-text { position: relative; z-index: 2; background: #fff; padding: 0 12px; }

            @media print {
              html, body { margin: 0; padding: 0; }
              .category-section-block { margin-bottom: 12px; }
              table.report-table { page-break-inside: auto !important; }
              table.report-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${pagesArr.map(p => `
            <div class="report-page" style="${!p.isLastPage ? 'page-break-after: always; break-after: page;' : ''}">
              <div class="top-meta-bar">
                <div class="org-left">
                  <div style="font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px;">${headerConfig.companyName.toUpperCase()}</div>
                  <div style="font-size: 8.5px; font-weight: bold; color: #475569; margin-top: 2px;">REG: ${headerConfig.regNo.toUpperCase()} | ${headerConfig.deptName.toUpperCase()}</div>
                </div>
                <div class="doc-center">
                  <div class="doc-title">${headerConfig.formTitle.toUpperCase()} (CATEGORY WISE)</div>
                </div>
                <div class="meta-right">
                  <div><strong>Date :</strong> ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}</div>
                  <div><strong>User ID :</strong> ${headerConfig.userId.toUpperCase()}</div>
                  <div><strong>Page :</strong> Page ${p.pageNum} of ${totalPages}</div>
                </div>
              </div>

              ${p.pageGroups.map(g => `
                <div class="category-section-block">
                  <table class="report-table">
                    <thead>
                      <tr class="cat-header-repeat-row">
                        <th colspan="10" class="left" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1.5px solid #000; padding: 6px 8px; background: #f8fafc; color: #000;">
                          CATEGORY : ${g.cat.toUpperCase()} (TOTAL ITEMS: ${g.list.length} | STOCK QUANTITY: ${g.qty})
                        </th>
                      </tr>
                      <tr class="col-header-row">
                        <th style="width: 5%;">S.N</th>
                        <th class="left" style="width: 25%;">Material Description</th>
                        <th style="width: 10%;">Code</th>
                        <th style="width: 12%;">Brand / Make</th>
                        <th style="width: 6%;">Unit</th>
                        <th style="width: 7%;">Opening</th>
                        <th style="width: 7%;">Incoming</th>
                        <th style="width: 7%;">Used</th>
                        <th class="right" style="width: 8%;">Balance Qty</th>
                        <th style="width: 13%;">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${g.list.map((item, index) => {
                        const op = item.openingStock !== undefined ? item.openingStock : (item.qty || 0);
                        const inc = item.incomingStocks !== undefined ? item.incomingStocks : 0;
                        const usd = item.stockUsed !== undefined ? item.stockUsed : 0;
                        const bal = item.qty !== undefined ? item.qty : (op + inc - usd);
                        return `
                          <tr>
                            <td>${index + 1}</td>
                            <td class="left" style="font-weight: bold;">${(item.description || '').toUpperCase()}</td>
                            <td style="font-weight: bold; color: #000;">${(item.code || '—').toUpperCase()}</td>
                            <td>${(item.brand || '').toUpperCase()} (${(item.make || 'MFI').toUpperCase()})</td>
                            <td>${item.unit || 'PCS'}</td>
                            <td>${op}</td>
                            <td>${inc}</td>
                            <td>${usd}</td>
                            <td class="right" style="font-weight: bold;">${bal}</td>
                            <td>${item.expiryDate || '—'}</td>
                          </tr>
                        `;
                      }).join('')}
                      <tr class="total-summary-row">
                        <td colspan="5" class="left">Sub-total for ${g.cat.toUpperCase()}</td>
                        <td>${g.list.reduce((s, item) => s + (item.openingStock || item.qty || 0), 0)}</td>
                        <td>${g.list.reduce((s, item) => s + (item.incomingStocks || 0), 0)}</td>
                        <td>${g.list.reduce((s, item) => s + (item.stockUsed || 0), 0)}</td>
                        <td class="right">${g.qty}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              `).join('')}

              ${p.isLastPage ? `
                <div class="end-report-line">
                  <span class="end-report-text">End of Report</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;
      printHtml(htmlContent, 'MFI_Coating_Accessories_Category_Wise_Ledger');
    };

    return (
      <div className="space-y-6 font-mono text-[11px] select-none">
        
        {/* Image 1 & Image 2 Action Bar */}
        <ErpActionBar
          title="COATING ACCESSORIES REGISTER"
          subtitle="Manage painting & spraying tools register, compile audits, and print reports."
          onNew={handleOpenCreateForm}
          onToggleNew={handleToggleForm}
          onWipe={() => {
            if (editingSn !== null) {
              handleDeleteClick(editingSn);
            } else if (items.length > 0) {
              const lastSn = items[items.length - 1].sn;
              handleDeleteClick(lastSn);
            } else {
              triggerToast("No coating accessories rows to delete.");
            }
          }}
          onPrintMaster={printMasterLedger}
          onPrintSplit={printCategoryWiseLedger}
          appendLabel="APPEND COATING ROW"
          onEditHeader={() => setIsEditHeaderOpen(true)}
        />

        {/* Search tool block & Category dropdown */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by description, code, brand, make, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 bg-white border border-slate-300 p-2 text-[11px] focus:ring-1 focus:ring-[#f37021] outline-none rounded font-bold uppercase placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2.5 py-1 rounded shadow-2xs">
              <span className="text-[10px] text-[#0a2342] font-extrabold uppercase font-sans whitespace-nowrap">
                CATEGORY:
              </span>
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="bg-white border border-[#0a2342] text-[#0a2342] px-2 py-1 rounded font-extrabold text-[11px] outline-none cursor-pointer hover:border-[#f37021] transition-colors uppercase font-sans max-w-[280px]"
              >
                <option value="ALL">ALL CATEGORIES ({totalLinesCount})</option>
                {COATING_CATEGORIES.map(categoryName => {
                  const occurrences = items.filter(s => (s.category || '').toUpperCase() === categoryName.toUpperCase()).length;
                  return (
                    <option key={categoryName} value={categoryName}>
                      {categoryName} ({occurrences})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Active Filter:</span>
            <span className="bg-indigo-50 text-indigo-850 px-2.5 py-1 rounded border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
              {activeCategoryFilter === 'ALL' ? 'ALL STOCK ENTRIES' : `${activeCategoryFilter}`}
            </span>
          </div>
        </div>

        {/* CRUD overlay sheet */}
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="bg-sky-50/50 border-2 border-sky-200 p-5 rounded-xl shadow-md space-y-4 animate-fade-in text-[11px] w-full max-w-full"
          >
            <OpeningFormHeader
              headerConfig={headerConfig}
              deptName="COATING & SURFACE DEPT"
              formTitle="COATING ACCESSORIES & CHEMICALS OPENING FORM"
              subtitle="Insert or update surface treatment materials & chemical stocks."
              editingSn={editingSn}
              onClose={() => setFormOpen(false)}
              onEditHeader={() => setIsEditHeaderOpen(true)}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">CATEGORY *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans"
                    >
                      {COATING_CATEGORIES.map(catOpt => (
                        <option key={catOpt} value={catOpt}>{catOpt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">MATERIAL CODE / SKRID *</label>
                    <input
                      type="text"
                      placeholder="e.g. XL-1014-BL, SP-ZN-05"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">DESCRIPTION OF MATERIAL *</label>
                  <input
                    type="text"
                    placeholder="Enter complete description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">BRAND / SPONSOR *</label>
                    <input
                      type="text"
                      placeholder="e.g. GRACO, JOTUN, WHITFORD"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">MAKE / COUNTRY</label>
                    <input
                      type="text"
                      placeholder="e.g. Germany, UK, USA"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">UNIT of measure</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold cursor-pointer font-sans"
                    >
                      <option value="PCS">PCS (PIECES)</option>
                      <option value="SET">SET (ENGRAVED KIT)</option>
                      <option value="LTR">LTR (LITERS)</option>
                      <option value="CAN">CAN (SPRAY CAN)</option>
                      <option value="DRUM">DRUM (CHEMICAL DRUM)</option>
                      <option value="KGS">KGS (KILOGRAM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Opening Stock</label>
                    <input
                      type="number"
                      value={openingStock}
                      onChange={(e) => setOpeningStock(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Incoming Stocks</label>
                    <input
                      type="number"
                      value={incomingStocks}
                      onChange={(e) => setIncomingStocks(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Stock Used</label>
                    <input
                      type="number"
                      value={stockUsed}
                      onChange={(e) => setStockUsed(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans font-semibold text-[#f37021]">Balance Stock</label>
                    <div className="w-full bg-[#f37021]/10 border-2 border-[#f37021]/40 text-slate-900 p-2 rounded font-semibold text-[12px] text-center">
                      {Math.max(0, (Number(openingStock) || 0) + (Number(incomingStocks) || 0) - (Number(stockUsed) || 0))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">PRODUCTION DATE</label>
                    <input
                      type="date"
                      value={productionDate}
                      onChange={(e) => setProductionDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">EXPIRY DATE (EXPIARY)</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] text-slate-500 uppercase font-bold mb-1 font-sans">Process Clearance Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter process matrix parameters..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] outline-none rounded font-bold uppercase text-[11px]"
                  />
                </div>
              </div>

              {/* Vector schema visuals sidebar */}
              <div className="md:col-span-4 bg-sky-100/40 p-3.5 border border-sky-200 rounded-lg space-y-3.5 flex flex-col justify-between">
                <div>
                  <span className="block text-[7.5px] text-slate-600 uppercase font-bold font-sans leading-none mb-1.5">GRAPHICAL PROFILE SKETCH</span>
                  <div className="flex items-center gap-2.5 bg-white p-2.5 border border-sky-200 rounded">
                    <CategorySketchComponent type={category} cssSize="12" />
                    <div>
                      <span className="text-[7.5px] text-[#f37021] uppercase font-bold block">Sketch reference:</span>
                      <span className="text-[10px] text-indigo-900 font-sans font-bold uppercase block leading-tight">
                        {category} Profile
                      </span>
                      <span className="text-[7.5px] text-slate-400 font-mono block">Rendered via active vectors</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-500 font-sans mt-2.5 leading-normal">
                    This SVG sketch represents the design structure of <strong>{category}</strong> for industrial application.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-[#f37021] hover:bg-orange-600 text-white font-sans font-bold uppercase tracking-wider p-2 rounded text-[9px] cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Material row
                  </button>
                  {editingSn !== null && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(editingSn)}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold uppercase tracking-wider p-1.5 rounded text-[8.5px] cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Material row
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setEditingSn(null);
                    }}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-sans font-bold uppercase tracking-wider p-1.5 rounded text-[8.5px] cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Master Data spreadsheet ledger representing columns */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto scroll-smooth overspray-x-contain touch-pan-x box-shaped bg-white select-none">
            <table className="box-shaped-table w-full text-left font-sans text-[10px] uppercase table-fixed min-w-[1250px] max-w-full">
              <colgroup>
                <col className="w-[45px]" />
                <col className="w-[70px]" />
                <col className="w-[180px]" />
                <col className="w-[90px]" />
                <col className="w-[100px]" />
                <col className="w-[90px]" />
                <col className="w-[50px]" />
                <col className="w-[70px]" />
                <col className="w-[70px]" />
                <col className="w-[70px]" />
                <col className="w-[80px]" />
                <col className="w-[85px]" />
                <col className="w-[85px]" />
                <col className="w-[130px]" />
                <col className="w-[90px]" />
              </colgroup>
              <thead>
                <tr className="bg-[#0d233a] text-white border-b border-slate-700 select-none text-center h-7 text-[10px] uppercase font-bold tracking-wider divide-x divide-slate-700">
                  <th className="p-0.5 text-center">S.N</th>
                  <th className="p-0.5 text-center">SKETCH</th>
                  <th className="p-0.5 text-left pl-2">DESCRIPTION OF MATERIAL</th>
                  <th className="p-0.5 text-center">CODE</th>
                  <th className="p-0.5 text-center">BRAND</th>
                  <th className="p-0.5 text-center">MAKE</th>
                  <th className="p-0.5 text-center">UNIT</th>
                  <th className="p-0.5 text-center">OPEN STOCK</th>
                  <th className="p-0.5 text-center">INCOMING</th>
                  <th className="p-0.5 text-center">STOCK USED</th>
                  <th className="p-0.5 text-center text-amber-300">BALANCE STOCK</th>
                  <th className="p-0.5 text-center">PROD DATE</th>
                  <th className="p-0.5 text-center">EXPIRY DATE</th>
                  <th className="p-0.5 text-left pl-2">NOTES</th>
                  <th className="p-0.5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-[10.5px]">
                {filteredItems.map((item) => {
                  const isLow = item.qty < 15;
                  const year = parseInt(item.expiryDate.split('-')[0]) || 2029;
                  const isExpired = year <= 2026 && (item.category.includes('PAINTS') || item.category === 'ACID');

                  return (
                    <tr 
                      key={item.sn} 
                      className="divide-x divide-slate-300 h-6.5 hover:bg-slate-50 transition-colors group bg-white"
                    >
                      {/* S.N */}
                      <td className="p-0.5 text-center font-bold text-slate-900 bg-white select-none">
                        {item.sn}
                      </td>

                      {/* Sketch profile */}
                      <td className="p-0.5 text-center">
                        <div className="flex justify-center items-center">
                          <CategorySketchComponent type={item.category} cssSize="7" />
                        </div>
                      </td>

                      {/* Description with category badge */}
                      <td className="p-0.5 pl-2 text-left font-sans">
                        <span className="text-[7.5px] bg-slate-900 text-white font-sans font-bold px-1 py-0.2 rounded tracking-wider uppercase inline-block mr-1">
                          {item.category}
                        </span>
                        <span className="font-bold text-slate-900 leading-tight">
                          {item.description && (item.description.includes('<span') || item.description.includes('style=')) ? (
                            <span dangerouslySetInnerHTML={{ __html: item.description }} />
                          ) : (
                            item.description
                          )}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="p-0.5 text-center font-mono font-bold text-[#f37021]">
                        {item.code || '—'}
                      </td>

                      {/* Brand */}
                      <td className="p-0.5 text-center text-slate-700 font-semibold truncate px-1">
                        {item.brand || '—'}
                      </td>

                      {/* Make */}
                      <td className="p-0.5 text-center text-slate-700 font-semibold truncate px-1">
                        {item.make || '—'}
                      </td>

                      {/* Unit */}
                      <td className="p-0.5 text-center font-bold text-slate-600">
                        {item.unit}
                      </td>

                      {/* Opening Stock */}
                      <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                        {item.openingStock !== undefined ? item.openingStock : item.qty}
                      </td>

                      {/* Incoming Stocks */}
                      <td className="p-0.5 text-center font-mono font-bold text-slate-800">
                        {item.incomingStocks || 0}
                      </td>

                      {/* Stock Used */}
                      <td className="p-0.5 text-center font-mono font-bold text-rose-600">
                        {item.stockUsed || 0}
                      </td>

                      {/* Balance Stock */}
                      <td className="p-0.5 text-center font-mono font-bold text-[#f37021]">
                        {item.qty}
                      </td>

                      {/* Production Date */}
                      <td className="p-0.5 text-center text-slate-600 font-mono text-[9.5px]">
                        {item.productionDate || '—'}
                      </td>

                      {/* Expiry Date */}
                      <td className="p-0.5 text-center font-mono">
                        <span className={`text-[9.5px] ${
                          isExpired ? 'text-red-700 font-bold underline' : 'text-slate-600'
                        }`}>
                          {item.expiryDate || '—'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="p-0.5 pl-2 text-left text-[9.5px] text-slate-600 leading-tight select-text normal-case truncate max-w-[130px]" title={item.notes}>
                        {item.notes || '—'}
                      </td>

                      {/* Actions */}
                      <td className="p-0.5 text-center bg-white">
                        <div className="flex items-center justify-center gap-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="p-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Edit row details"
                          >
                            <Edit className="w-4 h-4 shrink-0 text-slate-700 hover:text-sky-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item.sn)}
                            className="p-1 rounded border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            title="Permanently remove row"
                          >
                            <Trash2 className="w-4 h-4 shrink-0 text-red-600 hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-10 bg-slate-50 text-slate-400 border-t">
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">
                No matching coating accessory stock rows detected.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategoryFilter('ALL');
                }}
                className="mt-2 text-xs text-[#f37021] font-bold uppercase hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
          <FocusErpPaginationFooter
            totalItems={filteredItems.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Vector zoom modal */}
        {zoomSketch && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setZoomSketch(null)}
          >
            <div 
              className="bg-slate-900 border-2 border-slate-700 p-5 rounded-2xl max-w-md w-full text-white text-center space-y-4 shadow-2xl animate-scale-up"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="font-sans font-bold uppercase text-xs">{zoomSketch.label} SKETCH</h4>
                <button 
                  onClick={() => setZoomSketch(null)}
                  className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  ✖
                </button>
              </div>
              
              <div className="w-56 h-56 mx-auto bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center">
                <CategorySketchComponent type={zoomSketch.path} cssSize="48" />
              </div>
            </div>
          </div>
        )}

        <ErpEditHeaderModal
          isOpen={isEditHeaderOpen}
          onClose={() => setIsEditHeaderOpen(false)}
          initialValues={headerConfig}
          defaultValues={{
            companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
            regNo: 'MFI-2026',
            deptName: 'COATING & SURFACE TREATMENT DEPT',
            formTitle: 'COATING ACCESSORIES OPENING FORM',
            subtitle: 'Insert or update coating paints, spray nozzles & chemicals inventory.',
            userId: 'ADMIN',
          }}
          onSave={(val) => {
            setHeaderConfig(val);
            localStorage.setItem('mfi_erp_header_coating', JSON.stringify(val));
          }}
        />

      </div>
    );
  });