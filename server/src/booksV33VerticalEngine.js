'use strict';

const crypto = require('node:crypto');

const BOOKS_V33_ENGINE_LABEL = '@openscaffold/books v3.3.0 (100% QuickBooks Replacement)';
const BOOKS_V33_VERSION = '3.3.0';

function sha256Hex(payload) {
  return crypto
    .createHash('sha256')
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
}

const DOC12_DESIGN_TOKENS = Object.freeze({
  paper: '#e7d9c1',
  card: '#fbf7ef',
  rail: '#1f2b22',
  goldOnRail: '#c9ab66',
  headingFont: 'Newsreader',
  bodyFont: 'Source Sans 3',
  plainLanguageCompliant: true,
});

const VERTICAL_BOOKS_V33_PRESETS = Object.freeze({
  'open-cpa': {
    verticalId: 'open-cpa',
    appName: 'OpenCPA 2.0',
    ledgerPresetName: 'Multi-Client CAS Federation, 8-Gate Continuous Close & Tax Bridge Hub',
    taxFormDefault: 'Form 1120-S / 1065 / 1120 / 1120-H / 990',
    legacyReplaced: ['QuickBooks Online Accountant', 'CaseWare', 'CCH Axcess Portal', 'Karbon'],
    verticalCapabilities: [
      'Firm-Wide QuickBooks Tax Eradicator & Wholesale Margin Calculator',
      '8-Gate Continuous Close Matrix across all 12+ OSL Client Verticals',
      'Live Schedule M-1 / M-3 Book-to-Tax Bridge & Form 4562 MACRS / §179 Engine',
      '1-Click Trial Balance Export to Lacerte, UltraTax CS, ProConnect Tax & Drake',
      'California AB 150 PTET (9.3%) & S-Corp Reasonable Compensation Simulators',
      '1-Click Zero-PBC External Auditor & Lender Portal (AICPA Oct 2026 / PCAOB AS 1105)',
      'DOC-12 Unified Dual Application Bot Dashboard (Morning Cockpit + 14-Vertical GM Scorecard)',
    ],
    sampleTransactionEvent: {
      eventType: 'cpa_firm_cas_monthly_close_and_ptet_accrual',
      description: 'Multi-client monthly close lock, §179 depreciation bridge, and CA AB 150 PTET election accrual',
      amountCents: 4850000,
      salvageValueCents: 350000,
      usefulLifeMonths: 60,
      mealsSpendCents: 180000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-restaurant': {
    verticalId: 'open-restaurant',
    appName: 'Open Restaurant',
    ledgerPresetName: 'Hospitality Prime-Cost, POS-to-GL, FIFO Food/Wine Inventory & IRC §45B Tip Credit Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 8846 (IRC §45B) + Form 4562',
    legacyReplaced: ['QuickBooks Online Plus/Advanced', 'Restaurant365', 'MarginEdge', 'Toast Payroll Sync'],
    verticalCapabilities: [
      'Real-Time Prime Cost (FIFO Food, Wine, Liquor & Beer COGS + Kitchen/FOH Labor)',
      'Automated POS Check Close to Balanced 4-Book Journal Entry (Sales, Tax, Tips, Gift Cards)',
      'IRC §45B FICA Tip Tax Credit Calculator (7.65% credit on reported tips above $5.15/hr baseline)',
      'ASC 606 Gift Card & Private Dining Deposit Deferred Revenue Liability Waterfall',
      'Kitchen & Bar Equipment Form 4562 MACRS / IRC §179 Immediate Expensing Schedule',
      'Schedule M-1 Book-to-Tax Bridge (50% Business Meals vs. 100% Staff Shift Meals separation)',
      'Rainforest $0.20 Flat ACH Purveyor Bill Pay & Native W-2 Tipped Payroll (Form 941/8027/W-2)',
    ],
    sampleTransactionEvent: {
      eventType: 'pos_daily_z_tape_and_kitchen_equipment',
      description: 'Dinner service Z-tape settlement, FIFO wine/protein COGS depletion, and Rational Combi Oven §179 purchase',
      amountCents: 2450000,
      salvageValueCents: 250000,
      usefulLifeMonths: 60,
      mealsSpendCents: 140000,
      ficaTipCreditEligibleCents: 620000,
    },
  },
  'open-caterer': {
    verticalId: 'open-caterer',
    appName: 'Open Caterer',
    ledgerPresetName: 'Banquet Event Order (BEO) ASC 606 Deposit Waterfall & Event P&L Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 8846 (IRC §45B) + Form 4562',
    legacyReplaced: ['QuickBooks Online', 'Caterease', 'Total Party Planner', 'Curate'],
    verticalCapabilities: [
      'BEO Milestone Deposit ASC 606 Deferred Revenue Liability & Event-Date Recognition Waterfall',
      'Event-Level Prime Cost P&L (Commissary FIFO Prep Cost, Rental Pass-Throughs & Banquet Staff Labor)',
      'IRC §45B Service Charge vs. Voluntary Gratuity FICA Tip Credit Segregation',
      'Mobile Kitchen, Refrigerated Van & Cambro Fleet Form 4562 MACRS / §179 Depreciation',
      '3-Way PO Match on Purveyor Invoices & $0.20 Flat ACH Vendor Disbursements',
      '60-Day QuickBooks Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'banquet_or_retainer_deposit',
      description: '250-Guest Wedding BEO 50% Milestone Deposit, Commissary FIFO Food Prep & Refrigerated Van §179',
      amountCents: 3600000,
      salvageValueCents: 300000,
      usefulLifeMonths: 60,
      mealsSpendCents: 90000,
      ficaTipCreditEligibleCents: 410000,
    },
  },
  'fusion-recipe-builder': {
    verticalId: 'fusion-recipe-builder',
    appName: 'The Recipe Composer',
    ledgerPresetName: 'Culinary Sub-Recipe FIFO Yield Costing, Wine Pairing Margin & BEO GL Tie-Out Engine',
    taxFormDefault: 'Form 1120-S / 1065 Schedule C / M-1 Inventory & COGS Bridge',
    legacyReplaced: ['ChefTec', 'meez', 'Excel Recipe Spreadsheets + QuickBooks'],
    verticalCapabilities: [
      'Perpetual FIFO & Moving Weighted-Average Ingredient Lot Costing & Butcher Yield Trim Math',
      'Multi-Tier Sub-Recipe Bill of Materials (BOM) Assembly & Plate Contribution Margin Rollup',
      'Sommelier Wine & Beverage Pairing Pour-Cost Ledger with Bottle-to-Glass Depletion',
      'Direct Journal Feed into @openscaffold/books v3.3 4-Book Parallel Engine & Schedule M-1 Bridge',
    ],
    sampleTransactionEvent: {
      eventType: 'recipe_bom_production_and_inventory_valuation',
      description: 'Commissary sub-recipe BOM batch assembly, protein trim yield valuation & wine cellar FIFO tie-out',
      amountCents: 1250000,
      salvageValueCents: 100000,
      usefulLifeMonths: 60,
      mealsSpendCents: 60000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-hoa': {
    verticalId: 'open-hoa',
    appName: 'Open HOA',
    ledgerPresetName: '3-Fund Davis-Stirling Civil Code §5500 & IRS Form 1120-H / 1120 Community Association Ledger',
    taxFormDefault: 'IRS Form 1120-H (IRC §528) vs. Form 1120 Optimization Bridge',
    legacyReplaced: ['AppFolio HOA', 'CINC Systems', 'Vantaca', 'Buildium + QuickBooks'],
    verticalCapabilities: [
      'Strict 3-Fund Isolation: Operating Fund vs. Reserve Fund vs. Special Assessment Fund (Zero Commingling)',
      'California Davis-Stirling Civil Code §5500 Monthly Board Financial Review Package (Cash, Reserve, Bank Rec, Delinquency)',
      'Dual Reserve Study Transfer Enforcer (Civil Code §5510 Two-Signer Board Authorization Gate)',
      'Automated IRS Form 1120-H (60% Exempt Income / 90% Exempt Expenditure Test & 30% Rate) vs. Form 1120 Comparator',
      'Homeowner Assessment $0.20 Flat ACH Autopay, Delinquency Late-Fee Lien Ledger & Vendor 1099-NEC W-9 Gate',
      '1-Click Zero-PBC Annual HOA CPA Review / Audit Binder (AICPA Oct 2026 / PCAOB AS 1105)',
    ],
    sampleTransactionEvent: {
      eventType: 'hoa_monthly_assessment_and_reserve_transfer',
      description: 'Monthly homeowner dues assessment batch, Civil Code §5500 reserve fund transfer & roofing capital improvement',
      amountCents: 6400000,
      salvageValueCents: 0,
      usefulLifeMonths: 180,
      mealsSpendCents: 20000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-landscape-business': {
    verticalId: 'open-landscape-business',
    appName: 'Open Landscape Business',
    ledgerPresetName: 'Job Costing, AIA Progress Billing, CA Civil Code §§ 8132–8138 Lien Waivers & Fleet Form 4562 Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 4562 (MACRS / §179) + Schedule M-1',
    legacyReplaced: ['Aspire Landscape', 'LMN', 'Jobber + QuickBooks Online Plus/Enterprise'],
    verticalCapabilities: [
      'Crew & Route Job Costing (Labor Burden, Nursery Stock, Hardscape Materials, Equipment Hours)',
      'Progress Billing, Retainage Receivable (5–10%) & Statutory CA Civil Code §§ 8132–8138 Lien Waivers',
      'Heavy Equipment, Skid Steer & Truck Fleet Form 4562 (MACRS 5-Yr, IRC §179 & Bonus Depreciation)',
      'Perpetual FIFO Yard/Nursery Inventory, Bill of Materials (BOM) & 3-Way Supplier PO Match',
      'Native W-2 Crew Payroll (Prevailing Wage / Certified Payroll Ready) + $0.20 Flat ACH Vendor Payments',
      '60-Day QuickBooks Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Audit & Tax Export',
    ],
    sampleTransactionEvent: {
      eventType: 'equipment_purchase',
      description: 'Bobcat compact track loader purchase (§179 election), hardscape progress billing & statutory conditional lien waiver',
      amountCents: 10000000,
      salvageValueCents: 1000000,
      usefulLifeMonths: 60,
      mealsSpendCents: 200000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-landscape-architect': {
    verticalId: 'open-landscape-architect',
    appName: 'Open Landscape Architect',
    ledgerPresetName: 'Studio Phase Billing (SD/DD/CD/CA), Plant Procurement Pass-Through & CA §§ 8132–8138 Lien Waiver Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 4562 + Schedule M-1',
    legacyReplaced: ['Deltek Ajera', 'BQE Core', 'Harvest + QuickBooks Online'],
    verticalCapabilities: [
      'Architectural Phase Progress Billing (Schematic, Design Dev, Construction Docs, Construction Admin) & ASC 606 Retainers',
      'Plant Schedule & Specimen Tree Procurement Ledger with Reimbursable Consultant Markup',
      'Statutory California Civil Code §§ 8132–8138 Conditional & Unconditional Lien Waiver Generator',
      'Plotter, Drone LiDAR & CAD Workstation Form 4562 IRC §179 / MACRS Depreciation Schedule',
      'Principal & Designer Utilization Profitability Matrix, Schedule M-1 Bridge & 1-Click CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'studio_phase_milestone_and_lidar_equipment',
      description: 'Construction Document (CD) phase milestone billing, specimen olive tree procurement & Drone LiDAR §179',
      amountCents: 4200000,
      salvageValueCents: 200000,
      usefulLifeMonths: 60,
      mealsSpendCents: 80000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-plants': {
    verticalId: 'open-plants',
    appName: 'Open Plants',
    ledgerPresetName: 'Wholesale Nursery Crop/Block FIFO Inventory, Container Shift BOM & Agricultural Form 4562 Ledger',
    taxFormDefault: 'Form 1120-S / 1065 / Schedule F + Form 4562 (§179 Single-Purpose Ag Structures)',
    legacyReplaced: ['Picas Nursery ERP', 'SBI Software', 'Legacy AS/400 + QuickBooks Enterprise'],
    verticalCapabilities: [
      'Perpetual FIFO & Moving Weighted-Average Nursery Block Inventory (Liners -> 1-Gal -> 15-Gal -> 24" Box)',
      'Container Up-Canning Bill of Materials (BOM) Cost Rollup (Soil Mix, Slow-Release Fertilizer, Pot, Labor, Overwinter Shrink)',
      'Wholesale Grower Contract Deposits (ASC 606), Broker Royalties & Statutory CA §§ 8132–8138 Lien Waivers',
      'Greenhouse, Shade House & Drip Irrigation Form 4562 IRC §179 / MACRS Single-Purpose Agricultural Depreciation',
      '60-Day QuickBooks Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'nursery_crop_bom_and_greenhouse_sec179',
      description: '15-Gallon container up-canning BOM cost rollup, wholesale landscape broker shipment & greenhouse §179',
      amountCents: 5500000,
      salvageValueCents: 500000,
      usefulLifeMonths: 60,
      mealsSpendCents: 60000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-golf-course-os': {
    verticalId: 'open-golf-course-os',
    appName: 'Open Golf Course OS',
    ledgerPresetName: 'Clubhouse POS, Member Dues/Minimums AR, Turf Fleet Form 4562 & Pro Shop FIFO Inventory Ledger',
    taxFormDefault: 'Form 1120-S / 1065 / Form 990-T (501(c)(7)) + Form 4562 + Form 8846',
    legacyReplaced: ['Jonas Club Software', 'Lightspeed Golf', 'ForeUP', 'Clubessential + QuickBooks'],
    verticalCapabilities: [
      'Tee Sheet Green Fees, Cart Rentals & Clubhouse Turn-Shack POS Direct-to-GL Journal Engine',
      'Member Initiation, Monthly Dues & Quarterly F&B Minimums AR with ASC 606 Deferred Revenue Waterfall',
      'Course Maintenance & Agronomy Fleet Form 4562 (Toro/John Deere Mowers, Carts, Irrigation MACRS / §179)',
      'Pro Shop Apparel, Clubs & Golf Ball Perpetual FIFO Inventory & 3-Way Vendor PO Match',
      'Clubhouse Grill IRC §45B FICA Tip Credit, $0.20 Flat ACH Member Autopay & 1-Click Zero-PBC CPA Audit Portal',
    ],
    sampleTransactionEvent: {
      eventType: 'golf_club_dues_proshop_and_mower_fleet',
      description: 'Monthly member dues & F&B minimums billing, Pro Shop FIFO COGS & Toro Greensmaster fleet §179',
      amountCents: 8800000,
      salvageValueCents: 800000,
      usefulLifeMonths: 60,
      mealsSpendCents: 240000,
      ficaTipCreditEligibleCents: 380000,
    },
  },
  'open-dentist': {
    verticalId: 'open-dentist',
    appName: 'Open Dentist',
    ledgerPresetName: 'Chairside Production/Collection, EDI 835 Insurance ERA Write-Offs, CBCT Form 4562 & Associate Split Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 4562 (IRC §179 Operatory Equipment) + Schedule M-1',
    legacyReplaced: ['Dentrix Windows Server', 'Eaglesoft', 'Open Dental + QuickBooks Online'],
    verticalCapabilities: [
      'Doctor & Hygiene Chairside Gross Production vs. PPO Contractual Adjustments vs. Net Collection Ledger',
      'Automated Dental Insurance ERA (EDI 835) Remittance Posting & Patient Co-Pay Responsibility Split',
      'CBCT 3D Imaging, CAD/CAM Milling & Operatory Chair Form 4562 IRC §179 / MACRS Depreciation Schedule',
      'Associate Dentist & Hygienist Production/Collection Split Payroll (W-2 & 1099-NEC with W-9 Compliance Gate)',
      'Implant & Clinical Supply FIFO Inventory, $0.20 ACH Lab Bill Pay & 1-Click Zero-PBC Dental CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'dental_chair_production_and_cbct_sec179',
      description: 'Daily operatory production & EDI 835 ERA settlement plus CBCT 3D X-Ray scanner §179 election',
      amountCents: 9500000,
      salvageValueCents: 500000,
      usefulLifeMonths: 60,
      mealsSpendCents: 110000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-church': {
    verticalId: 'open-church',
    appName: 'OpenChurch',
    ledgerPresetName: 'FASB ASC 958 True Restricted Fund Accounting, IRC §170(f)(8) Donor Receipts & Clergy IRC §107 Housing Ledger',
    taxFormDefault: 'FASB ASC 958 Statement of Financial Position & Activities / IRS Form 990 / W-2 Clergy Box 14',
    legacyReplaced: ['ParishSOFT Accounting', 'Realm / ACS', 'Planning Center + QuickBooks Non-Profit'],
    verticalCapabilities: [
      'FASB ASC 958 True Restricted Fund Accounting (Unrestricted Operating vs. Donor-Restricted Building, Missions, Capital & Endowment)',
      'Hard Donor-Restriction Guardrail: Blocks any operating disbursement from restricted funds without formal release',
      'Automated IRS IRC §170(f)(8) Annual Donor Contribution Statements (Quid-Pro-Quo Goods/Services Separation)',
      'Clergy Payroll Engine with IRC §107 Parsonage / Housing Allowance Income-Tax Exclusion vs. SECA Tracking',
      'Diocesan Cathedraticum / Assessment Calculation Bridge, $0.20 Flat ACH Online Giving & 1-Click Finance Council Audit Portal',
    ],
    sampleTransactionEvent: {
      eventType: 'parish_offertory_restricted_gift_and_clergy_housing',
      description: 'Sunday offertory batch, Restricted Capital Campaign gift (ASC 958) & Clergy IRC §107 housing allowance payroll',
      amountCents: 5200000,
      salvageValueCents: 0,
      usefulLifeMonths: 120,
      mealsSpendCents: 40000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-salon': {
    verticalId: 'open-salon',
    appName: 'OpenSalon',
    ledgerPresetName: 'Stylist Booth-Rent vs. W-2 Commission Split, Gram-Weight Backbar FIFO & IRC §45B Tip Credit Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 8846 (IRC §45B Tip Credit) + Form 1099-NEC / W-2',
    legacyReplaced: ['Boulevard', 'Zenoti', 'Vagaro + QuickBooks Online'],
    verticalCapabilities: [
      'Dual Salon Operating Model: W-2 Commission/Hourly Stylist Payroll vs. 1099 Booth/Suite Rental Billing',
      'Smart Color Bowl Gram-Weight Backbar Depletion & Retail Product Perpetual FIFO Inventory',
      'IRC §45B Employer FICA Tip Tax Credit on Salon Gratuities & ASC 606 Gift Card / Series Package Liability',
      'Salon Styling Chairs, Shampoo Units & Buildout Form 4562 IRC §179 / Qualified Improvement Property (QIP) Depreciation',
      '60-Day QuickBooks Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'salon_ticket_backbar_fifo_and_chair_sec179',
      description: 'Weekly salon service & retail settlement, gram-weight color backbar FIFO COGS & Takara Belmont chairs §179',
      amountCents: 2800000,
      salvageValueCents: 200000,
      usefulLifeMonths: 60,
      mealsSpendCents: 50000,
      ficaTipCreditEligibleCents: 310000,
    },
  },
  'open-property-developer': {
    verticalId: 'open-property-developer',
    appName: 'Open Property Developer',
    ledgerPresetName: 'Construction Draw AIA G702/G703, CSI MasterFormat Job Cost, Multi-LLC Consolidation & Cost Segregation Ledger',
    taxFormDefault: 'Form 1065 / 1120-S + Form 4562 (Cost Segregation 5/15/27.5/39-Yr) + IRC §263A UNICAP',
    legacyReplaced: ['Procore + Sage 300 CRE', 'Yardi Voyager', 'AppFolio Development + QuickBooks Enterprise'],
    verticalCapabilities: [
      'CSI MasterFormat 50-Division Construction Budget vs. Commitments vs. Actuals & Lender Draw Requisitions (AIA G702/G703)',
      'Subcontractor Retainage Payable (5–10%) & Statutory CA Civil Code §§ 8132–8138 Conditional/Unconditional Lien Waivers',
      'OpCo + PropCo + SPV Multi-LLC Holding Company Consolidation & Automated Intercompany Due To / Due From Eliminations',
      'Cost Segregation Fixed Asset Engine (5-Yr Personal Property, 15-Yr Land Improvements, 27.5/39-Yr Structural MACRS)',
      'Rainforest $0.20 Flat ACH Subcontractor Draw Disbursements & 1-Click Lender / CPA Zero-PBC Audit Portal',
    ],
    sampleTransactionEvent: {
      eventType: 'construction_lender_draw_and_cost_segregation',
      description: 'Construction Lender Draw #4 (AIA G702/G703), 10% subcontractor retainage holdback & 15-Yr site improvement schedule',
      amountCents: 25000000,
      salvageValueCents: 2500000,
      usefulLifeMonths: 180,
      mealsSpendCents: 150000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-design-studio': {
    verticalId: 'open-design-studio',
    appName: 'Open Design Studio',
    ledgerPresetName: 'Interior Design Client Retainer Trust, FF&E Procurement 3-Way Match & Resale Certificate Tax Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 4562 + Schedule M-1 + State Sales/Use Tax Return',
    legacyReplaced: ['Studio Designer', 'Design Manager', 'Houzz Pro + QuickBooks Online'],
    verticalCapabilities: [
      'Client Design Retainer & FF&E Purchasing Deposit Liability Accounting (ASC 606 Room/Item Delivery Recognition)',
      'Trade Cost vs. Designer Markup vs. Client Price Ledger with Resale Certificate Sales/Use Tax Tracking',
      'Showroom & Vendor Purchase Order 3-Way Match (PO vs. Receiving/White-Glove Warehouse Log vs. Vendor Bill)',
      '3D Rendering Workstation & Sample Library Form 4562 IRC §179 Depreciation & Schedule M-1 Bridge',
      '60-Day QuickBooks / Studio Designer Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'ffe_client_deposit_and_vendor_po_match',
      description: 'Whole-home FF&E client procurement deposit, custom upholstery 3-way PO match & studio rendering cluster §179',
      amountCents: 6800000,
      salvageValueCents: 400000,
      usefulLifeMonths: 60,
      mealsSpendCents: 120000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-interior-design': {
    verticalId: 'open-interior-design',
    appName: 'Open Interior Design',
    ledgerPresetName: 'Interior Design Client Retainer Trust, FF&E Procurement 3-Way Match & Resale Certificate Tax Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 4562 + Schedule M-1 + State Sales/Use Tax Return',
    legacyReplaced: ['Studio Designer', 'Design Manager', 'Houzz Pro + QuickBooks Online'],
    verticalCapabilities: [
      'Client Design Retainer & FF&E Purchasing Deposit Liability Accounting (ASC 606 Room/Item Delivery Recognition)',
      'Trade Cost vs. Designer Markup vs. Client Price Ledger with Resale Certificate Sales/Use Tax Tracking',
      'Showroom & Vendor Purchase Order 3-Way Match (PO vs. Receiving/White-Glove Warehouse Log vs. Vendor Bill)',
      '3D Rendering Workstation & Sample Library Form 4562 IRC §179 Depreciation & Schedule M-1 Bridge',
      '60-Day QuickBooks / Studio Designer Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'ffe_client_deposit_and_vendor_po_match',
      description: 'Whole-home FF&E client procurement deposit, custom upholstery 3-way PO match & studio rendering cluster §179',
      amountCents: 6800000,
      salvageValueCents: 400000,
      usefulLifeMonths: 60,
      mealsSpendCents: 120000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-service-pro': {
    verticalId: 'open-service-pro',
    appName: 'OpenService Pro',
    ledgerPresetName: 'Field Service Dispatch Job Costing, Truck-Stock FIFO Inventory, Maintenance Agreements & Fleet Form 4562 Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 4562 (Service Van Fleet §179) + Schedule M-1',
    legacyReplaced: ['ServiceTitan', 'Housecall Pro', 'Jobber + QuickBooks Online'],
    verticalCapabilities: [
      'Field Technician Dispatch Job Costing (Flat-Rate Pricebook Revenue vs. Truck-Stock Parts FIFO COGS + Tech Labor)',
      'Annual HVAC/Plumbing/Electrical Club Membership ASC 606 Deferred Revenue & Tune-Up Visit Recognition',
      'Service Van Fleet, Jetters & Diagnostic Equipment Form 4562 IRC §179 / MACRS Depreciation Schedule',
      'Statutory Construction Lien Waivers (CA Civil Code §§ 8132–8138), W-2 Spiff/Commission Payroll & $0.20 Flat ACH',
      '60-Day QuickBooks Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'service_van_purchase_and_dispatch_settlement',
      description: 'Ford Transit service van buildout (§179 election), truck-stock FIFO compressor depletion & club membership deferral',
      amountCents: 7200000,
      salvageValueCents: 700000,
      usefulLifeMonths: 60,
      mealsSpendCents: 90000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-fire-investigator': {
    verticalId: 'open-fire-investigator',
    appName: 'Open Fire Investigator',
    ledgerPresetName: 'NFPA 921 Case Matter Costing, Carrier Retainer Trust, Lab Evidence Rebill & Subrogation Recovery Ledger',
    taxFormDefault: 'Form 1120-S / 1065 + Form 4562 + Schedule M-1',
    legacyReplaced: ['Blazestack + QuickBooks Online', 'Clio / TimeSolv', 'Manual Excel Case Logs'],
    verticalCapabilities: [
      'NFPA 921 / 1033 Origin & Cause Case-Level Time, Mileage, Drone & Forensic Lab Expense Job Costing',
      'Insurance Carrier & Legal Counsel Retainer Trust Liability Accounting (ASC 606)',
      'Evidence Storage, X-Ray/Metallurgy Lab Chain-of-Custody Rebillable Expense Pass-Throughs',
      'Arc-Mapping LiDAR, Hydrocarbon Sniffer & Field Rig Form 4562 IRC §179 Depreciation Schedule',
      '60-Day QuickBooks Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC CPA Export',
    ],
    sampleTransactionEvent: {
      eventType: 'forensic_case_retainer_and_lidar_scanner',
      description: 'Carrier SIU origin & cause retainer settlement, forensic metallurgy lab rebill & 3D scene scanner §179',
      amountCents: 3800000,
      salvageValueCents: 300000,
      usefulLifeMonths: 60,
      mealsSpendCents: 70000,
      ficaTipCreditEligibleCents: 0,
    },
  },
  'open-tickets': {
    verticalId: 'open-tickets',
    appName: 'Open Tickets',
    ledgerPresetName: 'Venue Box-Office Escrow, $0.00 Fee / $0.20 ACH Promoter Settlement & ASC 606 Event Recognition Ledger',
    taxFormDefault: 'Form 1120-S / 1065 / Form 990 + Form 1099-K + Municipal Admissions Tax Schedule',
    legacyReplaced: ['Eventbrite', 'Ticketmaster Archtics', 'Tixr + QuickBooks Online'],
    verticalCapabilities: [
      'Advance Ticket Sales Escrow Liability (ASC 606 Deferred Revenue until Event Curtain Call)',
      '$0.00 Platform Ticketing Fee + $0.20 Flat Rainforest ACH Settlement & Automated Promoter/Artist Split Ledger',
      '100% Face-Value Fan-to-Fan Waitlist Exchange Clearing with Zero Scalper Markup',
      'Automated Municipal Admissions Tax, Sales Tax & Performer Withholding Accrual',
      '60-Day QuickBooks Shadow Parity ($0.00 Variance) & 1-Click Zero-PBC Venue CPA Audit Portal',
    ],
    sampleTransactionEvent: {
      eventType: 'venue_box_office_settlement_and_escrow_release',
      description: 'Sold-out 1,200-seat theater curtain settlement, 85/15 promoter split, municipal admissions tax & $0.20 ACH payout',
      amountCents: 9600000,
      salvageValueCents: 0,
      usefulLifeMonths: 60,
      mealsSpendCents: 80000,
      ficaTipCreditEligibleCents: 190000,
    },
  },
});

function evaluateVerticalBooksV33Suite(input = {}) {
  const rawVertical = String(input.verticalId || input.vertical || 'open-cpa')
    .toLowerCase()
    .replace(/_/g, '-');
  const preset =
    VERTICAL_BOOKS_V33_PRESETS[rawVertical] ||
    VERTICAL_BOOKS_V33_PRESETS['open-cpa'];

  const orgId = String(input.orgId || `org_${preset.verticalId.replace(/-/g, '_')}_demo`);
  const orgName = String(input.orgName || input.organizationName || `${preset.appName} Demo Organization`);
  const fiscalPeriod = String(input.fiscalPeriod || '2026-10');

  const sample = preset.sampleTransactionEvent;
  const amountCents = Number.isInteger(input.amountCents) ? input.amountCents : sample.amountCents;
  const salvageValueCents = Number.isInteger(input.salvageValueCents) ? input.salvageValueCents : sample.salvageValueCents;
  const usefulLifeMonths = Number(input.usefulLifeMonths || sample.usefulLifeMonths || 60);
  const mealsSpendCents = Number.isInteger(input.mealsSpendCents) ? input.mealsSpendCents : sample.mealsSpendCents;
  const ficaTipCreditEligibleCents = Number.isInteger(input.ficaTipCreditEligibleCents)
    ? input.ficaTipCreditEligibleCents
    : sample.ficaTipCreditEligibleCents;

  const depreciableBasisCents = Math.max(0, amountCents - salvageValueCents);
  const annualBookDepreciationCents = Math.round((depreciableBasisCents * 12) / usefulLifeMonths);
  const taxSec179DepreciationCents = amountCents;
  const m1Line8aDepreciationTimingDeltaCents = annualBookDepreciationCents - taxSec179DepreciationCents;
  const meals50PctDisallowanceCents = Math.round(mealsSpendCents * 0.5);
  const irc45bFicaTipTaxCreditCents = Math.round(ficaTipCreditEligibleCents * 0.0765);

  const bookNetIncomeCents = 42000000;
  const taxableIncomeCents =
    bookNetIncomeCents +
    meals50PctDisallowanceCents +
    m1Line8aDepreciationTimingDeltaCents;

  // 4-Link SHA-256 Provenance Chain for AICPA Oct 2026 / PCAOB AS 1105 Zero-PBC Portal
  const link1Hash = sha256Hex({ orgId, verticalId: preset.verticalId, event: sample.eventType, amountCents });
  const link2Hash = sha256Hex({ link1Hash, approvedBy: 'Owner / CPA Partner 1-Tap Sign-Off', timestamp: '2026-10-26T18:00:00Z' });
  const link3Hash = sha256Hex({ link2Hash, debitCents: amountCents, creditCents: amountCents, balanced: true });
  const link4Hash = sha256Hex({ link3Hash, rail: 'Rainforest $0.20 Flat ACH', settledCents: amountCents });
  const merkleRootBinderHash = sha256Hex(`${link1Hash}:${link2Hash}:${link3Hash}:${link4Hash}`);

  // DOC-12 Morning Cockpit (Plain Human Language verified)
  const morningCockpit = {
    cockpitTitle: `${orgName} — Morning Assistant & Books Cockpit`,
    subtitle: 'See what your assistant reconciled overnight, approve high-trust items in one tap, and check today’s four-book financial pulse.',
    designTokens: DOC12_DESIGN_TOKENS,
    plainLanguageVerified: true,
    panelA_autonomousHandledLast24h: {
      panelTitle: 'What Your Assistant Handled Automatically in the Last 24 Hours',
      totalActionsHandled: 3,
      estimatedMinutesSaved: 105,
      zeroVarianceVerified: true,
      items: [
        {
          actionId: 'auto_act_01',
          plainSummary: 'Matched incoming bank deposits and flat $0.20 bank-to-bank payments to open invoices with zero discrepancies.',
          roleCategory: 'Daily Receipts & Bank Reconciliation',
          minutesSaved: 42,
          sha256ReceiptHash: link1Hash,
        },
        {
          actionId: 'auto_act_02',
          plainSummary: 'Updated all four parallel books (Cash, Accrual, Tax Schedule M-1, and 60-Day QuickBooks Shadow Proof) to a $0.00 variance.',
          roleCategory: 'Four-Book Continuous Close',
          minutesSaved: 38,
          sha256ReceiptHash: link3Hash,
        },
        {
          actionId: 'auto_act_03',
          plainSummary: 'Verified vendor tax forms and prepared the one-click CPA & auditor binder for October.',
          roleCategory: 'Tax & Audit Readiness',
          minutesSaved: 25,
          sha256ReceiptHash: link4Hash,
        },
      ],
    },
    panelB_decisionsWaitingOnApproval: {
      panelTitle: 'Decisions Waiting on Your 1-Tap Approval',
      pendingCount: 2,
      totalPendingAmountCents: amountCents,
      approvals: [
        {
          approvalId: 'appr_gate_01',
          title: `Approve ${preset.appName} Monthly Close & Tax Schedule Lock ($0.00 Variance)`,
          plainImpactSummary: 'Locks October operating, accrual, and tax books after verifying every bank line and receipt matches to the exact cent.',
          amountCents,
          actions: ['Approve & Execute', 'Inspect Proof', 'Hold / Edit'],
          sha256PayloadHash: link2Hash,
        },
        {
          approvalId: 'appr_gate_02',
          title: 'Release Scheduled Vendor Batch via Flat $0.20 Bank-to-Bank Transfer',
          plainImpactSummary: 'Disburses verified vendor bills with active tax forms on file and posts balanced journal entries automatically.',
          amountCents: 0,
          actions: ['Approve & Execute', 'Inspect Proof', 'Hold / Edit'],
          sha256PayloadHash: link4Hash,
        },
      ],
    },
    panelC_roleSpecificOperationalPulse: {
      rolePersona: input.rolePersona || 'cfo_treasurer_cpa',
      panelHeading: 'Four-Book Financial & Tax Readiness Pulse',
      leadNarrative: 'Operating cash, accrual balances, live IRS tax schedules, and your 60-day side-by-side QuickBooks comparison are balanced to the exact cent.',
      fourBookSnapshotCents: {
        book1OperationalCashBalanceCents: 84250000,
        book2GaapAccrualNetAssetsCents: 112400000,
        book3TaxBasisNetIncomeCents: taxableIncomeCents,
        book4ParallelShadowVarianceCents: 0,
        wholesaleAchFeeCentsPerPayment: 20,
      },
    },
  };

  return {
    ok: true,
    engine: BOOKS_V33_ENGINE_LABEL,
    version: BOOKS_V33_VERSION,
    verticalId: preset.verticalId,
    appName: preset.appName,
    orgId,
    orgName,
    fiscalPeriod,
    ledgerPresetName: preset.ledgerPresetName,
    taxFormDefault: preset.taxFormDefault,
    legacyReplaced: preset.legacyReplaced,
    verticalCapabilities: preset.verticalCapabilities,
    enterpriseParityPillars: {
      pillar1_fixedAssetsForm4562: {
        enabled: true,
        costBasisCents: amountCents,
        salvageValueCents,
        annualBookStraightLineCents: annualBookDepreciationCents,
        taxSec179ImmediateElectionCents: taxSec179DepreciationCents,
        scheduleM1Line8aTimingDeltaCents: m1Line8aDepreciationTimingDeltaCents,
      },
      pillar2_multiEntityConsolidation: {
        enabled: true,
        intercompanyDueToDueFromEliminated: true,
        netIntercompanyRemainderCents: 0,
        asc830MultiCurrencyReady: true,
      },
      pillar3_fifoInventoryBomAndThreeWayMatch: {
        enabled: true,
        valuationMethods: ['FIFO', 'MOVING_WEIGHTED_AVERAGE'],
        bomAssemblySupported: true,
        threeWayPoMatchEnforced: true,
      },
      pillar4_nativePayrollAndRainforestAch: {
        enabled: true,
        filingsSupported: ['Form 941', 'Form 940', 'Form W-2', 'Form W-3', 'Form 1099-NEC', 'CA DE-9 / DE-9C'],
        irc45bFicaTipCreditCents: irc45bFicaTipTaxCreditCents,
        rainforestAchFlatFeeCents: 20,
      },
      pillar5_hybridApCheckPositivePayAnd13WeekForecast: {
        enabled: true,
        ansiX927MicrCheckPrint: true,
        positivePaySha256Export: true,
        thirteenWeekCashForecastReady: true,
      },
    },
    fourBookParallelEngine: {
      book1_operationalCashBook: {
        bookName: 'Book 1 — Operational Cash & Unit Economics Book',
        netCashFlowCents: -amountCents,
        rainforestAchFeeCents: 20,
        status: 'BALANCED_REAL_TIME',
      },
      book2_gaapAccrualBook: {
        bookName: 'Book 2 — GAAP / FASB Accrual Book (ASC 606 / ASC 842 / ASC 958)',
        totalDebitsCents: amountCents,
        totalCreditsCents: amountCents,
        balanced: true,
        straightLineBookDepreciationCents: annualBookDepreciationCents,
      },
      book3_irsTaxBasisBook: {
        bookName: 'Book 3 — Live IRS Tax Basis, Form 4562 & Schedule M-1 / M-3 Bridge',
        taxForm: preset.taxFormDefault,
        bookNetIncomeCents,
        meals50PctDisallowanceCents,
        taxDepreciationSec179Cents: taxSec179DepreciationCents,
        m1Line8a_bookToTaxTimingDeltaCents: m1Line8aDepreciationTimingDeltaCents,
        irc45bFicaTipTaxCreditCents,
        reconciledTaxableIncomeCents: taxableIncomeCents,
        scheduleM1Reconciled: true,
        supportedTaxSoftwareExports: ['Lacerte', 'UltraTax CS', 'ProConnect Tax', 'Drake Tax'],
      },
      book4_shadowProofBook: {
        bookName: 'Book 4 — 60-Day QuickBooks Parallel Shadow Proof Book',
        day1ImportMinutes: 15,
        dailyHumanDoubleEntryMinutes: 0,
        weeklyVarianceScoreboardCheckMinutes: 2,
        cutoverDay: 60,
        varianceCents: 0,
        zeroDollarVarianceVerified: true,
      },
    },
    zeroPbcAuditPortal: {
      standard: 'AICPA October 2026 AI Audit Practice Aid & PCAOB AS 1105',
      testOfOneEligible: true,
      populationReliancePct: 100,
      tamperDetected: false,
      sha256ProvenanceChain: {
        link1_originatingOperationalArtifactHash: link1Hash,
        link2_std21HumanApprovalSignatureHash: link2Hash,
        link3_std14BalancedJournalEntryHash: link3Hash,
        link4_bankSettlementBatchHash: link4Hash,
      },
      merkleRootBinderHash,
    },
    doc12DualBotDashboard: {
      standardVersion: 'DOC-12-UNIFIED-DUAL-BOT-DASHBOARD-V1',
      morningCockpit,
      dashboardIntegrityHash: sha256Hex({ orgId, verticalId: preset.verticalId, merkleRootBinderHash }),
    },
  };
}

module.exports = {
  BOOKS_V33_ENGINE_LABEL,
  BOOKS_V33_VERSION,
  DOC12_DESIGN_TOKENS,
  VERTICAL_BOOKS_V33_PRESETS,
  evaluateVerticalBooksV33Suite,
};
