import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, LogIn, LogOut, Shield, Eye, EyeOff, Copy, Info, UserCheck, 
  Trash2, Plus, Mail, Phone, Hash, User, Briefcase, Key, Lock, CheckCircle, XCircle,
  Type, Sliders, Contrast, AlignLeft, Sparkles, RefreshCw, Layers, Search, Filter, ShieldAlert, Check, Settings2,
  Users, Download, HardDrive, Monitor, SlidersHorizontal, Pencil, X, Palette,
  Building2, Building, CheckCircle2, AlertCircle, BookmarkCheck, PlusCircle, ShieldCheck
} from 'lucide-react';
import { AppUser } from '../types';
import { 
  getCompaniesList, 
  saveCompaniesList, 
  getActiveCompany, 
  setActiveCompanyId, 
  deleteCompany, 
  CompanyProfile, 
  DEFAULT_COMPANIES,
  getUserCompanies
} from '../utils/companyProfile';
import { 
  DEFAULT_USERS, 
  getRegisteredUsers, 
  saveRegisteredUsers, 
  SystemUserCategory, 
  SYSTEM_USER_CATEGORIES, 
  getCompanyCategoryByCompanyId 
} from '../utils/defaultUsers';
import { EditCompanyModal } from './EditCompanyModal';

const FONT_FAMILIES_MAP: Record<string, { family: string; weight?: string }> = {
  'Arial': { family: 'Arial, "Helvetica Neue", sans-serif' },
  'Arial MT': { family: '"Arial MT", Arial, "Helvetica Neue", sans-serif' },
  'Arial MT Bold': { family: '"Arial Bold", "Arial MT", Arial, sans-serif', weight: '700' },
  'Calibri': { family: 'Calibri, "Segoe UI", "Candara", sans-serif' },
  'Open Sans': { family: '"Open Sans", sans-serif' },
  'Helvetica Neue': { family: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  'Plus Jakarta Sans': { family: '"Plus Jakarta Sans", sans-serif' },
  'Inter': { family: '"Inter", sans-serif' },
  'Space Grotesk': { family: '"Space Grotesk", sans-serif' },
  'Outfit': { family: '"Outfit", sans-serif' },
  'JetBrains Mono': { family: '"JetBrains Mono", monospace' }
};

interface AboutViewProps {
  currentUser: AppUser | null;
  onLogin: (user: AppUser) => void;
  onLogout: () => void;
}

export default function AboutView({ currentUser, onLogin, onLogout }: AboutViewProps) {
  // Load registered users from localStorage or initialize with default ones
  const [users, setUsers] = useState<AppUser[]>(() => getRegisteredUsers());

  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  const [settingsTab, setSettingsTab] = useState<'companies' | 'typography' | 'registry' | 'diagnostics' | 'my_account'>('companies');
  
  // Multi-Company Management States
  const [companiesList, setCompaniesList] = useState<CompanyProfile[]>(getCompaniesList);
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);
  const [isEditCompanyModalOpen, setIsEditCompanyModalOpen] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState<string | undefined>(undefined);
  const [companyPermissionsToast, setCompanyPermissionsToast] = useState('');

  // Effective companies scoped strictly to the current user
  const effectiveCompaniesList = useMemo(() => {
    return getUserCompanies(currentUser, companiesList);
  }, [currentUser, companiesList]);

  // Current logged in user category (MARINE FASTENERS, BOLT MASTER, UNITED METAL)
  const currentUserCategory = useMemo<SystemUserCategory>(() => {
    if (!currentUser) return 'MARINE FASTENERS';
    if (currentUser.companyCategory) return currentUser.companyCategory;
    return getCompanyCategoryByCompanyId(currentUser.companyId);
  }, [currentUser]);

  // Strictly scoped users list for corporate data isolation:
  // - BOLT MASTER user ONLY sees BOLT MASTER personnel
  // - UNITED METAL user ONLY sees UNITED METAL personnel
  // - MARINE FASTENERS ADMIN/USER ONLY sees MARINE FASTENERS personnel
  const scopedUsers = useMemo(() => {
    if (!currentUser) return users;
    return users.filter(u => {
      const uCat = u.companyCategory || getCompanyCategoryByCompanyId(u.companyId);
      return uCat === currentUserCategory;
    });
  }, [users, currentUser, currentUserCategory]);

  // Listen to external triggers to switch tab or sync companies
  useEffect(() => {
    const handleSetSettingsTab = (e: any) => {
      if (e.detail) {
        setSettingsTab(e.detail);
      }
    };

    const handleSyncCompanies = () => {
      setCompaniesList(getCompaniesList());
      setActiveCompany(getActiveCompany());
    };

    window.addEventListener('settings_set_tab', handleSetSettingsTab);
    window.addEventListener('companies_list_updated', handleSyncCompanies);
    window.addEventListener('active_company_changed', handleSyncCompanies);
    window.addEventListener('company_profile_updated', handleSyncCompanies);

    return () => {
      window.removeEventListener('settings_set_tab', handleSetSettingsTab);
      window.removeEventListener('companies_list_updated', handleSyncCompanies);
      window.removeEventListener('active_company_changed', handleSyncCompanies);
      window.removeEventListener('company_profile_updated', handleSyncCompanies);
    };
  }, []);

  const handleSetActiveCompany = (comp: CompanyProfile) => {
    setActiveCompanyId(comp.id);
    setActiveCompany(comp);
    setCompanyPermissionsToast(`Active company switched to "${comp.name}"`);
    setTimeout(() => setCompanyPermissionsToast(''), 3500);
  };

  const handleToggleUserCompany = (userId: string, companyId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const current = u.allowedCompanies || companiesList.map(c => c.id);
      const has = current.includes(companyId);
      const updated = has ? current.filter(id => id !== companyId) : [...current, companyId];
      return {
        ...u,
        allowedCompanies: updated
      };
    }));
  };

  const handleSaveCompanyPermissions = () => {
    localStorage.setItem('mf_registered_users', JSON.stringify(users));
    // Also dispatch event for other components
    window.dispatchEvent(new Event('users_updated'));
    setCompanyPermissionsToast('Company & Seller permissions updated and saved successfully!');
    setTimeout(() => setCompanyPermissionsToast(''), 3500);
  };

  const handleGrantAllCompanies = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        allowedCompanies: companiesList.map(c => c.id)
      };
    }));
  };

  const handleDeleteCompany = (comp: CompanyProfile) => {
    if (companiesList.length <= 1) {
      alert("At least one company must remain in the ERP system.");
      return;
    }
    if (window.confirm(`Are you sure you want to remove "${comp.name}" from the ERP system?`)) {
      deleteCompany(comp.id);
      const updated = getCompaniesList();
      setCompaniesList(updated);
      setActiveCompany(getActiveCompany());
      setCompanyPermissionsToast(`Removed "${comp.name}" from registered companies.`);
      setTimeout(() => setCompanyPermissionsToast(''), 3500);
    }
  };

  // Global Typography & Visual Theme Engine States
  const [selectedFont, setSelectedFont] = useState(() => localStorage.getItem('mf_font_family') || 'Plus Jakarta Sans');
  const [selectedSize, setSelectedSize] = useState(() => localStorage.getItem('mf_font_size') || 'compact');
  const [selectedTheme, setSelectedTheme] = useState<'default_navy' | 'steel_industrial' | 'emerald_erp' | 'sapphire_crimson' | 'dark_high_contrast' | 'dashboard_blue_grey_black'>(() => {
    return (localStorage.getItem('mf_app_theme') as any) || 'default_navy';
  });
  const [customScale, setCustomScale] = useState<number>(() => {
    const saved = localStorage.getItem('mf_font_scale');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [lineHeight, setLineHeight] = useState<'compact' | 'standard' | 'relaxed'>(() => {
    return (localStorage.getItem('mf_line_height') as any) || 'standard';
  });
  const [letterSpacing, setLetterSpacing] = useState<'dense' | 'normal' | 'wide' | 'mono'>(() => {
    return (localStorage.getItem('mf_letter_spacing') as any) || 'normal';
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('mf_high_contrast') === 'true';
  });
  const [tabularNums, setTabularNums] = useState<boolean>(() => {
    return localStorage.getItem('mf_tabular_nums') !== 'false';
  });
  const [uppercaseHeaders, setUppercaseHeaders] = useState<boolean>(() => {
    return localStorage.getItem('mf_uppercase_headers') !== 'false';
  });

  // System Registry Search & Filtering
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryCategoryFilter, setRegistryCategoryFilter] = useState<'ALL' | SystemUserCategory>('ALL');
  const [registryRoleFilter, setRegistryRoleFilter] = useState<'all' | 'Admin' | 'Editor' | 'Viewer' | 'pending' | 'registry_granted'>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = useMemo(() => {
    return scopedUsers.filter(u => {
      const q = registrySearch.trim().toLowerCase();
      const userCategory = u.companyCategory || getCompanyCategoryByCompanyId(u.companyId);
      const matchesQuery = !q || 
        (u.firstName || '').toLowerCase().includes(q) ||
        (u.secondName || '').toLowerCase().includes(q) ||
        (u.uniqueId || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.position || '').toLowerCase().includes(q) ||
        userCategory.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (registryRoleFilter === 'Admin') return u.role === 'Admin';
      if (registryRoleFilter === 'Editor') return u.role === 'Editor';
      if (registryRoleFilter === 'Viewer') return u.role === 'Viewer';
      if (registryRoleFilter === 'pending') return u.isApproved === false;
      if (registryRoleFilter === 'registry_granted') return u.canViewSystemRegistry === true || u.role === 'Admin';

      return true;
    });
  }, [scopedUsers, registrySearch, registryRoleFilter]);

  useEffect(() => {
    localStorage.setItem('mf_font_family', selectedFont);
    localStorage.setItem('mf_font_size', selectedSize);
    localStorage.setItem('mf_app_theme', selectedTheme);
    localStorage.setItem('mf_font_scale', customScale.toString());
    localStorage.setItem('mf_line_height', lineHeight);
    localStorage.setItem('mf_letter_spacing', letterSpacing);
    localStorage.setItem('mf_high_contrast', highContrast.toString());
    localStorage.setItem('mf_tabular_nums', tabularNums.toString());
    localStorage.setItem('mf_uppercase_headers', uppercaseHeaders.toString());
    
    let styleEl = document.getElementById('custom-font-settings-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-font-settings-style';
      document.head.appendChild(styleEl);
    }
    
    const sizeBaseMap: Record<string, number> = {
      'micro': 10.5,
      'compact': 11.5,
      'standard': 13.0,
      'comfortable': 14.0,
      'spacious': 15.0
    };
    
    const basePx = sizeBaseMap[selectedSize] || 11.5;
    const finalPx = ((basePx * customScale) / 100).toFixed(2);

    const lineHeightMap: Record<string, string> = {
      'compact': '1.25',
      'standard': '1.45',
      'relaxed': '1.65'
    };

    const trackingMap: Record<string, string> = {
      'dense': '-0.02em',
      'normal': '0em',
      'wide': '0.03em',
      'mono': '0.05em'
    };

    const fontConfig = FONT_FAMILIES_MAP[selectedFont] || { family: `"${selectedFont}", sans-serif` };
    const fontCssValue = fontConfig.family;

    let themeCss = '';
    if (selectedTheme === 'steel_industrial') {
      themeCss = `
        .bg-\\[\\#002D62\\], .bg-\\[\\#083c54\\] { background-color: #0f172a !important; }
        .text-\\[\\#FF6B00\\], .text-\\[\\#f37021\\] { color: #0284c7 !important; }
        .bg-\\[\\#FF6B00\\], .bg-\\[\\#f37021\\] { background-color: #0284c7 !important; }
        .border-\\[\\#FF6B00\\] { border-color: #0284c7 !important; }
      `;
    } else if (selectedTheme === 'emerald_erp') {
      themeCss = `
        .bg-\\[\\#002D62\\], .bg-\\[\\#083c54\\] { background-color: #064e3b !important; }
        .text-\\[\\#FF6B00\\], .text-\\[\\#f37021\\] { color: #d97706 !important; }
        .bg-\\[\\#FF6B00\\], .bg-\\[\\#f37021\\] { background-color: #d97706 !important; }
        .border-\\[\\#FF6B00\\] { border-color: #d97706 !important; }
      `;
    } else if (selectedTheme === 'sapphire_crimson') {
      themeCss = `
        .bg-\\[\\#002D62\\], .bg-\\[\\#083c54\\] { background-color: #1e3a8a !important; }
        .text-\\[\\#FF6B00\\], .text-\\[\\#f37021\\] { color: #e11d48 !important; }
        .bg-\\[\\#FF6B00\\], .bg-\\[\\#f37021\\] { background-color: #e11d48 !important; }
        .border-\\[\\#FF6B00\\] { border-color: #e11d48 !important; }
      `;
    } else if (selectedTheme === 'dark_high_contrast') {
      themeCss = `
        .bg-\\[\\#002D62\\], .bg-\\[\\#083c54\\] { background-color: #090d16 !important; }
        .text-\\[\\#FF6B00\\], .text-\\[\\#f37021\\] { color: #f97316 !important; }
        .bg-\\[\\#FF6B00\\], .bg-\\[\\#f37021\\] { background-color: #f97316 !important; }
        .border-\\[\\#FF6B00\\] { border-color: #f97316 !important; }
      `;
    } else if (selectedTheme === 'dashboard_blue_grey_black') {
      themeCss = `
        .bg-\\[\\#002D62\\], .bg-\\[\\#083c54\\] { background-color: #1e293b !important; }
        .text-\\[\\#FF6B00\\], .text-\\[\\#f37021\\] { color: #2563eb !important; }
        .bg-\\[\\#FF6B00\\], .bg-\\[\\#f37021\\] { background-color: #0f172a !important; border-color: #2563eb !important; color: #ffffff !important; }
        .border-\\[\\#FF6B00\\] { border-color: #2563eb !important; }
      `;
    }
    
    styleEl.innerHTML = `
      html {
        font-size: ${finalPx}px !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      body {
        font-family: ${fontCssValue} !important;
        line-height: ${lineHeightMap[lineHeight] || '1.45'} !important;
        letter-spacing: ${trackingMap[letterSpacing] || '0em'} !important;
      }
      body *:not(.font-mono):not(code):not(pre):not(kbd) {
        font-family: ${fontCssValue} !important;
      }
      .font-mono, .font-mono * {
        font-family: ${selectedFont === 'JetBrains Mono' ? '"JetBrains Mono", monospace !important' : '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace !important'};
      }
      :root {
        --font-sans: ${fontCssValue};
        --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
      }
      ${themeCss}
      ${highContrast ? `
        .text-slate-400, .text-slate-500 { color: #334155 !important; }
        .text-slate-600 { color: #1e293b !important; font-weight: 600 !important; }
        body { color: #020617 !important; }
      ` : ''}
      ${tabularNums ? `
        table td, .font-mono, [data-num="true"] {
          font-variant-numeric: tabular-nums lining-nums !important;
        }
      ` : ''}
      ${uppercaseHeaders ? `
        table th { text-transform: uppercase !important; }
      ` : ''}
    `;
  }, [selectedFont, selectedSize, selectedTheme, customScale, lineHeight, letterSpacing, highContrast, tabularNums, uppercaseHeaders]);
  
  // Login Form States
  const [loginUniqueId, setLoginUniqueId] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Forget/Recover Password States
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotUniqueId, setForgotUniqueId] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotErrorMessage, setForgotErrorMessage] = useState('');

  // Register Form States
  const [regCompanyCategory, setRegCompanyCategory] = useState<SystemUserCategory>('MARINE FASTENERS');
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

  // Suffix state to handle Register Co-worker toggles in system registry
  const [showAdminRegForm, setShowAdminRegForm] = useState(false);

  // State for non-blocking deletion verification & custom inline notifications
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // User Edit States for Inline Registry Modifying
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCompanyCategory, setEditCompanyCategory] = useState<SystemUserCategory>('MARINE FASTENERS');
  const [editUniqueId, setEditUniqueId] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editSecondName, setEditSecondName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Viewer');
  const [editPassword, setEditPassword] = useState('');
  const [editCanViewRegistry, setEditCanViewRegistry] = useState(false);
  const [editIsApproved, setEditIsApproved] = useState(true);
  const [editError, setEditError] = useState('');

  // Sync users list to localStorage
  useEffect(() => {
    localStorage.setItem('mf_registered_users', JSON.stringify(users));
  }, [users]);

  // Handle Toggle Admin Approval Status
  const handleToggleApproval = (userId: string, isApproved: boolean) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const uUser = { ...u, isApproved };
        if (currentUser && currentUser.id === userId) {
          onLogin(uUser);
        }
        return uUser;
      }
      return u;
    });
    setUsers(updated);
  };

  // Handle Toggle System Registry View Permission
  const handleToggleRegistryAccess = (userId: string, canViewSystemRegistry: boolean) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const uUser = { ...u, canViewSystemRegistry };
        if (currentUser && currentUser.id === userId) {
          onLogin(uUser);
        }
        return uUser;
      }
      return u;
    });
    setUsers(updated);
  };

  // Handle Log In Process
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUniqueId.trim() || !loginEmail.trim() || !loginPassword) {
      setLoginError('PLEASE SPECIFY ALL REQUISITE FIELDS: UNIQUE ID, EMAIL AND ACCESS PASSWORD.');
      return;
    }

    const foundUser = users.find(u => 
      u.uniqueId.trim().toUpperCase() === loginUniqueId.trim().toUpperCase() &&
      u.email.trim().toLowerCase() === loginEmail.trim().toLowerCase()
    );
    
    if (!foundUser) {
      setLoginError('USER ACCOUNT SECURE ID AND EMAIL COMBINATION NOT FOUND.');
      return;
    }

    if (foundUser.password !== loginPassword) {
      setLoginError('INVALID PASSWORD. PLEASE RETRY OR USE "FORGET PASSWORD" BELOW.');
      return;
    }

    if (foundUser.isApproved === false) {
      setLoginError('ACCOUNT PENDING ADMIN APPROVAL. PLEASE CONTACT SYSTEM ADMINISTRATOR TO APPROVE YOUR ACCOUNT FROM USER FORM.');
      return;
    }

    // Success login
    onLogin(foundUser);
    setLoginUniqueId('');
    setLoginEmail('');
    setLoginPassword('');
  };

  // Handle Password Recovery (Forget Password)
  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMessage('');
    setForgotSuccessMessage('');

    if (!forgotUniqueId.trim() || !forgotEmail.trim()) {
      setForgotErrorMessage('PLEASE INPUT BOTH YOUR UNIQUE ID AND COMPANY REGISTERED EMAIL.');
      return;
    }

    const foundUser = users.find(u => 
      u.uniqueId.trim().toUpperCase() === forgotUniqueId.trim().toUpperCase() &&
      u.email.trim().toLowerCase() === forgotEmail.trim().toLowerCase()
    );

    if (!foundUser) {
      setForgotErrorMessage('NO MATCHING AGENT ACCOUNT FOUND WITH BOTH THE REQUESTED UNIQUE ID AND EMAIL.');
      return;
    }

    setForgotSuccessMessage(`MEMBER VERIFIED! ACCESS PASSWORD PIN RECOUPED: "${foundUser.password}"`);
  };

  // Handle Quick Login Click (Admin or Staff helper credentials buttons)
  const handleQuickLogin = (email: string, pass: string) => {
    const matched = users.find(u => u.email === email);
    if (matched && matched.password === pass) {
      onLogin(matched);
      setLoginError('');
    } else {
      // In case user was deleted, restore default credentials
      const tempUser = DEFAULT_USERS.find(d => d.email === email);
      if (tempUser) {
        setUsers(prev => {
          if (!prev.some(u => u.email === email)) {
            return [...prev, tempUser];
          }
          return prev;
        });
        onLogin(tempUser);
        setLoginError('');
      }
    }
  };

  // Handle User Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Input validations
    if (!regUniqueId.trim() || !regFirstName.trim() || !regSecondName.trim() || !regPosition.trim() || !regEmail.trim() || !regPassword) {
      setRegError('ALL REQUISITE FIELDS MARKS (*) MUST BE COMPLETED SINCERELY.');
      return;
    }

    // Unique ID duplication check (Decided by admin)
    const formatUniqueId = regUniqueId.trim().toUpperCase();
    if (users.some(u => u.uniqueId.toUpperCase() === formatUniqueId)) {
      setRegError(`MEMBER ID "${formatUniqueId}" IS ALREADY ASSIGNED TO ANOTHER CO-WORKER.`);
      return;
    }

    // Email duplication check
    const formatEmail = regEmail.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === formatEmail)) {
      setRegError('THIS EMAIL IS ALREADY REGISTERED UNDER MARINE FASTENERS PORTAL.');
      return;
    }

    // Create custom user entry
    const newId = 'user-' + Date.now();
    const targetCategory = currentUser ? currentUserCategory : regCompanyCategory;
    const assignedCompanyId = targetCategory === 'BOLT MASTER' ? 'comp-bmm' : targetCategory === 'UNITED METAL' ? 'comp-umi' : 'comp-mfi';
    const newUser: AppUser = {
      id: newId,
      uniqueId: formatUniqueId,
      firstName: regFirstName.trim().toUpperCase(),
      secondName: regSecondName.trim().toUpperCase(),
      position: regPosition.trim().toUpperCase(),
      phone: regPhone.trim(),
      mobile: regMobile.trim(),
      email: formatEmail,
      role: regRole,
      password: regPassword,
      companyCategory: targetCategory,
      companyId: assignedCompanyId,
      allowedCompanies: [assignedCompanyId],
      isApproved: currentUser ? true : false,
      canViewSystemRegistry: regRole === 'Admin' ? true : false
    };

    setUsers(prev => [...prev, newUser]);
    if (currentUser) {
      setRegSuccess(`ACCOUNT CREATED AND APPROVED FOR ${newUser.firstName} UNDER ${targetCategory}!`);
    } else {
      setRegSuccess(`NEW ACCOUNT APPLICATION FOR ${newUser.firstName} SUBMITTED! MUST BE APPROVED BY ADMIN FROM USER FORM BEFORE YOU CAN LOG IN.`);
    }
    
    // Clear registration fields
    setRegUniqueId('');
    setRegFirstName('');
    setRegSecondName('');
    setRegPosition('');
    setRegPhone('');
    setRegMobile('');
    setRegEmail('');
    setRegPassword('');
    setRegRole('Viewer');
    setRegCompanyCategory('MARINE FASTENERS');

    // Dynamic delayed behavior based on authentication state
    if (currentUser) {
      setTimeout(() => {
        setShowAdminRegForm(false);
        setRegSuccess('');
      }, 2500);
    } else {
      // Switch view back to login after short delay
      setTimeout(() => {
        setActiveForm('login');
        setRegSuccess('');
      }, 2800);
    }
  };

  // Admin action: Delete a user using custom, non-blocking state confirmation (no iframe pitfalls!)
  const handleDeleteUser = (userId: string) => {
    setDeleteError('');
    if (currentUser?.id === userId) {
      setDeleteError("YOU CANNOT REMOVE YOUR ACTIVE LOGGED-IN SESSION.");
      return;
    }
    
    setDeleteConfirmId(userId);
  };

  const executeDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setDeleteConfirmId(null);
    setDeleteError('');
  };

  const cancelDeleteUser = () => {
    setDeleteConfirmId(null);
    setDeleteError('');
  };

  // Start Inline Editing for a user
  const handleStartEdit = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditCompanyCategory(user.companyCategory || getCompanyCategoryByCompanyId(user.companyId));
    setEditUniqueId(user.uniqueId || '');
    setEditFirstName(user.firstName || '');
    setEditSecondName(user.secondName || '');
    setEditPosition(user.position || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditMobile(user.mobile || '');
    setEditRole(user.role || 'Viewer');
    setEditPassword(user.password || '');
    setEditCanViewRegistry(user.canViewSystemRegistry ?? (user.role === 'Admin'));
    setEditIsApproved(user.isApproved ?? true);
    setEditError('');
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditError('');
  };

  // Save Edits
  const handleSaveEdit = (userId: string) => {
    setEditError('');

    // Field validations
    if (!editUniqueId.trim() || !editFirstName.trim() || !editSecondName.trim() || !editPosition.trim() || !editEmail.trim()) {
      setEditError('REQUIRED FIELDS (UNIQUE ID, FIRST NAME, SECOND NAME, POSITION, EMAIL) MUST NOT BE EMPTY.');
      return;
    }

    const formatUniqueId = editUniqueId.trim().toUpperCase();
    const formatEmail = editEmail.trim().toLowerCase();

    // Check Unique ID duplication (excluding self)
    if (users.some(u => u.id !== userId && u.uniqueId.toUpperCase() === formatUniqueId)) {
      setEditError(`MEMBER ID "${formatUniqueId}" IS ALREADY ASSIGNED TO ANOTHER CO-WORKER.`);
      return;
    }

    // Check Email duplication (excluding self)
    if (users.some(u => u.id !== userId && u.email.toLowerCase() === formatEmail)) {
      setEditError('THIS EMAIL IS ALREADY REGISTERED FOR ANOTHER USER.');
      return;
    }

    const assignedCompanyId = editCompanyCategory === 'BOLT MASTER' ? 'comp-bmm' : editCompanyCategory === 'UNITED METAL' ? 'comp-umi' : 'comp-mfi';

    // Update state
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const updatedUser: AppUser = {
          ...user,
          uniqueId: formatUniqueId,
          firstName: editFirstName.trim().toUpperCase(),
          secondName: editSecondName.trim().toUpperCase(),
          position: editPosition.trim().toUpperCase(),
          phone: editPhone.trim(),
          mobile: editMobile.trim(),
          email: formatEmail,
          role: editRole,
          password: editPassword,
          companyCategory: editCompanyCategory,
          companyId: assignedCompanyId,
          allowedCompanies: [assignedCompanyId],
          isApproved: editIsApproved,
          canViewSystemRegistry: editCanViewRegistry
        };

        // If editing own logged-in user, update current session live
        if (currentUser && currentUser.id === userId) {
          onLogin(updatedUser);
        }

        return updatedUser;
      }
      return user;
    });

    setUsers(updatedUsers);
    setEditingUserId(null);
  };

  const handleQuickRoleChange = (userId: string, newRole: 'Admin' | 'Editor' | 'Viewer') => {
    if (currentUser && userId === currentUser.id && newRole !== 'Admin') {
      const otherAdmins = users.filter(u => u.id !== userId && u.role === 'Admin');
      if (otherAdmins.length === 0) {
        setDeleteError("CRITICAL WARNING: CANNOT DEMOTE THE SOLE REGISTERED ADMINISTRATOR TO PREVENT TOTAL SYSTEM LOCKOUT.");
        setTimeout(() => setDeleteError(''), 5000);
        return;
      }
    }
    
    const updated = users.map(u => {
      if (u.id === userId) {
        const uUser: AppUser = { ...u, role: newRole };
        if (currentUser && currentUser.id === userId) {
          onLogin(uUser);
        }
        return uUser;
      }
      return u;
    });
    setUsers(updated);
  };

  return (
    <div className="space-y-8 font-sans antialiased">
      {/* Main Workspace split */}
      {!currentUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: ACTIVE SIGN IN / UP PANELS */}
          <div className="lg:col-span-6 bg-white border border-slate-205 shadow-sm p-6 relative">
            <div className="flex border-b border-slate-200 mb-6 font-mono text-[11px] font-bold uppercase">
              <button
                type="button"
                onClick={() => { setActiveForm('login'); setLoginError(''); setRegError(''); }}
                className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${activeForm === 'login' ? 'border-[#f37021] text-slate-905 font-bold bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-[#f37021]" /> PORTAL LOGIN
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveForm('register'); setLoginError(''); setRegError(''); }}
                className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${activeForm === 'register' ? 'border-[#f37021] text-slate-905 font-bold bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#f37021]" /> ACCOUNT SIGN UP
                </span>
              </button>
            </div>

            {/* FORM 1: LOGIN MODULE */}
            {activeForm === 'login' && (
              <div className="space-y-6 animate-fadeIn">
                {forgotPasswordMode ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase text-[#f37021] tracking-wider">RECOVER PORTAL PASSWORD</h3>
                      <p className="text-[10px] text-slate-400 uppercase mt-0.5">Validate your credential tags to recoup credentials</p>
                    </div>

                    {forgotErrorMessage && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 font-mono text-[9px] uppercase font-bold leading-normal animate-shake">
                        {forgotErrorMessage}
                      </div>
                    )}

                    {forgotSuccessMessage && (
                      <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 font-mono text-[10px] uppercase font-bold leading-relaxed">
                        {forgotSuccessMessage}
                      </div>
                    )}

                    <form onSubmit={handleRecoverPassword} className="space-y-4 text-xs font-mono">
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Your Unique ID</label>
                        <div className="relative">
                          <Hash className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={forgotUniqueId}
                            onChange={(e) => setForgotUniqueId(e.target.value)}
                            placeholder="e.g. MF-001"
                            className="w-full pl-8 p-2 border border-slate-300 focus:border-[#f37021] focus:outline-none focus:ring-0 text-slate-800 text-[11px] uppercase font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Registered Business Email</label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="e.g. yourname@marinefasteners.co"
                            className="w-full pl-8 p-2 border border-slate-300 focus:border-[#f37021] focus:outline-none focus:ring-0 text-slate-800 text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPasswordMode(false);
                            setForgotErrorMessage('');
                            setForgotSuccessMessage('');
                          }}
                          className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-805 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          ← BACK TO LOGIN
                        </button>
                        
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-[#f37021] hover:bg-orange-600 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer border border-orange-755 shadow-3xs"
                        >
                          RECOVER PASSWORD
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">LOGIN TO ACCESS AUTHORIZED STOCK SHEETS</h3>
                      <p className="text-[10px] text-slate-400 uppercase mt-0.5">Enter registered Marine Fasteners company credentials</p>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 font-mono text-[9px] uppercase font-bold leading-normal">
                        {loginError}
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-mono">
                      {/* Field 1: UNIQUE ID */}
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase">MEMBER UNIQUE ID</label>
                        <div className="relative">
                          <Hash className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={loginUniqueId}
                            onChange={(e) => setLoginUniqueId(e.target.value)}
                            placeholder="e.g. MF-001 (See credentials in quick list below)"
                            className="w-full pl-8 p-2 border border-slate-300 focus:border-[#f37021] focus:outline-none focus:ring-0 text-slate-800 text-[11px] uppercase font-bold"
                          />
                        </div>
                      </div>

                      {/* Field 2: EMAIL */}
                      <div className="space-y-1">
                        <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Registered Business Email</label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="e.g. yourname@marinefasteners.co"
                            className="w-full pl-8 p-2 border border-slate-300 focus:border-[#f37021] focus:outline-none focus:ring-0 text-slate-800 text-[11px]"
                          />
                        </div>
                      </div>

                      {/* Field 3: PASSWORD */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase">Access Password / PIN</label>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotPasswordMode(true);
                              setForgotUniqueId(loginUniqueId);
                              setForgotEmail(loginEmail);
                              setForgotErrorMessage('');
                              setForgotSuccessMessage('');
                            }}
                            className="text-[#f37021] hover:underline hover:text-orange-600 font-bold text-[9px] uppercase tracking-normal cursor-pointer"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-8 p-2 border border-slate-300 focus:border-[#f37021] focus:outline-none focus:ring-0 text-slate-850 text-[11px]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer border border-slate-950 shadow-3xs"
                      >
                        SUBMIT SECURITY LOGIN
                      </button>
                    </form>

                    {/* Quick Selection Helpers */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-brand-orange" />
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">QUICK CHOOSE PRELOADED PROFILES (TEST NOW):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginUniqueId('MF-FSL01');
                            setLoginEmail('faisal@marinefasteners.co');
                            setLoginPassword('admin');
                            handleQuickLogin('faisal@marinefasteners.co', 'admin');
                          }}
                          className="bg-orange-50 hover:bg-[#f37021] hover:text-white text-slate-800 p-2.5 border border-orange-200 hover:border-[#f37021] text-left transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[10px] text-[#f37021] hover:text-inherit">FAISAL MAHMUD (MANAGER)</div>
                          <div className="text-[8px] opacity-90">Unique ID: MF-FSL01</div>
                          <div className="text-[8px] opacity-90">Role: Admin &bull; Pass: admin</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLoginUniqueId('MF-STR01');
                            setLoginEmail('store.marinefasteners2018@gmail.com');
                            setLoginPassword('admin');
                            handleQuickLogin('store.marinefasteners2018@gmail.com', 'admin');
                          }}
                          className="bg-emerald-50/50 hover:bg-emerald-600 hover:text-white text-slate-800 p-2.5 border border-emerald-200 hover:border-emerald-600 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[10px] text-emerald-800 hover:text-inherit">STORE MANAGER</div>
                          <div className="text-[10px] opacity-90">Unique ID: MF-STR01</div>
                          <div className="text-[8px] opacity-90">Role: Admin &bull; Pass: admin</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLoginUniqueId('MF-001');
                            setLoginEmail('admin@marinefasteners.co');
                            setLoginPassword('admin');
                            handleQuickLogin('admin@marinefasteners.co', 'admin');
                          }}
                          className="bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-800 p-2.5 border border-slate-200 hover:border-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[10px]">FAHIM (DIRECTOR)</div>
                          <div className="text-[8px] opacity-80">Unique ID: MF-001</div>
                          <div className="text-[8px] opacity-80">Role: Admin &bull; Pass: admin</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setLoginUniqueId('MFASIF-2026');
                            setLoginEmail('mfi@marinefasteners.co');
                            setLoginPassword('Asif6792');
                            handleQuickLogin('mfi@marinefasteners.co', 'Asif6792');
                          }}
                          className="bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-750 p-2.5 border border-slate-200 hover:border-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <div className="font-semibold text-[10px]">MR. ASIF (SALES)</div>
                          <div className="text-[8px] opacity-80">Unique ID: MFASIF-2026</div>
                          <div className="text-[8px] opacity-80">Role: Viewer &bull; Pass: Asif6792</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FORM 2: REGISTER MODULE */}
            {activeForm === 'register' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wider">REGISTRATION FOR NEW MEMBER SIGN UP</h3>
                  <p className="text-[10px] text-slate-400 uppercase mt-0.5">Create your company agent profiling record immediately</p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 font-mono text-[9px] uppercase font-bold">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 font-semibold text-[9.5px] uppercase font-mono flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> {regSuccess}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-sans">
                  {/* Row 0.5: UNIQUE ID DECIDED BY ADMIN */}
                  <div className="space-y-1 font-mono">
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Member Unique ID (Decided by Admin) *</label>
                    <div className="relative">
                      <Hash className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regUniqueId}
                        onChange={(e) => setRegUniqueId(e.target.value)}
                        placeholder="e.g. MF-003, MF-101"
                        className="w-full pl-8 p-1.5 border border-slate-300 focus:outline-[#f37021] text-[10.5px] font-bold uppercase"
                      />
                    </div>
                  </div>

                  {/* Row 1: First & Second Name */}
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="space-y-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase">First Name *</label>
                      <div className="relative">
                        <User className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          placeholder="FAHIM"
                          className="w-full pl-6 p-1.5 border border-slate-300 focus:outline-none text-[10px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Second Name *</label>
                      <div className="relative">
                        <User className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regSecondName}
                          onChange={(e) => setRegSecondName(e.target.value)}
                          placeholder="MAHMUD"
                          className="w-full pl-6 p-1.5 border border-slate-300 focus:outline-none text-[10px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Position */}
                  <div className="space-y-1 font-mono">
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Position / Title *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regPosition}
                        onChange={(e) => setRegPosition(e.target.value)}
                        placeholder="e.g. PURCHASE MANAGER"
                        className="w-full pl-6 p-1.5 border border-slate-300 focus:outline-none text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Row 3: Phone & Mobile */}
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="space-y-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+971 6 ..."
                          className="w-full pl-6 p-1.5 border border-slate-300 focus:outline-none text-[10px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          placeholder="+971 50 ..."
                          className="w-full pl-6 p-1.5 border border-slate-300 focus:outline-none text-[10px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Email */}
                  <div className="space-y-1 font-mono">
                    <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. purchaseteam@marinefasteners.co"
                        className="w-full pl-6 p-1.5 border border-slate-300 focus:outline-none text-[10px]"
                      />
                    </div>
                  </div>

                  {/* Row 5: Password & Security Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className="space-y-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Auth Password *</label>
                      <div className="relative">
                        <Key className="absolute left-2 top-1.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-6 p-1.5 border border-slate-300 focus:outline-none text-[10px]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-[8.5px] font-bold text-slate-500 uppercase">Clearance Role *</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as 'Admin' | 'Editor' | 'Viewer')}
                        className="w-full p-1.5 border border-slate-300 focus:outline-none text-[10.5px] bg-white text-slate-800 rounded-none h-7.5"
                      >
                        <option value="Viewer">Viewer (Read Only)</option>
                        <option value="Editor">Editor (View & Edit)</option>
                        <option value="Admin">Admin (Full Control)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#f37021] hover:bg-orange-600 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer border border-[#f37021]"
                  >
                    REGISTER NEW USER RECORD
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: GUEST EXPERIENCE INFO HERO */}
          <div className="lg:col-span-6 bg-[#0f172a] text-white p-6 border-l-4 border-[#f37021] flex flex-col justify-between h-full min-h-[440px]">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#f37021] shrink-0" />
                <div>
                  <h3 className="font-sans font-bold uppercase text-sm tracking-widest text-[#f37021]">AUTHORIZED LEVEL CLEARANCE</h3>
                  <span className="text-[9px] font-mono text-slate-400 block tracking-widest uppercase">{activeCompany.name}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans leading-relaxed text-slate-300">
                <div className="space-y-1 bg-slate-800/40 p-3 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-brand-orange text-[10px] font-bold font-mono">
                    <span className="w-2 h-2 bg-brand-orange"></span>
                    <span>1. READ-ONLY ACCESS GUESTS / VIEWERS</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Can search all fast thread, hex caps, marine plates specifications sheets, monitor dynamic incoming and outgoing physical weights, track live stock locations. Action lists remain viewable but completely protected from writes or deletions.
                  </p>
                </div>

                <div className="space-y-1 bg-slate-800/40 p-3 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold font-mono">
                    <span className="w-2 h-2 bg-emerald-400"></span>
                    <span>2. FULL CONTROL ACCESS ADMINISTRATORS</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Sustains edit capacities globally. Right side actions are activated for immediate physical inventory updates, document sheet additions, delete capabilities, and user registry editing.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 mt-8">
              <span className="text-[8.5px] font-bold font-mono tracking-wider text-slate-500 uppercase block">WAREHOUSE OFFICE HUB</span>
              <p className="text-[10px] text-slate-400">
                Ajman Industrial Area 2, United Arab Emirates • Tel: +971 6 525 0526
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* REGISTERED USERS SYSTEM REGISTRY & SETTINGS COMPONENT */
        <div className="max-w-5xl space-y-4 font-sans">
          {/* Top User Info & Sub-Tabs Navigation Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white border border-[#A6C4DE] p-2.5 shadow-3xs">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-4 bg-[#FF6B00] inline-block"></span>
                <span className="font-bold text-[#002D62] uppercase tracking-wider text-[11px]">
                  SETTINGS PORTAL
                </span>
              </div>

              {/* Active Logged-in User Pill */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-250 py-1 px-2.5 text-xs font-mono">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-bold text-slate-900 uppercase">
                    {currentUser.firstName} {currentUser.secondName}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500">ID: <strong className="text-[#FF6B00]">{currentUser.uniqueId}</strong></span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-indigo-700 font-extrabold uppercase">{currentUser.role}</span>
                  {currentUser.canViewSystemRegistry && (
                    <span className="text-[7.5px] bg-emerald-100 text-emerald-800 px-1 font-bold border border-emerald-300 uppercase">
                      REGISTRY ACCESS
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-1.5 px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[8.5px] uppercase tracking-wider transition-colors cursor-pointer border border-rose-700 flex items-center gap-1 shadow-2xs"
                  title="Sign out of current active session"
                >
                  <LogOut className="w-2.5 h-2.5" /> LOGOUT
                </button>
              </div>
            </div>

            {/* Sub-Tabs Navigation Bar */}
            <div className="flex flex-wrap bg-slate-100 p-1 border border-[#A6C4DE] gap-1 font-mono text-[10.5px] font-bold uppercase tracking-wider select-none">
              <button
                type="button"
                onClick={() => setSettingsTab('companies')}
                className={`flex-1 min-w-[150px] py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                  settingsTab === 'companies'
                    ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-extrabold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#FF6B00]" />
                <span>COMPANY ENTITIES</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('typography')}
                className={`flex-1 min-w-[140px] py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                  settingsTab === 'typography'
                    ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-extrabold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Type className="w-4 h-4 text-[#FF6B00]" />
                <span>GLOBAL TYPOGRAPHY &amp; THEME</span>
              </button>

              {(currentUser.role === 'Admin' || currentUser.canViewSystemRegistry === true) && (
                <button
                  type="button"
                  onClick={() => setSettingsTab('registry')}
                  className={`flex-1 min-w-[140px] py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                    settingsTab === 'registry'
                      ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-extrabold'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#FF6B00]" />
                  <span>SYSTEM REGISTRY &amp; USERS</span>
                </button>
              )}

              {(currentUser.role === 'Admin' || currentUser.canViewSystemRegistry === true) && (
                <button
                  type="button"
                  onClick={() => setSettingsTab('diagnostics')}
                  className={`flex-1 min-w-[140px] py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                    settingsTab === 'diagnostics'
                      ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-extrabold'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Settings2 className="w-4 h-4 text-[#FF6B00]" />
                  <span>DIAGNOSTICS &amp; STORAGE</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSettingsTab('my_account')}
                className={`flex-1 min-w-[140px] py-2 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all border ${
                  settingsTab === 'my_account'
                    ? 'bg-[#002D62] text-white border-[#002D62] shadow-2xs font-extrabold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-[#FF6B00]" />
                <span>MY PROFILE &amp; CREDENTIALS</span>
              </button>
            </div>
          </div>

          {/* Toast Notice */}
          {companyPermissionsToast && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded flex items-center justify-between text-xs font-mono font-bold animate-in fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{companyPermissionsToast}</span>
              </div>
              <button 
                type="button"
                onClick={() => setCompanyPermissionsToast('')}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 0: MULTI-COMPANY MANAGEMENT & PERMISSIONS */}
          {settingsTab === 'companies' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Section 1: Registered Company Entities */}
              <div className="bg-white border border-[#A6C4DE] p-5 shadow-3xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#A6C4DE]">
                  <div>
                    <h4 className="text-xs font-bold text-[#002D62] font-mono uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#FF6B00]" />
                      <span>REGISTERED COMPANIES &amp; ENTITY PROFILES ({effectiveCompaniesList.length})</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                      {effectiveCompaniesList.length > 1
                        ? "Manage multiple business entities from a single unified ERP system. Switch active branch, customize TRN, logos, stamps, and letterhead headers."
                        : "Manage active business entity profile, TRN, logo, stamp, and letterhead header configurations."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser?.role === 'Admin' && effectiveCompaniesList.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditCompanyId(undefined);
                          setIsEditCompanyModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-white font-mono font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ ADD NEW COMPANY</span>
                      </button>
                    ) : null}
                    {currentUser?.role === 'Admin' && effectiveCompaniesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Restore the default companies for this environment?")) {
                            saveCompaniesList(DEFAULT_COMPANIES);
                            setCompaniesList(DEFAULT_COMPANIES);
                            setActiveCompany(DEFAULT_COMPANIES[0]);
                            setActiveCompanyId(DEFAULT_COMPANIES[0].id);
                            setCompanyPermissionsToast("Restored corporate entities!");
                            setTimeout(() => setCompanyPermissionsToast(''), 3500);
                          }
                        }}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-[10px] uppercase border border-slate-300 cursor-pointer"
                        title="Reset to standard company seeds"
                      >
                        RESTORE DEFAULTS
                      </button>
                    )}
                  </div>
                </div>

                {/* Company Cards Grid */}
                <div className={`grid grid-cols-1 ${effectiveCompaniesList.length > 1 ? 'md:grid-cols-3' : 'md:grid-cols-1 max-w-xl'} gap-4`}>
                  {effectiveCompaniesList.map((comp) => {
                    const isActive = comp.id === activeCompany.id;
                    const code = comp.code || comp.name.substring(0, 3).toUpperCase();
                    return (
                      <div
                        key={comp.id}
                        className={`p-4 border rounded transition-all flex flex-col justify-between ${
                          isActive
                            ? 'bg-[#083c54]/5 border-[#083c54] shadow-md ring-1 ring-[#083c54]'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Header with Badges */}
                          <div className="flex items-start justify-between gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-black tracking-wider uppercase rounded ${
                              code === 'MFI' ? 'bg-blue-600 text-white' :
                              code === 'BMM' ? 'bg-amber-600 text-white' :
                              'bg-purple-600 text-white'
                            }`}>
                              {code}
                            </span>
                            {isActive ? (
                              <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8.5px] font-extrabold uppercase rounded-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> ACTIVE ERP ENTITY
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-mono">
                                Inactive
                              </span>
                            )}
                          </div>

                          {/* Company Name & Details */}
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-900 leading-snug uppercase">
                              {comp.name}
                            </h5>
                            {comp.subtitle && (
                              <p className="text-[9.5px] text-slate-500 font-medium mt-0.5">
                                {comp.subtitle}
                              </p>
                            )}
                          </div>

                          {/* Profile Metas */}
                          <div className="space-y-1 text-[9.5px] font-mono text-slate-600 bg-white p-2 border border-slate-200 rounded">
                            <div className="flex justify-between">
                              <span className="text-slate-400">TRN:</span>
                              <strong className="text-slate-800 font-bold">{comp.trn || 'Not Registered'}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">TEL:</span>
                              <span className="truncate max-w-[150px]">{comp.phone || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">EMAIL:</span>
                              <span className="truncate max-w-[150px]">{comp.email || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">LOCATION:</span>
                              <span className="truncate max-w-[150px]">{comp.location || 'UAE'}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100 text-[8.5px]">
                              <span className="text-slate-400">LOGO / STAMP:</span>
                              <span className="font-bold text-[#083c54]">
                                {comp.logoUrl ? '✓ Logo' : '✗ No Logo'} &bull; {comp.stampUrl ? '✓ Stamp' : '✗ No Stamp'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between gap-1.5 font-mono text-[9.5px]">
                          {!isActive ? (
                            <button
                              type="button"
                              onClick={() => handleSetActiveCompany(comp)}
                              className="flex-1 py-1.5 px-2 bg-[#002D62] hover:bg-slate-900 text-white font-bold uppercase rounded-xs transition-colors cursor-pointer text-center"
                            >
                              SET ACTIVE
                            </button>
                          ) : (
                            <span className="flex-1 py-1.5 px-2 bg-emerald-50 text-emerald-800 font-bold uppercase rounded-xs text-center border border-emerald-200">
                              CURRENT ACTIVE
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditCompanyId(comp.id);
                              setIsEditCompanyModalOpen(true);
                            }}
                            className="py-1.5 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold uppercase rounded-xs transition-colors cursor-pointer"
                            title="Edit Logo, Stamp, TRN and Letterhead details"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>

                          {companiesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCompany(comp)}
                              className="py-1.5 px-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold uppercase rounded-xs transition-colors cursor-pointer"
                              title="Delete this company"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Multi-Company Architecture Info */}
              <div className="bg-white border border-[#A6C4DE] p-5 shadow-3xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#A6C4DE]">
                  <h4 className="text-xs font-bold text-[#002D62] font-mono uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>CORPORATE DATA SEGREGATION &amp; USER ACCOUNTS</span>
                  </h4>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-sans text-slate-700 space-y-2">
                  <p className="text-[11px] leading-relaxed">
                    Each company maintains completely isolated financial records, purchases, inventory, daybooks, fixed assets, and quotation records.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 bg-white rounded border border-slate-200 shadow-3xs">
                      <strong className="text-indigo-800 uppercase block font-mono text-[10px] mb-1">🏢 Unique Company Users:</strong>
                      <span className="text-[10px] text-slate-600 leading-normal">
                        Create dedicated user accounts and distinct usernames for each corporate entity in the <strong>System Registry &amp; Users</strong> tab.
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded border border-slate-200 shadow-3xs">
                      <strong className="text-emerald-800 uppercase block font-mono text-[10px] mb-1">🔒 Automatic Company Isolation:</strong>
                      <span className="text-[10px] text-slate-600 leading-normal">
                        Logged-in users automatically view and manage data exclusively for their selected company upon login.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: GLOBAL TYPOGRAPHY & FONT SIZING (ACCESSIBLE TO ALL USERS) */}
          {settingsTab === 'typography' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Preset Typography Themes */}

              {/* Preset Typography Themes */}
              <div className="bg-white border border-[#A6C4DE] p-4 space-y-3 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#002D62] font-mono uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                    QUICK 1-CLICK TYPOGRAPHY PRESETS:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFont('Plus Jakarta Sans');
                      setSelectedSize('compact');
                      setCustomScale(100);
                      setLineHeight('standard');
                      setLetterSpacing('normal');
                      setHighContrast(false);
                      setTabularNums(true);
                      setUppercaseHeaders(true);
                    }}
                    className="text-[9px] font-mono text-slate-500 hover:text-[#FF6B00] font-bold uppercase underline cursor-pointer"
                  >
                    Reset All To Default
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-mono">
                  {/* Preset 1 */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFont('Open Sans');
                      setSelectedSize('standard');
                      setCustomScale(100);
                      setLineHeight('standard');
                      setLetterSpacing('normal');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-[#002D62] hover:text-white border border-slate-300 hover:border-[#002D62] text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-[10px] text-[#002D62] group-hover:text-white uppercase">Corporate Standard</div>
                    <div className="text-[8.5px] text-slate-500 group-hover:text-slate-200 mt-0.5">Open Sans • 13px</div>
                  </button>

                  {/* Preset 2 */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFont('Plus Jakarta Sans');
                      setSelectedSize('compact');
                      setCustomScale(100);
                      setLineHeight('compact');
                      setLetterSpacing('dense');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-[#002D62] hover:text-white border border-slate-300 hover:border-[#002D62] text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-[10px] text-[#002D62] group-hover:text-white uppercase">High-Density ERP</div>
                    <div className="text-[8.5px] text-slate-500 group-hover:text-slate-200 mt-0.5">Plus Jakarta • 11.5px</div>
                  </button>

                  {/* Preset 3 */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFont('Space Grotesk');
                      setSelectedSize('compact');
                      setCustomScale(100);
                      setLineHeight('standard');
                      setLetterSpacing('mono');
                      setTabularNums(true);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-[#002D62] hover:text-white border border-slate-300 hover:border-[#002D62] text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-[10px] text-[#002D62] group-hover:text-white uppercase">Technical Spec</div>
                    <div className="text-[8.5px] text-slate-500 group-hover:text-slate-200 mt-0.5">Space Grotesk • 11.5px</div>
                  </button>

                  {/* Preset 4 */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFont('JetBrains Mono');
                      setSelectedSize('micro');
                      setCustomScale(100);
                      setLineHeight('compact');
                      setLetterSpacing('mono');
                      setTabularNums(true);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-[#002D62] hover:text-white border border-slate-300 hover:border-[#002D62] text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-[10px] text-[#002D62] group-hover:text-white uppercase">Developer Mono</div>
                    <div className="text-[8.5px] text-slate-500 group-hover:text-slate-200 mt-0.5">JetBrains Mono • 10.5px</div>
                  </button>

                  {/* Preset 5 */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFont('Inter');
                      setSelectedSize('comfortable');
                      setCustomScale(100);
                      setLineHeight('relaxed');
                      setLetterSpacing('normal');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-[#002D62] hover:text-white border border-slate-300 hover:border-[#002D62] text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-[10px] text-[#002D62] group-hover:text-white uppercase">Comfortable Reading</div>
                    <div className="text-[8.5px] text-slate-500 group-hover:text-slate-200 mt-0.5">Inter • 14px Relaxed</div>
                  </button>
                </div>
              </div>

              {/* 6 Theme Presets Component */}
              <div className="bg-white border border-[#A6C4DE] p-4 space-y-3 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#002D62] font-mono uppercase flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#FF6B00]" />
                    SELECT COLOR THEME:
                  </span>
                  <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase">6 ACTIVE SYSTEM PRESETS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
                  {/* Theme 1 */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('default_navy')}
                    className={`p-2.5 border text-left transition-all cursor-pointer relative ${
                      selectedTheme === 'default_navy'
                        ? 'bg-amber-500/[0.08] border-[#FF6B00] shadow-2xs'
                        : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 bg-[#002D62] rounded-xs inline-block border border-slate-400"></span>
                      <span className="w-3 h-3 bg-[#FF6B00] rounded-xs inline-block border border-slate-400"></span>
                    </div>
                    <div className="font-bold text-[10px] text-[#002D62] uppercase">1. Marine Navy</div>
                    <div className="text-[8px] text-slate-500 mt-0.5">Classic Navy &amp; Focus Orange</div>
                  </button>

                  {/* Theme 2 */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('steel_industrial')}
                    className={`p-2.5 border text-left transition-all cursor-pointer relative ${
                      selectedTheme === 'steel_industrial'
                        ? 'bg-sky-50 border-[#0284c7] shadow-2xs'
                        : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 bg-[#0f172a] rounded-xs inline-block border border-slate-400"></span>
                      <span className="w-3 h-3 bg-[#0284c7] rounded-xs inline-block border border-slate-400"></span>
                    </div>
                    <div className="font-bold text-[10px] text-slate-900 uppercase">2. Steel Industrial</div>
                    <div className="text-[8px] text-slate-500 mt-0.5">Steel Slate &amp; Cyan Accent</div>
                  </button>

                  {/* Theme 3 */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('emerald_erp')}
                    className={`p-2.5 border text-left transition-all cursor-pointer relative ${
                      selectedTheme === 'emerald_erp'
                        ? 'bg-emerald-50 border-[#d97706] shadow-2xs'
                        : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 bg-[#064e3b] rounded-xs inline-block border border-slate-400"></span>
                      <span className="w-3 h-3 bg-[#d97706] rounded-xs inline-block border border-slate-400"></span>
                    </div>
                    <div className="font-bold text-[10px] text-emerald-900 uppercase">3. Emerald ERP</div>
                    <div className="text-[8px] text-slate-500 mt-0.5">Forest Green &amp; Gold Amber</div>
                  </button>

                  {/* Theme 4 */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('sapphire_crimson')}
                    className={`p-2.5 border text-left transition-all cursor-pointer relative ${
                      selectedTheme === 'sapphire_crimson'
                        ? 'bg-rose-50 border-[#e11d48] shadow-2xs'
                        : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 bg-[#1e3a8a] rounded-xs inline-block border border-slate-400"></span>
                      <span className="w-3 h-3 bg-[#e11d48] rounded-xs inline-block border border-slate-400"></span>
                    </div>
                    <div className="font-bold text-[10px] text-blue-900 uppercase">4. Royal Sapphire</div>
                    <div className="text-[8px] text-slate-500 mt-0.5">Sapphire Blue &amp; Crimson</div>
                  </button>

                  {/* Theme 5 */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('dark_high_contrast')}
                    className={`p-2.5 border text-left transition-all cursor-pointer relative ${
                      selectedTheme === 'dark_high_contrast'
                        ? 'bg-slate-900 text-white border-[#f97316] shadow-2xs'
                        : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 bg-[#090d16] rounded-xs inline-block border border-slate-400"></span>
                      <span className="w-3 h-3 bg-[#f97316] rounded-xs inline-block border border-slate-400"></span>
                    </div>
                    <div className="font-bold text-[10px] uppercase">5. High Contrast Dark</div>
                    <div className="text-[8px] text-slate-400 mt-0.5">Dark Charcoal &amp; Vivid Orange</div>
                  </button>

                  {/* Theme 6 */}
                  <button
                    type="button"
                    onClick={() => setSelectedTheme('dashboard_blue_grey_black')}
                    className={`p-2.5 border text-left transition-all cursor-pointer relative ${
                      selectedTheme === 'dashboard_blue_grey_black'
                        ? 'bg-slate-900 text-white border-[#2563eb] shadow-2xs'
                        : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 bg-[#1e293b] rounded-xs inline-block border border-slate-400"></span>
                      <span className="w-3 h-3 bg-[#2563eb] rounded-xs inline-block border border-slate-400"></span>
                    </div>
                    <div className="font-bold text-[10px] uppercase">6. Dashboard Blue Grey &amp; Black</div>
                    <div className="text-[8px] text-slate-400 mt-0.5">Blue Grey, Pitch Black &amp; Blue</div>
                  </button>
                </div>
              </div>

              {/* Grid Layout: Typeface Picker & Size Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column 1: Typeface Selection */}
                <div className="lg:col-span-7 bg-white border border-[#A6C4DE] p-5 space-y-4 shadow-3xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#A6C4DE]">
                    <span className="w-2.5 h-5 bg-[#FF6B00] inline-block"></span>
                    <h4 className="text-xs font-bold text-[#002D62] uppercase tracking-wider">
                      1. Select Corporate Typeface Family
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {[
                      { name: 'Arial', desc: 'Standard System Sans-Serif', sample: 'Aa Bb Cc 123' },
                      { name: 'Arial MT', desc: 'Monotype Arial Variant', sample: 'Aa Bb Cc 123' },
                      { name: 'Arial MT Bold', desc: 'Bold Monotype Arial', sample: 'Aa Bb Cc 123' },
                      { name: 'Calibri', desc: 'Clean Microsoft Office Sans', sample: 'Aa Bb Cc 123' },
                      { name: 'Open Sans', desc: 'Default Corporate Standard', sample: 'Aa Bb Cc 123' },
                      { name: 'Helvetica Neue', desc: 'Swiss International Standard', sample: 'Aa Bb Cc 123' },
                      { name: 'Plus Jakarta Sans', desc: 'Clean Modern Geometric Sans', sample: 'Aa Bb Cc 123' },
                      { name: 'Inter', desc: 'High Legibility Screen Sans', sample: 'Aa Bb Cc 123' },
                      { name: 'Space Grotesk', desc: 'Technical Engineering Monospace', sample: 'Aa Bb Cc 123' },
                      { name: 'Outfit', desc: 'Modern Display Geometric', sample: 'Aa Bb Cc 123' },
                      { name: 'JetBrains Mono', desc: 'Code & Tabular Symmetric', sample: 'Aa Bb Cc 123' }
                    ].map(f => {
                      const isSelected = selectedFont === f.name;
                      const fontStyleObj = {
                        fontFamily: FONT_FAMILIES_MAP[f.name]?.family || f.name,
                        fontWeight: f.name === 'Arial MT Bold' ? '700' : undefined
                      };
                      return (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => setSelectedFont(f.name)}
                          className={`p-3 text-left border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-amber-500/[0.06] border-[#FF6B00] shadow-2xs'
                              : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#FF6B00] text-white text-[8px] font-bold font-mono uppercase">
                              ACTIVE
                            </span>
                          )}
                          <div 
                            className="text-sm font-bold text-slate-900"
                            style={fontStyleObj}
                          >
                            {f.name}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-500 uppercase mt-0.5 font-semibold">
                            {f.desc}
                          </div>
                          <div 
                            className="text-xs text-[#002D62] mt-1 pt-1 border-t border-slate-100 font-medium"
                            style={fontStyleObj}
                          >
                            {f.sample}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2: Size Presets & Scale Slider */}
                <div className="lg:col-span-5 bg-white border border-[#A6C4DE] p-5 space-y-5 shadow-3xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#A6C4DE]">
                      <span className="w-2.5 h-5 bg-[#002D62] inline-block"></span>
                      <h4 className="text-xs font-bold text-[#002D62] uppercase tracking-wider">
                        2. Grid Density &amp; Sizing Scale
                      </h4>
                    </div>

                    {/* Sizing Presets Buttons */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#002D62] uppercase mb-1.5 font-mono">
                        Base Font Size Preset:
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'micro', label: 'Micro (10.5px)' },
                          { id: 'compact', label: 'Compact (11.5px)' },
                          { id: 'standard', label: 'Standard (13.0px)' },
                          { id: 'comfortable', label: 'Comfortable (14.0px)' },
                          { id: 'spacious', label: 'Spacious (15.0px)' }
                        ].map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSize(s.id)}
                            className={`py-2 px-2 text-[10px] font-bold uppercase transition-all border font-mono ${
                              selectedSize === s.id
                                ? 'bg-[#002D62] text-white border-[#002D62]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scale Percentage Zoom Slider */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[#002D62] font-mono uppercase">
                        <span>Fine Font Scale Zoom:</span>
                        <span className="bg-[#FF6B00] text-white px-2 py-0.5 font-mono font-bold">
                          {customScale}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">80%</span>
                        <input
                          type="range"
                          min={80}
                          max={130}
                          step={1}
                          value={customScale}
                          onChange={(e) => setCustomScale(parseInt(e.target.value, 10))}
                          className="w-full accent-[#FF6B00] cursor-pointer h-2 bg-slate-200 rounded-xs"
                        />
                        <span className="text-[10px] font-mono text-slate-500 font-bold">130%</span>
                      </div>

                      {/* Quick Snap Scale Presets */}
                      <div className="flex items-center justify-between gap-1 pt-1 font-mono text-[9px]">
                        {[80, 90, 100, 110, 120].map(scaleVal => (
                          <button
                            key={scaleVal}
                            type="button"
                            onClick={() => setCustomScale(scaleVal)}
                            className={`px-1.5 py-0.5 border font-bold uppercase transition-all cursor-pointer ${
                              customScale === scaleVal
                                ? 'bg-[#002D62] text-white border-[#002D62]'
                                : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {scaleVal === 100 ? '100% (Default)' : `${scaleVal}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fine-Tuning Controls */}
                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#002D62] uppercase mb-1 font-mono">
                          Line Height (Spacing):
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 text-[9.5px] font-mono font-bold uppercase">
                          {[
                            { id: 'compact', label: 'Compact (1.25x)' },
                            { id: 'standard', label: 'Standard (1.45x)' },
                            { id: 'relaxed', label: 'Relaxed (1.65x)' }
                          ].map(lh => (
                            <button
                              key={lh.id}
                              type="button"
                              onClick={() => setLineHeight(lh.id as any)}
                              className={`py-1.5 px-1 text-center border transition-all ${
                                lineHeight === lh.id
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {lh.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#002D62] uppercase mb-1 font-mono">
                          Letter Spacing (Tracking):
                        </label>
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-bold uppercase">
                          {[
                            { id: 'dense', label: 'Dense' },
                            { id: 'normal', label: 'Normal' },
                            { id: 'wide', label: 'Wide' },
                            { id: 'mono', label: 'Monospace' }
                          ].map(tr => (
                            <button
                              key={tr.id}
                              type="button"
                              onClick={() => setLetterSpacing(tr.id as any)}
                              className={`py-1.5 px-1 text-center border transition-all ${
                                letterSpacing === tr.id
                                  ? 'bg-[#FF6B00] text-white border-[#FF6B00]'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {tr.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display & Formatting Toggles */}
                  <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                    <span className="block text-[9.5px] font-bold text-[#002D62] font-mono uppercase">
                      Display &amp; Table Formatting Toggles:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[9px] font-mono">
                      <label className="flex items-center gap-1.5 bg-white p-1.5 border border-slate-250 cursor-pointer hover:bg-amber-50">
                        <input
                          type="checkbox"
                          checked={highContrast}
                          onChange={(e) => setHighContrast(e.target.checked)}
                          className="w-3.5 h-3.5 text-[#FF6B00] accent-[#FF6B00]"
                        />
                        <span className="font-bold text-slate-800 uppercase">High Contrast</span>
                      </label>

                      <label className="flex items-center gap-1.5 bg-white p-1.5 border border-slate-250 cursor-pointer hover:bg-amber-50">
                        <input
                          type="checkbox"
                          checked={tabularNums}
                          onChange={(e) => setTabularNums(e.target.checked)}
                          className="w-3.5 h-3.5 text-[#FF6B00] accent-[#FF6B00]"
                        />
                        <span className="font-bold text-slate-800 uppercase">Tabular Figures</span>
                      </label>

                      <label className="flex items-center gap-1.5 bg-white p-1.5 border border-slate-250 cursor-pointer hover:bg-amber-50">
                        <input
                          type="checkbox"
                          checked={uppercaseHeaders}
                          onChange={(e) => setUppercaseHeaders(e.target.checked)}
                          className="w-3.5 h-3.5 text-[#FF6B00] accent-[#FF6B00]"
                        />
                        <span className="font-bold text-slate-800 uppercase">Caps Headers</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM REGISTRY & USER CLEARANCE CONTROL */}
          {settingsTab === 'registry' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Permission Check for System Registry Access */}
              {!(currentUser.role === 'Admin' || currentUser.canViewSystemRegistry === true) ? (
                /* RESTRICTED ACCESS NOTICE FOR NON-PERMITTED USERS */
                <div className="bg-white border border-[#A6C4DE] p-6 space-y-6 shadow-3xs">
                  <div className="p-5 bg-amber-500/[0.06] border-l-4 border-amber-500 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-700" />
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        SYSTEM REGISTRY VIEW PERMISSION: RESTRICTED
                      </h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      You are logged in as <strong className="text-slate-900 uppercase font-mono">{currentUser.firstName} {currentUser.secondName} ({currentUser.position || currentUser.role})</strong>.
                      Viewing the global list of registered system personnel and user accounts is restricted by administrator controls.
                    </p>
                    <div className="p-3 bg-white border border-amber-200 text-xs font-mono space-y-1">
                      <div className="font-bold text-slate-800">Your Current Authorization Status:</div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span>Clearance Role: <strong className="text-indigo-700">{currentUser.role}</strong></span>
                        <span>&bull;</span>
                        <span>System Registry View: <strong className="text-rose-600">DENIED</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-[#002D62] uppercase tracking-wider font-mono">
                      How to Request System Registry View Access:
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If your operational duties require viewing co-worker accounts or managing clearance roles, ask a System Administrator to enable the <strong>"Can View System Registry"</strong> option for your profile in Admin Control.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900">FAISAL MAHMUD (MANAGER)</div>
                        <div className="text-[10px] text-slate-500">Email: faisal@marinefasteners.co</div>
                        <a href="mailto:faisal@marinefasteners.co" className="text-[#FF6B00] text-[10px] font-bold hover:underline inline-block">
                          ✉ Send Access Request Email
                        </a>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900">FAHIM MAHMUD (DIRECTOR)</div>
                        <div className="text-[10px] text-slate-500">Email: admin@marinefasteners.co</div>
                        <a href="mailto:admin@marinefasteners.co" className="text-[#FF6B00] text-[10px] font-bold hover:underline inline-block">
                          ✉ Send Access Request Email
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">You can still fully customize your display preferences:</span>
                    <button
                      type="button"
                      onClick={() => setSettingsTab('typography')}
                      className="px-3 py-1.5 bg-[#002D62] text-white font-bold uppercase text-[10px] tracking-wider"
                    >
                      Go to Typography &amp; Theme Tab →
                    </button>
                  </div>
                </div>
              ) : (
                /* FULL SYSTEM REGISTRY MANAGEMENT FOR ADMINISTRATORS ONLY */
                <div className="space-y-6">
                  {/* Category Scoped Header Banner & Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className={`p-3.5 border transition-all text-white shadow-md flex items-center justify-between ${
                      currentUserCategory === 'BOLT MASTER'
                        ? 'bg-amber-900 border-amber-800'
                        : currentUserCategory === 'UNITED METAL'
                        ? 'bg-emerald-900 border-emerald-800'
                        : 'bg-[#002D62] border-[#002D62]'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                            {currentUserCategory} LLC PERSONNEL
                          </span>
                          <span className="px-1.5 py-0.25 text-[8.5px] bg-white/20 text-white rounded font-mono font-bold">
                            {currentUserCategory === 'BOLT MASTER' ? 'BMM' : currentUserCategory === 'UNITED METAL' ? 'UMI' : 'MFI'}
                          </span>
                        </div>
                        <div className="text-2xl font-black mt-1">{scopedUsers.length}</div>
                        <div className="text-[9.5px] opacity-80 mt-0.5">Active Corporate Personnel Records</div>
                      </div>
                      <Building2 className="w-8 h-8 opacity-40 shrink-0" />
                    </div>

                    <div className="p-3.5 bg-white border border-slate-300 shadow-3xs flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">SYSTEM ADMINISTRATORS</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {scopedUsers.filter(u => u.role === 'Admin').length}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Full System Authority</div>
                      </div>
                      <Shield className="w-8 h-8 text-[#FF6B00] opacity-80 shrink-0" />
                    </div>

                    <div className="p-3.5 bg-white border border-slate-300 shadow-3xs flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">EDITORS &amp; VIEWERS</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {scopedUsers.filter(u => u.role !== 'Admin').length}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Operational Personnel</div>
                      </div>
                      <Users className="w-8 h-8 text-indigo-600 opacity-80 shrink-0" />
                    </div>
                  </div>

                  {/* Controls Header & Search Filter */}
                  <div className="bg-white p-4 border border-[#A6C4DE] shadow-3xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={registrySearch}
                          onChange={(e) => setRegistrySearch(e.target.value)}
                          placeholder="SEARCH BY NAME, ID, EMAIL, OR POSITION..."
                          className="w-full pl-8 pr-3 py-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs font-mono bg-white uppercase text-slate-900"
                        />
                      </div>

                      <div className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 uppercase shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{currentUserCategory}</span>
                      </div>

                      <select
                        value={registryRoleFilter}
                        onChange={(e) => setRegistryRoleFilter(e.target.value as any)}
                        className="p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs font-mono bg-white text-slate-800 font-bold"
                      >
                        <option value="all">ALL ROLES</option>
                        <option value="Admin">ADMINS</option>
                        <option value="Editor">EDITORS</option>
                        <option value="Viewer">VIEWERS</option>
                        <option value="pending">PENDING APPROVAL</option>
                      </select>
                    </div>

                    {/* Add Co-worker toggle button for Admins */}
                    {currentUser.role === 'Admin' && (
                      <button 
                        type="button"
                        onClick={() => {
                          setShowAdminRegForm(prev => !prev);
                          setRegError('');
                          setRegSuccess('');
                        }}
                        className={`px-3.5 py-1.5 transition-colors font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer text-white flex items-center justify-center gap-1.5 shrink-0 ${
                          showAdminRegForm ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#002D62] hover:bg-[#FF6B00]'
                        }`}
                      >
                        {showAdminRegForm ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> CLOSE FORM
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-[#FF6B00]" /> ADD USER ({currentUserCategory})
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Add Co-Worker Drawer Form */}
                  {currentUser.role === 'Admin' && showAdminRegForm && (
                    <div className="p-5 bg-slate-50 border border-[#A6C4DE] shadow-2xs max-w-2xl animate-fadeIn space-y-4">
                      <div className="border-b border-slate-200 pb-2">
                        <h4 className="text-xs font-bold uppercase text-[#002D62] tracking-wider flex items-center gap-1.5">
                          <span className="w-2.5 h-4 bg-[#FF6B00] inline-block"></span>
                          REGISTER NEW USER TO COMPANY CATEGORY
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">
                          Assign user to Marine Fasteners, Bolt Master, or United Metal with dedicated credentials
                        </p>
                      </div>

                      {regError && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 font-mono text-[9px] uppercase font-bold">
                          ⚠️ {regError}
                        </div>
                      )}

                      {regSuccess && (
                        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 font-semibold text-[9.5px] uppercase font-mono flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> {regSuccess}
                        </div>
                      )}

                      <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs font-mono">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-700 uppercase mb-1">Company Entity *</label>
                            <div className="w-full p-1.5 border border-slate-300 bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span>{currentUserCategory}</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Unique User ID *</label>
                            <input
                              type="text"
                              required
                              value={regUniqueId}
                              onChange={(e) => setRegUniqueId(e.target.value.toUpperCase())}
                              placeholder="e.g. MF-003, BMM-001, UMI-001"
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs font-bold uppercase bg-white text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Clearance Role *</label>
                            <select
                              value={regRole}
                              onChange={(e) => setRegRole(e.target.value as any)}
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs font-bold uppercase bg-white text-slate-900"
                            >
                              <option value="Viewer">Viewer (Read Only)</option>
                              <option value="Editor">Editor (View &amp; Edit)</option>
                              <option value="Admin">Admin (Full Control)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">First Name *</label>
                            <input
                              type="text"
                              required
                              value={regFirstName}
                              onChange={(e) => setRegFirstName(e.target.value)}
                              placeholder="FIRST NAME"
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs uppercase bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Second Name *</label>
                            <input
                              type="text"
                              required
                              value={regSecondName}
                              onChange={(e) => setRegSecondName(e.target.value)}
                              placeholder="SECOND NAME"
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs uppercase bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Position / Title *</label>
                            <input
                              type="text"
                              required
                              value={regPosition}
                              onChange={(e) => setRegPosition(e.target.value)}
                              placeholder="e.g. QUALITY ENGINEER, SALES MANAGER"
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs uppercase bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="user@company.co"
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Category Password *</label>
                            <input
                              type="text"
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Enter login password"
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs bg-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase mb-1">Contact Phones</label>
                            <input
                              type="text"
                              value={regMobile}
                              onChange={(e) => setRegMobile(e.target.value)}
                              placeholder="+971 50 ..."
                              className="w-full p-1.5 border border-slate-300 focus:outline-[#FF6B00] text-xs bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer border border-[#FF6B00]"
                          >
                            ADD USER TO {regCompanyCategory}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAdminRegForm(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs uppercase cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* System Registry User Table */}
                  <div className="overflow-x-auto border border-[#A6C4DE] shadow-3xs bg-white">
                    <table className="w-full text-xs text-left border-collapse select-none font-sans">
                      <thead className="bg-slate-100 font-mono text-[8.5px] uppercase font-bold border-b border-[#A6C4DE] text-slate-700">
                        <tr>
                          <th className="p-1.5 text-center border-r border-slate-200 w-6">#</th>
                          <th className="p-1.5 border-r border-slate-200 w-32">COMPANY CATEGORY</th>
                          <th className="p-1.5 border-r border-slate-200 w-20">USER ID</th>
                          <th className="p-1.5 border-r border-slate-200 w-32">MEMBER &amp; POSITION</th>
                          <th className="p-1.5 border-r border-slate-200 w-36">EMAIL &amp; CONTACT</th>
                          <th className="p-1.5 border-r border-slate-200 bg-amber-500/[0.04] text-slate-900 w-32">AUTH PASSWORD</th>
                          <th className="p-1.5 border-r border-slate-200 text-center w-16">STATUS</th>
                          <th className="p-1.5 border-r border-slate-200 w-28">ROLE</th>
                          {currentUser.role === 'Admin' && (
                            <th className="p-1.5 text-center w-16">ACTIONS</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-slate-500 font-mono text-xs uppercase">
                              No matching registered users found for the selected category.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((item, idx) => {
                            const isCurrent = item.id === currentUser.id;
                            const isEditing = editingUserId === item.id;
                            const isConfirming = deleteConfirmId === item.id;
                            const category = item.companyCategory || getCompanyCategoryByCompanyId(item.companyId);
                            const isPassVisible = visiblePasswords[item.id] || false;

                            if (isEditing) {
                              return (
                                <tr key={item.id} className="bg-amber-50">
                                  <td className="p-1 text-center font-mono border-r border-slate-200 font-bold text-slate-500 text-[9px]">
                                    {idx + 1}
                                  </td>
                                  <td className="p-1 border-r border-slate-200 w-32">
                                    <div className="w-full p-1 bg-white border border-slate-300 font-mono font-bold text-[9px] uppercase text-slate-800 flex items-center gap-1">
                                      <Building2 className="w-3 h-3 text-[#FF6B00]" />
                                      <span>{currentUserCategory}</span>
                                    </div>
                                  </td>
                                  <td className="p-1 border-r border-slate-200 w-20">
                                    <input
                                      type="text"
                                      value={editUniqueId}
                                      onChange={(e) => setEditUniqueId(e.target.value.toUpperCase())}
                                      className="w-full p-0.5 border border-slate-300 font-mono font-bold text-[9px] uppercase bg-white text-slate-900"
                                    />
                                  </td>
                                  <td className="p-1 border-r border-slate-200 space-y-1 w-32">
                                    <input
                                      type="text"
                                      value={editFirstName}
                                      onChange={(e) => setEditFirstName(e.target.value)}
                                      placeholder="FIRST NAME"
                                      className="w-full p-0.5 border border-slate-300 text-[9px] font-bold uppercase bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={editSecondName}
                                      onChange={(e) => setEditSecondName(e.target.value)}
                                      placeholder="SECOND NAME"
                                      className="w-full p-0.5 border border-slate-300 text-[9px] font-bold uppercase bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={editPosition}
                                      onChange={(e) => setEditPosition(e.target.value)}
                                      placeholder="POSITION"
                                      className="w-full p-0.5 border border-slate-300 text-[8.5px] font-mono uppercase bg-white"
                                    />
                                  </td>
                                  <td className="p-1 border-r border-slate-200 space-y-1 w-36">
                                    <input
                                      type="email"
                                      value={editEmail}
                                      onChange={(e) => setEditEmail(e.target.value)}
                                      className="w-full p-0.5 border border-slate-300 text-[9px] font-mono bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={editMobile}
                                      onChange={(e) => setEditMobile(e.target.value)}
                                      placeholder="MOBILE"
                                      className="w-full p-0.5 border border-slate-300 text-[8.5px] font-mono bg-white"
                                    />
                                  </td>
                                  <td className="p-1 border-r border-slate-200 w-32 bg-amber-50">
                                    <input
                                      type="text"
                                      value={editPassword}
                                      onChange={(e) => setEditPassword(e.target.value)}
                                      placeholder="PASSWORD"
                                      className="w-full p-0.5 border border-slate-300 text-[9px] font-mono font-bold bg-white text-slate-900"
                                    />
                                  </td>
                                  <td className="p-1 border-r border-slate-200 text-center font-mono w-16">
                                    <label className="inline-flex items-center gap-0.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={editIsApproved}
                                        onChange={(e) => setEditIsApproved(e.target.checked)}
                                        className="w-3 h-3 accent-emerald-600"
                                      />
                                      <span className="text-[8px] font-bold uppercase">APPROVED</span>
                                    </label>
                                  </td>
                                  <td className="p-1 border-r border-slate-200 space-y-1 w-28">
                                    <select
                                      value={editRole}
                                      onChange={(e) => setEditRole(e.target.value as any)}
                                      className="w-full p-0.5 border border-slate-300 text-[9px] font-mono font-bold bg-white text-slate-800"
                                    >
                                      <option value="Viewer">Viewer</option>
                                      <option value="Editor">Editor</option>
                                      <option value="Admin">Admin</option>
                                    </select>
                                  </td>
                                  <td className="p-1 text-center w-16">
                                    <div className="flex gap-1 justify-center font-mono">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEdit(item.id)}
                                        className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer border border-emerald-700"
                                        title="Save Changes"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="p-1 bg-slate-500 hover:bg-slate-600 text-white font-bold transition-colors cursor-pointer border border-slate-600"
                                        title="Cancel Edit"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            const categoryBadge = category === 'MARINE FASTENERS'
                              ? { bg: 'bg-blue-100 text-blue-900 border-blue-300', tag: 'MARINE FASTENERS' }
                              : category === 'BOLT MASTER'
                              ? { bg: 'bg-amber-100 text-amber-900 border-amber-300', tag: 'BOLT MASTER' }
                              : { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', tag: 'UNITED METAL' };

                            return (
                              <tr key={item.id} className={`${isCurrent ? 'bg-amber-500/[0.04]' : 'hover:bg-slate-50'} transition-colors`}>
                                <td className="p-1 text-center font-mono border-r border-slate-200 font-bold text-slate-400 text-[9px] w-6">
                                  {idx + 1}
                                </td>
                                <td className="p-1 border-r border-slate-200 w-32">
                                  <span className={`inline-block px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${categoryBadge.bg}`}>
                                    {categoryBadge.tag}
                                  </span>
                                </td>
                                <td className="p-1 border-r border-slate-200 font-mono font-bold text-[#FF6B00] text-[10px] w-20">
                                  {item.uniqueId}
                                </td>
                                <td className="p-1 border-r border-slate-200 w-32 max-w-[128px]">
                                  <div className="font-bold text-slate-900 uppercase text-[10px] truncate flex items-center gap-1">
                                    <span className="truncate">{item.firstName} {item.secondName}</span>
                                    {isCurrent && (
                                      <span className="shrink-0 px-0.5 py-0.25 bg-indigo-100 text-indigo-800 text-[7px] font-mono uppercase font-bold">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[8.5px] font-mono text-slate-500 uppercase font-semibold truncate">
                                    {item.position || 'OPERATIVE'}
                                  </div>
                                </td>
                                <td className="p-1 border-r border-slate-200 w-36 max-w-[144px] font-mono text-[9.5px]">
                                  <div className="truncate font-semibold text-slate-800" title={item.email}>{item.email}</div>
                                  {(item.mobile || item.phone) && (
                                    <div className="text-[8px] text-slate-500 truncate">
                                      {item.mobile || item.phone}
                                    </div>
                                  )}
                                </td>
                                
                                {/* AUTH PASSWORD COLUMN FOR ADMIN VIEW */}
                                <td className="p-1 border-r border-slate-200 bg-amber-500/[0.02] w-32 font-mono text-xs">
                                  <div className="flex items-center justify-between gap-1 bg-slate-50 px-1.5 py-0.5 border border-slate-200 rounded">
                                    <span className="font-mono font-bold text-slate-800 text-[10px] tracking-wider truncate">
                                      {isPassVisible ? (item.password || '—') : '••••••••'}
                                    </span>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility(item.id)}
                                        className="p-0.5 text-slate-500 hover:text-slate-900 transition-colors"
                                        title={isPassVisible ? "Hide Password" : "Show Password"}
                                      >
                                        {isPassVisible ? <EyeOff className="w-3 h-3 text-amber-700" /> : <Eye className="w-3 h-3" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(item.password || '', item.id)}
                                        className="p-0.5 text-slate-500 hover:text-blue-700 transition-colors"
                                        title="Copy Password"
                                      >
                                        {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-1 border-r border-slate-200 text-center font-mono w-16">
                                  {item.isApproved === false ? (
                                    <div className="space-y-0.5">
                                      <span className="px-1 py-0.5 bg-rose-100 text-rose-800 text-[7px] font-bold uppercase inline-block">
                                        PENDING
                                      </span>
                                      {currentUser.role === 'Admin' && (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleApproval(item.id, true)}
                                          className="block mx-auto text-[7px] text-emerald-700 font-bold hover:underline uppercase"
                                        >
                                          Approve
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="px-1 py-0.5 bg-emerald-100 text-emerald-800 text-[7px] font-bold uppercase inline-block">
                                      ✔ APPROVED
                                    </span>
                                  )}
                                </td>

                                {/* Role */}
                                <td className="p-1 border-r border-slate-200 w-28 font-mono">
                                  <div className="flex items-center gap-1">
                                    <span className={`px-1 py-0.5 text-[7.5px] font-bold uppercase text-white shrink-0 ${
                                      item.role === 'Admin' ? 'bg-[#FF6B00]' : item.role === 'Editor' ? 'bg-indigo-700' : 'bg-slate-600'
                                    }`}>
                                      {item.role}
                                    </span>

                                    {currentUser.role === 'Admin' && (
                                      <select
                                        value={item.role}
                                        onChange={(e) => handleQuickRoleChange(item.id, e.target.value as any)}
                                        className="p-0.5 text-[8px] font-mono border border-slate-300 font-bold bg-white text-slate-800 cursor-pointer"
                                      >
                                        <option value="Viewer">Viewer</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Admin">Admin</option>
                                      </select>
                                    )}
                                  </div>
                                </td>

                                {/* Admin Actions */}
                                {currentUser.role === 'Admin' && (
                                  <td className="p-1.5 text-center font-mono w-16">
                                    {isConfirming ? (
                                      <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[7px] font-bold text-rose-600 uppercase">Delete?</span>
                                        <div className="flex gap-1 justify-center">
                                          <button
                                            type="button"
                                            onClick={() => executeDeleteUser(item.id)}
                                            className="p-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[8px] uppercase cursor-pointer border border-rose-700"
                                            title="Confirm Delete"
                                          >
                                            <Check className="w-2.5 h-2.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={cancelDeleteUser}
                                            className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-[8px] uppercase cursor-pointer border border-slate-400"
                                            title="Cancel"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleStartEdit(item)}
                                          className="p-1 text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 transition-colors cursor-pointer"
                                          title="Edit Personnel Profile"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                        {!isCurrent && (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteUser(item.id)}
                                            className="p-1 text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-300 hover:border-rose-400 transition-colors cursor-pointer"
                                            title="Delete User Record"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM DIAGNOSTICS & STORAGE METRICS */}
          {settingsTab === 'diagnostics' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-[#A6C4DE] p-5 space-y-4 shadow-3xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#A6C4DE]">
                  <HardDrive className="w-4 h-4 text-[#FF6B00]" />
                  <h4 className="text-xs font-bold text-[#002D62] uppercase tracking-wider">
                    System Database Health &amp; Local Storage Metrics
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 font-mono text-xs">
                  {/* Metric Box 1 */}
                  <div className="space-y-3 bg-slate-50 p-4 border border-slate-200">
                    <span className="font-bold text-slate-900 uppercase block border-b border-slate-200 pb-1">
                      {currentUserCategory} Personnel Records Cache:
                    </span>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>Total Active Profiles ({currentUserCategory}):</span>
                      <strong className="text-slate-900">{scopedUsers.length} Records</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>Admins with Full Control:</span>
                      <strong className="text-[#FF6B00]">{scopedUsers.filter(u=>u.role==='Admin').length}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                      <span>Registry View Permit Granted:</span>
                      <strong className="text-emerald-700">{scopedUsers.filter(u=>u.canViewSystemRegistry || u.role==='Admin').length}</strong>
                    </div>
                  </div>

                  {/* Metric Box 2 */}
                  <div className="space-y-3 bg-slate-50 p-4 border border-slate-200">
                    <span className="font-bold text-slate-900 uppercase block border-b border-slate-200 pb-1">
                      LocalStorage Capacity Status:
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                        <span>ESTIMATED STORAGE USE:</span>
                        <span className="text-[#002D62]">HEALTHY (&lt; 250 KB / 5 MB)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 overflow-hidden">
                        <div className="h-full bg-[#FF6B00] w-[12%]"></div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const jsonStr = JSON.stringify(scopedUsers, null, 2);
                          const blob = new Blob([jsonStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${currentUserCategory.replace(/\s+/g, '_')}_Personnel_Roster_${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                        }}
                        className="w-full py-2 bg-[#002D62] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> EXPORT {currentUserCategory} ROSTER (JSON)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reset Seeds Button for Admins */}
                {currentUser.role === 'Admin' && (
                  <div className="pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("ARE YOU SURE YOU WANT TO RESTORE ALL FACTORY SYSTEM USER SEEDS?\nThis will clear custom added users and reset default passwords to 'admin'.")) {
                          setUsers(DEFAULT_USERS);
                          localStorage.setItem('mf_registered_users', JSON.stringify(DEFAULT_USERS));
                          window.location.reload();
                        }
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-350 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                    >
                      Restore Factory System Personnel Seeds
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MY ACCOUNT & SECURITY */}
          {settingsTab === 'my_account' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-[#A6C4DE] p-6 space-y-6 shadow-3xs max-w-3xl">
                <div className="flex items-center gap-2 pb-2 border-b border-[#A6C4DE]">
                  <User className="w-5 h-5 text-[#FF6B00]" />
                  <h4 className="text-xs font-bold text-[#002D62] uppercase tracking-wider">
                    My Account Security Credentials &amp; Profile Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Unique Member ID:</span>
                    <strong className="text-sm font-bold text-[#FF6B00]">{currentUser.uniqueId}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Current Clearance Role:</span>
                    <strong className="text-sm font-bold text-indigo-700 uppercase">{currentUser.role}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Full Name:</span>
                    <strong className="text-xs font-bold text-slate-900 uppercase">{currentUser.firstName} {currentUser.secondName}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Email Address:</span>
                    <strong className="text-xs font-bold text-slate-800">{currentUser.email}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit / Add Company Modal */}
      {isEditCompanyModalOpen && (
        <EditCompanyModal
          isOpen={isEditCompanyModalOpen}
          initialCompanyId={editCompanyId}
          currentUser={currentUser}
          onClose={() => setIsEditCompanyModalOpen(false)}
          onSaved={(saved) => {
            const updated = getCompaniesList();
            setCompaniesList(updated);
            setActiveCompany(getActiveCompany());
            setCompanyPermissionsToast(`Successfully saved details for ${saved.name}`);
            setTimeout(() => setCompanyPermissionsToast(''), 3500);
          }}
        />
      )}
    </div>
  );
}
