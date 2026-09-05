import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Edit2 } from 'lucide-react';
import { CompanyProfile, getCompaniesList } from '../utils/companyProfile';
import { playClickSound } from '../utils/audioChimes';

interface ListOfCompaniesModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies?: CompanyProfile[];
  activeCompany: CompanyProfile;
  onSelectCompany: (company: CompanyProfile) => void;
  onAddNewCompany: () => void;
  onShutCompany?: () => void;
  onEditCompany?: (company: CompanyProfile) => void;
}

export interface CompanyMenuItem {
  id: string;
  name: string;
  category: 'ACTIONS' | 'COMPANIES';
  codeNumber?: string;
  company?: CompanyProfile;
  actionType?: 'create' | 'select' | 'shut' | 'alter';
}

export default function ListOfCompaniesModal({
  isOpen,
  onClose,
  companies: propsCompanies,
  activeCompany,
  onSelectCompany,
  onAddNewCompany,
  onShutCompany,
  onEditCompany,
}: ListOfCompaniesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Always load latest companies
  const allCompanies = propsCompanies && propsCompanies.length > 0 ? propsCompanies : getCompaniesList();

  const getCompanyDisplayName = (comp: CompanyProfile) => {
    return comp.name || comp.shortName || 'Company';
  };

  const getCompanyNumber = (comp: CompanyProfile, index: number) => {
    if (comp.id === 'comp-mfi' || comp.code === 'MFI') return '100000';
    if (comp.id === 'comp-bmm' || comp.code === 'BMM') return '100001';
    if (comp.id === 'comp-umi' || comp.code === 'UMI') return '100002';
    return `${100000 + index}`;
  };

  const actionItems: CompanyMenuItem[] = [
    { id: 'act-create', name: 'Create Company', category: 'ACTIONS', actionType: 'create' },
    { id: 'act-alter', name: 'Alter / Edit Company', category: 'ACTIONS', actionType: 'alter' },
    { id: 'act-select', name: 'Select Company', category: 'ACTIONS', actionType: 'select' },
    { id: 'act-shut', name: 'Shut Company', category: 'ACTIONS', actionType: 'shut' },
  ];

  const companyItems: CompanyMenuItem[] = allCompanies.map((c, idx) => ({
    id: c.id,
    name: getCompanyDisplayName(c),
    category: 'COMPANIES',
    codeNumber: getCompanyNumber(c, idx),
    company: c,
  }));

  const allItems: CompanyMenuItem[] = [...actionItems, ...companyItems];

  const filteredItems = allItems.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesName = item.name.toLowerCase().includes(term);
    const matchesCode = item.codeNumber ? item.codeNumber.toLowerCase().includes(term) : false;
    const matchesCat = item.category.toLowerCase().includes(term);
    return matchesName || matchesCode || matchesCat;
  });

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      // Default selection on current active company
      const activeIdx = filteredItems.findIndex(item => item.company?.id === activeCompany.id);
      setSelectedIndex(activeIdx >= 0 ? activeIdx : 3);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, activeCompany.id]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, showInactive]);

  const handleExecuteSelection = (item: CompanyMenuItem) => {
    if (!item) return;
    playClickSound();
    if (item.category === 'ACTIONS') {
      if (item.actionType === 'create') {
        onClose();
        onAddNewCompany();
      } else if (item.actionType === 'shut') {
        if (onShutCompany) {
          onShutCompany();
        } else {
          const nextComp = allCompanies.find(c => c.id !== activeCompany.id);
          if (nextComp) {
            onSelectCompany(nextComp);
          }
        }
        onClose();
      } else if (item.actionType === 'alter') {
        if (onEditCompany) {
          onClose();
          onEditCompany(activeCompany);
        }
      } else if (item.actionType === 'select') {
        const firstCompIdx = filteredItems.findIndex(i => i.category === 'COMPANIES');
        if (firstCompIdx >= 0) setSelectedIndex(firstCompIdx);
      }
    } else if (item.category === 'COMPANIES' && item.company) {
      onSelectCompany(item.company);
      onClose();
    }
  };

  // Keyboard Navigation: Up, Down, Enter, Esc with capture phase
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
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
        playClickSound();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
        playClickSound();
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.min(filteredItems.length - 1, prev + 5));
        playClickSound();
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => Math.max(0, prev - 5));
        playClickSound();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredItems[selectedIndex]) {
          handleExecuteSelection(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

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

  const actionsFiltered = filteredItems.filter(item => item.category === 'ACTIONS');
  const companiesFiltered = filteredItems.filter(item => item.category === 'COMPANIES');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-100 font-sans">
      <div className="w-full max-w-2xl bg-[#536573] rounded-t-lg rounded-b-md shadow-2xl border border-slate-600 overflow-hidden flex flex-col font-sans">
        
        {/* Top Header Bar Matching List of Voucher Types Exact Color & Typography */}
        <div className="bg-[#536573] px-5 py-3 flex items-center justify-between text-white border-b border-slate-500/60 select-none">
          <div className="flex items-center gap-2.5">
            <span className="font-black text-base sm:text-lg tracking-wider uppercase text-slate-100">
              LIST OF COMPANIES
            </span>
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xs">
              (F3)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-600/50 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar Matching List of Voucher Types */}
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
                  setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
                  playClickSound();
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
                  playClickSound();
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredItems[selectedIndex]) {
                    handleExecuteSelection(filteredItems[selectedIndex]);
                  }
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="Search company name, code or action..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#083c54]"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onAddNewCompany();
            }}
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

        {/* Company & Action List Content */}
        <div ref={listRef} className="bg-white max-h-[460px] overflow-y-auto divide-y divide-slate-100 select-none">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching companies or actions found for "{searchTerm}"
            </div>
          ) : (
            <>
              {/* Actions Group */}
              {actionsFiltered.length > 0 && (
                <div>
                  <div className="bg-[#f8fafc] px-4 py-2 text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    COMPANY ACTIONS
                  </div>
                  {actionsFiltered.map((item) => {
                    const globalIdx = filteredItems.findIndex(v => v.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => handleExecuteSelection(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-l-4 ${
                          isSelected
                            ? 'bg-[#f5b819] text-slate-950 border-[#b45309] font-black shadow-xs'
                            : 'hover:bg-slate-50 text-slate-800 border-transparent font-medium'
                        }`}
                      >
                        <span className="text-sm sm:text-base">{item.name}</span>
                        <span className={`text-xs sm:text-sm font-mono px-2.5 py-1 rounded font-bold ${
                          isSelected ? 'bg-slate-950 text-amber-300 shadow-xs' : 'text-slate-600 bg-slate-100'
                        }`}>
                          Action
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Companies Group */}
              {companiesFiltered.length > 0 && (
                <div>
                  <div className="bg-[#f8fafc] px-4 py-2 text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider border-y border-slate-200 sticky top-0 z-10">
                    COMPANIES
                  </div>
                  {companiesFiltered.map((item) => {
                    const globalIdx = filteredItems.findIndex(v => v.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    const isActiveCompany = item.company?.id === activeCompany.id;

                    return (
                      <div
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => handleExecuteSelection(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors border-l-4 ${
                          isSelected
                            ? 'bg-[#f5b819] text-slate-950 border-[#b45309] font-black shadow-xs'
                            : 'hover:bg-slate-50 text-slate-800 border-transparent font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-bold">{item.name}</span>
                          {isActiveCompany && (
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-600 text-white font-black rounded-xs">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-mono italic px-2.5 py-1 rounded font-bold ${
                            isSelected ? 'bg-slate-950 text-amber-300 shadow-xs' : 'text-slate-600 bg-slate-100'
                          }`}>
                            {item.codeNumber}
                          </span>
                          {onEditCompany && item.company && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                onEditCompany(item.company!);
                              }}
                              className={`p-1.5 rounded hover:bg-black/10 transition-colors cursor-pointer ${
                                isSelected ? 'text-slate-950 hover:bg-black/20' : 'text-slate-500 hover:text-slate-800'
                              }`}
                              title={`Edit ${item.name}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
            {allCompanies.length} Companies Available
          </span>
        </div>

      </div>
    </div>
  );
}
