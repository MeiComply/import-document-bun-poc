import { ulid } from 'ulid';
import { z } from 'zod';
import mongoose from 'mongoose';
import { getInvoiceMapping } from './country-invoice-mappings';
import { calculateTaxTotalsFromLineItems } from './tax-calculator';
import {
  // Interfaces and types
  GetsDocument,
  ValidationErrorDetail,
  ValidationResult,
  DocumentContentType,
  // Constants
  EPSILON,
  KSA_BUILDING_NUMBER_REGEX,
  KSA_CURRENCY_CODES,
  KSA_EXEMPTION_REASON_CODES,
  KSA_INVOICE_TYPES,
  KSA_MEASUREMENT_CODES,
  KSA_PAYMENT_MEANS_CODES,
  KSA_POSTAL_CODE_REGEX,
  KSA_TAX_CATEGORIES,
  KSA_TAX_PERCENTAGES,
  KSA_VAT_NUMBER_REGEX,
  // Functions
  validateDocumentLevelRules,
  validateCreditDebitNoteRules,
  validateB2CDateTimeRules,
  validatePartyRules,
  validatePostalAddress,
  getStringValue,
  isValidReferenceId,
  validateDocumentAllowanceCharges,
  validatePaymentMeans,
  validatePrepaymentRules,
  validatePrepaymentInvoiceRules,
  validateKsaPaymentMeansStrict,
  validateFinancialCalculations,
  validateLineItemRules,
  validateKsa,
} from './ksa-validator';
// Mock implementations for external dependencies
const validateGetsDocument = async (documentContent: any, method: string) => {
  console.log(`🔍 Starting ${method} document validation...`);

  try {
    // Call the actual KSA validation with detailed logging
    console.log(`📋 Step 1: Running KSA validation...`);
    const ksaResult = await validateKsa(documentContent);

    console.log(`✅ KSA validation completed:`, {
      success: ksaResult.success,
      errorCount: ksaResult.errors.length,
      errors: ksaResult.errors.slice(0, 3) // Show first 3 errors for brevity
    });

    if (!ksaResult.success) {
      console.log(`❌ Validation failed with ${ksaResult.errors.length} errors`);
      ksaResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.code}: ${error.message}`);
      });
    }

    return {
      method,
      success: ksaResult.success,
      errors: ksaResult.errors,
      validatedAt: ksaResult.validatedAt,
    };
  } catch (error) {
    console.error(`💥 Unexpected error during ${method} validation:`, error);
    return {
      method,
      success: false,
      errors: [{
        method,
        path: [],
        code: 'VALIDATION_ERROR',
        message: `Unexpected error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }],
      validatedAt: new Date().toISOString(),
    };
  }
};

// KSA Validation Functions (inline)

// Type definitions
export interface BatchData {
  batchId: string;
  clientId: string;
  userId: string;
  batchStatus: 'processing' | 'completed' | 'failed' | 'validation_completed';
  documentsCount: number;
  files: Array<{
    fileId: string;
    fileName: string;
    fileStatus: 'processing' | 'completed' | 'rejected' | 'failed' | 'deleted';
    uploadedDateTime: Date;
    documentsCount: number;
    hasDuplicatesWith: string[];
    s3Key?: string; // Optional S3 key for cleanup reference (not present for rejected files)
  }>;
  documentNumberMap: Record<string, string[]>; // documentNumber -> array of fileIds
  createdAt: Date;
  updatedAt: Date;
}

// File status enum
export enum FileStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  FAILED = 'failed',
  DELETED = 'deleted',
}

// Batch status enum
export enum BatchStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VALIDATION_COMPLETED = 'validation_completed',
}

// Helper function to validate file extensions
export function isValidFileExtension(filename: string): boolean {
  const allowedExtensions = ['.xlsx', '.xls', '.csv'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(extension);
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

// Helper function to create S3 key
export function createS3Key(
  country: string,
  platformEnv: string,
  clientId: string,
  batchId: string,
  fileId: string,
  filename: string
): string {
  const fileExtension = getFileExtension(filename);
  return `${country}/${platformEnv}/${clientId}/${batchId}/${fileId}${fileExtension}`;
}

// Helper function to map CSV/Excel headers to internal fields
export function mapHeadersToInternalFields(
  headers: string[],
  documentType: 'invoice' | 'receipt',
  country?: string
): Record<string, string> {
  const headerMap: Record<string, string> = {};

  // Normalize headers (trim, lowercase, replace spaces and hyphens with underscores)
  const normalizedHeaders = headers.map((h) => {
    if (h == null) return '';
    const trimmed = String(h).trim();
    return trimmed.toLowerCase().replace(/[\s-]+/g, '_');
  });

  // If country mapping exists, prefer explicit country mapping with raw header strings
  try {
    if (country) {
      const mapping = getInvoiceMapping(country);
      // Use original (non-normalized) headers to match exact Excel names
      headers.forEach((header) => {
        if (mapping[header]) {
          headerMap[header] = mapping[header];
        }
      });
      // If country-specific mapping covered the header, skip default mapping
      if (Object.keys(headerMap).length > 0) {
        return headerMap;
      }
    }
  } catch (_) {
    // fall back to default per-documentType mapping below
  }

  if (documentType === 'invoice') {
    // Map Malaysia GETS template headers to internal DB fields
    const invoiceMapping: Record<string, string> = {
      // Header fields
      'e-Invoice Type Code': 'header.documentType',
      'e-Invoice Code / Number': 'header.documentNumber',
      'e-Invoice Number': 'header.documentNumber',
      'Original e-Invoice Reference Number': 'header.referenceId',
      'e-Invoice Date': 'header.issueDate',
      'e-Invoice Time': 'header.issueTime',
      "Issuer's Digital Signature": 'extensions.my_digitalSignature',
      'Invoice Currency Code': 'header.currency',
      'Currency Exchange Rate': 'header.exchangeRate.rate',
      'Frequency of Billing': 'extensions.my_billingFrequency',
      'Billing Period Start Date': 'header.invoicePeriod.startDate',
      'Billing Period End Date': 'header.invoicePeriod.endDate',

      // Source fields
      'Source name': 'meta.source.name',
      'Source Version': 'meta.source.version',

      // Supplier/Seller fields
      'Supplier ID': 'parties.seller.partyId',
      'Supplier Peppol ID': 'parties.seller.peppolId',
      "Supplier's Name": 'parties.seller.name',
      "Supplier's TIN": 'parties.seller.taxIds[type="TIN"].value',
      "Supplier's Registration scheme ID": 'parties.seller.registrationNumbers[].type',
      "Supplier's Registration Number": 'parties.seller.registrationNumbers[].value',
      "Supplier's SST Registration Number": 'parties.seller.registrationNumbers[type="SST"].value',
      "Supplier's Tourism Tax Registration": 'parties.seller.registrationNumbers[type="TTR"].value',
      "Supplier's e-mail": 'parties.seller.contact.email',
      "Supplier's MSIC Code": 'parties.seller.industryClassification.code',
      "Supplier's Business Activity": 'parties.seller.businessActivityDescription',
      "Supplier's Contact Number": 'parties.seller.contact.phone',

      // Supplier Address fields
      'Supplier Address Line 1': 'parties.seller.address.addressLine1',
      'Supplier Address Line 2': 'parties.seller.address.addressLine2',
      'Supplier Address Line 3': 'parties.seller.address.addressLine3',
      'Supplier Postal Zone': 'parties.seller.address.postalCode',
      'Supplier City Name': 'parties.seller.address.city',
      'Supplier State': 'parties.seller.address.stateOrProvince',
      'Supplier Country': 'parties.seller.address.country',

      // Buyer fields
      'Buyer ID': 'parties.buyer.partyId',
      'Buyer Peppol ID': 'parties.buyer.peppolId',
      "Buyer's Name": 'parties.buyer.name',
      "Buyer's TIN": 'parties.buyer.taxIds[type="TIN"].value',
      "Buyer's Registration Scheme ID": 'parties.buyer.registrationNumbers[].type',
      "Buyer's Registration Number": 'parties.buyer.registrationNumbers[].value',
      "Buyer's SST Registration Number": 'parties.buyer.registrationNumbers[type="SST"].value',
      "Buyer's e-mail": 'parties.buyer.contact.email',
      "Buyer's Contact Number": 'parties.buyer.contact.phone',

      // Buyer Address fields
      'Buyer Address Line 1': 'parties.buyer.address.addressLine1',
      'Buyer Address Line 2': 'parties.buyer.address.addressLine2',
      'Buyer Address Line 3': 'parties.buyer.address.addressLine3',
      'Buyer Postal Zone': 'parties.buyer.address.postalCode',
      'Buyer City Name': 'parties.buyer.address.city',
      'Buyer State': 'parties.buyer.address.stateOrProvince',
      'Buyer Country': 'parties.buyer.address.country',

      // Shipping/Delivery fields
      'Shipping Recipient ID': 'parties.delivery.partyId',
      "Shipping Recipient's Name": 'parties.delivery.name',
      "Shipping Recipient's TIN": 'parties.delivery.taxIds[type="TIN"].value',
      "Shipping Recipient's Registration Type": 'parties.delivery.registrationNumbers[].type',
      "Shipping Recipient's Registration Number": 'parties.delivery.registrationNumbers[].value',

      // Shipping Address fields
      'Shipping Address Line 1': 'parties.delivery.address.addressLine1',
      'Shipping Address Line 2': 'parties.delivery.address.addressLine2',
      'Shipping Address Line 3': 'parties.delivery.address.addressLine3',
      'Shipping Postal Zone': 'parties.delivery.address.postalCode',
      'Shipping City Name': 'parties.delivery.address.city',
      'Shipping State': 'parties.delivery.address.stateOrProvince',
      'Shipping Country': 'parties.delivery.address.country',

      // Line Items fields
      'Line ID': 'lineItems[].id',
      Classification: 'lineItems[].commodityClassification.code',
      'Product Tariff Code': 'lineItems[].commodityCode',
      'Country of Origin': 'lineItems[].countryOfOrigin',
      Description: 'lineItems[].description',
      'Unit Price': 'lineItems[].price.amount',
      Measurement: 'lineItems[].unitCode',
      Quantity: 'lineItems[].quantity',
      Subtotal: 'lineItems[].price.amount*quantity',
      'Discount Rate': 'lineItems[].discountsOrCharges[isCharge=false].percent',
      'Discount Amount': 'lineItems[].discountsOrCharges[isCharge=false].amount',
      'Charge Rate': 'lineItems[].discountsOrCharges[isCharge=true].percent',
      'Charge Amount': 'lineItems[].discountsOrCharges[isCharge=true].amount',
      'Line Item Total Excluding Tax': 'lineItems[].lineTaxableValue',
      'Line Tax Type': 'lineItems[].taxCategory',
      'Line Tax Rate': 'lineItems[].taxRate',
      'Tax Type': 'lineItems[].taxCategory',
      'Line Tax Amount': 'lineItems[].taxAmount',
      'Line Details of Tax Exemption': 'lineItems[].taxExemptionReason',
      'Line Amount Exempted from Tax': 'extensions.my_taxExemptionAmount',
      'Line Total': 'lineItems[].lineTotal',
      'Tax Rate': 'lineItems[].taxRate',
      'Tax Amount': 'lineItems[].taxAmount',
      'Invoice Total Excluding Tax': 'lineItems[].lineTaxableValue',

      // Summary/Totals fields
      'Sum of Line Level Taxable Amounts': 'totals.totalLineTaxableAmount',
      'Total Discount Value': 'totals.totalAllowances',
      // "Total Fee / Charge Amount": "totals.totalCharges",
      'Total Excluding Tax': 'totals.totalAmountExcludingTax',
      //TaxTotals will be calculated from the line items internally
      // "Tax Type": "taxTotals[].taxSubtotals[].taxCategory",
      // "Total Taxable Amount Per Tax Type": "taxTotals[].taxSubtotals[].taxableAmount",
      // "Total Tax Amount Per Tax Type": "taxTotals[].taxSubtotals[].taxAmount",
      // "Details of Tax Exemption": "taxTotals[].taxSubtotals[].taxExemptionReason",
      // "Amount Exempted from Tax": "extensions.my_totalTaxExemption",
      'Total Tax Amount': 'totals.totalTaxAmount',
      'Invoice Total Including Tax': 'totals.totalAmountIncludingTax',
      'PrePayment Amount': 'totals.prepaidAmount',
      'Total Payable Amount': 'totals.amountDue',
      'Rounding Amount': 'totals.roundingAmount',

      // Payment Details fields
      'Payment Mode': 'payment.paymentMeans[].paymentMeansCode',
      "Supplier's Bank Account":
        'payment.paymentMeans[].creditTransferInfo.payeeFinancialAccountId',
      'Payment Terms': 'payment.paymentTerms[].note',
      'PrePayment Date': 'extensions.my_prepaymentDate',
      'PrePayment Time': 'extensions.my_prepaymentTime',
      'PrePayment Reference': 'payment.paymentMeans[].paymentId',
      'Bill Reference Number': 'supportingDocuments[documentType="bill"].id',

      // Export Details fields
      'Customs Form Reference': 'supportingDocuments[documentType="customs_form"].id',
      Incoterms: 'parties.delivery.deliveryTerms[].incoterms',
      'FTA Information': 'supportingDocuments[documentType="FTA"].id',
      'Certified Exporter Auth': 'supportingDocuments[documentType="export_auth"].id',
      'Customs Form No.2': 'supportingDocuments[documentType="customs_form_2"].id',
      'Shipment ID': 'supportingDocuments[documentType="shipment"].id',
      'Shipment Amount': 'extensions.my_shipmentAmount',
      'Shipment Charge Reason': 'extensions.my_shipmentChargeReason',
    };

    // Map exact header names to internal fields
    // //console.log('🔍 Headers from Excel file:', headers);
    // //console.log('🔍 Available mapping keys:', Object.keys(invoiceMapping));

    // Debug: Check for BRN-related headers specifically
    const brnHeaders = headers.filter(
      (h) =>
        h.toLowerCase().includes('registration') &&
        (h.toLowerCase().includes('scheme') || h.toLowerCase().includes('number'))
    );
    // //console.log('🔍 BRN-related headers found:', brnHeaders);

    headers.forEach((header) => {
      if (invoiceMapping[header]) {
        headerMap[header] = invoiceMapping[header];
        //console.log(`🔍 Mapped: "${header}" -> "${invoiceMapping[header]}"`);
      } else {
        //console.log(`🔍 No mapping found for: "${header}"`);
      }
    });

    //console.log('🔍 Final header map:', headerMap);
  } else if (documentType === 'receipt') {
    // Map common receipt headers to internal fields
    const receiptMapping: Record<string, string> = {
      receipt_number: 'receiptNumber',
      receipt_no: 'receiptNumber',
      issue_date: 'issueDate',
      date: 'issueDate',
      receipt_date: 'issueDate',
      total_amount: 'totalAmount',
      total: 'totalAmount',
      amount: 'totalAmount',
      payment_method: 'paymentMethod',
    };

    normalizedHeaders.forEach((header, index) => {
      if (receiptMapping[header]) {
        headerMap[headers[index]] = receiptMapping[header];
      }
    });
  }

  return headerMap;
}

// Helper function to preprocess document for validation
function preprocessDocumentForValidation(doc: any): any {
  const processed = { ...doc };

  // Convert validatedAt if it's a Date object
  if (processed.validatedAt instanceof Date) {
    processed.validatedAt = processed.validatedAt.toISOString();
  }

  // Convert submittedAt if it's a Date object
  if (processed.submittedAt instanceof Date) {
    processed.submittedAt = processed.submittedAt.toISOString();
  }

  // Convert any other date fields that might be Date objects
  function convertDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map(convertDates);
    }

    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = convertDates(obj[key]);
      }
    }
    return result;
  }

  return convertDates(processed);
}

// Helper function to validate document data
export async function validateDocumentData(
  data: any,
  country: string,
  documentTypeFromFormData: 'invoice' | 'receipt'
) {
  console.log(`🚀 Starting document validation for country: ${country}, type: ${documentTypeFromFormData}`);

  try {
    // Preprocess document to convert Date objects to ISO strings for validation
    console.log(`🔄 Preprocessing document data...`);
    const processedData = preprocessDocumentForValidation(data);

    console.log(`📋 Running GETS validation...`);
    const getsValidationResults = await validateGetsDocument(processedData, 'validateGetsDocument');
    console.log(`✅ GETS validation result: ${getsValidationResults.success ? 'PASSED' : 'FAILED'} (${getsValidationResults.errors.length} errors)`);

    let countryValidationResults;

    if (country === 'SA') {
      console.log(`🇸🇦 Performing KSA-specific validation...`);
      countryValidationResults = await validateKsa(processedData, getsValidationResults);
      console.log(`✅ KSA validation result: ${countryValidationResults.success ? 'PASSED' : 'FAILED'} (${countryValidationResults.errors.length} errors)`);
    } else {
      console.log(`⚠️ No country-specific validation available for: ${country}`);
    }

    const finalResult = {
      isGETSValid: getsValidationResults.success,
      isCountryValid: countryValidationResults?.success,
      getsValidationErrors: getsValidationResults.errors,
      countryValidationErrors: countryValidationResults?.errors,
    };

    console.log(`🎯 Document validation completed:`);
    console.log(`   - GETS validation: ${finalResult.isGETSValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   - Country validation: ${finalResult.isCountryValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   - Total GETS errors: ${finalResult.getsValidationErrors.length}`);
    console.log(`   - Total country errors: ${finalResult.countryValidationErrors?.length || 0}`);

    return finalResult;
  } catch (error) {
    console.error(`💥 Error during document validation:`, error);

    if (error instanceof z.ZodError) {
      console.log(`📋 Zod validation errors:`, error.errors);
      return {
        isGETSValid: false,
        isCountryValid: false,
        getsValidationErrors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        countryValidationErrors: [],
      };
    }

    console.log(`📋 Generic validation error:`, error);
    return {
      isGETSValid: false,
      isCountryValid: false,
      getsValidationErrors: [error],
      countryValidationErrors: [],
    };
  }
}

// Helper function to extract document number for duplicate detection
export function extractDocumentNumber(
  data: any,
  documentType: 'invoice' | 'receipt'
): string | null {
  if (documentType === 'invoice') {
    // Check for nested structure first, then fallback to flat key, then common variations
    const nestedValue = data.header?.documentNumber;
    if (nestedValue != null) {
      const stringValue = String(nestedValue);
      if (stringValue && stringValue.trim()) {
        return stringValue.trim();
      }
    }

    // Check flat key variations
    const flatValue =
      data['header.documentNumber'] ||
      data['e-Invoice Number'] ||
      data.documentNumber ||
      data.invoiceNumber;
    if (flatValue != null) {
      const stringValue = String(flatValue);
      if (stringValue && stringValue.trim()) {
        return stringValue.trim();
      }
    }

    return null;
  } else {
    return data.receiptNumber || data.receipt_number || data.receipt_no || null;
  }
}

// Note: Stream forking is now handled directly in the main API using PassThrough streams
// This eliminates the need for a separate function and ensures true chunk-level processing

// Helper function to process CSV file with streaming
// export async function processCSVFile(
//     stream: NodeJS.ReadableStream,
//     fileId: string,
//     documentType: 'invoice' | 'receipt',
//     batchData: BatchData,
//     country: string
// ): Promise<{ processedCount: number; errors: string[] }> {
//     return new Promise((resolve, reject) => {
//         //console.log(`(IMPORT) 📄 [CSV] Starting streaming CSV file processing for fileId: ${fileId}, documentType: ${documentType}, country: ${country}`);

//         const errors: string[] = [];
//         let processedCount = 0;
//         let headers: string[] = [];
//         let headerMap: Record<string, string> = {};
//         let isFirstRow = true;

//         const csvStream = fastcsv({
//             headers: false  // We'll handle headers manually for better control
//         })
//             .on('data', (row: string[]) => {
//                 try {
//                     if (isFirstRow) {
//                         // First row contains headers
//                         headers = row;
//                         //console.log(`(IMPORT) 📋 [CSV] Headers detected:`, headers);
//                         headerMap = mapHeadersToInternalFields(headers, documentType);
//                         //console.log(`(IMPORT) 🗺️ [CSV] Header mapping created:`, headerMap);
//                         isFirstRow = false;
//                         return;
//                     }

//                     // Map row data to internal fields
//                     const rowData: any = {};

//                     row.forEach((value, index) => {
//                         const originalHeader = headers[index];
//                         const internalField = headerMap[originalHeader] || originalHeader;

//                         // Type conversion for numeric fields
//                         if (internalField === 'totalAmount' && value) {
//                             rowData[internalField] = parseFloat(value);
//                         } else {
//                             rowData[internalField] = value;
//                         }
//                     });

//                     // Validate document data
//                     const validation = validateDocumentData(rowData, documentType);
//                     if (!validation.isValid) {
//                         errors.push(`Row ${processedCount + 1}: ${validation.errors.join(', ')}`);
//                     }

//                     // Extract document number for duplicate detection
//                     const documentNumber = extractDocumentNumber(rowData, documentType);
//                     if (documentNumber) {
//                         if (!batchData.documentNumberMap[documentNumber]) {
//                             batchData.documentNumberMap[documentNumber] = [];
//                         }
//                         batchData.documentNumberMap[documentNumber].push(fileId);
//                     }

//                     processedCount++;

//                     // Yield control every 100 rows to prevent blocking the event loop
//                     if (processedCount % 100 === 0) {
//                         //console.log(`(IMPORT) 📈 [CSV] Processed ${processedCount} rows so far...`);
//                         setImmediate(() => { }); // Yield control to event loop
//                     }

//                     // Log sample data every 1000 rows (reduce logging for performance)
//                     if (processedCount % 1000 === 0 || processedCount <= 10) {
//                         //console.log(`(IMPORT) 💾 [CSV] Sample processed document ${processedCount}:`, JSON.stringify(rowData, null, 2));
//                     }

//                 } catch (error: any) {
//                     console.error(`(IMPORT) ❌ [CSV] Error processing row ${processedCount + 1}:`, error);
//                     errors.push(`Error processing row ${processedCount + 1}: ${error.message}`);
//                 }
//             })
//             .on('error', (error: any) => {
//                 console.error(`(IMPORT) ❌ [CSV] Stream error:`, {
//                     errorName: error?.name || 'Unknown',
//                     errorMessage: error?.message || 'No message',
//                     errorStack: error?.stack || 'No stack',
//                     errorCode: error?.code || 'No code',
//                     processedCount: processedCount,
//                     fileId: fileId
//                 });
//                 reject(error);
//             })
//             .on('end', () => {
//                 //console.log(`(IMPORT) ✅ [CSV] Streaming processing completed - Total rows: ${processedCount}, Errors: ${errors.length}`);
//                 resolve({ processedCount, errors });
//             });

//         // Add stream error handling before piping
//         stream.on('error', (error: any) => {
//             console.error(`(IMPORT) ❌ [CSV] Input stream error:`, {
//                 errorName: error?.name || 'Unknown',
//                 errorMessage: error?.message || 'No message',
//                 errorStack: error?.stack || 'No stack',
//                 fileId: fileId
//             });
//             reject(error);
//         });

//         stream.on('end', () => {
//             //console.log(`(IMPORT) 📋 [CSV] Input stream ended for fileId: ${fileId}`);
//         });

//         stream.on('close', () => {
//             //console.log(`(IMPORT) 📋 [CSV] Input stream closed for fileId: ${fileId}`);
//         });

//         // Use pipeline for better error handling and backpressure management
//         //console.log(`(IMPORT) 🔄 [CSV] Piping input stream to CSV parser for fileId: ${fileId}`);
//         stream.pipe(csvStream);
//     });
// }

// // Helper function to process XLSX file with streaming
// export async function processXLSXFile(
//     stream: NodeJS.ReadableStream,
//     fileId: string,
//     documentType: 'invoice' | 'receipt',
//     batchData: BatchData,
//     country: string
// ): Promise<{ processedCount: number; errors: string[] }> {
//     return new Promise((resolve, reject) => {
//         try {
//             //console.log(`(IMPORT) 📊 [XLSX] Starting streaming XLSX file processing for fileId: ${fileId}, documentType: ${documentType}, country: ${country}`);

//             // Use ExcelJS streaming with event-based approach
//             const workbookReader: any = new ExcelJS.stream.xlsx.WorkbookReader(stream as any, {
//                 worksheets: 'emit',
//                 sharedStrings: 'emit', // Enable shared string processing
//                 styles: 'ignore', // Ignore styles to save memory
//                 hyperlinks: 'ignore' // Ignore hyperlinks to save memory
//             });

//             const errors: string[] = [];
//             let processedCount = 0;
//             let worksheetCount = 0;
//             let completedWorksheets = 0;

//             //console.log(`(IMPORT) 📖 [XLSX] ExcelJS WorkbookReader initialized with memory optimizations`);

//             // Add timeout as fallback (30 seconds) to prevent indefinite hanging
//             const timeoutId = setTimeout(() => {
//                 //console.log(`(IMPORT) ⚠️ [XLSX] Processing timeout reached - forcing completion with current results`);
//                 //console.log(`(IMPORT) ✅ [XLSX] Timeout completion - Total rows: ${processedCount}, Total errors: ${errors.length}`);
//                 resolve({ processedCount, errors });
//             }, 30000); // 30 second timeout

//             // Clear timeout when promise resolves or rejects
//             const originalResolve = resolve;
//             const originalReject = reject;
//             resolve = (result) => {
//                 clearTimeout(timeoutId);
//                 originalResolve(result);
//             };
//             reject = (error) => {
//                 clearTimeout(timeoutId);
//                 originalReject(error);
//             };

//             workbookReader.read();

//             // Check if workbook has no worksheets after a short delay
//             setTimeout(() => {
//                 if (worksheetCount === 0) {
//                     //console.log(`(IMPORT) ⚠️ [XLSX] No worksheets detected after 2 seconds - completing with 0 rows`);
//                     resolve({ processedCount: 0, errors: [] });
//                 }
//             }, 2000); // 2 second check for empty workbooks

//             workbookReader.on('worksheet', (worksheet: any) => {
//                 //console.log(`(IMPORT) 📋 [XLSX] Processing worksheet: ${worksheet.name || 'Unnamed'}`);
//                 worksheetCount++;

//                 let headers: string[] = [];
//                 let headerMap: Record<string, string> = {};
//                 let isFirstRow = true;
//                 let worksheetProcessedCount = 0;

//                 worksheet.on('row', (row: any) => {
//                     try {
//                         const rowValues = row.values as any[];
//                         // Remove first empty element if present (Excel indexing starts at 1)
//                         const cleanRowValues = rowValues.slice(1);

//                         if (isFirstRow) {
//                             // Debug raw cell values first
//                             //console.log(`(IMPORT) 🔍 [XLSX] DEBUG - Raw header values:`, cleanRowValues.slice(0, 5)); // First 5 cells
//                             cleanRowValues.slice(0, 3).forEach((val, index) => {
//                                 //console.log(`(IMPORT) 🔍 [XLSX] DEBUG - Cell ${index}:`, {
//                                     type: typeof val,
//                                     constructor: val?.constructor?.name,
//                                     keys: val && typeof val === 'object' ? Object.keys(val) : 'not object',
//                                     hasValue: val && typeof val === 'object' && 'value' in val,
//                                     valueType: val && typeof val === 'object' && val.value ? typeof val.value : 'no value',
//                                     actualValue: val && typeof val === 'object' && val.value ? val.value : val
//                                 });
//                             });

//                             // First row contains headers - properly extract cell values
//                             headers = cleanRowValues.map((val, index) => {
//                                 let extractedValue = '';

//                                 if (val && typeof val === 'object') {
//                                     // Handle shared string references
//                                     if (val.sharedString !== undefined && typeof val.sharedString === 'number') {
//                                         // Create meaningful column names from shared string indices
//                                         extractedValue = `Column_${val.sharedString}`;
//                                         //console.log(`(IMPORT) 📚 [XLSX] Using column name for shared string ${val.sharedString} -> "${extractedValue}"`);
//                                     }
//                                     // Try other possible properties
//                                     else if (val.value !== undefined) {
//                                         extractedValue = String(val.value || '');
//                                     } else if (val.text !== undefined) {
//                                         extractedValue = String(val.text || '');
//                                     } else if (val.v !== undefined) {
//                                         extractedValue = String(val.v || '');
//                                     } else if (val.w !== undefined) {
//                                         extractedValue = String(val.w || '');
//                                     } else {
//                                         // If it's an object but no known properties, create a fallback name
//                                         //console.log(`(IMPORT) ⚠️ [XLSX] Using fallback column name for header ${index}:`, val);
//                                         extractedValue = `Column_${index}`;
//                                     }
//                                 } else {
//                                     extractedValue = String(val || '');
//                                 }

//                                 return extractedValue;
//                             });

//                             //console.log(`(IMPORT) 📋 [XLSX] Headers detected:`, headers);
//                             headerMap = mapHeadersToInternalFields(headers, documentType);
//                             //console.log(`(IMPORT) 🗺️ [XLSX] Header mapping created:`, headerMap);
//                             isFirstRow = false;
//                             return;
//                         }

//                         // Map row data to internal fields
//                         const rowData: any = {};
//                         cleanRowValues.forEach((value, index) => {
//                             const originalHeader = headers[index];
//                             const internalField = headerMap[originalHeader] || originalHeader;

//                             // Extract actual value from ExcelJS cell object
//                             let cellValue = value;
//                             if (value && typeof value === 'object') {
//                                 // Handle shared string references first
//                                 if (value.sharedString !== undefined && typeof value.sharedString === 'number') {
//                                     // For data cells with shared string references, we'll use the index as a fallback
//                                     cellValue = `Text_${value.sharedString}`;
//                                 } else if (value.value !== undefined) {
//                                     cellValue = value.value;
//                                 }
//                             }

//                             // Type conversion for numeric fields
//                             if (internalField === 'totalAmount' && cellValue) {
//                                 rowData[internalField] = parseFloat(String(cellValue));
//                             } else {
//                                 rowData[internalField] = cellValue ? String(cellValue) : '';
//                             }
//                         });

//                         // Validate document data
//                         const validation = validateDocumentData(rowData, documentType);
//                         if (!validation.isValid) {
//                             errors.push(`Row ${processedCount + 1}: ${validation.errors.join(', ')}`);
//                         }

//                         // Extract document number for duplicate detection
//                         const documentNumber = extractDocumentNumber(rowData, documentType);
//                         if (documentNumber) {
//                             if (!batchData.documentNumberMap[documentNumber]) {
//                                 batchData.documentNumberMap[documentNumber] = [];
//                             }
//                             batchData.documentNumberMap[documentNumber].push(fileId);
//                         }

//                         processedCount++;
//                         worksheetProcessedCount++;

//                         // Yield control every 100 rows to prevent blocking the event loop
//                         if (processedCount % 100 === 0) {
//                             //console.log(`(IMPORT) 📈 [XLSX] Processed ${processedCount} rows so far...`);
//                             setImmediate(() => { }); // Yield control to event loop
//                         }

//                         // Log sample data every 1000 rows (reduce logging for performance)
//                         if (processedCount % 1000 === 0 || processedCount <= 10) {
//                             //console.log(`(IMPORT) 💾 [XLSX] Sample processed document ${processedCount}:`, JSON.stringify(rowData, null, 2));
//                         }

//                     } catch (error: any) {
//                         console.error(`(IMPORT) ❌ [XLSX] Error processing row ${processedCount + 1}:`, error);
//                         errors.push(`Error processing row ${processedCount + 1}: ${error.message}`);
//                     }
//                 });

//                 worksheet.on('finished', () => {
//                     //console.log(`(IMPORT) ✅ [XLSX] Worksheet '${worksheet.name || 'Unnamed'}' completed - Rows: ${worksheetProcessedCount}`);
//                     completedWorksheets++;

//                     // If all worksheets are processed, resolve the promise
//                     if (completedWorksheets >= worksheetCount) {
//                         //console.log(`(IMPORT) ✅ [XLSX] All worksheets completed - Total rows: ${processedCount}, Total errors: ${errors.length}`);
//                         resolve({ processedCount, errors });
//                     }
//                 });
//             });

//             workbookReader.on('end', () => {
//                 //console.log(`(IMPORT) ✅ [XLSX] Workbook processing completed - Total rows: ${processedCount}, Total errors: ${errors.length}`);
//                 // If no worksheets were processed, resolve with current results
//                 if (completedWorksheets === 0) {
//                     resolve({ processedCount, errors });
//                 }
//             });

//             workbookReader.on('error', (error: any) => {
//                 console.error(`(IMPORT) ❌ [XLSX] Workbook reader error:`, error);
//                 reject(error);
//             });

//         } catch (error: any) {
//             console.error(`(IMPORT) ❌ [XLSX] Unexpected error in XLSX processing:`, error);
//             reject(error);
//         }
//     });
// }

type GroupConfig = {
  match: RegExp;
  fields: string[];
  array?: boolean;
};

const groupConfigs: GroupConfig[] = [
  {
    match: /^supportingDocuments\[\d+\]\./,
    fields: ['documentType', 'id'],
    array: true,
  },
  {
    match: /^lineItems\[\d+\]\.discountsOrCharges\[\d+\]\./,
    fields: ['isCharge', 'amount', 'percent'],
    array: true,
  },
  {
    match: /^parties\.(buyer|seller|delivery)\.registrationNumbers\[\d+\]\./,
    fields: ['type', 'value'],
    array: true,
  },
  {
    match: /^extensions\.sa_prepayment\[\d+\]\./,
    fields: ['paymentId', 'issueDate', 'issueTime', 'taxCategory', 'taxRate', 'taxableAmount', 'taxAmount', 'adjustmentAmount', 'paidAmount'],
    array: true,
  },
];

export async function unflatten(data: Record<string, any>, justCreateLineItem: boolean = false) {
  //console.log("🥶🥶🥶🥶🥶🥶🥶🥶🥶🥶 ~ unflatten called ~ data:", data, "justCreateLineItem:", justCreateLineItem)
  const result: any = {};
  const sequentialStorage: Record<string, Record<number, any>> = {};

  if (!justCreateLineItem) {
    for (const flatKey in data) {
      if (flatKey?.includes('lineItems[]')) {
        continue;
      }

      const value = data[flatKey];

      // Handle [key="value"] style (like isCharge or documentType)
      const lookupMatch = flatKey.match(/(.+)\[([^=\]]+)=(["']?)(.+?)\3\]\.(.+)/);
      if (lookupMatch) {
        const [, arrPath, keyName, , keyValue, fieldName] = lookupMatch;
        result[arrPath] = result[arrPath] || [];

        // Convert keyValue to appropriate type for boolean fields
        let convertedKeyValue: any = keyValue;
        if (keyName === 'isCharge') {
          convertedKeyValue = keyValue === 'true';
        }

        // find existing object or create
        let obj = result[arrPath].find((o: any) => o[keyName] == convertedKeyValue);
        if (!obj) {
          obj = { [keyName]: convertedKeyValue };
          result[arrPath].push(obj);
        }
        obj[fieldName] = value;
        continue;
      }

      // Handle sequential array pattern using groupConfig
      const groupConfig = groupConfigs.find((gc) => gc.match.test(flatKey));
      if (groupConfig) {
        const pathMatch = flatKey.match(/\[(\d+)\]/g);
        const pathParts = flatKey.split('.');
        let arrayPath = '';
        let arrayIndex = 0;

        for (const part of pathParts) {
          const indexMatch = part.match(/\[(\d+)\]/);
          if (indexMatch) {
            arrayPath += part.split('[')[0];
            arrayIndex = parseInt(indexMatch[1], 10);
            break;
          } else {
            arrayPath += part + '.';
          }
        }

        sequentialStorage[arrayPath] = sequentialStorage[arrayPath] || {};
        sequentialStorage[arrayPath][arrayIndex] = sequentialStorage[arrayPath][arrayIndex] || {};

        const fieldName = pathParts[pathParts.length - 1].replace(/\[\d+\]/, '');
        sequentialStorage[arrayPath][arrayIndex][fieldName] = value;
        continue;
      }

      // Default dot notation
      const keys = flatKey.split('.');
      let curr = result;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i].replace(/\[\]/, '');
        if (i === keys.length - 1) {
          curr[k] = value;
        } else {
          if (!curr[k]) curr[k] = {};
          curr = curr[k];
        }
      }
    }

    // push sequential arrays
    for (const arrayPath in sequentialStorage) {
      const arr = Object.keys(sequentialStorage[arrayPath])
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((i) => sequentialStorage[arrayPath][parseInt(i, 10)]);

      const pathParts = arrayPath.split('.');
      let curr = result;
      for (let i = 0; i < pathParts.length; i++) {
        const k = pathParts[i];
        if (i === pathParts.length - 1) {
          curr[k] = curr[k] || [];
          curr[k] = curr[k].concat(arr);
        } else {
          curr[k] = curr[k] || {};
          curr = curr[k];
        }
      }
    }
  }

  // construct lineItem and push it
  const lineItem = {
    id: data?.['lineItems[].id'],
    name: data?.['lineItems[].name'],
    quantity: data?.['lineItems[].quantity'],
    unitCode: data?.['lineItems[].unitCode'],
    lineTotal: data?.['lineItems[].lineTotal'],
    taxAmount: data?.['lineItems[].taxAmount'],
    description:
      data?.['lineItems[].description.en'] && data?.['lineItems[].description.ms']
        ? {
            en: data?.['lineItems[].description.en'],
            ms: data?.['lineItems[].description.ms'],
          }
        : data?.['lineItems[].description'],
    lineTaxableValue: data?.['lineItems[].lineTaxableValue'],
    taxCategory: data?.['lineItems[].taxCategory'],
    taxRate: data?.['lineItems[].taxRate'],
    taxExemptionReason: data?.['lineItems[].taxExemptionReason'],
    commodityCode: data?.['lineItems[].commodityCode'],
    countryOfOrigin: data?.['lineItems[].countryOfOrigin'],
    commodityClassification: {
      code: data?.['lineItems[].commodityClassification.code'],
      scheme: data?.['lineItems[].commodityClassification.scheme'],
      description: data?.['lineItems[].commodityClassification.description'],
    },
    price: {
      amount: data?.['lineItems[].price.amount'],
    },
    discountsOrCharges: [
      {
        isCharge: true,
        percent: data?.['lineItems[].discountsOrCharges[isCharge=true].percent'] ?? 0,
        amount: data?.['lineItems[].discountsOrCharges[isCharge=true].amount'] ?? 0,
      },
      {
        isCharge: false,
        percent: data?.['lineItems[].discountsOrCharges[isCharge=false].percent'] ?? 0,
        amount: data?.['lineItems[].discountsOrCharges[isCharge=false].amount'] ?? 0,
      },
    ],
  };

  if (justCreateLineItem) {
    // When just creating line item, return only the line item
    return { mappedData: null, lineItem };
  } else {
    // When creating full document, return both mapped data and line item
    return { mappedData: { ...result, lineItems: [lineItem] }, lineItem };
  }
}

// Helper: generate destinations field based on country
const generateDestinations = (country: string, documentType: string) => {
  const countryCode = country.toUpperCase();

  if (countryCode === 'SA') {
    return [
      {
        type: 'tax_authority',
        details: {
          authority: 'ZATCA',
          country: 'SA',
          documentType: documentType,
        },
      },
    ];
  } else if (countryCode === 'MY') {
    return [
      {
        type: 'tax_authority',
        details: {
          authority: 'LHDNM',
          country: 'MY',
          documentType: documentType,
        },
      },
    ];
  } else if (countryCode === 'BE') {
    return [
      {
        type: 'peppol',
        details: {
          authority: 'BOSA',
          country: 'BE',
          documentType: documentType,
        },
      },
    ];
  } else if (countryCode === 'DE') {
    return [
      {
        type: 'tax_authority',
        details: {
          country: 'DE',
          authority: 'KOSIT',
          documentType: 'xrechnung',
        },
      },
    ];
  } else {
    // Default fallback for other countries
    return [
      {
        type: 'tax_authority',
        details: {
          authority: 'UNKNOWN',
          country: countryCode,
          documentType: documentType,
        },
      },
    ];
  }
};

export const saveParsedDocument = async (
  parsedData: any,
  documentType: 'invoice' | 'receipt',
  country: string,
  clientId: string,
  batchId: string,
  fileId: string,
  platformEnv: string,
  headerMap: Record<string, string>,
  dbConnection?: any
): Promise<{ success: boolean; documentId?: string; error?: string }> => {
  try {
    // 🔍 DEBUG: Dump entire Excel parsed data for validation debugging
    console.log(`🔍 (EXCEL_DUMP) Processing document for ${country} - Full parsedData:`, JSON.stringify(parsedData, null, 2));
    console.log(`🔍 (EXCEL_DUMP) ParsedData keys:`, Object.keys(parsedData || {}));
    console.log(`🔍 (EXCEL_DUMP) Prepayment-related keys:`, Object.keys(parsedData || {}).filter(key => key.toLowerCase().includes('prepayment') || key.toLowerCase().includes('pre-paid')));
    console.log(`🔍 (EXCEL_DUMP) HeaderMap keys:`, Object.keys(headerMap || {}));

    // Determine documentType from invoiceTypeFromExcel (source of truth)
    // Check for credit note first, then debit note, default to tax_invoice
    // Ensure invoiceTypeFromExcel is always a string to avoid .includes() errors
    const invoiceTypeFromExcel =
      parsedData?.invoiceTypeFromExcel != null ? String(parsedData.invoiceTypeFromExcel) : '';
    const documentTypeBasedOnExcelData = invoiceTypeFromExcel.includes('CREDIT_NOTE')
      ? 'credit_note'
      : invoiceTypeFromExcel.includes('DEBIT_NOTE')
        ? 'debit_note'
        : 'tax_invoice';

    // Convert flat keys to nested structure
    //const structuredData = await convertFlatKeysToNested(parsedData, headerMap);
    // const structuredData = await unflatten(parsedData);
    // console.log(`🔍 (UNFLATTEN) Structured data:`, JSON.stringify(structuredData, null, 2));

    // Generate document ID
    const documentId = ulid();

    // Helper function to build parties object from parsedData
    const buildPartiesObject = (data: any) => {
      // Use the existing parties from parsedData
      const existingParties = data.parties || {};

      // Ensure registrationNumbers are arrays as expected by validation
      if (existingParties.seller?.registrationNumbers && !Array.isArray(existingParties.seller.registrationNumbers)) {
        existingParties.seller.registrationNumbers = [existingParties.seller.registrationNumbers];
      }
      if (existingParties.buyer?.registrationNumbers && !Array.isArray(existingParties.buyer.registrationNumbers)) {
        existingParties.buyer.registrationNumbers = [existingParties.buyer.registrationNumbers];
      }
      if (existingParties.delivery?.registrationNumbers && !Array.isArray(existingParties.delivery.registrationNumbers)) {
        existingParties.delivery.registrationNumbers = [existingParties.delivery.registrationNumbers];
      }

      // Handle taxIds - the parsedData might have them in parties.seller.taxIds array
      if (data['parties.seller.taxIds'] && Array.isArray(data['parties.seller.taxIds'])) {
        if (!existingParties.seller) existingParties.seller = {};
        existingParties.seller.taxIds = data['parties.seller.taxIds'];
      }

      return existingParties;
    };

    // Build header object from parsedData
    const buildHeaderObject = (data: any) => {
      // Use the existing header from parsedData and add any missing fields
      const existingHeader = data.header || {};
      const header = {
        ...existingHeader,
        // Override documentType to match our internal format
        documentType: documentTypeBasedOnExcelData,
        // Add dueDate from payment if not present
        dueDate: existingHeader.dueDate || data.payment?.paymentDueDate,
      };

      // Ensure issueDate and dueDate are properly formatted
      if (header.issueDate && typeof header.issueDate === 'string' && !header.issueDate.includes('T')) {
        // If it's already in YYYY-MM-DD format, keep it
        if (/^\d{4}-\d{2}-\d{2}$/.test(header.issueDate)) {
          // Already formatted
        } else {
          // Try to parse and format
          const parsed = new Date(header.issueDate);
          if (!isNaN(parsed.getTime())) {
            header.issueDate = parsed.toISOString().split('T')[0];
          }
        }
      }

      if (header.dueDate && typeof header.dueDate === 'string') {
        if (header.dueDate.includes('T')) {
          // Extract date part from ISO string
          header.dueDate = header.dueDate.split('T')[0];
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(header.dueDate)) {
          const parsed = new Date(header.dueDate);
          if (!isNaN(parsed.getTime())) {
            header.dueDate = parsed.toISOString().split('T')[0];
          }
        }
      }

      return header;
    };

    const generatedDocument = {
      // Structured data only - no flattened fields
      clientId,
      batchId,
      fileId,
      environment: platformEnv,
      country,
      documentType: documentTypeBasedOnExcelData,
      documentStatus: 'DRAFT',
      countryDocumentStatus: 'DRAFT',
      documentId,
      header: {
        ...buildHeaderObject(parsedData),
        documentType: documentTypeBasedOnExcelData === 'tax_invoice' ? '388' :
                     documentTypeBasedOnExcelData === 'credit_note' ? '381' :
                     documentTypeBasedOnExcelData === 'debit_note' ? '383' : documentTypeBasedOnExcelData,
      },
      parties: buildPartiesObject(parsedData),
      destinations: generateDestinations(country, documentTypeBasedOnExcelData),
      meta: {
        ...(parsedData.meta || {}),
        mode: 'DOCUMENTS',
        operation: 'BULK',
        config: {
          ...(parsedData.meta?.config || {}),
          isB2G: invoiceTypeFromExcel.includes('B2G'),
          // SIMPLIFIED_TAX_INVOICE indicates B2C, otherwise default to B2B
          isB2B: invoiceTypeFromExcel.includes('SIMPLIFIED_TAX_INVOICE')
            ? false
            : invoiceTypeFromExcel.includes('B2G')
              ? false
              : true,
          isExport: invoiceTypeFromExcel.includes('EXPORT'),
          isSelfBilled: invoiceTypeFromExcel.includes('SELF_BILLED'),
          isThirdParty: invoiceTypeFromExcel.includes('THIRD_PARTY'),
          isNominalSupply: invoiceTypeFromExcel.includes('NOMINAL_SUPPLY'),
          isSummary: invoiceTypeFromExcel.includes('SUMMARY'),
          isPrepayment: invoiceTypeFromExcel.includes('PREPAYMENT'),
          isAdjusted: invoiceTypeFromExcel.includes('ADJUSTED'),
          isPartial: invoiceTypeFromExcel.includes('PARTIAL_CONSTRUCTIO'),
          isPartialFinalConst: invoiceTypeFromExcel.includes('PARTIAL_FINAL_CONSTRUCTION'),
          isFinalConstruction: invoiceTypeFromExcel.includes('FINAL_CONSTRUCTION'),
        },
      },
      // Add import metadata
      importMetadata: {
        batchId,
        fileId,
        invoiceTypeFromExcel,
        importedAt: new Date(),
        source: 'excel_import',
      },
      // Include structured fields from parsedData
      ...(parsedData.lineItems ? { lineItems: parsedData.lineItems } : {}),
      ...(parsedData.payment ? { payment: parsedData.payment } : {}),
      ...(parsedData.totals ? { totals: parsedData.totals } : {}),
      ...(parsedData.extensions ? { extensions: parsedData.extensions } : {}),
    };

    // Normalize Issue Time to HH:mm:ss.SSSZ for MY validation expectations
    try {
      const toTwo = (n: number) => String(n).padStart(2, '0');
      const toThree = (n: number) => String(n).padStart(3, '0');
      const isAlready = (s: string) => /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.test(s);
      const formatFromDate = (d: Date) =>
        `${toTwo(d.getUTCHours())}:${toTwo(d.getUTCMinutes())}:${toTwo(d.getUTCSeconds())}.${toThree(d.getUTCMilliseconds())}Z`;

      const parseLooseTime = (val: string): string | null => {
        if (!val || typeof val !== 'string') return null;
        const v = val.trim();
        if (isAlready(v)) return v;
        // ISO date-time
        const iso = Date.parse(v);
        if (!Number.isNaN(iso)) {
          return formatFromDate(new Date(iso));
        }
        // HH:mm or HH:mm:ss
        let m = v.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (m) {
          let hh = parseInt(m[1], 10);
          const mm = parseInt(m[2], 10);
          const ss = m[3] ? parseInt(m[3], 10) : 0;
          if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59 && ss >= 0 && ss <= 59) {
            const d = new Date(Date.UTC(1970, 0, 1, hh, mm, ss, 0));
            return formatFromDate(d);
          }
        }
        // h:mm AM/PM
        m = v.match(/^(\d{1,2}):(\d{2})\s*([ap]m)$/i);
        if (m) {
          let hh = parseInt(m[1], 10);
          const mm = parseInt(m[2], 10);
          const ampm = m[3].toLowerCase();
          if (ampm === 'pm' && hh < 12) hh += 12;
          if (ampm === 'am' && hh === 12) hh = 0;
          const d = new Date(Date.UTC(1970, 0, 1, hh, mm, 0, 0));
          return formatFromDate(d);
        }
        return null;
      };

      const incomingIssueTime =
        parsedData?.header?.issueTime || (parsedData as any)?.issueTime || '';
      const normalizedIssueTime = parseLooseTime(incomingIssueTime) || formatFromDate(new Date());
      if (!generatedDocument.header) generatedDocument.header = {} as any;
      (generatedDocument.header as any).issueTime = normalizedIssueTime;
    } catch (_) {
      // best-effort normalization
    }

    // Normalize registrationNumbers to arrays (validator expects arrays)
    try {
      const toArray = (val: any) => (Array.isArray(val) ? val : val == null ? [] : [val]);
      if (generatedDocument?.parties) {
        if (generatedDocument.parties.seller) {
          generatedDocument.parties.seller.registrationNumbers = toArray(
            generatedDocument.parties.seller.registrationNumbers
          );
        }
        if (generatedDocument.parties.buyer) {
          generatedDocument.parties.buyer.registrationNumbers = toArray(
            generatedDocument.parties.buyer.registrationNumbers
          );
        }
        if (generatedDocument.parties.delivery) {
          generatedDocument.parties.delivery.registrationNumbers = toArray(
            generatedDocument.parties.delivery.registrationNumbers
          );
        }
      }
    } catch (_) {
      // ignore normalization errors, validation will report if any
    }

    // Deep-clean helper to remove null/undefined/empty-string fields recursively
    const deepClean = (val: any): any => {
      if (Array.isArray(val)) {
        const cleaned = val.map(deepClean).filter((item) => {
          if (item === null || item === undefined) return false;
          if (typeof item === 'string' && item.trim() === '') return false;
          if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0)
            return false;
          return true;
        });
        return cleaned;
      }
      if (val && typeof val === 'object') {
        const out: any = {};
        for (const [k, v] of Object.entries(val)) {
          const cleaned = deepClean(v as any);
          if (cleaned === null || cleaned === undefined) continue;
          if (typeof cleaned === 'string' && cleaned.trim() === '') continue;
          if (
            typeof cleaned === 'object' &&
            !Array.isArray(cleaned) &&
            Object.keys(cleaned).length === 0
          )
            continue;
          out[k] = cleaned;
        }
        return out;
      }
      return val;
    };

    const cleanedGeneratedDocument = deepClean(generatedDocument);

    // Convert deliveryTerms, paymentTerms, and paymentMeans to arrays as expected by the validation engine
    // Add null checks to prevent errors when these properties don't exist
    if (cleanedGeneratedDocument.parties?.delivery?.deliveryTerms) {
      cleanedGeneratedDocument.parties.delivery.deliveryTerms = [
        cleanedGeneratedDocument.parties.delivery.deliveryTerms,
      ];
    }
    if (cleanedGeneratedDocument.payment?.paymentTerms) {
      cleanedGeneratedDocument.payment.paymentTerms = [
        cleanedGeneratedDocument.payment.paymentTerms,
      ];
    }
    if (cleanedGeneratedDocument.payment?.paymentMeans) {
      cleanedGeneratedDocument.payment.paymentMeans = [
        cleanedGeneratedDocument.payment.paymentMeans,
      ];
    }

    // Log destinations being added
    //log.infob(`🌍 (DESTINATIONS) Added destinations for ${country}:`, generatedDocument.destinations);
    ////console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ saveParsedDocument ~ generatedDocument:", generatedDocument)

    // 🔍 DEBUG: Dump structured document before validation
    console.log(`🔍 (VALIDATION_PREP) Cleaned document structure for ${country}:`, JSON.stringify(cleanedGeneratedDocument, null, 2));
    console.log(`🔍 (VALIDATION_PREP) Document keys:`, Object.keys(cleanedGeneratedDocument || {}));
    if (cleanedGeneratedDocument.parties) {
      console.log(`🔍 (VALIDATION_PREP) Parties structure:`, JSON.stringify(cleanedGeneratedDocument.parties, null, 2));
    }
    if (cleanedGeneratedDocument.header) {
      console.log(`🔍 (VALIDATION_PREP) Header structure:`, JSON.stringify(cleanedGeneratedDocument.header, null, 2));
    }
    if (cleanedGeneratedDocument.header) {
      console.log(`🔍 (VALIDATION_PREP) Header structure:`, JSON.stringify(cleanedGeneratedDocument.header, null, 2));
    }

    console.log(`🔍 (VALIDATION) Starting validation for document in ${country}`);
    const validationResults = await validateDocumentData(
      cleanedGeneratedDocument,
      country,
      documentType as any
    );
    console.log(
      `🔍 (VALIDATION) Validation completed - GETS valid: ${validationResults?.isGETSValid}, Country valid: ${validationResults?.isCountryValid}`
    );
    if (
      validationResults?.getsValidationErrors &&
      validationResults.getsValidationErrors.length > 0
    ) {
      console.log(
        `⚠️ (VALIDATION) GETS validation errors: ${JSON.stringify(validationResults.getsValidationErrors)}`
      );
    }
    if (
      validationResults?.countryValidationErrors &&
      validationResults.countryValidationErrors.length > 0
    ) {
      console.log(
        `⚠️ (VALIDATION) Country validation errors: ${JSON.stringify(validationResults.countryValidationErrors)}`
      );
    }
    const validatedAt = new Date().toISOString();

    // Decide countryDocumentStatus based on validation
    const validationPassed: boolean = !!(
      validationResults?.isGETSValid && validationResults?.isCountryValid
    );
    const computedCountryStatus = validationPassed ? 'VALIDATION_PASSED' : 'VALIDATION_FAILED';

    if (computedCountryStatus === 'VALIDATION_PASSED') {
      try {
        // Calculate taxTotals from lineItems using validation-engine utility
        const calculatedTaxTotals = calculateTaxTotalsFromLineItems(cleanedGeneratedDocument);

        // Ensure structure exists and assign
        if (Array.isArray(calculatedTaxTotals) && calculatedTaxTotals.length > 0) {
          // Attach to document we save so downstream flows don’t recompute
          (cleanedGeneratedDocument as any).taxTotals = calculatedTaxTotals;
        }
      } catch (e) {
        console.warn(
          '⚠️ (VALIDATION) Failed to generate taxTotals from line items:',
          e instanceof Error ? e.message : e
        );
      }
    }

    const documentToSave = {
      ...cleanedGeneratedDocument,
      countryDocumentStatus: computedCountryStatus,
      documentStatus: 'ON_HOLD',
      validationResult: {
        lastValidatedAt: validatedAt,
        methods: ['gets', country?.toLowerCase()],
        results: {
          gets: {
            valid: validationResults?.isGETSValid,
            errors: validationResults?.getsValidationErrors,
            errorCount: validationResults?.getsValidationErrors?.length,
            validatedAt: validatedAt,
          },
          [`${country?.toLowerCase()}`]: {
            valid: validationResults?.isCountryValid,
            errors: validationResults?.countryValidationErrors,
            errorCount: validationResults?.countryValidationErrors?.length,
            validatedAt: validatedAt,
          },
        },
      },
    };

    // 🔍 DEBUG: Dump final document to be saved
    console.log(`🔍 (FINAL_DOC) Final document structure to be saved:`, JSON.stringify(documentToSave, null, 2));
    console.log(`🔍 (FINAL_DOC) Document size: ${JSON.stringify(documentToSave).length} characters`);

    // Get the appropriate model for the collection using special collection parameter
    const specialCollection =
      documentType === 'invoice' ? `${country}_documents` : `${country}_receipts`;
    console.log(`💾 (SAVE) Getting model for collection: ${specialCollection}`);

    // Create a dynamic model for the collection with a flexible schema using the provided connection
    const dynamicSchema = new mongoose.Schema({}, { strict: false, collection: specialCollection });
    const DynamicModel = dbConnection
      ? dbConnection.model(specialCollection, dynamicSchema, specialCollection)
      : mongoose.models[specialCollection] || mongoose.model(specialCollection, dynamicSchema, specialCollection);

    // Create and save the document
    console.log(`💾 (SAVE) Creating document instance with ID: ${documentId}`);
    const document = new DynamicModel(documentToSave);
    console.log(`💾 (SAVE) Saving document to database...`);
    await document.save();
    console.log(`💾 (SAVE) Document saved successfully!`);

    //log.infob(`💾 (SAVE) Document saved successfully: ${documentId} in collection ${collectionName}`);

    return { success: true, documentId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.log(
      `❌ (SAVE) Error saving document: ${errorMessage}${errorStack ? `\nStack: ${errorStack}` : ''}`
    );
    return { success: false, error: errorMessage };
  }
};
