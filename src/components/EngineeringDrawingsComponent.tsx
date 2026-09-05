import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, Plus, Printer, Upload, Compass, Layers, Table, Type,
  ArrowLeftRight, Ruler, ArrowUp, ArrowUpRight, Building2, Save,
  CheckSquare, Wrench, Sparkles, X, Image as ImageIcon, RotateCcw,
  FilePlus, CopyPlus, Trash2, ChevronDown, Eye, Square, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { 
  DrawingRevision, 
  ScheduleColumn, 
  DynamicScheduleRow, 
  CanvasAnnotationText, 
  CanvasAnnotationLine, 
  CanvasAnnotationIcon,
  CanvasAnnotationBox,
  NoteSpecificationItem,
  DrawingSheetCategory,
  SubSheetItem,
  DrawingArchiveItem 
} from './drawings/drawingTypes';
import { printLandscapeDrawing, generateLandscapeDrawingHtml, DEFAULT_SCHEDULE_COLUMNS } from './drawings/drawingPrintHelper';
import { CanvasAnnotationArea } from './drawings/CanvasAnnotationArea';
import { ScheduleTableEditor, SCHEDULE_PRESETS } from './drawings/ScheduleTableEditor';
import { DrawingNotesBlock } from './drawings/DrawingNotesBlock';
import { IconSymbolModal } from './drawings/IconSymbolModal';
import { DrawingArchivesView } from './drawings/DrawingArchivesView';
import { getActiveCompany, isMarineFastenersCompany } from '../utils/companyProfile';

const INITIAL_SCHEDULE_ROWS: DynamicScheduleRow[] = [
  { id: 'sz-1', sl: 1, mark: 'AB-1', dia: 'M24', pitch: '3.0', length: '600mm', thread: '120mm', bend: '100mm', qty: 50, notes: 'Col 1-8 Footing' },
  { id: 'sz-2', sl: 2, mark: 'AB-2', dia: 'M30', pitch: '3.5', length: '800mm', thread: '150mm', bend: '120mm', qty: 40, notes: 'Main Frame Base' },
  { id: 'sz-3', sl: 3, mark: 'AB-3', dia: 'M36', pitch: '4.0', length: '1000mm', thread: '200mm', bend: '150mm', qty: 25, notes: 'Crane Runway Piers' },
  { id: 'sz-4', sl: 4, mark: 'AB-4', dia: 'M42', pitch: '4.5', length: '1200mm', thread: '250mm', bend: '180mm', qty: 16, notes: 'Heavy Equipment Pad' },
  { id: 'sz-5', sl: 5, mark: 'AB-5', dia: 'M30', pitch: '3.5', length: '750mm', thread: '150mm', bend: '120mm', qty: 50, notes: '' }
];

const DEFAULT_ARCHIVES: DrawingArchiveItem[] = [
  {
    id: 'dwg-1',
    sn: 1,
    drawingNo: 'DWG-MFI-2026-101',
    sheetCategory: 'APPROVAL',
    jobName: 'GENERIC SUBSTATION',
    customer: 'SMITH CONSTRUCTION',
    fastenerType: 'l_anchor',
    dimensionCalloutMode: 'letters',
    dimensionSubtitle: 'DxLxCxT',
    companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
    companyAddress: 'Ajman Industrial , UAE',
    companyPhone: 'P: +971 6 525 0526',
    companyWeb: 'www.marinefasteners.co',
    diameter: 'M24',
    threadLength: '120mm',
    overallLength: '600mm',
    hookLength: '100mm',
    threadType: 'Metric Coarse',
    quantity: 50,
    boltSpec: 'ASTM F1554 Grade 36 Hex',
    nutSpec: 'ASTM A563 Grade A Hex',
    washerSpec: 'ASTM F436 Hardened',
    finish: 'ASTM F2329 Hot-dip Galvanize',
    assemblyNote: 'Hardware is not provided assembled',
    additionalNotes: '',
    noteItems: [],
    approvedBy: 'Lead Consultant Eng.',
    approvalDate: '10/11/2026',
    salesOrderNo: 'SO-8821',
    quoteNo: 'QT-4902',
    sheetNo: '1 of 1',
    date: '10/11/2026',
    drawnBy: 'GR',
    enableSizeTable: true,
    scheduleColumns: DEFAULT_SCHEDULE_COLUMNS,
    sizeSchedule: INITIAL_SCHEDULE_ROWS,
    annotationsText: [],
    annotationsLines: [],
    annotationsIcons: [],
    revisions: [
      { rev: '-', description: 'INITIAL SUBMITTAL', date: '10/11/2026', by: 'GR' }
    ],
    status: 'APPROVED',
    createdAt: '2026-10-11T09:00:00.000Z'
  },
  {
    id: 'dwg-2',
    sn: 2,
    drawingNo: 'DWG-MFI-2026-102',
    sheetCategory: 'WORK_ORDER',
    jobName: 'ADNOC OFFSHORE PLATFORM',
    customer: 'PETROFAC INTERNATIONAL',
    fastenerType: 'hex_anchor',
    dimensionCalloutMode: 'letters',
    dimensionSubtitle: 'DxLxT',
    companyName: 'MARINE FASTENERS INDUSTRIES L.L.C.',
    companyAddress: 'Ajman Industrial , UAE',
    companyPhone: 'P: +971 6 525 0526',
    companyWeb: 'www.marinefasteners.co',
    diameter: 'M36',
    threadLength: '150mm',
    overallLength: '900mm',
    hookLength: '',
    threadType: 'Metric Coarse M36x4.0',
    quantity: 80,
    boltSpec: 'ASTM F1554 Grade 55 S1 Weldable',
    nutSpec: 'ASTM A563 Grade DH Heavy Hex',
    washerSpec: 'ASTM F436 Hardened Heavy Flat',
    finish: 'ASTM A153 Class C Hot-dip Galvanized',
    assemblyNote: 'Furnished with 1 heavy hex nut & 1 F436 washer loose per bolt',
    additionalNotes: '100% MT magnetic particle tested.',
    noteItems: [
      { id: 'n1', label: 'Plate Washer:', value: 'ASTM A36 75x75x10mm' }
    ],
    approvedBy: 'TI',
    approvalDate: '25/09/2026',
    workOrderNo: 'WO-9941',
    machineNo: 'CNC Threader Machine #2',
    priority: 'HIGH',
    qcCheckedBy: 'H. Kumar (Senior QC)',
    salesOrderNo: 'SO-9041',
    quoteNo: 'QT-5120',
    sheetNo: '1 of 1',
    date: '25/09/2026',
    drawnBy: 'TI',
    enableSizeTable: true,
    scheduleColumns: DEFAULT_SCHEDULE_COLUMNS,
    sizeSchedule: INITIAL_SCHEDULE_ROWS,
    annotationsText: [],
    annotationsLines: [],
    annotationsIcons: [],
    revisions: [
      { rev: '0', description: 'RELEASED FOR FABRICATION', date: '25/09/2026', by: 'TI' }
    ],
    status: 'WORK_IN_PROGRESS',
    createdAt: '2026-09-25T11:30:00.000Z'
  }
];

export const EngineeringDrawingsComponent: React.FC<{ triggerToast?: (msg: string) => void }> = ({ triggerToast }) => {
  const [activeTab, setActiveTab] = useState<'designer' | 'archives'>('designer');

  // Archives Persistence
  const [archives, setArchives] = useState<DrawingArchiveItem[]>(() => {
    const saved = localStorage.getItem('MFI_ENGINEERING_DRAWINGS_ARCHIVES_V6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_ARCHIVES;
  });

  useEffect(() => {
    localStorage.setItem('MFI_ENGINEERING_DRAWINGS_ARCHIVES_V6', JSON.stringify(archives));
  }, [archives]);

  // Drawing Sheet Category: 'APPROVAL' or 'WORK_ORDER'
  const [sheetCategory, setSheetCategory] = useState<DrawingSheetCategory>('APPROVAL');

  // Current Active Drawing in Designer
  const [currentId, setCurrentId] = useState<string>('dwg-1');
  const [drawingNo, setDrawingNo] = useState<string>('DWG-MFI-2026-101');
  const [jobName, setJobName] = useState<string>('GENERIC SUBSTATION');
  const [customer, setCustomer] = useState<string>('SMITH CONSTRUCTION');
  const [fastenerType, setFastenerType] = useState<'l_anchor' | 'hex_anchor' | 'straight_stud' | 'j_anchor' | 'plate_anchor' | 'u_bolt' | 'custom_image'>('l_anchor');
  const [dimensionCalloutMode, setDimensionCalloutMode] = useState<'letters' | 'values'>('letters');
  const [dimensionSubtitle, setDimensionSubtitle] = useState<string>('DxLxCxT');
  
  // Custom image & Stable Logo
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  
  const activeCompany = getActiveCompany();
  const isMfi = isMarineFastenersCompany(activeCompany);
  const isBmm = (activeCompany.code || '').toUpperCase() === 'BMM' || activeCompany.id === 'comp-bmm' || activeCompany.name.toUpperCase().includes('BOLT');
  const isUmi = (activeCompany.code || '').toUpperCase() === 'UMI' || activeCompany.id === 'comp-umi' || activeCompany.name.toUpperCase().includes('UNITED METAL');

  const [customLogoUrl, setCustomLogoUrl] = useState<string>(() => {
    return localStorage.getItem(`DRAWING_LOGO_${activeCompany.id.toUpperCase()}`) || (activeCompany.logoUrl && activeCompany.logoUrl !== '/logo.png' ? activeCompany.logoUrl : '');
  });

  // Save Logo to localStorage whenever updated to keep it rock stable
  const handleSetLogo = (url: string) => {
    setCustomLogoUrl(url);
    if (url) {
      localStorage.setItem(`DRAWING_LOGO_${activeCompany.id.toUpperCase()}`, url);
    } else {
      localStorage.removeItem(`DRAWING_LOGO_${activeCompany.id.toUpperCase()}`);
    }
  };
  
  // Company Header
  const [companyName, setCompanyName] = useState<string>(() => activeCompany.name);
  const [companyAddress, setCompanyAddress] = useState<string>(() => activeCompany.address || 'Ajman Industrial, UAE');
  const [companyPhone, setCompanyPhone] = useState<string>(() => activeCompany.phone ? `P: ${activeCompany.phone}` : 'P: +971 6 525 0526');
  const [companyWeb, setCompanyWeb] = useState<string>(() => activeCompany.website || activeCompany.email || 'www.marinefasteners.co');

  const handleSyncCompanyFromActive = () => {
    const comp = getActiveCompany();
    setCompanyName(comp.name);
    setCompanyAddress(comp.address || 'Ajman Industrial, UAE');
    setCompanyPhone(comp.phone ? `P: ${comp.phone}` : '');
    setCompanyWeb(comp.website || comp.email || '');
    if (comp.logoUrl && comp.logoUrl !== '/logo.png') {
      setCustomLogoUrl(comp.logoUrl);
    }
    triggerToast?.(`Synchronized title block with ${comp.code || comp.name}`);
  };

  // Dimensions
  const [diameter, setDiameter] = useState<string>('M24');
  const [threadLength, setThreadLength] = useState<string>('120mm');
  const [overallLength, setOverallLength] = useState<string>('600mm');
  const [hookLength, setHookLength] = useState<string>('100mm');
  const [threadType, setThreadType] = useState<string>('Metric Coarse');
  const [quantity, setQuantity] = useState<number>(50);

  // Specifications
  const [boltLabel, setBoltLabel] = useState<string>('Bolt:');
  const [boltSpec, setBoltSpec] = useState<string>('ASTM F1554 Grade 36 Hex');
  const [boltChecked, setBoltChecked] = useState<boolean>(true);
  const [nutLabel, setNutLabel] = useState<string>('Nut:');
  const [nutSpec, setNutSpec] = useState<string>('ASTM A563 Grade A Hex');
  const [nutChecked, setNutChecked] = useState<boolean>(true);
  const [washerLabel, setWasherLabel] = useState<string>('Washer:');
  const [washerSpec, setWasherSpec] = useState<string>('ASTM F436 Hardened');
  const [washerChecked, setWasherChecked] = useState<boolean>(true);
  const [finishLabel, setFinishLabel] = useState<string>('Finish:');
  const [finish, setFinish] = useState<string>('ASTM F2329 Hot-dip Galvanize');
  const [finishChecked, setFinishChecked] = useState<boolean>(true);
  const [assemblyNote, setAssemblyNote] = useState<string>('Hardware is not provided assembled');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [noteItems, setNoteItems] = useState<NoteSpecificationItem[]>([]);

  // Title Block Metadata
  const [approvedBy, setApprovedBy] = useState<string>('Lead Consultant Eng.');
  const [approvalDate, setApprovalDate] = useState<string>('10/11/2026');
  const [salesOrderNo, setSalesOrderNo] = useState<string>('-');
  const [quoteNo, setQuoteNo] = useState<string>('-');
  const [sheetNo, setSheetNo] = useState<string>('1 of 1');
  const [date, setDate] = useState<string>('10/11/2026');
  const [drawnBy, setDrawnBy] = useState<string>('GR');
  const [status, setStatus] = useState<'APPROVED' | 'FOR_REVIEW' | 'REVISED' | 'AS_BUILT' | 'WORK_IN_PROGRESS'>('APPROVED');
  const [revisions, setRevisions] = useState<DrawingRevision[]>([
    { rev: '-', description: '', date: '', by: '' }
  ]);

  // Work Order Specific Metadata
  const [workOrderNo, setWorkOrderNo] = useState<string>('WO-10492');
  const [machineNo, setMachineNo] = useState<string>('CNC Threader #2');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [qcCheckedBy, setQcCheckedBy] = useState<string>('H. Kumar (QC)');

  // Multi-Size Schedule Table & Dynamic Columns
  const [enableSizeTable, setEnableSizeTable] = useState<boolean>(true);
  const [scheduleColumns, setScheduleColumns] = useState<ScheduleColumn[]>(DEFAULT_SCHEDULE_COLUMNS);
  const [sizeSchedule, setSizeSchedule] = useState<DynamicScheduleRow[]>(INITIAL_SCHEDULE_ROWS);

  // Add Column Modal State
  const [showAddColumnModal, setShowAddColumnModal] = useState<boolean>(false);
  const [newColName, setNewColName] = useState<string>('');
  const [newColWidth, setNewColWidth] = useState<string>('60px');
  const [newColPosition, setNewColPosition] = useState<'before_notes' | 'end'>('before_notes');

  // Icon Modal State
  const [showIconModal, setShowIconModal] = useState<boolean>(false);

  // Canvas Annotations: Text Boxes, Resizable Lines, Blueprint Symbols, and Box Shapes
  const [annotationsText, setAnnotationsText] = useState<CanvasAnnotationText[]>([]);
  const [annotationsLines, setAnnotationsLines] = useState<CanvasAnnotationLine[]>([]);
  const [annotationsIcons, setAnnotationsIcons] = useState<CanvasAnnotationIcon[]>([]);
  const [annotationsBoxes, setAnnotationsBoxes] = useState<CanvasAnnotationBox[]>([]);

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewDrawingItem, setPreviewDrawingItem] = useState<DrawingArchiveItem | null>(null);

  // Dragging states
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null);
  const [draggingBoxId, setDraggingBoxId] = useState<string | null>(null);
  const [dragLineHandle, setDragLineHandle] = useState<{ id: string; handle: 'start' | 'end' | 'whole'; startX?: number; startY?: number; origX1?: number; origY1?: number; origX2?: number; origY2?: number } | null>(null);

  // File Upload Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Multi-Sheet Project Support
  const [projectSheets, setProjectSheets] = useState<SubSheetItem[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);

  // Capture current form into SubSheetItem
  const getCurrentSheetSnapshot = (idx: number, total: number, title?: string): SubSheetItem => ({
    id: `sheet-${idx + 1}-${Date.now()}`,
    sheetNo: `${idx + 1} of ${total}`,
    title: title || (idx === 0 ? 'Main Layout' : `Sheet ${idx + 1}`),
    fastenerType,
    dimensionCalloutMode,
    dimensionSubtitle,
    uploadedImageUrl,
    diameter,
    threadLength,
    overallLength,
    hookLength,
    quantity,
    enableSizeTable,
    sizeSchedule,
    scheduleColumns,
    annotationsText,
    annotationsLines,
    annotationsIcons,
    annotationsBoxes
  });

  // Apply SubSheetItem to current form
  const applySubSheetSnapshot = (sheet: SubSheetItem) => {
    setSheetNo(sheet.sheetNo);
    setFastenerType(sheet.fastenerType || 'l_anchor');
    setDimensionCalloutMode(sheet.dimensionCalloutMode || 'letters');
    setDimensionSubtitle(sheet.dimensionSubtitle || 'DxLxCxT');
    setUploadedImageUrl(sheet.uploadedImageUrl || '');
    setDiameter(sheet.diameter || 'M24');
    setThreadLength(sheet.threadLength || '120mm');
    setOverallLength(sheet.overallLength || '600mm');
    setHookLength(sheet.hookLength || '100mm');
    setQuantity(sheet.quantity || 50);
    setEnableSizeTable(sheet.enableSizeTable !== undefined ? sheet.enableSizeTable : true);
    setSizeSchedule(sheet.sizeSchedule || INITIAL_SCHEDULE_ROWS);
    setScheduleColumns(sheet.scheduleColumns || DEFAULT_SCHEDULE_COLUMNS);
    setAnnotationsText(sheet.annotationsText || []);
    setAnnotationsLines(sheet.annotationsLines || []);
    setAnnotationsIcons(sheet.annotationsIcons || []);
    setAnnotationsBoxes(sheet.annotationsBoxes || []);
  };

  // Switch between sheets
  const handleSwitchSheet = (targetIndex: number) => {
    if (targetIndex === activeSheetIndex || targetIndex < 0) return;
    
    // Save current active sheet
    const currentSheets = projectSheets.length > 0 ? [...projectSheets] : [getCurrentSheetSnapshot(0, 1)];
    currentSheets[activeSheetIndex] = getCurrentSheetSnapshot(activeSheetIndex, currentSheets.length, currentSheets[activeSheetIndex]?.title);
    
    setProjectSheets(currentSheets);
    setActiveSheetIndex(targetIndex);
    if (currentSheets[targetIndex]) {
      applySubSheetSnapshot(currentSheets[targetIndex]);
    }
  };

  // Add new sheet (+ ADD SHEET ICON) - Independent sheet creation
  const handleAddSheet = () => {
    // Current sheets list
    const currentList = projectSheets.length > 0 ? [...projectSheets] : [getCurrentSheetSnapshot(0, 1)];
    // Save current active sheet
    currentList[activeSheetIndex] = getCurrentSheetSnapshot(activeSheetIndex, currentList.length, currentList[activeSheetIndex]?.title);

    const newTotal = currentList.length + 1;
    const newSheetIndex = currentList.length;

    // Independent new sheet with fresh schedule and clean annotations (not mandatory to mirror previous sheet)
    const newSheet: SubSheetItem = {
      id: `sheet-${newTotal}-${Date.now()}`,
      sheetNo: `${newTotal} of ${newTotal}`,
      title: `Sheet ${newTotal}`,
      fastenerType: 'l_anchor',
      dimensionCalloutMode: 'letters',
      dimensionSubtitle: 'DxLxCxT',
      uploadedImageUrl: '',
      diameter: 'M24',
      threadLength: '120mm',
      overallLength: '600mm',
      hookLength: '100mm',
      quantity: 50,
      enableSizeTable: true,
      sizeSchedule: [
        { id: `sz-s${newTotal}-1`, sl: 1, mark: `AB-${newTotal}`, dia: 'M24', pitch: '3.0', length: '600mm', thread: '120mm', bend: '100mm', qty: 50, notes: 'Anchor Assembly' }
      ],
      scheduleColumns: [...DEFAULT_SCHEDULE_COLUMNS],
      annotationsText: [],
      annotationsLines: [],
      annotationsIcons: [],
      annotationsBoxes: []
    };

    // Update all sheet numbers to "X of newTotal"
    const updatedList = [...currentList, newSheet].map((s, i) => ({
      ...s,
      sheetNo: `${i + 1} of ${newTotal}`
    }));

    setProjectSheets(updatedList);
    setActiveSheetIndex(newSheetIndex);
    applySubSheetSnapshot(newSheet);
    setSheetNo(`${newTotal} of ${newTotal}`);

    if (triggerToast) triggerToast(`Added Independent Sheet ${newTotal} of ${newTotal}`);
  };

  // Delete sheet
  const handleDeleteSheet = (indexToDelete: number) => {
    if (projectSheets.length <= 1) return;
    const remaining = projectSheets.filter((_, i) => i !== indexToDelete);
    const newTotal = remaining.length;
    const updated = remaining.map((s, i) => ({
      ...s,
      sheetNo: `${i + 1} of ${newTotal}`
    }));

    setProjectSheets(updated);
    const nextActive = Math.max(0, Math.min(indexToDelete, updated.length - 1));
    setActiveSheetIndex(nextActive);
    applySubSheetSnapshot(updated[nextActive]);
    setSheetNo(`${nextActive + 1} of ${newTotal}`);
    if (triggerToast) triggerToast(`Sheet removed.`);
  };

  // Load Drawing into Designer
  const loadDrawingIntoDesigner = (item: DrawingArchiveItem) => {
    setCurrentId(item.id);
    setSheetCategory(item.sheetCategory || 'APPROVAL');
    setDrawingNo(item.drawingNo);
    setJobName(item.jobName);
    setCustomer(item.customer);
    setFastenerType(item.fastenerType || 'l_anchor');
    setDimensionCalloutMode(item.dimensionCalloutMode || 'letters');
    setDimensionSubtitle(item.dimensionSubtitle || 'DxLxCxT');
    setUploadedImageUrl(item.uploadedImageUrl || '');
    if (item.customLogoUrl) {
      handleSetLogo(item.customLogoUrl);
    }
    setCompanyName(item.companyName || 'MARINE FASTENERS INDUSTRIES L.L.C.');
    setCompanyAddress(item.companyAddress || 'Ajman Industrial , UAE');
    setCompanyPhone(item.companyPhone || 'P: +971 6 525 0526');
    setCompanyWeb(item.companyWeb || 'www.marinefasteners.co');
    setDiameter(item.diameter);
    setThreadLength(item.threadLength);
    setOverallLength(item.overallLength);
    setHookLength(item.hookLength || '100mm');
    setThreadType(item.threadType || 'Metric Coarse');
    setQuantity(item.quantity);
    setBoltLabel(item.boltLabel || 'Bolt:');
    setBoltSpec(item.boltSpec);
    setNutLabel(item.nutLabel || 'Nut:');
    setNutSpec(item.nutSpec);
    setWasherLabel(item.washerLabel || 'Washer:');
    setWasherSpec(item.washerSpec);
    setFinishLabel(item.finishLabel || 'Finish:');
    setFinish(item.finish);
    setAssemblyNote(item.assemblyNote);
    setAdditionalNotes(item.additionalNotes || '');
    setNoteItems(item.noteItems || []);
    setApprovedBy(item.approvedBy || '');
    setApprovalDate(item.approvalDate || '10/11/2026');
    setWorkOrderNo(item.workOrderNo || 'WO-10492');
    setMachineNo(item.machineNo || 'CNC Threader #2');
    setPriority(item.priority || 'NORMAL');
    setQcCheckedBy(item.qcCheckedBy || '');
    setSalesOrderNo(item.salesOrderNo || '-');
    setQuoteNo(item.quoteNo || '-');
    setSheetNo(item.sheetNo || '1 of 1');
    setDate(item.date);
    setDrawnBy(item.drawnBy);
    setStatus(item.status);
    setEnableSizeTable(item.enableSizeTable !== undefined ? Boolean(item.enableSizeTable) : true);
    setScheduleColumns(item.scheduleColumns && item.scheduleColumns.length > 0 ? item.scheduleColumns : DEFAULT_SCHEDULE_COLUMNS);
    setSizeSchedule(item.sizeSchedule && item.sizeSchedule.length > 0 ? item.sizeSchedule : INITIAL_SCHEDULE_ROWS);
    setAnnotationsText(item.annotationsText || []);
    setAnnotationsLines(item.annotationsLines || []);
    setAnnotationsIcons(item.annotationsIcons || []);
    setAnnotationsBoxes(item.annotationsBoxes || []);
    if (item.projectSheets && item.projectSheets.length > 0) {
      setProjectSheets(item.projectSheets);
      setActiveSheetIndex(0);
      applySubSheetSnapshot(item.projectSheets[0]);
    } else {
      setProjectSheets([]);
      setActiveSheetIndex(0);
    }
    setRevisions(item.revisions && item.revisions.length > 0 ? item.revisions : [{ rev: '-', description: '', date: '', by: '' }]);
    setActiveTab('designer');
    if (triggerToast) triggerToast(`Loaded ${item.sheetCategory === 'WORK_ORDER' ? 'Work Order' : 'Approval'} Drawing: ${item.drawingNo}`);
  };

  // New Blank Drawing
  const handleNewDrawing = (category: DrawingSheetCategory = 'APPROVAL') => {
    setCurrentId('');
    setSheetCategory(category);
    setDrawingNo(`DWG-MFI-2026-${Math.floor(100 + Math.random() * 900)}`);
    setJobName(category === 'WORK_ORDER' ? 'FABRICATION BATCH' : 'GENERIC SUBSTATION');
    setCustomer(category === 'WORK_ORDER' ? 'INTERNAL PRODUCTION' : 'SMITH CONSTRUCTION');
    setFastenerType('l_anchor');
    setDimensionCalloutMode('letters');
    setDimensionSubtitle('DxLxCxT');
    setUploadedImageUrl('');
    setDiameter('M24');
    setThreadLength('120mm');
    setOverallLength('600mm');
    setHookLength('100mm');
    setQuantity(50);
    setBoltLabel('Bolt:');
    setBoltSpec('ASTM F1554 Grade 36 Hex');
    setNutLabel('Nut:');
    setNutSpec('ASTM A563 Grade A Hex');
    setWasherLabel('Washer:');
    setWasherSpec('ASTM F436 Hardened');
    setFinishLabel('Finish:');
    setFinish('ASTM F2329 Hot-dip Galvanize');
    setAssemblyNote('Hardware is not provided assembled');
    setAdditionalNotes('');
    setNoteItems([]);
    setApprovedBy('Lead Consultant Eng.');
    setApprovalDate('10/11/2026');
    setWorkOrderNo(`WO-${Math.floor(1000 + Math.random() * 9000)}`);
    setMachineNo('CNC Threader #2');
    setPriority('NORMAL');
    setQcCheckedBy('QC Inspector');
    setSalesOrderNo('-');
    setQuoteNo('-');
    setSheetNo('1 of 1');
    setDate('10/11/2026');
    setDrawnBy('GR');
    setStatus(category === 'WORK_ORDER' ? 'WORK_IN_PROGRESS' : 'APPROVED');
    setEnableSizeTable(true);
    setScheduleColumns(DEFAULT_SCHEDULE_COLUMNS);
    setSizeSchedule(INITIAL_SCHEDULE_ROWS);
    setAnnotationsText([]);
    setAnnotationsLines([]);
    setAnnotationsIcons([]);
    setAnnotationsBoxes([]);
    setProjectSheets([]);
    setActiveSheetIndex(0);
    setRevisions([{ rev: '-', description: '', date: '', by: '' }]);
    if (triggerToast) triggerToast(`New Drawing Sheet for ${category === 'WORK_ORDER' ? 'Work Order' : 'Approval'} ready.`);
  };

  // Save to Archives
  const handleSaveToArchives = () => {
    if (!jobName.trim() || !customer.trim()) {
      if (triggerToast) triggerToast('Please enter both Job Name and Customer before saving.');
      return;
    }

    const currentSheets = projectSheets.length > 0 ? [...projectSheets] : [getCurrentSheetSnapshot(0, 1)];
    currentSheets[activeSheetIndex] = getCurrentSheetSnapshot(activeSheetIndex, currentSheets.length, currentSheets[activeSheetIndex]?.title);

    const payload: DrawingArchiveItem = {
      id: currentId || `dwg-${Date.now()}`,
      sn: currentId ? (archives.find(a => a.id === currentId)?.sn || archives.length + 1) : archives.length + 1,
      drawingNo: drawingNo.trim() || `DWG-MFI-${Math.floor(1000 + Math.random() * 9000)}`,
      sheetCategory,
      jobName: jobName.trim(),
      customer: customer.trim(),
      fastenerType: uploadedImageUrl ? 'custom_image' : fastenerType,
      dimensionCalloutMode,
      dimensionSubtitle,
      uploadedImageUrl,
      customLogoUrl,
      companyName,
      companyAddress,
      companyPhone,
      companyWeb,
      diameter: diameter.trim() || 'M24',
      threadLength: threadLength.trim() || '120mm',
      overallLength: overallLength.trim() || '600mm',
      hookLength: hookLength.trim() || '100mm',
      threadType: threadType.trim() || 'Metric Coarse',
      quantity: Number(quantity) || 1,
      boltLabel: boltLabel.trim() || 'Bolt:',
      boltSpec: boltSpec.trim(),
      boltChecked,
      nutLabel: nutLabel.trim() || 'Nut:',
      nutSpec: nutSpec.trim(),
      nutChecked,
      washerLabel: washerLabel.trim() || 'Washer:',
      washerSpec: washerSpec.trim(),
      washerChecked,
      finishLabel: finishLabel.trim() || 'Finish:',
      finish: finish.trim(),
      finishChecked,
      assemblyNote: assemblyNote.trim(),
      additionalNotes: additionalNotes.trim(),
      noteItems,
      approvedBy: approvedBy.trim(),
      approvalDate: approvalDate.trim(),
      workOrderNo: workOrderNo.trim(),
      machineNo: machineNo.trim(),
      priority,
      qcCheckedBy: qcCheckedBy.trim(),
      salesOrderNo: salesOrderNo.trim() || '-',
      quoteNo: quoteNo.trim() || '-',
      sheetNo: sheetNo.trim() || '1 of 1',
      date: date.trim() || '10/11/2026',
      drawnBy: drawnBy.trim() || 'GR',
      enableSizeTable,
      scheduleColumns,
      sizeSchedule: enableSizeTable ? sizeSchedule : [],
      annotationsText,
      annotationsLines,
      annotationsIcons,
      annotationsBoxes,
      projectSheets: currentSheets,
      revisions: revisions.filter(r => r.rev || r.description || r.date || r.by),
      status,
      createdAt: new Date().toISOString()
    };

    if (currentId && archives.some(a => a.id === currentId)) {
      setArchives(archives.map(a => a.id === currentId ? payload : a));
      if (triggerToast) triggerToast('Blueprint updated in archives.');
    } else {
      setCurrentId(payload.id);
      setArchives([payload, ...archives].map((item, idx) => ({ ...item, sn: idx + 1 })));
      if (triggerToast) triggerToast('Saved into Drawing Archives.');
    }
  };

  // Image Upload Handlers
  const handleDrawingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImageUrl(reader.result as string);
        setFastenerType('custom_image');
        if (triggerToast) triggerToast('Custom drawing image uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        handleSetLogo(url);
        if (triggerToast) triggerToast('Company logo updated and stabilized!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Column Submit
  const handleAddColumnSubmit = (presetLabel?: string, presetWidth?: string) => {
    const labelToUse = (presetLabel || newColName).trim().toUpperCase();
    if (!labelToUse) {
      if (triggerToast) triggerToast('Please enter a column name or pick a preset.');
      return;
    }
    const cleanKey = labelToUse.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
    const widthToUse = presetWidth || newColWidth || '60px';

    const newCol: ScheduleColumn = {
      id: `col-${Date.now()}`,
      key: cleanKey,
      label: labelToUse,
      width: widthToUse
    };

    // Ensure all size rows get the new key
    setSizeSchedule(sizeSchedule.map(r => ({ ...r, [cleanKey]: '' })));

    let updatedCols: ScheduleColumn[];
    if (newColPosition === 'before_notes') {
      const notesIdx = scheduleColumns.findIndex(c => c.key === 'notes');
      if (notesIdx !== -1) {
        updatedCols = [
          ...scheduleColumns.slice(0, notesIdx),
          newCol,
          ...scheduleColumns.slice(notesIdx)
        ];
      } else {
        updatedCols = [...scheduleColumns, newCol];
      }
    } else {
      updatedCols = [...scheduleColumns, newCol];
    }

    setScheduleColumns(updatedCols);
    setNewColName('');
    setShowAddColumnModal(false);
    if (triggerToast) triggerToast(`Added column "${newCol.label}" to schedule table.`);
  };

  // 1-Click Quick Add Preset Column
  const handleQuickAddPresetColumn = (label: string, width?: string) => {
    const existing = scheduleColumns.find(c => c.label.toUpperCase() === label.toUpperCase());
    if (existing) {
      if (triggerToast) triggerToast(`Column "${label}" is already in the table.`);
      return;
    }
    handleAddColumnSubmit(label, width);
  };

  // Add Clean Geometric Line Arrow (No forced text on line)
  const handleAddDimensionLine = (type: 'horiz' | 'vert' | 'up_center' | 'leader' = 'horiz') => {
    const id = `dim-${Date.now()}`;
    let newLine: CanvasAnnotationLine;
    if (type === 'horiz') {
      newLine = { id, x1: 25, y1: 50, x2: 75, y2: 50, arrowType: 'both', color: '#000000' };
    } else if (type === 'vert') {
      newLine = { id, x1: 72, y1: 18, x2: 72, y2: 82, arrowType: 'both', color: '#000000' };
    } else if (type === 'up_center') {
      newLine = { id, x1: 50, y1: 25, x2: 50, y2: 8, arrowType: 'end', color: '#000000' };
    } else {
      newLine = { id, x1: 65, y1: 35, x2: 85, y2: 25, arrowType: 'start', color: '#000000' };
    }
    setAnnotationsLines([...annotationsLines, newLine]);
    if (triggerToast) triggerToast('Added line arrow. Drag handles to resize and angle.');
  };

  // Add Customizable Text Box
  const handleAddTextBox = () => {
    const newText: CanvasAnnotationText = {
      id: `txt-${Date.now()}`,
      text: 'Dimension Callout',
      x: 50,
      y: 86,
      fontSize: 12,
      width: 140,
      bold: true,
      bg: 'transparent',
      border: false,
      color: '#000000'
    };
    setAnnotationsText([...annotationsText, newText]);
    if (triggerToast) triggerToast('Added text box. Drag to position, drag right grip to resize width.');
  };

  // Add Icon / Symbol
  const handleAddIcon = (type: CanvasAnnotationIcon['type'], label?: string) => {
    const newIcon: CanvasAnnotationIcon = {
      id: `ic-${Date.now()}`,
      type,
      label,
      x: 45,
      y: 40,
      size: 28,
      color: '#000000'
    };
    setAnnotationsIcons([...annotationsIcons, newIcon]);
    if (triggerToast) triggerToast(`Placed ${label || type} symbol on canvas.`);
  };

  // Add Shape Box Annotation (Adjustable rectangle/square with customizable color & border)
  const handleAddBox = () => {
    const newBox: CanvasAnnotationBox = {
      id: `box-${Date.now()}`,
      x: 35,
      y: 35,
      width: 120,
      height: 80,
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      bgColor: 'transparent',
      label: '',
      labelColor: '#000000'
    };
    setAnnotationsBoxes([...annotationsBoxes, newBox]);
    if (triggerToast) triggerToast('Added shape box. Drag to move, use bottom-right corner to resize, pick color and style.');
  };

  // Canvas Mouse Move (Smooth dragging of Text Boxes, Line handles, Symbols, and Boxes)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(1, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(1, Math.min(99, ((e.clientY - rect.top) / rect.height) * 100));

    // Handle Text Dragging
    if (draggingTextId) {
      setAnnotationsText(annotationsText.map(t => t.id === draggingTextId ? { ...t, x: Math.round(xPct), y: Math.round(yPct) } : t));
      return;
    }

    // Handle Icon Dragging
    if (draggingIconId) {
      setAnnotationsIcons(annotationsIcons.map(ic => ic.id === draggingIconId ? { ...ic, x: Math.round(xPct), y: Math.round(yPct) } : ic));
      return;
    }

    // Handle Box Dragging
    if (draggingBoxId) {
      setAnnotationsBoxes(annotationsBoxes.map(b => b.id === draggingBoxId ? { ...b, x: Math.round(xPct), y: Math.round(yPct) } : b));
      return;
    }

    // Handle Line Arrow Handle Dragging
    if (dragLineHandle) {
      const { id, handle } = dragLineHandle;
      setAnnotationsLines(annotationsLines.map(l => {
        if (l.id !== id) return l;
        if (handle === 'start') {
          return { ...l, x1: Math.round(xPct), y1: Math.round(yPct) };
        } else if (handle === 'end') {
          return { ...l, x2: Math.round(xPct), y2: Math.round(yPct) };
        }
        return l;
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingTextId(null);
    setDraggingIconId(null);
    setDraggingBoxId(null);
    setDragLineHandle(null);
  };

  // Helper to compile current active drawing into full DrawingArchiveItem
  const getCurrentDrawingItem = (): DrawingArchiveItem => {
    const currentSheets = projectSheets.length > 0 ? [...projectSheets] : [getCurrentSheetSnapshot(0, 1)];
    currentSheets[activeSheetIndex] = getCurrentSheetSnapshot(activeSheetIndex, currentSheets.length, currentSheets[activeSheetIndex]?.title);

    return {
      id: currentId || 'temp',
      sn: 1,
      drawingNo,
      sheetCategory,
      jobName,
      customer,
      fastenerType: uploadedImageUrl ? 'custom_image' : fastenerType,
      dimensionCalloutMode,
      dimensionSubtitle,
      uploadedImageUrl,
      customLogoUrl,
      companyName,
      companyAddress,
      companyPhone,
      companyWeb,
      diameter,
      threadLength,
      overallLength,
      hookLength,
      threadType,
      quantity,
      boltLabel,
      boltSpec,
      boltChecked,
      nutLabel,
      nutSpec,
      nutChecked,
      washerLabel,
      washerSpec,
      washerChecked,
      finishLabel,
      finish,
      finishChecked,
      assemblyNote,
      additionalNotes,
      noteItems,
      approvedBy,
      approvalDate,
      workOrderNo,
      machineNo,
      priority,
      qcCheckedBy,
      salesOrderNo,
      quoteNo,
      sheetNo,
      date,
      drawnBy,
      enableSizeTable,
      scheduleColumns,
      sizeSchedule: enableSizeTable ? sizeSchedule : [],
      annotationsText,
      annotationsLines,
      annotationsIcons,
      annotationsBoxes,
      projectSheets: currentSheets,
      revisions,
      status,
      createdAt: new Date().toISOString()
    };
  };

  // Print PDF
  const handlePrintPdfLandscape = () => {
    const currentItem = getCurrentDrawingItem();
    printLandscapeDrawing(currentItem);
  };

  // Open Preview Modal for current drawing
  const handleOpenCurrentPreview = () => {
    const currentItem = getCurrentDrawingItem();
    setPreviewDrawingItem(currentItem);
    setShowPreviewModal(true);
  };

  // Open Preview Modal for archived drawing
  const handleOpenArchivePreview = (item: DrawingArchiveItem) => {
    setPreviewDrawingItem(item);
    setShowPreviewModal(true);
  };

  const isLetterMode = dimensionCalloutMode === 'letters';
  const labelD = isLetterMode ? 'D' : diameter;
  const labelT = isLetterMode ? 'T' : threadLength;
  const labelL = isLetterMode ? 'L' : overallLength;
  const labelC = isLetterMode ? 'C' : (hookLength || '100mm');

  return (
    <div className="space-y-4 font-sans text-slate-800" onMouseUp={handleCanvasMouseUp}>
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={handleDrawingImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={logoInputRef} 
        onChange={handleLogoUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* TOP UNIFIED COMMAND BAR */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        
        {/* Left: Branding + Sheet Type Segmented Capsule */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B3B49] flex items-center justify-center text-cyan-400 shrink-0 shadow-2xs">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">ENGINEERING BLUEPRINTS</h2>
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  CAD
                </span>
              </div>
            </div>
          </div>

          {/* Inline Sheet Type Toggle (Approval vs Work Order) */}
          {activeTab === 'designer' && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSheetCategory('APPROVAL');
                  if (triggerToast) triggerToast('Switched to Drawing Sheet for Approval');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheetCategory === 'APPROVAL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>FOR APPROVAL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSheetCategory('WORK_ORDER');
                  if (triggerToast) triggerToast('Switched to Drawing Sheet for Work Order');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheetCategory === 'WORK_ORDER'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>FOR WORK ORDER</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Main View Tabs & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          
          {/* Main View Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('designer')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'designer' ? 'bg-[#0B3B49] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Drawing Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archives')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'archives' ? 'bg-[#0B3B49] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Archives</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-slate-300 text-slate-800">
                {archives.length}
              </span>
            </button>
          </div>

          {activeTab === 'designer' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleNewDrawing(sheetCategory)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Create new blank blueprint"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>

              <button
                type="button"
                onClick={handleAddSheet}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Add a new Drawing Sheet (Continuation Sheet)"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Sheet</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToArchives}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCurrentPreview}
                className="px-3 py-1 bg-[#0B3B49] hover:bg-[#072731] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Preview blueprint and print PDF"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-300" />
                <span>Print PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DRAWING SHEET (DESIGNER)                                            */}
      {/* ========================================================================= */}
      {activeTab === 'designer' && (
        <div className="space-y-3">

          {/* MULTI-SHEET PROJECT NAVIGATION BAR */}
          <div className="bg-slate-900 text-white rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs flex-wrap border border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" />
                <span>Sheets:</span>
              </span>
              
              {projectSheets.length > 0 ? (
                projectSheets.map((sh, idx) => (
                  <button
                    key={sh.id || idx}
                    type="button"
                    onClick={() => handleSwitchSheet(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeSheetIndex === idx
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    <span>Sheet {idx + 1} of {projectSheets.length}</span>
                    {sh.title ? <span className="text-[10px] opacity-75 font-normal">({sh.title})</span> : null}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/50 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  <span>Sheet {sheetNo || '1 of 1'}</span>
                  <span className="text-[10px] opacity-75 font-normal">(Main Layout)</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={handleAddSheet}
                className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/35 text-blue-300 border border-blue-400/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:text-white"
                title="Add next drawing sheet to this project (+ ADD SHEET ICON)"
              >
                <FilePlus className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Add Sheet</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {projectSheets.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSheet(activeSheetIndex)}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer hover:text-white"
                  title="Delete this sheet from project"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Sheet</span>
                </button>
              )}
              <span className="text-[10px] text-slate-400 font-mono">
                {projectSheets.length > 1 ? `Multi-Sheet Drawing (${projectSheets.length} Sheets)` : 'Single Sheet Drawing (Auto-splits on overflow)'}
              </span>
            </div>
          </div>

          {/* TOOLBAR FOR IMAGE UPLOAD, ANNOTATIONS, TEXT BOXES & ICONS */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Left Tools: Lines, Text Box, + Add Icon */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Upload Image Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadedImageUrl ? 'Change Image' : 'Upload Image'}</span>
              </button>

              {uploadedImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImageUrl('');
                    setFastenerType('l_anchor');
                    if (triggerToast) triggerToast('Switched back to vector schematic.');
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Clear Image
                </button>
              )}

              {/* Add Clean Geometric Arrows */}
              <div className="flex items-center gap-1 bg-amber-50 p-0.5 rounded-lg border border-amber-200">
                <button
                  type="button"
                  onClick={() => handleAddDimensionLine('horiz')}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Add horizontal resizable dimension arrow"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
                  <span>+ Horiz Arrow</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDimensionLine('vert')}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Add vertical resizable dimension arrow"
                >
                  <Ruler className="w-3.5 h-3.5 text-amber-700" />
                  <span>+ Vert Arrow</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddDimensionLine('up_center')}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Add vertical centerline arrow"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-amber-700" />
                  <span>+ Centerline</span>
                </button>
              </div>

              {/* Add Text Box Button */}
              <button
                type="button"
                onClick={handleAddTextBox}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Add draggable text box with customizable background and border"
              >
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Add Text Box</span>
              </button>

              {/* Add Box / Rectangle Shape Button */}
              <button
                type="button"
                onClick={handleAddBox}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Add adjustable square/rectangle shape box with custom color and border"
              >
                <Square className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Add Box</span>
              </button>

              {/* Add Icon Symbol Modal Button */}
              <button
                type="button"
                onClick={() => setShowIconModal(true)}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Add Nut, Washer, Weld symbol, Centerline, North Arrow, QC stamp icons"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Add Icon</span>
              </button>

            </div>

            {/* Right Options: Multi-size Schedule Toggle & Logo Upload */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              
              {/* Multi-Size Table Toggle */}
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableSizeTable}
                  onChange={(e) => {
                    setEnableSizeTable(e.target.checked);
                    if (triggerToast) triggerToast(e.target.checked ? 'Size schedule table enabled.' : 'Size table disabled.');
                  }}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <Table className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sizes & Quantities Schedule</span>
              </label>

              {/* Upload & Stabilize Logo Button */}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                title="Upload custom company logo"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600" />
                <span>{customLogoUrl ? 'Change Logo' : 'Upload Logo'}</span>
              </button>

              {customLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleSetLogo('')}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                  title="Reset to default MF logo"
                >
                  Reset Logo
                </button>
              )}

            </div>

          </div>

          {/* MAIN HORIZONTAL LANDSCAPE DRAWING SHEET */}
          <div className="w-full overflow-x-auto">
            
            <div className="w-full bg-white border-2 border-black p-0 shadow-md font-sans text-black select-none">
              
              {/* TOP BANNER */}
              <div className="bg-black text-white text-center font-bold text-[10.5px] py-1 tracking-wider uppercase border-b-2 border-black flex items-center justify-between px-3">
                <span>
                  {sheetCategory === 'WORK_ORDER' 
                    ? 'DRAWING SHEET FOR WORK ORDER' 
                    : 'DRAWING SHEET FOR APPROVAL'}
                </span>
                <span className="text-[9px] font-mono opacity-80">{drawingNo}</span>
              </div>

              {/* LANDSCAPE LAYOUT: 64% DRAWING & SIZE TABLE, 36% SPECIFICATION TITLE BLOCK */}
              <div className="flex flex-col md:flex-row min-h-[580px]">
                
                {/* 1. LEFT DRAWING & SCHEDULE CANVAS (64% width) */}
                <div className="w-full md:w-[64%] border-b-2 md:border-b-0 md:border-r-2 border-black p-3.5 flex flex-col justify-between relative bg-white">
                  
                  {/* Interactive Canvas */}
                  <CanvasAnnotationArea
                    canvasRef={canvasRef}
                    uploadedImageUrl={uploadedImageUrl}
                    fastenerType={fastenerType}
                    dimensionSubtitle={dimensionSubtitle}
                    labelD={labelD}
                    labelT={labelT}
                    labelL={labelL}
                    labelC={labelC}
                    enableSizeTable={enableSizeTable}
                    annotationsText={annotationsText}
                    setAnnotationsText={setAnnotationsText}
                    annotationsLines={annotationsLines}
                    setAnnotationsLines={setAnnotationsLines}
                    annotationsIcons={annotationsIcons}
                    setAnnotationsIcons={setAnnotationsIcons}
                    annotationsBoxes={annotationsBoxes}
                    setAnnotationsBoxes={setAnnotationsBoxes}
                    draggingTextId={draggingTextId}
                    setDraggingTextId={setDraggingTextId}
                    draggingIconId={draggingIconId}
                    setDraggingIconId={setDraggingIconId}
                    draggingBoxId={draggingBoxId}
                    setDraggingBoxId={setDraggingBoxId}
                    dragLineHandle={dragLineHandle}
                    setDragLineHandle={setDragLineHandle}
                    onCanvasMouseMove={handleCanvasMouseMove}
                  />

                  {/* Multi-size Schedule Table */}
                  {enableSizeTable && (
                    <ScheduleTableEditor
                      scheduleColumns={scheduleColumns}
                      setScheduleColumns={setScheduleColumns}
                      sizeSchedule={sizeSchedule}
                      setSizeSchedule={setSizeSchedule}
                      onOpenAddColumnModal={() => {
                        setNewColName('');
                        setShowAddColumnModal(true);
                      }}
                      onQuickAddPresetColumn={handleQuickAddPresetColumn}
                      triggerToast={triggerToast}
                    />
                  )}

                  {/* Quantity (if not using schedule table) */}
                  {!enableSizeTable && (
                    <div className="pt-2 border-t border-dashed border-slate-300 mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Total Quantity:</span>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                          className="w-20 px-2 py-0.5 text-sm font-bold border border-slate-400 rounded outline-none"
                        />
                        <span className="text-xs font-bold text-slate-600">PCS</span>
                      </div>
                      {sheetCategory === 'WORK_ORDER' && (
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <span>Priority:</span>
                          <select
                            value={priority}
                            onChange={(e: any) => setPriority(e.target.value)}
                            className="border border-black font-bold px-2 py-0.5 rounded text-xs"
                          >
                            <option value="NORMAL">NORMAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* 2. RIGHT SPECIFICATION & TITLE BLOCK PANEL (36% width) */}
                <div className="w-full md:w-[36%] flex flex-col justify-between text-[10px] leading-tight bg-white">
                  
                  {/* A. NOTES BLOCK (TOP RIGHT - EDITABLE BOLT, NUT, WASHER, FINISH + CUSTOM NOTES) */}
                  <DrawingNotesBlock
                    boltLabel={boltLabel}
                    setBoltLabel={setBoltLabel}
                    boltSpec={boltSpec}
                    setBoltSpec={setBoltSpec}
                    boltChecked={boltChecked}
                    setBoltChecked={setBoltChecked}
                    nutLabel={nutLabel}
                    setNutLabel={setNutLabel}
                    nutSpec={nutSpec}
                    setNutSpec={setNutSpec}
                    nutChecked={nutChecked}
                    setNutChecked={setNutChecked}
                    washerLabel={washerLabel}
                    setWasherLabel={setWasherLabel}
                    washerSpec={washerSpec}
                    setWasherSpec={setWasherSpec}
                    washerChecked={washerChecked}
                    setWasherChecked={setWasherChecked}
                    finishLabel={finishLabel}
                    setFinishLabel={setFinishLabel}
                    finish={finish}
                    setFinish={setFinish}
                    finishChecked={finishChecked}
                    setFinishChecked={setFinishChecked}
                    assemblyNote={assemblyNote}
                    setAssemblyNote={setAssemblyNote}
                    noteItems={noteItems}
                    setNoteItems={setNoteItems}
                    isWorkOrder={sheetCategory === 'WORK_ORDER'}
                  />

                  {/* TITLE BLOCK DOCKED AT BOTTOM */}
                  <div className="mt-auto flex flex-col shrink-0 bg-white">
                    {/* B. APPROVAL SIGNATURE OR WORK ORDER ROUTING BLOCK */}
                    {sheetCategory === 'WORK_ORDER' ? (
                      <div className="p-2.5 border-b-2 border-black bg-amber-50/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px]">Work Order #:</span>
                          <input
                            type="text"
                            value={workOrderNo}
                            onChange={(e) => setWorkOrderNo(e.target.value)}
                            className="w-28 font-mono font-bold text-center border-b border-black bg-transparent outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px]">Machine / Line:</span>
                          <input
                            type="text"
                            value={machineNo}
                            onChange={(e) => setMachineNo(e.target.value)}
                            className="w-36 font-semibold text-center border-b border-black bg-transparent outline-none text-[9.5px]"
                          />
                        </div>
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[9.5px] w-24">QC Checked By:</span>
                          <input
                            type="text"
                            placeholder="QC Sign"
                            value={qcCheckedBy}
                            onChange={(e) => setQcCheckedBy(e.target.value)}
                            className="flex-1 font-bold text-center border-b border-black bg-transparent outline-none text-[10px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 border-b-2 border-black space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-20 text-[10px] text-slate-700">Approved By</span>
                          <input
                            type="text"
                            placeholder="Sign / Initial"
                            value={approvedBy}
                            onChange={(e) => setApprovedBy(e.target.value)}
                            className="flex-1 border-b border-black text-center font-bold text-xs bg-transparent outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-20 text-[10px] text-slate-700">Date</span>
                          <input
                            type="text"
                            value={approvalDate}
                            onChange={(e) => setApprovalDate(e.target.value)}
                            className="flex-1 border-b border-black text-center font-bold text-xs bg-transparent outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* C. COMPANY BRANDING & LOGO BLOCK (STABLE LOGO) */}
                    <div className="p-2.5 border-b-2 border-black bg-white flex items-center gap-3">
                      <div className="shrink-0 cursor-pointer" onClick={() => logoInputRef.current?.click()} title="Click to Upload Logo">
                        {customLogoUrl ? (
                          <img src={customLogoUrl} alt="Company Logo" className="max-h-12 max-w-[95px] object-contain" />
                        ) : isMfi ? (
                          <svg viewBox="0 0 92 48" className="w-[84px] h-[44px]">
                            <line x1="2" y1="10" x2="20" y2="10" stroke="#000" strokeWidth="1.5" />
                            <line x1="0" y1="16" x2="16" y2="16" stroke="#000" strokeWidth="1.5" />
                            <line x1="3" y1="22" x2="18" y2="22" stroke="#000" strokeWidth="1.5" />
                            <line x1="1" y1="28" x2="14" y2="28" stroke="#000" strokeWidth="1.5" />
                            <line x1="4" y1="34" x2="17" y2="34" stroke="#000" strokeWidth="1.5" />
                            <path d="M 22,36 L 27,8 L 36,8 L 41,26 L 47,8 L 56,8 L 51,36 L 44,36 L 47,19 L 41,36 L 36,36 L 33,19 L 29,36 Z" fill="#000" />
                            <path d="M 58,36 L 63,8 L 86,8 L 84,14 L 70,14 L 68,22 L 80,22 L 78,28 L 66,28 L 64,36 Z" fill="#000" />
                            <text x="54" y="44" fontSize="5" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" letterSpacing="0.5" textAnchor="middle">MARINE FASTENERS</text>
                          </svg>
                        ) : isBmm ? (
                          <svg viewBox="0 0 96 44" className="w-[84px] h-[44px]">
                            <rect x="2" y="2" width="92" height="40" rx="3" fill="#0e2a47" stroke="#f59e0b" strokeWidth="1.5" />
                            <text x="48" y="22" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="11" fill="#ffffff" textAnchor="middle" letterSpacing="0.5">BOLT MASTER</text>
                            <line x1="10" y1="27" x2="86" y2="27" stroke="#f59e0b" strokeWidth="1" />
                            <text x="48" y="36" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="5.5" fill="#f59e0b" textAnchor="middle" letterSpacing="1">BUILDING MATERIALS</text>
                          </svg>
                        ) : isUmi ? (
                          <svg viewBox="0 0 96 44" className="w-[84px] h-[44px]">
                            <rect x="2" y="2" width="92" height="40" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                            <text x="48" y="22" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="10.5" fill="#38bdf8" textAnchor="middle" letterSpacing="0.5">UNITED METAL</text>
                            <line x1="10" y1="27" x2="86" y2="27" stroke="#94a3b8" strokeWidth="1" />
                            <text x="48" y="36" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="5.5" fill="#ffffff" textAnchor="middle" letterSpacing="0.8">INDUSTRIES SPS-L.L.C</text>
                          </svg>
                        ) : (
                          <div className="h-10 px-2 bg-black text-white rounded text-[10px] font-black uppercase flex items-center justify-center">
                            {activeCompany.code || activeCompany.name.split(' ')[0]}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-[9px] leading-tight space-y-0.5">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full font-black text-[11.5px] uppercase tracking-tight bg-transparent outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSyncCompanyFromActive}
                            title="Sync active company info into drawing title block"
                            className="text-[7.5px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded px-1 py-0.2 shrink-0 cursor-pointer ml-1 print:hidden"
                          >
                            Sync
                          </button>
                        </div>
                        <input
                          type="text"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          className="w-full text-[9px] text-slate-800 bg-transparent outline-none"
                        />
                        <input
                          type="text"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          className="w-full text-[9px] text-slate-800 bg-transparent outline-none"
                        />
                        <input
                          type="text"
                          value={companyWeb}
                          onChange={(e) => setCompanyWeb(e.target.value)}
                          className="w-full text-[9px] font-bold text-slate-900 bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* D. JOB NAME & CUSTOMER */}
                    <div className="border-b-2 border-black">
                      <div className="p-1 px-2.5 border-b border-black text-[10px] flex items-center gap-1">
                        <span className="font-bold w-18 shrink-0">Job Name:</span>
                        <input
                          type="text"
                          value={jobName}
                          onChange={(e) => setJobName(e.target.value)}
                          className="flex-1 font-bold uppercase bg-transparent outline-none"
                        />
                      </div>
                      <div className="p-1 px-2.5 text-[10px] flex items-center gap-1">
                        <span className="font-bold w-18 shrink-0">Customer:</span>
                        <input
                          type="text"
                          value={customer}
                          onChange={(e) => setCustomer(e.target.value)}
                          className="flex-1 font-bold uppercase bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* E. REVISIONS TABLE */}
                    <div className="border-b-2 border-black">
                      <div className="text-center font-bold text-[9.5px] border-b border-black py-0.5 bg-white">
                        Revisions
                      </div>
                      <table className="w-full border-collapse text-[9px]">
                        <thead>
                          <tr className="border-b border-black bg-white">
                            <th className="w-[12%] border-r border-black p-0.5 font-bold">Rev</th>
                            <th className="w-[50%] border-r border-black p-0.5 font-bold">Description</th>
                            <th className="w-[23%] border-r border-black p-0.5 font-bold">Date</th>
                            <th className="w-[15%] p-0.5 font-bold">By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revisions.map((rev, idx) => (
                            <tr key={idx} className="border-b border-black/30">
                              <td className="border-r border-black p-0.5 text-center">
                                <input
                                  type="text"
                                  value={rev.rev}
                                  onChange={(e) => {
                                    const updated = [...revisions];
                                    updated[idx].rev = e.target.value;
                                    setRevisions(updated);
                                  }}
                                  className="w-full text-center font-bold bg-transparent outline-none"
                                />
                              </td>
                              <td className="border-r border-black p-0.5">
                                <input
                                  type="text"
                                  value={rev.description}
                                  onChange={(e) => {
                                    const updated = [...revisions];
                                    updated[idx].description = e.target.value;
                                    setRevisions(updated);
                                  }}
                                  className="w-full bg-transparent outline-none"
                                />
                              </td>
                              <td className="border-r border-black p-0.5 text-center">
                                <input
                                  type="text"
                                  value={rev.date}
                                  onChange={(e) => {
                                    const updated = [...revisions];
                                    updated[idx].date = e.target.value;
                                    setRevisions(updated);
                                  }}
                                  className="w-full text-center bg-transparent outline-none"
                                />
                              </td>
                              <td className="p-0.5 text-center">
                                <input
                                  type="text"
                                  value={rev.by}
                                  onChange={(e) => {
                                    const updated = [...revisions];
                                    updated[idx].by = e.target.value;
                                    setRevisions(updated);
                                  }}
                                  className="w-full text-center bg-transparent outline-none"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* F. SALES ORDER & QUOTE NUMBER */}
                    <div className="border-b-2 border-black flex text-[9px]">
                      <div className="w-1/2 border-r border-black p-1 px-2">
                        <div className="text-[7.5px] text-slate-500">Sales Order Number</div>
                        <input
                          type="text"
                          value={salesOrderNo}
                          onChange={(e) => setSalesOrderNo(e.target.value)}
                          className="w-full font-mono font-bold bg-transparent outline-none"
                        />
                      </div>
                      <div className="w-1/2 p-1 px-2">
                        <div className="text-[7.5px] text-slate-500">Quote Number</div>
                        <input
                          type="text"
                          value={quoteNo}
                          onChange={(e) => setQuoteNo(e.target.value)}
                          className="w-full font-mono font-bold bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* G. SHEET, DATE, BY FOOTER */}
                    <div className="flex text-[9px]">
                      <div className="w-1/3 border-r border-black p-1 text-center">
                        <div className="text-[7.5px] text-slate-500 flex items-center justify-center gap-1">
                          <span>Sheet</span>
                          <button
                            type="button"
                            onClick={handleAddSheet}
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="Add next sheet (+ ADD SHEET ICON)"
                          >
                            <FilePlus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={sheetNo}
                          onChange={(e) => setSheetNo(e.target.value)}
                          className="w-full text-center font-bold bg-transparent outline-none"
                        />
                      </div>
                      <div className="w-1/3 border-r border-black p-1 text-center">
                        <div className="text-[7.5px] text-slate-500">Date</div>
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full text-center font-bold bg-transparent outline-none"
                        />
                      </div>
                      <div className="w-1/3 p-1 text-center">
                        <div className="text-[7.5px] text-slate-500">By</div>
                        <input
                          type="text"
                          value={drawnBy}
                          onChange={(e) => setDrawnBy(e.target.value)}
                          className="w-full text-center font-bold bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DRAWING ARCHIVES (2 CATEGORIES: WORK ORDER & APPROVAL)              */}
      {/* ========================================================================= */}
      {activeTab === 'archives' && (
        <DrawingArchivesView
          archives={archives}
          setArchives={setArchives}
          onLoadDrawing={loadDrawingIntoDesigner}
          onNewDrawing={(category) => {
            handleNewDrawing(category);
            setActiveTab('designer');
          }}
          onPreviewDrawing={handleOpenArchivePreview}
          triggerToast={triggerToast}
        />
      )}

      {/* ========================================================================= */}
      {/* ADD SCHEDULE COLUMN MODAL DIALOG                                          */}
      {/* ========================================================================= */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Add Schedule Column</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Insert custom columns into the sizes & quantities table</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddColumnModal(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Presets (Click to Fill)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SCHEDULE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setNewColName(preset.label);
                        setNewColWidth(preset.width);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        newColName.toUpperCase() === preset.label
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Column Header Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. WASHER DIA, GRADE, PROJECTION, NUT QTY"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColumnSubmit();
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase focus:bg-white focus:border-blue-600 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Position
                  </label>
                  <select
                    value={newColPosition}
                    onChange={(e: any) => setNewColPosition(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 cursor-pointer outline-none focus:border-blue-600"
                  >
                    <option value="before_notes">Before NOTES (Standard)</option>
                    <option value="end">At End of Table</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Column Width
                  </label>
                  <select
                    value={newColWidth}
                    onChange={(e) => setNewColWidth(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 cursor-pointer outline-none focus:border-blue-600"
                  >
                    <option value="50px">Compact (50px)</option>
                    <option value="60px">Standard (60px)</option>
                    <option value="75px">Medium (75px)</option>
                    <option value="90px">Wide (90px)</option>
                    <option value="auto">Auto-Fit</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowAddColumnModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={() => handleAddColumnSubmit()}
                disabled={!newColName.trim()}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  newColName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Column</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD ICON / BLUEPRINT SYMBOL MODAL                                         */}
      {/* ========================================================================= */}
      <IconSymbolModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onAddIcon={handleAddIcon}
      />

      {/* ========================================================================= */}
      {/* BLUEPRINT PDF PREVIEW MODAL DIALOG                                        */}
      {/* ========================================================================= */}
      {showPreviewModal && previewDrawingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div 
            className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden text-white animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-100 truncate">
                      {previewDrawingItem.drawingNo || 'Drawing Preview'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      previewDrawingItem.sheetCategory === 'WORK_ORDER'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {previewDrawingItem.sheetCategory === 'WORK_ORDER' ? 'Work Order' : 'For Approval'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {previewDrawingItem.customer} • {previewDrawingItem.jobName} • {previewDrawingItem.projectSheets && previewDrawingItem.projectSheets.length > 1 ? `${previewDrawingItem.projectSheets.length} Drawing Sheets (Multi-Page)` : `Sheet ${previewDrawingItem.sheetNo || '1 of 1'}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    printLandscapeDrawing(previewDrawingItem);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Print Landscape PDF (All Pages / Multi-Sheet)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Viewport Container */}
            <div className="flex-1 bg-slate-800/80 p-3 sm:p-5 overflow-auto flex items-center justify-center">
              <div className="w-full h-full max-w-[1040px] bg-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
                <iframe
                  title="Blueprint PDF Preview"
                  srcDoc={generateLandscapeDrawingHtml(previewDrawingItem)}
                  className="w-full h-full border-none bg-white"
                  style={{ minHeight: '560px' }}
                />
              </div>
            </div>

            {/* Footer Bar */}
            <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11px] flex items-center gap-2">
                <span>📐 True CAD Landscape Submittal</span>
                {previewDrawingItem.projectSheets && previewDrawingItem.projectSheets.length > 1 && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    Multi-Sheet Drawing ({previewDrawingItem.projectSheets.length} Sheets) • Scroll down inside preview to view all pages
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printLandscapeDrawing(previewDrawingItem);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
