/**
 * Technical Prompt Utilities for AI Chat
 * Provides specialized prompt enhancements for coding, research, and technical tasks
 */

class TechnicalPromptManager {
    constructor() {
        this.templates = {
            // Code-related templates
            codeExplain: {
                prefix: "Analyze this code with detailed explanations of concepts, patterns, and functionality:\n```{{language}}\n",
                suffix: "\n```\nPlease explain:\n1. Key components and their functions\n2. Code organization and design patterns\n3. Implementation details with line references\n4. Potential optimizations or improvements"
            },
            codeDebug: {
                prefix: "Debug the following code by identifying and explaining issues:\n```{{language}}\n",
                suffix: "\n```\nPlease provide:\n1. Identification of bugs or logical errors\n2. Root causes of each issue\n3. Corrected code implementation\n4. Testing strategies to verify the fix"
            },
            codeOptimize: {
                prefix: "Optimize the following code for performance and readability:\n```{{language}}\n",
                suffix: "\n```\nPlease provide:\n1. Optimized implementation with explanations\n2. Performance improvements and their rationale\n3. Readability enhancements\n4. Time and space complexity analysis before and after"
            },
            unitTest: {
                prefix: "Generate comprehensive unit tests for this code:\n```{{language}}\n",
                suffix: "\n```\nPlease create:\n1. Unit tests covering different use cases\n2. Edge case testing\n3. Mocking strategy where needed\n4. Test coverage analysis"
            },
            
            // Research and science templates
            researchSummary: {
                prefix: "Provide a comprehensive summary of the latest research on the following topic:\n\n",
                suffix: "\n\nPlease include:\n1. Key findings and breakthroughs\n2. Methodological approaches\n3. Areas of consensus and controversy\n4. Future research directions\n5. Citations to seminal papers"
            },
            literatureReview: {
                prefix: "Conduct a focused literature review on the following topic:\n\n",
                suffix: "\n\nPlease provide:\n1. Chronological development of ideas\n2. Major research themes\n3. Methodological approaches\n4. Gaps in the literature\n5. A synthesized critique with specific citations"
            },
            mathProblem: {
                prefix: "Solve the following mathematical problem with detailed step-by-step working:\n\n",
                suffix: "\n\nPlease show:\n1. Initial problem formulation\n2. Step-by-step solution process\n3. Key mathematical principles applied\n4. Final answer with verification\n5. Alternative approaches if applicable"
            },
            
            // Technical documentation templates
            apiDocumentation: {
                prefix: "Create comprehensive API documentation for the following code/interface:\n```{{language}}\n",
                suffix: "\n```\nPlease include:\n1. Endpoint/function descriptions\n2. Parameter specifications with types and constraints\n3. Response formats and status codes\n4. Authentication requirements\n5. Example requests and responses\n6. Error handling guidelines"
            },
            technicalGuide: {
                prefix: "Create a technical guide for implementing or working with:\n\n",
                suffix: "\n\nPlease include:\n1. Prerequisite knowledge and setup\n2. Step-by-step implementation instructions\n3. Configuration options and best practices\n4. Troubleshooting common issues\n5. Performance considerations\n6. Security implications"
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        // Set up quick action buttons
        document.addEventListener('click', (e) => {
            // Handle technical action buttons
            const actionButton = e.target.closest('[data-action]');
            if (actionButton) {
                const action = actionButton.getAttribute('data-action');
                const userInput = document.getElementById('user-input');
                
                if (userInput && this.templates[action]) {
                    this.applyTemplateToInput(action, userInput);
                } else if (action === 'explain-code' || action === 'debug-code' || 
                          action === 'optimize-code' || action === 'math-solution' || 
                          action === 'research-summary') {
                    // Handle the basic actions from quick action buttons
                    this.handleBasicAction(action, userInput);
                }
            }
        });
        
        // Add technical UI enhancements
        this.setupTechnicalUI();
    }
    
    /**
     * Apply a template to the input field
     * @param {string} templateName - Name of the template to use
     * @param {HTMLElement} inputElement - The textarea to apply to
     * @param {string} language - Optional language for code templates
     */
    applyTemplateToInput(templateName, inputElement, language = '') {
        if (!inputElement || !this.templates[templateName]) return;
        
        const template = this.templates[templateName];
        let prefix = template.prefix.replace('{{language}}', language || '');
        const suffix = template.suffix;
        
        // If there's already content, add a newline
        if (inputElement.value.trim().length > 0) {
            inputElement.value = inputElement.value.trim() + '\n\n' + prefix;
        } else {
            inputElement.value = prefix;
        }
        
        // Set cursor position before suffix
        const cursorPos = inputElement.value.length;
        inputElement.value += suffix;
        
        // Focus and place cursor
        inputElement.focus();
        inputElement.setSelectionRange(cursorPos, cursorPos);
        
        // Adjust textarea height
        inputElement.style.height = 'auto';
        inputElement.style.height = (inputElement.scrollHeight) + 'px';
    }
    
    /**
     * Handle basic actions from quick action buttons
     * @param {string} action - The action type
     * @param {HTMLElement} inputElement - The textarea element
     */
    handleBasicAction(action, inputElement) {
        if (!inputElement) return;
        
        let promptPrefix = '';
        
        switch (action) {
            case 'explain-code':
                promptPrefix = "Please explain the following code in detail, including how it works and what it does:\n\n```\n";
                break;
            case 'debug-code':
                promptPrefix = "This code has an issue. Please help me debug it and explain what's wrong:\n\n```\n";
                break;
            case 'optimize-code':
                promptPrefix = "Please optimize the following code for better performance and readability:\n\n```\n";
                break;
            case 'research-summary':
                promptPrefix = "Please provide a detailed academic summary of research on this topic, with citations:\n\n";
                break;
            case 'math-solution':
                promptPrefix = "Please solve this mathematical problem step by step. Use LaTeX notation for equations:\n\n";
                break;
        }
        
        if (promptPrefix) {
            // If there's already content, add a newline
            if (inputElement.value.trim().length > 0) {
                inputElement.value += "\n\n" + promptPrefix;
            } else {
                inputElement.value = promptPrefix;
            }
            inputElement.focus();
            
            // Adjust the height of the textarea
            inputElement.style.height = 'auto';
            inputElement.style.height = (inputElement.scrollHeight) + 'px';
        }
    }
    
    /**
     * Set up additional UI elements for technical features
     */
    setupTechnicalUI() {
        // Add advanced technical actions menu
        this.addTechnicalActionsMenu();
        
        // Add support for the technical mode toggle
        const technicalModeToggle = document.getElementById('technical-mode');
        if (technicalModeToggle) {
            technicalModeToggle.addEventListener('change', () => {
                document.body.classList.toggle('technical-mode-active', technicalModeToggle.checked);
                this.updateQuickActionButtons(technicalModeToggle.checked);
                
                // Save preference
                localStorage.setItem('technical_mode', technicalModeToggle.checked);
                
                // Update input placeholder
                this.updateInputPlaceholder(technicalModeToggle.checked);
            });
            
            // Initialize from saved preference
            const savedTechnicalMode = localStorage.getItem('technical_mode') === 'true';
            technicalModeToggle.checked = savedTechnicalMode;
            document.body.classList.toggle('technical-mode-active', savedTechnicalMode);
            this.updateQuickActionButtons(savedTechnicalMode);
            this.updateInputPlaceholder(savedTechnicalMode);
        }
    }
    
    /**
     * Add an advanced technical actions menu for common code/research tasks
     */
    addTechnicalActionsMenu() {
        // Check if we already have a technical actions container
        let actionsContainer = document.getElementById('technical-actions-container');
        if (actionsContainer) return;
        
        // Create container for technical action buttons
        actionsContainer = document.createElement('div');
        actionsContainer.id = 'technical-actions-container';
        actionsContainer.className = 'hidden mt-2 flex flex-wrap gap-2 pb-2 border-b border-gray-200 dark:border-gray-700';
        
        // Add coding action buttons
        const codingActions = [
            { id: 'unitTest', label: 'Generate Tests', icon: 'vial', color: 'blue' },
            { id: 'apiDocumentation', label: 'API Docs', icon: 'book', color: 'pink' },
            { id: 'codeRefactor', label: 'Refactor', icon: 'magic', color: 'indigo' }
        ];
        
        codingActions.forEach(action => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.action = action.id;
            button.className = `text-xs px-2 py-1 bg-${action.color}-100 text-${action.color}-700 rounded hover:bg-${action.color}-200 transition-colors dark:bg-${action.color}-900 dark:bg-opacity-30 dark:text-${action.color}-300`;
            button.innerHTML = `<i class="fas fa-${action.icon} mr-1"></i>${action.label}`;
            actionsContainer.appendChild(button);
        });
        
        // Add research action buttons
        const researchActions = [
            { id: 'literatureReview', label: 'Literature Review', icon: 'book-open', color: 'green' },
            { id: 'mathProblem', label: 'Math Solution', icon: 'calculator', color: 'yellow' },
            { id: 'technicalGuide', label: 'Technical Guide', icon: 'clipboard-list', color: 'orange' }
        ];
        
        researchActions.forEach(action => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.action = action.id;
            button.className = `text-xs px-2 py-1 bg-${action.color}-100 text-${action.color}-700 rounded hover:bg-${action.color}-200 transition-colors dark:bg-${action.color}-900 dark:bg-opacity-30 dark:text-${action.color}-300`;
            button.innerHTML = `<i class="fas fa-${action.icon} mr-1"></i>${action.label}`;
            actionsContainer.appendChild(button);
        });
        
        // Insert the technical actions container right before the chat form
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.parentNode.insertBefore(actionsContainer, chatForm);
        }
    }
    
    /**
     * Update quick action buttons based on technical mode state
     * @param {boolean} isEnabled - Whether technical mode is enabled
     */
    updateQuickActionButtons(isEnabled) {
        // Standard quick actions container (always visible)
        const quickActions = document.getElementById('quick-actions');
        
        // Advanced technical actions container (visible only in technical mode)
        const technicalActions = document.getElementById('technical-actions-container');
        
        if (technicalActions) {
            technicalActions.classList.toggle('hidden', !isEnabled);
            if (isEnabled) {
                technicalActions.classList.add('flex');
            } else {
                technicalActions.classList.remove('flex');
            }
        }
        
        // Update styling of quick action buttons when technical mode is active
        if (quickActions) {
            const buttons = quickActions.querySelectorAll('button');
            buttons.forEach(button => {
                if (isEnabled) {
                    button.classList.add('border-b-2', 'border-purple-500');
                } else {
                    button.classList.remove('border-b-2', 'border-purple-500');
                }
            });
        }
    }
    
    /**
     * Update input placeholder based on technical mode state
     * @param {boolean} isEnabled - Whether technical mode is enabled
     */
    updateInputPlaceholder(isEnabled) {
        const userInput = document.getElementById('user-input');
        if (!userInput) return;
        
        if (isEnabled) {
            const placeholders = [
                "Ask about a code snippet or research topic...",
                "Describe a coding problem or research question...",
                "Need help with algorithm optimization, bug fixes or research literature?",
                "Type code to analyze or describe a technical concept...",
                "Ask for technical documentation or mathematical solutions..."
            ];
            const randomIndex = Math.floor(Math.random() * placeholders.length);
            userInput.setAttribute('placeholder', placeholders[randomIndex]);
        } else {
            userInput.setAttribute('placeholder', "Type your message here...");
        }
    }
    
    /**
     * Enhance user messages with technical formatting before sending
     * @param {string} message - The original user message
     * @param {boolean} technicalModeEnabled - Whether technical mode is enabled
     * @returns {string} - Enhanced message
     */
    enhancePrompt(message, technicalModeEnabled) {
        if (!technicalModeEnabled) return message;
        
        // Check for code blocks and enhance them
        if (message.includes("```")) {
            // Already has code blocks, add technical instructions
            return this.addTechnicalInstructions(message);
        }
        
        // Check if this is likely a code snippet without markers
        if (this.looksLikeCode(message)) {
            // Wrap with code markers and add technical instructions
            let language = this.detectCodeLanguage(message);
            return `Please analyze this code:\n\n\`\`\`${language}\n${message}\n\`\`\`\n\nProvide a detailed explanation of what it does, identify any issues, and suggest improvements.`;
        }
        
        // Check if this looks like a research or academic query
        if (this.looksLikeResearch(message)) {
            return this.enhanceResearchQuery(message);
        }
        
        // Fall back to general technical instructions
        return this.addTechnicalInstructions(message);
    }
    
    /**
     * Add technical instructions to a message
     * @param {string} message - Original message
     * @returns {string} - Enhanced message
     */
    addTechnicalInstructions(message) {
        const instructions = "\n\nPlease provide a detailed technical response with explanations of concepts, code examples where appropriate, and references to relevant documentation or research papers when applicable.";
        return message + instructions;
    }
    
    /**
     * Check if a message appears to be code without code block markers
     * @param {string} message - The message to check
     * @returns {boolean} - Whether it looks like code
     */
    looksLikeCode(message) {
        // Count code indicators
        let codeIndicators = 0;
        
        // Check for common code syntax patterns
        if (message.includes('{') && message.includes('}')) codeIndicators++;
        if (message.includes('(') && message.includes(')')) codeIndicators++;
        if (message.includes('function ') || message.includes('def ')) codeIndicators++;
        if (message.includes('return ')) codeIndicators++;
        if (message.includes('if ') && (message.includes(' else') || message.includes('}'))) codeIndicators++;
        if (message.includes('import ') || message.includes('require(')) codeIndicators++;
        if (message.includes('class ') || message.includes('interface ')) codeIndicators++;
        if (message.includes(' = ') || message.includes(' == ') || message.includes(' === ')) codeIndicators++;
        if (message.includes(';') && message.split(';').length > 2) codeIndicators++;
        if (message.includes('for ') && message.includes('(') && message.includes(')')) codeIndicators++;
        
        // If there are at least 3 code indicators, it's likely code
        return codeIndicators >= 3;
    }
    
    /**
     * Try to detect the programming language of a code snippet
     * @param {string} code - The code to analyze
     * @returns {string} - Detected language or empty string
     */
    detectCodeLanguage(code) {
        // Simple language detection based on keywords and syntax
        const patterns = {
            'python': /\b(import|def|class|if __name__ == ['"]__main__['"]:|print\(|numpy|pandas)\b/i,
            'javascript': /\b(const|let|var|function|document\.|window\.|console\.log|=>)\b/i,
            'html': /<(!DOCTYPE|html|head|body|div|span|a href|script|link|meta|title)/i,
            'css': /\b(body|div|\.[\w-]+|#[\w-]+)\s*{|@media|@keyframes/i,
            'java': /\b(public|private|class|static void main|System\.out|throws|extends|implements)\b/i,
            'cpp': /\b(#include|namespace|std::|cout|cin|void|int main)\b/i,
            'csharp': /\b(using System|namespace|public class|static void Main|Console\.Write)\b/i,
            'php': /(<\?php|\$_GET|\$_POST|\$_SESSION|echo|namespace|use .*;)/i,
            'ruby': /\b(require|def|class|end|puts|attr_accessor)\b/i,
            'go': /\b(package main|import \(|func|fmt\.Print)\b/i,
            'rust': /\b(fn main|let mut|impl|struct|enum|match|println!)\b/i,
            'typescript': /\b(interface|type|readonly|namespace|as string|as number)\b/i,
            'kotlin': /\b(fun|val|var|suspend|companion object|override)\b/i,
            'swift': /\b(import UIKit|func|var|let|class|struct|guard let|if let)\b/i,
            'sql': /\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|UPDATE|DELETE FROM|INSERT INTO)\b/i,
        };
        
        // Check each language pattern
        for (const [language, pattern] of Object.entries(patterns)) {
            if (pattern.test(code)) {
                return language;
            }
        }
        
        // Default to javascript if we can't detect
        return 'javascript';
    }
    
    /**
     * Check if a message appears to be academic or research related
     * @param {string} message - The message to check
     * @returns {boolean} - Whether it looks like a research query
     */
    looksLikeResearch(message) {
        const researchTerms = [
            'research', 'study', 'paper', 'journal', 'publication', 'literature', 'review',
            'methodology', 'findings', 'experiment', 'hypothesis', 'theory', 'analysis',
            'evidence', 'data', 'statistical', 'significance', 'results', 'conclusion',
            'author', 'citation', 'reference', 'bibliography', 'doi', 'abstract', 'peer',
            'dissertation', 'thesis', 'university', 'academic', 'scholar', 'professor',
            'phd', 'doctoral', 'conference', 'proceedings'
        ];
        
        const lowerCaseMessage = message.toLowerCase();
        const wordCount = researchTerms.filter(term => 
            lowerCaseMessage.includes(term.toLowerCase())
        ).length;
        
        return wordCount >= 2;
    }
    
    /**
     * Enhance a research-related query with academic formatting
     * @param {string} message - The original query
     * @returns {string} - Enhanced query
     */
    enhanceResearchQuery(message) {
        return `${message}\n\nPlease provide a comprehensive response with:\n` +
            "1. A summary of key concepts and theories\n" +
            "2. References to significant studies and papers\n" +
            "3. Current academic consensus and areas of debate\n" +
            "4. Limitations of current research\n" +
            "5. Proper citations for all referenced works\n" +
            "6. Suggestions for further reading";
    }
}

// Initialize the technical prompt manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.technicalPrompts = new TechnicalPromptManager();
    
    // Expose enhancePrompt globally for use in app.js
    window.enhancePromptForTechnicalMode = (message, isTechnicalModeEnabled) => {
        if (window.technicalPrompts) {
            return window.technicalPrompts.enhancePrompt(message, isTechnicalModeEnabled);
        }
        return message;
    };
});
