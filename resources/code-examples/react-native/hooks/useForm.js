/**
 * useForm Hook
 * 
 * A custom hook for handling form state, validation, and submission.
 * Provides a simple and reusable way to manage forms in React Native.
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for form handling
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Function to call on successful form submission
 * @param {Function} validate - Validation function that returns errors object
 * @param {Object} options - Additional options for form behavior
 * @returns {Object} Form state and handlers
 */
const useForm = (initialValues = {}, onSubmit, validate, options = {}) => {
  // Default options
  const defaultOptions = {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
  };
  
  const formOptions = { ...defaultOptions, ...options };
  
  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);
  
  // Set multiple field values at once
  const setMultipleValues = useCallback((newValues) => {
    setValues((prevValues) => ({
      ...prevValues,
      ...newValues,
    }));
  }, []);
  
  // Handle field change
  const handleChange = useCallback((name) => (value) => {
    setFieldValue(name, value);
    
    if (formOptions.validateOnChange) {
      runValidations({ [name]: value });
    }
  }, [setFieldValue, formOptions.validateOnChange]);
  
  // Mark field as touched on blur
  const handleBlur = useCallback((name) => () => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
    
    if (formOptions.validateOnBlur) {
      runValidations();
    }
  }, [formOptions.validateOnBlur]);
  
  // Run validations
  const runValidations = useCallback((specificValues) => {
    if (typeof validate !== 'function') return {};
    
    const valuesToValidate = specificValues || values;
    const validationErrors = validate(valuesToValidate);
    
    if (specificValues) {
      // Only update errors for specific fields
      const fieldNames = Object.keys(specificValues);
      const filteredErrors = {};
      
      fieldNames.forEach((fieldName) => {
        if (validationErrors && validationErrors[fieldName]) {
          filteredErrors[fieldName] = validationErrors[fieldName];
        }
      });
      
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...filteredErrors,
      }));
    } else {
      // Update all errors
      setErrors(validationErrors || {});
    }
    
    return validationErrors || {};
  }, [values, validate]);
  
  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setSubmitCount((count) => count + 1);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Validate form if needed
    let formErrors = {};
    if (formOptions.validateOnSubmit && typeof validate === 'function') {
      formErrors = validate(values);
      setErrors(formErrors || {});
    }
    
    // Check if form is valid
    const hasErrors = formErrors && Object.keys(formErrors).length > 0;
    
    if (!hasErrors) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, onSubmit, validate, formOptions.validateOnSubmit]);
  
  // Check if form is valid whenever errors or values change
  useEffect(() => {
    const formHasErrors = Object.keys(errors).length > 0;
    setIsValid(!formHasErrors);
  }, [errors, values]);
  
  // Reset form when initialValues change (useful for edit forms)
  useEffect(() => {
    if (options.resetOnPropsChange) {
      resetForm();
    }
  }, [initialValues, options.resetOnPropsChange, resetForm]);
  
  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    submitCount,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setMultipleValues,
    setErrors,
    
    // Utilities
    resetForm,
    validateForm: runValidations,
  };
};

export default useForm;
