/**
 * Validation utilities for the AssetFlow application.
 * These helpers analyze inputs and return error messages or null if valid.
 */

/**
 * Validates if a field is empty
 * @param {string} value 
 * @param {string} fieldName 
 * @returns {string|null}
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || !value.trim()) {
    return `${fieldName} cannot be empty.`;
  }
  return null;
};

/**
 * Validates if an email is formatted correctly
 * @param {string} email 
 * @returns {string|null}
 */
export const validateEmail = (email) => {
  const emptyCheck = validateRequired(email, 'Email address');
  if (emptyCheck) return emptyCheck;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

/**
 * Validates if a password meets complexity rules (minimum length)
 * @param {string} password 
 * @param {number} minLength 
 * @returns {string|null}
 */
export const validatePassword = (password, minLength = 8) => {
  const emptyCheck = validateRequired(password, 'Password');
  if (emptyCheck) return emptyCheck;

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  return null;
};

/**
 * Validates if confirm password matches password
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {string|null}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  const emptyCheck = validateRequired(confirmPassword, 'Confirm password');
  if (emptyCheck) return emptyCheck;

  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
};
