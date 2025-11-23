import { useState, useCallback } from "react";

/**
 * Custom hook for handling form state and validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} validationRules - Function that returns validation errors
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  // Validate form
  const validate = useCallback(() => {
    if (validationRules) {
      const newErrors = validationRules(values);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  }, [values, validationRules]);

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        // Handle submission errors
        if (error.fieldErrors) {
          setErrors(error.fieldErrors);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set specific errors
  const setFieldErrors = useCallback((fieldErrors) => {
    setErrors(fieldErrors);
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    validate,
    reset,
    setFieldErrors,
    setIsSubmitting,
  };
};

export default useForm;
