# Contributing to Lapaas UI Kit

We love your input! We want to make contributing to Lapaas UI Kit as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue a pull request

## Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the CHANGELOG.md with notes on your changes
3. Increase the version numbers following [Semantic Versioning](https://semver.org/)
4. Ensure all tests pass and code is properly linted

## Coding Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Component Guidelines

When creating new components:

1. Create a new directory under `src/components/`
2. Create `ComponentName.tsx` with the component
3. Create `index.ts` that exports the component
4. Add TypeScript types to `src/types/index.ts`
5. Include proper JSDoc comments
6. Ensure accessibility (WCAG 2.1 AA)
7. Support dark mode
8. Make it responsive

## Testing

- Write tests for new components
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
