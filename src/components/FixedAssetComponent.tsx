import React, { useState, useEffect } from 'react';
import { Shield, Search, Plus, Trash2, Printer, Edit, Landmark, FileCheck, Building2, Tag, Check, X, Settings2 } from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getActiveCompany, getCompanyFixedAssetCategories, saveCompanyFixedAssetCategories, CompanyProfile } from '../utils/companyProfile';

interface FixedAsset {
  id: string;
  companyId: string;
  assetCode: string;
  assetName: string;
  category: string;
  purchaseDate: string;
  purchaseValue: number;
  depreciationRate: number; // e.g. 10% per year
  currentValue: number;
  location: string;
  status: 'Active' | 'Disposed' | 'Maintenance';
}

const INITIAL_FIXED_ASSETS: FixedAsset[] = [
  // Marine Fasteners (comp-mfi)
  { id: 'mfi-1', companyId: 'comp-mfi', assetCode: 'MFI-MC-001', assetName: 'Automatic Threading Machine Type-A', category: 'Machinery', purchaseDate: '2023-01-15', purchaseValue: 125000.00, depreciationRate: 10, currentValue: 87500.00, location: 'Production Cell 1 (Ajman)', status: 'Active' },
  { id: 'mfi-2', companyId: 'comp-mfi', assetCode: 'MFI-MC-002', assetName: 'Heavy Duty Cold Heading Machine', category: 'Cold Heading & Threading', purchaseDate: '2022-06-10', purchaseValue: 240000.00, depreciationRate: 12, currentValue: 144000.00, location: 'Production Cell 3 (Ajman)', status: 'Active' },
  { id: 'mfi-3', companyId: 'comp-mfi', assetCode: 'MFI-VH-012', assetName: 'Toyota Forklift Truck 3 Ton', category: 'Delivery & Logistics Vehicles', purchaseDate: '2024-03-20', purchaseValue: 85000.00, depreciationRate: 15, currentValue: 68000.00, location: 'Bay 4 Inventory Yard', status: 'Active' },
  { id: 'mfi-4', companyId: 'comp-mfi', assetCode: 'MFI-EQ-044', assetName: 'Hexagon Packaging Line System', category: 'Packaging Lines', purchaseDate: '2025-01-05', purchaseValue: 45000.00, depreciationRate: 8, currentValue: 41400.00, location: 'Packing Station B', status: 'Active' },
  { id: 'mfi-5', companyId: 'comp-mfi', assetCode: 'MFI-IT-102', assetName: 'Ajman Office ERP Core Server', category: 'Office & IT', purchaseDate: '2024-09-12', purchaseValue: 18000.00, depreciationRate: 20, currentValue: 12600.00, location: 'Admin Server Room', status: 'Active' },

  // Boltmaster (comp-bmm)
  { id: 'bmm-1', companyId: 'comp-bmm', assetCode: 'BMM-VH-101', assetName: 'Isuzu Heavy 4.2T Delivery Truck', category: 'Trading Logistics & Fleet', purchaseDate: '2023-05-18', purchaseValue: 110000.00, depreciationRate: 15, currentValue: 77000.00, location: 'Al Quoz Logistics Bay', status: 'Active' },
  { id: 'bmm-2', companyId: 'comp-bmm', assetCode: 'BMM-RK-045', assetName: 'High-Density Warehouse Pallet Racking', category: 'Warehouse Heavy Racking & Shelving', purchaseDate: '2022-11-04', purchaseValue: 95000.00, depreciationRate: 10, currentValue: 66500.00, location: 'Central Warehouse Rack A-F', status: 'Active' },
  { id: 'bmm-3', companyId: 'comp-bmm', assetCode: 'BMM-SH-012', assetName: 'Showroom Fasteners Modular Display System', category: 'Showroom Display & Fixtures', purchaseDate: '2024-01-15', purchaseValue: 38000.00, depreciationRate: 12, currentValue: 31160.00, location: 'Dubai Showroom Floor', status: 'Active' },
  { id: 'bmm-4', companyId: 'comp-bmm', assetCode: 'BMM-FL-003', assetName: 'Electric Reach Stacker 2.5T', category: 'Material Handling Forklifts & Stackers', purchaseDate: '2024-06-22', purchaseValue: 62000.00, depreciationRate: 15, currentValue: 52700.00, location: 'Al Quoz Loading Dock', status: 'Active' },
  { id: 'bmm-5', companyId: 'comp-bmm', assetCode: 'BMM-IT-008', assetName: 'Multi-Counter POS & Barcode Terminal Array', category: 'Point of Sale & IT Infrastructure', purchaseDate: '2024-10-10', purchaseValue: 24000.00, depreciationRate: 20, currentValue: 19200.00, location: 'Billing Desks 1-4', status: 'Active' },

  // United Metal (comp-umi)
  { id: 'umi-1', companyId: 'comp-umi', assetCode: 'UMI-PR-501', assetName: '500-Ton Heavy Hydraulic Stamping Press', category: 'Hydraulic Stamping Presses & Shears', purchaseDate: '2021-08-20', purchaseValue: 350000.00, depreciationRate: 10, currentValue: 210000.00, location: 'Heavy Fabrication Bay 1 (Jurph)', status: 'Active' },
  { id: 'umi-2', companyId: 'comp-umi', assetCode: 'UMI-CNC-102', assetName: '5-Axis CNC Precision Machining Center', category: 'CNC Machining & Milling Centers', purchaseDate: '2023-03-12', purchaseValue: 280000.00, depreciationRate: 12, currentValue: 212800.00, location: 'CNC Machining Cell 2', status: 'Active' },
  { id: 'umi-3', companyId: 'comp-umi', assetCode: 'UMI-GAL-001', assetName: 'Hot-Dip Galvanizing Acid & Zinc Bath Array', category: 'Galvanizing Tanks & Surface Treatment Lines', purchaseDate: '2022-02-14', purchaseValue: 420000.00, depreciationRate: 10, currentValue: 294000.00, location: 'Galvanizing Plant 1', status: 'Active' },
  { id: 'umi-4', companyId: 'comp-umi', assetCode: 'UMI-CR-015', assetName: 'Overhead Double Gantry Crane 15T', category: 'Overhead Gantry Cranes & Hoists', purchaseDate: '2022-09-01', purchaseValue: 185000.00, depreciationRate: 8, currentValue: 140600.00, location: 'Structural Fabrication Yard', status: 'Active' },
  { id: 'umi-5', companyId: 'comp-umi', assetCode: 'UMI-LAB-004', assetName: 'Optical Emission Spectrometer & Tensile Tester', category: 'Metallurgical Lab & Quality Testing Systems', purchaseDate: '2024-04-18', purchaseValue: 75000.00, depreciationRate: 15, currentValue: 63750.00, location: 'Quality Metallurgy Lab', status: 'Active' }
];

export default function FixedAssetComponent() {
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categories, setCategories] = useState<string[]>(() => getCompanyFixedAssetCategories(getActiveCompany()));

  // Category Manager Modal state
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');

  // Sync active company & categories from localStorage / events
  useEffect(() => {
    const handleSync = () => {
      const comp = getActiveCompany();
      setActiveCompany(comp);
      setCategories(getCompanyFixedAssetCategories(comp));
    };
    const handleCatUpdate = () => {
      setCategories(getCompanyFixedAssetCategories(getActiveCompany()));
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    window.addEventListener('active_company_changed', handleSync);
    window.addEventListener('fixed_asset_categories_updated', handleCatUpdate);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
      window.removeEventListener('active_company_changed', handleSync);
      window.removeEventListener('fixed_asset_categories_updated', handleCatUpdate);
    };
  }, []);

  const [assets, setAssets] = useState<FixedAsset[]>(() => {
    const saved = localStorage.getItem('MFI_FIXED_ASSETS_RECORDS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_FIXED_ASSETS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('MFI_FIXED_ASSETS_RECORDS', JSON.stringify(assets));
  }, [assets]);

  // Dynamic code prefix based on company
  const codePrefix = activeCompany.code ? `${activeCompany.code}-` : 'MFI-';

  const [showAdd, setShowAdd] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<string>(categories[0] || 'Machinery');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newValue, setNewValue] = useState('');
  const [newDepRate, setNewDepRate] = useState('10');
  const [newLoc, setNewLoc] = useState('');

  // Edit Asset State
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editCat, setEditCat] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editDepRate, setEditDepRate] = useState('');
  const [editLoc, setEditLoc] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Disposed' | 'Maintenance'>('Active');

  const handleStartEdit = (asset: FixedAsset) => {
    setEditingAsset(asset);
    setEditCode(asset.assetCode);
    setEditName(asset.assetName);
    setEditCat(asset.category || categories[0] || 'Machinery');
    setEditDate(asset.purchaseDate || new Date().toISOString().slice(0, 10));
    setEditValue(String(asset.purchaseValue || ''));
    setEditDepRate(String(asset.depreciationRate || '10'));
    setEditLoc(asset.location || '');
    setEditStatus(asset.status || 'Active');
  };

  const handleSaveEditAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !editName.trim() || !editCode.trim()) return;

    const val = Number(editValue) || 0;
    const depRate = Number(editDepRate) || 0;
    const years = (new Date().getTime() - new Date(editDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const currentVal = Math.max(0, val - (val * (depRate / 100) * Math.max(0, years)));

    const updated = assets.map(a => {
      if (a.id === editingAsset.id) {
        return {
          ...a,
          assetCode: editCode.trim().toUpperCase(),
          assetName: editName.trim(),
          category: editCat,
          purchaseDate: editDate,
          purchaseValue: val,
          depreciationRate: depRate,
          currentValue: Number(currentVal.toFixed(2)),
          location: editLoc.trim() || a.location || activeCompany.address || 'Headquarters',
          status: editStatus
        };
      }
      return a;
    });

    setAssets(updated);
    setEditingAsset(null);
  };

  // Update default new category when company or categories change
  useEffect(() => {
    if (categories.length > 0) {
      setNewCat(categories[0]);
    }
    setSelectedCategory('ALL');
  }, [activeCompany.id, categories.length]);

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const trimmed = newCatInput.trim();
    if (categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveCompanyFixedAssetCategories(activeCompany.id, updated);
    setNewCatInput('');
  };

  const handleSaveEditCategory = (index: number) => {
    if (!editingCatValue.trim()) return;
    const oldCat = categories[index];
    const newCatVal = editingCatValue.trim();
    const updated = categories.map((c, i) => i === index ? newCatVal : c);
    setCategories(updated);
    saveCompanyFixedAssetCategories(activeCompany.id, updated);
    
    // Also update existing assets that used the old category name!
    const updatedAssets = assets.map(a => a.category === oldCat ? { ...a, category: newCatVal } : a);
    setAssets(updatedAssets);

    setEditingCatIndex(null);
    setEditingCatValue('');
  };

  const handleDeleteCategory = (index: number) => {
    const catToDelete = categories[index];
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
    saveCompanyFixedAssetCategories(activeCompany.id, updated);
    if (selectedCategory === catToDelete) {
      setSelectedCategory('ALL');
    }
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    const val = Number(newValue);
    const depRate = Number(newDepRate);
    // Rough calculation of current value (straight line hypothetical depreciation)
    const years = (new Date().getTime() - new Date(newDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const currentVal = Math.max(0, val - (val * (depRate / 100) * Math.max(0, years)));

    const asset: FixedAsset = {
      id: `${activeCompany.code.toLowerCase()}-${Date.now()}`,
      companyId: activeCompany.id,
      assetCode: newCode.trim().toUpperCase(),
      assetName: newName.trim(),
      category: newCat,
      purchaseDate: newDate,
      purchaseValue: val,
      depreciationRate: depRate,
      currentValue: Number(currentVal.toFixed(2)),
      location: newLoc.trim() || activeCompany.address || 'Headquarters',
      status: 'Active'
    };

    setAssets([...assets, asset]);
    setNewCode('');
    setNewName('');
    setNewValue('');
    setNewLoc('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  // Strictly filter by active company!
  const filtered = assets.filter(a => {
    const matchesCompany = (a.companyId === activeCompany.id) || 
      (!a.companyId && a.assetCode.startsWith(activeCompany.code || 'MFI'));
    if (!matchesCompany) return false;

    const matchesSearch = a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePrint = () => {
    const totalCost = filtered.reduce((acc, curr) => acc + curr.purchaseValue, 0);
    const totalBook = filtered.reduce((acc, curr) => acc + curr.currentValue, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${activeCompany.name} - Fixed Assets Register</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;750&display=swap');
            @page {
              size: A4 landscape;
              margin: 10mm 12mm;
            }
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              color: #1e293b;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-size: 10.5px;
            }
            .container {
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #002D62;
              padding-bottom: 12px;
            }
            .header h1 {
              color: #002D62;
              margin: 0;
              font-size: 18px;
              text-transform: uppercase;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 3px 0;
              font-size: 10px;
              color: #64748b;
              font-weight: 500;
            }
            .header h2 {
              color: #f37021;
              margin: 6px 0 0 0;
              font-size: 12px;
              letter-spacing: 1px;
              font-weight: 700;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              margin-top: 10px;
            }
            th {
              border: 1px solid #A6C4DE;
              padding: 6px 8px;
              background-color: #CDE4F5 !important;
              color: #002D62 !important;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 9px;
              letter-spacing: 0.5px;
            }
            td {
              border: 1px solid #A6C4DE;
              padding: 6px 8px;
              color: #334155;
            }
            tr:nth-child(even) {
              background-color: #f8fafc !important;
            }
            .total-row {
              background-color: #f1f5f9 !important;
              font-weight: 700;
              color: #0f172a;
            }
            .total-row td {
              border-top: 2px solid #002D62;
              border-bottom: 2px solid #002D62;
            }
            .footer {
              margin-top: 25px;
              font-size: 8px;
              color: #94a3b8;
              text-align: center;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${activeCompany.name}</h1>
              <p>${activeCompany.address || 'United Arab Emirates (UAE)'}</p>
              <h2>Official Fixed Assets Register</h2>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="text-align: center; width: 10%;">Asset Code</th>
                  <th style="text-align: left; width: 25%;">Asset Name</th>
                  <th style="text-align: center; width: 15%;">Category</th>
                  <th style="text-align: center; width: 10%;">Purchased</th>
                  <th style="text-align: right; width: 12%;">Cost (AED)</th>
                  <th style="text-align: center; width: 8%;">Dep. %</th>
                  <th style="text-align: right; width: 13%;">Book Value (AED)</th>
                  <th style="text-align: left; width: 10%;">Location</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(a => `
                  <tr>
                    <td style="text-align: center; font-family: monospace; font-weight: 700; color: #002D62;">${a.assetCode}</td>
                    <td style="text-align: left; font-weight: 500;">${a.assetName}</td>
                    <td style="text-align: center;">${a.category}</td>
                    <td style="text-align: center;">${a.purchaseDate}</td>
                    <td style="text-align: right;">${a.purchaseValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td style="text-align: center;">${a.depreciationRate}%</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">${a.currentValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td style="text-align: left;">${a.location}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;">TOTAL ASSETS ON RECORD (${filtered.length}):</td>
                  <td style="text-align: right; color: #002D62;">${totalCost.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td></td>
                  <td style="text-align: right; color: #002D62;">${totalBook.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              SYSTEM GENERATED DIGITAL CAPITAL LEDGER REPORT • DATE: ${new Date().toLocaleDateString('en-US')} • ${activeCompany.name.toUpperCase()}
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(htmlContent);
  };

  const totalCost = filtered.reduce((acc, curr) => acc + curr.purchaseValue, 0);
  const totalBook = filtered.reduce((acc, curr) => acc + curr.currentValue, 0);

  return (
    <div className="box-shaped bg-white border border-[#A6C4DE] p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#A6C4DE]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#002D62] uppercase tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#FF6B00]" />
              Corporate Fixed Asset Register
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#002D62] border border-blue-200">
              <Building2 className="w-3 h-3 text-[#FF6B00]" />
              {activeCompany.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">
            Track capital goods, vehicles, plant machinery and structural warehouse resources for {activeCompany.shortName || activeCompany.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCatManager(true)}
            className="btn px-3 py-1.5 bg-slate-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-slate-800"
            title="Edit and manage asset category headers for this company"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Categories</span>
          </button>
          <button
            onClick={() => {
              if (!showAdd) {
                setNewCode(`${codePrefix}${Math.floor(100 + Math.random() * 900)}`);
              }
              setShowAdd(!showAdd);
            }}
            className="btn px-3 py-1.5 bg-[#002D62] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-[#1F4E79]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset Card</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn px-3 py-1.5 bg-[#FF6B00] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer hover:bg-orange-600"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[#A6C4DE] p-4 bg-slate-50/50">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Registered Assets ({activeCompany.code})</span>
          <span className="text-xl font-bold text-[#002D62] font-mono">{filtered.length} Units</span>
        </div>
        <div className="border border-[#A6C4DE] p-4 bg-slate-50/50">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accumulated Acquisition Cost</span>
          <span className="text-xl font-bold text-[#002D62] font-mono">AED {totalCost.toLocaleString()}</span>
        </div>
        <div className="border border-[#A6C4DE] p-4 bg-slate-50/50">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Book Value (Depreciated)</span>
          <span className="text-xl font-bold text-[#FF6B00] font-mono">AED {totalBook.toLocaleString()}</span>
        </div>
      </div>

      {/* EDITABLE CATEGORY HEADERS & CHIPS BAR */}
      <div className="bg-slate-50 border border-[#A6C4DE] p-3 rounded space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#002D62]">
              {activeCompany.name} Asset Categories
            </span>
            <span className="text-[10px] text-slate-500 font-medium">({categories.length} Headers Configured)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCatManager(true)}
            className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 uppercase hover:underline cursor-pointer"
          >
            <Settings2 className="w-3 h-3" />
            Edit Category Headers
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#002D62] text-white border-[#002D62] shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            All Categories
          </button>

          {categories.map((cat, idx) => {
            const count = assets.filter(a => {
              const matchesCompany = (a.companyId === activeCompany.id) || 
                (!a.companyId && a.assetCode.startsWith(activeCompany.code || 'MFI'));
              return matchesCompany && a.category === cat;
            }).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded font-mono ${
                  selectedCategory === cat ? 'bg-orange-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CATEGORY MANAGER MODAL */}
      {showCatManager && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#002D62] w-full max-w-lg shadow-2xl overflow-hidden rounded animate-fadeIn">
            <div className="bg-[#002D62] text-white p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Edit Category Headers & Groups ({activeCompany.name})
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCatManager(false);
                  setEditingCatIndex(null);
                }}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-[11px] text-slate-600">
                Customise the fixed asset classifications for <strong>{activeCompany.name}</strong>. Renaming a category automatically updates existing assets in that category.
              </p>

              {/* Add Category */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new category header (e.g. Laser Cutting Equipment)..."
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="flex-1 text-xs border border-slate-300 px-3 py-1.5 rounded"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="btn px-3 py-1.5 bg-[#FF6B00] text-white text-xs font-bold uppercase cursor-pointer hover:bg-orange-600 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Category List */}
              <div className="space-y-1.5 border border-slate-200 p-2 rounded bg-slate-50">
                <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider px-1 pb-1 border-b border-slate-200">
                  Current Category Headers ({categories.length})
                </div>

                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-white border border-slate-200 rounded">
                    {editingCatIndex === idx ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editingCatValue}
                          onChange={e => setEditingCatValue(e.target.value)}
                          className="text-xs px-2 py-1 border border-blue-500 rounded flex-1 font-semibold"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEditCategory(idx);
                            } else if (e.key === 'Escape') {
                              setEditingCatIndex(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditCategory(idx)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          title="Save Changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatIndex(null)}
                          className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-slate-800 flex-1 truncate">
                          {cat}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatIndex(idx);
                              setEditingCatValue(cat);
                            }}
                            className="p-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit Category Name"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(idx)}
                            className="p-1 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 p-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowCatManager(false);
                  setEditingCatIndex(null);
                }}
                className="btn px-4 py-1.5 bg-[#002D62] text-white text-xs font-bold uppercase cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal / Form */}
      {editingAsset && (
        <form onSubmit={handleSaveEditAsset} className="bg-amber-50/80 border-2 border-amber-400 p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-md rounded-xs">
          <div className="md:col-span-4 pb-1 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-500 text-white rounded text-xs">
                <Edit className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-xs font-bold text-amber-950 uppercase">
                Modify / Edit Asset Details — <span className="font-mono text-indigo-950">{editingAsset.assetCode}</span> ({activeCompany.name})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setEditingAsset(null)}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-amber-100 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Asset Code</label>
            <input
              type="text"
              required
              value={editCode}
              onChange={e => setEditCode(e.target.value)}
              className="w-full font-mono font-bold bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Asset Description / Equipment Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full font-semibold bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Category ({activeCompany.code})</label>
            <select
              value={editCat}
              onChange={e => setEditCat(e.target.value)}
              className="w-full bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Acquisition Date</label>
            <input
              type="date"
              required
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              className="w-full font-mono bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Acquisition Cost (AED)</label>
            <input
              type="number"
              required
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full font-mono font-bold bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Depreciation % (Annual)</label>
            <input
              type="number"
              value={editDepRate}
              onChange={e => setEditDepRate(e.target.value)}
              className="w-full font-mono bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Operational Status</label>
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value as any)}
              className="w-full bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs font-semibold"
            >
              <option value="Active">Active</option>
              <option value="Maintenance">Under Maintenance</option>
              <option value="Disposed">Disposed / Written Off</option>
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">Location / Station Placement</label>
            <input
              type="text"
              value={editLoc}
              onChange={e => setEditLoc(e.target.value)}
              placeholder="Station / Bay location..."
              className="w-full bg-white text-slate-900 border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => setEditingAsset(null)}
              className="btn px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn px-4 py-1 bg-[#002D62] hover:bg-[#001D42] text-white text-xs font-bold uppercase rounded cursor-pointer shadow-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      )}

      {showAdd && (
        <form onSubmit={handleAddAsset} className="bg-slate-50 border border-[#A6C4DE] p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-4 pb-1 border-b border-slate-200">
            <h3 className="text-xs font-bold text-[#002D62] uppercase">Register Capital Good Asset ({activeCompany.name})</h3>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Asset Code</label>
            <input type="text" required value={newCode} onChange={e => setNewCode(e.target.value)} placeholder={`${codePrefix}001`} className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Asset Description</label>
            <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Asset description / equipment name" className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Category ({activeCompany.code})</label>
            <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full">
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Acquisition Date</label>
            <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Acquisition Cost (AED)</label>
            <input type="number" required value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="150000" className="w-full" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Depreciation % (Annual)</label>
            <input type="number" value={newDepRate} onChange={e => setNewDepRate(e.target.value)} placeholder="10" className="w-full" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Location / Station Placement</label>
            <input type="text" value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="Station / Bay location" className="w-full" />
          </div>
          <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-trojan-reset text-xs">Cancel</button>
            <button type="submit" className="btn-trojan-search text-xs">Save Asset</button>
          </div>
        </form>
      )}

      {/* Query Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeCompany.shortName || activeCompany.name} asset description, code or locations...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full text-xs">
            <option value="ALL">ALL CATEGORIES ({activeCompany.code})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto shadow-xs border border-[#A6C4DE]">
        <table className="box-shaped-table m-0">
          <thead>
            <tr>
              <th className="w-[100px]">Asset Code</th>
              <th className="text-left">Asset Name</th>
              <th>Category</th>
              <th>Acquisition Date</th>
              <th className="text-right">Original Cost</th>
              <th>Dep. %</th>
              <th className="text-right">Current Book Value</th>
              <th className="text-left">Location</th>
              <th className="w-[80px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td className="text-center font-mono font-bold text-slate-900">{a.assetCode}</td>
                <td className="text-left font-medium text-slate-800">{a.assetName}</td>
                <td className="text-center">
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-[#CDE4F5] text-[#002D62] border border-[#A6C4DE]/60 uppercase">
                    {a.category}
                  </span>
                </td>
                <td className="text-center font-mono text-slate-600">{a.purchaseDate}</td>
                <td className="text-right font-mono text-slate-700">AED {a.purchaseValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="text-center font-mono text-slate-500">{a.depreciationRate}%</td>
                <td className="text-right font-mono text-indigo-900 font-bold">AED {a.currentValue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td className="text-left text-slate-650">{a.location}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleStartEdit(a)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      title="Edit Asset Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer transition-colors"
                      title="Dispose/Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-slate-400 text-xs">
                  No assets found for {activeCompany.name} matching the query criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

