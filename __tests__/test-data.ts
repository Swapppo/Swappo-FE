/**
 * Test User Data
 * Sample data for testing the authentication flow
 */

export const TEST_USERS = {
  // Valid test user for registration
  newUser: {
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'SecurePass123!',
    full_name: 'John Doe',
  },

  // Another test user
  anotherUser: {
    email: 'jane.smith@example.com',
    username: 'janesmith',
    password: 'MyPassword456!',
    full_name: 'Jane Smith',
  },

  // Test user with minimal info (no full_name)
  minimalUser: {
    email: 'test@test.com',
    username: 'testuser',
    password: 'Test1234',
  },
};

// Login credentials for testing (after registration)
export const TEST_CREDENTIALS = {
  user1: {
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
  },
  user2: {
    email: 'jane.smith@example.com',
    password: 'MyPassword456!',
  },
};

// Invalid test cases for testing validation
export const INVALID_TEST_CASES = {
  // Email validation
  invalidEmail: {
    email: 'not-an-email',
    username: 'validuser',
    password: 'ValidPass123!',
  },

  // Username too short
  shortUsername: {
    email: 'test@example.com',
    username: 'ab', // Less than 3 characters
    password: 'ValidPass123!',
  },

  // Password too short
  shortPassword: {
    email: 'test@example.com',
    username: 'validuser',
    password: '1234567', // Less than 8 characters
  },

  // Empty fields
  emptyFields: {
    email: '',
    username: '',
    password: '',
  },
};

/**
 * Password Requirements:
 * - Minimum 8 characters
 * - Should include uppercase, lowercase, numbers, and special characters for best security
 * 
 * Username Requirements:
 * - Minimum 3 characters
 * - Maximum 50 characters
 * 
 * Email Requirements:
 * - Valid email format (contains @ and domain)
 */
