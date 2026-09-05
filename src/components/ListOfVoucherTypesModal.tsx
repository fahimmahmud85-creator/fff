import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, ArrowUp, ArrowDown, CornerDownLeft, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audioChimes';

export interface VoucherTypeItem {
  id: string;
  name: string;
  category: 'ACCOUNTING VOUCHERS' | 'INVENTORY VOUCHERS';
  shortcut: string;
  tabId: string;
  inactive?: boolean;
}

export const VOUCHER_TYPES: VoucherTypeItem[] = [
  // Accounting Vouchers
  { id: 'contra', name: 'Contra Voucher', category: 'ACCOUNTING VOUCHERS', shortcut: 'F4', tabId: 'contra' },
  { id: 'payment', name: 'Payment Voucher', category: 'ACCOUNTING VOUCHERS', shortcut: 'F5', tabId: 'payment' },
  { id: 'receipt', name: 'Receipt Voucher', category: 'ACCOUNTING VOUCHERS', shortcut: 'F6', tabId: 'receipt' },
  { id: 'journal', name: 'Journal Voucher', category: 'ACCOUNTING VOUCHERS', shortcut: 'F7', tabId: 'journal' },
  { id: 'sales', name: 'Sales Voucher (Tax Invoice)', category: 'ACCOUNTING VOUCHERS', shortcut: 'F8', tabId: 'invoice' },
  { id: 'purchase', name: 'Purchase Voucher', category: 'ACCOUNTING VOUCHERS', shortcut: 'F9', tabId: 'supplier_purchase' },
  { id: 'debit_note', name: 'Debit Note Voucher', category: 'ACCOUNTING VOUCHERS', shortcut: 'Alt+F5', tabId: 'debit_note' },
  { id: 'credit_note', name: 'Credit Notes Voucher', category: 'ACCOUNTING VOUCHERS', shortcut: 'Alt+F6', tabId: 'credit_note' },
  { id: 'proforma', name: 'Proforma Invoice', category: 'ACCOUNTING VOUCHERS', shortcut: 'Alt+F8', tabId: 'invoice_record' },
  { id: 'soa', name: 'Statement of Accounts', category: 'ACCOUNTING VOUCHERS', shortcut: 'Alt+F9', tabId: 'customer_soa' },

  // Inventory & Logistics Vouchers
  { id: 'stock_ledger', name: 'Stock Ledger Sheet', category: 'INVENTORY VOUCHERS', shortcut: 'F10', tabId: 'stock_reports' },
  { id: 'packing_list', name: 'Packing List', category: 'INVENTORY VOUCHERS', shortcut: 'F11', tabId: 'packing_list' },
  { id: 'quotation', name: 'Quotation Voucher', category: 'INVENTORY VOUCHERS', shortcut: 'F12', tabId: 'quotation' },
  { id: 'work_order', name: 'Work Order Voucher', category: 'INVENTORY VOUCHERS', shortcut: 'Alt+F4', tabId: 'work_orders_suite' },
  { id: 'standard_delivery_note', name: 'Standard Delivery Note', category: 'INVENTORY VOUCHERS', shortcut: 'Alt+F3', tabId: 'delivery_notes' },
  { id: 'coating_delivery_note', name: 'Coating Delivery Note', category: 'INVENTORY VOUCHERS', shortcut: 'Alt+F2', tabId: 'quotation' },
  { id: 'goods_return_notes', name: 'Goods Return Notes', category: 'INVENTORY VOUCHERS', shortcut: 'Alt+F1', tabId: 'incoming_materials' },
];

interface ListOfVoucherTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoucher: (tabId: string, voucherName: string) => void;
}

export default function ListOfVoucherTypesModal({ isOpen, onClose, onSelectVoucher }: ListOfVoucherTypesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredVouchers = VOUCHER_TYPES.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (!showInactive && v.inactive) return false;
    return matchesSearch;
  });

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, showInactive]);

  // Global Keyboard handlers for F1, Arrow keys, Enter, Esc with event capture
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => (prev < filteredVouchers.length - 1 ? prev + 1 : 0));
        playClickSound();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredVouchers.length - 1));
        playClickSound();
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.min(filteredVouchers.length - 1, prev + 5));
        playClickSound();
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.max(0, prev - 5));
        playClickSound();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredVouchers[selectedIndex]) {
          const item = filteredVouchers[selectedIndex];
          onSelectVoucher(item.tabId, item.name);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredVouchers, selectedIndex, onClose, onSelectVoucher]);

  // Auto-scroll selected item into view whenever selectedIndex changes
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  const accountingList = filteredVouchers.filter(v => v.category === 'ACCOUNTING VOUCHERS');
  const inventoryList = filteredVouchers.filter(v => v.category === 'INVENTORY VOUCHERS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-[#536573] rounded-t-lg rounded-b-md shadow-2xl border border-slate-600 overflow-hidden flex flex-col font-sans">
        {/* Top Header Bar */}
        <div className="bg-[#536573] px-5 py-3 flex items-center justify-between text-white border-b border-slate-500/60 select-none">
          <div className="flex items-center gap-2.5">
            <span className="font-black text-base sm:text-lg tracking-wider uppercase text-slate-100">
              LIST OF VOUCHER TYPES
            </span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xs">
              (F1)
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

        {/* Search & Actions Bar */}
        <div className="bg-[#f0f4f8] px-4 py-3 border-b border-slate-300 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedIndex(prev => (prev < filteredVouchers.length - 1 ? prev + 1 : 0));
                  playClickSound();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredVouchers.length - 1));
                  playClickSound();
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredVouchers[selectedIndex]) {
                    const item = filteredVouchers[selectedIndex];
                    onSelectVoucher(item.tabId, item.name);
                    onClose();
                  }
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="Type voucher name or shortcut..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#083c54]"
            />
          </div>
          <button
            type="button"
            onClick={() => onSelectVoucher('invoice', 'New Custom Voucher')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#083c54] border border-slate-300 rounded text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#083c54]" />
            <span>Create</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInactive(!showInactive)}
            className={`px-3 py-2 rounded text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
              showInactive ? 'bg-[#083c54] text-white border-[#083c54]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Show Inactive
          </button>
        </div>

        {/* Voucher List Content */}
        <div ref={listRef} className="bg-white max-h-[460px] overflow-y-auto divide-y divide-slate-100 select-none">
          {filteredVouchers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching voucher types found for "{searchTerm}"
            </div>
          ) : (
            <>
              {/* Accounting Vouchers Group */}
              {accountingList.length > 0 && (
                <div>
                  <div className="bg-[#f8fafc] px-4 py-2 text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    ACCOUNTING VOUCHERS
                  </div>
                  {accountingList.map((item) => {
                    const globalIdx = filteredVouchers.findIndex(v => v.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => {
                          onSelectVoucher(item.tabId, item.name);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-l-4 ${
                          isSelected
                            ? 'bg-[#f5b819] text-slate-950 border-[#b45309] font-black shadow-xs'
                            : 'hover:bg-slate-50 text-slate-800 border-transparent font-medium'
                        }`}
                      >
                        <span className="text-sm sm:text-base">{item.name}</span>
                        <span className={`text-xs sm:text-sm font-mono italic px-2.5 py-1 rounded font-bold ${
                          isSelected ? 'bg-slate-950 text-amber-300 shadow-xs' : 'text-slate-600 bg-slate-100'
                        }`}>
                          {item.shortcut}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inventory Vouchers Group */}
              {inventoryList.length > 0 && (
                <div>
                  <div className="bg-[#f8fafc] px-4 py-2 text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider border-y border-slate-200 sticky top-0 z-10">
                    INVENTORY VOUCHERS
                  </div>
                  {inventoryList.map((item) => {
                    const globalIdx = filteredVouchers.findIndex(v => v.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => {
                          onSelectVoucher(item.tabId, item.name);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-l-4 ${
                          isSelected
                            ? 'bg-[#f5b819] text-slate-950 border-[#b45309] font-black shadow-xs'
                            : 'hover:bg-slate-50 text-slate-800 border-transparent font-medium'
                        }`}
                      >
                        <span className="text-sm sm:text-base">{item.name}</span>
                        <span className={`text-xs sm:text-sm font-mono italic px-2.5 py-1 rounded font-bold ${
                          isSelected ? 'bg-slate-950 text-amber-300 shadow-xs' : 'text-slate-600 bg-slate-100'
                        }`}>
                          {item.shortcut}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Shortcut Navigation Bar */}
        <div className="bg-[#485966] px-4 py-2.5 text-white text-xs sm:text-sm flex items-center justify-between border-t border-slate-600 select-none font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-bold">↑</span>
              <span className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-bold">↓</span>
              <span className="text-slate-200">Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-xs font-black">Enter</span>
              <span className="text-slate-200">Select</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-slate-700 px-1.5 py-0.5 rounded text-xs font-bold">Esc</span>
              <span className="text-slate-200">Close</span>
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-300 font-mono font-bold">
            {filteredVouchers.length} Types Available
          </span>
        </div>
      </div>
    </div>
  );
}
