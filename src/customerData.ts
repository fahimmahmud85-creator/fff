export interface ContactPerson {
  id: string;
  name: string;
  code?: string; // e.g. "AK"
  designation: string;
  email: string;
  mobile: string;
  phone?: string;
}

export interface CustomerRecord {
  id: string;
  companyName: string;
  address: string;
  poBox: string;
  trn: string;
  phone: string;
  contactPerson: string;
  designation: string;
  email: string;
  mobile: string;
  faxNo?: string;
  concernPersons?: ContactPerson[];
  companyId?: string;
  assignedSeller?: string;
  seller?: string;
}

export interface QuotationRecord {
  id: string;
  rfqDate: string;
  rfqNumber: string;
  tenderNo?: string;
  tenderDate?: string;
  quotationRef: string;
  quotationDate: string;
  amount: number;
  client: string;
  inquiryBy: string;
  email: string;
  mobile: string;
  phone: string;
  steelOpen: boolean;
  closed: boolean;
  win: boolean;
  lost: boolean;
  notes: string;
  month?: string;
  seller?: string;
  companyId?: string;
}

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  // --- MARINE FASTENERS INDUSTRIES CUSTOMERS (comp-mfi) ---
  {
    id: 'cust-1',
    companyName: 'Super Engineering Industry L.L.C',
    address: 'I Cad-1, Musaffah M41, Abu Dhabi, UAE',
    poBox: '9050',
    trn: '100046686000003',
    phone: '+971 2 550 1366',
    contactPerson: 'Mr. G Mohammed Irfan',
    designation: 'Procurement Manager',
    email: 'store@SuperEng.ae',
    mobile: '+971 55 224 6344',
    faxNo: '+971 2 550 1367',
    companyId: 'comp-mfi',
    assignedSeller: 'FAHIM',
    seller: 'FAHIM'
  },
  {
    id: 'cust-2',
    companyName: 'SABIC STEEL CORP',
    address: 'Industrial Area 3, Dammam, KSA',
    poBox: '1284',
    trn: '300045889200003',
    phone: '+966 13 847 1100',
    contactPerson: 'Eng. Khalid Al-Mansoor',
    designation: 'Project Director',
    email: 'purchasing@sabic-steel.com',
    mobile: '+966 50 491 8820',
    companyId: 'comp-mfi',
    assignedSeller: 'MR. ASIF',
    seller: 'MR. ASIF'
  },
  {
    id: 'cust-3',
    companyName: 'AJMAN GALVANIZING & COATING L.L.C',
    address: 'New Industrial Area, Ajman, UAE',
    poBox: '4412',
    trn: '100288391000003',
    phone: '+971 6 743 8812',
    contactPerson: 'Mr. Rajesh Kumar',
    designation: 'Stores & Materials Head',
    email: 'info@ajmangalvanizing.ae',
    mobile: '+971 50 712 3349',
    companyId: 'comp-mfi',
    assignedSeller: 'MR. ASIF',
    seller: 'MR. ASIF'
  },
  {
    id: 'cust-4',
    companyName: 'AL FAJAR STEEL WORKS CO.',
    address: 'Industrial Area 10, Sharjah, UAE',
    poBox: '6102',
    trn: '100319204000003',
    phone: '+971 6 534 9910',
    contactPerson: 'Mr. Tariq Mahmoud',
    designation: 'Commercial Manager',
    email: 'quotes@alfajarsteel.com',
    mobile: '+971 52 819 0021',
    companyId: 'comp-mfi',
    assignedSeller: 'FAHIM',
    seller: 'FAHIM'
  },

  // --- BOLT MASTER MIDDLE EAST CUSTOMERS (comp-bmm) ---
  {
    id: 'cust-trojan',
    companyName: 'Trojan Contracting L.L.C',
    address: 'Plot 104, Industrial Area 2, Abu Dhabi / Dubai, UAE',
    poBox: '4488',
    trn: '100229988100003',
    phone: '+971 2 611 8800',
    contactPerson: 'Mr. Akil Kumar (AK)',
    designation: 'Senior Procurement Specialist',
    email: 'akil.kumar@trojan.ae',
    mobile: '+971 50 442 9011',
    companyId: 'comp-bmm',
    assignedSeller: 'MR. ASIF',
    seller: 'MR. ASIF',
    concernPersons: [
      {
        id: 'cp-1',
        name: 'Mr. Akil Kumar (AK)',
        code: 'AK',
        designation: 'Senior Procurement Specialist',
        email: 'akil.kumar@trojan.ae',
        mobile: '+971 50 442 9011',
        phone: '+971 2 611 8801'
      },
      {
        id: 'cp-2',
        name: 'Eng. Suresh Patel (SP)',
        code: 'SP',
        designation: 'Project Director',
        email: 'suresh.patel@trojan.ae',
        mobile: '+971 55 882 1092',
        phone: '+971 2 611 8802'
      },
      {
        id: 'cp-3',
        name: 'Mr. Rahul Sharma (RS)',
        code: 'RS',
        designation: 'Stores & Materials Manager',
        email: 'rahul.s@trojan.ae',
        mobile: '+971 52 901 3342',
        phone: '+971 2 611 8803'
      }
    ]
  },
  {
    id: 'cust-bmm-2',
    companyName: 'Emirates Building Contracting LLC',
    address: 'Al Quoz Industrial Area 4, Dubai, UAE',
    poBox: '5120',
    trn: '100388910000003',
    phone: '+971 4 340 1199',
    contactPerson: 'Eng. Tariq Al Nuaimi',
    designation: 'Purchasing Director',
    email: 'procurement@ebc-dubai.ae',
    mobile: '+971 50 662 1904',
    companyId: 'comp-bmm',
    assignedSeller: 'TARIQ',
    seller: 'TARIQ'
  },
  {
    id: 'cust-bmm-3',
    companyName: 'Dubai Hardware Wholesalers LLC',
    address: 'Deira Wholesale Market, Dubai, UAE',
    poBox: '1890',
    trn: '100499120000003',
    phone: '+971 4 226 7741',
    contactPerson: 'Mr. Salim Merchant',
    designation: 'General Manager',
    email: 'sales@dubaihardware.ae',
    mobile: '+971 55 901 8823',
    companyId: 'comp-bmm',
    assignedSeller: 'FAHIM',
    seller: 'FAHIM'
  },

  // --- UNITED METAL INDUSTRIES CUSTOMERS (comp-umi) ---
  {
    id: 'cust-umi-1',
    companyName: 'Habtoor Heavy Engineering PJSC',
    address: 'Jebel Ali Free Zone (JAFZA), Dubai, UAE',
    poBox: '8910',
    trn: '100511280000003',
    phone: '+971 4 881 5000',
    contactPerson: 'Eng. Farhan Siddiqui',
    designation: 'VP Projects',
    email: 'engineering@habtoor-heavy.com',
    mobile: '+971 50 812 4477',
    companyId: 'comp-umi',
    assignedSeller: 'RASHID',
    seller: 'RASHID'
  },
  {
    id: 'cust-umi-2',
    companyName: 'National Galvanizing Works LLC',
    address: 'ICAD 3, Abu Dhabi, UAE',
    poBox: '3044',
    trn: '100622990000003',
    phone: '+971 2 551 2299',
    contactPerson: 'Mr. David Vance',
    designation: 'Supply Chain Lead',
    email: 'dvance@natgalv.ae',
    mobile: '+971 52 441 9088',
    companyId: 'comp-umi',
    assignedSeller: 'RASHID',
    seller: 'RASHID'
  }
];

export const INITIAL_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'quote-101',
    rfqDate: '23-Jul-26',
    rfqNumber: 'IND-SEI-SH-26-102',
    tenderNo: '',
    tenderDate: '',
    quotationRef: 'MFI:J-0719/07/2026',
    quotationDate: '24-Jul-26',
    amount: 959.18,
    client: 'Super Engineering Industry L.L.C',
    inquiryBy: 'Mr. G Mohammed Irfan',
    email: 'store@SuperEng.ae',
    mobile: '+971 55 224 6344',
    phone: '+971 2 550 1366',
    steelOpen: false,
    closed: false,
    win: true,
    lost: false,
    notes: 'Grade 8.8 HDG Hex bolts & nuts sets order approved',
    month: 'July',
    seller: 'FAHIM',
    companyId: 'comp-mfi'
  },
  {
    id: 'quote-102',
    rfqDate: '16-Aug-26',
    rfqNumber: 'RFQ-SABIC-8802',
    tenderNo: 'TND-SABIC-2026-08',
    tenderDate: '18-Aug-26',
    quotationRef: 'MFI:J-0818/08/2026',
    quotationDate: '19-Aug-26',
    amount: 145200.00,
    client: 'SABIC STEEL CORP',
    inquiryBy: 'Eng. Khalid Al-Mansoor',
    email: 'purchasing@sabic-steel.com',
    mobile: '+966 50 491 8820',
    phone: '+966 13 847 1100',
    steelOpen: true,
    closed: false,
    win: false,
    lost: false,
    notes: 'A325 Heavy Hex structural bolts package inquiry',
    month: 'August',
    seller: 'MR. ASIF',
    companyId: 'comp-mfi'
  },
  {
    id: 'quote-103',
    rfqDate: '12-Jun-26',
    rfqNumber: 'RFQ-AJM-8821',
    quotationRef: 'MFI:J-0612/06/2026',
    quotationDate: '14-Jun-26',
    amount: 28450.00,
    client: 'AJMAN GALVANIZING & COATING L.L.C',
    inquiryBy: 'Mr. Rajesh Kumar',
    email: 'info@ajmangalvanizing.ae',
    mobile: '+971 50 712 3349',
    phone: '+971 6 743 8812',
    steelOpen: false,
    closed: true,
    win: true,
    lost: false,
    notes: 'B7 Threaded rods & U-Bolts galvanizing fast track',
    month: 'June',
    seller: 'FAISAL',
    companyId: 'comp-mfi'
  },
  {
    id: 'quote-104',
    rfqDate: '05-Jun-26',
    rfqNumber: 'RFQ-AFSW-1092',
    quotationRef: 'MFI:J-0605/06/2026',
    quotationDate: '06-Jun-26',
    amount: 67800.50,
    client: 'AL FAJAR STEEL WORKS CO.',
    inquiryBy: 'Mr. Tariq Mahmoud',
    email: 'quotes@alfajarsteel.com',
    mobile: '+971 52 819 0021',
    phone: '+971 6 534 9910',
    steelOpen: false,
    closed: false,
    win: false,
    lost: true,
    notes: 'Price gap on stainless steel A4-80 socket screws',
    month: 'June',
    seller: 'FAHIM',
    companyId: 'comp-mfi'
  },
  {
    id: 'quote-105',
    rfqDate: '10-Aug-26',
    rfqNumber: 'RFQ-TRJ-2026-90',
    quotationRef: 'BMM:Q-0810/08/2026',
    quotationDate: '11-Aug-26',
    amount: 34500.00,
    client: 'Trojan Contracting L.L.C',
    inquiryBy: 'Mr. Akil Kumar',
    email: 'akil.kumar@trojan.ae',
    mobile: '+971 50 442 9011',
    phone: '+971 2 611 8800',
    steelOpen: true,
    closed: false,
    win: false,
    lost: false,
    notes: 'High tensile stud bolts and foundation anchor sets',
    month: 'August',
    seller: 'MR. ASIF',
    companyId: 'comp-bmm'
  },
  {
    id: 'quote-106',
    rfqDate: '15-Aug-26',
    rfqNumber: 'RFQ-UMI-4412',
    quotationRef: 'UMI:Q-0815/08/2026',
    quotationDate: '16-Aug-26',
    amount: 89200.00,
    client: 'AL FAJAR STEEL WORKS CO.',
    inquiryBy: 'Mr. Tariq Mahmoud',
    email: 'quotes@alfajarsteel.com',
    mobile: '+971 52 819 0021',
    phone: '+971 6 534 9910',
    steelOpen: false,
    closed: false,
    win: true,
    lost: false,
    notes: 'Custom fabricated stainless steel cable trays & brackets',
    month: 'August',
    seller: 'FAISAL',
    companyId: 'comp-umi'
  }
];

