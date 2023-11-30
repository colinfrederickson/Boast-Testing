import { Flatfile } from '@flatfile/api'
import { countries } from '../../data/countries'
import { regions } from '../../data/regions'

// Define the fields separately
const employeeFields = [
  {
    key: 'id',
    label: 'Worker ID',
    type: 'string',
    description: "This is the worker's identification number.",
    constraints: [
      {
        type: 'required',
      },
      {
        type: 'unique',
      },
    ],
  },
  {
    key: 'country',
    label: 'Country',
    type: 'enum',
    description: 'Select the country from the dropdown menu.',
    config: {
      options: countries.map((country) => ({
        value: country.value,
        label: country.label,
      })),
    },
  },

  {
    key: 'region',
    label: 'State / Province',
    type: 'enum',
    description: 'Choose a State / Province from the dropdown menu.',
    config: {
      options: regions.map((region) => ({
        value: region.value,
        label: region.label,
      })),
    },
  },

  {
    key: 'full',
    label: 'Worker Full Name',
    type: 'string',
    description:
      'This field should auto populate as First Name, Middle Name, and Last Name are entered into those columns.',
  },
  {
    key: 'first',
    label: 'First Name',
    type: 'string',
    description: "Provide the worker's legal first name.",
    constraints: [{ type: 'required' }],
  },
  {
    key: 'middle',
    label: 'Middle Name',
    type: 'string',
    description:
      "Please provide the worker's middle name. This is an optional field.",
  },
  {
    key: 'last',
    label: 'Last Name',
    type: 'string',
    description: "Provide the worker's legal last name.",
    constraints: [{ type: 'required' }],
  },
  {
    key: 'type',
    label: 'Worker Type',
    type: 'enum',
    description:
      'Choose a value from the dropdown menu. Select "Employee" if the worker is paid by your company. Select "Contingent Worker" if the worker is a contracted worker that is not paid by your company.',
    config: {
      options: [
        { value: 'EE', label: 'Employee' },
        { value: 'CW', label: 'Contingent Worker' },
      ],
    },
    constraints: [{ type: 'required' }],
  },
  {
    key: 'email',
    label: 'Email (Work)',
    type: 'string',
    description:
      "Please populate this column with each worker's work email address. Make sure to enter the entire email in a standard email format. (ex. joe.brown@company.com).",
    constraints: [
      {
        type: 'required',
      },
      {
        type: 'unique',
      },
    ],
  },
  {
    key: 'date',
    label: 'Last Visit Date',
    type: 'date',
    description: 'Provide the worker"s latest date of hire.',
  },
  {
    key: 'title',
    label: 'Job Title',
    type: 'string',
    description: 'Provide the job title of the employee',
  },
  {
    key: 'company',
    label: 'Company Name',
    type: 'string',
    description: 'Choose a Company from the dropdown menu.',
    constraints: [{ type: 'required' }],
  },
  {
    key: 'location',
    label: 'Location',
    type: 'string',
    description:
      'Choose a Location from the dropdown menu. The menu consists of Locations you entered into the tenant during an earlier journey.',
  },
]

const inputFormFields = employeeFields.map((field) => ({
  key: field.key,
  label: `Enter ${field.label}`,
  type: 'string',
  description: field.description ? String(field.description) : '', // Ensure it's a string
}))

export const employeeSheetMini: Flatfile.SheetConfig = {
  name: 'Employees',
  slug: 'employees',
  fields: employeeFields as any,
  actions: [
    {
      operation: 'mergeSelectedRecords',
      tooltip:
        'Merge multiple selected records into a single record. The process prioritizes newer, non-empty values and combines them into a primary record. The original merged records are then deleted, leaving only the combined record.',
      requireSelection: true,
      mode: 'foreground',
      label: 'Merge Selected Records',
      description: 'This will merge selected records together.',
      primary: true,
      confirm: true,
      inputForm: {
        type: 'simple',
        fields: inputFormFields,
      },
    },
    {
      operation: 'createSnapshot',
      tooltip: 'Create a snapshot of the current data.',
      mode: 'foreground',
      label: 'Create Snapshot',
      description:
        'This will create a snapshot of the current data for comparison.',
      primary: true,
      confirm: true,
      inputForm: {
        type: 'simple', // Assuming a simple form type
        fields: [
          {
            key: 'snapshotLabel',
            label: 'Snapshot Label',
            type: 'string',
            description: 'Enter a label for the snapshot',
          },
        ],
      },
    },
  ],
}
