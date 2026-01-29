import { Hono } from 'hono'
import { downloadRoute } from './routes/downloadFile.js'
import { uploadRoute } from './routes/uploadFile.js'
import { processBatchRoute } from './routes/processBatch.js'
import { bulkValidate } from './routes/bulkValidate.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/downloadFile', downloadRoute)
app.route('/bun/importDoc/upload', uploadRoute)
app.route('/bun/importDoc/process', processBatchRoute)
app.route('/bulkValidate',bulkValidate)

Bun.serve({
  port: 3000,
  fetch: app.fetch,
})
export default app
