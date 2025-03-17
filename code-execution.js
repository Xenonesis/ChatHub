/**
 * Code Execution Utilities for AI Chat
 * Provides sandboxed code execution and formatting functionality
 */

class CodeExecutionManager {
    constructor() {
        // Configure supported languages
        this.supportedLanguages = {
            javascript: {
                name: 'JavaScript',
                execute: this.executeJavaScript.bind(this),
                highlight: 'javascript'
            },
            html: {
                name: 'HTML',
                execute: this.executeHTML.bind(this),
                highlight: 'html'
            },
            python: {
                name: 'Python',
                execute: this.executePython.bind(this),
                highlight: 'python',
                codepenSupport: false
            },
            css: {
                name: 'CSS',
                execute: null, // CSS is only executed in combination with HTML
                highlight: 'css'
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        // Set up code block handlers
        document.addEventListener('click', (e) => {
            // Handle run button clicks
            if (e.target.closest('.run-code-btn')) {
                const runBtn = e.target.closest('.run-code-btn');
                const codeBlock = runBtn.closest('.code-block-wrapper')?.querySelector('pre');
                if (codeBlock) {
                    this.runCodeFromBlock(codeBlock);
                }
            }
            
            // Handle copy button clicks
            if (e.target.closest('.copy-code-btn')) {
                const copyBtn = e.target.closest('.copy-code-btn');
                const codeBlock = copyBtn.closest('.code-block-wrapper')?.querySelector('pre');
                if (codeBlock) {
                    this.copyCodeFromBlock(codeBlock);
                }
            }
            
            // Handle open in CodePen button
            if (e.target.closest('.open-codepen-btn')) {
                const codepenBtn = e.target.closest('.open-codepen-btn');
                const codeBlock = codepenBtn.closest('.code-block-wrapper')?.querySelector('pre');
                if (codeBlock) {
                    this.openInCodePen(codeBlock);
                }
            }
        });
        
        // Set up the code playground
        const playgroundRun = document.getElementById('playground-run');
        if (playgroundRun) {
            playgroundRun.addEventListener('click', () => {
                this.runPlaygroundCode();
            });
        }
    }
    
    /**
     * Process code blocks in AI responses
     * @param {Element} container - The container with AI response
     */
    processCodeBlocks(container) {
        if (!container) return;
        
        // Find all code blocks
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            // Skip if already processed
            if (codeBlock.closest('.code-block-wrapper')) return;
            
            // Get the parent pre element
            const preElement = codeBlock.parentElement;
            if (!preElement) return;
            
            // Detect language
            let language = '';
            for (const cls of codeBlock.classList) {
                if (cls.startsWith('language-')) {
                    language = cls.replace('language-', '');
                    break;
                }
            }
            
            // Set fallback language to javascript
            if (!language || !this.supportedLanguages[language]) {
                language = 'javascript';
            }
            
            // Set data-language attribute on pre
            preElement.setAttribute('data-language', this.supportedLanguages[language]?.name || language.toUpperCase());
            
            // Create the wrapper and controls
            this.wrapCodeBlockWithControls(preElement, language);
        });
        
        // Initialize Prism highlighting
        if (window.Prism) {
            Prism.highlightAllUnder(container);
        }
    }
    
    /**
     * Wrap a code block with controls for running, copying etc.
     * @param {Element} preElement - The pre element containing code
     * @param {string} language - The detected language
     */
    wrapCodeBlockWithControls(preElement, language) {
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper relative';
        
        // Add actions div
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'code-actions';
        
        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-action-button copy-code-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy mr-1"></i>Copy';
        copyBtn.title = 'Copy code';
        actionsDiv.appendChild(copyBtn);
        
        // Add run button for supported languages
        if (this.supportedLanguages[language]?.execute) {
            const runBtn = document.createElement('button');
            runBtn.className = 'code-action-button run-code-btn';
            runBtn.innerHTML = '<i class="fas fa-play mr-1"></i>Run';
            runBtn.title = 'Run code';
            actionsDiv.appendChild(runBtn);
        }
        
        // Add CodePen button for HTML/CSS/JS
        if (['html', 'javascript', 'css'].includes(language)) {
            const codepenBtn = document.createElement('button');
            codepenBtn.className = 'code-action-button open-codepen-btn';
            codepenBtn.innerHTML = '<i class="fab fa-codepen mr-1"></i>CodePen';
            codepenBtn.title = 'Open in CodePen';
            actionsDiv.appendChild(codepenBtn);
        }
        
        // Insert the pre element into the wrapper
        preElement.parentNode.insertBefore(wrapper, preElement);
        wrapper.appendChild(actionsDiv);
        wrapper.appendChild(preElement);
        
        // Add a result container for code execution
        const resultContainer = document.createElement('div');
        resultContainer.className = 'run-code-result hidden';
        wrapper.appendChild(resultContainer);
    }
    
    /**
     * Run code from a code block
     * @param {Element} codeBlock - The code block to run
     */
    runCodeFromBlock(codeBlock) {
        // Get code and language
        const code = codeBlock.textContent;
        let language = '';
        
        // Try to detect language from class
        for (const cls of codeBlock.classList) {
            if (cls.startsWith('language-')) {
                language = cls.replace('language-', '');
                break;
            }
        }
        
        // Try to get from data-language
        if (!language) {
            language = codeBlock.getAttribute('data-language')?.toLowerCase() || '';
        }
        
        // Normalize some common aliases
        if (language === 'js') language = 'javascript';
        if (language === 'py') language = 'python';
        
        // Find the result container
        const wrapper = codeBlock.closest('.code-block-wrapper');
        const resultContainer = wrapper?.querySelector('.run-code-result');
        
        if (resultContainer) {
            // Show the container
            resultContainer.classList.remove('hidden');
            resultContainer.innerHTML = '<div class="loading-spinner"></div> Running code...';
            
            // Execute the code
            this.executeCode(code, language)
                .then(result => {
                    resultContainer.innerHTML = '';
                    
                    if (result.error) {
                        resultContainer.innerHTML = `<div class="text-red-600">Error: ${result.error}</div>`;
                    } else if (result.html) {
                        // For HTML output, create a sandbox iframe
                        const iframe = document.createElement('iframe');
                        iframe.className = 'w-full h-48 border-0 rounded';
                        resultContainer.appendChild(iframe);
                        
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        iframeDoc.open();
                        iframeDoc.write(result.html);
                        iframeDoc.close();
                    } else {
                        // For text output
                        resultContainer.textContent = result.output || 'Code executed successfully (no output)';
                    }
                })
                .catch(error => {
                    resultContainer.innerHTML = `<div class="text-red-600">Error: ${error.message}</div>`;
                });
        }
    }
    
    /**
     * Copy code from a code block
     * @param {Element} codeBlock - The code block to copy from
     */
    copyCodeFromBlock(codeBlock) {
        const code = codeBlock.textContent;
        navigator.clipboard.writeText(code).then(() => {
            // Find the copy button
            const copyBtn = codeBlock.closest('.code-block-wrapper')?.querySelector('.copy-code-btn');
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            }
        });
    }
    
    /**
     * Open code in CodePen
     * @param {Element} codeBlock - The code block to open in CodePen
     */
    openInCodePen(codeBlock) {
        // Get the code
        const code = codeBlock.textContent;
        
        // Get the language
        let language = '';
        for (const cls of codeBlock.classList) {
            if (cls.startsWith('language-')) {
                language = cls.replace('language-', '');
                break;
            }
        }
        
        // Create the CodePen data
        let html = '';
        let css = '';
        let js = '';
        
        if (language === 'html') {
            html = code;
        } else if (language === 'css') {
            css = code;
        } else {
            js = code;
        }
        
        // Create a form to submit to CodePen
        const form = document.createElement('form');
        form.action = 'https://codepen.io/pen/define';
        form.method = 'POST';
        form.target = '_blank';
        
        // Create the data input
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = JSON.stringify({
            title: 'Code from AI Chat',
            html: html,
            css: css,
            js: js
        });
        
        // Add to the page and submit
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }
    
    /**
     * Execute code based on language
     * @param {string} code - The code to execute
     * @param {string} language - The language of the code
     * @returns {Promise<object>} - Result of execution
     */
    async executeCode(code, language) {
        if (this.supportedLanguages[language]?.execute) {
            return await this.supportedLanguages[language].execute(code);
        }
        
        return {
            error: `Language '${language}' is not supported for execution`
        };
    }
    
    /**
     * Execute JavaScript in a sandboxed environment
     * @param {string} code - JavaScript code to execute
     * @returns {Promise<object>} - Result of execution
     */
    async executeJavaScript(code) {
        try {
            const logs = [];
            const errors = [];
            
            // Create a secure iframe for execution
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            return new Promise((resolve) => {
                iframe.onload = function() {
                    const iframeWindow = iframe.contentWindow;
                    
                    // Override console methods
                    iframeWindow.console.log = (...args) => {
                        logs.push(args.map(arg => this.formatValue(arg)).join(' '));
                    };
                    
                    iframeWindow.console.error = (...args) => {
                        errors.push(args.map(arg => this.formatValue(arg)).join(' '));
                    };
                    
                    iframeWindow.console.warn = (...args) => {
                        logs.push('⚠️ ' + args.map(arg => this.formatValue(arg)).join(' '));
                    };
                    
                    // Execute the code
                    try {
                        const executeScript = iframeWindow.document.createElement('script');
                        executeScript.textContent = `
                            try {
                                ${code}
                            } catch (e) {
                                console.error(e.message);
                            }
                        `;
                        
                        iframeWindow.document.body.appendChild(executeScript);
                        
                        // Return the results
                        const output = logs.length > 0 ? logs.join('\n') : null;
                        const error = errors.length > 0 ? errors.join('\n') : null;
                        
                        // Clean up
                        document.body.removeChild(iframe);
                        
                        resolve({ output, error });
                    } catch (e) {
                        document.body.removeChild(iframe);
                        resolve({ error: e.message });
                    }
                };
                
                // Handle load errors
                iframe.onerror = function(e) {
                    document.body.removeChild(iframe);
                    resolve({ error: 'Error creating execution environment' });
                };
                
                // Set a blank src to trigger onload
                iframe.src = 'about:blank';
            });
        } catch (e) {
            return { error: e.message };
        }
    }
    
    /**
     * Execute HTML code in an iframe
     * @param {string} code - HTML code to execute
     * @returns {Promise<object>} - Result of execution with HTML
     */
    async executeHTML(code) {
        try {
            return { html: code };
        } catch (e) {
            return { error: e.message };
        }
    }
    
    /**
     * Mock Python execution by showing a message about server-side execution
     * @param {string} code - Python code
     * @returns {Promise<object>} - Result message
     */
    async executePython(code) {
        return { 
            output: "Python execution requires a server. This is a client-side demo showing how the UI would look.\n\nPython code: \n" + code 
        };
    }
    
    /**
     * Format values for console output
     * @param {any} value - The value to format
     * @returns {string} - Formatted string
     */
    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return '[Object]';
            }
        }
        return String(value);
    }
    
    /**
     * Run code from the playground
     */
    runPlaygroundCode() {
        const playgroundEditor = document.getElementById('playground-editor');
        const playgroundOutput = document.getElementById('playground-output');
        const playgroundLanguage = document.getElementById('playground-language');
        
        if (!playgroundEditor || !playgroundOutput || !playgroundLanguage) return;
        
        const code = playgroundEditor.value;
        const language = playgroundLanguage.value;
        
        // Reset and show loading
        playgroundOutput.innerHTML = '<div class="loading-spinner"></div> Running code...';
        playgroundOutput.className = 'flex-1 p-4 bg-gray-100 dark:bg-gray-900 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded overflow-auto';
        
        // Execute the code
        this.executeCode(code, language)
            .then(result => {
                playgroundOutput.innerHTML = '';
                
                if (result.error) {
                    playgroundOutput.innerHTML = `<div class="text-red-600">Error: ${result.error}</div>`;
                    playgroundOutput.classList.add('text-red-600');
                } else if (result.html) {
                    // For HTML output, create a sandbox iframe
                    const iframe = document.createElement('iframe');
                    iframe.className = 'w-full h-full border-0';
                    playgroundOutput.appendChild(iframe);
                    
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(result.html);
                    iframeDoc.close();
                } else {
                    // For text output
                    playgroundOutput.textContent = result.output || 'Code executed successfully (no output)';
                }
            })
            .catch(error => {
                playgroundOutput.innerHTML = `<div class="text-red-600">Error: ${error.message}</div>`;
            });
    }
    
    /**
     * Show the code playground with pre-loaded code
     * @param {string} code - The code to load
     * @param {string} language - The language of the code
     */
    showPlayground(code = '', language = 'javascript') {
        const playground = document.getElementById('code-playground');
        const playgroundEditor = document.getElementById('playground-editor');
        const playgroundLanguage = document.getElementById('playground-language');
        
        if (!playground || !playgroundEditor || !playgroundLanguage) return;
        
        // Set the code and language
        playgroundEditor.value = code;
        
        // Make sure the language is supported
        if (playgroundLanguage.querySelector(`option[value="${language}"]`)) {
            playgroundLanguage.value = language;
        } else {
            playgroundLanguage.value = 'javascript';
        }
        
        // Clear the output
        const playgroundOutput = document.getElementById('playground-output');
        if (playgroundOutput) {
            playgroundOutput.textContent = 'Run code to see output';
        }
        
        // Show the playground
        playground.classList.add('flex');
        playground.classList.remove('hidden');
        
        // Focus the editor
        playgroundEditor.focus();
    }
}

// Initialize the manager
document.addEventListener('DOMContentLoaded', () => {
    window.codeExecution = new CodeExecutionManager();
    
    // Expose show playground for use from app.js
    window.showCodePlayground = (code, language) => {
        window.codeExecution.showPlayground(code, language);
    };
});
