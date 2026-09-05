import React, { useState } from 'react';
import { HexPhoto } from '../types';
import { ExternalLink, Edit2, Check, Eye } from 'lucide-react';

interface HexPhotoManagerProps {
  photos: HexPhoto[];
  onUpdatePhoto: (id: string, newTitle: string, newDriveLink: string, newImageUrl?: string) => void;
}

export default function HexPhotoManager({
  photos,
  onUpdatePhoto,
}: HexPhotoManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDriveLink, setEditDriveLink] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  const handleStartEdit = (photo: HexPhoto) => {
    setEditingId(photo.id);
    setEditTitle(photo.title);
    setEditDriveLink(photo.driveLink);
    setEditImageUrl(photo.imageUrl);
  };

  const handleSave = (id: string) => {
    let parsedImageUrl = editImageUrl;
    if (editDriveLink.includes('drive.google.com')) {
      const match = editDriveLink.match(/\/d\/([a-zA-Z0-9-_]+)/) || editDriveLink.match(/id=([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        // Generates an optimized high-resolution thumbnail preview that bypasses Google Multi-Login cookie lockouts
        parsedImageUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
      }
    }

    onUpdatePhoto(id, editTitle, editDriveLink, parsedImageUrl || editImageUrl);
    setEditingId(null);
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wider">Hexagonal Fastener Material Showcase</h3>
          <p className="text-xs text-slate-500">
            Double-click or press Configure to link real Google Drive photos or inspect stock catalogs.
          </p>
        </div>
        <span className="text-[10px] font-bold font-mono bg-slate-900 text-brand-orange px-2 py-0.5 rounded-none uppercase tracking-widest">
          {photos.length} RACK SAMPLERS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {photos.map((photo) => {
          const isEditing = editingId === photo.id;
          
          return (
            <div
              key={photo.id}
              className="border border-slate-200 p-4 bg-slate-50/20 hover:bg-white hover:border-brand-orange transition-all flex flex-col items-center text-center gap-3 rounded-none relative"
            >
              <div className="absolute top-2 right-2">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">ID #{photo.id}</span>
              </div>

              {/* Hexagon Clip Container from Theme */}
              <div 
                className="relative w-36 h-36 transform hover:rotate-3 hover:scale-105 transition-all duration-300 shadow-xs mt-2"
              >
                <div
                  className="w-full h-full bg-slate-200 overflow-hidden relative cursor-pointer hexagon-clip"
                  onClick={() => window.open(photo.driveLink, '_blank')}
                  title="Click to inspect source in Drive"
                >
                  <img
                    src={photo.imageUrl || "https://picsum.photos/seed/fasten/300/300"}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=300&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                    <span className="p-0.5 px-2 bg-brand-orange font-mono text-[9px] font-bold text-white uppercase tracking-widest hover:bg-slate-900 flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" /> PREVIEW
                    </span>
                  </div>
                </div>
              </div>

              {/* Form editing vs visualization layout */}
              {isEditing ? (
                <div className="w-full space-y-2 text-left pt-2 font-mono text-[10px]">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-500 uppercase block">fastener custom title:</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-[11px] p-1 border border-slate-300 bg-white rounded-none focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-500 uppercase block">google drive link:</label>
                    <input
                      type="text"
                      value={editDriveLink}
                      onChange={(e) => setEditDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full text-[11px] p-1 border border-slate-300 bg-white rounded-none font-mono focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-500 uppercase block">fallback image url:</label>
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="w-full text-[11px] p-1 border border-slate-300 bg-white rounded-none font-mono focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(photo.id)}
                    className="w-full py-1.5 bg-brand-orange text-white rounded-none text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1 hover:bg-slate-900"
                  >
                    <Check className="w-3.5 h-3.5" /> SAVE CONFIG
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-1.5 pt-1">
                  <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-tight h-5 line-clamp-1">
                    {photo.title}
                  </h4>
                  
                  <div className="flex items-center justify-center gap-2 pt-1.5 border-t border-slate-100">
                    <a
                      href={photo.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-orange hover:underline font-mono"
                    >
                      <ExternalLink className="w-3 h-3" /> Drive Folder
                    </a>
                    <span className="text-slate-300 font-mono text-[9px]">|</span>
                    <button
                      onClick={() => handleStartEdit(photo)}
                      className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-brand-orange transition-colors font-bold uppercase"
                    >
                      <Edit2 className="w-2.5 h-2.5" /> Configure
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
