import React, { useState, useEffect } from 'react';
import { 
  Trash2, Search, X, Check,
  Hexagon, Ruler, Link2, Disc, Anchor, Droplet, Settings, Shield, ArrowUpCircle, Layers, Grid, Hammer, Pin,
  FolderPlus, XCircle, Pencil, Cloud, FileText
} from 'lucide-react';
import { AppUser } from '../types';

// Technical Standard Reference Sheets Only

interface TechnicalViewProps {
  currentUser: AppUser | null;
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('structural bolt')) return <Hexagon className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
  if (cat.includes('all thread')) return <Ruler className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />;
  if (cat.includes('stud bolt')) return <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  if (cat.includes('nuts')) return <Hexagon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
  if (cat.includes('washer')) return <Disc className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
  if (cat.includes('anchor bolt')) return <Anchor className="w-3.5 h-3.5 text-red-500 shrink-0" />;
  if (cat.includes('anchor')) return <Anchor className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
  if (cat.includes('adhesive')) return <Droplet className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
  if (cat.includes('socket screw')) return <Settings className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
  if (cat.includes('machine')) return <Settings className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
  if (cat.includes('self tapping')) return <Settings className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
  if (cat.includes('sds screw')) return <Settings className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
  if (cat.includes('security')) return <Shield className="w-3.5 h-3.5 text-red-600 shrink-0" />;
  if (cat.includes('lifting') || cat.includes('lifiting')) return <ArrowUpCircle className="w-3.5 h-3.5 text-violet-600 shrink-0" />;
  if (cat.includes('pipe support')) return <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
  if (cat.includes('u bolt')) return <Link2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
  if (cat.includes('rivet')) return <Disc className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
  if (cat.includes('pin')) return <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  if (cat.includes('tray')) return <Grid className="w-3.5 h-3.5 text-yellow-600 shrink-0" />;
  if (cat.includes('bar')) return <Ruler className="w-3.5 h-3.5 text-teal-500 shrink-0" />;
  if (cat.includes('hardware') || cat.includes('hartdware')) return <Hammer className="w-3.5 h-3.5 text-stone-600 shrink-0" />;
  return <Hexagon className="w-3.5 h-3.5 text-[#f37021] shrink-0" />;
};

interface DataSheetItem {
  id: string;
  category: string;
  description: string;
  driveLink: string;
}

const CATEGORIES = [
  "Structurtal Bolts",
  "All Thread & Studs",
  "Stud Bolts",
  "Nuts",
  "Washer",
  "Anchors",
  "Adhesives",
  "Socket Screws",
  "machine Screws",
  "Self Tapping Screws",
  "SDS Screws",
  "Security Fasteners",
  "Lifiting Accessories",
  "Pipe Support Systems",
  "Anchor Bolt",
  "U Bolts",
  "Rivets",
  "Pins",
  "Cable Trays",
  "Round Bars",
  "Hardware"
];

const INITIAL_SHEETS: DataSheetItem[] = [
  { id: '1', category: 'Structurtal Bolts', description: 'ASTM A325 HIGH TENSILE STRUCTURAL BOLTING ASSEMBLY specifications & torque charts.', driveLink: 'https://drive.google.com/drive/search?q=Structural%20Bolts' },
  { id: '2', category: 'All Thread & Studs', description: 'DIN 975/976 CONTINUOUS ALL THREAD RODS in Grade 4.8 / 8.8 and high resistance metrics.', driveLink: 'https://drive.google.com/drive/search?q=All%20thread%20Stud' },
  { id: '3', category: 'Stud Bolts', description: 'ASTM A193 GRADE B7/B8/B16 DOUBLE END HEAVY FLANGE STUD FASTENERS for marine pipe assemblies.', driveLink: 'https://drive.google.com/drive/search?q=Stud%20bolts' },
  { id: '4', category: 'Nuts', description: 'DIN 934 CLASS 8 HEX NUT', driveLink: 'https://drive.google.com/drive/search?q=Nuts' },
  { id: '5', category: 'Nuts', description: 'DIN 934 CLASS 10 HEX NUT', driveLink: 'https://drive.google.com/drive/search?q=Nuts%20Class%2010' },
  { id: '6', category: 'Washer', description: 'DIN 125 FORM A FLAT WASHERS - standard size steel spacing plate distribution charts.', driveLink: 'https://drive.google.com/drive/search?q=Washers' },
  { id: '7', category: 'Washer', description: 'DIN 127 B SPRING LOCK WASHER - carbon spring steel anti-vibration tension washers.', driveLink: 'https://drive.google.com/drive/search?q=Spring%20Washers' },
  { id: '8', category: 'Anchors', description: 'RAWLBOLT MASONRY ANCHORS AND EXPANSION WEDGE BEAM CAST SLABS.', driveLink: 'https://drive.google.com/drive/search?q=Anchors' },
  { id: '9', category: 'Adhesives', description: 'STRUCTURAL EPOXY CHEMICAL RESIN CAP SULES for concrete heavy load casting rods.', driveLink: 'https://drive.google.com/drive/search?q=Adhesives' },
  { id: '10', category: 'Socket Screws', description: 'DIN 912 HEX SOCKET HEAD CAP SCREWS high tensile alloy specifications.', driveLink: 'https://drive.google.com/drive/search?q=Socket%20Screws' },
  { id: '11', category: 'machine Screws', description: 'DIN 7985 PHILLIPS PAN HEAD CROSS RECESSED METRIC CORE FASTENERS.', driveLink: 'https://drive.google.com/drive/search?q=Machine%20Screws' },
  { id: '12', category: 'Self Tapping Screws', description: 'DIN 7981 PAN HEAD SHEET METAL FASTENERS - self forming coarse threads.', driveLink: 'https://drive.google.com/drive/search?q=Self-tapping%20screws' },
  { id: '13', category: 'SDS Screws', description: 'HEX TEK POINT SELF DRILLING STEEL CLADDING SCREWS WITH INTEGRATED EPDM WASHERS.', driveLink: 'https://drive.google.com/drive/search?q=SDS%20Screws' },
  { id: '14', category: 'Security Fasteners', description: 'TAMPER-PROOF HEX PIN HOLE CORROSION FREE STRUCTURAL SECURITY FASTENERS.', driveLink: 'https://drive.google.com/drive/search?q=Security%20fasteners' },
  { id: '15', category: 'Lifiting Accessories', description: 'DIN 580 EYE BOLTS AND LOAD COLLARS constructed for heavy marine crane assemblies.', driveLink: 'https://drive.google.com/drive/search?q=Lifting%20Accessories' },
  { id: '16', category: 'Pipe Support Systems', description: 'RUBBER CUSHION SPLIT COLLAR HOOP HANGERS for industrial water & fuel conduits.', driveLink: 'https://drive.google.com/drive/search?q=Pipe%20Support' },
  { id: '17', category: 'Anchor Bolt', description: 'J-SHAPED AND L-SHAPED FOUNDATION MOUNTING ANCHORS with structural base plates.', driveLink: 'https://drive.google.com/drive/search?q=Anchor%20bolts' },
  { id: '18', category: 'U Bolts', description: 'ROUND BEND MARINE GRADE GALVANIZED STEEL CLAMPING LOOPS for UAE pipeline structures.', driveLink: 'https://drive.google.com/drive/search?q=U%20bolts' },
  { id: '19', category: 'Rivets', description: 'BLIND POP RIVETS aluminum dome head structure multi grip variables.', driveLink: 'https://drive.google.com/drive/search?q=Rivets' },
  { id: '20', category: 'Pins', description: 'DIN 94 COTTER SPLIT PINS AND HARNESS RECTANGULAR QUICK TENSION AXLES.', driveLink: 'https://drive.google.com/drive/search?q=Pins' },
  { id: '21', category: 'Cable Trays', description: 'HEAVY VENTILATED RETURN FLANGE STEEL TRUNK GRIDS for Gulf industrial networks.', driveLink: 'https://drive.google.com/drive/search?q=Cable%20trays' },
  { id: '22', category: 'Round Bars', description: 'HOT ROLLED STRUCTURAL SMOOTH TELESCOPIC REINFORCING ROUND SHAFT BARS.', driveLink: 'https://drive.google.com/drive/search?q=Round%20Bars' },
  { id: '23', category: 'Hardware', description: 'STAINLESS CORNER BRACKETS, SNAP SHACKLES, AND INDUSTRIAL BRASS LEVEL TOGGLES.', driveLink: 'https://drive.google.com/drive/search?q=Hardware' }
];

export default function TechnicalView({ currentUser }: TechnicalViewProps) {
  const isAdmin = currentUser !== null && currentUser.role === 'Admin';
  const isEditor = currentUser !== null && currentUser.role === 'Editor';
  const canEdit = isAdmin || isEditor;

  const [dataSheets, setDataSheets] = useState<DataSheetItem[]>(() => {
    const saved = localStorage.getItem('MF_TECHNICAL_DATASHEETS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback to defaults
      }
    }
    return INITIAL_SHEETS;
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Confirmation Action State for Deletion (Avoiding standard window.confirm iframe-blocker)
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Form states for insertion
  const [formCategory, setFormCategory] = useState('Structurtal Bolts');
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState('');

  // Inline Row Editor States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLink, setEditLink] = useState('');

  const handleStartEdit = (item: DataSheetItem) => {
    if (!canEdit) return;
    setEditingId(item.id);
    setEditCategory(item.category);
    setEditDesc(item.description);
    setEditLink(item.driveLink);
    setDeleteConfirmationId(null); // Cancel any delete checks on edit initiation
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCategory('');
    setEditDesc('');
    setEditLink('');
  };

  const handleSaveEdit = (id: string) => {
    if (!canEdit) return;
    if (!editDesc.trim()) return;
    const updated = dataSheets.map(item => {
      if (item.id === id) {
        return {
          ...item,
          category: editCategory,
          description: editDesc.trim().toUpperCase(),
          driveLink: editLink.trim() || `https://drive.google.com/drive/search?q=${encodeURIComponent(editDesc.trim() || editCategory)}`
        };
      }
      return item;
    });
    setDataSheets(updated);
    localStorage.setItem('MF_TECHNICAL_DATASHEETS', JSON.stringify(updated));
    setEditingId(null);
  };

  // 1. Filter data sheets based on:
  // - General search query (description or category)
  // - Selection of the specific category button
  const displayedSheets = dataSheets.filter(sheet => {
    const matchesSearch = searchQuery === '' || 
      sheet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !activeCategory || 
      sheet.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Pagination parameters
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Automatically reset to page 1 whenever search terms or categories are updated
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const totalItems = displayedSheets.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSheets = displayedSheets.slice(startIndex, endIndex);

  const handleInsertRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!formDesc.trim()) return;

    const newRecord: DataSheetItem = {
      id: Date.now().toString(),
      category: formCategory,
      description: formDesc.toUpperCase(),
      driveLink: formLink.trim() || `https://drive.google.com/drive/search?q=${encodeURIComponent(formDesc.trim() || formCategory)}`
    };

    const updated = [...dataSheets, newRecord];
    setDataSheets(updated);
    localStorage.setItem('MF_TECHNICAL_DATASHEETS', JSON.stringify(updated));

    // Reset fields
    setFormDesc('');
    setFormLink('');
    setShowAddForm(false);
  };

  const executeDeleteRecord = (id: string) => {
    if (!isAdmin) return;
    const updated = dataSheets.filter(item => item.id !== id);
    setDataSheets(updated);
    localStorage.setItem('MF_TECHNICAL_DATASHEETS', JSON.stringify(updated));
    setDeleteConfirmationId(null);
  };

  return (
    <div className="space-y-5 bg-white py-4 px-4 select-none md:px-6 box-shaped text-[11px] no-print">
      
      {/* Primary Technical Section Header */}
      <div className="border-b-2 border-slate-900 pb-2.5 gap-2 flex flex-col sm:flex-row items-center justify-between">
        <h3 className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#083c54] flex items-center gap-1.8">
          <FileText className="w-4 h-4 text-[#f37021]" />
          <span>TECHNICAL SPECIFICATIONS DIRECTORY</span>
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.8 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE SPEC DB INDEX</span>
        </div>
      </div>

      <div className="space-y-4">
          {/* Simplified Control Panel with Select dropdown */}
          <div className="bg-slate-50 p-3 border border-slate-300 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-4 bg-[#f37021] block"></span>
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                SPECIFICATIONS INDEX
              </h4>
              {!canEdit && (
                <span className="bg-slate-150 text-slate-500 font-mono text-[8px] px-1.5 py-0.5 uppercase font-bold tracking-wider border border-slate-200">
                  🔒 READ ONLY
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Category Dropdown Filter */}
              <div className="relative select-none w-full sm:w-auto">
                <select
                  value={activeCategory || ''}
                  onChange={(e) => setActiveCategory(e.target.value || null)}
                  className="w-full sm:w-44 px-2 py-1 text-[10px] bg-white border border-slate-350 focus:outline-none focus:border-[#f37021] text-slate-900 font-bold uppercase tracking-tight h-7.5"
                >
                  <option value="">ALL CATEGORIES</option>
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat.toUpperCase()} ({dataSheets.filter(s => s.category.toLowerCase() === cat.toLowerCase()).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action to search datasheet description */}
              <div className="relative flex items-center w-full sm:w-auto select-none">
                <Search className="w-3 h-3 text-[#083c54] absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="SEARCH SPECIFICATIONS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-44 pl-7.5 pr-6 py-1 text-[10px] bg-white border border-slate-350 focus:outline-none focus:border-[#f37021] text-slate-900 font-bold placeholder:text-slate-400 uppercase tracking-tight h-7.5"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 cursor-pointer font-bold text-[9px]"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Add New Specification Toggle if allowed */}
              {canEdit && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className={`px-3 py-1.8 text-[9.5px] transition-all uppercase font-black tracking-wider border focus:outline-none select-none cursor-pointer h-7.5 flex items-center gap-1.5 shadow-3xs ${
                    showAddForm
                      ? 'border-red-600 text-red-600 bg-red-50/10'
                      : 'border-slate-900 text-slate-800 bg-white hover:border-[#083c54] hover:bg-slate-50'
                  }`}
                >
                  {showAddForm ? '✕ CLOSE' : '＋ ADD NEW'}
                </button>
              )}

              {/* Complete Reset Button */}
              {(activeCategory || searchQuery) && (
                <button
                  onClick={() => {
                    setActiveCategory(null);
                    setSearchQuery('');
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[9px] uppercase transition-colors tracking-wider border border-slate-950 shrink-0 cursor-pointer h-7.5 flex items-center justify-center"
                >
                  RESET
                </button>
              )}
            </div>
          </div>

          {/* Insert new datasheet form container */}
          {showAddForm && (
            <div className="border border-slate-900 p-4 max-w-2xl bg-white space-y-3.5 shadow-sm">
              <div className="text-[10px] text-slate-900 font-black uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>★ NEW TECHNICAL DOCUMENT SPECIFICATION DETAIL</span>
                <span className="w-2 h-3 bg-[#f37021]"></span>
              </div>
              <form onSubmit={handleInsertRecord} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[8.5px] uppercase font-black text-slate-500 mb-1 font-mono tracking-wider">Select Target Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-350 focus:outline-none focus:border-[#f37021] font-mono font-bold h-8 text-slate-700 uppercase text-[9.5px]"
                    >
                      {CATEGORIES.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8.5px] uppercase font-black text-slate-500 mb-1 font-mono tracking-wider">Document Drive Link (PDF/Web Link)</label>
                    <input
                      type="url"
                      placeholder="e.g. https://drive.google.com/..."
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-350 focus:outline-none focus:border-[#f37021] text-slate-700 h-8 font-mono text-[9.5px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] uppercase font-black text-slate-500 mb-1 font-mono tracking-wider">Technical Specification Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIN 934 CLASS 8 HEX NUT"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-350 focus:outline-none focus:border-[#f37021] uppercase text-slate-850 font-mono font-black placeholder:normal-case h-8 text-[9.5px]"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2 px-5 bg-[#083c54] hover:bg-[#05293a] text-white font-extrabold uppercase text-[9.5px] tracking-wider transition-colors border border-slate-900 cursor-pointer shadow-3xs"
                >
                  SAVE SPECIFICATION
                </button>
              </form>
            </div>
          )}

          {/* Unified Solid Matrix Grid Table - Redesigned with fixed column layout for complete hover stability */}
          <div className="overflow-x-auto border border-[#A6C4DE] shadow-xs select-none">
            <table className="box-shaped-table m-0 w-full text-left table-fixed">
              <thead>
                <tr className="bg-[#083c54] text-white font-sans uppercase text-[10px] tracking-wider">
                  <th className="w-[8%] text-center py-2.5 shrink-0">REF ID</th>
                  <th className="w-[18%] text-left py-2.5 shrink-0">CATEGORY</th>
                  <th className="w-[44%] text-left py-2.5 shrink-0">TECHNICAL SPECIFICATION DESCRIPTION</th>
                  <th className="w-[15%] text-center py-2.5 font-bold text-[#f37021] shrink-0">DRIVE DOC</th>
                  <th className="w-[15%] text-center py-2.5 shrink-0">CONTROLS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSheets.length > 0 ? (
                  paginatedSheets.map((item) => {
                    const isConfirming = deleteConfirmationId === item.id;
                    const isEditing = editingId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        
                        {/* REF ID */}
                        <td className="w-[8%] text-center font-mono text-slate-500 font-bold text-[9.5px] py-2 truncate">
                          #{item.id}
                        </td>

                        {/* CATEGORY */}
                        <td className="w-[18%] text-left py-2">
                          {isEditing ? (
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full p-1 bg-white border border-slate-350 focus:outline-none focus:border-[#f37021] text-slate-800 font-mono font-bold uppercase text-[9.5px] h-7"
                            >
                              {CATEGORIES.map((cat, idx) => (
                                  <option key={idx} value={cat}>{cat}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[9px] font-mono text-slate-700 uppercase font-bold inline-flex items-center gap-1.2 truncate max-w-full">
                              {getCategoryIcon(item.category)}
                              <span className="truncate">{item.category}</span>
                            </span>
                          )}
                        </td>

                        {/* TECHNICAL SPECIFICATION DESCRIPTION (Inventory Textbox Style) */}
                        <td className="w-[44%] text-left py-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-[#f37021] focus:outline-none text-slate-900 font-mono font-bold uppercase text-[10px] tracking-tight h-7 shadow-3xs"
                              required
                            />
                          ) : (
                            <div className="w-full bg-slate-50/75 border border-slate-200 px-2 py-1 text-slate-900 font-mono font-bold text-[10px] uppercase tracking-tight shadow-3xs leading-relaxed select-all break-words">
                              {item.description}
                            </div>
                          )}
                        </td>

                        {/* DOCUMENT DRIVE LINK */}
                        <td className="w-[15%] text-center py-2">
                          {isEditing ? (
                            <input
                              type="url"
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              placeholder="https://drive.google.com/..."
                              className="w-full p-1 bg-white border border-slate-350 focus:outline-none focus:border-[#f37021] text-slate-800 h-7 font-mono text-[9px]"
                            />
                          ) : item.driveLink ? (
                            <a
                              href={item.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.2 py-0.8 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-[8.5px] font-black font-mono uppercase tracking-wider transition-colors cursor-pointer"
                              title="Open/View specification document"
                            >
                              <Cloud className="w-3 h-3 shrink-0" />
                              <span>VIEW PDF</span>
                            </a>
                          ) : (
                            <span className="text-[8px] font-mono text-slate-350 font-bold uppercase tracking-wider">
                              N/A
                            </span>
                          )}
                        </td>

                        {/* CONTROLS */}
                        <td className="w-[15%] text-center py-2">
                          {isEditing ? (
                            <div className="flex justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-1.8 py-0.8 bg-emerald-600 hover:bg-emerald-700 text-white text-[8.5px] font-bold uppercase tracking-tight transition-colors cursor-pointer border border-emerald-700"
                              >
                                SAVE
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-1.8 py-0.8 bg-slate-500 hover:bg-slate-600 text-white text-[8.5px] font-bold uppercase tracking-tight transition-colors cursor-pointer border border-slate-600"
                              >
                                ESC
                              </button>
                            </div>
                          ) : isConfirming ? (
                            <div className="inline-flex items-center gap-1 justify-center animate-in fade-in zoom-in-95 duration-100">
                              <span className="text-[7.5px] font-black uppercase text-rose-500 tracking-wider">SURE?</span>
                              <button
                                type="button"
                                onClick={() => executeDeleteRecord(item.id)}
                                className="bg-red-600 text-white px-1.5 py-0.3 text-[8px] font-bold uppercase tracking-wider hover:bg-red-700 cursor-pointer border border-red-700"
                              >
                                YES
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmationId(null)}
                                className="bg-slate-300 text-slate-700 px-1.5 py-0.3 text-[8px] font-bold uppercase tracking-wider hover:bg-slate-200 cursor-pointer border border-slate-400"
                              >
                                NO
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 select-none">
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1.5 bg-slate-50 hover:bg-amber-500 text-slate-500 hover:text-white border border-slate-200 hover:border-amber-500 rounded transition-all cursor-pointer"
                                  title="Edit specification"
                                >
                                  <Pencil className="w-3 h-3 shrink-0" />
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirmationId(item.id);
                                    setEditingId(null);
                                  }}
                                  className="p-1.5 bg-slate-50 hover:bg-rose-600 text-slate-500 hover:text-white border border-slate-200 hover:border-rose-600 rounded transition-all cursor-pointer"
                                  title="Delete specification"
                                >
                                  <Trash2 className="w-3 h-3 shrink-0" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 bg-white">
                      <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="italic font-bold uppercase font-mono text-[9.5px] tracking-wider text-slate-400">
                        No matching specifications found. Click categories or clear search query to view data.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between border border-[#A6C4DE] bg-slate-50 p-2 text-center px-4 mt-2">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-full sm:w-auto px-3.5 py-1 text-[9px] bg-white border border-slate-300 hover:border-[#f37021] text-slate-700 font-bold uppercase tracking-wider transition-all hover:bg-slate-100 disabled:opacity-45 disabled:pointer-events-none select-none cursor-pointer text-center rounded-none"
              >
                ← PREVIOUS PAGE
              </button>
              
              <div className="text-[10px] font-bold text-slate-800 tracking-wider font-mono">
                PAGE <span className="bg-[#f37021] text-white px-2 py-0.5 font-bold mx-1">{activePage}</span> OF <span className="text-slate-900 font-bold">{totalPages}</span>
                <span className="text-slate-400 ml-2">({totalItems} items filtered)</span>
              </div>

              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-full sm:w-auto px-3.5 py-1 text-[9px] bg-white border border-slate-300 hover:border-[#f37021] text-slate-700 font-bold uppercase tracking-wider transition-all hover:bg-slate-100 disabled:opacity-45 disabled:pointer-events-none select-none cursor-pointer text-center rounded-none"
              >
                NEXT PAGE →
              </button>
            </div>
          )}

          {/* Minimal Footer Info Indicator */}
          <div className="text-[9.5px] text-slate-400 italic flex items-center justify-between pt-0.5 font-mono select-none">
            <span>Showing items {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} filtered ({dataSheets.length} total)</span>
            {activeCategory && (
              <button 
                onClick={() => setActiveCategory(null)}
                className="text-[#f37021] uppercase hover:underline font-bold"
              >
                Clear filter to view all categories
              </button>
            )}
          </div>
        </div>
      </div>
  );
}
