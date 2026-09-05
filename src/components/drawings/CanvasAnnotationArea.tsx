import React, { useState, useEffect } from 'react';
import { 
  CanvasAnnotationText, 
  CanvasAnnotationLine, 
  CanvasAnnotationIcon,
  CanvasAnnotationBox
} from './drawingTypes';

interface CanvasAnnotationAreaProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  uploadedImageUrl: string;
  fastenerType: 'l_anchor' | 'hex_anchor' | 'straight_stud' | 'j_anchor' | 'plate_anchor' | 'u_bolt' | 'custom_image';
  dimensionSubtitle: string;
  labelD: string;
  labelT: string;
  labelL: string;
  labelC: string;
  enableSizeTable: boolean;
  annotationsText: CanvasAnnotationText[];
  setAnnotationsText: React.Dispatch<React.SetStateAction<CanvasAnnotationText[]>>;
  annotationsLines: CanvasAnnotationLine[];
  setAnnotationsLines: React.Dispatch<React.SetStateAction<CanvasAnnotationLine[]>>;
  annotationsIcons: CanvasAnnotationIcon[];
  setAnnotationsIcons: React.Dispatch<React.SetStateAction<CanvasAnnotationIcon[]>>;
  annotationsBoxes?: CanvasAnnotationBox[];
  setAnnotationsBoxes?: React.Dispatch<React.SetStateAction<CanvasAnnotationBox[]>>;
  draggingTextId: string | null;
  setDraggingTextId: (id: string | null) => void;
  draggingIconId: string | null;
  setDraggingIconId: (id: string | null) => void;
  draggingBoxId?: string | null;
  setDraggingBoxId?: (id: string | null) => void;
  dragLineHandle: { id: string; handle: 'start' | 'end' | 'whole'; startX?: number; startY?: number; origX1?: number; origY1?: number; origX2?: number; origY2?: number } | null;
  setDragLineHandle: (val: any) => void;
  onCanvasMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const CanvasAnnotationArea: React.FC<CanvasAnnotationAreaProps> = ({
  canvasRef,
  uploadedImageUrl,
  fastenerType,
  dimensionSubtitle,
  labelD,
  labelT,
  labelL,
  labelC,
  enableSizeTable,
  annotationsText,
  setAnnotationsText,
  annotationsLines,
  setAnnotationsLines,
  annotationsIcons,
  setAnnotationsIcons,
  annotationsBoxes = [],
  setAnnotationsBoxes,
  setDraggingTextId,
  setDraggingIconId,
  draggingBoxId,
  setDraggingBoxId,
  setDragLineHandle,
  onCanvasMouseMove
}) => {
  const [resizingText, setResizingText] = useState<{ id: string; startX: number; startWidth: number } | null>(null);
  const [resizingBox, setResizingBox] = useState<{ id: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Resize text handler
  useEffect(() => {
    if (!resizingText) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizingText.startX;
      const newWidth = Math.max(40, Math.min(600, Math.round(resizingText.startWidth + delta)));
      setAnnotationsText(prev => prev.map(t => t.id === resizingText.id ? { ...t, width: newWidth } : t));
    };

    const handleMouseUp = () => {
      setResizingText(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingText, setAnnotationsText]);

  // Resize box handler
  useEffect(() => {
    if (!resizingBox || !setAnnotationsBoxes) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizingBox.startX;
      const deltaY = e.clientY - resizingBox.startY;
      const newW = Math.max(20, Math.min(500, Math.round(resizingBox.startWidth + deltaX)));
      const newH = Math.max(20, Math.min(400, Math.round(resizingBox.startHeight + deltaY)));
      setAnnotationsBoxes(prev => prev.map(b => b.id === resizingBox.id ? { ...b, width: newW, height: newH } : b));
    };

    const handleMouseUp = () => {
      setResizingBox(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingBox, setAnnotationsBoxes]);
  return (
    <div 
      ref={canvasRef}
      onMouseMove={onCanvasMouseMove}
      onClick={() => {
        setSelectedTextId(null);
        setSelectedBoxId(null);
      }}
      className={`flex-1 relative flex items-center justify-center border border-dashed border-slate-300 rounded p-2 overflow-hidden bg-white select-none ${
        enableSizeTable ? 'min-h-[250px] max-h-[280px]' : 'min-h-[460px]'
      }`}
    >
      {/* 1. UPLOADED IMAGE OR VECTOR SCHEMATIC */}
      {uploadedImageUrl ? (
        <div className="w-full h-full flex items-center justify-center relative">
          <img 
            src={uploadedImageUrl} 
            alt="Uploaded Blueprint" 
            className={`max-w-full object-contain mx-auto block ${enableSizeTable ? 'max-h-[240px]' : 'max-h-[440px]'}`} 
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center relative">
          {fastenerType === 'l_anchor' ? (
            <svg viewBox="0 0 380 430" className={`w-full overflow-visible mx-auto block ${enableSizeTable ? 'max-h-[245px]' : 'max-h-[450px]'}`}>
              {/* Centerline Arrow Pointing Up */}
              <line x1="170" y1="80" x2="170" y2="35" stroke="#000" strokeWidth="1.2" />
              <polygon points="170,28 166,42 174,42" fill="#000" />

              {/* Diameter Dimension D */}
              <line x1="160" y1="80" x2="160" y2="52" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="80" x2="180" y2="52" stroke="#000" strokeWidth="1" />
              <line x1="140" y1="52" x2="160" y2="52" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="52" x2="200" y2="52" stroke="#000" strokeWidth="1" />
              <polygon points="160,52 148,49 148,55" fill="#000" />
              <polygon points="180,52 192,49 192,55" fill="#000" />
              <text x="170" y="56" fontSize="13" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">{labelD}</text>

              {/* Thread Dimension T */}
              <line x1="180" y1="80" x2="218" y2="80" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="160" x2="218" y2="160" stroke="#000" strokeWidth="1" />
              <line x1="202" y1="80" x2="202" y2="160" stroke="#000" strokeWidth="1" />
              <polygon points="202,80 199,92 205,92" fill="#000" />
              <polygon points="202,160 199,148 205,148" fill="#000" />
              <text x="214" y="125" fontSize="12.5" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="start">{labelT}</text>

              {/* Overall Length Dimension L */}
              <line x1="180" y1="80" x2="275" y2="80" stroke="#000" strokeWidth="1" />
              <line x1="230" y1="320" x2="275" y2="320" stroke="#000" strokeWidth="1" />
              <line x1="260" y1="80" x2="260" y2="320" stroke="#000" strokeWidth="1" />
              <polygon points="260,80 257,94 263,94" fill="#000" />
              <polygon points="260,320 257,306 263,306" fill="#000" />
              <text x="272" y="205" fontSize="13.5" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="start">{labelL}</text>

              {/* Hook Length Dimension C */}
              <line x1="180" y1="270" x2="230" y2="270" stroke="#000" strokeWidth="1" />
              <polygon points="180,270 192,267 192,273" fill="#000" />
              <polygon points="230,270 218,267 218,273" fill="#000" />
              <text x="205" y="265" fontSize="12.5" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">{labelC}</text>

              {/* L-Anchor Bolt Body */}
              <rect x="160" y="80" width="20" height="80" fill="#fff" stroke="#000" strokeWidth="1.5" />
              {Array.from({ length: 11 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1="160" y1={86 + i * 7} x2="180" y2={83 + i * 7} stroke="#000" strokeWidth="1" />
                  <line x1="160" y1={83 + i * 7} x2="180" y2={86 + i * 7} stroke="#000" strokeWidth="0.75" />
                </React.Fragment>
              ))}

              <path d="
                M 160,160 
                L 160,300 
                Q 160,320 180,320 
                L 230,320 
                L 230,300 
                L 180,300 
                Q 180,300 180,290 
                L 180,160 
                Z
              " fill="#fff" stroke="#000" strokeWidth="1.5" />

              <text x="200" y="365" fontSize="13.5" fontFamily="Arial, sans-serif" fontWeight="bold" textAnchor="middle">Dimensions</text>
              <text x="200" y="382" fontSize="11" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="1.5" textAnchor="middle">{dimensionSubtitle}</text>
            </svg>
          ) : fastenerType === 'hex_anchor' ? (
            <svg viewBox="0 0 380 430" className={`w-full overflow-visible mx-auto block ${enableSizeTable ? 'max-h-[245px]' : 'max-h-[450px]'}`}>
              <line x1="170" y1="60" x2="170" y2="25" stroke="#000" strokeWidth="1.2" />
              <polygon points="170,18 166,32 174,32" fill="#000" />

              <line x1="160" y1="60" x2="160" y2="38" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="60" x2="180" y2="38" stroke="#000" strokeWidth="1" />
              <line x1="140" y1="38" x2="160" y2="38" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="38" x2="200" y2="38" stroke="#000" strokeWidth="1" />
              <polygon points="160,38 148,35 148,41" fill="#000" />
              <polygon points="180,38 192,35 192,41" fill="#000" />
              <text x="170" y="42" fontSize="13" fontFamily="Arial" fontWeight="bold" textAnchor="middle">{labelD}</text>

              <line x1="180" y1="60" x2="218" y2="60" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="160" x2="218" y2="160" stroke="#000" strokeWidth="1" />
              <line x1="202" y1="60" x2="202" y2="160" stroke="#000" strokeWidth="1" />
              <polygon points="202,60 199,72 205,72" fill="#000" />
              <polygon points="202,160 199,148 205,148" fill="#000" />
              <text x="214" y="115" fontSize="12.5" fontFamily="Arial" fontWeight="bold">{labelT}</text>

              <line x1="180" y1="60" x2="265" y2="60" stroke="#000" strokeWidth="1" />
              <line x1="190" y1="350" x2="265" y2="350" stroke="#000" strokeWidth="1" />
              <line x1="250" y1="60" x2="250" y2="350" stroke="#000" strokeWidth="1" />
              <polygon points="250,60 247,74 253,74" fill="#000" />
              <polygon points="250,350 247,336 253,336" fill="#000" />
              <text x="262" y="210" fontSize="13.5" fontFamily="Arial" fontWeight="bold">{labelL}</text>

              <rect x="160" y="60" width="20" height="100" fill="#fff" stroke="#000" strokeWidth="1.5" />
              {Array.from({ length: 13 }).map((_, i) => (
                <line key={i} x1="160" y1={66 + i * 7} x2="180" y2={63 + i * 7} stroke="#000" strokeWidth="1" />
              ))}
              <rect x="160" y="160" width="20" height="170" fill="#fff" stroke="#000" strokeWidth="1.5" />
              <path d="M 148,330 L 192,330 L 188,350 L 152,350 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
              <line x1="160" y1="330" x2="162" y2="350" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="330" x2="178" y2="350" stroke="#000" strokeWidth="1" />

              <rect x="150" y="80" width="40" height="24" rx="1" fill="#fff" stroke="#000" strokeWidth="1.5" />
              <line x1="162" y1="80" x2="162" y2="104" stroke="#000" strokeWidth="1" />
              <line x1="178" y1="80" x2="178" y2="104" stroke="#000" strokeWidth="1" />
              <rect x="144" y="104" width="52" height="6" rx="0.5" fill="#fff" stroke="#000" strokeWidth="1.5" />

              <text x="170" y="380" fontSize="13.5" fontFamily="Arial" fontWeight="bold" textAnchor="middle">Dimensions</text>
              <text x="170" y="396" fontSize="11" fontFamily="Arial" fontWeight="bold" letterSpacing="1.5" textAnchor="middle">DxLxT</text>
            </svg>
          ) : (
            <svg viewBox="0 0 380 430" className={`w-full overflow-visible mx-auto block ${enableSizeTable ? 'max-h-[245px]' : 'max-h-[450px]'}`}>
              <line x1="170" y1="60" x2="170" y2="25" stroke="#000" strokeWidth="1.2" />
              <polygon points="170,18 166,32 174,32" fill="#000" />

              <line x1="160" y1="60" x2="160" y2="38" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="60" x2="180" y2="38" stroke="#000" strokeWidth="1" />
              <line x1="140" y1="38" x2="160" y2="38" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="38" x2="200" y2="38" stroke="#000" strokeWidth="1" />
              <polygon points="160,38 148,35 148,41" fill="#000" />
              <polygon points="180,38 192,35 192,41" fill="#000" />
              <text x="170" y="42" fontSize="13" fontFamily="Arial" fontWeight="bold" textAnchor="middle">{labelD}</text>

              <line x1="180" y1="60" x2="218" y2="60" stroke="#000" strokeWidth="1" />
              <line x1="180" y1="160" x2="218" y2="160" stroke="#000" strokeWidth="1" />
              <line x1="202" y1="60" x2="202" y2="160" stroke="#000" strokeWidth="1" />
              <polygon points="202,60 199,72 205,72" fill="#000" />
              <polygon points="202,160 199,148 205,148" fill="#000" />
              <text x="214" y="115" fontSize="12.5" fontFamily="Arial" fontWeight="bold">{labelT}</text>

              <line x1="180" y1="60" x2="265" y2="60" stroke="#000" strokeWidth="1" />
              <line x1="190" y1="340" x2="265" y2="340" stroke="#000" strokeWidth="1" />
              <line x1="250" y1="60" x2="250" y2="340" stroke="#000" strokeWidth="1" />
              <polygon points="250,60 247,74 253,74" fill="#000" />
              <polygon points="250,340 247,326 253,326" fill="#000" />
              <text x="262" y="205" fontSize="13.5" fontFamily="Arial" fontWeight="bold">{labelL}</text>

              <rect x="160" y="60" width="20" height="280" fill="#fff" stroke="#000" strokeWidth="1.5" />
              {Array.from({ length: 34 }).map((_, i) => (
                <line key={i} x1="160" y1={66 + i * 8} x2="180" y2={63 + i * 8} stroke="#000" strokeWidth="0.8" />
              ))}

              <text x="170" y="375" fontSize="13.5" fontFamily="Arial" fontWeight="bold" textAnchor="middle">Dimensions</text>
              <text x="170" y="392" fontSize="11" fontFamily="Arial" fontWeight="bold" letterSpacing="1.5" textAnchor="middle">{dimensionSubtitle}</text>
            </svg>
          )}
        </div>
      )}

      {/* 2. CUSTOM CLEAN GEOMETRIC LINE ARROWS (NO FORCED MANDATORY TEXT - DRAGGABLE HANDLES) */}
      {annotationsLines.map(line => {
        return (
          <div key={line.id} className="absolute inset-0 pointer-events-none z-20">
            <svg className="w-full h-full overflow-visible pointer-events-none">
              <defs>
                <marker id={`arr-s-ui-${line.id}`} viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <polygon points="10,2 0,5 10,8" fill={line.color || '#000'} />
                </marker>
                <marker id={`arr-e-ui-${line.id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <polygon points="0,2 10,5 0,8" fill={line.color || '#000'} />
                </marker>
              </defs>
              <line
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x2}%`}
                y2={`${line.y2}%`}
                stroke={line.color || '#000'}
                strokeWidth="1.8"
                markerStart={line.arrowType === 'both' || line.arrowType === 'start' ? `url(#arr-s-ui-${line.id})` : undefined}
                markerEnd={line.arrowType === 'both' || line.arrowType === 'end' ? `url(#arr-e-ui-${line.id})` : undefined}
              />
            </svg>

            {/* START DRAG HANDLE */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                setDragLineHandle({ id: line.id, handle: 'start' });
              }}
              style={{ left: `${line.x1}%`, top: `${line.y1}%` }}
              title="Drag Arrow Start"
              className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md cursor-crosshair pointer-events-auto hover:scale-125 transition-transform flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>

            {/* END DRAG HANDLE */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                setDragLineHandle({ id: line.id, handle: 'end' });
              }}
              style={{ left: `${line.x2}%`, top: `${line.y2}%` }}
              title="Drag Arrow End"
              className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md cursor-crosshair pointer-events-auto hover:scale-125 transition-transform flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>

            {/* Quick Line delete button near midpoint */}
            <div
              style={{ left: `${(line.x1 + line.x2) / 2}%`, top: `${(line.y1 + line.y2) / 2}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto opacity-0 hover:opacity-100 transition-opacity"
            >
              <button
                type="button"
                onClick={() => setAnnotationsLines(annotationsLines.filter(it => it.id !== line.id))}
                className="w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs cursor-pointer"
                title="Delete arrow line"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}

      {/* 3. DRAGGABLE & RESIZABLE TEXT BOXES */}
      {annotationsText.map(t => {
        const isSelected = selectedTextId === t.id;
        const bgClass = t.bg === 'yellow' 
          ? 'bg-amber-100/95 text-amber-950 shadow-xs' 
          : t.bg === 'white' 
            ? 'bg-white text-black shadow-xs' 
            : t.bg === 'orange'
              ? 'bg-orange-100 text-orange-950 shadow-xs'
              : t.bg === 'blue'
                ? 'bg-blue-100 text-blue-950 shadow-xs'
                : 'bg-transparent text-black';
        const borderClass = t.border ? 'border border-black' : 'border border-transparent';
        const customWidth = t.width ? `${t.width}px` : 'auto';

        return (
          <div
            key={t.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTextId(t.id);
            }}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input' || 
                  (e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
              e.stopPropagation();
              setSelectedTextId(t.id);
              setDraggingTextId(t.id);
            }}
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${t.fontSize || 12}px`,
              width: customWidth
            }}
            className={`absolute z-30 cursor-move px-1.5 py-0.5 rounded flex items-center gap-1 transition-all ${
              isSelected ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md' : 'hover:ring-1 hover:ring-slate-300'
            } ${bgClass} ${borderClass}`}
          >
            <input
              type="text"
              value={t.text}
              placeholder="Text..."
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedTextId(t.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTextId(t.id);
              }}
              onFocus={() => setSelectedTextId(t.id)}
              onChange={(e) => {
                const val = e.target.value;
                setAnnotationsText(prev => prev.map(it => it.id === t.id ? { ...it, text: val } : it));
              }}
              style={{ 
                fontSize: `${t.fontSize || 12}px`, 
                fontWeight: t.bold ? 'bold' : 'normal', 
                width: t.width ? '100%' : 'auto',
                color: '#000000'
              }}
              className="bg-transparent outline-none min-w-[36px] text-center font-medium placeholder:text-slate-400 cursor-text"
            />

            {/* Right-edge Resize Handle (Only visible when active/selected) */}
            {isSelected && (
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const currentEl = e.currentTarget.parentElement;
                  const currentWidth = currentEl ? currentEl.offsetWidth : (t.width || 80);
                  setResizingText({
                    id: t.id,
                    startX: e.clientX,
                    startWidth: currentWidth
                  });
                }}
                title="Drag horizontally to resize text box width"
                className="w-2.5 h-4 bg-blue-500 hover:bg-blue-600 rounded cursor-ew-resize shrink-0 ml-0.5 flex items-center justify-center shadow-xs"
              >
                <div className="w-0.5 h-2 bg-white rounded-full" />
              </div>
            )}

            {/* Floating Toolbar & Color Fill Controls (STRICTLY HIDDEN when clicking outside) */}
            {isSelected && (
              <div 
                className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-2 py-1 rounded-md shadow-xl flex items-center gap-1.5 z-40 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background / Color Fill Range Swatches */}
                <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">Fill:</span>
                  {[
                    { bg: 'transparent', label: 'None', preview: '#334155' },
                    { bg: 'white', label: 'White', preview: '#ffffff' },
                    { bg: 'yellow', label: 'Yellow', preview: '#fef08a' },
                    { bg: 'orange', label: 'Orange', preview: '#ffedd5' },
                    { bg: 'blue', label: 'Blue', preview: '#dbeafe' }
                  ].map(item => (
                    <button
                      key={item.bg}
                      type="button"
                      onClick={() => {
                        setAnnotationsText(prev => prev.map(it => it.id === t.id ? { ...it, bg: item.bg as any } : it));
                      }}
                      style={{ backgroundColor: item.preview }}
                      className={`w-3.5 h-3.5 rounded-full border border-white/60 cursor-pointer transition-transform ${
                        t.bg === item.bg || (!t.bg && item.bg === 'transparent') ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={`Fill: ${item.label}`}
                    />
                  ))}
                </div>

                {/* Border Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAnnotationsText(prev => prev.map(it => it.id === t.id ? { ...it, border: !it.border } : it));
                  }}
                  className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    t.border ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Border"
                >
                  Border
                </button>

                {/* Bold Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAnnotationsText(prev => prev.map(it => it.id === t.id ? { ...it, bold: !it.bold } : it));
                  }}
                  className={`text-[8.5px] px-1.5 py-0.5 rounded font-black cursor-pointer transition-colors ${
                    t.bold ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Bold"
                >
                  B
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAnnotationsText(prev => prev.filter(it => it.id !== t.id));
                    setSelectedTextId(null);
                  }}
                  className="text-red-400 hover:text-red-300 font-bold text-xs px-1 py-0.5 bg-red-950/60 hover:bg-red-900 rounded cursor-pointer ml-0.5"
                  title="Delete Text Box"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* 4. DRAGGABLE BLUEPRINT & FASTENER SYMBOLS / ICONS */}
      {annotationsIcons.map(ic => {
        const sz = ic.size || 28;
        return (
          <div
            key={ic.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDraggingIconId(ic.id);
            }}
            style={{
              left: `${ic.x}%`,
              top: `${ic.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${sz}px`,
              height: `${sz}px`
            }}
            className="absolute z-25 cursor-move group hover:ring-1 hover:ring-indigo-500 rounded p-0.5 flex items-center justify-center bg-white/80 shadow-2xs"
            title={`Drag ${ic.type}`}
          >
            {ic.type === 'hex_nut' && (
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <polygon points="14,2 26,9 26,23 14,30 2,23 2,9" fill="#fff" stroke={ic.color || '#000'} strokeWidth="1.8" />
                <circle cx="14" cy="16" r="6" fill="none" stroke={ic.color || '#000'} strokeWidth="1.5" />
              </svg>
            )}
            {ic.type === 'washer' && (
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <circle cx="14" cy="14" r="12" fill="#fff" stroke={ic.color || '#000'} strokeWidth="1.8" />
                <circle cx="14" cy="14" r="5.5" fill="none" stroke={ic.color || '#000'} strokeWidth="1.5" />
              </svg>
            )}
            {ic.type === 'plate_washer' && (
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <rect x="2" y="2" width="24" height="24" fill="#fff" stroke={ic.color || '#000'} strokeWidth="1.8" rx="1" />
                <circle cx="14" cy="14" r="6" fill="none" stroke={ic.color || '#000'} strokeWidth="1.5" />
              </svg>
            )}
            {ic.type === 'weld_symbol' && (
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <line x1="2" y1="20" x2="26" y2="20" stroke={ic.color || '#000'} strokeWidth="2" />
                <polygon points="6,20 18,20 18,8" fill="#fff" stroke={ic.color || '#000'} strokeWidth="1.5" />
              </svg>
            )}
            {ic.type === 'centerline' && (
              <span className="font-serif font-bold text-lg text-black leading-none">℄</span>
            )}
            {ic.type === 'north_arrow' && (
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <circle cx="14" cy="14" r="12" fill="#fff" stroke={ic.color || '#000'} strokeWidth="1.5" />
                <polygon points="14,4 18,14 14,12 10,14" fill={ic.color || '#000'} />
                <text x="14" y="24" fontSize="7" fontWeight="bold" textAnchor="middle" fill={ic.color || '#000'}>N</text>
              </svg>
            )}
            {ic.type === 'rev_triangle' && (
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <polygon points="14,3 26,24 2,24" fill="#fff" stroke={ic.color || '#000'} strokeWidth="1.8" />
                <text x="14" y="20" fontSize="9" fontWeight="bold" textAnchor="middle" fill={ic.color || '#000'}>{ic.label || 'Δ'}</text>
              </svg>
            )}
            {ic.type === 'qc_stamp' && (
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <circle cx="14" cy="14" r="12" fill="#fff" stroke="#16a34a" strokeWidth="2" />
                <path d="M7 14 L12 19 L21 9" fill="none" stroke="#16a34a" strokeWidth="2.2" />
              </svg>
            )}
            {ic.type === 'warning' && (
              <span className="font-bold text-base text-amber-600 leading-none">⚠</span>
            )}
            {ic.type === 'datum' && (
              <span className="font-bold text-base text-slate-800 leading-none">⨁</span>
            )}

            {/* Delete button on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAnnotationsIcons(annotationsIcons.filter(it => it.id !== ic.id));
              }}
              className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        );
      })}

      {/* 5. ADJUSTABLE SQUARE / RECTANGLE SHAPE BOXES WITH COLOR & RESIZING */}
      {annotationsBoxes.map(box => {
        const isSelected = selectedBoxId === box.id;
        return (
          <div
            key={box.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBoxId(box.id);
            }}
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).tagName.toLowerCase() === 'input' || 
                  (e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
              e.stopPropagation();
              setSelectedBoxId(box.id);
              if (setDraggingBoxId) setDraggingBoxId(box.id);
            }}
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.width || 100}px`,
              height: `${box.height || 70}px`,
              borderColor: box.borderColor || '#000000',
              borderWidth: `${box.borderWidth || 2}px`,
              borderStyle: box.borderStyle || 'solid',
              backgroundColor: box.bgColor || 'transparent',
              transform: 'translate(-50%, -50%)',
              borderRadius: '2px'
            }}
            className={`absolute z-20 cursor-move group select-none transition-shadow ${
              isSelected ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md' : 'hover:ring-1 hover:ring-slate-400'
            }`}
          >
            {/* Optional Clean Label (only rendered if user explicitly typed a label) */}
            {box.label && box.label.trim() ? (
              <div className="w-full h-full p-1 flex items-center justify-center pointer-events-none">
                <span 
                  style={{ 
                    color: box.labelColor || box.borderColor || '#000000',
                    backgroundColor: box.bgColor === 'transparent' || !box.bgColor ? 'rgba(255,255,255,0.85)' : 'transparent'
                  }} 
                  className="text-[10px] font-bold text-center leading-tight px-1.5 py-0.5 rounded shadow-2xs select-none"
                >
                  {box.label}
                </span>
              </div>
            ) : null}

            {/* Bottom-Right Corner Resize Handle */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setResizingBox({
                  id: box.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  startWidth: box.width || 100,
                  startHeight: box.height || 70
                });
              }}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-blue-600 border border-white rounded-xs cursor-se-resize shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 z-30"
              title="Drag to adjust shape size (Width & Height)"
            >
              <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
            </div>

            {/* Quick Floating Toolbar for Box Customization (Outside Border Color, Width, Style, Fill, Delete) */}
            <div 
              className={`absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-2 py-1 rounded-md shadow-xl flex items-center gap-1.5 z-40 transition-opacity whitespace-nowrap ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Outside Border Color Buttons & Custom Picker */}
              <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700">
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">Border:</span>
                {['#000000', '#dc2626', '#2563eb', '#16a34a', '#ea580c', '#9333ea', '#0891b2'].map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      if (!setAnnotationsBoxes) return;
                      setAnnotationsBoxes(prev => prev.map(b => b.id === box.id ? { ...b, borderColor: col } : b));
                    }}
                    style={{ backgroundColor: col }}
                    className={`w-3.5 h-3.5 rounded-full border border-white/60 cursor-pointer transition-transform ${box.borderColor === col ? 'ring-2 ring-white scale-110' : 'opacity-85 hover:opacity-100'}`}
                    title={`Set border color: ${col}`}
                  />
                ))}
                {/* Custom Color Input */}
                <label className="relative cursor-pointer flex items-center" title="Pick any custom border color">
                  <input
                    type="color"
                    value={box.borderColor || '#000000'}
                    onChange={(e) => {
                      if (!setAnnotationsBoxes) return;
                      const newCol = e.target.value;
                      setAnnotationsBoxes(prev => prev.map(b => b.id === box.id ? { ...b, borderColor: newCol } : b));
                    }}
                    className="sr-only"
                  />
                  <span className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center text-[7px] font-bold bg-gradient-to-tr from-pink-500 via-amber-400 to-blue-500">
                    +
                  </span>
                </label>
              </div>

              {/* Border Width Switcher */}
              <div className="flex items-center gap-0.5 pr-1 border-r border-slate-700">
                {[1, 2, 3, 4].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      if (!setAnnotationsBoxes) return;
                      setAnnotationsBoxes(prev => prev.map(b => b.id === box.id ? { ...b, borderWidth: w } : b));
                    }}
                    className={`text-[8.5px] px-1 py-0.5 rounded font-mono ${box.borderWidth === w ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    title={`${w}px border width`}
                  >
                    {w}px
                  </button>
                ))}
              </div>

              {/* Border Style (Solid / Dashed / Dotted) */}
              <div className="flex items-center gap-0.5 pr-1 border-r border-slate-700">
                {(['solid', 'dashed', 'dotted'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      if (!setAnnotationsBoxes) return;
                      setAnnotationsBoxes(prev => prev.map(b => b.id === box.id ? { ...b, borderStyle: st } : b));
                    }}
                    className={`text-[8px] px-1 py-0.5 rounded capitalize ${box.borderStyle === st || (!box.borderStyle && st === 'solid') ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    title={`${st} border style`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Fill Background Buttons */}
              <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700">
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">Fill:</span>
                {[
                  { bg: 'transparent', label: 'None' },
                  { bg: '#ffffff', label: 'White' },
                  { bg: '#eff6ff', label: 'Blue' },
                  { bg: '#fef2f2', label: 'Red' },
                  { bg: '#fefce8', label: 'Yellow' }
                ].map(item => (
                  <button
                    key={item.bg}
                    type="button"
                    onClick={() => {
                      if (!setAnnotationsBoxes) return;
                      setAnnotationsBoxes(prev => prev.map(b => b.id === box.id ? { ...b, bgColor: item.bg } : b));
                    }}
                    style={{ backgroundColor: item.bg === 'transparent' ? '#334155' : item.bg }}
                    className={`w-3 h-3 rounded-full border border-white/50 cursor-pointer ${box.bgColor === item.bg ? 'ring-1.5 ring-white' : 'opacity-80 hover:opacity-100'}`}
                    title={`Fill: ${item.label}`}
                  />
                ))}
              </div>

              {/* Optional Box Label Input */}
              <input
                type="text"
                value={box.label || ''}
                placeholder="Optional text..."
                onChange={(e) => {
                  if (!setAnnotationsBoxes) return;
                  const val = e.target.value;
                  setAnnotationsBoxes(prev => prev.map(b => b.id === box.id ? { ...b, label: val } : b));
                }}
                className="w-20 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] text-white outline-none focus:border-blue-400 placeholder:text-slate-500"
                title="Optional label text"
              />

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => {
                  if (!setAnnotationsBoxes) return;
                  setAnnotationsBoxes(prev => prev.filter(b => b.id !== box.id));
                }}
                className="text-red-400 hover:text-red-300 font-bold text-xs px-1 py-0.5 bg-red-950/60 hover:bg-red-900 rounded cursor-pointer ml-0.5"
                title="Delete Box Shape"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
