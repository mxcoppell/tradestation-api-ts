# Contributing to TradeStation API TypeScript Wrapper

First off, thank you for considering contributing to the TradeStation API TypeScript Wrapper! It's people like you that make this project better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include code snippets and stack traces if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* A clear and descriptive title
* A detailed description of the proposed functionality
* Explain why this enhancement would be useful
* List any alternative solutions or features you've considered

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

1. Clone the repository
```bash
git clone https://github.com/your-username/tradestation-api-ts.git
cd tradestation-api-ts
```

2. Install dependencies
```bash
npm install
```

3. Create a branch
```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

4. Make your changes
   - Write meaningful commit messages
   - Follow the coding style
   - Write/update tests
   - Update documentation

5. Run tests
```bash
npm test
npm run test:coverage
```

6. Build the project
```bash
npm run build
npm run build:examples
```

7. Push your changes
```bash
git push origin feature/my-feature
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types
- Use explicit return types for functions
- Follow existing patterns in the codebase

### Testing

- Write unit tests for all new code
- Maintain high test coverage
- Use meaningful test descriptions
- Mock external dependencies

### Documentation

- Update relevant documentation
- Include JSDoc comments for public APIs
- Provide examples for new features
- Keep README.md up to date

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 🚱 `:non-potable_water:` when plugging memory leaks
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

## Project Structure

```
tradestation-api-ts/
├── src/                    # Source code
│   ├── client/            # API client implementation
│   ├── services/          # Service implementations
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Main entry point
├── examples/              # Example implementations
├── tests/                 # Test files
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

## Getting Help

- Check the [documentation](./docs)
- Join the discussion in [GitHub Issues](https://github.com/your-username/tradestation-api-ts/issues)
- For API questions, refer to [TradeStation API Documentation](https://api.tradestation.com/docs/)

## Recognition

Contributors who make significant improvements will be added to the README.md acknowledgments section.

## Additional Notes

### Issue and Pull Request Labels

This project uses labels to help organize and prioritize work. Here are some of the most important ones:

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `documentation` - Improvements or additions to documentation

Thank you for contributing! 