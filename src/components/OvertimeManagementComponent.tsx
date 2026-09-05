import React, { useState, useEffect, useMemo } from 'react';
import { printHtml } from './PrintHelper';
import { 
  Clock, Check, Trash2, Printer, Plus, User, Calendar, 
  DollarSign, ClipboardList, Database, Edit, FileText, 
  Search, Users, UserPlus, X, Sun, Moon, ArrowRight, TrendingUp,
  Home
} from 'lucide-react';
import { AppUser } from '../types';

interface OvertimeManagementProps {
  operators: { name: string; rate: number; role: string; isOutsideWorker?: boolean }[];
  setOperators: React.Dispatch<React.SetStateAction<{ name: string; rate: number; role: string; isOutsideWorker?: boolean }[]>>;
  otLogs: any[];
  setOtLogs: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser: AppUser | null;
  triggerToast: (msg: string) => void;
  onBackToHome?: () => void;
}

export function OvertimeManagementComponent({ 
  operators, 
  setOperators, 
  otLogs, 
  setOtLogs, 
  currentUser, 
  triggerToast,
  onBackToHome
}: OvertimeManagementProps) {
  
  // Dashboard view states
  const [activeTab, setActiveTab] = useState<'wps_payroll' | 'daily' | 'monthly' | 'directory'>('wps_payroll');
  
  // Operator Management States
  const [showAddOpModal, setShowAddOpModal] = useState(false);
  const [newOpName, setNewOpName] = useState('');
  const [newOpRate, setNewOpRate] = useState(30);
  const [newOpRole, setNewOpRole] = useState('Mechanical Workshop Operator');
  const [newOpIsOutside, setNewOpIsOutside] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');

  // Daily Entry Terminal States
  const [activeDate, setActiveDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [selectedOpName, setSelectedOpName] = useState('');
  const [customBaseRate, setCustomBaseRate] = useState(30);
  const [dutyHours, setDutyHours] = useState(2.0);
  const [dutyShift, setDutyShift] = useState<'DAY Shift' | 'NIGHT Shift'>('DAY Shift');
  const [multiplier, setMultiplier] = useState(1.50); // Default to 1.50x per request
  const [customMultiplierInput, setCustomMultiplierInput] = useState('1.50');
  const [isCustomMultiplierMode, setIsCustomMultiplierMode] = useState(false);
  const [approvedBy, setApprovedBy] = useState('HR AUDIT STATION');

  // Sandbox-safe Deletion States (to bypass browser iframe pop-up blocks)
  const [opNameToDelete, setOpNameToDelete] = useState<string | null>(null);
  const [logIdToDelete, setLogIdToDelete] = useState<{ id: string; name: string } | null>(null);

  // Month-wise analytics selection
  const [analyticsYear, setAnalyticsYear] = useState('2026');
  const [analyticsMonth, setAnalyticsMonth] = useState('06');

  // Mobile specific helpers
  const [expandedOpMobile, setExpandedOpMobile] = useState<string | null>(null);
  const [mobileHours, setMobileHours] = useState<number>(2.0);
  const [mobileMultiplier, setMobileMultiplier] = useState<number>(1.5);
  const [mobileShift, setMobileShift] = useState<'DAY Shift' | 'NIGHT Shift'>('DAY Shift');

  // Auto-select first operator on load
  useEffect(() => {
    if (!selectedOpName && operators.length > 0) {
      handleQuickSelectOperator(operators[0]);
    }
  }, [operators]);

  // Quick select an operator and preload their rate
  const handleQuickSelectOperator = (op: typeof operators[0]) => {
    setSelectedOpName(op.name);
    setCustomBaseRate(op.rate);
  };

  // Check if an operator already has logs for the selected date
  const getOpLogsForDate = (opName: string, dateStr: string) => {
    return otLogs.filter(l => l.workerName.toUpperCase() === opName.toUpperCase() && l.dated === dateStr);
  };

  // Add a new operator to roster
  const handleCreateOperator = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = newOpName.trim().toUpperCase();
    if (!cleanName) {
      alert("Please enter operator name!");
      return;
    }
    if (operators.some(o => o.name.toUpperCase() === cleanName)) {
      alert("This operator profile already exists in the system!");
      return;
    }
    const newProfile = {
      name: cleanName,
      rate: Number(newOpRate) || 30,
      role: newOpRole.trim() || 'Workshop Technician',
      isOutsideWorker: newOpIsOutside
    };
    setOperators(prev => [...prev, newProfile]);
    setNewOpName('');
    setNewOpIsOutside(false);
    setShowAddOpModal(false);
    setSelectedOpName(cleanName);
    setCustomBaseRate(newProfile.rate);
    triggerToast(`Created active profile for ${cleanName}!`);
  };

  // Delete operator profile (sandbox-safe modal trigger)
  const handleDeleteOperator = (name: string) => {
    setOpNameToDelete(name);
  };

  const confirmDeleteOperator = () => {
    if (opNameToDelete) {
      const name = opNameToDelete;
      setOperators(prev => prev.filter(o => o.name.toUpperCase() !== name.toUpperCase()));
      if (selectedOpName.toUpperCase() === name.toUpperCase()) {
        setSelectedOpName('');
      }
      triggerToast(`Removed profile: ${name}`);
      setOpNameToDelete(null);
    }
  };

  // Mobile Log Save
  const handleMobileSaveLog = (workerName: string, hours: number, multiplierVal: number, baseRate: number, shift: 'DAY Shift' | 'NIGHT Shift') => {
    if (hours <= 0) {
      alert("Hours must be greater than zero!");
      return;
    }
    const finalPayout = parseFloat((baseRate * hours * multiplierVal).toFixed(2));
    const isOutside = !!operators.find(o => o.name.toUpperCase() === workerName.toUpperCase())?.isOutsideWorker;

    const newLog = {
      id: 'OT-' + Math.floor(1000 + Math.random() * 9000),
      workerName: workerName.toUpperCase().trim(),
      dated: activeDate,
      baseRate: baseRate,
      hours: hours,
      shift: shift,
      multiplier: multiplierVal,
      totalPayout: finalPayout,
      approvedBy: approvedBy.toUpperCase().trim(),
      isOutsideWorker: isOutside,
      checked: true
    };

    setOtLogs(prev => [newLog, ...prev]);
    triggerToast(`Logged ${hours} hrs @ ${multiplierVal}x for ${workerName}!`);
  };

  // Save overtime log
  const handleSaveOvertimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpName) {
      alert("Please select an operator profile from the list!");
      return;
    }
    if (dutyHours <= 0) {
      alert("Hours must be greater than zero!");
      return;
    }

    const multVal = isCustomMultiplierMode ? (parseFloat(customMultiplierInput) || 1.0) : multiplier;
    const finalPayout = parseFloat((customBaseRate * dutyHours * multVal).toFixed(2));
    const isOutside = !!operators.find(o => o.name.toUpperCase() === selectedOpName.toUpperCase())?.isOutsideWorker;

    const newLog = {
      id: 'OT-' + Math.floor(1000 + Math.random() * 9000),
      workerName: selectedOpName.toUpperCase().trim(),
      dated: activeDate,
      baseRate: customBaseRate,
      hours: dutyHours,
      shift: dutyShift,
      multiplier: multVal,
      totalPayout: finalPayout,
      approvedBy: approvedBy.toUpperCase().trim(),
      isOutsideWorker: isOutside,
      checked: true
    };

    setOtLogs(prev => [newLog, ...prev]);
    triggerToast(`Logged ${dutyHours} hrs @ ${multVal}x for ${selectedOpName}!`);
  };

  // Delete log (sandbox-safe modal trigger)
  const handleDeleteLog = (id: string, name: string) => {
    setLogIdToDelete({ id, name });
  };

  const confirmDeleteLog = () => {
    if (logIdToDelete) {
      const { id } = logIdToDelete;
      setOtLogs(prev => prev.filter(l => l.id !== id));
      triggerToast(`Removed log register ${id}`);
      setLogIdToDelete(null);
    }
  };

  // Memoized lists
  const filteredOperators = useMemo(() => {
    return operators.filter(o => 
      o.name.toUpperCase().includes(rosterSearch.toUpperCase()) || 
      o.role.toUpperCase().includes(rosterSearch.toUpperCase())
    );
  }, [operators, rosterSearch]);

  const activeDailyLogs = useMemo(() => {
    return otLogs.filter(l => l.dated === activeDate);
  }, [otLogs, activeDate]);

  const activeMonthlyLogs = useMemo(() => {
    return otLogs.filter(l => l.dated.startsWith(`${analyticsYear}-${analyticsMonth}`));
  }, [otLogs, analyticsYear, analyticsMonth]);

  const monthlyAggregated = useMemo(() => {
    const map: Record<string, { name: string; shifts: number; totalHours: number; totalPayout: number }> = {};
    activeMonthlyLogs.forEach(l => {
      const key = l.workerName.toUpperCase();
      if (!map[key]) {
        map[key] = { name: key, shifts: 0, totalHours: 0, totalPayout: 0 };
      }
      map[key].shifts += 1;
      map[key].totalHours += l.hours;
      map[key].totalPayout += l.totalPayout;
    });
    return Object.values(map).sort((a, b) => b.totalPayout - a.totalPayout);
  }, [activeMonthlyLogs]);

  const activeDayStats = useMemo(() => {
    const totalHours = activeDailyLogs.reduce((sum, l) => sum + l.hours, 0);
    const totalPayout = activeDailyLogs.reduce((sum, l) => sum + l.totalPayout, 0);
    return {
      activeCrewCount: new Set(activeDailyLogs.map(l => l.workerName)).size,
      totalHours,
      totalPayout
    };
  }, [activeDailyLogs]);

  // Unique Gorgeous PDF Statements 
  const handlePrintDailyStatement = () => {
    if (activeDailyLogs.length === 0) {
      alert("No telemetry records exist for this date to export!");
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MFI Daily Overtime Summary - ${activeDate}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; margin: 40px; font-size: 11px; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 12px; margin-bottom: 20px; }
          .logo-text { font-size: 14px; font-weight: 900; letter-spacing: -0.5px; }
          .title { font-size: 18px; font-weight: 900; color: #ea580c; text-transform: uppercase; margin-top: 4px; }
          .meta-info { text-align: right; font-size: 9px; color: #64748b; font-weight: bold; }
          .banner-title { background: #fff7ed; border-left: 4px solid #ea580c; padding: 10px; margin-bottom: 20px; font-size: 11px; font-weight: bold; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: left; }
          .stat-label { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
          .stat-val { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 3px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
          th { background: #0f172a; color: #ffffff; padding: 10px 8px; font-size: 9px; font-weight: 800; text-transform: uppercase; text-align: left; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 10px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .accent-text { color: #f97316; font-weight: 850; }
          .number { font-family: monospace; text-align: right; }
          .center { text-align: center; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
          .sig-box { border-top: 1.5px dashed #cbd5e1; padding-top: 15px; text-transform: uppercase; font-size: 8.5px; font-weight: bold; color: #475569; position: relative; }
          .stamp { position: absolute; top: -10px; right: 20px; font-size: 10px; color: rgba(234, 88, 12, 0.15); border: 2.5px double rgba(234, 88, 12, 0.25); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); font-weight: 900; }
          .footer { margin-top: 50px; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-text">MARINE FASTENERS INDUSTRIES L.L.C.</div>
            <div class="title">Daily Shift Work-Log Statement</div>
          </div>
          <div class="meta-info">
            <div>STATION RECONCILIATION</div>
            <div style="font-size: 11px; color: #ea580c; font-weight: 900; margin-top: 4px;">DATE: ${activeDate}</div>
            <div>DOC-ID: MFI-OTD-${activeDate.replace(/-/g, '')}</div>
          </div>
        </div>

        <div class="banner-title">
          Daily active attendance audit & registered overtime operations record sheet for Al Ramalah Workshop Forge.
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Attending Crew Operators</div>
            <div class="stat-val">${activeDayStats.activeCrewCount} Members</div>
          </div>
          <div class="stat-card" style="border-left: 3px solid #ea580c;">
            <div class="stat-label">Summated Active Hours</div>
            <div class="stat-val" style="color: #ea580c;">${activeDayStats.totalHours.toFixed(1)} Hrs</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Outlay Expense</div>
            <div class="stat-val" style="color: #0284c7;">AED ${activeDayStats.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Log ID</th>
              <th style="width: 30%;">Operator Employee Name</th>
              <th class="center" style="width: 15%;">Shift Type</th>
              <th class="number" style="width: 12%;">Hourly Wage</th>
              <th class="center" style="width: 10%;">Hours</th>
              <th class="center" style="width: 8%;">Multiplier</th>
              <th class="number" style="width: 15%;">Total Payout</th>
            </tr>
          </thead>
          <tbody>
            ${activeDailyLogs.map(l => `
              <tr>
                <td><strong>${l.id}</strong></td>
                <td><strong>${l.workerName}</strong> ${l.isOutsideWorker ? '<span style="font-size: 7px; background: #f3e8ff; color: #7c3aed; padding: 1px 3px; border-radius: 2px;">Outside</span>' : ''}</td>
                <td class="center" style="font-weight: 500;">${l.shift.replace(' Shift', '')}</td>
                <td class="number">AED ${l.baseRate.toFixed(2)}</td>
                <td class="center" style="font-weight: bold;">${l.hours} H</td>
                <td class="center text-orange-600 font-bold">${l.multiplier}x</td>
                <td class="number accent-text">AED ${l.totalPayout.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #f1f5f9; font-weight: 900; border-top: 2px solid #0f172a;">
              <td colspan="4" style="text-align: right; text-transform: uppercase;">Consolidated Payout Amount:</td>
              <td class="center">${activeDayStats.totalHours.toFixed(1)} H</td>
              <td class="center">—</td>
              <td class="number" style="color: #ea580c; font-size: 11px;">AED ${activeDayStats.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures" style="margin-top: 60px;">
          <div class="sig-box">
            <div>PREPARED BY TIME-KEEPER</div>
            <div style="font-size: 7px; color: #94a3b8; margin-top: 30px;">AUTH SIGNATURE & DATE</div>
          </div>
          <div class="sig-box">
            <div class="stamp">APPROVED</div>
            <div>HR DIRECTOR / FACTORY SUPERINTENDENT ATTESTATION</div>
            <div style="font-size: 7px; color: #94a3b8; margin-top: 30px;">AUTH SIGNATURE & DATE</div>
          </div>
        </div>

        <div class="footer">
          Marine Fasteners Industries LLC • Registered in Ajman Real Estate / Forge Sector Hub UAE. 
        </div>
      </body>
      </html>
    `;
    printHtml(htmlContent, `MFI_Daily_OT_${activeDate}`);
  };

  const handlePrintMonthlyStatement = () => {
    if (activeMonthlyLogs.length === 0) {
      alert("No logs registered in this calendar period!");
      return;
    }
    const totalHours = activeMonthlyLogs.reduce((sum, l) => sum + l.hours, 0);
    const totalPayout = activeMonthlyLogs.reduce((sum, l) => sum + l.totalPayout, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MFI Monthly Overtime Sheet - ${analyticsYear}-${analyticsMonth}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; margin: 40px; font-size: 11px; line-height: 1.4; }
          .header { text-align: justify; margin-bottom: 25px; border-bottom: 2px solid #0f172a; padding-bottom: 15px; }
          .co-name { font-size: 13px; font-weight: 900; letter-spacing: -0.5px; }
          .title { font-size: 18px; font-weight: 900; color: #3b82f6; text-transform: uppercase; margin-top: 3px; }
          .meta { font-size: 8.5px; color: #64748b; font-weight: 800; text-transform: uppercase; margin-top: 6px; }
          .summary-band { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .band-block { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; text-align: left; }
          .block-lbl { font-size: 7.5px; text-transform: uppercase; color: #1d4ed8; font-weight: 900; }
          .block-val { font-size: 15px; font-weight: 850; color: #1e3a8a; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #cbd5e1; }
          th { background: #1e293b; color: white; padding: 8px; font-size: 8.5px; text-transform: uppercase; text-align: center; font-weight: bold; }
          td { border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; }
          tr:nth-child(even) td { background-color: #f8fafc; }
          .number { font-family: monospace; text-align: right; }
          .bold { font-weight: bold; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 45px; }
          .sig-box { border: 1.5px solid #1e293b; border-radius: 4px; padding: 12px; text-transform: uppercase; font-size: 8px; font-weight: bold; color: #1e293b; }
          .footer { margin-top: 40px; font-size: 8px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="co-name">MARINE FASTENERS INDUSTRIES L.L.C.</div>
          <div class="title">AGGREGATED MONTHLY OVERTIME RECONCILIATION</div>
          <div class="meta">
            AUDIT YEAR & MONTH: ${analyticsYear}-${analyticsMonth} &nbsp;|&nbsp; GENERATED BY HR CONTROL TERMINAL 
          </div>
        </div>

        <div class="summary-band">
          <div class="band-block">
            <div class="block-lbl">Calendar Month</div>
            <div class="block-val">${analyticsYear} - Month ${analyticsMonth}</div>
          </div>
          <div class="band-block">
            <div class="block-lbl">Roster Members Logging OT</div>
            <div class="block-val">${monthlyAggregated.length} Operators</div>
          </div>
          <div class="band-block" style="background-color: #f0fdf4; border-color: #bbf7d0;">
            <div class="block-lbl" style="color: #15803d;">Total Logged Hours</div>
            <div class="block-val" style="color: #14532d;">${totalHours.toFixed(1)} Hrs</div>
          </div>
          <div class="band-block" style="background-color: #fff7ed; border-color: #fed7aa;">
            <div class="block-lbl" style="color: #9a3412;">Est total payroll expense</div>
            <div class="block-val" style="color: #7c2d12;">AED ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <h3 style="font-size: 10px; text-transform: uppercase; margin-bottom: 8px; border-left: 3px solid #3b82f6; padding-left: 6px;">
          Operator Cumulative Ledger Statement ($Month ${analyticsMonth})
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Serial</th>
              <th style="text-align: left; padding-left: 12px;">Employee Operator Name</th>
              <th style="width: 20%;">Total Logged Attendance Shifts</th>
              <th style="width: 20%;">Aggregate OT Hours</th>
              <th style="width: 25%; text-align: right; padding-right: 12px;">Summated Overtime Payout</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyAggregated.map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td style="text-align: left; padding-left: 12px;"><strong>${row.name}</strong></td>
                <td><strong>${row.shifts} Shifts</strong></td>
                <td><strong>${row.totalHours.toFixed(1)} Hrs</strong></td>
                <td class="number bold" style="color: #1e3a8a; padding-right: 12px;">AED ${row.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #f1f5f9; font-weight: 900; font-size: 11px; border-top: 2px solid #1e293b;">
              <td colspan="2" style="text-align: right; padding-right: 12px; text-transform: uppercase;">System Ledger Summarized Totals:</td>
              <td>${activeMonthlyLogs.length} Records</td>
              <td>${totalHours.toFixed(1)} Hrs</td>
              <td class="number" style="color: #b91c1c; padding-right: 12px;">AED ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div>AUDITED AND PREPARED BY</div>
            <div style="margin-top: 35px; border-bottom: 1px dashed #475569; width: 85%;"></div>
            <div style="font-size: 6.5px; color: #64748b; margin-top: 4px;">FINANCES / PAYROLL STAKEHOLDER SIGNATURE & DATE</div>
          </div>
          <div class="sig-box">
            <div>AUTHORIZED BY FACTORY HEAD</div>
            <div style="margin-top: 35px; border-bottom: 1px dashed #475569; width: 85%;"></div>
            <div style="font-size: 6.5px; color: #64748b; margin-top: 4px;">OFFICIAL CO. STAMP & APPROVAL RELEASE</div>
          </div>
        </div>

        <div class="footer">
          Marine Fasteners Industries LLC • Confidential Financial Roster Report • Al Ramalah Forge, Ajman, UAE
        </div>
      </body>
      </html>
    `;
    printHtml(htmlContent, `MFI_OT_Ledger_${analyticsYear}_${analyticsMonth}`);
  };

  const handlePrintOperatorStatement = (workerName: string) => {
    const operatorLogs = otLogs.filter(l => l.workerName.toUpperCase() === workerName.toUpperCase())
      .sort((a, b) => b.dated.localeCompare(a.dated));

    const opProfile = operators.find(o => o.name.toUpperCase() === workerName.toUpperCase()) || {
      name: workerName.toUpperCase(),
      role: "Workshop Operator",
      rate: operatorLogs[0]?.baseRate || 30,
      isOutsideWorker: operatorLogs[0]?.isOutsideWorker || false
    };

    const totalHours = operatorLogs.reduce((sum, l) => sum + l.hours, 0);
    const totalPayout = operatorLogs.reduce((sum, l) => sum + l.totalPayout, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MFI Operator Ledger - ${workerName}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; margin: 40px; font-size: 11px; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
          .logo-text { font-size: 13px; font-weight: 900; letter-spacing: -0.5px; }
          .title { font-size: 16px; font-weight: 900; color: #1d4ed8; text-transform: uppercase; margin-top: 4px; }
          .meta-info { text-align: right; font-size: 9px; color: #64748b; font-weight: bold; }
          
          .profile-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; margin-bottom: 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
          .profile-details h2 { font-size: 16px; font-weight: 900; margin: 0 0 4px 0; color: #0f172a; text-transform: uppercase; }
          .profile-details p { font-size: 9px; color: #64748b; font-weight: 800; text-transform: uppercase; margin: 0; }
          .profile-badge { font-size: 10px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; px: 2px; py: 0.5px; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-top: 8px; }
          .contact-badge { font-size: 10px; background: #f3e8ff; border: 1px solid #d8b4fe; color: #6b21a8; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-top: 8px; }
          
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
          .stat-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: left; }
          .stat-card.blue { background: #eff6ff; border: 1px solid #bfdbfe; }
          .stat-label { font-size: 8px; text-transform: uppercase; color: #1e40af; font-weight: 800; letter-spacing: 0.5px; }
          .stat-card .stat-label { color: #166534; }
          .stat-card.blue .stat-label { color: #1e40af; }
          .stat-val { font-size: 15px; font-weight: 850; color: #1e3a8a; margin-top: 3px; }
          .stat-card .stat-val { color: #14532d; }
          .stat-card.blue .stat-val { color: #1e3a8a; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
          th { background: #0f172a; color: #ffffff; padding: 10px 8px; font-size: 9px; font-weight: 800; text-transform: uppercase; text-align: left; }
          td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 10px; text-align: left; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .accent-text { color: #2563eb; font-weight: 850; }
          .number { font-family: monospace; text-align: right; }
          .center { text-align: center; }
          
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
          .sig-box { border-top: 1.5px dashed #cbd5e1; padding-top: 15px; text-transform: uppercase; font-size: 8.5px; font-weight: bold; color: #475569; position: relative; }
          .stamp { position: absolute; top: -10px; right: 20px; font-size: 10px; color: rgba(37, 99, 235, 0.15); border: 2.5px double rgba(37, 99, 235, 0.25); border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); font-weight: 900; }
          .footer { margin-top: 50px; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: center; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo-text">MARINE FASTENERS INDUSTRIES L.L.C.</div>
            <div class="title">Personnel Overtime Statement</div>
          </div>
          <div class="meta-info">
            <div>STATION RECONCILIATION</div>
            <div style="font-size: 11px; color: #2563eb; font-weight: 900; margin-top: 4px;">DATE: ${new Date().toISOString().substring(0, 10)}</div>
            <div>DOC-ID: MFI-EMP-${workerName.replace(/\s+/g, '')}</div>
          </div>
        </div>

        <div class="profile-card">
          <div class="profile-details">
            <h2>${opProfile.name}</h2>
            <p>Designated Role: ${opProfile.role}</p>
            ${opProfile.isOutsideWorker 
              ? `<span class="contact-badge">Outside Contractor Labor</span>` 
              : `<span class="profile-badge">Permanent Workshop Crew</span>`}
          </div>
          <div style="text-align: right; border-left: 1px solid #cbd5e1; padding-left: 20px; display: flex; flex-direction: column; justify-content: center;">
            <p style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; margin: 0 0 2px 0;">Standard Rate</p>
            <strong style="font-size: 14px; font-weight: 900; color: #0f172a; font-family: monospace;">AED ${opProfile.rate.toFixed(2)}/h</strong>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-label">Total Logged Shifts</div>
            <div class="stat-val">${operatorLogs.length} Records</div>
          </div>
          <div class="stat-card blue">
            <div class="stat-label">Cumulative Hours</div>
            <div class="stat-val">${totalHours.toFixed(1)} Hrs</div>
          </div>
          <div class="stat-card" style="border-left: 3px solid #16a34a;">
            <div class="stat-label">Earnings Outlay Payout</div>
            <div class="stat-val" style="color: #15803d;">AED ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <h3 style="font-size: 10px; text-transform: uppercase; margin-bottom: 8px; border-left: 3px solid #2563eb; padding-left: 6px;">
          Registered Overtime Ledger Details
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Log ID</th>
              <th style="width: 20%;">Shift Date</th>
              <th class="center" style="width: 15%;">Shift Period</th>
              <th class="number" style="width: 15%;">Hour Rate</th>
              <th class="center" style="width: 10%;">Hrs Worked</th>
              <th class="center" style="width: 10%;">Multiplier</th>
              <th class="number" style="width: 15%;">Total Payout</th>
            </tr>
          </thead>
          <tbody>
            ${operatorLogs.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; color: #94a3b8; padding: 25px; font-style: italic; font-weight: 500; font-size: 11px;">
                  No active overtime records officially registered for this personnel in the database period.
                </td>
              </tr>
            ` : operatorLogs.map(l => `
              <tr>
                <td><strong>${l.id}</strong></td>
                <td><strong>${l.dated}</strong></td>
                <td class="center" style="font-weight: 500;">${l.shift.replace(' Shift', '')}</td>
                <td class="number">AED ${l.baseRate.toFixed(2)}</td>
                <td class="center" style="font-weight: bold;">${l.hours} H</td>
                <td class="center" style="color: #ea580c; font-weight: bold;">${l.multiplier}x</td>
                <td class="number accent-text">AED ${l.totalPayout.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="background-color: #f1f5f9; font-weight: 900; border-top: 2px solid #0f172a;">
              <td colspan="4" style="text-align: right; text-transform: uppercase;">Consolidated Cumulative Overtime Balance:</td>
              <td class="center">${totalHours.toFixed(1)} H</td>
              <td class="center">—</td>
              <td class="number" style="color: #2563eb; font-size: 11px;">AED ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <div>AUDITED AND PREPARED BY</div>
            <div style="font-size: 7px; color: #94a3b8; margin-top: 30px;">AUTH SIGNATURE & DATE</div>
          </div>
          <div class="sig-box">
            <div class="stamp">APPROVED</div>
            <div>AUTHORIZED HR DIRECTOR / FACTORY HEAD STATEMENT</div>
            <div style="font-size: 7px; color: #94a3b8; margin-top: 30px;">AUTH SIGNATURE & DATE</div>
          </div>
        </div>

        <div class="footer">
          Marine Fasteners Industries LLC • Confidential Individual Personnel Overtime Audit • Al Ramalah Forge, Ajman, UAE
        </div>
      </body>
      </html>
    `;
    printHtml(htmlContent, `MFI_OT_Report_${workerName.replace(/\s+/g, '_')}`);
  };

  // --- WPS & PAYROLL STATE & HELPERS ---
  const [payrollAdjustments, setPayrollAdjustments] = useState<Record<string, { empId?: string; basicSalary?: number; allowance?: number; deduction?: number; iban?: string; paymentStatus?: 'Pending' | 'Approved' | 'Paid via WPS' }>>(() => {
    try {
      const saved = localStorage.getItem('MFI_WPS_PAYROLL_ADJUSTMENTS');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return {};
  });

  const handleUpdatePayrollAdj = (opName: string, field: string, value: any) => {
    setPayrollAdjustments(prev => {
      const current = prev[opName] || {};
      const updated = { ...prev, [opName]: { ...current, [field]: value } };
      try {
        localStorage.setItem('MFI_WPS_PAYROLL_ADJUSTMENTS', JSON.stringify(updated));
      } catch (e) { console.error(e); }
      return updated;
    });
  };

  const wpsPayrollRows = useMemo(() => {
    return operators.map((op, idx) => {
      const adj = payrollAdjustments[op.name] || {};
      const empId = adj.empId || `EMP-${1001 + idx}`;
      const basicSalary = adj.basicSalary !== undefined ? Number(adj.basicSalary) : Number((op.rate * 8 * 22).toFixed(2));
      const allowance = adj.allowance !== undefined ? Number(adj.allowance) : 600;
      const deduction = adj.deduction !== undefined ? Number(adj.deduction) : 0;
      const iban = adj.iban || 'AE940400000242715908001';
      const paymentStatus = adj.paymentStatus || 'Pending';

      const otEntry = monthlyAggregated.find(m => m.name.toUpperCase() === op.name.toUpperCase());
      const otHours = otEntry ? otEntry.totalHours : 0;
      const otPayout = otEntry ? otEntry.totalPayout : 0;

      const netPayable = basicSalary + allowance + otPayout - deduction;

      return {
        name: op.name,
        role: op.role,
        rate: op.rate,
        isOutsideWorker: op.isOutsideWorker,
        empId,
        basicSalary,
        allowance,
        deduction,
        iban,
        paymentStatus,
        otHours,
        otPayout,
        netPayable
      };
    });
  }, [operators, payrollAdjustments, monthlyAggregated]);

  const handleBatchApproveWps = () => {
    const updated = { ...payrollAdjustments };
    operators.forEach(op => {
      updated[op.name] = { ...(updated[op.name] || {}), paymentStatus: 'Approved' };
    });
    setPayrollAdjustments(updated);
    try { localStorage.setItem('MFI_WPS_PAYROLL_ADJUSTMENTS', JSON.stringify(updated)); } catch (e) {}
    triggerToast("All personnel salary records batch marked as APPROVED!");
  };

  const handleBatchPaidWps = () => {
    const updated = { ...payrollAdjustments };
    operators.forEach(op => {
      updated[op.name] = { ...(updated[op.name] || {}), paymentStatus: 'Paid via WPS' };
    });
    setPayrollAdjustments(updated);
    try { localStorage.setItem('MFI_WPS_PAYROLL_ADJUSTMENTS', JSON.stringify(updated)); } catch (e) {}
    triggerToast("All personnel wage payments marked as PAID VIA RAK BANK WPS!");
  };

  const handleDownloadSifFile = () => {
    if (wpsPayrollRows.length === 0) {
      alert("No active staff records found for WPS file generation.");
      return;
    }
    const headers = ["Employer TRN", "Employer Bank Routing Code", "Employee ID", "Employee Name", "Employee IBAN", "Pay Period", "Number of Days", "Fixed Basic Salary", "Variable Allowance & OT", "Deductions", "Net Disbursed Amount"];
    const rows = wpsPayrollRows.map(r => [
      "100440509600003",
      "RAKBAEAK",
      r.empId,
      `"${r.name}"`,
      r.iban,
      `${analyticsYear}-${analyticsMonth}`,
      "30",
      r.basicSalary.toFixed(2),
      (r.allowance + r.otPayout).toFixed(2),
      r.deduction.toFixed(2),
      r.netPayable.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MFI_WPS_SIF_${analyticsYear}_${analyticsMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`WPS Salary Information File (.CSV) generated successfully for ${analyticsYear}-${analyticsMonth}!`);
  };

  const handlePrintMasterPayrollSheet = () => {
    const totalBasic = wpsPayrollRows.reduce((sum, r) => sum + r.basicSalary, 0);
    const totalAllow = wpsPayrollRows.reduce((sum, r) => sum + r.allowance, 0);
    const totalOT = wpsPayrollRows.reduce((sum, r) => sum + r.otPayout, 0);
    const totalDed = wpsPayrollRows.reduce((sum, r) => sum + r.deduction, 0);
    const totalNet = wpsPayrollRows.reduce((sum, r) => sum + r.netPayable, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Master Payroll & WPS Salary Sheet - ${analyticsMonth}/${analyticsYear}</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #0f172a; margin: 30px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; }
          .title { font-size: 13px; color: #ea580c; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
          .meta { text-align: right; font-size: 10px; color: #64748b; font-weight: bold; }
          .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
          .kpi-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; }
          .kpi-lbl { font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; }
          .kpi-val { font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 4px; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #cbd5e1; }
          th { background: #0f172a; color: #ffffff; padding: 8px 6px; text-align: left; text-transform: uppercase; font-size: 8px; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px 6px; }
          .right { text-align: right; font-family: monospace; font-weight: bold; }
          .sigs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 45px; }
          .sig-line { border-top: 1.5px dashed #94a3b8; padding-top: 10px; font-size: 8.5px; font-weight: bold; color: #475569; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">MARINE FASTENERS INDUSTRIES L.L.C.</div>
            <div class="title">Official Master Payroll & WPS Register • ${analyticsMonth}/${analyticsYear}</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">WPS Employer Routing: RAKBAEAK | TRN: 100440509600003</div>
          </div>
          <div class="meta">
            <div>GENERATED: ${new Date().toISOString().split('T')[0]}</div>
            <div>STATUS: VERIFIED & BALANCED</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box"><div class="kpi-lbl">Total Staff</div><div class="kpi-val">${wpsPayrollRows.length} Members</div></div>
          <div class="kpi-box"><div class="kpi-lbl">Basic Salaries</div><div class="kpi-val">AED ${totalBasic.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div>
          <div class="kpi-box"><div class="kpi-lbl">Allowances</div><div class="kpi-val">AED ${totalAllow.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div>
          <div class="kpi-box"><div class="kpi-lbl">Overtime Payout</div><div class="kpi-val" style="color: #ea580c;">AED ${totalOT.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div>
          <div class="kpi-box" style="background: #ecfdf5; border-color: #10b981;"><div class="kpi-lbl" style="color: #047857;">Net Monthly Payable</div><div class="kpi-val" style="color: #047857;">AED ${totalNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Employee Profile</th>
              <th>Bank IBAN</th>
              <th class="right">Basic (AED)</th>
              <th class="right">Allow. (AED)</th>
              <th class="right">OT Pay (AED)</th>
              <th class="right">Deduct. (AED)</th>
              <th class="right">Net Pay (AED)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${wpsPayrollRows.map(r => `
              <tr>
                <td style="font-family: monospace; font-weight: bold;">${r.empId}</td>
                <td><strong>${r.name}</strong><br><span style="font-size: 7.5px; color: #64748b;">${r.role}</span></td>
                <td style="font-family: monospace; font-size: 8px;">${r.iban}</td>
                <td class="right">${r.basicSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right">${r.allowance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right" style="color: #ea580c;">${r.otPayout.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="right" style="color: #dc2626;">${r.deduction > 0 ? '-' + r.deduction.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
                <td class="right" style="font-weight: 900; color: #059669; font-size: 10px;">${r.netPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td style="font-weight: bold; font-size: 8px;">${r.paymentStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="sigs">
          <div class="sig-line">Prepared By HR & Payroll Officer</div>
          <div class="sig-line">Audited By Financial Controller</div>
          <div class="sig-line">Authorized By Managing Director</div>
        </div>
      </body>
      </html>
    `;
    printHtml(htmlContent, `MFI_Master_Payroll_${analyticsYear}_${analyticsMonth}`);
  };

  const handlePrintPayslip = (row: typeof wpsPayrollRows[0]) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${row.name} - ${analyticsMonth}/${analyticsYear}</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #0f172a; margin: 40px; }
          .slip-box { border: 2px solid #0f172a; border-radius: 12px; padding: 25px; max-width: 650px; margin: 0 auto; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .logo { font-size: 16px; font-weight: 900; }
          .title { font-size: 12px; color: #ea580c; font-weight: 800; text-transform: uppercase; margin-top: 3px; }
          .emp-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #0f172a; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
          td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
          .net-banner { background: #ecfdf5; border: 1.5px solid #10b981; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          .sig-row { display: flex; justify-content: space-between; margin-top: 45px; font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="slip-box">
          <div class="header">
            <div>
              <div class="logo">MARINE FASTENERS INDUSTRIES L.L.C.</div>
              <div class="title">Employee Monthly Salary Slip • ${analyticsMonth}/${analyticsYear}</div>
            </div>
            <div style="text-align: right; font-size: 10px; font-weight: bold;">
              <div>WPS REF: RAKBAEAK</div>
              <div>DATE: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="emp-details">
            <div><strong>Employee ID:</strong> ${row.empId}</div>
            <div><strong>Bank IBAN:</strong> ${row.iban}</div>
            <div><strong>Name:</strong> ${row.name}</div>
            <div><strong>Standard Rate:</strong> AED ${row.rate.toFixed(2)} / Hour</div>
            <div><strong>Designation:</strong> ${row.role}</div>
            <div><strong>Status:</strong> ${row.paymentStatus}</div>
          </div>

          <table>
            <thead>
              <tr><th>Earnings & Allowance Item</th><th style="text-align: right;">Amount (AED)</th></tr>
            </thead>
            <tbody>
              <tr><td>Fixed Basic Salary (22 Days Standard)</td><td style="text-align: right; font-family: monospace;">${row.basicSalary.toFixed(2)}</td></tr>
              <tr><td>Housing & Transport Allowance</td><td style="text-align: right; font-family: monospace;">${row.allowance.toFixed(2)}</td></tr>
              <tr><td>Overtime Earnings (${row.otHours.toFixed(1)} Logged Hours)</td><td style="text-align: right; font-family: monospace; color: #ea580c; font-weight: bold;">${row.otPayout.toFixed(2)}</td></tr>
              <tr><td style="color: #dc2626;">Less Deductions / Salary Advances</td><td style="text-align: right; font-family: monospace; color: #dc2626;">-${row.deduction.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <div class="net-banner">
            <div>
              <div style="font-size: 9px; font-weight: 800; color: #047857; text-transform: uppercase;">Net Payable Salary (Disbursed via WPS)</div>
              <div style="font-size: 10px; color: #065f46; margin-top: 2px;">Direct Deposit into ${row.iban.substring(0, 8)}...</div>
            </div>
            <div style="font-size: 20px; font-weight: 900; color: #047857; font-family: monospace;">
              AED ${row.netPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>

          <div class="sig-row">
            <div>Employer Authorization Stamp</div>
            <div>Employee Signature Confirmation</div>
          </div>
        </div>
      </body>
      </html>
    `;
    printHtml(htmlContent, `Payslip_${row.empId}_${analyticsYear}_${analyticsMonth}`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER COCKPIT */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border text-left border-slate-700 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 z-10">
          <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 border border-orange-500/20 shadow-inner">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-[8px] text-orange-400 uppercase font-bold tracking-widest font-mono">Workshop Control Deck</span>
            <h2 className="font-sans text-lg font-bold uppercase text-white mt-0.5 tracking-tight flex items-center gap-2">
              WPS Payroll & Overtime Station 
              <span className="text-[10px] bg-orange-500 text-white font-mono rounded px-1.5 py-0.5 border border-orange-400">v3.0</span>
            </h2>
          </div>
        </div>
        
        {/* Rapid action buttons */}
        <div className="flex flex-wrap items-center gap-2 z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('wps_payroll')}
            className={`flex-1 sm:flex-none px-4 py-2 font-mono text-[9px] font-bold uppercase rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeTab === 'wps_payroll' 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-102 font-bold' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            💰 WPS & Payroll Hub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex-1 sm:flex-none px-4 py-2 font-mono text-[9px] font-bold uppercase rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeTab === 'daily' 
                ? 'bg-orange-500 text-white border-orange-400 shadow-md scale-102 font-bold' 
                : 'bg-slate-800 text-slate-305 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            ⚡ Daily Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 sm:flex-none px-4 py-2 font-mono text-[9px] font-bold uppercase rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeTab === 'monthly' 
                ? 'bg-orange-500 text-white border-orange-400 shadow-md scale-102 font-bold' 
                : 'bg-slate-800 text-slate-305 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 Monthly Statements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`flex-1 sm:flex-none px-4 py-2 font-mono text-[9px] font-bold uppercase rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 border cursor-pointer ${
              activeTab === 'directory' 
                ? 'bg-orange-500 text-white border-orange-400 shadow-md scale-102 font-bold' 
                : 'bg-slate-800 text-slate-305 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👥 Crew Directory
          </button>
        </div>
      </div>

      {/* MOBILE-ONLY COMPACT TERMINAL VIEW (Just showing member name lists, daily wise reports, monthly/yearly filters & PDF print triggers) */}
      <div className="block lg:hidden space-y-4">
        {/* Double-Click Back to Home Button */}
        {onBackToHome && (
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm flex items-center justify-between gap-3 text-left">
            <button
              type="button"
              onDoubleClick={onBackToHome}
              onClick={() => {
                triggerToast("Double-click / Double-tap here to return to Home Page!");
              }}
              className="flex items-center gap-2 bg-slate-50 border border-slate-250 p-2 rounded-xl shadow-3xs cursor-pointer select-none active:scale-95 transition-all text-slate-800 hover:bg-slate-100"
              title="Double-click to return to home page"
            >
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 shrink-0">
                <Home className="w-4 h-4 text-[#f37021]" />
              </div>
              <div className="font-sans text-[9px] font-bold uppercase leading-none">
                RETURN TO
                <span className="block text-[#f37021] text-[8px] font-bold mt-0.5">HOME</span>
              </div>
            </button>
            <div className="text-[10px] font-sans text-slate-400 font-bold max-w-[150px] leading-tight text-right">
              Double-click button to exit Overtime Deck.
            </div>
          </div>
        )}

        {/* MONTHLY AND YEARLY FILTER */}
        <div className="bg-slate-900 border text-white rounded-2xl p-4 space-y-3 border-slate-700">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">📅 Calendar Parameters</span>
            <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 font-bold rounded-md font-mono text-orange-400">
              Active Date: {activeDate}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Year Filter</label>
              <select 
                value={analyticsYear} 
                onChange={(e) => setAnalyticsYear(e.target.value)} 
                className="w-full p-2.5 text-xs font-mono font-bold border border-slate-700 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                <option value="2027">2027</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div>
              <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Month Filter</label>
              <select 
                value={analyticsMonth} 
                onChange={(e) => setAnalyticsMonth(e.target.value)} 
                className="w-full p-2.5 text-xs font-mono font-bold border border-slate-700 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
              >
                {[
                  { val: '01', label: '01 - January' },
                  { val: '02', label: '02 - February' },
                  { val: '03', label: '03 - March' },
                  { val: '04', label: '04 - April' },
                  { val: '05', label: '05 - May' },
                  { val: '06', label: '06 - June' },
                  { val: '07', label: '07 - July' },
                  { val: '08', label: '08 - August' },
                  { val: '09', label: '09 - September' },
                  { val: '10', label: '10 - October' },
                  { val: '11', label: '11 - November' },
                  { val: '12', label: '12 - December' }
                ].map(m => (
                  <option key={m.val} value={m.val}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-1 flex flex-col gap-2 text-left">
            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold block">Daily Report Date</span>
            <input 
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="w-full p-2.5 text-xs font-mono font-semibold border border-slate-700 rounded-xl bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* PRIMARY REPORT EXPORTS FOR MONTH & DAYS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 text-left">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">🖨️ Consolidated PDF Reports</span>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={handlePrintMonthlyStatement}
              className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              <Printer className="w-4 h-4 text-white" /> Print Monthly PDF (Everyone)
            </button>
            
            <button
              type="button"
              onClick={handlePrintDailyStatement}
              disabled={activeDailyLogs.length === 0}
              className="w-full p-3 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              <Printer className="w-4 h-4 text-orange-400" /> Export Daily Statement PDF
            </button>
          </div>
        </div>

        {/* STAFF DIRECTORY ROSTER WITH SEARCH */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 text-left">
          <div className="flex justify-between items-center border-b pb-2 border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">👥 Personnel Overtime Registry</span>
            <span className="text-[8px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded font-mono">
              {filteredOperators.length} Active Profiles
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text"
              placeholder="Search member name ... "
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              className="w-full bg-slate-50 pl-9 pr-4 py-2.5 text-xs text-slate-800 border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold placeholder-slate-400 uppercase"
            />
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredOperators.slice(0, 45).map(op => {
              const opLogs = otLogs.filter(l => l.workerName.toUpperCase() === op.name.toUpperCase());
              const isExpanded = expandedOpMobile === op.name;
              
              // Filter logs in current active month/year specifically
              const activeMonthLogs = opLogs.filter(l => l.dated.startsWith(`${analyticsYear}-${analyticsMonth}`));
              const currentMonthHours = activeMonthLogs.reduce((sum, l) => sum + l.hours, 0);
              const currentMonthPayout = activeMonthLogs.reduce((sum, l) => sum + l.totalPayout, 0);

              return (
                <div key={op.name} className="border border-slate-100 rounded-xl space-y-2 bg-slate-50/50 hover:bg-slate-100 p-3 transition-all text-left">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-[11.5px] font-bold text-slate-900 uppercase tracking-tight">{op.name}</h4>
                      <p className="text-[8.5px] text-slate-500 uppercase font-bold">{op.role}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-[7.5px] font-mono bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                          AED {op.rate}/h standard
                        </span>
                        {activeMonthLogs.length > 0 && (
                          <span className="text-[7.5px] font-mono bg-orange-50 text-orange-600 border border-orange-100 font-semibold px-1.5 py-0.5 rounded">
                            {currentMonthHours.toFixed(1)} Hrs (AED {currentMonthPayout})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action button */}
                    <button
                      type="button"
                      onClick={() => handlePrintOperatorStatement(op.name)}
                      className="p-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-[8.5px] font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                      title="Export individual personal statement report"
                    >
                      <Printer className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DAILY WISE WORKSPACE RECORDS LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 text-left">
          <div className="flex justify-between items-center border-b pb-2 border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">📋 Daily Wise Records Log</span>
            <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded font-mono">
              {activeDailyLogs.reduce((sum, l) => sum + l.hours, 0).toFixed(1)} Hrs Total
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {activeDailyLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl space-y-1">
                <Database className="w-5 h-5 mx-auto text-slate-300 stroke-1" />
                <p className="text-[9px] font-bold uppercase text-slate-400">Empty Roster Logs Today</p>
                <p className="text-[8.5px] text-slate-500">Tap profiles above to log task hours!</p>
              </div>
            ) : (
              activeDailyLogs.map(l => (
                <div key={l.id} className="border border-slate-100 rounded-xl p-3 bg-white hover:bg-slate-50 transition-all flex items-center justify-between text-left">
                  <div className="space-y-0.5">
                    <span className="block text-[10.5px] font-bold uppercase text-slate-900 tracking-tight">{l.workerName}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <span className="text-[7.5px] font-mono bg-orange-50 text-orange-600 font-bold px-1 py-0.2 rounded">
                        {l.hours} Hrs
                      </span>
                      <span className="text-[7.5px] font-mono bg-purple-50 text-purple-600 font-bold px-1 py-0.2 rounded">
                        {l.shift.replace(' Shift', '')}
                      </span>
                      <span className="text-[7.5px] font-mono bg-blue-50 text-blue-600 font-bold px-1 py-0.2 rounded">
                        {l.multiplier}x multiplier
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-mono font-bold text-slate-800 shrink-0">AED {l.totalPayout}</strong>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(l.id, l.workerName)}
                      className="p-1 px-1.5 rounded-lg text-slate-450 hover:text-red-650 font-mono text-[9px] border border-transparent hover:bg-red-50 transition-all cursor-pointer border-none"
                      title="Void log row"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TAB 0: WPS & MONTHLY PAYROLL GENERATOR HUB */}
      {activeTab === 'wps_payroll' && (
        <div className="bg-white border text-left border-slate-200 rounded-2xl p-5 space-y-6 shadow-sm">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] font-mono uppercase rounded-md mb-1">
                <span>🇦🇪 UAE LABOR COMPLIANT</span>
                <span>•</span>
                <span>SIF GENERATOR READY</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">WPS & MONTHLY PAYROLL DISBURSEMENT STATION</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Auto-links basic salaries with verified monthly overtime payouts for seamless bank file (.SIF) creation.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border p-1.5 rounded-xl">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-1">Period:</span>
                <select 
                  value={analyticsYear} 
                  onChange={(e) => setAnalyticsYear(e.target.value)} 
                  className="p-1 text-xs outline-none font-bold font-mono border rounded bg-white text-slate-800 cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
                <select 
                  value={analyticsMonth} 
                  onChange={(e) => setAnalyticsMonth(e.target.value)} 
                  className="p-1 text-xs outline-none font-bold font-mono border rounded bg-white text-slate-800 cursor-pointer"
                >
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                    <option key={m} value={m}>Month {m}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleBatchApproveWps}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Batch Approve All
              </button>

              <button
                type="button"
                onClick={handleBatchPaidWps}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" /> Mark All Paid (WPS)
              </button>

              <button
                type="button"
                onClick={handleDownloadSifFile}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Download RAK Bank .SIF File
              </button>

              <button
                type="button"
                onClick={handlePrintMasterPayrollSheet}
                className="px-3 py-2 bg-[#f37021] hover:bg-orange-600 text-white font-bold text-[10px] uppercase rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Master Sheet
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-50 border p-4 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide font-mono">Active Crew Count</span>
              <strong className="block text-lg mt-1 font-mono text-slate-800">{wpsPayrollRows.length} Employees</strong>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide font-mono">Total Basic Salaries</span>
              <strong className="block text-lg mt-1 font-mono text-slate-800">
                AED {wpsPayrollRows.reduce((sum, r) => sum + r.basicSalary, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </strong>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide font-mono">Total Allowances</span>
              <strong className="block text-lg mt-1 font-mono text-slate-800">
                AED {wpsPayrollRows.reduce((sum, r) => sum + r.allowance, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </strong>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl border-l-4 border-l-orange-500">
              <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide font-mono">Overtime Payout Linked</span>
              <strong className="block text-lg mt-1 font-mono text-orange-600">
                AED {wpsPayrollRows.reduce((sum, r) => sum + r.otPayout, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </strong>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl border-l-4 border-l-emerald-600 shadow-xs">
              <span className="block text-[9px] uppercase font-bold text-emerald-800 tracking-wide font-mono">Net Monthly Payable</span>
              <strong className="block text-xl mt-1 font-mono text-emerald-700">
                AED {wpsPayrollRows.reduce((sum, r) => sum + r.netPayable, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </strong>
            </div>
          </div>

          {/* Interactive Table */}
          <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono uppercase text-[9px]">
                  <th className="p-3">Emp ID</th>
                  <th className="p-3">Employee Name & Role</th>
                  <th className="p-3">Bank IBAN (RAK / ENBD)</th>
                  <th className="p-3 text-right">Basic Salary</th>
                  <th className="p-3 text-right">Allowances</th>
                  <th className="p-3 text-right">Linked OT Pay</th>
                  <th className="p-3 text-right">Deduction</th>
                  <th className="p-3 text-right">Net Payable</th>
                  <th className="p-3 text-center">WPS Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {wpsPayrollRows.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500 w-24">
                      <input 
                        type="text" 
                        value={row.empId} 
                        onChange={(e) => handleUpdatePayrollAdj(row.name, 'empId', e.target.value)}
                        className="w-20 p-1 border rounded bg-slate-50 font-mono text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-orange-500"
                      />
                    </td>
                    <td className="p-3">
                      <strong className="block text-slate-900 font-bold uppercase">{row.name}</strong>
                      <span className="text-[10px] text-slate-500 font-medium block">{row.role} • Rate: AED {row.rate}/h</span>
                    </td>
                    <td className="p-3">
                      <input 
                        type="text" 
                        value={row.iban} 
                        onChange={(e) => handleUpdatePayrollAdj(row.name, 'iban', e.target.value)}
                        className="w-48 p-1 border rounded bg-slate-50 font-mono text-[10px] font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
                      />
                    </td>
                    <td className="p-3 text-right font-mono">
                      <input 
                        type="number" 
                        value={row.basicSalary} 
                        onChange={(e) => handleUpdatePayrollAdj(row.name, 'basicSalary', Number(e.target.value) || 0)}
                        className="w-24 p-1 border rounded bg-slate-50 font-mono text-right text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-orange-500"
                      />
                    </td>
                    <td className="p-3 text-right font-mono">
                      <input 
                        type="number" 
                        value={row.allowance} 
                        onChange={(e) => handleUpdatePayrollAdj(row.name, 'allowance', Number(e.target.value) || 0)}
                        className="w-20 p-1 border rounded bg-slate-50 font-mono text-right text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
                      />
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-orange-600 bg-orange-50/50">
                      AED {row.otPayout.toFixed(2)}
                      <span className="block text-[8.5px] text-slate-400 font-normal">({row.otHours.toFixed(1)} hrs)</span>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <input 
                        type="number" 
                        value={row.deduction} 
                        onChange={(e) => handleUpdatePayrollAdj(row.name, 'deduction', Number(e.target.value) || 0)}
                        className="w-16 p-1 border rounded bg-slate-50 font-mono text-right text-xs font-semibold text-red-600 outline-none focus:bg-white focus:border-orange-500"
                      />
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 text-sm">
                      AED {row.netPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={row.paymentStatus}
                        onChange={(e) => handleUpdatePayrollAdj(row.name, 'paymentStatus', e.target.value)}
                        className={`p-1 text-[10px] font-bold font-mono rounded-lg border outline-none cursor-pointer ${
                          row.paymentStatus === 'Paid via WPS'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : row.paymentStatus === 'Approved'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Paid via WPS">Paid via WPS</option>
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintPayslip(row)}
                        className="p-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase transition-all border border-slate-300 cursor-pointer flex items-center justify-center gap-1 mx-auto"
                        title="Print Official Payslip"
                      >
                        <Printer className="w-3 h-3 text-orange-500" /> Payslip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEWPORT CONTROLLER FOR DESKTOP (PC version - totally untouched) */}
      {activeTab === 'daily' && (
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* STEP 1: SELECT HUMAN OPERATOR COLUMN (COLSPAN: 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">👥 1. Select Staff Profile</span>
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono">
                  {filteredOperators.length} Loaded
                </span>
              </div>

              {/* Roster Quick Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-450 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search operator name or job title..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-slate-805"
                />
              </div>

              {/* Active Operator quick grids */}
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {filteredOperators.map(op => {
                  const isSelected = selectedOpName.toUpperCase() === op.name.toUpperCase();
                  const registeredLogsOnSelectedDate = getOpLogsForDate(op.name, activeDate);
                  const hasLogsToday = registeredLogsOnSelectedDate.length > 0;
                  const loggedHoursSum = registeredLogsOnSelectedDate.reduce((s, l) => s + l.hours, 0);

                  return (
                    <div
                      key={op.name}
                      onClick={() => handleQuickSelectOperator(op)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center relative ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50/15 shadow-3xs ring-1 ring-orange-500/25' 
                          : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold uppercase ${isSelected ? 'text-orange-600' : 'text-slate-800'}`}>
                            {op.name}
                          </span>
                          {op.isOutsideWorker && (
                            <span className="text-[7.5px] font-bold px-1 bg-purple-50 text-purple-600 border border-purple-200 rounded">
                              OUTSIDE
                            </span>
                          )}
                        </div>
                        <span className="block text-[8px] text-slate-440 uppercase font-bold text-slate-400">{op.role}</span>
                        
                        {/* Live telemetry check on active date */}
                        {hasLogsToday ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-[8px] text-emerald-600 font-semibold font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Check className="w-2.5 h-2.5" /> Registered: {loggedHoursSum} Hrs
                          </span>
                        ) : (
                          <span className="block mt-1 text-[7.5px] text-slate-350 italic font-medium">
                            No logs registered today
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className="block text-[9.5px] font-mono font-bold text-slate-700">
                          AED {op.rate}/h
                        </span>
                        {isSelected && (
                          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse mt-1"></span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredOperators.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 border border-dashed rounded-xl space-y-2">
                    <span className="block text-slate-400 text-[10px]">No matches in crew directory</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewOpName(rosterSearch);
                        setShowAddOpModal(true);
                      }}
                      className="px-3 py-1.5 bg-orange-500 text-white text-[9.5px] font-bold rounded-lg cursor-pointer"
                    >
                      + Create Named Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewOpName('');
                setShowAddOpModal(true);
              }}
              className="mt-4 w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[9.5px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-250"
            >
              <UserPlus className="w-3.5 h-3.5 text-orange-500" /> Fast-Create Crew Profile
            </button>
          </div>

          {/* STEP 2: DYNAMIC DAILY ENTRY TERMINAL COCKPIT (COLSPAN: 5) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">⚡ 2. Terminal Daily Entry</span>
                <span className="text-[8.5px] uppercase font-semibold text-orange-550 text-orange-600 animate-pulse">
                  SYSTEM READY
                </span>
              </div>

              {/* Active worker tag badge */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between border-2 border-orange-500 text-left">
                <div className="space-y-0.5 flex-1 mr-2">
                  <span className="block text-[7.5px] text-orange-400 font-semibold uppercase tracking-wide">Target Operator Employee</span>
                  {selectedOpName ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="block text-[13px] font-bold uppercase text-white tracking-tight leading-zero">{selectedOpName}</span>
                      <button
                        type="button"
                        onClick={() => handlePrintOperatorStatement(selectedOpName)}
                        title="Print individual full cumulative OT report PDF"
                        className="p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 hover:text-white border border-slate-700 cursor-pointer transition-all flex items-center gap-1 text-[8.5px] font-mono leading-none"
                      >
                        <Printer className="w-3 h-3" /> Report PDF
                      </button>
                    </div>
                  ) : (
                    <span className="block text-[11px] font-bold text-slate-400 uppercase italic mt-0.5">Select an Operator ...</span>
                  )}
                </div>
                
                <div className="bg-slate-800 px-3 py-1.5 rounded text-right font-mono border border-slate-700">
                  <span className="block text-[7px] text-slate-400 uppercase">Hourly rate</span>
                  <span className="text-[11px] font-bold text-emerald-400">AED {customBaseRate}/h</span>
                </div>
              </div>

              <form onSubmit={handleSaveOvertimeEntry} className="space-y-3">
                {/* Active Working Date register */}
                <div className="space-y-1">
                  <label className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Date Registered</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      required
                      value={activeDate}
                      onChange={(e) => setActiveDate(e.target.value)}
                      className="flex-1 p-2 text-[11px] font-mono border rounded-lg font-bold focus:outline-none focus:border-orange-500 text-slate-800 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveDate(new Date().toISOString().substring(0, 10))}
                      className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-semibold rounded-lg font-mono cursor-pointer border border-slate-250"
                    >
                      TODAY
                    </button>
                  </div>
                </div>

                {/* Wage and Overtime multiplier Selection (MODERN BRIGHT CHIPS) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[8.5px] uppercase tracking-wider font-bold text-slate-500 font-mono">
                      Rate Multiplier (Base 1x vs OT 1.50x)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMultiplierMode(!isCustomMultiplierMode)}
                      className="text-[8px] font-bold text-indigo-650 text-indigo-600 underline"
                    >
                      {isCustomMultiplierMode ? 'Use Presets' : 'Custom multiplier'}
                    </button>
                  </div>

                  {!isCustomMultiplierMode ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMultiplier(1.00)}
                        className={`p-2.5 rounded-xl border text-[9.5px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          multiplier === 1.00 
                            ? 'bg-blue-550 bg-blue-600 text-white border-blue-500 shadow-3xs font-semibold' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[12px] font-bold">1.0x</span>
                        <span className="text-[7px] opacity-90 uppercase">Base Rate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMultiplier(1.25)}
                        className={`p-2.5 rounded-xl border text-[9.5px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          multiplier === 1.25 
                            ? 'bg-amber-550 bg-amber-500 text-white border-amber-400 shadow-3xs font-semibold' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[12px] font-bold">1.25x</span>
                        <span className="text-[7px] opacity-90 uppercase">Std Overtime</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMultiplier(1.50)}
                        className={`p-2.5 rounded-xl border text-[9.5px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          multiplier === 1.50 
                            ? 'bg-orange-600 text-white border-orange-550 shadow-3xs font-semibold' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[12px] font-bold">1.50x</span>
                        <span className="text-[7px] opacity-90 uppercase">Special OT</span>
                      </button>
                    </div>
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter custom rate multiplier (e.g. 2.0)"
                      value={customMultiplierInput}
                      onChange={(e) => setCustomMultiplierInput(e.target.value)}
                      className="w-full p-2.5 text-[11px] border rounded-lg font-mono focus:outline-none focus:border-indigo-500 text-slate-800 bg-white"
                    />
                  )}
                </div>

                {/* Hours logged - Simple Tap bar + precise selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border">
                    <span className="text-[8px] uppercase font-bold text-slate-450 text-slate-400">Overtime Hours</span>
                    <strong className="text-[11.5px] font-mono text-slate-900 bg-white border px-2 py-0.5 rounded">
                      {dutyHours.toFixed(1)} Hrs
                    </strong>
                  </div>

                  {/* Preset increments */}
                  <div className="grid grid-cols-5 gap-1">
                    {[1.0, 1.5, 2.0, 3.0, 4.0].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDutyHours(h)}
                        className={`py-1 text-[9px] font-mono font-bold rounded-lg cursor-pointer ${
                          dutyHours === h 
                            ? 'bg-slate-900 text-white font-semibold' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border'
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>

                  {/* Range Slider for hyper fast update */}
                  <div className="flex items-center gap-3 py-1">
                    <span className="text-[9px] font-mono text-slate-400">1h</span>
                    <input
                      type="range"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={dutyHours}
                      onChange={(e) => setDutyHours(parseFloat(e.target.value) || 2.0)}
                      className="flex-1 accent-orange-600 cursor-pointer h-1.5 rounded bg-slate-100"
                    />
                    <span className="text-[9px] font-mono text-slate-400">12h</span>
                  </div>
                </div>

                {/* Shift Selection & Custom Override Base rate */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Shift Period</label>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border gap-0.5">
                      <button
                        type="button"
                        onClick={() => setDutyShift('DAY Shift')}
                        className={`flex-1 py-1 px-2 text-[9px] font-bold uppercase rounded-md flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          dutyShift === 'DAY Shift' ? 'bg-white text-orange-600 shadow-3xs' : 'text-slate-500'
                        }`}
                      >
                        <Sun className="w-3 h-3 text-amber-500" /> Day
                      </button>
                      <button
                        type="button"
                        onClick={() => setDutyShift('NIGHT Shift')}
                        className={`flex-1 py-1 px-2 text-[9px] font-bold uppercase rounded-md flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          dutyShift === 'NIGHT Shift' ? 'bg-white text-indigo-600 shadow-3xs' : 'text-slate-500'
                        }`}
                      >
                        <Moon className="w-3 h-3 text-indigo-400" /> Night
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Hourly base wage override</label>
                    <input
                      type="number"
                      required
                      value={customBaseRate}
                      onChange={(e) => setCustomBaseRate(parseFloat(e.target.value) || 30)}
                      className="w-full p-1.5 text-[11px] font-mono border rounded-lg focus:outline-none focus:border-orange-500 text-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Real-time Math Estimation card (COLORFUL & LIVE) */}
                <div className="p-3 bg-orange-50 border border-orange-250 border-orange-200 rounded-xl space-y-1 border-dashed mt-2">
                  <span className="block text-[7px] text-orange-600 uppercase font-bold tracking-wider">Estimated payroll value payout preview</span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono text-slate-600">
                      {dutyHours.toFixed(1)} hrs × AED {customBaseRate} × {isCustomMultiplierMode ? customMultiplierInput : multiplier}x
                    </span>
                    <strong className="text-sm font-sans font-bold text-orange-700">
                      AED {((customBaseRate * dutyHours * (isCustomMultiplierMode ? parseFloat(customMultiplierInput) || 1.0 : multiplier)).toFixed(2))}
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedOpName}
                  className="w-full bg-slate-900 hover:bg-black text-white rounded-xl p-3 font-semibold uppercase text-[10px] tracking-wider transition-all duration-150 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 border-none disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Check className="w-4 h-4 text-orange-500" /> Record Entry Into Sheets
                </button>
              </form>
            </div>
          </div>

          {/* STEP 3: RECENT SHEET REGISTRY LOGS (COLSPAN: 3) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2 border-slate-105 border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider font-mono">📝 3. Daily Records</span>
                <span className="text-[9px] bg-orange-550 bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full font-mono">
                  {activeDailyLogs.length} Records
                </span>
              </div>

              {/* Day-specific micro stats */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border">
                <div>
                  <span className="block text-[7.5px] uppercase font-bold text-slate-400">Total Hours</span>
                  <strong className="text-[11.5px] font-mono text-slate-800">{activeDayStats.totalHours.toFixed(1)} Hrs</strong>
                </div>
                <div>
                  <span className="block text-[7.5px] uppercase font-bold text-slate-400">Total Payout</span>
                  <strong className="text-[11.5px] font-mono text-emerald-600">AED {activeDayStats.totalPayout.toFixed(0)}</strong>
                </div>
              </div>

              <div className="space-y-2 max-h-[2400px] overflow-y-auto max-h-[300px] pr-1">
                {activeDailyLogs.map(l => (
                  <div key={l.id} className="p-2.5 bg-slate-50 border rounded-xl flex justify-between items-start text-xs relative group">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <strong className="text-[11px] uppercase text-slate-800 tracking-tight block truncate max-w-[120px]">
                          {l.workerName}
                        </strong>
                        <span className="text-[7px] text-slate-400 font-mono uppercase bg-white border px-1 rounded">
                          {l.id}
                        </span>
                      </div>
                      <div className="text-[8.5px] text-slate-500 font-mono">
                        <span>{l.hours} H x {l.multiplier}x </span>
                        <span>• {l.shift.replace(' Shift', '')}</span>
                      </div>
                      <strong className="block text-[11px] font-mono text-orange-600">
                        AED {l.totalPayout}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLog(l.id, l.workerName)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer transition-all rounded hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {activeDailyLogs.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-1.5" />
                    <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                      No Records Logged
                    </span>
                    <span className="block text-[8px] text-slate-400 mt-0.5">
                      On date {activeDate}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {activeDailyLogs.length > 0 && (
              <button
                type="button"
                onClick={handlePrintDailyStatement}
                className="mt-4 w-full p-2.5 bg-slate-900 hover:bg-black text-white text-[9.5px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
              >
                <Printer className="w-3.5 h-3.5 text-orange-400" /> Export Daily Statement PDF
              </button>
            )}
          </div>

        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="hidden lg:block bg-white border text-left border-slate-200 rounded-2xl p-5 space-y-6 shadow-sm">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 border-slate-100">
            <div className="space-y-1">
              <span className="block text-[8px] text-orange-600 uppercase font-bold tracking-wider font-mono">Monthly Ledger Ledger</span>
              <h3 className="text-base font-bold text-slate-900 uppercase">MONTHLY RECONCILIATION STATION</h3>
            </div>
            
            {/* Calendar parameters selecting */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase">Year</span>
                <select 
                  value={analyticsYear} 
                  onChange={(e) => setAnalyticsYear(e.target.value)} 
                  className="p-1.5 text-[10.5px] outline-none font-bold font-mono border rounded-lg bg-slate-50 text-slate-800"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase">Month</span>
                <select 
                  value={analyticsMonth} 
                  onChange={(e) => setAnalyticsMonth(e.target.value)} 
                  className="p-1.5 text-[10.5px] outline-none font-bold font-mono border rounded-lg bg-slate-50 text-slate-800"
                >
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handlePrintMonthlyStatement}
                disabled={activeMonthlyLogs.length === 0}
                className="p-2 px-3 bg-[#ea580c] hover:bg-orange-600 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                Print Ledger Sheet PDF
              </button>
            </div>
          </div>

          {/* Quick Metrics of chosen month */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border p-4 rounded-xl">
              <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wide font-mono">Consolidated month</span>
              <strong className="block text-md mt-1 font-mono text-slate-800">{analyticsYear} - Month {analyticsMonth}</strong>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl">
              <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wide font-mono">Logging crew count</span>
              <strong className="block text-md mt-1 text-slate-800 font-mono">{monthlyAggregated.length} Operators</strong>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl border-l-4 border-l-orange-500">
              <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wide font-mono">Aggregate log hours</span>
              <strong className="block text-md mt-1 text-orange-700 font-mono">
                {activeMonthlyLogs.reduce((sum, l) => sum + l.hours, 0).toFixed(1)} Hrs
              </strong>
            </div>

            <div className="bg-slate-50 border p-4 rounded-xl border-l-4 border-l-emerald-500">
              <span className="block text-[8px] uppercase font-bold text-slate-400 tracking-wide font-mono">Total Estimated Payroll Payout</span>
              <strong className="block text-md mt-1 text-emerald-700 font-mono">
                AED {activeMonthlyLogs.reduce((sum, l) => sum + l.totalPayout, 0).toLocaleString(undefined, { minimumFractionDigits: 1 })}
              </strong>
            </div>
          </div>

          {/* AGGREGATED MONTHWISE TABLE */}
          <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="p-3 text-center style-sn text-slate-450 uppercase text-[8.5px] tracking-wide" style={{ width: '80px' }}>Serial</th>
                  <th className="p-3 text-slate-500 uppercase text-[8.5px] tracking-wide text-left">Operator Professional Profile</th>
                  <th className="p-3 text-center text-slate-500 uppercase text-[8.5px] tracking-wide" style={{ width: '180px' }}>Worked Attendance Shifts</th>
                  <th className="p-3 text-right text-slate-500 uppercase text-[8.5px] tracking-wide" style={{ width: '180px' }}>Accumulated OT Hours</th>
                  <th className="p-3 text-right text-slate-500 uppercase text-[8.5px] tracking-wide" style={{ width: '220px' }}>Total Earned Payout Amount</th>
                  <th className="p-3 text-center text-slate-500 uppercase text-[8.5px] tracking-wide" style={{ width: '150px' }}>Individual Report</th>
                </tr>
              </thead>
              <tbody>
                {monthlyAggregated.map((row, index) => (
                  <tr key={row.name} className="border-b last:border-none hover:bg-slate-50 font-sans">
                    <td className="p-3 text-center font-mono font-bold text-slate-440">{index + 1}</td>
                    <td className="p-3">
                      <strong className="text-slate-805 uppercase block text-[11px] tracking-tight">{row.name}</strong>
                    </td>
                    <td className="p-3 text-center font-mono font-medium text-slate-600">{row.shifts} Shifts</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700">{row.totalHours.toFixed(1)} Hrs</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-600 p-right-large" style={{ paddingRight: '24px' }}>
                      AED {row.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintOperatorStatement(row.name)}
                        className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold uppercase text-[9px] rounded-lg tracking-wider border border-indigo-200 cursor-pointer inline-flex items-center gap-1 transition-all"
                      >
                        <Printer className="w-2.5 h-2.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}

                {monthlyAggregated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <Database className="w-8 h-8 mx-auto text-slate-300 stroke-1 mb-2" />
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">No telemetry archives found</span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">Please check calendar period parameters or input daily reports!</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 lg:p-5 space-y-4 shadow-sm">
          
          <div className="flex justify-between items-center border-b pb-3 border-slate-100">
            <div className="space-y-0.5">
              <span className="block text-[8px] text-slate-400 font-mono uppercase tracking-widest">Active Staff Dossiers</span>
              <h3 className="text-[14px] font-bold uppercase text-slate-900 tracking-tight">Technical Personnel Directory</h3>
            </div>
            <button
              onClick={() => {
                setNewOpName('');
                setShowAddOpModal(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-[9.5px] font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              + Add New Operator Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operators.map(op => {
              const allHistoryLogs = otLogs.filter(l => l.workerName.toUpperCase() === op.name.toUpperCase());
              const overallHours = allHistoryLogs.reduce((s, l) => s + l.hours, 0);
              const overallPayout = allHistoryLogs.reduce((s, l) => s + l.totalPayout, 0);

              return (
                <div key={op.name} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden shadow-3xs hover:border-slate-300 transition-all">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[11.5px] font-bold text-slate-800 uppercase tracking-tight leading-none">
                            {op.name}
                          </h4>
                          {op.isOutsideWorker && (
                            <span className="text-[6.5px] bg-purple-100 text-purple-700 border border-purple-200 font-bold px-1 rounded uppercase">
                              Contr.
                            </span>
                          )}
                        </div>
                        <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">{op.role}</p>
                      </div>
                      
                      <div className="bg-white border rounded px-2 py-0.5 text-right">
                        <span className="block text-[7px] text-slate-400 uppercase font-mono">Standard Rate</span>
                        <span className="text-[9.5px] font-mono font-bold text-indigo-650 text-indigo-600">AED {op.rate}/h</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-slate-150">
                      <div>
                        <span className="block text-[7px] uppercase font-bold text-slate-400 font-mono">Log historical Hrs</span>
                        <strong className="block text-[11px] font-mono text-slate-800">{overallHours.toFixed(1)} Hrs</strong>
                      </div>
                      <div>
                        <span className="block text-[7px] uppercase font-bold text-slate-400 font-mono">Accumulated OT Wage</span>
                        <strong className="block text-[11px] font-mono text-orange-650 text-orange-600">
                          AED {overallPayout.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-200/60 font-mono text-[9px] font-semibold">
                    <button
                      type="button"
                      onClick={() => handlePrintOperatorStatement(op.name)}
                      className="text-indigo-650 text-indigo-600 hover:text-indigo-800 cursor-pointer p-1 rounded hover:bg-indigo-50 transition-all flex items-center gap-1 font-semibold border-none"
                    >
                      <Printer className="w-3 h-3" /> Print PDF Report
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOperator(op.name)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer p-1 rounded hover:bg-red-50 hover:border-red-100 border border-transparent transition-all border-none"
                    >
                      Delete Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK ADD OPERATOR PROFILE DIALOG MODAL */}
      {showAddOpModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-slate-900 text-left space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddOpModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="bg-slate-100 p-2.5 rounded-2xl w-fit text-slate-800">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase text-slate-900 mt-2">New Operator registration</h3>
              <p className="text-[8.5px] text-slate-450 text-slate-400 uppercase">Input default payroll parameters below</p>
            </div>

            <form onSubmit={handleCreateOperator} className="space-y-3 font-sans text-slate-800">
              <div className="space-y-1">
                <label className="block text-[8px] uppercase tracking-wider font-semibold text-slate-400">Employee Full Name (English)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. MOHAMMED KHAN"
                  value={newOpName}
                  onChange={(e) => setNewOpName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 p-2.5 text-[11px] text-slate-850 font-bold uppercase border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] uppercase tracking-wider font-semibold text-slate-400">Standard Base Rate (AED / Hr)</label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 30"
                  value={newOpRate}
                  onChange={(e) => setNewOpRate(parseFloat(e.target.value) || 30)}
                  className="w-full bg-slate-50 p-2.5 text-[11px] font-mono border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8px] uppercase tracking-wider font-semibold text-slate-400">Designated Role Title</label>
                <input
                  type="text"
                  placeholder="Mechanical Workshop Operator"
                  value={newOpRole}
                  onChange={(e) => setNewOpRole(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 text-[11px] border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="outside_check"
                  type="checkbox"
                  checked={newOpIsOutside}
                  onChange={(e) => setNewOpIsOutside(e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-600"
                />
                <label htmlFor="outside_check" className="text-[10px] font-bold text-slate-650 cursor-pointer select-none">
                  Check if candidate is outside contractor labor
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase rounded-2xl tracking-wider transition-all duration-150 border-none cursor-pointer"
              >
                Assemble Profile Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SANDBOX-SAFE DELETE OPERATOR PROFILE CONFIRMATION MODAL */}
      {opNameToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-red-500 text-left space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[13px] font-bold uppercase tracking-tight leading-none">Delete Staff Profile?</h4>
                <p className="text-[9px] text-slate-400 uppercase font-mono font-bold">All hours records remain but profile is unindexed</p>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-600 font-medium">
              Are you sure you want to permanently delete the professional profile for <strong className="text-slate-900 font-bold uppercase">"{opNameToDelete}"</strong>?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
              <button
                type="button"
                onClick={() => setOpNameToDelete(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 text-[9.5px] font-bold uppercase rounded-xl transition-all border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteOperator}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-[9.5px] font-bold uppercase rounded-xl transition-all border-none cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SANDBOX-SAFE DELETE LOG ENTRY CONFIRMATION MODAL */}
      {logIdToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-red-500 text-left space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[13px] font-bold uppercase tracking-tight leading-none">Remove OT Log Entry?</h4>
                <p className="text-[9px] text-slate-400 uppercase font-mono font-bold">Wipe active ledger record</p>
              </div>
            </div>

            <p className="text-[11.5px] text-slate-600 font-medium">
              Are you sure you want to delete the registered OT log <strong className="text-slate-900 font-mono font-bold">{logIdToDelete.id}</strong> logged for <strong className="text-slate-900 font-bold uppercase">"{logIdToDelete.name}"</strong>?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
              <button
                type="button"
                onClick={() => setLogIdToDelete(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9.5px] font-bold uppercase rounded-xl transition-all border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLog}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-[9.5px] font-bold uppercase rounded-xl transition-all border-none cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
