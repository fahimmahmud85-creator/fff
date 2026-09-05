import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit2, 
  FileText, 
  ClipboardList, 
  PenTool, 
  ShoppingCart, 
  Users, 
  Truck, 
  FileCheck, 
  Phone, 
  MapPin, 
  Building2, 
  Printer, 
  Check, 
  X,
  FileCode,
  ShieldCheck,
  Building,
  Info,
  Hash,
  ArrowRight,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerRecord, INITIAL_CUSTOMERS } from '../customerData';
import { printHtml } from './PrintHelper';
import { getActiveCompany, CompanyProfile, getCompanyIsoText } from '../utils/companyProfile';

function getInitials(name: string): string {
  if (!name) return 'C';
  // Strip common words and suffixes
  const cleaned = name
    .toUpperCase()
    .replace(/\b(L\.?L\.?C\.?|LTD\.?|CO\.?|AND|&|THE|FOR|OF|A|AN|IS|WITH|L\.L\.C|PVT|PRIVATE|LIMITED|INDUSTRIES|INDUSTRY|WORKS|SERVICES|SHIP|REPAIRING|YARD)\b/g, '')
    .trim();
  
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.substring(0, 3).toUpperCase();

  // If there's only one word, return first 3 characters
  if (words.length === 1) {
    return words[0].substring(0, 3);
  }

  // If there are multiple words, take the first letter of each word (up to 3 characters)
  return words.map(w => w[0]).join('').substring(0, 3);
}

interface ErpCustomerViewProps {
  onSelectAction?: (action: 'invoice' | 'quotation' | 'packing_list' | 'purchase', customer: any) => void;
  activeMode?: 'list' | 'for_invoice' | 'for_pl';
}

export default function ErpCustomerView({ onSelectAction, activeMode = 'list' }: ErpCustomerViewProps) {
  const [activeRegistryTab, setActiveRegistryTab] = useState<'customer' | 'supplier'>('customer');
  const [activeCompany, setActiveCompany] = useState<CompanyProfile>(() => getActiveCompany());

  // Customer State
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    const savedReg = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
    let loadedReg: any[] = [];
    if (savedReg) {
      try {
        const parsed = JSON.parse(savedReg);
        if (Array.isArray(parsed)) loadedReg = parsed;
      } catch (e) {}
    }

    const savedErp = localStorage.getItem('MFI_ERP_CUSTOMERS');
    let loadedErp: CustomerRecord[] = [];
    if (savedErp) {
      try {
        const parsed = JSON.parse(savedErp);
        if (Array.isArray(parsed)) loadedErp = parsed;
      } catch (e) {}
    }

    // Merge them by matching companyName / name or ID
    const merged: CustomerRecord[] = [];
    const seen = new Set<string>();

    const addRecord = (rc: any) => {
      const name = (rc.companyName || rc.name || '').trim().toUpperCase();
      if (!name || seen.has(name) || name.startsWith('SUPPLIER:')) return;
      seen.add(name);
      merged.push({
        id: rc.id || 'cust-' + Date.now(),
        companyName: name,
        address: (rc.address || '').toUpperCase(),
        poBox: rc.poBox || '—',
        trn: rc.trn || '—',
        phone: rc.phone || '—',
        faxNo: rc.faxNo || '—',
        contactPerson: rc.contactPerson || '',
        designation: rc.designation || '',
        email: rc.email || '',
        mobile: rc.mobile || '',
        companyId: rc.companyId || (String(rc.id).startsWith('cust-bmm') ? 'comp-bmm' : String(rc.id).startsWith('cust-umi') ? 'comp-umi' : 'comp-mfi')
      });
    };

    loadedErp.forEach(addRecord);
    loadedReg.forEach(addRecord);

    // If both are empty or don't have seed, seed from INITIAL_CUSTOMERS
    if (merged.length === 0) {
      INITIAL_CUSTOMERS.forEach(addRecord);
    }

    return merged.filter(c => !String(c.id).startsWith('cust-ocr-'));
  });

  // Supplier State
  const [suppliers, setSuppliers] = useState<CustomerRecord[]>(() => {
    const saved = localStorage.getItem('MFI_ERP_SUPPLIERS');
    let loaded: CustomerRecord[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) loaded = parsed;
      } catch (e) {}
    }
    return loaded;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Form Fields - Keeping professional corporate properties, representative completely removed
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [poBox, setPoBox] = useState('');
  const [trn, setTrn] = useState('');
  const [phone, setPhone] = useState('');
  const [faxNo, setFaxNo] = useState('');

  // Sync active company from localStorage / storage events
  useEffect(() => {
    const handleSync = () => {
      setActiveCompany(getActiveCompany());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('company_profile_updated', handleSync);
    window.addEventListener('active_company_changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('company_profile_updated', handleSync);
      window.removeEventListener('active_company_changed', handleSync);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setReloadTrigger(prev => prev + 1);
      const savedCust = localStorage.getItem('MFI_ERP_CUSTOMERS');
      const savedReg = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
      
      let loadedReg: any[] = [];
      if (savedReg) {
        try {
          const parsed = JSON.parse(savedReg);
          if (Array.isArray(parsed)) loadedReg = parsed;
        } catch (e) {}
      }

      let loadedErp: CustomerRecord[] = [];
      if (savedCust) {
        try {
          const parsed = JSON.parse(savedCust);
          if (Array.isArray(parsed)) loadedErp = parsed;
        } catch (e) {}
      }

      const merged: CustomerRecord[] = [];
      const seen = new Set<string>();

      const addRecord = (rc: any) => {
        const name = (rc.companyName || rc.name || '').trim().toUpperCase();
        if (!name || seen.has(name) || name.startsWith('SUPPLIER:')) return;
        seen.add(name);
        merged.push({
          id: rc.id || 'cust-' + Date.now(),
          companyName: name,
          address: (rc.address || '').toUpperCase(),
          poBox: rc.poBox || '—',
          trn: rc.trn || '—',
          phone: rc.phone || '—',
          faxNo: rc.faxNo || '—',
          contactPerson: rc.contactPerson || '',
          designation: rc.designation || '',
          email: rc.email || '',
          mobile: rc.mobile || '',
        });
      };

      loadedErp.forEach(addRecord);
      loadedReg.forEach(addRecord);

      const cleanMerged = merged.filter(c => !String(c.id).startsWith('cust-ocr-'));

      const currentCustStr = JSON.stringify(customers);
      const nextCustStr = JSON.stringify(cleanMerged);
      if (currentCustStr !== nextCustStr) {
        setCustomers(cleanMerged);
      }

      const savedSupp = localStorage.getItem('MFI_ERP_SUPPLIERS');
      if (savedSupp) {
        try {
          const parsed = JSON.parse(savedSupp);
          if (Array.isArray(parsed)) {
            const currentSuppStr = JSON.stringify(suppliers);
            const nextSuppStr = JSON.stringify(parsed);
            if (currentSuppStr !== nextSuppStr) {
              setSuppliers(parsed);
            }
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [customers, suppliers]);

  useEffect(() => {
    localStorage.setItem('MFI_ERP_CUSTOMERS', JSON.stringify(customers));
    
    // Also sync and write back any missing or updated records to MF_REGISTERED_CUSTOMERS
    try {
      const savedJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
      let regList: any[] = [];
      if (savedJson) {
        const parsed = JSON.parse(savedJson);
        if (Array.isArray(parsed)) regList = parsed;
      }
      
      let changed = false;
      customers.forEach(c => {
        const matchIdx = regList.findIndex(item => item.id === c.id || (item.companyName || item.name || '').trim().toUpperCase() === c.companyName);
        const updatedRegItem = {
          id: c.id,
          name: c.companyName,
          companyName: c.companyName,
          address: c.address,
          phone: c.phone,
          trn: c.trn,
          poBox: c.poBox,
          faxNo: c.faxNo || '—',
          placeOfSupply: 'DUBAI, UAE'
        };
        if (matchIdx >= 0) {
          const currentItemStr = JSON.stringify(regList[matchIdx]);
          const updatedItemStr = JSON.stringify({ ...regList[matchIdx], ...updatedRegItem });
          if (currentItemStr !== updatedItemStr) {
            regList[matchIdx] = { ...regList[matchIdx], ...updatedRegItem };
            changed = true;
          }
        } else {
          regList.push(updatedRegItem);
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(regList));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error("Failed to sync customer changes back to MF_REGISTERED_CUSTOMERS", e);
    }
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('MFI_ERP_SUPPLIERS', JSON.stringify(suppliers));
  }, [suppliers]);

  const resetForm = () => {
    setCompanyName('');
    setAddress('');
    setPoBox('');
    setTrn('');
    setPhone('');
    setFaxNo('');
    setShowAddForm(false);
    setIsEditing(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    const record: CustomerRecord = {
      id: isEditing || (activeRegistryTab === 'customer' ? 'cust-' : 'supp-') + Date.now(),
      companyName: companyName.toUpperCase(),
      address: address.toUpperCase(),
      poBox,
      trn,
      phone,
      faxNo,
      contactPerson: '', // Representative not required
      designation: '',
      email: '',
      mobile: '',
      companyId: activeCompany.id,
    };

    if (activeRegistryTab === 'customer') {
      if (isEditing) {
        setCustomers(prev => prev.map(c => c.id === isEditing ? record : c));
      } else {
        setCustomers(prev => [record, ...prev]);
      }

      // Sync with MF_REGISTERED_CUSTOMERS
      try {
        const savedJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
        let regList: any[] = [];
        if (savedJson) {
          regList = JSON.parse(savedJson);
          if (!Array.isArray(regList)) regList = [];
        }
        
        const matchIdx = regList.findIndex((item: any) => {
          return item.id === record.id || 
                 (item.name || '').trim().toUpperCase() === record.companyName.trim().toUpperCase() ||
                 (item.companyName || '').trim().toUpperCase() === record.companyName.trim().toUpperCase();
        });

        const updatedRegItem = {
          id: record.id,
          name: record.companyName,
          companyName: record.companyName,
          address: record.address,
          phone: record.phone,
          trn: record.trn,
          poBox: record.poBox,
          faxNo: record.faxNo,
          placeOfSupply: 'DUBAI, UAE',
          contactPerson: '',
          designation: '',
          email: '',
          mobile: '',
          companyId: activeCompany.id,
        };

        if (matchIdx >= 0) {
          regList[matchIdx] = {
            ...regList[matchIdx],
            ...updatedRegItem,
            placeOfSupply: regList[matchIdx].placeOfSupply || 'DUBAI, UAE',
            contactPerson: regList[matchIdx].contactPerson || '',
            designation: regList[matchIdx].designation || '',
            email: regList[matchIdx].email || '',
            mobile: regList[matchIdx].mobile || '',
            companyId: activeCompany.id
          };
        } else {
          regList.push(updatedRegItem);
        }

        localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(regList));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('erp-toast', { 
          detail: isEditing ? `Customer "${record.companyName}" profile updated.` : `Customer "${record.companyName}" registered.` 
        }));
      } catch (err) {
        console.error("Failed to sync customer changes to registered customers list", err);
      }
    } else {
      if (isEditing) {
        setSuppliers(prev => prev.map(s => s.id === isEditing ? record : s));
      } else {
        setSuppliers(prev => [record, ...prev]);
      }
      window.dispatchEvent(new CustomEvent('erp-toast', { 
        detail: isEditing ? `Supplier "${record.companyName}" profile updated.` : `Supplier "${record.companyName}" registered.` 
      }));
    }

    resetForm();
  };

  const handleEditClick = (record: CustomerRecord) => {
    setIsEditing(record.id);
    setCompanyName(record.companyName);
    setAddress(record.address);
    setPoBox(record.poBox);
    setTrn(record.trn);
    setPhone(record.phone);
    setFaxNo(record.faxNo || '');
    setShowAddForm(true);
  };

  const executeDelete = (id: string) => {
    const registryName = activeRegistryTab === 'customer' ? 'customer' : 'supplier';
    if (activeRegistryTab === 'customer') {
      const targetCust = customers.find(c => c.id === id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      // Delete from MF_REGISTERED_CUSTOMERS as well
      try {
        const savedJson = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
        if (savedJson) {
          let regList = JSON.parse(savedJson);
          if (Array.isArray(regList)) {
            regList = regList.filter((item: any) => {
              const itemIdMatches = item.id === id;
              const itemNameMatches = targetCust && (
                (item.name || '').trim().toUpperCase() === targetCust.companyName.trim().toUpperCase() ||
                (item.companyName || '').trim().toUpperCase() === targetCust.companyName.trim().toUpperCase()
              );
              return !itemIdMatches && !itemNameMatches;
            });
            localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(regList));
          }
        }
      } catch (err) {
        console.error("Failed to delete customer from registered list", err);
      }
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('erp-toast', { 
        detail: `Customer "${targetCust?.companyName || 'Record'}" permanently removed.` 
      }));
    } else {
      const targetSupp = suppliers.find(s => s.id === id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent('erp-toast', { 
        detail: `Supplier "${targetSupp?.companyName || 'Record'}" permanently removed.` 
      }));
    }
  };

  const getOutstandingAmount = (recordId: string, companyName: string) => {
    const isSupplier = recordId.startsWith('supp-') || companyName.toUpperCase().includes('SUPPLIER');
    let outstanding = 0;

    const cleanClientName = (name: string) => {
      return (name || '')
        .trim()
        .toUpperCase()
        .replace(/^(SUPPLIER|CUSTOMER):\s*/i, '')
        .replace(/\b(L\.?L\.?C\.?|LTD\.?|CO\.?|AND|&|THE|FOR|OF|A|AN|IS|WITH|L\.L\.C|PVT|PRIVATE|LIMITED|INDUSTRIES|INDUSTRY|WORKS|SERVICES|SHIP|REPAIRING|YARD)\b/g, '')
        .replace(/[^A-Z0-9]/g, '')
        .trim();
    };

    const cleanTargetComp = cleanClientName(companyName);

    if (isSupplier) {
      // Priority-based deduplication sets for suppliers
      const seenSupplierInvoices = new Set<string>();
      const seenSupplierDOs = new Set<string>();
      const seenSupplierPOs = new Set<string>();

      // Priority 1: Manual supplier bills (MFI_RAW_PAYABLES)
      try {
        const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
        const manual = savedPay ? JSON.parse(savedPay) : [];
        if (Array.isArray(manual)) {
          manual.forEach((p: any) => {
            if (p.supplierName) {
              const cleanName = cleanClientName(p.supplierName);
              if (cleanName === cleanTargetComp || cleanName.includes(cleanTargetComp) || cleanTargetComp.includes(cleanName)) {
                const invoiceNo = String(p.invoiceNo || p.id || '').toUpperCase().trim();
                const doNo = String(p.doNo || '').toUpperCase().trim();
                const poNo = String(p.poNo || '').toUpperCase().trim();

                const tc = Number(p.totalContractValue) || 0;
                const ap = Number(p.amountPaid) || 0;
                outstanding += (tc - ap);

                if (invoiceNo && invoiceNo !== 'TEMP') seenSupplierInvoices.add(invoiceNo);
                if (doNo && doNo !== 'M-PAY') seenSupplierDOs.add(doNo);
                if (poNo && poNo !== 'N/A') seenSupplierPOs.add(poNo);
              }
            }
          });
        }
      } catch (e) {}

      // Priority 2: Supplier purchases (MFI_SUPPLIER_PURCHASES)
      try {
        const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
        const purchasesList = savedPurchases ? JSON.parse(savedPurchases) : [];
        if (Array.isArray(purchasesList)) {
          purchasesList.forEach((pur: any) => {
            if (pur.supplierName) {
              const cleanName = cleanClientName(pur.supplierName);
              if (cleanName === cleanTargetComp || cleanName.includes(cleanTargetComp) || cleanTargetComp.includes(cleanName)) {
                const invoiceNo = String(pur.invoiceNo || pur.id || '').toUpperCase().trim();
                const doNo = String(pur.deliveryNoteNo || '').toUpperCase().trim();
                const poNo = String(pur.lpoRef || '').toUpperCase().trim();

                // Skip if this invoice/DO/LPO reference is already accounted for in Priority 1
                if (invoiceNo && seenSupplierInvoices.has(invoiceNo)) return;
                if (doNo && doNo !== 'N/A' && seenSupplierDOs.has(doNo)) return;
                if (poNo && poNo !== 'N/A' && seenSupplierPOs.has(poNo)) return;

                const tc = Number(pur.totalAmount || pur.subtotal || 0);
                let ap = 0;
                if (pur.amountPaid !== undefined) {
                  ap = Number(pur.amountPaid);
                } else if (pur.paidAmount !== undefined) {
                  ap = Number(pur.paidAmount);
                } else if (pur.paymentStatus === 'Paid') {
                  ap = tc;
                } else if (pur.paymentStatus === 'Partial' || pur.paymentStatus === 'Partially Paid') {
                  ap = tc / 2;
                }
                outstanding += (tc - ap);

                if (invoiceNo && invoiceNo !== 'TEMP') seenSupplierInvoices.add(invoiceNo);
                if (doNo && doNo !== 'N/A') seenSupplierDOs.add(doNo);
                if (poNo && poNo !== 'N/A') seenSupplierPOs.add(poNo);
              }
            }
          });
        }
      } catch (e) {}

      // Priority 3: Material Delivery Order bills (MFI_INCOMING_MATERIALS_LEDGER)
      try {
        const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        const dos = savedDOs ? JSON.parse(savedDOs) : [];
        if (Array.isArray(dos)) {
          dos.forEach((d: any) => {
            if (d.supplierName) {
              const cleanName = cleanClientName(d.supplierName);
              if (cleanName === cleanTargetComp || cleanName.includes(cleanTargetComp) || cleanTargetComp.includes(cleanName)) {
                const invoiceNo = String(d.invoiceNo || '').toUpperCase().trim();
                const doNo = String(d.doNo || d.id || '').toUpperCase().trim();
                const poNo = String(d.poNo || '').toUpperCase().trim();

                // Skip if this invoice/DO/LPO reference is already accounted for
                if (invoiceNo && seenSupplierInvoices.has(invoiceNo)) return;
                if (doNo && seenSupplierDOs.has(doNo)) return;
                if (poNo && poNo !== 'N/A' && seenSupplierPOs.has(poNo)) return;

                const tc = parseFloat(d.invoiceAmounts) || 0;
                const ap = parseFloat(d.invoicePaid) || 0;
                outstanding += (tc - ap);

                if (invoiceNo) seenSupplierInvoices.add(invoiceNo);
                if (doNo) seenSupplierDOs.add(doNo);
                if (poNo && poNo !== 'N/A') seenSupplierPOs.add(poNo);
              }
            }
          });
        }
      } catch (e) {}
    } else {
      // Customers (Receivables outstanding)
      const seenInvoiceNos = new Set<string>();
      const seenWoRefs = new Set<string>();
      const seenDeliveryNotes = new Set<string>();

      // Pass 1: Financial & Billing documents (TAX INVOICE, TAX INVOICE & DELIVERY NOTE)
      const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (savedDocsStr) {
        try {
          const docs = JSON.parse(savedDocsStr);
          if (Array.isArray(docs)) {
            // Process high-priority invoice documents first
            docs.forEach((doc: any) => {
              const docType = (doc.documentType || '').toUpperCase();
              const isInvoiceDoc = docType === 'TAX INVOICE' || 
                                   docType === 'TAX INVOICE & DELIVERY NOTE';
              if (!isInvoiceDoc) return;

              const docBuyer = cleanClientName(doc.buyerName || doc.customerName || doc.companyName || '');
              if (docBuyer && (docBuyer === cleanTargetComp || docBuyer.includes(cleanTargetComp) || cleanTargetComp.includes(docBuyer))) {
                const invoiceNo = String(doc.invoiceNo || '').toUpperCase().trim();
                const woRef = String(doc.workOrderNo || '').toUpperCase().trim();
                const deliveryNoteNo = String(doc.deliveryNoteNo || '').toUpperCase().trim();

                let totalVal = Number(doc.grandTotal || doc.totalInvoiceValue || doc.amount || 0);
                if (!totalVal && doc.items && Array.isArray(doc.items)) {
                  const subtotal = doc.items.reduce((sum: number, item: any) => {
                    const q = parseFloat(item.qty || item.quantity as any) || 0;
                    const p = parseFloat(item.unitPriceWOVAT || item.rate || item.unitPrice as any) || 0;
                    return sum + (q * p);
                  }, 0);
                  const discountAmt = parseFloat(doc.discountAmt as any) || 0;
                  const freightAmt = parseFloat(doc.freightAmt as any) || 0;
                  const isVATApplicable = !doc.isZeroRatedExport;
                  const vatAmount = isVATApplicable ? (subtotal - discountAmt) * 0.05 : 0;
                  totalVal = subtotal - discountAmt + vatAmount + freightAmt;
                }
                const amtPaid = Number(doc.amountReceived || doc.receivedAmount || doc.amountPaid || doc.invoicePaid || 0);
                const bal = totalVal - amtPaid;
                if (bal > 0) {
                  outstanding += bal;
                }

                if (invoiceNo && invoiceNo !== 'TEMP') seenInvoiceNos.add(invoiceNo);
                if (woRef && woRef !== '—') seenWoRefs.add(woRef);
                if (deliveryNoteNo && deliveryNoteNo !== '—') seenDeliveryNotes.add(deliveryNoteNo);
              }
            });

            // Pass 2: Secondary / Temporary documents (WORK ORDER, DELIVERY NOTE)
            docs.forEach((doc: any) => {
              const docType = (doc.documentType || '').toUpperCase();
              const isSecondaryDoc = docType === 'WORK ORDER' || docType === 'DELIVERY NOTE';
              if (!isSecondaryDoc) return;

              const docBuyer = cleanClientName(doc.buyerName || doc.customerName || doc.companyName || '');
              if (docBuyer && (docBuyer === cleanTargetComp || docBuyer.includes(cleanTargetComp) || cleanTargetComp.includes(docBuyer))) {
                const invoiceNo = String(doc.invoiceNo || '').toUpperCase().trim();
                const woRef = String(doc.workOrderNo || '').toUpperCase().trim();
                const deliveryNoteNo = String(doc.deliveryNoteNo || '').toUpperCase().trim();

                // Skip if this transaction has already been processed via its Tax Invoice
                if (invoiceNo && seenInvoiceNos.has(invoiceNo)) return;
                if (woRef && seenWoRefs.has(woRef)) return;
                if (deliveryNoteNo && seenDeliveryNotes.has(deliveryNoteNo)) return;

                let totalVal = Number(doc.grandTotal || doc.totalInvoiceValue || doc.amount || 0);
                if (!totalVal && doc.items && Array.isArray(doc.items)) {
                  const subtotal = doc.items.reduce((sum: number, item: any) => {
                    const q = parseFloat(item.qty || item.quantity as any) || 0;
                    const p = parseFloat(item.unitPriceWOVAT || item.rate || item.unitPrice as any) || 0;
                    return sum + (q * p);
                  }, 0);
                  const discountAmt = parseFloat(doc.discountAmt as any) || 0;
                  const freightAmt = parseFloat(doc.freightAmt as any) || 0;
                  const isVATApplicable = !doc.isZeroRatedExport;
                  const vatAmount = isVATApplicable ? (subtotal - discountAmt) * 0.05 : 0;
                  totalVal = subtotal - discountAmt + vatAmount + freightAmt;
                }
                const amtPaid = Number(doc.amountReceived || doc.receivedAmount || doc.amountPaid || doc.invoicePaid || 0);
                const bal = totalVal - amtPaid;
                if (bal > 0) {
                  outstanding += bal;
                }

                if (invoiceNo) seenInvoiceNos.add(invoiceNo);
                if (woRef && woRef !== '—') seenWoRefs.add(woRef);
                if (deliveryNoteNo && deliveryNoteNo !== '—') seenDeliveryNotes.add(deliveryNoteNo);
              }
            });
          }
        } catch (e) {}
      }

      // Pass 3: Check manual receivables in MFI_OUTGOING_RECEIVABLES
      const outgoingStr = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
      if (outgoingStr) {
        try {
          const recs = JSON.parse(outgoingStr);
          if (Array.isArray(recs)) {
            recs.forEach((rec: any) => {
              const recBuyer = cleanClientName(rec.buyerName || '');
              if (recBuyer && (recBuyer === cleanTargetComp || recBuyer.includes(cleanTargetComp) || cleanTargetComp.includes(recBuyer))) {
                const invoiceNo = String(rec.invoiceNo || '').toUpperCase().trim();
                const woRef = String(rec.workOrderNo || '').toUpperCase().trim();

                // Skip if already seen
                if (invoiceNo && seenInvoiceNos.has(invoiceNo)) return;
                if (woRef && seenWoRefs.has(woRef)) return;

                const totalVal = Number(rec.totalInvoiceValue || rec.grandTotal || rec.amount || 0);
                const amtPaid = Number(rec.amountReceived || rec.receivedAmount || rec.amountPaid || 0);
                const bal = totalVal - amtPaid;
                if (bal > 0) {
                  outstanding += bal;
                }

                if (invoiceNo) seenInvoiceNos.add(invoiceNo);
                if (woRef && woRef !== '—') seenWoRefs.add(woRef);
              }
            });
          }
        } catch (e) {}
      }

      // Pass 4: Check custom transactions inside MFI_SOA_CUSTOMER_TRANSACTIONS
      const savedSoaTxsStr = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
      if (savedSoaTxsStr) {
        try {
          const soaTxs = JSON.parse(savedSoaTxsStr);
          const savedRegCustomers = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
          const regCustomersList = savedRegCustomers ? JSON.parse(savedRegCustomers) : [];
          
          let resolvedId = recordId;
          if (Array.isArray(regCustomersList)) {
            const matched = regCustomersList.find((rc: any) => {
              const rcName = (rc.companyName || rc.name || '').trim().toUpperCase();
              return cleanClientName(rcName) === cleanTargetComp || rc.id === recordId;
            });
            if (matched) {
              resolvedId = matched.id;
            }
          }

          let txs = soaTxs[resolvedId];
          if (!txs || txs.length === 0) {
            const matchedKey = Object.keys(soaTxs).find(key => {
              if (key === resolvedId) return true;
              const regCust = regCustomersList.find((rc: any) => rc.id === key);
              if (regCust) {
                const regName = (regCust.companyName || regCust.name || '').trim().toUpperCase();
                return cleanClientName(regName) === cleanTargetComp;
              }
              const cleanKey = cleanClientName(key.replace(/^(cust-|supp-)/i, '').replace(/-/g, ' '));
              return cleanKey === cleanTargetComp;
            });
            if (matchedKey) {
              txs = soaTxs[matchedKey];
            }
          }

          if (Array.isArray(txs)) {
            txs.forEach((tx: any) => {
              if (!tx.isLinkedReceipt) {
                const invoiceNo = String(tx.invoiceRef || '').toUpperCase().trim();
                const woRef = String(tx.woRef || '').toUpperCase().trim();

                // Skip if already seen in Priority 1, 2 or 3
                if (invoiceNo && invoiceNo !== '—' && seenInvoiceNos.has(invoiceNo)) return;
                if (woRef && woRef !== '—' && seenWoRefs.has(woRef)) return;

                const amt = Number(tx.amount || 0);
                const paid = Number(tx.amountPaid || 0);
                const bal = amt - paid;
                if (bal > 0) {
                  outstanding += bal;
                }

                if (invoiceNo && invoiceNo !== '—') seenInvoiceNos.add(invoiceNo);
                if (woRef && woRef !== '—') seenWoRefs.add(woRef);
              }
            });
          }
        } catch (e) {}
      }
    }

    return Math.max(0, outstanding);
  };

  const activeRecords = useMemo(() => {
    const baseList = activeRegistryTab === 'customer' ? customers : suppliers;
    return baseList.filter(c => {
      if (activeCompany.id === 'comp-mfi') {
        // Marine Fasteners: show only comp-mfi or unassigned legacy
        return c.companyId === 'comp-mfi' || !c.companyId;
      }
      // For any other company (e.g. Bolt Master comp-bmm or United Metal comp-umi):
      // STRICTLY show only records assigned to this company!
      return c.companyId === activeCompany.id;
    });
  }, [activeRegistryTab, customers, suppliers, activeCompany]);

  const filteredRecords = activeRecords.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      (c.trn && c.trn.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const handleExportPDF = () => {
    const listName = activeRegistryTab === 'customer' ? 'CLIENTS DIRECTORY' : 'SUPPLIERS DIRECTORY';
    const dateStr = new Date().toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' });
    const isoText = getCompanyIsoText(activeCompany);
    
    let rowsHtml = '';
    activeRecords.forEach((c, index) => {
      rowsHtml += `
        <tr style="height: 22px;">
          <td style="padding: 4px 5px; border: 1px solid #cbd5e1; font-family: monospace; text-align: center; font-weight: bold; color: #475569; font-size: 9.5px; white-space: nowrap;">${index + 1}</td>
          <td style="padding: 4px 5px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #0f172a; font-size: 9.5px; white-space: nowrap;">${c.id}</td>
          <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a; font-size: 10px; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.companyName}</td>
          <td style="padding: 4px 5px; border: 1px solid #cbd5e1; color: #334155; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9px;">${c.address || '—'}</td>
          <td style="padding: 4px 5px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #0f172a; text-align: center; font-size: 9.5px; white-space: nowrap;">${c.trn || '—'}</td>
          <td style="padding: 4px 5px; border: 1px solid #cbd5e1; font-family: monospace; text-align: center; font-size: 9.5px; white-space: nowrap;">${c.poBox || '—'}</td>
          <td style="padding: 4px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 9.5px; font-weight: 600; color: #0f172a; white-space: nowrap;">${c.phone || '—'}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activeCompany.code || 'ERP'} - ${listName}</title>
        <style>
          @page {
            size: auto;
            margin: 0;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 10mm 12mm;
            padding: 0;
            background-color: #fff;
          }
          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
          }
          .logo-text {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .logo-sub {
            font-size: 9px;
            color: #f37021;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 2px 0 0 0;
          }
          .report-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            text-transform: uppercase;
            margin-top: 8px;
            letter-spacing: 0.5px;
          }
          .main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
            text-transform: uppercase;
          }
          .main-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            padding: 7px 5px;
            border: 1px solid #0f172a;
            text-align: left;
            white-space: nowrap;
          }
          .main-table td {
            border: 1px solid #cbd5e1;
            padding: 4px 5px;
          }
          .footer {
            margin-top: 30px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <table class="header-table">
            <tr>
              <td>
                <div class="logo-text">${activeCompany.name}</div>
                <div class="logo-sub">${activeCompany.shortName || activeCompany.name} Registered Directory</div>
                ${isoText ? `<div style="font-size: 8.5px; font-weight: bold; color: #1e3a8a; margin-top: 2px;">${isoText}</div>` : ''}
                <div class="report-title">${listName} Report</div>
              </td>
              <td style="text-align: right; vertical-align: bottom;">
                <table style="margin-left: auto; font-size: 10px; color: #475569;">
                  <tr>
                    <td style="font-weight: bold; text-align: right; padding-right: 5px;">PRINT DATE:</td>
                    <td>${dateStr}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; text-align: right; padding-right: 5px;">TOTAL RECORDS:</td>
                    <td>${activeRecords.length} Accounts</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <table class="main-table">
          <thead>
            <tr>
              <th style="width: 3.5%; text-align: center;">SN</th>
              <th style="width: 7.5%;">ID</th>
              <th style="width: 28%;">COMPANY LEGAL NAME</th>
              <th style="width: 19%;">SITE ADDRESS / LOCATION</th>
              <th style="width: 13%; text-align: center;">TAX REF (TRN)</th>
              <th style="width: 6%; text-align: center;">P.O. BOX</th>
              <th style="width: 23%;">TELEPHONE</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          CONFIDENTIAL — FOR INTERNAL USE ONLY — ${activeCompany.name} ERP SYSTEMS
        </div>
      </body>
      </html>
    `;

    printHtml(htmlContent, `${activeCompany.code || 'ERP'}_Directory_${activeRegistryTab}`);
  };

  return (
    <div className="w-full space-y-3 font-mono text-[11px] select-none">
      
      {/* Styles for Professional PDF Layout Outputs */}
      <style>{`
        @media print {
          /* Hide standard screen components */
          .no-print, 
          header, 
          footer, 
          nav, 
          sidebar, 
          button, 
          .tab-buttons, 
          .search-print-bar,
          .form-container {
            display: none !important;
          }
          
          /* Set standard high-contrast printing defaults */
          body {
            background: white !important;
            color: black !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          }
          
          .print-content {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
          }

          /* Elegant table style for paper size */
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 15px !important;
          }

          .print-table th {
            background-color: #0f172a !important;
            color: white !important;
            border: 1px solid #1e293b !important;
            padding: 8px 10px !important;
            font-weight: bold !important;
            text-align: left !important;
            text-transform: uppercase !important;
            font-size: 10px !important;
          }

          .print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px 10px !important;
            font-size: 9.5px !important;
            color: black !important;
          }
        }
      `}</style>

      {/* PDF Letterhead - ONLY visible during Print operations */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{activeCompany.name}</h1>
            <p className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">
              Official Registered Directory — {activeRegistryTab === 'customer' ? 'Customers Ledger' : 'Suppliers Ledger'} ({activeCompany.shortName || activeCompany.name})
            </p>
          </div>
          <div className="text-right font-mono text-[9px] text-slate-500">
            <div>GEN-DATE: {new Date().toLocaleDateString('en-AE')}</div>
            <div>{activeCompany.code || 'ERP'}-SECURE-LEDGER</div>
          </div>
        </div>
      </div>

      {/* Unified Master Control Panel */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden no-print">
        {/* Header Toggle Segment */}
        <div className="bg-slate-900 p-2.5 flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Registry Tab Switchers with Big Icons */}
          <div className="flex bg-slate-950 p-1 rounded border border-slate-800 w-full sm:w-auto gap-1">
            <button
              onClick={() => {
                setActiveRegistryTab('customer');
                resetForm();
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-[10.5px] font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-2 rounded cursor-pointer ${
                activeRegistryTab === 'customer'
                  ? 'bg-[#f37021] text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Sales Clients Registry"
            >
              <TrendingUp className="w-5 h-5 text-amber-300 shrink-0" />
              <span>SALES CLIENTS ({activeRegistryTab === 'customer' ? activeRecords.length : customers.filter(c => activeCompany.id === 'comp-mfi' ? (c.companyId === 'comp-mfi' || !c.companyId) : c.companyId === activeCompany.id).length})</span>
            </button>
            <button
              onClick={() => {
                setActiveRegistryTab('supplier');
                resetForm();
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-[10.5px] font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-2 rounded cursor-pointer ${
                activeRegistryTab === 'supplier'
                  ? 'bg-[#f37021] text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Purchase Suppliers Registry"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>PURCHASE SUPPLIERS ({activeRegistryTab === 'supplier' ? activeRecords.length : suppliers.filter(s => activeCompany.id === 'comp-mfi' ? (s.companyId === 'comp-mfi' || !s.companyId) : s.companyId === activeCompany.id).length})</span>
            </button>
          </div>

          {/* Action Icons Row */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* PDF Export Icon Button */}
            <button
              onClick={handleExportPDF}
              className="p-2 bg-slate-800 hover:bg-slate-750 text-white rounded border border-slate-700 transition-all cursor-pointer flex items-center justify-center"
              title={`Print ${activeRegistryTab === 'customer' ? 'Clients' : 'Suppliers'} Report as PDF`}
            >
              <Printer className="w-4 h-4 text-[#f37021]" />
            </button>

            {/* Add Record Icon Button */}
            <button
              onClick={() => {
                if (showAddForm) {
                  resetForm();
                } else {
                  resetForm();
                  setShowAddForm(true);
                }
              }}
              className={`p-2 rounded transition-all cursor-pointer flex items-center justify-center border ${
                showAddForm
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
                  : 'bg-[#f37021] hover:bg-[#d65e17] text-white border-[#f37021]'
              }`}
              title={showAddForm ? 'Close Registration Panel' : `Add ${activeRegistryTab === 'customer' ? 'Client' : 'Supplier'}`}
            >
              {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Super Simple and Clean Add/Edit Form Redesign */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="form-container bg-white border border-slate-250 p-5 rounded-lg no-print shadow-sm w-full"
          >
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {isEditing ? `Modify ${activeRegistryTab === 'customer' ? 'Client' : 'Supplier'} Record` : `Register New ${activeRegistryTab === 'customer' ? 'Client' : 'Supplier'}`}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Please provide the official legal credentials for tax and delivery compliance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Company Legal Name */}
                <div className="md:col-span-3">
                  <label className="text-[9px] uppercase tracking-wider block text-slate-600 font-bold mb-1">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeRegistryTab === 'customer' ? 'E.G., SUPER ENGINEERING INDUSTRY L.L.C' : 'E.G., DUBAI METALS GALVANIZING'}
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-250 text-slate-900 font-mono uppercase text-xs focus:bg-white focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] focus:outline-none transition-all rounded"
                  />
                </div>

                {/* VAT TRN No */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider block text-slate-600 font-bold mb-1">
                    VAT TRN Number (15 digits)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="E.G., 100046686000003"
                    value={trn}
                    onChange={e => setTrn(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2 bg-slate-50 border border-slate-250 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] focus:outline-none transition-all rounded"
                  />
                </div>

                {/* P.O. Box */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider block text-slate-600 font-bold mb-1">
                    P.O. Box Number
                  </label>
                  <input
                    type="text"
                    placeholder="E.G., 12050"
                    value={poBox}
                    onChange={e => setPoBox(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-250 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] focus:outline-none transition-all rounded"
                  />
                </div>

                {/* Telephone */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider block text-slate-600 font-bold mb-1">
                    Office Telephone
                  </label>
                  <input
                    type="text"
                    placeholder="E.G., +971 2 550 1366"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-250 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] focus:outline-none transition-all rounded"
                  />
                </div>

                {/* Plant / Delivery Address */}
                <div className="md:col-span-2">
                  <label className="text-[9px] uppercase tracking-wider block text-slate-600 font-bold mb-1">
                    Plant / Head Office Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G., PLOT 417, SECTOR M41, MUSAFFAH, ABU DHABI, UAE"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-250 text-slate-900 font-mono uppercase text-xs focus:bg-white focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] focus:outline-none transition-all rounded"
                  />
                </div>

                {/* Fax Number */}
                <div>
                  <label className="text-[9px] uppercase tracking-wider block text-slate-600 font-bold mb-1">
                    Fax Number
                  </label>
                  <input
                    type="text"
                    placeholder="E.G., +971 2 550 1367"
                    value={faxNo}
                    onChange={e => setFaxNo(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-250 text-slate-900 font-mono text-xs focus:bg-white focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] focus:outline-none transition-all rounded"
                  />
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-2.5 py-1 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold text-[9px] uppercase transition-all rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#f37021] hover:bg-[#d65e17] text-white font-bold text-[9px] uppercase transition-all shadow-xs flex items-center gap-1 rounded cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  {isEditing ? 'Save Changes' : 'Register Account'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Control Bar - Compact Search Bar Inline */}
      <div className="search-print-bar flex flex-row justify-between items-center gap-3 bg-white border border-slate-200 rounded-lg p-3 no-print shadow-3xs select-none">
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] text-slate-500 font-bold hidden sm:inline-block uppercase tracking-wider">
            Accounts Registry ({filteredRecords.length} of {activeRecords.length})
          </span>
        </div>

        {/* Small, Compact Search Bar with compact style */}
        <div className="relative flex items-center w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-450 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeRegistryTab === 'customer' ? 'clients' : 'suppliers'} by name, TRN, address...`}
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-250 rounded text-[10.5px] font-mono focus:bg-white focus:ring-1 focus:ring-[#f37021] focus:outline-none transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-450 hover:text-slate-800 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Directory Tabular list-wise Layout - CUSTOMER ENTRY LIST WISE */}
      <div className="bg-white border border-slate-250 rounded-lg shadow-2xs overflow-hidden select-none print:shadow-none print:border-none print-content">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse font-sans text-xs [text-transform:uppercase] print-table">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-950 font-bold uppercase text-[8.5px] tracking-wider h-9 select-none">
                <th className="sticky top-0 bg-slate-900 z-10 p-2 pl-3 w-[50px] text-slate-400 font-mono">ID</th>
                <th className="sticky top-0 bg-slate-900 z-10 p-2 w-[230px] max-w-[230px] text-slate-200">{activeRegistryTab === 'customer' ? 'Customer & Address' : 'Supplier & Address'}</th>
                <th className="sticky top-0 bg-slate-900 z-10 p-2 w-[140px] font-mono text-slate-200">Tax TRN</th>
                <th className="sticky top-0 bg-slate-900 z-10 p-2 w-[110px] font-mono text-slate-200">P.O. Box &amp; Tel</th>
                <th className="sticky top-0 bg-slate-900 z-10 p-2 w-[110px] text-right text-slate-200 font-mono">Outstanding</th>
                <th className="sticky top-0 bg-slate-900 z-10 p-2 w-[90px] text-center font-bold tracking-wider no-print text-slate-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-slate-400 italic bg-slate-50 font-mono">
                    {`No registered ${activeRegistryTab === 'customer' ? 'customers' : 'suppliers'} found matching the active filter query.`}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50/70 border-b border-slate-100 transition-colors"
                  >
                    {/* ID Column */}
                    <td className="p-2 pl-3 font-mono font-bold text-indigo-900 text-[10px] w-[50px]">
                      <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded-sm font-bold shadow-3xs" title={c.id}>
                        {getInitials(c.companyName)}
                      </span>
                    </td>

                    {/* Corporate Enterprise Details */}
                    <td className="p-2 w-[230px] max-w-[230px]">
                      <div>
                        <span className="font-bold text-slate-900 block text-[10.5px] leading-tight mb-0.5 tracking-tight truncate" title={c.companyName}>
                          {c.companyName}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-medium lowercase font-sans leading-snug first-letter:uppercase truncate" title={c.address}>
                          {c.address}
                        </span>
                      </div>
                    </td>

                    {/* Monospace VAT TRN */}
                    <td className="p-2 font-mono w-[140px]">
                      {c.trn ? (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 text-[9.5px] tracking-wide">
                            {c.trn}
                          </span>
                          <span className="text-[7px] bg-slate-100 border border-slate-200 px-0.5 py-0.25 rounded text-slate-500 font-sans font-bold">
                            VAT
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[9px] italic">Not registered</span>
                      )}
                    </td>

                    {/* P.O. Box & Contacts - Compact Small Box Width */}
                    <td className="p-2 font-mono w-[110px] max-w-[110px]">
                      <div className="text-[9px] text-slate-800 font-bold truncate" title={`P.O. Box: ${c.poBox || '—'}`}>
                        PO: {c.poBox || '—'}
                      </div>
                      <div className="text-[8.5px] text-slate-500 mt-0.5 flex items-center gap-0.5 truncate" title={c.phone || '—'}>
                        <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" /> {c.phone || '—'}
                      </div>
                      {c.faxNo && (
                        <div className="text-[8px] text-slate-400 truncate" title={c.faxNo}>
                          FAX: {c.faxNo}
                        </div>
                      )}
                    </td>

                    {/* Outstanding Balance */}
                    <td className="p-2 text-right font-mono font-bold text-[10px] w-[110px]">
                      {(() => {
                        const outAmt = getOutstandingAmount(c.id, c.companyName);
                        return (
                          <span className={outAmt > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-medium'}>
                            {outAmt > 0 ? `AED ${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(outAmt)}` : 'AED 0.00'}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Select Workflow and Edit Action Buttons - Small Width with Big Icons */}
                    <td className="p-2 text-center no-print w-[90px]">
                      <div className="flex justify-center items-center gap-1">
                        {activeMode !== 'list' && onSelectAction ? (
                          activeRegistryTab === 'customer' ? (
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => onSelectAction('quotation', c)}
                                className="bg-orange-600 hover:bg-[#d65e17] font-bold p-1 text-white shadow-3xs transition-all flex items-center justify-center cursor-pointer rounded"
                                title="Generate Delivery Note"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSelectAction('invoice', c)}
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold p-1 text-white shadow-3xs transition-all flex items-center justify-center cursor-pointer rounded"
                                title="Generate Tax Invoice"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onSelectAction('purchase', c)}
                              className="bg-purple-600 hover:bg-purple-700 font-bold p-1 text-white shadow-3xs transition-all flex items-center justify-center cursor-pointer rounded"
                              title="Prepare Purchase Order"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : null}

                        <button
                          onClick={() => handleEditClick(c)}
                          className="p-1 border border-slate-200 text-slate-600 hover:text-[#f37021] hover:bg-slate-50 rounded transition-all cursor-pointer"
                          title="Edit corporate profile details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('MFI_SOA_SELECTED_CUSTOMER_ID', c.id);
                            localStorage.setItem('mf_erp_active_tab', 'customer_soa');
                            window.dispatchEvent(new Event('storage'));
                            window.dispatchEvent(new Event('mfi_soa_select_customer'));
                            window.dispatchEvent(new CustomEvent('mf_erp_set_tab', { detail: 'customer_soa' }));
                          }}
                          className="p-1 border border-slate-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all cursor-pointer"
                          title="View Statement of Account Ledger"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirmId === c.id ? (
                          <div className="flex items-center gap-0.5 bg-red-50 border border-red-250 p-0.5 rounded shadow-2xs">
                            <button
                              onClick={() => {
                                executeDelete(c.id);
                                setDeleteConfirmId(null);
                              }}
                              className="p-0.5 text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition-all cursor-pointer font-bold"
                              title="Confirm: Delete record permanently"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-0.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-all cursor-pointer font-bold"
                              title="Cancel: Keep record"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="p-1 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                            title="Permanently remove record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
