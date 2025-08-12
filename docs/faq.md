# ChatHub Frequently Asked Questions (FAQ)

## General Questions

### What is ChatHub?

ChatHub is a modern web application that provides access to multiple AI models through Puter.js without requiring API keys. It allows you to chat with various AI models including Google Gemini, OpenAI GPT-4o, Claude, and DeepSeek.

### Is ChatHub free to use?

Yes, ChatHub is completely free to use. It leverages Puter.js to provide access to AI models without requiring users to have their own API keys.

### Do I need to create an account?

You'll need to authenticate through Puter.js, but you don't need to create a separate account for ChatHub. The authentication process is handled through Puter's system.

### Is my conversation history saved?

Yes, your conversation history is saved locally in your browser. You can access it by clicking the history button (clock icon) in the top right corner.

## Technical Questions

### What browsers are supported?

ChatHub works on all modern web browsers including:
- Chrome (version 90+)
- Firefox (version 88+)
- Safari (version 14+)
- Edge (version 90+)

### Can I use ChatHub offline?

Yes, ChatHub has offline support as a Progressive Web App (PWA). However, some features that require AI model access will not work without an internet connection.

### How does ChatHub access AI models without API keys?

ChatHub uses Puter.js, which provides a layer of abstraction that handles authentication and access to various AI models. This allows users to interact with AI models without needing their own API keys.

### Is my data secure?

Yes, your conversations are processed securely. Puter.js handles the authentication and communication with AI models, and your conversation history is stored locally in your browser.

## Feature Questions

### Which AI models are available?

ChatHub currently supports:
- Google Gemini
- OpenAI GPT-4o (including Vision capabilities)
- Claude
- DeepSeek

### Can I upload images?

Yes, you can upload images for analysis when using the GPT-4o model. Click the paperclip icon in the input area to upload an image.

### Can I generate images?

Yes, you can generate images using DALL-E 3. Simply describe the image you want to create in your prompt, and the AI will generate it for you.

### What is Speed Mode?

Speed Mode optimizes responses for faster delivery by reducing the complexity of the AI's reasoning process. This may result in slightly less detailed responses but significantly reduces waiting time.

### What is Thinking Mode?

Thinking Mode enables more detailed, step-by-step reasoning from the AI. This provides more thorough explanations and reasoning but may take longer to generate responses.

### What are custom prompts?

Custom prompts are pre-defined templates for common tasks across different categories like writing, creative work, professional tasks, learning, coding, and personal assistance. They help you get started with specific types of requests quickly.

## Installation and Setup

### How do I install ChatHub on my device?

ChatHub can be installed as a Progressive Web App (PWA):
- On desktop browsers (Chrome/Edge), click the install icon in the address bar
- On mobile, use the "Add to Home Screen" option in your browser menu

### Can I use ChatHub on multiple devices?

Yes, you can use ChatHub on any device with a compatible web browser. However, your conversation history is stored locally on each device and doesn't sync between devices.

### Does ChatHub work on mobile devices?

Yes, ChatHub has a responsive design that works well on mobile devices. You can also install it as a PWA on your phone for easy access.

## Troubleshooting

### I'm having trouble with authentication. What should I do?

Make sure you've allowed popups for the ChatHub website, as the authentication process requires opening a popup window. If you're still having issues, try refreshing the page or clearing your browser cache.

### Why are responses slow sometimes?

Response times can vary depending on the AI model's current load and the complexity of your request. Try enabling Speed Mode for faster responses, or switch to a different model.

### Why can't I upload images?

Make sure you're using the GPT-4o model, as image analysis is only available with this model. Also, check that your image is in a supported format (JPG, PNG) and isn't too large.

### My conversation history disappeared. What happened?

Conversation history is stored locally in your browser. If you cleared your browser data or are using a different browser or device, your history won't be available. Unfortunately, there's no way to recover lost conversation history.

### The app isn't working offline. What's wrong?

Make sure you've installed ChatHub as a PWA and have loaded it at least once while online. If it's still not working offline, try reinstalling the PWA.

## Contributing

### How can I contribute to ChatHub?

We welcome contributions! Please see our [Contributing Guidelines](../CONTRIBUTING.md) for information on how to get started.

### I found a bug. How do I report it?

Please report bugs by creating an issue on our [GitHub repository](https://github.com/Xenonesis/ChatHub/issues). Include as much detail as possible about the bug and how to reproduce it.

### I have a feature request. How do I suggest it?

Feature requests can also be submitted through our [GitHub repository](https://github.com/Xenonesis/ChatHub/issues). Please provide a clear description of the feature and why it would be useful.
