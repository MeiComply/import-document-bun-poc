import { downloadFileService } from '../api/import_document.js'

import { Hono } from 'hono'

export const downloadRoute = new Hono()

downloadRoute.get('/downloadFile', async (c) => {
  try {
    const fileId = c.req.query('fileId')
    const clientId = c.req.query('clientId')
    const country = c.req.query('country')
    const documentType = c.req.query('documentType') as 'invoice' | 'receipt'
    const platformEnv = c.req.query('platformEnv')
    const infraEnv = c.req.query('infraEnv')

    const result = await downloadFileService(
      fileId!,
      clientId!,
      country!,
      documentType!,
      platformEnv!,
      infraEnv!
    )

    return c.json(result.buffer, {
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.fileName}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    })
  } catch (err: any) {
    switch (err.message) {
      case 'MISSING_PARAMS':
        return c.json({ success: false, error: 'Missing params' }, 400)

      case 'FILE_NOT_FOUND':
        return c.json({ success: false, error: 'File not found' }, 404)

      case 'INVALID_FILE':
        return c.json({ success: false, error: 'Invalid file' }, 404)

      default:
        return c.json({ success: false, error: 'Download failed' }, 500)
    }
  }
})
