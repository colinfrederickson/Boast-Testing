import * as validations from './validations'

function validateRecord(record, fields) {
  fields.forEach((field) => {
    const fieldValue = record.get(field.key)
    console.log(`Processing field: ${field.key}, value: ${fieldValue}`)

    const errorCheckResult = validations.checkForError(fieldValue)
    if (errorCheckResult.error) {
      console.log(
        `Error check message for ${field.key}: ${errorCheckResult.error}`
      )
      record.addError(field.key, errorCheckResult.error)
    }

    const fieldTypeToValidationMap = {
      boolean: validations.checkBoolean,
      date: validations.checkDateFormat,
      number: validations.isNumeric,
    }

    const validationFunc = fieldTypeToValidationMap[field.type]
    if (validationFunc) {
      if (field.type === 'boolean') {
        console.log(`Validating boolean for ${field.key}`)
      }
      const validationResult = validationFunc(fieldValue, record, field.key)
      if (validationResult.error) {
        console.log(
          `Validation error for ${field.key}: ${validationResult.error}`
        )
        record.addError(field.key, validationResult.error)
      } else if (validationResult.info) {
        console.log(
          `Validation info for ${field.key}: ${validationResult.info}`
        )
        record.addInfo(field.key, validationResult.info)
      }
    }

    // New region-specific validation
    if (field.key === 'region') {
      const countryValue = record.get('country') // Assuming 'country' is the key for the country field

      const validationResult = validations.isValidRegionForCountry(
        fieldValue,
        countryValue
      )

      if (validationResult.error) {
        console.log(
          `Validation error for ${field.key}: ${validationResult.error}`
        )
        record.addError(field.key, validationResult.error)
      } else if (validationResult.info) {
        console.log(
          `Validation info for ${field.key}: ${validationResult.info}`
        )
        record.addInfo(field.key, validationResult.info)
      }
    }
  })
}

export { validateRecord }
