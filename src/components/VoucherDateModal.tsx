import React, { useState, useEffect, useRef } from 'react';
import { Calendar, X, Check, Clock } from 'lucide-react';
import { playClickSound } from '../utils/audioChimes';

interface VoucherDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string;
  onDateChange: (newDate: string) => void;
}

export default function VoucherDateModal({
  isOpen,
  onClose,
  currentDate,
  onDateChange,
}: VoucherDateModalProps) {
  const [dateValue, setDateValue] = useState(() => {
    return currentDate || localStorage.getItem('MFI_CURRENT_VOUCHER_DATE') || new Date().toISOString().split('T')[0];
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const activeDate = currentDate || localStorage.getItem('MFI_CURRENT_VOUCHER_DATE') || new Date().toISOString().split('T')[0];
      setDateValue(activeDate);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, currentDate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleApply();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, dateValue]);

  const handleApply = () => {
    if (!dateValue) return;
    localStorage.setItem('MFI_CURRENT_VOUCHER_DATE', dateValue);
    window.dispatchEvent(new CustomEvent('voucher_date_changed', { detail: dateValue }));
    playClickSound();
    onDateChange(dateValue);
    onClose();
  };

  const setPreset = (type: 'today' | 'yesterday' | 'firstOfMonth') => {
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    } else if (type === 'firstOfMonth') {
      d.setDate(1);
    }
    const formatted = d.toISOString().split('T')[0];
    setDateValue(formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-md bg-[#536573] rounded-t-lg rounded-b-md shadow-2xl border border-slate-600 overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-[#536573] px-5 py-3 flex items-center justify-between text-white border-b border-slate-500/60 select-none">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span className="font-black text-base sm:text-lg tracking-wider uppercase text-slate-100">
              VOUCHER DATE
            </span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xs">
              (F2)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-600/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="bg-[#f0f4f8] p-5 space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-300 space-y-2">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
              Current Working Voucher Date:
            </label>
            <input
              ref={inputRef}
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-400 focus:border-[#083c54] focus:bg-white rounded font-mono font-bold text-lg text-slate-900 focus:outline-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase">Quick Shortcuts:</span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPreset('today')}
                className="py-2 px-3 bg-white hover:bg-slate-200 border border-slate-300 rounded text-sm font-bold text-slate-800 cursor-pointer transition-colors text-center shadow-2xs"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setPreset('yesterday')}
                className="py-2 px-3 bg-white hover:bg-slate-200 border border-slate-300 rounded text-sm font-bold text-slate-800 cursor-pointer transition-colors text-center shadow-2xs"
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setPreset('firstOfMonth')}
                className="py-2 px-3 bg-white hover:bg-slate-200 border border-slate-300 rounded text-sm font-bold text-slate-800 cursor-pointer transition-colors text-center shadow-2xs"
              >
                1st of Month
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="bg-[#485966] px-5 py-3 text-white text-xs sm:text-sm flex items-center justify-between border-t border-slate-600 select-none">
          <span className="text-slate-300">Press <strong className="text-amber-400 font-bold">Enter</strong> to apply, <strong className="text-slate-200 font-bold">Esc</strong> to cancel</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs sm:text-sm cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" /> Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
