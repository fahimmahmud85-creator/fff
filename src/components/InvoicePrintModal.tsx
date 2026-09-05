import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Eye,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckSquare,
  Square,
  Layers,
  Palette,
  FileText,
  Sliders,
  Sparkles,
  Shield,
  QrCode,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Save,
  RotateCcw,
  Tag,
  Calendar,
  Building,
  DollarSign,
  Download,
  Loader2,
  FolderOpen,
  Edit3
} from 'lucide-react';
import { PrintOptions, generateHighFidelityDocHtml } from './DocumentPrintGenerator';
import { 
  printHtml, 
  downloadPdfFromHtml, 
  promptSaveFilePicker, 
  generatePdfBlobFromHtml, 
  generateWordDocBlob, 
  triggerBlobDownload, 
  exportToWordDoc,
  showPrintToast
} from './PrintHelper';
import { getActiveCompany } from '../utils/companyProfile';

// Module-level persistent cache for chosen directory handle across modal opens
let globalCachedDirHandle: any = null;
let globalCachedDirName: string = '';

export interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: any;
  defaultDocType?: string;
  onApplySettings?: (options: PrintOptions) => void;
}

export type TemplateId = 'TEMPLATE_1' | 'TEMPLATE_2' | 'TEMPLATE_3' | 'TEMPLATE_4' | 'TEMPLATE_5' | 'TEMPLATE_6';

export interface TemplateDefinition {
  id: TemplateId;
  index: number;
  name: string;
  subtitle: string;
  tag: string;
  recommendedFor: string;
}

export const INVOICE_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'TEMPLATE_1',
    index: 1,
    name: 'Template 1: Modern Corporate',
    subtitle: 'Suitable for standard official company & party billing',
    tag: 'Executive',
    recommendedFor: 'Standard official corporate Tax Invoices, Delivery Notes & Work Orders'
  },
  {
    id: 'TEMPLATE_2',
    index: 2,
    name: 'Template 2: Classic Boxed Grid (Tally ERP)',
    subtitle: 'Classic boxed structure with tax analysis breakdown & declaration',
    tag: 'Classic ERP',
    recommendedFor: 'Full bordered layout with HSN/SAC, Amount in words & Tax analysis table'
  },
  {
    id: 'TEMPLATE_3',
    index: 3,
    name: 'Template 3: E-Invoice & Prominent QR',
    subtitle: 'UAE e-Billing compliant with dynamic QR code & Place of Supply',
    tag: 'e-Invoice',
    recommendedFor: 'Digital compliance, instant QR scanning and verified VAT TRN'
  },
  {
    id: 'TEMPLATE_4',
    index: 4,
    name: 'Template 4: Clean Modern Borderless',
    subtitle: 'Sleek minimal typography with airy spacing & refined dividers',
    tag: 'Minimal',
    recommendedFor: 'Export clients, high-contrast modern presentation & engineering quotes'
  },
  {
    id: 'TEMPLATE_5',
    index: 5,
    name: 'Template 5: Technical Specification & Weights',
    subtitle: 'Includes Pallet/Box info, weights per 1000pcs & packing matrix',
    tag: 'Fasteners Matrix',
    recommendedFor: 'Industrial fasteners, warehouse shipments, weight calculations & packing lists'
  },
  {
    id: 'TEMPLATE_6',
    index: 6,
    name: 'Template 6: Compact Counter Slip',
    subtitle: 'High-density condensed single page for quick delivery receipts',
    tag: 'Compact',
    recommendedFor: 'Quick counter handovers, yard deliveries & condensed receipts'
  }
];

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  documentData,
  defaultDocType,
  onApplySettings
}) => {

  // View state: 'CONFIG_DIALOG' (Image 1) or 'TEMPLATE_STUDIO' (Image 2)
  const [activeView, setActiveView] = useState<'CONFIG_DIALOG' | 'TEMPLATE_STUDIO'>('CONFIG_DIALOG');
  
  // Active selected template
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0); // 0 to 5 -> Template 1 to 6
  
  // Document Configuration Options (Image 1 fields)
  const [docTitle, setDocTitle] = useState<string>(
    defaultDocType || documentData?.documentType || 'TAX INVOICE'
  );
  const [printType, setPrintType] = useState<'Single' | 'Original & Duplicate (2)' | 'Triplicate (3)' | 'All Bundle'>(
    'Single'
  );
  const [printLanguage, setPrintLanguage] = useState<'English' | 'Arabic' | 'Bilingual'>('English');
  const [printerTarget, setPrinterTarget] = useState<string>('Microsoft Print to PDF');
  const [paperSize, setPaperSize] = useState<'A4' | 'LETTER' | 'LEGAL'>('A4');
  const [printArea, setPrintArea] = useState<'ENTIRE' | 'NO_LETTERHEAD' | 'TABLE_ONLY' | 'NO_SIGNATURES' | 'CUSTOM'>('ENTIRE');
  const [numberOfCopies, setNumberOfCopies] = useState<number>(1);
  const [enableStripeView, setEnableStripeView] = useState<boolean>(false);
  const [watermark, setWatermark] = useState<string>('NONE'); // 'NONE', 'ORIGINAL', 'DUPLICATE', 'SAMPLE', 'CANCELLED', 'CONFIDENTIAL', 'CUSTOM'
  const [customWatermarkText, setCustomWatermarkText] = useState<string>('SAMPLE');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.12);

  // Save As Prompt Modal State
  const [showSaveAsModal, setShowSaveAsModal] = useState<boolean>(false);
  const [saveModalSelectedIndex, setSaveModalSelectedIndex] = useState<number>(1); // 0: Input, 1: Choose Folder, 2: Direct Download, 3: Word, 4: Edit, 5: Cancel
  const saveFileNameInputRef = useRef<HTMLInputElement>(null);
  const [saveAsFileName, setSaveAsFileName] = useState<string>(() => {
    const t = defaultDocType || documentData?.documentType || 'TAX_INVOICE';
    const num = documentData?.invoiceNo || documentData?.docNo || 'MFI';
    return `${t.replace(/\s+/g, '_')}_${num}`;
  });

  // Stored Custom Chosen Folder (File System Access API)
  const [selectedDirHandle, setSelectedDirHandle] = useState<any | null>(() => globalCachedDirHandle);
  const [selectedDirName, setSelectedDirName] = useState<string>(() => {
    if (globalCachedDirName) return globalCachedDirName;
    try {
      return localStorage.getItem('mfi_selected_folder_name') || '';
    } catch {
      return '';
    }
  });
  const [saveSuccessInfo, setSaveSuccessInfo] = useState<{
    path: string;
    fileName: string;
    format: 'pdf' | 'doc';
  } | null>(null);
  const [showZenGuide, setShowZenGuide] = useState<boolean>(false);

  // Keep input focused if index is 0
  useEffect(() => {
    if (showSaveAsModal) {
      if (saveModalSelectedIndex === 0) {
        saveFileNameInputRef.current?.focus();
        saveFileNameInputRef.current?.select();
      } else {
        saveFileNameInputRef.current?.blur();
      }
    }
  }, [showSaveAsModal, saveModalSelectedIndex]);

  // Studio customization drawer/tab state
  const [activeStudioTab, setActiveStudioTab] = useState<'NONE' | 'FIELDS' | 'WATERMARK' | 'HEADER' | 'FONT_COLOR' | 'PRINT_SETTINGS'>('NONE');
  
  // Field toggles (F4: Add/Remove Fields)
  const [showHsCode, setShowHsCode] = useState<boolean>(!!documentData?.showLineHsCode);
  const [showUnitWeight, setShowUnitWeight] = useState<boolean>(false);
  const [showTotalWeight, setShowTotalWeight] = useState<boolean>(true);
  const [showPltNo, setShowPltNo] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showBankDetails, setShowBankDetails] = useState<boolean>(true);
  const [showVatAnalysis, setShowVatAnalysis] = useState<boolean>(false);
  const [showAmountInWords, setShowAmountInWords] = useState<boolean>(true);
  const [showCompanyLogo, setShowCompanyLogo] = useState<boolean>(true);
  const [showIsoBadges, setShowIsoBadges] = useState<boolean>(true);

  // Font & Color Settings (F8)
  const [themeColor, setThemeColor] = useState<string>('#083c54');
  const [fontSizeScale, setFontSizeScale] = useState<string>('100%');

  // Zoom level for Template Studio preview
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);

  const activeCompany = getActiveCompany();
  const currentTemplate = INVOICE_TEMPLATES[selectedTemplateIndex] || INVOICE_TEMPLATES[0];

  // Helper to build PrintOptions object
  const buildCurrentPrintOptions = (): PrintOptions => {
    const watermarkTextToUse = watermark === 'NONE' 
      ? undefined 
      : watermark === 'CUSTOM' 
        ? customWatermarkText 
        : watermark;

    return {
      printArea,
      printPageSize: paperSize,
      printFontSize: fontSizeScale,
      singleCopy: printType === 'Single' && numberOfCopies === 1,
      showHsCodeInPrint: showHsCode,
      showUnitWeightInPrint: showUnitWeight,
      showTotalWeightInPrint: showTotalWeight,
      showPltNoInPrint: showPltNo,
      invoiceFormat: currentTemplate.id,
      enableStripeView,
      watermark: watermarkTextToUse,
      watermarkOpacity,
      themeColor,
      showQrCode,
      showBankDetails,
      showVatTaxAnalysis: showVatAnalysis,
      showAmountInWords,
      numberOfCopies: printType === 'Original & Duplicate (2)' ? 2 : printType === 'Triplicate (3)' ? 3 : numberOfCopies,
      printLanguage
    };
  };

  const [isPrinting, setIsPrinting] = useState(false);
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [hasCustomEdits, setHasCustomEdits] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const editedDocHtmlRef = React.useRef<string | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Live generated HTML for iframe preview in Studio
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    if (!isOpen || !documentData) return;
    try {
      const opts = buildCurrentPrintOptions();
      const html = generateHighFidelityDocHtml(documentData, docTitle, undefined, { ...opts, isPreview: true });
      const editableScript = `
        <style>
          *, *::before, *::after, body, table, th, td, div, span, p, label, b, strong, h1, h2, h3, h4, input, textarea, pre, code {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
          }
          body.live-edit-active [contenteditable="true"]:hover,
          body.live-edit-active td:hover,
          body.live-edit-active th:hover,
          body.live-edit-active p:hover,
          body.live-edit-active span:hover {
            outline: 1.5px dashed rgba(37, 99, 235, 0.45) !important;
            cursor: text !important;
          }
          body.live-edit-active [contenteditable="true"]:focus,
          body.live-edit-active td:focus,
          body.live-edit-active th:focus,
          body.live-edit-active p:focus,
          body.live-edit-active span:focus,
          [contenteditable]:focus {
            outline: 2px solid #2563eb !important;
            background-color: #eff6ff !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2) !important;
          }
        </style>
        <script>
          window.addEventListener('load', function() {
            try {
              document.body.classList.add('live-edit-active');
              document.body.contentEditable = 'true';
              document.designMode = 'on';

              // Notify parent on any edit
              document.body.addEventListener('input', function() {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({
                    type: 'MFI_DOC_EDITED',
                    html: document.documentElement.outerHTML
                  }, '*');
                }
              });

              // Forward keyboard shortcuts to parent
              window.addEventListener('keydown', function(e) {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({
                    type: 'STUDIO_KEY_EVENT',
                    key: e.key,
                    ctrlKey: e.ctrlKey,
                    metaKey: e.metaKey,
                    altKey: e.altKey,
                    shiftKey: e.shiftKey,
                    code: e.code
                  }, '*');
                }
              }, true);
            } catch (_) {}
          });
        </script>
      `;
      const enrichedHtml = html.includes('</head>')
        ? html.replace('</head>', `${editableScript}</head>`)
        : `${editableScript}${html}`;
      setPreviewHtml(enrichedHtml);
    } catch (e) {
      console.error("Error generating live template preview:", e);
    }
  }, [
    documentData,
    docTitle,
    selectedTemplateIndex,
    printType,
    paperSize,
    printArea,
    enableStripeView,
    watermark,
    customWatermarkText,
    watermarkOpacity,
    showHsCode,
    showUnitWeight,
    showTotalWeight,
    showPltNo,
    showQrCode,
    showBankDetails,
    showVatAnalysis,
    showAmountInWords,
    showCompanyLogo,
    showIsoBadges,
    themeColor,
    fontSizeScale,
    printLanguage,
    refreshKey
  ]);

  // Listen for live edit input events from inside the preview iframe
  useEffect(() => {
    const handleFrameMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'MFI_DOC_EDITED' && typeof e.data.html === 'string') {
        editedDocHtmlRef.current = e.data.html;
        setHasCustomEdits(true);
      }
    };
    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, []);

  // Update iframe editability when isEditMode toggles
  useEffect(() => {
    try {
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc && iframeDoc.body) {
        iframeDoc.body.contentEditable = isEditMode ? 'true' : 'false';
        iframeDoc.designMode = isEditMode ? 'on' : 'off';
        if (isEditMode) {
          iframeDoc.body.classList.add('live-edit-active');
        } else {
          iframeDoc.body.classList.remove('live-edit-active');
        }
      }
    } catch (_) {}
  }, [isEditMode]);

  // Reset live edits to original document data
  const handleResetToOriginal = () => {
    editedDocHtmlRef.current = null;
    setHasCustomEdits(false);
    setRefreshKey((k) => k + 1);
  };

  // Helper to extract the most accurate, live-edited document HTML
  const getSanitizedDocHtml = (opts: any): string => {
    let rawHtml = '';
    try {
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc && iframeDoc.body && iframeDoc.body.innerText.trim().length > 20) {
        rawHtml = iframeDoc.documentElement.outerHTML;
      }
    } catch (_) {}

    if (!rawHtml && editedDocHtmlRef.current) {
      rawHtml = editedDocHtmlRef.current;
    }

    if (!rawHtml) {
      rawHtml = generateHighFidelityDocHtml(documentData, docTitle, undefined, opts);
    }

    // Clean up contenteditable attributes and helper classes so output PDF is 100% clean
    return rawHtml
      .replace(/\scontenteditable="true"/gi, '')
      .replace(/\scontenteditable=""/gi, '')
      .replace(/\scontenteditable/gi, '')
      .replace(/class="([^"]*)\blive-edit-active\b([^"]*)"/gi, 'class="$1 $2"')
      .replace(/outline:\s*[^;]+;?/gi, '');
  };

  // 0: I: Preview, 1: P: Print, 2: C: Configure, 3: S: Save PDF
  const [focusedBtnIndex, setFocusedBtnIndex] = useState<number>(0);

  // Reset to CONFIG_DIALOG view with Preview focused whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setActiveView('CONFIG_DIALOG');
      setFocusedBtnIndex(0);
      setShowSaveAsModal(false);
    }
  }, [isOpen]);

  // Execute in-page native print or direct print
  const handleExecutePrint = async () => {
    if (isPrinting || isSavingPdf) return;
    setIsPrinting(true);

    try {
      const opts = buildCurrentPrintOptions();
      if (onApplySettings) {
        onApplySettings(opts);
      }
      const html = getSanitizedDocHtml(opts);
      const title = `${docTitle}_${documentData.invoiceNo || documentData.docNo || 'Document'}`;
      
      // When user explicitly selects 'Save as High-Res PDF' printer option, download PDF directly
      if (printerTarget === 'Save as High-Res PDF') {
        await downloadPdfFromHtml(html, title);
      } else {
        // For 'Microsoft Print to PDF' and any selected printer, open the browser's native print preview dialog
        printHtml(html, title);
      }
      setTimeout(() => {
        setIsPrinting(false);
      }, 1000);
    } catch (err) {
      console.error("Print execution failed:", err);
      setIsPrinting(false);
    }
  };

  // Open Native Directory Picker to choose and store exact folder on PC (e.g. Desktop)
  const handleSelectFolder = async (): Promise<any | null> => {
    if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'desktop',
        });
        if (dirHandle) {
          globalCachedDirHandle = dirHandle;
          globalCachedDirName = dirHandle.name;
          setSelectedDirHandle(dirHandle);
          setSelectedDirName(dirHandle.name);
          try {
            localStorage.setItem('mfi_selected_folder_name', dirHandle.name);
          } catch (_) {}
          setSaveSuccessInfo(null);
          showPrintToast(`Folder selected: ${dirHandle.name}`, true, '📁');
          return dirHandle;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User clicked Cancel on folder dialog - do nothing, NEVER trigger download!
          return null;
        }
        console.warn("showDirectoryPicker failed:", err);
      }
    }
    return null;
  };

  /**
   * Unified Save Document Handler for PDF and Editable Word (.doc)
   * 1. Prompts native OS "Save As" file dialog (window.showSaveFilePicker) asking for the path on PC where to save.
   * 2. Writes directly to the user-chosen location without automatic browser download.
   * 3. Gracefully handles user cancel (AbortError) without triggering fallback download.
   * 4. Only falls back to standard download if user explicitly chose Direct Download or browser lacks File System Access API.
   */
  const handleSaveDocument = async (
    format: 'pdf' | 'doc',
    overrideFileName?: string,
    forceBrowserDownload = false
  ) => {
    if (isPrinting || isSavingPdf) return;

    const baseName = overrideFileName || saveAsFileName || `${docTitle || 'TAX_INVOICE'}_${documentData.invoiceNo || documentData.docNo || 'MFI'}`;
    const cleanName = baseName
      .replace(/[\/\\:*?"<>|]/g, '_')
      .replace(/\.pdf$/i, '')
      .replace(/\.doc$/i, '')
      .trim();
    const extension = format === 'doc' ? '.doc' : '.pdf';
    const suggestedName = `${cleanName}${extension}`;

    // 1. If user explicitly chose Direct Download (Option 2):
    if (forceBrowserDownload) {
      setIsSavingPdf(true);
      try {
        const opts = buildCurrentPrintOptions();
        if (onApplySettings) onApplySettings(opts);
        const html = getSanitizedDocHtml(opts);
        const fileBlob = format === 'doc'
          ? generateWordDocBlob(html, cleanName)
          : await generatePdfBlobFromHtml(html);

        triggerBlobDownload(fileBlob, suggestedName);
        showPrintToast(`Downloaded to Downloads folder: ${suggestedName}`, true, '⬇️');
        setShowSaveAsModal(false);
        onClose();
      } catch (err) {
        console.error("Direct download failed:", err);
      } finally {
        setIsSavingPdf(false);
      }
      return;
    }

    // 2. Option 1: Match Exact Word (.doc) Prompt Behavior
    // Uses binary application/octet-stream to trigger native Windows File Explorer "Save As" location dialog
    setIsSavingPdf(true);
    try {
      const opts = buildCurrentPrintOptions();
      if (onApplySettings) onApplySettings(opts);
      const html = getSanitizedDocHtml(opts);

      if (format === 'doc') {
        const docBlob = generateWordDocBlob(html, cleanName);
        triggerBlobDownload(docBlob, suggestedName);
        showPrintToast(`Asking save location for Word: ${suggestedName}`, true, '📝');
      } else {
        const rawPdfBlob = await generatePdfBlobFromHtml(html);
        // Wrap with application/octet-stream: exactly matching Word export mechanism
        // Prevents browser PDF viewer auto-download and forces native Save As location prompt
        const binaryPdfBlob = new Blob([rawPdfBlob], { type: 'application/octet-stream' });
        triggerBlobDownload(binaryPdfBlob, suggestedName);
        showPrintToast(`Asking save location for PDF: ${suggestedName}`, true, '📄');
      }

      setSaveSuccessInfo({
        path: suggestedName,
        fileName: suggestedName,
        format,
      });

      setShowSaveAsModal(false);
      window.dispatchEvent(new CustomEvent('erp-toast', { 
        detail: `${format === 'doc' ? 'Word' : 'PDF'} save prompt triggered: ${suggestedName}` 
      }));
    } catch (err: any) {
      console.error("Save document failed:", err);
      showPrintToast(`Failed to generate ${format.toUpperCase()}: ${err?.message || 'Unknown error'}`, false);
    } finally {
      setIsSavingPdf(false);
    }
  };

  // Execute "Choose Folder on PC" or Save PDF
  const handleChooseFolderAndSave = async (overrideFileName?: string) => {
    return handleSaveDocument('pdf', overrideFileName);
  };

  // Direct PDF download without directory picker
  const handleDirectDownloadPdf = async (overrideFileName?: string) => {
    return handleSaveDocument('pdf', overrideFileName, true);
  };

  // Default save execution
  const handleExecuteSavePdf = async (overrideFileName?: string) => {
    return handleSaveDocument('pdf', overrideFileName);
  };

  // Export live document as editable Microsoft Word document (.doc)
  const handleExportWordDoc = async (overrideFileName?: string) => {
    return handleSaveDocument('doc', overrideFileName);
  };

  // Keyboard shortcut listener for outer window and iframe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = (e.key || '').toUpperCase();
      const target = e.target as HTMLElement | null;
      const isInputActive = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      // 1. Save As Modal Keyboard Navigation (Up / Down / Enter / Esc)
      if (showSaveAsModal) {
        if (saveSuccessInfo) {
          if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            setSaveSuccessInfo(null);
            setShowSaveAsModal(false);
            onClose();
            return;
          }
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          setSaveModalSelectedIndex((prev) => (prev + 1) % 6);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          setSaveModalSelectedIndex((prev) => (prev - 1 + 6) % 6);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          setShowSaveAsModal(false);
          setSaveSuccessInfo(null);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (saveModalSelectedIndex === 0 || saveModalSelectedIndex === 1) {
            handleSaveDocument('pdf', saveAsFileName);
          } else if (saveModalSelectedIndex === 2) {
            handleSaveDocument('pdf', saveAsFileName, true);
          } else if (saveModalSelectedIndex === 3) {
            handleSaveDocument('doc', saveAsFileName);
          } else if (saveModalSelectedIndex === 4) {
            setShowSaveAsModal(false);
            setActiveView('TEMPLATE_STUDIO');
            setIsEditMode(true);
          } else if (saveModalSelectedIndex === 5) {
            setShowSaveAsModal(false);
          }
          return;
        }
        if (saveModalSelectedIndex !== 0) {
          if (key === '1' || e.key === '1') {
            e.preventDefault();
            e.stopPropagation();
            setSaveModalSelectedIndex(1);
            handleSaveDocument('pdf', saveAsFileName);
            return;
          }
          if (key === '2' || e.key === '2') {
            e.preventDefault();
            e.stopPropagation();
            setSaveModalSelectedIndex(2);
            handleSaveDocument('pdf', saveAsFileName, true);
            return;
          }
          if (key === '3' || e.key === '3' || key === 'W' || e.key === 'w') {
            e.preventDefault();
            e.stopPropagation();
            setSaveModalSelectedIndex(3);
            handleSaveDocument('doc', saveAsFileName);
            return;
          }
          if (key === '4' || e.key === '4' || key === 'E' || e.key === 'e') {
            e.preventDefault();
            e.stopPropagation();
            setSaveModalSelectedIndex(4);
            setShowSaveAsModal(false);
            setActiveView('TEMPLATE_STUDIO');
            setIsEditMode(true);
            return;
          }
        }
        return;
      }

      // 2. Priority global overrides: Ctrl + S (Save PDF) & Ctrl + P (Print Now)
      if (isCtrlOrCmd && (key === 'S' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        setSaveModalSelectedIndex(1);
        setShowSaveAsModal(true);
        return;
      }
      if (isCtrlOrCmd && (key === 'P' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        handleExecutePrint();
        return;
      }

      // 3. Escape closes tabs or dialog
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (activeStudioTab !== 'NONE') {
          setActiveStudioTab('NONE');
          return;
        }
        if (activeView === 'TEMPLATE_STUDIO') {
          setActiveView('CONFIG_DIALOG');
          return;
        }
        onClose();
        return;
      }

      // If typing in an input element outside Save modal, do not trigger single letter shortcuts
      if (isInputActive && !isCtrlOrCmd && e.key !== 'Enter' && e.key !== 'Escape') {
        return;
      }

      // 3. Navigation & Actions when in CONFIG_DIALOG
      if (activeView === 'CONFIG_DIALOG') {
        if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
          e.preventDefault();
          setFocusedBtnIndex((prev) => (prev + 1) % 5);
          return;
        }
        if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
          e.preventDefault();
          setFocusedBtnIndex((prev) => (prev - 1 + 5) % 5);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedBtnIndex === 0) {
            // Preview
            setActiveView('TEMPLATE_STUDIO');
          } else if (focusedBtnIndex === 1) {
            // Print
            handleExecutePrint();
          } else if (focusedBtnIndex === 2) {
            // Configure
            setActiveView('TEMPLATE_STUDIO');
            setActiveStudioTab('PRINT_SETTINGS');
          } else if (focusedBtnIndex === 3) {
            // Save PDF
            setSaveModalSelectedIndex(1);
            setShowSaveAsModal(true);
          } else if (focusedBtnIndex === 4) {
            // Export Word (.doc)
            handleExportWordDoc();
          }
          return;
        }
        if (key === 'I') {
          e.preventDefault();
          setFocusedBtnIndex(0);
          setActiveView('TEMPLATE_STUDIO');
          return;
        }
        if (key === 'P') {
          e.preventDefault();
          setFocusedBtnIndex(1);
          handleExecutePrint();
          return;
        }
        if (key === 'C') {
          e.preventDefault();
          setFocusedBtnIndex(2);
          setActiveView('TEMPLATE_STUDIO');
          setActiveStudioTab('PRINT_SETTINGS');
          return;
        }
        if (key === 'S' || key === 'D') {
          e.preventDefault();
          setFocusedBtnIndex(3);
          setSaveModalSelectedIndex(1);
          setShowSaveAsModal(true);
          return;
        }
        if (key === 'W') {
          e.preventDefault();
          setFocusedBtnIndex(4);
          handleExportWordDoc();
          return;
        }
      }

      // 4. Navigation & Actions when in TEMPLATE_STUDIO
      if (activeView === 'TEMPLATE_STUDIO') {
        if (!isInputActive && key === 'W') {
          e.preventDefault();
          handleExportWordDoc();
          return;
        }
        if (e.key === 'F2') {
          e.preventDefault();
          setActiveStudioTab('NONE');
          setSelectedTemplateIndex((prev) => (prev + 1) % INVOICE_TEMPLATES.length);
          return;
        }
        if (e.key === 'F4') {
          e.preventDefault();
          setActiveStudioTab(prev => prev === 'FIELDS' ? 'NONE' : 'FIELDS');
          return;
        }
        if (e.key === 'F5') {
          e.preventDefault();
          setActiveStudioTab(prev => prev === 'WATERMARK' ? 'NONE' : 'WATERMARK');
          return;
        }
        if (e.key === 'F6') {
          e.preventDefault();
          setActiveStudioTab(prev => prev === 'HEADER' ? 'NONE' : 'HEADER');
          return;
        }
        if (e.key === 'F8') {
          e.preventDefault();
          setActiveStudioTab(prev => prev === 'FONT_COLOR' ? 'NONE' : 'FONT_COLOR');
          return;
        }
        if (e.key === 'F10') {
          e.preventDefault();
          setActiveStudioTab(prev => prev === 'PRINT_SETTINGS' ? 'NONE' : 'PRINT_SETTINGS');
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setSelectedTemplateIndex((prev) => (prev === 0 ? INVOICE_TEMPLATES.length - 1 : prev - 1));
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setSelectedTemplateIndex((prev) => (prev === INVOICE_TEMPLATES.length - 1 ? 0 : prev + 1));
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          handleExecuteSavePdf();
          return;
        }
        if (key === 'P') {
          e.preventDefault();
          handleExecutePrint();
          return;
        }
        if (key === 'S' || key === 'D') {
          e.preventDefault();
          handleExecuteSavePdf();
          return;
        }
        if (key === 'A') {
          e.preventDefault();
          if (onApplySettings) {
            onApplySettings(buildCurrentPrintOptions());
          }
          handleExecutePrint();
          return;
        }
        if (key === 'Q') {
          e.preventDefault();
          setActiveView('CONFIG_DIALOG');
          return;
        }
        if (key === 'T') {
          e.preventDefault();
          setZoomLevel((prev) => (prev === 0.92 ? 1.15 : prev === 1.15 ? 0.75 : 0.92));
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    
    // Attach listener to iframe contentWindow when available
    try {
      const iframeWin = iframeRef.current?.contentWindow;
      if (iframeWin) {
        iframeWin.addEventListener('keydown', handleKeyDown, true);
      }
    } catch (_) {}

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      try {
        const iframeWin = iframeRef.current?.contentWindow;
        if (iframeWin) {
          iframeWin.removeEventListener('keydown', handleKeyDown, true);
        }
      } catch (_) {}
    };
  }, [
    activeView,
    activeStudioTab,
    selectedTemplateIndex,
    docTitle,
    printType,
    paperSize,
    enableStripeView,
    watermark,
    isOpen,
    documentData,
    isPrinting,
    isSavingPdf,
    focusedBtnIndex,
    showSaveAsModal,
    saveModalSelectedIndex,
    saveAsFileName
  ]);

  // Listener for postMessage events sent from inside the preview iframe
  useEffect(() => {
    const handleMessage = (evt: MessageEvent) => {
      if (evt.data && evt.data.type === 'STUDIO_KEY_EVENT') {
        const { key, ctrlKey, metaKey } = evt.data;
        const isCtrlOrCmd = ctrlKey || metaKey;
        const k = (key || '').toUpperCase();
        if (isCtrlOrCmd && (k === 'S' || key === 's')) {
          handleExecuteSavePdf();
        } else if (isCtrlOrCmd && (k === 'P' || key === 'p')) {
          handleExecutePrint();
        } else if (k === 'S' || k === 'D') {
          handleExecuteSavePdf();
        } else if (k === 'P') {
          handleExecutePrint();
        } else if (k === 'A') {
          if (onApplySettings) onApplySettings(buildCurrentPrintOptions());
          handleExecutePrint();
        } else if (k === 'Q' || key === 'Escape') {
          if (activeStudioTab !== 'NONE') setActiveStudioTab('NONE');
          else setActiveView('CONFIG_DIALOG');
        } else if (k === 'F2') {
          setSelectedTemplateIndex((prev) => (prev + 1) % INVOICE_TEMPLATES.length);
        } else if (k === 'F4') {
          setActiveStudioTab(prev => prev === 'FIELDS' ? 'NONE' : 'FIELDS');
        } else if (k === 'F5') {
          setActiveStudioTab(prev => prev === 'WATERMARK' ? 'NONE' : 'WATERMARK');
        } else if (k === 'F6') {
          setActiveStudioTab(prev => prev === 'HEADER' ? 'NONE' : 'HEADER');
        } else if (k === 'F8') {
          setActiveStudioTab(prev => prev === 'FONT_COLOR' ? 'NONE' : 'FONT_COLOR');
        } else if (k === 'F10') {
          setActiveStudioTab(prev => prev === 'PRINT_SETTINGS' ? 'NONE' : 'PRINT_SETTINGS');
        } else if (key === 'ArrowLeft') {
          setSelectedTemplateIndex((prev) => (prev === 0 ? INVOICE_TEMPLATES.length - 1 : prev - 1));
        } else if (key === 'ArrowRight') {
          setSelectedTemplateIndex((prev) => (prev === INVOICE_TEMPLATES.length - 1 ? 0 : prev + 1));
        } else if (key === 'Enter') {
          handleExecuteSavePdf();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeStudioTab, activeView, selectedTemplateIndex, docTitle, documentData, isPrinting, isSavingPdf]);

  if (!isOpen || !documentData) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-[2px] p-2 sm:p-4 select-none animate-in fade-in duration-150">
      
      {/* VIEW 1: AUTHENTIC ERP PRINT SETUP DIALOG (Image 1) */}
      {activeView === 'CONFIG_DIALOG' && (
        <div 
          className="bg-white border-2 border-slate-700 shadow-2xl rounded-none w-full max-w-[620px] overflow-hidden text-slate-900 font-sans"
          style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}
        >
          {/* Header Title Bar */}
          <div className="px-5 py-3 border-b border-slate-300 flex items-center justify-between bg-white">
            <h2 className="text-xl font-bold tracking-tight text-black">Print</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-black p-1 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Properties Grid (Matching Image 1 Structure) */}
          <div className="p-6 space-y-3.5 text-[13.5px] bg-white">
            
            {/* Quick Format Switcher */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Format:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setDocTitle('WORK ORDER')}
                  className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    docTitle === 'WORK ORDER'
                      ? 'bg-[#1e3a8a] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>📋</span> WORK ORDER
                </button>
                <button
                  type="button"
                  onClick={() => setDocTitle('TAX INVOICE')}
                  className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    docTitle === 'TAX INVOICE' || docTitle === 'TAX INVOICE ONLY'
                      ? 'bg-[#1e3a8a] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>🧾</span> TAX INVOICE
                </button>
                <button
                  type="button"
                  onClick={() => setDocTitle('DELIVERY NOTE')}
                  className={`px-3 py-1 text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                    docTitle === 'DELIVERY NOTE'
                      ? 'bg-[#1e3a8a] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <span>🚚</span> DELIVERY NOTE
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Title</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7">
                <select
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 font-bold text-slate-900 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="WORK ORDER">Work Order</option>
                  <option value="TAX INVOICE">Tax Invoice</option>
                  <option value="DELIVERY NOTE">Delivery Note</option>
                  <option value="PROFORMA INVOICE">Proforma Invoice</option>
                  <option value="PACKING LIST">Packing List</option>
                  <option value="QUOTATION">Quotation</option>
                  <option value="PURCHASE ORDER">Purchase Order</option>
                  <option value="GOODS RETURN NOTE">Goods Return Note</option>
                </select>
              </div>
            </div>

            {/* Print Type */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Print Type</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7">
                <select
                  value={printType}
                  onChange={(e) => setPrintType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 font-medium text-slate-900 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="Single">Single</option>
                  <option value="Original & Duplicate (2)">Original & Duplicate (2 Copies)</option>
                  <option value="Triplicate (3)">Triplicate (3 Copies: Buyer, Transporter, Supplier)</option>
                  <option value="All Bundle">All Bundle (WO + Invoice + DN)</option>
                </select>
              </div>
            </div>

            {/* Print Language */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Print Language</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7">
                <select
                  value={printLanguage}
                  onChange={(e) => setPrintLanguage(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 font-medium text-slate-900 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 focus:bg-white cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic (العربية)</option>
                  <option value="Bilingual">Bilingual (English / Arabic)</option>
                </select>
              </div>
            </div>

            {/* Invoice Format */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Invoice Format</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7 flex items-center gap-2">
                <select
                  value={selectedTemplateIndex}
                  onChange={(e) => setSelectedTemplateIndex(Number(e.target.value))}
                  className="w-full bg-blue-50/70 border border-blue-300 font-bold text-blue-950 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 focus:bg-white cursor-pointer"
                >
                  {INVOICE_TEMPLATES.map((tmpl, idx) => (
                    <option key={tmpl.id} value={idx}>
                      Invoice Format {idx + 1} ({tmpl.tag})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setActiveView('TEMPLATE_STUDIO')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 rounded-xs shrink-0 cursor-pointer"
                  title="Open Template Studio"
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200" />

            {/* Printer */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Printer</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7">
                <select
                  value={printerTarget}
                  onChange={(e) => setPrinterTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
                  <option value="System In-Page Printer">System Native In-Page Print</option>
                  <option value="Save as High-Res PDF">Save as High-Res PDF Document</option>
                </select>
              </div>
            </div>

            {/* Paper Size */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Paper Size</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7">
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="A4">A4 (8.27" x 11.69") or (210 mm x 297 mm)</option>
                  <option value="LETTER">Letter (8.50" x 10.98") or (216 mm x 279 mm)</option>
                  <option value="LEGAL">Legal (8.50" x 14.00") or (216 mm x 356 mm)</option>
                </select>
              </div>
            </div>

            {/* Print area */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 pl-4 font-medium text-slate-700">Print area</span>
              <span className="col-span-1 text-center font-bold text-slate-400">:</span>
              <div className="col-span-7">
                <select
                  value={printArea}
                  onChange={(e) => setPrintArea(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="ENTIRE">Entire Document (Standard)</option>
                  <option value="NO_LETTERHEAD">Without Letterhead (Print on Pre-printed paper)</option>
                  <option value="TABLE_ONLY">Table & Items Only</option>
                  <option value="NO_SIGNATURES">Without Signatures</option>
                </select>
              </div>
            </div>

            {/* Number of Copies */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Number of Copies</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7 flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfCopies}
                  onChange={(e) => setNumberOfCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-slate-50 border border-slate-300 font-bold text-slate-900 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-[12px] text-slate-500 font-medium">Page sets per print run</span>
              </div>
            </div>

            {/* Enable Stripe View */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Enable Stripe View</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7 flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="stripeView"
                    checked={enableStripeView === false}
                    onChange={() => setEnableStripeView(false)}
                    className="accent-blue-700"
                  />
                  No
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="stripeView"
                    checked={enableStripeView === true}
                    onChange={() => setEnableStripeView(true)}
                    className="accent-blue-700"
                  />
                  Yes (Zebra rows)
                </label>
              </div>
            </div>

            {/* Watermark */}
            <div className="grid grid-cols-12 items-center gap-2">
              <span className="col-span-4 font-semibold text-slate-900">Watermark</span>
              <span className="col-span-1 text-center font-bold text-slate-500">:</span>
              <div className="col-span-7 flex items-center gap-2">
                <select
                  value={watermark}
                  onChange={(e) => setWatermark(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-2.5 py-1 text-[13px] rounded-xs focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="NONE">None</option>
                  <option value="ORIGINAL">ORIGINAL</option>
                  <option value="DUPLICATE">DUPLICATE</option>
                  <option value="SAMPLE">SAMPLE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="CUSTOM">Custom Text...</option>
                </select>
                {watermark === 'CUSTOM' && (
                  <input
                    type="text"
                    value={customWatermarkText}
                    onChange={(e) => setCustomWatermarkText(e.target.value)}
                    placeholder="e.g. TENDER COPY"
                    className="w-40 bg-slate-50 border border-slate-300 px-2 py-1 text-[12px] font-bold uppercase rounded-xs"
                  />
                )}
              </div>
            </div>

          </div>

          {/* Bottom ERP Action Buttons (PREVIEW, PRINT, CONFIGURE, SAVE PDF) */}
          <div className="p-4 bg-slate-50 border-t border-slate-300 flex flex-wrap items-center justify-center gap-3">
            
            {/* I: Preview (Index 0) */}
            <button
              type="button"
              id="erp-btn-preview"
              onClick={() => {
                setFocusedBtnIndex(0);
                setActiveView('TEMPLATE_STUDIO');
              }}
              onMouseEnter={() => setFocusedBtnIndex(0)}
              className={`px-5 py-2 font-semibold text-[13px] shadow-xs rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                focusedBtnIndex === 0
                  ? 'bg-blue-600 text-white border-2 border-blue-700 ring-2 ring-blue-500/50 scale-[1.03]'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span><span className="font-extrabold underline">I</span>: Preview</span>
            </button>

            {/* P: Print (Index 1) */}
            <button
              type="button"
              id="erp-btn-print"
              onClick={() => {
                setFocusedBtnIndex(1);
                handleExecutePrint();
              }}
              onMouseEnter={() => setFocusedBtnIndex(1)}
              disabled={isSavingPdf || isPrinting}
              className={`px-6 py-2 text-white font-bold text-[13.5px] shadow-xs rounded-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                focusedBtnIndex === 1
                  ? 'bg-blue-950 border-2 border-blue-400 ring-2 ring-blue-500/50 scale-[1.03]'
                  : 'bg-blue-900 hover:bg-blue-950 border border-blue-950'
              }`}
            >
              {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              <span><span className="underline font-black">P</span>: Print</span>
            </button>

            {/* C: Configure (Index 2) */}
            <button
              type="button"
              id="erp-btn-configure"
              onClick={() => {
                setFocusedBtnIndex(2);
                setActiveView('TEMPLATE_STUDIO');
                setActiveStudioTab('PRINT_SETTINGS');
              }}
              onMouseEnter={() => setFocusedBtnIndex(2)}
              className={`px-5 py-2 font-semibold text-[13px] shadow-xs rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                focusedBtnIndex === 2
                  ? 'bg-slate-800 text-white border-2 border-slate-900 ring-2 ring-slate-500/50 scale-[1.03]'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span><span className="font-extrabold underline">C</span>: Configure</span>
            </button>

            {/* S: Save PDF (Index 3) */}
            <button
              type="button"
              id="erp-btn-save-pdf"
              onClick={() => {
                setFocusedBtnIndex(3);
                setSaveModalSelectedIndex(1);
                setShowSaveAsModal(true);
              }}
              onMouseEnter={() => setFocusedBtnIndex(3)}
              disabled={isSavingPdf || isPrinting}
              className={`px-5 py-2 text-white font-bold text-[13px] shadow-xs rounded-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                focusedBtnIndex === 3
                  ? 'bg-emerald-800 border-2 border-emerald-400 ring-2 ring-emerald-500/50 scale-[1.03]'
                  : 'bg-emerald-700 hover:bg-emerald-800 border border-emerald-800'
              }`}
            >
              {isSavingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span><span className="underline font-black">S</span>: Save PDF</span>
            </button>

            {/* W: Export Word (.doc) (Index 4) */}
            <button
              type="button"
              id="erp-btn-export-word"
              onClick={() => {
                setFocusedBtnIndex(4);
                handleExportWordDoc();
              }}
              onMouseEnter={() => setFocusedBtnIndex(4)}
              disabled={isSavingPdf || isPrinting}
              className={`px-5 py-2 text-white font-bold text-[13px] shadow-xs rounded-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                focusedBtnIndex === 4
                  ? 'bg-blue-800 border-2 border-blue-400 ring-2 ring-blue-500/50 scale-[1.03]'
                  : 'bg-blue-700 hover:bg-blue-800 border border-blue-800'
              }`}
              title="Export as Editable Microsoft Word (.doc) File (W)"
            >
              <FileText className="w-4 h-4" />
              <span><span className="underline font-black">W</span>: Export Word</span>
            </button>

          </div>
        </div>
      )}

      {/* VIEW 2: FULL INVOICE TEMPLATES & VISUAL CUSTOMIZATION STUDIO (Image 2) */}
      {activeView === 'TEMPLATE_STUDIO' && (
        <div className="bg-[#b0cdd9] border-2 border-slate-800 shadow-2xl rounded-none w-full max-w-[98vw] h-[95vh] flex flex-col overflow-hidden text-slate-900 font-sans">
          
          {/* Top Title Bar (Image 2 Header) */}
          <div className="bg-[#8ec2d8] border-b border-slate-600 px-4 py-2 flex items-center justify-between select-none">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xs text-slate-900 tracking-tight uppercase">Invoice Templates</span>
              <button
                type="button"
                onClick={() => setActiveView('CONFIG_DIALOG')}
                className="text-slate-800 hover:text-black font-bold text-xs px-2.5 py-1 border border-slate-400 bg-white hover:bg-slate-50 rounded-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                title="Print Settings (C)"
              >
                <Settings className="w-3 h-3 text-slate-600" />
                <span><span className="underline">C</span>: Settings</span>
              </button>
            </div>

            <div className="text-center">
              <div className="font-bold text-sm text-slate-950 uppercase">{activeCompany.name}</div>
              <div className="text-xs font-semibold text-slate-800">
                {currentTemplate.name}
              </div>
              <div className="text-[10px] text-slate-600 italic">
                {currentTemplate.subtitle}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportWordDoc()}
                disabled={isSavingPdf || isPrinting}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold rounded-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-xs disabled:opacity-50"
                title="Export as Editable Microsoft Word (.doc) File (W)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span><span className="underline">W</span>: Export Word</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSaveAsModal(true)}
                disabled={isSavingPdf || isPrinting}
                className="px-3.5 py-1 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-xs disabled:opacity-50"
                title="Save as PDF (Ctrl + S)"
              >
                {isSavingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span><span className="underline">S</span>: Save as PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExecutePrint}
                disabled={isSavingPdf || isPrinting}
                className="px-4 py-1 bg-blue-900 hover:bg-blue-950 active:bg-slate-900 text-white font-bold rounded-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-xs disabled:opacity-50"
                title="Print (Ctrl + P)"
              >
                {isPrinting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                <span><span className="underline">P</span>: Print</span>
              </button>

              <button 
                onClick={onClose}
                className="text-slate-800 hover:text-black p-1 hover:bg-white/50 rounded transition-colors cursor-pointer font-bold ml-2"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Layout Area: Center Canvas + Right Sidebar Action Panel */}
          <div className="flex-1 flex overflow-hidden bg-[#c7dce6] relative">
            
            {/* Center Visual Document Preview Sheet */}
            <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-auto">
              
              {/* Template Navigator Arrows */}
              <div className="absolute top-1/2 left-3 -translate-y-1/2 z-10">
                <button
                  onClick={() => setSelectedTemplateIndex((prev) => (prev === 0 ? INVOICE_TEMPLATES.length - 1 : prev - 1))}
                  className="p-2 bg-slate-900/40 hover:bg-slate-900/80 text-white rounded-full transition-all cursor-pointer shadow-lg hover:scale-110"
                  title="Previous Template (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
                <button
                  onClick={() => setSelectedTemplateIndex((prev) => (prev === INVOICE_TEMPLATES.length - 1 ? 0 : prev + 1))}
                  className="p-2 bg-slate-900/40 hover:bg-slate-900/80 text-white rounded-full transition-all cursor-pointer shadow-lg hover:scale-110"
                  title="Next Template (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Live Edit Action Ribbon */}
              <div className="w-full max-w-[210mm] mb-2 flex items-center justify-between gap-2 z-10 select-none bg-white/95 border border-slate-400 px-3 py-1.5 shadow-sm rounded-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMode((prev) => !prev)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                      isEditMode
                        ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-500'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Live Edit: {isEditMode ? 'ON' : 'OFF'}</span>
                  </button>

                  {isEditMode && (
                    <div className="flex items-center gap-1 border-l border-slate-300 pl-2">
                      <button
                        type="button"
                        onClick={() => iframeRef.current?.contentDocument?.execCommand('bold')}
                        className="w-6 h-6 flex items-center justify-center font-bold text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs cursor-pointer"
                        title="Bold (Ctrl + B)"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => iframeRef.current?.contentDocument?.execCommand('italic')}
                        className="w-6 h-6 flex items-center justify-center italic font-serif text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs cursor-pointer"
                        title="Italic (Ctrl + I)"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => iframeRef.current?.contentDocument?.execCommand('underline')}
                        className="w-6 h-6 flex items-center justify-center underline text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xs cursor-pointer"
                        title="Underline (Ctrl + U)"
                      >
                        U
                      </button>
                    </div>
                  )}

                  <span className="text-[11px] text-slate-500 italic hidden md:inline">
                    {isEditMode
                      ? 'Click directly on any text or table cell below to edit before saving'
                      : 'Preview locked (toggle Live Edit to modify text)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportWordDoc()}
                    className="px-2.5 py-1 bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 rounded-xs transition-colors cursor-pointer shadow-2xs"
                    title="Export document with live edits as an editable Microsoft Word (.doc) file"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                    <span>Export Word (.doc)</span>
                  </button>

                  {hasCustomEdits && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-xs flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Edits Active
                      </span>
                      <button
                        type="button"
                        onClick={handleResetToOriginal}
                        className="text-[11px] text-red-600 hover:text-red-800 font-bold underline cursor-pointer"
                        title="Discard changes and restore original data"
                      >
                        Reset
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 border-l border-slate-300 pl-2">
                    <span className="text-blue-900 font-bold">{selectedTemplateIndex + 1}</span>
                    <span className="text-slate-400">/</span>
                    <span>{INVOICE_TEMPLATES.length}</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-slate-100 font-sans font-semibold rounded text-[10px]">
                      {currentTemplate.tag}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document A4 Virtual Container */}
              <div 
                className="bg-white border-2 border-black shadow-2xl transition-transform duration-100 origin-top overflow-hidden"
                style={{
                  width: '210mm',
                  height: '297mm',
                  transform: `scale(${zoomLevel})`,
                  maxWidth: '100%'
                }}
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  title="Template Live Preview"
                  className="w-full h-full border-none pointer-events-auto"
                />
              </div>

            </div>

            {/* Right Action / Shortcut Panel (Exact Match to Image 2 Structure) */}
            <div className="w-64 bg-[#dbeef8] border-l-2 border-slate-500 flex flex-col p-2 space-y-1 text-xs select-none overflow-y-auto shrink-0 font-sans shadow-inner">
              
              {/* F2: Template List */}
              <button
                type="button"
                onClick={() => setSelectedTemplateIndex((prev) => (prev + 1) % INVOICE_TEMPLATES.length)}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-400 font-bold text-blue-900 rounded-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>F2: Template List</span>
                <span className="text-[10px] text-slate-500 font-mono">({selectedTemplateIndex + 1}/6)</span>
              </button>

              <div className="h-1" />

              {/* F4: Add/Remove Fields */}
              <button
                type="button"
                onClick={() => setActiveStudioTab(prev => prev === 'FIELDS' ? 'NONE' : 'FIELDS')}
                className={`w-full text-left px-2.5 py-1.5 border border-slate-400 font-bold rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeStudioTab === 'FIELDS' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50 text-blue-900'
                }`}
              >
                <span>F4: Add/Remove Fields</span>
                <span>{activeStudioTab === 'FIELDS' ? '▼' : '▶'}</span>
              </button>

              {/* F4 Sub-panel Drawer */}
              {activeStudioTab === 'FIELDS' && (
                <div className="p-2 bg-white/95 border border-blue-300 rounded-xs space-y-1.5 text-[11px] shadow-sm animate-in slide-in-from-top-2 duration-100">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showHsCode}
                      onChange={(e) => setShowHsCode(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show HS / HSN Code</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showUnitWeight}
                      onChange={(e) => setShowUnitWeight(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show Unit Weight (Kg)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showTotalWeight}
                      onChange={(e) => setShowTotalWeight(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show Total Weight</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showPltNo}
                      onChange={(e) => setShowPltNo(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show Pallet / Box No</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showQrCode}
                      onChange={(e) => setShowQrCode(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show QR Code & e-Invoice</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showVatAnalysis}
                      onChange={(e) => setShowVatAnalysis(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show Tax Analysis Table</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showBankDetails}
                      onChange={(e) => setShowBankDetails(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show Bank Account Info</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showAmountInWords}
                      onChange={(e) => setShowAmountInWords(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Show Amount in Words</span>
                  </label>
                </div>
              )}

              {/* F5: Watermark */}
              <button
                type="button"
                onClick={() => setActiveStudioTab(prev => prev === 'WATERMARK' ? 'NONE' : 'WATERMARK')}
                className={`w-full text-left px-2.5 py-1.5 border border-slate-400 font-bold rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeStudioTab === 'WATERMARK' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50 text-blue-900'
                }`}
              >
                <span>F5: Watermark</span>
                <span>{activeStudioTab === 'WATERMARK' ? '▼' : '▶'}</span>
              </button>

              {activeStudioTab === 'WATERMARK' && (
                <div className="p-2 bg-white/95 border border-blue-300 rounded-xs space-y-2 text-[11px] shadow-sm">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Watermark Mode:</label>
                    <select
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 px-2 py-1 font-bold text-slate-900 rounded-xs"
                    >
                      <option value="NONE">None</option>
                      <option value="ORIGINAL">ORIGINAL</option>
                      <option value="DUPLICATE">DUPLICATE</option>
                      <option value="SAMPLE">SAMPLE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="CUSTOM">Custom Text...</option>
                    </select>
                  </div>
                  {watermark === 'CUSTOM' && (
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Custom Text:</label>
                      <input
                        type="text"
                        value={customWatermarkText}
                        onChange={(e) => setCustomWatermarkText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 px-2 py-1 font-bold uppercase"
                      />
                    </div>
                  )}
                  {watermark !== 'NONE' && (
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                        <span>Opacity</span>
                        <span>{Math.round(watermarkOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.4"
                        step="0.01"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* F6: Header Image */}
              <button
                type="button"
                onClick={() => setActiveStudioTab(prev => prev === 'HEADER' ? 'NONE' : 'HEADER')}
                className={`w-full text-left px-2.5 py-1.5 border border-slate-400 font-bold rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeStudioTab === 'HEADER' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50 text-blue-900'
                }`}
              >
                <span>F6: Header Image</span>
                <span>{activeStudioTab === 'HEADER' ? '▼' : '▶'}</span>
              </button>

              {activeStudioTab === 'HEADER' && (
                <div className="p-2 bg-white/95 border border-blue-300 rounded-xs space-y-1.5 text-[11px] shadow-sm">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showCompanyLogo}
                      onChange={(e) => setShowCompanyLogo(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Company Logo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={showIsoBadges}
                      onChange={(e) => setShowIsoBadges(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>ISO Certification Banner</span>
                  </label>
                </div>
              )}

              {/* F7: Custom Field */}
              <button
                type="button"
                onClick={() => setActiveStudioTab(prev => prev === 'FIELDS' ? 'NONE' : 'FIELDS')}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-400 font-bold text-blue-900 rounded-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>F7: Custom Field</span>
              </button>

              {/* F8: Font & Colour */}
              <button
                type="button"
                onClick={() => setActiveStudioTab(prev => prev === 'FONT_COLOR' ? 'NONE' : 'FONT_COLOR')}
                className={`w-full text-left px-2.5 py-1.5 border border-slate-400 font-bold rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeStudioTab === 'FONT_COLOR' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50 text-blue-900'
                }`}
              >
                <span>F8: Font & Colour</span>
                <span>{activeStudioTab === 'FONT_COLOR' ? '▼' : '▶'}</span>
              </button>

              {activeStudioTab === 'FONT_COLOR' && (
                <div className="p-2 bg-white/95 border border-blue-300 rounded-xs space-y-2 text-[11px] shadow-sm">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Theme Accent:</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { color: '#083c54', name: 'Executive Navy' },
                        { color: '#1e293b', name: 'Charcoal' },
                        { color: '#047857', name: 'Emerald' },
                        { color: '#881337', name: 'Burgundy' },
                        { color: '#000000', name: 'Monochrome' },
                      ].map((th) => (
                        <button
                          key={th.color}
                          type="button"
                          onClick={() => setThemeColor(th.color)}
                          style={{ backgroundColor: th.color }}
                          className={`h-6 rounded-xs border-2 transition-transform ${
                            themeColor === th.color ? 'border-amber-400 scale-110 shadow-sm' : 'border-slate-300'
                          }`}
                          title={th.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Font Scaling:</label>
                    <select
                      value={fontSizeScale}
                      onChange={(e) => setFontSizeScale(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 px-2 py-1 font-bold text-slate-900 rounded-xs"
                    >
                      <option value="85%">85% (Compact / Dense)</option>
                      <option value="100%">100% (Standard Normal)</option>
                      <option value="115%">115% (Large Readable)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* F9: Edit Field Properties */}
              <button
                type="button"
                onClick={() => setActiveStudioTab(prev => prev === 'PRINT_SETTINGS' ? 'NONE' : 'PRINT_SETTINGS')}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-400 font-bold text-blue-900 rounded-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>F9: Edit Field Properties</span>
              </button>

              {/* F10: Print Settings */}
              <button
                type="button"
                onClick={() => setActiveStudioTab(prev => prev === 'PRINT_SETTINGS' ? 'NONE' : 'PRINT_SETTINGS')}
                className={`w-full text-left px-2.5 py-1.5 border border-slate-400 font-bold rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeStudioTab === 'PRINT_SETTINGS' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50 text-blue-900'
                }`}
              >
                <span>F10: Print Settings</span>
                <span>{activeStudioTab === 'PRINT_SETTINGS' ? '▼' : '▶'}</span>
              </button>

              {activeStudioTab === 'PRINT_SETTINGS' && (
                <div className="p-2 bg-white/95 border border-blue-300 rounded-xs space-y-1.5 text-[11px] shadow-sm">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Paper Size:</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 px-2 py-1 font-medium rounded-xs"
                    >
                      <option value="A4">A4</option>
                      <option value="LETTER">Letter</option>
                      <option value="LEGAL">Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Print Area:</label>
                    <select
                      value={printArea}
                      onChange={(e) => setPrintArea(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 px-2 py-1 font-medium rounded-xs"
                    >
                      <option value="ENTIRE">Entire Document</option>
                      <option value="NO_LETTERHEAD">No Letterhead</option>
                      <option value="TABLE_ONLY">Table Only</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={enableStripeView}
                      onChange={(e) => setEnableStripeView(e.target.checked)}
                      className="accent-blue-700"
                    />
                    <span>Zebra Stripe Rows</span>
                  </label>
                </div>
              )}

              <div className="flex-1" />

              {/* Bottom Quick Commands */}
              <button
                type="button"
                onClick={() => {
                  if (onApplySettings) {
                    onApplySettings(buildCurrentPrintOptions());
                  }
                  alert(`Template ${selectedTemplateIndex + 1} saved as active layout configuration.`);
                }}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-emerald-50 border border-slate-400 font-bold text-emerald-900 rounded-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>L: Save Template</span>
                <Save className="w-3.5 h-3.5 text-emerald-700" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onApplySettings) {
                    onApplySettings(buildCurrentPrintOptions());
                  }
                  alert(`Template ${selectedTemplateIndex + 1} set as system default for ${docTitle}.`);
                }}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-400 font-bold text-blue-900 rounded-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>L: Set as Default</span>
                <Check className="w-3.5 h-3.5 text-blue-700" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(buildCurrentPrintOptions(), null, 2));
                  alert('Template configuration copied to clipboard.');
                }}
                className="w-full text-left px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-400 font-semibold text-slate-800 rounded-xs transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>S: Copy Configurations</span>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
              </button>

            </div>

          </div>

          {/* Bottom ERP Footer Bar (Image 2 Bottom Row) */}
          <div className="bg-[#8ec2d8] border-t border-slate-600 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-900 select-none">
            <div className="flex items-center gap-6">
              
              {/* Q: Quit */}
              <button
                type="button"
                onClick={() => setActiveView('CONFIG_DIALOG')}
                className="hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <span className="font-extrabold text-blue-900 underline">Q</span>: Quit
              </button>

              {/* A: Use Template */}
              <button
                type="button"
                onClick={() => {
                  if (onApplySettings) {
                    onApplySettings(buildCurrentPrintOptions());
                  }
                  handleExecutePrint();
                }}
                className="hover:text-black flex items-center gap-1 cursor-pointer font-bold text-blue-950"
              >
                <span className="font-extrabold text-blue-900 underline">A</span>: Use Template
              </button>

              {/* T: Zoom */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.1))}
                  className="p-1 hover:bg-white/50 rounded cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px]">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(1.4, prev + 0.1))}
                  className="p-1 hover:bg-white/50 rounded cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(0.92)}
                  className="text-[10px] underline ml-1 hover:text-black cursor-pointer"
                >
                  Fit
                </button>
              </div>

            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSaveAsModal(true)}
                disabled={isSavingPdf || isPrinting}
                className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-[12px] disabled:opacity-50"
                title="Save as PDF (Ctrl + S) - Prompts Destination Folder"
              >
                {isSavingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span><span className="underline">S</span>: Save PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExecutePrint}
                disabled={isSavingPdf || isPrinting}
                className="px-5 py-1 bg-blue-900 hover:bg-blue-950 active:bg-slate-900 text-white font-bold rounded-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer text-[12px] disabled:opacity-50"
                title="Print document directly with Arial font (Ctrl + P)"
              >
                {isPrinting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                <span><span className="underline">P</span>: Print Now</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* SAVE AS PDF - SIMPLIFIED KEYBOARD-NAVIGABLE MODAL */}
      {showSaveAsModal && (
        <div 
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 backdrop-blur-[2px] p-4 animate-in fade-in duration-100"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSaveSuccessInfo(null);
              setShowSaveAsModal(false);
            }
          }}
        >
          <div className="bg-white border-2 border-slate-800 shadow-2xl rounded-none w-full max-w-[390px] overflow-hidden text-slate-900 font-sans">
            
            {/* Modal Header */}
            <div className="px-3 py-2 bg-slate-900 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-xs tracking-wider uppercase">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {saveSuccessInfo
                    ? 'Export Completed'
                    : saveModalSelectedIndex === 3
                    ? 'Export Editable Word Document'
                    : 'Save Document as PDF'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSaveSuccessInfo(null);
                  setShowSaveAsModal(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {saveSuccessInfo ? (
              /* Success Message Panel with Full Saved File Path */
              <div className="p-4 space-y-3 bg-emerald-50/90 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      {saveSuccessInfo.format === 'doc' ? 'Word Document' : 'PDF Document'} Saved Successfully!
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      File was saved directly to your chosen PC folder. No copy was downloaded to Downloads.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-emerald-400 p-2.5 rounded-none shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center justify-between">
                    <span>Full Saved File Location:</span>
                    <span className="text-emerald-700 font-mono font-semibold">Local Storage</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 break-all select-all flex items-center gap-2 bg-slate-50 p-1.5 border border-slate-200">
                    <FolderOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{saveSuccessInfo.path}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-emerald-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSaveSuccessInfo(null);
                      setShowSaveAsModal(false);
                      onClose();
                    }}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done [Enter / Esc]</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-2 bg-white text-xs">

                {/* Status of custom edits if any */}
                {hasCustomEdits && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-none text-[11px] text-emerald-900 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Live edits included in document</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetToOriginal}
                      className="text-[10px] font-bold text-red-700 hover:text-red-950 underline cursor-pointer ml-2"
                    >
                      Reset
                    </button>
                  </div>
                )}
                
                {/* File Name Field (Item 0) */}
                <div 
                  onClick={() => setSaveModalSelectedIndex(0)}
                  className={`p-2 rounded-none transition-all cursor-pointer ${saveModalSelectedIndex === 0 ? 'bg-amber-50/80 border-2 border-amber-600' : 'bg-slate-50 border border-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-900 text-[11.5px] flex items-center gap-1 cursor-pointer">
                      {saveModalSelectedIndex === 0 && <span className="text-amber-600 font-bold">►</span>}
                      <span>File Name:</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">[0] Name</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      ref={saveFileNameInputRef}
                      type="text"
                      value={saveAsFileName}
                      onChange={(e) => setSaveAsFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          e.stopPropagation();
                          setSaveModalSelectedIndex(1);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          e.stopPropagation();
                          setSaveModalSelectedIndex(5);
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          const format = saveModalSelectedIndex === 3 ? 'doc' : 'pdf';
                          handleSaveDocument(format, saveAsFileName);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowSaveAsModal(false);
                        }
                      }}
                      placeholder="Enter file name..."
                      className="flex-1 bg-white border border-slate-400 font-mono font-bold text-slate-950 px-2 py-1 text-xs rounded-none focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                    <span className="bg-slate-200 border border-l-0 border-slate-400 text-slate-800 px-2 py-1 font-mono font-bold text-xs select-none">
                      {saveModalSelectedIndex === 3 ? '.doc' : '.pdf'}
                    </span>
                  </div>
                </div>

                {/* Action Options */}
                <div className="space-y-1.5">
                  
                  {/* Option 1: Choose Folder on PC (Item 1) */}
                  <div
                    role="button"
                    tabIndex={0}
                    id="erp-save-option-choose-folder"
                    onClick={() => {
                      setSaveModalSelectedIndex(1);
                      handleSaveDocument('pdf', saveAsFileName);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        setSaveModalSelectedIndex(1);
                        handleSaveDocument('pdf', saveAsFileName);
                      }
                    }}
                    className={`px-2.5 py-2 border transition-all cursor-pointer flex items-center justify-between outline-none ${
                      saveModalSelectedIndex === 1
                        ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 w-6">
                          {saveModalSelectedIndex === 1 ? '► [1]' : '  [1]'}
                        </span>
                        <FolderOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-[12px] font-semibold">Choose Folder on PC (Save PDF)</span>
                      </div>
                      <div className="ml-8 text-[10.5px] text-slate-500 font-normal">
                        Asks path where you want to save the PDF file on your PC (same as Word export)
                      </div>
                    </div>
                    <FolderOpen className={`w-3.5 h-3.5 shrink-0 ml-2 ${saveModalSelectedIndex === 1 ? 'text-emerald-700' : 'text-slate-400'}`} />
                  </div>

                  {/* Option 2: Direct PDF Download (Item 2) */}
                  <div
                    role="button"
                    tabIndex={0}
                    id="erp-save-option-direct-download"
                    onClick={() => {
                      setSaveModalSelectedIndex(2);
                      handleSaveDocument('pdf', saveAsFileName, true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        setSaveModalSelectedIndex(2);
                        handleSaveDocument('pdf', saveAsFileName, true);
                      }
                    }}
                    className={`px-2.5 py-2 border transition-all cursor-pointer flex items-center justify-between outline-none ${
                      saveModalSelectedIndex === 2
                        ? 'border-blue-600 bg-blue-50 font-bold text-blue-950 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 w-6">
                          {saveModalSelectedIndex === 2 ? '► [2]' : '  [2]'}
                        </span>
                        <Download className="w-4 h-4 text-blue-700 shrink-0" />
                        <span className="text-[12px] font-semibold">Direct Download (PDF)</span>
                      </div>
                      <div className="ml-8 text-[10.5px] text-slate-500 font-normal">
                        Downloads directly to browser default Downloads folder
                      </div>
                    </div>
                    <Download className={`w-3.5 h-3.5 shrink-0 ml-2 ${saveModalSelectedIndex === 2 ? 'text-blue-700' : 'text-slate-400'}`} />
                  </div>

                  {/* Option 3: Export as Editable Word (.doc) (Item 3) */}
                  <div
                    role="button"
                    tabIndex={0}
                    id="erp-save-option-export-word"
                    onClick={() => {
                      setSaveModalSelectedIndex(3);
                      handleSaveDocument('doc', saveAsFileName);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        setSaveModalSelectedIndex(3);
                        handleSaveDocument('doc', saveAsFileName);
                      }
                    }}
                    className={`px-2.5 py-2 border transition-all cursor-pointer flex items-center justify-between outline-none ${
                      saveModalSelectedIndex === 3
                        ? 'border-blue-700 bg-blue-50 font-bold text-blue-950 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-900 w-6">
                          {saveModalSelectedIndex === 3 ? '► [3]' : '  [3]'}
                        </span>
                        <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                        <span className="text-[12px] font-semibold">Export as Editable Word (.doc)</span>
                      </div>
                      <div className="ml-8 text-[10.5px] text-slate-500 font-normal">
                        Asks path where you want to save the editable Word file on your PC
                      </div>
                    </div>
                    <Download className={`w-3.5 h-3.5 shrink-0 ml-2 ${saveModalSelectedIndex === 3 ? 'text-blue-700' : 'text-slate-400'}`} />
                  </div>

                  {/* Option 4: Edit Document Content Before Saving (Item 4) */}
                  <div
                    role="button"
                    tabIndex={0}
                    id="erp-save-option-edit-first"
                    onClick={() => {
                      setSaveModalSelectedIndex(4);
                      setShowSaveAsModal(false);
                      setActiveView('TEMPLATE_STUDIO');
                      setIsEditMode(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        setSaveModalSelectedIndex(4);
                        setShowSaveAsModal(false);
                        setActiveView('TEMPLATE_STUDIO');
                        setIsEditMode(true);
                      }
                    }}
                    className={`px-2.5 py-2 border transition-all cursor-pointer flex items-center justify-between outline-none ${
                      saveModalSelectedIndex === 4
                        ? 'border-amber-600 bg-amber-50 font-bold text-amber-950 ring-1 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-800 w-6">
                        {saveModalSelectedIndex === 4 ? '► [4]' : '  [4]'}
                      </span>
                      <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="text-[12px] font-semibold">Edit Content Before Saving</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ml-2 ${saveModalSelectedIndex === 4 ? 'text-amber-700' : 'text-slate-400'}`} />
                  </div>

                  {/* Zen Browser & Firefox Save Location Tip */}
                  <div className="mt-2 p-2 bg-amber-50/70 border border-amber-200 text-slate-700 text-[11px] rounded-none space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                        <span className="text-xs">💡</span>
                        <span>Zen Browser / Firefox: Why didn't PDF ask for folder?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowZenGuide(!showZenGuide)}
                        className="text-amber-800 hover:text-amber-950 underline font-medium cursor-pointer text-[10px]"
                      >
                        {showZenGuide ? 'Hide details' : 'How to enable prompt in Zen (5 sec)'}
                      </button>
                    </div>

                    {showZenGuide && (
                      <div className="mt-1 pt-1.5 border-t border-amber-200/80 text-[10.5px] text-slate-700 space-y-1.5 leading-relaxed bg-white/80 p-2">
                        <p>
                          <strong>Why Word asks:</strong> Zen Browser has no internal Word viewer, so it displays the <em>"What should Zen do with this file?"</em> dialog.
                        </p>
                        <p>
                          <strong>Why PDF auto-saves:</strong> Zen has an internal PDF viewer and defaults PDF downloads to silent auto-save.
                        </p>
                        <div className="p-1.5 bg-amber-100/60 border border-amber-300 font-mono text-[10px] text-amber-950 space-y-0.5">
                          <div><strong>Step 1:</strong> Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-bold">Ctrl + ,</kbd> to open Zen Settings.</div>
                          <div><strong>Step 2:</strong> Under <strong>General ➔ Downloads</strong>, select <strong>"Always ask you where to save files"</strong>.</div>
                          <div><em>(Or under Applications, set <strong>Portable Document Format (PDF)</strong> to <strong>"Always ask"</strong>)</em>.</div>
                        </div>
                        <p className="text-[10px] text-slate-600">
                          Once set, every PDF download in Zen will prompt with Windows File Explorer to choose your folder, exactly like Word!
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Modal Footer with Keyboard Help */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <span className="bg-slate-100 border border-slate-300 px-1 py-0.5 font-mono text-[9px] font-bold">↑/↓</span>
                    <span>Select</span>
                    <span className="bg-slate-100 border border-slate-300 px-1 py-0.5 font-mono text-[9px] font-bold ml-0.5">Enter</span>
                    <span>Run</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowSaveAsModal(false)}
                      className={`px-2.5 py-1 font-semibold text-xs border cursor-pointer ${
                        saveModalSelectedIndex === 5
                          ? 'border-slate-900 bg-slate-800 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Cancel [Esc]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (saveModalSelectedIndex === 2) {
                          handleSaveDocument('pdf', saveAsFileName, true);
                        } else if (saveModalSelectedIndex === 3) {
                          handleSaveDocument('doc', saveAsFileName);
                        } else if (saveModalSelectedIndex === 4) {
                          setShowSaveAsModal(false);
                          setActiveView('TEMPLATE_STUDIO');
                          setIsEditMode(true);
                        } else {
                          handleSaveDocument('pdf', saveAsFileName);
                        }
                      }}
                      disabled={isSavingPdf}
                      className={`px-3 py-1 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50 ${
                        saveModalSelectedIndex === 3
                          ? 'bg-blue-700 hover:bg-blue-800'
                          : 'bg-emerald-700 hover:bg-emerald-800'
                      }`}
                    >
                      {isSavingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : saveModalSelectedIndex === 3 ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {saveModalSelectedIndex === 3
                          ? 'Export Word'
                          : saveModalSelectedIndex === 4
                          ? 'Edit'
                          : saveModalSelectedIndex === 2
                          ? 'Download PDF'
                          : 'Save PDF'}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
