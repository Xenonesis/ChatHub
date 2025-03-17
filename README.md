# Claude Chatbot

A modern, responsive chatbot interface that uses Claude 3.5 Sonnet via Puter.js, requiring no API keys or usage limits.

## Features

- Beautiful, responsive UI using TailwindCSS
- Real-time streaming responses
- No API keys required
- Typing indicators
- Error handling
- Smooth animations

## How to Use

1. Clone this repository or download the files
2. Open `index.html` in your web browser
3. Start chatting with Claude 3.5 Sonnet!

## How It Works

This project leverages Puter.js, a JavaScript library that provides free access to Claude 3.5 Sonnet without API keys. Puter.js uses a "User Pays" model, which means developers can incorporate AI capabilities into their applications while users cover their own usage costs.

The chatbot interface is built with:
- HTML for structure
- TailwindCSS for styling
- JavaScript for functionality
- Font Awesome for icons

## Troubleshooting

### "Failed to get response from Claude. Please try again."

If you see this error message, try the following steps:

1. **Allow pop-ups**: Puter.js needs to display a consent dialog. Make sure your browser is not blocking pop-ups.

2. **Check your internet connection**: Ensure you have a stable internet connection.

3. **Use the retry button**: Click the "Retry" button next to the error message to try again.

4. **Try a different Claude model**: Use the model selector in the top-right corner to switch to a different model.

5. **Clear browser cache**: Sometimes clearing your browser cache can resolve issues with external JavaScript libraries.

6. **Use a modern browser**: Ensure you're using a recent version of Chrome, Firefox, Safari, or Edge.

7. **Try again later**: The service might be experiencing high demand or temporary issues.

### Pop-up Blocked Message

If you see a message about pop-ups being blocked:

1. Look for an icon in your browser's address bar indicating blocked content
2. Click on it and select "Allow pop-ups from this site"
3. Refresh the page and try again

## Files

- `index.html` - The main HTML file containing the chat interface
- `app.js` - The JavaScript file handling the chat functionality
- `README.md` - This documentation file

## Technology Used

- HTML
- TailwindCSS
- JavaScript
- Puter.js
- Font Awesome

## Credits

This project is inspired by the Puter.js tutorial for accessing Claude 3.5 Sonnet for free without API keys.

## License

This project is open source and available for anyone to use and modify. 