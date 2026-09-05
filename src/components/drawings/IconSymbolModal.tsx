import React from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { CanvasAnnotationIcon } from './drawingTypes';

interface IconSymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIcon: (type: CanvasAnnotationIcon['type'], label?: string) => void;
}

export const ICON_DEFINITIONS: { type: CanvasAnnotationIcon['type']; label: string; category: string; desc: string }[] = [
  { type: 'hex_nut', label: 'Hex Nut', category: 'Fasteners', desc: 'Hexagonal Nut ⬡ Symbol' },
  { type: 'washer', label: 'Flat Washer', category: 'Fasteners', desc: 'Standard Round Flat Washer ⭘' },
  { type: 'plate_washer', label: 'Plate Washer', category: 'Fasteners', desc: 'Square Anchor Plate Washer ▱' },
  { type: 'weld_symbol', label: 'Fillet Weld', category: 'Symbols', desc: 'Welding Fillet Symbol ◺' },
  { type: 'centerline', label: 'Centerline', category: 'Symbols', desc: 'Engineering Centerline Symbol ℄' },
  { type: 'north_arrow', label: 'North Arrow', category: 'Symbols', desc: 'Orientation Compass North Arrow 🧭' },
  { type: 'rev_triangle', label: 'Rev Delta', category: 'Symbols', desc: 'Revision Delta Marker Δ' },
  { type: 'qc_stamp', label: 'QC Passed', category: 'Symbols', desc: 'Quality Control Approval Stamp ✔' },
  { type: 'warning', label: 'Critical Note', category: 'Symbols', desc: 'Critical Specification Warning ⚠' },
  { type: 'datum', label: 'Datum Target', category: 'Symbols', desc: 'CAD Alignment Datum Target ⨁' }
];

export const IconSymbolModal: React.FC<IconSymbolModalProps> = ({ isOpen, onClose, onAddIcon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none">+ Add Icon / Blueprint Symbol</h3>
              <p className="text-[11px] text-slate-400 mt-1">Place draggable engineering symbols on the drawing canvas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Fasteners */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Fastener Components
            </span>
            <div className="grid grid-cols-3 gap-2">
              {ICON_DEFINITIONS.filter(i => i.category === 'Fasteners').map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    onAddIcon(item.type, item.label);
                    onClose();
                  }}
                  className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-400 flex items-center justify-center shadow-2xs">
                    {item.type === 'hex_nut' && (
                      <svg viewBox="0 0 28 28" className="w-6 h-6">
                        <polygon points="14,2 26,9 26,23 14,30 2,23 2,9" fill="#fff" stroke="#000" strokeWidth="2" />
                        <circle cx="14" cy="16" r="6" fill="none" stroke="#000" strokeWidth="1.5" />
                      </svg>
                    )}
                    {item.type === 'washer' && (
                      <svg viewBox="0 0 28 28" className="w-6 h-6">
                        <circle cx="14" cy="14" r="12" fill="#fff" stroke="#000" strokeWidth="2" />
                        <circle cx="14" cy="14" r="5.5" fill="none" stroke="#000" strokeWidth="1.5" />
                      </svg>
                    )}
                    {item.type === 'plate_washer' && (
                      <svg viewBox="0 0 28 28" className="w-6 h-6">
                        <rect x="3" y="3" width="22" height="22" fill="#fff" stroke="#000" strokeWidth="2" rx="1" />
                        <circle cx="14" cy="14" r="6" fill="none" stroke="#000" strokeWidth="1.5" />
                      </svg>
                    )}
                  </div>
                  <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-900 leading-none">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Blueprint / CAD Symbols */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Engineering & CAD Symbols
            </span>
            <div className="grid grid-cols-3 gap-2">
              {ICON_DEFINITIONS.filter(i => i.category === 'Symbols').map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    onAddIcon(item.type, item.label);
                    onClose();
                  }}
                  className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-400 flex items-center justify-center shadow-2xs">
                    {item.type === 'weld_symbol' && (
                      <svg viewBox="0 0 28 28" className="w-6 h-6">
                        <line x1="2" y1="20" x2="26" y2="20" stroke="#000" strokeWidth="2" />
                        <polygon points="6,20 18,20 18,8" fill="#fff" stroke="#000" strokeWidth="1.5" />
                      </svg>
                    )}
                    {item.type === 'centerline' && (
                      <span className="font-serif font-bold text-xl text-black">℄</span>
                    )}
                    {item.type === 'north_arrow' && (
                      <svg viewBox="0 0 28 28" className="w-6 h-6">
                        <circle cx="14" cy="14" r="12" fill="#fff" stroke="#000" strokeWidth="1.5" />
                        <polygon points="14,4 18,14 14,12 10,14" fill="#000" />
                        <text x="14" y="24" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#000">N</text>
                      </svg>
                    )}
                    {item.type === 'rev_triangle' && (
                      <svg viewBox="0 0 28 28" className="w-6 h-6">
                        <polygon points="14,3 26,24 2,24" fill="#fff" stroke="#000" strokeWidth="2" />
                        <text x="14" y="20" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#000">Δ</text>
                      </svg>
                    )}
                    {item.type === 'qc_stamp' && (
                      <svg viewBox="0 0 28 28" className="w-6 h-6">
                        <circle cx="14" cy="14" r="12" fill="#fff" stroke="#16a34a" strokeWidth="2" />
                        <path d="M7 14 L12 19 L21 9" fill="none" stroke="#16a34a" strokeWidth="2.2" />
                      </svg>
                    )}
                    {item.type === 'warning' && (
                      <span className="font-bold text-lg text-amber-600">⚠</span>
                    )}
                    {item.type === 'datum' && (
                      <span className="font-bold text-lg text-slate-800">⨁</span>
                    )}
                  </div>
                  <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-900 leading-none">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
