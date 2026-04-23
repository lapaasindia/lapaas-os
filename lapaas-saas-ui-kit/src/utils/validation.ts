export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain a special character (!@#$%^&*)';
  return null;
};

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.length > 50) return `${fieldName} must be less than 50 characters`;
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRegisterForm = (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  const firstNameError = validateName(firstName, 'First name');
  if (firstNameError) errors.push({ field: 'firstName', message: firstNameError });

  const lastNameError = validateName(lastName, 'Last name');
  if (lastNameError) errors.push({ field: 'lastName', message: lastNameError });

  const emailError = validateEmail(email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const passwordError = validatePassword(password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });

  const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
  if (confirmPasswordError) errors.push({ field: 'confirmPassword', message: confirmPasswordError });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
