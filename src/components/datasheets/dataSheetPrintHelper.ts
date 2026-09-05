import { DataSheetRecord } from './dataSheetTypes';
import { printHtml } from '../PrintHelper';
import { getCompanyStampSvgUrl, DEFAULT_MFI_STAMP_SVG_URL, DEFAULT_PREPARED_SIGN_SVG_URL } from './DataSheetFooterSignatures';
import { MULTI_SIZE_DEFAULT_HEADERS, MULTI_SIZE_FIELDS } from './dataSheetPresets';
import { getActiveCompany, isMarineFastenersCompany } from '../../utils/companyProfile';

export const generateDataSheetPrintHtml = (record: DataSheetRecord): string => {
  const isLandscape = record.printOrientation === 'landscape';
  const activeCompany = getActiveCompany();
  const isMfi = isMarineFastenersCompany(activeCompany);
  const isBoltMaster = (activeCompany.code || '').toUpperCase() === 'BMM' || activeCompany.id === 'comp-bmm' || activeCompany.name.toUpperCase().includes('BOLT');
  const isUnitedMetal = (activeCompany.code || '').toUpperCase() === 'UMI' || activeCompany.id === 'comp-umi' || activeCompany.name.toUpperCase().includes('UNITED METAL');

  // Support multiple sheets / pages
  const sheetsToPrint: DataSheetRecord[] = (record.sheets && record.sheets.length > 0)
    ? record.sheets
    : [record];

  let calculatedTotalPages = 0;
  sheetsToPrint.forEach(sh => {
    calculatedTotalPages += sh.includeMtcPage ? 2 : 1;
  });

  const totalPages = calculatedTotalPages || 1;

  // Header Logo Box HTML
  const renderHeaderLogoHtml = () => {
    const logoImg = record.customLogoImage || activeCompany.logoUrl;
    if (logoImg) {
      return `<img src="${logoImg}" style="max-height: 48px; max-width: 140px; height: 48px; width: auto; object-fit: contain; margin-right: 6px; flex-shrink: 0;" />`;
    }

    const logoInitials = record.headerLogoInitials || (isMfi ? 'MF' : isBoltMaster ? 'BM' : isUnitedMetal ? 'UMI' : (activeCompany.code || 'CO'));
    const logoText = record.headerLogoText || (isMfi ? 'MARINE FASTENERS' : isBoltMaster ? 'BOLT MASTER' : isUnitedMetal ? 'UNITED METAL' : activeCompany.name);

    if (isBoltMaster) {
      return `
        <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" style="height: 48px; width: 130px; max-width: 135px; display: inline-block; flex-shrink: 0; margin-right: 6px;">
          <g>
            <rect x="10" y="18" width="300" height="84" rx="8" fill="#0e2a47" stroke="#f59e0b" stroke-width="3"/>
            <text x="160" y="60" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="1">${record.headerLogoInitials || 'BOLT MASTER'}</text>
            <line x1="30" y1="70" x2="290" y2="70" stroke="#f59e0b" stroke-width="2"/>
            <text x="160" y="88" font-family="'Arial', sans-serif" font-weight="bold" font-size="12" fill="#f59e0b" text-anchor="middle" letter-spacing="2">${record.headerLogoText || 'BUILDING MATERIALS'}</text>
          </g>
        </svg>
      `;
    }

    if (isUnitedMetal) {
      return `
        <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" style="height: 48px; width: 130px; max-width: 135px; display: inline-block; flex-shrink: 0; margin-right: 6px;">
          <g>
            <rect x="10" y="18" width="300" height="84" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
            <text x="160" y="60" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="30" fill="#38bdf8" text-anchor="middle" letter-spacing="1">${record.headerLogoInitials || 'UNITED METAL'}</text>
            <line x1="30" y1="70" x2="290" y2="70" stroke="#94a3b8" stroke-width="2"/>
            <text x="160" y="88" font-family="'Arial', sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle" letter-spacing="2">${record.headerLogoText || 'INDUSTRIES SPS-L.L.C'}</text>
          </g>
        </svg>
      `;
    }

    const fontSz = logoInitials.length > 2 ? '64' : '90';
    const ribbonWidth = Math.max(180, (logoText.length * 8) + 30);
    const ribbonCenter = 38 + (ribbonWidth / 2);

    return `
      <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" style="height: 48px; width: 130px; max-width: 135px; display: inline-block; flex-shrink: 0; margin-right: 6px;">
        <g transform="skewX(-14) translate(15, 0)">
          <path d="M-8,24 L45,28 L8,32 Z" fill="#000000"/>
          <path d="M-12,36 L50,40 L3,44 Z" fill="#000000"/>
          <path d="M-15,48 L55,52 L0,56 Z" fill="#000000"/>
          <path d="M-18,60 L60,64 L-3,68 Z" fill="#000000"/>
          <path d="M-15,72 L62,76 L2,80 Z" fill="#000000"/>
          <path d="M-10,84 L65,88 L8,91 Z" fill="#000000"/>
          <path d="M-5,94 L68,97 L14,100 Z" fill="#000000"/>
          <text x="42" y="88" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="${fontSz}" fill="#000000" stroke="#000000" stroke-width="12" stroke-linejoin="miter" letter-spacing="-4">${logoInitials}</text>
          <text x="42" y="88" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="${fontSz}" fill="#ffffff" stroke="#000000" stroke-width="2" letter-spacing="-4">${logoInitials}</text>
          <rect x="38" y="88" width="${ribbonWidth}" height="20" fill="#ffffff" stroke="#000000" stroke-width="2.5" rx="1"/>
          <text x="${ribbonCenter}" y="102.5" font-family="'Arial', sans-serif" font-weight="bold" font-style="italic" font-size="11.5" fill="#000000" text-anchor="middle" letter-spacing="0.5">${logoText}</text>
        </g>
      </svg>
    `;
  };

  // Header ISO Badges Box HTML
  const renderHeaderIsoHtml = () => {
    const customIso = record.customIsoImage || activeCompany.isoLogoUrl;
    if (customIso) {
      return `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <img src="${customIso}" style="max-height: 38px; max-width: 250px; height: 38px; object-fit: contain;" />
        </div>
      `;
    }
    if (!isMfi) {
      return ``;
    }
    const isoBadgeUrl = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 110" width="660" height="110">
        <g fill="none" stroke="none">
          <g transform="translate(10, 5)">
            <circle cx="50" cy="50" r="47" fill="#0f172a"/>
            <circle cx="50" cy="50" r="43" fill="#ffffff"/>
            <circle cx="50" cy="50" r="39" fill="none" stroke="#0f172a" stroke-width="2"/>
            <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" stroke-width="0.8" stroke-dasharray="2,2"/>
            <text x="50" y="37" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#0f172a" text-anchor="middle" letter-spacing="1">ISO</text>
            <text x="50" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="12" fill="#0f172a" text-anchor="middle">9001:2015</text>
            <text x="50" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#334155" text-anchor="middle" letter-spacing="0.5">QMS CERTIFIED</text>
          </g>
          <g transform="translate(140, 5)">
            <circle cx="50" cy="50" r="47" fill="#0f172a"/>
            <circle cx="50" cy="50" r="43" fill="#ffffff"/>
            <circle cx="50" cy="50" r="39" fill="none" stroke="#0f172a" stroke-width="2"/>
            <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" stroke-width="0.8" stroke-dasharray="2,2"/>
            <text x="50" y="37" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#0f172a" text-anchor="middle" letter-spacing="1">ISO</text>
            <text x="50" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="12" fill="#0f172a" text-anchor="middle">14001:2015</text>
            <text x="50" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#047857" text-anchor="middle" letter-spacing="0.5">EMS CERTIFIED</text>
          </g>
          <g transform="translate(270, 5)">
            <rect x="5" y="5" width="110" height="90" rx="8" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
            <path d="M 60 16 L 86 28 L 86 58 C 86 74 60 84 60 84 C 60 84 34 74 34 58 L 34 28 Z" fill="#0f172a"/>
            <path d="M 60 20 L 82 30 L 82 56 C 82 69 60 78 60 78 C 60 78 38 69 38 56 L 38 30 Z" fill="none" stroke="#ffffff" stroke-width="1"/>
            <text x="60" y="44" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">eiac</text>
            <text x="60" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="6.5" fill="#38bdf8" text-anchor="middle" letter-spacing="0.5">ACCREDITED</text>
            <text x="60" y="86" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="7.5" fill="#0f172a" text-anchor="middle">CB-001-MS</text>
          </g>
          <g transform="translate(400, 5)">
            <circle cx="50" cy="50" r="47" fill="#0f172a"/>
            <circle cx="50" cy="50" r="43" fill="#ffffff"/>
            <circle cx="50" cy="50" r="39" fill="none" stroke="#0f172a" stroke-width="2"/>
            <circle cx="50" cy="50" r="36" fill="none" stroke="#0f172a" stroke-width="0.8" stroke-dasharray="2,2"/>
            <text x="50" y="37" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#0f172a" text-anchor="middle" letter-spacing="1">ISO</text>
            <text x="50" y="55" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="12" fill="#0f172a" text-anchor="middle">45001:2018</text>
            <text x="50" y="70" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#1d4ed8" text-anchor="middle" letter-spacing="0.5">OH&amp;S MGMT</text>
          </g>
          <g transform="translate(530, 5)">
            <circle cx="50" cy="50" r="47" fill="#0f172a"/>
            <circle cx="50" cy="41" fill="none" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="50" cy="37" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,2"/>
            <text x="50" y="38" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">VERITAS</text>
            <text x="50" y="52" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="8" fill="#38bdf8" text-anchor="middle">ASSURANCE</text>
            <text x="50" y="68" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="7.5" fill="#ffffff" text-anchor="middle" letter-spacing="1">GLOBAL</text>
          </g>
        </g>
      </svg>
    `)}`;

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <img src="${isoBadgeUrl}" style="max-height: 36px; max-width: 270px; height: 36px; object-fit: contain;" />
      </div>
    `;
  };

  // Header Common Table HTML
  const renderHeaderTable = (pageNum: number, customTitle?: string) => {
    const showContact = record.headerPrintEmailAndWeb !== false;
    const docTitle = customTitle || record.headerDocTitle || 'DATA SHEET';
    const compName = record.headerCompanyName || activeCompany.name;
    const compSub = record.headerCompanySub || (isMfi ? '(SOLE PROPRIETORSHIP)' : '');
    const compAddr = record.headerCompanyAddress || (activeCompany.address ? `${activeCompany.address}, Tel: ${activeCompany.phone || '—'}` : 'New Industrial Area, Ajman, UAE, Tel: +971 6 525 0526');
    const compContact = record.headerCompanyContact || `${activeCompany.email || 'sales@marinefasteners.co'} | ${activeCompany.website || 'www.marinefasteners.co'}`;

    return `
      <table class="header-table">
        <tr>
          <td style="width: 44%; vertical-align: middle;">
            <div class="logo-container">
              ${renderHeaderLogoHtml()}
              <div style="flex: 1;">
                <div class="company-title">${compName}</div>
                ${compSub ? `<div class="company-sub">${compSub}</div>` : ''}
                <div class="company-addr">
                  ${compAddr}
                </div>
                ${showContact ? `
                  <div class="company-contact">
                    ${compContact}
                  </div>
                ` : ''}
              </div>
            </div>
          </td>
          <td style="width: 32%; text-align: center; vertical-align: middle;">
            ${renderHeaderIsoHtml()}
          </td>
          <td style="width: 24%; text-align: right; vertical-align: middle;">
            <div class="doc-type-title">${docTitle}</div>
            <div class="page-indicator">
              PAGE NO : <span class="page-box">${pageNum} OF ${totalPages}</span>
            </div>
          </td>
        </tr>
      </table>
    `;
  };

  // Meta Table
  const renderMetaTable = (sh: DataSheetRecord) => `
    <table class="meta-table">
      <tr>
        <td style="width: 32%;"><strong>Data Sheet No:</strong> ${sh.dataSheetNo || record.dataSheetNo || '—'}</td>
        <td style="width: 28%;"><strong>Date:</strong> ${sh.date || record.date || '—'}</td>
        <td style="width: 40%;"><strong>Customer:</strong> ${sh.customer || record.customer || '—'}</td>
      </tr>
    </table>
  `;

  // Render SVG technical drawings to inline string for print compatibility
  const renderLeftDrawingHtml = (sh: DataSheetRecord) => {
    const drawingHeight = isLandscape ? 140 : 170;
    if (sh.leftDrawingImage) {
      return `<img src="${sh.leftDrawingImage}" style="max-height: ${drawingHeight}px; max-width: 100%; height: ${drawingHeight}px; object-fit: contain; display: block; margin: 0 auto;" />`;
    }
    // Default SVG for Hex Bolt
    if (sh.leftDrawingType === 'preset_bolt') {
      return `
        <svg viewBox="0 0 400 220" style="width: 100%; height: ${drawingHeight}px; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="220" fill="#ffffff" />
          <path d="M 50 60 L 90 60 L 90 160 L 50 160 Z" fill="#f1f5f9" stroke="#000000" stroke-width="1.5" />
          <rect x="90" y="75" width="110" height="70" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <rect x="200" y="75" width="140" height="70" fill="#f1f5f9" stroke="#000000" stroke-width="1.5" />
          <polygon points="340,75 348,82 348,138 340,145" fill="#e2e8f0" stroke="#000000" stroke-width="1.2" />
          <line x1="30" y1="110" x2="365" y2="110" stroke="#000000" stroke-width="0.8" stroke-dasharray="8,3,2,3" />
          <text x="70" y="48" fill="#000000" font-size="11" font-weight="bold" text-anchor="middle">k (Head Ht)</text>
          <text x="219" y="195" fill="#000000" font-size="11" font-weight="bold" text-anchor="middle">L (Total Length)</text>
          <text x="375" y="114" fill="#000000" font-size="11" font-weight="bold">Ød</text>
        </svg>
      `;
    }
    // Stud Bolt
    if (sh.leftDrawingType === 'preset_stud') {
      return `
        <svg viewBox="0 0 400 220" style="width: 100%; height: ${drawingHeight}px; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="220" fill="#ffffff" />
          <rect x="40" y="75" width="320" height="70" fill="#f8fafc" stroke="#000000" stroke-width="1.5" />
          <line x1="20" y1="110" x2="380" y2="110" stroke="#000000" stroke-width="0.8" stroke-dasharray="8,3,2,3" />
          <text x="200" y="195" fill="#000000" font-size="11" font-weight="bold" text-anchor="middle">L (Total Length)</text>
          <text x="375" y="114" fill="#000000" font-size="11" font-weight="bold">Ød</text>
        </svg>
      `;
    }
    // Hex Nut
    return `
      <svg viewBox="0 0 400 220" style="width: 100%; height: ${drawingHeight}px; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="220" fill="#ffffff" />
        <g transform="translate(100, 110)">
          <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <circle cx="0" cy="0" r="48" fill="none" stroke="#666666" stroke-width="0.8" stroke-dasharray="2,2" />
          <circle cx="0" cy="0" r="28" fill="none" stroke="#000000" stroke-width="1.2" stroke-dasharray="4,2" />
          <circle cx="0" cy="0" r="22" fill="#f1f5f9" stroke="#000000" stroke-width="1.5" />
          <line x1="-65" y1="0" x2="65" y2="0" stroke="#666666" stroke-width="0.8" stroke-dasharray="8,3,2,3" />
          <line x1="0" y1="-65" x2="0" y2="65" stroke="#666666" stroke-width="0.8" stroke-dasharray="8,3,2,3" />
          <text x="0" y="-70" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">s (Across Flat)</text>
          <text x="0" y="78" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">e (Across Corner)</text>
        </g>
        <g transform="translate(270, 110)">
          <polygon points="-32,-50 32,-50 36,-42 36,42 32,50 -32,50 -36,42 -36,-42" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <line x1="-32" y1="-50" x2="-32" y2="50" stroke="#666666" stroke-width="1" />
          <line x1="32" y1="-50" x2="32" y2="50" stroke="#666666" stroke-width="1" />
          <rect x="-32" y="-22" width="64" height="44" fill="#f1f5f9" stroke="#000000" stroke-width="1.2" />
          <line x1="-50" y1="0" x2="50" y2="0" stroke="#666666" stroke-width="0.8" stroke-dasharray="8,3,2,3" />
          <text x="0" y="-70" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">m (Thickness)</text>
          <text x="0" y="78" fill="#000000" font-size="10" font-weight="bold" text-anchor="middle">Minor Dia (d1)</text>
        </g>
      </svg>
    `;
  };

  const renderRightDrawingHtml = (sh: DataSheetRecord) => {
    const drawingHeight = isLandscape ? 140 : 170;
    if (sh.rightDrawingImage) {
      return `<img src="${sh.rightDrawingImage}" style="max-height: ${drawingHeight}px; max-width: 100%; height: ${drawingHeight}px; object-fit: contain; display: block; margin: 0 auto;" />`;
    }
    let brandText = "MFI";
    let gradeText = "8";
    if (sh.rightDrawingType === 'stamp_mfi_8_8') {
      gradeText = "8.8";
    } else if (sh.rightDrawingType === 'stamp_mfi_10_9') {
      gradeText = "10.9";
    } else if (sh.rightDrawingType === 'stamp_mfi_2h') {
      gradeText = "2H";
    } else if (sh.rightDrawingType === 'stamp_mfi_b7') {
      gradeText = "B7";
    } else if (sh.rightDrawingType === 'stamp_mfi_a4_80') {
      gradeText = "A4-80";
    }

    return `
      <svg viewBox="0 0 400 220" style="width: 100%; height: ${drawingHeight}px; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="220" fill="#ffffff" />
        <g transform="translate(200, 110)">
          <polygon points="0,-68 58,-33 58,33 0,68 -58,33 -58,-33" fill="#ffffff" stroke="#000000" stroke-width="2" />
          <circle cx="0" cy="0" r="62" fill="none" stroke="#666666" stroke-width="1" stroke-dasharray="3,2" />
          <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
          <text x="0" y="-34" fill="#000000" font-size="16" font-weight="900" font-family="Arial, sans-serif" letter-spacing="2" text-anchor="middle">${brandText}</text>
          <text x="0" y="46" fill="#000000" font-size="15" font-weight="900" font-family="Arial, sans-serif" text-anchor="middle">${gradeText}</text>
          <circle cx="-40" cy="0" r="3" fill="#000000" />
          <circle cx="40" cy="0" r="3" fill="#000000" />
        </g>
      </svg>
    `;
  };

  // Footer Signatures & Stamp HTML with exact pixel scaling & draggable coordinate offsets
  const renderFooterHtml = (sh: DataSheetRecord) => {
    const prepSign = (sh.preparedBySignatureImage !== undefined && sh.preparedBySignatureImage !== '')
      ? sh.preparedBySignatureImage
      : ((record.preparedBySignatureImage !== undefined && record.preparedBySignatureImage !== '') ? record.preparedBySignatureImage : DEFAULT_PREPARED_SIGN_SVG_URL);

    const defaultStamp = getCompanyStampSvgUrl(activeCompany, sh.approvedByCompany || sh.headerCompanyName || record.headerCompanyName);
    const stampImg = (sh.stampSealImage !== undefined && sh.stampSealImage !== '')
      ? sh.stampSealImage
      : ((record.stampSealImage !== undefined && record.stampSealImage !== '') ? record.stampSealImage : (sh.showSeal !== false ? defaultStamp : ''));

    const apprSign = sh.approvedBySignatureImage || record.approvedBySignatureImage || '';

    const prepHeight = Math.round((sh.preparedSignHeight ?? record.preparedSignHeight ?? 48) * 0.75);
    const apprHeight = Math.round((sh.approvedSignHeight ?? record.approvedSignHeight ?? 48) * 0.75);
    const stampSize = Math.round((sh.stampHeight ?? record.stampHeight ?? 134) * 0.72);

    const prepPosX = Math.round((sh.preparedSignPosX ?? record.preparedSignPosX ?? 0) * 0.75);
    const prepPosY = Math.round((sh.preparedSignPosY ?? record.preparedSignPosY ?? 0) * 0.75);
    const apprPosX = Math.round((sh.approvedSignPosX ?? record.approvedSignPosX ?? 0) * 0.75);
    const apprPosY = Math.round((sh.approvedSignPosY ?? record.approvedSignPosY ?? 0) * 0.75);
    const stampPosX = Math.round((sh.stampPosX ?? record.stampPosX ?? 0) * 0.75);
    const stampPosY = Math.round((sh.stampPosY ?? record.stampPosY ?? 0) * 0.75);

    return `
    <table class="footer-table" style="width: 100%; border-collapse: collapse; margin-top: auto; padding-top: 4px;">
      <tr>
        <td style="width: 45%; vertical-align: bottom; text-align: left; padding: 2px;">
          <div style="height: 52px; position: relative; display: flex; align-items: flex-end; margin-bottom: 2px; overflow: visible;">
            ${prepSign ? `
              <img 
                src="${prepSign}" 
                style="height: ${prepHeight}px; max-height: ${prepHeight}px; max-width: 160px; object-fit: contain; transform: translate(${prepPosX}px, ${prepPosY}px); display: block;" 
              />
            ` : ''}
          </div>
          <div style="font-size: 8.5pt; font-weight: bold; color: #000000; line-height: 1.2;">${sh.preparedByName || record.preparedByName || 'Prepared By.'}</div>
        </td>
        <td style="width: 55%; vertical-align: bottom; text-align: right; padding: 2px;">
          <div style="height: 52px; position: relative; display: flex; align-items: flex-end; justify-content: flex-end; margin-bottom: 2px; overflow: visible;">
            ${stampImg ? `
              <img 
                src="${stampImg}" 
                style="position: absolute; right: 80px; bottom: -8px; width: ${stampSize}px; height: ${stampSize}px; max-width: ${stampSize}px; max-height: ${stampSize}px; object-fit: contain; opacity: 0.95; z-index: 1; transform: translate(${stampPosX}px, ${stampPosY}px);" 
              />
            ` : ''}
            ${apprSign ? `
              <img 
                src="${apprSign}" 
                style="height: ${apprHeight}px; max-height: ${apprHeight}px; max-width: 160px; object-fit: contain; position: relative; z-index: 2; transform: translate(${apprPosX}px, ${apprPosY}px); display: inline-block;" 
              />
            ` : ''}
          </div>
          <div style="font-size: 8.5pt; font-weight: bold; color: #000000; line-height: 1.2;">${sh.approvedByName || record.approvedByName || 'Approved By.'}</div>
        </td>
      </tr>
    </table>
    `;
  };

  // Render individual page sheets for each product
  let globalCurrentPage = 1;
  const renderedSheetsHtml: string[] = [];

  sheetsToPrint.forEach((sh) => {
    const isShTemplate2 = sh.templateType === 'template2';
    const activeInspectionRows = (sh.dimensionalInspections || []).filter(r => r.selected !== false);

    // Multi-size column header filtering
    const multiSizeHeadersAll = sh.multiSizeHeaders && sh.multiSizeHeaders.length === 11
      ? sh.multiSizeHeaders
      : MULTI_SIZE_DEFAULT_HEADERS;
    const multiSizeSelected = sh.multiSizeSelectedColumns && sh.multiSizeSelectedColumns.length === multiSizeHeadersAll.length
      ? sh.multiSizeSelectedColumns
      : multiSizeHeadersAll.map(() => true);

    const activeMultiIndices = multiSizeHeadersAll
      .map((_, i) => i)
      .filter(i => multiSizeSelected[i] !== false);

    const multiIndicesToUse = activeMultiIndices.length > 0 ? activeMultiIndices : multiSizeHeadersAll.map((_, i) => i);
    const multiSizeRows = sh.multiSizeRows || [];

    const page1Number = globalCurrentPage;
    globalCurrentPage++;

    // PAGE 1: Product Data Sheet
    const page1Html = `
      <div class="page-sheet ${sh.includeMtcPage || globalCurrentPage <= totalPages ? 'page-break' : ''}">
        <div class="sheet-main-content">
          <!-- Header -->
          ${renderHeaderTable(page1Number, sh.page1Title || sh.headerDocTitle)}

          <!-- Meta Information -->
          ${renderMetaTable(sh)}

          <!-- Subject Box (Box border with subject text inside, NO "SUBJECT" label, matching specification) -->
          ${sh.subject ? `
          <div style="border: 1.5px solid #000000; padding: 4px 8px; margin: 4px 0 6px 0; font-weight: 800; font-size: 8.5pt; text-transform: uppercase; background: #ffffff; letter-spacing: 0.2px; line-height: 1.3; color: #000000; text-align: left;">
            ${sh.subject}
          </div>
          ` : ''}

          <!-- Objectives Box (If Enabled) -->
          ${sh.showObjective ? `
          <div class="section-box">
            <div class="section-header">OBJECTIVES</div>
            <div class="section-content">
              ${sh.objectiveContent || 'To verify dimensional tolerances and conforming standard specifications as per client purchase requirements.'}
            </div>
          </div>
          ` : ''}

          <!-- Drawings Grid -->
          ${sh.showDrawings !== false ? `
          <div class="drawings-grid">
            <div class="drawing-col">
              <div class="drawing-box">
                <div class="drawing-box-header">
                  <span>${sh.leftDrawingTitle || 'DRAWING'}</span>
                  <span style="font-size: 7pt; font-weight: normal;">${sh.leftDrawingRef || ''}</span>
                </div>
                <div class="drawing-inner">
                  ${renderLeftDrawingHtml(sh)}
                </div>
                ${(sh.leftDrawingCaption && sh.leftDrawingCaption.trim()) ? `
                <div class="drawing-caption">
                  ${sh.leftDrawingCaption.replace(/\s*\(CONFORMING\)/gi, '').trim()}
                </div>
                ` : ''}
              </div>
            </div>

            <div class="drawing-col">
              <div class="drawing-box">
                <div class="drawing-box-header">
                  <span>${sh.rightDrawingTitle || 'DRAWING'}</span>
                  <span style="font-size: 7pt; font-weight: normal;">${sh.rightDrawingRef || ''}</span>
                </div>
                <div class="drawing-inner">
                  ${renderRightDrawingHtml(sh)}
                </div>
                ${(sh.rightDrawingCaption && sh.rightDrawingCaption.trim() && !sh.rightDrawingCaption.includes('M8 / DIN 934 (CONFORMING)')) ? `
                <div class="drawing-caption">
                  ${sh.rightDrawingCaption.replace(/\s*\(CONFORMING\)/gi, '').trim()}
                </div>
                ` : ''}
              </div>
            </div>
          </div>
          ` : ''}

          <!-- SINGLE PRODUCT vs MULTI PRODUCT MATRIX -->
          ${!isShTemplate2 ? `
            <!-- SINGLE PRODUCT: DIMENSIONAL INSPECTION SECTION -->
            ${sh.showDimensionalInspection !== false ? `
            <div class="section-header" style="margin-top: 4px; margin-bottom: 2px;">
              ${sh.dimensionalInspectionTitle || 'DIMENSIONAL INSPECTIONS'}
            </div>
            <table class="dim-table">
              <thead>
                <tr>
                  <th style="width: 5%;">SL</th>
                  <th style="width: 35%;">CHARACTERISTICS</th>
                  <th style="width: 60%;">REQUIREMENTS / OBSERVATIONS</th>
                </tr>
              </thead>
              <tbody>
                ${activeInspectionRows.map((row, idx) => `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="font-weight: 600;">${row.characteristic || ''}</td>
                    <td>${row.requirements || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ` : ''}
          ` : `
            <!-- MULTI PRODUCT: DIMENSION INSPECTION MATRIX -->
            <div style="font-size: 8.5pt; font-weight: bold; margin: 3px 0 2px 0;">
              DIMENSION
            </div>
            <table class="multi-size-table">
              <thead>
                <tr>
                  ${multiIndicesToUse.map(i => `<th>${multiSizeHeadersAll[i] || ''}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${multiSizeRows.map((row, idx) => `
                  <tr>
                    ${multiIndicesToUse.map(i => {
                      const fieldKey = MULTI_SIZE_FIELDS[i];
                      let val = (row as any)[fieldKey] || '—';
                      if (fieldKey === 'itemNo' && (!val || val === '—')) {
                        val = (idx + 1).toString().padStart(2, '0');
                      }
                      const isRemarks = fieldKey === 'remarks';
                      const isItemNo = fieldKey === 'itemNo';
                      const isSize = fieldKey === 'size';
                      let cellStyle = '';
                      if (isItemNo) cellStyle = 'font-weight: bold; width: 4%;';
                      else if (isSize) cellStyle = 'font-weight: bold; background: #fafafa;';
                      else if (isRemarks) cellStyle = 'font-weight: bold; color: #047857;';
                      return `<td style="${cellStyle}">${val}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <!-- Footer Signatures & Stamp -->
        ${renderFooterHtml(sh)}
      </div>
    `;

    renderedSheetsHtml.push(page1Html);

    // Optional Page 2 (Chemical & Mechanical Specs)
    if (sh.includeMtcPage) {
      const page2Number = globalCurrentPage;
      globalCurrentPage++;

      const chemHeaders = sh.chemicalHeaders || [];
      const chemMin = sh.chemicalMin || [];
      const chemMax = sh.chemicalMax || [];
      const chemObserved = sh.chemicalObserved || [];

      const chemHeadersHtml = chemHeaders.map(h => `<th style="border: 1px solid #000; padding: 4px 2px; font-size: 8pt; text-align: center; background: #ffffff;">${h}</th>`).join('');
      const chemMinHtml = chemMin.map(v => `<td style="border: 1px solid #000; padding: 4px 2px; font-size: 7.5pt; text-align: center;">${v || '—'}</td>`).join('');
      const chemMaxHtml = chemMax.map(v => `<td style="border: 1px solid #000; padding: 4px 2px; font-size: 7.5pt; text-align: center;">${v || '—'}</td>`).join('');
      const chemObsHtml = chemObserved.map(v => `<td style="border: 1px solid #000; padding: 4px 2px; font-size: 7.5pt; text-align: center; font-weight: bold;">${v || '—'}</td>`).join('');

      const mechHeadersAll = sh.mechanicalHeaders || [];
      const mechMinAll = sh.mechanicalMin || [];
      const mechMaxAll = sh.mechanicalMax || [];
      const mechSelected = sh.mechanicalSelectedColumns && sh.mechanicalSelectedColumns.length === mechHeadersAll.length
        ? sh.mechanicalSelectedColumns
        : mechHeadersAll.map(() => true);

      const activeMechIndices = mechHeadersAll
        .map((_, i) => i)
        .filter(i => mechSelected[i] !== false);

      const activeIndicesToUse = activeMechIndices.length > 0 ? activeMechIndices : mechHeadersAll.map((_, i) => i);

      const mechHeadersHtml = activeIndicesToUse.map(i => `<th style="border: 1px solid #000; padding: 3px 2px; font-size: 6.5pt; text-align: center; background: #ffffff; line-height: 1.1;">${mechHeadersAll[i] || ''}</th>`).join('');
      const mechMinHtml = activeIndicesToUse.map(i => `<td style="border: 1px solid #000; padding: 3px 2px; font-size: 6.5pt; text-align: center;">${mechMinAll[i] || '—'}</td>`).join('');
      const mechMaxHtml = activeIndicesToUse.map(i => `<td style="border: 1px solid #000; padding: 3px 2px; font-size: 6.5pt; text-align: center;">${mechMaxAll[i] || '—'}</td>`).join('');

      const page2Html = `
        <div class="page-sheet ${globalCurrentPage <= totalPages ? 'page-break' : ''}">
          <div class="sheet-main-content">
            <!-- Page 2 Header -->
            ${renderHeaderTable(page2Number, sh.page2Title || 'DATA SHEET')}

            <!-- Page 2 Meta -->
            ${renderMetaTable(sh)}

            <!-- Chemical Analysis Section -->
            <div style="font-size: 8.5pt; font-weight: bold; margin: 6px 0 3px 0;">*CHEMICAL ANALYSIS</div>
            <div style="font-size: 7.5pt; font-weight: bold; color: #475569; margin-bottom: 2px;">SPECIFICATION: ${sh.chemicalSpecName || 'CARBON STEEL CLASS 8 / 10'}</div>
            <table style="width: 100%; border-collapse: collapse; border: 1.2px solid #000; margin-bottom: 8px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #000; padding: 3.5px 4px; font-size: 8pt; width: 14%; text-align: left; background: #ffffff;">SPEC</th>
                  ${chemHeadersHtml}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 3.5px 4px; font-size: 7.5pt; font-weight: bold;">MIN</td>
                  ${chemMinHtml}
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 3.5px 4px; font-size: 7.5pt; font-weight: bold;">MAX</td>
                  ${chemMaxHtml}
                </tr>
              </tbody>
            </table>

            <!-- Mechanical Properties Section -->
            <div style="font-size: 8.5pt; font-weight: bold; margin: 8px 0 3px 0;">*MECHANICAL PROPERTIES</div>
            <div style="font-size: 7.5pt; font-weight: bold; color: #475569; margin-bottom: 2px;">SPECIFICATION: ${sh.mechanicalSpecName || 'DIN 267-4 CLASS 8'}</div>
            <table style="width: 100%; border-collapse: collapse; border: 1.2px solid #000; margin-bottom: 12px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #000; padding: 3px 2px; font-size: 6.8pt; width: 8%; text-align: left; background: #ffffff;">SPEC</th>
                  ${mechHeadersHtml}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 3px 2px; font-size: 6.8pt; font-weight: bold;">MIN</td>
                  ${mechMinHtml}
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 3px 2px; font-size: 6.8pt; font-weight: bold;">MAX</td>
                  ${mechMaxHtml}
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Page 2 Footer Signatures & Stamp -->
          ${renderFooterHtml(sh)}
        </div>
      `;

      renderedSheetsHtml.push(page2Html);
    }
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${record.dataSheetNo || 'TECHNICAL DATA SHEET'} - ${record.customer || 'MFI'}</title>
  <style>
    @page {
      size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
      margin: 0;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #000000;
      font-size: 8pt;
      line-height: 1.2;
    }
    .data-sheet-print-container {
      width: 100%;
      margin: 0 auto;
      background: #ffffff;
    }
    .page-sheet {
      width: ${isLandscape ? '297mm' : '210mm'};
      min-height: ${isLandscape ? '210mm' : '297mm'};
      height: ${isLandscape ? '210mm' : '297mm'};
      margin: 0 auto;
      padding: ${isLandscape ? '8mm 10mm' : '9mm 10mm'};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: #ffffff;
      page-break-inside: avoid;
      overflow: hidden;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .sheet-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2px solid #000000;
      padding-bottom: 4px;
      margin-bottom: 5px;
    }
    .logo-container {
      display: flex;
      align-items: center;
    }
    .company-title {
      font-size: 11pt;
      font-weight: 900;
      font-family: 'Arial Black', Arial, sans-serif;
      letter-spacing: -0.2px;
      line-height: 1.1;
      color: #000000;
    }
    .company-sub {
      font-size: 7pt;
      font-weight: bold;
      color: #000000;
      margin-top: 1px;
    }
    .company-addr {
      font-size: 6.5pt;
      color: #111111;
      margin-top: 1px;
    }
    .company-contact {
      font-size: 6.5pt;
      color: #111111;
      font-weight: 600;
      margin-top: 0.5px;
    }
    .doc-type-title {
      font-size: 12pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      color: #000000;
      font-family: 'Arial Black', Arial, sans-serif;
    }
    .page-indicator {
      font-size: 7.5pt;
      font-weight: bold;
      margin-top: 3px;
    }
    .page-box {
      border: 1px solid #000000;
      padding: 1px 4px;
      font-size: 7.5pt;
      display: inline-block;
      margin-left: 2px;
      font-weight: bold;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000000;
      margin-bottom: 4px;
    }
    .meta-table td {
      border: 1px solid #000000;
      padding: 3px 5px;
      font-size: 8pt;
    }
    .section-box {
      border: 1.5px solid #000000;
      margin-bottom: 5px;
    }
    .section-header {
      font-size: 8pt;
      font-weight: bold;
      padding: 2px 5px;
      border-bottom: 1px solid #000000;
      background: #f8fafc;
      letter-spacing: 0.5px;
    }
    .section-content {
      padding: 3px 5px;
      font-size: 7.5pt;
      line-height: 1.25;
    }
    .drawings-grid {
      display: flex;
      gap: 6px;
      margin-bottom: 5px;
      width: 100%;
    }
    .drawing-col {
      flex: 1;
      min-width: 0;
    }
    .drawing-box {
      border: 1.5px solid #000000;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .drawing-box-header {
      border-bottom: 1px solid #000000;
      padding: 2px 5px;
      font-size: 7.5pt;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }
    .drawing-inner {
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      background: #ffffff;
    }
    .drawing-caption {
      border-top: 1px solid #000000;
      padding: 2px 4px;
      font-size: 7pt;
      text-align: center;
      font-weight: bold;
      background: #f8fafc;
    }
    .dim-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000000;
      margin-top: 2px;
      margin-bottom: 4px;
    }
    .dim-table th {
      border: 1px solid #000000;
      background: #f1f5f9;
      padding: 3px 4px;
      font-size: 7.5pt;
      font-weight: bold;
      text-align: left;
    }
    .dim-table td {
      border: 1px solid #000000;
      padding: 2.5px 4px;
      font-size: 7.5pt;
    }
    .multi-size-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000000;
      margin-top: 2px;
      margin-bottom: 4px;
    }
    .multi-size-table th {
      border: 1px solid #000000;
      background: #f1f5f9;
      padding: 3px 2px;
      font-size: 6.8pt;
      font-weight: 800;
      text-align: center;
      line-height: 1.1;
    }
    .multi-size-table td {
      border: 1px solid #000000;
      padding: 2.5px 2px;
      font-size: 7pt;
      text-align: center;
    }
    .footer-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: auto;
    }
    .footer-table td {
      vertical-align: bottom;
      padding: 2px;
    }
  </style>
</head>
<body class="data-sheet-print-container">
  ${renderedSheetsHtml.join('\n')}
</body>
</html>
  `;
};

export const printDataSheet = (record: DataSheetRecord): boolean => {
  const html = generateDataSheetPrintHtml(record);
  const title = `${record.dataSheetNo || 'DATA-SHEET'} - ${record.customer || 'MFI'}`;
  return printHtml(html, title);
};
