import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import busboy from 'busboy';
import { Readable } from 'stream';
import { ulid } from 'ulid';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { connectDB } from '../config/database';
import { s3Client } from '../infra';
import { IImportHistory, getImportHistoryModel } from '../models/import_history';
import {
  createS3Key,
  extractDocumentNumber,
  getFileExtension,
  isValidFileExtension,
  mapHeadersToInternalFields,
  saveParsedDocument,
  unflatten,
} from '../utils/import-doc-utils';

// Helper function to map environment names to bucket suffixes
function mapInfraEnvToBucketSuffix(infraEnv: string): string {
  const envMap: Record<string, string> = {
    development: 'dev',
    local: 'dev',
    production: 'prod',
    staging: 'staging',
    testing: 'test',
  };
  return envMap[infraEnv] || infraEnv;
}

// In-memory cache for sourceId resolution (scoped to batch processing)
// Using Map with composite key: `${sourceName}|${sourceVersion}|${clientId}`
// This cache will be garbage collected when the batch processing completes
const sourceIdCache = new Map<string, string | null>();

/**
 * Adds consolidation fields to receipt documents before saving
 * @param structuredData - The document data to modify
 * @param documentType - The document type ('invoice' | 'receipt')
 * @param clientId - Client ID for source resolution
 * @returns Promise<void>
 */
async function addReceiptConsolidationFields(
  structuredData: any,
  documentType: 'invoice' | 'receipt',
  clientId: string
): Promise<void> {
  // Only process receipts
  if (documentType !== 'receipt') {
    return;
  }

  // Extract sourceName and sourceVersion from meta.source
  const sourceName = structuredData?.meta?.source?.name;
  const sourceVersion = structuredData?.meta?.source?.version;

  // Resolve sourceId
  const sourceId = "hardcoded-source-id";

  // Add consolidation fields to the document
  structuredData.isConsolidationProcessed = false;
  structuredData.isConsolidatable = true;
  if (sourceId) {
    structuredData.sourceId = sourceId;
  }

  console.log(
    `(IMPORT) 📝 Added consolidation fields to receipt: isConsolidationProcessed=false, isConsolidatable=true, sourceId=${sourceId ?? 'null'}`
  );
}

// Helper: download S3 object
async function downloadS3Object(bucketName: string, key: string): Promise<Buffer> {
  const obj = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
  const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  };
  return await streamToBuffer(obj.Body as Readable);
}

// Helper: get content type from filename
function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
  };
  return contentTypes[ext || ''];
}

// Static array to define sequential fields that need special processing
const SEQUENTIAL_FIELDS = [
  'parties.seller.registrationNumbers[].type',
  'parties.seller.registrationNumbers[].value',
  'parties.buyer.registrationNumbers[].type',
  'parties.buyer.registrationNumbers[].value',
  'parties.delivery.registrationNumbers[].type',
  'parties.delivery.registrationNumbers[].value',
  'lineItems[].id',
  'lineItems[].commodityClassification',
  'lineItems[].commodityCode',
  'lineItems[].countryOfOrigin',
  'lineItems[].description',
  'lineItems[].price.amount',
  'lineItems[].unitCode',
  'lineItems[].quantity',
  'lineItems[].lineTaxableValue',
  'lineItems[].taxCategory',
  'lineItems[].taxRate',
  'lineItems[].taxAmount',
  'lineItems[].taxExemptionReason',
  'lineItems[].lineTotal',
  'taxTotals[].taxSubtotals[].taxCategory',
  'taxTotals[].taxSubtotals[].taxableAmount',
  'taxTotals[].taxSubtotals[].taxAmount',
  'taxTotals[].taxSubtotals[].taxExemptionReason',
  'payment.paymentMeans[].paymentMeansCode',
  'payment.paymentMeans[].creditTransferInfo.payeeFinancialAccountId',
  'payment.paymentTerms[].note',
  'payment.paymentMeans[].paymentId',
  'parties.delivery.deliveryTerms[].incoterms',
];

// Helper function to format time fields to hh:mm:ss format
const formatTimeField = (value: any, fieldName: string): string | null => {
  if (!value) return null;

  try {
    let timeString: string;

    // If it's already a Date object (from XLSX with cellDates: true)
    if (value instanceof Date) {
      // Extract time components from Date object
      const hours = String(value.getHours()).padStart(2, '0');
      const minutes = String(value.getMinutes()).padStart(2, '0');
      const seconds = String(value.getSeconds()).padStart(2, '0');
      timeString = `${hours}:${minutes}:${seconds}`;
    } else if (typeof value === 'string') {
      const trimmedValue = value.trim();

      // Try to parse time formats
      const timeFormats = [
        // HH:MM:SS format
        /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/.exec(trimmedValue),
        // HH:MM format (assume 00 seconds)
        /^(\d{1,2}):(\d{1,2})$/.exec(trimmedValue),
      ];

      let parsedTime: string | null = null;

      for (const match of timeFormats) {
        if (match) {
          const [, hours, minutes, seconds] = match;
          const h = String(parseInt(hours)).padStart(2, '0');
          const m = String(parseInt(minutes)).padStart(2, '0');
          const s = seconds ? String(parseInt(seconds)).padStart(2, '0') : '00';
          parsedTime = `${h}:${m}:${s}`;
          break;
        }
      }

      if (parsedTime) {
        timeString = parsedTime;
      } else {
        // Fallback to original string if it looks like a time
        if (/^\d{1,2}[:.]\d{1,2}/.test(trimmedValue)) {
          timeString = trimmedValue;
        } else {
          return null;
        }
      }
    } else {
      return null;
    }

    return timeString;
  } catch (error) {
    console.log(`(IMPORT) ⚠️ Failed to format time field ${fieldName}: ${value}`, error);
  }
  return null;
};

// Helper function to format date fields to yyyy-MM-dd format
const formatDateField = (value: any, fieldName: string): string | null => {
  if (!value) return null;

  try {
    let date: Date;

    // If it's already a Date object (from XLSX with cellDates: true)
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      // Handle string dates from CSV files
      const trimmedValue = value.trim();

      // Try common date formats
      const dateFormats = [
        // DD/MM/YY format (common in CSV exports)
        /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(trimmedValue),
        // DD-MM-YY format
        /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/.exec(trimmedValue),
        // YYYY-MM-DD format
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmedValue),
        // MM/DD/YYYY format
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmedValue),
      ];

      let parsedDate: Date | null = null;

      for (const match of dateFormats) {
        if (match) {
          const [, part1, part2, part3] = match;
          const year =
            part3.length === 2
              ? parseInt(part3) < 50
                ? 2000 + parseInt(part3)
                : 1900 + parseInt(part3)
              : parseInt(part3);

          // Determine if it's DD/MM or MM/DD format based on the values
          if (part1.length <= 2 && part2.length <= 2) {
            // If first part > 12, it's likely DD/MM format
            if (parseInt(part1) > 12) {
              parsedDate = new Date(year, parseInt(part2) - 1, parseInt(part1));
            } else if (parseInt(part2) > 12) {
              // If second part > 12, it's likely MM/DD format
              parsedDate = new Date(year, parseInt(part1) - 1, parseInt(part2));
            } else {
              // Ambiguous case - try DD/MM first (more common in international formats)
              parsedDate = new Date(year, parseInt(part2) - 1, parseInt(part1));
            }
          } else {
            // YYYY-MM-DD format
            parsedDate = new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
          }

          if (parsedDate && !isNaN(parsedDate.getTime())) {
            break;
          }
        }
      }

      if (parsedDate) {
        date = parsedDate;
      } else {
        // Fallback to standard Date constructor
        date = new Date(trimmedValue);
      }
    } else {
      // For other types, try direct conversion
      date = new Date(value);
    }

    if (!isNaN(date.getTime())) {
      // Use local date methods to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`; // yyyy-MM-dd format
    }
  } catch (error) {
    console.log(`(IMPORT) ⚠️ Failed to format date field ${fieldName}: ${value}`, error);
  }
  return null;
};

// Type definitions
export interface ImportDocumentFormData {
  documentType: 'invoice' | 'receipt';
  clientId: string;
  selectedCountry: string;
  userId: string;
  platformEnv: string;
  infraEnv: string;
}

export type UploadedFile = {
  fileId: string;
  filename: string;
  s3Key?: string;
  status: 'processing' | 'rejected';
};

export interface ImportDocumentResponse {
  success: boolean;
  batch: any;
}

// Request parameters interface for getImportHistory API
interface GetImportHistoryParams {
  country: string;
  documentType: 'invoice' | 'receipt';
  clientId: string;
  platformEnv: string;
  infraEnv: string;
  page?: number; // Page number (1-based), defaults to 1
  limit?: number; // Number of items per page, defaults to 20
}

// File interface for the response
interface ImportHistoryFile {
  fileId: string;
  fileName: string;
  fileStatus: 'processing' | 'completed' | 'rejected' | 'failed' | 'deleted';
  uploadedDateTime: Date;
  documentsCount: number;
  hasDuplicatesWith: string[];
  s3Key?: string;
  batchId: string;
  batchStatus: 'processing' | 'completed' | 'failed' | 'validation_completed';
  createdAt: Date;
  updatedAt: Date;
}

// Response interface for getImportHistory API
interface GetImportHistoryResponse {
  success: boolean;
  files: ImportHistoryFile[];
  pagination: {
    currentPage: number;
    currentPageSize: number;
    totalPages: number;
    totalFiles: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    processing: number;
    completed: number;
    rejected: number;
    failed: number;
    deleted: number;
  };
}

/**
 * NEW: Step 1 - Upload files and create batch (no parsing)
 * - Streams multipart to S3
 * - Creates ImportHistory with files (status: processing/rejected)
 * - Returns batchId and file metadata
 * Keeps existing importDoc endpoint intact; this is a split-first step.
 */
export async function uploadImportFilesService(
  fields: Record<string, string>,
  files: File[]
) {
  const required = [
    'documentType',
    'clientId',
    'selectedCountry',
    'userId',
    'platformEnv',
    'infraEnv',
  ] as const

  for (const k of required) {
    if (!fields[k]) {
      throw new Error(`MISSING_${k}`)
    }
  }

  const batchId = ulid()
  const uploadedFiles: UploadedFile[] = []
  const uploadPromises: Promise<void>[] = []

  for (const file of files) {
    const filename = file.name
    const fileId = uuidv4()
    const fileExtension = getFileExtension(filename)

    const s3Key = createS3Key(
      fields.selectedCountry,
      fields.platformEnv,
      fields.clientId,
      batchId,
      fileId,
      filename
    )

    const bucketEnv = mapInfraEnvToBucketSuffix(fields.infraEnv)
    const bucketName = `v3-${bucketEnv}-excel-imports`
    console.log("Using bucket", bucketName)

    const isValidExtension = isValidFileExtension(filename)
    const fileStatus = isValidExtension ? 'processing' : 'rejected'

    uploadedFiles.push({
      fileId,
      filename,
      s3Key,
      status: fileStatus,
    })

    console.log(`📄 File ${filename}: status=${fileStatus}, s3Key=${s3Key}, bucket=${bucketName}`)

    // Read file as buffer for reliable S3 upload
    console.log(`📤 Reading file ${filename} as buffer...`)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.log(`📤 File ${filename} read successfully, size: ${fileBuffer.length} bytes`)

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.type || 'application/octet-stream',
        Metadata: {
          originalName: filename,
          fileId,
          batchId,
          clientId: fields.clientId,
          uploadedBy: fields.userId,
          fileStatus,
          ...(fileStatus === 'rejected' && {
            rejectionReason: `Invalid file extension: ${fileExtension}`,
          }),
        },
      },
    })

    console.log(`📤 Starting S3 upload for ${filename} to bucket ${bucketName} with key ${s3Key}`)
    uploadPromises.push(
      upload.done()
        .then(() => {
          console.log(`✅ S3 upload successful for ${filename}`)
        })
        .catch((error) => {
          console.error(`❌ S3 upload failed for ${filename}:`, error)
          // Mark file as failed if upload fails
          uploadedFiles.find(f => f.fileId === fileId)!.status = 'rejected'
          uploadedFiles.find(f => f.fileId === fileId)!.s3Key = undefined // Remove s3Key for failed uploads
          throw error
        })
    )
  }

  console.log(`📤 Starting upload of ${files.length} files to S3...`)
  try {
    await Promise.all(uploadPromises)
    console.log(`✅ All S3 uploads completed successfully`)
  } catch (error) {
    console.error(`❌ One or more S3 uploads failed:`, error)
    // Continue with batch creation but mark failed files appropriately
  }

  const connection = await connectDB()
  const ImportHistory = getImportHistoryModel(
    connection,
    fields.selectedCountry,
    fields.documentType as any
  ) 

  // Determine initial batch status based on file upload results
  const hasFailedUploads = uploadedFiles.some(f => f.status === 'rejected')
  const initialBatchStatus = hasFailedUploads ? 'failed' : 'processing'
  
  console.log(`📋 Creating batch with status: ${initialBatchStatus} (${uploadedFiles.filter(f => f.status === 'rejected').length} rejected uploads)`)

  let batchDoc;


  try{
    batchDoc = await new ImportHistory({
    batchId,
    clientId: fields.clientId,
    userId: fields.userId,
    platformEnv: fields.platformEnv,
    batchStatus: initialBatchStatus,
    documentsCount: 0,
    files: uploadedFiles.map((f) => ({
      fileId: f.fileId,
      fileName: f.filename,
      fileStatus: f.status,
      uploadedDateTime: new Date(),
      documentsCount: 0,
      hasDuplicatesWith: [],
      s3Key: f.s3Key,
      rejectionReason: f.status === 'rejected' ? 'Invalid file extension' : undefined,
    })),
    documentNumberMap: {},
    documentType: fields.documentType,
    country: fields.selectedCountry,
  }).save()

    console.log(`✅ Batch created successfully with ID: ${batchDoc.batchId}`)
    console.log(`📊 Batch summary: ${uploadedFiles.length} files, ${uploadedFiles.filter(f => f.status === 'failed').length} failed uploads`)

  }
  catch(e){
    console.error(`❌ Failed to create batch:`, e)
    throw e
  }

  console.log("🎉 Upload process completed!")
  return batchDoc
}

/**
 * NEW: Step 2 - Process a batch by batchId (parse, validate, save documents)
 * Mirrors the second half of importDoc, preserving existing behavior.
 * 
 */

export function serializeMongoData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeMongoData(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    // Convert to plain object using JSON parse/stringify to remove MongoDB specific properties
    return JSON.parse(JSON.stringify(data));
  }

  // Return primitive values as-is
  return data;
}

export async function processImportBatchService(params: {
  country: string
  documentType: 'invoice' | 'receipt'
  clientId: string
  userId?: string
  platformEnv: string
  infraEnv: string
  batchId: string
}) {
  console.log(`🚀 Starting batch processing for batchId: ${params.batchId}`);
  console.log(`   Parameters:`, {
    country: params.country,
    documentType: params.documentType,
    clientId: params.clientId,
    platformEnv: params.platformEnv,
    infraEnv: params.infraEnv,
    batchId: params.batchId
  });

  const {
    country,
    documentType,
    clientId,
    platformEnv,
    infraEnv,
    batchId,
  } = params

  if (!country || !documentType || !clientId || !platformEnv || !infraEnv || !batchId) {
    console.error(`❌ Missing required parameters:`, { country, documentType, clientId, platformEnv, infraEnv, batchId });
    throw new Error('MISSING_PARAMS')
  }

  const connection = await connectDB()
  console.log(`🔌 Database connection established`);

  const ImportHistory = getImportHistoryModel(connection, country, documentType)
  console.log(`📋 ImportHistory model created for ${country}_${documentType}`);

  console.log(`🔍 Looking for batch document: batchId=${batchId}, clientId=${clientId}`);
  const batchDoc = await ImportHistory.findOne({ batchId, clientId })

  if (!batchDoc) {
    console.error(`❌ Batch document not found: batchId=${batchId}, clientId=${clientId}`);
    throw new Error('BATCH_NOT_FOUND')
  }
  console.log(`✅ Batch document found with ${batchDoc.files?.length || 0} files`);

  // Helper
  const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
    return Buffer.concat(chunks)
  }

  const docNumToFiles = new Map<string, Set<string>>()

  for (const f of batchDoc.files) {
    console.log(`📁 Processing file ${f.fileId}: ${f.fileName} (status: ${f.fileStatus})`);

    if (!f.s3Key) {
      console.log(`⚠️ Skipping file ${f.fileId} - no S3 key`);
      continue
    }

    if (f.fileStatus === 'rejected' || f.fileStatus === 'deleted') {
      console.log(`⏭️ Skipping file ${f.fileId} - status is ${f.fileStatus}`);
      await (batchDoc as any).updateFileStatus(f.fileId, f.fileStatus, 0)
      continue
    }

    console.log(`📥 Downloading file ${f.fileId} from S3...`);
    try {
      const bucketEnv = mapInfraEnvToBucketSuffix(infraEnv)
      console.log(`   Bucket: v3-${bucketEnv}-excel-imports, Key: ${f.s3Key}`);

      const obj = await s3Client.send(
        new GetObjectCommand({
          Bucket: `v3-${bucketEnv}-excel-imports`,
          Key: f.s3Key,
        })
      )

      const buffer = await streamToBuffer(obj.Body as Readable)
      console.log(`✅ File downloaded successfully, size: ${buffer.length} bytes`);

      console.log(`📊 Parsing Excel file...`);
      const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })
      console.log(`📊 Excel file parsed with ${wb.SheetNames.length} sheets: ${wb.SheetNames.join(', ')}`);

      let fileDocCount = 0

      for (const name of wb.SheetNames) {
        console.log(`📋 Processing sheet: ${name}`);
        const ws = wb.Sheets[name]

        const matrix = XLSX.utils.sheet_to_json<any[]>(ws, {
          header: 1,
          defval: null,
        }) as any[]

        if (!matrix.length) continue

        const headers = matrix[0] as string[]
        const hm = mapHeadersToInternalFields(headers, documentType as any, country)

        let currentInvoice: any = null
        let prevDocumentNumber: string | null = null

        for (let i = 1; i < matrix.length; i++) {
          const row = matrix[i]
          const data: any = {}

          headers.forEach((h, idx) => {
            const mapped = hm[h] || h
            data[mapped] = row[idx]
          })

          const hasData = Object.values(data).some(
            (v) => v !== null && v !== undefined && v !== ''
          )
          if (!hasData) continue

          // ---- your transformations (unchanged) ----

          const dateFields = [
            'header.issueDate',
            'header.invoicePeriod.startDate',
            'header.invoicePeriod.endDate',
            'header.dueDate',
          ]

          const timeFields = ['header.issueTime', 'header.dueTime']

          dateFields.forEach((f) => data[f] && (data[f] = formatDateField(data[f], f)))
          timeFields.forEach((f) => data[f] && (data[f] = formatTimeField(data[f], f)))

          const flattenedResult = await unflatten(data)
          const structuredData = flattenedResult.mappedData

          const docNumber =
            String(
              extractDocumentNumber(structuredData, documentType as any) ||
              structuredData.documentNumber ||
              structuredData.invoiceNumber ||
              structuredData.receiptNumber ||
              ''
            ).trim()

          const isNew = prevDocumentNumber !== docNumber

          if (docNumToFiles.has(docNumber) && isNew) {
            docNumToFiles.get(docNumber)!.add(f.fileId)
            continue
          }

          if (isNew) {
            if (currentInvoice) {
              await addReceiptConsolidationFields(currentInvoice, documentType as any, clientId)

              console.log(`🔍 Processing document ${prevDocumentNumber} - Starting validation and save...`);
              await saveParsedDocument(
                currentInvoice,
                documentType as any,
                country,
                clientId,
                batchId,
                f.fileId,
                platformEnv,
                hm,
                connection
              )
              console.log(`✅ Document ${prevDocumentNumber} - Validation and save completed`);

              docNumToFiles.get(prevDocumentNumber!)!.add(f.fileId)
              fileDocCount++
            }

            currentInvoice = structuredData
            prevDocumentNumber = docNumber

            if (!docNumToFiles.has(docNumber)) {
              docNumToFiles.set(docNumber, new Set())
            }
          } else {
            const lineItemResult = await unflatten(data, true)
            const newLineItem = lineItemResult.lineItem

            currentInvoice.lineItems ??= []
            currentInvoice.lineItems.push(newLineItem)
          }
        }

        if (currentInvoice) {
          await addReceiptConsolidationFields(currentInvoice, documentType as any, clientId)

          console.log(`🔍 Processing final document ${prevDocumentNumber} - Starting validation and save...`);
          await saveParsedDocument(
            currentInvoice,
            documentType as any,
            country,
            clientId,
            batchId,
            f.fileId,
            platformEnv,
            hm,
            connection
          )
          console.log(`✅ Final document ${prevDocumentNumber} - Validation and save completed`);

          docNumToFiles.get(prevDocumentNumber!)!.add(f.fileId)
          fileDocCount++
        }
      }

      console.log(`✅ File ${f.fileId} processing completed - ${fileDocCount} documents processed`);
      await (batchDoc as any).updateFileStatus(f.fileId, 'completed', fileDocCount)
      batchDoc.documentsCount += fileDocCount
      await batchDoc.save()

    } catch (e) {
      console.error(`💥 File processing failed for ${f.fileName} (${f.fileId}):`, e);
      console.error(`   Error details:`, {
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
        fileName: f.fileName,
        fileId: f.fileId,
        batchId,
        clientId
      });
      await (batchDoc as any).updateFileStatus(f.fileId, 'failed', 0)
    }
  }

  console.log(`🔄 Finalizing batch processing...`);
  batchDoc.documentNumberMap = Object.fromEntries(
    Array.from(docNumToFiles.entries()).map(([k, set]) => [k, Array.from(set)])
  )

  await batchDoc.save()
  await (batchDoc as any).updateDuplicates()

  const hasFailedFiles = batchDoc.files.some((f: any) => f.fileStatus === 'failed');
  batchDoc.batchStatus = hasFailedFiles ? 'failed' : 'completed';

  await batchDoc.save();

  console.log(`🎯 Batch processing completed!`);
  console.log(`   Status: ${batchDoc.batchStatus}`);
  console.log(`   Total documents: ${batchDoc.documentsCount}`);
  console.log(`   Files processed: ${batchDoc.files.length}`);
  console.log(`   Failed files: ${batchDoc.files.filter((f: any) => f.fileStatus === 'failed').length}`);

  sourceIdCache.clear()

  return serializeMongoData(batchDoc)
}


/**
 * Download File API endpoint
 *
 * Downloads a file from S3 by fileId
 *
 * @param params - Download file parameters
 * @returns File buffer streamed as response
 */

export async function downloadFileService(
  fileId: string,
  clientId: string,
  country: string,
  documentType: 'invoice' | 'receipt',
  platformEnv: string,
  infraEnv: string
) {
  if (!fileId || !clientId || !country || !documentType || !platformEnv || !infraEnv) {
    throw new Error('MISSING_PARAMS')
  }

  console.log(`(DOWNLOAD_FILE) 📥 Starting download for file ${fileId}`)

  const connection = await connectDB()
  const ImportHistory = getImportHistoryModel(connection, country, documentType)

  const batchDoc = await ImportHistory.findOne({
    clientId,
    platformEnv,
    'files.fileId': fileId,
  })

  if (!batchDoc) {
    throw new Error('FILE_NOT_FOUND')
  }

  const fileDoc = batchDoc.files.find((f: any) => f.fileId === fileId)

  if (!fileDoc || !fileDoc.s3Key) {
    throw new Error('INVALID_FILE')
  }

  const bucketEnv = mapInfraEnvToBucketSuffix(infraEnv)
  const bucketName = `v3-${bucketEnv}-excel-imports`

  const fileBuffer = await downloadS3Object(bucketName, fileDoc.s3Key)

  return {
    buffer: fileBuffer,
    fileName: fileDoc.fileName,
    contentType: getContentType(fileDoc.fileName),
  }
}
