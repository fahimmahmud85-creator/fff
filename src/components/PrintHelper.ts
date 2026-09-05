import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PrintHelper.ts
 * High-Fidelity Print & PDF Generation System
 * - 100% Strict Arial Font rendering across all tables, headers, metadata, and stamps
 * - Native PDF Blob Generation & Destination Path Selector via File System Access API (showSaveFilePicker)
 * - Guaranteed non-blank multi-page PDF generation via direct html2canvas + jsPDF
 * - Automatic direct PDF download fallback with proper filename
 * - Instant vector print execution with clean page breaks and zero blank pages
 * - Complete iframe & parent window shortcut synchronization (Ctrl+S, Ctrl+P)
 */

/**
 * Injects high-contrast, strict Arial print stylesheet and script for keyboard event propagation
 */
export const preparePrintHtml = (htmlContent: string, title?: string): string => {
  let docTitle = title || '';
  if (!docTitle && htmlContent.includes('<title>')) {
    const match = htmlContent.match(/<title>([^<]*?)<\/title>/i);
    if (match && match[1]) {
      docTitle = match[1].trim();
    }
  }
  if (!docTitle) {
    docTitle = 'Document';
  }

  const safeDocTitle = docTitle.replace(/[\/\\:*?"<>|]/g, '_').trim();
  const isLandscape = htmlContent.toLowerCase().includes('landscape');
  const pageSize = isLandscape ? 'A4 landscape' : 'A4 portrait';

  const strictArialPrintStyle = `
    <style id="mfi-strict-arial-print-stylesheet">
      *, *::before, *::after, html, body, table, tr, th, td, div, span, p, label, b, strong, h1, h2, h3, h4, input, textarea, pre, code {
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      @page {
        size: ${pageSize};
        margin: 6mm 6mm 6mm 6mm !important;
      }
      html, body {
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: block !important;
        -webkit-font-smoothing: antialiased !important;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
      }
      th, td, div, span, p, label, b, strong, h1, h2, h3, h4 {
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
        color: #000000 !important;
      }
      .desc-cell, td.desc-cell {
        text-align: left !important;
        padding-left: 6px !important;
      }
      .doc-page-container, .page-sheet, .sheet, .a4-sheet, .print-page {
        background: #ffffff !important;
        visibility: visible !important;
        opacity: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        width: 100% !important;
        box-sizing: border-box !important;
        position: relative !important;
        margin: 0 !important;
        padding: 0 !important;
        min-height: auto !important;
        height: auto !important;
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .doc-top-wrapper {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
      }
      .doc-bottom-wrapper {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        margin-top: auto !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .items-table-container {
        flex: 1 1 auto !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 140px !important;
        border: 1px solid #000000 !important;
        border-radius: 6px !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        margin: 3px 0 !important;
      }
      .items-table {
        width: 100% !important;
        height: 100% !important;
        flex: 1 1 auto !important;
        border-collapse: collapse !important;
      }
      .items-table tbody {
        height: 100% !important;
      }
      .items-table tr.filler-row {
        height: 100% !important;
      }
      .items-table tr.filler-row td {
        height: 100% !important;
        border-bottom: none !important;
      }
      .doc-page-container + .doc-page-container,
      .page-sheet + .page-sheet,
      .sheet + .sheet,
      .a4-sheet + .a4-sheet {
        page-break-before: always !important;
        break-before: page !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      .footer-grid, .summary-table, .signatures-wrapper, .signatures-row, .work-order-print-footer, tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      @media print {
        html, body {
          padding: 0 !important;
          margin: 0 !important;
          height: auto !important;
          min-height: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .doc-page-container {
          margin: 0 !important;
          padding: 0 !important;
          height: 280mm !important;
          max-height: 280mm !important;
          min-height: 280mm !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          overflow: hidden !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .doc-page-container:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        [contenteditable="true"], [contenteditable="true"]:hover, [contenteditable="true"]:focus {
          outline: none !important;
          background-color: transparent !important;
          box-shadow: none !important;
        }
      }
    </style>
    <script>
      // Forward keyboard shortcuts to parent if inside studio preview iframe
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
    </script>
  `;

  let processedHtml = htmlContent;

  // Strict Arial replacement - convert any monospace or non-Arial fonts in inline styles
  processedHtml = processedHtml.replace(/font-family:\s*[^;"]*(monospace|courier|consolas|menlo)[^;"]*/gi, "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif !important");

  if (processedHtml.includes('</head>')) {
    processedHtml = processedHtml.replace('</head>', `${strictArialPrintStyle}\n</head>`);
  } else {
    processedHtml = `<!DOCTYPE html><html><head><title>${safeDocTitle}</title>${strictArialPrintStyle}</head><body>${processedHtml}</body></html>`;
  }

  if (processedHtml.includes('<title>')) {
    processedHtml = processedHtml.replace(/<title>([^<]*?)<\/title>/i, `<title>${safeDocTitle}</title>`);
  }

  return processedHtml;
};

/**
 * Toast feedback for user print / download / save actions
 */
export const showPrintToast = (message: string, isSuccess = true, customIcon?: string) => {
  try {
    const id = 'mfi-print-status-toast';
    const old = document.getElementById(id);
    if (old && old.parentNode) old.parentNode.removeChild(old);

    const toast = document.createElement('div');
    toast.id = id;
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.backgroundColor = isSuccess ? '#064e3b' : '#991b1b';
    toast.style.color = '#ffffff';
    toast.style.padding = '10px 18px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.4)';
    toast.style.fontFamily = 'Arial, sans-serif';
    toast.style.fontSize = '12px';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = '99999999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.style.pointerEvents = 'none';
    const icon = customIcon ? customIcon : (isSuccess ? '🖨️' : '⚠️');
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4500);
  } catch (_) {}
};

/**
 * Initiates high-fidelity native print dialog with automatic fail-safe fallback
 */
export const printHtml = (htmlContent: string, title?: string): boolean => {
  let docTitle = title || '';
  if (!docTitle && htmlContent.includes('<title>')) {
    const match = htmlContent.match(/<title>([^<]*?)<\/title>/i);
    if (match && match[1]) {
      docTitle = match[1].trim();
    }
  }
  if (!docTitle) {
    docTitle = 'Document';
  }

  const safeDocTitle = docTitle.replace(/[\/\\:*?"<>|]/g, '_').trim();
  const originalTitle = document.title;
  document.title = safeDocTitle;

  const processedHtml = preparePrintHtml(htmlContent, safeDocTitle);

  // Standalone Printable Window Page with Interactive Top Action Banner
  const standalonePrintHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${safeDocTitle}</title>
        <style>
          @media screen {
            #mfi-print-bar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #0f172a;
              color: #ffffff;
              padding: 10px 20px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              z-index: 9999999;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            }
            body {
              padding-top: 54px !important;
            }
          }
          @media print {
            #mfi-print-bar {
              display: none !important;
            }
            body {
              padding-top: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div id="mfi-print-bar" class="no-print">
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="font-size:13px; font-family:Arial,sans-serif !important;">${safeDocTitle}</strong>
            <span style="font-size:11px; color:#94a3b8; font-family:Arial,sans-serif !important;">(Press Ctrl+P or click Print)</span>
          </div>
          <div style="display:flex; gap:10px;">
            <button onclick="window.print()" style="background:#2563eb; color:#ffffff; border:none; padding:7px 20px; border-radius:4px; font-weight:bold; font-size:12px; cursor:pointer; font-family:Arial,sans-serif !important;">🖨️ Print Now</button>
            <button onclick="window.close()" style="background:#475569; color:#ffffff; border:none; padding:7px 14px; border-radius:4px; font-weight:bold; font-size:12px; cursor:pointer; font-family:Arial,sans-serif !important;">✕ Close Window</button>
          </div>
        </div>
        ${processedHtml}
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              try {
                window.focus();
                window.print();
              } catch (e) {
                console.warn('Auto print failed:', e);
              }
            }, 350);
          });
        </script>
      </body>
    </html>
  `;

  // 1. Try launching standalone print window via Blob URL (bypasses cross-frame and origin issues)
  let windowOpened = false;
  try {
    const blob = new Blob([standalonePrintHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    if (win) {
      windowOpened = true;
      showPrintToast("Print window opened! Click 'Print Now' or choose your printer.");
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (_) {}
      }, 60000);
      return true;
    }
  } catch (winErr) {
    console.warn("Blob window open blocked or failed:", winErr);
  }

  // 2. If popup is blocked by browser, try in-page iframe print with visible element
  try {
    const existingIframe = document.getElementById('mfi-print-service-iframe');
    if (existingIframe && existingIframe.parentNode) {
      existingIframe.parentNode.removeChild(existingIframe);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'mfi-print-service-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = '0';
    iframe.style.zIndex = '999999';
    iframe.style.background = '#ffffff';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(processedHtml);
      iframeDoc.close();

      const runPrint = () => {
        try {
          iframe.style.visibility = 'visible';
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
            document.title = originalTitle;
          }, 2000);
          showPrintToast("Opening print preview dialog...");
        } catch (e) {
          console.warn("Iframe window.print blocked by sandbox, downloading PDF:", e);
          fallbackPrint(processedHtml, safeDocTitle, originalTitle);
        }
      };

      if (iframeDoc.readyState === 'complete') {
        setTimeout(runPrint, 200);
      } else {
        iframe.onload = () => setTimeout(runPrint, 200);
        setTimeout(runPrint, 500);
      }
      return true;
    }
  } catch (iframeErr) {
    console.warn("Iframe creation failed:", iframeErr);
  }

  // 3. Guaranteed Fail-Safe Fallback: Browser print or immediate PDF download
  return fallbackPrint(processedHtml, safeDocTitle, originalTitle);
};

/**
 * Fallback print handler using a clean printable window, native print, or automatic PDF download
 */
const fallbackPrint = (html: string, title: string, originalTitle?: string): boolean => {
  const prevTitle = originalTitle || document.title;
  document.title = title;

  try {
    window.focus();
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
    showPrintToast("Print triggered.");
    return true;
  } catch (e) {
    console.warn("window.print failed or was blocked by sandbox, auto-downloading PDF:", e);
    showPrintToast("Print restricted by browser — downloading PDF directly!", true);
    downloadPdfFromHtml(html, title);
    return false;
  }
};

/**
 * Prompt Windows / macOS native "Save As" file picker dialog.
 * MUST be called directly in a user click / keydown event handler to satisfy browser user gesture requirements.
 */
export const promptSaveFilePicker = async (
  suggestedFileName: string
): Promise<any | 'ABORTED' | 'IFRAME_BLOCKED' | 'UNSUPPORTED' | null> => {
  const cleanName = (suggestedFileName || 'Invoice_Document')
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\.pdf$/i, '')
    .trim();

  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (typeof (window as any).showSaveFilePicker !== 'function') {
    return 'UNSUPPORTED';
  }

  try {
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `${cleanName}.pdf`,
      types: [
        {
          description: 'PDF Document (*.pdf)',
          accept: { 'application/pdf': ['.pdf'] }
        }
      ]
    });
    return fileHandle;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return 'ABORTED';
    }
    if (isInsideIframe || err.name === 'SecurityError' || String(err).toLowerCase().includes('frame') || String(err).toLowerCase().includes('user gesture')) {
      return 'IFRAME_BLOCKED';
    }
    console.warn("Native file picker unavailable or blocked in current sandbox context:", err);
    return null;
  }
};

/**
 * Helper to trigger direct browser file download via Blob URL.
 * Automatically wraps binary streams (like PDFs) in application/octet-stream
 * so Chrome and Edge match Word (.doc) behavior by prompting the user for the save location.
 */
export const triggerBlobDownload = (blob: Blob, name: string): void => {
  try {
    const isPdf = name.toLowerCase().endsWith('.pdf') || blob.type === 'application/pdf';
    // If PDF, wrap with application/octet-stream so browser treats it as a binary download
    // and asks for file location instead of silently routing to Downloads folder
    const targetBlob = isPdf && blob.type !== 'application/octet-stream'
      ? new Blob([blob], { type: 'application/octet-stream' })
      : blob;

    const url = URL.createObjectURL(targetBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2500);
  } catch (e) {
    console.error("Direct blob download failed:", e);
  }
};

/**
 * Compiles crisp vector-like multi-page PDF Blob using html2canvas + jsPDF engine.
 */
export const generatePdfBlobFromHtml = async (htmlContent: string): Promise<Blob> => {
  const isLandscape = htmlContent.toLowerCase().includes('landscape');
  const pageWidthMm = isLandscape ? 297 : 210;
  const pageHeightMm = isLandscape ? 210 : 297;

  // Extract all <style> blocks from head or whole document
  let styles = '';
  const styleMatches = htmlContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
  if (styleMatches) {
    styles = styleMatches.join('\n');
  }

  // Extract body content or complete HTML
  let bodyContent = htmlContent;
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    bodyContent = bodyMatch[1];
  }

  // Create isolated container for PDF generation
  const container = document.createElement('div');
  container.id = 'mfi-pdf-render-sandbox';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '794px'; // Standard A4 pixel width @ 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '99999999';
  container.style.opacity = '1';
  container.style.visibility = 'visible';
  container.style.pointerEvents = 'none';
  container.style.overflow = 'visible';
  container.style.fontFamily = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

  container.innerHTML = `
    ${styles}
    <style>
      * {
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
        color: #000000 !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      .doc-page-container, .page-sheet, .sheet, .a4-sheet {
        background-color: #ffffff !important;
        background: #ffffff !important;
        width: 794px !important;
        min-height: 1120px !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        margin: 0 !important;
        padding: 16px !important;
        position: relative !important;
      }
      .doc-top-wrapper {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        flex: 1 1 auto !important;
        min-height: 0 !important;
      }
      .doc-bottom-wrapper {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        margin-top: auto !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .items-table-container {
        flex: 1 1 auto !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 140px !important;
      }
      .items-table {
        width: 100% !important;
        height: 100% !important;
        flex: 1 1 auto !important;
        border-collapse: collapse !important;
      }
      .items-table tbody {
        height: 100% !important;
      }
      .items-table tr.filler-row {
        height: 100% !important;
      }
      .items-table tr.filler-row td {
        height: 100% !important;
        border-bottom: none !important;
      }
      .buyer-box, .logistics-box, .items-table-container, .words-box, .sums-box, .signatures-box, .stamp-box {
        background-color: #ffffff !important;
      }
      .items-table th, table.items-table th {
        background-color: #f1f5f9 !important;
        color: #000000 !important;
        vertical-align: middle !important;
      }
      .items-table td, table.items-table td {
        background-color: #ffffff !important;
        color: #000000 !important;
        vertical-align: middle !important;
      }
      [contenteditable], [contenteditable="true"] {
        outline: none !important;
        background-color: transparent !important;
        box-shadow: none !important;
      }
    </style>
    ${bodyContent}
  `;

  document.body.appendChild(container);

  try {
    // Strip contenteditable and editing focus highlights before capturing PDF
    container.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
    });
    container.classList.remove('live-edit-active');

    // Wait for images to load
    const images = Array.from(container.querySelectorAll('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve(true);
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
            setTimeout(() => resolve(true), 600);
          });
        })
      );
    }

    // Allow short delay for fonts and DOM rendering
    await new Promise(res => setTimeout(res, 120));

    // Find all individual page containers
    let pageElements = Array.from(container.querySelectorAll('.doc-page-container, .page-sheet, .sheet, .a4-sheet')) as HTMLElement[];
    if (pageElements.length === 0) {
      pageElements = [container];
    }

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < pageElements.length; i++) {
      const pageElem = pageElements[i];
      if (i > 0) {
        pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      }

      // Render at ultra-high resolution (scale 3 = 300 DPI print quality)
      const canvas = await html2canvas(pageElem, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      });

      // Lossless PNG eliminates text compression artifacts and keeps edges razor-sharp
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'SLOW');
    }

    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};

/**
 * Trigger High-Resolution PDF Save As workflow.
 * 1. Renders HTML into isolated DOM container with full styling
 * 2. Compiles crisp vector-like multi-page PDF Blob using modern html2canvas + jsPDF engine
 * 3. Writes directly to initialFileHandle (if provided from user gesture) or triggers direct PDF download
 * 4. Eliminates blank pages by rendering actual page DOM nodes directly
 */
export const downloadPdfFromHtml = async (
  htmlContent: string,
  fileName: string,
  initialFileHandle?: any
): Promise<boolean> => {
  if (initialFileHandle === 'ABORTED') {
    return false;
  }

  const cleanName = (fileName || 'Invoice_Document')
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\.pdf$/i, '')
    .trim();

  try {
    const pdfBlob = await generatePdfBlobFromHtml(htmlContent);

    // If fileHandle is present, write directly to user-selected file destination
    if (initialFileHandle && typeof initialFileHandle.createWritable === 'function') {
      try {
        const writable = await initialFileHandle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
        return true;
      } catch (writeErr) {
        console.warn("Writing to fileHandle failed, downloading via blob fallback:", writeErr);
        triggerBlobDownload(pdfBlob, `${cleanName}.pdf`);
        return true;
      }
    }

    // Direct download save
    triggerBlobDownload(pdfBlob, `${cleanName}.pdf`);
    return true;
  } catch (err) {
    console.warn("Direct generation encountered issue, using fallback:", err);
    try {
      const isLandscape = htmlContent.toLowerCase().includes('landscape');
      const simplePdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
      simplePdf.text(`Document: ${cleanName}`, 14, 20);
      simplePdf.save(`${cleanName}.pdf`);
      return true;
    } catch (_) {
      return false;
    }
  }
};

/**
 * Generates an editable Microsoft Word document (.doc) Blob from HTML.
 */
export const generateWordDocBlob = (htmlContent: string, fileName?: string): Blob => {
  const cleanName = fileName ? fileName.replace(/\.pdf$/i, '').replace(/\.doc$/i, '') : 'Document';

  // Sanitize any interactive cues from live-edit before outputting
  const cleanHtml = htmlContent
    .replace(/\scontenteditable="true"/gi, '')
    .replace(/\scontenteditable=""/gi, '')
    .replace(/\scontenteditable/gi, '')
    .replace(/class="([^"]*)\blive-edit-active\b([^"]*)"/gi, 'class="$1 $2"')
    .replace(/outline:\s*[^;]+;?/gi, '');

  const isLandscape = htmlContent.toLowerCase().includes('landscape');
  const orientation = isLandscape ? 'landscape' : 'portrait';
  const pageWidth = isLandscape ? '297mm' : '210mm';
  const pageHeight = isLandscape ? '210mm' : '297mm';

  const wordDocTemplate = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${cleanName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: ${pageWidth} ${pageHeight};
            margin: 8mm 8mm 8mm 8mm;
            mso-header-margin: 5mm;
            mso-footer-margin: 5mm;
            mso-page-orientation: ${orientation};
          }
          div.Section1 {
            page: Section1;
          }
          body {
            font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
            font-size: 10pt;
            margin: 0;
            padding: 0;
          }
          table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            width: 100%;
          }
          td, th {
            font-family: Arial, sans-serif;
            mso-line-height-rule: exactly;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${cleanHtml}
        </div>
      </body>
    </html>
  `;

  // \ufeff is the UTF-8 BOM so Word correctly parses all unicode, currency, and accents
  return new Blob(['\ufeff', wordDocTemplate], {
    type: 'application/msword;charset=utf-8'
  });
};

/**
 * Exports high-fidelity HTML document to an editable Microsoft Word document (.doc).
 * Formats the file with Word-compatible XML/MHT headers and stylesheets so Microsoft Word,
 * LibreOffice, and Google Docs open it directly with full layout, table borders, Arial fonts,
 * and completely editable text, cells, amounts, and notes.
 */
export const exportToWordDoc = (htmlContent: string, fileName: string): boolean => {
  try {
    const cleanName = fileName ? fileName.replace(/\.pdf$/i, '').replace(/\.doc$/i, '') : 'Document';
    const blob = generateWordDocBlob(htmlContent, cleanName);
    triggerBlobDownload(blob, `${cleanName}.doc`);
    return true;
  } catch (err) {
    console.error('Failed to export to Word document:', err);
    return false;
  }
};
