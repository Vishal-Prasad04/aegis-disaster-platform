import { useState, useCallback } from 'react'
import { validateForm } from '../utils/validators'

export function useForm(initialValues, rules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  const handleChange = useCallback((field) => (eventOrValue) => {
    const value = eventOrValue?.target
      ? eventOrValue.target.type === 'checkbox'
        ? eventOrValue.target.checked
        : eventOrValue.target.value
      : eventOrValue
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }, [])

  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const validate = useCallback(() => {
    const nextErrors = validateForm(values, rules)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [values, rules])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { values, errors, handleChange, setFieldValue, validate, reset, setValues }
}
