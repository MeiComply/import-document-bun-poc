import { Hono } from 'hono'
import { uploadImportFilesService } from '../api/import_document.js'

export const uploadRoute = new Hono()

uploadRoute.post('/', async (c) => {
  try {
    console.log('📤 Upload request received')
    console.log('📤 Request headers:', Object.fromEntries(c.req.raw.headers.entries()))
    console.log('📤 Content-Type:', c.req.header('Content-Type'))
    
    const body = await c.req.parseBody()
    console.log('📤 Parsed body keys:', Object.keys(body))
    console.log('📤 Body details:', Object.entries(body).map(([key, value]) => ({
      key,
      type: typeof value,
      isFile: value instanceof File,
      isArray: Array.isArray(value),
      value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : 
             Array.isArray(value) ? `Array: ${value.length} items` : 
             typeof value === 'string' ? value.substring(0, 100) : value
    })))

    const fields: Record<string, string> = {}
    const files: File[] = []

    for (const [key, value] of Object.entries(body)) {
      if (value instanceof File) {
        console.log(`📄 Found file: ${key} -> ${value.name} (${value.size} bytes, type: ${value.type})`)
        files.push(value)
      } else if (Array.isArray(value)) {
        console.log(`📋 Found array for key: ${key}, checking for files...`)
        value.forEach((v, i) => {
          if (v instanceof File) {
            console.log(`📄 Found file in array: ${key}[${i}] -> ${v.name} (${v.size} bytes)`)
            files.push(v)
          } else {
            console.log(`📝 Found non-file in array: ${key}[${i}] -> ${typeof v}`)
          }
        })
      } else {
        console.log(`📝 Found field: ${key} -> ${value}`)
        fields[key] = value as string
      }
    }

    console.log(`📊 Summary: ${files.length} files, ${Object.keys(fields).length} fields`)
    
    if (!files.length) {
      console.log('❌ No files found in request')
      return c.json({ success: false, error: 'No files uploaded' }, 400)
    }

    console.log('🚀 Starting upload service...')
    const batchDoc = await uploadImportFilesService(fields, files)

    console.log('✅ Upload completed successfully')
    return c.json({ success: true, batch: batchDoc })
  } catch (err: any) {
    console.error('❌ Upload error:', err)
    if (err.message?.startsWith('MISSING_')) {
      return c.json(
        { success: false, error: `Missing form field: ${err.message.replace('MISSING_', '')}` },
        400
      )
    }

    return c.json(
      { success: false, error: err.message || 'Upload failed' },
      500
    )
  }
})
