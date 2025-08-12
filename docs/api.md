# ChatHub API Documentation

This document provides details about the APIs used in ChatHub and how they interact with the application.

## Puter.js API

Puter.js is the core API that ChatHub uses to communicate with various AI models. It provides an abstraction layer that handles authentication and communication with different AI providers.

### Initialization

```javascript
// Puter.js is loaded from CDN
<script src="https://js.puter.com/v2/"></script>

// The API is automatically initialized when the script loads
```

### Authentication

Puter.js handles authentication through a popup window:

```javascript
// The authentication is triggered when the user first interacts with an AI model
// No explicit authentication code is needed in the application
```

### Sending Messages to AI Models

```javascript
// Send a message to the selected AI model
puter.ai.chat({
    model: "gpt-4o", // or "gemini", "claude", "deepseek"
    messages: [
        {role: "user", content: "Your message here"}
    ]
}).then(response => {
    // Handle the response
    console.log(response.content);
});
```

### Image Analysis

```javascript
// Analyze an image with GPT-4o Vision
puter.ai.chat({
    model: "gpt-4o-vision",
    messages: [
        {role: "user", content: "What's in this image?"},
        {role: "user", content: {
            type: "image_url",
            image_url: {
                url: "data:image/jpeg;base64,..."
            }
        }}
    ]
}).then(response => {
    // Handle the response
    console.log(response.content);
});
```

### Image Generation

```javascript
// Generate an image with DALL-E 3
puter.ai.createImage({
    model: "dall-e-3",
    prompt: "A beautiful landscape with mountains and a lake"
}).then(response => {
    // Handle the response
    console.log(response.url);
});
```

## Browser APIs

ChatHub uses several browser APIs to provide its functionality.

### Service Worker API

For PWA functionality:

```javascript
// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered'))
        .catch(error => console.log('Service Worker registration failed'));
}
```

### Web Storage API

For storing user preferences and chat history:

```javascript
// Save data to localStorage
localStorage.setItem('chatHistory', JSON.stringify(history));

// Retrieve data from localStorage
const history = JSON.parse(localStorage.getItem('chatHistory'));

// Save user preferences
localStorage.setItem('darkMode', true);
localStorage.setItem('selectedModel', 'gpt-4o');
```

### IndexedDB API

For storing larger amounts of data:

```javascript
// Open database
const request = indexedDB.open('ChatHubDB', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    // Create object store for chat history
    if (!db.objectStoreNames.contains('chats')) {
        const objectStore = db.createObjectStore('chats', { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
    }
};

// Store chat data
function saveChat(chat) {
    const request = db.transaction(['chats'], 'readwrite')
        .objectStore('chats')
        .add(chat);
}
```

### File API

For handling image uploads:

```javascript
// Handle file upload
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const imageData = event.target.result;
        // Process image data
    };

    reader.readAsDataURL(file);
});
```

### Clipboard API

For copying text and code:

```javascript
// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}
```

### Notification API

For PWA notifications:

```javascript
// Request notification permission
Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
        // Show notification
        new Notification('ChatHub', {
            body: 'You have a new message',
            icon: '/icons/icon-192x192.png'
        });
    }
});
```

## Third-Party Libraries

### Tailwind CSS

A utility-first CSS framework used for styling:

```html
<!-- Loaded from CDN -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Custom configuration -->
<script>
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                // Custom theme extensions
            }
        }
    }
</script>
```

### Font Awesome

Icon library used throughout the application:

```html
<!-- Loaded from CDN -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

### Prism.js

Syntax highlighting for code blocks:

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css">

<!-- JavaScript -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
```

### KaTeX

LaTeX rendering for mathematical expressions:

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
```

## Internal APIs

### ChatManager

Internal API for managing chat conversations:

```javascript
class ChatManager {
    constructor() {
        this.chats = this.loadChats();
        this.currentChatId = null;
    }

    // Create a new chat
    createChat() {
        const chat = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            timestamp: new Date().toISOString(),
            model: 'gpt-4o'
        };

        this.chats[chat.id] = chat;
        this.saveChats();
        return chat;
    }

    // Load chats from storage
    loadChats() {
        const savedChats = localStorage.getItem('chats');
        return savedChats ? JSON.parse(savedChats) : {};
    }

    // Save chats to storage
    saveChats() {
        localStorage.setItem('chats', JSON.stringify(this.chats));
    }

    // Add a message to the current chat
    addMessage(role, content) {
        if (!this.currentChatId) {
            this.currentChatId = this.createChat().id;
        }

        const message = {
            role,
            content,
            timestamp: new Date().toISOString()
        };

        this.chats[this.currentChatId].messages.push(message);
        this.saveChats();
        return message;
    }
}
```

### ThemeManager

Internal API for managing themes:

```javascript
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    // Apply a theme
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    // Toggle between light and dark themes
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        return newTheme;
    }
}
```

## Error Handling

### API Error Handling

```javascript
// Handle API errors
puter.ai.chat({
    model: "gpt-4o",
    messages: [
        {role: "user", content: "Your message here"}
    ]
}).then(response => {
    // Handle the response
}).catch(error => {
    // Handle the error
    console.error('API Error:', error);

    // Show user-friendly error message
    showErrorMessage('Sorry, there was an error processing your request. Please try again.');
});
```

### Network Error Handling

```javascript
// Check network status
function checkNetworkStatus() {
    if (navigator.onLine) {
        // Online
        console.log('Application is online');
    } else {
        // Offline
        console.log('Application is offline');
        showOfflineMessage();
    }
}

// Listen for network status changes
window.addEventListener('online', checkNetworkStatus);
window.addEventListener('offline', checkNetworkStatus);
```

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://js.puter.com https://cdn.tailwindcss.com https://cdnjs.cloudflare.com/ajax/libs https://cdn.jsdelivr.net;
    style-src 'self' https://cdnjs.cloudflare.com/ajax/libs https://cdn.jsdelivr.net;
    img-src 'self' data: https:;
    font-src 'self' https://cdnjs.cloudflare.com/ajax/libs;
    connect-src 'self' https://api.puter.com;
">
```

### Data Privacy

- All data is stored locally on the user's device
- No personal information is sent to external servers except through Puter.js
- Chat history is not shared with third parties
