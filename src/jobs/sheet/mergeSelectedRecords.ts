import { FlatfileListener } from '@flatfile/listener'
import api from '@flatfile/api'
import { MergeRecords } from '../../common/mergeRecords'

export default function (listener: FlatfileListener) {
  listener.filter({ job: 'sheet:mergeSelectedRecords' }, (configure) => {
    configure.on('job:ready', async (event) => {
      const { jobId, sheetId } = event.context
      const { records } = await event.data // Extract selected records from the event

      // Log the count of the obtained records
      console.log('Count of Obtained Records:', records.length)

      try {
        await api.jobs.ack(jobId, {
          info: 'Validating Selected Records...',
          progress: 10, //optional
        })

        // If validations are successful, acknowledge and move to the next step
        await api.jobs.ack(jobId, {
          info: 'Records Validated Successfully. Merging Selected Records...',
          progress: 20, //optional
        })

        // Create an instance of MergeRecords class
        const mergeRecordsInstance = new MergeRecords(sheetId)

        // Call the mergeSelectedRecords method with the validated records
        await mergeRecordsInstance.mergeSelectedRecords(records)

        await api.jobs.complete(jobId, {
          info: 'Selected records merged successfully.',
          outcome: {
            acknowledge: true,
            message: `Selected records merged successfully.`,
          },
        })
      } catch (error) {
        console.log(`Error: ${JSON.stringify(error, null, 2)}`)

        await api.jobs.fail(jobId, {
          info: 'Error occurred during the merging of records.',
        })
      }
    })
  })
}
