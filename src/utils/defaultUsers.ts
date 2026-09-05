import { AppUser } from '../types';

export const DEFAULT_USERS: AppUser[] = [
  // ==========================================
  // CATEGORY 1: MARINE FASTENERS (MFI)
  // ==========================================
  {
    id: 'user-fhm-02',
    uniqueId: 'MF-FHM02',
    firstName: 'FAHIM',
    secondName: 'MAHMUD',
    position: 'INVENTORY & OPERATIONS DIRECTOR',
    phone: '+971 6 525 0526',
    mobile: '+971 50 123 4567',
    email: 'sales@marinefasteners.co',
    role: 'Admin',
    password: 'FHM@2018',
    companyId: 'comp-mfi',
    companyCategory: 'MARINE FASTENERS',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-mfi']
  },
  {
    id: 'user-faisal',
    uniqueId: 'MF-FSL01',
    firstName: 'FAISAL',
    secondName: 'MAHMUD',
    position: 'GENERAL MANAGER',
    phone: '+971 6 525 0526',
    mobile: '+971 52 362 7189',
    email: 'faisal@marinefasteners.co',
    role: 'Admin',
    password: 'admin',
    companyId: 'comp-mfi',
    companyCategory: 'MARINE FASTENERS',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-mfi']
  },
  {
    id: 'user-admin',
    uniqueId: 'MF-001',
    firstName: 'FAHIM',
    secondName: 'MAHMUD',
    position: 'INVENTORY & OPERATIONS DIRECTOR',
    phone: '+971 6 525 0526',
    mobile: '+971 50 123 4567',
    email: 'admin@marinefasteners.co',
    role: 'Admin',
    password: 'admin',
    companyId: 'comp-mfi',
    companyCategory: 'MARINE FASTENERS',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-mfi']
  },
  {
    id: 'user-store',
    uniqueId: 'MF-STR01',
    firstName: 'STORE',
    secondName: 'MANAGER',
    position: 'CENTRAL STORE CONTROLLER',
    phone: '+971 6 525 0526',
    mobile: '',
    email: 'store.marinefasteners2018@gmail.com',
    role: 'Admin',
    password: 'admin',
    companyId: 'comp-mfi',
    companyCategory: 'MARINE FASTENERS',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-mfi']
  },
  {
    id: 'user-asif',
    uniqueId: 'MFASIF-2026',
    firstName: 'MR. ASIF',
    secondName: 'AWAN',
    position: 'SALES MANAGER (AJMAN)',
    phone: '+971 6 525 0526',
    mobile: '+971 58 196 6792',
    email: 'mfi@marinefasteners.co',
    role: 'Viewer',
    password: 'Asif6792',
    companyId: 'comp-mfi',
    companyCategory: 'MARINE FASTENERS',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-mfi']
  },
  {
    id: 'user-staff',
    uniqueId: 'MF-002',
    firstName: 'STAFF',
    secondName: 'MEMBER',
    position: 'WAREHOUSE OPERATIVE',
    phone: '+971 6 525 0526',
    mobile: '+971 55 987 6543',
    email: 'staff@marinefasteners.co',
    role: 'Viewer',
    password: 'staff',
    companyId: 'comp-mfi',
    companyCategory: 'MARINE FASTENERS',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-mfi']
  },

  // ==========================================
  // CATEGORY 2: BOLT MASTER (BMM)
  // ==========================================
  {
    id: 'user-bmm-s02',
    uniqueId: 'BMM-S02',
    firstName: 'FAHIM',
    secondName: 'MAHMUD',
    position: 'OPERATIONS & COMMERCIAL LEAD',
    phone: '+971 4 338 1200',
    mobile: '+971 50 123 4567',
    email: 'bm@gccboltmaster.co',
    role: 'Admin',
    password: 'FHM@2018',
    companyId: 'comp-bmm',
    companyCategory: 'BOLT MASTER',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-bmm']
  },
  {
    id: 'user-bmm-tariq',
    uniqueId: 'BMM-TM01',
    firstName: 'TARIQ',
    secondName: 'MALIK',
    position: 'MANAGING DIRECTOR',
    phone: '+971 4 338 1200',
    mobile: '+971 50 882 1944',
    email: 'tariq@boltmasterme.com',
    role: 'Admin',
    password: 'bmmAdmin2026',
    companyId: 'comp-bmm',
    companyCategory: 'BOLT MASTER',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-bmm']
  },
  {
    id: 'user-bmm-rashid',
    uniqueId: 'BMM-RK02',
    firstName: 'RASHID',
    secondName: 'KHAN',
    position: 'OPERATIONS & INVENTORY LEAD',
    phone: '+971 4 338 1200',
    mobile: '+971 52 449 8123',
    email: 'operations@boltmasterme.com',
    role: 'Editor',
    password: 'bmmOps88',
    companyId: 'comp-bmm',
    companyCategory: 'BOLT MASTER',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-bmm']
  },
  {
    id: 'user-bmm-sales',
    uniqueId: 'BMM-SD03',
    firstName: 'SALES',
    secondName: 'DESK',
    position: 'COMMERCIAL FASTENERS SPECIALIST',
    phone: '+971 4 338 1200',
    mobile: '+971 56 312 9044',
    email: 'sales@boltmasterme.com',
    role: 'Viewer',
    password: 'bmmSales77',
    companyId: 'comp-bmm',
    companyCategory: 'BOLT MASTER',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-bmm']
  },
  {
    id: 'user-bmm-store',
    uniqueId: 'BMM-WH04',
    firstName: 'KHALID',
    secondName: 'STORE',
    position: 'WAREHOUSE & DISPATCH OFFICER',
    phone: '+971 4 338 1200',
    mobile: '+971 55 671 2309',
    email: 'store@boltmasterme.com',
    role: 'Editor',
    password: 'bmmStore55',
    companyId: 'comp-bmm',
    companyCategory: 'BOLT MASTER',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-bmm']
  },

  // ==========================================
  // CATEGORY 3: UNITED METAL (UMI)
  // ==========================================
  {
    id: 'user-umi-s02',
    uniqueId: 'UMI-S02',
    firstName: 'FAHIM',
    secondName: 'MAHMUD',
    position: 'DIRECTOR OF OPERATIONS',
    phone: '+971 6 748 3321',
    mobile: '+971 50 123 4567',
    email: 'sales@unitedmetal.ae',
    role: 'Admin',
    password: 'FHM@2018',
    companyId: 'comp-umi',
    companyCategory: 'UNITED METAL',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-umi']
  },
  {
    id: 'user-umi-zubair',
    uniqueId: 'UMI-ZA01',
    firstName: 'ENG. ZUBAIR',
    secondName: 'AHMED',
    position: 'PLANT DIRECTOR',
    phone: '+971 6 748 3321',
    mobile: '+971 50 993 4182',
    email: 'zubair@unitedmetal.ae',
    role: 'Admin',
    password: 'umiAdmin2026',
    companyId: 'comp-umi',
    companyCategory: 'UNITED METAL',
    isApproved: true,
    canViewSystemRegistry: true,
    allowedCompanies: ['comp-umi']
  },
  {
    id: 'user-umi-farhan',
    uniqueId: 'UMI-FS02',
    firstName: 'FARHAN',
    secondName: 'SIDDIQUI',
    position: 'FABRICATION & HEAVY PRESS MANAGER',
    phone: '+971 6 748 3321',
    mobile: '+971 52 761 4098',
    email: 'production@unitedmetal.ae',
    role: 'Editor',
    password: 'umiProd99',
    companyId: 'comp-umi',
    companyCategory: 'UNITED METAL',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-umi']
  },
  {
    id: 'user-umi-bilal',
    uniqueId: 'UMI-BQ03',
    firstName: 'BILAL',
    secondName: 'QA',
    position: 'CHIEF METALLURGY & QC INSPECTOR',
    phone: '+971 6 748 3321',
    mobile: '+971 54 812 3390',
    email: 'qc@unitedmetal.ae',
    role: 'Editor',
    password: 'umiQc44',
    companyId: 'comp-umi',
    companyCategory: 'UNITED METAL',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-umi']
  },
  {
    id: 'user-umi-sales',
    uniqueId: 'UMI-ST04',
    firstName: 'INDUSTRIAL',
    secondName: 'SALES',
    position: 'PROJECTS & STRUCTURAL SALES',
    phone: '+971 6 748 3321',
    mobile: '+971 58 654 9912',
    email: 'sales@unitedmetal.ae',
    role: 'Viewer',
    password: 'umiSales33',
    companyId: 'comp-umi',
    companyCategory: 'UNITED METAL',
    isApproved: true,
    canViewSystemRegistry: false,
    allowedCompanies: ['comp-umi']
  }
];

export const SYSTEM_USER_CATEGORIES = [
  'MARINE FASTENERS',
  'BOLT MASTER',
  'UNITED METAL'
] as const;

export type SystemUserCategory = typeof SYSTEM_USER_CATEGORIES[number];

export function getCompanyCategoryByCompanyId(companyId?: string): SystemUserCategory {
  if (!companyId) return 'MARINE FASTENERS';
  const c = companyId.toLowerCase();
  if (c.includes('bmm') || c.includes('bolt')) return 'BOLT MASTER';
  if (c.includes('umi') || c.includes('united')) return 'UNITED METAL';
  return 'MARINE FASTENERS';
}

export function getRegisteredUsers(): AppUser[] {
  try {
    const saved = localStorage.getItem('mf_registered_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge any missing default users
        const list = [...parsed];
        DEFAULT_USERS.forEach(def => {
          const idx = list.findIndex(u => 
            u.id === def.id || 
            (u.email && u.email.toLowerCase() === def.email.toLowerCase()) || 
            (u.uniqueId && u.uniqueId.toUpperCase() === def.uniqueId.toUpperCase())
          );
          if (idx === -1) {
            list.push(def);
          } else {
            // Keep user customized details, but ensure default admin credentials and approvals are up-to-date
            list[idx] = {
              ...def,
              ...list[idx],
              uniqueId: def.uniqueId || list[idx].uniqueId,
              email: def.email || list[idx].email,
              password: def.password || list[idx].password,
              isApproved: list[idx].isApproved !== undefined ? list[idx].isApproved : (def.isApproved ?? true),
              companyId: list[idx].companyId || def.companyId,
              companyCategory: list[idx].companyCategory || def.companyCategory,
              allowedCompanies: def.allowedCompanies || list[idx].allowedCompanies
            };
          }
        });
        localStorage.setItem('mf_registered_users', JSON.stringify(list));
        return list;
      }
    }
  } catch (e) {
    console.error('Failed to load registered users', e);
  }
  localStorage.setItem('mf_registered_users', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export function saveRegisteredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem('mf_registered_users', JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('registered_users_updated', { detail: users }));
  } catch (e) {
    console.error('Failed to save registered users', e);
  }
}
