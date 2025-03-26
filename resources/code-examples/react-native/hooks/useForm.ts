import { useState, useCallback, useMemo } from 'react';

/**
 * Form field configuration
 */
interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
  validator?: (value: T) => string | undefined;
}

/**
 * Form state containing fields
 */
type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

/**
 * Form values extracted from form state
 */
type FormValues<T extends Record<string, any>> = {
  [K in keyof T]: T[K];
};

/**
 * Form errors extracted from form state
 */
type FormErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
};

/**
 * Custom hook for form state management
 * 
 * @param initialValues Initial values for the form
 * @param validators Optional validators for form fields
 * @returns Form state and helper functions
 * 
 * @example
 * ```tsx
 * const { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid } = useForm({
 *   email: '',
 *   password: '',
 * }, {
 *   email: (value) => (!value ? 'Email is required' : !isValidEmail(value) ? 'Invalid email format' : undefined),
 *   password: (value) => (!value ? 'Password is required' : value.length < 6 ? 'Password too short' : undefined),
 * });
 * ```
 */
function useForm<T extends Record<string, any>>(
  initialValues: T,
  validators?: Partial<Record<keyof T, (value: any) => string | undefined>>,
  requiredFields?: Array<keyof T>
) {
  // Create initial form state
  const createInitialState = (): FormState<T> => {
    const state: Partial<FormState<T>> = {};
    
    for (const key in initialValues) {
      if (Object.prototype.hasOwnProperty.call(initialValues, key)) {
        state[key] = {
          value: initialValues[key],
          touched: false,
          required: requiredFields?.includes(key) ?? false,
          validator: validators?.[key],
        };
      }
    }
    
    return state as FormState<T>;
  };
  
  // State for form fields
  const [formState, setFormState] = useState<FormState<T>>(createInitialState());
  
  // Extract values from form state
  const values = useMemo(() => {
    const result: Partial<FormValues<T>> = {};
    
    for (const key in formState) {
      if (Object.prototype.hasOwnProperty.call(formState, key)) {
        result[key] = formState[key].value;
      }
    }
    
    return result as FormValues<T>;
  }, [formState]);
  
  // Extract errors from form state
  const errors = useMemo(() => {
    const result: Partial<FormErrors<T>> = {};
    
    for (const key in formState) {
      if (Object.prototype.hasOwnProperty.call(formState, key) && formState[key].error) {
        result[key] = formState[key].error;
      }
    }
    
    return result as FormErrors<T>;
  }, [formState]);
  
  // Extract touched state from form state
  const touched = useMemo(() => {
    const result: Partial<Record<keyof T, boolean>> = {};
    
    for (const key in formState) {
      if (Object.prototype.hasOwnProperty.call(formState, key)) {
        result[key] = formState[key].touched;
      }
    }
    
    return result as Record<keyof T, boolean>;
  }, [formState]);
  
  // Validate a single field
  const validateField = useCallback((name: keyof T, value: any): string | undefined => {
    const field = formState[name];
    
    // Required field validation
    if (field.required && (value === '' || value === null || value === undefined)) {
      return `${String(name)} is required`;
    }
    
    // Custom validator
    if (field.validator) {
      return field.validator(value);
    }
    
    return undefined;
  }, [formState]);
  
  // Handle field change
  const handleChange = useCallback((name: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: validateField(name, value),
      },
    }));
  }, [validateField]);
  
  // Handle field blur
  const handleBlur = useCallback((name: keyof T) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validateField(name, prev[name].value),
      },
    }));
  }, [validateField]);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormState(createInitialState());
  }, []);
  
  // Validate all fields
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newState = { ...formState };
    
    for (const key in formState) {
      if (Object.prototype.hasOwnProperty.call(formState, key)) {
        const error = validateField(key, formState[key].value);
        newState[key] = {
          ...newState[key],
          error,
          touched: true,
        };
        
        if (error) {
          isValid = false;
        }
      }
    }
    
    setFormState(newState);
    return isValid;
  }, [formState, validateField]);
  
  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (values: FormValues<T>) => void) => {
    return (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      
      const isValid = validateForm();
      
      if (isValid) {
        onSubmit(values);
      }
    };
  }, [validateForm, values]);
  
  // Check if form is valid
  const isValid = useMemo(() => {
    for (const key in formState) {
      if (Object.prototype.hasOwnProperty.call(formState, key)) {
        if (formState[key].error) {
          return false;
        }
        
        if (formState[key].required && 
            (formState[key].value === '' || 
             formState[key].value === null || 
             formState[key].value === undefined)) {
          return false;
        }
      }
    }
    
    return true;
  }, [formState]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm,
    isValid,
  };
}

export default useForm;
