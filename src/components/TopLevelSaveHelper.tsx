import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export const TopLevelSaveHelper: React.FC = () => {
  const [fileName, setFileName] = useState<string>('Document.pdf');
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasData, setHasData] = useState<boolean>(false);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Parse fileName from URL parameters
    const params = new URLSearchParams(window.location.search);
    const paramName = params.get('fileName') || localStorage.getItem('mfi_save_doc_name') || localStorage.getItem('mfi_save_pdf_name') || 'Invoice_Document';
    const isDoc = paramName.toLowerCase().endsWith('.doc') || paramName.toLowerCase().endsWith('.docx') || params.get('format') === 'doc';
    const clean = paramName.replace(/\.(pdf|docx?)$/i, '').trim();
    setFileName(isDoc ? `${clean}.doc` : `${clean}.pdf`);

    // Check if document data is available in window.opener, localStorage or sessionStorage
    const checkData = () => {
      try {
        if (window.opener && (window.opener as any).__mfi_pending_blob) {
          return true;
        }
      } catch (_) {}
      return (
        localStorage.getItem('mfi_save_doc_data') ||
        localStorage.getItem('mfi_save_pdf_data') ||
        sessionStorage.getItem('mfi_save_doc_data') ||
        sessionStorage.getItem('mfi_save_pdf_data')
      );
    };

    if (checkData()) {
      setHasData(true);
    } else {
      const checkInterval = setInterval(() => {
        if (checkData()) {
          setHasData(true);
          clearInterval(checkInterval);
        }
      }, 300);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    // Auto-focus the save button so hitting Enter immediately triggers file picker
    setTimeout(() => {
      saveBtnRef.current?.focus();
    }, 150);
  }, []);

  const handleSaveToPc = async () => {
    if (status === 'SAVING') return;
    setStatus('SAVING');
    setErrorMessage('');

    try {
      if (typeof (window as any).showSaveFilePicker !== 'function') {
        throw new Error('Your browser does not support the File System Access API. Please use Chrome, Edge, or Brave.');
      }

      const isDoc = fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx');
      const cleanBase = fileName.replace(/\.(pdf|docx?)$/i, '').trim();

      // 1. Prompt native Windows/Mac File Explorer Save As dialog
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: isDoc ? `${cleanBase}.doc` : `${cleanBase}.pdf`,
        types: isDoc
          ? [
              {
                description: 'Microsoft Word Document (*.doc)',
                accept: { 'application/msword': ['.doc', '.docx'] }
              }
            ]
          : [
              {
                description: 'PDF Document (*.pdf)',
                accept: { 'application/pdf': ['.pdf'] }
              }
            ]
      });

      // 2. Fetch the document data
      let blob: Blob | null = null;
      try {
        if (window.opener && (window.opener as any).__mfi_pending_blob) {
          blob = (window.opener as any).__mfi_pending_blob;
        }
      } catch (_) {}

      if (!blob) {
        const dataUri =
          localStorage.getItem('mfi_save_doc_data') ||
          localStorage.getItem('mfi_save_pdf_data') ||
          sessionStorage.getItem('mfi_save_doc_data') ||
          sessionStorage.getItem('mfi_save_pdf_data');

        if (!dataUri) {
          throw new Error('Document content was not found. Please re-open the save dialog from the application.');
        }

        // Convert dataURI / HTML string to Blob
        if (isDoc && !dataUri.startsWith('data:')) {
          blob = new Blob(['\ufeff', dataUri], { type: 'application/msword;charset=utf-8' });
        } else if (dataUri.startsWith('data:application/pdf') || dataUri.startsWith('data:application/msword')) {
          const base64Data = dataUri.split(',')[1];
          const binaryStr = atob(base64Data);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: isDoc ? 'application/msword' : 'application/pdf' });
        } else {
          const res = await fetch(dataUri);
          blob = await res.blob();
        }
      }

      if (!blob) {
        throw new Error('Failed to assemble document file for saving.');
      }

      // 3. Write directly to the chosen PC file handle
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      setStatus('SUCCESS');

      // Clean up storage
      try {
        localStorage.removeItem('mfi_save_pdf_data');
        localStorage.removeItem('mfi_save_pdf_name');
        localStorage.removeItem('mfi_save_doc_data');
        localStorage.removeItem('mfi_save_doc_name');
        sessionStorage.removeItem('mfi_save_pdf_data');
        sessionStorage.removeItem('mfi_save_pdf_name');
        sessionStorage.removeItem('mfi_save_doc_data');
        sessionStorage.removeItem('mfi_save_doc_name');
      } catch (_) {}

      // Auto-close tab after 1.5 seconds if opened as popup
      setTimeout(() => {
        window.close();
      }, 1600);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User clicked cancel in Windows Explorer
        setStatus('IDLE');
        return;
      }
      console.error('File save error:', err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Failed to save file to selected location.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-slate-800 border-2 border-blue-500/50 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Choose Folder on PC</h1>
            <p className="text-xs text-slate-400">Select exact folder to save your PDF document</p>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-700 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Document File Name</span>
          <div className="font-mono text-sm font-bold text-emerald-400 break-all select-all">
            {fileName}
          </div>
        </div>

        {status === 'SUCCESS' ? (
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-lg p-4 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <div className="font-bold text-emerald-300 text-sm">File Saved Successfully!</div>
            <p className="text-xs text-slate-300">The PDF has been saved to your selected PC folder. This window will close automatically...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {status === 'ERROR' && (
              <div className="bg-rose-950/60 border border-rose-500/50 rounded-lg p-3 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <button
              ref={saveBtnRef}
              type="button"
              id="top-level-save-btn"
              onClick={handleSaveToPc}
              disabled={status === 'SAVING'}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-400/40 focus:ring-4 focus:ring-emerald-400 outline-none"
            >
              <FolderOpen className="w-5 h-5" />
              <span>{status === 'SAVING' ? 'Opening PC Explorer...' : 'Select Folder on PC & Save [Enter]'}</span>
            </button>

            <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <span>Press</span>
              <kbd className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded font-mono font-bold text-white text-[10px]">Enter</kbd>
              <span>to open Windows / Mac Save As folder prompt</span>
            </div>

            <div className="pt-2 border-t border-slate-700/60 text-center">
              <button
                type="button"
                onClick={() => window.close()}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Close Window</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
