import React, { useRef } from 'react';
import { Upload, X, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { DataSheetRecord } from './dataSheetTypes';
import { DEFAULT_ISO_LOGO_URL } from '../QcReportsComponent';
import { compressImageFile } from '../../utils/qcStorage';
import { getActiveCompany, isMarineFastenersCompany } from '../../utils/companyProfile';
import { extractBranding } from './dataSheetPresets';

interface DataSheetHeaderEditorProps {
  record: DataSheetRecord;
  setRecord: React.Dispatch<React.SetStateAction<DataSheetRecord>>;
  pageNum: number;
  totalPages: number;
}

// Default stylized Marine Fasteners speed logo SVG
export const DEFAULT_MF_LOGO_SVG = (
  <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-auto max-w-[155px] object-contain shrink-0">
    <g transform="skewX(-14) translate(15, 0)">
      {/* Aerodynamic Speed Lines */}
      <path d="M-8,24 L45,28 L8,32 Z" fill="#000000"/>
      <path d="M-12,36 L50,40 L3,44 Z" fill="#000000"/>
      <path d="M-15,48 L55,52 L0,56 Z" fill="#000000"/>
      <path d="M-18,60 L60,64 L-3,68 Z" fill="#000000"/>
      <path d="M-15,72 L62,76 L2,80 Z" fill="#000000"/>
      <path d="M-10,84 L65,88 L8,91 Z" fill="#000000"/>
      <path d="M-5,94 L68,97 L14,100 Z" fill="#000000"/>

      {/* Main Bold MF Lettering */}
      <text x="42" y="88" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="90" fill="#000000" stroke="#000000" strokeWidth="12" strokeLinejoin="miter" letterSpacing="-4">MF</text>
      <text x="42" y="88" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="90" fill="#ffffff" stroke="#000000" strokeWidth="2" letterSpacing="-4">MF</text>

      {/* Sub-banner ribbon with MARINE FASTENERS */}
      <rect x="38" y="88" width="180" height="20" fill="#ffffff" stroke="#000000" strokeWidth="2.5" rx="1"/>
      <text x="128" y="102.5" fontFamily="'Arial', sans-serif" fontWeight="bold" fontStyle="italic" fontSize="11.5" fill="#000000" textAnchor="middle" letterSpacing="0.5">MARINE FASTENERS</text>
    </g>
  </svg>
);

// Stylized Bolt Master logo SVG
export const DEFAULT_BOLTMASTER_LOGO_SVG = (
  <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-auto max-w-[155px] object-contain shrink-0">
    <g>
      <rect x="10" y="18" width="300" height="84" rx="8" fill="#0e2a47" stroke="#f59e0b" strokeWidth="3"/>
      <text x="160" y="60" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="32" fill="#ffffff" textAnchor="middle" letterSpacing="1">BOLT MASTER</text>
      <line x1="30" y1="70" x2="290" y2="70" stroke="#f59e0b" strokeWidth="2"/>
      <text x="160" y="88" fontFamily="'Arial', sans-serif" fontWeight="bold" fontSize="12" fill="#f59e0b" textAnchor="middle" letterSpacing="2">BUILDING MATERIALS</text>
    </g>
  </svg>
);

// Stylized United Metal logo SVG
export const DEFAULT_UNITEDMETAL_LOGO_SVG = (
  <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-auto max-w-[155px] object-contain shrink-0">
    <g>
      <rect x="10" y="18" width="300" height="84" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="3"/>
      <text x="160" y="60" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="30" fill="#38bdf8" textAnchor="middle" letterSpacing="1">UNITED METAL</text>
      <line x1="30" y1="70" x2="290" y2="70" stroke="#94a3b8" strokeWidth="2"/>
      <text x="160" y="88" fontFamily="'Arial', sans-serif" fontWeight="bold" fontSize="12" fill="#ffffff" textAnchor="middle" letterSpacing="2">INDUSTRIES SPS-L.L.C</text>
    </g>
  </svg>
);

export const DataSheetHeaderEditor: React.FC<DataSheetHeaderEditorProps> = ({
  record,
  setRecord,
  pageNum,
  totalPages
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isoInputRef = useRef<HTMLInputElement>(null);
  const [showLogoTextEditor, setShowLogoTextEditor] = React.useState(false);
  const activeCompany = getActiveCompany();
  const isMfi = isMarineFastenersCompany(activeCompany);
  const isBoltMaster = (activeCompany.code || '').toUpperCase() === 'BMM' || activeCompany.id === 'comp-bmm' || activeCompany.name.toUpperCase().includes('BOLT');
  const isUnitedMetal = (activeCompany.code || '').toUpperCase() === 'UMI' || activeCompany.id === 'comp-umi' || activeCompany.name.toUpperCase().includes('UNITED METAL');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 0.9);
        setRecord(prev => ({ ...prev, customLogoImage: compressed }));
      } catch (err) {
        console.error('Failed to compress company logo:', err);
      }
    }
  };

  const handleIsoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 0.9);
        setRecord(prev => ({ ...prev, customIsoImage: compressed }));
      } catch (err) {
        console.error('Failed to compress ISO badges logo:', err);
      }
    }
  };

  const handleSyncActiveCompany = () => {
    const freshBranding = extractBranding(undefined, activeCompany);
    setRecord(prev => ({
      ...prev,
      ...freshBranding
    }));
  };

  const printEmailAndWeb = record.headerPrintEmailAndWeb !== false;

  const logoInitials = record.headerLogoInitials || (isMfi ? 'MF' : isBoltMaster ? 'BM' : isUnitedMetal ? 'UMI' : (activeCompany.code || 'CO'));
  const logoText = record.headerLogoText || (isMfi ? 'MARINE FASTENERS' : isBoltMaster ? 'BOLT MASTER' : isUnitedMetal ? 'UNITED METAL' : activeCompany.name);

  // Resolve default logo SVG when customLogoImage is not uploaded
  const defaultLogoSvg = isBoltMaster ? (
    <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-auto max-w-[155px] object-contain shrink-0">
      <g>
        <rect x="10" y="18" width="300" height="84" rx="8" fill="#0e2a47" stroke="#f59e0b" strokeWidth="3"/>
        <text x="160" y="60" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="32" fill="#ffffff" textAnchor="middle" letterSpacing="1">{record.headerLogoInitials || 'BOLT MASTER'}</text>
        <line x1="30" y1="70" x2="290" y2="70" stroke="#f59e0b" strokeWidth="2"/>
        <text x="160" y="88" fontFamily="'Arial', sans-serif" fontWeight="bold" fontSize="12" fill="#f59e0b" textAnchor="middle" letterSpacing="2">{record.headerLogoText || 'BUILDING MATERIALS'}</text>
      </g>
    </svg>
  ) : isUnitedMetal ? (
    <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-auto max-w-[155px] object-contain shrink-0">
      <g>
        <rect x="10" y="18" width="300" height="84" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="3"/>
        <text x="160" y="60" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize="30" fill="#38bdf8" textAnchor="middle" letterSpacing="1">{record.headerLogoInitials || 'UNITED METAL'}</text>
        <line x1="30" y1="70" x2="290" y2="70" stroke="#94a3b8" strokeWidth="2"/>
        <text x="160" y="88" fontFamily="'Arial', sans-serif" fontWeight="bold" fontSize="12" fill="#ffffff" textAnchor="middle" letterSpacing="2">{record.headerLogoText || 'INDUSTRIES SPS-L.L.C'}</text>
      </g>
    </svg>
  ) : (
    <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" className="h-14 sm:h-16 w-auto max-w-[155px] object-contain shrink-0">
      <g transform="skewX(-14) translate(15, 0)">
        <path d="M-8,24 L45,28 L8,32 Z" fill="#000000"/>
        <path d="M-12,36 L50,40 L3,44 Z" fill="#000000"/>
        <path d="M-15,48 L55,52 L0,56 Z" fill="#000000"/>
        <path d="M-18,60 L60,64 L-3,68 Z" fill="#000000"/>
        <path d="M-15,72 L62,76 L2,80 Z" fill="#000000"/>
        <path d="M-10,84 L65,88 L8,91 Z" fill="#000000"/>
        <path d="M-5,94 L68,97 L14,100 Z" fill="#000000"/>

        <text x="42" y="88" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize={logoInitials.length > 2 ? "64" : "90"} fill="#000000" stroke="#000000" strokeWidth="12" strokeLinejoin="miter" letterSpacing="-4">{logoInitials}</text>
        <text x="42" y="88" fontFamily="'Arial Black', 'Impact', sans-serif" fontWeight="900" fontSize={logoInitials.length > 2 ? "64" : "90"} fill="#ffffff" stroke="#000000" strokeWidth="2" letterSpacing="-4">{logoInitials}</text>

        <rect x="38" y="88" width={Math.max(180, (logoText.length * 8) + 30)} height="20" fill="#ffffff" stroke="#000000" strokeWidth="2.5" rx="1"/>
        <text x={38 + Math.max(180, (logoText.length * 8) + 30) / 2} y="102.5" fontFamily="'Arial', sans-serif" fontWeight="bold" fontStyle="italic" fontSize="11.5" fill="#000000" textAnchor="middle" letterSpacing="0.5">{logoText}</text>
      </g>
    </svg>
  );

  return (
    <div className="border-b-2 border-black pb-2.5 mb-3 font-sans">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 min-h-[64px]">
        
        {/* ========================================================================= */}
        {/* LEFT: COMPANY LOGO & CONTACT DETAILS                                      */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Logo Area (Clean, no outer box) */}
          <div className="relative group shrink-0 flex flex-col items-center justify-center">
            {record.customLogoImage ? (
              <div className="relative flex items-center justify-center h-14 max-w-[155px]">
                <img 
                  src={record.customLogoImage} 
                  alt="Company Logo" 
                  className="max-h-14 max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setRecord(prev => ({ ...prev, customLogoImage: '' }))}
                  title="Remove Custom Logo"
                  className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="cursor-pointer flex items-center justify-center group-hover:opacity-90 transition-opacity"
                title="Click to upload custom logo"
              >
                {defaultLogoSvg}
              </div>
            )}
            
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />

            <div className="opacity-0 group-hover:opacity-100 transition-opacity print:hidden text-[7.5px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-amber-700 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
              >
                <Upload className="w-2 h-2" /> Upload
              </button>
              <button
                type="button"
                onClick={() => setShowLogoTextEditor(!showLogoTextEditor)}
                className="text-emerald-700 hover:underline flex items-center gap-0.5 font-bold cursor-pointer border-l pl-1 border-slate-300"
                title="Edit text inside the SVG logo"
              >
                ✏️ Logo Text
              </button>
              <button
                type="button"
                onClick={handleSyncActiveCompany}
                className="text-blue-700 hover:underline flex items-center gap-0.5 font-bold cursor-pointer border-l pl-1 border-slate-300"
                title="Reset header to active company profile"
              >
                <RefreshCw className="w-2 h-2" /> Sync
              </button>
            </div>

            {showLogoTextEditor && !record.customLogoImage && (
              <div className="absolute top-full left-0 mt-1 bg-white p-2 border border-slate-300 rounded shadow-md z-30 flex flex-col gap-1 text-[9px] w-48 print:hidden">
                <span className="font-bold text-slate-700">Customize SVG Logo:</span>
                <div>
                  <label className="text-[8px] text-slate-500 block">Initials / Title:</label>
                  <input
                    type="text"
                    value={record.headerLogoInitials || ''}
                    onChange={(e) => setRecord(prev => ({ ...prev, headerLogoInitials: e.target.value }))}
                    placeholder={logoInitials}
                    className="w-full border border-slate-300 rounded px-1 py-0.5 font-bold text-[9px]"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-slate-500 block">Ribbon / Subtext:</label>
                  <input
                    type="text"
                    value={record.headerLogoText || ''}
                    onChange={(e) => setRecord(prev => ({ ...prev, headerLogoText: e.target.value }))}
                    placeholder={logoText}
                    className="w-full border border-slate-300 rounded px-1 py-0.5 font-bold text-[9px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoTextEditor(false)}
                  className="mt-1 bg-slate-800 text-white rounded px-2 py-0.5 text-[8px] font-bold self-end"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Company Details Inputs */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <input
              type="text"
              value={record.headerCompanyName || activeCompany.name}
              onChange={(e) => setRecord(prev => ({ ...prev, headerCompanyName: e.target.value }))}
              placeholder="COMPANY NAME"
              className="w-full text-[12.5px] sm:text-[13px] font-black tracking-tight leading-tight text-black bg-transparent border-b border-transparent focus:border-amber-500 focus:bg-amber-50/50 outline-none uppercase"
              title="Click to edit Company Name"
            />
            <input
              type="text"
              value={record.headerCompanySub ?? (isMfi ? '(SOLE PROPRIETORSHIP)' : (activeCompany.subtitle || ''))}
              onChange={(e) => setRecord(prev => ({ ...prev, headerCompanySub: e.target.value }))}
              placeholder="Subtitle / Legal Status"
              className="w-full text-[9.5px] sm:text-[10px] font-bold text-[#1e3a8a] tracking-tight leading-tight bg-transparent border-b border-transparent focus:border-amber-500 focus:bg-amber-50/50 outline-none uppercase mt-0.5"
              title="Click to edit Subtitle / Legal Status"
            />
            <input
              type="text"
              value={record.headerCompanyAddress || `${activeCompany.address}, Tel: ${activeCompany.phone}`}
              onChange={(e) => setRecord(prev => ({ ...prev, headerCompanyAddress: e.target.value }))}
              placeholder="Address & Phone"
              className="w-full text-[8px] sm:text-[8.5px] font-medium text-slate-800 leading-tight bg-transparent border-b border-transparent focus:border-amber-500 focus:bg-amber-50/50 outline-none mt-0.5"
              title="Click to edit Address & Tel"
            />
            
            {/* Print Email & Web line with interactive checkbox */}
            <div className="flex items-center gap-1.5 mt-0.5 text-[8px] sm:text-[8.5px] text-slate-900">
              <label 
                className="flex items-center gap-1 cursor-pointer select-none text-[7.5px] text-slate-600 hover:text-slate-900 print:hidden shrink-0 border border-slate-300 rounded px-1 py-0.2 bg-slate-50"
                title="Toggle printing of email & website"
              >
                <input
                  type="checkbox"
                  checked={printEmailAndWeb}
                  onChange={(e) => setRecord(prev => ({ ...prev, headerPrintEmailAndWeb: e.target.checked }))}
                  className="w-2.5 h-2.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="font-semibold text-[7.5px]">Print Email & Web</span>
              </label>

              {printEmailAndWeb && (
                <input
                  type="text"
                  value={record.headerCompanyContact || `${activeCompany.email || ''} | ${activeCompany.website || ''}`}
                  onChange={(e) => setRecord(prev => ({ ...prev, headerCompanyContact: e.target.value }))}
                  placeholder="Email & Website"
                  className="flex-1 font-bold text-[8px] sm:text-[8.5px] text-black bg-transparent border-b border-transparent focus:border-amber-500 focus:bg-amber-50/50 outline-none"
                  title="Click to edit Email & Web"
                />
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER: ISO CERTIFICATION BADGES GRAPHIC & TEXT (LARGE & NO BOX)          */}
        {/* ========================================================================= */}
        <div className="relative group shrink-0 flex flex-col items-center justify-center px-2">
          {record.customIsoImage ? (
            <div className="relative flex items-center justify-center h-12 max-w-[280px]">
              <img 
                src={record.customIsoImage} 
                alt="ISO Badges" 
                className="max-h-12 max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setRecord(prev => ({ ...prev, customIsoImage: '' }))}
                title="Remove Custom ISO"
                className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <img 
              src={DEFAULT_ISO_LOGO_URL} 
              alt="ISO Certification Logos" 
              className="h-11 sm:h-12 max-w-[270px] sm:max-w-[300px] object-contain transition-all"
            />
          )}

          <input
            type="file"
            ref={isoInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleIsoUpload}
          />

          <div className="opacity-0 group-hover:opacity-100 transition-opacity print:hidden text-[7.5px] text-slate-500 mt-0.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => isoInputRef.current?.click()}
              className="text-amber-700 hover:underline flex items-center gap-0.5 font-bold"
            >
              <Upload className="w-2 h-2" /> Upload ISO
            </button>
            {record.customIsoImage && (
              <button
                type="button"
                onClick={() => setRecord(prev => ({ ...prev, customIsoImage: '' }))}
                className="text-rose-600 hover:underline font-bold border-l pl-1 border-slate-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: DOCUMENT TITLE & PAGE NUMBER BADGE                                 */}
        {/* ========================================================================= */}
        <div className="text-right shrink-0 min-w-[175px] flex flex-col justify-center items-end">
          {/* Certificate Title with Underline */}
          <input
            type="text"
            value={pageNum === 1 ? (record.page1Title || record.headerDocTitle || 'DATA SHEET') : (record.page2Title || 'DATA SHEET')}
            onChange={(e) => {
              const val = e.target.value;
              if (pageNum === 1) {
                setRecord(prev => ({ ...prev, headerDocTitle: val, page1Title: val }));
              } else {
                setRecord(prev => ({ ...prev, page2Title: val }));
              }
            }}
            placeholder="DATA SHEET"
            className="w-full text-right font-black text-[13px] sm:text-[14px] uppercase tracking-tight text-black underline leading-tight bg-transparent border-b border-transparent focus:border-amber-500 focus:bg-amber-50/50 outline-none"
            title="Click to edit Document Title"
          />

          {/* Page Indicator Box */}
          <div className="font-bold text-[8.5px] sm:text-[9px] uppercase tracking-tight text-black mt-1 flex items-center justify-end gap-1.5">
            <span>PAGE NO :</span>
            <div className="px-2.5 py-0.5 bg-amber-50/70 border border-amber-500 rounded text-center font-black text-[8.5px] sm:text-[9px] text-amber-950 tracking-wider">
              {pageNum} OF {totalPages}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
