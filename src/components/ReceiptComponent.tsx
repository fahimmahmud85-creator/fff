import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Receipt, Plus, Database, Trash2, Check, Printer, User, Users, Coins, FileText, Save, Search, Filter, RefreshCw, Eye, X, ChevronDown,
  FilePlus, ArrowLeftCircle, ArrowRightCircle, PauseCircle, ShieldCheck, XCircle, History, Building2, Landmark
} from 'lucide-react';
import { printHtml } from './PrintHelper';
import { getCompanyProfile, CompanyProfile } from '../utils/companyProfile';
import { EditCompanyModal } from './EditCompanyModal';

export interface ReceiptVoucher {
  id: string;
  voucherNo: string;
  dated: string;
  clientName: string;
  amountReceived: number;
  paymentMode: 'CASH' | 'CHEQUE' | 'BANK TRANSFER';
  chequeNoDetails: string;
  bankName: string;
  cashBankAccount?: string; // Company Own Bank / Cash Ledger Account (e.g. RAKBANK, CASH, EMIRATES NBD)
  chequeBankName?: string; // Customer / Payee Drawee Cheque Bank Name (e.g. DIB, ADCB, FAB)
  narration: string;
  invoiceAllocated: string;
  clientAddress?: string;
  clientBankAccount?: string; // Customer / Supplier Bank Account No or IBAN for Cheque
  receivedAgainstPo?: string;
  receivedAgainstInvoice?: string;
  advance?: number;
  balance?: number;
  chequeDate?: string;
  bankAddress?: string;
  accountCategory?: 'RECEIVABLES' | 'PAYABLES';
  targetCustomerId?: string;
  autoPostToLedger?: boolean;
}

interface ReceiptComponentProps {
  receiptRegisters: ReceiptVoucher[];
  setReceiptRegisters: (registers: ReceiptVoucher[]) => void;
  activeReceiptId: string;
  setActiveReceiptId: (id: string) => void;
  clientDatabase: string[];
  triggerToast: (msg: string) => void;
  setActiveTab: (tab: string) => void;
  initialCategory?: 'RECEIVABLES' | 'PAYABLES';
}

export function incrementVoucherNo(vNo: string, step: number = 1): string {
  if (!vNo) return step > 0 ? '01' : '01';
  const regex = /(\d+)(?!.*\d)/;
  const match = vNo.match(regex);
  if (!match) return vNo + (step > 0 ? '1' : '');
  
  const originalDigits = match[1];
  const numVal = parseInt(originalDigits, 10) + step;
  const targetLen = originalDigits.length;
  const newDigits = String(Math.max(0, numVal)).padStart(targetLen, '0');
  
  return vNo.replace(regex, newDigits);
}

export const ReceiptComponent: React.FC<ReceiptComponentProps> = ({
  receiptRegisters,
  setReceiptRegisters,
  activeReceiptId,
  setActiveReceiptId,
  clientDatabase,
  triggerToast,
  setActiveTab,
  initialCategory,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [showClientListDrawer, setShowClientListDrawer] = useState(false);
  const [clientDrawerSearch, setClientDrawerSearch] = useState('');
  const lastAutoSelectedClientRef = useRef<string>('');
  const [reloadCounter, setReloadCounter] = useState(0);
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptVoucher | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(getCompanyProfile);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setCompanyProfile(getCompanyProfile());
    };
    window.addEventListener('company_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('company_profile_updated', handleProfileUpdate);
  }, []);

  // Helper to calculate real-time client outstanding balance in AED
  const getClientOutstandingBalance = (clientNameRaw: string, isSupplier: boolean): number => {
    if (!clientNameRaw) return 0;
    const cleanTarget = cleanClientName(clientNameRaw).toUpperCase().trim();
    if (!cleanTarget) return 0;

    let totalBal = 0;

    const norm = (str: string) => (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const normTarget = norm(cleanTarget);

    const matchesName = (candidateName: string) => {
      if (!candidateName) return false;
      const cClean = cleanClientName(candidateName);
      const cNorm = norm(cClean);
      return cNorm === normTarget || (cNorm.length > 3 && (cNorm.includes(normTarget) || normTarget.includes(cNorm)));
    };

    if (isSupplier) {
      // 1. Raw Payables
      try {
        const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
        if (savedPay) {
          const manual = JSON.parse(savedPay);
          if (Array.isArray(manual)) {
            manual.forEach((p: any) => {
              if (matchesName(p.supplierName)) {
                const tc = Number(p.totalContractValue) || 0;
                const ap = Number(p.amountPaid) || 0;
                totalBal += (tc - ap);
              }
            });
          }
        }
      } catch (e) {}

      // 2. Incoming DO Materials
      try {
        const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        if (savedDOs) {
          const dos = JSON.parse(savedDOs);
          if (Array.isArray(dos)) {
            dos.forEach((d: any) => {
              if (matchesName(d.supplierName)) {
                const tc = parseFloat(d.invoiceAmounts) || 0;
                const ap = parseFloat(d.invoicePaid) || 0;
                totalBal += (tc - ap);
              }
            });
          }
        }
      } catch (e) {}

      // 3. Supplier Purchases
      try {
        const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
        if (savedPurchases) {
          const purList = JSON.parse(savedPurchases);
          if (Array.isArray(purList)) {
            purList.forEach((pur: any) => {
              if (matchesName(pur.supplierName)) {
                const tc = Number(pur.totalAmount || pur.subtotal || 0);
                const ap = Number(pur.amountPaid || pur.paidAmount || 0);
                totalBal += (tc - ap);
              }
            });
          }
        }
      } catch (e) {}
    } else {
      // Customer Receivables
      // 1. Saved Tax Invoices
      try {
        const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
        if (savedDocsStr) {
          const docs = JSON.parse(savedDocsStr);
          if (Array.isArray(docs)) {
            docs.forEach((doc: any) => {
              const party = doc.clientName || doc.buyerName || doc.partyName;
              if (matchesName(party)) {
                const tc = Number(doc.grandTotal || doc.totalInvoiceValue || 0);
                const ap = Number(doc.amountReceived || doc.receivedAmount || 0);
                totalBal += (tc - ap);
              }
            });
          }
        }
      } catch (e) {}

      // 2. Outgoing Receivables
      try {
        const outgoingStr = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
        if (outgoingStr) {
          const recs = JSON.parse(outgoingStr);
          if (Array.isArray(recs)) {
            recs.forEach((rec: any) => {
              const party = rec.buyerName || rec.clientName;
              if (matchesName(party)) {
                const tc = Number(rec.totalInvoiceValue || 0);
                const ap = Number(rec.amountReceived || 0);
                totalBal += (tc - ap);
              }
            });
          }
        }
      } catch (e) {}
    }

    // Deduct payments already posted in receiptRegisters
    if (Array.isArray(receiptRegisters)) {
      receiptRegisters.forEach(r => {
        if (matchesName(r.clientName)) {
          const amt = Number(r.amountReceived) || 0;
          totalBal -= amt;
        }
      });
    }

    // 3. SOA Custom Transactions
    try {
      const savedSoaStr = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
      if (savedSoaStr) {
        const soaTxs = JSON.parse(savedSoaStr);
        Object.keys(soaTxs).forEach(code => {
          let codeClean = code;
          if (code.startsWith('supp-')) {
            codeClean = code.substring(5).replace(/-/g, ' ').toUpperCase();
          } else if (code.startsWith('cust-')) {
            codeClean = code.substring(5).replace(/-/g, ' ').toUpperCase();
          }
          if (matchesName(codeClean)) {
            const txs = soaTxs[code];
            if (Array.isArray(txs)) {
              txs.forEach((tx: any) => {
                const amt = Number(tx.amount || 0);
                const paid = Number(tx.amountPaid || 0);
                totalBal += (amt - paid);
              });
            }
          }
        });
      }
    } catch (e) {}

    return Math.max(0, parseFloat(totalBal.toFixed(2)));
  };

  // Main draft voucher state
  const [voucher, setVoucher] = useState<ReceiptVoucher>(() => {
    if (activeReceiptId) {
      const found = receiptRegisters.find(r => r.id === activeReceiptId);
      if (found) return { ...found };
    }
    return {
      id: 'rc-' + Date.now(),
      voucherNo: '1292',
      dated: new Date().toISOString().substring(0, 10),
      clientName: '',
      clientAddress: 'AJMAN, UAE',
      clientBankAccount: '',
      amountReceived: 0,
      paymentMode: 'CHEQUE',
      chequeNoDetails: '',
      cashBankAccount: 'RAK BANK',
      chequeBankName: 'RAKBANK',
      bankName: 'RAKBANK',
      bankAddress: 'KING FAISAL STREET, SHARJAH, UNITED ARAB EMIRATES',
      narration: '',
      invoiceAllocated: '',
      receivedAgainstPo: '',
      receivedAgainstInvoice: '',
      advance: 0,
      balance: 0,
      chequeDate: new Date().toISOString().substring(0, 10)
    };
  });

  // Track last activeReceiptId loaded to prevent overwriting user's local edits
  const lastLoadedIdRef = useRef<string | null>(null);

  // Sync active selection to draft
  const activeReceipt = useMemo(() => {
    if (!activeReceiptId) return null;
    return receiptRegisters.find(r => r.id === activeReceiptId) || null;
  }, [activeReceiptId, receiptRegisters]);

  const [accountCategory, setAccountCategory] = useState<'RECEIVABLES' | 'PAYABLES'>(initialCategory || 'RECEIVABLES');

  useEffect(() => {
    if (initialCategory) {
      setAccountCategory(initialCategory);
    }
  }, [initialCategory]);

  // Autocomplete search states for Payer Account Name
  const [isPayerSearching, setIsPayerSearching] = useState<boolean>(false);
  const payerSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (payerSearchRef.current && !payerSearchRef.current.contains(e.target as Node)) {
        setIsPayerSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeReceipt) {
      if (lastLoadedIdRef.current !== activeReceipt.id) {
        lastLoadedIdRef.current = activeReceipt.id;
        setVoucher({ ...activeReceipt });
        setAccountCategory(activeReceipt.accountCategory || 'RECEIVABLES');
        setIsEditing(false);
      }
    } else if (!activeReceiptId && lastLoadedIdRef.current !== 'NEW') {
      lastLoadedIdRef.current = 'NEW';
      setVoucher({
        id: 'rc-' + Date.now(),
        voucherNo: getNewVoucherNo(accountCategory, 'CHEQUE', receiptRegisters),
        dated: new Date().toISOString().substring(0, 10),
        clientName: '',
        clientAddress: 'AJMAN, UAE',
        clientBankAccount: '',
        amountReceived: 0,
        paymentMode: 'CHEQUE',
        chequeNoDetails: '',
        bankName: 'RAK BANK',
        bankAddress: 'KING FAISAL STREET, SHARJAH, UNITED ARAB EMIRATES',
        narration: '',
        invoiceAllocated: '',
        receivedAgainstPo: '',
        receivedAgainstInvoice: '',
        advance: 0,
        balance: 0,
        chequeDate: new Date().toISOString().substring(0, 10)
      });
      setIsEditing(true);
    }
  }, [activeReceiptId, activeReceipt]);

  useEffect(() => {
    const handleStorage = () => {
      setReloadCounter(prev => prev + 1);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Automatically generate dynamic unique voucher number when activeReceiptId, category, date (year), paymentMode, or registers change for draft
  useEffect(() => {
    const isDraft = !activeReceiptId || !receiptRegisters.some(r => r.id === activeReceiptId);
    if (isDraft) {
      const nextNo = getNewVoucherNo(accountCategory, voucher.paymentMode, receiptRegisters, voucher.dated);
      if (voucher.voucherNo !== nextNo) {
        setVoucher(prev => ({ ...prev, voucherNo: nextNo }));
      }
    }
  }, [activeReceiptId, accountCategory, voucher.dated, voucher.paymentMode, receiptRegisters]);

  // Load registered clients from database AND existing invoices/documents
  const clientsList = useMemo(() => {
    const listMap = new Map<string, { id: string; name: string; address: string; isSupplier: boolean }>();

    // 1. Initial/Registered Customers from default registry
    const saved = localStorage.getItem('MF_REGISTERED_CUSTOMERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            const name = (c.name || c.companyName || '').trim().toUpperCase();
            if (name) {
              listMap.set(name, {
                id: c.id || `reg-${name}`,
                name,
                address: (c.address || 'AJMAN, UAE').trim().toUpperCase(),
                isSupplier: c.id?.startsWith('supp-') || name.includes('SUPPLIER') || !!c.isSupplier
              });
            }
          });
        }
      } catch (e) {}
    }

    // 1.5. Official ERP Customer & Supplier Registries
    try {
      const savedErpCust = localStorage.getItem('MFI_ERP_CUSTOMERS');
      if (savedErpCust) {
        const parsed = JSON.parse(savedErpCust);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            const name = (c.companyName || c.name || '').trim().toUpperCase();
            if (name) {
              const cleanName = name.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
              listMap.set(cleanName, {
                id: c.id || `erp-cust-${cleanName}`,
                name: cleanName,
                address: (c.address || 'DUBAI, UAE').trim().toUpperCase(),
                isSupplier: false
              });
            }
          });
        }
      }
    } catch (e) {}

    try {
      const savedErpSupp = localStorage.getItem('MFI_ERP_SUPPLIERS');
      if (savedErpSupp) {
        const parsed = JSON.parse(savedErpSupp);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            const name = (s.companyName || s.name || '').trim().toUpperCase();
            if (name) {
              const cleanName = name.replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
              listMap.set(cleanName, {
                id: s.id || `erp-supp-${cleanName}`,
                name: cleanName,
                address: (s.address || 'SHARJAH, UAE').trim().toUpperCase(),
                isSupplier: true
              });
            }
          });
        }
      }
    } catch (e) {}

    // 2. Fallbacks from system DB
    clientDatabase.forEach((name, idx) => {
      const uName = name.trim().toUpperCase();
      if (!listMap.has(uName)) {
        listMap.set(uName, {
          id: `fallback-${idx}`,
          name: uName,
          address: 'AJMAN, UAE',
          isSupplier: false
        });
      }
    });

    // 3. Extract from MF_SAVED_DOCUMENTS_LIST
    const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (savedDocsStr) {
      try {
        const docs = JSON.parse(savedDocsStr);
        if (Array.isArray(docs)) {
          docs.forEach((doc: any, idx: number) => {
            const name = (doc.buyerName || doc.companyName || doc.clientName || '').trim().toUpperCase();
            const address = (doc.buyerAddress || doc.companyAddress || doc.clientAddress || doc.address || 'AJMAN, UAE').trim().toUpperCase();
            if (name && !listMap.has(name)) {
              listMap.set(name, {
                id: `doc-extracted-${idx}`,
                name,
                address,
                isSupplier: doc.documentType?.toLowerCase().includes('purchase') || doc.isSupplier || false
              });
            }
          });
        }
      } catch (e) {}
    }

    // 4. Extract from MFI_OUTGOING_RECEIVABLES
    const outgoingStr = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
    if (outgoingStr) {
      try {
        const recs = JSON.parse(outgoingStr);
        if (Array.isArray(recs)) {
          recs.forEach((rec: any, idx: number) => {
            const name = (rec.buyerName || rec.clientName || '').trim().toUpperCase();
            if (name && !listMap.has(name)) {
              listMap.set(name, {
                id: `rec-extracted-${idx}`,
                name,
                address: 'AJMAN, UAE',
                isSupplier: false
              });
            }
          });
        }
      } catch (e) {}
    }

    // 4.5. Extract from MFI_RAW_PAYABLES
    const rawPayablesStr = localStorage.getItem('MFI_RAW_PAYABLES');
    if (rawPayablesStr) {
      try {
        const payables = JSON.parse(rawPayablesStr);
        if (Array.isArray(payables)) {
          payables.forEach((p: any, idx: number) => {
            const name = (p.supplierName || '').trim().toUpperCase();
            if (name && !listMap.has(name)) {
              listMap.set(name, {
                id: `raw-pay-extracted-${idx}`,
                name,
                address: 'AJMAN, UAE',
                isSupplier: true
              });
            }
          });
        }
      } catch (e) {}
    }

    // 4.6. Extract from MFI_INCOMING_MATERIALS_LEDGER
    const incomingMaterialsStr = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
    if (incomingMaterialsStr) {
      try {
        const dos = JSON.parse(incomingMaterialsStr);
        if (Array.isArray(dos)) {
          dos.forEach((d: any, idx: number) => {
            const name = (d.supplierName || '').trim().toUpperCase();
            if (name && !listMap.has(name)) {
              listMap.set(name, {
                id: `incoming-mat-extracted-${idx}`,
                name,
                address: 'AJMAN, UAE',
                isSupplier: true
              });
            }
          });
        }
      } catch (e) {}
    }

    // 4.7. Extract from MFI_SUPPLIER_PURCHASES
    const supplierPurchasesStr = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
    if (supplierPurchasesStr) {
      try {
        const purchases = JSON.parse(supplierPurchasesStr);
        if (Array.isArray(purchases)) {
          purchases.forEach((p: any, idx: number) => {
            const name = (p.supplierName || '').trim().toUpperCase();
            if (name && !listMap.has(name)) {
              listMap.set(name, {
                id: `supp-purchases-extracted-${idx}`,
                name,
                address: 'AJMAN, UAE',
                isSupplier: true
              });
            }
          });
        }
      } catch (e) {}
    }

    return Array.from(listMap.values());
  }, [clientDatabase, reloadCounter]);

  // Suggestion type for all documents, invoices, work orders, delivery notes, and clients
  interface SearchSuggestion {
    type: 'client' | 'document';
    id: string;
    name: string;
    clientName: string;
    clientAddress: string;
    documentNo?: string;
    documentType?: string;
    isSupplier: boolean;
    seller?: string;
  }

  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);

  const cleanClientName = (name: string): string => {
    if (!name) return '';
    return name
      .trim()
      .toUpperCase()
      .replace(/^(SUPPLIER|CUSTOMER|SELLER):\s*/i, '')
      .trim();
  };

  const allSearchSuggestions = useMemo(() => {
    const list: SearchSuggestion[] = [];
    const seenKeys = new Set<string>();

    const addSuggestion = (sug: SearchSuggestion) => {
      const uniqueKey = `${sug.type}-${sug.documentNo || ''}-${sug.clientName}-${sug.isSupplier ? 'S' : 'C'}`.toUpperCase();
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        list.push(sug);
      }
    };

    // 1. Registered Customers & Suppliers from clientsList
    clientsList.forEach((cl, index) => {
      const cleanNameStr = cleanClientName(cl.name);
      if (cleanNameStr) {
        addSuggestion({
          type: 'client',
          id: cl.id || `client-${index}-${cl.isSupplier ? 'S' : 'C'}`,
          name: cleanNameStr,
          clientName: cleanNameStr,
          clientAddress: cl.address || 'AJMAN, UAE',
          isSupplier: !!cl.isSupplier
        });
      }
    });

    // 2. Load from MF_SAVED_DOCUMENTS_LIST
    const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
    if (savedDocsStr) {
      try {
        const docs = JSON.parse(savedDocsStr);
        if (Array.isArray(docs)) {
          docs.forEach((doc: any, index: number) => {
            const docNo = (doc.invoiceNo || doc.docNo || doc.id || '').trim().toUpperCase();
            const docType = (doc.documentType || 'TAX INVOICE').trim().toUpperCase();
            const clientName = cleanClientName(doc.buyerName || doc.companyName || doc.clientName);
            const address = (doc.buyerAddress || doc.companyAddress || doc.clientAddress || doc.address || 'AJMAN, UAE').trim().toUpperCase();
            const sellerName = (doc.sellerName || doc.issuerName || '').trim().toUpperCase();
            
            if (clientName) {
              const isSupplier = docType.includes('PURCHASE') || !!doc.isSupplier;
              // Check if docType is strictly an invoice/bill (exclude delivery notes and work orders)
              const isInvoice = docType.includes('INVOICE') || docType.includes('BILL');
              if (docNo && isInvoice) {
                addSuggestion({
                  type: 'document',
                  id: `doc-saved-${index}-${docNo}`,
                  name: `${docNo} [${docType}] (${clientName})`,
                  clientName: clientName,
                  clientAddress: address,
                  documentNo: docNo,
                  documentType: docType,
                  isSupplier: isSupplier,
                  seller: sellerName
                });
              }
              addSuggestion({
                type: 'client',
                id: `client-saved-${index}`,
                name: clientName,
                clientName: clientName,
                clientAddress: address,
                isSupplier: isSupplier
              });
            }
          });
        }
      } catch (e) {}
    }

    // 3. Load from MFI_INCOMING_MATERIALS_LEDGER
    const savedDOsStr = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
    if (savedDOsStr) {
      try {
        const dos = JSON.parse(savedDOsStr);
        if (Array.isArray(dos)) {
          dos.forEach((d: any, index: number) => {
            const clientName = cleanClientName(d.supplierName);
            if (clientName) {
              addSuggestion({
                type: 'client',
                id: `client-do-${index}`,
                name: clientName,
                clientName: clientName,
                clientAddress: 'AJMAN, UAE',
                isSupplier: true
              });
            }
          });
        }
      } catch (e) {}
    }

    // 4. Load from MFI_RAW_PAYABLES
    const savedPayStr = localStorage.getItem('MFI_RAW_PAYABLES');
    if (savedPayStr) {
      try {
        const manual = JSON.parse(savedPayStr);
        if (Array.isArray(manual)) {
          manual.forEach((p: any, index: number) => {
            const docNo = (p.invoiceNo || p.id || '').trim().toUpperCase();
            const clientName = cleanClientName(p.supplierName);
            if (clientName) {
              if (docNo) {
                addSuggestion({
                  type: 'document',
                  id: `doc-pay-${index}-${docNo}`,
                  name: `${docNo} [SUPPLIER BILL] (${clientName})`,
                  clientName: clientName,
                  clientAddress: 'AJMAN, UAE',
                  documentNo: docNo,
                  documentType: 'SUPPLIER BILL',
                  isSupplier: true
                });
              }
              addSuggestion({
                type: 'client',
                id: `client-pay-${index}`,
                name: clientName,
                clientName: clientName,
                clientAddress: 'AJMAN, UAE',
                isSupplier: true
              });
            }
          });
        }
      } catch (e) {}
    }

    // 5. Load from MFI_SUPPLIER_PURCHASES
    const savedPurchasesStr = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
    if (savedPurchasesStr) {
      try {
        const purchases = JSON.parse(savedPurchasesStr);
        if (Array.isArray(purchases)) {
          purchases.forEach((pur: any, index: number) => {
            const docNo = (pur.invoiceNo || pur.id || '').trim().toUpperCase();
            const clientName = cleanClientName(pur.supplierName);
            if (clientName) {
              if (docNo) {
                addSuggestion({
                  type: 'document',
                  id: `doc-pur-${index}-${docNo}`,
                  name: `${docNo} [PURCHASE ORDER] (${clientName})`,
                  clientName: clientName,
                  clientAddress: 'AJMAN, UAE',
                  documentNo: docNo,
                  documentType: 'PURCHASE ORDER',
                  isSupplier: true
                });
              }
              addSuggestion({
                type: 'client',
                id: `client-pur-${index}`,
                name: clientName,
                clientName: clientName,
                clientAddress: 'AJMAN, UAE',
                isSupplier: true
              });
            }
          });
        }
      } catch (e) {}
    }

    // 6. Load from MFI_OUTGOING_RECEIVABLES
    const outgoingStr = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
    if (outgoingStr) {
      try {
        const recs = JSON.parse(outgoingStr);
        if (Array.isArray(recs)) {
          recs.forEach((rec: any, index: number) => {
            const docNo = (rec.invoiceNo || '').trim().toUpperCase();
            const clientName = cleanClientName(rec.buyerName);
            if (clientName) {
              if (docNo) {
                addSuggestion({
                  type: 'document',
                  id: `doc-rec-${index}-${docNo}`,
                  name: `${docNo} [OUTGOING INVOICE] (${clientName})`,
                  clientName: clientName,
                  clientAddress: 'AJMAN, UAE',
                  documentNo: docNo,
                  documentType: 'OUTGOING INVOICE',
                  isSupplier: false
                });
              }
              addSuggestion({
                type: 'client',
                id: `client-rec-${index}`,
                name: clientName,
                clientName: clientName,
                clientAddress: 'AJMAN, UAE',
                isSupplier: false
              });
            }
          });
        }
      } catch (e) {}
    }

    // 7. Load from MF_CREDIT_NOTES
    const savedCreditStr = localStorage.getItem('MF_CREDIT_NOTES');
    if (savedCreditStr) {
      try {
        const creditNotes = JSON.parse(savedCreditStr);
        if (Array.isArray(creditNotes)) {
          creditNotes.forEach((cn: any, index: number) => {
            const cnNo = (cn.creditNoteNo || cn.id || '').trim().toUpperCase();
            const clientName = cleanClientName(cn.partyName || cn.clientName);
            const address = (cn.partyAddress || 'AJMAN, UAE').trim().toUpperCase();
            if (clientName && cnNo) {
              addSuggestion({
                type: 'document',
                id: `doc-credit-${index}-${cnNo}`,
                name: `${cnNo} [CREDIT NOTE] (${clientName})`,
                clientName: clientName,
                clientAddress: address,
                documentNo: cnNo,
                documentType: 'CREDIT NOTE',
                isSupplier: false
              });
              addSuggestion({
                type: 'client',
                id: `client-credit-${index}`,
                name: clientName,
                clientName: clientName,
                clientAddress: address,
                isSupplier: false
              });
            }
          });
        }
      } catch (e) {}
    }

    // 8. Load from MFI_DISPATCHED_MATERIALS_LEDGER (Dispatch Notes / GDNs)
    const savedDispatchStr = localStorage.getItem('MFI_DISPATCHED_MATERIALS_LEDGER');
    if (savedDispatchStr) {
      try {
        const dispatchNotes = JSON.parse(savedDispatchStr);
        if (Array.isArray(dispatchNotes)) {
          dispatchNotes.forEach((dn: any, index: number) => {
            const clientName = cleanClientName(dn.supplierName || dn.clientName);
            const address = (dn.supplierAddress || 'AJMAN, UAE').trim().toUpperCase();
            if (clientName) {
              addSuggestion({
                type: 'client',
                id: `client-dispatch-${index}`,
                name: clientName,
                clientName: clientName,
                clientAddress: address,
                isSupplier: false
              });
            }
          });
        }
      } catch (e) {}
    }

    return list;
  }, [clientsList]);

  const customerAccountSuggestions = useMemo(() => {
    const rawTerm = (voucher.clientName || '').trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER|SELLER):\s*/i, '');
    
    // Check if rawTerm is an exact match for a client name
    const exactClientMatch = allSearchSuggestions.some(s => s.type === 'client' && s.clientName.trim().toUpperCase() === rawTerm);

    // If no search term OR exact match is selected, present all client accounts sorted with active category first
    if (!rawTerm || exactClientMatch) {
      const clientsOnly = allSearchSuggestions.filter(s => s.type === 'client');
      return clientsOnly.sort((a, b) => {
        const aCatMatch = accountCategory === 'PAYABLES' ? a.isSupplier : !a.isSupplier;
        const bCatMatch = accountCategory === 'PAYABLES' ? b.isSupplier : !b.isSupplier;
        if (aCatMatch && !bCatMatch) return -1;
        if (!aCatMatch && bCatMatch) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    // Filter suggestions by typed search phrase
    const filtered = allSearchSuggestions.filter(sug => {
      const docNoMatch = sug.documentNo ? sug.documentNo.toUpperCase().includes(rawTerm) : false;
      const clientNameMatch = sug.clientName.toUpperCase().includes(rawTerm);
      const nameMatch = sug.name.toUpperCase().includes(rawTerm);
      const sellerMatch = sug.seller ? sug.seller.toUpperCase().includes(rawTerm) : false;
      const documentTypeMatch = sug.documentType ? sug.documentType.toUpperCase().includes(rawTerm) : false;
      return docNoMatch || clientNameMatch || nameMatch || sellerMatch || documentTypeMatch;
    });

    if (filtered.length === 0) {
      return allSearchSuggestions.filter(s => s.type === 'client');
    }

    return filtered;
  }, [allSearchSuggestions, voucher.clientName, accountCategory]);

  const filteredSuggestions = customerAccountSuggestions;

  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [filteredSuggestions.length]);

  // Lookup outstanding unpaid invoices for the selected customer/supplier from all systems
  const unpaidInvoices = useMemo(() => {
    if (!voucher.clientName) return [];
    const cleanTargetInput = cleanClientName(voucher.clientName);
    
    // Find the best matched client name from our list
    const matchedClient = clientsList.find(c => {
      const cClean = cleanClientName(c.name);
      return cClean === cleanTargetInput || cClean.includes(cleanTargetInput) || cleanTargetInput.includes(cClean);
    });
    
    const cleanTarget = cleanClientName(matchedClient ? matchedClient.name : cleanTargetInput);
    
    const invoices: Array<{
      invoiceNo: string;
      date: string;
      totalValue: number;
      amountPaid: number;
      balance: number;
      source: string;
    }> = [];

    const seenInvoiceNos = new Set<string>();

    if (accountCategory === 'PAYABLES') {
      // 1. Check manual supplier bills from MFI_RAW_PAYABLES
      try {
        const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
        const manual = savedPay ? JSON.parse(savedPay) : [];
        if (Array.isArray(manual)) {
          manual.forEach((p: any) => {
            if (p.supplierName) {
              const pName = cleanClientName(p.supplierName);
              if (pName === cleanTarget || pName.includes(cleanTarget) || cleanTarget.includes(pName)) {
                const tc = Number(p.totalContractValue) || 0;
                const ap = Number(p.amountPaid) || 0;
                const bal = tc - ap;
                const invNo = p.invoiceNo || p.id;
                if (bal > 0.1 && !seenInvoiceNos.has(invNo)) {
                  seenInvoiceNos.add(invNo);
                  invoices.push({
                    invoiceNo: invNo,
                    date: p.invoiceDate || p.date || '',
                    totalValue: tc,
                    amountPaid: ap,
                    balance: parseFloat(bal.toFixed(2)),
                    source: 'manual_payables'
                  });
                }
              }
            }
          });
        }
      } catch (e) {}

      // 2. Check DO bills from MFI_INCOMING_MATERIALS_LEDGER
      try {
        const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        const dos = savedDOs ? JSON.parse(savedDOs) : [];
        if (Array.isArray(dos)) {
          dos.forEach((d: any) => {
            if (d.supplierName) {
              const dName = cleanClientName(d.supplierName);
              if (dName === cleanTarget || dName.includes(cleanTarget) || cleanTarget.includes(dName)) {
                const tc = parseFloat(d.invoiceAmounts) || 0;
                const ap = parseFloat(d.invoicePaid) || 0;
                const bal = tc - ap;
                const invNo = d.invoiceNo || `GRN-${d.doNo || d.id}`;
                if (bal > 0.1 && !seenInvoiceNos.has(invNo)) {
                  seenInvoiceNos.add(invNo);
                  invoices.push({
                    invoiceNo: invNo,
                    date: d.invoiceDate || d.date || '',
                    totalValue: tc,
                    amountPaid: ap,
                    balance: parseFloat(bal.toFixed(2)),
                    source: 'incoming_materials'
                  });
                }
              }
            }
          });
        }
      } catch (e) {}

      // 3. Check Purchases from MFI_SUPPLIER_PURCHASES
      try {
        const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
        const purchasesList = savedPurchases ? JSON.parse(savedPurchases) : [];
        if (Array.isArray(purchasesList)) {
          purchasesList.forEach((pur: any) => {
            if (pur.supplierName) {
              const purName = cleanClientName(pur.supplierName);
              if (purName === cleanTarget || purName.includes(cleanTarget) || cleanTarget.includes(purName)) {
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
                const bal = tc - ap;
                const invNo = pur.invoiceNo || `PUR-${pur.id}`;
                if (bal > 0.1 && !seenInvoiceNos.has(invNo)) {
                  seenInvoiceNos.add(invNo);
                  invoices.push({
                    invoiceNo: invNo,
                    date: pur.invoiceDate || pur.date || '',
                    totalValue: tc,
                    amountPaid: ap,
                    balance: parseFloat(bal.toFixed(2)),
                    source: 'supplier_purchases'
                  });
                }
              }
            }
          });
        }
      } catch (e) {}

      // 4. Custom supplier transactions inside MFI_SOA_CUSTOMER_TRANSACTIONS starting with 'supp-'
      try {
        const savedSoaTxsStr = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
        if (savedSoaTxsStr) {
          const soaTxs = JSON.parse(savedSoaTxsStr);
          Object.keys(soaTxs).forEach(code => {
            if (code.startsWith('supp-')) {
              const codeClean = cleanClientName(code.substring(5).replace(/-/g, ' '));
              if (codeClean === cleanTarget || codeClean.includes(cleanTarget) || cleanTarget.includes(codeClean)) {
                const txs = soaTxs[code];
                if (Array.isArray(txs)) {
                  txs.forEach((tx: any) => {
                    if (tx.invoiceRef && tx.invoiceRef !== '—') {
                      const totalVal = Number(tx.amount || tx.debit || 0);
                      const amtPaid = Number(tx.amountPaid || 0);
                      const bal = totalVal - amtPaid;
                      if (bal > 0.1 && !seenInvoiceNos.has(tx.invoiceRef)) {
                        seenInvoiceNos.add(tx.invoiceRef);
                        invoices.push({
                          invoiceNo: tx.invoiceRef,
                          date: tx.date || '',
                          totalValue: totalVal,
                          amountPaid: amtPaid,
                          balance: parseFloat(bal.toFixed(2)),
                          source: 'soa_txs'
                        });
                      }
                    }
                  });
                }
              }
            }
          });
        }
      } catch (e) {}

    } else {
      // 1. Check generated invoices in MF_SAVED_DOCUMENTS_LIST
      const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (savedDocsStr) {
        try {
          const docs = JSON.parse(savedDocsStr);
          if (Array.isArray(docs)) {
            docs.forEach((doc: any) => {
              // Only show Tax Invoices (e.g. TAX INVOICE or TAX INVOICE & DELIVERY NOTE), not Work Orders, standalone Delivery Notes, etc.
              const docType = (doc.documentType || 'TAX INVOICE').toUpperCase();
              if (docType !== 'TAX INVOICE' && docType !== 'TAX INVOICE & DELIVERY NOTE') {
                return;
              }

              const docBuyer = cleanClientName(doc.buyerName || doc.companyName || '');
              if (doc.invoiceNo && (docBuyer === cleanTarget || docBuyer.includes(cleanTarget) || cleanTarget.includes(docBuyer))) {
                let totalVal = Number(doc.grandTotal || doc.totalInvoiceValue || 0);
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
                const amtPaid = Number(doc.amountReceived || doc.receivedAmount || 0);
                const bal = totalVal - amtPaid;
                if (bal > 0.1 && !seenInvoiceNos.has(doc.invoiceNo)) {
                  seenInvoiceNos.add(doc.invoiceNo);
                  invoices.push({
                    invoiceNo: doc.invoiceNo,
                    date: doc.dated || doc.date || '',
                    totalValue: totalVal,
                    amountPaid: amtPaid,
                    balance: parseFloat(bal.toFixed(2)),
                    source: 'saved_docs'
                  });
                }
              }
            });
          }
        } catch (e) {}
      }

      // 2. Check manual receivables in MFI_OUTGOING_RECEIVABLES
      const outgoingStr = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
      if (outgoingStr) {
        try {
          const recs = JSON.parse(outgoingStr);
          if (Array.isArray(recs)) {
            recs.forEach((rec: any) => {
              const recBuyer = cleanClientName(rec.buyerName || '');
              if (rec.invoiceNo && (recBuyer === cleanTarget || recBuyer.includes(cleanTarget) || cleanTarget.includes(recBuyer))) {
                const totalVal = Number(rec.totalInvoiceValue || 0);
                const amtPaid = Number(rec.amountReceived || 0);
                const bal = totalVal - amtPaid;
                if (bal > 0.1 && !seenInvoiceNos.has(rec.invoiceNo)) {
                  seenInvoiceNos.add(rec.invoiceNo);
                  invoices.push({
                    invoiceNo: rec.invoiceNo,
                    date: rec.dated || rec.date || '',
                    totalValue: totalVal,
                    amountPaid: amtPaid,
                    balance: parseFloat(bal.toFixed(2)),
                    source: 'outgoing_receivables'
                  });
                }
              }
            });
          }
        } catch (e) {}
      }

      // 3. Check custom transactions inside MFI_SOA_CUSTOMER_TRANSACTIONS
      const savedSoaTxsStr = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
      if (savedSoaTxsStr) {
        try {
          const soaTxs = JSON.parse(savedSoaTxsStr);
          Object.keys(soaTxs).forEach(code => {
            const codeClean = cleanClientName(code.startsWith('supp-') ? code.substring(5).replace(/-/g, ' ') : code.replace(/-/g, ' '));
            if (codeClean === cleanTarget || codeClean.includes(cleanTarget) || cleanTarget.includes(codeClean)) {
              const txs = soaTxs[code];
              if (Array.isArray(txs)) {
                txs.forEach((tx: any) => {
                  if (tx.invoiceRef && tx.invoiceRef !== '—') {
                    const totalVal = Number(tx.amount || 0);
                    const amtPaid = Number(tx.amountPaid || 0);
                    const bal = totalVal - amtPaid;
                    if (bal > 0.1 && !seenInvoiceNos.has(tx.invoiceRef)) {
                      seenInvoiceNos.add(tx.invoiceRef);
                      invoices.push({
                        invoiceNo: tx.invoiceRef,
                        date: tx.date || '',
                        totalValue: totalVal,
                        amountPaid: amtPaid,
                        balance: parseFloat(bal.toFixed(2)),
                        source: 'soa_txs'
                      });
                    }
                  }
                });
              }
            }
          });
        } catch (e) {}
      }

      // 4. Check Credit Notes in MF_CREDIT_NOTES
      const savedCreditStr = localStorage.getItem('MF_CREDIT_NOTES');
      if (savedCreditStr) {
        try {
          const creditNotes = JSON.parse(savedCreditStr);
          if (Array.isArray(creditNotes)) {
            creditNotes.forEach((cn: any) => {
              const cnBuyer = cleanClientName(cn.partyName || cn.clientName || '');
              const cnNo = cn.creditNoteNo || cn.id;
              if (cnNo && (cnBuyer === cleanTarget || cnBuyer.includes(cleanTarget) || cleanTarget.includes(cnBuyer))) {
                const totalVal = Number(cn.grandTotal || cn.total || 0);
                const amtPaid = Number(cn.amountAdjusted || cn.adjustedAmount || 0);
                const bal = totalVal - amtPaid;
                if (bal > 0.1 && !seenInvoiceNos.has(cnNo)) {
                  seenInvoiceNos.add(cnNo);
                  invoices.push({
                    invoiceNo: cnNo,
                    date: cn.dated || cn.date || '',
                    totalValue: totalVal,
                    amountPaid: amtPaid,
                    balance: parseFloat(bal.toFixed(2)),
                    source: 'credit_notes'
                  });
                }
              }
            });
          }
        } catch (e) {}
      }

      // 5. Check Dispatch Notes in MFI_DISPATCHED_MATERIALS_LEDGER has been removed to only show Tax Invoices, omitting Delivery Notes.
    }

    return invoices;
  }, [voucher.clientName, clientsList, accountCategory, reloadCounter]);

  // Fetch outstanding balance of any single custom or list invoice
  const getInvoiceBalance = (invNo: string): number => {
    if (!invNo) return 0;
    const matchedUnpaid = unpaidInvoices.find(i => i.invoiceNo === invNo);
    if (matchedUnpaid) return matchedUnpaid.balance;

    if (accountCategory === 'PAYABLES') {
      const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
      if (savedPay) {
        try {
          const manual = JSON.parse(savedPay);
          if (Array.isArray(manual)) {
            const found = manual.find(p => (p.invoiceNo || p.id) === invNo);
            if (found) {
              return Math.max(0, (Number(found.totalContractValue) || 0) - (Number(found.amountPaid) || 0));
            }
          }
        } catch (e) {}
      }
      const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
      if (savedDOs) {
        try {
          const dos = JSON.parse(savedDOs);
          if (Array.isArray(dos)) {
            const found = dos.find(d => (d.invoiceNo || `GRN-${d.doNo || d.id}`) === invNo);
            if (found) {
              return Math.max(0, (parseFloat(found.invoiceAmounts) || 0) - (parseFloat(found.invoicePaid) || 0));
            }
          }
        } catch (e) {}
      }
      const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
      if (savedPurchases) {
        try {
          const purchases = JSON.parse(savedPurchases);
          if (Array.isArray(purchases)) {
            const found = purchases.find(pur => (pur.invoiceNo || `PUR-${pur.id}`) === invNo);
            if (found) {
              const tc = Number(found.totalAmount || found.subtotal || 0);
              let ap = 0;
              if (found.amountPaid !== undefined) {
                ap = Number(found.amountPaid);
              } else if (found.paidAmount !== undefined) {
                ap = Number(found.paidAmount);
              } else if (found.paymentStatus === 'Paid') {
                ap = tc;
              } else if (found.paymentStatus === 'Partial' || found.paymentStatus === 'Partially Paid') {
                ap = tc / 2;
              }
              return Math.max(0, tc - ap);
            }
          }
        } catch (e) {}
      }
    } else {
      const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
      if (savedDocsStr) {
        try {
          const docs = JSON.parse(savedDocsStr);
          if (Array.isArray(docs)) {
            const doc = docs.find(d => d.invoiceNo === invNo);
            if (doc) {
              const totalVal = Number(doc.grandTotal || doc.totalInvoiceValue || 0);
              const currentPaid = Number(doc.amountReceived || doc.receivedAmount || 0);
              return Math.max(0, totalVal - currentPaid);
            }
          }
        } catch (e) {}
      }
    }
    return 0;
  };

  const cleanAndDeduplicateInvoices = (str: string): string => {
    const parts = str.split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    return Array.from(new Set(parts)).join(', ');
  };

  const formatNarration = (
    invoices: string[],
    clientName: string,
    category: 'RECEIVABLES' | 'PAYABLES'
  ): string => {
    const narrationPrefix = category === 'PAYABLES' ? 'PAYMENT' : 'SETTLEMENT';
    const partyLabel = category === 'PAYABLES' ? 'SUPPLIER' : 'CUSTOMER';
    const cleanClient = clientName || partyLabel;

    const cleanNos = (invoices || [])
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    if (cleanNos.length === 0) {
      return `BEING ${narrationPrefix} OF INVOICE DUES FOR ${cleanClient}`;
    }

    if (cleanNos.length === 1) {
      return `BEING ${narrationPrefix} OF INVOICE #${cleanNos[0]} FOR ${cleanClient}`;
    }

    return `BEING ${narrationPrefix} OF MULTIPLE INVOICES (#${cleanNos.join(', #')}) FOR ${cleanClient}`;
  };

  const getChequeDateLabel = (mode: string): string => {
    if (mode === 'CASH') return 'Date';
    if (mode === 'BANK TRANSFER') return 'TT Date';
    return 'Cheque Date';
  };

  const getChequeNoLabel = (mode: string): string => {
    if (mode === 'CASH') return 'Reference';
    if (mode === 'BANK TRANSFER') return 'TT Reference';
    return 'Cheque No';
  };

  const isInvoiceSelected = (invoiceNo: string): boolean => {
    const selectedNos = (voucher.receivedAgainstInvoice || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    return selectedNos.includes(invoiceNo.toUpperCase());
  };

  const toggleInvoiceSelection = (invoiceNo: string) => {
    const selectedNos = (voucher.receivedAgainstInvoice || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    
    let newSelected: string[];
    if (selectedNos.includes(invoiceNo.toUpperCase())) {
      newSelected = selectedNos.filter(no => no !== invoiceNo.toUpperCase());
    } else {
      newSelected = [...selectedNos, invoiceNo.toUpperCase()];
    }
    
    // Enforce uniqueness to prevent duplicate values
    newSelected = Array.from(new Set(newSelected));
    
    const newTotal = unpaidInvoices
      .filter(inv => newSelected.includes(inv.invoiceNo.toUpperCase()))
      .reduce((sum, inv) => sum + inv.balance, 0);
    
    setVoucher(prev => ({
      ...prev,
      receivedAgainstInvoice: newSelected.join(', '),
      invoiceAllocated: newSelected.join(', '),
      amountReceived: parseFloat(newTotal.toFixed(2)),
      narration: formatNarration(newSelected, prev.clientName, accountCategory)
    }));
    setIsEditing(true);
  };

  const selectedInvoicesTotal = useMemo(() => {
    const selectedNos: string[] = Array.from(new Set(
      (voucher.receivedAgainstInvoice || '')
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean)
    ));
    
    let sum = 0;
    selectedNos.forEach(no => {
      sum += getInvoiceBalance(no);
    });
    return sum;
  }, [voucher.receivedAgainstInvoice, unpaidInvoices]);

  // Atomic helper to cleanly select customer/supplier and allocate pending dues
  const handleSelectCustomerAccount = (
    targetClientName: string,
    isSupplierOverride?: boolean,
    specificDocNo?: string,
    specificDocType?: string
  ) => {
    const rawClean = targetClientName.trim().toUpperCase();
    if (!rawClean) return;

    const matched = clientsList.find(c => cleanClientName(c.name) === cleanClientName(rawClean)) ||
                    clientsList.find(c => cleanClientName(c.name).includes(cleanClientName(rawClean)));
    const finalClientName = matched ? matched.name : rawClean;
    const isSupp = isSupplierOverride !== undefined
      ? isSupplierOverride
      : (matched ? matched.isSupplier : accountCategory === 'PAYABLES');

    const nextCat = isSupp ? 'PAYABLES' : 'RECEIVABLES';

    let nextVNo = voucher.voucherNo;
    if (nextCat !== accountCategory) {
      setAccountCategory(nextCat);
      nextVNo = getNewVoucherNo(nextCat, voucher.paymentMode, receiptRegisters);
    }

    const narrationPrefix = nextCat === 'PAYABLES' ? 'PAYMENT' : 'SETTLEMENT';
    const partyLabel = nextCat === 'PAYABLES' ? 'SUPPLIER' : 'CUSTOMER';

    let invAlloc = '';
    let amtRec = 0;
    let narr = '';

    if (specificDocNo) {
      lastAutoSelectedClientRef.current = `${finalClientName.trim().toUpperCase()}_${nextCat}`;
      invAlloc = specificDocNo.toUpperCase();
      const bal = getInvoiceBalance(specificDocNo);
      amtRec = bal > 0 ? bal : (unpaidInvoices.find(i => i.invoiceNo === specificDocNo)?.balance || 0);
      narr = `BEING ${narrationPrefix} OF ${specificDocType || 'DOCUMENT'} #${specificDocNo} FOR ${finalClientName}`;
    } else {
      lastAutoSelectedClientRef.current = '';
      invAlloc = '';
      amtRec = 0;
      narr = `BEING ${narrationPrefix} OF INVOICE DUES FOR ${finalClientName}`;
    }

    setVoucher(prev => ({
      ...prev,
      clientName: finalClientName,
      clientAddress: matched?.address || prev.clientAddress || 'AJMAN, UAE',
      voucherNo: nextVNo,
      receivedAgainstInvoice: invAlloc,
      invoiceAllocated: invAlloc,
      amountReceived: amtRec,
      narration: narr
    }));

    setIsEditing(true);
    setIsPayerSearching(false);
  };

  // Automatically select ALL pending invoices directly in table when a customer/supplier is selected
  useEffect(() => {
    if (voucher.clientName && voucher.clientName.trim().length > 2) {
      const cleanKey = `${voucher.clientName.trim().toUpperCase()}_${accountCategory}`;

      if (cleanKey !== lastAutoSelectedClientRef.current) {
        lastAutoSelectedClientRef.current = cleanKey;

        if (unpaidInvoices.length > 0) {
          const allInvNos = unpaidInvoices.map(i => i.invoiceNo);
          const totalPending = unpaidInvoices.reduce((sum, inv) => sum + inv.balance, 0);

          setVoucher(prev => ({
            ...prev,
            receivedAgainstInvoice: allInvNos.join(', '),
            invoiceAllocated: allInvNos.join(', '),
            amountReceived: parseFloat(totalPending.toFixed(2)),
            narration: formatNarration(allInvNos, prev.clientName, accountCategory)
          }));
        } else {
          setVoucher(prev => ({
            ...prev,
            receivedAgainstInvoice: '',
            invoiceAllocated: '',
            amountReceived: 0,
            narration: formatNarration([], prev.clientName, accountCategory)
          }));
        }
      }
    } else {
      lastAutoSelectedClientRef.current = '';
    }
  }, [voucher.clientName, unpaidInvoices, accountCategory]);

  // Dynamically calculate and set balance & advance whenever amountReceived or selectedInvoicesTotal changes
  useEffect(() => {
    if (selectedInvoicesTotal > 0) {
      const amtRec = Number(voucher.amountReceived || 0);
      if (amtRec < selectedInvoicesTotal) {
        const calculatedBalance = parseFloat((selectedInvoicesTotal - amtRec).toFixed(2));
        if (voucher.balance !== calculatedBalance || voucher.advance !== 0) {
          setVoucher(prev => ({
            ...prev,
            balance: calculatedBalance,
            advance: 0
          }));
        }
      } else {
        const calculatedAdvance = parseFloat((amtRec - selectedInvoicesTotal).toFixed(2));
        if (voucher.balance !== 0 || voucher.advance !== calculatedAdvance) {
          setVoucher(prev => ({
            ...prev,
            balance: 0,
            advance: calculatedAdvance
          }));
        }
      }
    }
  }, [voucher.amountReceived, selectedInvoicesTotal]);

  // AED Number to words helper
  const numberToWordsDirhams = (num: number): string => {
    if (num === 0) return 'ZERO DIRHAMS ONLY';
    
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const scales = ['', 'THOUSAND', 'MILLION', 'BILLION'];

    const convertLessThanThousand = (n: number): string => {
      let str = '';
      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + ' HUNDRED ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += ones[n] + ' ';
      }
      return str.trim();
    };

    const parts = num.toFixed(2).split('.');
    const integerPart = parseInt(parts[0]);
    const decimalPart = parseInt(parts[1]);

    let integerWords = '';
    if (integerPart === 0) {
      integerWords = 'ZERO';
    } else {
      let temp = integerPart;
      let scaleIdx = 0;
      while (temp > 0) {
        const chunk = temp % 1000;
        if (chunk > 0) {
          integerWords = convertLessThanThousand(chunk) + ' ' + scales[scaleIdx] + ' ' + integerWords;
        }
        temp = Math.floor(temp / 1000);
        scaleIdx++;
      }
    }

    let decimalWords = '';
    if (decimalPart > 0) {
      decimalWords = ' AND ' + convertLessThanThousand(decimalPart) + ' FILS';
    }

    return `${integerWords.trim()}${decimalWords} AED ONLY`.toUpperCase().replace(/\s+/g, ' ');
  };

  // Generate unique voucher number based on category, payment mode and year
  const getNewVoucherNo = (
    category: 'RECEIVABLES' | 'PAYABLES',
    paymentMode: 'CASH' | 'CHEQUE' | 'BANK TRANSFER' = 'CHEQUE',
    registers: ReceiptVoucher[] = [],
    targetDate?: string
  ) => {
    const listToUse = registers && registers.length > 0 ? registers : receiptRegisters;
    let prefix = 'RV';
    if (category === 'RECEIVABLES') {
      if (paymentMode === 'CASH') prefix = 'CRV';
      else if (paymentMode === 'BANK TRANSFER') prefix = 'BRV';
      else prefix = 'RV';
    } else {
      if (paymentMode === 'CASH') prefix = 'CPV';
      else if (paymentMode === 'BANK TRANSFER') prefix = 'BPV';
      else prefix = 'PV';
    }

    const dateObj = targetDate ? new Date(targetDate) : new Date();
    const yearVal = isNaN(dateObj.getTime()) ? new Date().getFullYear() : dateObj.getFullYear();
    const currentYear = yearVal.toString().substring(2); // e.g. "26" or "25"
    const fullYear = yearVal.toString(); // e.g. "2026"
    
    const numbers = listToUse
      .filter(r => {
        const cat = r.accountCategory || 'RECEIVABLES';
        if (cat !== category) return false;
        const vNoUpper = String(r.voucherNo || '').trim().toUpperCase();
        return (
          vNoUpper.startsWith(`${prefix}-${currentYear}-`) ||
          vNoUpper.startsWith(`${prefix}-${fullYear}-`) ||
          vNoUpper.includes(`${prefix}-${currentYear}`) ||
          vNoUpper.includes(`${prefix}-${fullYear}`)
        );
      })
      .map(r => {
        // Extract all digit sequences in the voucher number
        const matches = r.voucherNo.match(/\d+/g);
        if (matches && matches.length > 0) {
          // The last group of digits is usually the serial number
          const lastMatch = matches[matches.length - 1];
          // Ensure it's not just the 2-digit year (e.g. "26") if there are other digits
          if (matches.length > 1 && lastMatch.length === 2 && matches[matches.length - 2].length > 2) {
            return parseInt(matches[matches.length - 2], 10);
          }
          return parseInt(lastMatch, 10);
        }
        return null;
      })
      .filter((n): n is number => n !== null && !isNaN(n));
      
    let nextSeq = 1293;
    if (numbers.length > 0) {
      nextSeq = Math.max(...numbers) + 1;
    }
    return `${prefix}-${currentYear}-${nextSeq}`;
  };

  // Handle create new / clear state
  const handleInitNewVoucher = () => {
    const nextNo = getNewVoucherNo(accountCategory, 'CHEQUE', receiptRegisters);
    const nextId = 'rc-' + Date.now();
    lastLoadedIdRef.current = 'NEW';
    setVoucher({
      id: nextId,
      voucherNo: nextNo,
      dated: new Date().toISOString().substring(0, 10),
      clientName: '',
      clientAddress: 'AJMAN, UAE',
      clientBankAccount: '',
      amountReceived: 0,
      paymentMode: 'CHEQUE',
      chequeNoDetails: '',
      cashBankAccount: 'RAK BANK',
      chequeBankName: '',
      bankName: '',
      bankAddress: 'KING FAISAL STREET, SHARJAH, UNITED ARAB EMIRATES',
      narration: '',
      invoiceAllocated: '',
      receivedAgainstPo: '',
      receivedAgainstInvoice: '',
      advance: 0,
      balance: 0,
      chequeDate: new Date().toISOString().substring(0, 10)
    });
    setActiveReceiptId('');
    setIsEditing(true);
  };

  // Save or update receipt handler
  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucher.clientName) {
      alert('Please specify Payer client name.');
      return;
    }
    if (voucher.amountReceived <= 0) {
      alert('Please specify amount received greater than zero.');
      return;
    }

    const existingIndex = receiptRegisters.findIndex(r => r.id === voucher.id);
    let updatedList = [...receiptRegisters];

    const finalVoucher: ReceiptVoucher = {
      ...voucher,
      cashBankAccount: voucher.cashBankAccount || 'RAK BANK',
      chequeBankName: voucher.chequeBankName || voucher.bankName || '',
      bankName: voucher.chequeBankName || voucher.bankName || '',
      accountCategory
    };

    if (existingIndex > -1) {
      updatedList[existingIndex] = finalVoucher;
      triggerToast(`Receipt Voucher No. ${voucher.voucherNo} updated successfully!`);
      setReceiptRegisters(updatedList);
      lastLoadedIdRef.current = finalVoucher.id;
      setActiveReceiptId(finalVoucher.id);
      setIsEditing(false);
    } else {
      updatedList = [finalVoucher, ...receiptRegisters];
      triggerToast(`Receipt Voucher No. ${finalVoucher.voucherNo} saved successfully!`);
      setReceiptRegisters(updatedList);

      // Automatically advance to the next blank form with the next voucher number!
      const nextNo = getNewVoucherNo(accountCategory, 'CHEQUE', updatedList);

      const nextId = 'rc-' + Date.now();
      lastLoadedIdRef.current = nextId;
      setVoucher({
        id: nextId,
        voucherNo: nextNo,
        dated: new Date().toISOString().substring(0, 10),
        clientName: '',
        clientAddress: 'AJMAN, UAE',
        clientBankAccount: '',
        amountReceived: 0,
        paymentMode: 'CHEQUE',
        chequeNoDetails: '',
        cashBankAccount: 'RAK BANK',
        chequeBankName: '',
        bankName: '',
        bankAddress: 'KING FAISAL STREET, SHARJAH, UNITED ARAB EMIRATES',
        narration: '',
        invoiceAllocated: '',
        receivedAgainstPo: '',
        receivedAgainstInvoice: '',
        advance: 0,
        balance: 0,
        chequeDate: new Date().toISOString().substring(0, 10)
      });
      setActiveReceiptId(nextId);
      setIsEditing(true);
    }

    // AUTOMATIC LEDGER & RECEIVABLES SYNCHRONIZER
    const rawInvoiceNo = finalVoucher.receivedAgainstInvoice || finalVoucher.invoiceAllocated;
    const amtPaid = Number(finalVoucher.amountReceived || 0);

    if (amtPaid > 0) {
      const cleanClient = finalVoucher.clientName.trim().toUpperCase().replace(/^(SUPPLIER|CUSTOMER):\s*/i, '');
      let invoiceNos = (rawInvoiceNo || '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== '—');

      if (invoiceNos.length === 0 && unpaidInvoices.length > 0) {
        invoiceNos = unpaidInvoices.map(u => u.invoiceNo);
      }

      if (invoiceNos.length > 0) {
        // Distribute amtPaid sequentially across the selected invoices
        let remainingPayment = amtPaid;
        const allocations: { [key: string]: number } = {};

        invoiceNos.forEach(invNo => {
          const bal = getInvoiceBalance(invNo);
          if (bal > 0) {
            const alloc = Math.min(remainingPayment, bal);
            allocations[invNo] = alloc;
            remainingPayment -= alloc;
          } else {
            allocations[invNo] = 0;
          }
        });

        // Distribute leftover to the first invoice if any remains
        if (remainingPayment > 0 && invoiceNos.length > 0) {
          allocations[invoiceNos[0]] = (allocations[invoiceNos[0]] || 0) + remainingPayment;
        }

      if (accountCategory === 'PAYABLES') {
        // --- UPDATE SUPPLIER SYSTEMS ---

        // 1. Update manual supplier bills from MFI_RAW_PAYABLES
        const savedPay = localStorage.getItem('MFI_RAW_PAYABLES');
        if (savedPay) {
          try {
            const manual = JSON.parse(savedPay);
            if (Array.isArray(manual)) {
              let updatedAny = false;
              const updatedManual = manual.map((p: any) => {
                const invNo = p.invoiceNo || p.id;
                if (invoiceNos.includes(invNo)) {
                  if (p.supplierName && p.supplierName.toUpperCase().trim() === cleanClient) {
                    const allocAmt = allocations[invNo] || 0;
                    if (allocAmt > 0) {
                      const currentPaid = Number(p.amountPaid || 0);
                      const newPaid = currentPaid + allocAmt;
                      updatedAny = true;
                      return {
                        ...p,
                        amountPaid: newPaid,
                        paymentStatus: newPaid >= Number(p.totalContractValue || 0) ? 'Paid' : 'Partial'
                      };
                    }
                  }
                }
                return p;
              });
              if (updatedAny) {
                localStorage.setItem('MFI_RAW_PAYABLES', JSON.stringify(updatedManual));
              }
            }
          } catch (err) {}
        }

        // 2. Update DO bills from MFI_INCOMING_MATERIALS_LEDGER
        const savedDOs = localStorage.getItem('MFI_INCOMING_MATERIALS_LEDGER');
        if (savedDOs) {
          try {
            const dos = JSON.parse(savedDOs);
            if (Array.isArray(dos)) {
              let updatedAny = false;
              const updatedDOs = dos.map((d: any) => {
                const invNo = d.invoiceNo || `GRN-${d.doNo || d.id}`;
                if (invoiceNos.includes(invNo)) {
                  if (d.supplierName && d.supplierName.toUpperCase().trim() === cleanClient) {
                    const allocAmt = allocations[invNo] || 0;
                    if (allocAmt > 0) {
                      const currentPaid = parseFloat(d.invoicePaid) || 0;
                      const newPaid = currentPaid + allocAmt;
                      updatedAny = true;
                      return {
                        ...d,
                        invoicePaid: newPaid,
                        paymentStatus: newPaid >= parseFloat(d.invoiceAmounts || 0) ? 'PAID' : 'PARTIAL'
                      };
                    }
                  }
                }
                return d;
              });
              if (updatedAny) {
                localStorage.setItem('MFI_INCOMING_MATERIALS_LEDGER', JSON.stringify(updatedDOs));
              }
            }
          } catch (err) {}
        }

        // 3. Update Purchases from MFI_SUPPLIER_PURCHASES
        const savedPurchases = localStorage.getItem('MFI_SUPPLIER_PURCHASES');
        if (savedPurchases) {
          try {
            const purchasesList = JSON.parse(savedPurchases);
            if (Array.isArray(purchasesList)) {
              let updatedAny = false;
              const updatedPurchases = purchasesList.map((pur: any) => {
                const invNo = pur.invoiceNo || `PUR-${pur.id}`;
                if (invoiceNos.includes(invNo)) {
                  if (pur.supplierName && pur.supplierName.toUpperCase().trim() === cleanClient) {
                    const allocAmt = allocations[invNo] || 0;
                    if (allocAmt > 0) {
                      const currentPaid = Number(pur.amountPaid || pur.paidAmount || 0);
                      const newPaid = currentPaid + allocAmt;
                      const totalVal = Number(pur.totalAmount || pur.subtotal || 0);
                      updatedAny = true;
                      return {
                        ...pur,
                        amountPaid: newPaid,
                        paidAmount: newPaid,
                        paymentStatus: newPaid >= totalVal ? 'Paid' : 'Partial'
                      };
                    }
                  }
                }
                return pur;
              });
              if (updatedAny) {
                localStorage.setItem('MFI_SUPPLIER_PURCHASES', JSON.stringify(updatedPurchases));
              }
            }
          } catch (err) {}
        }

        // 4. Update Supplier SOA custom transactions in MFI_SOA_CUSTOMER_TRANSACTIONS starting with 'supp-'
        const savedSoaStr = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
        if (savedSoaStr) {
          try {
            const soaTxs = JSON.parse(savedSoaStr);
            let updatedAny = false;
            Object.keys(soaTxs).forEach(code => {
              if (code.startsWith('supp-')) {
                const codeClean = code.substring(5).replace(/-/g, ' ').toUpperCase();
                if (codeClean === cleanClient || cleanClient.includes(codeClean) || codeClean.includes(cleanClient)) {
                  const txs = soaTxs[code];
                  if (Array.isArray(txs)) {
                    soaTxs[code] = txs.map((tx: any) => {
                      if (invoiceNos.includes(tx.invoiceRef)) {
                        const allocAmt = allocations[tx.invoiceRef] || 0;
                        if (allocAmt > 0) {
                          const currentPaid = Number(tx.amountPaid || 0);
                          const newPaid = currentPaid + allocAmt;
                          updatedAny = true;
                          return {
                            ...tx,
                            amountPaid: newPaid,
                            datePaid: finalVoucher.dated,
                            receiptNo: 'PV-' + finalVoucher.voucherNo,
                            paymentMode: finalVoucher.paymentMode
                          };
                        }
                      }
                      return tx;
                    });
                  }
                }
              }
            });
            if (updatedAny) {
              localStorage.setItem('MFI_SOA_CUSTOMER_TRANSACTIONS', JSON.stringify(soaTxs));
            }
          } catch (err) {}
        }

        triggerToast(`Posted & auto-updated Supplier Invoices [${invoiceNos.join(', ')}] across payables lists & supplier ledgers!`);

      } else {
        // 1. Update Tax Invoices database (MF_SAVED_DOCUMENTS_LIST)
        const savedDocsStr = localStorage.getItem('MF_SAVED_DOCUMENTS_LIST');
        if (savedDocsStr) {
          try {
            const docs = JSON.parse(savedDocsStr);
            if (Array.isArray(docs)) {
              let updatedAny = false;
              const updatedDocs = docs.map((doc: any) => {
                if (invoiceNos.includes(doc.invoiceNo)) {
                  const allocAmt = allocations[doc.invoiceNo] || 0;
                  if (allocAmt > 0) {
                    const currentPaid = Number(doc.amountReceived || doc.receivedAmount || 0);
                    const newPaid = currentPaid + allocAmt;
                    updatedAny = true;
                    return {
                      ...doc,
                      amountReceived: newPaid,
                      receivedAmount: newPaid,
                      paymentStatus: newPaid >= Number(doc.grandTotal || doc.totalInvoiceValue || 0) ? 'PAID' : 'PARTIAL'
                    };
                  }
                }
                return doc;
              });
              if (updatedAny) {
                localStorage.setItem('MF_SAVED_DOCUMENTS_LIST', JSON.stringify(updatedDocs));
              }
            }
          } catch (err) {}
        }

        // 2. Update Manual Receivables (MFI_OUTGOING_RECEIVABLES)
        const outgoingStr = localStorage.getItem('MFI_OUTGOING_RECEIVABLES');
        if (outgoingStr) {
          try {
            const recs = JSON.parse(outgoingStr);
            if (Array.isArray(recs)) {
              let updatedAny = false;
              const updatedRecs = recs.map((rec: any) => {
                if (invoiceNos.includes(rec.invoiceNo)) {
                  const allocAmt = allocations[rec.invoiceNo] || 0;
                  if (allocAmt > 0) {
                    const currentPaid = Number(rec.amountReceived || 0);
                    const newPaid = currentPaid + allocAmt;
                    const totalVal = Number(rec.totalInvoiceValue || 0);
                    updatedAny = true;
                    return {
                      ...rec,
                      amountReceived: newPaid,
                      status: newPaid >= totalVal ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : 'UNPAID')
                    };
                  }
                }
                return rec;
              });
              if (updatedAny) {
                localStorage.setItem('MFI_OUTGOING_RECEIVABLES', JSON.stringify(updatedRecs));
              }
            }
          } catch (err) {}
        }

        // 3. Update SOA custom transactions (MFI_SOA_CUSTOMER_TRANSACTIONS)
        const savedSoaStr = localStorage.getItem('MFI_SOA_CUSTOMER_TRANSACTIONS');
        if (savedSoaStr) {
          try {
            const soaTxs = JSON.parse(savedSoaStr);
            let updatedAny = false;
            Object.keys(soaTxs).forEach(code => {
              const txs = soaTxs[code];
              if (Array.isArray(txs)) {
                soaTxs[code] = txs.map((tx: any) => {
                  if (invoiceNos.includes(tx.invoiceRef)) {
                    const allocAmt = allocations[tx.invoiceRef] || 0;
                    if (allocAmt > 0) {
                      const currentPaid = Number(tx.amountPaid || 0);
                      const newPaid = currentPaid + allocAmt;
                      updatedAny = true;
                      return {
                        ...tx,
                        amountPaid: newPaid,
                        datePaid: finalVoucher.dated,
                        receiptNo: 'RV-' + finalVoucher.voucherNo,
                        paymentMode: finalVoucher.paymentMode
                      };
                    }
                  }
                  return tx;
                });
              }
            });
            if (updatedAny) {
              localStorage.setItem('MFI_SOA_CUSTOMER_TRANSACTIONS', JSON.stringify(soaTxs));
            }
          } catch (err) {}
        }

        triggerToast(`Posted & auto-updated Invoices [${invoiceNos.join(', ')}] across SOA ledgers & Outstanding Receivables!`);
      }
    }
    }

    setReloadCounter(prev => prev + 1);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('mfi_soa_select_customer'));
    window.dispatchEvent(new Event('mf_receipt_vouchers_updated'));
    window.dispatchEvent(new Event('mfi_saved_documents_updated'));
  };

  // Remove receipt handler
  const handleDeleteReceipt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you absolutely sure you want to delete this Receipt Voucher? This action is irreversible.')) {
      return;
    }
    const updatedList = receiptRegisters.filter(r => r.id !== id);
    setReceiptRegisters(updatedList);
    localStorage.setItem('MF_RECEIPT_VOUCHERS', JSON.stringify(updatedList));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('mf_receipt_vouchers_updated'));
    triggerToast('Receipt Voucher successfully discarded.');
    
    if (activeReceiptId === id && updatedList.length > 0) {
      setActiveReceiptId(updatedList[0].id);
    } else if (updatedList.length === 0) {
      handleInitNewVoucher();
    }
  };

  const generateVoucherHtml = (rcToPrint: ReceiptVoucher | null): string => {
    if (!rcToPrint) return '';
    const words = numberToWordsDirhams(rcToPrint.amountReceived);
    const isPayment = rcToPrint.accountCategory === 'PAYABLES';

    const title = `${isPayment ? 'Payment' : 'Receipt'} Voucher - ${rcToPrint.voucherNo}`;

    const cashBankAcc = rcToPrint.paymentMode === 'CASH'
      ? 'CASH IN HAND ACCOUNT'
      : (rcToPrint.bankName ? `${rcToPrint.bankName.toUpperCase()} ACCOUNT` : 'BANK ACCOUNT');
    const partyAcc = rcToPrint.clientName ? rcToPrint.clientName.toUpperCase() : (isPayment ? 'SUPPLIER / PAYEE' : 'CUSTOMER / PAYER');

    const isCash = rcToPrint.paymentMode === 'CASH';
    const isCheque = rcToPrint.paymentMode === 'CHEQUE';
    const isWire = String(rcToPrint.paymentMode).includes('TRANSFER') || String(rcToPrint.paymentMode).includes('WIRE');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4 portrait; margin: 0 !important; }
            * { box-sizing: border-box; }
            html, body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 6mm 5mm 8mm 5mm !important;
              color: #0f172a;
              font-size: 10px;
              background-color: #ffffff !important;
              background: #ffffff !important;
              width: 100%;
            }
            .voucher-card {
              border: 2px solid #0f172a;
              border-radius: 4px;
              background-color: #ffffff !important;
              padding: 0;
              margin: 0 auto;
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
              overflow: hidden;
            }
            .header-banner {
              background-color: #ffffff;
              color: #000000;
              padding: 10px 14px;
              border-bottom: 2px solid #0f172a;
            }
            .header-banner h1 {
              margin: 0;
              font-size: 15px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              color: #000000;
            }
            .header-banner p {
              margin: 2px 0 0 0;
              font-size: 9px;
              color: #475569;
            }
            .voucher-title-strip {
              background-color: #f8fafc;
              border-bottom: 1px solid #cbd5e1;
              padding: 6px 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .voucher-no-tag {
              font-size: 12px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
            }
            .voucher-no-tag span {
              color: #be123c;
              font-family: monospace;
              border-bottom: 1px solid #be123c;
              padding-bottom: 1px;
            }
            .payment-badges {
              display: flex;
              gap: 8px;
            }
            .badge-item {
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 2px 8px;
              border-radius: 12px;
              border: 1px solid #0f172a;
              color: #0f172a;
              background: #ffffff;
            }
            .badge-item.active {
              background-color: #0f172a;
              color: #ffffff;
            }
            .info-grid {
              display: grid;
              grid-template-cols: repeat(4, 1fr);
              gap: 0;
              border-bottom: 1px solid #cbd5e1;
              background-color: #ffffff;
            }
            .info-box {
              padding: 6px 10px;
              border-right: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
              background-color: #ffffff;
            }
            .info-box:nth-child(4n) {
              border-right: none;
            }
            .info-label {
              font-size: 8px;
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
              display: block;
            }
            .info-value {
              font-size: 10px;
              font-weight: bold;
              color: #0f172a;
              margin-top: 2px;
            }
            .num-box-container {
              border: 1px dashed #0f172a;
              padding: 6px 12px;
              text-align: center;
              background-color: #f8fafc;
              margin: 8px 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .num-title {
              font-size: 9px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
            }
            .num-val {
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
              font-family: monospace;
              border: 1.5px solid #0f172a;
              padding: 3px 12px;
              background-color: #ffffff;
            }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 0;
              table-layout: auto;
              background-color: #ffffff;
            }
            .ledger-table th {
              background-color: #f1f5f9;
              color: #334155;
              font-size: 8.5px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 6px 8px;
              border-top: 1px solid #cbd5e1;
              border-bottom: 2px solid #cbd5e1;
              border-right: 1px solid #cbd5e1;
            }
            .ledger-table th:last-child {
              border-right: none;
            }
            .ledger-table td {
              padding: 6px 8px;
              border-bottom: 1px solid #e2e8f0;
              border-right: 1px solid #e2e8f0;
              font-size: 9.5px;
              background-color: #ffffff;
            }
            .ledger-table td:last-child {
              border-right: none;
            }
            .amount-col {
              text-align: right;
              font-family: monospace;
              font-weight: bold;
            }
            .dr-tag {
              background-color: #dbeafe;
              color: #1e40af;
              padding: 1px 4px;
              border-radius: 2px;
              font-size: 8px;
              font-weight: bold;
              font-family: monospace;
            }
            .cr-tag {
              background-color: #ffe4e6;
              color: #be123c;
              padding: 1px 4px;
              border-radius: 2px;
              font-size: 8px;
              font-weight: bold;
              font-family: monospace;
            }
            .summary-row td {
              border-top: 2px solid #0f172a;
              border-bottom: 2px solid #0f172a;
              background-color: #f8fafc;
              font-weight: bold;
            }
            .narration-box {
              padding: 8px 14px;
              background-color: #ffffff;
              border-bottom: 1px solid #cbd5e1;
              font-size: 9.5px;
            }
            .narration-label {
              font-weight: bold;
              color: #475569;
              text-transform: uppercase;
              font-size: 8.5px;
            }
            .footer-signatures {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 24px 16px 12px 16px;
              background-color: #ffffff !important;
              width: 100%;
              box-sizing: border-box;
            }
            .sig-col {
              flex: 1;
              text-align: center;
              padding: 0 5px;
            }
            .sig-line {
              border-top: 1px solid #0f172a;
              padding-top: 4px;
              font-size: 8.5px;
              font-weight: bold;
              color: #0f172a;
              text-transform: uppercase;
            }
            .stamp-box {
              border: 1px dashed #94a3b8;
              height: 90px;
              margin-bottom: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          <div class="voucher-card">
            
            <!-- HEADER BANNER -->
            <div class="header-banner">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  ${companyProfile.showLogo ? `
                    <div style="flex-shrink: 0; display: flex; align-items: center;">
                      <img src="${companyProfile.logoUrl || '/logo.png'}" style="max-height: 48px; max-width: 160px; object-fit: contain;" onerror="this.onerror=null; this.style.display='none';" />
                    </div>
                  ` : ''}
                  <div>
                    <h1>${companyProfile.name}</h1>
                    <p>${companyProfile.address} | TRN: ${companyProfile.trn} | Phone: ${companyProfile.phone} | Email: ${companyProfile.email}</p>
                  </div>
                </div>
                <div style="text-align: right; font-family: monospace; font-size: 9.5px; color: #0f172a; font-weight: bold; background: #f8fafc; padding: 5px 12px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  FINANCIAL ${isPayment ? 'PAYMENT' : 'RECEIPT'} VOUCHER
                </div>
              </div>
            </div>

            <!-- TITLE STRIP: NO. AND PAYMENT BADGES -->
            <div class="voucher-title-strip">
              <div class="voucher-no-tag">
                NO. <span>${rcToPrint.voucherNo || ''}</span>
              </div>
              <div class="payment-badges">
                <span class="badge-item ${isCash ? 'active' : ''}">. CASH</span>
                <span class="badge-item ${isCheque ? 'active' : ''}">. CHEQUE</span>
                <span class="badge-item ${isWire ? 'active' : ''}">. BANK WIRE</span>
              </div>
            </div>

            <!-- MASTER INFO GRID WITH EXACT TEXT LABELS FROM VOUCHER -->
            <div class="info-grid">
              <div class="info-box" style="grid-column: span 2;">
                <span class="info-label">${isPayment ? 'PAYEE:' : 'CLIENT PAYER:'}</span>
                <span class="info-value" style="font-size: 10.5px;">${partyAcc}</span>
              </div>
              <div class="info-box">
                <span class="info-label">DATED:</span>
                <span class="info-value" style="font-family: monospace;">${rcToPrint.dated || ''}</span>
              </div>
              <div class="info-box">
                <span class="info-label">AGAINST PO:</span>
                <span class="info-value">${rcToPrint.receivedAgainstPo || '—'}</span>
              </div>

              <div class="info-box" style="grid-column: span 2;">
                <span class="info-label">${isPayment ? 'PAYEE ADDRESS:' : 'CUSTOMER ADDRESS:'}</span>
                <span class="info-value" style="font-weight: normal; color: #334155;">${rcToPrint.clientAddress || '—'}</span>
              </div>
              <div class="info-box">
                <span class="info-label">INVOICE:</span>
                <span class="info-value">${rcToPrint.receivedAgainstInvoice || '—'}</span>
              </div>
              <div class="info-box">
                <span class="info-label">CHEQUE NO:</span>
                <span class="info-value">${rcToPrint.chequeNoDetails || (isCash ? 'CASH' : '—')}</span>
              </div>

              <div class="info-box">
                <span class="info-label">ADVANCE AED:</span>
                <span class="info-value" style="font-family: monospace;">${(rcToPrint.advance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="info-box">
                <span class="info-label">BALANCE AED:</span>
                <span class="info-value" style="font-family: monospace;">${(rcToPrint.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="info-box">
                <span class="info-label">CHEQUE DATE:</span>
                <span class="info-value" style="font-family: monospace;">${rcToPrint.chequeDate || (isCash ? rcToPrint.dated : '—')}</span>
              </div>
              <div class="info-box">
                <span class="info-label">${isPayment ? 'PAYEE CHEQUE BANK NAME:' : 'CUSTOMER CHEQUE BANK NAME:'}</span>
                <span class="info-value">${rcToPrint.chequeBankName || rcToPrint.bankName || (isCash ? 'CASH IN HAND' : '—')}</span>
              </div>

              <div class="info-box" style="grid-column: span 2;">
                <span class="info-label">${isPayment ? 'PAYEE BANK A/C / IBAN:' : 'CUSTOMER BANK A/C / IBAN:'}</span>
                <span class="info-value" style="font-family: monospace; font-weight: 700; color: #1e3a8a;">${rcToPrint.clientBankAccount || '—'}</span>
              </div>
              <div class="info-box" style="grid-column: span 2;">
                <span class="info-label">${isPayment ? 'PAYEE CHEQUE BANK ADDRESS / BRANCH:' : 'CUSTOMER CHEQUE BANK ADDRESS / BRANCH:'}</span>
                <span class="info-value" style="font-weight: normal; color: #334155;">${rcToPrint.bankAddress || '—'}</span>
              </div>
            </div>

            <!-- NUMERICAL AED VALUE BOX -->
            <div class="num-box-container">
              <span class="num-title">NUMERICAL AED VALUE</span>
              <div class="num-val">
                AED ${rcToPrint.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <!-- PARTICULARS & AMT IN WORDS -->
            <div class="narration-box">
              <div style="margin-bottom: 4px;">
                <span class="narration-label">PARTICULARS:</span>
                <span style="font-size: 10px; font-weight: bold; color: #0f172a; margin-left: 6px;">${rcToPrint.narration || (isPayment ? 'BEING PAYMENT DISCHARGED TO SUPPLIER' : 'BEING INVOICE SETTLEMENT VALUE DISCHARGE')}</span>
              </div>
              <div>
                <span class="narration-label">AMT IN WORDS:</span>
                <span style="font-size: 9.5px; font-weight: bold; color: #1e3a8a; margin-left: 6px; text-transform: uppercase;">${words}</span>
              </div>
            </div>



            <!-- AUDIT FOOTER SIGNATURES WITH CLIENT SIGNATURE & STAMP & SIGNATURE FOR MFI -->
            ${companyProfile.showSignatures !== false ? `
              <div class="footer-signatures" style="position: relative;">
                <div class="sig-col">
                  <div style="height: 80px;"></div>
                  <div class="sig-line">CLIENT SIGNATURE</div>
                </div>
                <div class="sig-col">
                  <div style="height: 80px;"></div>
                  <div class="sig-line">PREPARED BY</div>
                </div>
                <div class="sig-col">
                  <div style="height: 80px;"></div>
                  <div class="sig-line">CHECKED & VERIFIED BY</div>
                </div>
                <div class="sig-col" style="position: relative;">
                  <div style="height: 80px; display: flex; items-center; justify-content: center;">
                    ${companyProfile.showStamp && companyProfile.stampUrl ? `
                      <img src="${companyProfile.stampUrl}" style="max-height: 75px; max-width: 120px; object-fit: contain; transform: scale(${companyProfile.stampScale || 1}); opacity: 0.95; pointer-events: none !important; z-index: ${companyProfile.stampLayer === 'behind' ? 1 : 10}; position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact;" />
                    ` : ''}
                  </div>
                  <div class="sig-line">FOR: ${companyProfile.name}</div>
                </div>
              </div>
            ` : ''}

          </div>
        </body>
      </html>
    `;
  };

  const handlePrintVoucher = (rcToPrint: ReceiptVoucher) => {
    const htmlContent = generateVoucherHtml(rcToPrint);
    printHtml(htmlContent, `MFI_Receipt_Voucher_${rcToPrint.voucherNo}`);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 text-[11px] leading-relaxed no-print w-full">
      {/* Top Focus 9 Style Header Ribbon */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
        {/* Top App Bar / Title */}
        <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-500 font-extrabold text-xs tracking-wider">
              <div className="w-2.5 h-2.5 bg-[#f37021] rotate-45 rounded-xs"></div>
              <span>ERP LEDGER</span>
            </div>
            <span className="text-slate-600 font-mono">|</span>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#f37021]" />
              {accountCategory === 'PAYABLES' ? 'Financials — Payments Voucher' : 'Financials — Receipt Voucher'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            {isEditing ? (
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold uppercase border border-amber-500/20 animate-pulse">
                Unsaved Draft
              </span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase border border-emerald-500/20">
                Ledger Posted
              </span>
            )}
            <span className="text-slate-400 font-mono">V2.0</span>
          </div>
        </div>

        {/* Listy / Focus ERP Style Top Action Button Toolbar */}
        <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleInitNewVoucher}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Create New Voucher (Alt+N)"
            >
              <FilePlus className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={handleSaveReceipt}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Save Voucher Entry (F10)"
            >
              <Save className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Save</span>
            </button>

            {activeReceiptId ? (
              <button
                type="button"
                onClick={(e) => {
                  if (confirm("Are you sure you want to delete this voucher record?")) {
                    handleDeleteReceipt(activeReceiptId, e);
                  }
                }}
                className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
                title="Delete Voucher"
              >
                <Trash2 className="w-4 h-4 text-slate-700 mb-0.5" />
                <span>Delete</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="flex flex-col items-center justify-center bg-slate-50 text-slate-300 px-3 py-1 rounded border border-slate-200 shadow-3xs font-sans text-[10px] font-medium cursor-not-allowed min-w-[58px]"
              >
                <Trash2 className="w-4 h-4 text-slate-300 mb-0.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const idx = receiptRegisters.findIndex(r => r.id === activeReceiptId);
                if (idx > 0) {
                  setActiveReceiptId(receiptRegisters[idx - 1].id);
                } else {
                  const prevNo = incrementVoucherNo(voucher.voucherNo || '1', -1);
                  setVoucher(prev => ({ ...prev, voucherNo: prevNo }));
                  setIsEditing(true);
                  triggerToast(`Document No. set to ${prevNo}`);
                }
              }}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Previous Voucher / Move Document No. Down"
            >
              <ArrowLeftCircle className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const idx = receiptRegisters.findIndex(r => r.id === activeReceiptId);
                if (idx >= 0 && idx < receiptRegisters.length - 1) {
                  setActiveReceiptId(receiptRegisters[idx + 1].id);
                } else {
                  const nextNo = incrementVoucherNo(voucher.voucherNo || '1', 1);
                  setVoucher(prev => ({ ...prev, voucherNo: nextNo }));
                  setIsEditing(true);
                  triggerToast(`Document No. set to ${nextNo}`);
                }
              }}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Next Voucher / Move Document No. Up (93 -> 94 -> 95)"
            >
              <ArrowRightCircle className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Next</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrintVoucher(voucher)}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Print Official Slip (F7)"
            >
              <Printer className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPreviewReceipt(voucher);
                triggerToast(`Opening voucher preview for ${voucher.voucherNo}...`, 'info');
              }}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Preview Voucher"
            >
              <Eye className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEditCompanyModal(true)}
              className="flex flex-col items-center justify-center bg-[#0e2a47] hover:bg-[#163b61] text-white px-3 py-1 rounded border border-[#0e2a47] shadow-3xs font-sans text-[10px] font-bold transition-all cursor-pointer min-w-[68px]"
              title="Edit Company Header, Logo, Stamp & Signatures"
            >
              <Building2 className="w-4 h-4 text-[#f37021] mb-0.5" />
              <span>Edit Header</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerToast('Voucher entry suspended to draft state.', 'info');
              }}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Suspend Entry"
            >
              <PauseCircle className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Suspend</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('receipt_record');
                triggerToast('Opened Voucher Ledger & Audit Trail.', 'info');
              }}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[68px]"
              title="View Authorization & Audit History"
            >
              <ShieldCheck className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Auth History</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowClientListDrawer(true);
              }}
              className="flex flex-col items-center justify-center bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-3 py-1 rounded border border-slate-300 hover:border-slate-400 shadow-3xs font-sans text-[10px] font-medium transition-all cursor-pointer min-w-[58px]"
              title="Close or Toggle Directory"
            >
              <XCircle className="w-4 h-4 text-slate-700 mb-0.5" />
              <span>Close</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={activeReceiptId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  handleInitNewVoucher();
                } else {
                  setActiveReceiptId(val);
                  setIsEditing(false);
                }
              }}
              className="bg-white text-slate-800 border border-slate-300 rounded px-2 py-1 font-mono text-[9.5px] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#f37021] cursor-pointer"
            >
              <option value="">+ NEW VOUCHER (BLANK)</option>
              {receiptRegisters.map(rc => (
                <option key={rc.id} value={rc.id}>
                  {rc.accountCategory === 'PAYABLES' ? 'PV' : 'RV'} {rc.voucherNo} | {rc.clientName || 'PARTY'}
                </option>
              ))}
              {activeReceiptId && !receiptRegisters.some(rc => rc.id === activeReceiptId) && (
                <option value={activeReceiptId}>
                  RV {voucher.voucherNo} (DRAFT)
                </option>
              )}
            </select>

            <button
              type="button"
              onClick={() => setActiveTab('receipt_record')}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
              title="Close Voucher Editor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Strip Banner */}
        <div className="bg-slate-200 px-3 py-1 flex items-center justify-between border-b border-slate-300 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="bg-white text-slate-800 font-bold px-3 py-1 rounded-t border-t-2 border-t-[#007acc] border-x border-slate-300">
              Main
            </span>
          </div>
          <span className="text-slate-500 font-bold cursor-pointer hover:text-slate-800">━</span>
        </div>

        {/* Focus 9 Form Header Section - 2 Balanced Columns */}
        <div className="p-3 bg-white border-b border-slate-200 text-[9.5px]">
          
          {/* Voucher Role Selector */}
          <div className="mb-2.5 flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase text-slate-500">Voucher Type:</span>
              <div className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#007acc] text-white shadow-xs tracking-wide">
                {accountCategory === 'PAYABLES' ? 'PAYMENT VOUCHER' : 'RECEIPT VOUCHER'}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold uppercase text-slate-500">Payment Mode:</span>
              <select
                value={voucher.paymentMode}
                onChange={(e) => {
                  const mode = e.target.value as 'CASH' | 'CHEQUE' | 'BANK TRANSFER';
                  const nextNo = getNewVoucherNo(accountCategory, mode, receiptRegisters, voucher.dated);
                  setVoucher(prev => ({ ...prev, paymentMode: mode, voucherNo: nextNo }));
                  setIsEditing(true);
                }}
                className="bg-white border border-slate-300 text-slate-800 font-semibold text-[9px] uppercase rounded px-1.5 py-0.5 focus:outline-none focus:border-[#007acc] cursor-pointer"
              >
                <option value="CHEQUE">Cheque Deposit</option>
                <option value="CASH">Cash</option>
                <option value="BANK TRANSFER">Bank Transfer / Wire</option>
              </select>
            </div>
          </div>

          {/* FOCUS ERP 9 STYLE LIGHTWEIGHT PARTY & ORDER SELECTOR */}
          <div className="mb-2 p-1.5 bg-slate-50/90 rounded border border-slate-200 space-y-1.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-[9px]">

              {/* Box 1: Customer / Supplier Account (Unified Clean & Stable Search Box with Outstanding Balances) */}
              <div className="flex items-center gap-1">
                <div className="w-24 shrink-0 flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase text-[8.5px] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#007acc]" />
                    {accountCategory === 'PAYABLES' ? 'Supplier Account' : 'Customer Account'}
                  </label>
                </div>

                <div ref={payerSearchRef} className="flex-1 relative">
                  <div className="relative flex items-center gap-1">
                    <input
                      type="text"
                      className="w-full h-6.5 bg-white text-slate-900 font-bold uppercase pl-2 pr-12 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] text-[8.5px] tracking-wide shadow-2xs"
                      placeholder={accountCategory === 'PAYABLES' ? "Type or select supplier account..." : "Type or select customer account..."}
                      value={voucher.clientName || ''}
                      onFocus={() => setIsPayerSearching(true)}
                      onChange={(e) => {
                        const upperVal = e.target.value.toUpperCase();
                        setVoucher(prev => ({ ...prev, clientName: upperVal }));
                        setIsEditing(true);
                        setIsPayerSearching(true);
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowClientListDrawer(true)}
                      className="h-6.5 px-1.5 bg-sky-50 hover:bg-sky-100 text-[#007acc] border border-sky-300 font-bold text-[8px] uppercase tracking-tight rounded shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                      title="View Complete Client Directory with Outstanding Balances"
                    >
                      <span>👥 Balances</span>
                    </button>

                    <div className="absolute right-12 flex items-center gap-0.5">
                      {voucher.clientName && (
                        <button
                          type="button"
                          onClick={() => {
                            lastAutoSelectedClientRef.current = '';
                            setVoucher(prev => ({
                              ...prev,
                              clientName: '',
                              receivedAgainstInvoice: '',
                              invoiceAllocated: '',
                              amountReceived: 0,
                              narration: ''
                            }));
                            setIsEditing(true);
                            setIsPayerSearching(true);
                          }}
                          className="p-0.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="Clear Account Name"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPayerSearching(prev => !prev);
                        }}
                        className="p-0.5 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
                        title="Toggle Accounts List"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Clean Dropdown Auto-Search List with Outstanding Balances */}
                  {isPayerSearching && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-2xl max-h-64 overflow-hidden z-[100] flex flex-col font-sans text-[8.5px]">
                      <div className="bg-slate-100 px-2.5 py-1 border-b border-slate-200 flex items-center justify-between shrink-0 font-sans">
                        <span className="font-extrabold text-[8px] uppercase text-slate-600 tracking-wider">
                          {accountCategory === 'PAYABLES' ? 'SUPPLIER ACCOUNTS & BALANCES' : 'CUSTOMER ACCOUNTS & BALANCES'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPayerSearching(false);
                            setShowClientListDrawer(true);
                          }}
                          className="text-[8px] text-[#007acc] font-bold hover:underline cursor-pointer"
                        >
                          View All ({customerAccountSuggestions.length}) ➔
                        </button>
                      </div>

                      <div className="overflow-y-auto max-h-56 divide-y divide-slate-100">
                        {customerAccountSuggestions.length > 0 ? (
                          customerAccountSuggestions.slice(0, 35).map((sug) => {
                            const isSelected = sug.clientName.trim().toUpperCase() === (voucher.clientName || '').trim().toUpperCase();
                            const bal = getClientOutstandingBalance(sug.clientName, sug.isSupplier);
                            return (
                              <button
                                key={sug.id}
                                type="button"
                                onClick={() => {
                                  handleSelectCustomerAccount(
                                    sug.clientName,
                                    sug.isSupplier,
                                    sug.type === 'document' ? sug.documentNo : undefined,
                                    sug.documentType
                                  );
                                }}
                                className={`w-full text-left px-2.5 py-1.5 flex items-center justify-between hover:bg-sky-50 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-sky-100/90 font-bold border-l-2 border-[#007acc]' : ''
                                }`}
                              >
                                <div className="flex flex-col min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-bold truncate ${isSelected ? 'text-[#007acc]' : 'text-slate-800'}`}>
                                      {sug.name}
                                    </span>
                                    {isSelected && (
                                      <span className="text-[6.5px] bg-[#007acc] text-white px-1 py-0.2 rounded font-black tracking-wide">SELECTED</span>
                                    )}
                                  </div>
                                  {sug.clientAddress && (
                                    <span className="text-[7.5px] text-slate-500 font-normal truncate">{sug.clientAddress}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    <div className={`text-[8.5px] font-mono font-bold ${bal > 0 ? (sug.isSupplier ? 'text-amber-700' : 'text-blue-700') : 'text-slate-400'}`}>
                                      AED {bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <span className="text-[6.5px] text-slate-400 font-medium uppercase tracking-tight">Outstanding</span>
                                  </div>
                                  <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded ${sug.isSupplier ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {sug.isSupplier ? "Supplier" : "Customer"}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-3 text-center text-slate-400 text-[8.5px] italic">
                            No matching account found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Order / Invoice Selector */}
              <div className="flex items-center gap-1">
                <label className="w-24 font-bold text-slate-700 shrink-0 uppercase text-[8.5px] flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#007acc]" />
                  {accountCategory === 'PAYABLES' ? 'Supplier Invoice' : 'Tax Invoice'}
                </label>
                <div className="flex-1 flex items-center gap-1">
                  <select
                    disabled={!voucher.clientName}
                    value={voucher.receivedAgainstInvoice || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setVoucher(prev => ({
                          ...prev,
                          receivedAgainstInvoice: '',
                          invoiceAllocated: '',
                          amountReceived: 0,
                          narration: formatNarration([], prev.clientName, accountCategory)
                        }));
                        setIsEditing(true);
                        return;
                      }

                      if (val.includes(',')) {
                        const nos = val.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
                        const newTotal = unpaidInvoices
                          .filter(inv => nos.includes(inv.invoiceNo.toUpperCase()))
                          .reduce((sum, inv) => sum + inv.balance, 0);
                        setVoucher(prev => ({
                          ...prev,
                          receivedAgainstInvoice: val,
                          invoiceAllocated: val,
                          amountReceived: newTotal > 0 ? parseFloat(newTotal.toFixed(2)) : prev.amountReceived,
                          narration: formatNarration(nos, prev.clientName, accountCategory)
                        }));
                        setIsEditing(true);
                        return;
                      }

                      const matched = unpaidInvoices.find(i => i.invoiceNo === val);
                      const bal = matched ? matched.balance : getInvoiceBalance(val);
                      
                      setVoucher(prev => ({
                        ...prev,
                        receivedAgainstInvoice: val,
                        invoiceAllocated: val,
                        amountReceived: bal > 0 ? bal : prev.amountReceived,
                        narration: formatNarration([val], prev.clientName, accountCategory)
                      }));
                      setIsEditing(true);
                    }}
                    className="flex-1 h-6.5 bg-white border border-slate-300 text-slate-800 font-bold text-[8.5px] rounded px-1.5 focus:outline-none focus:border-[#007acc] cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 truncate shadow-2xs"
                  >
                    {!voucher.clientName ? (
                      <option value="">Select Party First...</option>
                    ) : unpaidInvoices.length === 0 ? (
                      <option value="">No pending invoices for {voucher.clientName}</option>
                    ) : (
                      <>
                        <option value="">-- Select Pending Invoice --</option>
                        
                        {(() => {
                          const currentVal = voucher.receivedAgainstInvoice || '';
                          const selectedNos = currentVal.split(',').map(s => s.trim()).filter(Boolean);
                          
                          if (currentVal && selectedNos.length > 1) {
                            return (
                              <option value={currentVal}>
                                MULTIPLE ({selectedNos.length} INVOICES): {currentVal}
                              </option>
                            );
                          }
                          return null;
                        })()}

                        {unpaidInvoices.map(inv => {
                          const isSel = isInvoiceSelected(inv.invoiceNo);
                          return (
                            <option key={inv.invoiceNo} value={inv.invoiceNo}>
                              {isSel ? '✓ ' : ''}{inv.invoiceNo} | Date: {inv.date || '—'} | Bal: AED {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>

                  {unpaidInvoices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowInvoicePopup(true)}
                      className="h-6.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[8px] uppercase rounded border border-amber-300 shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Select multiple pending invoices"
                    >
                      <span>List ({unpaidInvoices.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Box 3: Customer / Supplier Address Box (Prominently Placed & Fully Editable) */}
              <div className="flex items-center gap-1">
                <div className="w-24 shrink-0 flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase text-[8.5px] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#007acc]" />
                    {accountCategory === 'PAYABLES' ? 'Supplier Address' : 'Customer Address'}
                  </label>
                </div>
                <input
                  type="text"
                  value={voucher.clientAddress || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, clientAddress: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  placeholder={accountCategory === 'PAYABLES' ? "Enter supplier office / factory address..." : "Enter customer office / site address..."}
                  className="flex-1 h-6.5 bg-white text-slate-900 font-medium uppercase px-2 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] text-[8.5px] tracking-wide shadow-2xs"
                />
              </div>

              {/* Box 4: Customer / Supplier Bank Account / IBAN for Cheque */}
              <div className="flex items-center gap-1">
                <div className="w-24 shrink-0 flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase text-[8.5px] flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-[#007acc]" />
                    {accountCategory === 'PAYABLES' ? 'Supplier Bank A/C' : 'Customer Bank A/C'}
                  </label>
                </div>
                <input
                  type="text"
                  value={voucher.clientBankAccount || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, clientBankAccount: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  placeholder={accountCategory === 'PAYABLES' ? "Supplier Bank A/C No. or IBAN (e.g. AE9404...)..." : "Customer Bank A/C No. or IBAN for Cheque..."}
                  className="flex-1 h-6.5 bg-white text-slate-900 font-mono font-semibold uppercase px-2 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] text-[8.5px] tracking-wide shadow-2xs"
                />
              </div>

            </div>
          </div>

          {/* Compact 2-Column Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
            
            {/* Left Column */}
            <div className="space-y-1">
              {/* Document No with - / + Buttons to Edit & Step */}
              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Document No.</label>
                <div className="flex-1 flex gap-0.5 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const prevNo = incrementVoucherNo(voucher.voucherNo || '', -1);
                      setVoucher(prev => ({ ...prev, voucherNo: prevNo }));
                      setIsEditing(true);
                    }}
                    className="h-6 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] rounded-l border border-slate-300 cursor-pointer"
                    title="Move Document No Down (e.g. 94 -> 93)"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={voucher.voucherNo || ''}
                    onChange={(e) => {
                      setVoucher(prev => ({ ...prev, voucherNo: e.target.value }));
                      setIsEditing(true);
                    }}
                    className="flex-1 h-6 bg-white border-y border-slate-300 px-1.5 font-mono font-black text-rose-700 text-[10px] focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="e.g. RV-26-1293 or 93"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextNo = incrementVoucherNo(voucher.voucherNo || '', 1);
                      setVoucher(prev => ({ ...prev, voucherNo: nextNo }));
                      setIsEditing(true);
                    }}
                    className="h-6 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] border border-slate-300 cursor-pointer"
                    title="Move Document No Up (e.g. 93 -> 94 -> 95)"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={handleInitNewVoucher}
                    className="h-6 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] rounded-r border border-emerald-600 cursor-pointer shadow-xs flex items-center justify-center"
                    title="Create New Document Number"
                  >
                    New
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNo = getNewVoucherNo(accountCategory, voucher.paymentMode, receiptRegisters);
                      setVoucher(prev => ({ ...prev, voucherNo: nextNo }));
                      setIsEditing(true);
                    }}
                    className="h-6 px-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[8px] uppercase rounded border border-slate-300 cursor-pointer"
                    title="Regenerate Document No."
                  >
                    ↻
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Cash/Bank Account</label>
                <select
                  value={voucher.cashBankAccount || 'RAK BANK'}
                  onChange={(e) => {
                    setVoucher({ ...voucher, cashBankAccount: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1 text-slate-800 font-semibold text-[8.5px] focus:outline-none focus:border-[#007acc] cursor-pointer"
                >
                  <option value="CASH">Cash Account</option>
                  <option value="RAK BANK">RAKBANK — Current Account</option>
                  <option value="EMIRATES NBD">Emirates NBD — AED Corporate</option>
                  <option value="FAB BANK">First Abu Dhabi Bank (FAB)</option>
                  <option value="COMMERCIAL BANK OF DUBAI">Commercial Bank of Dubai (CBD)</option>
                  <option value="MASHREQ BANK">Mashreq Bank</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">LC / PO No.</label>
                <input
                  type="text"
                  value={voucher.receivedAgainstPo || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, receivedAgainstPo: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  placeholder="Enter LC or PO reference..."
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1.5 text-slate-800 text-[8.5px] focus:outline-none focus:border-[#007acc] font-mono"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Narration</label>
                <input
                  type="text"
                  value={voucher.narration || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, narration: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  placeholder="Being settlement of invoice dues..."
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1.5 text-slate-800 text-[8.5px] focus:outline-none focus:border-[#007acc]"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">{getChequeDateLabel(voucher.paymentMode)}</label>
                <input
                  type="date"
                  value={voucher.chequeDate || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, chequeDate: e.target.value });
                    setIsEditing(true);
                  }}
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1 font-mono text-slate-800 text-[8.5px] focus:outline-none focus:border-[#007acc] cursor-pointer"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-1">
              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Date</label>
                <input
                  type="date"
                  value={voucher.dated || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, dated: e.target.value });
                    setIsEditing(true);
                  }}
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1 font-mono text-slate-800 text-[8.5px] focus:outline-none focus:border-[#007acc] cursor-pointer"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Currency</label>
                <select
                  value="AED"
                  onChange={() => {}}
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1 text-slate-800 font-semibold text-[8.5px] focus:outline-none focus:border-[#007acc] cursor-pointer"
                >
                  <option value="AED">AED — United Arab Emirates Dirham</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="SAR">SAR — Saudi Riyal</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Department</label>
                <select
                  value={accountCategory === 'PAYABLES' ? 'Procurement' : 'Operations'}
                  onChange={() => {}}
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1 text-slate-800 font-semibold text-[8.5px] focus:outline-none focus:border-[#007acc] cursor-pointer"
                >
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance & Accounts</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Sales">Sales & Receivables</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">{getChequeNoLabel(voucher.paymentMode)}</label>
                <input
                  type="text"
                  value={voucher.chequeNoDetails || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, chequeNoDetails: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  placeholder={voucher.paymentMode === 'CASH' ? "Enter Reference No..." : voucher.paymentMode === 'BANK TRANSFER' ? "Enter TT Reference No..." : "Enter Cheque No..."}
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1.5 font-mono text-slate-800 text-[8.5px] focus:outline-none focus:border-[#007acc]"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Cheque Bank Name</label>
                <input
                  type="text"
                  value={voucher.chequeBankName ?? voucher.bankName ?? ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, chequeBankName: e.target.value.toUpperCase(), bankName: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  placeholder="e.g. RAKBANK / EMIRATES NBD / DIB / ADCB..."
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1.5 text-slate-800 uppercase font-semibold text-[8.5px] focus:outline-none focus:border-[#007acc]"
                />
              </div>

              <div className="flex items-center">
                <label className="w-24 font-bold text-slate-600 shrink-0 uppercase text-[8.5px]">Cheque Bank Branch</label>
                <input
                  type="text"
                  value={voucher.bankAddress || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, bankAddress: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                  placeholder="Branch location (e.g. Ajman / Sharjah)..."
                  className="flex-1 h-6 bg-white border border-slate-300 rounded px-1.5 text-slate-800 text-[8.5px] uppercase focus:outline-none focus:border-[#007acc]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Focus 9 Blue Grid Table Banner with Multi-Invoice Checkboxes & PO No. */}
        <div className="p-1.5 bg-slate-50">
          <div className="border border-slate-300 rounded overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-[#007acc] text-white text-[9px] font-bold uppercase tracking-wider divide-x divide-[#0284c7]">
                  <th className="p-1.5 text-center w-8">#</th>
                  <th className="p-1.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={unpaidInvoices.length > 0 && unpaidInvoices.every(inv => isInvoiceSelected(inv.invoiceNo))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allNos = unpaidInvoices.map(i => i.invoiceNo.toUpperCase());
                          const newTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.balance, 0);
                          setVoucher(prev => ({
                            ...prev,
                            receivedAgainstInvoice: allNos.join(', '),
                            invoiceAllocated: allNos.join(', '),
                            amountReceived: parseFloat(newTotal.toFixed(2)),
                            narration: formatNarration(allNos, prev.clientName, accountCategory)
                          }));
                          setIsEditing(true);
                        } else {
                          setVoucher(prev => ({
                            ...prev,
                            receivedAgainstInvoice: '',
                            invoiceAllocated: '',
                            amountReceived: 0,
                            narration: formatNarration([], prev.clientName, accountCategory)
                          }));
                          setIsEditing(true);
                        }
                      }}
                      className="w-3.5 h-3.5 accent-amber-300 cursor-pointer rounded align-middle"
                      title="Select / Deselect All Invoices"
                    />
                  </th>
                  <th className="p-1.5">Account Name</th>
                  <th className="p-1.5 w-28">PO No.</th>
                  <th className="p-1.5 w-36">Reference / Invoice</th>
                  <th className="p-1.5 text-right w-28">Amount (AED)</th>
                  <th className="p-1.5">Remarks</th>
                  <th className="p-1.5 text-right w-20">Exchange Diff</th>
                  <th className="p-1.5 text-right w-20">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-[9.5px]">
                
                {/* Dynamic Multi-Invoice Selection Rows */}
                {unpaidInvoices.length > 0 ? (
                  unpaidInvoices.map((inv, idx) => {
                    const isChecked = isInvoiceSelected(inv.invoiceNo);
                    return (
                      <tr key={inv.invoiceNo} className={`transition-colors ${isChecked ? 'bg-sky-50/80 font-semibold' : 'hover:bg-slate-50'}`}>
                        <td className="p-1 text-center font-bold text-slate-500 bg-slate-50 border-r border-slate-200 text-[8.5px]">
                          {idx + 1}
                        </td>

                        {/* Selection Checkbox */}
                        <td className="p-1 text-center border-r border-slate-200 bg-slate-50/50">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleInvoiceSelection(inv.invoiceNo)}
                            className="w-3.5 h-3.5 accent-[#007acc] cursor-pointer rounded"
                            title={`Select/Deselect Invoice #${inv.invoiceNo}`}
                          />
                        </td>

                        {/* Account Name */}
                        <td className="p-1 border-r border-slate-200 font-bold uppercase text-slate-900 text-[9px]">
                          {voucher.clientName || 'CUSTOMER / SUPPLIER ACCOUNT'}
                        </td>

                        {/* PO No. Column */}
                        <td className="p-1 border-r border-slate-200 font-mono text-[8.5px] text-slate-700">
                          {inv.poNo || voucher.receivedAgainstPo || '—'}
                        </td>

                        {/* Reference / Invoice */}
                        <td className="p-1 border-r border-slate-200 font-mono font-bold text-[#007acc] text-[9px]">
                          {inv.invoiceNo}
                        </td>

                        {/* Amount */}
                        <td className="p-1 border-r border-slate-200 text-right font-mono font-bold text-slate-900 text-[9.5px]">
                          {inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Remarks */}
                        <td className="p-1 border-r border-slate-200 text-slate-600 text-[8.5px] uppercase">
                          BEING {accountCategory === 'PAYABLES' ? 'PAYMENT' : 'SETTLEMENT'} OF INVOICE #{inv.invoiceNo}
                        </td>

                        {/* Exchange Diff */}
                        <td className="p-1 border-r border-slate-200 text-right font-mono text-slate-400 text-[8.5px]">
                          0.0000
                        </td>

                        {/* Discount */}
                        <td className="p-1 text-right font-mono text-slate-400 text-[8.5px]">
                          0.0000
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  /* Primary Manual Active Row 1 when no pending invoices exist */
                  <tr className="hover:bg-sky-50/50 transition-colors">
                    <td className="p-1 text-center font-bold text-slate-500 bg-slate-50 border-r border-slate-200 text-[8.5px]">
                      1
                    </td>

                    {/* Default Checkbox */}
                    <td className="p-1 text-center border-r border-slate-200 bg-slate-50/50">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="w-3.5 h-3.5 accent-[#007acc] cursor-pointer rounded"
                      />
                    </td>

                    {/* Account Name Selection / Input */}
                    <td className="p-1 relative border-r border-slate-200">
                      <input
                        type="text"
                        className="w-full h-6 bg-white text-slate-900 font-bold uppercase px-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] text-[9px]"
                        placeholder={accountCategory === 'PAYABLES' ? "Select Supplier Account..." : "Select Customer Account..."}
                        value={voucher.clientName || ''}
                        onFocus={() => setIsPayerSearching(true)}
                        onBlur={() => setTimeout(() => setIsPayerSearching(false), 250)}
                        onChange={(e) => {
                          const upperVal = e.target.value.toUpperCase();
                          setVoucher(prev => ({ ...prev, clientName: upperVal }));
                          setIsEditing(true);
                          setIsPayerSearching(true);
                        }}
                      />
                    </td>

                    {/* PO No. Field */}
                    <td className="p-1 border-r border-slate-200">
                      <input
                        type="text"
                        value={voucher.receivedAgainstPo || ''}
                        onChange={(e) => {
                          setVoucher({ ...voucher, receivedAgainstPo: e.target.value.toUpperCase() });
                          setIsEditing(true);
                        }}
                        placeholder="PO-2026-..."
                        className="w-full h-6 bg-white font-mono font-semibold text-slate-800 px-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] text-[8.5px] uppercase"
                      />
                    </td>

                    {/* Reference Field */}
                    <td className="p-1 border-r border-slate-200">
                      <input
                        type="text"
                        value={voucher.receivedAgainstInvoice || ''}
                        onChange={(e) => {
                          setVoucher({ 
                            ...voucher, 
                            receivedAgainstInvoice: e.target.value.toUpperCase(),
                            invoiceAllocated: e.target.value.toUpperCase()
                          });
                          setIsEditing(true);
                        }}
                        placeholder="Invoice Ref..."
                        className="w-full h-6 bg-white font-mono font-semibold text-slate-800 px-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] text-[8.5px] uppercase"
                      />
                    </td>

                    {/* Amount Field */}
                    <td className="p-1 border-r border-slate-200">
                      <input
                        type="number"
                        step="any"
                        value={voucher.amountReceived || ''}
                        onChange={(e) => {
                          setVoucher({ ...voucher, amountReceived: parseFloat(e.target.value) || 0 });
                          setIsEditing(true);
                        }}
                        placeholder="0.00"
                        className="w-full h-6 text-right bg-white font-mono font-bold text-slate-900 px-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] text-[9px]"
                      />
                    </td>

                    {/* Remarks Field */}
                    <td className="p-1 border-r border-slate-200">
                      <input
                        type="text"
                        value={voucher.narration || ''}
                        onChange={(e) => {
                          setVoucher({ ...voucher, narration: e.target.value.toUpperCase() });
                          setIsEditing(true);
                        }}
                        placeholder="Line item remarks..."
                        className="w-full h-6 bg-white text-slate-800 px-1.5 rounded border border-slate-300 focus:outline-none focus:border-[#007acc] text-[8.5px] uppercase"
                      />
                    </td>

                    {/* Exchange Diff */}
                    <td className="p-1 border-r border-slate-200">
                      <input
                        type="text"
                        value="0.0000"
                        readOnly
                        className="w-full h-6 text-right bg-slate-50 font-mono text-slate-500 px-1 rounded border border-slate-200 text-[8.5px]"
                      />
                    </td>

                    {/* Discount */}
                    <td className="p-1">
                      <input
                        type="text"
                        value="0.0000"
                        readOnly
                        className="w-full h-6 text-right bg-slate-50 font-mono text-slate-500 px-1 rounded border border-slate-200 text-[8.5px]"
                      />
                    </td>
                  </tr>
                )}

                {/* Focus 9 Alignment Grid Rows */}
                {unpaidInvoices.length < 4 && [1, 2, 3, 4].slice(unpaidInvoices.length).map((rowNum) => (
                  <tr key={rowNum} className="hover:bg-slate-50/50">
                    <td className="p-1 text-center font-semibold text-slate-400 bg-slate-50 border-r border-slate-200 text-[8.5px]">
                      {unpaidInvoices.length + rowNum}
                    </td>
                    <td className="p-1 border-r border-slate-200 text-center bg-slate-50/30">
                      <input type="checkbox" disabled className="w-3 h-3 opacity-30" />
                    </td>
                    <td className="p-1 border-r border-slate-200 text-slate-300 italic text-[8.5px]">—</td>
                    <td className="p-1 border-r border-slate-200 text-slate-300 italic font-mono text-[8.5px]">—</td>
                    <td className="p-1 border-r border-slate-200 text-slate-300 italic text-[8.5px]">—</td>
                    <td className="p-1 border-r border-slate-200 text-slate-300 italic text-right font-mono text-[8.5px]">—</td>
                    <td className="p-1 border-r border-slate-200 text-slate-300 italic text-[8.5px]">—</td>
                    <td className="p-1 border-r border-slate-200 text-slate-400 text-right font-mono text-[8.5px]">0.0000</td>
                    <td className="p-1 text-slate-400 text-right font-mono text-[8.5px]">0.0000</td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Table Footer Controls */}
          <div className="flex justify-between items-center mt-2 px-1 text-[9px] text-slate-500 font-bold uppercase">
            <span>Amt In Words: {numberToWordsDirhams(voucher.amountReceived)}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  triggerToast("Added extra row to line grid");
                }}
                className="w-5 h-5 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 cursor-pointer shadow-2xs"
              >
                +
              </button>
              <button
                type="button"
                className="w-5 h-5 rounded border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 cursor-pointer shadow-2xs"
              >
                -
              </button>
            </div>
          </div>
        </div>

        {/* Focus 9 Bottom Status Bar & Net Total */}
        <div className="bg-slate-100 px-4 py-2 border-t border-slate-300 flex flex-wrap items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-3 text-[#007acc]">
            <span className="text-slate-700 uppercase font-bold text-[10px]">Net :</span>
            <span className="font-mono text-sm text-[#007acc] font-black tracking-wide">
              AED {voucher.amountReceived ? voucher.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[9.5px] text-slate-500 font-normal">
            <span>Copyright © 2026 Focus Softnet (P) Ltd. / MFI ERP. All Rights Reserved.</span>
            <span className="font-mono font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">Version 2.0</span>
          </div>
        </div>

      </div>

      {/* Dynamic Selector Overlay Modal */}
      {showInvoicePopup && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500 text-slate-100 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Database className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    {accountCategory === 'PAYABLES' ? 'Supplier Bill Allocation Desk' : 'Tax Invoice Allocation Desk'}
                  </h4>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">
                    {accountCategory === 'PAYABLES' 
                      ? 'Allocate payment funds to outstanding supplier bills dynamically.' 
                      : 'Allocate receipt funds to outstanding tax invoices dynamically.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoicePopup(false)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-sans font-bold uppercase tracking-wider text-[9px] px-3.5 py-1.5 rounded-xl border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Client Info Banner */}
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap gap-4 justify-between items-center text-[10px] shrink-0">
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-mono text-[8px] block">{accountCategory === 'PAYABLES' ? 'Payee Party:' : 'Payer Party:'}</span>
                <strong className="text-slate-100 text-[11px] uppercase tracking-wide font-sans">{voucher.clientName}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-mono text-[8px] block">Pending Status:</span>
                <span className="text-amber-400 font-semibold font-mono text-[10.5px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded block">
                  {unpaidInvoices.length} Unpaid Invoices
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const allNos = unpaidInvoices.map(i => i.invoiceNo.toUpperCase());
                    const newTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.balance, 0);
                    setVoucher(prev => ({
                      ...prev,
                      receivedAgainstInvoice: allNos.join(', '),
                      invoiceAllocated: allNos.join(', '),
                      amountReceived: parseFloat(newTotal.toFixed(2)),
                      narration: formatNarration(allNos, prev.clientName, accountCategory)
                    }));
                    setIsEditing(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[8.5px] uppercase tracking-wider py-1 px-2.5 rounded-lg border border-emerald-600 transition-all cursor-pointer active:scale-95"
                >
                  ✓ Select All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVoucher(prev => ({
                      ...prev,
                      receivedAgainstInvoice: '',
                      invoiceAllocated: '',
                      amountReceived: 0,
                      narration: formatNarration([], prev.clientName, accountCategory)
                    }));
                    setIsEditing(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-bold text-[8.5px] uppercase tracking-wider py-1 px-2.5 rounded-lg border border-slate-700 transition-all cursor-pointer active:scale-95"
                >
                  ✗ Clear All
                </button>
              </div>
            </div>

            {/* Invoice List Table scroll wrapper */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-900/40">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 text-[8.5px] font-bold uppercase tracking-wider border-b border-slate-800">
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Invoice Total</th>
                      <th className="p-3 text-right">Paid Amount</th>
                      <th className="p-3 text-right">Outstanding Bal</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[10px]">
                    {unpaidInvoices.map((inv) => {
                      const isAllocated = isInvoiceSelected(inv.invoiceNo);
                      return (
                        <tr
                          key={inv.invoiceNo}
                          onClick={() => toggleInvoiceSelection(inv.invoiceNo)}
                          className={`transition-all cursor-pointer duration-150 ${
                            isAllocated 
                              ? 'bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/30' 
                              : 'hover:bg-slate-900/60 text-slate-300'
                          }`}
                        >
                          <td className="p-3 font-mono font-bold tracking-wider flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                              isAllocated ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700 bg-slate-800'
                            }`}>
                              {isAllocated ? (
                                <svg className="w-2.5 h-2.5 stroke-[4.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <div className="w-1 h-1 rounded-full bg-slate-600" />
                              )}
                            </div>
                            <span className={isAllocated ? 'text-emerald-400 font-semibold' : 'text-slate-200'}>
                              {inv.invoiceNo}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{inv.date || '—'}</td>
                          <td className="p-3 text-right font-mono text-slate-400">
                            AED {inv.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400">
                            AED {inv.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`p-3 text-right font-mono font-bold ${isAllocated ? 'text-emerald-400' : 'text-amber-400'}`}>
                            AED {inv.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all duration-150 border ${
                              isAllocated
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                            }`}>
                              {isAllocated ? 'Ticked ✓' : 'Add'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800/80 text-[10px] text-slate-300 flex justify-between items-center shrink-0 flex-wrap gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[9px] uppercase font-mono">Selected Allocated Sum:</span>
                <strong className="font-mono text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  AED {selectedInvoicesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoicePopup(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-[9.5px] uppercase font-bold tracking-wide border border-emerald-600 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Apply & Close Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Workspace Panel - Removed */}
      <div className="hidden">
        
        {/* Left Panel: Form Editor */}
        <div className="space-y-4">
          
          {/* Input Form Fields Box */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
            
            {/* Category Filter & Quick-Setup */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{accountCategory === 'PAYABLES' ? 'Payee Account Role' : 'Payer Account Role'}</label>
                <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      const newCat = 'RECEIVABLES';
                      setAccountCategory(newCat);
                      const nextNo = getNewVoucherNo(newCat, voucher.paymentMode, receiptRegisters);
                      setVoucher(prev => ({
                        ...prev,
                        voucherNo: nextNo
                      }));
                      setIsEditing(true);
                    }}
                    className={`flex-1 py-1 px-2 rounded-md text-[9px] font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                      accountCategory === 'RECEIVABLES'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <User className="w-3 h-3" /> Debtors (Customers)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newCat = 'PAYABLES';
                      setAccountCategory(newCat);
                      const nextNo = getNewVoucherNo(newCat, voucher.paymentMode, receiptRegisters);
                      setVoucher(prev => ({
                        ...prev,
                        voucherNo: nextNo
                      }));
                      setIsEditing(true);
                    }}
                    className={`flex-1 py-1 px-2 rounded-md text-[9px] font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                      accountCategory === 'PAYABLES'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <User className="w-3 h-3" /> Creditors (Suppliers)
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Voucher Status Panel</span>
                <div className="flex items-center gap-2">
                  {voucher.clientName ? (
                    clientsList.some(c => c.name.toUpperCase() === voucher.clientName.toUpperCase()) ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded font-bold border border-emerald-500/15 uppercase tracking-wide flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500" /> Registered Account
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/10 text-amber-700 px-2 py-1 rounded font-bold border border-amber-500/15 uppercase tracking-wide">
                        ⚠ Custom/Unlisted Account
                      </span>
                    )
                  ) : (
                    <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-1 rounded font-bold uppercase italic">
                      Waiting for client choice...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. Client Payer */}
              <div className="space-y-1 relative">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block">{accountCategory === 'PAYABLES' ? 'Payee Account Name' : 'Payer Account Name'}</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 font-sans font-bold text-[10.5px] uppercase py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all leading-tight"
                    placeholder="Type supplier, customer, invoice, DO, WO..."
                    value={voucher.clientName || ''}
                    onFocus={() => setIsPayerSearching(true)}
                    onKeyDown={(e) => {
                      if (isPayerSearching && filteredSuggestions.length > 0) {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setActiveSuggestionIndex(prev => 
                            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setActiveSuggestionIndex(prev => 
                            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                          );
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          const targetSug = filteredSuggestions[activeSuggestionIndex];
                          if (targetSug) {
                            handleSelectCustomerAccount(
                              targetSug.clientName,
                              targetSug.isSupplier,
                              targetSug.type === 'document' ? targetSug.documentNo : undefined,
                              targetSug.documentType
                            );
                          }
                        } else if (e.key === 'Escape') {
                          setIsPayerSearching(false);
                        }
                      }
                    }}
                    onChange={(e) => {
                      const upperVal = e.target.value.toUpperCase();
                      const cleanedVal = cleanClientName(upperVal);
                      const matched = clientsList.find(c => cleanClientName(c.name) === cleanedVal) ||
                                      clientsList.find(c => cleanClientName(c.name).includes(cleanedVal) && cleanedVal.length >= 3);
                      
                      let nextCategory = accountCategory;
                      let nextVoucherNo = voucher.voucherNo;
                      
                      if (matched) {
                        const newCat = matched.isSupplier ? 'PAYABLES' : 'RECEIVABLES';
                        if (newCat !== accountCategory) {
                          nextCategory = newCat;
                          setAccountCategory(newCat);
                          nextVoucherNo = getNewVoucherNo(newCat, voucher.paymentMode, receiptRegisters);
                        }
                      }

                      setVoucher(prev => ({
                        ...prev,
                        clientName: upperVal,
                        clientAddress: matched ? (matched.address || 'AJMAN, UAE') : prev.clientAddress,
                        voucherNo: nextVoucherNo
                      }));
                      setIsEditing(true);
                      setIsPayerSearching(true);
                    }}
                    required
                  />
                  {isPayerSearching && filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100 font-sans">
                      {filteredSuggestions.map((sug, idx) => {
                        const isActive = idx === activeSuggestionIndex;
                        return (
                          <button
                            key={sug.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectCustomerAccount(
                                sug.clientName,
                                sug.isSupplier,
                                sug.type === 'document' ? sug.documentNo : undefined,
                                sug.documentType
                              );
                            }}
                            className={`w-full text-left px-3 py-2 text-[10.5px] font-bold flex items-center justify-between cursor-pointer transition-colors ${
                              isActive ? 'bg-[#f37021]/10 text-slate-900 border-l-2 border-[#f37021]' : 'text-slate-850 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="truncate">{sug.name}</span>
                              {sug.type === 'document' && (
                                <span className="text-[8px] text-slate-400 font-mono">
                                  Linked Payer: {sug.clientName}
                                </span>
                              )}
                            </div>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              sug.isSupplier ? 'bg-amber-100 text-[#be4a00]' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {sug.isSupplier ? "Supplier" : "Customer"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Highly Dynamic "Box-Type" Pending Invoices Grid underneath company selection */}
                {voucher.clientName && (
                  <div className="mt-2.5 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#f37021] to-amber-500" />
                    <div className="flex flex-wrap items-center justify-between gap-2 pl-1 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f37021] animate-pulse" />
                        <span className="text-[10px] font-semibold tracking-wider text-[#f37021] uppercase">
                          PENDING SETTLEMENT BOXES
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {unpaidInvoices.length > 0 && (
                          <div className="flex items-center gap-1.5 mr-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const allNos = unpaidInvoices.map(i => i.invoiceNo.toUpperCase());
                                const newTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.balance, 0);
                                setVoucher(prev => ({
                                  ...prev,
                                  receivedAgainstInvoice: allNos.join(', '),
                                  invoiceAllocated: allNos.join(', '),
                                  amountReceived: parseFloat(newTotal.toFixed(2)),
                                  narration: formatNarration(allNos, prev.clientName, accountCategory)
                                }));
                                setIsEditing(true);
                              }}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[8.5px] font-bold text-emerald-400 rounded-md transition-all cursor-pointer border border-slate-700 hover:border-emerald-500/30"
                            >
                              ✓ Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVoucher(prev => ({
                                  ...prev,
                                  receivedAgainstInvoice: '',
                                  invoiceAllocated: '',
                                  amountReceived: 0,
                                  narration: formatNarration([], prev.clientName, accountCategory)
                                }));
                                setIsEditing(true);
                              }}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[8.5px] font-bold text-rose-400 rounded-md transition-all cursor-pointer border border-slate-700 hover:border-rose-500/30"
                            >
                              ✕ Clear All
                            </button>
                          </div>
                        )}
                        <span className="text-[8.5px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold">
                          {unpaidInvoices.length} PENDING
                        </span>
                      </div>
                    </div>

                    {unpaidInvoices.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                        {unpaidInvoices.map((inv) => {
                          const isSel = isInvoiceSelected(inv.invoiceNo);
                          return (
                            <div
                              key={inv.invoiceNo}
                              onClick={() => {
                                toggleInvoiceSelection(inv.invoiceNo);
                                setIsEditing(true);
                              }}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none relative overflow-hidden group ${
                                isSel
                                  ? 'bg-gradient-to-br from-emerald-950/85 to-[#0b3c25]/75 border-emerald-500/90 text-white shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/20'
                                  : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:shadow-2xs'
                              }`}
                            >
                              {/* Glowing Active Background Accent */}
                              {isSel && (
                                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                              )}
                              
                              <div className="flex justify-between items-start gap-1">
                                <div className="truncate min-w-0">
                                  <span className={`font-mono text-[11px] font-bold tracking-tight block ${isSel ? 'text-emerald-300' : 'text-slate-100'}`}>
                                    {inv.invoiceNo}
                                  </span>
                                  <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase leading-none block mt-0.5">
                                    {inv.date || '—'}
                                  </span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                  isSel ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 text-slate-950 scale-105 shadow-xs' : 'border-slate-700 bg-slate-900 group-hover:border-slate-600'
                                }`}>
                                  {isSel && (
                                    <svg className="w-2.5 h-2.5 stroke-[4.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2.5 flex justify-between items-end">
                                <div>
                                  <span className="text-[7.5px] text-slate-450 uppercase font-bold tracking-tight block leading-none">Original Val</span>
                                  <span className="text-[9px] font-mono text-slate-350 font-bold leading-none block mt-0.5">
                                    AED {inv.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[7.5px] text-slate-400 uppercase font-bold tracking-wider block leading-none">PENDING</span>
                                  <span className={`font-mono text-[11.5px] font-bold block mt-0.5 ${isSel ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    AED {inv.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-[8.5px] uppercase font-bold tracking-widest italic select-none">
                        No outstanding pending invoices for this account.
                      </div>
                    )}

                    {/* Quick Sum Display */}
                    {unpaidInvoices.length > 0 && (
                      <div className="bg-slate-950 p-2.5 rounded-xl flex items-center justify-between text-[9px] font-bold border border-slate-800">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 uppercase">Selected Sum:</span>
                          <span className="font-mono text-emerald-400 font-bold text-[10px]">
                            AED {selectedInvoicesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[7.5px] text-[#f37021] uppercase font-bold">
                            Auto-adjusted Amount
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Client Address */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#f37021]" />
                  {accountCategory === 'PAYABLES' ? 'Supplier Corporate Address' : 'Customer Corporate Address'}
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-850 font-sans font-semibold text-[10px] uppercase py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all shadow-2xs"
                  placeholder={accountCategory === 'PAYABLES' ? "Enter supplier physical/corporate location..." : "Enter customer physical/corporate location..."}
                  value={voucher.clientAddress || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, clientAddress: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                />
              </div>

              {/* 3. Voucher No & Dated */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                    Voucher Reference No
                    <span className="text-[7.5px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold uppercase font-sans">Auto</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextNo = getNewVoucherNo(accountCategory, voucher.paymentMode, receiptRegisters);
                      setVoucher(prev => ({ ...prev, voucherNo: nextNo }));
                      setIsEditing(true);
                    }}
                    title="Generate unique non-colliding voucher reference"
                    className="text-[8px] font-bold text-[#f37021] hover:text-[#f37021]/80 uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '3s' }} />
                    Regen
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full bg-white text-rose-600 font-mono text-[11px] font-bold py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Voucher No..."
                  value={voucher.voucherNo || ''}
                  onChange={(e) => {
                    setVoucher(prev => ({ ...prev, voucherNo: e.target.value }));
                    setIsEditing(true);
                  }}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block">Voucher Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-850 font-mono text-[10.5px] font-bold py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all cursor-pointer"
                    value={voucher.dated || ''}
                    onChange={(e) => {
                      setVoucher({ ...voucher, dated: e.target.value });
                      setIsEditing(true);
                    }}
                    required
                  />
                </div>
              </div>

              {/* 4. Payment Amount & Payment Mode Selection Cards */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block mb-1">Receipt Value & Payment Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  
                  {/* Unique Payment Mode Cards */}
                  <button
                    type="button"
                    onClick={() => {
                      setVoucher({ ...voucher, paymentMode: 'CASH' });
                      setIsEditing(true);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      voucher.paymentMode === 'CASH'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Coins className="w-5 h-5 mb-1 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">CASH VOUCHER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVoucher({ ...voucher, paymentMode: 'CHEQUE' });
                      setIsEditing(true);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      voucher.paymentMode === 'CHEQUE'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <FileText className="w-5 h-5 mb-1 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">CHEQUE DEPOSIT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVoucher({ ...voucher, paymentMode: 'BANK TRANSFER' });
                      setIsEditing(true);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      voucher.paymentMode === 'BANK TRANSFER'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Database className="w-5 h-5 mb-1 text-indigo-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">BANK WIRE/TRANSFER</span>
                  </button>
                </div>
              </div>

              {/* 5. Amount Input */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block">Numerical AED Receipt Value</label>
                <div className="relative flex items-center rounded-xl overflow-hidden bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus-within:ring-2 focus-within:ring-[#f37021]/40 focus-within:border-[#f37021] transition-all">
                  <span className="bg-slate-200 px-3.5 py-2.5 font-bold font-mono text-slate-600 text-[10px] select-none uppercase">
                    AED
                  </span>
                  <input
                    type="number"
                    step="any"
                    className="w-full bg-transparent focus:outline-none text-left font-mono font-bold text-slate-900 text-[12.5px] py-2 px-3 border-none outline-none"
                    placeholder="0.00"
                    value={voucher.amountReceived || ''}
                    onChange={(e) => {
                      setVoucher({ ...voucher, amountReceived: parseFloat(e.target.value) || 0 });
                      setIsEditing(true);
                    }}
                    required
                  />
                </div>
                <div className="p-2.5 bg-[#f37021]/5 border border-[#f37021]/10 rounded-xl mt-1 text-[9px] text-[#f37021] font-bold uppercase tracking-wide leading-tight select-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#f37021] rounded-full animate-ping shrink-0" />
                  Amt In Words: {numberToWordsDirhams(voucher.amountReceived)}
                </div>
              </div>

              {/* 6. Invoice Allocation Link Desk */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                      {accountCategory === 'PAYABLES' ? 'Supplier Bill Allocation Desk' : 'Tax Invoice Allocation Desk'}
                    </label>
                    <p className="text-[8.5px] text-slate-400">
                      {accountCategory === 'PAYABLES' 
                        ? 'Select single or multiple supplier bills to link this payment release.' 
                        : 'Select single or multiple invoices to link this receipt payment.'}
                    </p>
                  </div>
                  {voucher.clientName && unpaidInvoices.length > 0 && (
                    <span className="text-[9px] bg-[#f37021]/15 text-[#f37021] border border-[#f37021]/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                      ● {unpaidInvoices.length} Pending Found
                    </span>
                  )}
                </div>

                {voucher.clientName ? (
                  unpaidInvoices.length > 0 ? (
                    <div className="space-y-2.5">
                      {/* Checkbox Grid list directly in form */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gradient-to-br from-slate-50 to-indigo-50/20 p-3 rounded-2xl border border-slate-200/60 max-h-[165px] overflow-y-auto">
                        {unpaidInvoices.map((inv) => {
                          const isSel = isInvoiceSelected(inv.invoiceNo);
                          return (
                            <div
                              key={inv.invoiceNo}
                              onClick={() => toggleInvoiceSelection(inv.invoiceNo)}
                              className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-250 cursor-pointer select-none relative overflow-hidden group ${
                                isSel
                                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50/30 border-emerald-500 shadow-sm ring-1 ring-emerald-400/30 text-emerald-950'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-2xs'
                              }`}
                            >
                              {isSel && (
                                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
                              )}
                              <div className="flex items-center gap-2.5 min-w-0 z-10">
                                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                                  isSel ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-sm scale-105' : 'border-slate-300 bg-slate-50 group-hover:border-slate-400'
                                }`}>
                                  {isSel ? (
                                    <svg className="w-2.5 h-2.5 stroke-[4.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-300" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-mono font-bold text-[10.5px] block leading-none ${isSel ? 'text-emerald-950 font-bold' : 'text-slate-900 group-hover:text-slate-950'}`}>
                                      {inv.invoiceNo}
                                    </span>
                                    {isSel && (
                                      <span className="text-[6.5px] bg-emerald-500 text-white px-1 py-0.2 rounded font-bold uppercase tracking-wider font-sans leading-none shrink-0 scale-95">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[7.5px] text-slate-400 font-bold uppercase leading-none block mt-1">{inv.date || '—'}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2 z-10">
                                <span className={`font-mono text-[10.5px] font-bold block leading-none ${isSel ? 'text-emerald-700' : 'text-slate-900 group-hover:text-slate-950'}`}>
                                  AED {inv.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                                {isSel ? (
                                  <span className="text-[7px] text-emerald-600 font-bold uppercase block leading-none mt-1 animate-pulse">
                                    ✓ Marked
                                  </span>
                                ) : (
                                  <span className="text-[7px] text-slate-400 uppercase block leading-none mt-1">
                                    Bal of {inv.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display Selected Summary inside form */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-800 text-[9.5px]">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="uppercase text-slate-400 font-semibold tracking-wider">Allocated:</span>
                          <span className="font-mono font-bold text-amber-400 truncate max-w-[250px]">
                            {voucher.receivedAgainstInvoice || 'NONE SELECTED'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 uppercase">Selected Sum:</span>
                          <span className="font-mono font-bold text-emerald-400 text-[10.5px]">
                            AED {selectedInvoicesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Manual Override Option */}
                      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50/30 p-2 rounded-xl border border-amber-100/80">
                        <span className="text-[8px] font-bold text-amber-700 uppercase tracking-wider shrink-0">Custom Override Invoice No:</span>
                        <input
                          type="text"
                          className="flex-1 bg-white focus:bg-slate-50 focus:outline-none text-slate-850 font-sans font-bold text-[9px] uppercase py-1 px-2.5 rounded-lg border border-slate-200"
                          placeholder="e.g. MF260246, MF260247..."
                          value={voucher.receivedAgainstInvoice || ''}
                          onChange={(e) => {
                            setVoucher({ 
                              ...voucher, 
                              receivedAgainstInvoice: e.target.value.toUpperCase(),
                              invoiceAllocated: e.target.value.toUpperCase()
                            });
                            setIsEditing(true);
                          }}
                          onBlur={(e) => {
                            const cleaned = cleanAndDeduplicateInvoices(e.target.value);
                            setVoucher(prev => ({
                              ...prev,
                              receivedAgainstInvoice: cleaned,
                              invoiceAllocated: cleaned
                            }));
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide italic">
                        No outstanding unpaid/pending invoices found for this client.
                      </p>
                      <div className="relative flex items-center rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                        <input
                          type="text"
                          className="w-full bg-white focus:outline-none font-sans font-bold text-slate-800 text-[10px] uppercase py-2.5 px-3 border border-slate-200"
                          placeholder="Type Custom/Manual Invoice No..."
                          value={voucher.receivedAgainstInvoice || ''}
                          onChange={(e) => {
                            setVoucher({ 
                              ...voucher, 
                              receivedAgainstInvoice: e.target.value.toUpperCase(),
                              invoiceAllocated: e.target.value.toUpperCase()
                            });
                            setIsEditing(true);
                          }}
                          onBlur={(e) => {
                            const cleaned = cleanAndDeduplicateInvoices(e.target.value);
                            setVoucher(prev => ({
                              ...prev,
                              receivedAgainstInvoice: cleaned,
                              invoiceAllocated: cleaned
                            }));
                          }}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 text-center p-5 rounded-2xl text-slate-400 text-[9.5px] uppercase font-bold tracking-widest italic select-none">
                    Please select a ${accountCategory === 'PAYABLES' ? 'Payee' : 'Payer'} Customer/Supplier first...
                  </div>
                )}
              </div>

              {/* 8. Advance & Balance fields */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block">{accountCategory === 'PAYABLES' ? 'Payee Advance Credit (AED)' : 'Payer Advance Credit (AED)'}</label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 font-mono text-[10px] font-bold py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all"
                  placeholder="0.00"
                  value={voucher.advance || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, advance: parseFloat(e.target.value) || 0 });
                    setIsEditing(true);
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block">Unpaid Balance Remaining (AED)</label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 font-mono text-[10px] font-bold py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all"
                  placeholder="0.00"
                  value={voucher.balance || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, balance: parseFloat(e.target.value) || 0 });
                    setIsEditing(true);
                  }}
                />
              </div>

              {/* 9. Particulars/Narration */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9.5px] font-bold text-slate-700 uppercase tracking-wider block">Voucher Particulars Description (Narration)</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 font-sans font-semibold text-[10px] uppercase py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all resize-none"
                  placeholder="DESCRIBE TRANSACTION MOTIVE (E.G. BEING SETTLEMENT OF BILLS...)"
                  value={voucher.narration || ''}
                  onChange={(e) => {
                    setVoucher({ ...voucher, narration: e.target.value.toUpperCase() });
                    setIsEditing(true);
                  }}
                />
              </div>

            </div>

            {/* Collapsible / Conditional Cheque and Bank Details Card */}
            {voucher.paymentMode !== 'CASH' ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider leading-none">Security Payment Instrument Details</h4>
                    <p className="text-[8.5px] text-slate-400 mt-0.5">Required for all Cheques and Bank Wire transfers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider block">
                      {getChequeNoLabel(voucher.paymentMode)}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white text-slate-800 font-mono text-[9.5px] font-semibold py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all"
                      placeholder={voucher.paymentMode === 'CASH' ? "REFERENCE NO..." : voucher.paymentMode === 'BANK TRANSFER' ? "TT REFERENCE NO..." : "CHQ-REF No..."}
                      value={voucher.chequeNoDetails || ''}
                      onChange={(e) => {
                        setVoucher({ ...voucher, chequeNoDetails: e.target.value.toUpperCase() });
                        setIsEditing(true);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider block">
                      {getChequeDateLabel(voucher.paymentMode)}
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white text-slate-855 font-mono text-[9.5px] font-bold py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all cursor-pointer"
                      value={voucher.chequeDate || ''}
                      onChange={(e) => {
                        setVoucher({ ...voucher, chequeDate: e.target.value });
                        setIsEditing(true);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider block">
                      {accountCategory === 'PAYABLES' ? 'Supplier Bank A/C / IBAN' : 'Customer Bank A/C / IBAN'}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white text-slate-800 font-mono font-bold text-[9.5px] uppercase py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all"
                      placeholder="e.g. AE9404... / A/C 02427..."
                      value={voucher.clientBankAccount || ''}
                      onChange={(e) => {
                        setVoucher({ ...voucher, clientBankAccount: e.target.value.toUpperCase() });
                        setIsEditing(true);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider block">Cheque Drawee Bank</label>
                    <input
                      type="text"
                      className="w-full bg-white text-slate-800 font-sans font-bold text-[9.5px] uppercase py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all"
                      placeholder="e.g. RAKBANK / EMIRATES NBD / DIB / ADCB..."
                      value={voucher.chequeBankName ?? voucher.bankName ?? ''}
                      onChange={(e) => {
                        setVoucher({ ...voucher, chequeBankName: e.target.value.toUpperCase(), bankName: e.target.value.toUpperCase() });
                        setIsEditing(true);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider block">Cheque Bank Address / Branch Location</label>
                  <input
                    type="text"
                    className="w-full bg-white text-slate-800 font-sans font-semibold text-[9px] uppercase py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f37021]/40 focus:border-[#f37021] transition-all"
                    placeholder="e.g. King Faisal Street, Sharjah / Ajman Branch, UAE..."
                    value={voucher.bankAddress || ''}
                    onChange={(e) => {
                      setVoucher({ ...voucher, bankAddress: e.target.value.toUpperCase() });
                      setIsEditing(true);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-dashed border-emerald-500/20 text-center text-slate-400 select-none text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 py-6">
                <Check className="w-4 h-4 text-emerald-500" />
                No Cheque details required for Cash Receipts
              </div>
            )}

            {/* Form Action Controls */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 flex-wrap">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeReceipt) {
                      setVoucher({ ...activeReceipt });
                    }
                    setIsEditing(false);
                    triggerToast("Discarded unsaved voucher changes.");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all px-4 py-2 font-sans font-bold uppercase tracking-wider text-[10px] cursor-pointer rounded-xl active:scale-95"
                >
                  Discard Changes
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setPreviewReceipt(voucher);
                  triggerToast(`Opening live preview for receipt RV ${voucher.voucherNo}...`);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white transition-all px-4 py-2 font-sans font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5 shadow-md rounded-xl active:scale-95"
              >
                <Eye className="w-4 h-4" /> Preview Slip
              </button>
              <button
                type="button"
                onClick={() => handlePrintVoucher(voucher)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all px-4 py-2 font-sans font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5 shadow-md rounded-xl active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print Official Slip
              </button>
              <button
                type="button"
                onClick={handleSaveReceipt}
                className="bg-[#f37021] hover:bg-orange-600 text-white transition-all px-5 py-2.5 font-sans font-bold uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5 shadow-md rounded-xl active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Ledger Entry
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* HIGH-FIDELITY RECEIPT VOUCHER PREVIEW MODAL */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-700 overflow-hidden flex flex-col h-[92vh]">
            {/* Header toolbar */}
            <div className="bg-slate-950 text-white p-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-xs font-bold tracking-wide uppercase font-sans text-slate-100 flex items-center gap-2">
                    <span>{previewReceipt.accountCategory === 'PAYABLES' ? 'PV' : 'RV'} {previewReceipt.voucherNo}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-amber-400">PRINT PREVIEW (EXACT PRINT REPLICA)</span>
                  </h3>
                  <p className="text-[9.5px] text-slate-400 font-mono">
                    Official {companyProfile.name} Voucher Slip
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintVoucher(previewReceipt)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" /> Print PDF Copy
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewReceipt(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Exact Print Copy Frame */}
            <div className="flex-1 bg-slate-800 p-2 overflow-hidden flex items-center justify-center">
              <iframe
                srcDoc={generateVoucherHtml(previewReceipt)}
                className="w-full h-full border-0 rounded-xl bg-white shadow-2xl"
                title="Voucher Print PDF Preview"
              />
            </div>

            {/* Footer toolbar */}
            <div className="bg-slate-950 p-3 flex justify-between items-center border-t border-slate-800 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">
                Showing 100% exact replica of paper output and PDF print copy.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintVoucher(previewReceipt)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Now
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewReceipt(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT DIRECTORY & OUTSTANDING BALANCES DRAWER MODAL */}
      {showClientListDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-[200] animate-fade-in no-print p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl h-[92vh] border border-slate-300 overflow-hidden flex flex-col font-sans">
            
            {/* Drawer Header */}
            <div className="bg-[#083c54] text-white p-3.5 flex items-center justify-between border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#f37021]" />
                <div>
                  <h3 className="text-xs font-bold tracking-wide uppercase font-sans text-white flex items-center gap-2">
                    <span>Client & Supplier Directory</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-[#f37021]">Outstanding Balances</span>
                  </h3>
                  <p className="text-[9.5px] text-slate-300 font-mono">
                    Select client to populate voucher party and calculate unpaid invoices
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowClientListDrawer(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search & Controls */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-col gap-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search client name, address, or location..."
                  value={clientDrawerSearch}
                  onChange={(e) => setClientDrawerSearch(e.target.value)}
                  className="w-full bg-white text-slate-900 font-bold uppercase pl-8 pr-8 py-1.5 rounded-lg border border-slate-300 text-[10px] focus:outline-none focus:border-[#007acc]"
                />
                {clientDrawerSearch && (
                  <button
                    type="button"
                    onClick={() => setClientDrawerSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                <span className="text-slate-500">
                  Total Accounts: {clientsList.length}
                </span>
                <span className="text-blue-700 font-mono">
                  Active Mode: {accountCategory === 'PAYABLES' ? 'PAYABLES (SUPPLIERS)' : 'RECEIVABLES (CUSTOMERS)'}
                </span>
              </div>
            </div>

            {/* Drawer Client List Table with Right-Side Outstanding Balances */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 bg-slate-50">
              {clientsList
                .filter(c => {
                  if (!clientDrawerSearch) return true;
                  const query = clientDrawerSearch.trim().toUpperCase();
                  return (
                    c.name.toUpperCase().includes(query) ||
                    (c.address && c.address.toUpperCase().includes(query))
                  );
                })
                .map((client) => {
                  const isSupplier = accountCategory === 'PAYABLES';
                  const balance = getClientOutstandingBalance(client.name, isSupplier);
                  const isCurrentlySelected = cleanClientName(voucher.clientName) === cleanClientName(client.name);

                  return (
                    <div
                      key={client.id || client.name}
                      onClick={() => {
                        handleSelectCustomerAccount(
                          client.name,
                          isSupplier
                        );
                        setShowClientListDrawer(false);
                      }}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrentlySelected
                          ? 'bg-sky-50 border-[#007acc] shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSupplier ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-[11px] text-slate-800 uppercase tracking-tight truncate">
                              {client.name}
                            </span>
                            {isCurrentlySelected && (
                              <span className="bg-[#007acc] text-white text-[7px] font-black px-1.5 py-0.2 rounded uppercase">
                                Active Selected
                              </span>
                            )}
                          </div>
                          {client.address && (
                            <p className="text-[9px] text-slate-500 font-normal truncate mt-0.5">
                              {client.address}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side: Outstanding Balance Display */}
                      <div className="text-right shrink-0">
                        <div className={`text-[11px] font-mono font-extrabold ${
                          balance > 0
                            ? (isSupplier ? 'text-amber-700' : 'text-blue-700')
                            : 'text-slate-400'
                        }`}>
                          AED {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className={`text-[7.5px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            balance > 0 ? (isSupplier ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800') : 'bg-slate-100 text-slate-500'
                          }`}>
                            {balance > 0 ? 'Outstanding' : 'Cleared / Balanced'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {clientsList.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-bold uppercase text-[10px]">
                  No clients recorded in directory.
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowClientListDrawer(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] uppercase rounded-lg cursor-pointer"
              >
                Close Directory
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT COMPANY HEADER MODAL */}
      <EditCompanyModal
        isOpen={showEditCompanyModal}
        onClose={() => setShowEditCompanyModal(false)}
        onSaved={(updated) => setCompanyProfile(updated)}
      />

    </div>
  );
};
