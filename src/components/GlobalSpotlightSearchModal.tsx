import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  FileText,
  Package,
  Truck,
  ClipboardList,
  Building2,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  Clock,
  ExternalLink,
  SlidersHorizontal,
  FolderOpen,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Zap,
  CornerDownLeft,
  Command,
  Database,
  Calendar
} from 'lucide-react';
import { getActiveCompany } from '../utils/companyProfile';

export interface GlobalSearchResult {
  id: string;
  category: 'MODULE' | 'WORK_ORDER' | 'SALES' | 'DELIVERY_NOTE' | 'PACKING_LIST' | 'PRODUCT' | 'CUSTOMER' | 'ANNOUNCEMENT';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  routeTab?: string;
  actionPayload?: any;
  meta?: Record<string, any>;
}

interface GlobalSpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string, extraData?: any) => void;
  onSelectModule?: (tabId: string) => void;
}

export default function GlobalSpotlightSearchModal({
  isOpen,
  onClose,
  onNavigate,
  onSelectModule
}: GlobalSpotlightSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeCompany = getActiveCompany();

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Comprehensive static and local datasets
  const allSearchItems = useMemo<GlobalSearchResult[]>(() => {
    const items: GlobalSearchResult[] = [];

    // 1. ERP Navigation Modules
    const modules: { title: string; subtitle: string; tab: string; badge: string }[] = [
      { title: 'Work Orders & Staging Yard', subtitle: 'Workshop job cards, shift scheduling & staging queue', tab: 'work_orders_suite', badge: 'Operations' },
      { title: 'Tax Invoice & Sales Register', subtitle: 'VAT compliant billing, invoices & commercial records', tab: 'invoice', badge: 'Sales' },
      { title: 'Delivery Notes (DO Manager)', subtitle: 'Material dispatch receipts, vehicle logs & carrier notes', tab: 'delivery_notes', badge: 'Logistics' },
      { title: 'Packing List Suite', subtitle: 'Export box matrices, pallet weights & shipment bundles', tab: 'packing_list', badge: 'Logistics' },
      { title: 'Quotations & RFQ Suite', subtitle: 'Engineering estimates, rate cards & client quotes', tab: 'quotation', badge: 'Sales' },
      { title: 'Daybook & Daily Transactions', subtitle: 'Consolidated voucher register, debits, credits & cash movements', tab: 'daybook', badge: 'Accounts' },
      { title: 'UAE VAT 201 Return & Tax Audit', subtitle: 'Federal Tax Authority standard VAT analysis & filing summary', tab: 'uae_vat_returns', badge: 'Tax / Compliance' },
      { title: 'Customer Statement of Accounts (SOA)', subtitle: 'Client ledgers, aging, running balances & overdue bills', tab: 'customer_soa', badge: 'Ledgers' },
      { title: 'Bank Accounts & Cash Books', subtitle: 'RAK Bank, FAB & petty cash reconciliation', tab: 'bank_accounts_box', badge: 'Banking' },
      { title: 'Supplier Purchase & Requisitions (LPO)', subtitle: 'Vendor purchase orders, LPO records & raw material buying', tab: 'purchase', badge: 'Procurement' },
      { title: 'Expense Manager', subtitle: 'Administrative costs, workshop utilities & operational expenses', tab: 'expenses_view', badge: 'Expenses' },
      { title: 'Stock Reports & Inventory Valuations', subtitle: 'Real-time fastener inventory, batch bin locations & weights', tab: 'products', badge: 'Inventory' },
      { title: 'Quality Control (QC Reports & MTC)', subtitle: 'Mill test certificates, tensile test inspection & heat lot logs', tab: 'qc_reports', badge: 'QC & Inspection' },
      { title: 'Engineering Drawings Register', subtitle: 'Anchor bolts, foundation studs & custom fastener CAD blueprints', tab: 'drawings_register', badge: 'Engineering' },
      { title: 'Technical Fasteners Data Sheets', subtitle: 'DIN, ISO, ASTM dimensions, proof loads & tightening torques', tab: 'data_sheets', badge: 'Technical' },
      { title: 'Fixed Assets Register', subtitle: 'Machinery depreciation, gantry cranes & workshop tools', tab: 'fixed_asset', badge: 'Assets' },
      { title: 'Customer Order Commission & Brokerage', subtitle: 'Sales agent commissions, percentages & clearance records', tab: 'customer_order_commission', badge: 'Commissions' },
      { title: 'Incoming Materials & Inspection', subtitle: 'Raw wire rods, steel billets & incoming heat verification', tab: 'incoming_materials', badge: 'Receiving' },
      { title: 'Coating & Galvanizing Delivery Notes', subtitle: 'Hot dip galvanizing, zinc nickel, cadmium & PTFE job cards', tab: 'coating_accessories', badge: 'Coating' },
      { title: 'Home Dashboard', subtitle: 'Live warehouse overview, dispatch yard, weather & notices', tab: 'home', badge: 'Dashboard' }
    ];

    modules.forEach((mod, idx) => {
      items.push({
        id: `mod_${idx}`,
        category: 'MODULE',
        title: mod.title,
        subtitle: mod.subtitle,
        badge: mod.badge,
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
        routeTab: mod.tab
      });
    });

    // 2. Work Orders (from staging and active records)
    const workOrders = [
      { no: 'WO-84920', client: 'Petrofac UAE', location: 'WH-04', shift: 'Morning Shift', status: 'STAGED', desc: 'SS 316 Studs M20x150, Box: 12, Plt: 2' },
      { no: 'WO-84921', client: 'NPCC Abu Dhabi', location: 'WH-02', shift: 'Morning Shift', status: 'READY', desc: 'Cable tray fasteners, Galvanized grating studs' },
      { no: 'WO-84922', client: 'Drydocks World', location: 'WH-12', shift: 'Evening Shift', status: 'LOADING', desc: 'Marine brass fittings & hex nuts, Export packing' },
      { no: 'WO-84923', client: 'Lamprell Energy', location: 'WH-01', shift: 'Evening Shift', status: 'STAGED', desc: 'Grade 8.8 Anchor bolts, Foundation sets' },
      { no: 'WO-84924', client: 'McDermott ME', location: 'WH-05', shift: 'Night Shift', status: 'STAGED', desc: 'Heavy high-tensile 10.9 structural bolts' },
      { no: 'WO-84925', client: 'Target Engineering', location: 'WH-03', shift: 'Morning Shift', status: 'STAGED', desc: 'Marine grade fasteners package, SS316 A4-80' },
      { no: 'WO-84930', client: 'Al Futtaim Engineering', location: 'WH-07', shift: 'Morning Shift', status: 'READY', desc: 'Threaded rods DIN 975 1M & 2M Zinc Plated' },
      { no: 'WO-84935', client: 'Arabtec Construction', location: 'WH-08', shift: 'Evening Shift', status: 'LOADING', desc: 'High strength ASTM A193 B7 stud bolts with 2H heavy hex nuts' }
    ];

    workOrders.forEach((wo) => {
      items.push({
        id: `wo_${wo.no}`,
        category: 'WORK_ORDER',
        title: `${wo.no} — ${wo.client}`,
        subtitle: `${wo.desc} • Loc: ${wo.location} • ${wo.shift}`,
        badge: wo.status,
        badgeColor: wo.status === 'READY' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : wo.status === 'LOADING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        routeTab: 'work_orders_suite',
        actionPayload: { workOrderNo: wo.no }
      });
    });

    // 3. Sales Invoices
    const salesInvoices = [
      { no: 'MF260353', date: '2026-08-27', buyer: 'CASH CUSTOMER', amount: 'AED 4,850.00', terms: 'IMMEDIATE', doNo: 'MF26A353' },
      { no: 'MF260354', date: '2026-08-28', buyer: 'Petrofac UAE', amount: 'AED 18,240.00', terms: '30 DAYS NET', doNo: 'MF26A354' },
      { no: 'MF260355', date: '2026-08-29', buyer: 'NPCC Abu Dhabi', amount: 'AED 42,600.00', terms: '45 DAYS NET', doNo: 'MF26A355' },
      { no: 'MF260356', date: '2026-08-30', buyer: 'Drydocks World', amount: 'AED 9,750.00', terms: 'IMMEDIATE', doNo: 'MF26A356' },
      { no: 'MF260357', date: '2026-08-31', buyer: 'Lamprell Energy', amount: 'AED 31,500.00', terms: '60 DAYS NET', doNo: 'MF26A357' },
      { no: 'MF260358', date: '2026-09-01', buyer: 'McDermott Middle East', amount: 'AED 15,800.00', terms: '30 DAYS NET', doNo: 'MF26A358' }
    ];

    salesInvoices.forEach((inv) => {
      items.push({
        id: `inv_${inv.no}`,
        category: 'SALES',
        title: `Invoice ${inv.no} • ${inv.buyer}`,
        subtitle: `Amount: ${inv.amount} • Date: ${inv.date} • Terms: ${inv.terms} • DO: ${inv.doNo}`,
        badge: 'Tax Invoice',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        routeTab: 'invoice',
        actionPayload: { invoiceNo: inv.no }
      });
    });

    // 4. Delivery Notes
    const deliveryNotes = [
      { no: 'MF26A353', date: '2026-08-27', client: 'CASH CUSTOMER', terms: 'EX-WORKS', mode: 'SELF PICKUP' },
      { no: 'MF26A354', date: '2026-08-28', client: 'Petrofac UAE', terms: 'FOB JEBEL ALI', mode: 'TRAILER' },
      { no: 'MF26A355', date: '2026-08-29', client: 'NPCC Abu Dhabi', terms: 'EX-WORKS', mode: 'CARGO' },
      { no: 'MF26A356', date: '2026-08-30', client: 'Drydocks World', terms: 'DELIVERED SITE', mode: 'PICKUP 3-TON' },
      { no: 'MF26A357', date: '2026-08-31', client: 'Lamprell Energy', terms: 'EX-WORKS', mode: 'CUSTOMER VEHICLE' }
    ];

    deliveryNotes.forEach((dn) => {
      items.push({
        id: `dn_${dn.no}`,
        category: 'DELIVERY_NOTE',
        title: `DO ${dn.no} • ${dn.client}`,
        subtitle: `Date: ${dn.date} • Mode: ${dn.mode} • Delivery Terms: ${dn.terms}`,
        badge: 'Delivery Note',
        badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
        routeTab: 'delivery_notes',
        actionPayload: { deliveryNoteNo: dn.no }
      });
    });

    // 5. Packing Lists
    const packingLists = [
      { no: 'PL-260353', client: 'CASH CUSTOMER', boxes: 12, pallets: 2, grossWt: '480.50 KG', dest: 'Ajman Workshop' },
      { no: 'PL-260354', client: 'Petrofac UAE', boxes: 45, pallets: 4, grossWt: '1,850.00 KG', dest: 'Abu Dhabi Site' },
      { no: 'PL-260355', client: 'NPCC Abu Dhabi', boxes: 80, pallets: 8, grossWt: '3,420.00 KG', dest: 'Mussafah Yard' },
      { no: 'PL-260356', client: 'Drydocks World', boxes: 24, pallets: 2, grossWt: '920.00 KG', dest: 'Dubai Drydocks Yard' }
    ];

    packingLists.forEach((pl) => {
      items.push({
        id: `pl_${pl.no}`,
        category: 'PACKING_LIST',
        title: `Packing List ${pl.no} • ${pl.client}`,
        subtitle: `Boxes: ${pl.boxes} • Pallets: ${pl.pallets} • Total Weight: ${pl.grossWt} • Dest: ${pl.dest}`,
        badge: 'Packing List',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        routeTab: 'packing_list',
        actionPayload: { packingListNo: pl.no }
      });
    });

    // 6. Products & Fasteners Catalog
    const products = [
      { name: 'Hexagon Head Bolts DIN 933 / ISO 4017 (Full Thread)', grade: 'Grade 8.8 / 10.9 / A2-70 / A4-80', sizes: 'M6 to M64', finish: 'Zinc Plated, HDG, Plain, Black' },
      { name: 'Hexagon Head Bolts DIN 931 / ISO 4014 (Half Thread)', grade: 'Grade 8.8 / 10.9 / 12.9', sizes: 'M8 to M72', finish: 'Hot Dip Galvanized, Zinc Nickel' },
      { name: 'Stud Bolts ASTM A193 B7 with Heavy Hex Nuts A194 2H', grade: 'High Temperature / Pressure B7/2H', sizes: '1/2" to 3-1/2"', finish: 'Fluoropolymer PTFE, Cadmium, HDG' },
      { name: 'Stainless Steel Stud Bolts ASTM A193 B8 / B8M (SS 304 / 316)', grade: 'SS 304 Class 1 & 2 / SS 316', sizes: 'M10 to M52 (3/8" to 2")', finish: 'Passivated Clean' },
      { name: 'Threaded Rods DIN 975 / DIN 976 (1 Meter, 2 Meter, 3 Meter)', grade: 'Class 4.8 / 8.8 / SS316', sizes: 'M4 to M48', finish: 'Zinc Electroplated / HDG' },
      { name: 'Foundation Anchor Bolts (L-Type, J-Type, Plate Welded)', grade: 'ASTM F1554 Grade 36, 55, 105', sizes: 'M16 to M90', finish: 'Hot Dip Galvanized 85 Microns' },
      { name: 'Hexagon Heavy Nuts DIN 934 / ISO 4032 / ASME B18.2.2', grade: 'Grade 8, 10, A2, A4, 2H, 7L', sizes: 'M6 to M100', finish: 'Self Colour, Yellow Zinc, HDG' },
      { name: 'Flat Washers DIN 125A / ISO 7089 & Spring Washers DIN 127B', grade: 'Hardened 200HV, 300HV, SS316', sizes: 'M4 to M80', finish: 'Zinc, HDG, Geomet' },
      { name: 'Cable Trays, Ladder Trays & Unistrut Channels', grade: 'GI Pre-Galvanized & Post HDG', sizes: '50mm to 900mm Width', finish: 'Heavy Duty Return Flange' }
    ];

    products.forEach((prod, pIdx) => {
      items.push({
        id: `prod_${pIdx}`,
        category: 'PRODUCT',
        title: prod.name,
        subtitle: `Grades: ${prod.grade} • Sizes: ${prod.sizes} • Finish: ${prod.finish}`,
        badge: 'Fastener / Stock',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        routeTab: 'products'
      });
    });

    // 7. Customers & Ledgers
    const customers = [
      { name: 'Petrofac International UAE', short: 'Petrofac UAE', trn: '100298374600003', loc: 'Sharjah & Abu Dhabi', type: 'Credit Customer' },
      { name: 'National Petroleum Construction Company (NPCC)', short: 'NPCC Abu Dhabi', trn: '100492817200003', loc: 'Mussafah, Abu Dhabi', type: 'EPC Contractor' },
      { name: 'Drydocks World Dubai LLC', short: 'Drydocks World', trn: '100583726100003', loc: 'Port Rashid, Dubai', type: 'Marine Shipyard' },
      { name: 'Lamprell Energy Limited', short: 'Lamprell Energy', trn: '100372619400003', loc: 'Hamriyah Free Zone, Sharjah', type: 'Rig Fabrication' },
      { name: 'McDermott Middle East Inc', short: 'McDermott ME', trn: '100482910400003', loc: 'Jebel Ali Free Zone, Dubai', type: 'Offshore Energy' },
      { name: 'Target Engineering Construction Co.', short: 'Target Engineering', trn: '100294820100003', loc: 'Abu Dhabi', type: 'Civil & Mechanical' },
      { name: 'Cash Customer Over The Counter', short: 'Cash Customer', trn: '—', loc: 'Ajman Showroom / Yard Counter', type: 'Walk-in Cash' }
    ];

    customers.forEach((cust, cIdx) => {
      items.push({
        id: `cust_${cIdx}`,
        category: 'CUSTOMER',
        title: `${cust.name} (${cust.short})`,
        subtitle: `TRN: ${cust.trn} • Loc: ${cust.loc} • Classification: ${cust.type}`,
        badge: 'Customer / SOA',
        badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
        routeTab: 'customer_soa'
      });
    });

    // 8. Announcements & Bulletins
    const bulletins = [
      { title: 'Safety Audit Verification: Fastener sorting unit Yard 2', date: '2026-08-28', cat: 'SAFETY AUDIT' },
      { title: 'Inventory Re-balance: High-tensile 10.9 & 12.9 socket head bolts restocked', date: '2026-08-26', cat: 'INVENTORY' },
      { title: 'Pricing Policy: Updated discount schedule for structural fasteners', date: '2026-08-20', cat: 'POLICY' },
      { title: 'Workshop Routine: Urgent site dispatch work orders staged by 08:30 AM', date: '2026-08-15', cat: 'WORKSHOP' }
    ];

    bulletins.forEach((b, bIdx) => {
      items.push({
        id: `ann_${bIdx}`,
        category: 'ANNOUNCEMENT',
        title: b.title,
        subtitle: `Category: ${b.cat} • Published Date: ${b.date}`,
        badge: b.cat,
        badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        routeTab: 'home'
      });
    });

    return items;
  }, []);

  // Filtered results based on search input
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      // Return top essential modules when query is empty
      return allSearchItems.slice(0, 8);
    }

    // Text matching across title, subtitle, badge
    return allSearchItems
      .filter(item => {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubtitle = item.subtitle.toLowerCase().includes(q);
        const matchBadge = item.badge?.toLowerCase().includes(q);
        return matchTitle || matchSubtitle || matchBadge;
      })
      .slice(0, 15);
  }, [allSearchItems, query]);

  // Adjust selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        executeSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const executeSelect = (item: GlobalSearchResult) => {
    onClose();
    if (item.routeTab) {
      if (onNavigate) {
        onNavigate(item.routeTab, item.actionPayload);
      } else if (onSelectModule) {
        onSelectModule(item.routeTab);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MODULE': return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'WORK_ORDER': return <ClipboardList className="w-4 h-4 text-blue-500" />;
      case 'SALES': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'DELIVERY_NOTE': return <Truck className="w-4 h-4 text-cyan-500" />;
      case 'PACKING_LIST': return <Package className="w-4 h-4 text-purple-500" />;
      case 'PRODUCT': return <Database className="w-4 h-4 text-amber-500" />;
      case 'CUSTOMER': return <Building2 className="w-4 h-4 text-rose-500" />;
      case 'ANNOUNCEMENT': return <ShieldAlert className="w-4 h-4 text-slate-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="global-spotlight-search-overlay"
      className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-xs flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="global-spotlight-search-container"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-100"
        onKeyDown={handleKeyDown}
      >
        {/* Simple Clean Search Bar */}
        <div className="flex items-center px-4 py-3 gap-3 bg-white dark:bg-slate-900">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-spotlight-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent border-0 outline-none text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 p-0"
            autoComplete="off"
            spellCheck="false"
          />
          {query ? (
            <button
              type="button"
              id="clear-global-search-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 select-none">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="global-search-results-list"
          className="border-t border-slate-100 dark:border-slate-800/80 max-h-[340px] overflow-y-auto p-1.5 scrollbar-thin"
        >
          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No results found
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`search-item-${item.id}`}
                  onClick={() => executeSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="shrink-0 text-slate-400">
                      {getCategoryIcon(item.category)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate text-slate-800 dark:text-slate-100">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
