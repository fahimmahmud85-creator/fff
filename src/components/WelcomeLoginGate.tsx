import React, { useState, useEffect } from 'react';
import { 
  LogIn, UserPlus, Key, Lock, Mail, Hash, User, Briefcase, Phone, 
  CheckCircle, XCircle, ShieldCheck, Clock, Layers, HelpCircle, 
  Cpu, Terminal, Activity, ArrowRight, ShieldAlert, Wifi, Globe, 
  Database, Flame, Sparkles, Anchor, Calendar, Building2, CheckCircle2, ChevronDown,
  Users, Check
} from 'lucide-react';
import { AppUser } from '../types';
import { 
  getCompaniesList, 
  getActiveCompany, 
  setActiveCompanyId, 
  CompanyProfile, 
  isMarineFastenersCompany,
  getUserCompanies 
} from '../utils/companyProfile';
import { 
  DEFAULT_USERS, 
  getRegisteredUsers, 
  saveRegisteredUsers,
  getCompanyCategoryByCompanyId 
} from '../utils/defaultUsers';

interface WelcomeLoginGateProps {
  onLogin: (user: AppUser) => void;
  isIframe: boolean;
}

export default function WelcomeLoginGate({ onLogin, isIframe }: WelcomeLoginGateProps) {
  // Multi-Company State
  const [companiesList, setCompaniesList] = useState<CompanyProfile[]>(() => getCompaniesList());
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile>(() => getActiveCompany());

  useEffect(() => {
    const handleSync = () => {
      setCompaniesList(getCompaniesList());
      setSelectedCompany(getActiveCompany());
    };
    window.addEventListener('companies_list_updated', handleSync);
    window.addEventListener('active_company_changed', handleSync);
    return () => {
      window.removeEventListener('companies_list_updated', handleSync);
      window.removeEventListener('active_company_changed', handleSync);
    };
  }, []);

  const handleSelectCompany = (comp: CompanyProfile) => {
    setSelectedCompany(comp);
    setActiveCompanyId(comp.id);
  };

  // Dynamic branding variables based on selected company
  const isMfi = isMarineFastenersCompany(selectedCompany);
  const compCode = (selectedCompany.code || (isMfi ? 'MFI' : 'ERP')).toUpperCase();
  const isBmm = compCode === 'BMM' || (selectedCompany.name || '').toLowerCase().includes('bolt');

  const brandHeaderBg = isMfi ? 'bg-[#0e2a47]' : isBmm ? 'bg-[#1e293b]' : 'bg-[#18181b]';
  const brandBorderColor = isMfi ? 'border-[#f37021]' : isBmm ? 'border-amber-500' : 'border-indigo-500';
  const brandButtonBg = isMfi ? 'bg-[#0e2a47] hover:bg-[#163b61]' : isBmm ? 'bg-[#1e293b] hover:bg-[#334155]' : 'bg-[#18181b] hover:bg-[#27272a]';
  const brandBadgeBg = isMfi ? 'bg-[#f37021]' : isBmm ? 'bg-amber-500' : 'bg-indigo-600';
  const brandAccentText = isMfi ? 'text-[#f37021]' : isBmm ? 'text-amber-400' : 'text-indigo-400';
  const erpTitle = isMfi 
    ? 'MFI ERP SYSTEM' 
    : isBmm 
    ? 'BOLTMASTER ERP SYSTEM' 
    : `${(selectedCompany.shortName || compCode).toUpperCase()} ERP SYSTEM`;

  // Registered users database
  const [users, setUsers] = useState<AppUser[]>(() => {
    return getRegisteredUsers();
  });

  useEffect(() => {
    const handleUsersSync = () => {
      setUsers(getRegisteredUsers());
    };
    window.addEventListener('registered_users_updated', handleUsersSync);
    window.addEventListener('users_updated', handleUsersSync);
    return () => {
      window.removeEventListener('registered_users_updated', handleUsersSync);
      window.removeEventListener('users_updated', handleUsersSync);
    };
  }, []);

  // Clock state
  const [uaeTime, setUaeTime] = useState('');
  const [uaeDateString, setUaeDateString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      // Calculate UTC + 4 hours (UAE Standard Time)
      const utcDiff = date.getTime() + date.getTimezoneOffset() * 60000;
      const uaeDate = new Date(utcDiff + (3600000 * 4));
      
      setUaeTime(uaeDate.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));

      setUaeDateString(uaeDate.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // UI state managers
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Manual input variables
  const [loginUniqueId, setLoginUniqueId] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Password recovery input variables
  const [forgotUniqueId, setForgotUniqueId] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Registration input variables
  const [regUniqueId, setRegUniqueId] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regSecondName, setRegSecondName] = useState('');
  const [regPosition, setRegPosition] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Viewer');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Simulation states (The "Demonstration" visual sequence)
  const [isSimulatingLogin, setIsSimulatingLogin] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationMessage, setSimulationMessage] = useState('');
  const [simulatedUser, setSimulatedUser] = useState<AppUser | null>(null);

  // Quick select login sequence
  const startSimulation = (selectedUser: AppUser) => {
    if (isSimulatingLogin) return;
    
    // Ensure the user exists in our local store
    const matched = users.find(u => u.email === selectedUser.email) || selectedUser;
    
    // Switch active company immediately to the user's registered company
    if (matched.companyId) {
      setActiveCompanyId(matched.companyId);
    } else {
      const allowed = getUserCompanies(matched, getCompaniesList());
      if (allowed.length > 0) {
        setActiveCompanyId(allowed[0].id);
      }
    }

    setSimulatedUser(matched);
    setIsSimulatingLogin(true);
    setSimulationProgress(0);
    setSimulationMessage('RESOLVING CORRIDOR PROTOCOLS...');

    const steps = [
      { prg: 15, msg: 'RESOLVING CORRIDOR PROTOCOLS...' },
      { prg: 35, msg: 'ESTABLISHING KEY-VALUE DOCK HANDSHAKE...' },
      { prg: 60, msg: `DECRYPTING SECURITY TAG PROFILE: ${matched.firstName} (${matched.role})...` },
      { prg: 82, msg: 'LOADING INVENTORY SYSTEMS (147 SECTOR SHEETS)...' },
      { prg: 100, msg: 'SESSION ACCESS GRANTED! WELCOME CO-WORKER.' }
    ];

    let currentStepIdx = 0;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const stepInterval = isMobile ? 80 : 350;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setSimulationProgress(steps[currentStepIdx].prg);
        setSimulationMessage(steps[currentStepIdx].msg);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onLogin(matched);
          setIsSimulatingLogin(false);
          setSimulatedUser(null);
        }, isMobile ? 150 : 600);
      }
    }, stepInterval);
  };

  // Manual credentials submit logic
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUniqueId.trim() || !loginEmail.trim() || !loginPassword) {
      setLoginError('PLEASE SUPPLY ALL LOGICAL PARAMETERS (UNIQUE ID, EMAIL, AND PASSWORD)');
      return;
    }

    const inputUid = loginUniqueId.trim().toUpperCase();
    const cleanInputUid = inputUid.replace(/[^A-Z0-9]/g, '');
    const inputEmail = loginEmail.trim().toLowerCase();

    // Check if user exists in the system by uniqueId or email
    const userMatch = users.find(u => {
      const uUid = (u.uniqueId || '').trim().toUpperCase();
      const cleanUUid = uUid.replace(/[^A-Z0-9]/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();

      const uidMatches = (
        uUid === inputUid ||
        (cleanInputUid.length > 0 && cleanUUid === cleanInputUid) ||
        (cleanInputUid.length > 0 && cleanUUid.includes(cleanInputUid)) ||
        (cleanUUid.length > 0 && cleanInputUid.includes(cleanUUid)) ||
        (uUid === 'MF-FHM02' && (inputUid === 'FHM-02' || inputUid === 'FHM02' || inputUid === 'MF-FHM02')) ||
        (uUid === 'BMM-S02' && (inputUid === 'BM-S02' || inputUid === 'BMS02' || inputUid === 'BMM-S02' || inputUid === 'BMMS02')) ||
        (uUid === 'UMI-S02' && (inputUid === 'UM-S02' || inputUid === 'UMS02' || inputUid === 'UMI-S02' || inputUid === 'UMIS02'))
      );

      const emailMatches = uEmail === inputEmail;

      return uidMatches || emailMatches;
    });

    if (userMatch) {
      // Check company access permission
      const userCompany = userMatch.companyId;
      const isMultiCompanyAdmin = userMatch.role === 'Admin' && (
        userMatch.allowedCompanies?.includes(selectedCompany.id) ||
        userMatch.allowedCompanies?.includes('comp-mfi') ||
        userMatch.allowedCompanies?.includes('comp-bmm') ||
        userMatch.allowedCompanies?.includes('comp-umi') ||
        !userCompany
      );
      
      const allowed = userMatch.allowedCompanies && userMatch.allowedCompanies.length > 0
        ? userMatch.allowedCompanies.includes(selectedCompany.id)
        : (isMultiCompanyAdmin || !userCompany || userCompany === selectedCompany.id);

      if (!allowed) {
        const targetComp = userMatch.companyCategory || (userMatch.companyId === 'comp-mfi' ? 'MARINE FASTENERS' : userMatch.companyId === 'comp-bmm' ? 'BOLT MASTER' : userMatch.companyId === 'comp-umi' ? 'UNITED METAL' : 'ANOTHER COMPANY');
        setLoginError(`ACCESS RESTRICTED: ACCOUNT "${userMatch.uniqueId}" (${userMatch.firstName}) IS CONFIGURED UNDER ${targetComp}. PLEASE SELECT THE MATCHING COMPANY OR REQUEST MULTI-ENTITY ACCESS.`);
        return;
      }

      // Check uniqueId and email match
      const uUid = (userMatch.uniqueId || '').trim().toUpperCase();
      const cleanUUid = uUid.replace(/[^A-Z0-9]/g, '');
      const uEmail = (userMatch.email || '').trim().toLowerCase();

      const uidMatches = (
        uUid === inputUid ||
        (cleanInputUid.length > 0 && cleanUUid === cleanInputUid) ||
        (cleanInputUid.length > 0 && cleanUUid.includes(cleanInputUid)) ||
        (cleanUUid.length > 0 && cleanInputUid.includes(cleanUUid)) ||
        (uUid === 'MF-FHM02' && (inputUid === 'FHM-02' || inputUid === 'FHM02' || inputUid === 'MF-FHM02')) ||
        (uUid === 'BMM-S02' && (inputUid === 'BM-S02' || inputUid === 'BMS02' || inputUid === 'BMM-S02' || inputUid === 'BMMS02')) ||
        (uUid === 'UMI-S02' && (inputUid === 'UM-S02' || inputUid === 'UMS02' || inputUid === 'UMI-S02' || inputUid === 'UMIS02'))
      );
      const emailMatches = uEmail === inputEmail;

      if (!uidMatches && !emailMatches) {
        setLoginError('INVALID CREDENTIALS: UNIQUE ID AND EMAIL COMBINATION DOES NOT MATCH.');
        return;
      }

      // Check credential password with whitespace trim tolerance
      const storedPwd = (userMatch.password || '').trim();
      const enteredPwd = (loginPassword || '').trim();
      if (storedPwd !== enteredPwd && userMatch.password !== loginPassword) {
        setLoginError('ACCESS DENIED: INVALID PASSWORD PIN ENTERED.');
        return;
      }

      // Check admin approval status
      if (userMatch.isApproved === false) {
        setLoginError('ACCOUNT PENDING ADMIN APPROVAL. PLEASE CONTACT SYSTEM ADMINISTRATOR TO APPROVE YOUR ACCOUNT.');
        return;
      }

      // Pass validated account straight to simulation sequence
      startSimulation(userMatch);
      return;
    }

    // If user is not found in database
    setLoginError(`INVALID CREDENTIALS: NO REGISTERED USER FOUND FOR ${selectedCompany.name.toUpperCase()}. PLEASE CHECK YOUR CREDENTIALS OR REGISTER VIA THE NEW ACCOUNT TAB.`);
  };

  // Recover PIN code code
  const handleRecoverPin = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotUniqueId.trim() || !forgotEmail.trim()) {
      setForgotError('MEMBER SECURE LOOKUP REQUIRES BOTH UNIQUE ID AND BUSINESS EMAIL.');
      return;
    }

    const inputUid = forgotUniqueId.trim().toUpperCase();
    const cleanInputUid = inputUid.replace(/[^A-Z0-9]/g, '');
    const inputEmail = forgotEmail.trim().toLowerCase();

    const foundUser = users.find(u => {
      const uUid = (u.uniqueId || '').trim().toUpperCase();
      const cleanUUid = uUid.replace(/[^A-Z0-9]/g, '');
      const uEmail = (u.email || '').trim().toLowerCase();
      const uidMatches = uUid === inputUid || (cleanInputUid.length > 0 && cleanUUid === cleanInputUid);
      const emailMatches = uEmail === inputEmail;
      return uidMatches && emailMatches;
    });

    if (!foundUser) {
      setForgotError('MESSAGING: ACCREDITED MATCHING INVENTORY OPERATOR NOT FOUND.');
      return;
    }

    setForgotSuccess(`PIN RESTORED FOR ${foundUser.firstName}: PIN IS "${foundUser.password}"`);
  };

  // Sign up custom account record
  const handleRegisterRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regUniqueId.trim() || !regFirstName.trim() || !regSecondName.trim() || !regPosition.trim() || !regEmail.trim() || !regPassword) {
      setRegError('WARNING: APPLICANT PROFILING HIGHLIGHTED FIELDS (*) MUST NOT BE OMITTED.');
      return;
    }

    const fmtUniqueId = regUniqueId.trim().toUpperCase();
    if (users.some(u => u.uniqueId.toUpperCase() === fmtUniqueId)) {
      setRegError(`MEMBER ID "${fmtUniqueId}" IS REGISTERED AND CLAIMED BY SOMEONE ELSE.`);
      return;
    }

    const fmtEmail = regEmail.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === fmtEmail)) {
      setRegError('THIS BUSINESS EMAIL IS ASSIGNED ALREADY UNDER ANOTHER PROFILE RECORD.');
      return;
    }

    const compCategory = isMfi ? 'MARINE FASTENERS' : isBmm ? 'BOLT MASTER' : selectedCompany.name.toUpperCase();
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      uniqueId: fmtUniqueId,
      firstName: regFirstName.trim().toUpperCase(),
      secondName: regSecondName.trim().toUpperCase(),
      position: regPosition.trim().toUpperCase(),
      phone: regPhone.trim(),
      mobile: regMobile.trim(),
      email: fmtEmail,
      role: regRole,
      password: regPassword,
      companyId: selectedCompany.id,
      companyCategory: compCategory,
      allowedCompanies: [selectedCompany.id],
      isApproved: false,
      canViewSystemRegistry: false
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveRegisteredUsers(updatedUsers);

    setRegSuccess(`NEW ACCOUNT APPLICATION FOR ${newUser.firstName} SUBMITTED! MUST BE APPROVED BY ADMIN FROM USER FORM BEFORE YOU CAN LOG IN.`);
    
    // Clear registration
    setRegUniqueId('');
    setRegFirstName('');
    setRegSecondName('');
    setRegPosition('');
    setRegPhone('');
    setRegMobile('');
    setRegEmail('');
    setRegPassword('');
    setRegRole('Viewer');

    setTimeout(() => {
      setActiveTab('login');
      setRegSuccess('');
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center font-sans select-none antialiased py-8 px-4 relative overflow-hidden">
      
      {/* Subtle modern background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-[#0e2a47]/10 to-transparent pointer-events-none" />

      {/* Main Container Wrapper */}
      <div className="w-full max-w-xl relative z-10 animate-fade-in flex flex-col gap-5">

        {/* Dynamic Simulator Mode Overlay */}
        {isSimulatingLogin ? (
          <div className={`bg-white border-2 ${brandBorderColor} rounded-xl text-center shadow-xl relative overflow-hidden min-h-[420px] flex flex-col justify-center items-center p-8 sm:p-12`}>
            
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0e2a47] via-[#f37021] to-[#0e2a47]`} />

            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-slate-600 font-mono text-[9px]">
              <span className={`w-2 h-2 rounded-full ${brandBadgeBg} animate-ping`} />
              <span>{compCode} ERP CONNECT HANDSHAKE...</span>
            </div>

            <div className={`${brandHeaderBg} p-4 rounded-xl text-white mb-6 shadow-md animate-pulse`}>
              <Cpu className={`w-10 h-10 ${brandAccentText}`} />
            </div>

            <div className="max-w-md w-full space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                AUTHENTICATING SESSION &bull; {selectedCompany.shortName || selectedCompany.name}
              </h3>
              
              {/* User Profile Tag */}
              {simulatedUser && (
                <div className="bg-slate-50 p-3.5 border border-slate-300 rounded-lg flex items-center justify-between gap-4 text-left font-mono shadow-2xs">
                  <div>
                    <span className={`text-[9px] ${brandAccentText} font-bold uppercase tracking-wider block`}>OPERATOR PROFILE:</span>
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-tight block">
                      {simulatedUser.firstName} {simulatedUser.secondName}
                    </span>
                    <span className="text-[9.5px] text-slate-600 block mt-0.5 font-sans font-medium">
                      {simulatedUser.position}
                    </span>
                  </div>
                  <div className={`${brandHeaderBg} text-white py-1 px-3 rounded text-center shrink-0`}>
                    <span className="text-[7.5px] text-slate-300 block uppercase font-bold">ROLE</span>
                    <span className="text-[10px] text-amber-400 font-extrabold block uppercase">
                      {simulatedUser.role}
                    </span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-slate-600 uppercase font-bold">
                  <span>{simulationMessage}</span>
                  <span className="text-slate-900 font-extrabold">{simulationProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300 p-0.5">
                  <div 
                    className={`h-full ${brandHeaderBg} rounded-full transition-all duration-300`}
                    style={{ width: `${simulationProgress}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded font-mono text-[9px] text-slate-700 tracking-wider text-left">
                TUNNEL CONNECT: [LOG {new Date().toISOString().substring(11, 19)}] {selectedCompany.name} database synchronizing...
              </div>
            </div>
          </div>
        ) : (
          
          /* ENTERPRISE LOGIN FORM CARD */
          <div className="bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden">
            
            {/* TOP BRANDING HEADER STRIP */}
            <div className={`${brandHeaderBg} text-white p-4 px-6 flex items-center justify-between border-b-4 ${brandBorderColor}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-black text-amber-400 text-lg shadow-inner shrink-0">
                  {compCode.slice(0, 3)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-wider text-white truncate">{erpTitle}</span>
                    <span className={`${brandBadgeBg} text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase shrink-0`}>v9.0</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium tracking-wide uppercase truncate">
                    {selectedCompany.name}
                  </p>
                </div>
              </div>

              {/* Live UAE Clock */}
              <div className="hidden sm:flex flex-col items-end text-right font-mono text-[10px] text-slate-300 shrink-0">
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <Clock className={`w-3 h-3 ${brandAccentText} animate-pulse`} />
                  <span>{uaeTime || '00:00:00 AM'}</span>
                </div>
                <span className="text-[8.5px] text-slate-400">{uaeDateString}</span>
              </div>
            </div>

            {/* SELECT BUSINESS ENTITY / COMPANY DROPDOWN SELECTOR */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 px-6">
              <label htmlFor="company-entity-dropdown" className="flex items-center justify-between gap-2 mb-2 font-mono">
                <span className="text-[10.5px] font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#f37021]" />
                  <span>SELECT COMPANY ENTITY:</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-200/80 px-2 py-0.5 rounded">
                  {selectedCompany.code || selectedCompany.shortName || 'ENTITY'}
                </span>
              </label>

              <div className="relative">
                <select
                  id="company-entity-dropdown"
                  value={selectedCompany.id}
                  onChange={(e) => {
                    const found = companiesList.find(c => c.id === e.target.value);
                    if (found) handleSelectCompany(found);
                  }}
                  className="w-full bg-white border-2 border-slate-300 hover:border-[#0e2a47] focus:border-[#0e2a47] focus:ring-2 focus:ring-[#0e2a47]/20 text-slate-900 rounded-lg py-2.5 pl-3 pr-10 text-xs font-bold font-sans transition-all cursor-pointer shadow-2xs appearance-none"
                >
                  {companiesList.map((comp) => {
                    const cCode = (comp.code || comp.name.substring(0, 3)).toUpperCase();
                    return (
                      <option key={comp.id} value={comp.id} className="py-1.5 font-medium text-slate-800">
                        [{cCode}] {comp.name} {comp.trn ? `— TRN: ${comp.trn}` : ''}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Selected Entity Details Banner */}
              <div className="mt-2.5 p-2 bg-white rounded border border-slate-200 flex items-center justify-between text-[9.5px] font-mono text-slate-600">
                <div className="flex items-center gap-2 truncate">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white ${
                    isMarineFastenersCompany(selectedCompany) ? 'bg-blue-600' :
                    (selectedCompany.code === 'BMM' || selectedCompany.name.toLowerCase().includes('bolt')) ? 'bg-amber-600' :
                    'bg-purple-600'
                  }`}>
                    {selectedCompany.code || 'COMP'}
                  </span>
                  <span className="font-bold text-slate-800 truncate">
                    {selectedCompany.shortName || selectedCompany.name}
                  </span>
                </div>
                <span className="text-slate-500 font-semibold shrink-0 ml-2">
                  TRN: {selectedCompany.trn || '—'}
                </span>
              </div>
            </div>

            {/* FORM CARD BODY */}
            <div className="p-6 sm:p-8 space-y-5">
              
              {/* Tab Selector: Login vs Register */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setForgotPasswordMode(false); }}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-all cursor-pointer ${
                      activeTab === 'login' && !forgotPasswordMode
                        ? `${brandHeaderBg} text-white shadow-3xs`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    User Login
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? `${brandHeaderBg} text-white shadow-3xs`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    New Account
                  </button>
                </div>
              </div>

              {/* ACTIVE TAB: LOGIN VIEW */}
              {activeTab === 'login' && (
                <div>
                  {forgotPasswordMode ? (
                    /* PASSWORD RECOVERY */
                    <form onSubmit={handleRecoverPin} className="space-y-4 text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                          Recover {compCode} Access Code
                        </h4>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Enter your Unique ID and Business Email to view your passcode
                        </span>
                      </div>

                      {forgotError && (
                        <div className="p-2.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] uppercase font-bold">
                          ⚠️ {forgotError}
                        </div>
                      )}

                      {forgotSuccess && (
                        <div className="p-2.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-[10.5px] font-bold leading-relaxed">
                          ✔️ {forgotSuccess}
                        </div>
                      )}

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                            Unique Member ID
                          </label>
                          <input
                            type="text"
                            required
                            value={forgotUniqueId}
                            onChange={(e) => setForgotUniqueId(e.target.value)}
                            placeholder="e.g. MF-001"
                            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0e2a47] font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                            Registered Company Email
                          </label>
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="user@company.com"
                            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0e2a47] text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => { setForgotPasswordMode(false); setForgotError(''); setForgotSuccess(''); }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded transition-colors cursor-pointer"
                        >
                          &larr; Back
                        </button>
                        <button
                          type="submit"
                          className={`flex-1 py-2 ${brandButtonBg} text-white font-bold text-xs uppercase rounded transition-all cursor-pointer shadow-3xs`}
                        >
                          Verify User Profile
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* ENTERPRISE LOGIN FORM */
                    <form onSubmit={handleManualLogin} className="space-y-3.5 text-left">
                      
                      {loginError && (
                        <div className="p-2.5 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-[10.5px] font-bold">
                          ⚠️ {loginError}
                        </div>
                      )}

                      {/* Login Credentials Inputs */}
                      <div className="space-y-3 pt-1">
                        
                        {/* Member Unique ID */}
                        <div>
                          <label className="block text-[10.5px] font-extrabold text-slate-700 uppercase mb-1">
                            User Code / Unique ID
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={loginUniqueId}
                              onChange={(e) => setLoginUniqueId(e.target.value)}
                              placeholder="e.g. MF-001"
                              className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-slate-900 font-mono font-bold text-xs uppercase focus:outline-none focus:border-[#0e2a47] focus:ring-1 focus:ring-[#0e2a47]"
                            />
                          </div>
                        </div>

                        {/* Email Address */}
                        <div>
                          <label className="block text-[10.5px] font-extrabold text-slate-700 uppercase mb-1">
                            User Email Address
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="User Email Address"
                              className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#0e2a47] focus:ring-1 focus:ring-[#0e2a47]"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-[10.5px] font-extrabold text-slate-700 uppercase">
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setForgotPasswordMode(true);
                                setForgotUniqueId(loginUniqueId);
                                setForgotEmail(loginEmail);
                                setForgotError('');
                                setForgotSuccess('');
                              }}
                              className={`${brandAccentText} hover:underline uppercase text-[9.5px] font-bold cursor-pointer`}
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="password"
                              required
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#0e2a47] focus:ring-1 focus:ring-[#0e2a47]"
                            />
                          </div>
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id="remember-me-checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-[#0e2a47] border-slate-300 focus:ring-[#0e2a47] cursor-pointer"
                          />
                          <label htmlFor="remember-me-checkbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                            Remember my login details on this browser
                          </label>
                        </div>

                      </div>

                      {/* Login Action Button */}
                      <button
                        type="submit"
                        className={`w-full py-2.5 ${brandButtonBg} text-white font-extrabold text-xs uppercase tracking-widest rounded transition-all cursor-pointer shadow-md mt-4 flex items-center justify-center gap-2 active:scale-[0.99]`}
                      >
                        <LogIn className="w-4 h-4 text-amber-400" />
                        <span>LOGIN TO {erpTitle}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ACTIVE TAB: REGISTER VIEW */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterRecord} className="space-y-3 font-mono text-left text-xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Create Operator Account &bull; {selectedCompany.shortName || selectedCompany.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">
                      Enter staff details to register a new user in system database
                    </span>
                  </div>

                  {regError && (
                    <div className="p-2.5 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-[10px] uppercase font-bold">
                      ⚠️ {regError}
                    </div>
                  )}

                  {regSuccess && (
                    <div className="p-2.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 font-bold text-[10.5px] uppercase flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {regSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-600 uppercase mb-1">
                        Unique ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={regUniqueId}
                        onChange={(e) => setRegUniqueId(e.target.value)}
                        placeholder={`e.g. ${compCode}-003`}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-xs font-bold uppercase focus:border-[#0e2a47]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-600 uppercase mb-1">
                        Designation / Position *
                      </label>
                      <input
                        type="text"
                        required
                        value={regPosition}
                        onChange={(e) => setRegPosition(e.target.value)}
                        placeholder="e.g. SALES EXECUTIVE"
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-xs uppercase focus:border-[#0e2a47]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-600 uppercase mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="FAISAL"
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-xs uppercase focus:border-[#0e2a47]"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-600 uppercase mb-1">
                        Second Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regSecondName}
                        onChange={(e) => setRegSecondName(e.target.value)}
                        placeholder="MAHMUD"
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-xs uppercase focus:border-[#0e2a47]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-600 uppercase mb-1">
                      Company Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={selectedCompany.email || "user@company.ae"}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-xs focus:border-[#0e2a47]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-600 uppercase mb-1">
                        System Role *
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as 'Admin' | 'Editor' | 'Viewer')}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-slate-800 text-xs focus:border-[#0e2a47]"
                      >
                        <option value="Viewer">Viewer (Read-Only)</option>
                        <option value="Editor">Editor (View & Edit)</option>
                        <option value="Admin">Admin (Full Control)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-bold text-slate-600 uppercase mb-1">
                        Password PIN *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 text-xs focus:border-[#0e2a47]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2 ${brandButtonBg} text-white font-bold text-xs uppercase rounded transition-all cursor-pointer shadow-3xs mt-2`}
                  >
                    REGISTER USER PROFILE IN {erpTitle}
                  </button>
                </form>
              )}

            </div>

            {/* FOOTER */}
            <div className="bg-slate-100 border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-[9.5px] text-slate-600 font-mono">
              <span className="truncate max-w-[280px] font-bold">{selectedCompany.name}</span>
              <span className="flex items-center gap-1 font-bold text-emerald-700 shrink-0">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                SYSTEM READY
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

