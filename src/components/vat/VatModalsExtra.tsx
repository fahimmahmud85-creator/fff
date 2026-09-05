import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle2, AlertCircle, Plus, Columns, Hash, Building2, Globe } from 'lucide-react';
import { TaxRateMaster, PartyTrnMaster, ReturnTxItem } from '../UaeVat201ManagerComponent';

// 1. CUSTOMS COLUMNS CUSTOMIZER MODAL
export interface CustomsColumnsConfig {
  declarationNo: boolean;
  boeNo: boolean;
  date: boolean;
  customsPort: boolean;
  supplierName: boolean;
  cifValue: boolean;
  customsDuty: boolean;
  vatBaseAmount: boolean;
  vatAmountPaid: boolean;
  paymentMode: boolean;
  clearingAgent: boolean;
  reconciliationStatus: boolean;
  remarks: boolean;
}

export interface CustomsColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns?: CustomsColumnsConfig;
  columnsConfig?: CustomsColumnsConfig;
  onChange?: (cols: CustomsColumnsConfig) => void;
  onSave?: (cols: CustomsColumnsConfig) => void;
}

export const CustomsColumnsModal: React.FC<CustomsColumnsModalProps> = ({
  isOpen, onClose, columns, columnsConfig, onChange, onSave
}) => {
  const initialCols = columnsConfig || columns || {
    declarationNo: true,
    boeNo: true,
    date: true,
    customsPort: true,
    supplierName: true,
    cifValue: true,
    customsDuty: true,
    vatBaseAmount: true,
    vatAmountPaid: true,
    paymentMode: true,
    clearingAgent: true,
    reconciliationStatus: true,
    remarks: true
  };
  const [cols, setCols] = useState<CustomsColumnsConfig>(initialCols);

  useEffect(() => {
    if (columnsConfig) setCols(columnsConfig);
    else if (columns) setCols(columns);
  }, [columns, columnsConfig, isOpen]);

  if (!isOpen) return null;

  const columnLabels: { key: keyof CustomsColumnsConfig; label: string; desc: string }[] = [
    { key: 'declarationNo', label: 'Declaration Number', desc: 'Customs reference identifier' },
    { key: 'boeNo', label: 'Bill of Entry (BOE) No', desc: 'Port import clearance number' },
    { key: 'date', label: 'Clearance Date', desc: 'Filing & entry tax point date' },
    { key: 'customsPort', label: 'Customs Port Name', desc: 'e.g. Port Khalid, Jebel Ali' },
    { key: 'supplierName', label: 'Overseas Exporter / Supplier', desc: 'Vendor country and entity' },
    { key: 'cifValue', label: 'CIF Value (AED)', desc: 'Cost, insurance & freight total' },
    { key: 'customsDuty', label: 'Customs Duty (5%)', desc: 'Applicable port customs duty' },
    { key: 'vatBaseAmount', label: 'VAT Base (CIF + Duty)', desc: 'Total base for 5% tax computation' },
    { key: 'vatAmountPaid', label: '5% VAT Paid (AED)', desc: 'Recoverable import input tax' },
    { key: 'paymentMode', label: 'Payment Mode', desc: 'Direct, FTA Deferred, or E-Guarantee' },
    { key: 'clearingAgent', label: 'Clearing Agent', desc: 'Authorized customs broker' },
    { key: 'reconciliationStatus', label: 'Reconciliation Status', desc: 'Matched with FTA portal' },
    { key: 'remarks', label: 'Commercial Invoice / Remarks', desc: 'Audit notes & descriptions' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Customs Declaration Columns Configuration</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 overflow-y-auto">
          <p className="text-xs text-slate-600">
            Select the declaration fields and valuation columns to display on the VAT Paid to Customs Audit Register:
          </p>

          <div className="grid grid-cols-1 gap-2 pt-2">
            {columnLabels.map(item => (
              <label
                key={item.key}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{item.label}</div>
                  <div className="text-[11px] text-slate-500">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={cols[item.key]}
                  onChange={e => setCols(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const allTrue: any = {};
              columnLabels.forEach(c => (allTrue[c.key] = true));
              setCols(allTrue);
            }}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Select All
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSave) onSave(cols);
                else if (onChange) onChange(cols);
                onClose();
              }}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
            >
              Apply Columns
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. ADD/EDIT TAX RATE MASTER MODAL
export interface TaxRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rate: TaxRateMaster) => void;
  editingItem?: TaxRateMaster | null;
}

export const AddEditTaxRateModal: React.FC<TaxRateModalProps> = ({
  isOpen, onClose, onSave, editingItem
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [rate, setRate] = useState<number>(5.00);
  const [category, setCategory] = useState<'STANDARD' | 'ZERO_RATED' | 'EXEMPT' | 'OUT_OF_SCOPE' | 'REVERSE_CHARGE' | 'SPECIAL_SCHEME'>('STANDARD');
  const [scope, setScope] = useState('');
  const [outputGlAccount, setOutputGlAccount] = useState('VAT Output Tax Payable [GL-2150]');
  const [inputGlAccount, setInputGlAccount] = useState('VAT Input Tax Recoverable [GL-1350]');
  const [effectiveFrom, setEffectiveFrom] = useState('2018-01-01');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.code);
      setName(editingItem.name);
      setRate(editingItem.rate);
      setCategory(editingItem.category);
      setScope(editingItem.scope);
      setOutputGlAccount(editingItem.outputGlAccount);
      setInputGlAccount(editingItem.inputGlAccount);
      setEffectiveFrom(editingItem.effectiveFrom);
      setIsActive(editingItem.isActive);
    } else {
      setCode(`TR-CUSTOM-${Math.floor(10 + Math.random() * 90)}`);
      setName('');
      setRate(5.00);
      setCategory('STANDARD');
      setScope('Standard taxable supply under Executive Regulation Article (24)');
      setOutputGlAccount('VAT Output Tax Payable [GL-2150]');
      setInputGlAccount('VAT Input Tax Recoverable [GL-1350]');
      setEffectiveFrom('2018-01-01');
      setIsActive(true);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold">
            {editingItem ? 'Edit Tax Rate Code' : 'Add New VAT Rate Code (Master)'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              id: editingItem ? editingItem.id : `TR-${Date.now()}`,
              code,
              name,
              rate,
              category,
              scope,
              outputGlAccount,
              inputGlAccount,
              effectiveFrom,
              isActive,
              isSystemDefault: false
            });
            onClose();
          }}
          className="p-6 space-y-4 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 font-mono font-bold border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">VAT Rate (%)</label>
              <input
                type="number"
                step="0.01"
                required
                value={rate}
                onChange={e => setRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 font-bold border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax Code Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Standard Rated Supplies 5%"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax Classification Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
            >
              <option value="STANDARD">STANDARD (5% Standard Rate)</option>
              <option value="ZERO_RATED">ZERO RATED (0% Exports & Designated Zones)</option>
              <option value="EXEMPT">EXEMPT (Financial & Local Passenger)</option>
              <option value="OUT_OF_SCOPE">OUT OF SCOPE (Merchanting Trade)</option>
              <option value="REVERSE_CHARGE">REVERSE CHARGE (RCM 5%)</option>
              <option value="SPECIAL_SCHEME">SPECIAL SCHEME (Profit Margin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Regulatory Scope / Legal Clause</label>
            <input
              type="text"
              value={scope}
              onChange={e => setScope(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Output GL Account</label>
              <input
                type="text"
                value={outputGlAccount}
                onChange={e => setOutputGlAccount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Input GL Account</label>
              <input
                type="text"
                value={inputGlAccount}
                onChange={e => setInputGlAccount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Tax Rate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. ADD/EDIT PARTY TRN MASTER MODAL
export interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (party: PartyTrnMaster) => void;
  editingItem?: PartyTrnMaster | null;
}

export const AddEditPartyModal: React.FC<PartyModalProps> = ({
  isOpen, onClose, onSave, editingItem
}) => {
  const [trn, setTrn] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyType, setPartyType] = useState<'CUSTOMER' | 'SUPPLIER' | 'BOTH'>('CUSTOMER');
  const [emirate, setEmirate] = useState('Sharjah');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTrn(editingItem.trn);
      setPartyName(editingItem.partyName);
      setPartyType(editingItem.partyType);
      setEmirate(editingItem.emirate);
      setAddress(editingItem.address || '');
      setPhone(editingItem.phone || '');
      setEmail(editingItem.email || '');
      setIsVerified(editingItem.isVerified);
    } else {
      setTrn('');
      setPartyName('');
      setPartyType('CUSTOMER');
      setEmirate('Sharjah');
      setAddress('');
      setPhone('');
      setEmail('');
      setIsVerified(true);
    }
  }, [editingItem, isOpen]);

  const isValidTrn = trn.replace(/[^0-9]/g, '').length === 15 && trn.startsWith('100');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">
              {editingItem ? 'Edit Taxable Party / TRN Profile' : 'Register Taxable Party (Customer/Supplier TRN)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!partyName || !trn) return;
            onSave({
              id: editingItem ? editingItem.id : `trn-${Date.now()}`,
              trn,
              partyName,
              partyType,
              emirate,
              address,
              phone,
              email,
              isVerified: isValidTrn
            });
            onClose();
          }}
          className="p-6 space-y-4 overflow-y-auto"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              15-Digit UAE Tax Registration Number (TRN)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={15}
                placeholder="100XXXXXXXXX003"
                value={trn}
                onChange={e => setTrn(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full px-3 py-2 font-mono font-bold text-xs rounded-lg border ${
                  isValidTrn ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-300'
                }`}
              />
              {isValidTrn && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  FTA VALID
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Legal Entity Name</label>
            <input
              type="text"
              required
              placeholder="e.g. EMIRATES FASTENERS MANUFACTURING LLC"
              value={partyName}
              onChange={e => setPartyName(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 font-bold border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Party Classification</label>
              <select
                value={partyType}
                onChange={e => setPartyType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="CUSTOMER">CUSTOMER (Debtor)</option>
                <option value="SUPPLIER">SUPPLIER (Creditor)</option>
                <option value="BOTH">BOTH (Customer & Supplier)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Emirate / State</label>
              <select
                value={emirate}
                onChange={e => setEmirate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Dubai">Dubai</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+971 4 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Accounts Email</label>
              <input
                type="email"
                placeholder="accounts@company.ae"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registered UAE Address</label>
            <input
              type="text"
              placeholder="e.g. Industrial Area 12, P.O. Box 40228, Sharjah, UAE"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Party TRN Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
