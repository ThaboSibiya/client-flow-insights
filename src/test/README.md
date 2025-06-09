
# Testing Strategy

This project implements a comprehensive testing strategy with the following components:

## Test Types

### Unit Tests
- **Location**: `src/test/utils/`, `src/test/hooks/`, `src/test/stores/`
- **Purpose**: Test individual functions, hooks, and store logic in isolation
- **Tools**: Vitest, React Testing Library

### Integration Tests
- **Location**: `src/test/integration/`
- **Purpose**: Test complete user flows and component interactions
- **Tools**: Vitest, React Testing Library, User Event

### Accessibility Tests
- **Location**: `src/test/accessibility/`
- **Purpose**: Ensure components meet accessibility standards
- **Tools**: @axe-core/react, automated a11y testing

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run accessibility tests only
npm run test:a11y
```

## Test Structure

- `src/test/setup.ts` - Global test configuration and mocks
- `src/test/test-utils.tsx` - Custom render function with providers
- `src/test/README.md` - This documentation

## Best Practices

1. **Arrange, Act, Assert**: Structure tests clearly
2. **Test behavior, not implementation**: Focus on user interactions
3. **Use semantic queries**: Prefer `getByRole`, `getByText` over `getByTestId`
4. **Mock external dependencies**: Keep tests isolated and fast
5. **Test accessibility**: Include a11y checks in component tests

## Coverage Goals

- Aim for 80%+ code coverage
- 100% coverage for critical business logic
- All user interactions should be tested
- All error boundaries should be tested
