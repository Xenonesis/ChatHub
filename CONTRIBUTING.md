# Contributing to ChatHub

Thank you for your interest in contributing to ChatHub! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that the problem has already been reported. When creating a bug report, please include the following information:

- A descriptive title
- A clear and detailed description of the issue
- Steps to reproduce the behavior
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (browser, OS, etc.)
- Any additional context

### Suggesting Enhancements

Enhancement suggestions are welcome! Please follow these guidelines:

- Use a clear and descriptive title
- Provide a detailed description of the suggested enhancement
- Explain why this enhancement would be useful
- If applicable, include screenshots or mockups

### Development Setup

1. Fork the repository
2. Clone your fork locally
   ```bash
   git clone https://github.com/your-username/ChatHub.git
   cd ChatHub
   ```
3. Set up upstream repository
   ```bash
   git remote add upstream https://github.com/Xenonesis/ChatHub.git
   ```
4. Create a new branch for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. Install dependencies (if any)
   ```bash
   # This project doesn't require npm dependencies as it uses CDN libraries
   ```
6. Start a local server
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```
7. Make your changes
8. Test your changes thoroughly
9. Commit your changes
   ```bash
   git commit -m "feat: add your feature description"
   ```
10. Push to your fork
    ```bash
    git push origin feature/your-feature-name
    ```
11. Create a pull request

### Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update documentation as needed
3. Add tests if applicable (this project currently doesn't have a test suite)
4. Your pull request should have a clear title and description
5. Link any relevant issues in your pull request description
6. Ensure your code builds and runs without errors

### Coding Standards

- Follow the existing code style
- Use meaningful variable and function names
- Add comments to explain complex logic
- Use JSDoc-style comments for functions and classes
- Keep functions small and focused on a single task
- Avoid global variables when possible

### Documentation

- Update README.md if you're adding new features
- Add inline comments for new code
- Update any relevant documentation files

## Getting Help

If you need help with contributing, you can:

- Create an issue with the "question" label
- Join our community discussions (link to be added)
- Contact the maintainers directly

## Project Structure

```
ChatHub/
├── README.md           # Project overview and getting started guide
├── LICENSE             # MIT License
├── CONTRIBUTING.md     # Contribution guidelines (this file)
├── CHANGELOG.md        # Version history and changes
├── index.html          # Main HTML file
├── app.js              # Main application logic
├── keyboard-shortcuts.js # Keyboard shortcuts management
├── code-execution.js   # Code execution functionality
├── research-utils.js   # Research utilities
├── technical-prompt-utils.js # Technical prompt utilities
├── responsive.css      # Responsive styles
├── service-worker.js   # PWA service worker
├── offline.html        # Offline page
├── manifest.json       # PWA manifest
├── robots.txt          # Robots exclusion file
├── icons/              # App icons and images
└── modules/            # JavaScript modules
    ├── chat.js         # Chat functionality (empty)
    └── custom-prompts.js # Custom prompts management
```

## License

By contributing to ChatHub, you agree that your contributions will be licensed under the MIT License.
