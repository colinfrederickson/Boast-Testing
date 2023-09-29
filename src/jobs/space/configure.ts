import { FlatfileListener } from '@flatfile/listener'
import { employeeSheetMini } from '../../blueprints'
import { simpleSpaceSetup } from '../../plugins/simple.space.setup'

/**
 * Configures a Flatfile space with an employee registry
 * workbook, sheets and actions.
 *
 * @param listener The FlatfileListener instance
 *
 * @returns void
 */
export function configureSpace(listener: FlatfileListener) {
  listener.use(
    simpleSpaceSetup({
      workbook: {
        name: 'Manual File Format Workbook',
        sheets: [employeeSheetMini],
        actions: [
          {
            operation: 'submitData',
            mode: 'foreground',
            label: 'Submit Data',
            description:
              'Action that submits data to the backend for processing.',
            primary: true,
          },
        ],
      },
    })
  )
}
