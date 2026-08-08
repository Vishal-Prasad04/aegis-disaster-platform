export const required = (value) =>
  value === undefined || value === null || String(value).trim() === '' ? 'This field is required' : ''

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '') ? '' : 'Enter a valid email address'

export const minLength = (len) => (value) =>
  (value || '').length >= len ? '' : `Must be at least ${len} characters`

export const isPositiveNumber = (value) =>
  !isNaN(value) && Number(value) > 0 ? '' : 'Must be a positive number'

export const isNonNegativeNumber = (value) =>
  !isNaN(value) && Number(value) >= 0 ? '' : 'Must be zero or greater'

/**
 * Runs a set of {field: [validatorFns]} rules against a values object.
 * Returns an {field: errorMessage} map containing only failing fields.
 */
export function validateForm(values, rules) {
  const errors = {}
  Object.entries(rules).forEach(([field, validators]) => {
    for (const validator of validators) {
      const message = validator(values[field])
      if (message) {
        errors[field] = message
        break
      }
    }
  })
  return errors
}
