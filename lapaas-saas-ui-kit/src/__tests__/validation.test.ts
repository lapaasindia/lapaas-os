import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  validateLoginForm,
  validateRegisterForm,
} from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    it('should return error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('should return error for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      expect(validatePassword('TestPass123!')).toBeNull();
    });

    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('should return error for short password', () => {
      expect(validatePassword('Test1!')).toBe('Password must be at least 8 characters');
    });

    it('should return error for password without uppercase', () => {
      expect(validatePassword('testpass123!')).toBe('Password must contain an uppercase letter');
    });

    it('should return error for password without number', () => {
      expect(validatePassword('TestPass!')).toBe('Password must contain a number');
    });

    it('should return error for password without special character', () => {
      expect(validatePassword('TestPass123')).toBe('Password must contain a special character (!@#$%^&*)');
    });
  });

  describe('validateName', () => {
    it('should return null for valid name', () => {
      expect(validateName('John', 'First name')).toBeNull();
    });

    it('should return error for empty name', () => {
      expect(validateName('', 'First name')).toBe('First name is required');
    });

    it('should return error for short name', () => {
      expect(validateName('J', 'First name')).toBe('First name must be at least 2 characters');
    });

    it('should return error for long name', () => {
      expect(validateName('a'.repeat(51), 'First name')).toBe('First name must be less than 50 characters');
    });
  });

  describe('validateConfirmPassword', () => {
    it('should return null for matching passwords', () => {
      expect(validateConfirmPassword('TestPass123!', 'TestPass123!')).toBeNull();
    });

    it('should return error for empty confirm password', () => {
      expect(validateConfirmPassword('TestPass123!', '')).toBe('Please confirm your password');
    });

    it('should return error for non-matching passwords', () => {
      expect(validateConfirmPassword('TestPass123!', 'DifferentPass123!')).toBe('Passwords do not match');
    });
  });

  describe('validateLoginForm', () => {
    it('should return valid result for correct form', () => {
      const result = validateLoginForm('test@example.com', 'TestPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid form', () => {
      const result = validateLoginForm('invalid', 'short');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateRegisterForm', () => {
    it('should return valid result for correct form', () => {
      const result = validateRegisterForm(
        'John',
        'Doe',
        'test@example.com',
        'TestPass123!',
        'TestPass123!'
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid form', () => {
      const result = validateRegisterForm('', '', 'invalid', 'short', 'mismatch');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return error for non-matching passwords', () => {
      const result = validateRegisterForm(
        'John',
        'Doe',
        'test@example.com',
        'TestPass123!',
        'DifferentPass123!'
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'confirmPassword')).toBe(true);
    });
  });
});
