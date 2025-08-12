# ChatHub Architecture Overview

This document provides a high-level view of the ChatHub application structure, its components, and how they interact.

## Application Structure

ChatHub is a client-side web application built with HTML, CSS, and JavaScript. It follows a modular architecture to separate concerns and improve maintainability.

### Core Components

```
ChatHub/
├── index.html          # Main HTML structure
├── app.js              # Main application logic and event handling
├── responsive.css      # Responsive styling and theme management
├── service-worker.js   # PWA service worker for offline functionality
├── manifest.json       # PWA manifest file
├── keyboard-shortcuts.js # Keyboard shortcuts management
├── code-execution.js   # Code execution functionality
├── research-utils.js   # Research utilities
├── technical-prompt-utils.js # Technical prompt utilities
└── modules/            # JavaScript modules
    ├── chat.js         # Chat functionality (empty)
    └── custom-prompts.js # Custom prompts management
```

## Data Flow

### User Interaction Flow

1. **User Input**: User interacts with the UI elements in index.html
2. **Event Handling**: Events are captured and processed by app.js
3. **Model Communication**: Requests are sent to AI models via Puter.js
4. **Response Processing**: Responses are processed and formatted
5. **UI Update**: The UI is updated with the response

### Module Communication

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   app.js        │───▶│  Puter.js API   │───▶│  AI Models      │
│   (Main Logic)  │◀───│  (Abstraction)  │◀───│  (External)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   UI Elements   │    │   Modules       │
│   (index.html)  │    │   (modules/)    │
└─────────────────┘    └─────────────────┘
```

## Key Components

### app.js

The main application logic file that handles:
- UI initialization and event binding
- User input processing
- Communication with AI models via Puter.js
- Chat history management
- Theme switching
- PWA functionality

### modules/custom-prompts.js

Manages pre-defined prompts for different categories:
- Defines prompt categories and their properties
- Stores prompt templates
- Provides methods to access and use prompts

### keyboard-shortcuts.js

Handles all keyboard shortcuts:
- Defines available shortcuts
- Processes keyboard events
- Executes shortcut actions

### code-execution.js

Manages code execution functionality:
- Processes code blocks in responses
- Executes code in a sandboxed environment
- Displays execution results

### research-utils.js

Provides research-related utilities:
- Searches for current information
- Formats research results
- Cites sources

### technical-prompt-utils.js

Contains utilities for technical prompts:
- Generates technical documentation
- Creates code examples
- Provides technical explanations

## Design Patterns

### Module Pattern

The application uses the module pattern to encapsulate functionality:

```javascript
class CustomPromptManager {
    constructor() {
        // Initialization
    }

    // Methods
    getPromptsByCategory(category) {
        // Implementation
    }
}
```

### Event-Driven Architecture

The application follows an event-driven architecture:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize application
});

chatForm.addEventListener('submit', function(e) {
    // Handle form submission
});
```

### Progressive Web App (PWA)

ChatHub implements PWA features:
- Service worker for offline functionality
- Web app manifest for installation
- Responsive design for all devices

## External Dependencies

### Puter.js

Puter.js is the core external dependency that provides:
- Authentication with AI model providers
- Abstraction layer for different AI models
- API communication handling

### UI Libraries

- **Tailwind CSS**: Utility-first CSS framework for styling
- **Font Awesome**: Icon library for UI elements
- **Prism.js**: Syntax highlighting for code blocks
- **KaTeX**: LaTeX rendering for mathematical expressions

## State Management

ChatHub uses a simple state management approach:

- **Local Storage**: Stores user preferences, chat history, and settings
- **In-Memory State**: Maintains current application state during a session
- **URL Parameters**: Handles PWA launch parameters and deep linking

## Security Considerations

- **No API Keys**: Users don't need to provide API keys
- **Local Data Storage**: Sensitive data is not stored on servers
- **Puter.js Authentication**: Relies on Puter.js for secure authentication
- **Content Security Policy**: Implements appropriate security headers

## Performance Optimizations

- **Lazy Loading**: Modules are loaded only when needed
- **Caching**: Service worker caches assets for offline use
- **Minimal Dependencies**: Uses only essential external libraries
- **Optimized Rendering**: Efficient DOM manipulation and updates

## Extensibility

The architecture supports easy extension:

- **Modular Design**: New features can be added as separate modules
- **Event System**: New functionality can hook into existing events
- **Configuration-Based**: Many features can be configured without code changes
- **Plugin Architecture**: Supports adding custom functionality through plugins
