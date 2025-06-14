
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Simple global test setup without complex mocks
global.console = {
  ...console,
  // Suppress console errors in tests unless needed
  error: vi.fn(),
};

// Mock window.confirm for delete confirmations
global.confirm = vi.fn(() => true);
