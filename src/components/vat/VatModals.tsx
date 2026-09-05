import React, { useState, useEffect } from 'react';
import {
  X, Save, CheckCircle2, AlertCircle, Plus, DollarSign,
  Calendar, Hash, Building2, Globe, Landmark, Layers, BookOpen, Clock, FileSpreadsheet,
  ArrowUpDown, ShieldCheck
} from 'lucide-react';
import {
  AdvanceReceiptRecord, ReverseChargeRecord, CustomsVatRecord,
  TaxPaymentRecord, TaxRateMaster, PartyTrnMaster, ReturnTxItem
} from '../UaeVat201ManagerComponent';

// 1. ADVANCE RECEIPT MODAL
export interface AdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: AdvanceReceiptRecord) => void;
  editingItem?: AdvanceReceiptRecord | null;
  partyList?: PartyTrnMaster[];
}

export const AddEditAdvanceReceiptModal: React.FC<AdvanceModalProps> = ({
  isOpen, onClose, onSave, editingItem, partyList = []
}) => {
  const [voucherNo, setVoucherNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerTrn, setCustomerTrn] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Sharjah');
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [taxableAmount, setTaxableAmount] = useState<number>(0);
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [status, setStatus] = useState<'UNADJUSTED' | 'PARTIALLY_ADJUSTED' | 'ADJUSTED'>('UNADJUSTED');
  const [allocatedInvoiceNo, setAllocatedInvoiceNo] = useState('');
  const [allocationDate, setAllocationDate] = useState('');
  const [narration, setNarration] = useState('');

  useEffect(() => {
    if (editingItem) {
      setVoucherNo(editingItem.voucherNo);
      setDate(editingItem.date);
      setCustomerName(editingItem.customerName);
      setCustomerTrn(editingItem.customerTrn);
      setPlaceOfSupply(editingItem.placeOfSupply);
      setAdvanceAmount(editingItem.advanceAmount);
      setTaxableAmount(editingItem.taxableAmount);
      setVatAmount(editingItem.vatAmount);
      setStatus(editingItem.status);
      setAllocatedInvoiceNo(editingItem.allocatedInvoiceNo || '');
      setAllocationDate(editingItem.allocationDate || '');
      setNarration(editingItem.narration || '');
    } else {
      setVoucherNo(`AR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setDate(new Date().toISOString().split('T')[0]);
      setCustomerName('');
      setCustomerTrn('');
      setPlaceOfSupply('Sharjah');
      setAdvanceAmount(0);
      setTaxableAmount(0);
      setVatAmount(0);
      setStatus('UNADJUSTED');
      setAllocatedInvoiceNo('');
      setAllocationDate('');
      setNarration('');
    }
  }, [editingItem, isOpen]);

  // Auto calc from Gross Amount (Gross = Taxable + 5% VAT -> Taxable = Gross / 1.05)
  const handleGrossChange = (val: number) => {
    setAdvanceAmount(val);
    const taxable = Number((val / 1.05).toFixed(2));
    const vat = Number((val - taxable).toFixed(2));
    setTaxableAmount(taxable);
    setVatAmount(vat);
  };

  const handleTaxableChange = (val: number) => {
    setTaxableAmount(val);
    const vat = Number((val * 0.05).toFixed(2));
    const gross = Number((val + vat).toFixed(2));
    setVatAmount(vat);
    setAdvanceAmount(gross);
  };

  const handleSelectCustomer = (name: string) => {
    setCustomerName(name);
    const found = partyList.find(p => p.partyName.toLowerCase() === name.toLowerCase());
    if (found) {
      setCustomerTrn(found.trn);
      setPlaceOfSupply(found.emirate);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              {editingItem ? 'Edit Advance Receipt (Article 25)' : 'Record Advance Receipt (Article 25 Tax Point)'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Account for 5% Output VAT upon receipt of advance prior to tax invoice issuance
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!customerName || advanceAmount <= 0) return;
            onSave({
              id: editingItem ? editingItem.id : `adv-${Date.now()}`,
              voucherNo,
              date,
              customerName,
              customerTrn,
              placeOfSupply,
              advanceAmount,
              taxableAmount,
              vatAmount,
              status,
              allocatedInvoiceNo: status === 'UNADJUSTED' ? '' : allocatedInvoiceNo,
              allocationDate: status === 'UNADJUSTED' ? '' : allocationDate,
              allocatedAmount: status === 'ADJUSTED' ? advanceAmount : 0,
              narration
            });
            onClose();
          }}
          className="p-6 space-y-4 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Voucher Number</label>
              <input
                type="text"
                required
                value={voucherNo}
                onChange={e => setVoucherNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receipt Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer / Client Name</label>
              <input
                type="text"
                required
                placeholder="e.g. GULF PIPELINES CONTRACTING LLC"
                value={customerName}
                onChange={e => handleSelectCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer TRN (15-digits)</label>
              <input
                type="text"
                placeholder="100XXXXXXXXX003"
                value={customerTrn}
                onChange={e => setCustomerTrn(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Place of Supply (Emirate)</label>
              <select
                value={placeOfSupply}
                onChange={e => setPlaceOfSupply(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="Abu Dhabi">Abu Dhabi (Box 1a)</option>
                <option value="Dubai">Dubai (Box 1b)</option>
                <option value="Sharjah">Sharjah (Box 1c)</option>
                <option value="Ajman">Ajman (Box 1d)</option>
                <option value="Umm Al Quwain">Umm Al Quwain (Box 1e)</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah (Box 1f)</option>
                <option value="Fujairah">Fujairah (Box 1g)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adjustment Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="UNADJUSTED">UNADJUSTED (Open Advance)</option>
                <option value="PARTIALLY_ADJUSTED">PARTIALLY ADJUSTED</option>
                <option value="ADJUSTED">ADJUSTED (Tax Invoice Issued)</option>
              </select>
            </div>
          </div>

          {/* Amount Calculation Cards */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
              <span>Advance Amount Breakdown</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold">5% UAE VAT RATE</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Gross Advance (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={advanceAmount || ''}
                  onChange={e => handleGrossChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 font-bold text-xs rounded-lg text-right"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Taxable Base (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxableAmount || ''}
                  onChange={e => handleTaxableChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-xs rounded-lg text-right"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Output VAT 5% (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  value={vatAmount || ''}
                  className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 font-bold text-emerald-900 text-xs rounded-lg text-right"
                />
              </div>
            </div>
          </div>

          {status !== 'UNADJUSTED' && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">Allocated Invoice No</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-089"
                  value={allocatedInvoiceNo}
                  onChange={e => setAllocatedInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">Allocation / Invoice Date</label>
                <input
                  type="date"
                  value={allocationDate}
                  onChange={e => setAllocationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Narration / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Advance 50% for Custom Grade 8.8 Galvanized Stud Bolts production"
              value={narration}
              onChange={e => setNarration(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingItem ? 'Update Advance Receipt' : 'Save Advance Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. REVERSE CHARGE MECHANISM (RCM) MODAL
export interface RcmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ReverseChargeRecord) => void;
  editingItem?: ReverseChargeRecord | null;
}

export const AddEditRcmModal: React.FC<RcmModalProps> = ({
  isOpen, onClose, onSave, editingItem
}) => {
  const [refNo, setRefNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [country, setCountry] = useState('');
  const [natureOfService, setNatureOfService] = useState('');
  const [serviceCategory, setServiceCategory] = useState<'IMPORT_SERVICES' | 'IMPORT_GOODS_NO_CUSTOMS' | 'SCRAP_METAL_RCM' | 'OTHER_RCM'>('IMPORT_SERVICES');
  const [taxableAmount, setTaxableAmount] = useState<number>(0);
  const [rcmOutputTax, setRcmOutputTax] = useState<number>(0);
  const [recoverableInputTax, setRecoverableInputTax] = useState<number>(0);
  const [vatBox, setVatBox] = useState<'BOX_3_OUTPUT' | 'BOX_10_INPUT' | 'BOTH_3_AND_10'>('BOTH_3_AND_10');
  const [documentRef, setDocumentRef] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (editingItem) {
      setRefNo(editingItem.refNo);
      setDate(editingItem.date);
      setSupplierName(editingItem.supplierName);
      setCountry(editingItem.country);
      setNatureOfService(editingItem.natureOfService);
      setServiceCategory(editingItem.serviceCategory);
      setTaxableAmount(editingItem.taxableAmount);
      setRcmOutputTax(editingItem.rcmOutputTax);
      setRecoverableInputTax(editingItem.recoverableInputTax);
      setVatBox(editingItem.vatBox);
      setDocumentRef(editingItem.documentRef || '');
      setRemarks(editingItem.remarks || '');
    } else {
      setRefNo(`RCM-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
      setDate(new Date().toISOString().split('T')[0]);
      setSupplierName('');
      setCountry('Germany');
      setNatureOfService('');
      setServiceCategory('IMPORT_SERVICES');
      setTaxableAmount(0);
      setRcmOutputTax(0);
      setRecoverableInputTax(0);
      setVatBox('BOTH_3_AND_10');
      setDocumentRef('');
      setRemarks('Box 3 Output tax accounted; 100% recovered under Box 10');
    }
  }, [editingItem, isOpen]);

  const handleAmountChange = (amt: number) => {
    setTaxableAmount(amt);
    const tax = Number((amt * 0.05).toFixed(2));
    setRcmOutputTax(tax);
    setRecoverableInputTax(tax);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-indigo-400" />
              {editingItem ? 'Edit RCM Declaration' : 'Add Reverse Charge Mechanism (RCM) Declaration'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Account for Output Tax (Box 3) and Recoverable Input Tax (Box 10) on cross-border supplies
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!supplierName || taxableAmount <= 0) return;
            onSave({
              id: editingItem ? editingItem.id : `rcm-${Date.now()}`,
              refNo,
              date,
              supplierName,
              country,
              natureOfService,
              serviceCategory,
              taxableAmount,
              rcmOutputTax,
              recoverableInputTax,
              vatBox,
              documentRef,
              remarks
            });
            onClose();
          }}
          className="p-6 space-y-4 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">RCM Ref No</label>
              <input
                type="text"
                required
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Declaration Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Overseas Supplier / Vendor</label>
              <input
                type="text"
                required
                placeholder="e.g. SOLIDWORKS CORP"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Country of Origin / Residence</label>
              <input
                type="text"
                placeholder="e.g. Germany / USA / France"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Procurement Category</label>
              <select
                value={serviceCategory}
                onChange={e => setServiceCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="IMPORT_SERVICES">Import of Overseas Services (Clause 48)</option>
                <option value="IMPORT_GOODS_NO_CUSTOMS">Import Goods Without Customs Clearance</option>
                <option value="SCRAP_METAL_RCM">Local Scrap Metal RCM (B2B)</option>
                <option value="OTHER_RCM">Other Designated RCM Supplies</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">VAT Return Box Designation</label>
              <select
                value={vatBox}
                onChange={e => setVatBox(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="BOTH_3_AND_10">Both Box 3 (Output) & Box 10 (Input)</option>
                <option value="BOX_3_OUTPUT">Box 3 (Output Only - Non-Recoverable)</option>
                <option value="BOX_10_INPUT">Box 10 (Input Recovery Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nature of Service / Goods Procurement</label>
            <input
              type="text"
              required
              placeholder="e.g. Specialized Tensile & Salt Spray ISO 17025 Third-Party Lab Testing"
              value={natureOfService}
              onChange={e => setNatureOfService(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
            />
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">Taxable Base (AED)</label>
              <input
                type="number"
                step="0.01"
                required
                value={taxableAmount || ''}
                onChange={e => handleAmountChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-indigo-300 font-bold text-xs rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">Box 3 Output (5%)</label>
              <input
                type="number"
                readOnly
                value={rcmOutputTax || ''}
                className="w-full px-3 py-2 bg-indigo-100 border border-indigo-300 font-bold text-indigo-950 text-xs rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-900 uppercase mb-1">Box 10 Input (5%)</label>
              <input
                type="number"
                readOnly
                value={recoverableInputTax || ''}
                className="w-full px-3 py-2 bg-indigo-100 border border-indigo-300 font-bold text-indigo-950 text-xs rounded-lg text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Foreign Document / Invoice Ref</label>
              <input
                type="text"
                placeholder="e.g. TUV-DE-44120"
                value={documentRef}
                onChange={e => setDocumentRef(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Audit Remarks / Justification</label>
              <input
                type="text"
                placeholder="e.g. Technical Metallurgy Verification Certs for ADNOC Project"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingItem ? 'Update RCM Declaration' : 'Save RCM Declaration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. CUSTOMS VAT IMPORT DECLARATION MODAL
export interface CustomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: CustomsVatRecord) => void;
  editingItem?: CustomsVatRecord | null;
}

export const AddEditCustomsModal: React.FC<CustomsModalProps> = ({
  isOpen, onClose, onSave, editingItem
}) => {
  const [declarationNo, setDeclarationNo] = useState('');
  const [boeNo, setBoeNo] = useState('');
  const [customsPort, setCustomsPort] = useState('Port Khalid (Sharjah)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [cifValue, setCifValue] = useState<number>(0);
  const [customsDuty, setCustomsDuty] = useState<number>(0);
  const [vatBaseAmount, setVatBaseAmount] = useState<number>(0);
  const [vatAmountPaid, setVatAmountPaid] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'DIRECT_CUSTOMS_PAYMENT' | 'FTA_DEFERRED_ACCOUNT' | 'E_GUARANTEE'>('DIRECT_CUSTOMS_PAYMENT');
  const [clearingAgent, setClearingAgent] = useState('');
  const [reconciliationStatus, setReconciliationStatus] = useState<'MATCHED' | 'AUTO_POPULATED_FTA' | 'MANUAL_DISCREPANCY'>('MATCHED');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (editingItem) {
      setDeclarationNo(editingItem.declarationNo);
      setBoeNo(editingItem.boeNo);
      setCustomsPort(editingItem.customsPort);
      setDate(editingItem.date);
      setSupplierName(editingItem.supplierName);
      setCifValue(editingItem.cifValue);
      setCustomsDuty(editingItem.customsDuty);
      setVatBaseAmount(editingItem.vatBaseAmount);
      setVatAmountPaid(editingItem.vatAmountPaid);
      setPaymentMode(editingItem.paymentMode);
      setClearingAgent(editingItem.clearingAgent || '');
      setReconciliationStatus(editingItem.reconciliationStatus);
      setRemarks(editingItem.remarks || '');
    } else {
      setDeclarationNo(`CD-2026-${Math.floor(10000 + Math.random() * 90000)}`);
      setBoeNo(`BOE-SHJ-2026-${Math.floor(100 + Math.random() * 900)}`);
      setCustomsPort('Port Khalid (Sharjah)');
      setDate(new Date().toISOString().split('T')[0]);
      setSupplierName('');
      setCifValue(0);
      setCustomsDuty(0);
      setVatBaseAmount(0);
      setVatAmountPaid(0);
      setPaymentMode('DIRECT_CUSTOMS_PAYMENT');
      setClearingAgent('AL FAHEEM SHIPPING & CUSTOMS CLEARING LLC');
      setReconciliationStatus('MATCHED');
      setRemarks('');
    }
  }, [editingItem, isOpen]);

  // Recalculate VAT base: CIF + Duty -> 5% VAT
  const handleCifChange = (cif: number) => {
    setCifValue(cif);
    const duty = Number((cif * 0.05).toFixed(2));
    setCustomsDuty(duty);
    const base = Number((cif + duty).toFixed(2));
    setVatBaseAmount(base);
    const vat = Number((base * 0.05).toFixed(2));
    setVatAmountPaid(vat);
  };

  const handleDutyChange = (duty: number) => {
    setCustomsDuty(duty);
    const base = Number((cifValue + duty).toFixed(2));
    setVatBaseAmount(base);
    const vat = Number((base * 0.05).toFixed(2));
    setVatAmountPaid(vat);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              {editingItem ? 'Edit Customs Declaration' : 'Add VAT Paid to Customs Declaration (Bill of Entry)'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Record port import declaration, BOE number, CIF, 5% duty, and 5% import VAT paid
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!supplierName || vatBaseAmount <= 0) return;
            onSave({
              id: editingItem ? editingItem.id : `cust-${Date.now()}`,
              declarationNo,
              boeNo,
              customsPort,
              date,
              supplierName,
              cifValue,
              customsDuty,
              vatBaseAmount,
              vatAmountPaid,
              paymentMode,
              clearingAgent,
              reconciliationStatus,
              remarks
            });
            onClose();
          }}
          className="p-6 space-y-4 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customs Declaration No</label>
              <input
                type="text"
                required
                value={declarationNo}
                onChange={e => setDeclarationNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bill of Entry (BOE) No</label>
              <input
                type="text"
                required
                value={boeNo}
                onChange={e => setBoeNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customs Port</label>
              <select
                value={customsPort}
                onChange={e => setCustomsPort(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="Port Khalid (Sharjah)">Port Khalid (Sharjah)</option>
                <option value="Jebel Ali Port (Dubai)">Jebel Ali Port (Dubai)</option>
                <option value="Port Rashid (Dubai)">Port Rashid (Dubai)</option>
                <option value="Khalifa Port (Abu Dhabi)">Khalifa Port (Abu Dhabi)</option>
                <option value="Hamriyah Port (Sharjah)">Hamriyah Port (Sharjah)</option>
                <option value="Dubai Cargo Village (Air)">Dubai Cargo Village (Air)</option>
                <option value="Sharjah Intl Airport (Air)">Sharjah Intl Airport (Air)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clearance Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="DIRECT_CUSTOMS_PAYMENT">Direct Customs Payment</option>
                <option value="FTA_DEFERRED_ACCOUNT">FTA Deferred Payment</option>
                <option value="E_GUARANTEE">E-Guarantee Deposit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Overseas Exporter / Supplier</label>
              <input
                type="text"
                required
                placeholder="e.g. JINAN FASTENER CO., LTD. (CHINA)"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clearing Agent</label>
              <input
                type="text"
                placeholder="e.g. AL FAHEEM SHIPPING & CUSTOMS CLEARING LLC"
                value={clearingAgent}
                onChange={e => setClearingAgent(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          {/* CIF & VAT Computation */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-blue-900 uppercase">Valuation & VAT Base Breakdown (AED)</div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">CIF Value (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cifValue || ''}
                  onChange={e => handleCifChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 font-bold text-xs rounded-lg text-right"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Customs Duty 5%</label>
                <input
                  type="number"
                  step="0.01"
                  value={customsDuty || ''}
                  onChange={e => handleDutyChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-xs rounded-lg text-right"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">VAT Base (CIF + Duty)</label>
                <input
                  type="number"
                  readOnly
                  value={vatBaseAmount || ''}
                  className="w-full px-3 py-2 bg-blue-100 font-bold text-blue-950 text-xs rounded-lg text-right"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">5% VAT Paid (AED)</label>
                <input
                  type="number"
                  readOnly
                  value={vatAmountPaid || ''}
                  className="w-full px-3 py-2 bg-emerald-100 border border-emerald-300 font-bold text-emerald-950 text-xs rounded-lg text-right"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reconciliation Status</label>
              <select
                value={reconciliationStatus}
                onChange={e => setReconciliationStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="MATCHED">MATCHED (Reconciled with FTA)</option>
                <option value="AUTO_POPULATED_FTA">AUTO POPULATED (FTA Direct Import)</option>
                <option value="MANUAL_DISCREPANCY">MANUAL DISCREPANCY (Pending Audit)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Commercial Invoice / Notes</label>
              <input
                type="text"
                placeholder="e.g. 2x 20ft Container High Tensile Bolts & Nuts"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingItem ? 'Update Declaration' : 'Save Declaration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. TAX PAYMENT RECONCILIATION MODAL
export interface TaxPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: TaxPaymentRecord) => void;
  editingItem?: TaxPaymentRecord | null;
  companyGiban: string;
}

export const AddEditTaxPaymentModal: React.FC<TaxPaymentModalProps> = ({
  isOpen, onClose, onSave, editingItem, companyGiban
}) => {
  const [taxPeriod, setTaxPeriod] = useState('Q1 2026 (Jan - Mar)');
  const [taxYear, setTaxYear] = useState(2026);
  const [returnDueDate, setReturnDueDate] = useState('2026-04-28');
  const [form201NetPayable, setForm201NetPayable] = useState<number>(0);
  const [gibanRef, setGibanRef] = useState(companyGiban);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentVoucherNo, setPaymentVoucherNo] = useState('');
  const [bankAccount, setBankAccount] = useState('RAKBANK - Current A/C (AED)');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [penalties, setPenalties] = useState<number>(0);
  const [interest, setInterest] = useState<number>(0);
  const [reconciliationStatus, setReconciliationStatus] = useState<'SETTLED' | 'PENDING_PAYMENT' | 'PARTIAL' | 'OVERPAID_CREDIT'>('SETTLED');
  const [ftaRefNumber, setFtaRefNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (editingItem) {
      setTaxPeriod(editingItem.taxPeriod);
      setTaxYear(editingItem.taxYear);
      setReturnDueDate(editingItem.returnDueDate);
      setForm201NetPayable(editingItem.form201NetPayable);
      setGibanRef(editingItem.gibanRef);
      setPaymentDate(editingItem.paymentDate || '');
      setPaymentVoucherNo(editingItem.paymentVoucherNo || '');
      setBankAccount(editingItem.bankAccount || 'RAKBANK - Current A/C (AED)');
      setAmountPaid(editingItem.amountPaid);
      setPenalties(editingItem.penalties || 0);
      setInterest(editingItem.interest || 0);
      setReconciliationStatus(editingItem.reconciliationStatus);
      setFtaRefNumber(editingItem.ftaRefNumber || '');
      setRemarks(editingItem.remarks || '');
    } else {
      setTaxPeriod('Q1 2026 (Jan - Mar)');
      setTaxYear(2026);
      setReturnDueDate('2026-04-28');
      setForm201NetPayable(0);
      setGibanRef(companyGiban);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentVoucherNo(`TP-2026-${Math.floor(100 + Math.random() * 900)}`);
      setBankAccount('RAKBANK - Current A/C (AED)');
      setAmountPaid(0);
      setPenalties(0);
      setInterest(0);
      setReconciliationStatus('SETTLED');
      setFtaRefNumber(`FTA-PAY-${Math.floor(100000 + Math.random() * 900000)}`);
      setRemarks('Settled via Corporate Online Banking to FTA GIBAN');
    }
  }, [editingItem, isOpen, companyGiban]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" />
              {editingItem ? 'Edit Tax Payment Settlement' : 'Record FTA Tax Payment / GIBAN Settlement'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Reconcile VAT 201 Form Net Payable with Bank Debit Voucher and FTA Reference
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              id: editingItem ? editingItem.id : `pmt-${Date.now()}`,
              taxPeriod,
              taxYear,
              returnDueDate,
              form201NetPayable,
              gibanRef,
              paymentDate,
              paymentVoucherNo,
              bankAccount,
              amountPaid,
              penalties,
              interest,
              reconciliationStatus,
              ftaRefNumber,
              remarks
            });
            onClose();
          }}
          className="p-6 space-y-4 overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax Period</label>
              <input
                type="text"
                required
                value={taxPeriod}
                onChange={e => setTaxPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Filing Due Date</label>
              <input
                type="date"
                required
                value={returnDueDate}
                onChange={e => setReturnDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">FTA GIBAN Account Number</label>
              <input
                type="text"
                required
                value={gibanRef}
                onChange={e => setGibanRef(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 font-mono border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Paying Bank Account</label>
              <select
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="RAKBANK - Current A/C (AED)">RAKBANK - Current A/C (AED)</option>
                <option value="EMIRATES NBD - Corporate A/C">EMIRATES NBD - Corporate A/C</option>
                <option value="ADCB - Commercial A/C">ADCB - Commercial A/C</option>
                <option value="FAB - First Abu Dhabi Bank">FAB - First Abu Dhabi Bank</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-1">Form 201 Net Due (AED)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form201NetPayable || ''}
                onChange={e => setForm201NetPayable(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-emerald-300 font-bold text-xs rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-1">Amount Paid (AED)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountPaid || ''}
                onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-emerald-300 font-bold text-xs rounded-lg text-right"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-1">Settlement Status</label>
              <select
                value={reconciliationStatus}
                onChange={e => setReconciliationStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-emerald-300 font-bold text-xs rounded-lg"
              >
                <option value="SETTLED">SETTLED</option>
                <option value="PENDING_PAYMENT">PENDING PAYMENT</option>
                <option value="PARTIAL">PARTIAL PAYMENT</option>
                <option value="OVERPAID_CREDIT">OVERPAID / CREDIT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bank Payment Voucher #</label>
              <input
                type="text"
                placeholder="TP-2026-001"
                value={paymentVoucherNo}
                onChange={e => setPaymentVoucherNo(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">FTA Receipt Reference</label>
              <input
                type="text"
                placeholder="FTA-PAY-981244"
                value={ftaRefNumber}
                onChange={e => setFtaRefNumber(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingItem ? 'Update Payment Record' : 'Save Payment Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
