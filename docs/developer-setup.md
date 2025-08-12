# ChatHub Developer Setup Guide

This guide provides instructions for setting up a development environment for ChatHub.

## Prerequisites

Before you begin, ensure you have the following installed:

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git (for cloning the repository)
- A local web server (Python, Node.js, PHP, or similar)
- A code editor (VS Code, Sublime Text, Atom, etc.)

## Getting the Source Code

1. **Fork the repository** on GitHub
   - Navigate to [https://github.com/Xenonesis/ChatHub](https://github.com/Xenonesis/ChatHub)
   - Click the "Fork" button in the top-right corner

2. **Clone your fork locally**
   ```bash
   git clone https://github.com/your-username/ChatHub.git
   cd ChatHub
   ```

3. **Set up upstream repository**
   ```bash
   git remote add upstream https://github.com/Xenonesis/ChatHub.git
   ```

## Setting Up a Local Server

ChatHub requires a web server to run properly due to browser security restrictions. Here are several options:

### Option 1: Using Python

If you have Python installed:

```bash
# For Python 3
python -m http.server 8000

# For Python 2
python -m SimpleHTTPServer 8000
```

Then navigate to `http://localhost:8000` in your browser.

### Option 2: Using Node.js

If you have Node.js installed:

1. Install the http-server package globally:
   ```bash
   npm install -g http-server
   ```

2. Run the server:
   ```bash
   http-server
   ```

Then navigate to `http://localhost:8080` in your browser.

### Option 3: Using PHP

If you have PHP installed:

```bash
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

### Option 4: Using VS Code Live Server

If you're using VS Code:

1. Install the "Live Server" extension
2. Right-click on `index.html` and select "Open with Live Server"

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Edit the relevant files
- Test your changes thoroughly
- Follow the coding standards outlined in the [Code Style Guide](code-style.md)

### 3. Test Your Changes

- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different screen sizes (mobile, tablet, desktop)
- Test PWA functionality by installing the app
- Test offline functionality

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Use [Conventional Commits](https://www.conventionalcommits.org/) format for commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Ensure the base repository is `Xenonesis/ChatHub` and the base branch is `main`
4. Ensure the head repository is your fork and the compare branch is your feature branch
5. Click "Create Pull Request"
6. Fill in the pull request details
7. Click "Create Pull Request"

## Project Structure Overview

```
ChatHub/
├── README.md           # Project overview and getting started guide
├── LICENSE             # MIT License
├── CONTRIBUTING.md     # Contribution guidelines
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

## Development Tools

### Browser Developer Tools

Modern browsers come with built-in developer tools that are essential for web development:

- **Elements Panel**: Inspect and modify HTML and CSS
- **Console Panel**: View logs, errors, and run JavaScript
- **Sources Panel**: Debug JavaScript
- **Network Panel**: Monitor network requests
- **Application Panel**: View storage, service workers, and more

### Recommended VS Code Extensions

If you're using VS Code, consider these extensions:

- **Live Server**: For local development with live reload
- **Prettier**: For code formatting
- **ESLint**: For JavaScript linting
- **HTML CSS Support**: For CSS autocompletion
- **IntelliSense for CSS**: For better CSS support
- **Path Intellisense**: For file path autocompletion
- **GitLens**: For enhanced Git integration

## Debugging Tips

### Common Issues

**CORS Issues**
- Ensure you're running a local server
- Check that your server is configured with proper CORS headers

**Service Worker Issues**
- Unregister the service worker in browser developer tools
- Clear cache and reload the page
- Check the service worker file for errors

**Puter.js Issues**
- Ensure you have allowed popups for the site
- Check the browser console for authentication errors
- Verify your internet connection

### Debugging Tools

- **Browser Console**: Check for errors and warnings
- **Network Tab**: Monitor API requests and responses
- **Application Tab**: Inspect local storage, IndexedDB, and service workers
- **Debugger**: Set breakpoints in your JavaScript code

## Contributing Guidelines

Before contributing, please read the [Contributing Guidelines](../CONTRIBUTING.md) and follow these steps:

1. Check the existing issues to see if your idea or problem has already been reported
2. Create an issue for your proposed change
3. Wait for feedback from maintainers
4. Implement your changes following the coding standards
5. Test your changes thoroughly
6. Submit a pull request with a clear description of your changes

## Code Style Guide

Please follow the code style guidelines outlined in the [Code Style Guide](code-style.md).

## Getting Help

If you need help with setting up your development environment:

1. Check the [FAQ](faq.md) for common questions
2. Search existing [issues](https://github.com/Xenonesis/ChatHub/issues)
3. Create a new issue with the "question" label
4. Contact the maintainers directly
