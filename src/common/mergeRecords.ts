import api, { Flatfile } from '@flatfile/api'

export class MergeRecords {
  /**
   * The identifier of the sheet being processed.
   */
  private readonly sheetId: string

  /**
   * The merged record which is a result of merging all records.
   */
  private mergedRecord: Flatfile.RecordWithLinks | null = null

  /**
   * An array to store the IDs of records that are merged and need to be deleted.
   */
  private recordIdsToDelete: string[] = []

  /**
   * @param sheetId - The identifier of the sheet being processed.
   */
  constructor(sheetId: string) {
    this.sheetId = sheetId
  }

  /**
   * The main function to merge all records.
   */
  public async mergeAllRecords() {
    console.log('Starting to merge all records.')
    const allRecords = await this.getAllRecords()
    console.log(`Fetched ${allRecords.length} records.`)
    this.processAndMergeRecords(allRecords)
    await this.deleteMergedRecords()
    await this.updateMergedRecord()
  }

  /**
   * A method to fetch all records, handling pagination as necessary.
   */
  private async getAllRecords() {
    const recordsResponse = await api.records.get(this.sheetId, {
      includeCounts: true,
    })
    const total = recordsResponse?.data?.counts?.total || 0
    const pages = Math.ceil(total / 1000)
    const additionalPages: Flatfile.RecordWithLinks[] = []

    for (let i = 2; i <= pages; i++) {
      const moreRecords = await api.records.get(this.sheetId, {
        includeCounts: true,
        pageNumber: i,
      })
      if (moreRecords.data?.records)
        additionalPages.push(...moreRecords.data.records)
    }

    return recordsResponse?.data?.records
      ? recordsResponse.data.records.concat(additionalPages)
      : additionalPages
  }

  /**
   * Process each record and merge all records.
   * @param allRecords - All records from the sheet.
   */
  private processAndMergeRecords(allRecords: Flatfile.RecordWithLinks[]) {
    for (const record of allRecords) {
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
   * Merge old and new record values.
   * @param oldValues - The original record values.
   * @param newValues - The new record values.
   */
  private mergeValues(oldValues, newValues) {
    return Object.entries(newValues).reduce(
      (merged, [key, val]) => {
        const newValue =
          (val as { value: string | null }).value === ''
            ? null
            : (val as { value: string | null }).value
        if (newValue != null) merged[key] = val as { value: string | null }
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
      await api.records.update(this.sheetId, [
        {
          id: this.mergedRecord.id,
          values: this.mergedRecord.values,
        },
      ])
    }
  }
}
