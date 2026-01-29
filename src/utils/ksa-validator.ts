// Import only schema-level validation functions from GETS validator
export enum GetsError {
  // General Schema Errors (GETS-GEN)
  SCHEMA_VALIDATION_FAILED = 'GETS-GEN-001',
  INVALID_DOCUMENT_STRUCTURE = 'GETS-GEN-002',
  MISSING_REQUIRED_FIELD = 'GETS-GEN-003',
  INVALID_DATA_TYPE = 'GETS-GEN-004',
  INVALID_ENUM_VALUE = 'GETS-GEN-005',
  GENERIC_ERROR = 'GETS-GEN-006',

  // Meta Section Errors (GETS-META)
  INVALID_META_OPERATION = 'GETS-META-001',
  INVALID_META_MODE = 'GETS-META-002',
  MISSING_SOURCE_TYPE = 'GETS-META-003',
  MISSING_SOURCE_ID = 'GETS-META-004',
  INVALID_DESTINATION_TYPE = 'GETS-META-005',
  CONDITIONAL_DESTINATION_DETAILS_MISSING = 'GETS-META-006',
  EXPORT_CONSISTENCY = 'GETS-META-007',
  NOMINAL_CONSISTENCY = 'GETS-META-008',
  PREPAYMENT_CONSISTENCY = 'GETS-META-009',

  // Header Section Errors (GETS-HEAD)
  MISSING_INVOICE_ID = 'GETS-HEAD-001',
  INVALID_ISSUE_DATE_FORMAT = 'GETS-HEAD-002',
  MISSING_DOCUMENT_CURRENCY = 'GETS-HEAD-003',
  INVALID_INVOICE_TYPE_CODE = 'GETS-HEAD-004',
  INVALID_DOCUMENT_NUMBER_FORMAT = 'GETS-HEAD-005',
  FUTURE_ISSUE_DATE = 'GETS-HEAD-006',
  INVALID_EXCHANGE_RATE_FOREIGN = 'GETS-HEAD-007',
  ZERO_EXCHANGE_RATE = 'GETS-HEAD-008',
  MISSING_DOCUMENT_NUMBER = 'GETS-HEAD-009',
  DUPLICATE_DOCUMENT_NUMBER = 'GETS-HEAD-010',

  // Parties Section Errors (GETS-PARTY)
  MISSING_SELLER_PARTY = 'GETS-PARTY-001',
  MISSING_BUYER_PARTY = 'GETS-PARTY-002',
  MISSING_PARTY_NAME = 'GETS-PARTY-003',
  MISSING_PARTY_POSTAL_ADDRESS = 'GETS-PARTY-004',
  MISSING_BUYER_VAT_B2B = 'GETS-PARTY-005',
  MISSING_SELLER_VAT = 'GETS-PARTY-006',
  MISSING_PARTY_ADDRESS = 'GETS-PARTY-007',
  MISSING_PARTY_CONTACT = 'GETS-PARTY-008',
  INVALID_VAT_NUMBER = 'GETS-PARTY-009',

  // Items Section Errors (GETS-ITEM)
  EMPTY_ITEMS_ARRAY = 'GETS-ITEM-001',
  MISSING_ITEM_ID = 'GETS-ITEM-002',
  INVALID_ITEM_QUANTITY = 'GETS-ITEM-003',
  MISSING_ITEM_UNIT_CODE = 'GETS-ITEM-004',
  MISSING_ITEM_UNIT_PRICE = 'GETS-ITEM-005',
  MISSING_ITEM_PRICE_AMOUNT = 'GETS-ITEM-006',
  MISSING_ITEM_NAME = 'GETS-ITEM-007',
  NEGATIVE_ITEM_DISCOUNT = 'GETS-ITEM-008',
  INVALID_TAXABLE_AMOUNT_CALCULATION = 'GETS-ITEM-009',
  INVALID_VAT_AMOUNT_CALCULATION = 'GETS-ITEM-010',
  DUPLICATE_ITEM_IDS = 'GETS-ITEM-012',
  INCONSISTENT_VAT_RATES = 'GETS-ITEM-013',
  MISSING_ITEM_DESCRIPTION = 'GETS-ITEM-014',
  INVALID_ITEM_PRICE = 'GETS-ITEM-015',

  // TaxTotals Section Errors (GETS-TAX)
  MISSING_TAX_TOTALS = 'GETS-TAX-001',
  MISSING_TAX_AMOUNT_IN_TAX_TOTAL = 'GETS-TAX-002',

  // LegalMonetaryTotal Section Errors (GETS-TOTAL)
  MISSING_LEGAL_MONETARY_TOTAL = 'GETS-TOTAL-001',
  MISSING_LINE_EXTENSION_AMOUNT = 'GETS-TOTAL-002',
  MISSING_TAX_EXCLUSIVE_AMOUNT = 'GETS-TOTAL-003',
  MISSING_TAX_INCLUSIVE_AMOUNT = 'GETS-TOTAL-004',
  MISSING_PAYABLE_AMOUNT = 'GETS-TOTAL-005',

  // Business Logic Errors (GETS-BUSINESS)
  CREDIT_NOTE_REFERENCE_REQUIRED = 'GETS-BUSINESS-001',
  DEBIT_NOTE_REFERENCE_REQUIRED = 'GETS-BUSINESS-002',
  NOTE_ISSUANCE_REASON_REQUIRED = 'GETS-BUSINESS-003',
  DISCOUNT_VAT_CATEGORY_INCONSISTENCY = 'GETS-BUSINESS-004',
  NEGATIVE_DOCUMENT_DISCOUNT = 'GETS-BUSINESS-005',
  INVALID_DOCUMENT_TOTAL = 'GETS-BUSINESS-006',

  // Address Section Errors (GETS-ADDRESS)
  MISSING_ADDRESS_DETAILS = 'GETS-ADDRESS-001',
  INVALID_ADDRESS_FORMAT = 'GETS-ADDRESS-002',
  MISSING_BUILDING_NUMBER = 'GETS-ADDRESS-003',
  MISSING_DISTRICT = 'GETS-ADDRESS-004',
  INVALID_FORMAT = 'GETS-ADDRESS-005',

  // Payment Section Errors (GETS-PAYMENT)
  INVALID_PAYMENT_MEANS = 'GETS-PAYMENT-001',
  MISSING_PAYMENT_TERMS = 'GETS-PAYMENT-002',
  MISSING_EXCHANGE_RATE = 'GETS-PAYMENT-004',

  // Allowance/Charge Section Errors (GETS-ALLOWANCE)
  INVALID_ALLOWANCE_AMOUNT = 'GETS-ALLOWANCE-001',
  INVALID_CHARGE_AMOUNT = 'GETS-ALLOWANCE-002',
  MISSING_ALLOWANCE_REASON = 'GETS-ALLOWANCE-003',

  // Calculations Errors (GETS-CALC)
  INVALID_CALCULATION = 'GETS-CALC-001',
  INVALID_LINE_TAXABLE_VALUE_CALCULATION = 'GETS-CALC-002',
  INVALID_LINE_TAX_AMOUNT_CALCULATION = 'GETS-CALC-003',
  INVALID_TOTAL_LINE_TAXABLE_AMOUNT_CALCULATION = 'GETS-CALC-005',
  INVALID_TOTAL_ALLOWANCES_CALCULATION = 'GETS-CALC-006',
  INVALID_TOTAL_CHARGES_CALCULATION = 'GETS-CALC-007',
  INVALID_TOTAL_AMOUNT_EXCLUDING_TAX_CALCULATION = 'GETS-CALC-008',
  INVALID_TOTAL_TAX_AMOUNT_CALCULATION = 'GETS-CALC-009',
  INVALID_TOTAL_AMOUNT_INCLUDING_TAX_CALCULATION = 'GETS-CALC-010',
  INVALID_AMOUNT_DUE_CALCULATION = 'GETS-CALC-011',
  INVALID_LINE_TOTAL_CALCULATION = 'GETS-CALC-012',

  // Multi-language Errors (GETS-MLANG)
  INVALID_MULTI_LANG_STRING = 'GETS-MLANG-001',

  // Exchange Rate Errors (GETS-EXCH)
  INVALID_EXCHANGE_RATE = 'GETS-EXCH-001',
  INVALID_EXCHANGE_RATE_CURRENCIES = 'GETS-EXCH-002',

  // Tax ID Errors (GETS-TAXID)
  INVALID_TAX_IDS_FORMAT = 'GETS-TAXID-001',
  INVALID_TAX_ID_STRUCTURE = 'GETS-TAXID-002',
  MISSING_TAX_ID_TYPE = 'GETS-TAXID-003',
  MISSING_TAX_ID_VALUE = 'GETS-TAXID-004',

  // Line Items Errors (GETS-LINE)
  EMPTY_LINE_ITEMS_ARRAY = 'GETS-LINE-001',
  MISSING_LINE_ITEM_ID = 'GETS-LINE-002',
  MISSING_LINE_ITEM_DESCRIPTION = 'GETS-LINE-003',
  MISSING_LINE_ITEM_QUANTITY = 'GETS-LINE-004',
  MISSING_LINE_ITEM_PRICE = 'GETS-LINE-005',
  INVALID_TAX_RATE = 'GETS-LINE-006',
  INVALID_DISCOUNTS_CHARGES_FORMAT = 'GETS-LINE-007',
  INVALID_DISCOUNT_AMOUNT = 'GETS-LINE-008',

  // KSA Extensions Errors (GETS-KSA)
  INVALID_PREPAYMENT_FORMAT = 'GETS-KSA-001',
  MISSING_PREPAYMENT_ID = 'GETS-KSA-002',
  INVALID_PREPAYMENT_VAT_RATE = 'GETS-KSA-003',
  MISSING_PREPAYMENT_ISSUE_DATE = 'GETS-KSA-004',
  INVALID_PREPAYMENT_ISSUE_DATE_FORMAT = 'GETS-KSA-005',
  MISSING_PREPAYMENT_DOCUMENT_TYPE = 'GETS-KSA-006',
  INVALID_PREPAYMENT_DOCUMENT_TYPE = 'GETS-KSA-007',
  MISSING_PREPAYMENT_VAT_CATEGORY = 'GETS-KSA-008',
  INVALID_PREPAYMENT_VAT_CATEGORY = 'GETS-KSA-009',
  MISSING_PREPAYMENT_TAXABLE_AMOUNT = 'GETS-KSA-010',
  INVALID_PREPAYMENT_TAXABLE_AMOUNT = 'GETS-KSA-011',
  MISSING_PREPAYMENT_TAX_AMOUNT = 'GETS-KSA-012',
  INVALID_PREPAYMENT_TAX_AMOUNT = 'GETS-KSA-013',
  MISSING_PREPAYMENT_ADJUSTMENT_AMOUNT = 'GETS-KSA-014',
  INVALID_PREPAYMENT_ADJUSTMENT_AMOUNT = 'GETS-KSA-015',
  INVALID_PREPAYMENT_CALCULATION = 'GETS-KSA-016',
  DUPLICATE_PREPAYMENT_ID = 'GETS-KSA-017',
  INVALID_PREPAYMENT_ARRAY_FORMAT = 'GETS-KSA-018',

  // KSA Specific Errors (KSA-*)

  KSA_MISSING_BUILDING_NUMBER = 'KSA-ADDRESS-001',
  KSA_MISSING_DISTRICT = 'KSA-ADDRESS-002',
  KSA_MISSING_SELLER_ADDRESS = 'KSA-ADDRESS-003',
  KSA_MISSING_BUYER_ADDRESS = 'KSA-ADDRESS-004',

  // Prepayment Errors (PREPAYMENT-*)
  PREPAYMENT_MISSING_PAYMENT_ID = 'PREPAYMENT-001',
  PREPAYMENT_MISSING_ISSUE_DATE = 'PREPAYMENT-002',
  PREPAYMENT_INVALID_VAT_CALCULATION = 'PREPAYMENT-003',
  PREPAYMENT_INVALID_ADJUSTMENT_AMOUNT = 'PREPAYMENT-004',
}

export const EPSILON = 0.1; // For floating-point comparisons
export const KSA_BUILDING_NUMBER_REGEX = /^[0-9]+$/;
export const KSA_CURRENCY_CODES = new Set(['SAR', 'USD', 'EUR', 'GBP', 'AED']);
export const KSA_EXEMPTION_REASON_CODES = new Set(['VATEX-SA-29', 'VATEX-SA-30', 'VATEX-SA-31', 'VATEX-SA-32', 'VATEX-SA-33', 'VATEX-SA-34', 'VATEX-SA-35', 'VATEX-SA-36']);
export const KSA_INVOICE_TYPES = new Set(['388', '381', '383']);
export const KSA_MEASUREMENT_CODES = new Set(['EA', 'KGM', 'LTR', 'MTR', 'BOX', 'PKG', 'UNT', 'HUR', 'DAY', 'MON', 'ANN']);
export const KSA_PAYMENT_MEANS_CODES = new Set(['10', '30', '42', '48', '58']);
export const KSA_POSTAL_CODE_REGEX = /^[0-9]{5}$/;
export const KSA_TAX_CATEGORIES = new Set(['S', 'Z', 'E', 'O']);
export const KSA_TAX_PERCENTAGES: Record<string, number[]> = {
  'S': [15],
  'Z': [0],
  'E': [0],
  'O': [0]
};
export const KSA_VAT_NUMBER_REGEX = /^[0-9]{15}$/;


/**
 * Validates financial calculations across the document (KSA-specific)
 */
export const validateFinancialCalculations = (
  documentContent: DocumentContentType,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  console.log(`💰 Financial Calculations Validation - Starting...`);

  const lineItems = documentContent.lineItems || [];
  const totals = documentContent.totals;
  const taxTotals = documentContent.taxTotals || [];
  const allowancesAndCharges = documentContent.allowancesAndCharges || [];

  console.log(`💰 Financial Validation - Line items: ${lineItems.length}, Tax totals: ${taxTotals.length}, Allowances/Charges: ${allowancesAndCharges.length}`);

  // Calculate expected totals from line items
  let expectedLineTaxableAmount = 0;
  let expectedTaxAmount = 0;
  let expectedAllowanceAmount = 0;
  let expectedChargeAmount = 0;

  console.log(`💰 Financial Validation - Calculating totals from ${lineItems.length} line items...`);

  // Calculate from line items
  lineItems.forEach((item: any, index: number) => {
    console.log(`💰 Financial Validation - Processing line item ${index + 1}/${lineItems.length}`);
    const quantity = item.quantity || 0;
    const unitPrice = item.price?.amount || item.unitPrice || 0;
    const lineTaxableValue = item.lineTaxableValue || 0;
    const taxAmount = item.taxAmount || 0;
    const lineTotal = item.lineTotal || 0;

    // Validate line taxable value calculation
    if (lineTaxableValue !== undefined) {
      const expectedLineTaxableValue = quantity * unitPrice;
      console.log(`💰 Line Item ${index + 1} - Taxable value: expected ${expectedLineTaxableValue}, actual ${lineTaxableValue}`);
      if (Math.abs(lineTaxableValue - expectedLineTaxableValue) > EPSILON) {
        console.log(`❌ Line Item ${index + 1} - Taxable value mismatch`);
        errors.push({
          method,
          path: ['lineItems', index, 'lineTaxableValue'],
          code: GetsError.INVALID_LINE_TAXABLE_VALUE_CALCULATION,
          message: `KSA: Line taxable value calculation mismatch. Expected: ${expectedLineTaxableValue}, Actual: ${lineTaxableValue}`,
        });
      } else {
        console.log(`✅ Line Item ${index + 1} - Taxable value correct`);
      }
      expectedLineTaxableAmount += lineTaxableValue;
    }

    // Validate tax amount calculation
    if (taxAmount !== undefined && item.taxRate !== undefined) {
      const expectedTaxAmountForLine = lineTaxableValue * (item.taxRate / 100);
      console.log(`💰 Line Item ${index + 1} - Tax amount: expected ${expectedTaxAmountForLine}, actual ${taxAmount}`);
      if (Math.abs(taxAmount - expectedTaxAmountForLine) > EPSILON) {
        console.log(`❌ Line Item ${index + 1} - Tax amount mismatch`);
        errors.push({
          method,
          path: ['lineItems', index, 'taxAmount'],
          code: GetsError.INVALID_LINE_TAX_AMOUNT_CALCULATION,
          message: `KSA: Line tax amount calculation mismatch. Expected: ${expectedTaxAmountForLine}, Actual: ${taxAmount}`,
        });
      } else {
        console.log(`✅ Line Item ${index + 1} - Tax amount correct`);
      }
      expectedTaxAmount += taxAmount;
    }

    // Validate line total calculation
    if (lineTotal !== undefined) {
      const expectedLineTotal = lineTaxableValue + taxAmount;
      console.log(`💰 Line Item ${index + 1} - Line total: expected ${expectedLineTotal}, actual ${lineTotal}`);
      if (Math.abs(lineTotal - expectedLineTotal) > EPSILON) {
        console.log(`❌ Line Item ${index + 1} - Line total mismatch`);
        errors.push({
          method,
          path: ['lineItems', index, 'lineTotal'],
          code: GetsError.INVALID_LINE_TOTAL_CALCULATION,
          message: `KSA: Line total calculation mismatch. Expected: ${expectedLineTotal}, Actual: ${lineTotal}`,
        });
      } else {
        console.log(`✅ Line Item ${index + 1} - Line total correct`);
      }
    }
  });

  // Calculate from allowances and charges
  allowancesAndCharges.forEach((item: any, index: number) => {
    if (item.isCharge) {
      expectedChargeAmount += item.amount || 0;
    } else {
      expectedAllowanceAmount += item.amount || 0;
    }
  });

  // Validate document totals
  if (totals) {
    // Validate total line taxable amount
    if (totals.totalLineTaxableAmount !== undefined) {
      if (Math.abs(totals.totalLineTaxableAmount - expectedLineTaxableAmount) > EPSILON) {
        errors.push({
          method,
          path: ['totals', 'totalLineTaxableAmount'],
          code: GetsError.INVALID_TOTAL_LINE_TAXABLE_AMOUNT_CALCULATION,
          message: `KSA: Total line taxable amount calculation mismatch. Expected: ${expectedLineTaxableAmount}, Actual: ${totals.totalLineTaxableAmount}`,
        });
      }
    }

    // Validate total charges (document-level charges)

    // Validate total amount excluding tax
    if (totals.totalAmountExcludingTax !== undefined) {
      // Document-level allowances should be subtracted from taxable amount
      const documentLevelAllowances = totals.totalAllowances || 0;
      const documentLevelCharges = totals.totalCharges || 0;
      const expectedTotalExcludingTax =
        expectedLineTaxableAmount -
        expectedAllowanceAmount -
        documentLevelAllowances +
        expectedChargeAmount +
        documentLevelCharges;
      if (Math.abs(totals.totalAmountExcludingTax - expectedTotalExcludingTax) > EPSILON) {
        errors.push({
          method,
          path: ['totals', 'totalAmountExcludingTax'],
          code: GetsError.INVALID_TOTAL_AMOUNT_EXCLUDING_TAX_CALCULATION,
          message: `KSA: Total amount excluding tax calculation mismatch. Expected: ${expectedTotalExcludingTax}, Actual: ${totals.totalAmountExcludingTax}`,
        });
      }
    }

    // Validate total tax amount
    if (totals.totalTaxAmount !== undefined) {
      if (Math.abs(totals.totalTaxAmount - expectedTaxAmount) > EPSILON) {
        errors.push({
          method,
          path: ['totals', 'totalTaxAmount'],
          code: GetsError.INVALID_TOTAL_TAX_AMOUNT_CALCULATION,
          message: `KSA: Total tax amount calculation mismatch. Expected: ${expectedTaxAmount}, Actual: ${totals.totalTaxAmount}`,
        });
      }
    }

    // Validate total amount including tax
    if (
      totals.totalAmountIncludingTax !== undefined &&
      totals.totalAmountExcludingTax !== undefined
    ) {
      const expectedTotalIncludingTax = totals.totalAmountExcludingTax + totals.totalTaxAmount;
      if (Math.abs(totals.totalAmountIncludingTax - expectedTotalIncludingTax) > EPSILON) {
        errors.push({
          method,
          path: ['totals', 'totalAmountIncludingTax'],
          code: GetsError.INVALID_TOTAL_AMOUNT_INCLUDING_TAX_CALCULATION,
          message: `KSA: Total amount including tax calculation mismatch. Expected: ${expectedTotalIncludingTax}, Actual: ${totals.totalAmountIncludingTax}`,
        });
      }
    }

    // Validate amount due
    if (totals.amountDue !== undefined && totals.totalAmountIncludingTax !== undefined) {
      const expectedAmountDue = totals.totalAmountIncludingTax - (totals.prepaidAmount || 0);
      if (Math.abs(totals.amountDue - expectedAmountDue) > EPSILON) {
        errors.push({
          method,
          path: ['totals', 'amountDue'],
          code: GetsError.INVALID_AMOUNT_DUE_CALCULATION,
          message: `KSA: Amount due calculation mismatch. Expected: ${expectedAmountDue}, Actual: ${totals.amountDue}`,
        });
      }
    }
  }
};

// Define regex patterns for standard formats
export const KSA_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
export const KSA_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)\.\d{3}Z$/; // HH:mm:ss.SSSZ
export const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Standard email regex: requires local part, @ symbol, domain, and top-level domain
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Updated interface for new GETS document structure
export interface GetsDocument {
  meta?: {
    operation?: string;
    mode?: string;
    version?: string;
    config?: {
      isExport?: boolean;
      isSummary?: boolean;
      isNominal?: boolean;
      isB2B?: boolean;
      isReceipt?: boolean;
      isSelfBilled?: boolean;
      isPrepayment?: boolean;
      isAdjustable?: boolean;
      isSimplified?: boolean;
      isThirdParty?: boolean;
    };
    source?: {
      type: string;
      id: string;
      name: string;
      version: string;
    };
    destinations?: Array<{
      type: string;
      details: {
        country: string;
        authority: string;
      };
    }>;
    customFields?: {
      sa_isSimplifiedInvoice?: boolean;
      sa_isExportInvoice?: boolean;
      sa_isSelfBilled?: boolean;
      sa_isThirdParty?: boolean;
      sa_isSummary?: boolean;
      sa_isNominal?: boolean;
      sa_isPrepayment?: boolean;
      sa_icv?: string;
      sa_pih?: string;
      sa_qrCode?: string;
    };
  };
  header?: {
    documentNumber?: string;
    documentType?: string;
    issueDate?: string;
    issueTime?: string;
    dueDate?: string;
    currency?: string;
    language?: string;
    exchangeRate?: {
      rate?: number;
      sourceCurrency?: string;
      targetCurrency?: string;
    };
    invoicePeriod?: {
      startDate?: string;
      endDate?: string;
    };
    referenceId?: string;
    noteIssuanceReason?: string;
  };
  parties?: {
    seller?: {
      name?: string | Record<string, string>;
      taxIds?: Array<{
        type: string;
        value: string;
      }>;
      registrationNumbers?: Array<{
        type: string;
        value: string;
      }>;
      address?: {
        addressLine1?: string;
        addressLine2?: string;
        additionalAddressData?: {
          buildingNumber?: string;
          additionalBuildingNumber?: string;
          district?: string;
        };
        city?: string;
        stateOrProvince?: string;
        postalCode?: string;
        country?: string;
      };
      contact?: {
        name?: string;
        telephone?: string;
        email?: string;
      };
    };
    buyer?: {
      name?: string | Record<string, string>;
      taxIds?: Array<{
        type: string;
        value: string;
      }>;
      registrationNumbers?: Array<{
        type: string;
        value: string;
      }>;
      address?: {
        addressLine1?: string;
        addressLine2?: string;
        additionalAddressData?: {
          buildingNumber?: string;
          additionalBuildingNumber?: string;
          district?: string;
        };
        city?: string;
        stateOrProvince?: string;
        postalCode?: string;
        country?: string;
      };
      contact?: {
        name?: string;
        telephone?: string;
        email?: string;
      };
    };
  };
  lineItems?: Array<{
    id?: string;
    description?: string | Record<string, string>;
    quantity?: number;
    unitCode?: string;
    price?: {
      amount?: number;
    };
    unitPrice?: number;
    netPrice?: number;
    discountsOrCharges?: Array<{
      id?: string;
      isCharge?: boolean;
      reason?: string | Record<string, string>;
      amount?: number;
    }>;
    lineLevelDiscount?: number;
    lineTaxableValue?: number;
    taxCategory?: string;
    taxRate?: number;
    taxAmount?: number;
    taxExemptionReason?: string | Record<string, string>;
    taxExemptionReasonCode?: string;
    lineTotal?: number;
    lineType?: string;
  }>;
  allowancesAndCharges?: Array<{
    id?: string;
    isCharge?: boolean;
    reason?: string | Record<string, string>;
    reasonCode?: string;
    amount?: number;
    baseAmount?: number;
    percent?: number;
    taxCategory?: string;
    taxRate?: number;
    taxAmount?: number;
  }>;
  payment?: {
    paymentMeans?: Array<{
      paymentMeansCode?: string;
      paymentMeansText?: string;
      paymentId?: string;
    }>;
    paymentTerms?: Array<{
      note?: string;
    }>;
    exchangeRate?: {
      rate?: number;
      sourceCurrency?: string;
      targetCurrency?: string;
    };
    prepaidPayments?: Array<{
      id?: string;
      paidAmount?: number;
      receivedDate?: string;
      taxableAmount?: number;
      taxRate?: number;
      taxAmount?: number;
    }>;
  };
  taxTotals?: Array<{
    taxAmount?: number;
    taxCategory?: {
      id?: string;
      percent?: number;
    };
  }>;
  totals?: {
    totalLineTaxableAmount?: number;
    totalAllowances?: number;
    totalCharges?: number;
    totalAmountExcludingTax?: number;
    totalTaxAmount?: number;
    totalAmountIncludingTax?: number;
    prepaidAmount?: number;
    amountDue?: number;
    roundingAmount?: number;
  };
  extensions?: {
    sa_prepayment?: Array<{
      paymentId?: string;
      issueDate?: string;
      documentType?: string;
      vatCategory?: string;
      vatRate?: number;
      taxableAmount?: number;
      taxAmount?: number;
      adjustmentAmount?: number;
    }>;
    sa_digital?: {
      icv?: string;
      pih?: string;
      qrCode?: string;
      digitalSignature?: string;
    };
  };
  payloadId?: string;
  sourceId?: string;
  country?: string;
  documentType?: string;
  documentStatus?: string;
  clientId?: string;
}

// Type alias for the new GETS document structure
export type KsaDocument = GetsDocument;


/**
 * Validates KSA-specific line item rules
 */
export const validateLineItemRules = (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  console.log(`📦 Line Item Validation - Starting...`);

  const lineItems = invoice.lineItems || [];
  const isExport = !!(
    invoice.meta?.config?.isExport || invoice.meta?.customFields?.sa_isExportInvoice
  );

  console.log(`📦 Line Item Validation - Found ${lineItems.length} line items, isExport: ${isExport}`);

  if (lineItems.length === 0) {
    console.log(`❌ Line Item Validation - No line items found`);
    errors.push({
      method,
      path: ['lineItems'],
      code: GetsError.EMPTY_LINE_ITEMS_ARRAY,
      message: 'KSA: At least one line item is required',
    });
    return;
  }

  // Check if this is a nominal supply
  const isNominalSupply = invoice.meta?.customFields?.sa_isNominal || false;
  console.log(`📦 Line Item Validation - Nominal supply: ${isNominalSupply}`);

  lineItems.forEach((item, index) => {
    console.log(`📦 Line Item Validation - Validating item ${index + 1}/${lineItems.length}`);
    const itemPath = ['lineItems', index];

    // 1. Check line item description
    if (
      !item.description ||
      (typeof item.description === 'string' && item.description.trim() === '')
    ) {
      console.log(`❌ Line Item ${index + 1} - Missing description`);
      errors.push({
        method,
        path: [...itemPath, 'description'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Line item description is mandatory.',
      });
    } else {
      console.log(`✅ Line Item ${index + 1} - Description: "${item.description?.substring(0, 50)}..."`);
    }

    // 2. Quantity must be present and > 0
    if (item.quantity === undefined || item.quantity === null) {
      console.log(`❌ Line Item ${index + 1} - Missing quantity`);
      errors.push({
        method,
        path: [...itemPath, 'quantity'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Line item quantity is mandatory.',
      });
    } else if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      console.log(`❌ Line Item ${index + 1} - Invalid quantity: ${item.quantity}`);
      errors.push({
        method,
        path: [...itemPath, 'quantity'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Line item quantity must be a positive number.',
      });
    } else {
      console.log(`✅ Line Item ${index + 1} - Quantity: ${item.quantity}`);
    }

    // 3. Check unit price
    if (item.price?.amount === undefined) {
      console.log(`❌ Line Item ${index + 1} - Missing unit price`);
      errors.push({
        method,
        path: [...itemPath, 'price', 'amount'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Line item price is mandatory.',
      });
    } else if (item.price?.amount <= 0 && !isNominalSupply) {
      console.log(`❌ Line Item ${index + 1} - Invalid unit price: ${item.price.amount}`);
      errors.push({
        method,
        path: [...itemPath, 'price', 'amount'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Line item price must be greater than zero.',
      });
    } else {
      console.log(`✅ Line Item ${index + 1} - Unit price: ${item.price.amount}`);
    }

    // 4. Check unit code
    const unitCode = item.unitCode;
    if (!unitCode) {
      errors.push({
        method,
        path: [...itemPath, 'unitCode'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Unit code is mandatory.',
      });
    } else if (!KSA_MEASUREMENT_CODES.has(unitCode.toUpperCase())) {
      errors.push({
        method,
        path: [...itemPath, 'unitCode'],
        code: GetsError.GENERIC_ERROR,
        message: `KSA: Invalid unit of measure code. Must be one of [${Array.from(KSA_MEASUREMENT_CODES).join(', ')}].`,
      });
    }

    // 5. Check tax category
    if (!item.taxCategory) {
      errors.push({
        method,
        path: [...itemPath, 'taxCategory'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Tax category is mandatory.',
      });
    } else if (!KSA_TAX_CATEGORIES.has(item.taxCategory)) {
      errors.push({
        method,
        path: [...itemPath, 'taxCategory'],
        code: GetsError.GENERIC_ERROR,
        message: `KSA: Invalid tax category. Must be one of [${Array.from(KSA_TAX_CATEGORIES).join(', ')}].`,
      });
    }

    // 6. Check tax rate based on category and enforce export rules
    if (item.taxCategory && item.taxRate !== undefined) {
      const validPercentages = KSA_TAX_PERCENTAGES[item.taxCategory];
      if (validPercentages && !validPercentages.includes(item.taxRate)) {
        errors.push({
          method,
          path: [...itemPath, 'taxRate'],
          code: GetsError.GENERIC_ERROR,
          message: `KSA: For tax category ${item.taxCategory}, tax rate must be one of [${validPercentages.join(', ')}].`,
        });
      }
    }

    // 6.1 Export invoices must have zero-rated lines (Z)
    if (isExport && item.taxCategory && item.taxCategory.toUpperCase() !== 'Z') {
      errors.push({
        method,
        path: [...itemPath, 'taxCategory'],
        code: GetsError.GENERIC_ERROR,
        message: "KSA: When Export invoice is selected, VatCategoryCode must be 'Z'.",
      });
    }

    // 6.2 Exemption reason/code pairing for non-standard categories
    if (item.taxCategory && item.taxCategory !== 'S') {
      const reason = (item as any).taxExemptionReason;
      const reasonCode = (item as any).taxExemptionReasonCode;

      if (!reason || (typeof reason === 'string' && reason.trim() === '')) {
        errors.push({
          method,
          path: [...itemPath, 'taxExemptionReason'],
          code: GetsError.GENERIC_ERROR,
          message:
            'KSA: VatExemptionReason must be included for Zero, Exempted, and Out of Scope VAT.',
        });
      }
      if (!reasonCode || (typeof reasonCode === 'string' && reasonCode.trim() === '')) {
        errors.push({
          method,
          path: [...itemPath, 'taxExemptionReasonCode'],
          code: GetsError.GENERIC_ERROR,
          message:
            'KSA: VatExemptionReasonCode is required for Zero, Exempted, and Out of Scope VAT.',
        });
      } else if (!KSA_EXEMPTION_REASON_CODES.has(reasonCode)) {
        errors.push({
          method,
          path: [...itemPath, 'taxExemptionReasonCode'],
          code: GetsError.GENERIC_ERROR,
          message: `KSA: Invalid VatExemptionReasonCode '${reasonCode}'.`,
        });
      }

      // Category-specific rate checks
      if (item.taxCategory === 'E' && item.taxRate !== 0) {
        errors.push({
          method,
          path: [...itemPath, 'taxRate'],
          code: GetsError.GENERIC_ERROR,
          message: "KSA: VatCategoryCode is 'E', VatRateOnLineItem is expected to be 0.",
        });
      }
      if (item.taxCategory === 'Z' && item.taxRate !== 0) {
        errors.push({
          method,
          path: [...itemPath, 'taxRate'],
          code: GetsError.GENERIC_ERROR,
          message: "KSA: VatCategoryCode is 'Z', VatRateOnLineItem is expected to be 0.",
        });
      }
      if (item.taxCategory === 'O' && item.taxRate !== 0) {
        errors.push({
          method,
          path: [...itemPath, 'taxRate'],
          code: GetsError.GENERIC_ERROR,
          message: "KSA: VatCategoryCode is 'O', VatRateOnLineItem is expected to be 0.",
        });
      }
    }

    // 7. Validate line taxable value calculation (consider discounts and charges)
    if (
      item.quantity !== undefined &&
      (item.price?.amount !== undefined || item.unitPrice !== undefined) &&
      item.lineTaxableValue !== undefined
    ) {
      const unitPrice = item.price?.amount !== undefined ? item.price.amount : item.unitPrice;
      const qty = Number(item.quantity);
      let expectedLineTaxableValue = Number(unitPrice) * qty;

      // Optional line-level discounts/charges applied per unit
      if (Array.isArray(item.discountsOrCharges) && item.discountsOrCharges.length > 0) {
        item.discountsOrCharges.forEach((ac: any) => {
          const amountPerUnit = Number(ac?.amount) || 0;
          const delta = amountPerUnit * qty;
          if (ac?.isCharge === true) {
            expectedLineTaxableValue += delta;
          } else if (ac?.isCharge === false) {
            expectedLineTaxableValue -= delta;
          }
        });
      }
      // Optional total line discount
      if (item.lineLevelDiscount !== undefined && item.lineLevelDiscount !== null) {
        const lineLevelDiscount = Number(item.lineLevelDiscount) || 0;
        expectedLineTaxableValue -= lineLevelDiscount;
      }
      expectedLineTaxableValue = parseFloat(expectedLineTaxableValue.toFixed(2));
      const actual = parseFloat(Number(item.lineTaxableValue).toFixed(2));

      if (Math.abs(expectedLineTaxableValue - actual) > EPSILON) {
        errors.push({
          method,
          path: [...itemPath, 'lineTaxableValue'],
          code: GetsError.GENERIC_ERROR,
          message: `KSA: Line taxable value mismatch. Expected ${expectedLineTaxableValue.toFixed(2)} after discounts/charges, found ${actual.toFixed(2)}.`,
        });
      }
    }
  });

  // Validate maximum line items (limit to 1000 as per KSA regulations)
  if (lineItems.length > 1000) {
    errors.push({
      method,
      path: ['lineItems'],
      code: GetsError.GENERIC_ERROR,
      message: 'KSA: Number of line items exceeds the maximum limit of 1000.',
    });
  }
};

/**
 * Validates KSA-specific party rules
 */
export const validatePartyRules = (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  console.log(`👥 Party Validation - Starting...`);

  const seller = invoice.parties?.seller;
  const buyer = invoice.parties?.buyer;
  const isExport =
    invoice.meta?.config?.isExport || !!invoice.meta?.customFields?.sa_isExportInvoice || false;
  const isSelfBilled =
    invoice.meta?.config?.isSelfBilled || !!invoice.meta?.customFields?.sa_isSelfBilled || false;
  const isThirdParty = !!invoice.meta?.config?.isThirdParty;
  const isB2B = invoice.meta?.config?.isB2B || false;
  const documentType = invoice.documentType;

  console.log(`👥 Party Validation - Export: ${isExport}, Self-billed: ${isSelfBilled}, B2B: ${isB2B}, Doc type: ${documentType}`);

  // Validate seller
  if (!seller) {
    console.log(`❌ Party Validation - Missing seller party`);
    errors.push({
      method,
      path: ['parties', 'seller'],
      code: GetsError.MISSING_SELLER_PARTY,
      message: 'KSA: Seller party is mandatory',
    });
    return;
  }
  console.log(`✅ Party Validation - Seller party found`);

  // Validate seller name
  if (!seller.name) {
    console.log(`❌ Party Validation - Missing seller name`);
    errors.push({
      method,
      path: ['parties', 'seller', 'name'],
      code: GetsError.MISSING_PARTY_NAME,
      message: 'KSA: Seller name is mandatory',
    });
  } else {
    console.log(`✅ Party Validation - Seller name: "${seller.name}"`);
  }

  // Validate seller VAT number
  if (!seller.taxIds || seller.taxIds.length === 0) {
    errors.push({
      method,
      path: ['parties', 'seller', 'taxIds'],
      code: GetsError.MISSING_SELLER_VAT,
      message: 'KSA: Seller VAT number is mandatory',
    });
  } else {
    const vatNumber = seller.taxIds.find((taxId) => taxId.type === 'VAT');
    if (!vatNumber || !vatNumber.value) {
      errors.push({
        method,
        path: ['parties', 'seller', 'taxIds'],
        code: GetsError.MISSING_SELLER_VAT,
        message: 'KSA: Seller VAT number is mandatory',
      });
    } else if (!KSA_VAT_NUMBER_REGEX.test(vatNumber.value)) {
      errors.push({
        method,
        path: ['parties', 'seller', 'taxIds'],
        code: GetsError.INVALID_VAT_NUMBER,
        message: 'KSA: Invalid seller VAT number format',
      });
    }
  }

  // Validate seller address
  if (!isExport) {
    if (!seller.address) {
      errors.push({
        method,
        path: ['parties', 'seller', 'address'],
        code: GetsError.MISSING_PARTY_POSTAL_ADDRESS,
        message: 'KSA: Seller address is mandatory for domestic transactions',
      });
    } else {
      validatePostalAddress(
        seller.address,
        ['parties', 'seller', 'address'],
        errors,
        method,
        isExport,
        isB2B
      );
    }
  }

  // Validate seller contact email if present
  if (seller.contact?.email) {
    if (!EMAIL_REGEX.test(seller.contact.email)) {
      errors.push({
        method,
        path: ['parties', 'seller', 'contact', 'email'],
        code: GetsError.INVALID_FORMAT,
        message: 'KSA: Invalid seller email format',
      });
    }
  }

  // Validate buyer (required for B2B transactions)
  if (documentType && documentType.includes('tax_invoice') && !isExport) {
    if (!buyer) {
      errors.push({
        method,
        path: ['parties', 'buyer'],
        code: GetsError.MISSING_BUYER_PARTY,
        message: 'KSA: Buyer party is mandatory for B2B transactions',
      });
    } else {
      // Validate buyer name
      if (!buyer.name) {
        errors.push({
          method,
          path: ['parties', 'buyer', 'name'],
          code: GetsError.MISSING_PARTY_NAME,
          message: 'KSA: Buyer name is mandatory for B2B transactions',
        });
      }

      // Validate buyer VAT number only for B2B transactions
      if (isB2B) {
        if (!buyer.taxIds || buyer.taxIds.length === 0) {
          errors.push({
            method,
            path: ['parties', 'buyer', 'taxIds'],
            code: GetsError.MISSING_BUYER_VAT_B2B,
            message: 'KSA: Buyer VAT number is mandatory for B2B transactions',
          });
        } else {
          const vatNumber = buyer.taxIds.find((taxId) => taxId.type === 'VAT');
          if (!vatNumber || !vatNumber.value) {
            errors.push({
              method,
              path: ['parties', 'buyer', 'taxIds'],
              code: GetsError.MISSING_BUYER_VAT_B2B,
              message: 'KSA: Buyer VAT number is mandatory for B2B transactions',
            });
          } else if (!KSA_VAT_NUMBER_REGEX.test(vatNumber.value)) {
            errors.push({
              method,
              path: ['parties', 'buyer', 'taxIds'],
              code: GetsError.INVALID_VAT_NUMBER,
              message: 'KSA: Invalid buyer VAT number format',
            });
          }
        }
      }
      // For B2C transactions, VAT number validation is optional
      // If VAT number is provided, validate its format
      else if (buyer.taxIds && buyer.taxIds.length > 0) {
        const vatNumber = buyer.taxIds.find((taxId) => taxId.type === 'VAT');
        if (vatNumber && vatNumber.value && !KSA_VAT_NUMBER_REGEX.test(vatNumber.value)) {
          errors.push({
            method,
            path: ['parties', 'buyer', 'taxIds'],
            code: GetsError.INVALID_VAT_NUMBER,
            message: 'KSA: Invalid buyer VAT number format',
          });
        }
      }

      // Buyer address optional for simplified (B2C): validate if present; mandatory for B2B
      if (isB2B) {
        if (!buyer.address) {
          errors.push({
            method,
            path: ['parties', 'buyer', 'address'],
            code: GetsError.MISSING_PARTY_POSTAL_ADDRESS,
            message: 'KSA: Buyer address is mandatory for B2B transactions',
          });
        } else {
          validatePostalAddress(
            buyer.address,
            ['parties', 'buyer', 'address'],
            errors,
            method,
            isExport,
            true
          );
        }
      } else if (buyer.address) {
        // Simplified: address is optional, but if provided we validate its content
        validatePostalAddress(
          buyer.address,
          ['parties', 'buyer', 'address'],
          errors,
          method,
          isExport,
          false
        );
      }

      // Validate buyer contact email if present
      if (buyer.contact?.email) {
        if (!EMAIL_REGEX.test(buyer.contact.email)) {
          errors.push({
            method,
            path: ['parties', 'buyer', 'contact', 'email'],
            code: GetsError.INVALID_FORMAT,
            message: 'KSA: Invalid buyer email format',
          });
        }
      }
    }
  }

  // Special billing agreement rules (mirror Spring)
  if (isSelfBilled && isThirdParty) {
    errors.push({
      method,
      path: ['meta', 'customFields'],
      code: GetsError.GENERIC_ERROR,
      message:
        'KSA: Self-billing and third-party billing are not allowed together on the same invoice.',
    });
  }

  // Self-billing only for B2B (not simplified)
  if (isSelfBilled && !isB2B) {
    errors.push({
      method,
      path: ['meta', 'config', 'isSelfBilled'],
      code: GetsError.GENERIC_ERROR,
      message: 'KSA: Self Billing option is only allowed for Standard Tax Invoice (B2B).',
    });
  }

  // Export rules: buyer cannot be Saudi Arabia and must have additional identification
  if (isExport) {
    const buyerCountry = buyer?.address?.country;
    if (buyerCountry === 'SA' || buyerCountry === 'Saudi Arabia') {
      errors.push({
        method,
        path: ['parties', 'buyer', 'address', 'country'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Export is selected, but Buyer country is Saudi Arabia.',
      });
    }
    // Require buyer identifications (as a proxy for AdditionalBuyerIdType/Number)
    const hasIdentification =
      Array.isArray((buyer as any)?.registrationNumbers) &&
      ((buyer as any).registrationNumbers as any[]).length > 0;
    if (!hasIdentification) {
      errors.push({
        method,
        path: ['parties', 'buyer', 'registrationNumbers'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: For export invoice, Additional Buyer Identification is required.',
      });
    }

    // Validate buyer contact email if present (for export invoices)
    if (buyer?.contact?.email) {
      if (!EMAIL_REGEX.test(buyer.contact.email)) {
        errors.push({
          method,
          path: ['parties', 'buyer', 'contact', 'email'],
          code: GetsError.INVALID_FORMAT,
          message: 'KSA: Invalid buyer email format',
        });
      }
    }
  }
};

/**
 * Validates postal address for KSA requirements
 */
export const validatePostalAddress = (
  address: any,
  path: (string | number)[],
  errors: ValidationErrorDetail[],
  method: string,
  isExport: boolean,
  isB2B: boolean
): void => {
  if (!isExport) {
    // Validate building number
    if (!address.additionalAddressData?.buildingNumber) {
      if (isB2B) {
        errors.push({
          method,
          path: [...path, 'additionalAddressData', 'buildingNumber'],
          code: GetsError.KSA_MISSING_BUILDING_NUMBER,
          message: 'KSA: Building number is mandatory for domestic addresses',
        });
      }
    } else if (!KSA_BUILDING_NUMBER_REGEX.test(address.additionalAddressData.buildingNumber)) {
      errors.push({
        method,
        path: [...path, 'additionalAddressData', 'buildingNumber'],
        code: GetsError.INVALID_FORMAT,
        message: 'KSA: Invalid building number format',
      });
    }

    // Validate district
    if (!address.additionalAddressData?.district) {
      if (isB2B) {
        errors.push({
          method,
          path: [...path, 'additionalAddressData', 'district'],
          code: GetsError.KSA_MISSING_DISTRICT,
          message: 'KSA: District is mandatory for domestic addresses',
        });
      }
    }
    // else if (!KSA_DISTRICTS.has(address.additionalAddressData.district)) {
    //   errors.push({
    //     method, path: [...path, 'additionalAddressData', 'district'],
    //     code: GetsError.INVALID_FORMAT,
    //     message: `KSA: Invalid district. Must be one of [${Array.from(KSA_DISTRICTS).join(', ')}]`
    //   });
    // }

    // Validate city
    if (!address.city) {
      if (isB2B) {
        errors.push({
          method,
          path: [...path, 'city'],
          code: GetsError.MISSING_ADDRESS_DETAILS,
          message: 'KSA: City is mandatory for domestic addresses',
        });
      }
    }

    // Validate postal code
    if (!address.postalCode) {
      if (isB2B) {
        errors.push({
          method,
          path: [...path, 'postalCode'],
          code: GetsError.MISSING_ADDRESS_DETAILS,
          message: 'KSA: Postal code is mandatory for domestic addresses',
        });
      }
    } else if (!KSA_POSTAL_CODE_REGEX.test(address.postalCode)) {
      errors.push({
        method,
        path: [...path, 'postalCode'],
        code: GetsError.INVALID_FORMAT,
        message: 'KSA: Invalid postal code format it should be a 5 digit number value!',
      });
    }
  }

  // Validate country
  if (!address.country) {
    if (isB2B) {
      errors.push({
        method,
        path: [...path, 'country'],
        code: GetsError.MISSING_ADDRESS_DETAILS,
        message: 'KSA: Country is mandatory',
      });
    }
  } else if (address.country !== 'SA' && !isExport) {
    errors.push({
      method,
      path: [...path, 'country'],
      code: GetsError.INVALID_FORMAT,
      message: 'KSA: Country must be SA for domestic transactions',
    });
  }
};

/**
 * Validates B2C document issue date/time for KSA requirements
 * B2C documents must be processed within 24 hours of issue time in Riyadh timezone
 */
export const validateB2CDateTimeRules = (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  const isB2C = !(invoice.meta?.config?.isB2B || false);

  // Only apply this validation for B2C transactions
  if (!isB2C) {
    return;
  }

  const header = invoice.header;
  if (!header?.issueDate) {
    return; // Issue date validation is handled elsewhere
  }

  try {
    // Parse and format the issue date and time
    let issueDateTime: Date;
    let formattedIssueTime: string;

    if (header.issueTime) {
      const timeString = header.issueTime.trim();

      // Validate standard format: HH:mm:ss.SSSZ
      if (!KSA_TIME_REGEX.test(timeString)) {
        errors.push({
          method,
          path: ['header', 'issueTime'],
          code: GetsError.INVALID_ISSUE_DATE_FORMAT,
          message: 'KSA B2C: Invalid issue time format. Expected format: HH:mm:ss.SSSZ',
        });
        return;
      }

      // Combine issueDate and issueTime for precise validation
      const dateTimeString = `${header.issueDate}T${timeString}`;
      issueDateTime = new Date(dateTimeString);
      formattedIssueTime = timeString;
    } else {
      // Use only issueDate (default to start of day)
      issueDateTime = new Date(header.issueDate);
      formattedIssueTime = '00:00:00';
    }

    // Get current date/time in Riyadh timezone
    const riyadhTimeZone = 'Asia/Riyadh';
    const currentDateTime = new Date();

    // Convert current time to Riyadh timezone
    const currentRiyadhTime = new Date(
      currentDateTime.toLocaleString('en-US', { timeZone: riyadhTimeZone })
    );

    // Calculate the maximum allowed date-time (next day, same time as issue)
    const maxAllowedDateTime = new Date(issueDateTime);
    maxAllowedDateTime.setDate(maxAllowedDateTime.getDate() + 1);

    // Check if current time exceeds the same time on the next day (24 hours limit)
    if (currentRiyadhTime > maxAllowedDateTime) {
      const formatDateTime = (date: Date) => {
        return date
          .toLocaleString('en-US', {
            timeZone: riyadhTimeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
          .replace(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6');
      };

      const timeField = header.issueTime ? 'issueTime' : 'issueDate';
      const issueDateTimeFormatted = `${header.issueDate} ${formattedIssueTime}`;

      errors.push({
        method,
        path: ['header', timeField],
        code: GetsError.INVALID_ISSUE_DATE_FORMAT,
        message: `KSA B2C: Document Issue DateTime is invalid! It must not exceed the same time on the next day in Riyadh timezone, and processing must be completed within 24 hours of its issue time. Kindly change the Document issue date & time accordingly. Issue Date: ${issueDateTimeFormatted}, Max Allowed DateTime: ${formatDateTime(maxAllowedDateTime)}, Current DateTime: ${formatDateTime(currentRiyadhTime)}`,
      });
    }
  } catch (error) {
    // If date parsing fails, let other validations handle it
    console.warn('Failed to parse issue date/time for B2C validation:', error);
  }
};

/**
 * Helper function to extract string value from MultiLangString (supports both string and object formats)
 */
export const getStringValue = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object' && value !== null) {
    // Try English first, then Arabic, then any other language
    if (value.en && typeof value.en === 'string' && value.en.trim() !== '') {
      return value.en.trim();
    }
    if (value.ar && typeof value.ar === 'string' && value.ar.trim() !== '') {
      return value.ar.trim();
    }
    // Try any other language value
    const allValues = Object.values(value).filter(
      (v) => v && typeof v === 'string' && v.trim() !== ''
    );
    return allValues.length > 0 ? String(allValues[0]).trim() : '';
  }
  return '';
};

/**
 * Helper function to check if referenceId is valid (supports string and array formats)
 */
export const isValidReferenceId = (referenceId: any): boolean => {
  if (!referenceId) return false;
  if (typeof referenceId === 'string') {
    return referenceId.trim() !== '';
  }
  if (Array.isArray(referenceId)) {
    return (
      referenceId.length > 0 &&
      referenceId.some((ref) => {
        if (typeof ref === 'string') return ref.trim() !== '';
        return ref != null;
      })
    );
  }
  return false;
};

/**
 * Validates credit note and debit note specific requirements
 */
export const validateCreditDebitNoteRules = (
  document: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  const header = document.header;
  if (!header) return;

  // Get documentType and normalize it (trim whitespace, convert to lowercase)
  const documentType = header.documentType
    ? String(header.documentType).trim().toLowerCase()
    : null;

  // Only validate for credit_note and debit_note - return early for all other document types
  // This includes tax_invoice, undefined, null, or any other type
  if (!documentType || (documentType !== 'credit_note' && documentType !== 'debit_note')) {
    return;
  }

  // At this point, we know documentType is either 'credit_note' or 'debit_note'
  // (normalized to lowercase)

  // 1. Validate reference invoice number is present
  if (!isValidReferenceId(header.referenceId)) {
    const errorCode =
      documentType === 'credit_note'
        ? GetsError.CREDIT_NOTE_REFERENCE_REQUIRED
        : GetsError.DEBIT_NOTE_REFERENCE_REQUIRED;
    errors.push({
      method,
      path: ['header', 'referenceId'],
      code: errorCode,
      message: `KSA: ${documentType} must have a reference to the original invoice (referenceId is mandatory)`,
    });
  }

  // 2. Validate note issuance reason is present for credit notes
  if (documentType === 'credit_note') {
    const noteReasonValue = getStringValue(header.noteIssuanceReason);
    if (!noteReasonValue || noteReasonValue === '') {
      errors.push({
        method,
        path: ['header', 'noteIssuanceReason'],
        code: GetsError.NOTE_ISSUANCE_REASON_REQUIRED,
        message:
          'KSA: Credit note must have a reason for issuance (noteIssuanceReason is mandatory)',
      });
    }
  }

  // 3. Validate note issuance reason is present for debit notes
  if (documentType === 'debit_note') {
    const noteReasonValue = getStringValue(header.noteIssuanceReason);
    if (!noteReasonValue || noteReasonValue === '') {
      errors.push({
        method,
        path: ['header', 'noteIssuanceReason'],
        code: GetsError.NOTE_ISSUANCE_REASON_REQUIRED,
        message:
          'KSA: Debit note must have a reason for issuance (noteIssuanceReason is mandatory)',
      });
    }
  }

  // For simplified credit/debit note require payment means
  const isSimplified = !document.meta?.config?.isB2B;
  if ((documentType === 'credit_note' || documentType === 'debit_note') && isSimplified) {
    const paymentMeans = (document as any)?.payment?.paymentMeans;
    // if (!Array.isArray(paymentMeans) || paymentMeans.length === 0) {
    //   errors.push({
    //     method,
    //     path: ['payment', 'paymentMeans'],
    //     code: GetsError.GENERIC_ERROR,
    //     message: 'KSA: Payment means is required for simplified credit/debit note.'
    //   });
    // }
  }
};

/**
 * Validates document-level rules
 */

export interface ValidationErrorDetail {
  code: string; // Numbered error code changed to string
  path: (string | number)[]; // Path to the error in the document, from Zod
  message: string; // Human-readable message
  method: string; // Which validation method produced this error (e.g., "gets", "my")
}

export const validateDocumentLevelRules = async (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): Promise<void> => {
  console.log(`📋 Document Level Validation - Starting...`);

  const header = invoice.header;
  if (!header) {
    console.log(`❌ Document Level - Missing header`);
    errors.push({
      method,
      path: ['header'],
      code: "INVALID_DOCUMENT_STRUCTURE",
      message: 'KSA: Document header is mandatory',
    });
    return;
  }
  console.log(`✅ Document Level - Header found`);

  // Validate document ID
  if (!header.documentNumber) {
    console.log(`❌ Document Level - Missing document number`);
    errors.push({
      method,
      path: ['header', 'documentNumber'],
      code: "MISSING_INVOICE_ID",
      message: 'KSA: Document number is mandatory',
    });
  } else {
    console.log(`✅ Document Level - Document number: ${header.documentNumber}`);
    // Check for duplicate document number in KSA documents with CLEARED, REPORTED, or WARNED status
    try {
      // Extract context from document metadata or use defaults
      const clientId = (invoice as any)?.meta?.clientId || 'default-client';
      const country = 'SA';
      const environment = (invoice as any)?.meta?.environment || 'Sandbox';
      const documentType = header.documentType || 'tax_invoice';

      const isDuplicate = false; // Replace with actual service call to check duplicates

      if (isDuplicate) {
        console.log(`❌ Document Level - Duplicate document number detected`);
        errors.push({
          method,
          path: ['header', 'documentNumber'],
          code: "DUPLICATE_DOCUMENT_NUMBER",
          message: `KSA: Document number '${header.documentNumber}' already exists with status CLEARED, REPORTED, or WARNED`,
        });
      } else {
        console.log(`✅ Document Level - Document number is unique`);
      }
    } catch (error) {
      console.warn(`⚠️ Document Level - Failed to check duplicate document number: ${error}`);
      // Don't add error to avoid blocking validation on service issues
    }
  }

  // Validate document type
  if (!header.documentType) {
    console.log(`❌ Document Level - Missing document type`);
    errors.push({
      method,
      path: ['header', 'documentType'],
      code: "INVALID_INVOICE_TYPE_CODE",
      message: 'KSA: Document type is mandatory',
    });
  } else if (!KSA_INVOICE_TYPES.has(header.documentType)) {
    console.log(`❌ Document Level - Invalid document type: ${header.documentType}`);
    errors.push({
      method,
      path: ['header', 'documentType'],
      code: "INVALID_INVOICE_TYPE_CODE",
      message: `KSA: Invalid document type. Must be one of [${Array.from(KSA_INVOICE_TYPES).join(', ')}]`,
    });
  } else {
    console.log(`✅ Document Level - Valid document type: ${header.documentType}`);
  }

  // Validate issue date
  if (!header.issueDate) {
    errors.push({
      method,
      path: ['header', 'issueDate'],
      code: "INVALID_ISSUE_DATE_FORMAT",
      message: 'KSA: Issue date is mandatory',
    });
  } else if (!KSA_DATE_REGEX.test(header.issueDate)) {
    errors.push({
      method,
      path: ['header', 'issueDate'],
      code: "INVALID_ISSUE_DATE_FORMAT",
      message: 'KSA: Invalid issue date format (YYYY-MM-DD)',
    });
  } else {
    const issueDate = new Date(header.issueDate);
    const currentDate = new Date();
    if (issueDate > currentDate) {
      errors.push({
        method,
        path: ['header', 'issueDate'],
        code: "FUTURE_ISSUE_DATE",
        message: 'KSA: Issue date cannot be in the future',
      });
    }
  }

  // Validate dueDate if present - must be on or after issueDate
  if (header.dueDate) {
    if (!KSA_DATE_REGEX.test(header.dueDate)) {
      errors.push({
        method,
        path: ['header', 'dueDate'],
        code: "INVALID_ISSUE_DATE_FORMAT",
        message: 'KSA: Invalid due date format (YYYY-MM-DD)',
      });
    } else if (header.issueDate && KSA_DATE_REGEX.test(header.issueDate)) {
      const issueDate = new Date(header.issueDate);
      const dueDate = new Date(header.dueDate);
      // Compare dates (ignore time component)
      issueDate.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < issueDate) {
        errors.push({
          method,
          path: ['header', 'dueDate'],
          code: "INVALID_DATA_TYPE",
          message: `KSA: Due date (${header.dueDate}) must be on or after issue date (${header.issueDate})`,
        });
      }
    }
  }

  // Validate issue time (optional but must be in correct format if provided)
  if (header.issueTime) {
    const timeString = header.issueTime.trim();
    // Accept standard format: HH:mm:ss.SSSZ
    if (!KSA_TIME_REGEX.test(timeString)) {
      errors.push({
        method,
        path: ['header', 'issueTime'],
        code: "INVALID_ISSUE_TIME_FORMAT",
        message: 'KSA: Invalid issue time format. Expected format: HH:mm:ss.SSSZ',
      });
    }
  }

  // Validate currency (mandatory field)
  if (!header.currency || (typeof header.currency === 'string' && header.currency.trim() === '')) {
    errors.push({
      method,
      path: ['header', 'currency'],
      code: "MISSING_DOCUMENT_CURRENCY",
      message: 'KSA: Document currency is mandatory',
    });
  } else if (!KSA_CURRENCY_CODES.has(header.currency)) {
    errors.push({
      method,
      path: ['header', 'currency'],
      code: "INVALID_ENUM_VALUE",
      message: `KSA: Invalid currency code. Must be one of [${Array.from(KSA_CURRENCY_CODES).join(', ')}]`,
    });
  }

  // Validate exchange rate for foreign currency
  if (header.currency && header.currency !== 'SAR' && header.exchangeRate) {
    if (!header.exchangeRate.rate || header.exchangeRate.rate <= 0) {
      errors.push({
        method,
        path: ['header', 'exchangeRate', 'rate'],
        code: "INVALID_EXCHANGE_RATE_FOREIGN",
        message: 'KSA: Exchange rate must be positive for foreign currency',
      });
    }
  }
};

/**
 * Validates document-level allowances and charges
 */
export const validateDocumentAllowanceCharges = (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  const allowancesAndCharges = invoice.allowancesAndCharges || [];

  allowancesAndCharges.forEach((allowanceCharge, index) => {
    const path = ['allowancesAndCharges', index];

    // Validate amount
    if (allowanceCharge.amount === undefined || allowanceCharge.amount < 0) {
      errors.push({
        method,
        path: [...path, 'amount'],
        code: GetsError.INVALID_ALLOWANCE_AMOUNT,
        message: 'KSA: Allowance/charge amount must be non-negative',
      });
    }

    // Validate reason
    // if (!allowanceCharge.reason) {
    //   errors.push({
    //     method, path: [...path, 'reason'],
    //     code: GetsError.MISSING_ALLOWANCE_REASON,
    //     message: 'KSA: Allowance/charge reason is mandatory'
    //   });
    // }

    // Validate tax category if present
    if (allowanceCharge.taxCategory && !KSA_TAX_CATEGORIES.has(allowanceCharge.taxCategory)) {
      errors.push({
        method,
        path: [...path, 'taxCategory'],
        code: GetsError.INVALID_ENUM_VALUE,
        message: `KSA: Invalid tax category. Must be one of [${Array.from(KSA_TAX_CATEGORIES).join(', ')}]`,
      });
    }
  });
};

/**
 * Validates payment means codes and values
 */
export const validatePaymentMeans = (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  const paymentMeans = (invoice as any)?.payment?.paymentMeans as Array<any> | undefined;
  if (!paymentMeans || paymentMeans.length === 0) return;
  paymentMeans.forEach((pm, idx) => {
    const code = pm.paymentMeansCode || pm.code;
    if (!code) {
      errors.push({
        method,
        path: ['payment', 'paymentMeans', idx, 'code'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Payment means code is mandatory.',
      });
      return;
    }
    if (!KSA_PAYMENT_MEANS_CODES.has(String(code))) {
      errors.push({
        method,
        path: ['payment', 'paymentMeans', idx, 'code'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Invalid payment means code.',
      });
    }
  });
};

/**
 * Prepayment validations (items present under extensions.sa_prepayment)
 */
export const validatePrepaymentRules = (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  const prepaymentsRaw = (invoice as any)?.extensions?.sa_prepayment;
  if (!prepaymentsRaw) return;

  // Handle case where sa_prepayment might be a single object instead of array
  const prepayments = Array.isArray(prepaymentsRaw) ? prepaymentsRaw : [prepaymentsRaw];
  if (prepayments.length === 0) return;

  prepayments.forEach((pp, index) => {
    const basePath = ['extensions', 'sa_prepayment', index];
    if (!pp.paymentId) {
      errors.push({
        method,
        path: [...basePath, 'paymentId'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: PrePaymentID is missing.',
      });
    }
    if (!pp.issueDate) {
      errors.push({
        method,
        path: [...basePath, 'issueDate'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: Prepayment Issue Date is missing.',
      });
    }
    if (pp.vatCategory) {
      if (pp.vatCategory === 'S' && pp.vatRate !== 15) {
        errors.push({
          method,
          path: [...basePath, 'vatRate'],
          code: GetsError.GENERIC_ERROR,
          message: "KSA: PrePaymentVatCategoryCode is 'S', expected vatRate 15.",
        });
      }
      if (pp.vatCategory === 'E' && pp.vatRate !== 0) {
        errors.push({
          method,
          path: [...basePath, 'vatRate'],
          code: GetsError.GENERIC_ERROR,
          message: "KSA: PrePaymentVatCategoryCode is 'E', expected vatRate 0.",
        });
      }
      if (pp.vatCategory === 'Z' && pp.vatRate !== 0) {
        errors.push({
          method,
          path: [...basePath, 'vatRate'],
          code: GetsError.GENERIC_ERROR,
          message: "KSA: PrePaymentVatCategoryCode is 'Z', expected vatRate 0.",
        });
      }
      if (pp.vatCategory === 'O' && pp.vatRate !== 0) {
        errors.push({
          method,
          path: [...basePath, 'vatRate'],
          code: GetsError.GENERIC_ERROR,
          message: "KSA: PrePaymentVatCategoryCode is 'O', expected vatRate 0.",
        });
      }
    }
    // Numeric checks
    ['taxableAmount', 'taxAmount', 'adjustmentAmount', 'paidAmount'].forEach((f) => {
      const v = (pp as any)[f];
      if (v !== undefined && v !== null && typeof v !== 'number') {
        errors.push({
          method,
          path: [...basePath, f],
          code: GetsError.GENERIC_ERROR,
          message: `KSA: Prepayment ${f} must be a number.`,
        });
      }
    });
    if (pp.paidAmount !== undefined && pp.paidAmount === 0) {
      errors.push({
        method,
        path: [...basePath, 'paidAmount'],
        code: GetsError.GENERIC_ERROR,
        message: 'KSA: The prepaid amount cannot be zero when prepayment exists.',
      });
    }
  });
};

/**
 * Prepayment invoice specific rules
 */
export const validatePrepaymentInvoiceRules = (
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void => {
  const isPrepayment = !!invoice.meta?.config?.isPrepayment;
  if (!isPrepayment) return;

  const lineCount = (invoice.lineItems || []).length;
  if (lineCount !== 1) {
    errors.push({
      method,
      path: ['lineItems'],
      code: GetsError.GENERIC_ERROR,
      message: 'KSA: Prepayment invoice should have exactly one line item.',
    });
  }
  // Prepayment invoices cannot have prepayment items
  if ((invoice as any)?.extensions?.sa_prepayment) {
    errors.push({
      method,
      path: ['extensions', 'sa_prepayment'],
      code: GetsError.GENERIC_ERROR,
      message: 'KSA: Prepayment invoice cannot have prepayment items.',
    });
  }
  // Discount should be zero at document level if totals provided
  const allowances = (invoice.allowancesAndCharges || []).filter((a) => !a.isCharge);
  const totalAllowance = allowances.reduce((sum, a: any) => sum + (a.amount || 0), 0);
  if (totalAllowance > EPSILON) {
    errors.push({
      method,
      path: ['allowancesAndCharges'],
      code: GetsError.GENERIC_ERROR,
      message: 'KSA: Discount should be zero for a prepayment invoice.',
    });
  }
};

// KSA-specific: strict validation for payment means code (string set)
export const KSA_ALLOWED_PAYMENT_MEANS = new Set<string>([
  'CASH',
  'CREDIT',
  'PAYMENT_TO_BANK_ACCOUNT',
  'BANK_CARD',
  'INSTRUMENT_NOT_DEFINED',
  'CHEQUE',
  'ACH',
  'BANKER_DRAFT',
  'OTHER',
]);

export function validateKsaPaymentMeansStrict(
  invoice: GetsDocument,
  errors: ValidationErrorDetail[],
  method: string
): void {
  const pmArray = (invoice as any)?.payment?.paymentMeans as Array<any> | undefined;

  // Payment means is optional for both B2B and B2C, but if present, validate it
  if (!Array.isArray(pmArray) || pmArray.length === 0) {
    return; // Optional field, no error if not provided
  }

  const first = pmArray[0] || {};
  const code = (first.paymentMeansCode ?? first.code ?? '').toString().trim();

  // If payment means is provided, it must have a valid code
  if (code && !KSA_ALLOWED_PAYMENT_MEANS.has(code.toUpperCase())) {
    errors.push({
      method,
      path: ['payment', 'paymentMeans', 0, 'paymentMeansCode'],
      code: GetsError.INVALID_ENUM_VALUE,
      message:
        'KSA: Payment means should be any of the following: CASH, CREDIT, PAYMENT_TO_BANK_ACCOUNT, BANK_CARD, INSTRUMENT_NOT_DEFINED, CHEQUE, ACH, BANKER_DRAFT, OTHER.',
    });
  }
}

/**
 * Main KSA validation function
 */

export type DocumentContentType = Record<string, any>;
export interface ValidationResult {
  method: string; // The validation method that was run (e.g., "gets", "my")
  success: boolean;
  errors: ValidationErrorDetail[];
  validatedAt: string; // ISO date-time string
}

export const validateKsa = async (
  documentContent: DocumentContentType,
  getsValidationResult?: ValidationResult
): Promise<ValidationResult> => {
  const method = 'ksa';
  const errors: ValidationErrorDetail[] = [];
  const validatedAt = new Date().toISOString();

  try {
    // Check if document has the required structure before proceeding
    if (!documentContent) {
      return {
        method,
        success: false,
        errors: [
          {
            code: GetsError.SCHEMA_VALIDATION_FAILED,
            path: [],
            message: 'KSA: Document content is null or undefined',
            method,
          },
        ],
        validatedAt,
      };
    }

    // Handle case where document is wrapped in a 'documents' array
    let actualDocument: DocumentContentType = documentContent;
    if (
      'documents' in documentContent &&
      Array.isArray(documentContent.documents) &&
      documentContent.documents.length > 0
    ) {
      actualDocument = documentContent.documents[0];
    }

    // Perform validations by category

    // 0. KSA rule: Buyer and Seller tax identifiers must not be the same
    console.log(`🔍 KSA Validation - Step 0: Checking buyer/seller tax ID uniqueness...`);
    try {
      const sellerTaxId =
        (actualDocument as any)?.supplierDetails?.vatNumber ||
        (actualDocument as any)?.supplierDetails?.taxId ||
        (actualDocument as any)?.supplierDetails?.taxIdentificationNumber ||
        (actualDocument as any)?.seller?.vatNumber ||
        (actualDocument as any)?.seller?.taxId ||
        (actualDocument as any)?.seller?.taxIdentificationNumber;

      const buyerTaxId =
        (actualDocument as any)?.buyerDetails?.vatNumber ||
        (actualDocument as any)?.buyerDetails?.taxId ||
        (actualDocument as any)?.buyerDetails?.taxIdentificationNumber ||
        (actualDocument as any)?.buyer?.vatNumber ||
        (actualDocument as any)?.buyer?.taxId ||
        (actualDocument as any)?.buyer?.taxIdentificationNumber;

      if (sellerTaxId && buyerTaxId && String(sellerTaxId).trim() === String(buyerTaxId).trim()) {
        console.log(`❌ KSA Validation - Tax ID check failed: Buyer and Seller tax IDs are the same`);
        errors.push({
          code: GetsError.SCHEMA_VALIDATION_FAILED,
          path: ['supplierDetails.vatNumber', 'buyerDetails.vatNumber'],
          message: 'KSA: Buyer tax ID and Seller tax ID must not be the same',
          method,
        });
      } else {
        console.log(`✅ KSA Validation - Tax ID check passed`);
      }
    } catch (e) {
      console.log(`⚠️ KSA Validation - Tax ID check skipped due to error:`, e);
      // Do not block further validation if reading identifiers fails
    }

    // 1. Validate document level rules (header information, dates, identifiers)
    console.log(`🔍 KSA Validation - Step 1: Validating document level rules...`);
    await validateDocumentLevelRules(actualDocument as GetsDocument, errors, method);
    console.log(`✅ Document level validation completed, errors so far: ${errors.length}`);

    // 1.1. Validate credit note and debit note specific requirements
    console.log(`🔍 KSA Validation - Step 1.1: Validating credit/debit note rules...`);
    validateCreditDebitNoteRules(actualDocument as GetsDocument, errors, method);
    console.log(`✅ Credit/debit note validation completed, errors so far: ${errors.length}`);

    // 1.2. Validate B2C date/time rules (24-hour processing window)
    console.log(`🔍 KSA Validation - Step 1.2: Validating B2C date/time rules...`);
    validateB2CDateTimeRules(actualDocument as GetsDocument, errors, method);
    console.log(`✅ B2C date/time validation completed, errors so far: ${errors.length}`);

    // 2. Validate party information (seller/buyer details)
    console.log(`🔍 KSA Validation - Step 2: Validating party information...`);
    validatePartyRules(actualDocument as GetsDocument, errors, method);
    console.log(`✅ Party validation completed, errors so far: ${errors.length}`);

    // 3. Validate line items (prices, quantities, VAT categories)
    console.log(`🔍 KSA Validation - Step 3: Validating line items...`);
    validateLineItemRules(actualDocument as GetsDocument, errors, method);
    console.log(`✅ Line items validation completed, errors so far: ${errors.length}`);

    // 4. Validate financial calculations (totals, VAT amounts)
    console.log(`🔍 KSA Validation - Step 4: Validating financial calculations...`);
    validateFinancialCalculations(actualDocument, errors, method);
    console.log(`✅ Financial calculations validation completed, errors so far: ${errors.length}`);

    // 4.1 Validate payment means (KSA-specific: mandatory + allowed strings)
    console.log(`🔍 KSA Validation - Step 4.1: Validating payment means...`);
    validateKsaPaymentMeansStrict(actualDocument as GetsDocument, errors, method);
    console.log(`✅ Payment means validation completed, errors so far: ${errors.length}`);

    // 4.2 Validate prepayment items and prepayment invoice constraints
    console.log(`🔍 KSA Validation - Step 4.2: Validating prepayment rules...`);
    validatePrepaymentRules(actualDocument as GetsDocument, errors, method);
    validatePrepaymentInvoiceRules(actualDocument as GetsDocument, errors, method);
    console.log(`✅ Prepayment validation completed, errors so far: ${errors.length}`);

    // 5. Validate document-level allowance and charges
    console.log(`🔍 KSA Validation - Step 5: Validating document-level allowance and charges...`);
    validateDocumentAllowanceCharges(actualDocument as GetsDocument, errors, method);
    console.log(`✅ Document allowance/charges validation completed, errors so far: ${errors.length}`);

    // Determine overall validation success
    const success = errors.length === 0;

    console.log(`🎯 KSA Validation Summary:`);
    console.log(`   - Total validation steps: 6`);
    console.log(`   - Total errors found: ${errors.length}`);
    console.log(`   - Overall result: ${success ? '✅ PASSED' : '❌ FAILED'}`);

    if (errors.length > 0) {
      console.log(`📋 Error breakdown by category:`);
      const errorCounts: Record<string, number> = {};
      errors.forEach(error => {
        const category = error.path.length > 0 ? error.path[0] : 'general';
        errorCounts[category] = (errorCounts[category] || 0) + 1;
      });
      Object.entries(errorCounts).forEach(([category, count]) => {
        console.log(`   - ${category}: ${count} errors`);
      });
    }

    return {
      method,
      success,
      errors,
      validatedAt,
    };
  } catch (error) {
    // Handle unexpected errors during validation
    console.error('Unexpected error during KSA validation:', error);
    return {
      method,
      success: false,
      errors: [
        {
          code: GetsError.SCHEMA_VALIDATION_FAILED,
          path: [],
          message: `Unexpected error during KSA validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          method,
        },
      ],
      validatedAt,
    };
  }
};
