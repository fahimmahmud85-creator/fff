import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, RotateCcw } from 'lucide-react';
import { DataSheetRecord } from './dataSheetTypes';
import { compressImageFile } from '../../utils/qcStorage';
import { getActiveCompany, isMarineFastenersCompany, CompanyProfile } from '../../utils/companyProfile';

interface DataSheetFooterSignaturesProps {
  record: DataSheetRecord;
  setRecord: React.Dispatch<React.SetStateAction<DataSheetRecord>>;
}

// =========================================================================
// DEFAULT ASSETS (DYNAMIC COMPANY RUBBER STAMP & HANDWRITTEN SIGNATURE)
// =========================================================================

export const getCompanyStampSvgUrl = (company?: CompanyProfile, customName?: string) => {
  const activeCompany = company || getActiveCompany();
  const isMfi = isMarineFastenersCompany(activeCompany);
  const isBoltMaster = (activeCompany.code || '').toUpperCase() === 'BMM' || activeCompany.id === 'comp-bmm' || activeCompany.name.toUpperCase().includes('BOLT');
  const isUnitedMetal = (activeCompany.code || '').toUpperCase() === 'UMI' || activeCompany.id === 'comp-umi' || activeCompany.name.toUpperCase().includes('UNITED METAL');

  let arabicText = 'مارين فاستنرز للصناعات (شخص واحد)';
  let englishText = '★ MARINE FASTENERS INDUSTRIES L.L.C. (SOLE PROPRIETORSHIP) ★';
  let centerTop = 'Ajman';
  let centerBottom = 'U.A.E';

  if (isBoltMaster) {
    arabicText = 'بولت ماستر لمواد البناء ذ.م.م';
    englishText = '★ BOLT MASTER BUILDING MATERIALS L.L.C. ★';
  } else if (isUnitedMetal) {
    arabicText = 'الصناعات المعدنية المتحدة ذ.م.م (شخص واحد)';
    englishText = '★ UNITED METAL INDUSTRIES SPS-L.L.C. ★';
  } else if (!isMfi) {
    arabicText = 'الختم الرسمي المعتمد';
    englishText = `★ ${(customName || activeCompany.name).toUpperCase()} ★`;
    centerTop = (activeCompany.address && activeCompany.address.includes('Dubai')) ? 'Dubai' : 'Ajman';
  }

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280">
  <defs>
    <!-- Top Arc Path for Arabic Text -->
    <path id="arcArabicTop" d="M 38,140 A 102,102 0 0,1 242,140" fill="none" />
    <!-- Bottom Arc Path for English Text -->
    <path id="arcEnglishBottom" d="M 242,140 A 102,102 0 0,1 38,140" fill="none" />
  </defs>

  <!-- Outer Dotted Stamp Ring -->
  <circle cx="140" cy="140" r="133" fill="none" stroke="#172554" stroke-width="2.8" stroke-dasharray="4,3" opacity="0.88"/>
  
  <!-- Outer Solid Ring -->
  <circle cx="140" cy="140" r="124" fill="#f8fafc" fill-opacity="0.03" stroke="#172554" stroke-width="2" opacity="0.92"/>

  <!-- Inner Dotted Ring -->
  <circle cx="140" cy="140" r="76" fill="none" stroke="#172554" stroke-width="2.2" stroke-dasharray="3.5,3" opacity="0.88"/>

  <!-- Arabic Arc Text (Top) -->
  <text fill="#172554" font-family="'Traditional Arabic', 'Arial', sans-serif" font-size="14.5" font-weight="900" letter-spacing="0.5" opacity="0.95">
    <textPath href="#arcArabicTop" startOffset="50%" text-anchor="middle">
      ${arabicText}
    </textPath>
  </text>

  <!-- English Arc Text (Bottom) -->
  <text fill="#172554" font-family="Arial, Helvetica, sans-serif" font-size="8.8" font-weight="900" letter-spacing="0.4" opacity="0.95">
    <textPath href="#arcEnglishBottom" startOffset="50%" text-anchor="middle">
      ${englishText}
    </textPath>
  </text>

  <!-- Center Stamp Details -->
  <g transform="translate(140, 133)" text-anchor="middle">
    <text y="-2" fill="#172554" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="900" letter-spacing="1.2" opacity="0.95">${centerTop}</text>
    <text y="17" fill="#172554" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="900" letter-spacing="3" opacity="0.95">${centerBottom}</text>
  </g>
</svg>
`);
};

// Official Marine Fasteners Circular Rubber Stamp fallback
export const DEFAULT_MFI_STAMP_SVG_URL = getCompanyStampSvgUrl();

// Default Sadhke blue handwritten signature matching the screenshot
export const DEFAULT_PREPARED_SIGN_SVG_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" width="220" height="80">
  <g fill="none" stroke="#1d4ed8" stroke-linecap="round" stroke-linejoin="round">
    <!-- Initial Flourish & Loop -->
    <path d="M 28 64 C 20 56 12 36 24 20 C 32 10 46 14 42 34 C 38 48 30 68 22 72 C 16 74 38 62 48 50 C 58 38 62 26 68 28 C 74 30 70 46 64 54 C 60 60 76 44 86 38 C 94 34 100 42 96 52 C 92 60 106 38 118 36 C 126 34 132 46 130 54" stroke-width="2.6" />
    <path d="M 124 22 L 126 56" stroke-width="2.6" />
    <path d="M 126 42 Q 138 34 148 42 T 156 54" stroke-width="2.4" />
    <path d="M 152 46 C 162 44 172 44 170 52 C 168 58 158 58 152 56" stroke-width="2.2" />
    <!-- Underline Swoosh & Dots -->
    <path d="M 18 72 Q 70 58 168 52" stroke-width="2.8" />
    <circle cx="166" cy="62" r="1.8" fill="#1d4ed8" stroke="none" />
    <circle cx="178" cy="62" r="1.8" fill="#1d4ed8" stroke="none" />
  </g>
</svg>
`);

// =========================================================================
// DRAGGABLE IMAGE COMPONENT
// =========================================================================
interface DraggableImageProps {
  src: string;
  alt: string;
  height: number;
  posX: number;
  posY: number;
  onPositionChange: (x: number, y: number) => void;
  className?: string;
  title?: string;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  src,
  alt,
  height,
  posX,
  posY,
  onPositionChange,
  className = '',
  title = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: posX, y: posY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      onPositionChange(Math.round(initialPos.x + dx), Math.round(initialPos.y + dy));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, initialPos, onPositionChange]);

  return (
    <img
      src={src}
      alt={alt}
      style={{
        height: `${height}px`,
        width: 'auto',
        transform: `translate(${posX}px, ${posY}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        pointerEvents: 'auto',
        zIndex: isDragging ? 40 : 20
      }}
      onMouseDown={handleMouseDown}
      className={`select-none transition-shadow ${isDragging ? 'opacity-80 drop-shadow-md' : ''} ${className}`}
      title={title || 'Drag to reposition'}
      draggable={false}
    />
  );
};

// =========================================================================
// MAIN DATA SHEET FOOTER SIGNATURES COMPONENT
// =========================================================================
export const DataSheetFooterSignatures: React.FC<DataSheetFooterSignaturesProps> = ({
  record,
  setRecord
}) => {
  const preparedSignInputRef = useRef<HTMLInputElement>(null);
  const approvedSignInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  // Active values with defaults matching the screenshot
  const preparedSignHeight = record.preparedSignHeight ?? 48;
  const approvedSignHeight = record.approvedSignHeight ?? 48;
  const stampHeight = record.stampHeight ?? 134;

  const preparedSignPosX = record.preparedSignPosX ?? 0;
  const preparedSignPosY = record.preparedSignPosY ?? 0;
  const approvedSignPosX = record.approvedSignPosX ?? 0;
  const approvedSignPosY = record.approvedSignPosY ?? 0;
  const stampPosX = record.stampPosX ?? 0;
  const stampPosY = record.stampPosY ?? 0;

  const preparedSignSrc = record.preparedBySignatureImage !== undefined && record.preparedBySignatureImage !== ''
    ? record.preparedBySignatureImage
    : DEFAULT_PREPARED_SIGN_SVG_URL;

  const approvedSignSrc = record.approvedBySignatureImage || '';
  const activeCompany = getActiveCompany();
  const stampSrc = record.stampSealImage !== undefined && record.stampSealImage !== ''
    ? record.stampSealImage
    : (record.showSeal !== false ? getCompanyStampSvgUrl(activeCompany, record.approvedByCompany || record.headerCompanyName) : '');

  // Handlers for image upload
  const handleUpload = async (type: 'prepared' | 'approved' | 'stamp', file: File) => {
    try {
      const dataUrl = await compressImageFile(file, 800, 0.9);
      if (type === 'prepared') {
        setRecord(prev => ({ ...prev, preparedBySignatureImage: dataUrl }));
      } else if (type === 'approved') {
        setRecord(prev => ({ ...prev, approvedBySignatureImage: dataUrl }));
      } else if (type === 'stamp') {
        setRecord(prev => ({ ...prev, stampSealImage: dataUrl, showSeal: true }));
      }
    } catch (e) {
      console.error('Error uploading signature/stamp image:', e);
    }
  };

  const handleResetAll = () => {
    setRecord(prev => ({
      ...prev,
      preparedSignHeight: 48,
      approvedSignHeight: 48,
      stampHeight: 134,
      preparedSignPosX: 0,
      preparedSignPosY: 0,
      approvedSignPosX: 0,
      approvedSignPosY: 0,
      stampPosX: 0,
      stampPosY: 0
    }));
  };

  return (
    <div className="pt-2 font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. SIGN & STAMP ADJUSTER TOOLBAR (MATCHING USER SCREENSHOT)              */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/90 p-2 px-3 rounded border border-amber-200 text-[10px] print:hidden mb-2">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <span className="text-[12px]">✍️</span>
          <span>Sign &amp; Stamp Adjuster (Drag image to move , or use sliders):</span>
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          {/* Slider 1: Prepared Sign */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-800 font-semibold">Prepared Sign:</span>
            <input
              type="range"
              min={24}
              max={120}
              step={2}
              value={preparedSignHeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRecord(prev => ({ ...prev, preparedSignHeight: val }));
              }}
              className="w-20 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded"
              title="Adjust Prepared Sign Height"
            />
            <span className="font-mono text-[9.5px] font-bold text-amber-900 w-8">{preparedSignHeight}px</span>
          </div>

          {/* Slider 2: Approved Sign */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-800 font-semibold">Approved Sign:</span>
            <input
              type="range"
              min={24}
              max={120}
              step={2}
              value={approvedSignHeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRecord(prev => ({ ...prev, approvedSignHeight: val }));
              }}
              className="w-20 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded"
              title="Adjust Approved Sign Height"
            />
            <span className="font-mono text-[9.5px] font-bold text-amber-900 w-8">{approvedSignHeight}px</span>
          </div>

          {/* Slider 3: Stamp Size */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-800 font-semibold">Stamp Size:</span>
            <input
              type="range"
              min={36}
              max={220}
              step={2}
              value={stampHeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRecord(prev => ({ ...prev, stampHeight: val }));
              }}
              className="w-20 accent-amber-600 cursor-pointer h-1.5 bg-amber-200 rounded"
              title="Adjust Stamp Size"
            />
            <span className="font-mono text-[9.5px] font-bold text-amber-900 w-8">{stampHeight}px</span>
          </div>

          {/* Reset All Button */}
          <button
            type="button"
            onClick={handleResetAll}
            className="text-[9.5px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer ml-1"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={preparedSignInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload('prepared', e.target.files[0])}
      />
      <input
        type="file"
        ref={approvedSignInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload('approved', e.target.files[0])}
      />
      <input
        type="file"
        ref={stampInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload('stamp', e.target.files[0])}
      />

      {/* ========================================================================= */}
      {/* 2. SIGNATURES & OFFICIAL STAMP FOOTER ROW                                 */}
      {/* ========================================================================= */}
      <div className="pt-2 flex items-end justify-between gap-6 relative min-h-[110px]">
        
        {/* ========================================================================= */}
        {/* LEFT: PREPARED BY SIGNATURE                                              */}
        {/* ========================================================================= */}
        <div className="text-left flex flex-col justify-end relative w-56 shrink-0">
          {/* Action buttons matching screenshot */}
          <div className="flex items-center gap-1.5 mb-1 print:hidden">
            <button
              type="button"
              onClick={() => preparedSignInputRef.current?.click()}
              className="px-1.5 py-0.5 bg-amber-50/90 hover:bg-amber-100 text-amber-900 rounded border border-amber-300 cursor-pointer transition-all inline-flex items-center gap-1 text-[8.5px] font-sans font-bold shadow-2xs"
              title="Upload Prepared By Signature Image"
            >
              <Upload className="w-2.5 h-2.5 text-amber-700" />
              <span>Upload Prepared Sign</span>
            </button>
            <button
              type="button"
              onClick={() => setRecord(prev => ({ ...prev, preparedBySignatureImage: '' }))}
              className="text-[8.5px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
              title="Reset to default signature"
            >
              Reset
            </button>
          </div>

          {/* Interactive Draggable Canvas Slot */}
          <div className="relative h-14 w-48 mb-1 flex items-end">
            {preparedSignSrc && (
              <DraggableImage
                src={preparedSignSrc}
                alt="Prepared By Signature"
                height={preparedSignHeight}
                posX={preparedSignPosX}
                posY={preparedSignPosY}
                onPositionChange={(nx, ny) => {
                  setRecord(prev => ({ ...prev, preparedSignPosX: nx, preparedSignPosY: ny }));
                }}
                className="max-w-[200px] object-contain absolute bottom-0 left-0 origin-bottom-left"
                title="Click & Drag to move Prepared By Signature"
              />
            )}
          </div>

          {/* Labels below */}
          <input
            type="text"
            value={record.preparedByName || 'Prepared By.'}
            onChange={(e) => setRecord(prev => ({ ...prev, preparedByName: e.target.value }))}
            className="font-bold text-[9px] sm:text-[9.5px] text-black bg-transparent border-b border-transparent focus:border-amber-500 outline-none leading-tight"
            placeholder="Prepared By."
          />
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: OFFICIAL STAMP & APPROVED BY SIGNATURE                             */}
        {/* ========================================================================= */}
        <div className="text-right flex flex-col justify-end relative items-end w-80 shrink-0">
          
          {/* Action buttons matching screenshot */}
          <div className="flex items-center justify-end gap-1.5 mb-1 print:hidden z-30">
            <button
              type="button"
              onClick={() => approvedSignInputRef.current?.click()}
              className="px-1.5 py-0.5 bg-amber-50/90 hover:bg-amber-100 text-amber-900 rounded border border-amber-300 cursor-pointer transition-all inline-flex items-center gap-1 text-[8.5px] font-sans font-bold shadow-2xs"
              title="Upload Approved By Signature Image"
            >
              <Upload className="w-2.5 h-2.5 text-amber-700" />
              <span>Upload Approved Sign</span>
              <span className="text-amber-700 font-bold">*</span>
            </button>
            <button
              type="button"
              onClick={() => stampInputRef.current?.click()}
              className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded border border-blue-300 cursor-pointer transition-all inline-flex items-center gap-1 text-[8.5px] font-sans font-bold shadow-2xs"
              title="Upload Official Rubber Stamp Image"
            >
              <Upload className="w-2.5 h-2.5 text-blue-700" />
              <span>Upload Stamp</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (record.showSeal !== false) {
                  setRecord(prev => ({ ...prev, showSeal: false, stampSealImage: '' }));
                } else {
                  setRecord(prev => ({ ...prev, showSeal: true }));
                }
              }}
              className="text-[8.5px] text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer ml-0.5"
              title="Toggle Official Stamp"
            >
              {record.showSeal !== false ? 'Remove Stamp' : 'Show Stamp'}
            </button>
          </div>

          {/* Interactive Draggable Stamp & Approval Canvas Slot */}
          <div className="relative h-14 w-72 mb-1 flex items-end justify-end">
            
            {/* Rubber Stamp Overlay (Draggable & Resizable) */}
            {stampSrc && (
              <DraggableImage
                src={stampSrc}
                alt="Official Stamp"
                height={stampHeight}
                posX={stampPosX}
                posY={stampPosY}
                onPositionChange={(nx, ny) => {
                  setRecord(prev => ({ ...prev, stampPosX: nx, stampPosY: ny }));
                }}
                className="max-w-[200px] object-contain absolute bottom-0 right-28 origin-bottom-right pointer-events-auto"
                title="Click & Drag to move Official Rubber Stamp"
              />
            )}

            {/* Approved Signature (Draggable & Resizable) */}
            {approvedSignSrc && (
              <DraggableImage
                src={approvedSignSrc}
                alt="Approved Signature"
                height={approvedSignHeight}
                posX={approvedSignPosX}
                posY={approvedSignPosY}
                onPositionChange={(nx, ny) => {
                  setRecord(prev => ({ ...prev, approvedSignPosX: nx, approvedSignPosY: ny }));
                }}
                className="max-w-[200px] object-contain absolute bottom-0 right-0 origin-bottom-right"
                title="Click & Drag to move Approved By Signature"
              />
            )}
          </div>

          {/* Labels below */}
          <input
            type="text"
            value={record.approvedByName || 'Approved By.'}
            onChange={(e) => setRecord(prev => ({ ...prev, approvedByName: e.target.value }))}
            className="font-bold text-[9px] sm:text-[9.5px] text-black bg-transparent border-b border-transparent focus:border-amber-500 outline-none leading-tight text-right w-full"
            placeholder="Approved By."
          />
        </div>

      </div>

    </div>
  );
};
