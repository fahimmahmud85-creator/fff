import { printHtml } from '../PrintHelper';
import { DrawingArchiveItem, ScheduleColumn, SubSheetItem, DynamicScheduleRow } from './drawingTypes';
import { getActiveCompany, isMarineFastenersCompany } from '../../utils/companyProfile';

export const DEFAULT_SCHEDULE_COLUMNS: ScheduleColumn[] = [
  { id: 'c-sl', key: 'sl', label: 'SL', width: '26px' },
  { id: 'c-mark', key: 'mark', label: 'MARK', width: '60px' },
  { id: 'c-dia', key: 'dia', label: 'DIA', width: '55px' },
  { id: 'c-pitch', key: 'pitch', label: 'PITCH', width: '50px' },
  { id: 'c-len', key: 'length', label: 'LENGTH', width: '65px' },
  { id: 'c-thrd', key: 'thread', label: 'THREAD', width: '60px' },
  { id: 'c-bend', key: 'bend', label: 'BEND', width: '55px' },
  { id: 'c-qty', key: 'qty', label: 'QTY', width: '45px' },
  { id: 'c-notes', key: 'notes', label: 'NOTES', width: 'auto' }
];

export const generateLandscapeDrawingHtml = (item: DrawingArchiveItem): string => {
  const isWorkOrder = item.sheetCategory === 'WORK_ORDER';

  // Determine all sub-sheets to render.
  // 1 UI Sheet = 1 Print/Preview Page (exact 1-to-1 WYSIWYG fidelity)
  const sourceSheets: SubSheetItem[] = (item.projectSheets && item.projectSheets.length > 0)
    ? item.projectSheets
    : [{
        id: 'main-sheet',
        sheetNo: item.sheetNo || '1 of 1',
        title: 'Main Layout',
        fastenerType: item.fastenerType || 'l_anchor',
        dimensionCalloutMode: item.dimensionCalloutMode || 'letters',
        dimensionSubtitle: item.dimensionSubtitle || 'DxLxCxT',
        uploadedImageUrl: item.uploadedImageUrl || '',
        diameter: item.diameter || 'M24',
        threadLength: item.threadLength || '120mm',
        overallLength: item.overallLength || '600mm',
        hookLength: item.hookLength || '100mm',
        quantity: item.quantity || 50,
        enableSizeTable: item.enableSizeTable !== false,
        sizeSchedule: item.sizeSchedule || [],
        scheduleColumns: item.scheduleColumns || DEFAULT_SCHEDULE_COLUMNS,
        annotationsText: item.annotationsText || [],
        annotationsLines: item.annotationsLines || [],
        annotationsIcons: item.annotationsIcons || [],
        annotationsBoxes: item.annotationsBoxes || []
      }];

  interface PrintablePageData {
    globalPageNumber: number;
    subSheetIndex: number;
    subSheetTotal: number;
    subSheetTitle: string;
    chunkIndex: number;
    chunkTotal: number;
    fastenerType: string;
    dimensionCalloutMode: string;
    dimensionSubtitle: string;
    uploadedImageUrl: string;
    diameter: string;
    threadLength: string;
    overallLength: string;
    hookLength: string;
    quantity: number;
    hasSizeTable: boolean;
    columns: ScheduleColumn[];
    rows: DynamicScheduleRow[];
    totalRows: number;
    annotationsText: any[];
    annotationsLines: any[];
    annotationsIcons: any[];
    annotationsBoxes: any[];
  }

  // Multi-page pagination: 10 rows per page!
  // If a sheet has > 10 rows, it automatically splits across pages.
  // On EACH AND EVERY PAGE (Page 1, Page 2, Page 3...), ALL COMPANY DETAILS, LOGO, JOB NAME,
  // CUSTOMER, SPECIFICATION NOTES, REVISIONS, SO/QUOTE, AND DRAWING ARE FULLY PRESERVED!
  const ROWS_PER_PAGE = 10;
  const allPrintPages: PrintablePageData[] = [];

  sourceSheets.forEach((sheet, sheetIdx) => {
    const columns = sheet.scheduleColumns && sheet.scheduleColumns.length > 0
      ? sheet.scheduleColumns
      : (item.scheduleColumns && item.scheduleColumns.length > 0 ? item.scheduleColumns : DEFAULT_SCHEDULE_COLUMNS);

    const sheetRows = sheet.sizeSchedule || [];
    const hasTable = sheet.enableSizeTable !== false && sheetRows.length > 0;

    if (!hasTable || sheetRows.length <= ROWS_PER_PAGE) {
      // Single page for this sheet (fits up to 10 rows)
      allPrintPages.push({
        globalPageNumber: 0,
        subSheetIndex: sheetIdx + 1,
        subSheetTotal: sourceSheets.length,
        subSheetTitle: sheet.title || `Sheet ${sheetIdx + 1}`,
        chunkIndex: 0,
        chunkTotal: 1,
        fastenerType: sheet.fastenerType || item.fastenerType || 'l_anchor',
        dimensionCalloutMode: sheet.dimensionCalloutMode || item.dimensionCalloutMode || 'letters',
        dimensionSubtitle: sheet.dimensionSubtitle || item.dimensionSubtitle || 'DxLxCxT',
        uploadedImageUrl: sheet.uploadedImageUrl || '',
        diameter: sheet.diameter || item.diameter || 'M24',
        threadLength: sheet.threadLength || item.threadLength || '120mm',
        overallLength: sheet.overallLength || item.overallLength || '600mm',
        hookLength: sheet.hookLength || item.hookLength || '100mm',
        quantity: sheet.quantity || item.quantity || 50,
        hasSizeTable: hasTable,
        columns,
        rows: sheetRows,
        totalRows: sheetRows.length,
        annotationsText: sheet.annotationsText || [],
        annotationsLines: sheet.annotationsLines || [],
        annotationsIcons: sheet.annotationsIcons || [],
        annotationsBoxes: sheet.annotationsBoxes || []
      });
    } else {
      // Sheet has more than 10 rows -> chunk into 10 rows per page
      const chunkCount = Math.ceil(sheetRows.length / ROWS_PER_PAGE);
      for (let c = 0; c < chunkCount; c++) {
        const rowSlice = sheetRows.slice(c * ROWS_PER_PAGE, (c + 1) * ROWS_PER_PAGE);
        allPrintPages.push({
          globalPageNumber: 0,
          subSheetIndex: sheetIdx + 1,
          subSheetTotal: sourceSheets.length,
          subSheetTitle: sheet.title || `Sheet ${sheetIdx + 1}`,
          chunkIndex: c,
          chunkTotal: chunkCount,
          fastenerType: sheet.fastenerType || item.fastenerType || 'l_anchor',
          dimensionCalloutMode: sheet.dimensionCalloutMode || item.dimensionCalloutMode || 'letters',
          dimensionSubtitle: sheet.dimensionSubtitle || item.dimensionSubtitle || 'DxLxCxT',
          uploadedImageUrl: sheet.uploadedImageUrl || '',
          diameter: sheet.diameter || item.diameter || 'M24',
          threadLength: sheet.threadLength || item.threadLength || '120mm',
          overallLength: sheet.overallLength || item.overallLength || '600mm',
          hookLength: sheet.hookLength || item.hookLength || '100mm',
          quantity: sheet.quantity || item.quantity || 50,
          hasSizeTable: true,
          columns,
          rows: rowSlice,
          totalRows: sheetRows.length,
          annotationsText: sheet.annotationsText || [],
          annotationsLines: sheet.annotationsLines || [],
          annotationsIcons: sheet.annotationsIcons || [],
          annotationsBoxes: sheet.annotationsBoxes || []
        });
      }
    }
  });

  // Assign 1-indexed global page numbers
  allPrintPages.forEach((p, idx) => {
    p.globalPageNumber = idx + 1;
  });

  const totalPages = allPrintPages.length;

  const revRows = (item.revisions && item.revisions.length > 0 ? item.revisions : [{ rev: '-', description: '', date: '', by: '' }]).map(r => `
    <tr style="border-bottom: 1px solid #000; height: 15px;">
      <td style="border-right: 1px solid #000; padding: 1px 3px; text-align: center; font-size: 7.5px; font-weight: bold;">${r.rev || '-'}</td>
      <td style="border-right: 1px solid #000; padding: 1px 3px; font-size: 7.5px;">${r.description || '&nbsp;'}</td>
      <td style="border-right: 1px solid #000; padding: 1px 3px; text-align: center; font-size: 7.5px;">${r.date || '&nbsp;'}</td>
      <td style="padding: 1px 3px; text-align: center; font-size: 7.5px;">${r.by || '&nbsp;'}</td>
    </tr>
  `).join('');

  const activeCompany = getActiveCompany();
  const isMfi = isMarineFastenersCompany(activeCompany);
  const isBmm = (activeCompany.code || '').toUpperCase() === 'BMM' || activeCompany.id === 'comp-bmm' || activeCompany.name.toUpperCase().includes('BOLT');
  const isUmi = (activeCompany.code || '').toUpperCase() === 'UMI' || activeCompany.id === 'comp-umi' || activeCompany.name.toUpperCase().includes('UNITED METAL');
  const companyLogoUrl = item.customLogoUrl || (activeCompany.logoUrl && activeCompany.logoUrl !== '/logo.png' ? activeCompany.logoUrl : '');

  // Company Logo
  const logoHtml = companyLogoUrl ? `
    <img src="${companyLogoUrl}" style="max-height: 38px; max-width: 86px; object-fit: contain;" />
  ` : (isMfi ? `
    <svg viewBox="0 0 92 48" style="width: 80px; height: 38px;">
      <line x1="2" y1="10" x2="20" y2="10" stroke="#000" stroke-width="1.5" />
      <line x1="0" y1="16" x2="16" y2="16" stroke="#000" stroke-width="1.5" />
      <line x1="3" y1="22" x2="18" y2="22" stroke="#000" stroke-width="1.5" />
      <line x1="1" y1="28" x2="14" y2="28" stroke="#000" stroke-width="1.5" />
      <line x1="4" y1="34" x2="17" y2="34" stroke="#000" stroke-width="1.5" />
      <path d="M 22,36 L 27,8 L 36,8 L 41,26 L 47,8 L 56,8 L 51,36 L 44,36 L 47,19 L 41,36 L 36,36 L 33,19 L 29,36 Z" fill="#000" />
      <path d="M 58,36 L 63,8 L 86,8 L 84,14 L 70,14 L 68,22 L 80,22 L 78,28 L 66,28 L 64,36 Z" fill="#000" />
      <text x="54" y="44" font-size="5" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-style="italic" letter-spacing="0.5" text-anchor="middle">MARINE FASTENERS</text>
    </svg>
  ` : isBmm ? `
    <svg viewBox="0 0 96 44" style="width: 82px; height: 38px;">
      <rect x="2" y="2" width="92" height="40" rx="3" fill="#0e2a47" stroke="#f59e0b" stroke-width="1.5" />
      <text x="48" y="22" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">BOLT MASTER</text>
      <line x1="10" y1="27" x2="86" y2="27" stroke="#f59e0b" stroke-width="1" />
      <text x="48" y="36" font-family="Arial, sans-serif" font-weight="bold" font-size="5.5" fill="#f59e0b" text-anchor="middle" letter-spacing="1">BUILDING MATERIALS</text>
    </svg>
  ` : isUmi ? `
    <svg viewBox="0 0 96 44" style="width: 82px; height: 38px;">
      <rect x="2" y="2" width="92" height="40" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="48" y="22" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="10.5" fill="#38bdf8" text-anchor="middle" letter-spacing="0.5">UNITED METAL</text>
      <line x1="10" y1="27" x2="86" y2="27" stroke="#94a3b8" stroke-width="1" />
      <text x="48" y="36" font-family="Arial, sans-serif" font-weight="bold" font-size="5.5" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">INDUSTRIES SPS-L.L.C</text>
    </svg>
  ` : `
    <div style="font-size: 10px; font-weight: 900; color: #fff; background: #000; padding: 4px 6px; border-radius: 3px; text-transform: uppercase; font-family: Arial, sans-serif; letter-spacing: -0.2px; text-align: center;">
      ${activeCompany.code || activeCompany.name.split(' ')[0]}
    </div>
  `);

  // Specification notes
  const defaultNoteRows = [
    { label: item.boltLabel || 'Bolt:', value: item.boltSpec || 'ASTM F1554 Grade 36 Hex', checked: item.boltChecked !== false },
    { label: item.nutLabel || 'Nut:', value: item.nutSpec || 'ASTM A563 Grade A Hex', checked: item.nutChecked !== false },
    { label: item.washerLabel || 'Washer:', value: item.washerSpec || 'ASTM F436 Hardened', checked: item.washerChecked !== false },
    { label: item.finishLabel || 'Finish:', value: item.finish || 'ASTM F2329 Hot-dip Galvanize', checked: item.finishChecked !== false }
  ];

  const noteRowsToRender = item.noteItems && item.noteItems.length > 0 
    ? item.noteItems.map(n => ({ ...n, checked: n.checked !== false })) 
    : defaultNoteRows;

  const notesTableHtml = noteRowsToRender.map(n => `
    <tr>
      <td style="width: 78px; font-weight: bold; padding: 1.5px 0; vertical-align: middle; font-size: 9.5px;">
        <span style="display: inline-block; width: 10px; height: 10px; border: 1.5px solid #000; margin-right: 4px; vertical-align: middle; text-align: center; line-height: 8px; font-size: 7.5px; font-weight: bold; background: ${n.checked ? '#000' : '#fff'}; color: ${n.checked ? '#fff' : 'transparent'};">✓</span>
        <span style="${!n.checked ? 'opacity: 0.4;' : ''}">${n.label}</span>
      </td>
      <td style="padding: 1.5px 0; font-size: 9.5px; font-weight: 500; ${!n.checked ? 'opacity: 0.4; text-decoration: line-through;' : ''}">${n.value}</td>
    </tr>
  `).join('');

  // Top header category banner title
  const categoryBannerTitle = isWorkOrder 
    ? 'DRAWING SHEET FOR WORK ORDER' 
    : 'DRAWING SHEET FOR APPROVAL';

  // Build each page HTML
  const renderedPagesHtml = allPrintPages.map((pageData) => {
    const isLetterMode = pageData.dimensionCalloutMode !== 'values';
    const labelD = isLetterMode ? 'D' : pageData.diameter;
    const labelT = isLetterMode ? 'T' : pageData.threadLength;
    const labelL = isLetterMode ? 'L' : pageData.overallLength;
    const labelC = isLetterMode ? 'C' : (pageData.hookLength || '100mm');

    // Sizing for table rows (up to 10 rows per page chunk)
    const rowCount = pageData.rows.length;
    const rowHeight = rowCount <= 10 ? '19px' : '16px';
    const tableFontSize = rowCount <= 10 ? '9.5px' : '9px';
    const tablePad = '2px 3px';    // Vector / Uploaded Graphic for this page (Generous large CAD sizing without compromising text size)
    let canvasGraphicHtml = '';
    if (pageData.uploadedImageUrl) {
      canvasGraphicHtml = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; padding: 6px; margin: 0 auto; text-align: center;">
          <img src="${pageData.uploadedImageUrl}" style="max-width: 95%; max-height: ${pageData.hasSizeTable ? '265px' : '465px'}; object-fit: contain; margin: 0 auto; display: block;" />
        </div>
      `;
    } else {
      if (pageData.fastenerType === 'l_anchor') {
        canvasGraphicHtml = `
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; margin: 0 auto; text-align: center;">
            <svg viewBox="0 0 400 410" style="width: 100%; height: 100%; max-height: ${pageData.hasSizeTable ? '265px' : '465px'}; object-fit: contain; overflow: visible; margin: 0 auto; display: block;">
              <!-- 1. Centerline Arrow Pointing Up -->
              <line x1="170" y1="75" x2="170" y2="30" stroke="#000" stroke-width="1.4" />
              <polygon points="170,22 165,36 175,36" fill="#000" />

              <!-- 2. Diameter Dimension D -->
              <line x1="160" y1="75" x2="160" y2="48" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="75" x2="180" y2="48" stroke="#000" stroke-width="1.2" />
              <line x1="135" y1="48" x2="160" y2="48" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="48" x2="205" y2="48" stroke="#000" stroke-width="1.2" />
              <polygon points="160,48 148,44 148,52" fill="#000" />
              <polygon points="180,48 192,44 192,52" fill="#000" />
              <text x="170" y="52" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">${labelD}</text>

              <!-- 3. Thread Section & Dimension T -->
              <line x1="180" y1="75" x2="225" y2="75" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="165" x2="225" y2="165" stroke="#000" stroke-width="1.2" />
              <line x1="208" y1="75" x2="208" y2="165" stroke="#000" stroke-width="1.2" />
              <polygon points="208,75 204,88 212,88" fill="#000" />
              <polygon points="208,165 204,152 212,152" fill="#000" />
              <text x="222" y="125" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="start">${labelT}</text>

              <!-- 4. Overall Length Dimension L -->
              <line x1="180" y1="75" x2="285" y2="75" stroke="#000" stroke-width="1.2" />
              <line x1="240" y1="330" x2="285" y2="330" stroke="#000" stroke-width="1.2" />
              <line x1="268" y1="75" x2="268" y2="330" stroke="#000" stroke-width="1.2" />
              <polygon points="268,75 264,90 272,90" fill="#000" />
              <polygon points="268,330 264,315 272,315" fill="#000" />
              <text x="282" y="210" font-size="15" font-family="Arial, sans-serif" font-weight="bold" text-anchor="start">${labelL}</text>

              <!-- 5. Hook Length Dimension C -->
              <line x1="180" y1="275" x2="240" y2="275" stroke="#000" stroke-width="1.2" />
              <polygon points="180,275 192,271 192,279" fill="#000" />
              <polygon points="240,275 228,271 228,279" fill="#000" />
              <text x="210" y="270" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">${labelC}</text>

              <!-- 6. L-Anchor Bolt Body Rendering -->
              <rect x="160" y="75" width="20" height="90" fill="#fff" stroke="#000" stroke-width="1.6" />
              ${Array.from({ length: 12 }).map((_, i) => `
                <line x1="160" y1="${81 + i * 7.5}" x2="180" y2="${78 + i * 7.5}" stroke="#000" stroke-width="1.1" />
                <line x1="160" y1="${78 + i * 7.5}" x2="180" y2="${81 + i * 7.5}" stroke="#000" stroke-width="0.8" />
              `).join('')}

              <path d="
                M 160,165 
                L 160,305 
                Q 160,330 185,330 
                L 240,330 
                L 240,310 
                L 185,310 
                Q 180,310 180,300 
                L 180,165 
                Z
              " fill="#fff" stroke="#000" stroke-width="1.6" />

              <text x="200" y="372" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">Dimensions</text>
              <text x="200" y="392" font-size="12" font-family="Arial, sans-serif" font-weight="bold" letter-spacing="1.5" text-anchor="middle">${pageData.dimensionSubtitle || 'DxLxTxC'}</text>
            </svg>
          </div>
        `;
      } else if (pageData.fastenerType === 'hex_anchor') {
        canvasGraphicHtml = `
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; margin: 0 auto; text-align: center;">
            <svg viewBox="0 0 380 410" style="width: 100%; height: 100%; max-height: ${pageData.hasSizeTable ? '265px' : '465px'}; object-fit: contain; overflow: visible; margin: 0 auto; display: block;">
              <!-- Centerline -->
              <line x1="170" y1="55" x2="170" y2="20" stroke="#000" stroke-width="1.4" />
              <polygon points="170,14 165,28 175,28" fill="#000" />

              <!-- Dimension D -->
              <line x1="160" y1="55" x2="160" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="55" x2="180" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="135" y1="35" x2="160" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="35" x2="205" y2="35" stroke="#000" stroke-width="1.2" />
              <polygon points="160,35 148,31 148,39" fill="#000" />
              <polygon points="180,35 192,31 192,39" fill="#000" />
              <text x="170" y="39" font-size="14" font-family="Arial" font-weight="bold" text-anchor="middle">${labelD}</text>

              <!-- Dimension T -->
              <line x1="180" y1="55" x2="225" y2="55" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="160" x2="225" y2="160" stroke="#000" stroke-width="1.2" />
              <line x1="208" y1="55" x2="208" y2="160" stroke="#000" stroke-width="1.2" />
              <polygon points="208,55 204,68 212,68" fill="#000" />
              <polygon points="208,160 204,147 212,147" fill="#000" />
              <text x="222" y="115" font-size="14" font-family="Arial" font-weight="bold">${labelT}</text>

              <!-- Dimension L -->
              <line x1="180" y1="55" x2="275" y2="55" stroke="#000" stroke-width="1.2" />
              <line x1="190" y1="350" x2="275" y2="350" stroke="#000" stroke-width="1.2" />
              <line x1="258" y1="55" x2="258" y2="350" stroke="#000" stroke-width="1.2" />
              <polygon points="258,55 254,70 262,70" fill="#000" />
              <polygon points="258,350 254,335 262,335" fill="#000" />
              <text x="272" y="210" font-size="15" font-family="Arial" font-weight="bold">${labelL}</text>

              <!-- Bolt Body & Thread -->
              <rect x="160" y="55" width="20" height="105" fill="#fff" stroke="#000" stroke-width="1.6" />
              ${Array.from({ length: 14 }).map((_, i) => `
                <line x1="160" y1="${61 + i * 7.5}" x2="180" y2="${58 + i * 7.5}" stroke="#000" stroke-width="1.1" />
              `).join('')}
              <rect x="160" y="160" width="20" height="170" fill="#fff" stroke="#000" stroke-width="1.6" />
              
              <!-- Bottom Hex Head -->
              <path d="M 146,330 L 194,330 L 190,350 L 150,350 Z" fill="#fff" stroke="#000" stroke-width="1.6" />
              <line x1="160" y1="330" x2="162" y2="350" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="330" x2="178" y2="350" stroke="#000" stroke-width="1.2" />

              <!-- Top Nut & Washer Assembly -->
              <rect x="148" y="75" width="44" height="25" rx="1" fill="#fff" stroke="#000" stroke-width="1.6" />
              <line x1="162" y1="75" x2="162" y2="100" stroke="#000" stroke-width="1.2" />
              <line x1="178" y1="75" x2="178" y2="100" stroke="#000" stroke-width="1.2" />
              <rect x="142" y="100" width="56" height="7" rx="0.5" fill="#fff" stroke="#000" stroke-width="1.6" />

              <text x="170" y="378" font-size="14" font-family="Arial" font-weight="bold" text-anchor="middle">Dimensions</text>
              <text x="170" y="398" font-size="12" font-family="Arial" font-weight="bold" letter-spacing="1.5" text-anchor="middle">DxLxT</text>
            </svg>
          </div>
        `;
      } else if (pageData.fastenerType === 'j_anchor') {
        canvasGraphicHtml = `
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; margin: 0 auto; text-align: center;">
            <svg viewBox="0 0 400 410" style="width: 100%; height: 100%; max-height: ${pageData.hasSizeTable ? '265px' : '465px'}; object-fit: contain; overflow: visible; margin: 0 auto; display: block;">
              <line x1="170" y1="75" x2="170" y2="30" stroke="#000" stroke-width="1.4" />
              <polygon points="170,22 165,36 175,36" fill="#000" />
              
              <!-- Dimension D -->
              <line x1="160" y1="75" x2="160" y2="48" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="75" x2="180" y2="48" stroke="#000" stroke-width="1.2" />
              <line x1="135" y1="48" x2="160" y2="48" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="48" x2="205" y2="48" stroke="#000" stroke-width="1.2" />
              <polygon points="160,48 148,44 148,52" fill="#000" />
              <polygon points="180,48 192,44 192,52" fill="#000" />
              <text x="170" y="52" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">${labelD}</text>

              <!-- Dimension T -->
              <line x1="180" y1="75" x2="225" y2="75" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="165" x2="225" y2="165" stroke="#000" stroke-width="1.2" />
              <line x1="208" y1="75" x2="208" y2="165" stroke="#000" stroke-width="1.2" />
              <polygon points="208,75 204,88 212,88" fill="#000" />
              <polygon points="208,165 204,152 212,152" fill="#000" />
              <text x="222" y="125" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="start">${labelT}</text>

              <!-- Dimension L -->
              <line x1="180" y1="75" x2="285" y2="75" stroke="#000" stroke-width="1.2" />
              <line x1="220" y1="340" x2="285" y2="340" stroke="#000" stroke-width="1.2" />
              <line x1="268" y1="75" x2="268" y2="340" stroke="#000" stroke-width="1.2" />
              <polygon points="268,75 264,90 272,90" fill="#000" />
              <polygon points="268,340 264,325 272,325" fill="#000" />
              <text x="282" y="210" font-size="15" font-family="Arial, sans-serif" font-weight="bold" text-anchor="start">${labelL}</text>

              <!-- J-Hook Dimension C -->
              <line x1="180" y1="280" x2="245" y2="280" stroke="#000" stroke-width="1.2" />
              <polygon points="180,280 192,276 192,284" fill="#000" />
              <polygon points="245,280 233,276 233,284" fill="#000" />
              <text x="212" y="275" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">${labelC}</text>

              <!-- J-Bolt Body -->
              <rect x="160" y="75" width="20" height="90" fill="#fff" stroke="#000" stroke-width="1.6" />
              ${Array.from({ length: 12 }).map((_, i) => `
                <line x1="160" y1="${81 + i * 7.5}" x2="180" y2="${78 + i * 7.5}" stroke="#000" stroke-width="1.1" />
              `).join('')}

              <path d="
                M 160,165 
                L 160,290 
                A 35 35 0 0 0 230,290 
                L 230,265 
                L 210,265 
                L 210,290 
                A 15 15 0 0 1 180,290 
                L 180,165 
                Z
              " fill="#fff" stroke="#000" stroke-width="1.6" />

              <text x="200" y="372" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle">Dimensions</text>
              <text x="200" y="392" font-size="12" font-family="Arial, sans-serif" font-weight="bold" letter-spacing="1.5" text-anchor="middle">${pageData.dimensionSubtitle || 'DxLxTxC'}</text>
            </svg>
          </div>
        `;
      } else if (pageData.fastenerType === 'plate_anchor') {
        canvasGraphicHtml = `
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; margin: 0 auto; text-align: center;">
            <svg viewBox="0 0 380 410" style="width: 100%; height: 100%; max-height: ${pageData.hasSizeTable ? '265px' : '465px'}; object-fit: contain; overflow: visible; margin: 0 auto; display: block;">
              <!-- Centerline -->
              <line x1="170" y1="55" x2="170" y2="20" stroke="#000" stroke-width="1.4" />
              <polygon points="170,14 165,28 175,28" fill="#000" />

              <!-- Dimension D -->
              <line x1="160" y1="55" x2="160" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="55" x2="180" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="135" y1="35" x2="160" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="35" x2="205" y2="35" stroke="#000" stroke-width="1.2" />
              <polygon points="160,35 148,31 148,39" fill="#000" />
              <polygon points="180,35 192,31 192,39" fill="#000" />
              <text x="170" y="39" font-size="14" font-family="Arial" font-weight="bold" text-anchor="middle">${labelD}</text>

              <!-- Dimension T -->
              <line x1="180" y1="55" x2="225" y2="55" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="160" x2="225" y2="160" stroke="#000" stroke-width="1.2" />
              <line x1="208" y1="55" x2="208" y2="160" stroke="#000" stroke-width="1.2" />
              <polygon points="208,55 204,68 212,68" fill="#000" />
              <polygon points="208,160 204,147 212,147" fill="#000" />
              <text x="222" y="115" font-size="14" font-family="Arial" font-weight="bold">${labelT}</text>

              <!-- Dimension L -->
              <line x1="180" y1="55" x2="275" y2="55" stroke="#000" stroke-width="1.2" />
              <line x1="190" y1="350" x2="275" y2="350" stroke="#000" stroke-width="1.2" />
              <line x1="258" y1="55" x2="258" y2="350" stroke="#000" stroke-width="1.2" />
              <polygon points="258,55 254,70 262,70" fill="#000" />
              <polygon points="258,350 254,335 262,335" fill="#000" />
              <text x="272" y="210" font-size="15" font-family="Arial" font-weight="bold">${labelL}</text>

              <!-- Bolt Rod Body -->
              <rect x="160" y="55" width="20" height="280" fill="#fff" stroke="#000" stroke-width="1.6" />
              ${Array.from({ length: 14 }).map((_, i) => `
                <line x1="160" y1="${61 + i * 7.5}" x2="180" y2="${58 + i * 7.5}" stroke="#000" stroke-width="1.1" />
              `).join('')}

              <!-- Bottom Anchor Plate -->
              <rect x="130" y="315" width="80" height="16" fill="#fff" stroke="#000" stroke-width="1.8" />
              <rect x="148" y="290" width="44" height="25" rx="1" fill="#fff" stroke="#000" stroke-width="1.6" />
              <rect x="148" y="331" width="44" height="20" rx="1" fill="#fff" stroke="#000" stroke-width="1.6" />

              <!-- Top Nut & Washer Assembly -->
              <rect x="148" y="75" width="44" height="25" rx="1" fill="#fff" stroke="#000" stroke-width="1.6" />
              <rect x="142" y="100" width="56" height="7" rx="0.5" fill="#fff" stroke="#000" stroke-width="1.6" />

              <text x="170" y="378" font-size="14" font-family="Arial" font-weight="bold" text-anchor="middle">Dimensions</text>
              <text x="170" y="398" font-size="12" font-family="Arial" font-weight="bold" letter-spacing="1.5" text-anchor="middle">DxLxT</text>
            </svg>
          </div>
        `;
      } else {
        // Continuous Stud / Straight Anchor Bolt
        canvasGraphicHtml = `
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; margin: 0 auto; text-align: center;">
            <svg viewBox="0 0 380 410" style="width: 100%; height: 100%; max-height: ${pageData.hasSizeTable ? '265px' : '465px'}; object-fit: contain; overflow: visible; margin: 0 auto; display: block;">
              <!-- Centerline -->
              <line x1="170" y1="55" x2="170" y2="20" stroke="#000" stroke-width="1.4" />
              <polygon points="170,14 165,28 175,28" fill="#000" />

              <!-- Dimension D -->
              <line x1="160" y1="55" x2="160" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="55" x2="180" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="135" y1="35" x2="160" y2="35" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="35" x2="205" y2="35" stroke="#000" stroke-width="1.2" />
              <polygon points="160,35 148,31 148,39" fill="#000" />
              <polygon points="180,35 192,31 192,39" fill="#000" />
              <text x="170" y="39" font-size="14" font-family="Arial" font-weight="bold" text-anchor="middle">${labelD}</text>

              <!-- Dimension T (Thread Length) -->
              <line x1="180" y1="55" x2="225" y2="55" stroke="#000" stroke-width="1.2" />
              <line x1="180" y1="160" x2="225" y2="160" stroke="#000" stroke-width="1.2" />
              <line x1="208" y1="55" x2="208" y2="160" stroke="#000" stroke-width="1.2" />
              <polygon points="208,55 204,68 212,68" fill="#000" />
              <polygon points="208,160 204,147 212,147" fill="#000" />
              <text x="222" y="115" font-size="14" font-family="Arial" font-weight="bold">${labelT}</text>

              <!-- Dimension L (Overall Length) -->
              <line x1="180" y1="55" x2="275" y2="55" stroke="#000" stroke-width="1.2" />
              <line x1="190" y1="340" x2="275" y2="340" stroke="#000" stroke-width="1.2" />
              <line x1="258" y1="55" x2="258" y2="340" stroke="#000" stroke-width="1.2" />
              <polygon points="258,55 254,70 262,70" fill="#000" />
              <polygon points="258,340 254,325 262,325" fill="#000" />
              <text x="272" y="205" font-size="15" font-family="Arial" font-weight="bold">${labelL}</text>

              <!-- Continuous Threaded Stud Body -->
              <rect x="160" y="55" width="20" height="285" fill="#fff" stroke="#000" stroke-width="1.6" />
              ${Array.from({ length: 35 }).map((_, i) => `
                <line x1="160" y1="${61 + i * 8}" x2="180" y2="${58 + i * 8}" stroke="#000" stroke-width="0.9" />
              `).join('')}

              <text x="170" y="375" font-size="14" font-family="Arial" font-weight="bold" text-anchor="middle">Dimensions</text>
              <text x="170" y="392" font-size="12" font-family="Arial" font-weight="bold" letter-spacing="1.5" text-anchor="middle">${pageData.dimensionSubtitle || 'DxL'}</text>
            </svg>
          </div>
        `;
      }
    }

    // Text Annotations
    const annotationsHtml = (pageData.annotationsText || []).map(a => {
      const bgStyle = a.bg === 'white' 
        ? '#ffffff' 
        : a.bg === 'yellow' 
          ? '#fef08a' 
          : a.bg === 'orange'
            ? '#ffedd5'
            : a.bg === 'blue'
              ? '#dbeafe'
              : 'transparent';
      const widthStyle = a.width ? `width: ${a.width}px;` : 'white-space: nowrap;';

      return `
        <div style="
          position: absolute;
          left: ${a.x}%;
          top: ${a.y}%;
          transform: translate(-50%, -50%);
          font-size: ${a.fontSize || 12}px;
          font-weight: ${a.bold ? 'bold' : 'normal'};
          background-color: ${bgStyle};
          border: ${a.border ? '1px solid #000' : 'none'};
          padding: 1.5px 5px;
          border-radius: 2px;
          ${widthStyle}
          text-align: center;
          pointer-events: none;
          z-index: 30;
          color: #000;
          box-sizing: border-box;
        ">
          ${a.text}
        </div>
      `;
    }).join('');

    // Icons
    const iconsHtml = (pageData.annotationsIcons || []).map(ic => {
      const sz = ic.size || 28;
      let iconSvg = '';
      if (ic.type === 'hex_nut') {
        iconSvg = `<polygon points="14,2 26,9 26,23 14,30 2,23 2,9" fill="#fff" stroke="${ic.color || '#000'}" stroke-width="1.8" /><circle cx="14" cy="16" r="6" fill="none" stroke="${ic.color || '#000'}" stroke-width="1.5" />`;
      } else if (ic.type === 'washer') {
        iconSvg = `<circle cx="14" cy="14" r="12" fill="#fff" stroke="${ic.color || '#000'}" stroke-width="1.8" /><circle cx="14" cy="14" r="5.5" fill="none" stroke="${ic.color || '#000'}" stroke-width="1.5" />`;
      } else if (ic.type === 'plate_washer') {
        iconSvg = `<rect x="2" y="2" width="24" height="24" fill="#fff" stroke="${ic.color || '#000'}" stroke-width="1.8" rx="1" /><circle cx="14" cy="14" r="6" fill="none" stroke="${ic.color || '#000'}" stroke-width="1.5" />`;
      } else if (ic.type === 'weld_symbol') {
        iconSvg = `<line x1="2" y1="20" x2="26" y2="20" stroke="${ic.color || '#000'}" stroke-width="2" /><polygon points="6,20 18,20 18,8" fill="#fff" stroke="${ic.color || '#000'}" stroke-width="1.5" />`;
      } else if (ic.type === 'centerline') {
        iconSvg = `<text x="14" y="22" font-size="20" font-family="Arial" font-weight="bold" fill="${ic.color || '#000'}" text-anchor="middle">℄</text>`;
      } else if (ic.type === 'north_arrow') {
        iconSvg = `<circle cx="14" cy="14" r="12" fill="#fff" stroke="${ic.color || '#000'}" stroke-width="1.5" /><polygon points="14,4 18,14 14,12 10,14" fill="${ic.color || '#000'}" /><text x="14" y="24" font-size="7" font-weight="bold" text-anchor="middle" fill="${ic.color || '#000'}">N</text>`;
      } else if (ic.type === 'rev_triangle') {
        iconSvg = `<polygon points="14,3 26,25 2,25" fill="#fff" stroke="${ic.color || '#000'}" stroke-width="1.8" /><text x="14" y="22" font-size="10" font-weight="bold" text-anchor="middle" fill="${ic.color || '#000'}">${ic.label || '1'}</text>`;
      } else if (ic.type === 'qc_stamp') {
        iconSvg = `<rect x="2" y="2" width="24" height="24" fill="#fff" stroke="#16a34a" stroke-width="2" rx="2" /><text x="14" y="13" font-size="7" font-weight="bold" fill="#16a34a" text-anchor="middle">QC</text><text x="14" y="21" font-size="6" font-weight="bold" fill="#16a34a" text-anchor="middle">PASS</text>`;
      } else if (ic.type === 'warning') {
        iconSvg = `<polygon points="14,3 26,25 2,25" fill="#fff" stroke="#ea580c" stroke-width="2" /><text x="14" y="22" font-size="14" font-weight="bold" fill="#ea580c" text-anchor="middle">!</text>`;
      } else {
        iconSvg = `<circle cx="14" cy="14" r="11" fill="#fff" stroke="${ic.color || '#000'}" stroke-width="1.8" /><text x="14" y="18" font-size="11" font-weight="bold" text-anchor="middle" fill="${ic.color || '#000'}">${ic.label || 'A'}</text>`;
      }

      return `
        <div style="
          position: absolute;
          left: ${ic.x}%;
          top: ${ic.y}%;
          transform: translate(-50%, -50%);
          width: ${sz}px;
          height: ${sz}px;
          pointer-events: none;
          z-index: 25;
        ">
          <svg viewBox="0 0 28 28" style="width: 100%; height: 100%;">
            ${iconSvg}
          </svg>
        </div>
      `;
    }).join('');

    // Lines & Arrows
    const linesHtml = (pageData.annotationsLines || []).map(l => {
      const x1 = l.x1 * 10;
      const y1 = l.y1 * 6;
      const x2 = l.x2 * 10;
      const y2 = l.y2 * 6;
      const color = l.color || '#000000';

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy;
      const py = ux;
      const headLen = 10;
      const headWidth = 4.5;

      let startHead = '';
      let endHead = '';

      if (l.arrowType === 'inward') {
        const off = 14;
        const ax1 = x1 - ux * off;
        const ay1 = y1 - uy * off;
        const ax2 = x2 + ux * off;
        const ay2 = y2 + uy * off;
        startHead = `
          <line x1="${ax1.toFixed(1)}" y1="${ay1.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${color}" stroke-width="1.6" />
          <polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${(x1 - ux * 8 + px * 4).toFixed(1)},${(y1 - uy * 8 + py * 4).toFixed(1)} ${(x1 - ux * 8 - px * 4).toFixed(1)},${(y1 - uy * 8 - py * 4).toFixed(1)}" fill="${color}" />
        `;
        endHead = `
          <line x1="${ax2.toFixed(1)}" y1="${ay2.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.6" />
          <polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${(x2 + ux * 8 + px * 4).toFixed(1)},${(y2 + uy * 8 + py * 4).toFixed(1)} ${(x2 + ux * 8 - px * 4).toFixed(1)},${(y2 + uy * 8 - py * 4).toFixed(1)}" fill="${color}" />
        `;
      } else {
        if (l.arrowType === 'both' || l.arrowType === 'end') {
          const bx = x2 - ux * headLen;
          const by = y2 - uy * headLen;
          const c1x = bx + px * headWidth;
          const c1y = by + py * headWidth;
          const c2x = bx - px * headWidth;
          const c2y = by - py * headWidth;
          endHead = `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)}" fill="${color}" />`;
        }

        if (l.arrowType === 'both' || l.arrowType === 'start') {
          const bx = x1 + ux * headLen;
          const by = y1 + uy * headLen;
          const c1x = bx + px * headWidth;
          const c1y = by + py * headWidth;
          const c2x = bx - px * headWidth;
          const c2y = by - py * headWidth;
          startHead = `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)}" fill="${color}" />`;
        }
      }

      return `
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible;">
          <line 
            x1="${x1.toFixed(1)}" 
            y1="${y1.toFixed(1)}" 
            x2="${x2.toFixed(1)}" 
            y2="${y2.toFixed(1)}" 
            stroke="${color}" 
            stroke-width="1.8" 
          />
          ${startHead}
          ${endHead}
          ${l.label ? `
            <g transform="translate(${((x1 + x2) / 2).toFixed(1)}, ${((y1 + y2) / 2).toFixed(1)})">
              <rect x="-32" y="-10" width="64" height="20" fill="#ffffff" stroke="${color}" stroke-width="1" rx="3" />
              <text x="0" y="4" font-size="12" font-family="Arial" font-weight="bold" fill="${color}" text-anchor="middle">${l.label}</text>
            </g>
          ` : ''}
        </svg>
      `;
    }).join('');

    // Shape Boxes
    const boxesHtml = (pageData.annotationsBoxes || []).map(b => `
      <div style="
        position: absolute;
        left: ${b.x}%;
        top: ${b.y}%;
        width: ${b.width || 100}px;
        height: ${b.height || 70}px;
        border: ${b.borderWidth || 2}px ${b.borderStyle || 'solid'} ${b.borderColor || '#000000'};
        background-color: ${b.bgColor || 'transparent'};
        transform: translate(-50%, -50%);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 15;
      ">
        ${b.label && b.label.trim() ? `
          <span style="
            font-size: 9px;
            font-weight: bold;
            color: ${b.labelColor || b.borderColor || '#000000'};
            background: ${b.bgColor === 'transparent' || !b.bgColor ? 'rgba(255,255,255,0.85)' : 'transparent'};
            padding: 1px 4px;
            border-radius: 2px;
          ">${b.label}</span>
        ` : ''}
      </div>
    `).join('');

    // Dimensions Table HTML (Docked firmly at the bottom of the left column)
    const pageTableHtml = pageData.hasSizeTable ? `
      <div style="border-top: 2px solid #000; background: #fff; width: 100%; flex-shrink: 0; display: flex; flex-direction: column;">
        <div style="background: #000; color: #fff; font-size: 9.5px; font-weight: bold; padding: 2.5px 8px; text-transform: uppercase; letter-spacing: 0.6px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>DIMENSIONS</span>
            ${pageData.chunkTotal > 1 ? `
              <span style="font-size: 8px; background: #1e3a8a; color: #93c5fd; border: 1px solid #3b82f6; padding: 0.5px 6px; border-radius: 3px; font-weight: bold; letter-spacing: 0.3px;">
                ROWS ${(pageData.chunkIndex * 10) + 1}–${Math.min((pageData.chunkIndex + 1) * 10, pageData.totalRows)} OF ${pageData.totalRows} (PAGE ${pageData.chunkIndex + 1} OF ${pageData.chunkTotal})
              </span>
            ` : `
              <span style="font-size: 8px; background: #334155; padding: 0.5px 5px; border-radius: 2px; letter-spacing: 0.3px;">${pageData.rows.length} SIZES</span>
            `}
          </div>
          <span style="font-size: 8px; opacity: 0.9; letter-spacing: 0.3px;">${pageData.columns.length} COLUMNS</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: ${tableFontSize}; text-align: center;">
          <thead>
            <tr style="background: #ffffff; border-bottom: 1.5px solid #000; font-weight: bold; height: 18px;">
              ${pageData.columns.map((col, idx) => `
                <th style="${idx < pageData.columns.length - 1 ? 'border-right: 1px solid #000;' : ''} padding: 2px 2px; font-size: ${tableFontSize}; ${col.width && col.width !== 'auto' ? `width: ${col.width};` : ''}">
                  ${col.label || col.key.toUpperCase()}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${pageData.rows.map((row) => `
              <tr style="border-bottom: 1px solid #000; height: ${rowHeight}; background: #fff;">
                ${pageData.columns.map((col, idx) => {
                  const val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '';
                  const isBold = col.key === 'sl' || col.key === 'mark' || col.key === 'dia' || col.key === 'qty';
                  const isLeft = col.key === 'notes' || col.key === 'remarks';
                  return `
                    <td style="${idx < pageData.columns.length - 1 ? 'border-right: 1px solid #000;' : ''} padding: ${tablePad}; font-size: ${tableFontSize}; ${isBold ? 'font-weight: bold;' : ''} ${isLeft ? 'text-align: left; padding-left: 4px;' : 'text-align: center;'}">
                      ${val !== '' ? val : '&nbsp;'}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const pageSheetText = totalPages > 1 
      ? `${pageData.globalPageNumber} of ${totalPages}` 
      : (item.sheetNo || '1 of 1');

    return `
      <div class="print-page-wrapper">
        <div class="blueprint-sheet">
          
          <!-- Top Header Banner Inside Blueprint Frame -->
          <div style="background: #000; color: #fff; text-align: center; font-size: 10.5px; font-weight: bold; padding: 3.5px 12px; letter-spacing: 0.8px; text-transform: uppercase; border-bottom: 2.5px solid #000; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
            <span>${categoryBannerTitle}</span>
            <span style="font-family: monospace; font-size: 10.5px; opacity: 0.95; letter-spacing: 0.5px;">${item.drawingNo || 'DWG-MFI-2026-101'}</span>
          </div>

          <!-- Main Body: Left Drawing Area + Right Title Block (Exact UI Structure) -->
          <div style="width: 100%; display: flex; flex-direction: row; flex: 1; min-height: 0;">
            
            <!-- 1. LEFT DRAWING CANVAS & DIMENSIONS SCHEDULE (64% width) -->
            <div style="width: 64%; border-right: 2.5px solid #000; display: flex; flex-direction: column; justify-content: space-between; position: relative; min-height: 0; background: #fff;">
              
              <!-- Drawing Graphic Box with Annotations (Spans entire top space) -->
              <div style="flex: 1; min-height: ${pageData.hasSizeTable ? '250px' : '440px'}; max-height: ${pageData.hasSizeTable ? '275px' : '470px'}; position: relative; padding: 4px 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #fff;">
                ${canvasGraphicHtml}
                ${linesHtml}
                ${iconsHtml}
                ${annotationsHtml}
                ${boxesHtml}
              </div>

              <!-- Dimensions Schedule Table (Docked down at bottom) -->
              ${pageTableHtml}

              <!-- Bottom Left Quantity (only if size table is disabled) -->
              ${!pageData.hasSizeTable ? `
                <div style="padding: 6px 12px; border-top: 2px solid #000; background: #fff; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                  <h2 style="margin: 0; font-size: 13px; font-weight: bold; font-family: Arial, sans-serif;">
                    Total Quantity: ${pageData.quantity} PCS
                  </h2>
                  ${isWorkOrder ? `<span style="font-size: 9px; font-weight: bold; border: 1.5px solid #000; padding: 1.5px 8px; background: #fff;">PRIORITY: ${item.priority || 'NORMAL'}</span>` : ''}
                </div>
              ` : ''}

            </div>

            <!-- 2. RIGHT SPECIFICATION & TITLE BLOCK PANEL (36% width - ANCHORED DOWN TITLE BLOCK) -->
            <div style="width: 36%; display: flex; flex-direction: column; justify-content: space-between; font-size: 9px; line-height: 1.25; min-height: 0; background: #fff;">
              
              <!-- A. SPECIFICATION NOTES (TOP RIGHT) -->
              <div style="padding: 5px 8px; border-bottom: 2px solid #000; flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: flex-start; overflow: hidden; background: #fff;">
                <div style="text-align: left; font-weight: bold; font-size: 10px; text-decoration: underline; margin-bottom: 3px; letter-spacing: 0.4px;">
                  ${isWorkOrder ? 'FABRICATION & SPECIFICATION NOTES' : 'SPECIFICATION NOTES'}
                </div>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 3px;">
                  ${notesTableHtml}
                </table>

                <div style="font-size: 8.5px; line-height: 1.3; margin-top: 3px; border-top: 1px dashed #aaa; padding-top: 2.5px;">
                  <strong>Note:</strong> ${item.assemblyNote || 'Hardware is not provided assembled'}
                  ${item.additionalNotes ? `<div style="margin-top: 1.5px; color: #222; font-style: italic;">${item.additionalNotes}</div>` : ''}
                </div>
              </div>

              <!-- TITLE BLOCK DOCKED AT BOTTOM -->
              <div style="margin-top: auto; display: flex; flex-direction: column; flex-shrink: 0; background: #fff;">
                <!-- B. APPROVAL SIGNATURE / WORK ORDER ROUTING BLOCK -->
                ${isWorkOrder ? `
                  <div style="padding: 3px 8px; border-bottom: 2px solid #000; background: #fefce8; flex-shrink: 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="font-size: 9px; font-weight: bold;">Work Order #:</span>
                      <span style="font-family: monospace; font-weight: bold; font-size: 9.5px;">${item.workOrderNo || item.salesOrderNo || 'WO-10492'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <span style="font-size: 8.5px;">Machine / Line:</span>
                      <span style="font-weight: bold; font-size: 9px;">${item.machineNo || 'CNC Threader #2'}</span>
                    </div>
                    <div style="display: flex; align-items: center; margin-top: 1.5px;">
                      <span style="font-size: 8.5px; width: 80px;">QC Checked By:</span>
                      <span style="flex: 1; border-bottom: 1.2px solid #000; text-align: center; font-weight: bold; font-size: 9.5px; height: 14px;">
                        ${item.qcCheckedBy || item.approvedBy || '&nbsp;'}
                      </span>
                    </div>
                  </div>
                ` : `
                  <div style="padding: 3px 8px; border-bottom: 2px solid #000; flex-shrink: 0; background: #fff;">
                    <div style="margin-bottom: 2px; display: flex; align-items: center;">
                      <span style="font-size: 9px; width: 82px; font-weight: bold; color: #222;">Approved By</span>
                      <span style="flex: 1; border-bottom: 1.2px solid #000; text-align: center; font-weight: bold; font-size: 9.5px; height: 14px;">
                        ${item.approvedBy || 'Lead Consultant Eng.'}
                      </span>
                    </div>
                    <div style="display: flex; align-items: center;">
                      <span style="font-size: 9px; width: 82px; font-weight: bold; color: #222;">Date</span>
                      <span style="flex: 1; text-align: center; font-weight: bold; font-size: 9.5px; border-bottom: 1.2px solid #000; height: 14px;">
                        ${item.approvalDate || item.date || '10/11/2026'}
                      </span>
                    </div>
                  </div>
                `}

                <!-- C. COMPANY BRANDING & LOGO HEADER BLOCK -->
                <div style="padding: 4px 8px; border-bottom: 2px solid #000; background: #fff; display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                  <div style="flex-shrink: 0;">
                    ${logoHtml}
                  </div>
                  <div style="font-size: 8.5px; line-height: 1.2; flex: 1;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: -0.1px; line-height: 1.15; margin-bottom: 1px;">
                      ${item.companyName || activeCompany.name}
                    </div>
                    <div>${item.companyAddress || (activeCompany.address || 'Industrial Area, Ajman, UAE').replace(/\n/g, ', ')}</div>
                    <div>${item.companyPhone || ('P: ' + (activeCompany.phone || '+971 6 525 0526'))}</div>
                    <div style="font-weight: bold; color: #000;">${item.companyWeb || activeCompany.website || 'www.marinefasteners.co'}</div>
                  </div>
                </div>

                <!-- D. JOB NAME & CUSTOMER -->
                <div style="border-bottom: 2px solid #000; flex-shrink: 0; background: #fff;">
                  <div style="padding: 2.5px 8px; border-bottom: 1px solid #000; font-size: 9px; display: flex; align-items: center;">
                    <span style="font-weight: bold; width: 72px; flex-shrink: 0;">Job Name:</span>
                    <span style="font-weight: bold; font-size: 10px; text-transform: uppercase;">${item.jobName}</span>
                  </div>
                  <div style="padding: 2.5px 8px; font-size: 9px; display: flex; align-items: center;">
                    <span style="font-weight: bold; width: 72px; flex-shrink: 0;">Customer:</span>
                    <span style="font-weight: bold; font-size: 10px; text-transform: uppercase;">${item.customer}</span>
                  </div>
                </div>

                <!-- E. REVISIONS TABLE -->
                <div style="border-bottom: 2px solid #000; flex-shrink: 0; background: #fff;">
                  <div style="background: #fff; text-align: center; font-weight: bold; font-size: 8px; border-bottom: 1px solid #000; padding: 1px 0;">
                    Revisions
                  </div>
                  <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
                    <thead>
                      <tr style="border-bottom: 1px solid #000; background: #fff;">
                        <th style="width: 12%; border-right: 1px solid #000; padding: 1px 2px; font-weight: bold;">Rev</th>
                        <th style="width: 50%; border-right: 1px solid #000; padding: 1px 2px; font-weight: bold;">Description</th>
                        <th style="width: 23%; border-right: 1px solid #000; padding: 1px 2px; font-weight: bold;">Date</th>
                        <th style="width: 15%; padding: 1px 2px; font-weight: bold;">By</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${revRows}
                    </tbody>
                  </table>
                </div>

                <!-- F. SALES ORDER & QUOTE NUMBER -->
                <div style="border-bottom: 2px solid #000; display: flex; font-size: 8px; flex-shrink: 0; background: #fff;">
                  <div style="width: 50%; border-right: 1.5px solid #000; padding: 2px 6px;">
                    <div style="font-size: 7px; color: #444; font-weight: 500;">Sales Order Number</div>
                    <div style="font-weight: bold; font-family: monospace; font-size: 9.5px;">${item.salesOrderNo || '-'}</div>
                  </div>
                  <div style="width: 50%; padding: 2px 6px;">
                    <div style="font-size: 7px; color: #444; font-weight: 500;">Quote Number</div>
                    <div style="font-weight: bold; font-family: monospace; font-size: 9.5px;">${item.quoteNo || '-'}</div>
                  </div>
                </div>

                <!-- G. SHEET, DATE, BY FOOTER -->
                <div style="display: flex; font-size: 8px; flex-shrink: 0; background: #fff; height: 26px; align-items: stretch;">
                  <div style="width: 33.3%; border-right: 1.5px solid #000; padding: 2px 4px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 7px; color: #444; font-weight: 500;">Sheet</div>
                    <div style="font-weight: bold; font-size: 9.5px;">${pageSheetText}</div>
                  </div>
                  <div style="width: 33.3%; border-right: 1.5px solid #000; padding: 2px 4px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 7px; color: #444; font-weight: 500;">Date</div>
                    <div style="font-weight: bold; font-size: 9.5px;">${item.date}</div>
                  </div>
                  <div style="width: 33.3%; padding: 2px 4px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 7px; color: #444; font-weight: 500;">By</div>
                    <div style="font-weight: bold; font-size: 9.5px;">${item.drawnBy}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${item.drawingNo || (isWorkOrder ? 'WORK-ORDER-DRAWING' : 'APPROVAL-DRAWING')}</title>
      <style>
        * { 
          box-sizing: border-box; 
          margin: 0;
          padding: 0;
        }
        @page {
          size: A4 landscape;
          margin: 6mm 8mm 6mm 8mm !important;
        }
        @media print {
          html, body { 
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }
          .print-page-wrapper {
            width: 100% !important;
            height: 194mm !important;
            max-height: 194mm !important;
            padding: 0 !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            page-break-before: auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            overflow: hidden !important;
            background: #fff !important;
          }
          .print-page-wrapper:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .blueprint-sheet {
            width: 100% !important;
            height: 192mm !important;
            max-height: 192mm !important;
            border: 2.5px solid #000 !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
            background: #fff !important;
          }
        }
        @media screen {
          body {
            background: #cbd5e1;
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }
          .print-page-wrapper {
            width: 100%;
            max-width: 1020px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 20px 24px;
            box-sizing: border-box;
            border-radius: 4px;
          }
          .blueprint-sheet {
            width: 100%;
            height: 590px;
            border: 2.5px solid #000;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #fff;
          }
        }
        html, body { 
          font-family: Arial, Helvetica, sans-serif; 
          color: #000; 
          -webkit-font-smoothing: antialiased;
        }
      </style>
    </head>
    <body>
      ${renderedPagesHtml}
    </body>
    </html>
  `;

  return html;
};

export const printLandscapeDrawing = (item: DrawingArchiveItem): void => {
  const isWorkOrder = item.sheetCategory === 'WORK_ORDER';
  const html = generateLandscapeDrawingHtml(item);
  printHtml(html, `${item.drawingNo || (isWorkOrder ? 'WORK-ORDER-DRAWING' : 'APPROVAL-DRAWING')}-LANDSCAPE`);
};
