import { Hono } from 'hono'
import { processImportBatchService } from '../api/import_document.js'

export const processBatchRoute = new Hono()

processBatchRoute.post('/', async (c) => {
  try {
    const body = await c.req.json()

    const batch = await processImportBatchService(body)

    return c.json({ success: true, batch })
  } catch (err: any) {
    switch (err.message) {
      case 'MISSING_PARAMS':
        return c.json({ success: false, error: 'Missing required fields' }, 400)

      case 'BATCH_NOT_FOUND':
        return c.json({ success: false, error: 'Batch not found' }, 404)

      default:
        return c.json(
          { success: false, error: err.message || 'Processing failed' },
          500
        )
    }
  }
})
