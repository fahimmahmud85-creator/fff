import { CustomerRecord } from '../customerData';

export interface SyncCustomerPayload {
  id?: string;
  name?: string;
  companyName: string;
  trn?: string;
  address?: string;
  poBox?: string;
  phone?: string;
  mobile?: string;
  directPhone?: string;
  email?: string;
  faxNo?: string;
  contactPerson?: string;
  designation?: string;
  placeOfSupply?: string;
  seller?: string;
  assignedSeller?: string;
  companyId?: string;
}

export interface SyncSupplierPayload {
  id?: string;
  name?: string;
  supplierName: string;
  companyName?: string;
  trn?: string;
  address?: string;
  poBox?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  faxNo?: string;
  contactPerson?: string;
  designation?: string;
  companyId?: string;
}

/**
 * Register or update a customer across all client databases (MFI_ERP_CUSTOMERS, MF_REGISTERED_CUSTOMERS, mf_customers_list)
 */
export function syncCustomerToAllDatabases(payload: SyncCustomerPayload): void {
  const rawCompName = (payload.companyName || payload.name || '').trim();
  if (!rawCompName) return;

  const normalizedCompName = rawCompName.toUpperCase();
  const cleanTrn = (payload.trn || '').trim();

  // 1. Update/Add to MFI_ERP_CUSTOMERS
  try {
    const savedErp = localStorage.getItem('MFI_ERP_CUSTOMERS');
    let erpList: any[] = [];
    if (savedErp) {
      const parsed = JSON.parse(savedErp);
      if (Array.isArray(parsed)) erpList = parsed;
    }

    const erpMatchIdx = erpList.findIndex((c: any) => {
      const name = (c.companyName || c.name || '').trim().toUpperCase();
      const trn = (c.trn || '').trim();
      return name === normalizedCompName || (cleanTrn && cleanTrn !== '—' && trn === cleanTrn);
    });

    const erpRecord: any = {
      id: erpMatchIdx >= 0 ? erpList[erpMatchIdx].id : (payload.id || 'cust-' + Date.now()),
      companyName: normalizedCompName,
      address: (payload.address || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].address : '') || 'INDUSTRIAL AREA, AJMAN, UAE').toUpperCase(),
      poBox: payload.poBox || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].poBox : '—') || '—',
      trn: cleanTrn || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].trn : '—') || '—',
      phone: payload.phone || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].phone : '—') || '—',
      faxNo: payload.faxNo || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].faxNo : '—') || '—',
      contactPerson: payload.contactPerson || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].contactPerson : '') || '',
      designation: payload.designation || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].designation : '') || 'Procurement Specialist',
      email: payload.email || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].email : '') || '',
      mobile: payload.mobile || payload.directPhone || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].mobile : '') || '',
      companyId: payload.companyId || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].companyId : 'comp-mfi') || 'comp-mfi',
      assignedSeller: payload.assignedSeller || payload.seller || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].assignedSeller : '') || '',
      seller: payload.seller || payload.assignedSeller || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].seller : '') || '',
      placeOfSupply: (payload.placeOfSupply || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].placeOfSupply : 'UAE') || 'UAE').toUpperCase()
    };

    if (erpMatchIdx >= 0) {
      erpList[erpMatchIdx] = { ...erpList[erpMatchIdx], ...erpRecord };
    } else {
      erpList.push(erpRecord);
    }
    localStorage.setItem('MFI_ERP_CUSTOMERS', JSON.stringify(erpList));
  } catch (e) {
    console.error('Error syncing to MFI_ERP_CUSTOMERS:', e);
  }

  // 2. Update/Add to MF_REGISTERED_CUSTOMERS
  try {
    const savedReg = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
    let regList: any[] = [];
    if (savedReg) {
      const parsed = JSON.parse(savedReg);
      if (Array.isArray(parsed)) regList = parsed;
    }

    const regMatchIdx = regList.findIndex((c: any) => {
      const name = (c.name || c.companyName || '').trim().toUpperCase();
      const trn = (c.trn || '').trim();
      return name === normalizedCompName || (cleanTrn && cleanTrn !== '—' && trn === cleanTrn);
    });

    const regRecord: any = {
      id: regMatchIdx >= 0 ? regList[regMatchIdx].id : (payload.id || 'cust-' + Date.now()),
      name: normalizedCompName,
      companyName: normalizedCompName,
      address: (payload.address || (regMatchIdx >= 0 ? regList[regMatchIdx].address : '') || 'INDUSTRIAL AREA, AJMAN, UAE').toUpperCase(),
      phone: payload.phone || (regMatchIdx >= 0 ? regList[regMatchIdx].phone : '—') || '—',
      trn: cleanTrn || (regMatchIdx >= 0 ? regList[regMatchIdx].trn : '—') || '—',
      poBox: payload.poBox || (regMatchIdx >= 0 ? regList[regMatchIdx].poBox : '—') || '—',
      faxNo: payload.faxNo || (regMatchIdx >= 0 ? regList[regMatchIdx].faxNo : '—') || '—',
      placeOfSupply: (payload.placeOfSupply || (regMatchIdx >= 0 ? regList[regMatchIdx].placeOfSupply : 'UAE') || 'UAE').toUpperCase(),
      contactPerson: payload.contactPerson || (regMatchIdx >= 0 ? regList[regMatchIdx].contactPerson : '') || '',
      email: payload.email || (regMatchIdx >= 0 ? regList[regMatchIdx].email : '') || '',
      mobile: payload.mobile || payload.directPhone || (regMatchIdx >= 0 ? regList[regMatchIdx].mobile : '') || '',
      seller: payload.seller || payload.assignedSeller || (regMatchIdx >= 0 ? regList[regMatchIdx].seller : '') || '',
      companyId: payload.companyId || (regMatchIdx >= 0 ? regList[regMatchIdx].companyId : 'comp-mfi') || 'comp-mfi'
    };

    if (regMatchIdx >= 0) {
      regList[regMatchIdx] = { ...regList[regMatchIdx], ...regRecord };
    } else {
      regList.push(regRecord);
    }
    localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(regList));
  } catch (e) {
    console.error('Error syncing to MF_REGISTERED_CUSTOMERS:', e);
  }

  // 3. Update/Add to mf_customers_list (Quotation Master)
  try {
    const savedQtn = localStorage.getItem('mf_customers_list');
    let qtnList: CustomerRecord[] = [];
    if (savedQtn) {
      const parsed = JSON.parse(savedQtn);
      if (Array.isArray(parsed)) qtnList = parsed;
    }

    const qtnMatchIdx = qtnList.findIndex((c: CustomerRecord) => {
      const name = (c.companyName || '').trim().toUpperCase();
      const trn = (c.trn || '').trim();
      return name === normalizedCompName || (cleanTrn && cleanTrn !== '—' && trn === cleanTrn);
    });

    const qtnRecord: CustomerRecord = {
      id: qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].id : (payload.id || 'cust-' + Date.now()),
      companyName: normalizedCompName,
      address: (payload.address || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].address : '') || 'INDUSTRIAL AREA, AJMAN, UAE').toUpperCase(),
      poBox: payload.poBox || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].poBox : '—') || '—',
      trn: cleanTrn || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].trn : '—') || '—',
      phone: payload.phone || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].phone : '—') || '—',
      contactPerson: payload.contactPerson || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].contactPerson : '') || '',
      designation: payload.designation || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].designation : '') || 'Procurement Specialist',
      email: payload.email || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].email : '') || '',
      mobile: payload.mobile || payload.directPhone || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].mobile : '') || '',
      faxNo: payload.faxNo || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].faxNo : '—') || '—',
      companyId: payload.companyId || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].companyId : 'comp-mfi') || 'comp-mfi',
      assignedSeller: payload.assignedSeller || payload.seller || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].assignedSeller : '') || '',
      seller: payload.seller || payload.assignedSeller || (qtnMatchIdx >= 0 ? qtnList[qtnMatchIdx].seller : '') || '',
      concernPersons: qtnMatchIdx >= 0 && qtnList[qtnMatchIdx].concernPersons ? qtnList[qtnMatchIdx].concernPersons : []
    };

    if (qtnMatchIdx >= 0) {
      qtnList[qtnMatchIdx] = { ...qtnList[qtnMatchIdx], ...qtnRecord };
    } else {
      qtnList.push(qtnRecord);
    }
    localStorage.setItem('mf_customers_list', JSON.stringify(qtnList));
  } catch (e) {
    console.error('Error syncing to mf_customers_list:', e);
  }

  // 4. Dispatch custom sync events for real-time reactive UI update across open views
  window.dispatchEvent(new CustomEvent('mfi_customers_updated', { detail: { companyName: normalizedCompName } }));
  window.dispatchEvent(new CustomEvent('erp_customer_updated', { detail: { companyName: normalizedCompName } }));
  window.dispatchEvent(new CustomEvent('mf_customers_updated', { detail: { companyName: normalizedCompName } }));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Register or update a supplier across all supplier databases (MFI_REGISTERED_SUPPLIERS, MFI_ERP_SUPPLIERS, MFI_ERP_CUSTOMERS)
 */
export function syncSupplierToAllDatabases(payload: SyncSupplierPayload): void {
  const rawSuppName = (payload.supplierName || payload.companyName || payload.name || '').trim();
  if (!rawSuppName) return;

  const normalizedSuppName = rawSuppName.toUpperCase().replace(/^SUPPLIER:\s*/i, '');
  const cleanTrn = (payload.trn || '').trim();

  // 1. Update/Add to MFI_REGISTERED_SUPPLIERS
  try {
    const savedReg = localStorage.getItem('MFI_REGISTERED_SUPPLIERS');
    let regList: any[] = [];
    if (savedReg) {
      const parsed = JSON.parse(savedReg);
      if (Array.isArray(parsed)) regList = parsed;
    }

    const regMatchIdx = regList.findIndex((s: any) => {
      const name = (s.companyName || s.supplierName || s.name || '').trim().toUpperCase().replace(/^SUPPLIER:\s*/i, '');
      const trn = (s.trn || s.supplierTrn || '').trim();
      return name === normalizedSuppName || (cleanTrn && cleanTrn !== '—' && trn === cleanTrn);
    });

    const regRecord: any = {
      id: regMatchIdx >= 0 ? regList[regMatchIdx].id : (payload.id || 'supp-' + Date.now()),
      companyName: normalizedSuppName,
      supplierName: normalizedSuppName,
      name: normalizedSuppName,
      address: (payload.address || (regMatchIdx >= 0 ? regList[regMatchIdx].address : '') || 'Sharjah, United Arab Emirates').toUpperCase(),
      poBox: payload.poBox || (regMatchIdx >= 0 ? regList[regMatchIdx].poBox : '—') || '—',
      trn: cleanTrn || (regMatchIdx >= 0 ? regList[regMatchIdx].trn : '—') || '—',
      supplierTrn: cleanTrn || (regMatchIdx >= 0 ? regList[regMatchIdx].supplierTrn : '—') || '—',
      phone: payload.phone || (regMatchIdx >= 0 ? regList[regMatchIdx].phone : '—') || '—',
      mobile: payload.mobile || (regMatchIdx >= 0 ? regList[regMatchIdx].mobile : '—') || '—',
      faxNo: payload.faxNo || (regMatchIdx >= 0 ? regList[regMatchIdx].faxNo : '—') || '—',
      email: payload.email || (regMatchIdx >= 0 ? regList[regMatchIdx].email : '') || '',
      contactPerson: payload.contactPerson || (regMatchIdx >= 0 ? regList[regMatchIdx].contactPerson : '') || '',
      designation: payload.designation || (regMatchIdx >= 0 ? regList[regMatchIdx].designation : '') || 'Supplier Account Manager',
      companyId: payload.companyId || (regMatchIdx >= 0 ? regList[regMatchIdx].companyId : 'comp-mfi') || 'comp-mfi'
    };

    if (regMatchIdx >= 0) {
      regList[regMatchIdx] = { ...regList[regMatchIdx], ...regRecord };
    } else {
      regList.push(regRecord);
    }
    localStorage.setItem('MFI_REGISTERED_SUPPLIERS', JSON.stringify(regList));
  } catch (e) {
    console.error('Error syncing to MFI_REGISTERED_SUPPLIERS:', e);
  }

  // 2. Update/Add to MFI_ERP_SUPPLIERS
  try {
    const savedErp = localStorage.getItem('MFI_ERP_SUPPLIERS');
    let erpList: any[] = [];
    if (savedErp) {
      const parsed = JSON.parse(savedErp);
      if (Array.isArray(parsed)) erpList = parsed;
    }

    const erpMatchIdx = erpList.findIndex((s: any) => {
      const name = (s.companyName || s.name || '').trim().toUpperCase().replace(/^SUPPLIER:\s*/i, '');
      const trn = (s.trn || '').trim();
      return name === normalizedSuppName || (cleanTrn && cleanTrn !== '—' && trn === cleanTrn);
    });

    const erpRecord: any = {
      id: erpMatchIdx >= 0 ? erpList[erpMatchIdx].id : (payload.id || 'supp-' + Date.now()),
      companyName: normalizedSuppName,
      address: (payload.address || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].address : '') || 'Sharjah, United Arab Emirates').toUpperCase(),
      poBox: payload.poBox || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].poBox : '—') || '—',
      trn: cleanTrn || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].trn : '—') || '—',
      phone: payload.phone || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].phone : '—') || '—',
      mobile: payload.mobile || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].mobile : '—') || '—',
      faxNo: payload.faxNo || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].faxNo : '—') || '—',
      email: payload.email || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].email : '') || '',
      contactPerson: payload.contactPerson || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].contactPerson : '') || '',
      designation: payload.designation || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].designation : '') || 'Supplier Account Manager',
      companyId: payload.companyId || (erpMatchIdx >= 0 ? erpList[erpMatchIdx].companyId : 'comp-mfi') || 'comp-mfi'
    };

    if (erpMatchIdx >= 0) {
      erpList[erpMatchIdx] = { ...erpList[erpMatchIdx], ...erpRecord };
    } else {
      erpList.push(erpRecord);
    }
    localStorage.setItem('MFI_ERP_SUPPLIERS', JSON.stringify(erpList));
  } catch (e) {
    console.error('Error syncing to MFI_ERP_SUPPLIERS:', e);
  }

  // 3. Dispatch events
  window.dispatchEvent(new CustomEvent('mfi_suppliers_updated', { detail: { supplierName: normalizedSuppName } }));
  window.dispatchEvent(new CustomEvent('erp_customer_updated', { detail: { supplierName: normalizedSuppName } }));
  window.dispatchEvent(new Event('storage'));
}
