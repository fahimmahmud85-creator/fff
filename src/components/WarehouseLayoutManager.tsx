import React, { useState } from 'react';
import { WarehouseLayout, AppUser } from '../types';
import { 
  Plus, 
  Trash2, 
  Check, 
  X,
  Pencil,
  Cloud
} from 'lucide-react';

interface WarehouseLayoutManagerProps {
  layouts: WarehouseLayout[];
  onUpdateLayout: (id: string, newLink: string, newName?: string, newDesc?: string) => void;
  onDeleteLayout: (id: string) => void;
  onCreateLayout: (name: string, pdfLink: string, description: string) => void;
  currentUser: AppUser | null;
}

export default function WarehouseLayoutManager({
  layouts,
  onUpdateLayout,
  onDeleteLayout,
  onCreateLayout,
  currentUser: originalCurrentUser,
}: WarehouseLayoutManagerProps) {
  // Map Editor to local Admin role in warehouse layout block to authorize all database mutations
  const currentUser = originalCurrentUser ? {
    ...originalCurrentUser,
    role: originalCurrentUser.role === 'Editor' ? 'Admin' : originalCurrentUser.role
  } as AppUser : null;

  const isAdmin = currentUser?.role === 'Admin';
  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Editor';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // States for creating a brand-new layout row
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Sandbox-safe deletion state (no window.confirm popup blocker)
  const [layoutDeleteConfirmId, setLayoutDeleteConfirmId] = useState<string | null>(null);

  const handleStartEdit = (layout: WarehouseLayout) => {
    setEditingId(layout.id);
    setEditName(layout.name);
    setEditLink(layout.pdfLink || '');
    setEditDesc(layout.description || '');
  };

  const handleSaveInline = (id: string) => {
    onUpdateLayout(id, editLink.trim(), editName.trim().toUpperCase(), editDesc.trim());
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateLayout(
      newName.trim().toUpperCase(),
      newLink.trim(),
      newDesc.trim() || 'Floor Storage Coordinates'
    );
    setNewName('');
    setNewLink('');
    setNewDesc('');
    setIsAddingNew(false);
  };

  const handleViewMap = (layout: WarehouseLayout) => {
    if (!layout.pdfLink) {
      if (canEdit) {
        handleStartEdit(layout);
      }
      return;
    }
    window.open(layout.pdfLink, '_blank');
  };

  return (
    <div className="space-y-4 font-sans max-w-md">
      
      {/* Upper header section with "Add Layout Row" trigger */}
      <div className="flex flex-row justify-between items-center pb-2 select-none">
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-900 tracking-wider">Warehouse layout registry</h3>
        </div>
        
        {canEdit && (
          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="group relative px-3 py-1.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white text-[9.5px] font-bold uppercase tracking-wider rounded border border-brand-orange hover:border-orange-500 shadow-md cursor-pointer flex items-center gap-1.5 transition-all duration-300 transform active:scale-95 overflow-hidden"
          >
            {/* Shimmer reflection highlight effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
            
            <Plus className="w-3.5 h-3.5 stroke-[3.5] text-brand-orange group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10 font-bold">ADD LAYOUT RECORD</span>
          </button>
        )}
      </div>

      {/* Add New Layout form, styled beautifully and minimally */}
      {isAddingNew && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 border border-slate-200 p-4 space-y-3 rounded-none animate-none max-w-2xl mx-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-[10px] font-bold font-mono text-slate-850 uppercase tracking-widest">
              ⚙️ ADD NEW WAREHOUSE MAP ROW
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Layout/Floor Name:</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. 35E SECOND DRIVEWAY"
                className="w-full text-xs p-2 bg-white border border-slate-250 focus:outline-none focus:border-slate-800 focus:ring-0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Google Drive PDF / Image Link:</label>
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full text-xs p-2 bg-white border border-slate-250 focus:outline-none focus:border-slate-800 focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Description / Notes:</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Operational description..."
              className="w-full text-xs p-2 bg-white border border-slate-250 focus:outline-none focus:border-slate-800 focus:ring-0"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-[10px] font-bold uppercase bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
            >
              Append Record
            </button>
          </div>
        </form>
      )}

      {/* Elegant Layout List exactly matching reference photo - Responsive Fit */}
      <div className="border border-slate-200 bg-white shadow-3xs w-full max-w-full md:max-w-lg overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-slate-200 text-slate-900 font-bold bg-slate-50/20">
              {/* Left Column Heading: WAREHOUSE LAYOUT */}
              <th className="py-2 px-3 font-bold text-slate-900 text-[10.5px] text-left uppercase tracking-wider">
                WAREHOUSE LAYOUT
              </th>
              {/* Right Column Heading: ACTIONS */}
              <th className="py-2 px-3 font-bold text-slate-900 text-[10.5px] text-right uppercase tracking-wider w-28">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {layouts.map((layout) => {
              const isEditing = editingId === layout.id;
              const hasLink = !!layout.pdfLink;

              return (
                <tr 
                  key={layout.id} 
                  className={`group/row transition-all duration-100 ${
                    isEditing ? 'bg-slate-50/70' : 'hover:bg-slate-50/20'
                  }`}
                >
                  {/* Left Column: Layout information */}
                  <td className="py-2 px-3 align-middle">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 max-w-2xl animate-none py-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">LAYOUT NAME</span>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full text-[10.5px] p-1 border border-slate-300 rounded-none focus:outline-none focus:border-slate-800 uppercase font-bold text-slate-900"
                              placeholder="Name"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">BLUEPRINT URL (PDF/DRIVE)</span>
                            <input
                              type="text"
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              className="w-full text-[10.5px] p-1 border border-slate-300 rounded-none focus:outline-none focus:border-slate-800 font-mono text-slate-900"
                              placeholder="URL Link"
                            />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-bold text-slate-400 block uppercase font-mono">OPERATIONAL REGISTRY NOTES</span>
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full text-[10.5px] p-1 border border-slate-300 rounded-none focus:outline-none focus:border-slate-800 text-slate-707"
                            placeholder="Description"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="py-0.5 text-left leading-tight">
                        <div className="text-[11.5px] font-bold text-slate-850 uppercase select-all">
                          {layout.name}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Right Column: Mini delicate actions matching screenshot */}
                  <td className="py-2 px-3 align-middle text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSaveInline(layout.id)}
                          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 text-white text-[8px] font-bold uppercase tracking-wider rounded-none cursor-pointer flex items-center gap-1"
                          title="Save Changes"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>SAVE</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-0.5 bg-slate-200 hover:bg-slate-305 text-slate-705 text-[8px] font-bold uppercase tracking-wider rounded-none cursor-pointer flex items-center gap-1"
                          title="Cancel Editing"
                        >
                          <X className="w-2.5 h-2.5" />
                          <span>CANCEL</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2.5 select-none shrink-0 pr-1">
                        {/* 1. Edit Name/Fields Pencil - Soft Indigo Theme */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(layout)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-md border border-indigo-100 hover:border-indigo-600 transition-all duration-200 cursor-pointer shadow-3xs"
                            title="Edit Blueprint Layout details"
                          >
                            <Pencil className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        )}

                        {/* 2. Map / Cloud URL View link - Soft Emerald or Warning Amber */}
                        <button
                          type="button"
                          onClick={() => handleViewMap(layout)}
                          className={`p-1.5 rounded-md border transition-all duration-200 cursor-pointer relative shadow-3xs ${
                            hasLink 
                              ? 'bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-100 hover:border-emerald-600' 
                              : 'bg-amber-50 hover:bg-amber-600 text-amber-500 hover:text-white border-amber-100 hover:border-amber-600'
                          }`}
                          title={hasLink ? "Open Map Document Link in New Tab" : (canEdit ? "No link added. Click to edit and paste driving blueprint Link!" : "No map document available")}
                        >
                          <Cloud className="w-3.5 h-3.5 stroke-[2.2]" />
                          {!hasLink && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
                          )}
                        </button>

                        {/* 3. Delete/Trash Action - Admin Only - Soft Rose Theme */}
                        {currentUser?.role === 'Admin' && (
                          layoutDeleteConfirmId === layout.id ? (
                            <div className="flex items-center gap-1 font-mono text-[9px] bg-rose-50 border border-rose-200 px-1.5 py-0.5 animate-pulse rounded-md shrink-0">
                              <span className="text-rose-700 font-semibold uppercase text-[8px]">SURE?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteLayout(layout.id);
                                  setLayoutDeleteConfirmId(null);
                                }}
                                className="px-1.5 py-0.5 text-[8px] text-white bg-rose-600 hover:bg-rose-700 font-bold cursor-pointer rounded-sm"
                              >
                                CONFIRM
                              </button>
                              <button
                                type="button"
                                onClick={() => setLayoutDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-[8px] text-slate-700 bg-slate-200 hover:bg-slate-300 font-semibold cursor-pointer rounded-sm"
                              >
                                NO
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setLayoutDeleteConfirmId(layout.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-md border border-rose-100 hover:border-rose-600 transition-all duration-200 cursor-pointer shadow-3xs"
                              title="Permanently remove layout row"
                            >
                              <Trash2 className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {layouts.length === 0 && (
              <tr>
                <td colSpan={2} className="py-6 text-center text-slate-400 italic font-mono text-[10px]">
                  No layouts configured. Click "ADD ROW" to append storage sectors.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
