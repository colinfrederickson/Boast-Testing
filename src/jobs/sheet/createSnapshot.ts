import { FlatfileListener } from '@flatfile/listener'
import api from '@flatfile/api'

// Separate function to handle the snapshot creation
async function createSnapshot(sheetId, label = '') {
  return await api.snapshots.createSnapshot({ sheetId, label })
}

export default function (listener: FlatfileListener) {
  listener.filter({ job: 'sheet:createSnapshot' }, (configure) => {
    configure.on('job:ready', async (event) => {
      const { jobId, sheetId } = event.context

      // Input Validation
      if (typeof sheetId !== 'string' || sheetId.trim() === '') {
        console.error('Invalid sheetId provided')
        await api.jobs.fail(jobId, {
          info: 'Invalid sheetId provided for snapshot creation.',
        })
        return // Exit the function if sheetId is not valid
      }

      if (typeof jobId !== 'string' || jobId.trim() === '') {
        console.error('Invalid jobId provided')
        return // Exit the function early if jobId is not valid
      }

      try {
        await api.jobs.ack(jobId, {
          info: 'Preparing to Create Snapshot...',
          progress: 10,
        })

        console.log(`Creating snapshot for sheetId: ${sheetId}`)

        // Retrieve the label from the input form
        const job = await api.jobs.get(jobId)
        console.log('Job:', job)
        const label = job.data.input.snapshotLabel
        console.log('Snapshot Label:', label)

        // Call the createSnapshot function with the user-provided label
        const response = await createSnapshot(sheetId, label)

        if (response && response.data && response.data.id) {
          console.log(`Snapshot created successfully: ${response.data.id}`)

          await api.jobs.complete(jobId, {
            info: 'Snapshot created successfully.',
            outcome: {
              acknowledge: true,
              message: `Snapshot of sheet ${sheetId} created successfully with label ${label}.`,
            },
          })
        } else {
          throw new Error('Snapshot creation failed')
        }
      } catch (error) {
        // More detailed error handling
        if (error.response) {
          // API-specific errors
          console.error(
            `API Error: ${error.response.status} - ${JSON.stringify(
              error.response.data
            )}`
          )
        } else if (error.request) {
          // Errors related to the request made but no response received
          console.error(`Request Error: ${error.request}`)
        } else {
          // General errors
          console.error(`Error: ${error.message}`)
        }

        await api.jobs.fail(jobId, {
          info: 'Error occurred during the snapshot creation.',
        })
      }
    })
  })
}
