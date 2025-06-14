
import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<string, T> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<string, any> {
    toHaveNoViolations(): any;
  }
}

// Extend global expect
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends TestingLibraryMatchers<string, T> {
      toHaveNoViolations(): T;
    }
  }
}
