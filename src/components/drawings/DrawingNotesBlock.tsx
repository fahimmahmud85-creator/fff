import React from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { NoteSpecificationItem } from './drawingTypes';

interface DrawingNotesBlockProps {
  boltLabel?: string;
  setBoltLabel?: (val: string) => void;
  boltSpec: string;
  setBoltSpec: (val: string) => void;
  boltChecked?: boolean;
  setBoltChecked?: (val: boolean) => void;
  nutLabel?: string;
  setNutLabel?: (val: string) => void;
  nutSpec: string;
  setNutSpec: (val: string) => void;
  nutChecked?: boolean;
  setNutChecked?: (val: boolean) => void;
  washerLabel?: string;
  setWasherLabel?: (val: string) => void;
  washerSpec: string;
  setWasherSpec: (val: string) => void;
  washerChecked?: boolean;
  setWasherChecked?: (val: boolean) => void;
  finishLabel?: string;
  setFinishLabel?: (val: string) => void;
  finish: string;
  setFinish: (val: string) => void;
  finishChecked?: boolean;
  setFinishChecked?: (val: boolean) => void;
  assemblyNote: string;
  setAssemblyNote: (val: string) => void;
  noteItems: NoteSpecificationItem[];
  setNoteItems: React.Dispatch<React.SetStateAction<NoteSpecificationItem[]>>;
  isWorkOrder?: boolean;
}

export const DrawingNotesBlock: React.FC<DrawingNotesBlockProps> = ({
  boltLabel = 'Bolt:',
  setBoltLabel,
  boltSpec,
  setBoltSpec,
  boltChecked = true,
  setBoltChecked,
  nutLabel = 'Nut:',
  setNutLabel,
  nutSpec,
  setNutSpec,
  nutChecked = true,
  setNutChecked,
  washerLabel = 'Washer:',
  setWasherLabel,
  washerSpec,
  setWasherSpec,
  washerChecked = true,
  setWasherChecked,
  finishLabel = 'Finish:',
  setFinishLabel,
  finish,
  setFinish,
  finishChecked = true,
  setFinishChecked,
  assemblyNote,
  setAssemblyNote,
  noteItems,
  setNoteItems,
  isWorkOrder = false
}) => {
  const handleAddCustomNote = () => {
    const nextItem: NoteSpecificationItem = {
      id: `note-${Date.now()}`,
      label: 'Plate Washer:',
      value: 'ASTM A36 50x50x6mm Square',
      checked: true
    };
    setNoteItems([...noteItems, nextItem]);
  };

  const handleUpdateNote = (id: string, field: 'label' | 'value' | 'checked', text: any) => {
    setNoteItems(noteItems.map(n => n.id === id ? { ...n, [field]: text } : n));
  };

  const handleDeleteNote = (id: string) => {
    setNoteItems(noteItems.filter(n => n.id !== id));
  };

  return (
    <div className="p-3 border-b-2 border-black flex-1 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-xs underline uppercase tracking-wide">
          {isWorkOrder ? 'FABRICATION & SPECIFICATION NOTES' : 'SPECIFICATION NOTES'}
        </div>
        <button
          type="button"
          onClick={handleAddCustomNote}
          className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold border border-slate-300 flex items-center gap-1 cursor-pointer"
          title="Add editable custom note line (Plate Washer, Coating, Torque, etc.)"
        >
          <Plus className="w-2.5 h-2.5 text-blue-600" />
          <span>+ Add Note Line</span>
        </button>
      </div>
      
      {/* 100% Fully Editable Specifications with Checkboxes (Bolt, Nut, Washer, Finish + Custom Lines) */}
      <div className="space-y-1.5 text-[10px]">
        {/* Bolt */}
        <div className="flex items-center gap-1.5 group">
          <input
            type="checkbox"
            checked={boltChecked}
            onChange={(e) => setBoltChecked && setBoltChecked(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer shrink-0"
            title="Toggle Bolt in drawing notes"
          />
          <input
            type="text"
            value={boltLabel}
            onChange={(e) => setBoltLabel && setBoltLabel(e.target.value)}
            className={`w-16 font-bold shrink-0 text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-[10px] ${!boltChecked ? 'opacity-40' : ''}`}
            title="Click to edit Bolt label"
          />
          <input
            type="text"
            value={boltSpec}
            onChange={(e) => setBoltSpec(e.target.value)}
            placeholder="e.g. ASTM F1554 Grade 36 Hex"
            className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-slate-900 font-medium text-[10px] ${!boltChecked ? 'opacity-40 line-through' : ''}`}
            title="Click to edit Bolt specification"
          />
        </div>

        {/* Nut */}
        <div className="flex items-center gap-1.5 group">
          <input
            type="checkbox"
            checked={nutChecked}
            onChange={(e) => setNutChecked && setNutChecked(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer shrink-0"
            title="Toggle Nut in drawing notes"
          />
          <input
            type="text"
            value={nutLabel}
            onChange={(e) => setNutLabel && setNutLabel(e.target.value)}
            className={`w-16 font-bold shrink-0 text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-[10px] ${!nutChecked ? 'opacity-40' : ''}`}
            title="Click to edit Nut label"
          />
          <input
            type="text"
            value={nutSpec}
            onChange={(e) => setNutSpec(e.target.value)}
            placeholder="e.g. ASTM A563 Grade A Hex"
            className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-slate-900 font-medium text-[10px] ${!nutChecked ? 'opacity-40 line-through' : ''}`}
            title="Click to edit Nut specification"
          />
        </div>

        {/* Washer */}
        <div className="flex items-center gap-1.5 group">
          <input
            type="checkbox"
            checked={washerChecked}
            onChange={(e) => setWasherChecked && setWasherChecked(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer shrink-0"
            title="Toggle Washer in drawing notes"
          />
          <input
            type="text"
            value={washerLabel}
            onChange={(e) => setWasherLabel && setWasherLabel(e.target.value)}
            className={`w-16 font-bold shrink-0 text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-[10px] ${!washerChecked ? 'opacity-40' : ''}`}
            title="Click to edit Washer label"
          />
          <input
            type="text"
            value={washerSpec}
            onChange={(e) => setWasherSpec(e.target.value)}
            placeholder="e.g. ASTM F436 Hardened"
            className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-slate-900 font-medium text-[10px] ${!washerChecked ? 'opacity-40 line-through' : ''}`}
            title="Click to edit Washer specification"
          />
        </div>

        {/* Finish */}
        <div className="flex items-center gap-1.5 group">
          <input
            type="checkbox"
            checked={finishChecked}
            onChange={(e) => setFinishChecked && setFinishChecked(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer shrink-0"
            title="Toggle Finish in drawing notes"
          />
          <input
            type="text"
            value={finishLabel}
            onChange={(e) => setFinishLabel && setFinishLabel(e.target.value)}
            className={`w-16 font-bold shrink-0 text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-[10px] ${!finishChecked ? 'opacity-40' : ''}`}
            title="Click to edit Finish label"
          />
          <input
            type="text"
            value={finish}
            onChange={(e) => setFinish(e.target.value)}
            placeholder="e.g. ASTM F2329 Hot-dip Galvanize"
            className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-slate-900 font-medium text-[10px] ${!finishChecked ? 'opacity-40 line-through' : ''}`}
            title="Click to edit Finish specification"
          />
        </div>

        {/* Dynamic Extra Custom Notes */}
        {noteItems.map(item => (
          <div key={item.id} className="flex items-center gap-1.5 group">
            <input
              type="checkbox"
              checked={item.checked !== false}
              onChange={(e) => handleUpdateNote(item.id, 'checked', e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-400 focus:ring-blue-500 cursor-pointer shrink-0"
              title="Toggle note line in drawing"
            />
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleUpdateNote(item.id, 'label', e.target.value)}
              className={`w-16 font-bold shrink-0 text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-[10px] ${item.checked === false ? 'opacity-40' : ''}`}
              title="Click to edit custom note label"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => handleUpdateNote(item.id, 'value', e.target.value)}
              className={`flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-slate-900 font-medium text-[10px] ${item.checked === false ? 'opacity-40 line-through' : ''}`}
              title="Click to edit custom note value"
            />
            <button
              type="button"
              onClick={() => handleDeleteNote(item.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 cursor-pointer text-xs"
              title="Delete note item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-1.5 border-t border-slate-200 text-[9.5px]">
        <div className="flex items-center gap-1 font-bold">
          <span className="text-slate-900 shrink-0">Note:</span>
          <input
            type="text"
            value={assemblyNote}
            onChange={(e) => setAssemblyNote(e.target.value)}
            className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none font-normal text-slate-800"
            title="Click to edit assembly note"
          />
        </div>
      </div>
    </div>
  );
};
