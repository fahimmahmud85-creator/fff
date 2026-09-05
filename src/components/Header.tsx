import React, { useState, useEffect } from 'react';
import { Anchor, Phone, Mail, MapPin, HardHat, FileText, Home, Settings, Package, ClipboardList, CheckSquare, Layers } from 'lucide-react';
import { AppUser } from '../types';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  totalBalanceWeight: number;
  totalOutgoingWeight: number;
  currentUser: AppUser | null;
  onLogout: () => void;
  activeCompany?: CompanyProfile;
}

export default function Header({
  currentTab,
  setCurrentTab,
  totalBalanceWeight,
  totalOutgoingWeight,
  currentUser,
  onLogout,
  activeCompany: propActiveCompany,
}: HeaderProps) {
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => propActiveCompany || getActiveCompany());

  useEffect(() => {
    if (propActiveCompany) {
      setActiveCompany(propActiveCompany);
    }
  }, [propActiveCompany]);

  useEffect(() => {
    const handleCompanyChange = (e: any) => {
      if (e.detail) {
        setActiveCompany(e.detail);
      } else {
        setActiveCompany(getActiveCompany());
      }
    };
    window.addEventListener('active_company_changed', handleCompanyChange);
    window.addEventListener('company_profile_updated', handleCompanyChange);
    return () => {
      window.removeEventListener('active_company_changed', handleCompanyChange);
      window.removeEventListener('company_profile_updated', handleCompanyChange);
    };
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'Settings', icon: Settings },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'technical', label: 'Technical Details', icon: FileText },
    { id: 'workflow', label: 'Work Order', icon: ClipboardList },
    { id: 'stores_qc', label: 'Store QC', icon: CheckSquare },
    { id: 'erp', label: 'ERP Hub', icon: Layers },
  ];

  const brandDisplayName = activeCompany.shortName || (activeCompany.code === 'MFI' ? 'MARINE FASTENERS' : activeCompany.name.split(' ')[0]) || 'MARINE FASTENERS';
  const companyTagline = activeCompany.subtitle || 'MANUFACTURER & SUPPLIER OF FASTENERS, FITTINGS & FIXING ACCESSORIES';

  return (
    <header className="bg-white border-b-2 sm:border-b-4 border-brand-orange shadow-xs relative z-30 font-sans">
      {/* Mobile Top Bar (Responsive view header) */}
      <div className="lg:hidden bg-slate-950 text-white font-sans border-b border-slate-800 px-4 py-2.5 flex flex-col gap-2 relative z-30 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('home')}>
            <span className="text-xs font-semibold tracking-widest text-brand-orange uppercase">{brandDisplayName}</span>
            <span className="bg-[#FF6B00] text-white text-[8px] font-black px-1.5 py-0.2 rounded-xs uppercase">{activeCompany.code || 'ERP'}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="flex items-center gap-2 font-mono text-[9.5px]">
                <span className="text-emerald-400 font-semibold uppercase shrink text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {currentUser.firstName}
                </span>
                <span className="text-slate-700">|</span>
                <button
                  onClick={onLogout}
                  className="bg-[#f37021] text-white hover:bg-orange-600 px-2.5 py-1 rounded font-semibold text-[9.5px] uppercase cursor-pointer transition-colors shadow-2xs"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Utility Bar with Contact details (Desktop Only) */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center font-medium">
            <span className="flex items-center gap-1.5 transition-colors hover:text-brand-orange">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              {activeCompany.address || 'Industrial Area, Ajman, UAE'}
            </span>
            {activeCompany.phone && (
              <a href={`tel:${activeCompany.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1.5 transition-colors hover:text-brand-orange">
                <Phone className="w-3.5 h-3.5 text-brand-orange" />
                {activeCompany.phone}
              </a>
            )}
            {activeCompany.email && (
              <a href={`mailto:${activeCompany.email}`} className="flex items-center gap-1.5 transition-colors hover:text-brand-orange">
                <Mail className="w-3.5 h-3.5 text-brand-orange" />
                {activeCompany.email}
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-4 font-mono text-[10px]">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  {currentUser.firstName} ({currentUser.role.toUpperCase()})
                </span>
                <span className="text-slate-500 font-normal">|</span>
                <button 
                  onClick={onLogout}
                  className="text-brand-orange hover:text-orange-400 uppercase font-semibold cursor-pointer transition-colors"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentTab('about')}
                className="text-brand-orange hover:text-orange-400 font-semibold flex items-center gap-1 uppercase bg-orange-500/10 px-2 py-0.5 border border-[#f37021]/20 rounded-xs cursor-pointer text-[9px]"
              >
                🔒 SECURE LOGIN
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 py-5 flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-4 self-start md:self-auto cursor-pointer group" onClick={() => setCurrentTab('home')}>
          <div className="flex flex-col pl-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-brand-orange transition-colors uppercase">
              {activeCompany.name}
            </h1>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              {companyTagline}
            </span>
          </div>
        </div>

        {/* Dynamic Global KPI Summary with Solid Left Borders - Only shown when Products tab is active */}
        {currentTab === 'products' ? (
          <div className="flex gap-6 w-full md:w-auto self-end md:self-auto justify-around md:justify-end">
            <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-3 px-4 border-l-4 border-brand-orange shadow-xs min-w-[170px]">
              <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">BALANCE STOCK TOTAL</span>
              <span id="header-balance-stock" className="text-lg font-bold text-brand-orange font-mono">
                {totalBalanceWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-500 font-sans">KG</span>
              </span>
            </div>

            <div className="bg-slate-50 hover:bg-slate-100 transition-colors p-3 px-4 border-l-4 border-slate-300 shadow-xs min-w-[170px]">
              <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">OUTGOING STOCK TOTAL</span>
              <span id="header-outgoing-stock" className="text-lg font-bold text-slate-850 font-mono">
                {totalOutgoingWeight.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-500 font-sans">KG</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden md:block w-32" /> // spacer to balance layout
        )}
      </div>

      {/* Tabs Menu Bar */}
      <div className="bg-slate-50 border-t border-slate-200/60 px-4">
        <div className="max-w-7xl mx-auto flex justify-center sm:justify-start">
          <nav className="flex space-x-1 sm:space-x-1 py-1 font-bold text-xs uppercase tracking-wider select-none no-scrollbar overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none]">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-4 py-2.5 transition-all uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${
                    tab.id === 'stores_qc' ? 'text-[8.5px] font-semibold tracking-wide' : tab.id === 'erp' ? 'text-[9.2px] font-semibold tracking-wide' : 'text-[11px]'
                  } ${
                    isActive
                      ? 'text-brand-orange bg-white border-b-2 border-brand-orange font-bold'
                      : 'text-slate-600 hover:text-brand-orange hover:bg-slate-100/60 font-bold'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
