import { FlatfileListener } from '@flatfile/listener'
import { xlsxExtractorPlugin } from '@flatfile/plugin-xlsx-extractor'
import { configureSpace } from './jobs/space/configure'
import { validateRecords } from './jobs/sheet/validateRecords'
import mergeSelectedRecords from './jobs/sheet/mergeSelectedRecords'

/**
 * This default export is used by Flatfile to register event handlers for any
 * event that occurs within the Flatfile Platform.
 *
 * @param listener
 */
export default function (listener: FlatfileListener) {
  listener.use(configureSpace)
  listener.use(validateRecords)
  listener.use(mergeSelectedRecords)
  listener.use(xlsxExtractorPlugin({ rawNumbers: true }))
}
