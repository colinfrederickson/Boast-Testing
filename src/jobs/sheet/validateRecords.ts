import { FlatfileListener } from "@flatfile/listener";
import api from "@flatfile/api";
import { RecordHook } from "@flatfile/plugin-record-hook";
import { validateRecord } from "../../../validationsDictionary/recordValidators";

export function validateRecords(listener: FlatfileListener) {
  listener.on("commit:created", async (event) => {
    try {
      console.log("commit:created event triggered");

      // Retrieve the sheetId and workbookId from the event context
      const sheetId = event.context.sheetId;
      const spaceId = event.context.spaceId;
      const workbookId = event.context.workbookId; // Assuming the workbookId is available in the event context

      console.log(`Retrieved sheetId from event: ${sheetId}`);

      // Fetch the workbook from the API
      const workbook = await api.workbooks.get(workbookId);
      if (
        !workbook ||
        workbook.data.name.startsWith("[file]") ||
        workbook.data.labels.includes("file")
      ) {
        console.log("Skipping RecordHooks for file-based workbooks.");
        return;
      }

      // Fetch the sheet from the API
      const sheet = await api.sheets.get(sheetId);
      if (!sheet) {
        console.log(`Failed to fetch sheet with id: ${sheetId}`);
        return;
      }
      console.log(`Sheet with id: ${sheetId} fetched successfully.`);

      // Get the fields from the sheet response
      const fields = await sheet.data.config?.fields;
      if (!fields) {
        console.log("No fields were fetched.");
        return;
      }
      console.log(`Successfully fetched ${fields.length} fields.`);

      // Call the RecordHook function with event and a handler
      await RecordHook(event, async (record, event) => {
        console.log("Inside RecordHook's handler function");
        try {
          await validateRecord(record, fields);
        } catch (error) {
          console.error("Error in validateRecord:", error);
        }
        console.log("Exiting RecordHook's handler function");
        return record;
      });
      console.log("Finished calling RecordHook");
    } catch (error) {
      console.error("Error in commit:created event handler:", error);
    }
  });
}
