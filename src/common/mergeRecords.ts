import api, { Flatfile } from '@flatfile/api'

export class MergeRecords {
  private readonly sheetId: string
  private mergedRecord: Flatfile.RecordWithLinks | null = null
  private recordIdsToDelete: string[] = []

  constructor(sheetId: string) {
    this.sheetId = sheetId
  }

  /**
   * The main function to merge selected records.
   * @param selectedRecords - The records selected by the user.
   */
  public async mergeSelectedRecords(
    selectedRecords: Flatfile.RecordWithLinks[]
  ) {
    console.log(
      'Incoming selected records:',
      JSON.stringify(selectedRecords, null, 2)
    )

    if (selectedRecords.length === 0) {
      console.log('No records were selected for merging.')
      return
    }

    this.processAndMergeRecords(selectedRecords)
    await this.deleteMergedRecords()
    await this.updateMergedRecord()
  }

  /**
   * Process each record and merge all records.
   * @param selectedRecords - Selected records from the sheet.
   */
  private processAndMergeRecords(selectedRecords: Flatfile.RecordWithLinks[]) {
    for (const record of selectedRecords) {
      if (!this.mergedRecord) {
        this.mergedRecord = record
        continue
      }
      this.recordIdsToDelete.push(record.id)
      this.mergedRecord.values = this.mergeValues(
        this.mergedRecord.values,
        record.values
      )
    }
  }
  /**
   * Merge old and new record values, handling 'updatedAt' as a string if it's not a Date object.
   * @param oldValues - The original record values.
   * @param newValues - The new record values.
   */
  private mergeValues(oldValues, newValues) {
    return Object.entries(newValues).reduce(
      (merged, [key, val]) => {
        if (key === 'updatedAt') {
          // Handle 'updatedAt' as a string if it's not a Date object
          merged[key] = typeof val === 'object' ? val : { value: val }
          return merged
        }

        const newValue =
          (val as { value: string | null }).value === ''
            ? null
            : (val as { value: string | null }).value

        // Only update the field if the new value is not null
        if (newValue !== null) {
          merged[key] = { value: newValue }
        }

        return merged
      },
      { ...oldValues }
    )
  }

  /**
   * Delete all records that were merged.
   */
  private async deleteMergedRecords() {
    if (this.recordIdsToDelete.length > 0) {
      await api.records.delete(this.sheetId, { ids: this.recordIdsToDelete })
    }
  }

  /**
   * Update the merged record with merged values.
   */
  private async updateMergedRecord() {
    if (this.mergedRecord) {
      // Remove "updatedAt" from all fields
      const updatedValues = { ...this.mergedRecord.values }
      Object.keys(updatedValues).forEach((key) => {
        delete updatedValues[key].updatedAt
      })

      // Log the mergedRecord before updating
      console.log(
        'Merged Record before updating:',
        JSON.stringify(this.mergedRecord, null, 2)
      )

      // Update the record with the modified values
      await api.records.update(this.sheetId, [
        {
          id: this.mergedRecord.id,
          values: updatedValues,
        },
      ])
    }
  }
}
