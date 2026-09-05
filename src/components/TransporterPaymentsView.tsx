import React, { useState, useEffect, useMemo } from 'react';
import { printHtml } from './PrintHelper';
import { 
  Truck, DollarSign, Calendar, Eye, Download, Layers, Check, 
  RotateCcw, Search, User, Briefcase, Plus, Trash2, ArrowLeftRight, FileText
} from 'lucide-react';

interface InvoiceData {
  invoiceNo: string;
  dated: string;
  workOrderNo: string;
  lpoNo: string;
  dispatchedBy?: string;
  despatchThrough?: string;
  dispatchLocation?: string;
  awbNo?: string;
  transporterCharges?: number;
  transporterPaidAmount?: number;
  transporterPaymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  forkliftOperator?: string;
  forkliftHours?: number;
  forkliftCharges?: number;
  forkliftPaidAmount?: number;
  forkliftPaymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  forkliftStartTime?: string;
  forkliftEndTime?: string;
  dispatchTime?: string;
  documentType: string;
}

export default function TransporterPaymentsView() {
  const [activeLedgerTab, setActiveLedgerTab] = useState<'all' | 'outbound' | 'inbound'>('all');
  const [savedDocs, setSavedDocs] = useState<InvoiceData[]>([]);
  const [inboundDocs, setInboundDocs] = useState<any[]>([]);
  const [selectedTransporter, setSelectedTransporter] = useState<string>('ALL');
  const [selectedForklift, setSelectedForklift] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Directories & registers states
  const [registeredForklifts, setRegisteredForklifts] = useState<string[]>([]);
  const [registeredCustomers, setRegisteredCustomers] = useState<any[]>([]);
  const [registeredTransporters, setRegisteredTransporters] = useState<string[]>([]);
  const [showDirectories, setShowDirectories] = useState(false);
  const [newForkliftName, setNewForkliftName] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newTransporterName, setNewTransporterName] = useState('');

  // Local component form to add a manual trip log with BOTH transport & forklift metrics
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    invoiceNo: '',
    dated: new Date().toISOString().substring(0, 10),
    workOrderNo: '',
    lpoNo: '',
    dispatchedBy: 'DISPATCH DESK',
    despatchThrough: '',
    awbNo: '',
    transporterCharges: 0,
    transporterPaidAmount: 0,
    transporterPaymentStatus: 'UNPAID' as 'PAID' | 'UNPAID' | 'PARTIAL',
    forkliftOperator: '',
    forkliftStartTime: '',
    forkliftEndTime: '',
    forkliftHours: 0,
    forkliftCharges: 0,
    forkliftPaidAmount: 0,
    forkliftPaymentStatus: 'UNPAID' as 'PAID' | 'UNPAID' | 'PARTIAL',
    dispatchLocation: '',
    direction: 'OUTGOING' as 'OUTGOING' | 'INCOMING',
    customerName: ''
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Helper functions to manage Forklift Operators and Customers
  const handleRegisterForklift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForkliftName.trim()) return;
    const nameUpper = newForkliftName.trim().toUpperCase();
    if (registeredForklifts.includes(nameUpper)) {
      alert("This Operator is already registered!");
      return;
    }
    const updated = [...registeredForklifts, nameUpper];
    setRegisteredForklifts(updated);
    localStorage.setItem('MF_REGISTERED_FORKLIFT_OPERATORS', JSON.stringify(updated));
    setNewForkliftName('');
    triggerToast(`Registered forklift operator ${nameUpper}!`);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteForklift = (nameToDelete: string) => {
    if (!confirm(`Are you sure you want to remove "${nameToDelete}"?`)) return;
    const updated = registeredForklifts.filter(f => f !== nameToDelete);
    setRegisteredForklifts(updated);
    localStorage.setItem('MF_REGISTERED_FORKLIFT_OPERATORS', JSON.stringify(updated));
    triggerToast(`Removed operator ${nameToDelete}`);
    window.dispatchEvent(new Event('storage'));
  };

  const handleRegisterTransporter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransporterName.trim()) return;
    const nameUpper = newTransporterName.trim().toUpperCase();
    if (registeredTransporters.includes(nameUpper)) {
      alert("This Transporter is already registered!");
      return;
    }
    const updated = [...registeredTransporters, nameUpper];
    setRegisteredTransporters(updated);
    localStorage.setItem('MF_REGISTERED_TRANSPORTERS', JSON.stringify(updated));
    setNewTransporterName('');
    triggerToast(`Registered transporter ${nameUpper}!`);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteTransporter = (nameToDelete: string) => {
    if (!confirm(`Are you sure you want to remove "${nameToDelete}"?`)) return;
    const updated = registeredTransporters.filter(t => t !== nameToDelete);
    setRegisteredTransporters(updated);
    localStorage.setItem('MF_REGISTERED_TRANSPORTERS', JSON.stringify(updated));
    triggerToast(`Removed transporter ${nameToDelete}`);
    window.dispatchEvent(new Event('storage'));
  };

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const nameUpper = newCustName.trim().toUpperCase();
    if (registeredCustomers.some(c => c.name?.toUpperCase() === nameUpper)) {
      alert("This Customer is already registered!");
      return;
    }
    const newCust = {
      id: 'cust-' + Date.now(),
      name: nameUpper,
      email: newCustEmail.trim() || 'N/A',
      phone: newCustPhone.trim() || 'N/A'
    };
    const updated = [newCust, ...registeredCustomers];
    setRegisteredCustomers(updated);
    localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(updated));
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    triggerToast(`Registered customer ${nameUpper}!`);
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteCustomer = (idToDelete: string) => {
    if (!confirm(`Are you sure you want to remove this customer?`)) return;
    const updated = registeredCustomers.filter(c => c.id !== idToDelete);
    setRegisteredCustomers(updated);
    localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(updated));
    triggerToast(`Removed customer`);
    window.dispatchEvent(new Event('storage'));
  };

  // 1. Initial Loading
  useEffect(() => {
    const raw = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (raw) {
      try {
        setSavedDocs(JSON.parse(raw));
      } catch (err) {
        setSavedDocs(getSeedData());
      }
    } else {
      const seed = getSeedData();
      setSavedDocs(seed);
      localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(seed));
    }

    // Load Inbound Docs key
    const rawInbound = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
    if (rawInbound) {
      try {
        setInboundDocs(JSON.parse(rawInbound));
      } catch (e) {}
    }

    // Load Forklifts
    const loadForklifts = () => {
      const rawFL = localStorage.getItem('MF_REGISTERED_FORKLIFT_OPERATORS');
      if (rawFL) {
        try {
          setRegisteredForklifts(JSON.parse(rawFL));
        } catch (e) {}
      } else {
        const initialFL = ["JASSEM SINGH", "K. MOHAMMAD", "ALEXANDER", "OMAR BHAI"];
        setRegisteredForklifts(initialFL);
        localStorage.setItem('MF_REGISTERED_FORKLIFT_OPERATORS', JSON.stringify(initialFL));
      }
    };

    // Load Transporters
    const loadTransporters = () => {
      const rawTR = localStorage.getItem('MF_REGISTERED_TRANSPORTERS');
      if (rawTR) {
        try {
          setRegisteredTransporters(JSON.parse(rawTR));
        } catch (e) {}
      } else {
        const initialTR = ["AL SHAHIN TRUCKING", "FALCON EXPRESS CARGO", "DESERT WIND FLEET", "MFI INTERNAL TRUCK"];
        setRegisteredTransporters(initialTR);
        localStorage.setItem('MF_REGISTERED_TRANSPORTERS', JSON.stringify(initialTR));
      }
    };

    // Load Customers
    const loadCustomers = () => {
      const rawCust = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
      if (rawCust) {
        try {
          setRegisteredCustomers(JSON.parse(rawCust));
        } catch (e) {}
      } else {
        const initialCust = [
          { id: 'c-1', name: 'AL SHAHIN STEEL TRADING', email: 'info@alshahin.ae', phone: '+971 6 543 2100' },
          { id: 'c-2', name: 'FALCON CARGO SERVICES', email: 'operations@falcon.ae', phone: '+971 4 888 1234' },
          { id: 'c-3', name: 'DESERT WIND LOGISTICS', email: 'fleet@desertwind.ae', phone: '+971 2 444 5678' }
        ];
        setRegisteredCustomers(initialCust);
        localStorage.setItem('MF_REGISTERED_CUSTOMERS', JSON.stringify(initialCust));
      }
    };

    loadForklifts();
    loadCustomers();
    loadTransporters();

    // Sync on storage change
    const handleStorageChange = () => {
      loadCustomers();
      loadForklifts();
      loadTransporters();
      
      const rawDocs = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (rawDocs) {
        try { setSavedDocs(JSON.parse(rawDocs)); } catch(e){}
      }
      const rawInb = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      if (rawInb) {
        try { setInboundDocs(JSON.parse(rawInb)); } catch(e){}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync back to local storage whenever values are updated
  const syncDocs = (updated: InvoiceData[]) => {
    setSavedDocs(updated);
    localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(updated));
  };

  const syncInboundDocs = (updated: any[]) => {
    setInboundDocs(updated);
    localStorage.setItem('MFI_INCOMING_MATERIALS_LEDGER', JSON.stringify(updated));
  };

  // Seed data fallback
  const getSeedData = (): InvoiceData[] => {
    return [];
  };

  // Extracted unique values for filter selects dynamically from active database
  const transporters = Array.from(
    new Set(
      (activeLedgerTab === 'all'
        ? [
            ...savedDocs
              .filter(d => !(d.invoiceNo?.startsWith('GRN-') || d.invoiceNo?.startsWith('CDN-') || d.documentType === 'GOODS RETURN NOTE'))
              .map(d => d.despatchThrough?.trim().toUpperCase()),
            ...inboundDocs.map(d => d.dispatchBy?.trim().toUpperCase())
          ]
        : activeLedgerTab === 'outbound'
        ? savedDocs
            .filter(d => !(d.invoiceNo?.startsWith('GRN-') || d.invoiceNo?.startsWith('CDN-') || d.documentType === 'GOODS RETURN NOTE'))
            .map(d => d.despatchThrough?.trim().toUpperCase())
        : inboundDocs.map(d => d.dispatchBy?.trim().toUpperCase())
      ).filter(Boolean)
    )
  ).sort() as string[];

  const forkliftOperators = Array.from(
    new Set(
      (activeLedgerTab === 'all'
        ? [
            ...savedDocs
              .filter(d => !(d.invoiceNo?.startsWith('GRN-') || d.invoiceNo?.startsWith('CDN-') || d.documentType === 'GOODS RETURN NOTE'))
              .map(d => d.forkliftOperator?.trim().toUpperCase()),
            ...inboundDocs.map(d => d.forkliftOperator?.trim().toUpperCase())
          ]
        : activeLedgerTab === 'outbound'
        ? savedDocs
            .filter(d => !(d.invoiceNo?.startsWith('GRN-') || d.invoiceNo?.startsWith('CDN-') || d.documentType === 'GOODS RETURN NOTE'))
            .map(d => d.forkliftOperator?.trim().toUpperCase())
        : inboundDocs.map(d => d.forkliftOperator?.trim().toUpperCase())
      ).filter(Boolean)
    )
  ).sort() as string[];

  // Status labels computing logic purely from CHARGES - PAID AMOUNT
  const getTransporterStatusLabel = (charges: number, paid: number): 'PAID' | 'UNPAID' | 'PARTIAL' => {
    if (charges === 0) return 'PAID';
    const balance = charges - paid;
    if (balance <= 0) return 'PAID';
    if (paid > 0 && balance > 0) return 'PARTIAL';
    return 'UNPAID';
  };

  const getForkliftStatusLabel = (charges: number, paid: number): 'PAID' | 'UNPAID' | 'PARTIAL' => {
    if (charges === 0) return 'PAID';
    const balance = charges - paid;
    if (balance <= 0) return 'PAID';
    if (paid > 0 && balance > 0) return 'PARTIAL';
    return 'UNPAID';
  };

  // Update a specific field for any log row manually back to core arrays
  const handleUpdateRecordField = (id: string, field: any, value: any) => {
    const isOutbound = savedDocs.some(d => d.invoiceNo === id);
    if (isOutbound) {
      const updated = savedDocs.map(doc => {
        if (doc.invoiceNo === id) {
          const finalVal = (typeof value === 'string' && field !== 'dated' && field !== 'forkliftStartTime' && field !== 'forkliftEndTime') 
            ? value.toUpperCase() 
            : value;
          const updatedDoc = {
            ...doc,
            [field]: finalVal
          };

          // Auto-calculate transporter status if charges or paid amount changes
          const tCharges = Number(updatedDoc.transporterCharges) || 0;
          const tPaid = Number(updatedDoc.transporterPaidAmount) || 0;
          updatedDoc.transporterPaymentStatus = getTransporterStatusLabel(tCharges, tPaid);

          // Auto-calculate forklift status if charges or paid amount changes
          const flCharges = Number(updatedDoc.forkliftCharges) || 0;
          const flPaid = Number(updatedDoc.forkliftPaidAmount) || 0;
          updatedDoc.forkliftPaymentStatus = getForkliftStatusLabel(flCharges, flPaid);

          return updatedDoc;
        }
        return doc;
      });
      syncDocs(updated);
    } else {
      const updated = inboundDocs.map(doc => {
        if (doc.id === id) {
          let targetField = field;
          let finalVal = value;
          if (field === 'dated') {
            targetField = 'date';
          } else if (field === 'workOrderNo') {
            targetField = 'poNo';
          } else if (field === 'lpoNo') {
            targetField = 'doNo';
          } else if (field === 'dispatchedBy') {
            targetField = 'receiverName';
          } else if (field === 'despatchThrough') {
            targetField = 'dispatchBy';
          } else if (field === 'awbNo') {
            targetField = 'invoiceAwbNo';
          } else if (field === 'transporterCharges') {
            targetField = 'transportCharges';
          } else if (field === 'transporterPaidAmount') {
            targetField = 'transportPaidAmount';
          } else if (field === 'forkliftHours') {
            targetField = 'forkliftTotalHours';
          } else if (field === 'dispatchLocation') {
            targetField = 'receivedLocation';
          }

          if (typeof finalVal === 'string' && targetField !== 'date' && targetField !== 'forkliftStartTime' && targetField !== 'forkliftEndTime') {
            finalVal = finalVal.toUpperCase();
          }

          const updatedDoc = { ...doc, [targetField]: finalVal };
          
          // Auto balance and status logic
          const tc = Number(updatedDoc.transportCharges) || 0;
          const tp = Number(updatedDoc.transportPaidAmount) || 0;
          updatedDoc.transportBalanceAmount = tc - tp;
          updatedDoc.transportPaymentStatus = getTransporterStatusLabel(tc, tp);

          const fc = Number(updatedDoc.forkliftCharges) || 0;
          const fp = Number(updatedDoc.forkliftPaidAmount) || 0;
          updatedDoc.forkliftBalanceAmount = fc - fp;
          updatedDoc.forkliftPaymentStatus = getForkliftStatusLabel(fc, fp);

          return updatedDoc;
        }
        return doc;
      });
      syncInboundDocs(updated);
    }
  };

  // Toggle Transporter Payment Status
  const handleToggleTransporterPaymentStatus = (id: string) => {
    const isOutbound = savedDocs.some(doc => doc.invoiceNo === id);
    if (isOutbound) {
      const updated = savedDocs.map(doc => {
        if (doc.invoiceNo === id) {
          const charges = doc.transporterCharges || 0;
          const paid = doc.transporterPaidAmount || 0;
          const nextPaid = (charges - paid <= 0) ? 0 : charges;
          const nextStatus = getTransporterStatusLabel(charges, nextPaid);
          return { 
            ...doc, 
            transporterPaidAmount: nextPaid,
            transporterPaymentStatus: nextStatus
          };
        }
        return doc;
      });
      syncDocs(updated);
      triggerToast(`Carrier payment auto-adjusted for Entry ${id}!`);
    } else {
      const updated = inboundDocs.map(doc => {
        if (doc.id === id) {
          const charges = doc.transportCharges || 0;
          const paid = doc.transportPaidAmount || 0;
          const nextPaid = (charges - paid <= 0) ? 0 : charges;
          return {
            ...doc,
            transportPaidAmount: nextPaid,
            transportBalanceAmount: charges - nextPaid,
            transportPaymentStatus: getTransporterStatusLabel(charges, nextPaid)
          };
        }
        return doc;
      });
      syncInboundDocs(updated);
      triggerToast(`Inbound carrier payment auto-adjusted!`);
    }
  };

  // Toggle Forklift Payment Status
  const handleToggleForkliftPaymentStatus = (id: string) => {
    const isOutbound = savedDocs.some(doc => doc.invoiceNo === id);
    if (isOutbound) {
      const updated = savedDocs.map(doc => {
        if (doc.invoiceNo === id) {
          const charges = doc.forkliftCharges || 0;
          const paid = doc.forkliftPaidAmount || 0;
          const nextPaid = (charges - paid <= 0) ? 0 : charges;
          const nextStatus = getForkliftStatusLabel(charges, nextPaid);
          return { 
            ...doc, 
            forkliftPaidAmount: nextPaid,
            forkliftPaymentStatus: nextStatus
          };
        }
        return doc;
      });
      syncDocs(updated);
      triggerToast(`Forklift payment auto-adjusted for Entry ${id}!`);
    } else {
      const updated = inboundDocs.map(doc => {
        if (doc.id === id) {
          const charges = doc.forkliftCharges || 0;
          const paid = doc.forkliftPaidAmount || 0;
          const nextPaid = (charges - paid <= 0) ? 0 : charges;
          return {
            ...doc,
            forkliftPaidAmount: nextPaid,
            forkliftBalanceAmount: charges - nextPaid,
            forkliftPaymentStatus: getForkliftStatusLabel(charges, nextPaid)
          };
        }
        return doc;
      });
      syncInboundDocs(updated);
      triggerToast(`Inbound forklift payment auto-adjusted!`);
    }
  };

  // Delete a trip log entries
  const handleDeleteTrip = (id: string) => {
    if (window.confirm(`Are you sure you want to delete this logistics record?`)) {
      const isOutbound = savedDocs.some(doc => doc.invoiceNo === id);
      if (isOutbound) {
        const updated = savedDocs.filter(d => d.invoiceNo !== id);
        syncDocs(updated);
        triggerToast(`Removed record ${id}`);
      } else {
        const updated = inboundDocs.filter(d => d.id !== id);
        syncInboundDocs(updated);
        triggerToast(`Removed record`);
      }
    }
  };

  // Create manual record from form
  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.invoiceNo) {
      alert("Please provide a Delivery Note / Voucher Number!");
      return;
    }

    const createdStatusT = getTransporterStatusLabel(Number(newTrip.transporterCharges) || 0, Number(newTrip.transporterPaidAmount) || 0);
    const createdStatusFL = getForkliftStatusLabel(Number(newTrip.forkliftCharges) || 0, Number(newTrip.forkliftPaidAmount) || 0);

    if (newTrip.direction === 'INCOMING') {
      if (inboundDocs.some(d => d.id === newTrip.invoiceNo || d.invoiceNo === newTrip.invoiceNo)) {
        alert(`Inbound record ${newTrip.invoiceNo} already exists in the registry! Please use a unique ID.`);
        return;
      }
      
      const inboundItem = {
        id: newTrip.invoiceNo,
        invoiceNo: newTrip.invoiceNo,
        date: newTrip.dated,
        poNo: newTrip.workOrderNo,
        doNo: newTrip.lpoNo,
        receiverName: newTrip.dispatchedBy,
        dispatchBy: newTrip.despatchThrough,
        awbNo: newTrip.awbNo,
        transportCharges: Number(newTrip.transporterCharges) || 0,
        transportPaidAmount: Number(newTrip.transporterPaidAmount) || 0,
        transportPaymentStatus: createdStatusT,
        forkliftOperator: newTrip.forkliftOperator,
        forkliftStartTime: newTrip.forkliftStartTime,
        forkliftEndTime: newTrip.forkliftEndTime,
        forkliftTotalHours: Number(newTrip.forkliftHours) || 0,
        forkliftCharges: Number(newTrip.forkliftCharges) || 0,
        forkliftPaidAmount: Number(newTrip.forkliftPaidAmount) || 0,
        forkliftPaymentStatus: createdStatusFL,
        receivedLocation: newTrip.dispatchLocation,
        clientName: newTrip.customerName,
        documentType: 'INCOMING MATERIAL DO'
      };

      syncInboundDocs([inboundItem, ...inboundDocs]);
    } else {
      if (savedDocs.some(d => d.invoiceNo === newTrip.invoiceNo)) {
        alert(`Outbound record / DN ${newTrip.invoiceNo} already exists in the registry! Please use a unique ID.`);
        return;
      }

      const created: InvoiceData = {
        ...newTrip,
        documentType: 'DELIVERY NOTE',
        transporterCharges: Number(newTrip.transporterCharges) || 0,
        transporterPaidAmount: Number(newTrip.transporterPaidAmount) || 0,
        transporterPaymentStatus: createdStatusT,
        forkliftHours: Number(newTrip.forkliftHours) || 0,
        forkliftCharges: Number(newTrip.forkliftCharges) || 0,
        forkliftPaidAmount: Number(newTrip.forkliftPaidAmount) || 0,
        forkliftPaymentStatus: createdStatusFL
      };

      syncDocs([created, ...savedDocs]);
    }

    setIsAddingTrip(false);
    setNewTrip({
      invoiceNo: '',
      dated: new Date().toISOString().substring(0, 10),
      workOrderNo: '',
      lpoNo: '',
      dispatchedBy: 'DISPATCH DESK',
      despatchThrough: '',
      awbNo: '',
      transporterCharges: 0,
      transporterPaidAmount: 0,
      transporterPaymentStatus: 'UNPAID' as 'PAID' | 'UNPAID' | 'PARTIAL',
      forkliftOperator: '',
      forkliftStartTime: '',
      forkliftEndTime: '',
      forkliftHours: 0,
      forkliftCharges: 0,
      forkliftPaidAmount: 0,
      forkliftPaymentStatus: 'UNPAID' as 'PAID' | 'UNPAID' | 'PARTIAL',
      dispatchLocation: '',
      direction: 'OUTGOING' as 'OUTGOING' | 'INCOMING',
      customerName: ''
    });
    triggerToast(`Added log entry ${newTrip.invoiceNo}!`);
  };

  // Helper status checkers
  const isTranspClientEnd = (doc: InvoiceData) => {
    return (doc.transporterCharges || 0) === 0;
  };

  const isTranspPaid = (doc: InvoiceData) => {
    return isTranspClientEnd(doc) || (doc.transporterCharges || 0) - (doc.transporterPaidAmount || 0) <= 0;
  };

  // Derived normalized logistics view stream compiled live from both outbound and inbound
  const normalizedDocs = React.useMemo(() => {
    const list: any[] = [];
    
    // Add Outbound records
    if (activeLedgerTab === 'all' || activeLedgerTab === 'outbound') {
      const outList = savedDocs
        .filter(d => !(d.invoiceNo?.startsWith('GRN-') || d.invoiceNo?.startsWith('CDN-') || d.documentType === 'GOODS RETURN NOTE'))
        .map(doc => ({
          ...doc,
          id: doc.invoiceNo,
          source: 'outbound' as const
        }));
      list.push(...outList);
    }
    
    // Add Inbound records
    if (activeLedgerTab === 'all' || activeLedgerTab === 'inbound') {
      const inList = inboundDocs.map(doc => ({
        id: doc.id,
        invoiceNo: doc.invoiceNo || 'N/A',
        dated: doc.date || 'N/A',
        workOrderNo: doc.poNo || 'N/A',
        lpoNo: doc.doNo || 'N/A',
        dispatchedBy: doc.receiverName || 'N/A',
        despatchThrough: doc.dispatchBy || 'N/A',
        awbNo: doc.invoiceAwbNo || doc.awbNo || 'N/A',
        transporterCharges: doc.transportCharges || 0,
        transporterPaidAmount: doc.transportPaidAmount || 0,
        transporterPaymentStatus: doc.transportPaymentStatus || 'UNPAID',
        forkliftOperator: doc.forkliftOperator || 'N/A',
        forkliftStartTime: doc.forkliftStartTime || 'N/A',
        forkliftEndTime: doc.forkliftEndTime || 'N/A',
        forkliftHours: doc.forkliftTotalHours || 0,
        forkliftCharges: doc.forkliftCharges || 0,
        forkliftPaidAmount: doc.forkliftPaidAmount || 0,
        forkliftPaymentStatus: doc.forkliftPaymentStatus || 'UNPAID',
        dispatchLocation: doc.receivedLocation || 'N/A',
        documentType: 'INCOMING MATERIAL DO',
        source: 'inbound' as const
      }));
      list.push(...inList);
    }
    
    // Sort combined list by date (newest first)
    return list.sort((a, b) => {
      const dateA = new Date(a.dated || '').getTime();
      const dateB = new Date(b.dated || '').getTime();
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [savedDocs, inboundDocs, activeLedgerTab]);

  // Filtered listing logic with BOTH filters applied
  const filteredDocs = normalizedDocs.filter(doc => {
    // 1. Transporter filter
    if (selectedTransporter !== 'ALL') {
      if (doc.despatchThrough?.trim().toUpperCase() !== selectedTransporter) {
        return false;
      }
    }
    // 2. Forklift Operator filter
    if (selectedForklift !== 'ALL') {
      if (doc.forkliftOperator?.trim().toUpperCase() !== selectedForklift) {
        return false;
      }
    }
    // 3. Search query text match
    if (searchQuery) {
      const q = searchQuery.toUpperCase();
      const matchNo = doc.invoiceNo?.toUpperCase().includes(q);
      const matchWO = doc.workOrderNo?.toUpperCase().includes(q);
      const matchLPO = doc.lpoNo?.toUpperCase().includes(q);
      const matchLoc = doc.dispatchLocation?.toUpperCase().includes(q);
      const matchDisp = doc.despatchThrough?.toUpperCase().includes(q);
      const matchFL = doc.forkliftOperator?.toUpperCase().includes(q);
      return matchNo || matchWO || matchLPO || matchLoc || matchDisp || matchFL;
    }
    return true;
  });

  // Calculate totals for active filtered set
  const totalCarrierInvoices = filteredDocs.length;
  const grossTranspCharges = filteredDocs.reduce((acc, doc) => acc + (doc.transporterCharges || 0), 0);
  const clearedTranspCash = filteredDocs.reduce((acc, doc) => acc + (doc.transporterPaidAmount || 0), 0);
  const outstandingTranspArrears = grossTranspCharges - clearedTranspCash;

  // Forklift totals
  const totalForkliftHours = filteredDocs.reduce((acc, doc) => acc + (doc.forkliftHours || 0), 0);
  const grossForkliftCharges = filteredDocs.reduce((acc, doc) => acc + (doc.forkliftCharges || 0), 0);
  const clearedForkliftCash = filteredDocs.reduce((acc, doc) => acc + (doc.forkliftPaidAmount || 0), 0);
  const outstandingForkliftArrears = grossForkliftCharges - clearedForkliftCash;

  // PRINT LANDSCAPE TRANSPORTER SOA REPORT
  const handlePrintTransporterSOA = () => {
    if (filteredDocs.length === 0) {
      alert("No data to generate Transporter Statement of Account.");
      return;
    }

    // Determine the unique carrier names appearing in the active filtered dataset
    const uniqueCarriers = Array.from(
      new Set(
        filteredDocs
          .map(d => d.despatchThrough?.trim().toUpperCase())
          .filter(Boolean)
      )
    );

    const isSinglePerson = uniqueCarriers.length === 1 || selectedTransporter !== 'ALL';
    const targetPersonName = selectedTransporter !== 'ALL' 
      ? selectedTransporter 
      : (uniqueCarriers.length === 1 ? uniqueCarriers[0] : (searchQuery ? `SEARCH: "${searchQuery.toUpperCase()}"` : 'CONSOLIDATED CARRIERS'));

    // Generate Transporter-only rows
    const printRows = filteredDocs.map((doc) => {
      const isClient = isTranspClientEnd(doc);
      const tCharges = doc.transporterCharges || 0;
      const tPaid = doc.transporterPaidAmount || 0;
      const tBalance = tCharges - tPaid;
      const tStatus = getTransporterStatusLabel(tCharges, tPaid);

      const transpColor = isClient 
        ? '#059669' 
        : (tStatus === 'PAID' ? '#10b981' : (tStatus === 'PARTIAL' ? '#f59e0b' : '#ef4444'));

      return `
        <tr style="border-bottom: 1.5px solid #000; font-family: monospace; font-size: 10px; text-transform: uppercase;">
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; font-weight: bold; text-align: center;">${doc.source === 'outbound' ? doc.invoiceNo : doc.id}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.dated}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.workOrderNo || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.lpoNo || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; font-weight: bold;">${doc.despatchThrough || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.awbNo || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: right; font-weight: bold;">${tCharges.toFixed(2)} AED</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: right; color: #15803d;">${tPaid.toFixed(2)} AED</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: right; font-weight: bold; color: ${tBalance > 0 ? '#b91c1c' : '#15803d'};">${tBalance.toFixed(2)} AED</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center; color: white; background-color: ${transpColor}; font-weight: bold; font-size: 9px; border-radius: 2px;">
            ${isClient ? 'CLIENT END' : tStatus}
          </td>
          <td style="padding: 8px 6px; font-size: 9px; color: #475569;">${doc.dispatchLocation || 'N/A'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isSinglePerson ? 'Individual' : 'Consolidated'} Transporter Statement of Account (SOA)</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
            @page {
              size: landscape;
              margin: 8mm;
            }
            body {
              font-family: "Plus Jakarta Sans", sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              line-height: 1.3;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-info-box {
              border-bottom: 4px solid #000;
              padding-bottom: 12px;
              margin-bottom: 15px;
            }
            .corporate-title {
              font-size: 22px;
              margin: 0;
              font-weight: 900;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              color: #000;
            }
            .corporate-subtitle {
              font-size: 11px;
              margin: 3px 0 0 0;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .soa-badge-title {
              background-color: #f76f11;
              color: white;
              padding: 8px 12px;
              font-size: 13px;
              font-weight: 900;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-bottom: 15px;
              border: 2px solid #000;
              border-radius: 4px;
            }
            .person-header-summary {
              display: grid;
              grid-template-cols: 1.5fr 1fr;
              gap: 20px;
              margin-bottom: 18px;
            }
            .partner-card {
              border: 2px solid #000;
              border-radius: 6px;
              padding: 12px;
              background-color: #fafafa;
            }
            .partner-card-title {
              font-size: 11px;
              font-weight: 800;
              color: #f76f11;
              text-transform: uppercase;
              border-bottom: 2px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 8px;
            }
            .card-row {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              margin: 4px 0;
            }
            .totals-card {
              border: 2px solid #000;
              border-radius: 6px;
              padding: 12px;
              background-color: #fff;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .stat-mini {
              text-align: center;
              padding: 6px;
              border-radius: 4px;
            }
            .stat-label {
              font-size: 8px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
              margin-bottom: 4px;
            }
            .stat-value {
              font-family: monospace;
              font-size: 13px;
              font-weight: bold;
            }
            .val-important {
              font-size: 14px;
              color: #b91c1c;
            }
            .master-tbl {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000;
              margin-bottom: 20px;
            }
            .master-tbl th {
              background-color: #0f172a;
              color: #ffffff;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 8px 6px;
              border: 1px solid #334155;
              text-align: center;
            }
            .stamp-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 2px solid #000;
              border-radius: 6px;
              padding: 12px;
              background-color: #fafafa;
              font-size: 9.5px;
            }
          </style>
        </head>
        <body>
          <div class="header-info-box">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div>
                <h1 class="corporate-title">MARINE FASTENERS INDUSTRIES L.L.C</h1>
                <h2 class="corporate-subtitle">Logistics Audit & Financial Settlements Department</h2>
              </div>
              <div style="font-family: monospace; font-size: 9px; text-align: right; line-height: 1.4; color: #475569;">
                <div>INDUSTRIAL AREA 2, AJMAN, UAE</div>
                <div>EMAIL: ADMIN@MARINEFASTENERS.CO</div>
                <div>PRINT DATE: ${new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="soa-badge-title">
            🚚 Statement of Account (SOA) &mdash; Category: Transporter Carrier Summary
          </div>

          <div class="person-header-summary">
            <div class="partner-card">
              <div class="partner-card-title">${isSinglePerson ? 'Individual Transporter Information' : 'Consolidated Carrier Ledger'}</div>
              <div class="card-row">
                <span>Selected Billing Entity Name:</span>
                <span style="font-weight: 800; font-size: 11.5px; text-transform: uppercase; color: #0f172a;">${targetPersonName}</span>
              </div>
              <div class="card-row">
                <span>Unique Associated Records count:</span>
                <span style="font-weight: 700;">${totalCarrierInvoices} logged trip disbursements</span>
              </div>
              <div class="card-row">
                <span>Statement Audit Status:</span>
                <span style="font-weight: 800; color: ${outstandingTranspArrears > 0 ? '#b91c1c' : '#15803d'}; font-family: monospace;">
                   ${outstandingTranspArrears > 0 ? '⚠️ OUTSTANDING BALANCE PENDING' : '✅ SETTLED / NO OUTSTANDING'}
                </span>
              </div>
            </div>

            <div class="totals-card">
              <div class="stat-mini" style="background-color: #f1f5f9;">
                <div class="stat-label">Gross Charges</div>
                <div class="stat-value">${grossTranspCharges.toFixed(2)} AED</div>
              </div>
              <div class="stat-mini" style="background-color: #ecfdf5;">
                <div class="stat-label">Cleared Paid</div>
                <div class="stat-value" style="color: #16a34a;">${clearedTranspCash.toFixed(2)} AED</div>
              </div>
              <div class="stat-mini" style="background-color: #fef2f2; border: 1px solid #fca5a5;">
                <div class="stat-label" style="color: #991b1b; font-weight: 800;">Pending Due</div>
                <div class="stat-value val-important">${outstandingTranspArrears.toFixed(2)} AED</div>
              </div>
            </div>
          </div>

          <table class="master-tbl">
            <thead>
              <tr>
                <th style="width: 85px;">DN NUMBER</th>
                <th style="width: 80px;">DATE</th>
                <th style="width: 95px;">WORK ORDER</th>
                <th style="width: 95px;">LPO NO</th>
                <th>CARRIER NAME</th>
                <th style="width: 90px;">AWB NUMBER</th>
                <th style="width: 100px;">CHARGES (AED)</th>
                <th style="width: 100px;">PAID (AED)</th>
                <th style="width: 105px;">BALANCE (AED)</th>
                <th style="width: 110px;">BILL STATUS</th>
                <th style="width: 140px;">LOCATION</th>
              </tr>
            </thead>
            <tbody>
              ${printRows}
            </tbody>
          </table>

          <div class="stamp-box">
            <div style="flex: 2; padding-right: 12px; border-right: 1.5px dashed #ccc;">
              <strong style="text-transform: uppercase;">Management Audit Remarks & Legality:</strong>
              <div style="margin-top: 4px; color: #475569;">1. This Statement of Account registers the definitive logistics invoice balance.</div>
              <div style="color: #475569;">2. Any dispute or claims regarding airway bills (AWB) must be raised within 7 business days.</div>
              <div style="color: #475569;">3. "Client End" deliveries denote zero company charges and are marked in emerald labels.</div>
            </div>
            <div style="flex: 1; text-align: right; padding-left: 15px; display: flex; flex-direction: column; justify-content: space-between; min-height: 60px;">
              <div style="font-weight: 800; font-size: 9px; text-transform: uppercase;">FOR MARINE FASTENERS INDUSTRIES L.L.C</div>
              <div style="text-decoration: none; border-top: 1.5px solid #000; display: inline-block; width: 180px; align-self: flex-end; padding-top: 4px; font-weight: bold; margin-top: 25px; text-align: center;">
                ACCOUNTS SIGNATURE DEPT
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `${isSinglePerson ? 'Individual' : 'Consolidated'} Transporter Statement of Account (SOA)`);
  };

  // PRINT LANDSCAPE FORKLIFT SOA REPORT
  const handlePrintForkliftSOA = () => {
    if (filteredDocs.length === 0) {
      alert("No data to generate Forklift Operator Statement of Account.");
      return;
    }

    // Determine the unique forklift operators appearing in the active filtered dataset
    const uniqueOperators = Array.from(
      new Set(
        filteredDocs
          .map(d => d.forkliftOperator?.trim().toUpperCase())
          .filter(Boolean)
      )
    );

    const isSingleOperator = uniqueOperators.length === 1 || selectedForklift !== 'ALL';
    const targetOperatorName = selectedForklift !== 'ALL'
      ? selectedForklift
      : (uniqueOperators.length === 1 ? uniqueOperators[0] : (searchQuery ? `SEARCH: "${searchQuery.toUpperCase()}"` : 'CONSOLIDATED OPERATORS'));

    // Generate Forklift-only rows
    const printRows = filteredDocs.map((doc) => {
      const flCharges = doc.forkliftCharges || 0;
      const flPaid = doc.forkliftPaidAmount || 0;
      const flBalance = flCharges - flPaid;
      const flStatus = getForkliftStatusLabel(flCharges, flPaid);

      const forkliftColor = flStatus === 'PAID' ? '#10b981' : (flStatus === 'PARTIAL' ? '#f59e0b' : '#ef4444');

      return `
        <tr style="border-bottom: 1.5px solid #000; font-family: monospace; font-size: 10px; text-transform: uppercase;">
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; font-weight: bold; text-align: center;">
            ${doc.invoiceNo || doc.id}<br/>
            <span style="font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 2px; color: ${doc.source === 'inbound' ? '#c2410c' : '#0369a1'}; background-color: ${doc.source === 'inbound' ? '#fef3c7' : '#e0f2fe'}; display: inline-block; margin-top: 3px; border: 1px solid ${doc.source === 'inbound' ? '#f59e0b' : '#38bdf8'};">
              ${doc.source === 'inbound' ? '▼ INCOMING' : '▲ OUTGOING'}
            </span>
          </td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.dated}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.workOrderNo || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.lpoNo || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; font-weight: bold;">${doc.forkliftOperator || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.forkliftStartTime || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center;">${doc.forkliftEndTime || 'N/A'}</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center; font-weight: bold;">${doc.forkliftHours || 0} Hrs</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: right; font-weight: bold;">${flCharges.toFixed(2)} AED</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: right; color: #15803d;">${flPaid.toFixed(2)} AED</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: right; font-weight: bold; color: ${flBalance > 0 ? '#b91c1c' : '#15803d'};">${flBalance.toFixed(2)} AED</td>
          <td style="padding: 8px 6px; border-right: 1.5px solid #ccc; text-align: center; color: white; background-color: ${forkliftColor}; font-weight: bold; font-size: 9px; border-radius: 2px;">
            ${flStatus}
          </td>
          <td style="padding: 8px 6px; font-size: 9px; color: #475569;">${doc.dispatchLocation || 'N/A'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isSingleOperator ? 'Individual' : 'Consolidated'} Forklift Operator Statement of Account (SOA)</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
            @page {
              size: landscape;
              margin: 8mm;
            }
            body {
              font-family: "Plus Jakarta Sans", sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              line-height: 1.3;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-info-box {
              border-bottom: 4px solid #000;
              padding-bottom: 12px;
              margin-bottom: 15px;
            }
            .corporate-title {
              font-size: 22px;
              margin: 0;
              font-weight: 900;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              color: #000;
            }
            .corporate-subtitle {
              font-size: 11px;
              margin: 3px 0 0 0;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            .soa-badge-title {
              background-color: #0284c7;
              color: white;
              padding: 8px 12px;
              font-size: 13px;
              font-weight: 900;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-bottom: 15px;
              border: 2px solid #000;
              border-radius: 4px;
            }
            .person-header-summary {
              display: grid;
              grid-template-cols: 1.5fr 1fr;
              gap: 20px;
              margin-bottom: 18px;
            }
            .partner-card {
              border: 2px solid #000;
              border-radius: 6px;
              padding: 12px;
              background-color: #fafafa;
            }
            .partner-card-title {
              font-size: 11px;
              font-weight: 800;
              color: #0284c7;
              text-transform: uppercase;
              border-bottom: 2px solid #ccc;
              padding-bottom: 5px;
              margin-bottom: 8px;
            }
            .card-row {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              margin: 4px 0;
            }
            .totals-card {
              border: 2px solid #000;
              border-radius: 6px;
              padding: 12px;
              background-color: #fff;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .stat-mini {
              text-align: center;
              padding: 6px;
              border-radius: 4px;
            }
            .stat-label {
              font-size: 8px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 700;
              margin-bottom: 4px;
            }
            .stat-value {
              font-family: monospace;
              font-size: 13px;
              font-weight: bold;
            }
            .val-important {
              font-size: 14px;
              color: #b91c1c;
            }
            .master-tbl {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000;
              margin-bottom: 20px;
            }
            .master-tbl th {
              background-color: #0f172a;
              color: #ffffff;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 8px 6px;
              border: 1px solid #334155;
              text-align: center;
            }
            .stamp-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 2px solid #000;
              border-radius: 6px;
              padding: 12px;
              background-color: #fafafa;
              font-size: 9.5px;
            }
          </style>
        </head>
        <body>
          <div class="header-info-box">
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div>
                <h1 class="corporate-title">MARINE FASTENERS INDUSTRIES L.L.C</h1>
                <h2 class="corporate-subtitle">Logistics Audit & Financial Settlements Department</h2>
              </div>
              <div style="font-family: monospace; font-size: 9px; text-align: right; line-height: 1.4; color: #475569;">
                <div>INDUSTRIAL AREA 2, AJMAN, UAE</div>
                <div>EMAIL: ADMIN@MARINEFASTENERS.CO</div>
                <div>PRINT DATE: ${new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="soa-badge-title">
            🚜 Statement of Account (SOA) &mdash; Category: Forklift Operator wages
          </div>

          <div class="person-header-summary">
            <div class="partner-card">
              <div class="partner-card-title">${isSingleOperator ? 'Individual Operator Information' : 'Consolidated Operators Ledger'}</div>
              <div class="card-row">
                <span>Selected Operator Name:</span>
                <span style="font-weight: 800; font-size: 11.5px; text-transform: uppercase; color: #0f172a;">${targetOperatorName}</span>
              </div>
              <div class="card-row">
                <span>Cumulative Logged Work Hours:</span>
                <span style="font-weight: 700;">${totalForkliftHours.toFixed(2)} active machine floor hours</span>
              </div>
              <div class="card-row">
                <span>Statement Audit Status:</span>
                <span style="font-weight: 800; color: ${outstandingForkliftArrears > 0 ? '#b91c1c' : '#15803d'}; font-family: monospace;">
                  ${outstandingForkliftArrears > 0 ? '⚠️ UNPAID WAGES PENDING' : '✅ PAID / DISBURSED'}
                </span>
              </div>
            </div>

            <div class="totals-card">
              <div class="stat-mini" style="background-color: #f1f5f9;">
                <div class="stat-label">Gross Wages</div>
                <div class="stat-value">${grossForkliftCharges.toFixed(2)} AED</div>
              </div>
              <div class="stat-mini" style="background-color: #ecfdf5;">
                <div class="stat-label">Paid / Disbursed</div>
                <div class="stat-value" style="color: #16a34a;">${clearedForkliftCash.toFixed(2)} AED</div>
              </div>
              <div class="stat-mini" style="background-color: #fef2f2; border: 1px solid #fca5a5;">
                <div class="stat-label" style="color: #991b1b; font-weight: 800;">Pending Balance</div>
                <div class="stat-value val-important">${outstandingForkliftArrears.toFixed(2)} AED</div>
              </div>
            </div>
          </div>

          <table class="master-tbl">
            <thead>
              <tr>
                <th style="width: 85px;">DN NUMBER</th>
                <th style="width: 80px;">DATE</th>
                <th style="width: 95px;">WORK ORDER</th>
                <th style="width: 90px;">LPO NO</th>
                <th>FORKLIFT OPERATOR</th>
                <th style="width: 80px;">START TIME</th>
                <th style="width: 80px;">END TIME</th>
                <th style="width: 80px;">HOURS</th>
                <th style="width: 100px;">CHARGES (AED)</th>
                <th style="width: 100px;">PAID (AED)</th>
                <th style="width: 105px;">WAGES BAL (AED)</th>
                <th style="width: 110px;">PAY STATUS</th>
                <th style="width: 140px;">LOCATION</th>
              </tr>
            </thead>
            <tbody>
              ${printRows}
            </tbody>
          </table>

          <div class="stamp-box">
            <div style="flex: 2; padding-right: 12px; border-right: 1.5px dashed #ccc;">
              <strong style="text-transform: uppercase;">Management Audit Remarks & Legality:</strong>
              <div style="margin-top: 4px; color: #475569;">1. This Statement of Account registers the definitive operational hours and wages sheet.</div>
              <div style="color: #475569;">2. Shift start & end cycles are validated against company floor access metrics.</div>
              <div style="color: #475569;">3. All payments are disbursed following general administrative protocols.</div>
            </div>
            <div style="flex: 1; text-align: right; padding-left: 15px; display: flex; flex-direction: column; justify-content: space-between; min-height: 60px;">
              <div style="font-weight: 800; font-size: 9px; text-transform: uppercase;">FOR MARINE FASTENERS INDUSTRIES L.L.C</div>
              <div style="text-decoration: none; border-top: 1.5px solid #000; display: inline-block; width: 180px; align-self: flex-end; padding-top: 4px; font-weight: bold; margin-top: 25px; text-align: center;">
                ACCOUNTS SIGNATURE DEPT
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printHtml(htmlContent, `${isSingleOperator ? 'Individual' : 'Consolidated'} Forklift Statement of Account (SOA)`);
  };

  // PRINT LANDSCAPE COMPREHENSIVE COMBINED STATEMENT OF ACCOUNT
  const handlePrintSOA = () => {
    if (filteredDocs.length === 0) {
      alert("No data to generate Statement of Account. Choose a valid carrier or forklift selection!");
      return;
    }

    const carrierHeader = selectedTransporter === 'ALL' ? 'CONSOLIDATED CARRIERS' : selectedTransporter;
    const flHeader = selectedForklift === 'ALL' ? 'CONSOLIDATED OPERATORS' : selectedForklift;

    // Generate matching print layout HTML
    const printRows = filteredDocs.map((doc, idx) => {
      const isClient = isTranspClientEnd(doc);
      
      const tCharges = doc.transporterCharges || 0;
      const tPaid = doc.transporterPaidAmount || 0;
      const tBalance = tCharges - tPaid;
      const tStatus = getTransporterStatusLabel(tCharges, tPaid);

      const flCharges = doc.forkliftCharges || 0;
      const flPaid = doc.forkliftPaidAmount || 0;
      const flBalance = flCharges - flPaid;
      const flStatus = getForkliftStatusLabel(flCharges, flPaid);

      const transpColor = isClient 
        ? '#059669' 
        : (tStatus === 'PAID' ? '#10b981' : (tStatus === 'PARTIAL' ? '#f59e0b' : '#ef4444'));

      const forkliftColor = flStatus === 'PAID' ? '#10b981' : (flStatus === 'PARTIAL' ? '#f59e0b' : '#ef4444');

      return `
        <tr style="border-bottom: 1.5px solid #000; font-family: monospace; font-size: 9px; text-transform: uppercase;">
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; font-weight: bold; text-align: center;">
            ${doc.invoiceNo || doc.id}<br/>
            <span style="font-size: 8px; font-weight: 800; padding: 1px 3px; border-radius: 2px; color: ${doc.source === 'inbound' ? '#c2410c' : '#0369a1'}; background-color: ${doc.source === 'inbound' ? '#fef3c7' : '#e0f2fe'}; display: inline-block; margin-top: 2px; border: 1px solid ${doc.source === 'inbound' ? '#f59e0b' : '#38bdf8'};">
              ${doc.source === 'inbound' ? '▼ INCOMING' : '▲ OUTGOING'}
            </span>
          </td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center;">${doc.dated}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center;">${doc.workOrderNo || 'N/A'}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center;">${doc.lpoNo || 'N/A'}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000;">${doc.despatchThrough || 'N/A'}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center;">${doc.awbNo || 'N/A'}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: right; font-weight: bold;">${tCharges.toFixed(2)}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: right;">${tPaid.toFixed(2)}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: right;">${tBalance.toFixed(2)}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center; color: white; background-color: ${transpColor}; font-weight: bold; font-size: 8px;">
            ${isClient ? 'CLIENT END' : tStatus}
          </td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000;">${doc.forkliftOperator || 'N/A'}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center;">${doc.forkliftStartTime || 'N/A'}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center;">${doc.forkliftEndTime || 'N/A'}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center;">${doc.forkliftHours || 0}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: right; font-weight: bold;">${flCharges.toFixed(2)}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: right;">${flPaid.toFixed(2)}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: right;">${flBalance.toFixed(2)}</td>
          <td style="padding: 6px 4px; border-right: 1.5px solid #000; text-align: center; color: white; background-color: ${forkliftColor}; font-weight: bold; font-size: 8px;">
            ${flStatus}
          </td>
          <td style="padding: 6px 4px;">${doc.dispatchLocation || 'N/A'}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Corporate Logistics Consolidated SOA (Financial Audit)</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;750;800;900&display=swap');
            @page {
              size: landscape;
              margin: 7mm;
            }
            body {
              font-family: "Plus Jakarta Sans", sans-serif;
              color: #000;
              margin: 0;
              padding: 10px;
              line-height: 1.25;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .border-box {
              border: 3px solid #000;
              padding: 15px;
              background-color: #f8fafc;
              margin-bottom: 12px;
            }
            .comp-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .audit-master-card {
              border: 3px double #000;
              background-color: #0f172a;
              color: #ffffff;
              padding: 12px 18px;
              margin-bottom: 15px;
              border-radius: 4px;
            }
            .grid-totals {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 15px;
              margin-bottom: 12px;
            }
            .category-card {
              border: 2px solid #000;
              padding: 10px;
              background-color: #fff;
              border-radius: 4px;
            }
            .card-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              border-bottom: 1.5px solid #000;
              padding-bottom: 4px;
              margin-bottom: 6px;
              color: #000;
            }
            .card-item {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin: 3px 0;
            }
            .val-mono {
              font-family: monospace;
              font-weight: bold;
            }
            .master-tbl {
              width: 100%;
              border-collapse: collapse;
              border: 3px solid #000;
              margin-bottom: 20px;
            }
            .master-tbl th {
              background-color: #000;
              color: #fff;
              font-size: 8.5px;
              font-weight: 900;
              text-transform: uppercase;
              padding: 8px 4px;
              border: 1.5px solid #444;
              text-align: center;
            }
            .stamp-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 2.5px solid #000;
              padding: 10px 15px;
              background-color: #fff;
              font-size: 9px;
            }
          </style>
        </head>
        <body>
          <div class="border-box">
            <div class="comp-header">
              <div>
                <h1 style="font-size: 18px; margin: 0; font-weight: 950; letter-spacing: 0.05em; text-transform: uppercase;">
                  MARINE FASTENERS INDUSTRIES L.L.C
                </h1>
                <h3 style="font-size: 9.5px; margin: 2px 0 0 0; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.08em;">
                  LOGISTICS AUDIT &amp; SOA CENTER
                </h3>
              </div>
              <div style="font-family: monospace; font-size: 8px; text-align: right; line-height: 1.4;">
                <div>INDUSTRIAL AREA 2, AJMAN, UAE</div>
                <div>EMAIL: ADMIN@MARINEFASTENERS.CO</div>
                <div>PRINTED ON: ${new Date().toLocaleString()}</div>
              </div>
            </div>

            <h2 style="font-size: 11px; text-transform: uppercase; margin: 4px 0 10px 0; font-weight: 900; text-align: center; border: 2px solid #000; background-color: #fff; padding: 6px;">
              🧾 DUAL AUDIT STATEMENTS — CARRIER: <span style="color: #f37021;">${carrierHeader}</span> | FORKLIFT OPERATOR: <span style="color: #0284c7;">${flHeader}</span>
            </h2>

            <!-- FINANCIAL AUDIT MASTER CARD -->
            <div class="audit-master-card">
              <div style="font-weight: 900; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.12em; border-bottom: 1.5px solid #334155; padding-bottom: 5px; margin-bottom: 8px; color: #f8fafc;">
                🏛️ CORPORATE LOGISTICS MASTER AUDIT &amp; CASH LIABILITIES (GRAND CUMULATIVE BALANCE)
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div>
                  <div style="font-size: 8px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">1. Grand Combined Total Charges:</div>
                  <div style="font-family: monospace; font-size: 15px; font-weight: 900; color: #f59e0b;">${(grossTranspCharges + grossForkliftCharges).toFixed(2)} AED</div>
                </div>
                <div>
                  <div style="font-size: 8px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">2. Grand Combined Disbursed Paid Amount:</div>
                  <div style="font-family: monospace; font-size: 15px; font-weight: 900; color: #10b981;">${(clearedTranspCash + clearedForkliftCash).toFixed(2)} AED</div>
                </div>
                <div style="border-left: 2px dashed #475569; padding-left: 15px;">
                  <div style="font-size: 8.5px; text-transform: uppercase; color: #fca5a5; font-weight: 900;">3. Grand Combined Total Pending Amount:</div>
                  <div style="font-family: monospace; font-size: 17px; font-weight: 950; color: #ef4444;">${(outstandingTranspArrears + outstandingForkliftArrears).toFixed(2)} AED</div>
                </div>
              </div>
            </div>

            <!-- Summary metrics -->
            <div class="grid-totals">
              <div class="category-card" style="border-color: #b45309; border-width: 1.5px;">
                <div class="card-title">🚚 1. TRANSPORTER CATEGORY SUB-TOTALS</div>
                <div class="card-item"><span>Carrier Selection Mode:</span><span class="val-mono" style="color: #b45309;">${carrierHeader}</span></div>
                <div class="card-item"><span>Carrier Charges Incurred:</span><span class="val-mono">${grossTranspCharges.toFixed(2)} AED</span></div>
                <div class="card-item"><span>Carrier Paid / Cleared Amount:</span><span class="val-mono" style="color: #15803d;">${clearedTranspCash.toFixed(2)} AED</span></div>
                <div class="card-item" style="font-weight: bold; border-top: 1px dashed #ccc; padding-top: 3px; margin-top: 3px;">
                  <span>Outstanding Carrier Pending:</span>
                  <span class="val-mono" style="color: #b91c1c;">${outstandingTranspArrears.toFixed(2)} AED</span>
                </div>
              </div>

              <div class="category-card" style="border-color: #0284c7; border-width: 1.5px;">
                <div class="card-title">🚜 2. FORKLIFT CATEGORY SUB-TOTALS</div>
                <div class="card-item"><span>Operator Selection Mode:</span><span class="val-mono" style="color: #0284c7;">${flHeader}</span></div>
                <div class="card-item"><span>Operator Hours logged:</span><span class="val-mono">${totalForkliftHours.toFixed(2)} Hrs</span></div>
                <div class="card-item"><span>Operator Wages Due:</span><span class="val-mono">${grossForkliftCharges.toFixed(2)} AED</span></div>
                <div class="card-item" style="font-weight: bold; border-top: 1px dashed #ccc; padding-top: 3px; margin-top: 3px;">
                  <span>Pending Operator Wages:</span>
                  <span class="val-mono" style="color: #b91c1c;">${outstandingForkliftArrears.toFixed(2)} AED</span>
                </div>
              </div>
            </div>
          </div>

          <table class="master-tbl">
            <thead>
              <tr>
                <th style="width: 55px;">DN NO</th>
                <th style="width: 55px;">DATE</th>
                <th style="width: 55px;">WORK ORD</th>
                <th style="width: 55px;">LPO REF</th>
                <th>CARRIER NAME</th>
                <th style="width: 60px;">AWB NO</th>
                <th style="width: 45px;">TR CHG</th>
                <th style="width: 45px;">TR PAID</th>
                <th style="width: 45px;">TR BAL</th>
                <th style="width: 50px;">TR STATUS</th>
                <th>FL OPERATOR</th>
                <th style="width: 45px;">FL START</th>
                <th style="width: 45px;">FL END</th>
                <th style="width: 35px;">HOURS</th>
                <th style="width: 45px;">FL CHG</th>
                <th style="width: 45px;">FL PAID</th>
                <th style="width: 45px;">FL BAL</th>
                <th style="width: 50px;">FL STATUS</th>
                <th style="width: 85px;">LOCATION</th>
              </tr>
            </thead>
            <tbody>
              ${printRows}
            </tbody>
          </table>

          <div class="stamp-box">
            <div style="flex: 1.5; padding-right: 15px; border-right: 1.5px dashed #ccc;">
              <strong>MANAGEMENT AUDIT REMARKS &amp; POLICIES:</strong>
              <div style="margin-top: 4px;">1. Standard validation ensures zero errors inside matching transport accounts &amp; driver/forklift rosters.</div>
              <div>2. Client End transport shipments must match zero charges with active Green indicator marks.</div>
              <div>3. Discrepancies should be solved within standard 5 industrial working days.</div>
            </div>
            <div style="flex: 1; text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; min-height: 55px;">
              <span style="font-weight: bold; text-transform: uppercase;">FOR MARINE FASTENERS INDUSTRIAL L.L.C</span>
              <div style="border-top: 1.5px solid #000; width: 170px; text-align: center; padding-top: 3px; font-weight: bold; margin-top: 25px;">
                LOGISTICS SUPV &amp; AUDITOR
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printHtml(htmlContent, 'Corporate Logistics Consolidated SOA (Financial Audit)');
  };

  return (
    <div className="space-y-6 font-mono text-[11px] text-slate-800">
      
      {/* OFFICIAL CORPORATE REPORT HEADER BANNER */}
      <div className="bg-white border border-slate-300 p-4 shadow-xs rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-base font-black tracking-wide text-slate-900 font-sans uppercase">MARINE FASTENERS INDUSTRIES L.L.C.</h1>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">INDUSTRIAL AREA, AJMAN, UNITED ARAB EMIRATES | TEL: +971 6 5250526 | TRN: 100440509600003</p>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-xs font-black text-[#002D62] uppercase tracking-wider font-mono bg-blue-50 px-2.5 py-1 border border-blue-200">
              TRANSPORTER PAYMENT & LOGISTICS LEDGER STATEMENT
            </span>
          </div>
        </div>
        <div className="text-right font-mono text-[11px] text-slate-600 space-y-1">
          <div className="bg-slate-100 border border-slate-300 px-3 py-1 font-bold text-slate-800 uppercase">
            AS OF DATE: {new Date().toISOString().split('T')[0]}
          </div>
          <div className="font-bold text-slate-700">CURRENCY: AED (DIRHAM)</div>
        </div>
      </div>
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-slate-900 border border-[#f37021] text-white p-3 shadow-xl rounded z-50 animate-slide-in font-mono text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Segmented active tab controller */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border-2 border-black max-w-xl mr-auto font-sans gap-1">
        <button
          type="button"
          onClick={() => {
            setActiveLedgerTab('all');
            setSelectedTransporter('ALL');
            setSelectedForklift('ALL');
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[9.5px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeLedgerTab === 'all'
              ? 'bg-slate-900 text-white shadow font-semibold'
              : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Unified Combined Ledger (All)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveLedgerTab('outbound');
            setSelectedTransporter('ALL');
            setSelectedForklift('ALL');
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[9.5px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeLedgerTab === 'outbound'
              ? 'bg-slate-900 text-white shadow font-semibold'
              : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Outbound Only
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveLedgerTab('inbound');
            setSelectedTransporter('ALL');
            setSelectedForklift('ALL');
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[9.5px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeLedgerTab === 'inbound'
              ? 'bg-slate-900 text-white shadow font-semibold'
              : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Inbound Only
        </button>
      </div>

      {/* Simple Registry Filters Section */}
      <div className="bg-white border-2 border-black rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-800" />
            <h3 className="font-sans font-bold text-xs text-slate-900 uppercase">LOGISTICS &amp; VEHICLE LEDGER</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">Filter carrier or forklift operator records in the ledger below</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Dropdown 1: Transporter Carrier */}
          <div className="space-y-1.5 p-3.5 bg-slate-50/80 border border-slate-350 rounded-lg">
            <label className="flex items-center gap-1 text-[8.5px] font-bold text-slate-700 tracking-wider text-left uppercase">
              <Truck className="w-3.5 h-3.5 text-slate-600" />
              Filter Transport Carrier:
            </label>
            <select
              value={selectedTransporter}
              onChange={(e) => setSelectedTransporter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-2 text-[10px] font-bold uppercase text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer appearance-none"
            >
              <option value="ALL">-- ALL VEHICLE CARRIERS --</option>
              {transporters.map(tr => (
                <option key={tr} value={tr}>{tr}</option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Forklift Operator */}
          <div className="space-y-1.5 p-3.5 bg-slate-50/80 border border-slate-350 rounded-lg">
            <label className="flex items-center gap-1 text-[8.5px] font-bold text-slate-700 tracking-wider text-left uppercase">
              <User className="w-3.5 h-3.5 text-slate-600" />
              Filter Forklift Operator:
            </label>
            <select
              value={selectedForklift}
              onChange={(e) => setSelectedForklift(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-2 text-[10px] font-bold uppercase text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer appearance-none"
            >
              <option value="ALL">-- ALL FORKLIFT OPERATORS --</option>
              {forkliftOperators.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="space-y-1.5 p-3.5 bg-slate-50/80 border border-slate-350 rounded-lg">
            <label className="flex items-center gap-1 text-[8.5px] font-bold text-slate-700 tracking-wider text-left uppercase">
              <Search className="w-3.5 h-3.5 text-slate-600" />
              Search Registry Records:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="E.G. AWB, DN NO, WORK REF, LOCATION..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2 pr-8 text-[10px] uppercase font-bold text-slate-800 focus:outline-none focus:border-slate-800"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

        </div>

        {/* Global actions row under filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Active selections overview as pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className="p-1 px-2.5 rounded bg-slate-100 text-slate-800 font-semibold text-[9px] uppercase border border-slate-300">
              CARRIER: {selectedTransporter === 'ALL' ? 'CONSOLIDATED' : selectedTransporter}
            </span>
            <span className="p-1 px-2.5 rounded bg-slate-100 text-slate-800 font-semibold text-[9px] uppercase border border-slate-300">
              FORKLIFT: {selectedForklift === 'ALL' ? 'CONSOLIDATED' : selectedForklift}
            </span>
            <span className="p-1 px-2 my-auto bg-amber-500/10 text-amber-700 text-[8.5px] font-bold rounded uppercase">
              {filteredDocs.length} Active Records found
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedTransporter('ALL');
                setSelectedForklift('ALL');
                setSearchQuery('');
              }}
              className="bg-neutral-100 hover:bg-neutral-200 text-slate-800 font-semibold text-[9px] uppercase h-8 px-3 flex items-center gap-1 transition-colors cursor-pointer border border-neutral-300 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>

            <button
              type="button"
              onClick={() => setIsAddingTrip(!isAddingTrip)}
              className="bg-white hover:bg-neutral-50 border border-slate-300 font-semibold text-[9px] uppercase h-8 px-3 flex items-center gap-1 rounded transition-colors cursor-pointer text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-[#f37021]" /> Log Manual record
            </button>

            <button
              type="button"
              onClick={() => setShowDirectories(!showDirectories)}
              className={`font-semibold text-[9px] uppercase h-8 px-3 flex items-center gap-1.5 rounded transition-colors cursor-pointer ${
                showDirectories ? 'bg-slate-900 text-white' : 'bg-white hover:bg-neutral-50 border border-slate-300 text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-500" /> Registries Manager
            </button>

            <button
              type="button"
              onClick={handlePrintTransporterSOA}
              disabled={filteredDocs.length === 0}
              className="bg-neutral-900 hover:bg-black text-white font-semibold text-[9px] uppercase h-8 px-3.5 flex items-center gap-1.5 rounded transition-all shadow-sm select-none cursor-pointer disabled:opacity-40"
            >
              <Truck className="w-3.5 h-3.5" /> Transporter PDF
            </button>

            <button
              type="button"
              onClick={handlePrintForkliftSOA}
              disabled={filteredDocs.length === 0}
              className="bg-neutral-900 hover:bg-black text-white font-semibold text-[9px] uppercase h-8 px-3.5 flex items-center gap-1.5 rounded transition-all shadow-sm select-none cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Forklift PDF
            </button>

            <button
              type="button"
              onClick={handlePrintSOA}
              disabled={filteredDocs.length === 0}
              className="bg-[#f37021] text-white hover:bg-[#e26012] font-bold text-[9px] uppercase h-8 px-3.5 flex items-center gap-1.5 rounded transition-all shadow select-none cursor-pointer disabled:opacity-40"
            >
              <Layers className="w-3.5 h-3.5" /> Consolidated SOA PDF
            </button>
          </div>
        </div>
      </div>

      {/* Directory Registries (Transporters, Forklift Operators, and Customers) */}
      {showDirectories && (
        <div className="bg-slate-50 border-2 border-black rounded-xl p-5 shadow-sm space-y-6">
          <div className="border-b-2 border-black pb-2 flex items-center justify-between">
            <h4 className="font-sans font-bold text-slate-900 text-[11.5px] uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Directories & Registers Manager
            </h4>
            <button 
              type="button" 
              onClick={() => setShowDirectories(false)}
              className="text-[9px] bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-2.5 py-1 rounded uppercase tracking-wider cursor-pointer border border-red-300"
            >
              Close Registers
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column A: Transporters Register */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b pb-1.5">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block text-left">
                    🚚 Transporter Carriers ({registeredTransporters.length})
                  </span>
                </div>

                {/* Add form */}
                <form onSubmit={handleRegisterTransporter} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="NEW TRANSPORTER NAME..."
                    value={newTransporterName}
                    onChange={(e) => setNewTransporterName(e.target.value)}
                    className="flex-1 border border-slate-300 rounded p-1.5 text-[9.5px] uppercase font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-950 text-white font-semibold text-[9px] uppercase px-3 rounded cursor-pointer h-8 shrink-0"
                  >
                    Add
                  </button>
                </form>

                {/* List */}
                <div className="max-h-56 overflow-y-auto divide-y text-[9.5px] border rounded bg-slate-50/50">
                  {registeredTransporters.length === 0 ? (
                    <p className="p-3 text-center text-slate-400 font-bold">No registered transporters.</p>
                  ) : (
                    registeredTransporters.map(name => (
                      <div key={name} className="p-2 flex items-center justify-between hover:bg-slate-50 font-bold uppercase text-slate-700">
                        <span>🚚 {name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransporter(name)}
                          className="text-red-600 hover:text-red-900 font-bold hover:underline cursor-pointer ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Column B: Forklift Operator Register */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b pb-1.5">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block text-left">
                    👷 Forklift Operators ({registeredForklifts.length})
                  </span>
                </div>

                {/* Add form */}
                <form onSubmit={handleRegisterForklift} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="NEW OPERATOR NAME..."
                    value={newForkliftName}
                    onChange={(e) => setNewForkliftName(e.target.value)}
                    className="flex-1 border border-slate-300 rounded p-1.5 text-[9.5px] uppercase font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-950 text-white font-semibold text-[9px] uppercase px-3 rounded cursor-pointer h-8 shrink-0"
                  >
                    Add
                  </button>
                </form>

                {/* List */}
                <div className="max-h-56 overflow-y-auto divide-y text-[9.5px] border rounded bg-slate-50/50">
                  {registeredForklifts.length === 0 ? (
                    <p className="p-3 text-center text-slate-400 font-bold">No registered operators.</p>
                  ) : (
                    registeredForklifts.map(name => (
                      <div key={name} className="p-2 flex items-center justify-between hover:bg-slate-50 font-bold uppercase text-slate-700">
                        <span>👷 {name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteForklift(name)}
                          className="text-red-600 hover:text-red-900 font-bold hover:underline cursor-pointer ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Column C: Customer Register */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b pb-1.5">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block text-left">
                    👤 Customer Directory ({registeredCustomers.length})
                  </span>
                </div>

                {/* Add form */}
                <form onSubmit={handleRegisterCustomer} className="space-y-2 border p-2.5 rounded bg-slate-50/50">
                  <div>
                    <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600 text-left">Customer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="DUBAI STEEL CO."
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1 text-[9px] uppercase font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600 text-left">Email</label>
                      <input
                        type="email"
                        placeholder="INFO@..."
                        value={newCustEmail}
                        onChange={(e) => setNewCustEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-[9px] uppercase font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase mb-0.5 text-slate-600 text-left">Phone</label>
                      <input
                        type="text"
                        placeholder="TEL..."
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-[9px] uppercase font-bold text-slate-800 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-semibold text-[9px] uppercase p-1.5 rounded cursor-pointer"
                  >
                    + Register Customer
                  </button>
                </form>

                {/* List */}
                <div className="max-h-36 overflow-y-auto divide-y text-[9.5px] border rounded bg-slate-50/50">
                  {registeredCustomers.length === 0 ? (
                    <p className="p-3 text-center text-slate-400 font-bold">No registered customers.</p>
                  ) : (
                    registeredCustomers.map(cust => (
                      <div key={cust.id} className="p-2 flex items-center justify-between hover:bg-slate-50 font-sans">
                        <div className="flex flex-col text-left">
                          <span className="font-semibold uppercase text-slate-800">{cust.name}</span>
                          <span className="text-[8px] text-slate-400 uppercase">TEL: {cust.phone || 'N/A'} | EMAIL: {cust.email || 'N/A'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(cust.id)}
                          className="text-red-600 hover:text-red-900 font-sans font-bold hover:underline cursor-pointer ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Trip Direct Entry Voucher Form */}
      {isAddingTrip && (
        <form onSubmit={handleCreateTripSubmit} className="bg-neutral-50 border-2 border-black p-5 rounded-xl space-y-4">
          <div className="border-b-2 border-black pb-2 flex items-center justify-between">
            <h4 className="font-sans font-bold text-slate-900 text-[11px] uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#f37021]" /> Log Logistics, Cargo & Forklift Record
            </h4>
            <button 
              type="button" 
              onClick={() => setIsAddingTrip(false)}
              className="text-stone-500 hover:text-stone-900 font-sans font-bold hover:underline cursor-pointer"
            >
              [CANCEL / EXIT]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-5 border border-slate-200 rounded-lg">
            
            {/* Step 1: Incoming or Outgoing switcher */}
            <div className="md:col-span-12 p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-800 uppercase block tracking-wider text-left">
                  1. select cargo direction
                </span>
                <span className="text-[8px] text-slate-500 font-medium block text-left">
                  Select Incoming for raw materials / stock intake, Outgoing for customer dispatches.
                </span>
              </div>
              <div className="flex bg-slate-200 p-1 rounded-lg gap-1 border border-slate-300">
                <button
                  type="button"
                  onClick={() => setNewTrip(prev => ({ ...prev, direction: 'OUTGOING' }))}
                  className={`px-4 py-1.5 rounded-md font-bold text-[9px] uppercase transition-all flex items-center gap-1 cursor-pointer ${
                    newTrip.direction === 'OUTGOING' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Outgoing (Customer Dispatch)
                </button>
                <button
                  type="button"
                  onClick={() => setNewTrip(prev => ({ ...prev, direction: 'INCOMING' }))}
                  className={`px-4 py-1.5 rounded-md font-bold text-[9px] uppercase transition-all flex items-center gap-1 cursor-pointer ${
                    newTrip.direction === 'INCOMING' 
                      ? 'bg-orange-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Incoming (Stock Material)
                </button>
              </div>
            </div>

            {/* General Fields */}
            <div className="md:col-span-12 border-b border-dashed border-slate-200 pb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[9.5px] font-bold text-slate-800 uppercase tracking-wider">2. Document & Order Linking</span>
            </div>

            <div className="md:col-span-3 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Reference DN / Voucher No*</label>
              <input 
                type="text" 
                value={newTrip.invoiceNo} 
                onChange={e => setNewTrip({...newTrip, invoiceNo: e.target.value.toUpperCase()})}
                placeholder="E.G. DN260499 / GRN-2601"
                required
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-semibold text-[10px]"
              />
            </div>

            <div className="md:col-span-3 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Movement Date*</label>
              <input 
                type="date" 
                value={newTrip.dated} 
                onChange={e => setNewTrip({...newTrip, dated: e.target.value})}
                required
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-semibold text-[10px]"
              />
            </div>

            <div className="md:col-span-3 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Work Order / PO No</label>
              <input 
                type="text" 
                value={newTrip.workOrderNo} 
                onChange={e => setNewTrip({...newTrip, workOrderNo: e.target.value.toUpperCase()})}
                placeholder="E.G. WO-98125"
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px]"
              />
            </div>

            <div className="md:col-span-3 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">LPO / DO Ref</label>
              <input 
                type="text" 
                value={newTrip.lpoNo} 
                onChange={e => setNewTrip({...newTrip, lpoNo: e.target.value.toUpperCase()})}
                placeholder="E.G. LPO-55102"
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px]"
              />
            </div>

            <div className="md:col-span-6 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Customer / Client Name</label>
              {registeredCustomers.length > 0 ? (
                <select
                  value={newTrip.customerName}
                  onChange={e => setNewTrip({...newTrip, customerName: e.target.value})}
                  className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px] h-8"
                >
                  <option value="">-- SELECT FROM REGISTERED CUSTOMERS --</option>
                  {registeredCustomers.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={newTrip.customerName} 
                  onChange={e => setNewTrip({...newTrip, customerName: e.target.value.toUpperCase()})}
                  placeholder="E.G. AL SHAHIN STEEL"
                  className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px]"
                />
              )}
            </div>

            <div className="md:col-span-6 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Dispatch Location / Warehouse</label>
              <input 
                type="text" 
                value={newTrip.dispatchLocation} 
                onChange={e => setNewTrip({...newTrip, dispatchLocation: e.target.value.toUpperCase()})}
                placeholder="E.G. SHARJAH PLANT 2 / DUBAI SOUTH STORAGE"
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px]"
              />
            </div>

            {/* Transporter Fields */}
            <div className="md:col-span-12 border-b border-dashed border-slate-200 pt-2 pb-1 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[9.5px] font-bold text-amber-700 uppercase tracking-wider">3. Transport Carrier Costs</span>
            </div>

            <div className="md:col-span-4 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Transport Carrier / Dispatch Through</label>
              {registeredTransporters.length > 0 ? (
                <select
                  value={newTrip.despatchThrough}
                  onChange={e => setNewTrip({...newTrip, despatchThrough: e.target.value})}
                  className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px] h-8"
                >
                  <option value="">-- SELECT FROM REGISTERED TRANSPORTERS --</option>
                  {registeredTransporters.map(tr => (
                    <option key={tr} value={tr}>{tr}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={newTrip.despatchThrough} 
                  onChange={e => setNewTrip({...newTrip, despatchThrough: e.target.value.toUpperCase()})}
                  placeholder="E.G. AL SHAHIN TRUCKING"
                  className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-semibold text-[10px]"
                />
              )}
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">AWB No</label>
              <input 
                type="text" 
                value={newTrip.awbNo} 
                onChange={e => setNewTrip({...newTrip, awbNo: e.target.value.toUpperCase()})}
                placeholder="E.G. AWB-99001"
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px]"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Carrier Bill Charges (AED)</label>
              <input 
                type="number" 
                value={newTrip.transporterCharges} 
                onChange={e => {
                  const val = Number(e.target.value) || 0;
                  setNewTrip({
                    ...newTrip, 
                    transporterCharges: val,
                    transporterPaidAmount: newTrip.transporterPaymentStatus === 'PAID' ? val : newTrip.transporterPaidAmount
                  });
                }}
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-semibold text-[10px]"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Carrier Paid (AED)</label>
              <input 
                type="number" 
                value={newTrip.transporterPaidAmount} 
                onChange={e => setNewTrip({...newTrip, transporterPaidAmount: Number(e.target.value) || 0})}
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-bold text-[10px]"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Carrier Bill Status</label>
              <select 
                value={newTrip.transporterPaymentStatus} 
                onChange={e => {
                  const status = e.target.value as 'PAID' | 'UNPAID' | 'PARTIAL';
                  let paid = newTrip.transporterPaidAmount;
                  if (status === 'PAID') paid = newTrip.transporterCharges;
                  else if (status === 'UNPAID') paid = 0;
                  setNewTrip({...newTrip, transporterPaymentStatus: status, transporterPaidAmount: paid});
                }}
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-bold text-[10px] h-8"
              >
                <option value="UNPAID">❌ PENDING (UNPAID)</option>
                <option value="PARTIAL">⚠️ PARTIAL</option>
                <option value="PAID">✅ PAID</option>
              </select>
            </div>

            {/* Forklift Fields */}
            <div className="md:col-span-12 border-b border-dashed border-slate-200 pt-2 pb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[9.5px] font-bold text-sky-700 uppercase tracking-wider">4. Forklift Operator &amp; Charges</span>
            </div>

            <div className="md:col-span-4 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">Forklift Operator Name</label>
              {registeredForklifts.length > 0 ? (
                <select
                  value={newTrip.forkliftOperator}
                  onChange={e => setNewTrip({...newTrip, forkliftOperator: e.target.value})}
                  className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px] h-8"
                >
                  <option value="">-- SELECT FROM REGISTERED OPERATORS --</option>
                  {registeredForklifts.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={newTrip.forkliftOperator} 
                  onChange={e => setNewTrip({...newTrip, forkliftOperator: e.target.value.toUpperCase()})}
                  placeholder="E.G. JASSEM SINGH"
                  className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded uppercase font-bold text-[10px]"
                />
              )}
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">FL Hours Worked</label>
              <input 
                type="number" 
                step="0.1"
                value={newTrip.forkliftHours} 
                onChange={e => setNewTrip({...newTrip, forkliftHours: Number(e.target.value) || 0})}
                placeholder="Hours e.g. 2.5"
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-bold text-[10px]"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">FL Operator Charges (AED)</label>
              <input 
                type="number" 
                value={newTrip.forkliftCharges} 
                onChange={e => {
                  const val = Number(e.target.value) || 0;
                  setNewTrip({
                    ...newTrip, 
                    forkliftCharges: val,
                    forkliftPaidAmount: newTrip.forkliftPaymentStatus === 'PAID' ? val : newTrip.forkliftPaidAmount
                  });
                }}
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-semibold text-[10px]"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">FL Paid Amount (AED)</label>
              <input 
                type="number" 
                value={newTrip.forkliftPaidAmount} 
                onChange={e => setNewTrip({...newTrip, forkliftPaidAmount: Number(e.target.value) || 0})}
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-bold text-[10px]"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <label className="block text-[8px] font-bold uppercase mb-1 text-slate-700">FL Payment Status</label>
              <select 
                value={newTrip.forkliftPaymentStatus} 
                onChange={e => {
                  const status = e.target.value as 'PAID' | 'UNPAID' | 'PARTIAL';
                  let paid = newTrip.forkliftPaidAmount;
                  if (status === 'PAID') paid = newTrip.forkliftCharges;
                  else if (status === 'UNPAID') paid = 0;
                  setNewTrip({...newTrip, forkliftPaymentStatus: status, forkliftPaidAmount: paid});
                }}
                className="w-full bg-slate-50/60 border border-slate-300 p-1.5 rounded font-bold text-[10px] h-8"
              >
                <option value="UNPAID">❌ UNPAID</option>
                <option value="PARTIAL">⚠️ PARTIAL</option>
                <option value="PAID">✅ PAID</option>
              </select>
            </div>

            {/* Controller / Dispatch Desk */}
            <div className="md:col-span-12 border-t pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400">
                <span>Dispatched By / Controller:</span>
                <input 
                  type="text" 
                  value={newTrip.dispatchedBy} 
                  onChange={e => setNewTrip({...newTrip, dispatchedBy: e.target.value.toUpperCase()})}
                  className="bg-transparent border-b border-slate-350 focus:outline-hidden font-bold text-slate-700 text-[9px] uppercase px-1"
                />
              </div>

              <button 
                type="submit" 
                className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 text-[9.5px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all shadow"
              >
                ✓ REGISTER LOGISTICS TRIP RECORD
              </button>
            </div>

          </div>
        </form>
      )}

      {/* Side-by-Side Live Summary tables (from user's sketch) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1: Transporter Category Card */}
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="flex items-center gap-1 font-sans font-bold text-[11px] text-amber-800 uppercase">
                <Truck className="w-4 h-4 text-amber-600" /> Transporter Category Summary
              </span>
              <span className="text-[8px] font-mono px-2 bg-amber-100 text-amber-900 font-bold uppercase rounded-full">
                Active Carrier Statement Area
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[9px] uppercase border-collapse">
                <thead>
                  <tr className="bg-amber-900/10 text-slate-900 border-b-2 border-black">
                    <th className="p-2">DISPATCHED THROUGH</th>
                    <th className="p-2 text-center">AWB NO</th>
                    <th className="p-2 text-right">CHARGES</th>
                    <th className="p-2 text-right">PAID AMOUNT</th>
                    <th className="p-2 text-right">BALANCE</th>
                    <th className="p-2 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center font-bold text-slate-400 bg-slate-50">
                        No active carrier trip logs in filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc, idx) => {
                      const isClient = isTranspClientEnd(doc);
                      
                      const charges = doc.transporterCharges || 0;
                      const paidAmount = doc.transporterPaidAmount || 0;
                      const balance = charges - paidAmount;
                      const status = getTransporterStatusLabel(charges, paidAmount);

                      return (
                        <tr key={`${doc.invoiceNo}-tr-${idx}`} className="hover:bg-slate-50">
                          <td className="p-2 max-w-[120px] truncate font-bold text-slate-800" title={doc.despatchThrough}>
                            {doc.despatchThrough || 'N/A'}
                          </td>
                          <td className="p-2 text-center text-slate-500 font-semibold">{doc.awbNo || 'N/A'}</td>
                          <td className="p-2 text-right font-bold text-slate-900">{charges.toFixed(2)}</td>
                          <td className="p-2 text-right text-emerald-700 font-semibold">{paidAmount.toFixed(2)}</td>
                          <td className="p-2 text-right text-rose-700 font-semibold">{balance.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            {isClient ? (
                              <span className="p-0.5 px-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[7.5px] uppercase whitespace-nowrap">
                                CLIENT END
                              </span>
                            ) : (
                              <span className={`p-0.5 px-1.5 rounded font-bold text-[7.5px] uppercase whitespace-nowrap ${
                                status === 'PAID' 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : status === 'PARTIAL'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-total summary footer line */}
          <div className="border-t-2 border-black pt-3 mt-4 flex items-center justify-between text-[10px] font-bold bg-slate-50 p-2.5 rounded-lg">
            <span>SUM:</span>
            <div className="flex gap-4">
              <span>CHARGES: <span className="font-bold text-slate-900">{grossTranspCharges.toFixed(2)} AED</span></span>
              <span>PAID: <span className="font-bold text-emerald-700">{clearedTranspCash.toFixed(2)} AED</span></span>
              <span>BAL: <span className="font-bold text-rose-750 text-rose-700">{outstandingTranspArrears.toFixed(2)} AED</span></span>
            </div>
          </div>
        </div>

        {/* Table 2: Forklift Operator Card */}
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="flex items-center gap-1 font-sans font-bold text-[11px] text-sky-800 uppercase">
                <User className="w-4 h-4 text-sky-600" /> Forklift Operator Summary Record
              </span>
              <span className="text-[8px] font-mono px-2 bg-sky-100 text-sky-900 font-bold uppercase rounded-full">
                Active Staff Roster Area
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[9px] uppercase border-collapse">
                <thead>
                  <tr className="bg-sky-900/10 text-slate-900 border-b-2 border-black">
                    <th className="p-2">FORKLIFT OPERATOR</th>
                    <th className="p-2 text-center">FL START</th>
                    <th className="p-2 text-center">FL END</th>
                    <th className="p-2 text-center">HOURS</th>
                    <th className="p-2 text-right">CHARGES</th>
                    <th className="p-2 text-right">PAID AMOUNT</th>
                    <th className="p-2 text-right">BALANCE</th>
                    <th className="p-2 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center font-bold text-slate-400 bg-slate-50">
                        No active forklift worker records in filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc, idx) => {
                      const charges = doc.forkliftCharges || 0;
                      const paidAmount = doc.forkliftPaidAmount || 0;
                      const balance = charges - paidAmount;
                      const status = getForkliftStatusLabel(charges, paidAmount);

                      return (
                        <tr key={`${doc.invoiceNo}-fl-${idx}`} className="hover:bg-slate-50">
                          <td className="p-2 max-w-[100px] truncate font-bold text-slate-850" title={doc.forkliftOperator}>
                            {doc.forkliftOperator || 'N/A'}
                          </td>
                          <td className="p-2 text-center text-slate-500 font-medium">{doc.forkliftStartTime || 'N/A'}</td>
                          <td className="p-2 text-center text-slate-500 font-medium">{doc.forkliftEndTime || 'N/A'}</td>
                          <td className="p-2 text-center font-bold text-slate-650">{doc.forkliftHours || 0}</td>
                          <td className="p-2 text-right font-bold text-slate-900">{charges.toFixed(2)}</td>
                          <td className="p-2 text-right text-emerald-700 font-semibold">{paidAmount.toFixed(2)}</td>
                          <td className="p-2 text-right text-rose-700 font-semibold">{balance.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <span className={`p-0.5 px-1.5 rounded font-bold text-[7.5px] uppercase whitespace-nowrap ${
                              status === 'PAID' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : status === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub-total summary forklift footer line */}
          <div className="border-t-2 border-black pt-3 mt-4 flex items-center justify-between text-[10px] font-bold bg-slate-50 p-2.5 rounded-lg">
            <span>SUM:</span>
            <div className="flex gap-4">
              <span>HOURS: <span className="font-bold text-slate-900">{totalForkliftHours.toFixed(1)} Hrs</span></span>
              <span>CHARGES: <span className="font-bold text-slate-900">{grossForkliftCharges.toFixed(2)} AED</span></span>
              <span>PAID: <span className="font-bold text-emerald-700">{clearedForkliftCash.toFixed(2)} AED</span></span>
              <span>BAL: <span className="font-bold text-rose-700">{outstandingForkliftArrears.toFixed(2)} AED</span></span>
            </div>
          </div>
        </div>

      </div>

      {/* Unified Master grid table */}
      <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-900 text-white p-3 border-b-2 border-black flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#f37021]" />
            <span className="font-sans font-bold text-[11px] uppercase tracking-wider">
              LOGISTICS REGISTRY MASTER CENTRAL LEDGER
            </span>
          </div>

          <div className="text-[10px] text-slate-350 font-sans">
            Use horizontal scrolling. The first 4 critical columns are frozen. Left side: Transporter | Right side: Forklift.
          </div>
        </div>

        {/* Master central table container layout with frozen columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] uppercase border-collapse table-fixed min-w-[2150px]">
            <thead>
              <tr className="bg-slate-950 text-white text-[9.5px] font-bold uppercase tracking-wider h-11 border-b-2 border-black">
                {/* Frozen headers */}
                <th className="p-2 text-center w-[110px] sticky left-[0px] z-30 bg-slate-950 border-r border-slate-700 shadow-[2px_0_0_0_rgba(15,23,42,1)]">DELIVERY NOTE NO</th>
                <th className="p-2 text-center w-[90px] sticky left-[110px] z-30 bg-slate-950 border-r border-slate-700">DATE</th>
                <th className="p-2 text-center w-[100px] sticky left-[200px] z-30 bg-slate-950 border-r border-slate-700 text-stone-250">WORK ORDER NO</th>
                <th className="p-2 text-center w-[100px] sticky left-[300px] z-30 bg-slate-950 border-r-2 border-slate-700 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.5)] text-stone-250">LPO NO</th>
                
                {/* Standard scrolling headers - Category 1: Transporter */}
                <th className="p-2 text-center w-[110px] text-yellow-500">DISPATCHED BY</th>
                <th className="p-2 text-center w-[140px] bg-amber-950/20 text-amber-300">DISPATCHED THROUGH</th>
                <th className="p-2 text-center w-[110px] bg-amber-950/20 text-amber-300">AWB NO</th>
                <th className="p-2 text-center w-[100px] bg-amber-950/20 text-amber-100 font-semibold">CHARGES</th>
                <th className="p-2 text-center w-[100px] bg-amber-950/20 text-emerald-400">PAID AMOUNT</th>
                <th className="p-2 text-center w-[100px] bg-amber-950/20 text-rose-400">BALANCE</th>
                <th className="p-2 text-center w-[110px] bg-amber-950/20 text-amber-200">PAYMENT STATUS</th>
                
                {/* Standard scrolling headers - Category 2: Forklift */}
                <th className="p-2 text-center w-[140px] bg-sky-950/20 text-sky-300">FORKLIFT OPERATOR</th>
                <th className="p-2 text-center w-[85px] bg-sky-950/20 text-sky-300">FL START</th>
                <th className="p-2 text-center w-[85px] bg-sky-950/20 text-sky-300">FL END</th>
                <th className="p-2 text-center w-[85px] bg-sky-950/20 text-sky-100 font-semibold">TOTAL HOURS</th>
                <th className="p-2 text-center w-[100px] bg-sky-950/20 text-sky-100 font-semibold">CHARGES</th>
                <th className="p-2 text-center w-[100px] bg-sky-950/20 text-emerald-400">PAID AMOUNT</th>
                <th className="p-2 text-center w-[100px] bg-sky-950/20 text-rose-400">BALANCE</th>
                <th className="p-2 text-center w-[110px] bg-sky-950/20 text-sky-200">PAYMENT STATUS</th>

                {/* Logistics Info and action */}
                <th className="p-2 text-center w-[160px] text-slate-300">DISPATCH LOCATION</th>
                <th className="p-2 text-center w-[80px]">REMOVE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[10px]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={21} className="p-10 text-center font-sans font-bold text-slate-400 bg-neutral-50 h-28 uppercase">
                    ⚠️ No registered ledger logs match your current dual query criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => {
                  const isClient = isTranspClientEnd(doc);
                  
                  const transpCharges = doc.transporterCharges || 0;
                  const transpPaidVal = doc.transporterPaidAmount || 0;
                  const transpBalVal = transpCharges - transpPaidVal;
                  const transpStatusLabel = getTransporterStatusLabel(transpCharges, transpPaidVal);

                  const forkliftCharges = doc.forkliftCharges || 0;
                  const forkliftPaidVal = doc.forkliftPaidAmount || 0;
                  const forkliftBalVal = forkliftCharges - forkliftPaidVal;
                  const forkliftStatusLabel = getForkliftStatusLabel(forkliftCharges, forkliftPaidVal);

                  return (
                    <tr 
                      key={doc.id} 
                      className={`hover:bg-neutral-50 border-b border-slate-200 transition-colors group ${
                        isClient 
                          ? 'bg-emerald-50/20' 
                          : (transpStatusLabel === 'PAID' ? 'bg-emerald-50/10' : transpStatusLabel === 'PARTIAL' ? 'bg-amber-50/10' : 'bg-rose-50/10')
                      }`}
                    >
                      {/* Frozen columns (styled consistent with row background and sticky positioning) */}
                      <td className="p-1.5 text-center font-bold select-all sticky left-[0px] z-20 bg-white group-hover:bg-neutral-100 border-r border-slate-300 shadow-[2px_0_0_0_rgba(15,23,42,0.1)] h-[38px]">
                        <div className="flex flex-col items-center leading-none py-0.5 justify-center w-full">
                          <span className="font-semibold text-[#f37021]">{doc.invoiceNo || doc.id}</span>
                          {doc.source && (
                            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-sm border uppercase leading-none mt-1 scale-95 ${
                              doc.source === 'inbound'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {doc.source === 'inbound' ? '▼ INCOMING' : '▲ OUTGOING'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-1.5 text-center sticky left-[110px] z-20 bg-white group-hover:bg-neutral-100 border-r border-slate-300 font-medium">
                        <input
                          type="text"
                          value={doc.dated}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'dated', e.target.value)}
                          className="w-full bg-transparent hover:bg-neutral-100 focus:bg-white text-center font-mono py-0.5 rounded outline-none"
                        />
                      </td>
                      <td className="p-1.5 text-center sticky left-[200px] z-20 bg-white group-hover:bg-neutral-100 border-r border-slate-300 font-medium text-slate-700">
                        <input
                          type="text"
                          value={doc.workOrderNo}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'workOrderNo', e.target.value)}
                          className="w-full bg-transparent hover:bg-neutral-100 focus:bg-white text-center font-mono py-0.5 rounded outline-none"
                        />
                      </td>
                      <td className="p-1.5 text-center sticky left-[300px] z-20 bg-white group-hover:bg-neutral-100 border-r-2 border-slate-300 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.1)] font-medium text-slate-700">
                        <input
                          type="text"
                          value={doc.lpoNo}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'lpoNo', e.target.value)}
                          className="w-full bg-transparent hover:bg-neutral-100 focus:bg-white text-center font-mono py-0.5 rounded outline-none"
                        />
                      </td>

                      {/* Scrolling cells - Category 1: Transporter */}
                      <td className="p-1.5 text-center">
                        <input
                          type="text"
                          value={doc.dispatchedBy || ''}
                          placeholder="DISPATCH DESK"
                          onChange={(e) => handleUpdateRecordField(doc.id, 'dispatchedBy', e.target.value.toUpperCase())}
                          className="w-full bg-transparent hover:bg-white text-center text-slate-600 focus:bg-white py-0.5 rounded outline-none"
                        />
                      </td>
                      <td className="p-1.5 font-bold hover:bg-amber-50">
                        <input
                          type="text"
                          value={doc.despatchThrough || ''}
                          placeholder="CARRIER"
                          onChange={(e) => handleUpdateRecordField(doc.id, 'despatchThrough', e.target.value.toUpperCase())}
                          className="w-full bg-transparent hover:bg-white font-semibold focus:bg-white py-0.5 px-1 rounded outline-none text-slate-900"
                        />
                      </td>
                      <td className="p-1.5 text-center hover:bg-amber-50">
                        <input
                          type="text"
                          value={doc.awbNo || ''}
                          placeholder="AWB REF"
                          onChange={(e) => handleUpdateRecordField(doc.id, 'awbNo', e.target.value.toUpperCase())}
                          className="w-full bg-transparent hover:bg-white text-center font-mono text-[9px] focus:bg-white py-0.5 rounded outline-none"
                        />
                      </td>
                      <td className="p-1.5 text-right font-bold hover:bg-amber-50 pr-3">
                        <input
                          type="number"
                          value={doc.transporterCharges !== undefined ? doc.transporterCharges : 0}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'transporterCharges', Number(e.target.value) || 0)}
                          className={`w-full bg-transparent hover:bg-white text-right focus:bg-white py-0.5 px-1 rounded outline-none font-bold text-slate-950 ${
                            isClient ? 'text-emerald-700 font-semibold' : ''
                          }`}
                        />
                      </td>
                      <td className="p-1.5 text-right font-bold hover:bg-amber-50 pr-3">
                        <input
                          type="number"
                          value={doc.transporterPaidAmount !== undefined ? doc.transporterPaidAmount : 0}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'transporterPaidAmount', Number(e.target.value) || 0)}
                          className="w-full bg-transparent hover:bg-white text-right focus:bg-white py-0.5 px-1 rounded outline-none font-bold text-emerald-800"
                        />
                      </td>
                      <td className={`p-1.5 text-right font-semibold pr-3 bg-slate-50/50 ${transpBalVal > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                        {transpBalVal.toFixed(2)}
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleTransporterPaymentStatus(doc.id)}
                          className={`w-full p-1 border font-bold text-center text-[8.5px] rounded transition-all select-none uppercase cursor-pointer ${
                            isClient 
                              ? 'border-emerald-600 text-emerald-800 bg-emerald-100 font-semibold' 
                              : transpStatusLabel === 'PAID'
                              ? 'border-l-[4px] border-l-emerald-600 border-neutral-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                              : transpStatusLabel === 'PARTIAL'
                              ? 'border-l-[4px] border-l-amber-500 border-neutral-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                              : 'border-l-[4px] border-l-red-600 border-neutral-300 text-red-700 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          {isClient ? 'CLIENT END' : transpStatusLabel}
                        </button>
                      </td>

                      {/* Scrolling cells - Category 2: Forklift */}
                      <td className="p-1.5 hover:bg-sky-50 font-bold">
                        <input
                          type="text"
                          value={doc.forkliftOperator || ''}
                          placeholder="OPERATOR"
                          onChange={(e) => handleUpdateRecordField(doc.id, 'forkliftOperator', e.target.value.toUpperCase())}
                          className="w-full bg-transparent hover:bg-white focus:bg-white font-semibold py-0.5 px-1 rounded outline-none text-slate-800"
                        />
                      </td>
                      <td className="p-1.5 text-center hover:bg-sky-50">
                        <input
                          type="text"
                          value={doc.forkliftStartTime || ''}
                          placeholder="HH:MM"
                          onChange={(e) => handleUpdateRecordField(doc.id, 'forkliftStartTime', e.target.value.toUpperCase())}
                          className="w-full bg-transparent hover:bg-white text-center font-medium focus:bg-white py-0.5 rounded outline-none"
                        />
                      </td>
                      <td className="p-1.5 text-center hover:bg-sky-50">
                        <input
                          type="text"
                          value={doc.forkliftEndTime || ''}
                          placeholder="HH:MM"
                          onChange={(e) => handleUpdateRecordField(doc.id, 'forkliftEndTime', e.target.value.toUpperCase())}
                          className="w-full bg-transparent hover:bg-white text-center font-medium focus:bg-white py-0.5 rounded outline-none"
                        />
                      </td>
                      <td className="p-1.5 text-center hover:bg-sky-50 font-bold">
                        <input
                          type="number"
                          step="0.5"
                          value={doc.forkliftHours !== undefined ? doc.forkliftHours : 0}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'forkliftHours', Number(e.target.value) || 0)}
                          className="w-full bg-transparent hover:bg-white text-center focus:bg-white py-0.5 rounded outline-none font-bold"
                        />
                      </td>
                      <td className="p-1.5 text-right font-bold hover:bg-sky-50 pr-3">
                        <input
                          type="number"
                          value={doc.forkliftCharges !== undefined ? doc.forkliftCharges : 0}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'forkliftCharges', Number(e.target.value) || 0)}
                          className="w-full bg-transparent hover:bg-white text-right focus:bg-white py-0.5 px-0.5 rounded outline-none font-bold"
                        />
                      </td>
                      <td className="p-1.5 text-right font-bold hover:bg-sky-50 pr-3">
                        <input
                          type="number"
                          value={doc.forkliftPaidAmount !== undefined ? doc.forkliftPaidAmount : 0}
                          onChange={(e) => handleUpdateRecordField(doc.id, 'forkliftPaidAmount', Number(e.target.value) || 0)}
                          className="w-full bg-transparent hover:bg-white text-right focus:bg-white py-0.5 px-0.5 rounded outline-none font-bold text-emerald-800"
                        />
                      </td>
                      <td className={`p-1.5 text-right font-semibold pr-3 bg-slate-50/50 ${forkliftBalVal > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                        {forkliftBalVal.toFixed(2)}
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleForkliftPaymentStatus(doc.id)}
                          className={`w-full p-1 border font-bold text-center text-[8.5px] rounded transition-all select-none uppercase cursor-pointer ${
                            forkliftStatusLabel === 'PAID'
                              ? 'border-l-[4px] border-l-emerald-600 border-neutral-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                              : forkliftStatusLabel === 'PARTIAL'
                              ? 'border-l-[4px] border-l-amber-500 border-neutral-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
                              : 'border-l-[4px] border-l-red-600 border-neutral-300 text-red-700 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          {forkliftStatusLabel}
                        </button>
                      </td>

                      {/* Route and action */}
                      <td className="p-1.5 text-left text-slate-650 font-medium">
                        <input
                          type="text"
                          value={doc.dispatchLocation || ''}
                          placeholder="DESTINATION"
                          onChange={(e) => handleUpdateRecordField(doc.id, 'dispatchLocation', e.target.value.toUpperCase())}
                          className="w-full bg-transparent hover:bg-white focus:bg-white py-0.5 px-1 rounded outline-none"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTrip(doc.id)}
                          className="p-1 text-rose-600 hover:text-white hover:bg-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
