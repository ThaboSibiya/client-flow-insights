
import 'vitest';
import '@testing-library/jest-dom';
import { AxeMatchers } from 'jest-axe';

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T>, AxeMatchers {}
  interface AsymmetricMatchersContaining extends jest.Matchers<void, any>, AxeMatchers {}
}
