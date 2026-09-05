import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Building2, X, Save, RotateCcw, Upload, Image, Stamp, Move, Trash2, CheckSquare, Square, Loader2, Plus, Check, ShieldAlert, Landmark, UserCheck, Award, Globe, Phone, Mail, User, ShieldCheck, QrCode } from 'lucide-react';
import { getCompaniesList, getActiveCompany, getCompanyById, saveCompanyProfile, addCompany, updateCompany, compressImage, cleanAndEnhanceStampImage, DEFAULT_COMPANY_PROFILE, DEFAULT_COMPANIES, CompanyProfile, setActiveCompanyId, getUserCompanies } from '../utils/companyProfile';
import { AppUser } from '../types';
import { validateUaeTrn } from '../utils/uaeEInvoicing';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCompanyId?: string;
  currentUser?: AppUser | null;
  onSaved?: (updated: CompanyProfile) => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ isOpen, onClose, initialCompanyId, currentUser, onSaved }) => {
  // Resolve effective user from props or localStorage
  const effectiveUser = useMemo(() => {
    if (currentUser) return currentUser;
    try {
      const saved = localStorage.getItem('mf_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }, [currentUser]);

  const isAdmin = !effectiveUser || effectiveUser.role === 'Admin';
  const [allCompanies, setAllCompanies] = useState<CompanyProfile[]>(getCompaniesList);
  
  const allowedCompanies = useMemo(() => {
    return getUserCompanies(effectiveUser, allCompanies);
  }, [effectiveUser, allCompanies]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
    const list = getUserCompanies(effectiveUser, getCompaniesList());
    const matched = list.find(c => c.id === (initialCompanyId || getActiveCompany().id));
    return matched ? matched.id : (list[0]?.id || getActiveCompany().id);
  });

  const [profile, setProfile] = useState<CompanyProfile>(() => {
    const list = getUserCompanies(effectiveUser, getCompaniesList());
    const found = list.find(c => c.id === (initialCompanyId || getActiveCompany().id));
    return found || list[0] || getActiveCompany();
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'SELLER' | 'BANK' | 'LOGO' | 'STAMP' | 'SIGNATURE' | 'EINVOICING'>('DETAILS');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // Dragging state for stamp positioning
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const dragContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const fullList = getCompaniesList();
      setAllCompanies(fullList);
      const userList = getUserCompanies(effectiveUser, fullList);
      const targetId = initialCompanyId || getActiveCompany().id;
      const found = userList.find(c => c.id === targetId) || userList[0] || getActiveCompany();
      setSelectedCompanyId(found.id);
      setProfile(found);
      setIsCreatingNew(false);
    }
  }, [isOpen, initialCompanyId, effectiveUser]);

  if (!isOpen) return null;

  const handleSelectCompany = (comp: CompanyProfile) => {
    setIsCreatingNew(false);
    setSelectedCompanyId(comp.id);
    setProfile(comp);
  };

  const handleStartNewCompany = () => {
    if (!isAdmin) {
      alert('Permission Denied: Only Admin users can add new companies.');
      return;
    }
    setIsCreatingNew(true);
    const newComp: CompanyProfile = {
      id: `comp-${Date.now()}`,
      name: '',
      shortName: '',
      code: '',
      address: '',
      trn: '',
      phone: '',
      email: '',
      website: '',
      showLogo: false,
      logoUrl: '/logo.png',
      showStamp: true,
      stampUrl: '',
      stampX: 30,
      stampY: 70,
      stampScale: 1,
      stampLayer: 'front',
      showSignatures: true,
      isDefault: false,
      authorizedUsers: []
    };
    setProfile(newComp);
    setSelectedCompanyId(newComp.id);
    setActiveTab('DETAILS');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Permission Denied: Only Admin users can save or modify company profiles.');
      return;
    }
    setIsProcessingImage(true);
    try {
      let finalProfile = { ...profile };
      if (!finalProfile.name.trim()) {
        alert('Please enter a company name.');
        setIsProcessingImage(false);
        return;
      }
      if (!finalProfile.code?.trim()) {
        finalProfile.code = finalProfile.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'CMP';
      }
      if (finalProfile.logoUrl && finalProfile.logoUrl.startsWith('data:image')) {
        finalProfile.logoUrl = await compressImage(finalProfile.logoUrl, 500);
      }
      if (finalProfile.stampUrl && finalProfile.stampUrl.startsWith('data:image')) {
        finalProfile.stampUrl = await compressImage(finalProfile.stampUrl, 400, true);
      }

      if (isCreatingNew) {
        const added = addCompany(finalProfile);
        setActiveCompanyId(added.id);
        if (onSaved) onSaved(added);
      } else {
        updateCompany(finalProfile);
        if (onSaved) onSaved(finalProfile);
      }
      onClose();
    } catch (err) {
      console.error('Error saving company profile:', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleResetDefaults = () => {
    const defaultMatch = DEFAULT_COMPANIES.find(d => d.id === selectedCompanyId || (d.code && profile.code && d.code.toUpperCase() === profile.code.toUpperCase()));
    if (defaultMatch) {
      setProfile(defaultMatch);
    } else {
      setProfile(DEFAULT_COMPANY_PROFILE);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        // Compress image to max 500px dimension
        const compressed = await compressImage(base64, 500);
        setProfile(prev => ({
          ...prev,
          showLogo: true,
          logoUrl: compressed
        }));
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Stamp Upload
  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        // Compress image to max 400px dimension with white background removal
        const compressed = await compressImage(base64, 400, true);
        setProfile(prev => ({
          ...prev,
          showStamp: true,
          stampUrl: compressed
        }));
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle ISO Logo Upload
  const handleIsoLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const compressed = await compressImage(base64, 600, false);
        setProfile(prev => ({
          ...prev,
          showIso: true,
          isoLogoUrl: compressed
        }));
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Dragging Stamp
  const handleMouseDownStamp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingStamp(true);
  };

  const handleMouseMoveContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingStamp || !dragContainerRef.current) return;
    const rect = dragContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    const percentY = Math.max(0, Math.min(100, Math.round((y / rect.height) * 100)));

    setProfile(prev => ({
      ...prev,
      stampX: percentX,
      stampY: percentY
    }));
  };

  const handleMouseUpContainer = () => {
    setIsDraggingStamp(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0e2a47] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#f37021] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#f37021] text-white rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Edit Header, Logo, Stamp & Signatures</h3>
              <p className="text-[10px] text-slate-300">Customize document headers, stamp dragging position, & signature options for all vouchers & reports</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Company Selection & Add Bar */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-5 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 font-mono shrink-0 mr-1">
              {allowedCompanies.length > 1 ? 'Select Company:' : 'Active Company:'}
            </span>
            {allowedCompanies.map((comp) => {
              const isSelected = !isCreatingNew && selectedCompanyId === comp.id;
              const isActiveGlobal = getActiveCompany().id === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => handleSelectCompany(comp)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0e2a47] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-black ${
                    isSelected ? 'bg-[#f37021] text-white' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {comp.code || 'CMP'}
                  </span>
                  <span>{comp.shortName || comp.name.split(' ')[0]}</span>
                  {isActiveGlobal && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active ERP Company"></span>
                  )}
                </button>
              );
            })}
          </div>

          {isAdmin && allowedCompanies.length > 1 ? (
            <button
              type="button"
              onClick={handleStartNewCompany}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                isCreatingNew
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Company</span>
            </button>
          ) : (
            <div className="px-2 py-1 rounded text-[10px] font-semibold text-slate-500 bg-slate-200 border border-slate-300 flex items-center gap-1 shrink-0" title="Profile scope for this entity">
              <ShieldAlert className="w-3 h-3 text-slate-500" />
              <span>{profile.code || 'ERP'} Profile</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DETAILS'
                ? 'border-[#0e2a47] text-[#0e2a47] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SELLER')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SELLER'
                ? 'border-[#0e2a47] text-[#0e2a47] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Manage Seller & Sales Exec</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BANK')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'BANK'
                ? 'border-[#0e2a47] text-[#0e2a47] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-amber-600" />
            <span>Bank Account Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOGO')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LOGO'
                ? 'border-[#0e2a47] text-[#0e2a47] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Header Logo {profile.showLogo ? '(Enabled)' : '(Disabled)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STAMP')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'STAMP'
                ? 'border-[#0e2a47] text-[#0e2a47] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stamp className="w-3.5 h-3.5" />
            <span>Stamp & Position {profile.showStamp ? '(Enabled)' : '(Disabled)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SIGNATURE')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SIGNATURE'
                ? 'border-[#0e2a47] text-[#0e2a47] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Signature Line</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EINVOICING')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'EINVOICING'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>UAE E-Invoicing (FTA)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-sans text-xs overflow-y-auto flex-1">
          {/* TAB 1: COMPANY DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    placeholder="e.g. Marine Fasteners Industries L.L.C. (Sole Proprietorship)"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company Code / Prefix *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={profile.code || ''}
                    onChange={(e) => setProfile({ ...profile, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    placeholder="e.g. MFI, BMM, UMI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.shortName || ''}
                    onChange={(e) => setProfile({ ...profile, shortName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    placeholder="e.g. Marine Fasteners"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    TRN Number (VAT Registration)
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.trn}
                    onChange={(e) => setProfile({ ...profile, trn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    placeholder="100440509600003"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    placeholder="+971 6 743 8922"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Address (Location)
                </label>
                <input
                  type="text"
                  required
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                  placeholder="Industrial Area, Ajman, UAE"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    placeholder="info@marinefasteners.ae"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Website / Web URL
                  </label>
                  <input
                    type="text"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    placeholder="www.marinefasteners.ae"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Activity Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={profile.subtitle || ''}
                  onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                  placeholder="e.g. MANUFACTURERS & STOCKISTS OF HIGH TENSILE FASTENERS & STRUCTURAL STEEL"
                />
              </div>

              {/* Department Headers */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>QC Department Head Name</span>
                    <span className="text-[9px] text-[#0e2a47] font-semibold">e.g. INDUSTRIES QC HEAD</span>
                  </label>
                  <input
                    type="text"
                    value={profile.qcDepartmentName || ''}
                    onChange={(e) => setProfile({ ...profile, qcDepartmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47] font-mono text-xs"
                    placeholder={profile.code === 'MFI' ? 'INDUSTRIES QC HEAD' : `${profile.shortName || 'QC'} QC HEAD`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Delivery / Logistics Dept.</span>
                    <span className="text-[9px] text-[#0e2a47] font-semibold">e.g. MFI LOGISTICS & DISPATCH</span>
                  </label>
                  <input
                    type="text"
                    value={profile.deliveryDepartmentName || ''}
                    onChange={(e) => setProfile({ ...profile, deliveryDepartmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47] font-mono text-xs"
                    placeholder={profile.code === 'MFI' ? 'MFI LOGISTICS & DISPATCH' : `${profile.shortName || 'LOGISTICS'} DISPATCH`}
                  />
                </div>
              </div>

              {/* ISO Certification Settings */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.showIso)}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      showIso: e.target.checked,
                      isoText: e.target.checked && !prev.isoText ? 'ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018' : prev.isoText 
                    }))}
                    className="w-4 h-4 text-[#0e2a47] rounded border-slate-300 focus:ring-[#0e2a47]"
                  />
                  <span>Display ISO Certifications Banner (ISO 9001:2015 / ISO 14001:2015 / ISO 45001:2018)</span>
                </label>
                <p className="text-[10.5px] text-slate-500 pl-6 leading-relaxed">
                  Note: ISO certification is enabled by default for <b>Marine Fasteners</b>. For other companies, it is excluded unless explicitly enabled here.
                </p>
                {profile.showIso && (
                  <div className="pl-6 pt-1 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        ISO Certification Text
                      </label>
                      <input
                        type="text"
                        value={profile.isoText || ''}
                        onChange={(e) => setProfile({ ...profile, isoText: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                        placeholder="ISO 9001:2015  •  ISO 14001:2015  •  ISO 45001:2018"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Custom ISO Badge / Logo Image
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="px-3 py-1.5 bg-[#0e2a47] hover:bg-[#163b61] text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 text-xs transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-[#f37021]" />
                          <span>Upload ISO Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIsoLogoUpload}
                            className="hidden"
                          />
                        </label>
                        {profile.isoLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, isoLogoUrl: undefined }))}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer text-xs font-bold flex items-center gap-1"
                            title="Reset to default ISO logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Reset ISO Logo</span>
                          </button>
                        )}
                      </div>
                      {profile.isoLogoUrl && (
                        <div className="mt-2 p-2 border border-slate-200 rounded-lg bg-white inline-block">
                          <img src={profile.isoLogoUrl} alt="ISO Logo Preview" className="h-10 max-w-[200px] object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MANAGE SELLER DETAILS */}
          {activeTab === 'SELLER' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-blue-50/60 p-4 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Company Seller & Quotation Signatory Profile</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Manage the official sales representative and executive details for <strong>{profile.name || 'this company'}</strong>. These details appear automatically on Quotations, Proforma Invoices, Sales Orders, and Commercial Proposals.
                </p>
              </div>

              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Seller / Executive Name *</span>
                    </label>
                    <input
                      type="text"
                      value={profile.sellerName || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, sellerName: e.target.value }))}
                      placeholder={profile.code === 'MFI' ? 'Mr. Fahim' : profile.code === 'BMM' ? 'Mr. Tariq' : 'Sales Executive Name'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Designation / Title</span>
                    </label>
                    <input
                      type="text"
                      value={profile.sellerDesignation || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, sellerDesignation: e.target.value }))}
                      placeholder={profile.code === 'MFI' ? 'Sales Executive' : 'Senior Sales Representative'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Office Landline / Phone</span>
                    </label>
                    <input
                      type="text"
                      value={profile.sellerPhone || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, sellerPhone: e.target.value }))}
                      placeholder={profile.phone || '+971 6 525 0526'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#f37021]" />
                      <span>Mobile / WhatsApp Number</span>
                    </label>
                    <input
                      type="text"
                      value={profile.sellerMobile || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, sellerMobile: e.target.value }))}
                      placeholder="+971-52-3627048 / 056-4857501"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Seller Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={profile.sellerEmail || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, sellerEmail: e.target.value }))}
                      placeholder={profile.email || 'sales@marinefasteners.co'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Company Website URL</span>
                    </label>
                    <input
                      type="text"
                      value={profile.sellerWebsite || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, sellerWebsite: e.target.value }))}
                      placeholder={profile.website || 'www.marinefasteners.co'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BANK ACCOUNT & WIRE DETAILS */}
          {activeTab === 'BANK' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-amber-50/60 p-4 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Landmark className="w-4 h-4 text-[#f37021]" />
                  <span>Company Bank & Wire Transfer Credentials</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  These bank details appear automatically on Sales Invoices, Quotations, Proforma Invoices, Customer SOA Statements, and Payment Vouchers issued under this company.
                </p>
              </div>

              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Account Beneficiary / Legal Title
                    </label>
                    <input
                      type="text"
                      value={profile.bankBeneficiary || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bankBeneficiary: e.target.value }))}
                      placeholder={profile.name}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold uppercase text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={profile.bankName || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bankName: e.target.value }))}
                      placeholder="e.g. RAK BANK / EMIRATES NBD"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold uppercase text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Branch Name / Address
                    </label>
                    <input
                      type="text"
                      value={profile.bankBranch || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bankBranch: e.target.value }))}
                      placeholder="e.g. KING FAISAL STREET, SHARJAH, UAE"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={profile.bankAccountNo || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bankAccountNo: e.target.value }))}
                      placeholder="e.g. 0242715908001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      IBAN Number
                    </label>
                    <input
                      type="text"
                      value={profile.bankIban || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bankIban: e.target.value }))}
                      placeholder="e.g. AE 940400000242715908001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      SWIFT / BIC Code
                    </label>
                    <input
                      type="text"
                      value={profile.bankSwiftCode || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bankSwiftCode: e.target.value }))}
                      placeholder="e.g. NRAKAEAK"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={profile.bankCountry || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, bankCountry: e.target.value }))}
                      placeholder="UAE"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 uppercase focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO OPTIONS */}
          {activeTab === 'LOGO' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.showLogo)}
                    onChange={(e) => setProfile(prev => ({ ...prev, showLogo: e.target.checked }))}
                    className="w-4 h-4 text-[#0e2a47] rounded border-slate-300 focus:ring-[#0e2a47]"
                  />
                  <span>Show Company Logo in Document Header</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6">
                  Check to enable logo display across Quotations, Sales, Purchases, Receipts, Payments, Vouchers, & Statements.
                </p>
              </div>

              <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Upload or Select Logo Image
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="px-4 py-2.5 bg-[#0e2a47] hover:bg-[#163b61] text-white font-bold rounded-lg cursor-pointer flex items-center gap-2 transition-colors shadow-2xs">
                    <Upload className="w-4 h-4 text-[#f37021]" />
                    <span>Upload Logo Image (PNG / JPG / SVG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, logoUrl: '/logo.png' }))}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Use Default /logo.png
                  </button>

                  {profile.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, logoUrl: '' }))}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                      title="Clear Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Logo Preview */}
                {profile.logoUrl && (
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 inline-block mt-2">
                    <span className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Current Header Logo Preview:</span>
                    <img src={profile.logoUrl} alt="Logo Preview" className="max-h-20 max-w-xs object-contain border border-slate-200 rounded bg-white p-1" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STAMP & DRAGGING POSITION */}
          {activeTab === 'STAMP' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.showStamp)}
                    onChange={(e) => setProfile(prev => ({ ...prev, showStamp: e.target.checked }))}
                    className="w-4 h-4 text-[#0e2a47] rounded border-slate-300 focus:ring-[#0e2a47]"
                  />
                  <span>Show Official Company Stamp / Seal</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6">
                  Enable to attach your official company stamp or digital seal to printed documents and vouchers.
                </p>
              </div>

              <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Upload Stamp / Seal Image
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="px-4 py-2.5 bg-[#0e2a47] hover:bg-[#163b61] text-white font-bold rounded-lg cursor-pointer flex items-center gap-2 transition-colors shadow-2xs">
                    <Upload className="w-4 h-4 text-[#f37021]" />
                    <span>Upload Stamp Image (PNG / JPG / Transparent PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStampUpload}
                      className="hidden"
                    />
                  </label>

                  {profile.stampUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!profile.stampUrl) return;
                          setIsProcessingImage(true);
                          const cleaned = await cleanAndEnhanceStampImage(profile.stampUrl);
                          setProfile(prev => ({ ...prev, stampUrl: cleaned }));
                          setIsProcessingImage(false);
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Remove white background & boost stamp ink contrast"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>Auto Clean BG & Sharp Ink</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, stampUrl: '' }))}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                        title="Remove Stamp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Stamp Scale & Alignment Presets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] whitespace-nowrap">Stamp Size:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.05"
                      value={profile.stampScale || 1}
                      onChange={(e) => setProfile(prev => ({ ...prev, stampScale: parseFloat(e.target.value) }))}
                      className="flex-1 accent-[#0e2a47]"
                    />
                    <span className="font-mono text-xs font-bold text-slate-800 w-10 text-right">{Math.round((profile.stampScale || 1) * 100)}%</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 text-[11px] mr-1">Position:</span>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stampX: 25, stampY: 65 }))}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                        (profile.stampX || 30) < 40 ? 'bg-[#0e2a47] text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      👈 Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stampX: 50, stampY: 65 }))}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                        (profile.stampX || 30) >= 40 && (profile.stampX || 30) <= 60 ? 'bg-[#0e2a47] text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ↔️ Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stampX: 75, stampY: 65 }))}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                        (profile.stampX || 30) > 60 ? 'bg-[#0e2a47] text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      👉 Right
                    </button>
                  </div>
                </div>

                {/* Stamp Layering (Bring to Front vs Send Behind) */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Stamp Layer Order:</span>
                    <span className="text-[10px] text-slate-500">
                      When "Bring to Front" is active, pass-through pointer events ensure you can still edit or select text under the stamp.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stampLayer: 'front' }))}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        (profile.stampLayer || 'front') === 'front'
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Bring to Front (Overlay)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile(prev => ({ ...prev, stampLayer: 'behind' }))}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        profile.stampLayer === 'behind'
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Send Behind Text
                    </button>
                  </div>
                </div>

                {/* Fine Adjustment Sliders */}
                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                    <span>X/Y Offset Adjustments (Prevents Text Overlap)</span>
                    <span className="font-mono text-[10px] bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded">
                      X: {profile.stampX ?? 30}% | Y: {profile.stampY ?? 70}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800">X-Pos (Left/Right):</span>
                      <input
                        type="range"
                        min="5"
                        max="90"
                        step="1"
                        value={profile.stampX ?? 30}
                        onChange={(e) => setProfile(prev => ({ ...prev, stampX: parseInt(e.target.value, 10) }))}
                        className="flex-1 accent-amber-600"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-800">Y-Pos (Up/Down):</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="1"
                        value={profile.stampY ?? 70}
                        onChange={(e) => setProfile(prev => ({ ...prev, stampY: parseInt(e.target.value, 10) }))}
                        className="flex-1 accent-amber-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Draggable Stamp System Interactive Box */}
                <div>
                  <div className="flex items-center justify-between mb-1 mt-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-[#0e2a47]" />
                      <span>Interactive Stamp Placement Canvas (Click & Drag Stamp to Move)</span>
                    </label>
                  </div>

                  <div
                    ref={dragContainerRef}
                    onMouseMove={handleMouseMoveContainer}
                    onMouseUp={handleMouseUpContainer}
                    onMouseLeave={handleMouseUpContainer}
                    className="relative w-full h-52 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden select-none cursor-crosshair shadow-inner"
                  >
                    {/* Document Template Mockup Background */}
                    <div className="absolute inset-x-4 top-3 h-8 bg-white border border-slate-200 rounded px-3 flex items-center justify-between opacity-60">
                      <span className="font-bold text-[9px] text-slate-600 uppercase">{profile.name}</span>
                      <span className="font-mono text-[9px] text-slate-400">DOCUMENT PREVIEW CANVAS</span>
                    </div>

                    <div className="absolute inset-x-4 top-13 bottom-12 bg-white border border-slate-200 rounded p-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex justify-between border-t border-slate-300 pt-1 text-[8px] font-bold text-slate-800">
                        <span>Customer's Seal and Signature</span>
                        <span className="text-right">FOR: {profile.name}</span>
                      </div>
                    </div>

                    {/* Stamp Element */}
                    {profile.stampUrl ? (
                      <div
                        onMouseDown={handleMouseDownStamp}
                        style={{
                          left: `${profile.stampX ?? 30}%`,
                          top: `${profile.stampY ?? 70}%`,
                          transform: `translate(-50%, -50%) scale(${profile.stampScale || 1})`,
                        }}
                        className={`absolute cursor-grab active:cursor-grabbing p-1 border-2 rounded-lg transition-shadow ${
                          isDraggingStamp ? 'border-amber-500 shadow-xl ring-2 ring-amber-300 z-30' : 'border-rose-500/60 shadow-md hover:border-rose-600 z-20'
                        }`}
                      >
                        <img
                          src={profile.stampUrl}
                          alt="Stamp"
                          className="max-h-20 max-w-20 object-contain pointer-events-none"
                        />
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-mono px-1 rounded whitespace-nowrap">
                          Drag Stamp
                        </span>
                      </div>
                    ) : (
                      <div
                        onMouseDown={handleMouseDownStamp}
                        style={{
                          left: `${profile.stampX ?? 30}%`,
                          top: `${profile.stampY ?? 70}%`,
                          transform: `translate(-50%, -50%) scale(${profile.stampScale || 1})`,
                        }}
                        className="absolute cursor-grab active:cursor-grabbing w-20 h-20 rounded-full border-2 border-dashed border-rose-500 bg-rose-500/10 flex flex-col items-center justify-center p-1 text-center"
                      >
                        <Stamp className="w-5 h-5 text-rose-600 mb-0.5" />
                        <span className="text-[8px] font-black text-rose-700 leading-none">STAMP HERE</span>
                        <span className="text-[7px] text-rose-500">(Drag Me)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIGNATURE OPTIONS */}
          {activeTab === 'SIGNATURE' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={profile.showSignatures !== false}
                    onChange={(e) => setProfile(prev => ({ ...prev, showSignatures: e.target.checked }))}
                    className="w-4 h-4 text-[#0e2a47] rounded border-slate-300 focus:ring-[#0e2a47]"
                  />
                  <span>Print Authorized Signature & Stamp Lines</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6">
                  Toggle whether signature blocks (e.g. Prepared By, Checked By, Authorized Signatory, Customer Signature) appear at the bottom of printed vouchers & documents.
                </p>
              </div>

              {/* Signature Line Preview Box */}
              <div className="p-4 border border-slate-200 rounded-lg bg-white space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Signature Box Print Status:
                </span>
                {profile.showSignatures !== false ? (
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-300 pt-6 mt-2 text-center text-xs font-bold text-slate-700">
                    <div className="border-t border-slate-400 pt-1">
                      <span>Prepared By</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <span>Checked By</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1">
                      <span>Authorized Signatory</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs">
                    ⚠️ Signature lines are currently <strong>HIDDEN</strong> on prints and PDFs.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: UAE E-INVOICING (FTA & PEPPOL) */}
          {activeTab === 'EINVOICING' && (
            <div className="space-y-4 animate-in fade-in duration-100 font-sans text-xs">
              
              {/* Compliance Header Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#0e2a47] text-white p-4 rounded-xl border border-emerald-500/30 flex items-start gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm uppercase tracking-wide text-white">
                      UAE Federal Tax Authority (FTA) E-Invoicing Standard
                    </span>
                    <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                      PEPPOL BIS Billing 3.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Configure UAE FTA compliant electronic invoicing with 15-digit TRN validation, automatic TLV Base64 QR code generation, SHA-256 cryptographic invoice digests, and UBL 2.1 PEPPOL XML export.
                  </p>
                </div>
              </div>

              {/* Status and Master Toggle */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                  <input
                    type="checkbox"
                    checked={profile.eInvoicingEnabled !== false}
                    onChange={(e) => setProfile(prev => ({ ...prev, eInvoicingEnabled: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Enable UAE FTA E-Invoicing &amp; Cryptographic QR Codes for this Company</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-6">
                  When enabled, all Tax Invoices, Credit Notes, and Commercial Invoices will automatically include UAE FTA TLV QR codes, PEPPOL UBL 2.1 export, and IRN / UUID tracking.
                </p>
              </div>

              {/* TRN & Tax Registration Section */}
              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-2xs space-y-4">
                <div className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Tax Registration &amp; PEPPOL Identifier</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      UAE Tax Registration Number (TRN) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={18}
                        value={profile.trn}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9\s-]/g, '');
                          setProfile({ ...profile, trn: val });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-slate-900 font-mono font-bold text-xs focus:outline-none focus:ring-2 ${
                          validateUaeTrn(profile.trn).valid
                            ? 'border-emerald-400 focus:ring-emerald-500 bg-emerald-50/20'
                            : 'border-amber-400 focus:ring-amber-500 bg-amber-50/20'
                        }`}
                        placeholder="100440509600003"
                      />
                      {validateUaeTrn(profile.trn).valid && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center gap-1 text-[10px] font-bold">
                          <Check className="w-4 h-4" /> Valid TRN
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {validateUaeTrn(profile.trn).reason || '15-digit numeric Tax Registration Number issued by UAE FTA.'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      PEPPOL Scheme Identifier (ISO 6523)
                    </label>
                    <input
                      type="text"
                      value={profile.eInvoiceScheme || '0208'}
                      onChange={(e) => setProfile({ ...profile, eInvoiceScheme: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      placeholder="0208 (UAE TRN Scheme)"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Standard UAE PEPPOL Scheme Code: <strong>0208</strong> (e.g. 0208:{profile.trn || '100440509600003'}).
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Default Currency
                    </label>
                    <select
                      value={profile.defaultCurrency || 'AED'}
                      onChange={(e) => setProfile({ ...profile, defaultCurrency: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    >
                      <option value="AED">AED - United Arab Emirates Dirham</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Standard VAT Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.vatRate ?? 5}
                      onChange={(e) => setProfile({ ...profile, vatRate: parseFloat(e.target.value) || 5 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tax Authority
                    </label>
                    <input
                      type="text"
                      value={profile.taxOffice || 'Federal Tax Authority (FTA), UAE'}
                      onChange={(e) => setProfile({ ...profile, taxOffice: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                    />
                  </div>
                </div>
              </div>

              {/* Arabic Legal Entity Details for Bilingual Invoicing */}
              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Bilingual Arabic Legal Information (البيانات القانونية بالعربية)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 text-right" dir="rtl">
                      اسم المنشأة القانوني (باللغة العربية)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={profile.arabicName || ''}
                      onChange={(e) => setProfile({ ...profile, arabicName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      placeholder="مثال: شركة مارين فاستنرز إندستريز ذ.م.م"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 text-right" dir="rtl">
                      العنوان باللغة العربية
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={profile.arabicAddress || ''}
                      onChange={(e) => setProfile({ ...profile, arabicAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-[#0e2a47]"
                      placeholder="مثال: المنطقة الصناعية الجديدة، عجمان، الإمارات العربية المتحدة"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {isAdmin ? (
                <button
                  type="submit"
                  disabled={isProcessingImage}
                  className="px-4 py-2 bg-[#0e2a47] hover:bg-[#163b61] text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#f37021] animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#f37021]" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Only Administrators can edit or save company profiles"
                  className="px-4 py-2 bg-slate-200 text-slate-500 rounded-lg font-bold flex items-center gap-1.5 cursor-not-allowed opacity-75 border border-slate-300"
                >
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <span>Admin Only</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
