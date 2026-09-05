import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Award, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  Mail, 
  Layers, 
  Sliders, 
  SlidersHorizontal,
  Save, 
  BookOpen, 
  User, 
  Copy, 
  Plus, 
  UserPlus,
  ChevronRight, 
  CalendarDays, 
  Download,
  Check,
  AlertTriangle,
  Building,
  Code,
  Edit3,
  CreditCard,
  Banknote,
  X,
  Pencil,
  Trash2,
  Edit,
  ShieldCheck,
  AlertCircle,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile } from '../utils/companyProfile';

interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  joiningDate: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  bankName: string;
  bankAccountNo: string;
  email: string;
  passportNo: string;
  passportExpiry: string;
  visaExpiry: string;
  contractExpiry: string;
  contractType: 'LIMITED' | 'UNLIMITED';
  nationality: string;
  phone: string;
  
  // Inline attendance variables for real-time recalculations
  daysPresent: number;
  daysAbsent: number;
  leavesApproved: number;
  overtimeHours: number;

  // Direct custom overrides for absent deductions and overtime payouts
  customOvertimePayout?: number;
  isManualOvertime?: boolean;
  customAbsentDeduction?: number;
  isManualAbsentDeduction?: boolean;
  customDeductionRemarks?: string;

  // Custom Base Hourly Rate & Daily Wage Basic inputs
  customHourlyRate?: number;
  isCustomHourlyRate?: boolean;
  overtimeMultiplier?: number;
  customDailyWage?: number;
  isCustomDailyWage?: boolean;
}

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'MFI-001',
    name: 'AHMAD ALI AL-BLOOSHI',
    designation: 'CHIEF METALLURGY FABRICATOR',
    department: 'PRODUCTION & MACHINING',
    joiningDate: '2022-04-12',
    basicSalary: 8500,
    housingAllowance: 2500,
    transportAllowance: 1200,
    otherAllowances: 800,
    bankName: 'RAKBANK',
    bankAccountNo: 'AE620240000123456789012',
    email: 'ahmad.blooshi@marinefasteners.ae',
    passportNo: 'P9845102',
    passportExpiry: '2027-10-10',
    visaExpiry: '2028-04-12',
    contractExpiry: '2027-04-12',
    contractType: 'LIMITED',
    nationality: 'EMIRATI',
    phone: '+971 50 123 4567',
    daysPresent: 26,
    daysAbsent: 0,
    leavesApproved: 4,
    overtimeHours: 12
  },
  {
    id: 'MFI-002',
    name: 'SOCIAS PRADEEP KUMAR',
    designation: 'SENIOR QUALITY INSPECTOR',
    department: 'QUALITY ASSURANCE',
    joiningDate: '2023-01-15',
    basicSalary: 6200,
    housingAllowance: 1800,
    transportAllowance: 1000,
    otherAllowances: 500,
    bankName: 'EMIRATES NBD',
    bankAccountNo: 'AE480030000987654321098',
    email: '', // missing email for Report #5
    passportNo: 'L5421098',
    passportExpiry: '2026-08-15', // Expiring soon relative to 2026-07-21
    visaExpiry: '2027-01-15',
    contractExpiry: '2026-09-01', // Expiring soon!
    contractType: 'LIMITED',
    nationality: 'INDIAN',
    phone: '+971 52 987 6543',
    daysPresent: 25,
    daysAbsent: 1,
    leavesApproved: 4,
    overtimeHours: 8
  },
  {
    id: 'MFI-003',
    name: 'MOHAMMED ZAYED AL-KAABI',
    designation: 'SENIOR LOGISTICS DRIVER',
    department: 'SUPPLY CHAIN & LOGISTICS',
    joiningDate: '2021-11-01',
    basicSalary: 4500,
    housingAllowance: 1500,
    transportAllowance: 1500,
    otherAllowances: 400,
    bankName: 'ADCB',
    bankAccountNo: 'AE550210000456123789456',
    email: 'zayed.kaabi@marinefasteners.ae',
    passportNo: 'P1235489',
    passportExpiry: '2029-11-01',
    visaExpiry: '2029-11-01',
    contractExpiry: '2028-11-01',
    contractType: 'UNLIMITED',
    nationality: 'EMIRATI',
    phone: '+971 54 456 7891',
    daysPresent: 28,
    daysAbsent: 0,
    leavesApproved: 2,
    overtimeHours: 24
  },
  {
    id: 'MFI-004',
    name: 'SURESH GOPALAN CHETTIAR',
    designation: 'LEAD ANCHOR BOLT ENGINEER',
    department: 'ENGINEERING DESIGN',
    joiningDate: '2022-08-20',
    basicSalary: 9500,
    housingAllowance: 3000,
    transportAllowance: 1500,
    otherAllowances: 1000,
    bankName: 'MASHREQ BANK',
    bankAccountNo: 'AE910120000159487263514',
    email: '', // missing email
    passportNo: 'M8712345',
    passportExpiry: '2026-09-30', // Expiring soon!
    visaExpiry: '2027-08-20',
    contractExpiry: '2026-11-15', // Expiring soon!
    contractType: 'LIMITED',
    nationality: 'INDIAN',
    phone: '+971 56 321 0987',
    daysPresent: 24,
    daysAbsent: 2,
    leavesApproved: 4,
    overtimeHours: 5
  },
  {
    id: 'MFI-005',
    name: 'IMRAN KHAN YOUSUFZAI',
    designation: 'HEAVY CNC OPERATOR',
    department: 'PRODUCTION & MACHINING',
    joiningDate: '2023-05-10',
    basicSalary: 5200,
    housingAllowance: 1500,
    transportAllowance: 1000,
    otherAllowances: 300,
    bankName: 'DIB (DUBAI ISLAMIC BANK)',
    bankAccountNo: 'AE830240000357951486201',
    email: 'imran.khan@marinefasteners.ae',
    passportNo: 'N5432167',
    passportExpiry: '2028-05-10',
    visaExpiry: '2026-08-28', // Expiring soon relative to 2026-07-21!
    contractExpiry: '2027-05-10',
    contractType: 'UNLIMITED',
    nationality: 'PAKISTANI',
    phone: '+971 55 753 1598',
    daysPresent: 27,
    daysAbsent: 0,
    leavesApproved: 3,
    overtimeHours: 18
  },
  {
    id: 'MFI-006',
    name: 'CARLO SANTOS REYES',
    designation: 'STRUCTURAL DRAUGHTSMAN',
    department: 'ENGINEERING DESIGN',
    joiningDate: '2024-02-01',
    basicSalary: 7000,
    housingAllowance: 2000,
    transportAllowance: 1200,
    otherAllowances: 500,
    bankName: 'HSBC',
    bankAccountNo: 'AE120440000951357482619',
    email: '', // missing email
    passportNo: 'P7894561',
    passportExpiry: '2026-08-05', // Expiring soon!
    visaExpiry: '2026-09-10', // Expiring soon!
    contractExpiry: '2026-08-01', // Expiring soon!
    contractType: 'LIMITED',
    nationality: 'PHILIPPINES',
    phone: '+971 58 147 2583',
    daysPresent: 26,
    daysAbsent: 0,
    leavesApproved: 4,
    overtimeHours: 10
  }
];

// Helper components for the Focus ERP layout
function ReportSectionHeader({ 
  title, 
  countLabel, 
  metrics 
}: { 
  title: string; 
  countLabel?: string; 
  metrics?: { label: string; value: string; isOrange?: boolean; isGreen?: boolean }[] 
}) {
  return (
    <div className="bg-[#f0f4f8] border-t border-b border-[#cbd5e1] px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-3xs">
      <div className="flex items-center gap-2">
        <div className="bg-[#f37021]/10 p-1 rounded-sm border border-[#f37021]/30">
          <FileText className="w-4 h-4 text-[#f37021]" />
        </div>
        <span className="text-[#002D62] text-xs font-extrabold tracking-wider uppercase font-sans">
          {title} {countLabel ? `— ${countLabel.toUpperCase()}` : ''}
        </span>
      </div>
      {metrics && metrics.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-sans font-bold text-slate-600">
          {metrics.map((m, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 hidden sm:inline">|</span>}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">{m.label.toUpperCase()}:</span>
                <span className={`font-mono font-bold ${m.isOrange ? 'text-[#f37021]' : m.isGreen ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {m.value}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function GrandConsolidatedTotals({ 
  metrics 
}: { 
  metrics: { label: string; value: string; isOrange?: boolean; isGreen?: boolean }[] 
}) {
  return (
    <div className="border border-[#cbd5e1] border-t-2 border-t-[#002D62] bg-[#f8fafc] p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-3xs mt-4">
      <span className="text-[#002D62] text-xs font-black tracking-widest uppercase font-sans">
        GRAND CONSOLIDATED TOTALS:
      </span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-sans font-bold text-slate-700">
        {metrics.map((m, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-300 hidden sm:inline">|</span>}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">{m.label}:</span>
              <span className={`font-mono font-black ${m.isOrange ? 'text-[#f37021]' : m.isGreen ? 'text-emerald-700' : 'text-slate-950'}`}>
                {m.value}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function PayrollReportsComponent() {
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(getActiveCompany);

  useEffect(() => {
    const handleCompanyChange = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('active_company_changed', handleCompanyChange);
    window.addEventListener('company_profile_updated', handleCompanyChange);
    return () => {
      window.removeEventListener('active_company_changed', handleCompanyChange);
      window.removeEventListener('company_profile_updated', handleCompanyChange);
    };
  }, []);

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('MFI_EMPLOYEES_LIST_V2');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  // Persistent Departments List
  const [departmentsList, setDepartmentsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('MFI_DEPARTMENTS_LIST_V2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      'PRODUCTION & MACHINING',
      'QUALITY ASSURANCE',
      'SUPPLY CHAIN & LOGISTICS',
      'ENGINEERING DESIGN',
      'MAINTENANCE & WORKSHOP',
      'ADMINISTRATION & HR',
      'SALES & MARKETING'
    ];
  });

  const saveDepartments = (list: string[]) => {
    const clean = Array.from(new Set(list.map(d => d.trim().toUpperCase()))).filter(Boolean);
    setDepartmentsList(clean);
    localStorage.setItem('MFI_DEPARTMENTS_LIST_V2', JSON.stringify(clean));
  };

  // Dynamically compute departments from configured list + any present on employee records
  const departments = useMemo(() => {
    const set = new Set<string>();
    departmentsList.forEach(d => { if (d && d.trim()) set.add(d.trim().toUpperCase()); });
    employees.forEach(e => { if (e.department && e.department.trim()) set.add(e.department.trim().toUpperCase()); });
    return Array.from(set);
  }, [departmentsList, employees]);

  const [activeReport, setActiveReport] = useState<string>('pay_slip');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('MFI-001');
  const [activePayHead, setActivePayHead] = useState<string>('basicSalary');
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [expatTab, setExpatTab] = useState<'passport' | 'visa' | 'contract'>('passport');

  // Interactive Staff Profile Editor (Pay Slip)
  const [isEditingStaff, setIsEditingStaff] = useState<boolean>(false);
  const [inlineDept, setInlineDept] = useState<string>('');
  const [inlineBank, setInlineBank] = useState<string>('');
  const [inlineAccount, setInlineAccount] = useState<string>('');
  const [inlineIsNoIban, setInlineIsNoIban] = useState<boolean>(false);
  const [inlineNewDept, setInlineNewDept] = useState<string>('');
  const [inlineIsAddingDept, setInlineIsAddingDept] = useState<boolean>(false);

  // New Employee state variables
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDesignation, setNewEmpDesignation] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('PRODUCTION & MACHINING');
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [newEmpBasic, setNewEmpBasic] = useState(1500);
  const [newEmpHousing, setNewEmpHousing] = useState(0);
  const [newEmpTransport, setNewEmpTransport] = useState(0);
  const [newEmpOther, setNewEmpOther] = useState(0);
  const [newEmpBank, setNewEmpBank] = useState('RAKBANK');
  const [newEmpAccount, setNewEmpAccount] = useState('');
  const [isNoIban, setIsNoIban] = useState(false);
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPassport, setNewEmpPassport] = useState('');
  const [newEmpPassportExpiry, setNewEmpPassportExpiry] = useState('2028-12-15');
  const [newEmpVisaExpiry, setNewEmpVisaExpiry] = useState('2028-06-30');
  const [newEmpContractExpiry, setNewEmpContractExpiry] = useState('2028-06-30');
  const [newEmpContractType, setNewEmpContractType] = useState<'LIMITED' | 'UNLIMITED'>('LIMITED');
  const [newEmpNationality, setNewEmpNationality] = useState('BANGLADESH');

  // Full Employee Profile Edit Modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingEmpId, setEditingEmpId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editIsAddingDept, setEditIsAddingDept] = useState(false);
  const [editCustomDept, setEditCustomDept] = useState('');
  const [editBasic, setEditBasic] = useState(0);
  const [editHousing, setEditHousing] = useState(0);
  const [editTransport, setEditTransport] = useState(0);
  const [editOther, setEditOther] = useState(0);
  const [editBank, setEditBank] = useState('RAKBANK');
  const [editAccount, setEditAccount] = useState('');
  const [editIsNoIban, setEditIsNoIban] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNationality, setEditNationality] = useState('BANGLADESH');
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [editPassportNo, setEditPassportNo] = useState('');
  const [editPassportExpiry, setEditPassportExpiry] = useState('2028-12-15');
  const [editVisaExpiry, setEditVisaExpiry] = useState('2028-06-30');
  const [editContractExpiry, setEditContractExpiry] = useState('2028-06-30');
  const [editContractType, setEditContractType] = useState<'LIMITED' | 'UNLIMITED'>('LIMITED');
  const [editDaysPresent, setEditDaysPresent] = useState(26);
  const [editDaysAbsent, setEditDaysAbsent] = useState(0);
  const [editLeavesApproved, setEditLeavesApproved] = useState(4);
  const [editOvertimeHours, setEditOvertimeHours] = useState(0);

  // Direct Overtime & Absentee Deduction Manual Overrides & Custom Rate Basis
  const [editIsManualOvertime, setEditIsManualOvertime] = useState(false);
  const [editCustomOvertimePayout, setEditCustomOvertimePayout] = useState<number | ''>('');
  const [editIsManualAbsentDeduction, setEditIsManualAbsentDeduction] = useState(false);
  const [editCustomAbsentDeduction, setEditCustomAbsentDeduction] = useState<number | ''>('');
  const [editCustomDeductionRemarks, setEditCustomDeductionRemarks] = useState('');

  // Editable Base Hourly Rate & Daily Wage Basic
  const [editIsCustomHourlyRate, setEditIsCustomHourlyRate] = useState(false);
  const [editCustomHourlyRate, setEditCustomHourlyRate] = useState<number | ''>('');
  const [editOvertimeMultiplier, setEditOvertimeMultiplier] = useState<number>(1.25);
  const [editIsCustomDailyWage, setEditIsCustomDailyWage] = useState(false);
  const [editCustomDailyWage, setEditCustomDailyWage] = useState<number | ''>('');

  const openEditEmployeeModal = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setEditName(emp.name);
    setEditDesignation(emp.designation);
    setEditDept(emp.department);
    setEditIsAddingDept(false);
    setEditCustomDept('');
    setEditBasic(emp.basicSalary);
    setEditHousing(emp.housingAllowance);
    setEditTransport(emp.transportAllowance);
    setEditOther(emp.otherAllowances);
    setEditBank(emp.bankName || 'RAKBANK');
    setEditAccount(emp.bankAccountNo || '');
    setEditIsNoIban(
      !emp.bankAccountNo || 
      emp.bankAccountNo.includes('CASH') || 
      emp.bankAccountNo.includes('NO IBAN') ||
      (emp.bankName && emp.bankName.includes('CASH'))
    );
    setEditEmail(emp.email || '');
    setEditPhone(emp.phone || '');
    setEditNationality(emp.nationality || 'BANGLADESH');
    setEditJoiningDate(emp.joiningDate || new Date().toISOString().split('T')[0]);
    setEditPassportNo(emp.passportNo || '');
    setEditPassportExpiry(emp.passportExpiry || '2028-12-15');
    setEditVisaExpiry(emp.visaExpiry || '2028-06-30');
    setEditContractExpiry(emp.contractExpiry || '2028-06-30');
    setEditContractType(emp.contractType || 'LIMITED');
    setEditDaysPresent(emp.daysPresent ?? 26);
    setEditDaysAbsent(emp.daysAbsent ?? 0);
    setEditLeavesApproved(emp.leavesApproved ?? 4);
    setEditOvertimeHours(emp.overtimeHours ?? 0);

    // Calculate standard x1.25 OT and Absentee values for preview defaults
    const stdHourly = Math.round((emp.basicSalary / (26 * 8)) * 100) / 100;
    const stdDaily = Math.round((emp.basicSalary / 26) * 100) / 100;
    const effectiveHourly = (emp.isCustomHourlyRate && emp.customHourlyRate !== undefined && emp.customHourlyRate > 0) ? emp.customHourlyRate : stdHourly;
    const effectiveMultiplier = emp.overtimeMultiplier !== undefined && emp.overtimeMultiplier > 0 ? emp.overtimeMultiplier : 1.25;
    const effectiveDaily = (emp.isCustomDailyWage && emp.customDailyWage !== undefined && emp.customDailyWage > 0) ? emp.customDailyWage : stdDaily;

    const stdOt = Math.round(emp.overtimeHours * effectiveHourly * effectiveMultiplier * 100) / 100;
    const stdAbs = Math.round(emp.daysAbsent * effectiveDaily * 100) / 100;

    setEditIsCustomHourlyRate(!!emp.isCustomHourlyRate);
    setEditCustomHourlyRate(emp.customHourlyRate !== undefined && emp.customHourlyRate > 0 ? emp.customHourlyRate : stdHourly);
    setEditOvertimeMultiplier(effectiveMultiplier);

    setEditIsCustomDailyWage(!!emp.isCustomDailyWage);
    setEditCustomDailyWage(emp.customDailyWage !== undefined && emp.customDailyWage > 0 ? emp.customDailyWage : stdDaily);

    setEditIsManualOvertime(!!emp.isManualOvertime);
    setEditCustomOvertimePayout(emp.customOvertimePayout !== undefined ? emp.customOvertimePayout : stdOt);
    setEditIsManualAbsentDeduction(!!emp.isManualAbsentDeduction);
    setEditCustomAbsentDeduction(emp.customAbsentDeduction !== undefined ? emp.customAbsentDeduction : stdAbs);
    setEditCustomDeductionRemarks(emp.customDeductionRemarks || '');

    setShowEditModal(true);
  };

  const handleSaveEditedEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editDesignation.trim()) {
      alert('Please enter Full Legal Name and Designation.');
      return;
    }

    let finalDept = editDept;
    if (editIsAddingDept && editCustomDept.trim()) {
      finalDept = editCustomDept.trim().toUpperCase();
      if (!departmentsList.includes(finalDept)) {
        saveDepartments([...departmentsList, finalDept]);
      }
    }

    let finalAccount = editAccount.trim();
    if (editIsNoIban || editBank.includes('CASH') || editBank.includes('CHEQUE') || !finalAccount) {
      finalAccount = finalAccount || (editBank.includes('EXCHANGE') ? 'WPS C3 CARD (NO IBAN)' : 'CASH / NO IBAN');
    }

    const updatedList = employees.map(emp => {
      if (emp.id === editingEmpId) {
        return {
          ...emp,
          name: editName.toUpperCase().trim(),
          designation: editDesignation.toUpperCase().trim(),
          department: finalDept || emp.department,
          basicSalary: Math.max(0, Number(editBasic) || 0),
          housingAllowance: Math.max(0, Number(editHousing) || 0),
          transportAllowance: Math.max(0, Number(editTransport) || 0),
          otherAllowances: Math.max(0, Number(editOther) || 0),
          bankName: editBank || emp.bankName,
          bankAccountNo: finalAccount,
          email: editEmail.trim(),
          phone: editPhone.trim(),
          nationality: editNationality.toUpperCase().trim(),
          joiningDate: editJoiningDate,
          passportNo: editPassportNo.toUpperCase().trim(),
          passportExpiry: editPassportExpiry,
          visaExpiry: editVisaExpiry,
          contractExpiry: editContractExpiry,
          contractType: editContractType,
          daysPresent: Math.min(30, Math.max(0, Number(editDaysPresent))),
          daysAbsent: Math.min(30, Math.max(0, Number(editDaysAbsent))),
          leavesApproved: Math.min(30, Math.max(0, Number(editLeavesApproved))),
          overtimeHours: Math.max(0, Number(editOvertimeHours)),

          // Custom Rate Basis & Multiplier
          isCustomHourlyRate: editIsCustomHourlyRate,
          customHourlyRate: editIsCustomHourlyRate ? (Math.max(0, Number(editCustomHourlyRate)) || undefined) : undefined,
          overtimeMultiplier: Math.max(0.1, Number(editOvertimeMultiplier) || 1.25),
          isCustomDailyWage: editIsCustomDailyWage,
          customDailyWage: editIsCustomDailyWage ? (Math.max(0, Number(editCustomDailyWage)) || undefined) : undefined,

          // Total Lump Sum Overrides
          isManualOvertime: editIsManualOvertime,
          customOvertimePayout: editIsManualOvertime ? Math.max(0, Number(editCustomOvertimePayout) || 0) : undefined,
          isManualAbsentDeduction: editIsManualAbsentDeduction,
          customAbsentDeduction: editIsManualAbsentDeduction ? Math.max(0, Number(editCustomAbsentDeduction) || 0) : undefined,
          customDeductionRemarks: editCustomDeductionRemarks.trim(),
        };
      }
      return emp;
    });

    saveEmployees(updatedList);
    setShowEditModal(false);
  };

  const handleDeleteEmployee = (empId: string) => {
    const target = employees.find(e => e.id === empId);
    if (!target) return;
    if (window.confirm(`Are you sure you want to permanently delete employee #${target.id} (${target.name}) from the payroll database?`)) {
      const updated = employees.filter(e => e.id !== empId);
      saveEmployees(updated);
      if (selectedEmpId === empId) {
        setSelectedEmpId(updated[0]?.id || '');
      }
      setShowEditModal(false);
    }
  };

  const saveEmployees = (list: Employee[]) => {
    setEmployees(list);
    localStorage.setItem('MFI_EMPLOYEES_LIST_V2', JSON.stringify(list));
  };

  // Live real-time wages and payroll deductions calculation helper
  const getPayrollDetails = (e: Employee) => {
    const stdHourlyRate = e.basicSalary / (26 * 8);
    const hourlyRate = (e.isCustomHourlyRate && e.customHourlyRate !== undefined && !isNaN(e.customHourlyRate) && e.customHourlyRate > 0)
      ? Number(e.customHourlyRate)
      : stdHourlyRate;
    const multiplier = (e.overtimeMultiplier !== undefined && !isNaN(e.overtimeMultiplier) && e.overtimeMultiplier > 0)
      ? Number(e.overtimeMultiplier)
      : 1.25;

    const stdOtPay = e.overtimeHours * hourlyRate * multiplier;
    const otPay = e.isManualOvertime && e.customOvertimePayout !== undefined && !isNaN(e.customOvertimePayout)
      ? Math.max(0, Number(e.customOvertimePayout))
      : stdOtPay;

    const stdDailyWage = e.basicSalary / 26;
    const dailyWage = (e.isCustomDailyWage && e.customDailyWage !== undefined && !isNaN(e.customDailyWage) && e.customDailyWage > 0)
      ? Number(e.customDailyWage)
      : stdDailyWage;

    const stdAbsDeductions = e.daysAbsent * dailyWage;
    const absDeductions = e.isManualAbsentDeduction && e.customAbsentDeduction !== undefined && !isNaN(e.customAbsentDeduction)
      ? Math.max(0, Number(e.customAbsentDeduction))
      : stdAbsDeductions;

    const totalAllowances = e.housingAllowance + e.transportAllowance + e.otherAllowances;
    const grossEarnings = e.basicSalary + totalAllowances + otPay;
    const netPayout = Math.max(0, grossEarnings - absDeductions);
    return { 
      hourlyRate,
      stdHourlyRate,
      multiplier,
      dailyWage,
      stdDailyWage,
      stdOtPay, 
      otPay, 
      stdAbsDeductions, 
      absDeductions, 
      totalAllowances, 
      grossEarnings, 
      netPayout,
      isManualOvertime: !!e.isManualOvertime,
      isManualAbsentDeduction: !!e.isManualAbsentDeduction,
      isCustomHourlyRate: !!e.isCustomHourlyRate,
      isCustomDailyWage: !!e.isCustomDailyWage
    };
  };

  const updateAttendance = (empId: string, field: keyof Employee, value: number) => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, [field]: value };
      }
      return emp;
    });
    saveEmployees(updated);
  };

  const updateManualOvertime = (empId: string, isManual: boolean, amount?: number) => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        const details = getPayrollDetails(emp);
        const targetAmount = amount !== undefined ? amount : (emp.customOvertimePayout ?? details.stdOtPay);
        return {
          ...emp,
          isManualOvertime: isManual,
          customOvertimePayout: targetAmount
        };
      }
      return emp;
    });
    saveEmployees(updated);
  };

  const updateManualAbsentDeduction = (empId: string, isManual: boolean, amount?: number) => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        const details = getPayrollDetails(emp);
        const targetAmount = amount !== undefined ? amount : (emp.customAbsentDeduction ?? details.stdAbsDeductions);
        return {
          ...emp,
          isManualAbsentDeduction: isManual,
          customAbsentDeduction: targetAmount
        };
      }
      return emp;
    });
    saveEmployees(updated);
  };

  // English Number-to-Words translation for UAE Dirhams & Fils
  const numberToWordsAED = (amount: number): string => {
    const num = Math.floor(Math.abs(amount));
    const fils = Math.round((Math.abs(amount) - num) * 100);

    const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 
                   'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

    function convertHundreds(n: number): string {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' HUNDRED ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += units[n] + ' ';
      }
      return str.trim();
    }

    function convert(n: number): string {
      if (n === 0) return 'ZERO';
      let result = '';
      if (n >= 1000000000) {
        result += convertHundreds(Math.floor(n / 1000000000)) + ' BILLION ';
        n %= 1000000000;
      }
      if (n >= 1000000) {
        result += convertHundreds(Math.floor(n / 1000000)) + ' MILLION ';
        n %= 1000000;
      }
      if (n >= 1000) {
        result += convertHundreds(Math.floor(n / 1000)) + ' THOUSAND ';
        n %= 1000;
      }
      if (n > 0) {
        result += convertHundreds(n);
      }
      return result.trim();
    }

    let words = 'UAE DIRHAMS ' + convert(num);
    if (fils > 0) {
      words += ' AND ' + convert(fils) + ' FILS';
    }
    words += ' ONLY';
    return words;
  };

  const handleUpdateStaffProfile = (empId: string) => {
    const targetEmp = employees.find(e => e.id === empId);
    if (!targetEmp) return;

    let finalDept = inlineDept;
    if (inlineIsAddingDept && inlineNewDept.trim()) {
      finalDept = inlineNewDept.trim().toUpperCase();
      if (!departmentsList.includes(finalDept)) {
        saveDepartments([...departmentsList, finalDept]);
      }
    }

    let finalAccount = inlineAccount.trim();
    if (inlineIsNoIban || inlineBank.includes('CASH') || inlineBank.includes('CHEQUE') || !finalAccount) {
      finalAccount = finalAccount || (inlineBank.includes('EXCHANGE') ? 'WPS C3 CARD (NO IBAN)' : 'CASH / NO IBAN');
    }

    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          department: finalDept || emp.department,
          bankName: inlineBank || emp.bankName,
          bankAccountNo: finalAccount
        };
      }
      return emp;
    });

    saveEmployees(updated);
    setIsEditingStaff(false);
    setInlineIsAddingDept(false);
    setInlineNewDept('');
  };

  const handleSaveEmail = (empId: string) => {
    const value = emailInputs[empId];
    if (!value || !value.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, email: value.toUpperCase().trim() };
      }
      return emp;
    });
    saveEmployees(updated);
    setEmailInputs(prev => {
      const copy = { ...prev };
      delete copy[empId];
      return copy;
    });
  };

  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpDesignation.trim()) {
      alert('Please fill Full Legal Name and Designation Role.');
      return;
    }

    // Determine final department
    let finalDept = newEmpDept;
    if (isAddingNewDept && customDeptInput.trim()) {
      finalDept = customDeptInput.trim().toUpperCase();
      if (!departmentsList.includes(finalDept)) {
        saveDepartments([...departmentsList, finalDept]);
      }
    }

    // Determine final account / IBAN (supports workers with NO IBAN / Cash in Hand / Exchange cards)
    let finalAccount = newEmpAccount.trim();
    if (isNoIban || newEmpBank.includes('CASH') || newEmpBank.includes('CHEQUE') || !finalAccount) {
      finalAccount = finalAccount || (newEmpBank.includes('EXCHANGE') ? 'WPS C3 CARD (NO IBAN)' : 'CASH / NO IBAN');
    }

    const nextNum = employees.length + 1;
    const nextId = `MFI-0${nextNum.toString().padStart(2, '0')}`;
    const entry: Employee = {
      id: nextId,
      name: newEmpName.toUpperCase().trim(),
      designation: newEmpDesignation.toUpperCase().trim(),
      department: finalDept,
      joiningDate: new Date().toISOString().split('T')[0],
      basicSalary: Number(newEmpBasic) || 1500,
      housingAllowance: Number(newEmpHousing) || 0,
      transportAllowance: Number(newEmpTransport) || 0,
      otherAllowances: Number(newEmpOther) || 0,
      bankName: newEmpBank,
      bankAccountNo: finalAccount,
      email: newEmpEmail.trim(),
      passportNo: newEmpPassport.toUpperCase().trim() || 'P' + Math.floor(Math.random() * 10000000),
      passportExpiry: newEmpPassportExpiry,
      visaExpiry: newEmpVisaExpiry,
      contractExpiry: newEmpContractExpiry,
      contractType: newEmpContractType,
      nationality: newEmpNationality.toUpperCase() || 'BANGLADESH',
      phone: '+971 50 ' + Math.floor(1000000 + Math.random() * 9000000),
      daysPresent: 26,
      daysAbsent: 0,
      leavesApproved: 4,
      overtimeHours: 0
    };
    saveEmployees([...employees, entry]);
    setSelectedEmpId(entry.id);
    setShowAddModal(false);
    
    // reset fields
    setNewEmpName('');
    setNewEmpDesignation('');
    setNewEmpAccount('');
    setNewEmpEmail('');
    setNewEmpPassport('');
    setIsAddingNewDept(false);
    setCustomDeptInput('');
    setIsNoIban(false);
  };

  // Gratuity calculation based on UAE Labour Law (End of Service Benefit)
  const getGratuityAccrued = (e: Employee) => {
    const start = new Date(e.joiningDate);
    const end = new Date('2026-07-21'); // Current local date reference
    const diffTime = end.getTime() - start.getTime();
    const serviceYears = Math.max(0, diffTime / (1000 * 60 * 60 * 24 * 365.25));

    let totalGratuity = 0;
    let rateExplanation = 'No gratuity accrued (requires min. 1 year of continuous service)';

    if (serviceYears >= 1) {
      const dailyBasic = e.basicSalary / 30;
      if (serviceYears <= 5) {
        // 21 days basic salary for each year
        totalGratuity = serviceYears * 21 * dailyBasic;
        rateExplanation = '21 Days per Year (Service ≤ 5 Years)';
      } else {
        // first 5 years at 21 days, subsequent years at 30 days basic salary
        const first5Gratuity = 5 * 21 * dailyBasic;
        const additionalGratuity = (serviceYears - 5) * 30 * dailyBasic;
        totalGratuity = first5Gratuity + additionalGratuity;
        rateExplanation = '21 Days per Year for first 5 years, then 30 Days per Year thereafter';
      }
    }
    return { serviceYears, totalGratuity, rateExplanation };
  };

  // Calculates remaining days till expiration relative to 2026-07-21
  const getDaysRemaining = (expiryStr: string) => {
    const current = new Date('2026-07-21');
    const expiry = new Date(expiryStr);
    const diff = expiry.getTime() - current.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return { days, status: 'EXPIRED', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    } else if (days <= 60) {
      return { days, status: 'EXPIRING SOON', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    } else {
      return { days, status: 'ACTIVE', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
  };

  // ==========================================
  // REDESIGNED PRINT PDF ENGINE: 4 DISTINCT REPORTS
  // ==========================================

  // 1. CONFIDENTIAL EMPLOYEE PAY SLIP (A4 Portrait)
  const triggerPrintPaySlip = (e: Employee) => {
    const { otPay, stdOtPay, absDeductions, stdAbsDeductions, totalAllowances, grossEarnings, netPayout } = getPayrollDetails(e);
    const wordsNet = numberToWordsAED(netPayout);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const isNoIbanMode = !e.bankAccountNo || e.bankAccountNo.includes('CASH') || e.bankAccountNo.includes('NO IBAN') || e.bankName.includes('CASH');
    const isCardMode = e.bankAccountNo.includes('CARD') || e.bankName.includes('EXCHANGE');

    const paymentModeLabel = isNoIbanMode 
      ? 'CASH IN HAND DISBURSEMENT (UNBANKED WORKER)' 
      : isCardMode 
      ? `WPS PAYROLL CARD (${e.bankName})` 
      : `WPS ELECTRONIC BANK TRANSFER (${e.bankName})`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PAYSLIP_${e.id}_${e.name.replace(/\s+/g, '_')}_JULY2026</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm 8mm 10mm !important;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              padding: 0;
              margin: 0;
              font-size: 9.5px;
              line-height: 1.35;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .slip-card {
              border: 2px solid #002D62;
              padding: 16px 20px;
              background: #ffffff;
              box-sizing: border-box;
            }
            .header-banner {
              border-bottom: 2px solid #002D62;
              padding-bottom: 10px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-name {
              font-size: 16px;
              font-weight: 900;
              color: #002D62;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0 0 2px;
            }
            .company-sub {
              font-size: 8.5px;
              color: #4b5563;
              font-weight: bold;
            }
            .slip-title-box {
              text-align: right;
            }
            .slip-title {
              font-size: 13px;
              font-weight: 900;
              color: #f37021;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .slip-period {
              font-size: 9px;
              font-weight: bold;
              color: #002D62;
              margin-top: 2px;
            }
            .voucher-ref {
              font-size: 8px;
              color: #6b7280;
              font-family: monospace;
            }
            .profile-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 16px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 10px 14px;
              margin-bottom: 12px;
            }
            .profile-row {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px dashed #e2e8f0;
              padding-bottom: 3px;
            }
            .profile-label {
              font-size: 8.5px;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
            }
            .profile-value {
              font-size: 9px;
              font-weight: 800;
              color: #0f172a;
              text-align: right;
            }
            .tables-container {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-bottom: 12px;
            }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
            }
            .ledger-table th {
              background: #002D62;
              color: #ffffff;
              padding: 5px 8px;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              text-align: left;
            }
            .ledger-table th.right { text-align: right; }
            .ledger-table th.ded-th { background: #991b1b; }
            .ledger-table td {
              border: 1px solid #cbd5e1;
              padding: 4.5px 8px;
              font-size: 9px;
            }
            .ledger-table td.right { text-align: right; font-family: monospace; font-weight: bold; }
            .ledger-table tr.total-row td {
              background: #f1f5f9;
              font-weight: 900;
              border-top: 2px solid #002D62;
              border-bottom: 2px solid #002D62;
            }
            .ledger-table tr.ded-total td {
              border-top: 2px solid #991b1b;
              border-bottom: 2px solid #991b1b;
              color: #991b1b;
            }
            .net-banner {
              border: 2px solid #002D62;
              background: #002D62;
              color: #ffffff;
              padding: 10px 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            .net-label {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .net-value {
              font-size: 16px;
              font-weight: 900;
              font-family: monospace;
              color: #f37021;
            }
            .words-box {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
              font-size: 8.5px;
              font-weight: bold;
              color: #002D62;
              margin-bottom: 14px;
            }
            .payment-channel-badge {
              display: inline-block;
              padding: 2px 6px;
              border: 1px solid #cbd5e1;
              background: #ffffff;
              font-size: 8px;
              font-weight: bold;
              color: #0f172a;
              margin-top: 2px;
            }
            .signatures-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 12px;
              margin-top: 24px;
              padding-top: 10px;
              border-top: 1px solid #cbd5e1;
            }
            .sig-card {
              border: 1px solid #cbd5e1;
              padding: 8px;
              min-height: 60px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #ffffff;
              text-align: center;
            }
            .sig-title {
              font-size: 8px;
              font-weight: bold;
              color: #002D62;
              text-transform: uppercase;
            }
            .sig-space {
              height: 28px;
            }
            .sig-line {
              border-top: 1px solid #000000;
              font-size: 7.5px;
              color: #4b5563;
              padding-top: 2px;
            }
            .footer-disclaimer {
              margin-top: 14px;
              padding-top: 6px;
              border-top: 1px dashed #cbd5e1;
              font-size: 7.5px;
              color: #64748b;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="slip-card">
            
            <!-- HEADER -->
            <div class="header-banner">
              <div>
                <div class="company-name">${activeCompany.name}</div>
                <div class="company-sub">${activeCompany.address || 'INDUSTRIAL AREA, UAE'}${activeCompany.phone ? ` | TEL: ${activeCompany.phone}` : ''}</div>
                <div class="company-sub">TRN: ${activeCompany.trn || '—'} | REG: ${activeCompany.registrationNo || 'MFI-DXB-98421'}</div>
              </div>
              <div class="slip-title-box">
                <div class="slip-title">CONFIDENTIAL SALARY PAY SLIP</div>
                <div class="slip-period">MONTH: JULY 2026</div>
                <div class="voucher-ref">PAY VOUCHER: PV-${e.id}-202607</div>
              </div>
            </div>

            <!-- EMPLOYEE & BANKING PROFILE MATRIX -->
            <div class="profile-grid">
              <div class="profile-row">
                <span class="profile-label">Employee ID:</span>
                <span class="profile-value font-mono">#${e.id}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Payment Channel:</span>
                <span class="profile-value">${isNoIbanMode ? 'CASH IN HAND' : isCardMode ? 'WPS PAYROLL CARD' : 'WPS BANK WIRE'}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Staff Name:</span>
                <span class="profile-value">${e.name}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Disbursement Bank:</span>
                <span class="profile-value">${e.bankName}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Designation:</span>
                <span class="profile-value">${e.designation}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">IBAN / Account Number:</span>
                <span class="profile-value font-mono">${e.bankAccountNo || 'CASH / NO IBAN'}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Department:</span>
                <span class="profile-value">${e.department}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Present / Duty Days:</span>
                <span class="profile-value">${e.daysPresent} Days / 26 Working</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Joining Date:</span>
                <span class="profile-value">${e.joiningDate}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Approved Leaves:</span>
                <span class="profile-value" style="color: #047857;">${e.leavesApproved} Days Paid</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Nationality:</span>
                <span class="profile-value">${e.nationality}</span>
              </div>
              <div class="profile-row">
                <span class="profile-label">Overtime Hours Logged:</span>
                <span class="profile-value" style="color: #4338ca;">${e.overtimeHours} Hours</span>
              </div>
            </div>

            <!-- DOUBLE ENTRY EARNINGS & DEDUCTIONS -->
            <div class="tables-container">
              
              <!-- EARNINGS -->
              <table class="ledger-table">
                <thead>
                  <tr>
                    <th>A. Earnings & Additions</th>
                    <th class="right">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary (Contractual)</td>
                    <td class="right">${e.basicSalary.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Housing Allowance</td>
                    <td class="right">${e.housingAllowance.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Transport Allowance</td>
                    <td class="right">${e.transportAllowance.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Other Fixed Allowances</td>
                    <td class="right">${e.otherAllowances.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      Overtime Payout (${e.overtimeHours} hrs)
                      ${e.isManualOvertime ? '<br><span style="font-size:7.5px; color:#4338ca;">[Manual Override Applied]</span>' : '<br><span style="font-size:7.5px; color:#6b7280;">(x1.25 Multiplier Formula)</span>'}
                    </td>
                    <td class="right" style="color: #4338ca;">${otPay.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>TOTAL GROSS EARNINGS</td>
                    <td class="right">AED ${grossEarnings.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- DEDUCTIONS -->
              <table class="ledger-table">
                <thead>
                  <tr>
                    <th class="ded-th">B. Deductions & Adjustments</th>
                    <th class="right ded-th">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Unexcused Absences (${e.daysAbsent} Days)
                      ${e.isManualAbsentDeduction ? '<br><span style="font-size:7.5px; color:#991b1b;">[Manual Override Applied]</span>' : '<br><span style="font-size:7.5px; color:#6b7280;">(Basic ÷ 26 × Days)</span>'}
                    </td>
                    <td class="right" style="color: #991b1b;">-${absDeductions.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Social Security / Pension Accrual</td>
                    <td class="right">0.00</td>
                  </tr>
                  <tr>
                    <td>Salary Advance / Loan Recovery</td>
                    <td class="right">0.00</td>
                  </tr>
                  <tr>
                    <td>Statutory Tax / Cess</td>
                    <td class="right">0.00</td>
                  </tr>
                  <tr>
                    <td>Disciplinary / Other Offsets</td>
                    <td class="right">0.00</td>
                  </tr>
                  <tr class="total-row ded-total">
                    <td>TOTAL DEDUCTIONS</td>
                    <td class="right">AED -${absDeductions.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

            </div>

            <!-- NET PAYABLE BANNER -->
            <div class="net-banner">
              <div>
                <div class="net-label">NET SALARY PAYABLE (WPS SETTLEMENT VALUE)</div>
                <div style="font-size: 8px; color: #cbd5e1; margin-top: 2px;">
                  MODE: ${paymentModeLabel}
                </div>
              </div>
              <div class="net-value">AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>

            <div class="words-box">
              AMOUNT IN WORDS: <span style="font-weight: 900; color: #002D62;">${wordsNet}</span>
            </div>

            <!-- SIGNATURE & ACKNOWLEDGEMENT BLOCKS -->
            <div class="signatures-grid">
              <div class="sig-card">
                <div class="sig-title">PREPARED BY</div>
                <div class="sig-space"></div>
                <div class="sig-line">HR & PAYROLL OFFICER</div>
              </div>
              <div class="sig-card">
                <div class="sig-title">AUDITED & APPROVED BY</div>
                <div class="sig-space"></div>
                <div class="sig-line">FINANCIAL CONTROLLER / STAMP</div>
              </div>
              <div class="sig-card">
                <div class="sig-title">EMPLOYEE ACKNOWLEDGEMENT</div>
                <div class="sig-space"></div>
                <div class="sig-line">SIGNATURE & DATE OF RECEIPT</div>
              </div>
            </div>

            <div class="footer-disclaimer">
              This statement is generated electronically in full compliance with United Arab Emirates Wages Protection System (WPS) & MOHRE directives. Generated on ${dateStr}.
            </div>

          </div>
        </body>
      </html>
    `;
    printHtml(html, `PaySlip_${e.id}_${e.name.replace(/\s+/g, '_')}`);
  };

  // 2. MASTER MONTHLY PAY SHEET / REGISTER (A4 Landscape)
  const triggerPrintPaySheet = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let grandBasic = 0, grandHousing = 0, grandTransport = 0, grandOther = 0;
    let grandOT = 0, grandGross = 0, grandDed = 0, grandNet = 0;
    let bankTransferTotal = 0, cashPayoutTotal = 0;
    let bankCount = 0, cashCount = 0;

    // Group by Department
    const depts = Array.from(new Set(employees.map(e => e.department)));
    let deptTablesHtml = '';

    depts.forEach((dept) => {
      const deptEmployees = employees.filter(e => e.department === dept);
      let deptBasic = 0, deptHousing = 0, deptTrans = 0, deptOther = 0, deptOT = 0, deptGross = 0, deptDed = 0, deptNet = 0;

      let rowsHtml = '';
      deptEmployees.forEach((emp, idx) => {
        const { otPay, absDeductions, grossEarnings, netPayout } = getPayrollDetails(emp);
        deptBasic += emp.basicSalary;
        deptHousing += emp.housingAllowance;
        deptTrans += emp.transportAllowance;
        deptOther += emp.otherAllowances;
        deptOT += otPay;
        deptGross += grossEarnings;
        deptDed += absDeductions;
        deptNet += netPayout;

        const isCash = !emp.bankAccountNo || emp.bankAccountNo.includes('CASH') || emp.bankAccountNo.includes('NO IBAN') || emp.bankName.includes('CASH');
        if (isCash) {
          cashPayoutTotal += netPayout;
          cashCount++;
        } else {
          bankTransferTotal += netPayout;
          bankCount++;
        }

        rowsHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
            <td style="font-weight: bold;">${emp.name}</td>
            <td>${emp.designation}</td>
            <td class="right">${emp.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right">${emp.housingAllowance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right">${emp.transportAllowance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right">${emp.otherAllowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right" style="color: #4338ca;">${emp.overtimeHours}h / ${otPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right" style="font-weight: bold;">${grossEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right" style="color: #991b1b;">${emp.daysAbsent}d / ${absDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td class="right" style="font-weight: 900; color: #002D62;">${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td style="font-size: 7.5px;">${emp.bankName} - ${emp.bankAccountNo || 'CASH / NO IBAN'}</td>
          </tr>
        `;
      });

      grandBasic += deptBasic;
      grandHousing += deptHousing;
      grandTransport += deptTrans;
      grandOther += deptOther;
      grandOT += deptOT;
      grandGross += deptGross;
      grandDed += deptDed;
      grandNet += deptNet;

      deptTablesHtml += `
        <tr class="dept-header-row">
          <td colspan="13">
            DEPARTMENT: <strong>${dept}</strong> (${deptEmployees.length} Staff Members)
          </td>
        </tr>
        ${rowsHtml}
        <tr class="dept-subtotal-row">
          <td colspan="4" style="text-align: right;">SUBTOTAL (${dept}):</td>
          <td class="right">${deptBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">${deptHousing.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">${deptTrans.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">${deptOther.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">${deptOT.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">${deptGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right" style="color: #991b1b;">${deptDed.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right" style="font-weight: 900; color: #002D62;">${deptNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td></td>
        </tr>
      `;
    });

    const wordsGrandNet = numberToWordsAED(grandNet);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MASTER_PAY_SHEET_JULY_2026_${activeCompany.shortName || 'MFI'}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm 8mm 6mm 8mm !important;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 0;
              margin: 0;
              font-size: 8px;
              line-height: 1.25;
              color: #0f172a;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-box {
              border: 1.5px solid #002D62;
              padding: 6px 12px;
              margin-bottom: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
            }
            .title-group h1 {
              font-size: 13px;
              font-weight: 900;
              color: #002D62;
              margin: 0;
              text-transform: uppercase;
            }
            .title-group p {
              font-size: 7.5px;
              color: #475569;
              margin: 1px 0 0;
              font-weight: bold;
            }
            .report-title-badge {
              font-size: 11px;
              font-weight: 900;
              color: #f37021;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-group {
              text-align: right;
              font-size: 7.5px;
              color: #334155;
            }
            .meta-group strong {
              color: #002D62;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
            }
            .data-table th {
              border: 1px solid #002D62;
              background: #002D62;
              color: #ffffff;
              padding: 4px 4px;
              font-size: 7.5px;
              font-weight: 800;
              text-align: left;
              text-transform: uppercase;
            }
            .data-table th.right { text-align: right; }
            .data-table td {
              border: 1px solid #cbd5e1;
              padding: 3.5px 4px;
              font-size: 7.5px;
            }
            .data-table td.right { text-align: right; font-family: monospace; }
            .dept-header-row td {
              background: #e2e8f0;
              font-weight: 900;
              font-size: 8px;
              color: #002D62;
              border-top: 1.5px solid #002D62;
              border-bottom: 1.5px solid #002D62;
              padding: 4px 6px;
            }
            .dept-subtotal-row td {
              background: #f1f5f9;
              font-weight: 800;
              font-size: 7.5px;
              border-top: 1px solid #94a3b8;
              border-bottom: 1px solid #94a3b8;
            }
            .grand-total-row td {
              background: #002D62;
              color: #ffffff;
              font-weight: 900;
              font-size: 8.5px;
              border: 1px solid #002D62;
              padding: 5px 4px;
            }
            .grand-total-row td.right {
              color: #f37021;
              font-family: monospace;
            }
            .summary-cards-grid {
              display: grid;
              grid-template-columns: 2fr 1fr 1fr;
              gap: 8px;
              margin-top: 6px;
            }
            .summary-box {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              padding: 5px 8px;
              font-size: 7.5px;
            }
            .summary-box-title {
              font-weight: 900;
              color: #002D62;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .sig-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-top: 8px;
              padding-top: 4px;
            }
            .sig-box {
              border: 1px solid #cbd5e1;
              background: #ffffff;
              padding: 4px 6px;
              height: 38px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
            }
            .sig-title {
              font-size: 7px;
              font-weight: 900;
              color: #002D62;
              text-transform: uppercase;
            }
            .sig-name {
              font-size: 6.5px;
              color: #475569;
              border-top: 0.5px solid #94a3b8;
              padding-top: 1px;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div class="title-group">
              <h1>${activeCompany.name}</h1>
              <p>${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</p>
            </div>
            <div style="text-align: center;">
              <div class="report-title-badge">MASTER MONTHLY PAYROLL REGISTER</div>
              <div style="font-size: 8px; font-weight: bold; color: #002D62;">CYCLE: JULY 2026 (01/07/2026 - 31/07/2026)</div>
            </div>
            <div class="meta-group">
              <div>BATCH REF: <strong>MFI-PAY-202607</strong></div>
              <div>PRINT DATE: <strong>${dateStr}</strong></div>
              <div>TOTAL ROSTER: <strong>${employees.length} EMPLOYEES</strong></div>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 20px; text-align: center;">#</th>
                <th style="width: 45px;">ID</th>
                <th style="width: 140px;">EMPLOYEE NAME</th>
                <th style="width: 110px;">DESIGNATION</th>
                <th class="right">BASIC (AED)</th>
                <th class="right">HOUSING</th>
                <th class="right">TRANS.</th>
                <th class="right">OTHER</th>
                <th class="right">OT (HRS/AED)</th>
                <th class="right">GROSS (AED)</th>
                <th class="right">ABS (DAYS/AED)</th>
                <th class="right">NET PAYABLE (AED)</th>
                <th>PAYMENT CHANNEL & IBAN</th>
              </tr>
            </thead>
            <tbody>
              ${deptTablesHtml}
              <tr class="grand-total-row">
                <td colspan="4" style="text-align: right; letter-spacing: 0.5px;">CONSOLIDATED GRAND TOTALS:</td>
                <td class="right">${grandBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">${grandHousing.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">${grandTransport.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">${grandOther.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">${grandOT.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">${grandGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right" style="color: #fca5a5;">-${grandDed.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right" style="font-size: 10px;">AED ${grandNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td style="color: #ffffff; font-size: 7.5px;">TOTAL HEADS: ${employees.length}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary-cards-grid">
            <div class="summary-box">
              <div class="summary-box-title">AMOUNT IN WORDS (GRAND NET PAYOUT)</div>
              <div style="font-weight: 800; color: #002D62; font-size: 8px;">${wordsGrandNet}</div>
            </div>
            <div class="summary-box">
              <div class="summary-box-title">WPS BANK WIRE TRANSFERS</div>
              <div><strong>AED ${bankTransferTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> (${bankCount} Employees)</div>
            </div>
            <div class="summary-box">
              <div class="summary-box-title">CASH / UNBANKED DISBURSEMENTS</div>
              <div><strong>AED ${cashPayoutTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> (${cashCount} Employees)</div>
            </div>
          </div>

          <div class="sig-grid">
            <div class="sig-box">
              <div class="sig-title">1. PREPARED BY</div>
              <div class="sig-name">HR & PAYROLL OFFICER</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">2. CHECKED BY</div>
              <div class="sig-name">INTERNAL AUDITOR</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">3. VERIFIED BY</div>
              <div class="sig-name">CHIEF FINANCIAL CONTROLLER</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">4. AUTHORIZED & APPROVED</div>
              <div class="sig-name">MANAGING DIRECTOR & CORPORATE SEAL</div>
            </div>
          </div>

          <div style="margin-top: 4px; font-size: 6.5px; text-align: center; color: #64748b;">
            OFFICIAL SYSTEM-GENERATED MASTER PAYROLL REGISTER — STRICTLY CONFIDENTIAL — PROCESSED FOR UAE W.P.S. ESCROW.
          </div>
        </body>
      </html>
    `;
    printHtml(html, `PaySheet_July2026_${activeCompany.shortName || 'MFI'}`);
  };

  // 3. MONTHLY WORKFORCE ATTENDANCE & TIMESHEET AUDIT REGISTER (A4 Landscape)
  const triggerPrintAttendanceSheet = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let totalPresent = 0, totalAbsent = 0, totalLeaves = 0, totalOT = 0;
    let grandAbsDed = 0, grandOtPay = 0;

    let rowsHtml = '';
    employees.forEach((emp, idx) => {
      const { otPay, absDeductions } = getPayrollDetails(emp);
      totalPresent += emp.daysPresent;
      totalAbsent += emp.daysAbsent;
      totalLeaves += emp.leavesApproved;
      totalOT += emp.overtimeHours;
      grandAbsDed += absDeductions;
      grandOtPay += otPay;

      const dutyRatio = ((emp.daysPresent + emp.leavesApproved) / 30) * 100;
      const statusBadge = dutyRatio >= 90 
        ? '<span style="color: #047857; font-weight: bold;">COMPLIANT (≥90%)</span>' 
        : '<span style="color: #b45309; font-weight: bold;">ATTN. REQUIRED (&lt;90%)</span>';

      rowsHtml += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
          <td style="font-weight: bold;">${emp.name}</td>
          <td>${emp.department}</td>
          <td>${emp.designation}</td>
          <td class="center font-bold" style="color: #047857;">${emp.daysPresent} d</td>
          <td class="center font-bold" style="color: ${emp.daysAbsent > 0 ? '#b91c1c' : '#64748b'};">${emp.daysAbsent} d</td>
          <td class="center">${emp.leavesApproved} d</td>
          <td class="center font-bold" style="color: #4338ca;">${emp.overtimeHours} hrs</td>
          <td class="center font-bold">${dutyRatio.toFixed(1)}%</td>
          <td class="right" style="color: #b91c1c;">AED ${absDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right" style="color: #4338ca;">AED ${otPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="center">${statusBadge}</td>
        </tr>
      `;
    });

    const avgWorkforceRatio = employees.length > 0 ? ((totalPresent + totalLeaves) / (employees.length * 30)) * 100 : 0;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATTENDANCE_TIMESHEET_JULY_2026_${activeCompany.shortName || 'MFI'}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm 8mm 6mm 8mm !important;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 0;
              margin: 0;
              font-size: 8.5px;
              line-height: 1.3;
              color: #0f172a;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-box {
              border: 1.5px solid #002D62;
              padding: 6px 12px;
              margin-bottom: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
            }
            .title-group h1 {
              font-size: 13px;
              font-weight: 900;
              color: #002D62;
              margin: 0;
              text-transform: uppercase;
            }
            .title-group p {
              font-size: 7.5px;
              color: #475569;
              margin: 1px 0 0;
              font-weight: bold;
            }
            .report-title-badge {
              font-size: 11px;
              font-weight: 900;
              color: #047857;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-group {
              text-align: right;
              font-size: 7.5px;
              color: #334155;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
            }
            .data-table th {
              border: 1px solid #002D62;
              background: #002D62;
              color: #ffffff;
              padding: 4.5px 5px;
              font-size: 8px;
              font-weight: 800;
              text-align: left;
              text-transform: uppercase;
            }
            .data-table th.center { text-align: center; }
            .data-table th.right { text-align: right; }
            .data-table td {
              border: 1px solid #cbd5e1;
              padding: 4px 5px;
              font-size: 8px;
            }
            .data-table td.center { text-align: center; }
            .data-table td.right { text-align: right; font-family: monospace; }
            .totals-row td {
              background: #002D62;
              color: #ffffff;
              font-weight: 900;
              font-size: 8.5px;
              border: 1px solid #002D62;
              padding: 5px 5px;
            }
            .totals-row td.right { color: #f37021; font-family: monospace; }
            .compliance-box {
              border: 1px solid #cbd5e1;
              background: #f8fafc;
              padding: 8px 12px;
              margin-top: 8px;
              font-size: 8px;
              color: #334155;
            }
            .sig-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-top: 10px;
            }
            .sig-box {
              border: 1px solid #cbd5e1;
              background: #ffffff;
              padding: 6px 8px;
              height: 44px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
            }
            .sig-title {
              font-size: 7.5px;
              font-weight: 900;
              color: #002D62;
              text-transform: uppercase;
            }
            .sig-name {
              font-size: 7px;
              color: #475569;
              border-top: 0.5px solid #94a3b8;
              padding-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div class="title-group">
              <h1>${activeCompany.name}</h1>
              <p>${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</p>
            </div>
            <div style="text-align: center;">
              <div class="report-title-badge">WORKFORCE ATTENDANCE & TIMESHEET AUDIT REGISTER</div>
              <div style="font-size: 8px; font-weight: bold; color: #002D62;">PERIOD: 01-JUL-2026 TO 31-JUL-2026 (30 DAYS CYCLE)</div>
            </div>
            <div class="meta-group">
              <div>STANDARD DUTY: <strong>8 HRS/DAY (26 WORK DAYS)</strong></div>
              <div>PRINT DATE: <strong>${dateStr}</strong></div>
              <div>TOTAL ROSTER: <strong>${employees.length} WORKERS</strong></div>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">#</th>
                <th style="width: 50px;">EMP ID</th>
                <th style="width: 150px;">EMPLOYEE NAME</th>
                <th style="width: 130px;">DEPARTMENT</th>
                <th style="width: 120px;">DESIGNATION</th>
                <th class="center" style="width: 60px;">PRESENT</th>
                <th class="center" style="width: 60px;">ABSENT</th>
                <th class="center" style="width: 60px;">LEAVES</th>
                <th class="center" style="width: 60px;">OVERTIME</th>
                <th class="center" style="width: 70px;">DUTY RATIO</th>
                <th class="right" style="width: 90px;">ABS. DEDUCTION</th>
                <th class="right" style="width: 90px;">OT EARNINGS</th>
                <th class="center" style="width: 110px;">AUDIT CLEARANCE</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="totals-row">
                <td colspan="5" style="text-align: right; letter-spacing: 0.5px;">WORKFORCE CONSOLIDATED TOTALS:</td>
                <td class="center" style="font-weight: 900; color: #a7f3d0;">${totalPresent} Man-Days</td>
                <td class="center" style="font-weight: 900; color: #fca5a5;">${totalAbsent} Man-Days</td>
                <td class="center" style="font-weight: 900;">${totalLeaves} Man-Days</td>
                <td class="center" style="font-weight: 900; color: #e0e7ff;">${totalOT} Hours</td>
                <td class="center" style="font-weight: 900; color: #fef08a;">${avgWorkforceRatio.toFixed(1)}%</td>
                <td class="right" style="color: #fca5a5;">AED -${grandAbsDed.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right" style="color: #e0e7ff;">AED ${grandOtPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="center" style="color: #a7f3d0;">AUDITED 100%</td>
              </tr>
            </tbody>
          </table>

          <div class="compliance-box">
            <strong>STATUTORY AUDIT DECLARATION:</strong> We hereby certify that the above attendance roster, absenteeism records, and overtime hours have been cross-verified against site biometric punch clocks, manual shift sign-in logs, and approved leave applications in full compliance with UAE Federal Decree-Law No. 33 of 2021 regulating employment relations.
          </div>

          <div class="sig-grid">
            <div class="sig-box">
              <div class="sig-title">SITE & WORKSHOP SUPERVISOR</div>
              <div class="sig-name">SIGNATURE & DATE</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">HR TIMEKEEPER & AUDITOR</div>
              <div class="sig-name">SIGNATURE & DATE</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">OPERATIONS DIRECTOR</div>
              <div class="sig-name">APPROVAL & OFFICIAL SEAL</div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `AttendanceSheet_July2026_${activeCompany.shortName || 'MFI'}`);
  };

  // 4. BANK PAYMENT ADVICE & ESCROW DISBURSEMENT LETTER (A4 Portrait)
  const triggerPrintPaymentAdvice = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let grandPayout = 0;
    let bankTransferTotal = 0, cashCounterTotal = 0;
    let bankRowsHtml = '', cashRowsHtml = '';
    let bankIdx = 1, cashIdx = 1;

    employees.forEach(emp => {
      const { netPayout } = getPayrollDetails(emp);
      grandPayout += netPayout;

      const isCash = !emp.bankAccountNo || emp.bankAccountNo.includes('CASH') || emp.bankAccountNo.includes('NO IBAN') || emp.bankName.includes('CASH');

      if (!isCash) {
        bankTransferTotal += netPayout;
        bankRowsHtml += `
          <tr>
            <td style="text-align: center;">${bankIdx++}</td>
            <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
            <td style="font-weight: bold;">${emp.name}</td>
            <td>${emp.bankName}</td>
            <td style="font-family: monospace; font-weight: bold;">${emp.bankAccountNo}</td>
            <td class="right" style="font-weight: 900; color: #002D62;">AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td style="text-align: center; font-size: 8px; font-weight: bold; color: #047857;">WPS DIRECT</td>
          </tr>
        `;
      } else {
        cashCounterTotal += netPayout;
        cashRowsHtml += `
          <tr>
            <td style="text-align: center;">${cashIdx++}</td>
            <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
            <td style="font-weight: bold;">${emp.name}</td>
            <td>${emp.department}</td>
            <td style="font-family: monospace;">${emp.bankAccountNo || 'CASH IN HAND / NO IBAN'}</td>
            <td class="right" style="font-weight: 900; color: #b45309;">AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            <td style="text-align: center; font-size: 8px; font-weight: bold; color: #b45309;">COUNTER VOUCHER</td>
          </tr>
        `;
      }
    });

    const wordsGrandTotal = numberToWordsAED(grandPayout);
    const wordsBankTotal = numberToWordsAED(bankTransferTotal);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>BANK_PAYMENT_ADVICE_JULY_2026_${activeCompany.shortName || 'MFI'}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm !important;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              padding: 0;
              margin: 0;
              font-size: 9px;
              line-height: 1.35;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .letter-container {
              border: 1.5px solid #002D62;
              padding: 18px 22px;
              box-sizing: border-box;
            }
            .letter-header {
              border-bottom: 2px solid #002D62;
              padding-bottom: 10px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .comp-name {
              font-size: 15px;
              font-weight: 900;
              color: #002D62;
              text-transform: uppercase;
            }
            .comp-meta {
              font-size: 8px;
              color: #475569;
              font-weight: bold;
            }
            .memo-badge {
              text-align: right;
            }
            .memo-title {
              font-size: 12px;
              font-weight: 900;
              color: #f37021;
              text-transform: uppercase;
            }
            .bank-recipient-box {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 10px 14px;
              margin-bottom: 12px;
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              gap: 10px;
            }
            .recip-title {
              font-size: 8px;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
            }
            .recip-value {
              font-size: 10px;
              font-weight: 800;
              color: #0f172a;
            }
            .debit-matrix {
              border: 1.5px solid #002D62;
              background: #002D62;
              color: #ffffff;
              padding: 10px 14px;
              margin-bottom: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .debit-label {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
            }
            .debit-amount {
              font-size: 16px;
              font-weight: 900;
              font-family: monospace;
              color: #f37021;
            }
            .schedule-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
              margin-bottom: 12px;
            }
            .schedule-table th {
              border: 1px solid #002D62;
              background: #002D62;
              color: #ffffff;
              padding: 5px 6px;
              font-size: 8px;
              font-weight: 800;
              text-align: left;
              text-transform: uppercase;
            }
            .schedule-table th.right { text-align: right; }
            .schedule-table td {
              border: 1px solid #cbd5e1;
              padding: 4.5px 6px;
              font-size: 8.5px;
            }
            .schedule-table td.right { text-align: right; font-family: monospace; font-weight: bold; }
            .schedule-table tr.total-row td {
              background: #f1f5f9;
              font-weight: 900;
              border-top: 2px solid #002D62;
              border-bottom: 2px solid #002D62;
            }
            .mandate-text {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              font-size: 8px;
              color: #334155;
              line-height: 1.4;
              margin-bottom: 14px;
            }
            .sig-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 12px;
              margin-top: 14px;
            }
            .sig-box {
              border: 1px solid #cbd5e1;
              background: #ffffff;
              padding: 8px;
              height: 52px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
            }
            .sig-title {
              font-size: 8px;
              font-weight: 900;
              color: #002D62;
              text-transform: uppercase;
            }
            .sig-name {
              font-size: 7.5px;
              color: #475569;
              border-top: 0.5px solid #94a3b8;
              padding-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="letter-container">
            
            <div class="letter-header">
              <div>
                <div class="comp-name">${activeCompany.name}</div>
                <div class="comp-meta">${activeCompany.address || 'INDUSTRIAL AREA, UAE'}${activeCompany.phone ? ` | TEL: ${activeCompany.phone}` : ''}</div>
                <div class="comp-meta">TRN: ${activeCompany.trn || '—'} | REG: ${activeCompany.registrationNo || 'MFI-DXB-98421'}</div>
              </div>
              <div class="memo-badge">
                <div class="memo-title">BANK PAYMENT ADVICE</div>
                <div style="font-size: 8px; font-weight: bold; color: #002D62;">WPS ESCROW TRANSMISSION DIRECTIVE</div>
                <div style="font-size: 7.5px; color: #64748b; font-family: monospace;">REF: MFI/WPS/202607-ADV</div>
              </div>
            </div>

            <!-- RECIPIENT & DEBIT DIRECTIVE -->
            <div class="bank-recipient-box">
              <div>
                <div class="recip-title">To Bank / Settlement Department:</div>
                <div class="recip-value">${activeCompany.bankName || 'RAKBANK UAE'}</div>
                <div style="font-size: 8px; color: #475569;">Corporate Operations & WPS Clearing Unit</div>
                <div style="font-size: 8px; color: #475569; margin-top: 2px;">Subject: <strong>WPS Salary Escrow Wire Transfer for July 2026</strong></div>
              </div>
              <div>
                <div class="recip-title">Debit Account Coordinates:</div>
                <div class="recip-value">${activeCompany.name}</div>
                <div style="font-size: 8.5px; font-family: monospace; font-weight: bold; color: #002D62;">
                  ACC: ${activeCompany.bankAccountNo || activeCompany.bankIban || 'AE084210040510000000001'}
                </div>
                <div style="font-size: 8px; color: #475569;">Value Date: <strong>2026-07-21</strong></div>
              </div>
            </div>

            <!-- TOTAL VALUE BANNER -->
            <div class="debit-matrix">
              <div>
                <div class="debit-label">TOTAL AUTHORIZED DEBIT AMOUNT (WPS TRANSMISSION):</div>
                <div style="font-size: 8px; color: #cbd5e1; margin-top: 2px;">
                  IN WORDS: <strong>${wordsBankTotal}</strong>
                </div>
              </div>
              <div class="debit-amount">AED ${bankTransferTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>

            <!-- BENEFICIARY SCHEDULE TABLE -->
            <div style="font-size: 9px; font-weight: 900; color: #002D62; text-transform: uppercase; margin-bottom: 3px;">
              SCHEDULE 1: ITEMISED ELECTRONIC BENEFICIARY DISBURSEMENT
            </div>
            <table class="schedule-table">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">SL</th>
                  <th style="width: 60px;">EMP ID</th>
                  <th>BENEFICIARY EMPLOYEE NAME</th>
                  <th>DESTINATION BANK</th>
                  <th>IBAN / ACCOUNT COORDINATE</th>
                  <th class="right">TRANSFER VALUE (AED)</th>
                  <th style="text-align: center; width: 80px;">ROUTING</th>
                </tr>
              </thead>
              <tbody>
                ${bankRowsHtml}
                <tr class="total-row">
                  <td colspan="5" style="text-align: right; letter-spacing: 0.5px;">TOTAL WPS ELECTRONIC TRANSFERS:</td>
                  <td class="right" style="color: #002D62; font-size: 9.5px;">AED ${bankTransferTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: center; font-weight: bold; font-size: 8px;">${bankIdx - 1} ACCOUNTS</td>
                </tr>
              </tbody>
            </table>

            ${cashRowsHtml ? `
              <div style="font-size: 9px; font-weight: 900; color: #b45309; text-transform: uppercase; margin-top: 8px; margin-bottom: 3px;">
                SCHEDULE 2: CASH IN HAND / UNBANKED COUNTER DISBURSEMENTS (INTERNAL VOUCHERS)
              </div>
              <table class="schedule-table">
                <thead>
                  <tr style="background: #78350f;">
                    <th style="width: 25px; text-align: center; background: #78350f;">SL</th>
                    <th style="width: 60px; background: #78350f;">EMP ID</th>
                    <th style="background: #78350f;">BENEFICIARY EMPLOYEE NAME</th>
                    <th style="background: #78350f;">DEPARTMENT</th>
                    <th style="background: #78350f;">PAYMENT MODE</th>
                    <th class="right" style="background: #78350f;">AMOUNT (AED)</th>
                    <th style="text-align: center; width: 80px; background: #78350f;">SETTLEMENT</th>
                  </tr>
                </thead>
                <tbody>
                  ${cashRowsHtml}
                  <tr class="total-row">
                    <td colspan="5" style="text-align: right; letter-spacing: 0.5px;">TOTAL CASH DISBURSEMENTS:</td>
                    <td class="right" style="color: #b45309; font-size: 9.5px;">AED ${cashCounterTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td style="text-align: center; font-weight: bold; font-size: 8px;">${cashIdx - 1} WORKERS</td>
                  </tr>
                </tbody>
              </table>
            ` : ''}

            <div class="mandate-text">
              <strong>BANK AUTHORIZATION & INDEMNITY:</strong> We hereby authorize and instruct ${activeCompany.bankName || 'RAKBANK UAE'} to debit our Corporate Account No. ${activeCompany.bankAccountNo || activeCompany.bankIban || 'AE084210040510000000001'} for the total value of <strong>AED ${bankTransferTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> (${wordsBankTotal}) and credit the respective beneficiary accounts via the Wages Protection System (WPS) on value date 2026-07-21. We confirm that this salary disbursement is compliant with UAE Federal Law.
            </div>

            <!-- EXECUTIVE SIGNATORIES -->
            <div class="sig-grid">
              <div class="sig-box">
                <div class="sig-title">PRIMARY SIGNATORY</div>
                <div class="sig-name">MANAGING DIRECTOR</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">SECONDARY SIGNATORY</div>
                <div class="sig-name">CHIEF FINANCIAL OFFICER</div>
              </div>
              <div class="sig-box">
                <div class="sig-title">OFFICIAL CORPORATE SEAL</div>
                <div class="sig-name">COMPANY EMBOSSMENT STAMP</div>
              </div>
            </div>

          </div>
        </body>
      </html>
    `;
    printHtml(html, `PaymentAdvice_July2026_${activeCompany.shortName || 'MFI'}`);
  };

  // 5. EMPLOYEES WITHOUT EMAIL IDS REPORT (A4 Portrait)
  const triggerPrintNoEmailReport = () => {
    const missing = employees.filter(e => !e.email || !e.email.includes('@'));
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let rowsHtml = '';
    missing.forEach((emp, idx) => {
      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
          <td style="font-weight: bold;">${emp.name}</td>
          <td>${emp.designation}</td>
          <td>${emp.department}</td>
          <td style="font-family: monospace;">${emp.phone || '—'}</td>
          <td>${emp.bankAccountNo && !emp.bankAccountNo.includes('CASH') ? 'WPS IBAN READY' : 'CASH DISBURSEMENT'}</td>
          <td style="color: #991b1b; font-weight: bold; font-size: 7.5px;">PENDING MOHRE E-SERVICES PROFILE UPDATE</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MOHRE_WPS_EMAIL_AUDIT_${activeCompany.shortName || 'MFI'}_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @page { size: A4 portrait; margin: 8mm 10mm 8mm 10mm !important; }
            body { font-family: Arial, sans-serif; font-size: 9px; line-height: 1.35; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 14px 18px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
            .kpi-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 6px 8px; text-align: center; }
            .kpi-title { font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .kpi-value { font-size: 13px; font-weight: 900; color: #002D62; margin-top: 2px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 6px; font-size: 8px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 8.5px; }
            .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            .sig-box { border: 1px solid #94a3b8; padding: 6px; text-align: center; height: 48px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 4px; text-transform: uppercase;">
                  REPORT #05: EMPLOYEES WITHOUT REGISTERED EMAIL IDS (WPS EXCEPTION AUDIT)
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">AUDIT RUN: ${dateStr}</div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">MOHRE DIRECTIVE 2026/09</div>
              </div>
            </div>

            <div class="kpi-grid">
              <div class="kpi-box">
                <div class="kpi-title">TOTAL STAFF</div>
                <div class="kpi-value">${employees.length}</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">EMAIL CONFIGURED</div>
                <div class="kpi-value" style="color: #047857;">${employees.length - missing.length}</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">MISSING EMAIL</div>
                <div class="kpi-value" style="color: #b91c1c;">${missing.length}</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">COMPLIANCE RATIO</div>
                <div class="kpi-value">${Math.round(((employees.length - missing.length) / (employees.length || 1)) * 100)}%</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">#</th>
                  <th style="width: 55px;">EMP ID</th>
                  <th>EMPLOYEE LEGAL NAME</th>
                  <th>DESIGNATION</th>
                  <th>DEPARTMENT</th>
                  <th>PHONE NUMBER</th>
                  <th>DISBURSEMENT STATUS</th>
                  <th>AUDIT REMARK</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 12px; font-weight: bold; color: #047857;">ALL EMPLOYEES HAVE VALID REGISTERED EMAIL IDS. 100% COMPLIANT.</td></tr>'}
              </tbody>
            </table>

            <div style="margin-top: 14px; background: #fffbeb; border: 1px solid #fef3c7; padding: 8px; font-size: 8px; color: #92400e; line-height: 1.4;">
              <strong>MOHRE AUDIT NOTICE:</strong> As per UAE Labour Circular No. 4/2026, employee e-mail coordinates are recommended for official electronic payslip distribution and e-Dirham MoHRE notification dispatches.
            </div>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">PREPARED BY</div>
                <div style="font-size: 7px; font-weight: bold;">HR OFFICER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">VERIFIED BY</div>
                <div style="font-size: 7px; font-weight: bold;">HEAD OF COMPLIANCE</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">AUTHORIZED SIGNATORY</div>
                <div style="font-size: 7px; font-weight: bold;">COMPANY SEAL & SIGNATURE</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `EmployeesWithoutEmails_${new Date().toISOString().split('T')[0]}`);
  };

  // 6. DEPARTMENTAL PAYROLL STATEMENT (A4 Landscape)
  const triggerPrintPayrollStatement = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const depts = Array.from(new Set(employees.map(e => e.department)));
    let grandBasic = 0, grandAllow = 0, grandOT = 0, grandDed = 0, grandNet = 0, grandStaff = 0;

    let rowsHtml = '';
    depts.forEach((dept, idx) => {
      const deptEmps = employees.filter(e => e.department === dept);
      let deptBasic = 0, deptAllow = 0, deptOT = 0, deptDed = 0, deptNet = 0;

      deptEmps.forEach(e => {
        const { otPay, absDeductions, totalAllowances, netPayout } = getPayrollDetails(e);
        deptBasic += e.basicSalary;
        deptAllow += totalAllowances;
        deptOT += otPay;
        deptDed += absDeductions;
        deptNet += netPayout;
      });

      grandBasic += deptBasic;
      grandAllow += deptAllow;
      grandOT += deptOT;
      grandDed += deptDed;
      grandNet += deptNet;
      grandStaff += deptEmps.length;

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-weight: 900; color: #002D62;">${dept}</td>
          <td style="text-align: center; font-weight: bold;">${deptEmps.length}</td>
          <td style="text-align: right;">AED ${deptBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right;">AED ${deptAllow.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right; color: #4338ca;">AED ${deptOT.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right; color: #991b1b;">AED ${deptDed.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right; font-weight: 900; color: #002D62;">AED ${deptNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right; font-size: 8px;">${((deptNet / (grandNet || 1)) * 100).toFixed(1)}%</td>
        </tr>
      `;
    });

    const wordsGrandNet = numberToWordsAED(grandNet);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DEPARTMENTAL_PAYROLL_STATEMENT_${activeCompany.shortName || 'MFI'}_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8.5px; line-height: 1.3; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 12px 16px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 6px; font-size: 8px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 8.5px; }
            .totals-row td { background: #f8fafc; font-weight: 900; border-top: 2px solid #002D62; border-bottom: 2px solid #002D62; }
            .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
            .sig-box { border: 1px solid #94a3b8; padding: 5px; text-align: center; height: 42px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 3px; text-transform: uppercase;">
                  REPORT #06: CONSOLIDATED DEPARTMENTAL PAYROLL STATEMENT
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">PERIOD: JULY 2026</div>
                <div style="font-size: 7.5px; color: #64748b; margin-top: 2px;">AUDITED ON: ${dateStr}</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">#</th>
                  <th>DEPARTMENT / OPERATIONAL UNIT</th>
                  <th style="text-align: center; width: 65px;">HEADCOUNT</th>
                  <th style="text-align: right;">BASIC WAGES</th>
                  <th style="text-align: right;">TOTAL ALLOWANCES</th>
                  <th style="text-align: right;">OVERTIME PAYOUT</th>
                  <th style="text-align: right;">DEDUCTIONS</th>
                  <th style="text-align: right;">NET DEPARTMENT PAYROLL</th>
                  <th style="text-align: right; width: 55px;">SHARE %</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr class="totals-row">
                  <td colspan="2" style="text-align: right; letter-spacing: 0.5px;">CONSOLIDATED GRAND TOTALS:</td>
                  <td style="text-align: center;">${grandStaff} STAFF</td>
                  <td style="text-align: right;">AED ${grandBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">AED ${grandAllow.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; color: #4338ca;">AED ${grandOT.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; color: #991b1b;">AED ${grandDed.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; color: #002D62;">AED ${grandNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">100.0%</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 8px; padding: 6px 8px; background: #f8fafc; border: 1px solid #cbd5e1; font-size: 8px;">
              AMOUNT IN WORDS: <strong>${wordsGrandNet}</strong>
            </div>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">1. PREPARED BY</div>
                <div style="font-size: 7px; font-weight: bold;">PAYROLL ACCOUNTANT</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">2. CHECKED BY</div>
                <div style="font-size: 7px; font-weight: bold;">INTERNAL AUDITOR</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">3. REVIEWED BY</div>
                <div style="font-size: 7px; font-weight: bold;">HEAD OF HR</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">4. APPROVED BY</div>
                <div style="font-size: 7px; font-weight: bold;">MANAGING DIRECTOR & SEAL</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `PayrollStatement_July2026_${activeCompany.shortName || 'MFI'}`);
  };

  // 7. EMPLOYEE PAY HEAD BREAKUP (A4 Portrait)
  const triggerPrintPayHeadEmployee = (emp: Employee) => {
    const { otPay, stdOtPay, absDeductions, stdAbsDeductions, totalAllowances, grossEarnings, netPayout, isManualOvertime, isManualAbsentDeduction } = getPayrollDetails(emp);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const wordsNet = numberToWordsAED(netPayout);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PAY_HEAD_BREAKUP_${emp.id}_${emp.name.replace(/\s+/g, '_')}</title>
          <style>
            @page { size: A4 portrait; margin: 8mm 10mm 8mm 10mm !important; }
            body { font-family: Arial, sans-serif; font-size: 9px; line-height: 1.35; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 14px 18px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .emp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; margin-bottom: 12px; }
            .emp-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 8px; font-size: 8.5px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 9px; }
            .net-box { background: #002D62; color: #ffffff; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
            .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            .sig-box { border: 1px solid #94a3b8; padding: 6px; text-align: center; height: 48px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 4px; text-transform: uppercase;">
                  REPORT #07: INDIVIDUAL EMPLOYEE PAY HEAD BREAKUP & STATUTORY ALLOCATION
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">DATE: ${dateStr}</div>
                <div style="font-size: 7.5px; color: #64748b;">PAYROLL CYCLE: JULY 2026</div>
              </div>
            </div>

            <div class="emp-grid">
              <div class="emp-row">
                <span style="color: #64748b; font-weight: bold;">EMPLOYEE ID:</span>
                <span style="font-weight: 900; font-family: monospace;">${emp.id}</span>
              </div>
              <div class="emp-row">
                <span style="color: #64748b; font-weight: bold;">EMPLOYEE NAME:</span>
                <span style="font-weight: 900;">${emp.name}</span>
              </div>
              <div class="emp-row">
                <span style="color: #64748b; font-weight: bold;">DESIGNATION:</span>
                <span>${emp.designation}</span>
              </div>
              <div class="emp-row">
                <span style="color: #64748b; font-weight: bold;">DEPARTMENT:</span>
                <span>${emp.department}</span>
              </div>
              <div class="emp-row">
                <span style="color: #64748b; font-weight: bold;">BANK & ACCOUNT:</span>
                <span style="font-family: monospace;">${emp.bankName} (${emp.bankAccountNo || 'CASH'})</span>
              </div>
              <div class="emp-row">
                <span style="color: #64748b; font-weight: bold;">CONTRACT TYPE:</span>
                <span style="font-weight: bold;">${emp.contractType || 'LIMITED'}</span>
              </div>
            </div>

            <div style="font-weight: 900; color: #002D62; font-size: 9.5px; text-transform: uppercase; margin-bottom: 4px;">
              A. ITEMIZED EARNINGS PAY HEADS
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px; text-align: center;">#</th>
                  <th>PAY HEAD COMPONENT</th>
                  <th>CLASSIFICATION / STATUTORY BASIS</th>
                  <th style="text-align: right; width: 100px;">AMOUNT (AED)</th>
                  <th style="text-align: right; width: 65px;">WEIGHT %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center;">1</td>
                  <td><strong>BASIC WAGE</strong></td>
                  <td>Statutory Fixed Wage (MoHRE Labor Contract)</td>
                  <td style="text-align: right; font-weight: bold;">AED ${emp.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">${((emp.basicSalary / (grossEarnings || 1)) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td style="text-align: center;">2</td>
                  <td><strong>HOUSING ALLOWANCE</strong></td>
                  <td>Monthly Accommodation Provision</td>
                  <td style="text-align: right; font-weight: bold;">AED ${emp.housingAllowance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">${((emp.housingAllowance / (grossEarnings || 1)) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td style="text-align: center;">3</td>
                  <td><strong>TRANSPORT ALLOWANCE</strong></td>
                  <td>Monthly Transit & Commute Support</td>
                  <td style="text-align: right; font-weight: bold;">AED ${emp.transportAllowance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">${((emp.transportAllowance / (grossEarnings || 1)) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td style="text-align: center;">4</td>
                  <td><strong>OTHER ALLOWANCES</strong></td>
                  <td>Utility, Site & Discretionary Benefits</td>
                  <td style="text-align: right; font-weight: bold;">AED ${emp.otherAllowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">${((emp.otherAllowances / (grossEarnings || 1)) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td style="text-align: center;">5</td>
                  <td><strong>OVERTIME PAYOUT</strong></td>
                  <td>
                    ${isManualOvertime 
                      ? 'Manual Override Payout (Adjusted Total)' 
                      : (emp.isCustomHourlyRate 
                          ? `Custom Rate (${emp.overtimeHours}h × AED ${Number(emp.customHourlyRate).toFixed(2)}/hr × ${emp.overtimeMultiplier || 1.25}×)` 
                          : `Statutory (${emp.overtimeHours}h × (Basic/208) × ${emp.overtimeMultiplier || 1.25}×)`)}
                  </td>
                  <td style="text-align: right; font-weight: bold; color: #4338ca;">AED ${otPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">${((otPay / (grossEarnings || 1)) * 100).toFixed(1)}%</td>
                </tr>
                <tr style="background: #f8fafc; font-weight: 900; border-top: 2px solid #002D62;">
                  <td colspan="3" style="text-align: right;">TOTAL GROSS EARNINGS:</td>
                  <td style="text-align: right; color: #002D62;">AED ${grossEarnings.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">100.0%</td>
                </tr>
              </tbody>
            </table>

            <div style="font-weight: 900; color: #991b1b; font-size: 9.5px; text-transform: uppercase; margin-top: 10px; margin-bottom: 4px;">
              B. ITEMIZED DEDUCTION PAY HEADS
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px; text-align: center; background: #991b1b; border-color: #991b1b;">#</th>
                  <th style="background: #991b1b; border-color: #991b1b;">DEDUCTION HEAD</th>
                  <th style="background: #991b1b; border-color: #991b1b;">CALCULATION BASIS & REMARKS</th>
                  <th style="text-align: right; width: 100px; background: #991b1b; border-color: #991b1b;">AMOUNT (AED)</th>
                  <th style="text-align: right; width: 65px; background: #991b1b; border-color: #991b1b;">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="text-align: center;">1</td>
                  <td><strong>ABSENTEE / LOSS OF PAY DEDUCTION</strong></td>
                  <td>
                    ${isManualAbsentDeduction 
                      ? `Manual Override Deduction (${emp.customDeductionRemarks || 'Adjusted deduction amount'})` 
                      : (emp.isCustomDailyWage
                          ? `Custom Daily Wage (${emp.daysAbsent} Days Absent × AED ${Number(emp.customDailyWage).toFixed(2)}/day)`
                          : `Standard Loss of Pay (${emp.daysAbsent} Days Absent × Basic/26)`)}
                  </td>
                  <td style="text-align: right; font-weight: bold; color: #991b1b;">AED ${absDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right; font-size: 7.5px; font-weight: bold;">APPLIED</td>
                </tr>
                <tr style="background: #f8fafc; font-weight: 900; border-top: 2px solid #991b1b;">
                  <td colspan="3" style="text-align: right;">TOTAL DEDUCTIONS:</td>
                  <td style="text-align: right; color: #991b1b;">AED ${absDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div class="net-box">
              <div>
                <div style="font-size: 8px; font-weight: bold; color: #cbd5e1; text-transform: uppercase;">NET SETTLEMENT VALUE (WPS DIRECTIVE)</div>
                <div style="font-size: 8px; color: #f8fafc; margin-top: 2px;">WORDS: ${wordsNet}</div>
              </div>
              <div style="font-size: 16px; font-weight: 900; color: #ffffff; font-family: monospace;">
                AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
            </div>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">PAYROLL COMPILER</div>
                <div style="font-size: 7px; font-weight: bold;">HR DEPARTMENT</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">FINANCE AUDITOR</div>
                <div style="font-size: 7px; font-weight: bold;">INTERNAL AUDIT</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">EMPLOYEE SIGNATURE</div>
                <div style="font-size: 7px; font-weight: bold;">ACKNOWLEDGED & RECEIVED</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `PayHeadBreakup_${emp.id}_${new Date().toISOString().split('T')[0]}`);
  };

  // 8. PAY HEAD EMPLOYEE BREAKUP (A4 Landscape)
  const triggerPrintEmployeePayHead = (headKey: string) => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const headLabels: Record<string, string> = {
      basicSalary: 'BASIC SALARY (WAGES)',
      housingAllowance: 'HOUSING ALLOWANCE',
      transportAllowance: 'TRANSPORT ALLOWANCE',
      otherAllowances: 'OTHER ALLOWANCES',
      overtime: 'OVERTIME PAYOUT (x1.25 / MANUAL)',
      deductions: 'ABSENTEE DEDUCTIONS'
    };
    const headTitle = headLabels[headKey] || 'BASIC SALARY';

    let rowsHtml = '';
    let totalHeadAmount = 0;
    let totalCompanyPayroll = 0;

    employees.forEach((emp, idx) => {
      const details = getPayrollDetails(emp);
      let headVal = 0;
      if (headKey === 'basicSalary') headVal = emp.basicSalary;
      else if (headKey === 'housingAllowance') headVal = emp.housingAllowance;
      else if (headKey === 'transportAllowance') headVal = emp.transportAllowance;
      else if (headKey === 'otherAllowances') headVal = emp.otherAllowances;
      else if (headKey === 'overtime') headVal = details.otPay;
      else if (headKey === 'deductions') headVal = details.absDeductions;
      else headVal = emp.basicSalary;

      totalHeadAmount += headVal;
      totalCompanyPayroll += details.netPayout;

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
          <td style="font-weight: bold;">${emp.name}</td>
          <td>${emp.designation}</td>
          <td>${emp.department}</td>
          <td style="text-align: right; font-weight: 900; color: #002D62;">AED ${headVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right;">AED ${details.netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right; font-size: 8px;">${((headVal / (details.netPayout || 1)) * 100).toFixed(1)}%</td>
          <td style="text-align: center; font-size: 7.5px;">${emp.contractType || 'LIMITED'}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PAY_HEAD_DISTRIBUTION_${headKey.toUpperCase()}_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8.5px; line-height: 1.3; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 12px 16px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 6px; font-size: 8px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 8.5px; }
            .totals-row td { background: #f8fafc; font-weight: 900; border-top: 2px solid #002D62; border-bottom: 2px solid #002D62; }
            .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
            .sig-box { border: 1px solid #94a3b8; padding: 5px; text-align: center; height: 42px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 3px; text-transform: uppercase;">
                  REPORT #08: PAY HEAD DISTRIBUTION ANALYSIS — ${headTitle}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">PERIOD: JULY 2026</div>
                <div style="font-size: 7.5px; color: #64748b;">DATE: ${dateStr}</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">#</th>
                  <th style="width: 55px;">EMP ID</th>
                  <th>STAFF FULL NAME</th>
                  <th>DESIGNATION</th>
                  <th>DEPARTMENT</th>
                  <th style="text-align: right; width: 110px;">${headTitle} (AED)</th>
                  <th style="text-align: right; width: 110px;">TOTAL NET PAY (AED)</th>
                  <th style="text-align: right; width: 65px;">COMPONENT %</th>
                  <th style="text-align: center; width: 75px;">CONTRACT</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr class="totals-row">
                  <td colspan="5" style="text-align: right; letter-spacing: 0.5px;">CONSOLIDATED PAY HEAD GRAND TOTAL:</td>
                  <td style="text-align: right; color: #002D62;">AED ${totalHeadAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">AED ${totalCompanyPayroll.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">${((totalHeadAmount / (totalCompanyPayroll || 1)) * 100).toFixed(1)}%</td>
                  <td style="text-align: center;">AUDITED</td>
                </tr>
              </tbody>
            </table>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">1. PREPARED BY</div>
                <div style="font-size: 7px; font-weight: bold;">HR & PAYROLL OFFICER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">2. VERIFIED BY</div>
                <div style="font-size: 7px; font-weight: bold;">SENIOR ACCOUNTANT</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">3. AUDITED BY</div>
                <div style="font-size: 7px; font-weight: bold;">FINANCIAL CONTROLLER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">4. AUTHORIZED SIGNATORY</div>
                <div style="font-size: 7px; font-weight: bold;">COMPANY STAMP & SIGNATURE</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `PayHeadBreakup_${headKey}_${new Date().toISOString().split('T')[0]}`);
  };

  // 9. GRATUITY CALCULATOR REPORT (A4 Landscape)
  const triggerPrintGratuity = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let rowsHtml = '';
    let grandGratuity = 0;

    employees.forEach((emp, idx) => {
      const { serviceYears, totalGratuity, rateExplanation } = getGratuityAccrued(emp);
      grandGratuity += totalGratuity;

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
          <td style="font-weight: bold;">${emp.name}</td>
          <td>${emp.designation}</td>
          <td>${emp.department}</td>
          <td style="font-family: monospace;">${emp.joiningDate}</td>
          <td style="text-align: center; font-weight: bold;">${serviceYears.toFixed(2)} Yrs</td>
          <td style="text-align: right;">AED ${emp.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="font-size: 7.5px;">${rateExplanation}</td>
          <td style="text-align: right; font-weight: 900; color: #002D62;">AED ${totalGratuity.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
        </tr>
      `;
    });

    const wordsGrand = numberToWordsAED(grandGratuity);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GRATUITY_EOSB_REGISTRY_${activeCompany.shortName || 'MFI'}_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8.5px; line-height: 1.3; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 12px 16px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 6px; font-size: 8px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 8.5px; }
            .totals-row td { background: #f8fafc; font-weight: 900; border-top: 2px solid #002D62; border-bottom: 2px solid #002D62; }
            .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
            .sig-box { border: 1px solid #94a3b8; padding: 5px; text-align: center; height: 42px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 3px; text-transform: uppercase;">
                  REPORT #09: UAE LABOUR LAW STATUTORY GRATUITY (EOSB) ACCRUAL REGISTRY
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">VALUATION AS OF: 2026-07-21</div>
                <div style="font-size: 7.5px; color: #64748b;">FEDERAL DECREE-LAW NO. 33 OF 2021</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">#</th>
                  <th style="width: 55px;">EMP ID</th>
                  <th>STAFF LEGAL NAME</th>
                  <th>DESIGNATION</th>
                  <th>DEPARTMENT</th>
                  <th>JOINING DATE</th>
                  <th style="text-align: center; width: 65px;">TENURE</th>
                  <th style="text-align: right; width: 90px;">BASIC WAGE (AED)</th>
                  <th>STATUTORY CALCULATION SCALE</th>
                  <th style="text-align: right; width: 110px;">EOSB LIABILITY (AED)</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr class="totals-row">
                  <td colspan="9" style="text-align: right; letter-spacing: 0.5px;">CONSOLIDATED GRATUITY CONTINGENT PROVISION:</td>
                  <td style="text-align: right; color: #002D62;">AED ${grandGratuity.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 8px; padding: 6px 8px; background: #f8fafc; border: 1px solid #cbd5e1; font-size: 8px;">
              TOTAL PROVISION IN WORDS: <strong>${wordsGrand}</strong>
            </div>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">1. ACTUARY / HR</div>
                <div style="font-size: 7px; font-weight: bold;">HR & BENEFITS OFFICER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">2. VERIFIED BY</div>
                <div style="font-size: 7px; font-weight: bold;">FINANCE AUDITOR</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">3. APPROVED BY</div>
                <div style="font-size: 7px; font-weight: bold;">CHIEF FINANCIAL OFFICER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">4. AUTHORIZED SIGNATORY</div>
                <div style="font-size: 7px; font-weight: bold;">COMPANY EMBOSSMENT SEAL</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `GratuityRegistry_${new Date().toISOString().split('T')[0]}`);
  };

  // 10. SIF RECORDS CREATOR REPORT (A4 Landscape)
  const triggerPrintSifRecords = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const bankEmployees = employees.filter(e => e.bankAccountNo && !e.bankAccountNo.includes('CASH') && !e.bankAccountNo.includes('NO IBAN'));
    let totalWpsAmount = 0;

    let rowsHtml = '';
    bankEmployees.forEach((emp, idx) => {
      const { basicSalary, housingAllowance, transportAllowance, otherAllowances } = emp;
      const { otPay, absDeductions, totalAllowances, netPayout } = getPayrollDetails(emp);
      totalWpsAmount += netPayout;

      const routingCode = emp.bankAccountNo.startsWith('AE') ? emp.bankAccountNo.substring(4, 7) + '001' : '024001';
      const molId = 'MOL' + emp.id.replace('MFI-', '9988');

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">EDR</td>
          <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
          <td style="font-weight: bold;">${emp.name}</td>
          <td style="font-family: monospace;">${molId}</td>
          <td style="font-family: monospace; font-size: 7.5px;">${emp.bankAccountNo}</td>
          <td style="font-family: monospace; text-align: center;">${routingCode}</td>
          <td style="text-align: right;">${basicSalary.toFixed(2)}</td>
          <td style="text-align: right;">${(totalAllowances + otPay).toFixed(2)}</td>
          <td style="text-align: right; color: #991b1b;">${absDeductions.toFixed(2)}</td>
          <td style="text-align: right; font-weight: 900; color: #002D62;">AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: center; font-size: 7.5px; color: #047857; font-weight: bold;">VALIDATED</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>WPS_SIF_1.2_MANIFEST_${activeCompany.shortName || 'MFI'}_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8.5px; line-height: 1.3; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 12px 16px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .scr-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; font-family: monospace; font-size: 8px; margin-bottom: 8px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 6px; font-size: 8px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 8.5px; }
            .totals-row td { background: #f8fafc; font-weight: 900; border-top: 2px solid #002D62; border-bottom: 2px solid #002D62; }
            .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
            .sig-box { border: 1px solid #94a3b8; padding: 5px; text-align: center; height: 42px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 3px; text-transform: uppercase;">
                  REPORT #10: WAGES PROTECTION SYSTEM (WPS) SIF FILE DISPATCH MANIFEST
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">SPECIFICATION: SIF v1.2</div>
                <div style="font-size: 7.5px; color: #64748b;">CREATION: ${dateStr}</div>
              </div>
            </div>

            <div class="scr-box">
              <strong>SALARY CONTROL RECORD (SCR HEADER):</strong><br/>
              SCR,${activeCompany.molId || '78419950001'},024001,${new Date().toISOString().split('T')[0].replace(/-/g,'')},090000,20260721,${bankEmployees.length},${totalWpsAmount.toFixed(2)},AED,MFI_JULY_2026_DISPATCH
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">#</th>
                  <th style="width: 35px;">TYPE</th>
                  <th style="width: 55px;">EMP ID</th>
                  <th>EMPLOYEE LEGAL NAME</th>
                  <th>MOL CARD NO</th>
                  <th>BENEFICIARY IBAN / ACCOUNT</th>
                  <th style="text-align: center;">ROUTING</th>
                  <th style="text-align: right;">BASIC</th>
                  <th style="text-align: right;">VARIABLE</th>
                  <th style="text-align: right;">DEDUCTION</th>
                  <th style="text-align: right; width: 100px;">NET DISBURSE (AED)</th>
                  <th style="text-align: center; width: 65px;">STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr class="totals-row">
                  <td colspan="10" style="text-align: right; letter-spacing: 0.5px;">CONSOLIDATED SIF TOTAL DISBURSEMENT:</td>
                  <td style="text-align: right; color: #002D62;">AED ${totalWpsAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: center; color: #047857;">MOHRE READY</td>
                </tr>
              </tbody>
            </table>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">1. WPS COMPILER</div>
                <div style="font-size: 7px; font-weight: bold;">PAYROLL OFFICER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">2. VERIFIED BY</div>
                <div style="font-size: 7px; font-weight: bold;">INTERNAL AUDITOR</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">3. BANK AUTHORIZER</div>
                <div style="font-size: 7px; font-weight: bold;">FINANCE DIRECTOR</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">4. COMPANY SEAL</div>
                <div style="font-size: 7px; font-weight: bold;">AUTHORIZED STAMP</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `SIF_Records_${new Date().toISOString().split('T')[0]}`);
  };

  // 11. PAYROLL REGISTER (A4 Landscape)
  const triggerPrintPayrollRegister = () => {
    triggerPrintGeneralReport('payroll_register');
  };

  // 13. COMPREHENSIVE EMPLOYEE PROFILE REPORT (A4 Portrait)
  const triggerPrintEmployeeProfile = (emp: Employee) => {
    const { otPay, absDeductions, totalAllowances, grossEarnings, netPayout, isManualOvertime, isManualAbsentDeduction } = getPayrollDetails(emp);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const passportRem = getDaysRemaining(emp.passportExpiry || '2028-12-15');
    const visaRem = getDaysRemaining(emp.visaExpiry || '2028-06-30');
    const contractRem = getDaysRemaining(emp.contractExpiry || '2028-06-30');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>EMPLOYEE_DOSSIER_${emp.id}_${emp.name.replace(/\s+/g, '_')}</title>
          <style>
            @page { size: A4 portrait; margin: 8mm 10mm 8mm 10mm !important; }
            body { font-family: Arial, sans-serif; font-size: 9px; line-height: 1.35; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 14px 18px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .section-title { font-size: 10px; font-weight: 900; color: #002D62; text-transform: uppercase; border-bottom: 1.5px solid #002D62; padding-bottom: 3px; margin: 10px 0 6px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; }
            .grid-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px; }
            .grid-label { color: #64748b; font-weight: bold; font-size: 8px; text-transform: uppercase; }
            .grid-val { font-weight: bold; color: #0f172a; }
            .status-badge { display: inline-block; padding: 2px 6px; font-size: 7.5px; font-weight: 900; border-radius: 2px; }
            .badge-active { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
            .badge-expiring { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
            .badge-expired { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 8px; font-size: 8px; text-transform: uppercase; text-align: left; }
            .data-table td { border: 1px solid #cbd5e1; padding: 4px 8px; font-size: 8.5px; }
            .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            .sig-box { border: 1px solid #94a3b8; padding: 6px; text-align: center; height: 48px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 4px; text-transform: uppercase;">
                  REPORT #13: COMPREHENSIVE EMPLOYEE DOSSIER & REMUNERATION AUDIT
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">STAFF ID: ${emp.id}</div>
                <div style="font-size: 7.5px; color: #64748b;">GENERATED: ${dateStr}</div>
              </div>
            </div>

            <!-- SECTION 1: PERSONAL & EMPLOYMENT DETAILS -->
            <div class="section-title">1. PERSONAL & CORPORATE ASSIGNMENT</div>
            <div class="grid-2">
              <div class="grid-row">
                <span class="grid-label">LEGAL NAME:</span>
                <span class="grid-val">${emp.name}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">EMPLOYEE ID:</span>
                <span class="grid-val font-mono">${emp.id}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">DESIGNATION:</span>
                <span class="grid-val">${emp.designation}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">DEPARTMENT:</span>
                <span class="grid-val">${emp.department}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">NATIONALITY:</span>
                <span class="grid-val">${emp.nationality || 'BANGLADESH'}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">JOINING DATE:</span>
                <span class="grid-val">${emp.joiningDate || '2022-04-12'}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">PHONE CONTACT:</span>
                <span class="grid-val">${emp.phone || '—'}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">EMAIL ADDRESS:</span>
                <span class="grid-val">${emp.email || 'NO EMAIL RECORDED'}</span>
              </div>
            </div>

            <!-- SECTION 2: STATUTORY IMMIGRATION & LABOUR COMPLIANCE -->
            <div class="section-title">2. STATUTORY MOHRE & IMMIGRATION STATUS</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>DOCUMENT</th>
                  <th>IDENTIFIER / NUMBER</th>
                  <th>EXPIRY DATE</th>
                  <th>REMAINING</th>
                  <th>COMPLIANCE STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>PASSPORT</strong></td>
                  <td>${emp.passportNo || '—'}</td>
                  <td>${emp.passportExpiry || '2028-12-15'}</td>
                  <td>${passportRem.days} Days</td>
                  <td><span class="status-badge ${passportRem.status === 'EXPIRED' ? 'badge-expired' : passportRem.status === 'EXPIRING SOON' ? 'badge-expiring' : 'badge-active'}">${passportRem.status}</span></td>
                </tr>
                <tr>
                  <td><strong>RESIDENCE VISA</strong></td>
                  <td>UID-784-${emp.id.replace('MFI-', '409')}</td>
                  <td>${emp.visaExpiry || '2028-06-30'}</td>
                  <td>${visaRem.days} Days</td>
                  <td><span class="status-badge ${visaRem.status === 'EXPIRED' ? 'badge-expired' : visaRem.status === 'EXPIRING SOON' ? 'badge-expiring' : 'badge-active'}">${visaRem.status}</span></td>
                </tr>
                <tr>
                  <td><strong>MOHRE LABOUR CONTRACT</strong></td>
                  <td>${emp.contractType || 'LIMITED'} CONTRACT</td>
                  <td>${emp.contractExpiry || '2028-06-30'}</td>
                  <td>${contractRem.days} Days</td>
                  <td><span class="status-badge ${contractRem.status === 'EXPIRED' ? 'badge-expired' : contractRem.status === 'EXPIRING SOON' ? 'badge-expiring' : 'badge-active'}">${contractRem.status}</span></td>
                </tr>
              </tbody>
            </table>

            <!-- SECTION 3: SALARY STRUCTURE & ATTENDANCE DEFAULTS -->
            <div class="section-title">3. REMUNERATION, ATTENDANCE & OVERTIME OVERRIDES</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>SALARY / PAY ELEMENT</th>
                  <th style="text-align: right;">AMOUNT (AED)</th>
                  <th>ATTENDANCE & OVERRIDE SETTINGS</th>
                  <th style="text-align: right;">CURRENT CYCLE VALUE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>BASIC SALARY</strong></td>
                  <td style="text-align: right; font-weight: bold;">AED ${emp.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td>Days Present: <strong>${emp.daysPresent ?? 26}</strong> | Approved Leaves: <strong>${emp.leavesApproved ?? 4}</strong></td>
                  <td style="text-align: right;">AED ${emp.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
                <tr>
                  <td><strong>HOUSING ALLOWANCE</strong></td>
                  <td style="text-align: right;">AED ${emp.housingAllowance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td>Overtime Hours: <strong>${emp.overtimeHours ?? 0}h</strong></td>
                  <td style="text-align: right; color: #4338ca;">
                    OT: AED ${otPay.toLocaleString(undefined, {minimumFractionDigits: 2})} ${isManualOvertime ? '(MANUAL)' : '(x1.25)'}
                  </td>
                </tr>
                <tr>
                  <td><strong>TRANSPORT ALLOWANCE</strong></td>
                  <td style="text-align: right;">AED ${emp.transportAllowance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td>Days Absent: <strong>${emp.daysAbsent ?? 0}d</strong></td>
                  <td style="text-align: right; color: #991b1b;">
                    DED: AED ${absDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})} ${isManualAbsentDeduction ? '(MANUAL)' : '(STATUTORY)'}
                  </td>
                </tr>
                <tr>
                  <td><strong>OTHER ALLOWANCES</strong></td>
                  <td style="text-align: right;">AED ${emp.otherAllowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td>Bank Account: <strong>${emp.bankName} - ${emp.bankAccountNo || 'CASH'}</strong></td>
                  <td style="text-align: right; font-weight: 900; color: #002D62;">NET: AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">HR EXECUTIVE</div>
                <div style="font-size: 7px; font-weight: bold;">VERIFIED RECORDS</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">PAYROLL AUDITOR</div>
                <div style="font-size: 7px; font-weight: bold;">AUDITED & CLEARED</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7.5px; font-weight: bold; color: #64748b;">STAFF SIGNATURE</div>
                <div style="font-size: 7px; font-weight: bold;">EMPLOYEE CONFIRMATION</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `EmployeeProfile_${emp.id}_${emp.name.replace(/\s+/g, '_')}`);
  };

  // 14. EMPLOYEE HEAD COUNT REPORT (A4 Landscape)
  const triggerPrintHeadCount = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const totalStaff = employees.length;
    const depts = Array.from(new Set(employees.map(e => e.department)));
    const limitedCount = employees.filter(e => !e.contractType || e.contractType === 'LIMITED').length;
    const unlimitedCount = employees.filter(e => e.contractType === 'UNLIMITED').length;
    const emiratiCount = employees.filter(e => (e.nationality || '').toUpperCase().includes('EMIRATI') || (e.nationality || '').toUpperCase().includes('UAE')).length;

    // Department breakdown
    let deptRowsHtml = '';
    depts.forEach((dept, idx) => {
      const deptEmps = employees.filter(e => e.department === dept);
      let deptBasicSum = 0;
      deptEmps.forEach(e => deptBasicSum += e.basicSalary);
      deptRowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-weight: 900; color: #002D62;">${dept}</td>
          <td style="text-align: center; font-weight: bold; font-size: 10px;">${deptEmps.length}</td>
          <td style="text-align: right; font-weight: bold;">${((deptEmps.length / (totalStaff || 1)) * 100).toFixed(1)}%</td>
          <td style="text-align: right;">AED ${deptBasicSum.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: right;">AED ${(deptBasicSum / (deptEmps.length || 1)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>WORKFORCE_HEADCOUNT_${activeCompany.shortName || 'MFI'}_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8.5px; line-height: 1.3; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 12px 16px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px; }
            .kpi-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 6px 8px; text-align: center; }
            .kpi-title { font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .kpi-value { font-size: 13px; font-weight: 900; color: #002D62; margin-top: 2px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 6px; font-size: 8px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 4px 6px; font-size: 8.5px; }
            .totals-row td { background: #f8fafc; font-weight: 900; border-top: 2px solid #002D62; border-bottom: 2px solid #002D62; }
            .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
            .sig-box { border: 1px solid #94a3b8; padding: 5px; text-align: center; height: 42px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 3px; text-transform: uppercase;">
                  REPORT #14: WORKFORCE DEMOGRAPHICS & EMPLOYEE HEADCOUNT DISTRIBUTION
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">CENSUS DATE: ${dateStr}</div>
                <div style="font-size: 7.5px; color: #64748b;">MOHRE COMPLIANCE ENGINE</div>
              </div>
            </div>

            <div class="kpi-grid">
              <div class="kpi-box">
                <div class="kpi-title">TOTAL ACTIVE STAFF</div>
                <div class="kpi-value">${totalStaff} HEADS</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">LIMITED CONTRACTS</div>
                <div class="kpi-value">${limitedCount} (${Math.round((limitedCount/totalStaff)*100)}%)</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">UNLIMITED CONTRACTS</div>
                <div class="kpi-value">${unlimitedCount} (${Math.round((unlimitedCount/totalStaff)*100)}%)</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">EMIRATISATION</div>
                <div class="kpi-value" style="color: #047857;">${emiratiCount} (${Math.round((emiratiCount/totalStaff)*100)}%)</div>
              </div>
              <div class="kpi-box">
                <div class="kpi-title">ACTIVE DEPARTMENTS</div>
                <div class="kpi-value">${depts.length} UNITS</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 25px; text-align: center;">#</th>
                  <th>DEPARTMENT / OPERATIONAL COST CENTER</th>
                  <th style="text-align: center; width: 90px;">HEADCOUNT</th>
                  <th style="text-align: right; width: 90px;">WORKFORCE SHARE</th>
                  <th style="text-align: right; width: 120px;">TOTAL BASIC WAGE (AED)</th>
                  <th style="text-align: right; width: 120px;">AVG WAGE / HEAD (AED)</th>
                </tr>
              </thead>
              <tbody>
                ${deptRowsHtml}
                <tr class="totals-row">
                  <td colspan="2" style="text-align: right; letter-spacing: 0.5px;">TOTAL COMPANY CENSUS:</td>
                  <td style="text-align: center; font-size: 10px;">${totalStaff}</td>
                  <td style="text-align: right;">100.0%</td>
                  <td style="text-align: right;">AED ${employees.reduce((acc, e) => acc + e.basicSalary, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style="text-align: right;">AED ${(employees.reduce((acc, e) => acc + e.basicSalary, 0) / (totalStaff || 1)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">1. HR ANALYST</div>
                <div style="font-size: 7px; font-weight: bold;">HR DEPARTMENT</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">2. OPERATIONS HEAD</div>
                <div style="font-size: 7px; font-weight: bold;">PLANT MANAGER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">3. GENERAL MANAGER</div>
                <div style="font-size: 7px; font-weight: bold;">EXECUTIVE DIRECTOR</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">4. COMPANY SEAL</div>
                <div style="font-size: 7px; font-weight: bold;">CORPORATE STAMP</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `EmployeeHeadCount_${new Date().toISOString().split('T')[0]}`);
  };

  // 15. EXPAT REPORTS (A4 Landscape)
  const triggerPrintExpatReport = () => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let rowsHtml = '';
    employees.forEach((emp, idx) => {
      const pRem = getDaysRemaining(emp.passportExpiry || '2028-12-15');
      const vRem = getDaysRemaining(emp.visaExpiry || '2028-06-30');
      const cRem = getDaysRemaining(emp.contractExpiry || '2028-06-30');

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${emp.id}</td>
          <td style="font-weight: bold;">${emp.name}</td>
          <td>${emp.designation}</td>
          <td>${emp.department}</td>
          <td>${emp.nationality || 'BANGLADESH'}</td>
          <td style="font-family: monospace;">${emp.passportNo || '—'} (${emp.passportExpiry || '—'})</td>
          <td style="text-align: center; font-weight: bold; color: ${pRem.days <= 60 ? '#991b1b' : '#047857'};">${pRem.days}d [${pRem.status}]</td>
          <td style="font-family: monospace;">${emp.visaExpiry || '—'}</td>
          <td style="text-align: center; font-weight: bold; color: ${vRem.days <= 60 ? '#991b1b' : '#047857'};">${vRem.days}d [${vRem.status}]</td>
          <td style="font-family: monospace;">${emp.contractExpiry || '—'}</td>
          <td style="text-align: center; font-weight: bold; color: ${cRem.days <= 60 ? '#991b1b' : '#047857'};">${cRem.days}d [${cRem.status}]</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>EXPAT_COMPLIANCE_REPORT_${activeCompany.shortName || 'MFI'}_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm !important; }
            body { font-family: Arial, sans-serif; font-size: 8px; line-height: 1.3; color: #0f172a; margin: 0; padding: 0; }
            .report-card { border: 2px solid #002D62; padding: 12px 16px; }
            .header-banner { border-bottom: 2px solid #002D62; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 15px; font-weight: 900; color: #002D62; text-transform: uppercase; }
            .subtitle { font-size: 8px; color: #64748b; font-weight: bold; margin-top: 2px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            .data-table th { background: #002D62; color: #ffffff; padding: 5px 5px; font-size: 7.5px; text-transform: uppercase; text-align: left; border: 1px solid #002D62; }
            .data-table td { border: 1px solid #cbd5e1; padding: 3.5px 5px; font-size: 8px; }
            .sig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 8px; }
            .sig-box { border: 1px solid #94a3b8; padding: 5px; text-align: center; height: 42px; display: flex; flex-direction: column; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-banner">
              <div>
                <div class="title">${activeCompany.name}</div>
                <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'} | TRN: ${activeCompany.trn || '—'}</div>
                <div style="font-size: 11px; font-weight: 900; color: #f37021; margin-top: 3px; text-transform: uppercase;">
                  REPORT #15: EXPATRIATE STATUTORY IMMIGRATION & LABOUR DOCUMENT MONITOR
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 9px; color: #002D62;">AUDIT RUN: ${dateStr}</div>
                <div style="font-size: 7.5px; color: #64748b;">MOHRE & ICP REGULATION COMPLIANT</div>
              </div>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 20px; text-align: center;">#</th>
                  <th style="width: 45px;">EMP ID</th>
                  <th>EXPATRIATE NAME</th>
                  <th>DESIGNATION</th>
                  <th>DEPARTMENT</th>
                  <th>NATIONALITY</th>
                  <th>PASSPORT NO (EXP)</th>
                  <th style="text-align: center;">PASSPORT STATUS</th>
                  <th>VISA EXPIRY</th>
                  <th style="text-align: center;">VISA STATUS</th>
                  <th>CONTRACT EXP</th>
                  <th style="text-align: center;">CONTRACT STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <div style="margin-top: 8px; background: #fffbeb; border: 1px solid #fde68a; padding: 5px 8px; font-size: 7.5px; color: #92400e;">
              <strong>MOHRE FINE PREVENTION MANDATE:</strong> Passport, UAE Residence Visa and Labour Contract renewals must be initiated 30 days prior to expiration to avoid statutory immigration and labour penalty levies.
            </div>

            <div class="sig-grid">
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">1. PRO / IMMIGRATION</div>
                <div style="font-size: 7px; font-weight: bold;">PUBLIC RELATIONS OFFICER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">2. HR COMPLIANCE</div>
                <div style="font-size: 7px; font-weight: bold;">HUMAN RESOURCES MANAGER</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">3. LEGAL AUDITOR</div>
                <div style="font-size: 7px; font-weight: bold;">CORPORATE COUNSEL</div>
              </div>
              <div class="sig-box">
                <div style="font-size: 7px; font-weight: bold; color: #64748b;">4. COMPANY SEAL</div>
                <div style="font-size: 7px; font-weight: bold;">OFFICIAL EMBOSSMENT</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(html, `ExpatReport_${new Date().toISOString().split('T')[0]}`);
  };

  // Generic Fallback Report Generator for remaining modules
  const triggerPrintGeneralReport = (reportId: string) => {
    const activeObj = REPORTS_LIST.find(r => r.id === reportId);
    const reportTitle = activeObj ? activeObj.title : 'Payroll Report';
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let tableContent = '';
    let grandBasic = 0, grandAllow = 0, grandOT = 0, grandDed = 0, grandNet = 0;

    employees.forEach((emp, idx) => {
      const { otPay, absDeductions, totalAllowances, netPayout } = getPayrollDetails(emp);
      grandBasic += emp.basicSalary;
      grandAllow += totalAllowances;
      grandOT += otPay;
      grandDed += absDeductions;
      grandNet += netPayout;

      tableContent += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><strong>${emp.id}</strong></td>
          <td><strong>${emp.name}</strong></td>
          <td>${emp.designation}</td>
          <td>${emp.department}</td>
          <td class="right">AED ${emp.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">AED ${totalAllowances.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right">AED ${otPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right" style="color: #990000;">AED ${absDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td class="right bold">AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          <td style="text-align: center;">${emp.bankAccountNo && !emp.bankAccountNo.includes('CASH') ? 'WPS READY' : 'CASH / NO IBAN'}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle.toUpperCase()} - ${activeCompany.shortName || activeCompany.name}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm 8mm 6mm 8mm !important;
            }
            body {
              font-family: Arial, "Arial MT", sans-serif;
              padding: 0;
              margin: 0;
              font-size: 8.5px;
              line-height: 1.3;
              color: #000000;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-box {
              border: 1.5px solid #000000;
              padding: 8px 12px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #ffffff;
            }
            .title {
              font-size: 14px;
              font-weight: bold;
              letter-spacing: 0.5px;
              color: #000000;
            }
            .subtitle {
              font-size: 8px;
              color: #000000;
              font-weight: bold;
              margin-top: 2px;
            }
            .badge {
              border: 1px solid #000000;
              background: #ffffff;
              color: #000000;
              font-size: 8px;
              font-weight: bold;
              padding: 2px 6px;
              display: inline-block;
            }
            .sysinfo {
              font-size: 7.5px;
              color: #000000;
              margin-top: 3px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
            }
            .data-table th {
              border: 1px solid #000000;
              padding: 5px;
              background: #ffffff;
              font-weight: bold;
              text-align: left;
              text-transform: uppercase;
              font-size: 8px;
            }
            .data-table td {
              border: 1px solid #000000;
              padding: 4px 5px;
            }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .totals-row td {
              font-weight: bold;
              background: #ffffff;
              border-top: 2px solid #000000;
              border-bottom: 2px solid #000000;
            }
            .sig-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-top: 15px;
              padding-top: 8px;
              border-top: 1px dashed #000000;
            }
            .sig-box {
              border: 1px solid #000000;
              background: #ffffff;
              padding: 6px;
              height: 42px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              color: #000000;
            }
            .sig-title {
              font-size: 7.5px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .sig-name {
              font-size: 7px;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="title">${activeCompany.name}</div>
              <div class="subtitle">${activeCompany.address || 'INDUSTRIAL AREA, UAE'}${activeCompany.phone ? ` | TEL: ${activeCompany.phone}` : ''} | TRN: ${activeCompany.trn || '—'}</div>
              <div style="font-size: 11px; font-weight: bold; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${reportTitle.toUpperCase()}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="badge">PAYROLL ENGINE</div>
              <div class="sysinfo">PRINT DATE: ${dateStr}</div>
              <div class="sysinfo">TOTAL STAFF: ${employees.length} HEADS</div>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th style="width: 60px;">EMP ID</th>
                <th>STAFF NAME</th>
                <th>DESIGNATION</th>
                <th>DEPARTMENT</th>
                <th class="right">BASIC (AED)</th>
                <th class="right">ALLOWANCES (AED)</th>
                <th class="right">OVERTIME (AED)</th>
                <th class="right">DEDUCTIONS (AED)</th>
                <th class="right">NET PAYOUT (AED)</th>
                <th style="text-align: center; width: 70px;">WPS STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${tableContent}
              <tr class="totals-row">
                <td colspan="5" style="text-align: right; letter-spacing: 0.5px;">CONSOLIDATED GRAND TOTALS:</td>
                <td class="right">AED ${grandBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">AED ${grandAllow.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">AED ${grandOT.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right" style="color: #990000;">AED ${grandDed.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">AED ${grandNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td style="text-align: center;">AUDITED</td>
              </tr>
            </tbody>
          </table>

          <div class="sig-grid">
            <div class="sig-box">
              <div class="sig-title">1. PREPARED BY</div>
              <div class="sig-name">HR & PAYROLL OFFICER</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">2. CHECKED BY</div>
              <div class="sig-name">INTERNAL AUDITOR</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">3. APPROVED BY</div>
              <div class="sig-name">FINANCIAL CONTROLLER</div>
            </div>
            <div class="sig-box">
              <div class="sig-title">4. AUTHORIZED SIGNATORY</div>
              <div class="sig-name">COMPANY STAMP & SIGNATURE</div>
            </div>
          </div>

          <div style="margin-top: 12px; font-size: 7px; text-align: center; color: #000000; border-top: 1px solid #000000; padding-top: 4px;">
            OFFICIAL SYSTEM-GENERATED PAYROLL REPORT — AUDIT ENGINE. STRICTLY CONFIDENTIAL.
          </div>
        </body>
      </html>
    `;

    printHtml(html, `Payroll_${reportId}_${new Date().toISOString().split('T')[0]}`);
  };

  // Top Master Print Dispatcher: Routes to the appropriate custom redesigned layout
  const handlePrintFocusPayrollPdf = () => {
    const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
    if (activeReport === 'pay_slip') {
      if (selectedEmp) triggerPrintPaySlip(selectedEmp);
    } else if (activeReport === 'pay_sheet') {
      triggerPrintPaySheet();
    } else if (activeReport === 'attendance_sheet' || activeReport === 'attendance_register') {
      triggerPrintAttendanceSheet();
    } else if (activeReport === 'payment_advice') {
      triggerPrintPaymentAdvice();
    } else if (activeReport === 'no_email') {
      triggerPrintNoEmailReport();
    } else if (activeReport === 'payroll_statement') {
      triggerPrintPayrollStatement();
    } else if (activeReport === 'pay_head_employee') {
      if (selectedEmp) triggerPrintPayHeadEmployee(selectedEmp);
    } else if (activeReport === 'employee_pay_head') {
      triggerPrintEmployeePayHead(activePayHead);
    } else if (activeReport === 'gratuity') {
      triggerPrintGratuity();
    } else if (activeReport === 'sif_records') {
      triggerPrintSifRecords();
    } else if (activeReport === 'payroll_register') {
      triggerPrintPayrollRegister();
    } else if (activeReport === 'employee_profile') {
      if (selectedEmp) triggerPrintEmployeeProfile(selectedEmp);
    } else if (activeReport === 'head_count') {
      triggerPrintHeadCount();
    } else if (activeReport === 'expat_reports') {
      triggerPrintExpatReport();
    } else {
      triggerPrintGeneralReport(activeReport);
    }
  };

  const REPORTS_LIST = [
    { id: 'pay_slip', title: 'Pay Slip', number: '01', desc: 'Interactive salary slip with print integration' },
    { id: 'pay_sheet', title: 'Pay Sheet', number: '02', desc: 'Complete payroll spreadsheet with sums' },
    { id: 'attendance_sheet', title: 'Attendance Sheet', number: '03', desc: 'Real-time attendance logs & tracking' },
    { id: 'payment_advice', title: 'Payment Advice', number: '04', desc: 'Official commercial bank wire directive' },
    { id: 'no_email', title: 'Employee without email ids', number: '05', desc: 'Directly verify missing profiles & fix' },
    { id: 'payroll_statement', title: 'Payroll Statement', number: '06', desc: 'Department-wise consolidated metrics' },
    { id: 'pay_head_employee', title: 'Employee Pay head breakup', number: '07', desc: 'Itemized component values per staff' },
    { id: 'employee_pay_head', title: 'Pay head Employee breakup', number: '08', desc: 'Breakdown of custom heads across staff' },
    { id: 'gratuity', title: 'Gratuity Calculator', number: '09', desc: 'UAE Labour Law end of service accruals' },
    { id: 'sif_records', title: 'SIF Records Creator', number: '10', desc: 'Generates WPS compliant dispatch files' },
    { id: 'payroll_register', title: 'Payroll Register', number: '11', desc: 'Chronological transaction logs' },
    { id: 'attendance_register', title: 'Attendance Register', number: '12', desc: 'Interactive visual presence calendar' },
    { id: 'employee_profile', title: 'Employee Profile', number: '13', desc: 'Comprehensive staff dossier' },
    { id: 'head_count', title: 'Employee Head Count', number: '14', desc: 'Demographics, ratios & distributions' },
    { id: 'expat_reports', title: 'Expat Reports', number: '15', desc: 'Passport, Visa & Contract tracking' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 p-2 sm:p-5 select-none font-sans space-y-4">
      
      {/* OFFICIAL CORPORATE REPORT HEADER BANNER */}
      <div className="bg-white border border-slate-300 p-4 shadow-xs rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-base font-black tracking-wide text-slate-900 font-sans uppercase">{activeCompany.name}</h1>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">{activeCompany.address || 'INDUSTRIAL AREA, UAE'}{activeCompany.phone ? ` | TEL: ${activeCompany.phone}` : ''} | TRN: ${activeCompany.trn || '—'}</p>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-xs font-black text-[#002D62] uppercase tracking-wider font-mono bg-blue-50 px-2.5 py-1 border border-blue-200">
              PAYROLL & HR COMPLIANCE STATEMENT
            </span>
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-slate-600 space-y-1">
          <div className="bg-slate-100 border border-slate-300 px-3 py-1 font-bold text-slate-800 uppercase">
            PERIOD: {new Date().toISOString().split('T')[0]}
          </div>
          <div className="font-bold text-slate-700">CURRENCY: {activeCompany.currency || 'AED (DIRHAM)'}</div>
        </div>
      </div>
      
      {/* Top Banner / Payroll Controls */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-3 text-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#f37021]" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 font-sans">
            Payroll Reports
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedEmpId && employees.find(e => e.id === selectedEmpId) && (
            <button
              onClick={() => {
                const target = employees.find(e => e.id === selectedEmpId);
                if (target) openEditEmployeeModal(target);
              }}
              title="Edit Selected Employee Profile"
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5 text-[#f37021] stroke-[2.5]" />
              <span>Edit Profile</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            title="Add Staff Member"
            className="bg-[#f37021] hover:bg-orange-600 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer border-none active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Add Staff Member</span>
          </button>
          <button
            onClick={handlePrintFocusPayrollPdf}
            title="Print Payroll PDF"
            className="bg-slate-900 hover:bg-black text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-3xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-900 active:scale-95"
          >
            <Printer className="w-4 h-4 text-[#f37021] stroke-[2.5]" />
            <span>Print PDF</span>
          </button>
          <div className="bg-slate-100 px-2.5 py-1 rounded border border-slate-300 text-[10.5px] font-mono text-slate-700">
            Current Date: <span className="text-orange-600 font-bold">2026-07-21</span>
          </div>
        </div>
      </div>

      {/* Main Core Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">
        
        {/* Left Side: Professional Sidebar Directory */}
        <div className="lg:col-span-1 space-y-2 bg-white p-3 border border-slate-300 shadow-sm">
          <div className="bg-slate-800 text-white font-black text-xs uppercase tracking-widest py-1.5 px-2.5 flex items-center justify-between">
            <span className="text-[10px]">ERP Directory</span>
            <span className="text-[8px] bg-slate-700 px-1.5 py-0.5 text-slate-300 font-mono rounded">15 Modules</span>
          </div>
          
          <div className="space-y-0.5 overflow-y-auto max-h-[500px] pr-1">
            {REPORTS_LIST.map((item) => {
              const isActive = activeReport === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveReport(item.id);
                    // Default employee selector fallback
                    if (!selectedEmpId && employees.length > 0) {
                      setSelectedEmpId(employees[0].id);
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 border transition-all flex items-center justify-between cursor-pointer relative ${
                    isActive 
                      ? 'bg-slate-900 text-[#f37021] border-slate-900 font-bold shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#f37021] hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold truncate tracking-tight">{item.title}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Workspace Console */}
        <div className="lg:col-span-3 bg-white p-5 border border-slate-300 shadow-sm flex flex-col min-h-[600px]">
          
          {/* Active Title Banner */}
          <div className="border-b-2 border-slate-200 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-[#f37021] uppercase tracking-widest block">System Workspace</span>
              <h3 className="text-base font-black uppercase text-slate-900 tracking-tight flex items-center gap-1.5">
                <span className="font-mono text-slate-400">REPORT {REPORTS_LIST.find(r => r.id === activeReport)?.number} :</span>
                {REPORTS_LIST.find(r => r.id === activeReport)?.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Header selection fallback where applicable */}
              {['pay_slip', 'pay_head_employee', 'employee_profile'].includes(activeReport) && employees.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Select Employee:</span>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="p-1 px-3 bg-slate-50 border border-slate-300 font-mono font-bold uppercase text-[10.5px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021] rounded-sm"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.id} — {emp.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handlePrintFocusPayrollPdf}
                title={`Print ${REPORTS_LIST.find(r => r.id === activeReport)?.title || 'Report'} PDF`}
                className="bg-[#002D62] hover:bg-[#001d40] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-[#f37021]" />
                <span>Print {REPORTS_LIST.find(r => r.id === activeReport)?.title || 'PDF'}</span>
              </button>
            </div>
          </div>

          {/* REPORT 01: PAY SLIP */}
          {activeReport === 'pay_slip' && (() => {
            const emp = employees.find(e => e.id === selectedEmpId);
            if (!emp) return <div className="text-center text-xs text-slate-400 p-10">No employee selected.</div>;
            const { otPay, absDeductions, totalAllowances, grossEarnings, netPayout } = getPayrollDetails(emp);
            return (
              <div className="space-y-4">
                {/* Live Real-Time Adjuster & Manual Overrides */}
                <div className="bg-[#f8fafc] border border-[#cbd5e1] p-4 rounded-sm shadow-3xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e1]">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#f37021]" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#002D62]">WPS ATTENDANCE & FINANCIAL OVERRIDES: #{emp.id} - {emp.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Basic: <strong>AED {emp.basicSalary.toFixed(2)}</strong> | Hourly: <strong>AED {(emp.basicSalary / (26 * 8)).toFixed(2)}</strong>
                    </div>
                  </div>
                  
                  {/* Attendance Controls */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Days Present</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={30} 
                        value={emp.daysPresent} 
                        onChange={(e) => updateAttendance(emp.id, 'daysPresent', Math.min(30, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-white border border-[#cbd5e1] p-1.5 font-mono text-xs text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Days Absent</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={30} 
                        value={emp.daysAbsent} 
                        onChange={(e) => updateAttendance(emp.id, 'daysAbsent', Math.min(30, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-white border border-[#cbd5e1] p-1.5 font-mono text-xs text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Leaves Approved</label>
                      <input 
                        type="number" 
                        min={0} 
                        max={30} 
                        value={emp.leavesApproved} 
                        onChange={(e) => updateAttendance(emp.id, 'leavesApproved', Math.min(30, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-white border border-[#cbd5e1] p-1.5 font-mono text-xs text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Overtime Hours</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={emp.overtimeHours} 
                        onChange={(e) => updateAttendance(emp.id, 'overtimeHours', Math.max(0, Number(e.target.value)))}
                        className="w-full bg-white border border-[#cbd5e1] p-1.5 font-mono text-xs text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                      />
                    </div>
                  </div>

                  {/* Financial Overrides Row: Absentee Deduction & Overtime Payout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-dashed border-[#cbd5e1]">
                    
                    {/* Overtime Payout Override Control */}
                    <div className={`p-2.5 rounded-sm border ${emp.isManualOvertime ? 'bg-indigo-50/70 border-indigo-300' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-[#002D62] flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Overtime Payout (AED)
                        </span>
                        <label className="flex items-center gap-1 text-[9.5px] font-bold text-indigo-900 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={!!emp.isManualOvertime}
                            onChange={(e) => updateManualOvertime(emp.id, e.target.checked)}
                            className="accent-indigo-600 cursor-pointer"
                          />
                          Manual Amount
                        </label>
                      </div>

                      {emp.isManualOvertime ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500">AED</span>
                            <input 
                              type="number"
                              step="0.01"
                              min={0}
                              value={emp.customOvertimePayout !== undefined ? emp.customOvertimePayout : otPay}
                              onChange={(e) => updateManualOvertime(emp.id, true, Number(e.target.value))}
                              placeholder="Enter custom overtime payout..."
                              className="w-full bg-white border border-indigo-400 p-1 font-mono text-xs font-bold text-indigo-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateManualOvertime(emp.id, false)}
                              title="Reset to calculated formula"
                              className="text-[9px] text-slate-600 hover:text-indigo-800 underline bg-transparent border-none cursor-pointer whitespace-nowrap"
                            >
                              Auto
                            </button>
                          </div>
                          <div className="text-[8.5px] text-indigo-700 font-mono">
                            Auto Formula: {(emp.overtimeHours * (emp.basicSalary / (26 * 8)) * 1.25).toFixed(2)} AED ({emp.overtimeHours} hrs @ 1.25x)
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs font-mono pt-1">
                          <span className="text-slate-500 font-sans text-[10px]">Calculated (x1.25):</span>
                          <span className="font-extrabold text-indigo-700">AED {otPay.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Absentee Deductions Override Control */}
                    <div className={`p-2.5 rounded-sm border ${emp.isManualAbsentDeduction ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-rose-900 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Absentee Deduction (AED)
                        </span>
                        <label className="flex items-center gap-1 text-[9.5px] font-bold text-rose-900 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={!!emp.isManualAbsentDeduction}
                            onChange={(e) => updateManualAbsentDeduction(emp.id, e.target.checked)}
                            className="accent-rose-600 cursor-pointer"
                          />
                          Manual Amount
                        </label>
                      </div>

                      {emp.isManualAbsentDeduction ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500">AED</span>
                            <input 
                              type="number"
                              step="0.01"
                              min={0}
                              value={emp.customAbsentDeduction !== undefined ? emp.customAbsentDeduction : absDeductions}
                              onChange={(e) => updateManualAbsentDeduction(emp.id, true, Number(e.target.value))}
                              placeholder="Enter custom deduction amount..."
                              className="w-full bg-white border border-rose-400 p-1 font-mono text-xs font-bold text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-600"
                            />
                            <button
                              type="button"
                              onClick={() => updateManualAbsentDeduction(emp.id, false)}
                              title="Reset to calculated formula"
                              className="text-[9px] text-slate-600 hover:text-rose-800 underline bg-transparent border-none cursor-pointer whitespace-nowrap"
                            >
                              Auto
                            </button>
                          </div>
                          <div className="text-[8.5px] text-rose-700 font-mono">
                            Auto Formula: {(emp.daysAbsent * (emp.basicSalary / 26)).toFixed(2)} AED ({emp.daysAbsent} days @ basic/26)
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs font-mono pt-1">
                          <span className="text-slate-500 font-sans text-[10px]">Calculated (Basic/26):</span>
                          <span className="font-extrabold text-rose-600">AED -{absDeductions.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Payslip Document Render */}
                <div className="border-2 border-slate-900 p-6 bg-white rounded-sm shadow-3xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16 pointer-events-none border-b border-l border-slate-200"></div>
                  
                  <div className="border-b-2 border-[#cbd5e1] pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative z-10">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#002D62] tracking-tight">{activeCompany.name}</h4>
                      <p className="text-[8.5px] text-slate-500 font-semibold">{activeCompany.address || 'INDUSTRIAL AREA, UAE'} | REGISTERED TRN: {activeCompany.trn || '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openEditEmployeeModal(emp)}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                        title="Edit Full Employee Profile"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#f37021]" />
                        <span>Edit Full Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!isEditingStaff) {
                            setInlineDept(emp.department);
                            setInlineBank(emp.bankName);
                            setInlineAccount(emp.bankAccountNo);
                            setInlineIsNoIban(emp.bankAccountNo.includes('CASH') || emp.bankAccountNo.includes('NO IBAN') || !emp.bankAccountNo);
                            setInlineIsAddingDept(false);
                            setInlineNewDept('');
                          }
                          setIsEditingStaff(!isEditingStaff);
                        }}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm flex items-center gap-1.5 cursor-pointer border shadow-xs transition-all ${
                          isEditingStaff
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#002D62]" />
                        {isEditingStaff ? 'Close Edit' : 'Edit Dept / Bank / IBAN'}
                      </button>
                      <button
                        onClick={() => triggerPrintPaySlip(emp)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm flex items-center gap-1.5 cursor-pointer border-none shadow-xs transition-all"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#f37021]" /> Print Slip
                      </button>
                    </div>
                  </div>

                  {/* INLINE EDIT FORM FOR DEPARTMENT / BANK / NO IBAN */}
                  {isEditingStaff && (
                    <div className="mb-4 p-4 bg-amber-50/70 border-2 border-amber-300 rounded-sm text-xs space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <span className="font-extrabold text-[#002D62] text-[11px] uppercase flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-[#f37021]" /> Edit Staff Placement & Payment Coordinates: #{emp.id} - {emp.name}
                        </span>
                        <button
                          onClick={() => setIsEditingStaff(false)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer border-none bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                        {/* Department Selection */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-700 uppercase">Department</label>
                            <button
                              type="button"
                              onClick={() => setInlineIsAddingDept(!inlineIsAddingDept)}
                              className="text-[9px] text-[#002D62] hover:text-[#f37021] font-bold underline cursor-pointer bg-transparent border-none"
                            >
                              {inlineIsAddingDept ? 'Choose from list' : '+ Add New Department'}
                            </button>
                          </div>

                          {inlineIsAddingDept ? (
                            <input
                              type="text"
                              placeholder="ENTER NEW DEPARTMENT NAME..."
                              value={inlineNewDept}
                              onChange={(e) => setInlineNewDept(e.target.value.toUpperCase())}
                              className="w-full bg-white border border-amber-400 p-1.5 text-xs text-slate-900 font-bold uppercase rounded-sm"
                            />
                          ) : (
                            <select
                              value={inlineDept}
                              onChange={(e) => {
                                if (e.target.value === '__NEW__') {
                                  setInlineIsAddingDept(true);
                                } else {
                                  setInlineDept(e.target.value);
                                }
                              }}
                              className="w-full bg-white border border-slate-300 p-1.5 text-xs text-slate-900 font-bold rounded-sm uppercase"
                            >
                              {departments.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                              <option value="__NEW__">+ ADD NEW DEPARTMENT...</option>
                            </select>
                          )}
                        </div>

                        {/* Bank / Payment Method Selection */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold text-slate-700 uppercase">Bank / Payment Channel</label>
                          <select
                            value={inlineBank}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInlineBank(val);
                              if (val.includes('CASH')) {
                                setInlineIsNoIban(true);
                                setInlineAccount('CASH / NO IBAN');
                              } else if (val.includes('EXCHANGE')) {
                                setInlineIsNoIban(true);
                                setInlineAccount('WPS C3 CARD (NO IBAN)');
                              }
                            }}
                            className="w-full bg-white border border-slate-300 p-1.5 text-xs text-slate-900 font-bold rounded-sm uppercase"
                          >
                            <option value="RAKBANK">RAKBANK</option>
                            <option value="EMIRATES NBD">EMIRATES NBD</option>
                            <option value="ADCB">ADCB</option>
                            <option value="MASHREQ BANK">MASHREQ BANK</option>
                            <option value="HSBC">HSBC</option>
                            <option value="DUBAI ISLAMIC BANK (DIB)">DUBAI ISLAMIC BANK (DIB)</option>
                            <option value="FIRST ABU DHABI BANK (FAB)">FIRST ABU DHABI BANK (FAB)</option>
                            <option value="AL ANSARI EXCHANGE (WPS C3 CARD)">AL ANSARI EXCHANGE (WPS C3 CARD)</option>
                            <option value="LULU EXCHANGE (PAYROLL CARD)">LULU EXCHANGE (PAYROLL CARD)</option>
                            <option value="AL ROSTAMANI EXCHANGE">AL ROSTAMANI EXCHANGE</option>
                            <option value="CASH IN HAND (NO IBAN)">CASH IN HAND (NO IBAN / DIRECT PAYMENT)</option>
                            <option value="CHEQUE PAYMENT">CHEQUE PAYMENT</option>
                            <option value="OTHER PAYMENT METHOD">OTHER PAYMENT METHOD</option>
                          </select>
                        </div>

                        {/* IBAN / Cash Setting */}
                        <div className="sm:col-span-2 space-y-1 bg-white p-2.5 border border-slate-200 rounded-sm">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-700 uppercase">Account / IBAN Coordinate</label>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold text-amber-800">
                              <input
                                type="checkbox"
                                checked={inlineIsNoIban || inlineBank.includes('CASH')}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setInlineIsNoIban(checked);
                                  if (checked) {
                                    setInlineAccount(inlineBank.includes('EXCHANGE') ? 'WPS C3 CARD (NO IBAN)' : 'CASH / NO IBAN');
                                  } else {
                                    setInlineAccount('');
                                  }
                                }}
                                className="accent-[#f37021]"
                              />
                              Worker has NO IBAN (Paid in Cash / WPS Card / Unbanked)
                            </label>
                          </div>

                          <input
                            type="text"
                            placeholder={inlineIsNoIban ? 'CASH / NO IBAN' : 'e.g. AE620240000000000000000'}
                            value={inlineAccount}
                            disabled={inlineIsNoIban}
                            onChange={(e) => setInlineAccount(e.target.value.toUpperCase())}
                            className={`w-full p-1.5 text-xs font-mono font-bold rounded-sm border ${
                              inlineIsNoIban 
                                ? 'bg-amber-50 text-amber-900 border-amber-300 cursor-not-allowed' 
                                : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingStaff(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold uppercase rounded-sm cursor-pointer border-none"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStaffProfile(emp.id)}
                          className="px-4 py-1.5 bg-[#002D62] hover:bg-[#f37021] hover:text-slate-950 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-sm cursor-pointer border-none flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Save Changes to Profile
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs border-b border-slate-200 pb-4 mb-4 font-sans text-slate-700">
                    <div>Employee ID: <strong className="text-slate-900 font-mono">#{emp.id}</strong></div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Department:</span>
                      <strong className="text-[#002D62] uppercase font-extrabold bg-blue-50 px-2 py-0.5 border border-blue-200 rounded text-[11px]">
                        {emp.department}
                      </strong>
                    </div>
                    <div>Employee Name: <strong className="text-slate-900 uppercase font-bold">{emp.name}</strong></div>
                    <div>Designation: <strong className="text-slate-900 uppercase">{emp.designation}</strong></div>
                    <div className="flex items-center gap-1.5">
                      <span>Bank:</span>
                      <strong className="text-slate-900 uppercase font-bold">{emp.bankName}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>IBAN / Account:</span>
                      {(!emp.bankAccountNo || emp.bankAccountNo.includes('CASH') || emp.bankAccountNo.includes('NO IBAN') || emp.bankName.includes('CASH')) ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight">
                          <Banknote className="w-3.5 h-3.5 text-amber-700" />
                          {emp.bankAccountNo || 'CASH IN HAND (NO IBAN)'}
                        </span>
                      ) : emp.bankAccountNo.includes('CARD') || emp.bankName.includes('EXCHANGE') ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-[#002D62] border border-blue-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight">
                          <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                          {emp.bankAccountNo}
                        </span>
                      ) : (
                        <strong className="text-slate-900 font-mono select-all text-[11px] bg-slate-100 px-2 py-0.5 border border-slate-200 rounded">
                          {emp.bankAccountNo}
                        </strong>
                      )}
                    </div>
                    <div>Present Period: <strong className="text-slate-900 font-mono">{emp.daysPresent} Days</strong></div>
                    <div>Overtime Log: <strong className="text-slate-900 font-mono">{emp.overtimeHours} Hours</strong></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    <div className="border border-[#cbd5e1] bg-[#f8fafc] p-3 rounded-sm">
                      <span className="block border-b border-[#cbd5e1] font-extrabold text-[#002D62] pb-1.5 mb-2.5 text-[10px] uppercase tracking-wider">A. Contractual Wages & Additions</span>
                      <div className="space-y-1.5 text-xs font-medium">
                        <div className="flex justify-between text-slate-600"><span>Basic Wages:</span><span className="font-mono font-bold text-slate-900">AED {emp.basicSalary.toFixed(2)}</span></div>
                        <div className="flex justify-between text-slate-600"><span>Housing Allowance:</span><span className="font-mono font-bold text-slate-900">AED {emp.housingAllowance.toFixed(2)}</span></div>
                        <div className="flex justify-between text-slate-600"><span>Transport Allowance:</span><span className="font-mono font-bold text-slate-900">AED {emp.transportAllowance.toFixed(2)}</span></div>
                        <div className="flex justify-between text-slate-600"><span>Other Allowance:</span><span className="font-mono font-bold text-slate-900">AED {emp.otherAllowances.toFixed(2)}</span></div>
                        <div className="flex justify-between text-slate-600 items-center">
                          <span className="flex items-center gap-1">
                            Overtime Payout:
                            {emp.isManualOvertime && (
                              <span className="text-[8px] bg-indigo-100 text-indigo-800 font-bold px-1 rounded">MANUAL</span>
                            )}
                          </span>
                          <span className="font-mono font-bold text-indigo-700">AED {otPay.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-[#cbd5e1] pt-1.5 mt-2 flex justify-between font-extrabold text-slate-900 text-[11px]">
                          <span>Gross Earnings:</span><span className="font-mono">AED {grossEarnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-[#cbd5e1] bg-[#f8fafc] p-3 rounded-sm">
                      <span className="block border-b border-[#cbd5e1] font-extrabold text-rose-800 pb-1.5 mb-2.5 text-[10px] uppercase tracking-wider">B. Deductions & Attendance Offs</span>
                      <div className="space-y-1.5 text-xs font-medium">
                        <div className="flex justify-between text-slate-600 items-center">
                          <span className="flex items-center gap-1">
                            Absentee Deductions:
                            {emp.isManualAbsentDeduction && (
                              <span className="text-[8px] bg-rose-100 text-rose-800 font-bold px-1 rounded">MANUAL</span>
                            )}
                          </span>
                          <span className="font-mono font-bold text-rose-600">AED -{absDeductions.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600"><span>Pension Accrual:</span><span className="font-mono font-bold text-slate-900">AED 0.00</span></div>
                        <div className="flex justify-between text-slate-600"><span>Company Loan Inst:</span><span className="font-mono font-bold text-slate-900">AED 0.00</span></div>
                        <div className="flex justify-between text-slate-600"><span>Social Security:</span><span className="font-mono font-bold text-slate-900">AED 0.00</span></div>
                        <div className="flex justify-between text-slate-600"><span>Approved Leaves:</span><span className="font-bold text-emerald-700">{emp.leavesApproved} Days OK</span></div>
                        <div className="border-t border-[#cbd5e1] pt-1.5 mt-2 flex justify-between font-extrabold text-rose-700 text-[11px]">
                          <span>Total Deductions:</span><span className="font-mono">AED -{absDeductions.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 bg-slate-900 text-white p-3.5 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-2 border-b-4 border-[#f37021]">
                    <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">Net Amount Deposited via WPS Portal Credit:</span>
                    <span className="text-lg font-black font-mono text-[#f37021]">AED {netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* REPORT 02: PAY SHEET */}
          {activeReport === 'pay_sheet' && (() => {
            let grandBasic = 0;
            let grandAllow = 0;
            let grandOT = 0;
            let grandDed = 0;
            let grandNet = 0;

            return (
              <div className="space-y-6">
                {departments.map(dept => {
                  const deptStaff = employees.filter(e => e.department === dept);
                  if (deptStaff.length === 0) return null;

                  let deptBasic = 0;
                  let deptAllow = 0;
                  let deptOT = 0;
                  let deptDed = 0;
                  let deptNet = 0;

                  deptStaff.forEach(emp => {
                    const { otPay, absDeductions, totalAllowances, netPayout } = getPayrollDetails(emp);
                    deptBasic += emp.basicSalary;
                    deptAllow += totalAllowances;
                    deptOT += otPay;
                    deptDed += absDeductions;
                    deptNet += netPayout;
                  });

                  grandBasic += deptBasic;
                  grandAllow += deptAllow;
                  grandOT += deptOT;
                  grandDed += deptDed;
                  grandNet += deptNet;

                  return (
                    <div key={dept} className="space-y-0.5">
                      <ReportSectionHeader 
                        title={dept} 
                        countLabel={`${deptStaff.length} staff members`}
                        metrics={[
                          { label: 'Total Basic', value: `AED ${deptBasic.toLocaleString()}` },
                          { label: 'Total Net Payout', value: `AED ${deptNet.toLocaleString()}`, isGreen: true }
                        ]}
                      />
                      <div className="overflow-x-auto border-l border-r border-b border-[#cbd5e1] bg-white">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">ID</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee Name</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Designation</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Basic Wages</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Allowances</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Overtime</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Deductions</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Net Payout</th>
                              <th className="p-2 font-extrabold text-slate-700 uppercase text-center w-14">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {deptStaff.map(emp => {
                              const { otPay, absDeductions, totalAllowances, netPayout } = getPayrollDetails(emp);
                              return (
                                <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                                  <td className="p-2 border-r border-[#cbd5e1] font-mono font-bold text-slate-400">#{emp.id}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">
                                    <div className="flex items-center justify-between gap-1">
                                      <span>{emp.name}</span>
                                    </div>
                                  </td>
                                  <td className="p-2 border-r border-[#cbd5e1] uppercase font-medium text-slate-500 text-[10px]">{emp.designation}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-medium">AED {emp.basicSalary.toLocaleString()}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-medium">AED {totalAllowances.toLocaleString()}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-bold text-indigo-700">AED {otPay.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-bold text-rose-600">AED {absDeductions.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-black text-emerald-800">AED {netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                  <td className="p-2 text-center">
                                    <button
                                      onClick={() => openEditEmployeeModal(emp)}
                                      title="Edit Employee Profile"
                                      className="p-1 hover:bg-orange-50 text-slate-500 hover:text-[#f37021] rounded border border-transparent hover:border-orange-200 cursor-pointer inline-flex items-center justify-center"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Departmental Subtotals */}
                            <tr className="bg-[#f8fafc]/80 font-bold text-slate-900 border-t border-[#cbd5e1]">
                              <td colSpan={3} className="p-2 border-r border-[#cbd5e1] text-right text-[10px] uppercase text-[#002D62] tracking-wider">SUB-TOTAL OF {dept}:</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-extrabold">AED {deptBasic.toLocaleString()}</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-extrabold">AED {deptAllow.toLocaleString()}</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-extrabold text-indigo-800">AED {deptOT.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-extrabold text-rose-800">AED {deptDed.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-black text-emerald-900">AED {deptNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              <td className="p-2 bg-[#f8fafc]/80"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Total Registered Staff', value: `${employees.length} EMPLOYEES`, isOrange: true },
                    { label: 'Consolidated Basic Payroll', value: `AED ${grandBasic.toLocaleString()}` },
                    { label: 'Total Allowances Paid', value: `AED ${grandAllow.toLocaleString()}` },
                    { label: 'WPS Net Settled Run', value: `AED ${grandNet.toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 03: ATTENDANCE SHEET */}
          {activeReport === 'attendance_sheet' && (() => {
            let totalPresentAll = 0;
            let totalAbsentAll = 0;
            let totalLeavesAll = 0;
            let totalOTAll = 0;

            return (
              <div className="space-y-6">
                {departments.map(dept => {
                  const deptStaff = employees.filter(e => e.department === dept);
                  if (deptStaff.length === 0) return null;

                  let deptPresent = 0;
                  let deptAbsent = 0;
                  let deptLeaves = 0;
                  let deptOT = 0;

                  deptStaff.forEach(emp => {
                    deptPresent += emp.daysPresent;
                    deptAbsent += emp.daysAbsent;
                    deptLeaves += emp.leavesApproved;
                    deptOT += emp.overtimeHours;
                  });

                  totalPresentAll += deptPresent;
                  totalAbsentAll += deptAbsent;
                  totalLeavesAll += deptLeaves;
                  totalOTAll += deptOT;

                  const deptAvgAttendance = deptStaff.length > 0 
                    ? ((deptPresent + deptLeaves) / (deptStaff.length * 30)) * 100 
                    : 0;

                  return (
                    <div key={dept} className="space-y-0.5">
                      <ReportSectionHeader 
                        title={dept} 
                        countLabel={`${deptStaff.length} staff members`}
                        metrics={[
                          { label: 'Avg Presence', value: `${deptAvgAttendance.toFixed(0)}%`, isOrange: deptAvgAttendance < 90 },
                          { label: 'OT Logged', value: `${deptOT} Hours`, isGreen: true }
                        ]}
                      />
                      <div className="overflow-x-auto border-l border-r border-b border-[#cbd5e1] bg-white">
                        <table className="w-full text-left font-sans text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">ID</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee Name</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Days Present</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Days Absent</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Approved Leaves</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Overtime Hours</th>
                              <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Duty Ratio</th>
                              <th className="p-2 font-extrabold text-slate-700 uppercase text-right">Registry Adjust</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {deptStaff.map(emp => {
                              const attendancePercent = ((emp.daysPresent + emp.leavesApproved) / 30) * 100;
                              return (
                                <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                                  <td className="p-2 border-r border-[#cbd5e1] font-mono font-bold text-slate-400">#{emp.id}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">{emp.name}</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-bold text-emerald-700">{emp.daysPresent} d</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-bold text-rose-600">{emp.daysAbsent} d</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-center font-mono text-slate-500">{emp.leavesApproved} d</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-bold text-indigo-700">{emp.overtimeHours} hrs</td>
                                  <td className="p-2 border-r border-[#cbd5e1] text-center">
                                    <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-xs border ${attendancePercent >= 90 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                                      {attendancePercent.toFixed(0)}%
                                    </span>
                                  </td>
                                  <td className="p-2 text-right">
                                    <div className="inline-flex gap-1">
                                      <button 
                                        onClick={() => {
                                          if (emp.daysPresent > 0) {
                                            updateAttendance(emp.id, 'daysPresent', emp.daysPresent - 1);
                                            updateAttendance(emp.id, 'daysAbsent', emp.daysAbsent + 1);
                                          }
                                        }}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-xs cursor-pointer transition-all"
                                      >
                                        + Absent
                                      </button>
                                      <button 
                                        onClick={() => {
                                          if (emp.daysAbsent > 0) {
                                            updateAttendance(emp.id, 'daysPresent', emp.daysPresent + 1);
                                            updateAttendance(emp.id, 'daysAbsent', emp.daysAbsent - 1);
                                          }
                                        }}
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-xs cursor-pointer transition-all"
                                      >
                                        + Present
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {/* Departmental Subtotals */}
                            <tr className="bg-[#f8fafc]/80 font-bold text-slate-900 border-t border-[#cbd5e1]">
                              <td colSpan={2} className="p-2 border-r border-[#cbd5e1] text-right text-[10px] uppercase text-[#002D62] tracking-wider">SUB-TOTAL OF {dept}:</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-extrabold text-emerald-800">{deptPresent} Days</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-extrabold text-rose-800">{deptAbsent} Days</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-semibold text-slate-600">{deptLeaves} Days</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-extrabold text-indigo-800">{deptOT} Hours</td>
                              <td className="p-2 border-r border-[#cbd5e1] text-center font-mono font-extrabold">{deptAvgAttendance.toFixed(0)}%</td>
                              <td className="p-2"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Workforce Roster', value: `${employees.length} STAFF`, isOrange: true },
                    { label: 'Consolidated Present Duty', value: `${totalPresentAll} Man-Days` },
                    { label: 'Statutory Approved Leaves', value: `${totalLeavesAll} Man-Days` },
                    { label: 'Overtime Hours Settling', value: `${totalOTAll} Hours`, isGreen: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 04: PAYMENT ADVICE */}
          {activeReport === 'payment_advice' && (() => {
            const banks = Array.from(new Set(employees.map(e => e.bankName)));
            let grandAdviceTotal = 0;

            return (
              <div className="space-y-6">
                <div className="bg-[#f0f4f8] border border-[#cbd5e1] p-4 font-sans text-xs space-y-3 shadow-3xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rotate-45 translate-x-12 -translate-y-12 pointer-events-none"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between border-b border-[#cbd5e1] pb-2.5">
                    <div>
                      <h5 className="font-extrabold text-sm text-[#002D62] uppercase tracking-tight">ESCROW BANK WIRE DISPATCH DIRECTIVE</h5>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">{activeCompany.name} — DEBIT PORTAL</p>
                    </div>
                    <div className="text-right sm:text-right mt-1 sm:mt-0 font-mono">
                      <p className="text-[10px] text-slate-600">Execution Date: <strong>2026-07-21</strong></p>
                      <p className="text-[10px] text-slate-600">Status: <span className="text-emerald-700 font-extrabold">READY TO TRANSMIT</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <p className="text-slate-500 uppercase text-[9px] font-bold">Originator Bank / Debit Key</p>
                      <p className="font-bold text-slate-800">{activeCompany.bankName || 'RAKBANK UAE'}</p>
                      <p className="text-slate-500 font-mono">Escrow Acc: <span className="text-slate-700 select-all font-bold">{activeCompany.bankAccountNo || activeCompany.bankIban || 'AE-084-21004-05-1'}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 uppercase text-[9px] font-bold">WPS System Batch Value</p>
                      <p className="text-base font-black text-[#f37021] font-mono">
                        AED {employees.reduce((sum, e) => sum + getPayrollDetails(e).netPayout, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </p>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase">Total Headcount: {employees.length} Staff members</p>
                    </div>
                  </div>

                  <div className="border-t border-[#cbd5e1] pt-3 flex justify-between items-center gap-4">
                    <span className="text-[10px] text-slate-500 font-semibold">★ Secure Gateway WPS-12 SHA256 Signature Approved</span>
                    <button 
                      onClick={() => alert('WPS Bank Payment Advice file downloaded and submitted to RAKBANK API.')}
                      className="bg-[#f37021] hover:bg-orange-600 text-slate-950 px-4 py-1.5 text-xs font-bold uppercase rounded-sm border-none cursor-pointer flex items-center gap-1.5 shadow-3xs transition-all font-sans"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-950 stroke-[3]" /> Export Dispatch Advice
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(banks as string[]).map(bank => {
                    const bankStaff = employees.filter(e => e.bankName === bank);
                    if (bankStaff.length === 0) return null;

                    let bankTotal = 0;
                    bankStaff.forEach(e => {
                      bankTotal += getPayrollDetails(e).netPayout;
                    });
                    grandAdviceTotal += bankTotal;

                    return (
                      <div key={bank} className="space-y-0.5">
                        <ReportSectionHeader 
                          title={bank} 
                          countLabel={`${bankStaff.length} wire transfers`}
                          metrics={[
                            { label: 'Bank Total Run', value: `AED ${bankTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                          ]}
                        />
                        <div className="overflow-x-auto border-l border-r border-b border-[#cbd5e1] bg-white">
                          <table className="w-full text-left font-sans text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Staff ID</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Beneficiary Name</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Clearing Department</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">IBAN / Account Number</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">WPS Status</th>
                                <th className="p-2 font-extrabold text-slate-700 uppercase text-right">Transfer Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {bankStaff.map(emp => {
                                const { netPayout } = getPayrollDetails(emp);
                                return (
                                  <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                                    <td className="p-2 border-r border-[#cbd5e1] font-mono font-bold text-slate-400">#{emp.id}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">{emp.name}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] uppercase font-medium text-slate-500 text-[10px]">{emp.department}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] font-mono text-[10.5px] select-all text-slate-600 font-bold">{emp.bankAccountNo}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] text-center">
                                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-xs uppercase">ACTIVE_EDR</span>
                                    </td>
                                    <td className="p-2 text-right font-mono font-black text-emerald-800">AED {netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                  </tr>
                                );
                              })}
                              {/* Bank Subtotal */}
                              <tr className="bg-[#f8fafc]/80 font-bold text-slate-900 border-t border-[#cbd5e1]">
                                <td colSpan={5} className="p-2 border-r border-[#cbd5e1] text-right text-[10px] uppercase text-[#002D62] tracking-wider">SUB-TOTAL TRANSFER ROUTED TO {bank}:</td>
                                <td className="p-2 text-right font-mono font-black text-emerald-900">AED {bankTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Clearing Destinations', value: `${banks.length} CENTRAL BANKS`, isOrange: true },
                    { label: 'Total Transfer Advices', value: `${employees.length} Records` },
                    { label: 'MoHRE Escrow Bulk Settlement', value: `AED ${grandAdviceTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 05: EMPLOYEES WITHOUT EMAIL IDS */}
          {activeReport === 'no_email' && (() => {
            const missing = employees.filter(e => !e.email || e.email.trim() === '');
            return (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-slate-700 leading-relaxed rounded-sm">
                  <span className="font-extrabold uppercase text-[#002D62] flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    MoHRE Payslip Compliance Registry
                  </span>
                  To ensure statutory compliance under UAE MoHRE SIF 1.2 regulations, employees must receive automated, encrypted PDF copies of their monthly payslips upon WPS portal settlement. Please correct missing corporate directories below.
                </div>

                <ReportSectionHeader 
                  title="Compliance Exception Directory" 
                  countLabel={`${missing.length} records require attention`}
                  metrics={[
                    { label: 'Total Workforce', value: `${employees.length} Staff` },
                    { label: 'Unassigned Accounts', value: `${missing.length} Profiles`, isOrange: missing.length > 0 }
                  ]}
                />

                {missing.length === 0 ? (
                  <div className="border border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 p-12 rounded-sm text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                    <h5 className="font-black uppercase text-sm tracking-tight">100% Perfect Compliance Record</h5>
                    <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">All active employees have a registered corporate email ID configured. No missing records found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border-l border-r border-b border-[#cbd5e1] bg-white">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                          <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">ID</th>
                          <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee Name</th>
                          <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Department Location</th>
                          <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Assign Registered Corporate Email Address</th>
                          <th className="p-2.5 font-extrabold text-slate-700 uppercase text-right">Registry Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {missing.map(emp => (
                          <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                            <td className="p-2.5 border-r border-[#cbd5e1] font-mono font-bold text-slate-400">#{emp.id}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">{emp.name}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] uppercase font-medium text-slate-500 text-[10px]">{emp.department}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1]">
                              <input 
                                type="email" 
                                placeholder="e.g. name@marinefasteners.ae" 
                                value={emailInputs[emp.id] || ''}
                                onChange={(e) => setEmailInputs({ ...emailInputs, [emp.id]: e.target.value })}
                                className="p-1 px-2 border border-slate-300 w-full font-mono text-xs focus:outline-none focus:border-[#f37021] bg-white rounded-xs"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => handleSaveEmail(emp.id)}
                                className="bg-[#002D62] hover:bg-slate-800 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xs uppercase tracking-wide cursor-pointer border-none shadow-3xs transition-all"
                              >
                                Save Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* REPORT 06: PAYROLL STATEMENT */}
          {activeReport === 'payroll_statement' && (() => {
            let totalBasicWages = 0;
            let totalNetWages = 0;
            let totalDeductions = 0;

            return (
              <div className="space-y-6">
                <ReportSectionHeader 
                  title="Departmental Payroll Allocations" 
                  countLabel={`${departments.length} cost divisions`}
                  metrics={[
                    { label: 'Workforce Strength', value: `${employees.length} Staff` }
                  ]}
                />

                <div className="overflow-x-auto border border-[#cbd5e1] bg-white">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Division Name</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Headcount</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Total Basic Salary</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Total Allowances</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Absent Deductions</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Overtime Settlement</th>
                        <th className="p-2.5 font-extrabold text-slate-700 uppercase text-right">Consolidated Net Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {departments.map(dept => {
                        const staff = employees.filter(e => e.department === dept);
                        if (staff.length === 0) return null;

                        let basicSum = 0;
                        let allowSum = 0;
                        let dedSum = 0;
                        let otSum = 0;
                        let netSum = 0;

                        staff.forEach(e => {
                          const det = getPayrollDetails(e);
                          basicSum += e.basicSalary;
                          allowSum += (e.housingAllowance + e.transportAllowance + e.otherAllowances);
                          dedSum += det.absDeductions;
                          otSum += det.otPay;
                          netSum += det.netPayout;
                        });

                        totalBasicWages += basicSum;
                        totalNetWages += netSum;
                        totalDeductions += dedSum;

                        return (
                          <tr key={dept} className="hover:bg-slate-50 text-[11px] text-slate-800">
                            <td className="p-2.5 border-r border-[#cbd5e1] font-bold text-slate-950 uppercase tracking-tight">{dept}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] text-center font-bold font-mono text-slate-600">{staff.length} Active</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] text-right font-mono text-slate-800">AED {basicSum.toLocaleString()}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] text-right font-mono text-slate-800">AED {allowSum.toLocaleString()}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] text-right font-mono text-rose-600">-AED {dedSum.toLocaleString()}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] text-right font-mono text-emerald-700">+AED {otSum.toLocaleString()}</td>
                            <td className="p-2.5 text-right font-mono font-black text-[#002D62]">AED {netSum.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Consolidated Basic Pay', value: `AED ${totalBasicWages.toLocaleString()}` },
                    { label: 'Consolidated Deductions', value: `AED ${totalDeductions.toLocaleString()}`, isOrange: totalDeductions > 0 },
                    { label: 'Active Monthly WPS Volume', value: `AED ${totalNetWages.toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 07: EMPLOYEE PAY HEAD BREAKUP */}
          {activeReport === 'pay_head_employee' && (() => {
            const emp = employees.find(e => e.id === selectedEmpId);
            if (!emp) return <div className="text-center text-xs text-slate-400 p-8">No employee registered.</div>;
            const { otPay, absDeductions, netPayout } = getPayrollDetails(emp);
            
            const breakup = [
              { name: 'Basic Wages', value: emp.basicSalary, desc: 'Core monthly contractual base pay', color: 'bg-[#002D62]' },
              { name: 'Housing Allowance', value: emp.housingAllowance, desc: 'Fixed monthly housing allowance', color: 'bg-indigo-600' },
              { name: 'Transport Allowance', value: emp.transportAllowance, desc: 'Fixed transport and commute allowance', color: 'bg-emerald-600' },
              { name: 'Other Allowances', value: emp.otherAllowances, desc: 'Medical, phone, and utility allocations', color: 'bg-sky-600' },
              { name: 'Overtime Earnings', value: otPay, desc: 'Overtime wages calculated at 1.25x hourly rate', color: 'bg-amber-600' },
              { name: 'Absentee Deductions', value: absDeductions, desc: 'Unexcused leave deductions (Basic / 26 per day)', color: 'bg-rose-600', isDeduct: true }
            ];

            return (
              <div className="space-y-6">
                <ReportSectionHeader 
                  title={`${emp.name}`} 
                  countLabel={`ID: ${emp.id}`}
                  metrics={[
                    { label: 'Contract Type', value: emp.contractType },
                    { label: 'Net Payable', value: `AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                  ]}
                />

                <div className="overflow-x-auto border border-[#cbd5e1] bg-white">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                        <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Pay Head Element</th>
                        <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Classification & Purpose</th>
                        <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Relative Weight (%)</th>
                        <th className="p-3 font-extrabold text-slate-700 uppercase text-right">Computed Allocation Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {breakup.map((item, idx) => {
                        const rawPct = (item.value / netPayout) * 100;
                        const formattedPct = isNaN(rawPct) ? '0' : rawPct.toFixed(1);
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-50 text-[11px] text-slate-800">
                            <td className="p-3 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">{item.name}</td>
                            <td className="p-3 border-r border-[#cbd5e1]">
                              <p className="font-semibold text-slate-700">{item.desc}</p>
                              <p className="text-[9px] text-slate-400 font-mono">WPS ELEMENT CODE: {item.name.substring(0, 3).toUpperCase()}_RUN</p>
                            </td>
                            <td className="p-3 border-r border-[#cbd5e1] align-middle">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                                  <div className={`h-full ${item.color}`} style={{ width: `${Math.min(100, Math.max(0, rawPct))}%` }}></div>
                                </div>
                                <span className="font-mono text-[10px] font-bold text-slate-600">{formattedPct}%</span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              <span className={item.isDeduct ? 'text-rose-600 font-extrabold' : ''}>
                                {item.isDeduct ? '-' : ''}AED {item.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Basic Contribution Rate', value: `${((emp.basicSalary / netPayout) * 100).toFixed(0)}% Weight` },
                    { label: 'Gross Allowance Rate', value: `${(((emp.housingAllowance + emp.transportAllowance + emp.otherAllowances) / netPayout) * 100).toFixed(0)}% Weight` },
                    { label: 'Calculated Net Pay', value: `AED ${netPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 08: PAY HEAD EMPLOYEE BREAKUP */}
          {activeReport === 'employee_pay_head' && (() => {
            const labelMap: Record<string, string> = {
              basicSalary: 'Basic Wages',
              housingAllowance: 'Housing Allowance',
              transportAllowance: 'Transport Allowance',
              otherAllowances: 'Other Allowances'
            };

            const selectedLabel = labelMap[activePayHead] || activePayHead;
            let grandElementTotal = 0;

            return (
              <div className="space-y-6">
                <div className="bg-[#f8fafc] border border-[#cbd5e1] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-black text-[#f37021] uppercase tracking-widest block">Comparative Element Drilldown</span>
                    <strong className="uppercase text-slate-900">Active Element Segment: {selectedLabel}</strong>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['basicSalary', 'housingAllowance', 'transportAllowance', 'otherAllowances'].map((head) => (
                      <button
                        key={head}
                        onClick={() => setActivePayHead(head)}
                        className={`px-3 py-1.5 font-bold text-[10px] uppercase cursor-pointer rounded-xs border transition-all ${
                          activePayHead === head 
                            ? 'bg-slate-900 text-[#f37021] border-slate-900 font-extrabold shadow-sm' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#f37021] hover:bg-slate-50'
                        }`}
                      >
                        {head.replace('Allowance', '').replace('basicSalary', 'Basic Pay')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {departments.map(dept => {
                    const deptStaff = employees.filter(e => e.department === dept);
                    if (deptStaff.length === 0) return null;

                    let deptElementSum = 0;
                    deptStaff.forEach(emp => {
                      deptElementSum += (emp[activePayHead as keyof Employee] as number) || 0;
                    });
                    grandElementTotal += deptElementSum;

                    return (
                      <div key={dept} className="space-y-0.5">
                        <ReportSectionHeader 
                          title={dept} 
                          countLabel={`${deptStaff.length} employees filtered`}
                          metrics={[
                            { label: `${selectedLabel} Total`, value: `AED ${deptElementSum.toLocaleString()}`, isGreen: true }
                          ]}
                        />
                        <div className="overflow-x-auto border-l border-r border-b border-[#cbd5e1] bg-white">
                          <table className="w-full text-left font-sans text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Staff ID</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee Name</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Corporate Designation</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Element Allocation</th>
                                <th className="p-2 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-right">Net Payout</th>
                                <th className="p-2 font-extrabold text-slate-700 uppercase text-right">Relative Ratio (%)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {deptStaff.map(emp => {
                                const elementVal = (emp[activePayHead as keyof Employee] as number) || 0;
                                const { netPayout } = getPayrollDetails(emp);
                                const ratio = ((elementVal / netPayout) * 100).toFixed(0);
                                return (
                                  <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                                    <td className="p-2 border-r border-[#cbd5e1] font-mono font-bold text-slate-400">#{emp.id}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">{emp.name}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] text-[10px] text-slate-500 uppercase font-medium">{emp.designation}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-bold text-slate-800">AED {elementVal.toLocaleString()}</td>
                                    <td className="p-2 border-r border-[#cbd5e1] text-right font-mono text-slate-600">AED {netPayout.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                    <td className="p-2 text-right font-mono font-bold text-[#002D62]">{ratio}%</td>
                                  </tr>
                                );
                              })}
                              {/* Department Subtotal */}
                              <tr className="bg-[#f8fafc]/80 font-bold text-slate-900 border-t border-[#cbd5e1]">
                                <td colSpan={3} className="p-2 border-r border-[#cbd5e1] text-right text-[10px] uppercase text-[#002D62] tracking-wider">SUB-TOTAL ELEMENT OF {dept}:</td>
                                <td className="p-2 border-r border-[#cbd5e1] text-right font-mono font-extrabold text-slate-800">AED {deptElementSum.toLocaleString()}</td>
                                <td colSpan={2} className="p-2"></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Current Filter Segment', value: selectedLabel.toUpperCase(), isOrange: true },
                    { label: 'Consolidated Elements Sum', value: `AED ${grandElementTotal.toLocaleString()}`, isGreen: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 09: GRATUITY */}
          {activeReport === 'gratuity' && (() => {
            const gratuityTotal = employees.reduce((sum, e) => sum + getGratuityAccrued(e).totalGratuity, 0);

            return (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 leading-relaxed rounded-sm">
                  <span className="font-extrabold uppercase text-[#002D62] flex items-center gap-1.5 mb-1">
                    <Building className="w-4 h-4 text-indigo-700" />
                    UAE Labour Law Statutory end-of-service accruals
                  </span>
                  Accrues legal severance liability based on continuous service days. Standard provisions: 21 days basic wages per year for the first 5 years of continuous service, and 30 days basic wages for each subsequent year.
                </div>

                <ReportSectionHeader 
                  title="Gratuity Severance Registry" 
                  countLabel="Statutory Provisions"
                  metrics={[
                    { label: 'Accrual Workforce', value: `${employees.length} Staff` },
                    { label: 'Cumulative Liability', value: `AED ${gratuityTotal.toLocaleString()}`, isOrange: true }
                  ]}
                />

                <div className="overflow-x-auto border border-[#cbd5e1] bg-white">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee ID</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee Name</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Date of Hire</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Service Days (Years)</th>
                        <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Calculated Formula & Scale</th>
                        <th className="p-2.5 font-extrabold text-slate-700 uppercase text-right">Contingent Liability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {employees.map(emp => {
                        const { serviceYears, totalGratuity, rateExplanation } = getGratuityAccrued(emp);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                            <td className="p-2.5 border-r border-[#cbd5e1] font-mono font-bold text-slate-400">#{emp.id}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">{emp.name}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] font-mono text-slate-500">{emp.joiningDate}</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] text-center font-bold text-[#002D62] font-mono">{serviceYears.toFixed(2)} Years</td>
                            <td className="p-2.5 border-r border-[#cbd5e1] text-[10px] text-slate-500 uppercase font-medium">{rateExplanation}</td>
                            <td className="p-2.5 text-right font-mono font-black text-indigo-800">AED {totalGratuity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Statutory Severance Pool', value: `AED ${gratuityTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, isOrange: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 10: SIF RECORDS */}
          {activeReport === 'sif_records' && (() => {
            const totalNetVal = employees.reduce((sum, emp) => sum + getPayrollDetails(emp).netPayout, 0);
            const scrText = `SCR,${activeCompany.trn || '100440509600003'},${activeCompany.code || 'ERP'},${new Date().toISOString().split('T')[0]},01:58:01,${employees.length},${totalNetVal.toFixed(2)},AED`;
            
            return (
              <div className="space-y-6">
                <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] text-xs text-slate-700 leading-relaxed rounded-sm">
                  <span className="font-extrabold uppercase text-[#002D62] flex items-center gap-1.5 mb-1">
                    <Code className="w-4 h-4 text-[#f37021]" />
                    SIF 1.2 Wages Protection System File Generator
                  </span>
                  Below is the standardized SIF payload. Click the copy action to download or paste it directly inside your bank's MoHRE portal interface.
                </div>

                <ReportSectionHeader 
                  title="WPS Salary Information File Buffer" 
                  countLabel="MoHRE Compliant Format"
                  metrics={[
                    { label: 'EDR Rows Count', value: `${employees.length} Records` },
                    { label: 'Consolidated Bulk Settlement', value: `AED ${totalNetVal.toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                  ]}
                />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ASCII Raw Code Editor</span>
                    <button
                      onClick={() => {
                        let text = scrText + '\n';
                        employees.forEach(emp => {
                          const { netPayout, otPay, absDeductions, totalAllowances } = getPayrollDetails(emp);
                          const bankCode = emp.bankName.includes('CASH') ? 'CASH' : emp.bankName.includes('ANSARI') ? 'ANSR' : emp.bankName.includes('LULU') ? 'LULU' : (emp.bankName.replace(/[^A-Za-z0-9]/g, '').substring(0, 4) || 'RAKB');
                          const cleanAcc = (emp.bankAccountNo && !emp.bankAccountNo.includes('NO IBAN') && !emp.bankAccountNo.includes('CASH')) ? emp.bankAccountNo.replace(/\s+/g, '') : 'CASH99999999999';
                          text += `EDR,${emp.id},${bankCode},${cleanAcc},${emp.daysPresent},${emp.basicSalary.toFixed(2)},${totalAllowances.toFixed(2)},${otPay.toFixed(2)},${absDeductions.toFixed(2)},${netPayout.toFixed(2)}\n`;
                        });
                        navigator.clipboard.writeText(text);
                        alert('WPS compliant SIF code copied to clipboard.');
                      }}
                      className="bg-[#002D62] hover:bg-[#f37021] hover:text-slate-950 text-white font-bold text-[10px] uppercase px-4 py-2 rounded-xs border-none cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy SIF Payload
                    </button>
                  </div>

                  <div className="bg-slate-950 text-emerald-400 p-4 rounded-xs font-mono text-[11px] overflow-x-auto space-y-2 shadow-inner border border-slate-800 leading-relaxed">
                    <div className="text-slate-400 select-all font-black border-b border-slate-800 pb-1">{scrText}</div>
                    {employees.map(emp => {
                      const { netPayout, otPay, absDeductions, totalAllowances } = getPayrollDetails(emp);
                      const bankCode = emp.bankName.includes('CASH') ? 'CASH' : emp.bankName.includes('ANSARI') ? 'ANSR' : emp.bankName.includes('LULU') ? 'LULU' : (emp.bankName.replace(/[^A-Za-z0-9]/g, '').substring(0, 4) || 'RAKB');
                      const cleanAcc = (emp.bankAccountNo && !emp.bankAccountNo.includes('NO IBAN') && !emp.bankAccountNo.includes('CASH')) ? emp.bankAccountNo.replace(/\s+/g, '') : 'CASH99999999999';
                      return (
                        <div key={emp.id} className="text-[#a7f3d0] select-all tracking-wide">
                          EDR,{emp.id},{bankCode},{cleanAcc},{emp.daysPresent},{emp.basicSalary.toFixed(2)},${totalAllowances.toFixed(2)},${otPay.toFixed(2)},${absDeductions.toFixed(2)},${netPayout.toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* REPORT 11: PAYROLL REGISTER */}
          {activeReport === 'payroll_register' && (() => {
            const currentTotal = employees.reduce((sum, e) => sum + getPayrollDetails(e).netPayout, 0);
            const compCode = activeCompany.code || 'ERP';
            return (
              <div className="space-y-6">
                <ReportSectionHeader 
                  title="Historical Period Ledger" 
                  countLabel="Filing Audit History"
                  metrics={[
                    { label: 'Archived Cycles', value: '2 Completed Periods' }
                  ]}
                />

                <div className="overflow-x-auto border border-[#cbd5e1] bg-white">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                        <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Period Month</th>
                        <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">WPS Compliance Code</th>
                        <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Processing Date</th>
                        <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Statutory Status</th>
                        <th className="p-3 font-extrabold text-slate-700 uppercase text-right">Settled Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="text-[11px] text-slate-800 hover:bg-slate-50">
                        <td className="p-3 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">May 2026</td>
                        <td className="p-3 border-r border-[#cbd5e1] font-mono font-medium text-slate-500">WPS-{compCode}-2605</td>
                        <td className="p-3 border-r border-[#cbd5e1] font-mono text-slate-500">2026-05-28 14:15</td>
                        <td className="p-3 border-r border-[#cbd5e1] text-center">
                          <span className="text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded-full uppercase">DISBURSED & SEALED</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">AED 38,200.00</td>
                      </tr>
                      <tr className="text-[11px] text-slate-800 hover:bg-slate-50">
                        <td className="p-3 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase">June 2026</td>
                        <td className="p-3 border-r border-[#cbd5e1] font-mono font-medium text-slate-500">WPS-{compCode}-2606</td>
                        <td className="p-3 border-r border-[#cbd5e1] font-mono text-slate-500">2026-06-28 10:44</td>
                        <td className="p-3 border-r border-[#cbd5e1] text-center">
                          <span className="text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded-full uppercase">DISBURSED & SEALED</span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">AED 39,450.00</td>
                      </tr>
                      <tr className="text-[11px] text-slate-800 bg-[#f37021]/5 hover:bg-[#f37021]/10">
                        <td className="p-3 border-r border-[#cbd5e1] font-bold text-[#002D62] uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f37021] animate-pulse"></span>
                          July 2026 (Active)
                        </td>
                        <td className="p-3 border-r border-[#cbd5e1] font-mono font-bold text-slate-800">WPS-{compCode}-2607-LIVE</td>
                        <td className="p-3 border-r border-[#cbd5e1] font-mono text-slate-500">Real-Time Sync</td>
                        <td className="p-3 border-r border-[#cbd5e1] text-center">
                          <span className="text-[9px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full uppercase">OPEN & EDITABLE</span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-[#f37021]">AED {currentTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <GrandConsolidatedTotals 
                  metrics={[
                    { label: 'Cumulative Annual Settlement', value: `AED ${(38200 + 39450 + currentTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}`, isGreen: true }
                  ]}
                />
              </div>
            );
          })()}

          {/* REPORT 12: ATTENDANCE REGISTER */}
          {activeReport === 'attendance_register' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#f8fafc] border border-[#cbd5e1] flex flex-wrap gap-x-5 gap-y-2 text-xs font-sans font-bold text-slate-700 rounded-sm">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#002D62] w-full mb-1 block">Shift Legend Status Indices:</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-xs shadow-3xs"></span> P = Present Shift</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-xs shadow-3xs"></span> A = Unexcused Absent</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded-xs shadow-3xs"></span> L = Statutory Paid Leave</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded-xs shadow-3xs"></span> O = Overtime Qualified Shift</span>
              </div>

              <ReportSectionHeader 
                title="WPS Attendance Heatmap Ledger" 
                countLabel="Daily Compliance Grid"
                metrics={[
                  { label: 'Standard Cycle', value: '30 Statutory Days' }
                ]}
              />

              <div className="overflow-x-auto border border-[#cbd5e1] bg-white">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                      <th className="p-2.5 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee Profile</th>
                      <th className="p-2.5 font-extrabold text-slate-700 uppercase text-center">Daily Shift Status Timeline Grid (30 statutory days)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                        <td className="p-2.5 border-r border-[#cbd5e1] font-bold text-slate-900 uppercase tracking-tight">
                          {emp.name}
                          <p className="text-[9px] font-mono text-slate-400 font-normal mt-0.5">{emp.department} // #{emp.id}</p>
                        </td>
                        <td className="p-2.5">
                          <div className="flex flex-wrap gap-1 items-center justify-start">
                            {Array.from({ length: 30 }).map((_, i) => {
                              let bg = 'bg-emerald-500';
                              let char = 'P';
                              
                              if (i < emp.daysAbsent) {
                                bg = 'bg-rose-500';
                                char = 'A';
                              } else if (i >= 30 - emp.leavesApproved) {
                                bg = 'bg-blue-500';
                                char = 'L';
                              } else if (i === 15 && emp.overtimeHours > 0) {
                                bg = 'bg-indigo-500';
                                char = 'O';
                              }
                              
                              return (
                                <span 
                                  key={i} 
                                  title={`Day ${i + 1}`}
                                  className={`w-4 h-4 text-[8px] font-black text-white flex items-center justify-center rounded-xs shadow-3xs cursor-help ${bg}`}
                                >
                                  {char}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT 13: EMPLOYEE PROFILE */}
          {activeReport === 'employee_profile' && (() => {
            const emp = employees.find(e => e.id === selectedEmpId) || employees[0];
            if (!emp) return <div className="text-center text-xs text-slate-400 p-8">No employee selected.</div>;
            
            // Compliance score: is email on file? do we have passport, visa, contract details?
            let score = 100;
            if (!emp.email) score -= 25;
            if (!emp.passportNo) score -= 25;
            if (!emp.phone) score -= 15;
            if (!emp.bankAccountNo || emp.bankAccountNo.includes('CASH') || emp.bankAccountNo.includes('NO IBAN')) score -= 10;
            score = Math.max(25, score);

            const totalMonthlyAllowances = emp.housingAllowance + emp.transportAllowance + emp.otherAllowances;
            const grossMonthlyPackage = emp.basicSalary + totalMonthlyAllowances;
            const hourlyRate = emp.basicSalary / (26 * 8);

            return (
              <div className="space-y-5">
                {/* Top Quick Staff Selector */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                    {employees.map(e => {
                      const isSelected = e.id === emp.id;
                      return (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEmpId(e.id)}
                          className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                            isSelected ? 'bg-[#f37021] text-white' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {e.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </span>
                          <span className="font-mono text-[10px]">{e.id}</span>
                          <span className="truncate max-w-[110px]">{e.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditEmployeeModal(emp)}
                      className="bg-[#f37021] hover:bg-orange-600 text-white px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider rounded shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none active:scale-95"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Employee Profile</span>
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#002D62]" />
                      <span>Add Staff</span>
                    </button>
                  </div>
                </div>

                <ReportSectionHeader 
                  title={`Corporate Profile Dossier`} 
                  countLabel={`ID: ${emp.id}`}
                  metrics={[
                    { label: 'Workforce Role', value: emp.designation.toUpperCase() },
                    { label: 'Gross Monthly Package', value: `AED ${grossMonthlyPackage.toLocaleString()}`, isGreen: true }
                  ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Left Column: Avatar, Identity & Compliance */}
                  <div className="lg:col-span-1 border border-[#cbd5e1] bg-white p-5 flex flex-col items-center text-center justify-between space-y-4 rounded-sm shadow-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-[#002D62] text-white font-black flex items-center justify-center rounded text-2xl shadow-md border-2 border-slate-200">
                        {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <h4 className="font-extrabold text-base uppercase text-slate-950 mt-3 tracking-tight">{emp.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[#f37021] font-extrabold bg-orange-50 px-2 py-0.5 border border-orange-200 rounded">{emp.id}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 border border-slate-200 rounded">{emp.department}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{emp.designation}</p>
                    </div>

                    {/* Action button inside card */}
                    <div className="w-full flex gap-2">
                      <button
                        onClick={() => openEditEmployeeModal(emp)}
                        className="flex-1 py-2 px-3 bg-[#002D62] hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-none"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#f37021]" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        title="Delete this employee record"
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="w-full border-t border-[#cbd5e1] pt-3 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">MoHRE Compliance Grade</span>
                        <span className="font-mono font-bold text-xs text-[#002D62]">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className={`h-full transition-all ${
                            score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-[#f37021]' : 'bg-rose-500'
                          }`} 
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="text-[9.5px] text-slate-500 flex items-center justify-between">
                        <span>Contract Status:</span>
                        <strong className="text-slate-800 uppercase font-mono">{emp.contractType}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right 2 Columns: Detailed Information Panels */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* Section 1: Personal & Contact Info */}
                    <div className="border border-[#cbd5e1] bg-white p-4 rounded-sm shadow-xs font-sans text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <h5 className="text-[10.5px] font-black uppercase text-[#002D62] tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#f37021]" /> Personal & Contact Details
                        </h5>
                        <button
                          onClick={() => openEditEmployeeModal(emp)}
                          className="text-[9.5px] font-bold text-[#f37021] hover:underline uppercase flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        >
                          <Pencil className="w-3 h-3" /> Quick Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Full Legal Name</span>
                          <strong className="text-slate-900 text-xs uppercase font-extrabold">{emp.name}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Nationality</span>
                          <strong className="text-slate-900 text-xs uppercase">{emp.nationality}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Contact Phone Number</span>
                          <strong className="text-slate-900 text-xs font-mono">{emp.phone || '—'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Registered Corporate Email</span>
                          <strong className="text-slate-900 text-xs lowercase font-mono">
                            {emp.email ? emp.email : <span className="text-rose-600 font-sans uppercase font-bold text-[10px]">MISSING (NO EMAIL)</span>}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Company Joining Date</span>
                          <strong className="text-slate-900 text-xs font-mono">{emp.joiningDate || '2022-01-15'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Department Division</span>
                          <strong className="text-[#002D62] text-xs uppercase font-extrabold">{emp.department}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Compensation & Package Structure */}
                    <div className="border border-[#cbd5e1] bg-white p-4 rounded-sm shadow-xs font-sans text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <h5 className="text-[10.5px] font-black uppercase text-[#002D62] tracking-wider flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-[#f37021]" /> Contractual Wages & Package Breakdown
                        </h5>
                        <button
                          onClick={() => openEditEmployeeModal(emp)}
                          className="text-[9.5px] font-bold text-[#f37021] hover:underline uppercase flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        >
                          <Pencil className="w-3 h-3" /> Adjust Wages
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-[#f8fafc] p-3 rounded border border-slate-200 mb-3">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Basic Wages</span>
                          <strong className="block text-slate-950 font-mono font-black text-sm mt-0.5">AED {emp.basicSalary.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Housing Allowance</span>
                          <strong className="block text-slate-950 font-mono font-black text-sm mt-0.5">AED {emp.housingAllowance.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Transport Allowance</span>
                          <strong className="block text-slate-950 font-mono font-black text-sm mt-0.5">AED {emp.transportAllowance.toLocaleString()}</strong>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[9px] text-slate-500 uppercase block font-bold">Other Allowances</span>
                          <strong className="block text-slate-950 font-mono font-black text-sm mt-0.5">AED {emp.otherAllowances.toLocaleString()}</strong>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-mono">
                        <span className="text-slate-600 font-sans font-bold uppercase text-[10px]">Total Gross Package:</span>
                        <strong className="text-emerald-800 text-sm font-black font-mono">AED {grossMonthlyPackage.toLocaleString()} / month</strong>
                      </div>
                    </div>

                    {/* Section 3: Banking, WPS & Expatriate Compliance */}
                    <div className="border border-[#cbd5e1] bg-white p-4 rounded-sm shadow-xs font-sans text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                        <h5 className="text-[10.5px] font-black uppercase text-[#002D62] tracking-wider flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#f37021]" /> Banking & Expatriate Statutory Records
                        </h5>
                        <button
                          onClick={() => openEditEmployeeModal(emp)}
                          className="text-[9.5px] font-bold text-[#f37021] hover:underline uppercase flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        >
                          <Pencil className="w-3 h-3" /> Update Details
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Bank / Payment Channel</span>
                          <strong className="text-slate-900 text-xs uppercase font-extrabold">{emp.bankName || 'RAKBANK'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">IBAN / Account Number</span>
                          {(!emp.bankAccountNo || emp.bankAccountNo.includes('CASH') || emp.bankAccountNo.includes('NO IBAN')) ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                              <Banknote className="w-3 h-3 text-amber-700" />
                              {emp.bankAccountNo || 'CASH IN HAND (NO IBAN)'}
                            </span>
                          ) : (
                            <strong className="text-slate-900 font-mono text-xs select-all bg-slate-100 px-2 py-0.5 border border-slate-200 rounded block">
                              {emp.bankAccountNo}
                            </strong>
                          )}
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Passport Number</span>
                          <strong className="text-slate-900 text-xs font-mono uppercase">{emp.passportNo || 'N/A'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Passport Expiry Date</span>
                          <strong className="text-slate-900 text-xs font-mono">{emp.passportExpiry || '2028-12-15'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">UAE Visa Expiry Date</span>
                          <strong className="text-slate-900 text-xs font-mono">{emp.visaExpiry || '2028-06-30'}</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block font-bold">Labour Contract Expiry</span>
                          <strong className="text-slate-900 text-xs font-mono">{emp.contractExpiry || '2028-06-30'}</strong>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            );
          })()}

          {/* REPORT 14: EMPLOYEE HEAD COUNT */}
          {activeReport === 'head_count' && (
            <div className="space-y-6">
              <ReportSectionHeader 
                title="Workforce Demographics Analysis" 
                countLabel="Strategic Planning"
                metrics={[
                  { label: 'Total Employed Profiles', value: `${employees.length} Staff` }
                ]}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="border border-[#cbd5e1] p-4 bg-[#f8fafc] text-center rounded-xs shadow-3xs">
                  <span className="text-[9px] font-extrabold text-[#002D62] uppercase tracking-widest block">Total Registered Staff</span>
                  <span className="text-3xl font-black text-[#f37021] block mt-1 font-mono">{employees.length}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 uppercase font-semibold">Active inside July register</span>
                </div>

                <div className="border border-[#cbd5e1] p-4 bg-[#f8fafc] text-center rounded-xs shadow-3xs">
                  <span className="text-[9px] font-extrabold text-[#002D62] uppercase tracking-widest block">Limited Contract Ratio</span>
                  <span className="text-3xl font-black text-slate-900 block mt-1 font-mono">
                    {employees.length > 0 ? ((employees.filter(e => e.contractType === 'LIMITED').length / employees.length) * 100).toFixed(0) : 0}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 uppercase font-semibold">
                    {employees.filter(e => e.contractType === 'LIMITED').length} Ltd / {employees.filter(e => e.contractType === 'UNLIMITED').length} Unltd
                  </span>
                </div>

                <div className="border border-[#cbd5e1] p-4 bg-[#f8fafc] text-center rounded-xs shadow-3xs">
                  <span className="text-[9px] font-extrabold text-[#002D62] uppercase tracking-widest block">Emiratisation Rate</span>
                  <span className="text-3xl font-black text-emerald-800 block mt-1 font-mono">
                    {employees.length > 0 ? ((employees.filter(e => e.nationality === 'EMIRATI').length / employees.length) * 100).toFixed(0) : 0}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 uppercase font-semibold">{employees.filter(e => e.nationality === 'EMIRATI').length} UAE Nationals active</span>
                </div>

              </div>

              {/* Departmental headcount listing bar charts */}
              <div className="border border-[#cbd5e1] p-5 bg-white rounded-xs space-y-4">
                <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider block border-b border-[#cbd5e1] pb-2 text-[#002D62]">
                  Division Headcount Distribution Metric Charts:
                </span>
                
                {departments.map(dept => {
                  const staffCount = employees.filter(e => e.department === dept).length;
                  const ratioPercent = employees.length > 0 ? (staffCount / employees.length) * 100 : 0;
                  return (
                    <div key={dept} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-sans">
                        <span className="font-bold text-slate-700 uppercase text-[10.5px]">{dept}</span>
                        <span className="font-bold font-mono text-slate-900">{staffCount} Staff ({ratioPercent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-4 overflow-hidden rounded-xs border border-slate-200">
                        <div className="bg-[#002D62] h-full transition-all" style={{ width: `${ratioPercent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REPORT 15: EXPAT REPORTS (Passport Expiry, Visa Expiry, Contract Expiry) */}
          {activeReport === 'expat_reports' && (
            <div className="space-y-6">
              
              {/* Embedded Document Type Sub-Navigation */}
              <div className="flex border-b border-[#cbd5e1] bg-[#f8fafc] p-1 rounded-sm">
                <button
                  onClick={() => setExpatTab('passport')}
                  className={`flex-1 text-center py-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer rounded-xs ${
                    expatTab === 'passport' 
                      ? 'bg-slate-900 text-[#f37021] font-black shadow-3xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Passport Expiry Monitor
                </button>
                <button
                  onClick={() => setExpatTab('visa')}
                  className={`flex-1 text-center py-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer rounded-xs ${
                    expatTab === 'visa' 
                      ? 'bg-slate-900 text-[#f37021] font-black shadow-3xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Visa Expiry Monitor
                </button>
                <button
                  onClick={() => setExpatTab('contract')}
                  className={`flex-1 text-center py-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer rounded-xs ${
                    expatTab === 'contract' 
                      ? 'bg-slate-900 text-[#f37021] font-black shadow-3xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Contract Expiry Monitor
                </button>
              </div>

              <ReportSectionHeader 
                title={`${expatTab.toUpperCase()} METRIC MATRIX`} 
                countLabel="Expatriate Document Compliance"
                metrics={[
                  { label: 'Active Foreign Crew', value: `${employees.filter(e => e.nationality !== 'EMIRATI').length} Staff` }
                ]}
              />

              {/* Expats Audit Table */}
              <div className="overflow-x-auto border border-[#cbd5e1] bg-white">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[10px]">
                      <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Staff ID</th>
                      <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Employee Name</th>
                      <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Nationality</th>
                      <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Document Code</th>
                      <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase">Expiration Date</th>
                      <th className="p-3 border-r border-[#cbd5e1] font-extrabold text-slate-700 uppercase text-center">Remaining Days</th>
                      <th className="p-3 font-extrabold text-slate-700 uppercase text-right">State / Warning Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {employees.map(emp => {
                      let docNum = '';
                      let expiryDate = '';
                      
                      if (expatTab === 'passport') {
                        docNum = emp.passportNo || 'P_UNKNOWN';
                        expiryDate = emp.passportExpiry;
                      } else if (expatTab === 'visa') {
                        docNum = 'VISA-' + emp.passportNo.substring(2);
                        expiryDate = emp.visaExpiry;
                      } else {
                        docNum = emp.contractType + '_AGR';
                        expiryDate = emp.contractExpiry;
                      }

                      const rem = getDaysRemaining(expiryDate);

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50 text-[11px] text-slate-800">
                          <td className="p-3 border-r border-[#cbd5e1] font-mono font-bold text-slate-400">#{emp.id}</td>
                          <td className="p-3 border-r border-[#cbd5e1] font-bold text-slate-950 uppercase">{emp.name}</td>
                          <td className="p-3 border-r border-[#cbd5e1] uppercase font-medium text-slate-500">{emp.nationality}</td>
                          <td className="p-3 border-r border-[#cbd5e1] font-mono font-bold select-all text-slate-600">{docNum}</td>
                          <td className="p-3 border-r border-[#cbd5e1] font-mono font-bold text-slate-900">{expiryDate}</td>
                          <td className={`p-3 border-r border-[#cbd5e1] text-center font-mono font-black ${rem.days <= 60 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {rem.days} Days
                          </td>
                          <td className="p-3 text-right">
                            <span className={`text-[9px] font-black px-2 py-0.5 border rounded-xs uppercase ${rem.color} inline-block`}>
                              {rem.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Footer: Delete state trigger */}
          {employees.length > 0 && (
            <div className="border-t border-slate-200 mt-auto pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[10px] text-slate-400 font-mono">Records kept in local storage with double backup. Code compliance: UAE MoHRE SIF 1.2 compliant.</span>
              <button
                onClick={() => {
                  if (confirm("Reset local storage database to default staff data?")) {
                    saveEmployees(INITIAL_EMPLOYEES);
                    alert("Registry successfully restored to base defaults.");
                  }
                }}
                className="text-[10px] font-black text-rose-600 uppercase hover:underline bg-transparent border-none cursor-pointer"
              >
                Restore Base Default Employee Records
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Add New Staff Member Modal popup dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-3xs">
          <div className="bg-white border-2 border-slate-900 max-w-2xl w-full p-6 shadow-xl relative rounded-sm">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-800 p-1 cursor-pointer border-none bg-transparent"
            >
              <Plus className="w-5 h-5 rotate-45 text-slate-900 stroke-[3]" />
            </button>

            <h4 className="text-sm font-black uppercase text-slate-900 border-b pb-2 mb-4 tracking-tight">
              Add New Staff Member Profile (UAE WPS Compliance)
            </h4>

            <form onSubmit={handleAddNewEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AHMAD ALI"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 uppercase font-sans font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Designation Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QUALITY INSPECTOR"
                    value={newEmpDesignation}
                    onChange={(e) => setNewEmpDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 uppercase font-sans font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[9px] uppercase font-bold text-slate-500">Department</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewDept(!isAddingNewDept)}
                      className="text-[9px] text-[#002D62] hover:text-[#f37021] font-bold underline cursor-pointer bg-transparent border-none"
                    >
                      {isAddingNewDept ? 'Select Existing' : '+ Add New Dept'}
                    </button>
                  </div>
                  {isAddingNewDept ? (
                    <input
                      type="text"
                      placeholder="ENTER NEW DEPARTMENT NAME..."
                      value={customDeptInput}
                      onChange={(e) => setCustomDeptInput(e.target.value.toUpperCase())}
                      className="w-full bg-amber-50 border border-amber-400 p-1.5 focus:bg-white text-xs text-slate-900 font-bold uppercase rounded-xs"
                    />
                  ) : (
                    <select
                      value={newEmpDept}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsAddingNewDept(true);
                        } else {
                          setNewEmpDept(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 font-semibold uppercase"
                    >
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="__NEW__">+ ADD NEW DEPARTMENT...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Nationality</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INDIAN / EMIRATI / BANGLADESHI"
                    value={newEmpNationality}
                    onChange={(e) => setNewEmpNationality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 uppercase font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Basic Base Salary (AED)</label>
                  <input
                    type="number"
                    required
                    value={newEmpBasic}
                    onChange={(e) => setNewEmpBasic(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 text-right font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Housing Allowance (AED)</label>
                  <input
                    type="number"
                    required
                    value={newEmpHousing}
                    onChange={(e) => setNewEmpHousing(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 text-right font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Transport Allowance (AED)</label>
                  <input
                    type="number"
                    required
                    value={newEmpTransport}
                    onChange={(e) => setNewEmpTransport(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 text-right font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Other Allowance (AED)</label>
                  <input
                    type="number"
                    required
                    value={newEmpOther}
                    onChange={(e) => setNewEmpOther(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 text-right font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Bank / Payment Channel</label>
                  <select
                    value={newEmpBank}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewEmpBank(val);
                      if (val.includes('CASH')) {
                        setIsNoIban(true);
                        setNewEmpAccount('CASH / NO IBAN');
                      } else if (val.includes('EXCHANGE')) {
                        setIsNoIban(true);
                        setNewEmpAccount('WPS C3 CARD (NO IBAN)');
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 font-semibold"
                  >
                    <option value="RAKBANK">RAKBANK</option>
                    <option value="EMIRATES NBD">EMIRATES NBD</option>
                    <option value="ADCB">ADCB</option>
                    <option value="MASHREQ BANK">MASHREQ BANK</option>
                    <option value="HSBC">HSBC</option>
                    <option value="DUBAI ISLAMIC BANK (DIB)">DUBAI ISLAMIC BANK (DIB)</option>
                    <option value="FIRST ABU DHABI BANK (FAB)">FIRST ABU DHABI BANK (FAB)</option>
                    <option value="AL ANSARI EXCHANGE (WPS C3 CARD)">AL ANSARI EXCHANGE (WPS C3 CARD)</option>
                    <option value="LULU EXCHANGE (PAYROLL CARD)">LULU EXCHANGE (PAYROLL CARD)</option>
                    <option value="AL ROSTAMANI EXCHANGE">AL ROSTAMANI EXCHANGE</option>
                    <option value="CASH IN HAND (NO IBAN)">CASH IN HAND (NO IBAN / DIRECT PAYMENT)</option>
                    <option value="CHEQUE PAYMENT">CHEQUE PAYMENT</option>
                    <option value="OTHER PAYMENT METHOD">OTHER PAYMENT METHOD</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[9px] uppercase font-bold text-slate-500">IBAN Account Number</label>
                    <label className="flex items-center gap-1 cursor-pointer select-none text-[9px] font-bold text-amber-800">
                      <input
                        type="checkbox"
                        checked={isNoIban || newEmpBank.includes('CASH')}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsNoIban(checked);
                          if (checked) {
                            setNewEmpAccount(newEmpBank.includes('EXCHANGE') ? 'WPS C3 CARD (NO IBAN)' : 'CASH / NO IBAN');
                          } else {
                            setNewEmpAccount('');
                          }
                        }}
                        className="accent-[#f37021]"
                      />
                      No IBAN (Cash/Unbanked)
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={isNoIban || newEmpBank.includes('CASH')}
                    placeholder={isNoIban ? 'CASH / NO IBAN' : 'AE62024...'}
                    value={newEmpAccount}
                    onChange={(e) => setNewEmpAccount(e.target.value.toUpperCase())}
                    className={`w-full p-1.5 text-xs font-mono font-bold rounded-xs border ${
                      isNoIban || newEmpBank.includes('CASH')
                        ? 'bg-amber-50 text-amber-900 border-amber-300 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Passport Number</label>
                  <input
                    type="text"
                    placeholder="e.g. N1234567"
                    value={newEmpPassport}
                    onChange={(e) => setNewEmpPassport(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Contract Arrangement</label>
                  <select
                    value={newEmpContractType}
                    onChange={(e) => setNewEmpContractType(e.target.value as 'LIMITED' | 'UNLIMITED')}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900"
                  >
                    <option value="LIMITED">LIMITED DURATION</option>
                    <option value="UNLIMITED">UNLIMITED DURATION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Passport Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newEmpPassportExpiry}
                    onChange={(e) => setNewEmpPassportExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Visa Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newEmpVisaExpiry}
                    onChange={(e) => setNewEmpVisaExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 p-1.5 focus:bg-white text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold uppercase rounded-sm border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#f37021] hover:bg-orange-600 text-slate-950 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border-none cursor-pointer"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EMPLOYEE PROFILE EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-900 shadow-2xl max-w-2xl w-full p-6 text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto rounded-sm">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#f37021]" />
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                    Edit Employee Profile — #{editingEmpId}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Update corporate records, wages, bank details, and statutory compliance</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer border-none bg-transparent p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedEmployee} className="space-y-4 font-sans text-xs">
              
              {/* Section 1: Personal & Placement */}
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs space-y-3">
                <span className="text-[10px] font-black text-[#002D62] uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#f37021]" /> 1. Personal & Corporate Placement
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MOHAMMED FARUKH"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs font-bold text-slate-900 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Designation / Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CNC LATHE OPERATOR"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs font-bold text-slate-900 uppercase"
                    />
                  </div>
                  
                  {/* Department */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[9px] uppercase font-bold text-slate-500">Department</label>
                      <button
                        type="button"
                        onClick={() => setEditIsAddingDept(!editIsAddingDept)}
                        className="text-[9px] text-[#002D62] hover:text-[#f37021] font-bold underline cursor-pointer bg-transparent border-none"
                      >
                        {editIsAddingDept ? 'Choose from list' : '+ Add New Department'}
                      </button>
                    </div>
                    {editIsAddingDept ? (
                      <input
                        type="text"
                        placeholder="e.g. WAREHOUSE & LOGISTICS"
                        value={editCustomDept}
                        onChange={(e) => setEditCustomDept(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 uppercase font-bold"
                      />
                    ) : (
                      <select
                        value={editDept}
                        onChange={(e) => setEditDept(e.target.value)}
                        className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-bold"
                      >
                        {departmentsList.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Nationality</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BANGLADESH / INDIA / UAE"
                      value={editNationality}
                      onChange={(e) => setEditNationality(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 uppercase font-sans font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Corporate Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. employee@marinefasteners.ae"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +971 50 123 4567"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Company Joining Date</label>
                    <input
                      type="date"
                      value={editJoiningDate}
                      onChange={(e) => setEditJoiningDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Contract Type</label>
                    <select
                      value={editContractType}
                      onChange={(e) => setEditContractType(e.target.value as 'LIMITED' | 'UNLIMITED')}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-bold"
                    >
                      <option value="LIMITED">LIMITED CONTRACT</option>
                      <option value="UNLIMITED">UNLIMITED CONTRACT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Wages & Allowances */}
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-[10px] font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#f37021]" /> 2. Contractual Wages & Package Breakdown
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 font-mono">
                    Total Gross: <strong className="text-emerald-800 font-black">AED {(Number(editBasic) + Number(editHousing) + Number(editTransport) + Number(editOther)).toLocaleString()}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Basic Wages (AED) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editBasic}
                      onChange={(e) => setEditBasic(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 text-right font-black font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Housing (AED)</label>
                    <input
                      type="number"
                      min={0}
                      value={editHousing}
                      onChange={(e) => setEditHousing(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 text-right font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Transport (AED)</label>
                    <input
                      type="number"
                      min={0}
                      value={editTransport}
                      onChange={(e) => setEditTransport(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 text-right font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Other Allowance (AED)</label>
                    <input
                      type="number"
                      min={0}
                      value={editOther}
                      onChange={(e) => setEditOther(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 text-right font-bold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Banking & WPS Settings */}
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs space-y-3">
                <span className="text-[10px] font-black text-[#002D62] uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#f37021]" /> 3. Banking & Wages Protection (WPS)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Bank / Payment Channel</label>
                    <select
                      value={editBank}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditBank(val);
                        if (val.includes('CASH')) {
                          setEditIsNoIban(true);
                          setEditAccount('CASH / NO IBAN');
                        } else if (val.includes('EXCHANGE')) {
                          setEditIsNoIban(true);
                          setEditAccount('WPS C3 CARD (NO IBAN)');
                        }
                      }}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-bold"
                    >
                      <option value="RAKBANK">RAKBANK</option>
                      <option value="EMIRATES NBD">EMIRATES NBD</option>
                      <option value="ADCB">ADCB</option>
                      <option value="MASHREQ BANK">MASHREQ BANK</option>
                      <option value="HSBC">HSBC</option>
                      <option value="DUBAI ISLAMIC BANK (DIB)">DUBAI ISLAMIC BANK (DIB)</option>
                      <option value="FIRST ABU DHABI BANK (FAB)">FIRST ABU DHABI BANK (FAB)</option>
                      <option value="AL ANSARI EXCHANGE (WPS C3 CARD)">AL ANSARI EXCHANGE (WPS C3 CARD)</option>
                      <option value="LULU EXCHANGE (PAYROLL CARD)">LULU EXCHANGE (PAYROLL CARD)</option>
                      <option value="AL ROSTAMANI EXCHANGE">AL ROSTAMANI EXCHANGE</option>
                      <option value="CASH IN HAND (NO IBAN)">CASH IN HAND (NO IBAN / DIRECT PAYMENT)</option>
                      <option value="CHEQUE PAYMENT">CHEQUE PAYMENT</option>
                      <option value="OTHER PAYMENT METHOD">OTHER PAYMENT METHOD</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[9px] uppercase font-bold text-slate-500">IBAN / Account Number</label>
                      <label className="flex items-center gap-1 cursor-pointer select-none text-[9px] font-bold text-amber-800">
                        <input
                          type="checkbox"
                          checked={editIsNoIban || editBank.includes('CASH')}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEditIsNoIban(checked);
                            if (checked) {
                              setEditAccount(editBank.includes('EXCHANGE') ? 'WPS C3 CARD (NO IBAN)' : 'CASH / NO IBAN');
                            } else {
                              setEditAccount('');
                            }
                          }}
                          className="accent-[#f37021]"
                        />
                        No IBAN (Cash / Unbanked)
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={editIsNoIban || editBank.includes('CASH')}
                      placeholder={editIsNoIban ? 'CASH / NO IBAN' : 'AE62024...'}
                      value={editAccount}
                      onChange={(e) => setEditAccount(e.target.value.toUpperCase())}
                      className={`w-full p-2 text-xs font-mono font-bold rounded-xs border ${
                        editIsNoIban || editBank.includes('CASH')
                          ? 'bg-amber-50 text-amber-900 border-amber-300 cursor-not-allowed'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-[#f37021]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Expatriate Statutory Documents */}
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs space-y-3">
                <span className="text-[10px] font-black text-[#002D62] uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f37021]" /> 4. Expatriate Statutory Compliance
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Passport Number</label>
                    <input
                      type="text"
                      placeholder="e.g. N1234567"
                      value={editPassportNo}
                      onChange={(e) => setEditPassportNo(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 uppercase font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Passport Expiry Date</label>
                    <input
                      type="date"
                      value={editPassportExpiry}
                      onChange={(e) => setEditPassportExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">UAE Visa Expiry Date</label>
                    <input
                      type="date"
                      value={editVisaExpiry}
                      onChange={(e) => setEditVisaExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Labour Contract Expiry Date</label>
                    <input
                      type="date"
                      value={editContractExpiry}
                      onChange={(e) => setEditContractExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Attendance Defaults */}
              <div className="bg-slate-50 p-3 border border-slate-200 rounded-xs space-y-3">
                <span className="text-[10px] font-black text-[#002D62] uppercase tracking-wider block border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#f37021]" /> 5. Monthly Attendance Record Defaults
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Days Present</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={editDaysPresent}
                      onChange={(e) => setEditDaysPresent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Days Absent</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={editDaysAbsent}
                      onChange={(e) => setEditDaysAbsent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-rose-700 text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Approved Leaves</label>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={editLeavesApproved}
                      onChange={(e) => setEditLeavesApproved(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-slate-900 text-center font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Overtime Hours</label>
                    <input
                      type="number"
                      min={0}
                      value={editOvertimeHours}
                      onChange={(e) => setEditOvertimeHours(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 p-2 focus:border-[#f37021] text-xs text-indigo-700 text-center font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Overtime Calculation & Absentee Deduction Custom Rates & Overrides */}
              {(() => {
                const autoHourlyRate = Number(editBasic) / (26 * 8);
                const effectiveHourlyRate = editIsCustomHourlyRate && editCustomHourlyRate !== '' && Number(editCustomHourlyRate) > 0
                  ? Number(editCustomHourlyRate)
                  : autoHourlyRate;
                const effectiveMultiplier = Number(editOvertimeMultiplier) > 0 ? Number(editOvertimeMultiplier) : 1.25;
                const calculatedOt = Number(editOvertimeHours) * effectiveHourlyRate * effectiveMultiplier;
                const activeOtPayout = editIsManualOvertime && editCustomOvertimePayout !== '' ? Number(editCustomOvertimePayout) : calculatedOt;

                const autoDailyWage = Number(editBasic) / 26;
                const effectiveDailyWage = editIsCustomDailyWage && editCustomDailyWage !== '' && Number(editCustomDailyWage) > 0
                  ? Number(editCustomDailyWage)
                  : autoDailyWage;
                const calculatedAbs = Number(editDaysAbsent) * effectiveDailyWage;
                const activeAbsDeduction = editIsManualAbsentDeduction && editCustomAbsentDeduction !== '' ? Number(editCustomAbsentDeduction) : calculatedAbs;

                const simGross = Number(editBasic) + Number(editHousing) + Number(editTransport) + Number(editOther) + activeOtPayout;
                const simNet = Math.max(0, simGross - activeAbsDeduction);

                return (
                  <div className="bg-indigo-50/50 p-3.5 border-2 border-indigo-200 rounded-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5 flex-wrap gap-2">
                      <span className="text-[10.5px] font-black text-[#002D62] uppercase tracking-wider flex items-center gap-1.5">
                        <SlidersHorizontal className="w-4 h-4 text-[#f37021]" />
                        6. Base Hourly Rate, Daily Wage & Deduction Controls
                      </span>
                      <span className="text-[10px] font-bold text-indigo-900 font-mono bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                        Net Payout Preview: <strong>AED {simNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Left: Overtime Payout & Base Hourly Rate Box */}
                      <div className="bg-white p-3 border border-indigo-200 rounded space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black text-slate-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            Overtime Payout (AED)
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer select-none text-[9.5px] font-extrabold text-[#f37021]">
                            <input
                              type="checkbox"
                              checked={editIsManualOvertime}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditIsManualOvertime(checked);
                                if (checked && (editCustomOvertimePayout === '' || editCustomOvertimePayout === 0)) {
                                  setEditCustomOvertimePayout(Math.round(calculatedOt * 100) / 100);
                                }
                              }}
                              className="accent-[#f37021]"
                            />
                            Total Lump-Sum Override
                          </label>
                        </div>

                        {/* Base Hourly Rate & Multiplier Controls */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-black uppercase text-slate-700">Base Hourly Rate Mode:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditIsCustomHourlyRate(false);
                                  setEditCustomHourlyRate(Math.round(autoHourlyRate * 100) / 100);
                                }}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-all ${!editIsCustomHourlyRate ? 'bg-indigo-600 text-white border-indigo-700 shadow-3xs' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                              >
                                Auto (Basic / 208)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditIsCustomHourlyRate(true);
                                  if (editCustomHourlyRate === '' || editCustomHourlyRate === 0) {
                                    setEditCustomHourlyRate(Math.round(autoHourlyRate * 100) / 100);
                                  }
                                }}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-all ${editIsCustomHourlyRate ? 'bg-[#f37021] text-white border-orange-600 shadow-3xs' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                              >
                                Custom Hourly Rate
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="block text-[8.5px] uppercase font-bold text-slate-500 mb-0.5">
                                {editIsCustomHourlyRate ? '★ Custom Rate (AED / hr)' : 'Base Rate (AED / hr)'}
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={editIsCustomHourlyRate ? editCustomHourlyRate : autoHourlyRate.toFixed(2)}
                                  disabled={!editIsCustomHourlyRate}
                                  onChange={(e) => setEditCustomHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="e.g. 40.87"
                                  className={`w-full p-1.5 text-xs font-mono font-black rounded-xs ${editIsCustomHourlyRate ? 'bg-amber-50 border-2 border-[#f37021] text-slate-900 focus:bg-white' : 'bg-slate-100 border border-slate-300 text-slate-700 cursor-not-allowed'}`}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[8.5px] uppercase font-bold text-slate-500 mb-0.5">
                                Overtime Multiplier (×)
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={5}
                                  step="0.05"
                                  value={editOvertimeMultiplier}
                                  onChange={(e) => setEditOvertimeMultiplier(Number(e.target.value) || 1.25)}
                                  className="w-full bg-white border border-slate-300 p-1.5 text-xs font-mono font-bold text-indigo-900 rounded-xs focus:border-[#f37021]"
                                />
                                <span className="text-[10px] font-bold text-slate-500">×</span>
                              </div>
                            </div>
                          </div>

                          {/* Calculated Formula info */}
                          <div className="border-t border-slate-200 pt-1.5 text-[9.5px] text-slate-600 space-y-1 font-mono">
                            <div className="flex justify-between">
                              <span>Formula (Hours × Rate × Mult):</span>
                              <span className="font-bold text-indigo-700">{editOvertimeHours}h × {effectiveHourlyRate.toFixed(2)} × {effectiveMultiplier}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Calculated Overtime Payout:</span>
                              <span className="text-emerald-700">AED {calculatedOt.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          </div>
                        </div>

                        {editIsManualOvertime ? (
                          <div className="space-y-1 bg-amber-50/70 p-2.5 border border-amber-300 rounded">
                            <label className="block text-[9px] uppercase font-bold text-[#f37021]">
                              Total Lump-Sum Custom Overtime Payout (AED)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={editCustomOvertimePayout}
                              onChange={(e) => setEditCustomOvertimePayout(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Enter total custom overtime payout..."
                              className="w-full bg-white border-2 border-[#f37021] p-1.5 text-xs font-mono font-black text-slate-900 rounded-xs focus:ring-1 focus:ring-[#f37021]"
                            />
                            <p className="text-[8px] text-[#f37021] font-semibold">★ This direct lump-sum override will take absolute precedence over the formula rate.</p>
                          </div>
                        ) : (
                          <div className="p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold rounded flex items-center justify-between">
                            <span>Effective Overtime Payout:</span>
                            <span className="font-mono font-black text-sm text-emerald-700">AED {calculatedOt.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Absentee Deduction & Daily Wage Box */}
                      <div className="bg-white p-3 border border-indigo-200 rounded space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black text-slate-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Absentee Deduction (AED)
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer select-none text-[9.5px] font-extrabold text-[#f37021]">
                            <input
                              type="checkbox"
                              checked={editIsManualAbsentDeduction}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditIsManualAbsentDeduction(checked);
                                if (checked && (editCustomAbsentDeduction === '' || editCustomAbsentDeduction === 0)) {
                                  setEditCustomAbsentDeduction(Math.round(calculatedAbs * 100) / 100);
                                }
                              }}
                              className="accent-[#f37021]"
                            />
                            Total Lump-Sum Override
                          </label>
                        </div>

                        {/* Daily Wage Basis Controls */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-black uppercase text-slate-700">Daily Wage Basis Mode:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditIsCustomDailyWage(false);
                                  setEditCustomDailyWage(Math.round(autoDailyWage * 100) / 100);
                                }}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-all ${!editIsCustomDailyWage ? 'bg-rose-700 text-white border-rose-800 shadow-3xs' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                              >
                                Auto (Basic / 26)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditIsCustomDailyWage(true);
                                  if (editCustomDailyWage === '' || editCustomDailyWage === 0) {
                                    setEditCustomDailyWage(Math.round(autoDailyWage * 100) / 100);
                                  }
                                }}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded border cursor-pointer transition-all ${editIsCustomDailyWage ? 'bg-[#f37021] text-white border-orange-600 shadow-3xs' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
                              >
                                Custom Daily Wage
                              </button>
                            </div>
                          </div>

                          <div className="pt-1">
                            <label className="block text-[8.5px] uppercase font-bold text-slate-500 mb-0.5">
                              {editIsCustomDailyWage ? '★ Custom Daily Wage Basic (AED / day)' : 'Standard Daily Wage (AED / day)'}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={editIsCustomDailyWage ? editCustomDailyWage : autoDailyWage.toFixed(2)}
                                disabled={!editIsCustomDailyWage}
                                onChange={(e) => setEditCustomDailyWage(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="e.g. 326.92"
                                className={`w-full p-1.5 text-xs font-mono font-black rounded-xs ${editIsCustomDailyWage ? 'bg-amber-50 border-2 border-[#f37021] text-slate-900 focus:bg-white' : 'bg-slate-100 border border-slate-300 text-slate-700 cursor-not-allowed'}`}
                              />
                            </div>
                          </div>

                          {/* Calculated Formula info */}
                          <div className="border-t border-slate-200 pt-1.5 text-[9.5px] text-slate-600 space-y-1 font-mono">
                            <div className="flex justify-between">
                              <span>Formula (Days Absent × Daily Wage):</span>
                              <span className="font-bold text-rose-700">{editDaysAbsent}d × {effectiveDailyWage.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Calculated Absentee Deduction:</span>
                              <span className="text-rose-700">AED {calculatedAbs.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          </div>
                        </div>

                        {editIsManualAbsentDeduction ? (
                          <div className="space-y-1.5 bg-amber-50/70 p-2.5 border border-amber-300 rounded">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-[#f37021]">
                                Total Lump-Sum Custom Deduction Amount (AED)
                              </label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={editCustomAbsentDeduction}
                                onChange={(e) => setEditCustomAbsentDeduction(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Enter custom deduction amount..."
                                className="w-full bg-white border-2 border-[#f37021] p-1.5 text-xs font-mono font-black text-rose-800 rounded-xs focus:ring-1 focus:ring-[#f37021]"
                              />
                            </div>
                            <div>
                              <label className="block text-[8.5px] uppercase font-bold text-slate-500">
                                Deduction Reason / Remarks (Optional)
                              </label>
                              <input
                                type="text"
                                value={editCustomDeductionRemarks}
                                onChange={(e) => setEditCustomDeductionRemarks(e.target.value)}
                                placeholder="e.g. Disciplinary fine, unexcused absence, loan recovery"
                                className="w-full bg-white border border-slate-300 p-1.5 text-xs text-slate-900 rounded-xs focus:border-[#f37021]"
                              />
                            </div>
                            <p className="text-[8px] text-[#f37021] font-semibold">★ This direct lump-sum override will take absolute precedence over the formula rate.</p>
                          </div>
                        ) : (
                          <div className="p-2 bg-rose-50 text-rose-900 border border-rose-200 text-[10px] font-bold rounded flex items-center justify-between">
                            <span>Effective Absentee Deduction:</span>
                            <span className="font-mono font-black text-sm text-rose-700">AED {calculatedAbs.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteEmployee(editingEmpId)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 text-xs font-bold uppercase rounded-sm cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Staff</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-bold uppercase rounded-sm border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#f37021] hover:bg-orange-600 text-slate-950 px-5 py-2 text-xs font-black uppercase tracking-wider rounded-sm border-none cursor-pointer flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
