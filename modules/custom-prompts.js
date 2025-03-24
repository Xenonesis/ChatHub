/**
 * Custom Prompts Manager for AI Chat
 * Provides pre-defined prompts to help users get started with common tasks
 */

class CustomPromptManager {
    constructor() {
        // Define categories of prompts
        this.categories = {
            writing: {
                icon: 'fa-pen-fancy',
                color: 'blue',
                name: 'Writing'
            },
            creative: {
                icon: 'fa-paint-brush',
                color: 'purple',
                name: 'Creative'
            },
            professional: {
                icon: 'fa-briefcase',
                color: 'green',
                name: 'Professional'
            },
            learning: {
                icon: 'fa-graduation-cap',
                color: 'yellow',
                name: 'Learning'
            },
            coding: {
                icon: 'fa-code',
                color: 'pink',
                name: 'Coding'
            },
            personal: {
                icon: 'fa-user',
                color: 'indigo',
                name: 'Personal'
            }
        };

        // Define all available prompts
        this.prompts = {
            // Writing prompts
            blogPost: {
                category: 'writing',
                title: 'Blog Post',
                prompt: 'Write a blog post about {{topic}} with the following sections:\n\n1. Introduction that hooks the reader\n2. Main points with supporting evidence\n3. Personal insights and experiences\n4. Actionable takeaways for readers\n5. Compelling conclusion\n\nMake it conversational but informative, around 800-1000 words.'
            },
            essayOutline: {
                category: 'writing',
                title: 'Essay Outline',
                prompt: 'Create a detailed outline for an essay on {{topic}}. Include:\n\n1. A compelling thesis statement\n2. Main arguments with supporting points\n3. Evidence and examples needed\n4. Introduction and conclusion approaches\n5. Potential counterarguments to address'
            },
            emailDraft: {
                category: 'writing',
                title: 'Professional Email',
                prompt: 'Draft a professional email about {{topic}} that is:\n\n1. Clear and concise\n2. Polite and respectful\n3. Well-structured with proper greeting and closing\n4. Free of jargon and unnecessary language\n5. Action-oriented with clear next steps'
            },
            
            // Creative prompts
            shortStory: {
                category: 'creative',
                title: 'Short Story',
                prompt: 'Write a creative short story with the following elements:\n\n1. Setting: {{setting}}\n2. Main character: {{character}}\n3. Conflict: {{conflict}}\n4. Theme: {{theme}}\n\nMake it engaging with descriptive language and dialogue. Around 800-1000 words.'
            },
            poemGenerator: {
                category: 'creative',
                title: 'Poetry',
                prompt: 'Write a poem about {{topic}} in the style of {{style}} with attention to:\n\n1. Imagery and sensory details\n2. Rhythm and flow\n3. Metaphors and symbolism\n4. Emotional resonance\n\nLength: Approximately 12-16 lines.'
            },
            creativeDescription: {
                category: 'creative',
                title: 'Vivid Description',
                prompt: 'Create an extremely detailed and vivid description of {{subject}} focusing on:\n\n1. Visual details and colors\n2. Sounds and ambient noise\n3. Smells and tastes if applicable\n4. Textures and physical sensations\n5. The emotional atmosphere or feeling\n\nBring this to life using rich sensory language and figurative devices.'
            },
            
            // Professional prompts
            resumeImprove: {
                category: 'professional',
                title: 'Resume Bullet Points',
                prompt: 'Help me improve these resume bullet points for a {{position}} role. Transform them to:\n\n1. Focus on achievements rather than duties\n2. Include quantifiable results and metrics\n3. Use strong action verbs\n4. Highlight relevant skills\n5. Remove unnecessary jargon\n\nHere are my current bullet points:\n{{bulletPoints}}'
            },
            interviewPrep: {
                category: 'professional',
                title: 'Interview Prep',
                prompt: 'Help me prepare for an interview for a {{position}} position at a {{industry}} company. Provide:\n\n1. 5 common interview questions for this role\n2. Suggested answers highlighting my experience\n3. 3 technical questions I might face\n4. 3 good questions for me to ask the interviewer\n5. Tips for demonstrating my skills in {{skill}}'
            },
            projectPlan: {
                category: 'professional',
                title: 'Project Plan',
                prompt: 'Create a project plan outline for {{project}}. Include:\n\n1. Project scope and objectives\n2. Key deliverables and milestones\n3. Timeline with phases\n4. Resource requirements\n5. Potential risks and mitigation strategies\n6. Success metrics'
            },
            
            // Learning prompts
            explainConcept: {
                category: 'learning',
                title: 'Explain Concept',
                prompt: 'Explain {{concept}} in a way that's easy to understand but comprehensive. Include:\n\n1. Simple definition and overview\n2. Historical context/development\n3. Real-world applications or examples\n4. Common misconceptions\n5. Advanced aspects for deeper understanding\n6. Resources for further learning'
            },
            studyGuide: {
                category: 'learning',
                title: 'Study Guide',
                prompt: 'Create a comprehensive study guide for {{subject}}. Include:\n\n1. Key concepts and definitions\n2. Important formulas or principles\n3. Example problems with step-by-step solutions\n4. Common misconceptions to avoid\n5. Practice questions with answers\n6. Memory aids and learning techniques'
            },
            researchSummary: {
                category: 'learning',
                title: 'Research Summary',
                prompt: 'Provide a detailed summary of current research on {{topic}} including:\n\n1. Key findings and breakthroughs\n2. Major researchers and their contributions\n3. Competing theories or approaches\n4. Practical applications\n5. Gaps in current knowledge\n6. Future research directions'
            },
            
            // Coding prompts
            codeReview: {
                category: 'coding',
                title: 'Code Review',
                prompt: 'Review the following code for a {{language}} {{projectType}} application:\n\n```{{language}}\n{{code}}\n```\n\nPlease provide:\n1. Bugs or logical errors\n2. Security vulnerabilities\n3. Performance optimizations\n4. Readability improvements\n5. Best practices suggestions'
            },
            algorithmDesign: {
                category: 'coding',
                title: 'Algorithm Design',
                prompt: 'Design an efficient algorithm to solve this problem:\n\n{{problem}}\n\nPlease provide:\n1. A clear approach with pseudocode\n2. Time and space complexity analysis\n3. Edge cases and how to handle them\n4. Potential optimizations\n5. Implementation in {{language}} code'
            },
            systemArchitecture: {
                category: 'coding',
                title: 'System Architecture',
                prompt: 'Design a system architecture for {{application}} that needs to {{requirements}}.\n\nPlease include:\n1. High-level architecture diagram (described in text)\n2. Key components and their responsibilities\n3. Data flow between components\n4. Technology stack recommendations\n5. Scalability considerations\n6. Security measures'
            },
            
            // Personal prompts
            weeklyPlanner: {
                category: 'personal',
                title: 'Weekly Planner',
                prompt: 'Help me create a weekly schedule to balance:\n\n1. Work commitments: {{workHours}}\n2. Personal project: {{personalProject}}\n3. Exercise routine: {{exerciseGoals}}\n4. Social activities\n5. Self-care and relaxation\n\nInclude specific time blocks, practical tips for staying on track, and strategies for maintaining work-life balance.'
            },
            decisionMatrix: {
                category: 'personal',
                title: 'Decision Matrix',
                prompt: 'Help me create a decision matrix for choosing between these options:\n\n{{options}}\n\nBased on these criteria:\n{{criteria}}\n\nProvide:\n1. A weighted scoring system\n2. Pros and cons analysis\n3. Consideration of both logical and emotional factors\n4. Short-term vs long-term implications\n5. A recommendation based on the analysis'
            },
            selfImprovement: {
                category: 'personal',
                title: 'Self-Improvement',
                prompt: 'Create a 30-day self-improvement plan to help me develop {{skill}} with:\n\n1. Clear, achievable daily actions\n2. Resources needed (books, courses, tools)\n3. Progress tracking method\n4. Potential obstacles and solutions\n5. Ways to maintain motivation\n6. How to measure success at the end'
            }
        };
        
        // Initialize properties
        this.drawerVisible = false;
        this.manageMode = false;
        this.userPrompts = this.loadUserPrompts();
        
        // Create the UI elements
        this.createPromptUI();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Initialize the custom prompts feature
     */
    initialize() {
        // Create and insert UI elements
        this.createPromptUI();
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Create the UI elements for the prompts feature
     */
    createPromptUI() {
        // First check if the elements already exist
        if (document.getElementById('prompt-button')) return;
        
        // Create prompt button in the input area
        const inputContainer = document.querySelector('#chat-form');
        if (!inputContainer) return;
        
        // Create the prompt button
        const promptButton = document.createElement('button');
        promptButton.id = 'prompt-button';
        promptButton.type = 'button';
        promptButton.className = 'absolute left-3 bottom-3 text-gray-500 hover:text-purple-600 transition-colors z-10 bg-white dark:bg-gray-800 dark:text-gray-400 dark:hover:text-purple-400 h-8 w-8 rounded-full flex items-center justify-center';
        promptButton.innerHTML = '<i class="fas fa-lightbulb"></i>';
        promptButton.title = 'Choose a prompt template';
        promptButton.setAttribute('aria-label', 'Open prompt templates');
        
        // Add the button to the input container
        const userInput = document.getElementById('user-input');
        if (userInput && userInput.parentNode) {
            userInput.parentNode.style.position = 'relative';
            userInput.style.paddingLeft = '40px';
            userInput.parentNode.appendChild(promptButton);
        }
        
        // Create the prompt drawer (hidden by default)
        const promptDrawer = document.createElement('div');
        promptDrawer.className = 'prompt-drawer fixed left-0 bottom-24 bg-white dark:bg-gray-800 rounded-r-2xl shadow-xl border border-gray-200 dark:border-gray-700 transform -translate-x-full transition-transform duration-300 ease-in-out z-30 w-80 max-w-[90vw] max-h-[70vh] flex flex-col';
        promptDrawer.innerHTML = `
            <div class="prompt-drawer-header border-b border-gray-200 dark:border-gray-700 p-4">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold text-gray-800 dark:text-white flex items-center">
                        <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Prompt Templates
                    </h3>
                    <div class="flex space-x-2">
                        <button id="manage-prompts-button" class="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">
                            <i class="fas fa-cog mr-1"></i> Manage
                        </button>
                        <button id="create-prompt-button" class="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors">
                            <i class="fas fa-plus mr-1"></i> Create
                        </button>
                    </div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                    Select a template to quickly start your prompt
                </div>
            </div>
            <div class="categories-row flex overflow-x-auto py-2 px-2 border-b border-gray-200 dark:border-gray-700">
                <div class="prompt-category flex-shrink-0 px-3 py-1 rounded-full mr-2 cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm active" data-category="all">
                    <i class="fas fa-layer-group mr-1"></i> All
                </div>
            </div>
            <div id="prompt-list" class="flex-grow overflow-y-auto p-2">
                <!-- Prompt items will be populated here -->
                <div class="text-center text-gray-500 dark:text-gray-400 p-4">
                    <i class="fas fa-spinner fa-spin text-lg"></i>
                </div>
            </div>
            <div class="prompt-drawer-footer border-t border-gray-200 dark:border-gray-700 p-3 flex justify-between">
                <button id="import-prompts-button" class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <i class="fas fa-file-import mr-1"></i> Import
                </button>
                <button id="export-prompts-button" class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    <i class="fas fa-file-export mr-1"></i> Export
                </button>
            </div>
        `;
        
        // Add categories to the drawer
        const categoriesContainer = promptDrawer.querySelector('.prompt-categories');
        if (categoriesContainer) {
            for (const [id, category] of Object.entries(this.categories)) {
                const categoryBtn = document.createElement('button');
                categoryBtn.className = 'prompt-category whitespace-nowrap text-xs px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';
                categoryBtn.dataset.category = id;
                categoryBtn.innerHTML = `<i class="fas ${category.icon} text-${category.color}-500 mr-1"></i> ${category.name}`;
                categoriesContainer.appendChild(categoryBtn);
            }
        }
        
        // Create custom prompt dialog
        const promptDialog = document.createElement('div');
        promptDialog.className = 'prompt-dialog-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden';
        promptDialog.innerHTML = `
            <div class="prompt-dialog-content bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">Create Custom Prompt</h3>
                    <button id="close-prompt-dialog" class="text-gray-400 hover:text-gray-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto mb-4">
                    <div class="mb-4">
                        <label for="custom-prompt-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Title</label>
                        <input type="text" id="custom-prompt-title" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    </div>
                    <div class="mb-4">
                        <label for="custom-prompt-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select id="custom-prompt-category" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            ${Object.entries(this.categories).map(([key, category]) => `
                                <option value="${key}">${category.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="custom-prompt-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Template</label>
                        <textarea id="custom-prompt-content" class="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm" placeholder="Enter your prompt template here. Use {{variable}} for placeholders."></textarea>
                    </div>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <p>
                        <i class="fas fa-info-circle mr-1"></i> 
                        Use {{placeholder}} syntax for variables that will be replaced when used.
                    </p>
                </div>
                <div class="flex justify-end">
                    <button id="save-custom-prompt" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                        Save Prompt
                    </button>
                </div>
            </div>
        `;
        
        // Add the elements to the document
        document.body.appendChild(promptDrawer);
        document.body.appendChild(promptDialog);
        
        // Populate the prompt list
        this.populatePromptList();
        
        // Set flag
        this.drawerVisible = false;
    }
    
    /**
     * Populate the prompt list with all available prompts
     * @param {string} [category='all'] - Category to filter by
     */
    populatePromptList(category = 'all') {
        const promptList = document.querySelector('.prompt-list');
        if (!promptList) return;
        
        // Clear current list
        promptList.innerHTML = '';
        
        // Combine default and user prompts
        const allPrompts = { ...this.prompts, ...this.userPrompts };
        
        // Filter prompts by category if needed
        const filteredPrompts = category === 'all' 
            ? allPrompts 
            : Object.entries(allPrompts)
                .filter(([_, prompt]) => prompt.category === category)
                .reduce((acc, [id, prompt]) => {
                    acc[id] = prompt;
                    return acc;
                }, {});
        
        // Show message if no prompts found
        if (Object.keys(filteredPrompts).length === 0) {
            promptList.innerHTML = `
                <div class="p-4 text-center text-gray-500 dark:text-gray-400">
                    <i class="fas fa-search mb-2 text-xl"></i>
                    <p>No prompts found in this category.</p>
                </div>
            `;
            return;
        }
        
        // Add each prompt to the list
        for (const [id, prompt] of Object.entries(filteredPrompts)) {
            const category = this.categories[prompt.category];
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors';
            promptItem.dataset.id = id;
            
            // Check if it's a user-created prompt
            const isUserPrompt = this.userPrompts[id] !== undefined;
            
            promptItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full bg-${category.color}-100 dark:bg-${category.color}-900 dark:bg-opacity-30 flex items-center justify-center mr-2">
                            <i class="fas ${category.icon} text-${category.color}-500"></i>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-800 dark:text-white">${prompt.title}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                ${this.truncatePrompt(prompt.prompt, 60)}
                            </div>
                        </div>
                    </div>
                    ${isUserPrompt ? `
                        <button class="delete-prompt text-gray-400 hover:text-red-500 transition-colors p-1" data-id="${id}" title="Delete custom prompt">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            
            // Add delete functionality for user prompts
            if (isUserPrompt) {
                promptItem.querySelector('.delete-prompt').addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent opening the prompt
                    this.deleteUserPrompt(id);
                });
            }
            
            promptList.appendChild(promptItem);
        }
    }
    
    /**
     * Truncate prompt text to a certain length
     * @param {string} text - The prompt text
     * @param {number} length - The maximum length
     * @returns {string} - Truncated text
     */
    truncatePrompt(text, length = 60) {
        return text.length > length 
            ? text.substring(0, length).replace(/{{.*?}}/g, '...') + '...'
            : text.replace(/{{.*?}}/g, '...');
    }
    
    /**
     * Toggle the visibility of the prompt drawer
     */
    togglePromptDrawer() {
        const promptDrawer = document.querySelector('.prompt-drawer');
        if (!promptDrawer) return;
        
        if (this.drawerVisible) {
            this.hidePromptDrawer();
        } else {
            promptDrawer.classList.remove('-translate-x-full');
            promptDrawer.classList.add('translate-x-0');
            this.drawerVisible = true;
            
            // Populate the prompt list if not already done
            const promptList = promptDrawer.querySelector('#prompt-list');
            if (promptList && promptList.children.length === 0) {
                this.populatePromptList();
            }
        }
    }
    
    /**
     * Hide the prompt drawer
     */
    hidePromptDrawer() {
        const promptDrawer = document.querySelector('.prompt-drawer');
        if (promptDrawer) {
            promptDrawer.classList.remove('translate-x-0');
            promptDrawer.classList.add('-translate-x-full');
            this.drawerVisible = false;
        }
    }
    
    /**
     * Apply a selected prompt to the input field
     * @param {string} promptId - The ID of the prompt to apply
     */
    applyPrompt(promptId) {
        // Get the prompt from either default or user prompts
        const prompt = this.prompts[promptId] || this.userPrompts[promptId];
        if (!prompt) return;
        
        // Extract placeholders from the prompt template
        const placeholders = prompt.prompt.match(/{{([^}]+)}}/g) || [];
        const uniquePlaceholders = [...new Set(placeholders.map(p => p.slice(2, -2)))];
        
        // If there are no placeholders, apply the prompt directly
        if (uniquePlaceholders.length === 0) {
            const userInput = document.getElementById('user-input');
            if (userInput) {
                userInput.value = prompt.prompt;
                userInput.focus();
                
                // Adjust height to fit content
                userInput.style.height = 'auto';
                userInput.style.height = `${userInput.scrollHeight}px`;
            }
            this.hidePromptDrawer();
            return;
        }
        
        // Create a dialog for placeholder values
        const dialog = document.createElement('div');
        dialog.className = 'prompt-dialog-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="prompt-dialog-content bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-gray-800 dark:text-white">Fill in the Details</h3>
                    <button class="close-dialog text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="mb-4">
                    ${uniquePlaceholders.map(placeholder => `
                        <div class="mb-3">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                ${this.formatPlaceholderName(placeholder)}
                            </label>
                            <input type="text" 
                                class="placeholder-input w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                data-placeholder="${placeholder}"
                                placeholder="Enter ${this.formatPlaceholderName(placeholder).toLowerCase()}">
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-end">
                    <button class="apply-prompt-btn bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
                        Apply Prompt
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Focus the first input
        setTimeout(() => {
            dialog.querySelector('.placeholder-input')?.focus();
        }, 100);
        
        // Close dialog handler
        dialog.querySelector('.close-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        // Apply prompt handler
        dialog.querySelector('.apply-prompt-btn').addEventListener('click', () => {
            // Get all placeholder values
            const inputValues = {};
            dialog.querySelectorAll('.placeholder-input').forEach(input => {
                inputValues[input.dataset.placeholder] = input.value;
            });
            
            // Replace placeholders in the prompt template
            let finalPrompt = prompt.prompt;
            for (const [placeholder, value] of Object.entries(inputValues)) {
                finalPrompt = finalPrompt.replace(
                    new RegExp(`{{${placeholder}}}`, 'g'), 
                    value || `[${this.formatPlaceholderName(placeholder)}]`
                );
            }
            
            // Apply to input field
            const userInput = document.getElementById('user-input');
            if (userInput) {
                userInput.value = finalPrompt;
                userInput.focus();
                
                // Adjust height to fit content
                userInput.style.height = 'auto';
                userInput.style.height = `${userInput.scrollHeight}px`;
            }
            
            // Close dialog and hide drawer
            dialog.remove();
            this.hidePromptDrawer();
        });
        
        // Close when clicking outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
    
    /**
     * Format a placeholder name for display
     * @param {string} placeholder - The raw placeholder name
     * @returns {string} - Formatted name
     */
    formatPlaceholderName(placeholder) {
        return placeholder
            // Add space before capital letters
            .replace(/([A-Z])/g, ' $1')
            // Capitalize first letter of each word
            .replace(/\b\w/g, c => c.toUpperCase())
            // Remove extra spaces
            .trim();
    }
    
    /**
     * Filter prompts by category
     * @param {string} category - The category to filter by
     */
    filterByCategory(category) {
        // Update the active category button
        const categoryButtons = document.querySelectorAll('.prompt-category');
        categoryButtons.forEach(button => {
            if (button.dataset.category === category) {
                button.classList.add('active', 'bg-purple-100', 'text-purple-700', 'dark:bg-purple-900', 'dark:bg-opacity-30', 'dark:text-purple-300');
                button.classList.remove('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-white');
            } else {
                button.classList.remove('active', 'bg-purple-100', 'text-purple-700', 'dark:bg-purple-900', 'dark:bg-opacity-30', 'dark:text-purple-300');
                button.classList.add('bg-gray-200', 'text-gray-800', 'dark:bg-gray-700', 'dark:text-white');
            }
        });
        
        // Filter the prompts
        this.populatePromptList(category);
    }
    
    /**
     * Show the custom prompt creation dialog
     */
    showCustomPromptDialog() {
        // Create dialog if it doesn't exist
        if (!document.querySelector('.prompt-dialog-overlay')) {
            const dialog = document.createElement('div');
            dialog.className = 'prompt-dialog-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            dialog.innerHTML = `
                <div class="prompt-dialog-content bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-gray-800 dark:text-white">Create Custom Prompt</h3>
                        <button id="close-prompt-dialog" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="mb-4">
                        <label for="custom-prompt-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Title</label>
                        <input type="text" id="custom-prompt-title" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    </div>
                    <div class="mb-4">
                        <label for="custom-prompt-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select id="custom-prompt-category" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            ${Object.entries(this.categories).map(([key, category]) => `
                                <option value="${key}">${category.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="custom-prompt-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Template</label>
                        <textarea id="custom-prompt-content" class="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm" placeholder="Enter your prompt template here. Use {{variable}} for placeholders."></textarea>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <p>
                            <i class="fas fa-info-circle mr-1"></i> 
                            Use {{placeholder}} syntax for variables that will be replaced when used.
                        </p>
                    </div>
                    <div class="flex justify-end">
                        <button id="save-custom-prompt" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                            Save Prompt
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
        } else {
            document.querySelector('.prompt-dialog-overlay').classList.remove('hidden');
        }
    }
    
    /**
     * Hide the custom prompt dialog
     */
    hideCustomPromptDialog() {
        const dialog = document.querySelector('.prompt-dialog-overlay');
        if (dialog) {
            dialog.classList.add('hidden');
            
            // Clear the form fields
            const titleInput = document.getElementById('custom-prompt-title');
            const contentTextarea = document.getElementById('custom-prompt-content');
            
            if (titleInput) titleInput.value = '';
            if (contentTextarea) contentTextarea.value = '';
        }
    }
    
    /**
     * Save a new custom prompt from user input
     */
    saveCustomPrompt() {
        const titleInput = document.getElementById('custom-prompt-title');
        const contentTextarea = document.getElementById('custom-prompt-content');
        const categorySelect = document.getElementById('custom-prompt-category');
        
        if (!titleInput || !contentTextarea || !categorySelect) return;
        
        const promptTitle = titleInput.value.trim();
        const promptContent = contentTextarea.value.trim();
        const selectedCategory = categorySelect.value;
        
        if (!promptTitle || !promptContent) {
            this.showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        // Generate a unique ID for the new prompt
        const promptId = `user_${Date.now()}`;
        
        // Save the new prompt
        this.userPrompts[promptId] = {
            title: promptTitle,
            prompt: promptContent,
            category: selectedCategory
        };
        
        // Save to localStorage
        this.saveUserPrompts();
        
        // Update the UI
        this.populatePromptList();
        
        // Close the dialog
        this.hideCustomPromptDialog();
        
        // Show success message
        this.showNotification('Custom prompt saved successfully!');
    }
    
    /**
     * Delete a user-created prompt
     * @param {string} promptId - The ID of the prompt to delete
     */
    deleteUserPrompt(promptId) {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this custom prompt?')) {
            return;
        }
        
        // Delete from user prompts
        delete this.userPrompts[promptId];
        
        // Save to localStorage
        this.saveUserPrompts();
        
        // Update prompt list
        this.populatePromptList();
    }
    
    /**
     * Load user-created prompts from localStorage
     * @returns {Object} - User prompts
     */
    loadUserPrompts() {
        try {
            const savedPrompts = localStorage.getItem('user_prompts');
            return savedPrompts ? JSON.parse(savedPrompts) : {};
        } catch (e) {
            console.error('Failed to load user prompts:', e);
            return {};
        }
    }
    
    /**
     * Save user-created prompts to localStorage
     */
    saveUserPrompts() {
        try {
            localStorage.setItem('user_prompts', JSON.stringify(this.userPrompts));
        } catch (e) {
            console.error('Failed to save user prompts:', e);
            this.showNotification('Failed to save custom prompts.', 'error');
        }
    }
    
    /**
     * Toggle management mode for prompts
     */
    toggleManageMode() {
        const promptList = document.getElementById('prompt-list');
        if (!promptList) return;
        
        // Check if we're already in manage mode by looking for delete buttons
        const inManageMode = promptList.querySelector('.delete-prompt-button') !== null;
        
        // Get all prompt items
        const promptItems = promptList.querySelectorAll('.prompt-item');
        
        if (inManageMode) {
            // Exit manage mode
            promptItems.forEach(item => {
                const deleteBtn = item.querySelector('.delete-prompt-button');
                if (deleteBtn) deleteBtn.remove();
                
                // Reset hover behavior
                item.classList.remove('manage-mode');
            });
            
            // Update manage button
            const manageBtn = document.getElementById('manage-prompts-button');
            if (manageBtn) {
                manageBtn.innerHTML = '<i class="fas fa-cog mr-1"></i> Manage';
                manageBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                manageBtn.classList.add('bg-gray-600', 'hover:bg-gray-700');
            }
        } else {
            // Enter manage mode - only add delete buttons to user's custom prompts
            promptItems.forEach(item => {
                const promptId = item.dataset.id;
                
                // Only show delete option for user's custom prompts
                if (promptId && promptId.startsWith('user_')) {
                    item.classList.add('manage-mode');
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-prompt-button absolute right-2 top-2 text-red-500 hover:text-red-700 bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center shadow';
                    deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-xs"></i>';
                    deleteBtn.title = 'Delete prompt';
                    
                    item.appendChild(deleteBtn);
                }
            });
            
            // Update manage button
            const manageBtn = document.getElementById('manage-prompts-button');
            if (manageBtn) {
                manageBtn.innerHTML = '<i class="fas fa-times mr-1"></i> Done';
                manageBtn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
                manageBtn.classList.add('bg-red-600', 'hover:bg-red-700');
            }
        }
    }
    
    /**
     * Export user's custom prompts
     */
    exportPrompts() {
        // Only export user's custom prompts
        const exportData = {
            prompts: this.userPrompts,
            version: '1.0',
            exportDate: new Date().toISOString()
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Create a blob for downloading
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-prompts-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show success message
            this.showNotification('Custom prompts exported successfully!');
        }, 100);
    }
    
    /**
     * Show import dialog
     */
    showImportDialog() {
        // Create import dialog if it doesn't exist
        if (!document.querySelector('.import-dialog-overlay')) {
            const dialog = document.createElement('div');
            dialog.className = 'import-dialog-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            dialog.innerHTML = `
                <div class="import-dialog-content bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-gray-800 dark:text-white">Import Custom Prompts</h3>
                        <button id="close-import-dialog" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="mb-4">
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            Paste your custom prompts JSON data below:
                        </p>
                        <textarea id="import-prompts-data" class="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm" placeholder='{"prompts":{...}}' spellcheck="false"></textarea>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <p>
                            <i class="fas fa-info-circle mr-1"></i> 
                            This will add the imported prompts to your existing custom prompts.
                        </p>
                    </div>
                    <div class="flex justify-end">
                        <button id="submit-import-prompts" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                            Import
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
        } else {
            document.querySelector('.import-dialog-overlay').classList.remove('hidden');
        }
    }
    
    /**
     * Hide import dialog
     */
    hideImportDialog() {
        const dialog = document.querySelector('.import-dialog-overlay');
        if (dialog) {
            dialog.classList.add('hidden');
        }
    }
    
    /**
     * Import custom prompts from JSON
     */
    importPrompts() {
        const textarea = document.getElementById('import-prompts-data');
        if (!textarea) return;
        
        try {
            // Parse the JSON data
            const data = JSON.parse(textarea.value);
            
            // Validate the data structure
            if (!data.prompts || typeof data.prompts !== 'object') {
                throw new Error('Invalid import data: missing prompts object');
            }
            
            // Count imported prompts
            let importCount = 0;
            
            // Import each prompt, assigning new IDs to avoid conflicts
            Object.entries(data.prompts).forEach(([id, prompt]) => {
                if (prompt.title && prompt.prompt && prompt.category) {
                    // Generate a new unique ID
                    const newId = `user_${Date.now()}_${importCount}`;
                    
                    // Add to user's prompts
                    this.userPrompts[newId] = {
                        title: prompt.title,
                        prompt: prompt.prompt,
                        category: prompt.category in this.categories ? prompt.category : 'writing' // Default to writing if category doesn't exist
                    };
                    
                    importCount++;
                }
            });
            
            // Save the updated prompts
            this.saveUserPrompts();
            
            // Refresh the prompt list
            this.populatePromptList();
            
            // Hide the dialog
            this.hideImportDialog();
            
            // Show success message
            this.showNotification(`Successfully imported ${importCount} custom prompts!`);
            
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Error importing prompts. Please check the JSON format.', 'error');
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error)
     */
    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.prompt-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `prompt-notification fixed bottom-28 right-4 py-2 px-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-y-10 opacity-0 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`;
        notification.innerHTML = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.remove('translate-y-10', 'opacity-0');
        }, 10);
        
        // Auto remove after delay
        setTimeout(() => {
            notification.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Add event listeners for the prompts feature
     */
    addEventListeners() {
        document.addEventListener('click', (e) => {
            // Toggle prompt drawer
            if (e.target.closest('#prompt-button')) {
                this.togglePromptDrawer();
            }
            
            // Close prompt drawer when clicking outside
            if (this.drawerVisible && !e.target.closest('.prompt-drawer') && !e.target.closest('#prompt-button')) {
                this.hidePromptDrawer();
            }
            
            // Handle prompt selection
            if (e.target.closest('.prompt-item')) {
                const promptId = e.target.closest('.prompt-item').dataset.id;
                this.applyPrompt(promptId);
            }
            
            // Handle category selection
            if (e.target.closest('.prompt-category')) {
                const category = e.target.closest('.prompt-category').dataset.category;
                this.filterByCategory(category);
            }
            
            // Handle custom prompt creation
            if (e.target.closest('#save-custom-prompt')) {
                this.saveCustomPrompt();
            }
            
            // Handle custom prompt dialog
            if (e.target.closest('#create-prompt-button')) {
                this.showCustomPromptDialog();
            }
            
            // Close custom prompt dialog
            if (e.target.closest('#close-prompt-dialog') || 
                (e.target.closest('.prompt-dialog-overlay') && !e.target.closest('.prompt-dialog-content'))) {
                this.hideCustomPromptDialog();
            }
            
            // Handle export prompts
            if (e.target.closest('#export-prompts-button')) {
                this.exportPrompts();
            }
            
            // Handle import prompts
            if (e.target.closest('#import-prompts-button')) {
                this.showImportDialog();
            }
            
            // Handle import dialog close
            if (e.target.closest('#close-import-dialog') || 
                (e.target.closest('.import-dialog-overlay') && !e.target.closest('.import-dialog-content'))) {
                this.hideImportDialog();
            }
            
            // Handle import prompts submit
            if (e.target.closest('#submit-import-prompts')) {
                this.importPrompts();
            }
            
            // Handle delete user prompt
            if (e.target.closest('.delete-prompt-button')) {
                const promptId = e.target.closest('.prompt-item').dataset.id;
                this.deleteUserPrompt(promptId);
                e.stopPropagation(); // Prevent triggering the prompt selection
            }
            
            // Handle manage prompts button
            if (e.target.closest('#manage-prompts-button')) {
                this.toggleManageMode();
            }
        });
    }
}

// Initialize the custom prompt manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create a global instance
    window.customPrompts = new CustomPromptManager();
    
    // Log initialization for debugging
    console.log('Custom prompts initialized');
});