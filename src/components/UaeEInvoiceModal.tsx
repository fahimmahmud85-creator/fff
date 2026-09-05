import React, { useState, useEffect } from 'react';
import { X, QrCode, FileCode, CheckCircle2, ShieldCheck, Download, Copy, Check, FileJson, Building2, Calendar, Hash, ArrowRight, ExternalLink } from 'lucide-react';
import { CompanyProfile, getActiveCompany } from '../utils/companyProfile';
import { 
  UaeEInvoiceData, 
  generateUaeEInvoiceTlv, 
  generateUaeEInvoiceQrCodeDataUrl, 
  generateUaeEInvoiceUblXml, 
  generateUaeEInvoiceJson, 
  decodeTlvPayload, 
  validateUaeTrn, 
  downloadFile 
} from '../utils/uaeEInvoicing';

interface UaeEInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData?: UaeEInvoiceData | null;
  company?: CompanyProfile;
}

export const UaeEInvoiceModal: React.FC<UaeEInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
  company
}) => {
  const activeCompany = company || getActiveCompany();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'XML' | 'JSON' | 'TLV'>('OVERVIEW');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && invoiceData && activeCompany) {
      generateUaeEInvoiceQrCodeDataUrl(activeCompany, invoiceData).then(url => {
        setQrCodeUrl(url);
      }).catch(err => {
        console.error("Error generating QR code", err);
      });
    }
  }, [isOpen, activeCompany, invoiceData]);

  if (!isOpen || !invoiceData) return null;

  const tlvDetails = generateUaeEInvoiceTlv(activeCompany, invoiceData);
  const decodedTags = decodeTlvPayload(tlvDetails.tlvBase64);
  const sellerTrnCheck = validateUaeTrn(activeCompany.trn);
  const buyerTrnCheck = validateUaeTrn(invoiceData.buyerTRN || invoiceData.customerTRN);
  const xmlContent = generateUaeEInvoiceUblXml(activeCompany, invoiceData);
  const jsonContent = generateUaeEInvoiceJson(activeCompany, invoiceData);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const invoiceNo = invoiceData.invoiceNo || invoiceData.id || 'INV-001';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c2338] via-[#0e2a47] to-[#1a4066] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-500 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                  UAE FTA E-Invoice Compliance Center
                </h3>
                <span className="bg-emerald-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3" /> PEPPOL UBL 2.1 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {activeCompany.name} &bull; TRN: {activeCompany.trn || '100440509600003'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'OVERVIEW'
                  ? 'border-amber-600 text-amber-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Compliance Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('XML')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'XML'
                  ? 'border-amber-600 text-amber-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>UBL 2.1 XML</span>
            </button>

            <button
              onClick={() => setActiveTab('JSON')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'JSON'
                  ? 'border-amber-600 text-amber-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>FTA JSON API</span>
            </button>

            <button
              onClick={() => setActiveTab('TLV')}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                activeTab === 'TLV'
                  ? 'border-amber-600 text-amber-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>TLV Payload</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 pb-2">
            <button
              onClick={() => downloadFile(xmlContent, `${invoiceNo}_UBL2.1.xml`, 'application/xml')}
              className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-md flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3 h-3" /> XML
            </button>
            <button
              onClick={() => downloadFile(jsonContent, `${invoiceNo}_FTA_EInvoice.json`, 'application/json')}
              className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3 h-3" /> JSON
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* QR Code Card */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-300 shadow-xs mb-3">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="UAE FTA E-Invoice QR Code" className="w-36 h-36 object-contain" />
                    ) : (
                      <div className="w-36 h-36 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">
                    FTA TLV Cryptographic QR
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                    Scan via official UAE Tax Verification app
                  </span>
                </div>

                {/* Verification Parameters */}
                <div className="md:col-span-2 space-y-3">
                  <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="font-black text-emerald-950 uppercase tracking-tight">
                        Federal Tax Authority (FTA) Standard 5% VAT Invoicing Active
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        This electronic tax invoice is generated with cryptographic hash integrity, 15-digit TRN compliance, and conforms with UAE MoF / FTA Peppol BIS Billing 3.0 (UBL 2.1).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Seller (Tax Registrant)</span>
                      <span className="font-black text-slate-900 block truncate">{activeCompany.name}</span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="font-mono text-[10.5px] font-bold text-slate-700">TRN: {activeCompany.trn || '—'}</span>
                        {sellerTrnCheck.valid && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Buyer / Customer</span>
                      <span className="font-black text-slate-900 block truncate">{invoiceData.buyerName || invoiceData.customerName || 'General Buyer'}</span>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="font-mono text-[10.5px] font-bold text-slate-700">
                          TRN: {invoiceData.buyerTRN || invoiceData.customerTRN || 'Non-Registered'}
                        </span>
                        {buyerTrnCheck.valid && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                    </div>
                  </div>

                  {/* Financial Digest */}
                  <div className="bg-slate-900 text-white rounded-xl p-3.5 grid grid-cols-3 gap-3 text-center font-mono">
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase block font-bold">Taxable Subtotal</span>
                      <span className="text-sm font-black text-slate-100">
                        {invoiceData.currency || 'AED'} {(parseFloat(tlvDetails.totalWithVat || '0') - parseFloat(tlvDetails.vatAmount || '0')).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-x border-slate-700">
                      <span className="text-[8.5px] text-amber-400 uppercase block font-bold">5% VAT Total</span>
                      <span className="text-sm font-black text-amber-300">
                        {invoiceData.currency || 'AED'} {tlvDetails.vatAmount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-emerald-400 uppercase block font-bold">Grand Total (Inc. VAT)</span>
                      <span className="text-sm font-black text-emerald-400">
                        {invoiceData.currency || 'AED'} {tlvDetails.totalWithVat}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Cryptographic Metadata Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-xs">
                <div className="font-black text-slate-900 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-amber-600" />
                    <span>Cryptographic Security &amp; Unique Invoice Identifiers</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">RFC 4122 / SHA-256</span>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">IRN / UUID:</span>
                    <span className="text-[10.5px] font-bold text-slate-900 select-all truncate">{tlvDetails.irn}</span>
                    <button 
                      onClick={() => handleCopy(tlvDetails.irn)} 
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0" 
                      title="Copy UUID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">SHA-256 Hash:</span>
                    <span className="text-[10.5px] font-bold text-amber-800 select-all truncate">{tlvDetails.invoiceHash}</span>
                    <button 
                      onClick={() => handleCopy(tlvDetails.invoiceHash)} 
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0" 
                      title="Copy Hash"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: UBL 2.1 XML */}
          {activeTab === 'XML' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase font-mono">
                  PEPPOL UBL 2.1 XML Document (ISO/IEC 19845)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(xmlContent)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy XML'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile(xmlContent, `${invoiceNo}_UBL2.1.xml`, 'application/xml')}
                    className="px-3 py-1.5 text-xs font-bold bg-[#0e2a47] hover:bg-[#143a60] text-white rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download .XML</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-xl max-h-[400px] overflow-auto border border-slate-800 leading-relaxed select-text">
                <pre>{xmlContent}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: JSON API */}
          {activeTab === 'JSON' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase font-mono">
                  UAE FTA E-Invoice API Transmission Payload (JSON)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(jsonContent)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile(jsonContent, `${invoiceNo}_FTA_EInvoice.json`, 'application/json')}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .JSON</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 text-amber-300 font-mono text-[11px] p-4 rounded-xl max-h-[400px] overflow-auto border border-slate-800 leading-relaxed select-text">
                <pre>{jsonContent}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: TLV ENCODED PAYLOAD */}
          {activeTab === 'TLV' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase font-mono">
                  Decoded Tag-Length-Value (TLV) Binary Schema
                </span>
                <button
                  onClick={() => handleCopy(tlvDetails.tlvBase64)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Base64</span>
                </button>
              </div>

              {/* Table of Decoded Tags */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-16">Tag</th>
                      <th className="py-2 px-3">Field Name</th>
                      <th className="py-2 px-3">Decoded Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {decodedTags.map((tag) => (
                      <tr key={tag.tag} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-amber-700">Tag #{tag.tag}</td>
                        <td className="py-2 px-3 font-semibold text-slate-700">{tag.name}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 break-all">{tag.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Raw Base64 Encoded Stream
                </label>
                <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg font-mono text-[10.5px] text-slate-800 break-all select-all">
                  {tlvDetails.tlvBase64}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold">E-INVOICE STATUS: ACTIVE &amp; COMPLIANT</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
