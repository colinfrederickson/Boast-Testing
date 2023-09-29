import { FlatfileListener } from '@flatfile/listener'
import api from '@flatfile/api'
import { MergeRecords } from '../../common/mergeRecords'

export default function (listener: FlatfileListener) {
  listener.filter({ job: 'sheet:mergeSelectedRecords' }, (configure) => {
    configure.on('job:ready', async (event) => {
      const { jobId, sheetId } = event.context

      try {
        await api.jobs.ack(jobId, {
          info: 'Merging Selected Records...',
          progress: 10, //optional
        })

        // Call the MergeRecords function with the records
        await new MergeRecords(sheetId).mergeAllRecords()

        await api.jobs.complete(jobId, {
          info: 'This job is now complete.',
        })
      } catch (error) {
        console.log(`Error: ${JSON.stringify(error, null, 2)}`)

        await api.jobs.fail(jobId, {
          info: 'This job did not work.',
        })
      }
    })
  })
}
