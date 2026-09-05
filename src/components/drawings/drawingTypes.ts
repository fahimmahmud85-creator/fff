export interface DrawingRevision {
  rev: string;
  description: string;
  date: string;
  by: string;
}

export type DrawingSheetCategory = 'APPROVAL' | 'WORK_ORDER';

export interface ScheduleColumn {
  id: string;
  key: string;
  label: string;
  width?: string;
}

export interface DynamicScheduleRow {
  id: string;
  [key: string]: any;
}

export interface SizeScheduleRow {
  id: string;
  sl: number;
  mark: string;
  dia: string;
  pitch: string;
  length: string;
  thread: string;
  bend: string;
  qty: number | string;
  notes: string;
  [key: string]: any;
}

export interface CanvasAnnotationText {
  id: string;
  text: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  fontSize: number;
  width?: number; // optional custom width in px
  color?: string;
  bold?: boolean;
  bg?: 'white' | 'transparent' | 'yellow';
  border?: boolean;
}

export interface CanvasAnnotationLine {
  id: string;
  x1: number; // percentage (0-100)
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  arrowType: 'both' | 'start' | 'end' | 'none' | 'inward';
  color?: string;
  extensionLines?: boolean;
  extLen?: number;
}

export interface CanvasAnnotationIcon {
  id: string;
  type: 'hex_nut' | 'washer' | 'plate_washer' | 'weld_symbol' | 'centerline' | 'north_arrow' | 'rev_triangle' | 'qc_stamp' | 'warning' | 'datum';
  label?: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  size: number;
  color?: string;
}

export interface CanvasAnnotationBox {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // in px
  height: number; // in px
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  bgColor: string; // transparent, #fee2e2, #dbeafe, etc.
  label?: string;
  labelColor?: string;
}

export interface NoteSpecificationItem {
  id: string;
  label: string;
  value: string;
  checked?: boolean;
}

export interface SubSheetItem {
  id: string;
  sheetNo: string;
  title: string;
  fastenerType: 'l_anchor' | 'hex_anchor' | 'straight_stud' | 'j_anchor' | 'plate_anchor' | 'u_bolt' | 'custom_image';
  dimensionCalloutMode?: 'letters' | 'values';
  dimensionSubtitle?: string;
  uploadedImageUrl?: string;
  diameter?: string;
  threadLength?: string;
  overallLength?: string;
  hookLength?: string;
  quantity?: number;
  enableSizeTable?: boolean;
  sizeSchedule?: DynamicScheduleRow[];
  scheduleColumns?: ScheduleColumn[];
  annotationsText?: CanvasAnnotationText[];
  annotationsLines?: CanvasAnnotationLine[];
  annotationsIcons?: CanvasAnnotationIcon[];
  annotationsBoxes?: CanvasAnnotationBox[];
}

export interface DrawingArchiveItem {
  id: string;
  sn: number;
  drawingNo: string;
  sheetCategory: DrawingSheetCategory; // 'APPROVAL' | 'WORK_ORDER'
  jobName: string;
  customer: string;
  fastenerType: 'l_anchor' | 'hex_anchor' | 'straight_stud' | 'j_anchor' | 'plate_anchor' | 'u_bolt' | 'custom_image';
  dimensionCalloutMode?: 'letters' | 'values'; // 'letters' => D, L, C, T; 'values' => 1", 24", 6"
  dimensionSubtitle?: string; // e.g. "Dimensions\nDxLxCxT"
  uploadedImageUrl?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWeb: string;
  customLogoUrl?: string;
  diameter: string;
  threadLength: string;
  overallLength: string;
  hookLength?: string;
  threadType: string;
  quantity: number;
  boltLabel?: string;
  boltSpec: string;
  boltChecked?: boolean;
  nutLabel?: string;
  nutSpec: string;
  nutChecked?: boolean;
  washerLabel?: string;
  washerSpec: string;
  washerChecked?: boolean;
  finishLabel?: string;
  finish: string;
  finishChecked?: boolean;
  assemblyNote: string;
  additionalNotes?: string;
  noteItems?: NoteSpecificationItem[]; // Dynamic editable bolt/nut/washer notes
  approvedBy: string;
  approvalDate: string;
  // Work order specific fields
  workOrderNo?: string;
  operatorName?: string;
  machineNo?: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  qcCheckedBy?: string;
  // General title block fields
  salesOrderNo: string;
  quoteNo: string;
  sheetNo: string;
  date: string;
  drawnBy: string;
  revisions: DrawingRevision[];
  enableSizeTable?: boolean;
  scheduleColumns?: ScheduleColumn[];
  sizeSchedule?: DynamicScheduleRow[];
  annotationsText?: CanvasAnnotationText[];
  annotationsLines?: CanvasAnnotationLine[];
  annotationsIcons?: CanvasAnnotationIcon[];
  annotationsBoxes?: CanvasAnnotationBox[];
  projectSheets?: SubSheetItem[];
  status: 'APPROVED' | 'FOR_REVIEW' | 'REVISED' | 'AS_BUILT' | 'WORK_IN_PROGRESS';
  createdAt: string;
}

