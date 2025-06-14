
import 'vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { AxeMatchers } from 'jest-axe';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<string, T>, AxeMatchers {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<string, any>, AxeMatchers {}
}
