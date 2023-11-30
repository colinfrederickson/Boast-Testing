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

      console.log(
        `Starting snapshot creation job: Job ID - ${jobId}, Sheet ID - ${sheetId}`
      )

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
        // Initial Acknowledgement
        await api.jobs.ack(jobId, {
          info: 'Initiating snapshot creation...',
          progress: 10,
        })

        // Fetching Sheet Details
        await api.jobs.ack(jobId, {
          info: 'Fetching sheet details...',
          progress: 30,
        })
        const sheet = await api.sheets.get(sheetId)
        const sheetName = sheet.data.name

        // Retrieving Job Details for Snapshot Label
        await api.jobs.ack(jobId, {
          info: 'Retrieving snapshot label...',
          progress: 50,
        })
        const job = await api.jobs.get(jobId)
        const label = job.data.input?.snapshotLabel || ''

        // Snapshot Creation
        await api.jobs.ack(jobId, {
          info: 'Creating snapshot...',
          progress: 70,
        })
        const response = await createSnapshot(sheetId, label)

        if (response && response.data && response.data.id) {
          // Snapshot Creation Complete
          await api.jobs.ack(jobId, {
            info: 'Snapshot created successfully.',
            progress: 100,
          })

          // Completion Message
          let successMessage = `Snapshot of sheet '${sheetName}' created successfully`
          if (label) {
            successMessage += ` with label '${label}'`
          }
          successMessage +=
            '. You can view this snapshot in the Version History panel.'

          await api.jobs.complete(jobId, {
            outcome: {
              acknowledge: true,
              message: successMessage,
            },
          })
          console.log(`Job ${jobId} completed successfully`)
        } else {
          throw new Error('Snapshot creation failed')
        }
      } catch (error) {
        // More detailed error handling
        if (error.response) {
          console.error(
            `API Error: ${error.response.status} - ${JSON.stringify(
              error.response.data
            )}`
          )
        } else if (error.request) {
          console.error(`Request Error: ${error.request}`)
        } else {
          console.error(`Error: ${error.message}`)
        }

        await api.jobs.fail(jobId, {
          info: 'Error occurred during the snapshot creation.',
        })
        console.log(`Job ${jobId} failed due to error`)
      }
    })
  })
}
