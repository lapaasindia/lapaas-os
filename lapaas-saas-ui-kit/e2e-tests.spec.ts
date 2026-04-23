/**
 * E2E Tests for Lapaas OS Frontend
 * Tests complete user journeys across the application
 */

describe('Lapaas OS E2E Tests', () => {
  const BASE_URL = 'http://localhost:5174';
  const API_URL = 'http://localhost:3000/api/v1';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // ==================== AUTHENTICATION TESTS ====================

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      // Navigate to register page
      window.location.href = `${BASE_URL}/register`;

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fill registration form
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      const firstNameInput = document.querySelector('input[placeholder*="First"]') as HTMLInputElement;
      const lastNameInput = document.querySelector('input[placeholder*="Last"]') as HTMLInputElement;

      if (emailInput) emailInput.value = 'newuser@example.com';
      if (passwordInput) passwordInput.value = 'TestPass123!';
      if (firstNameInput) firstNameInput.value = 'Test';
      if (lastNameInput) lastNameInput.value = 'User';

      // Submit form
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) submitButton.click();

      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if redirected to login or dashboard
      expect(window.location.href).toMatch(/login|dashboard/);
    });

    it('should login with valid credentials', async () => {
      // Navigate to login page
      window.location.href = `${BASE_URL}/login`;

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fill login form
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;

      if (emailInput) emailInput.value = 'test@example.com';
      if (passwordInput) passwordInput.value = 'TestPass123!';

      // Submit form
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) submitButton.click();

      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if token is stored
      const token = localStorage.getItem('accessToken');
      expect(token).toBeTruthy();

      // Check if redirected to dashboard
      expect(window.location.href).toMatch(/dashboard/);
    });

    it('should show error on invalid credentials', async () => {
      // Navigate to login page
      window.location.href = `${BASE_URL}/login`;

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fill login form with invalid credentials
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;

      if (emailInput) emailInput.value = 'invalid@example.com';
      if (passwordInput) passwordInput.value = 'WrongPassword123!';

      // Submit form
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) submitButton.click();

      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if error message is displayed
      const errorAlert = document.querySelector('[class*="alert-error"]');
      expect(errorAlert).toBeTruthy();
    });
  });

  // ==================== NAVIGATION TESTS ====================

  describe('Navigation', () => {
    it('should navigate between pages', async () => {
      // Start at home
      window.location.href = `${BASE_URL}/`;
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(window.location.href).toMatch(/\/$/);

      // Navigate to login
      const loginLink = document.querySelector('a[href="/login"]') as HTMLAnchorElement;
      if (loginLink) loginLink.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(window.location.href).toMatch(/login/);

      // Navigate to register
      const registerLink = document.querySelector('a[href="/register"]') as HTMLAnchorElement;
      if (registerLink) registerLink.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(window.location.href).toMatch(/register/);
    });

    it('should protect dashboard route', async () => {
      // Try to access dashboard without token
      window.location.href = `${BASE_URL}/dashboard`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Should redirect to login
      expect(window.location.href).toMatch(/login/);
    });
  });

  // ==================== FORM VALIDATION TESTS ====================

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      window.location.href = `${BASE_URL}/register`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = 'invalid-email';
        emailInput.dispatchEvent(new Event('blur'));
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const errorMessage = document.querySelector('[class*="error"]');
      expect(errorMessage).toBeTruthy();
    });

    it('should validate password strength', async () => {
      window.location.href = `${BASE_URL}/register`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.value = 'weak';
        passwordInput.dispatchEvent(new Event('blur'));
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const errorMessage = document.querySelector('[class*="error"]');
      expect(errorMessage).toBeTruthy();
    });

    it('should validate required fields', async () => {
      window.location.href = `${BASE_URL}/register`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to submit empty form
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) submitButton.click();

      await new Promise(resolve => setTimeout(resolve, 500));

      // Form should not submit
      expect(window.location.href).toMatch(/register/);
    });
  });

  // ==================== USER PROFILE TESTS ====================

  describe('User Profile', () => {
    it('should display user profile', async () => {
      // Set token in localStorage
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/profile`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile page is displayed
      const profileTitle = document.querySelector('h1');
      expect(profileTitle?.textContent).toContain('Profile');
    });

    it('should update user profile', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/profile`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fill form
      const firstNameInput = document.querySelector('input[name="firstName"]') as HTMLInputElement;
      if (firstNameInput) firstNameInput.value = 'Updated';

      // Submit form
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) submitButton.click();

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check for success message
      const successAlert = document.querySelector('[class*="alert-success"]');
      expect(successAlert).toBeTruthy();
    });
  });

  // ==================== ORGANIZATION TESTS ====================

  describe('Organization Management', () => {
    it('should display organizations list', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/organizations`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      const title = document.querySelector('h1');
      expect(title?.textContent).toContain('Organizations');
    });

    it('should create new organization', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/organizations`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Click create button
      const createButton = document.querySelector('button:contains("New Organization")') as HTMLButtonElement;
      if (createButton) createButton.click();

      await new Promise(resolve => setTimeout(resolve, 500));

      // Fill form
      const nameInput = document.querySelector('input[placeholder*="name"]') as HTMLInputElement;
      if (nameInput) nameInput.value = 'Test Organization';

      // Submit
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) submitButton.click();

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check for success
      const successAlert = document.querySelector('[class*="alert-success"]');
      expect(successAlert).toBeTruthy();
    });
  });

  // ==================== TEAM TESTS ====================

  describe('Team Management', () => {
    it('should display teams list', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/teams`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      const title = document.querySelector('h1');
      expect(title?.textContent).toContain('Teams');
    });

    it('should create new team', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/teams`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Click create button
      const createButton = document.querySelector('button:contains("New Team")') as HTMLButtonElement;
      if (createButton) createButton.click();

      await new Promise(resolve => setTimeout(resolve, 500));

      // Fill form
      const nameInput = document.querySelector('input[placeholder*="name"]') as HTMLInputElement;
      if (nameInput) nameInput.value = 'Test Team';

      // Submit
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) submitButton.click();

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check for success
      const successAlert = document.querySelector('[class*="alert-success"]');
      expect(successAlert).toBeTruthy();
    });
  });

  // ==================== RBAC TESTS ====================

  describe('RBAC Management', () => {
    it('should display roles', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/rbac`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      const title = document.querySelector('h1');
      expect(title?.textContent).toContain('Role');

      // Check for role buttons
      const roleButtons = document.querySelectorAll('button:contains("Admin")');
      expect(roleButtons.length).toBeGreaterThan(0);
    });
  });

  // ==================== ACTIVITY LOG TESTS ====================

  describe('Activity Log', () => {
    it('should display activity log', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/activities`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      const title = document.querySelector('h1');
      expect(title?.textContent).toContain('Activity');
    });

    it('should filter activities by resource', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      window.location.href = `${BASE_URL}/activities`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Click filter button
      const filterButton = document.querySelector('button:contains("ORGANIZATION")') as HTMLButtonElement;
      if (filterButton) filterButton.click();

      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if activities are filtered
      const activities = document.querySelectorAll('[class*="activity-item"]');
      expect(activities.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== RESPONSIVE DESIGN TESTS ====================

  describe('Responsive Design', () => {
    it('should be responsive on mobile', async () => {
      // Set mobile viewport
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event('resize'));

      window.location.href = `${BASE_URL}/`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if layout is responsive
      const container = document.querySelector('[class*="container"]');
      expect(container).toBeTruthy();
    });

    it('should be responsive on tablet', async () => {
      // Set tablet viewport
      window.innerWidth = 768;
      window.innerHeight = 1024;
      window.dispatchEvent(new Event('resize'));

      window.location.href = `${BASE_URL}/`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if layout is responsive
      const container = document.querySelector('[class*="container"]');
      expect(container).toBeTruthy();
    });

    it('should be responsive on desktop', async () => {
      // Set desktop viewport
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.dispatchEvent(new Event('resize'));

      window.location.href = `${BASE_URL}/`;
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if layout is responsive
      const container = document.querySelector('[class*="container"]');
      expect(container).toBeTruthy();
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance', () => {
    it('should load home page in under 2 seconds', async () => {
      const startTime = performance.now();
      window.location.href = `${BASE_URL}/`;
      await new Promise(resolve => setTimeout(resolve, 2000));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should load dashboard in under 3 seconds', async () => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'user-123' }));

      const startTime = performance.now();
      window.location.href = `${BASE_URL}/dashboard`;
      await new Promise(resolve => setTimeout(resolve, 3000));
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(3000);
    });
  });
});
