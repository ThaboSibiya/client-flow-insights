
import '@testing-library/jest-dom';

// Simple global test setup without complex mocks
global.console = {
  ...console,
  // Suppress console errors in tests unless needed
  error: jest.fn(),
};

// Mock window.confirm for delete confirmations
global.confirm = jest.fn(() => true);
