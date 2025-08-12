# ChatHub Keyboard Shortcuts

Keyboard shortcuts allow you to navigate and use ChatHub more efficiently. Here's a complete list of all available shortcuts:

## Chat Interaction

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl/Cmd + Enter` | Send message | All |
| `Ctrl/Cmd + N` | Start a new chat | All |
| `Ctrl/Cmd + S` | Stop generating response | All |
| `Alt + Arrow Up` | Edit your last message | All |
| `Ctrl/Cmd + Z` | Undo last message (if available) | All |

## Navigation

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl/Cmd + H` | Toggle history panel | All |
| `Ctrl/Cmd + /` | Show keyboard shortcuts help | All |
| `Esc` | Close any open panel or dialog | All |

## Interface

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl/Cmd + D` | Toggle dark/light mode | All |
| `Ctrl/Cmd + K` | Focus on input field | All |
| `Ctrl/Cmd + P` | Open custom prompts panel | All |
| `Ctrl/Cmd + R` | Toggle research mode | All |
| `Ctrl/Cmd + T` | Toggle thinking mode | All |
| `Ctrl/Cmd + F` | Toggle speed mode | All |

## Text Formatting

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl/Cmd + B` | Bold text | All |
| `Ctrl/Cmd + I` | Italic text | All |
| `Ctrl/Cmd + U` | Underline text | All |
| `Ctrl/Cmd + E` | Insert code block | All |

## Tips for Using Keyboard Shortcuts

1. **Memorize the essentials**: Start with the most common shortcuts like `Ctrl/Cmd + Enter` to send messages and `Ctrl/Cmd + N` for new chats.

2. **Use the help panel**: If you forget a shortcut, press `Ctrl/Cmd + /` to see all available shortcuts.

3. **Customize your experience**: While the default shortcuts are designed for efficiency, you can modify them in the source code if needed.

4. **Platform differences**: Most shortcuts work across all platforms, but some may have slight variations between Windows, Mac, and Linux.

## Accessibility Considerations

Keyboard shortcuts are designed to make ChatHub more accessible to users with different abilities:

- **Motor impairments**: Keyboard navigation reduces the need for precise mouse movements
- **Visual impairments**: Consistent keyboard patterns help users navigate without visual cues
- **Efficiency**: Power users can navigate more quickly without taking their hands off the keyboard

## Troubleshooting Keyboard Shortcuts

If keyboard shortcuts aren't working:

1. **Check focus**: Make sure your browser window is active and focused
2. **Check for conflicts**: Other browser extensions or applications might be using the same shortcuts
3. **Refresh the page**: Sometimes a simple refresh can resolve issues
4. **Try a different browser**: Some browsers handle keyboard events differently

## Customizing Shortcuts

If you want to customize the keyboard shortcuts, you can modify the `keyboard-shortcuts.js` file:

1. Locate the `shortcuts` array in the file
2. Find the shortcut you want to change
3. Modify the `key` and `modifiers` properties
4. Save your changes and refresh the page

Example:
```javascript
// Original shortcut
{ key: 'n', modifiers: ['ctrl', 'meta'], description: 'New chat', action: this.newChat }

// Modified to use 'c' instead of 'n'
{ key: 'c', modifiers: ['ctrl', 'meta'], description: 'New chat', action: this.newChat }
```

Note: Customizing shortcuts requires knowledge of JavaScript and may be overwritten when the application is updated.
