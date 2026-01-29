import { Hono } from 'hono'
// Mock DynamicDocumentModelManager
const DynamicDocumentModelManager = {
  getModel: async (country: string, documentType: string, options: any, collection: string) => {
    // Mock model with find and updateOne methods
    return {
      find: async (query: any) => {
        // Mock empty array for now
        return [];
      },
      updateOne: async (filter: any, update: any) => {
        // Mock successful update
        return { acknowledged: true, modifiedCount: 1 };
      }
    };
  }
};
import { connectDB } from '../config/database'
import { getImportHistoryModel } from '../models/import_history'
import { validateDocumentData } from '../utils/import-doc-utils'

export const bulkValidate = new Hono()

interface BulkValidateParams {
  country: string
  documentType: 'invoice' | 'receipt'
  clientId: string
  batchId: string
  platformEnv: string
}

bulkValidate.post('/', async (c) => {
  try {
    console.log(`(BULK_VALIDATE) 📥 Bulk validate request received`)
    
    const params = await c.req.json<BulkValidateParams>()
    console.log(`(BULK_VALIDATE) 📋 Parameters:`, params)

    const {
      clientId,
      batchId,
      country,
      documentType,
      platformEnv
    } = params

    if (!clientId || !batchId || !country || !documentType || !platformEnv) {
      console.log(`(BULK_VALIDATE) ❌ Missing required fields`)
      return c.json(
        { error: 'Missing required fields' },
        400
      )
    }

    console.log(`(BULK_VALIDATE) 🚀 Starting batch ${batchId}`)

    const connection = await connectDB()

    const ImportHistoryModel = getImportHistoryModel(
      connection,
      country,
      documentType
    )

    const batchData = await ImportHistoryModel.findOne({
      batchId,
      clientId,
      platformEnv
    })

    if (!batchData) {
      console.log(`(BULK_VALIDATE) ❌ Batch ${batchId} not found in import history`)
      return c.json(
        { error: `Batch ${batchId} not found` },
        404
      )
    }

    console.log(`(BULK_VALIDATE) ✅ Batch found: ${batchData.batchStatus} status, ${batchData.documentsCount} documents`)

    const sourceCollection =
      documentType === 'invoice'
        ? `${country}_documents`
        : `${country}_receipts`

    console.log(`(BULK_VALIDATE) 📂 Using collection: ${sourceCollection}`)

    const DocumentModel =
      await DynamicDocumentModelManager.getModel(
        country,
        documentType,
        {},
        sourceCollection
      )

    console.log(`(BULK_VALIDATE) 🔍 Querying documents with: { batchId: "${batchId}" }`)
    const documents = await DocumentModel.find({ batchId })

    console.log(`(BULK_VALIDATE) 📊 Found ${documents.length} documents for batch ${batchId}`)
    
    if (!documents.length) {
      console.log(`(BULK_VALIDATE) ⚠️ No documents found for batch ${batchId} in collection ${sourceCollection}`)
      return c.json({
        success: true,
        validatedCount: 0,
        errorCount: 0,
        batchId,
        validationSummary: {
          totalDocuments: 0,
          validDocuments: 0,
          invalidDocuments: 0
        }
      })
    }

    console.log(`(BULK_VALIDATE) 🚀 Starting validation of ${documents.length} documents...`)

    let validatedCount = 0
    let errorCount = 0

    // ⚡ Parallel validation (much faster than for-loop)
    await Promise.all(
      documents.map(async (doc, index) => {
        console.log(`(BULK_VALIDATE) 📄 Validating document ${index + 1}/${documents.length} (ID: ${doc._id})`)
        try {
          const validationResult = await validateDocumentData(
            doc,
            country,
            documentType
          )

          console.log(`(BULK_VALIDATE) ✅ Document ${index + 1} validation completed`)

          const isValid =
            validationResult.isGETSValid &&
            validationResult.isCountryValid

          console.log(`(BULK_VALIDATE) 📊 Document ${index + 1} result: ${isValid ? 'VALID' : 'INVALID'}`)

          const validationData = {
            overallValidationSuccess: isValid,
            lastValidatedAt: new Date().toISOString(),
            methods: ['gets', country.toLowerCase()],
            results: {
              gets: {
                isValid: validationResult.isGETSValid,
                errors: validationResult.getsValidationErrors || []
              },
              [country.toLowerCase()]: {
                isValid: validationResult.isCountryValid,
                errors: validationResult.countryValidationErrors || []
              }
            },
            summary: {
              totalErrors:
                (validationResult.getsValidationErrors?.length || 0) +
                (validationResult.countryValidationErrors?.length || 0),
              totalWarnings: 0,
              criticalErrors:
                (validationResult.getsValidationErrors?.length || 0) +
                (validationResult.countryValidationErrors?.length || 0)
            }
          }

          await DocumentModel.updateOne(
            { _id: doc._id },
            {
              $set: {
                validationResult: validationData,
                validatedAt: new Date().toISOString(),
                documentStatus: isValid
                  ? 'VALIDATION_PASSED'
                  : 'VALIDATION_FAILED',
                countryDocumentStatus: isValid
                  ? 'VALIDATION_PASSED'
                  : 'VALIDATION_FAILED'
              }
            }
          )

          if (isValid) validatedCount++
          else errorCount++

        } catch (err) {
          errorCount++
          console.log('(BULK_VALIDATE) ❌ Doc error:', err)
        }
      })
    )

    await ImportHistoryModel.updateOne(
      { batchId },
      {
        $set: {
          batchStatus:
            errorCount === 0
              ? 'completed'
              : 'validation_completed',
          updatedAt: new Date()
        }
      }
    )

    console.log(`(BULK_VALIDATE) 🎯 Batch validation completed:`)
    console.log(`   - Total documents: ${documents.length}`)
    console.log(`   - Validated: ${validatedCount}`)
    console.log(`   - Errors: ${errorCount}`)
    console.log(`   - Batch status: ${errorCount === 0 ? 'completed' : 'validation_completed'}`)

    return c.json({
      success: true,
      validatedCount,
      errorCount,
      batchId,
      validationSummary: {
        totalDocuments: documents.length,
        validDocuments: validatedCount,
        invalidDocuments: errorCount
      }
    })

  } catch (error) {
    console.log('(BULK_VALIDATE) ❌ Fatal error:', error)

    return c.json(
      { success: false, error: 'Internal server error' },
      500
    )
  }
})

export default bulkValidate
