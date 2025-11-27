# Contributing to Iron Pets

Thank you for your interest in contributing to Iron Pets! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear description** of the proposed feature
- **Use case** explaining why this feature would be useful
- **Possible implementation** approach if you have ideas

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** outlined below
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass** before submitting

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   cd src/iron-pets/backend && npm install
   cd ../frontend && npm install
   ```
3. Set up your local database
4. Copy `.env.example` to `.env` and configure
5. Run the development servers

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Provide explicit types (avoid `any`)
- Use interfaces for object shapes
- Document complex functions with JSDoc

### Code Style

- Use ESLint and Prettier configurations provided
- Run `npm run lint` before committing
- Follow existing code patterns

### File Organization

```
modules/
  feature-name/
    feature.controller.ts   # HTTP handlers
    feature.service.ts      # Business logic
    feature.validation.ts   # Zod schemas
    feature.routes.ts       # Route definitions
    index.ts                # Module exports
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.ts` |
| Classes | PascalCase | `UserService` |
| Functions | camelCase | `getUserById` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProfile` |

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(cart): add quantity validation on add to cart
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
```

## Testing Guidelines

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Test Coverage Requirements

- Minimum 80% code coverage for new code
- All critical paths must have tests
- Include both positive and negative test cases

### Running Tests

```bash
# Backend tests
cd src/iron-pets/backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Frontend tests
cd src/iron-pets/frontend
npm test                    # Unit tests
npm run test:e2e            # E2E tests
```

## Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Refactoring

## Pull Request Process

1. Update the README.md if needed
2. Update documentation for any changed functionality
3. Add tests for new features
4. Ensure CI pipeline passes
5. Request review from maintainers
6. Address review feedback
7. Squash commits before merging (if requested)

## Review Criteria

Pull requests are reviewed for:

- Code quality and readability
- Test coverage
- Documentation
- Security considerations
- Performance impact
- Adherence to project patterns

## Questions?

If you have questions, feel free to:

- Open a GitHub issue
- Start a discussion in the Discussions tab
- Reach out to maintainers

Thank you for contributing!
