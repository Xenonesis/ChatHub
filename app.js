document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = chatContainer.querySelector('.flex-col');
    const consentBanner = document.getElementById('consent-banner');
    const dismissConsentBtn = document.getElementById('dismiss-consent');
    const modelSelector = document.getElementById('model-selector');
    const checkPopupBtn = document.getElementById('check-popup-settings');
    const chromeSettingsLink = document.querySelector('.chrome-settings');
    const firefoxSettingsLink = document.querySelector('.firefox-settings');
    const preAuthFrame = document.getElementById('pre-auth-frame');
    const historyBtn = document.getElementById('history-btn');
    const historyPanel = document.getElementById('history-panel');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    
    // Image handling elements
    const imageUploadContainer = document.getElementById('image-upload-container');
    const imageUploadBtn = document.getElementById('image-upload-btn');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    
    // Track the current uploaded image
    let currentUploadedImageUrl = null;
    let currentUploadedImageData = null;

    // Current chat ID and history management
    let currentChatId = generateChatId();
    let currentChatTitle = "New Chat";
    let chatHistory = loadChatHistory();
    
    // Track model performance metrics
    let modelPerformanceMetrics = loadModelMetrics();
    
    // Track current request for cancellation
    let currentStreamingResponse = null;
    let requestStartTime = 0;
    
    // Add a response cache for faster repeat responses
    let responseCache = {};

    // Load cached responses from localStorage
    try {
        const savedCache = localStorage.getItem('ai_response_cache');
        if (savedCache) {
            responseCache = JSON.parse(savedCache);
            
            // Cleanup old cache entries (older than 24 hours)
            const now = Date.now();
            Object.keys(responseCache).forEach(key => {
                if (now - responseCache[key].timestamp > 24 * 60 * 60 * 1000) {
                    delete responseCache[key];
                }
            });
        }
    } catch (e) {
        console.warn("Failed to load response cache:", e);
        responseCache = {};
    }

    // Save cache to localStorage
    function saveResponseCache() {
        try {
            localStorage.setItem('ai_response_cache', JSON.stringify(responseCache));
        } catch (e) {
            console.warn("Failed to save response cache:", e);
            
            // Cache might be too large, try to reduce it
            if (e.name === 'QuotaExceededError') {
                // Keep only the 20 most recent entries
                const entries = Object.entries(responseCache);
                if (entries.length > 20) {
                    // Sort by timestamp (newest first)
                    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
                    
                    // Create new cache with only 20 items
                    responseCache = Object.fromEntries(entries.slice(0, 20));
                    
                    // Try to save again
                    try {
                        localStorage.setItem('ai_response_cache', JSON.stringify(responseCache));
                    } catch (innerError) {
                        // If still failing, just clear the cache
                        responseCache = {};
                    }
                }
            }
        }
    }

    // Function to check cache before making API request
    function checkResponseCache(prompt, model) {
        const cacheKey = `${model}:${prompt}`;
        if (responseCache[cacheKey]) {
            // Check if cache entry is still valid (less than 12 hours old)
            const now = Date.now();
            if (now - responseCache[cacheKey].timestamp < 12 * 60 * 60 * 1000) {
                return responseCache[cacheKey].response;
            } else {
                // Cache entry expired
                delete responseCache[cacheKey];
            }
        }
        return null;
    }

    // Function to add response to cache
    function addToResponseCache(prompt, model, response) {
        // Only cache text responses, not image responses
        if (!response || typeof response !== 'string') return;
        
        // Don't cache huge responses
        if (response.length > 100000) return;
        
        const cacheKey = `${model}:${prompt}`;
        responseCache[cacheKey] = {
            response: response,
            timestamp: Date.now()
        };
        
        // Periodically save cache to avoid constant writes
        if (Object.keys(responseCache).length % 5 === 0) {
            saveResponseCache();
        }
    }

    // Function to load model performance metrics from localStorage
    function loadModelMetrics() {
        const savedMetrics = localStorage.getItem('ai_model_metrics');
        return savedMetrics ? JSON.parse(savedMetrics) : {};
    }
    
    // Function to save model performance metrics to localStorage
    function saveModelMetrics() {
        localStorage.setItem('ai_model_metrics', JSON.stringify(modelPerformanceMetrics));
    }
    
    // Function to update model metrics with new response time
    function updateModelMetrics(model, responseTime) {
        if (!modelPerformanceMetrics[model]) {
            modelPerformanceMetrics[model] = {
                avgResponseTime: responseTime,
                responseCount: 1,
                lastResponseTime: responseTime
            };
        } else {
            const metrics = modelPerformanceMetrics[model];
            metrics.lastResponseTime = responseTime;
            metrics.responseCount++;
            // Calculate running average
            metrics.avgResponseTime = ((metrics.avgResponseTime * (metrics.responseCount - 1)) + responseTime) / metrics.responseCount;
        }
        
        saveModelMetrics();
        updateModelSelectionUI();
    }
    
    // Function to stop current generation
    function stopGeneration() {
        if (currentStreamingResponse && typeof currentStreamingResponse.abort === 'function') {
            currentStreamingResponse.abort();
            currentStreamingResponse = null;
            
            // Add a message indicating the generation was stopped
            addSystemMessage("Response generation stopped by user");
        }
    }
    
    // Chat history functions
    function generateChatId() {
        return Date.now().toString() + Math.random().toString(36).substring(2, 10);
    }
    
    function saveChatToHistory() {
        // Don't save empty chats
        const messages = Array.from(chatMessages.children);
        if (messages.length <= 1) return; // Only the welcome message
        
        // If we don't have a title yet, create one from the first user message
        if (currentChatTitle === "New Chat") {
            const userMessages = Array.from(chatMessages.querySelectorAll('.flex.items-start.justify-end'));
            if (userMessages.length > 0) {
                const firstMessage = userMessages[0].querySelector('p').textContent;
                currentChatTitle = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : "");
            }
        }
        
        // Create a timestamp
        const timestamp = new Date().toISOString();
        
        // Create a chat object
        const chat = {
            id: currentChatId,
            title: currentChatTitle,
            timestamp: timestamp,
            html: chatMessages.innerHTML,
            model: getCurrentModel()
        };
        
        // Save to chat history
        chatHistory[currentChatId] = chat;
        localStorage.setItem('claude_chat_history', JSON.stringify(chatHistory));
        
        // Update history list if visible
        if (historyPanel && historyPanel.classList.contains('active')) {
            renderChatHistory();
        }
    }
    
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('claude_chat_history');
        return savedHistory ? JSON.parse(savedHistory) : {};
    }
    
    function renderChatHistory() {
        if (!historyList) return;
        
        // Clear the history list
        historyList.innerHTML = '';
        
        // Sort chats by timestamp, newest first
        const sortedChats = Object.values(chatHistory).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        if (sortedChats.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-center text-gray-500 py-4';
            emptyMessage.textContent = 'No chat history yet';
            historyList.appendChild(emptyMessage);
            return;
        }
        
        // Create list items for each chat
        sortedChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'flex justify-between items-center p-3 hover:bg-gray-100 border-b border-gray-200 cursor-pointer';
            if (chat.id === currentChatId) {
                chatItem.classList.add('bg-purple-50', 'border-l-4', 'border-purple-500');
            }
            
            // Format the date
            const chatDate = new Date(chat.timestamp);
            const formattedDate = chatDate.toLocaleDateString(undefined, {
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            chatItem.innerHTML = `
                <div class="flex-1">
                    <div class="font-medium truncate">${chat.title}</div>
                    <div class="text-xs text-gray-500">${formattedDate} · ${formatModelName(chat.model)}</div>
                </div>
                <div class="flex space-x-2">
                    <button class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            // Add click event to load chat
            chatItem.addEventListener('click', (e) => {
                // Don't handle click if the delete button was clicked
                if (e.target.closest('button')) return;
                
                loadChat(chat.id);
                if (historyPanel) {
                    historyPanel.classList.remove('active');
                }
            });
            
            // Add click event for delete button
            const deleteBtn = chatItem.querySelector('button');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat.id);
            });
            
            historyList.appendChild(chatItem);
        });
    }
    
    function loadChat(chatId) {
        if (!chatHistory[chatId]) return;
        
        // Save current chat before switching
        saveChatToHistory();
        
        // Update current chat ID
        currentChatId = chatId;
        currentChatTitle = chatHistory[chatId].title;
        
        // Load the chat content
        chatMessages.innerHTML = chatHistory[chatId].html;
        
        // Set the model
        if (chatHistory[chatId].model && modelSelector) {
            modelSelector.value = chatHistory[chatId].model;
        }
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function deleteChat(chatId) {
        // Ask for confirmation
        if (!confirm('Are you sure you want to delete this chat?')) return;
        
        // If we're deleting the current chat, create a new one
        const isCurrentChat = chatId === currentChatId;
        
        // Delete from history
        delete chatHistory[chatId];
        localStorage.setItem('claude_chat_history', JSON.stringify(chatHistory));
        
        // Update history list
        renderChatHistory();
        
        // If we deleted the current chat, start a new one
        if (isCurrentChat) {
            startNewChat();
        }
    }
    
    function clearAllHistory() {
        // Ask for confirmation
        if (!confirm('Are you sure you want to delete all chat history? This cannot be undone.')) return;
        
        // Clear history
        chatHistory = {};
        localStorage.setItem('claude_chat_history', JSON.stringify(chatHistory));
        
        // Update history list
        renderChatHistory();
        
        // Start a new chat
        startNewChat();
    }
    
    function startNewChat() {
        // Save current chat
        saveChatToHistory();
        
        // Create new chat ID
        currentChatId = generateChatId();
        currentChatTitle = "New Chat";
        
        // Clear chat messages except for the welcome message
        chatMessages.innerHTML = '';
        
        // Add welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'flex items-start';
        welcomeMessage.innerHTML = `
            <div class="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-2 mr-3">
                <i class="fas fa-robot text-white"></i>
            </div>
            <div class="bg-gray-200 rounded-lg p-3 max-w-3xl">
                <p class="text-gray-800">Hello! I'm ${formatModelName(getCurrentModel())}. How can I assist you today?</p>
            </div>
        `;
        chatMessages.appendChild(welcomeMessage);
        
        // Close history panel if open
        if (historyPanel) {
            historyPanel.classList.remove('active');
        }
    }
    
    // Event listeners for history features
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            // Save current chat before showing history
            saveChatToHistory();
            
            // Toggle history panel
            historyPanel.classList.toggle('active');
            
            // Update history list
            renderChatHistory();
        });
    }
    
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', function() {
            historyPanel.classList.remove('active');
        });
    }
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearAllHistory);
    }
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }

    // Available AI models to try in order
    const AI_MODELS = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gpt-4o',
        'gpt-4o-vision',
        'dall-e-3',
        'claude-3-5-sonnet',
        'claude-3-opus',
        'claude-3-sonnet',
        'claude-3-haiku',
        'deepseek-chat',
        'deepseek-reasoner'
    ];
    
    // Current model index
    let currentModelIndex = 0;
    
    // Maximum number of retries
    const MAX_RETRIES = 3;
    
    // Flag to track if popup was detected
    let popupDetected = false;
    
    // Flag to track if we've seen a consent error
    let consentErrorSeen = false;
    
    // Popup helper elements
    const popupHelper = document.getElementById('popup-helper');
    const closePopupHelper = document.getElementById('close-popup-helper');
    const browserSpecificImage = document.getElementById('browser-specific-image');
    
    // Check if popups are blocked button
    if (checkPopupBtn) {
        checkPopupBtn.addEventListener('click', function() {
            checkForPopupBlocker(true);
        });
    }
    
    // Try to prefetch consent by loading an iframe
    function tryPreAuth() {
        if (preAuthFrame) {
            try {
                // Try to set the iframe to a URL that might trigger the consent dialog
                preAuthFrame.src = "https://app.puter.com/auth";
                
                // After a brief delay, check if we should display popup helper
                setTimeout(() => {
                    if (detectPopupBlocker()) {
                        showBrowserSpecificSettings();
                    }
                }, 500);
            } catch (err) {
                console.warn("Could not pre-authorize:", err);
            }
        }
    }
    
    // Show appropriate settings links based on browser
    function showBrowserSpecificSettings() {
        const browser = detectBrowser();
        
        if (browser === 'Chrome' && chromeSettingsLink) {
            chromeSettingsLink.style.display = 'inline-block';
        } else if (browser === 'Firefox' && firefoxSettingsLink) {
            firefoxSettingsLink.style.display = 'inline-block';
        }
    }
    
    // Try to initialize Puter early to trigger any needed consent dialogs
    tryEarlyPuterInit();
    
    // Attempt pre-auth after a small delay
    setTimeout(tryPreAuth, 1000);
    
    // Function to try early initialization of Puter.js
    function tryEarlyPuterInit() {
        if (typeof puter !== 'undefined') {
            try {
                // Try to initialize a basic Puter.js feature to trigger consent early
                // This might help show the consent dialog before the user tries to chat
                puter.os.platform().then(() => {
                    console.log("Puter.js initialized successfully");
                }).catch(error => {
                    console.warn("Early Puter.js initialization encountered an issue:", error);
                    // This is expected in some cases, we'll handle it when the user actually chats
                });
            } catch (error) {
                console.warn("Early Puter.js initialization error:", error);
            }
        }
    }
    
    // Close popup helper button
    if (closePopupHelper) {
        closePopupHelper.addEventListener('click', function() {
            if (popupHelper) {
                popupHelper.classList.remove('active');
            }
        });
    }
    
    // Show visual popup helper
    function showPopupHelper(browser) {
        // Add browser-specific image
        if (browserSpecificImage) {
            let imgHTML = '';
            
            switch(browser) {
                case 'Chrome':
                    imgHTML = `
                        <div class="flex justify-center">
                            <div class="relative inline-block mb-3">
                                <div class="w-full h-8 bg-gray-100 rounded-t-md flex items-center px-2 border-t border-l border-r border-gray-300">
                                    <div class="bg-red-500 w-3 h-3 rounded-full mr-1"></div>
                                    <div class="bg-yellow-500 w-3 h-3 rounded-full mr-1"></div>
                                    <div class="bg-green-500 w-3 h-3 rounded-full mr-2"></div>
                                    <div class="flex-1 h-5 bg-white rounded-md px-2 flex items-center">
                                        <span class="text-xs text-gray-500 mr-auto">example.com</span>
                                        <div class="bg-red-500 text-white text-xs rounded-md p-0.5 font-bold animate-pulse">🚫</div>
                                    </div>
                                </div>
                                <div class="w-full h-40 bg-white border border-gray-300 rounded-b-md flex items-center justify-center text-sm p-2">
                                    Chrome shows a popup blocker icon in the address bar. Click it to allow popups.
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'Firefox':
                    imgHTML = `
                        <div class="flex justify-center">
                            <div class="relative inline-block mb-3">
                                <div class="w-full h-8 bg-gray-100 rounded-t-md flex items-center px-2 border-t border-l border-r border-gray-300">
                                    <div class="flex-1 h-5 bg-white rounded-md px-2 flex items-center">
                                        <span class="text-xs text-gray-500 mr-auto">example.com</span>
                                        <div class="bg-blue-500 text-white text-xs rounded-md p-0.5 font-bold animate-pulse">🚫</div>
                                    </div>
                                </div>
                                <div class="w-full h-40 bg-white border border-gray-300 rounded-b-md flex items-center justify-center text-sm p-2">
                                    Firefox shows a popup blocker icon in the address bar. Click it to allow popups.
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'Edge':
                    imgHTML = `
                        <div class="flex justify-center">
                            <div class="relative inline-block mb-3">
                                <div class="w-full h-8 bg-gray-100 rounded-t-md flex items-center px-2 border-t border-l border-r border-gray-300">
                                    <div class="flex-1 h-5 bg-white rounded-md px-2 flex items-center">
                                        <span class="text-xs text-gray-500 mr-auto">example.com</span>
                                        <div class="bg-blue-500 text-white text-xs rounded-md p-0.5 font-bold animate-pulse">🚫</div>
                                    </div>
                                </div>
                                <div class="w-full h-40 bg-white border border-gray-300 rounded-b-md flex items-center justify-center text-sm p-2">
                                    Edge shows a popup blocker icon in the address bar. Click it to allow popups.
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'Safari':
                    imgHTML = `
                        <div class="flex justify-center">
                            <div class="relative inline-block mb-3">
                                <div class="w-full h-8 bg-gray-100 rounded-t-md flex items-center px-2 border-t border-l border-r border-gray-300">
                                    <div class="bg-red-500 w-3 h-3 rounded-full mr-1"></div>
                                    <div class="bg-yellow-500 w-3 h-3 rounded-full mr-1"></div>
                                    <div class="bg-green-500 w-3 h-3 rounded-full mr-2"></div>
                                    <div class="flex-1 h-5 bg-white rounded-md px-2 flex items-center text-xs">
                                        <span class="text-xs text-gray-500 mr-auto">example.com</span>
                                        <div class="text-xs animate-pulse">⚙️</div>
                                    </div>
                                </div>
                                <div class="w-full h-40 bg-white border border-gray-300 rounded-b-md flex items-center justify-center text-sm p-2">
                                    In Safari, go to Safari > Preferences > Websites > Pop-up Windows to allow popups.
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                default:
                    imgHTML = `
                        <div class="flex justify-center">
                            <div class="relative inline-block mb-3">
                                <div class="w-full h-8 bg-gray-100 rounded-t-md flex items-center px-2 border-t border-l border-r border-gray-300">
                                    <div class="flex-1 h-5 bg-white rounded-md px-2 flex items-center">
                                        <span class="text-xs text-gray-500 mr-auto">example.com</span>
                                        <div class="bg-gray-500 text-white text-xs rounded-md p-0.5 font-bold animate-pulse">🚫</div>
                                    </div>
                                </div>
                                <div class="w-full h-40 bg-white border border-gray-300 rounded-b-md flex items-center justify-center text-sm p-2">
                                    Most browsers show a popup blocker icon in the address bar. Click it to allow popups.
                                </div>
                            </div>
                        </div>
                    `;
            }
            
            browserSpecificImage.innerHTML = imgHTML;
        }
        
        // Show browser-specific settings links
        showBrowserSpecificSettings();
        
        // Show the popup helper
        if (popupHelper) {
            popupHelper.classList.add('active');
        }
    }
    
    // Detect popup blockers
    function detectPopupBlocker() {
        try {
            let testPopup = window.open('about:blank', '_blank');
            if (!testPopup || testPopup.closed || typeof testPopup.closed === 'undefined') {
                return true; // Popup blocker detected
            }
            testPopup.close();
            return false; // No popup blocker
        } catch (e) {
            return true; // Error means popup likely blocked
        }
    }
    
    // Check for popup blockers and warn user
    function checkForPopupBlocker(isManualCheck = false) {
        const isBlocked = detectPopupBlocker();
        
        if (isBlocked) {
            popupDetected = true;
            
            if (isManualCheck) {
                // Show a more informative message for manual checks
                addSystemMessage("Pop-ups are currently blocked. This application requires pop-ups to function. Please see the instructions to enable them.", true, false, 'popup-warning');
            } else {
                // Standard warning
                addSystemMessage("IMPORTANT: Pop-up blocker detected! This application requires popups for consent dialogs. Please click 'How to Fix' for instructions.", true, false, 'popup-warning');
            }
            
            // Show visual helper
            const browser = detectBrowser();
            showPopupHelper(browser);
            
            return true;
        } else if (isManualCheck) {
            // If this was a manual check and popups are allowed, show a success message
            addSystemMessage("Great! Pop-ups are allowed for this site. This application should be able to work correctly.", false);
            return false;
        }
        
        return false;
    }
    
    // Initial check for popup blockers
    setTimeout(checkForPopupBlocker, 1000);

    // Check if Puter.js is loaded
    if (typeof puter === 'undefined') {
        addSystemMessage("Error: Puter.js failed to load. Please refresh the page or try again later.");
        return;
    }
    
    // Handle consent banner dismissal
    if (dismissConsentBtn) {
        dismissConsentBtn.addEventListener('click', function() {
            if (consentBanner) {
                consentBanner.style.display = 'none';
                
                // Adjust chat container height
                chatContainer.style.height = 'calc(100vh - 180px)';
                
                // Store in localStorage to remember user's choice
                localStorage.setItem('puter_consent_dismissed', 'true');
            }
        });
        
        // Check if user has already dismissed the banner
        if (localStorage.getItem('puter_consent_dismissed') === 'true') {
            consentBanner.style.display = 'none';
            chatContainer.style.height = 'calc(100vh - 180px)';
        }
    }
    
    // Handle model selection
    if (modelSelector) {
        modelSelector.addEventListener('change', function() {
            const selectedModel = modelSelector.value;
            currentModelIndex = AI_MODELS.indexOf(selectedModel);
            if (currentModelIndex === -1) currentModelIndex = 0;
            
            // Show/hide image upload based on model
            if (selectedModel === 'gpt-4o-vision') {
                imageUploadContainer.style.display = 'flex';
            } else {
                imageUploadContainer.style.display = 'none';
                resetImageUpload();
            }
            
            // Add system message about model change
            addSystemMessage(`Switched to ${formatModelName(selectedModel)}`);
        });
    }

    // Function to format model name for display
    function formatModelName(model) {
        if (model.startsWith('claude-')) {
            return model.replace('claude-', 'Claude ');
        } else if (model === 'deepseek-chat') {
            return 'DeepSeek Chat';
        } else if (model === 'deepseek-reasoner') {
            return 'DeepSeek Reasoner';
        } else if (model === 'gpt-4o') {
            return 'GPT-4o';
        } else if (model === 'gpt-4o-vision') {
            return 'GPT-4o Vision';
        } else if (model === 'dall-e-3') {
            return 'DALL-E 3';
        } else if (model === 'gemini-2.0-flash') {
            return 'Gemini 2.0 Flash';
        } else if (model === 'gemini-1.5-flash') {
            return 'Gemini 1.5 Flash';
        }
        return model; // Default fallback
    }
    
    // Function to get current model
    function getCurrentModel() {
        if (modelSelector && modelSelector.value) {
            return modelSelector.value;
        }
        return AI_MODELS[currentModelIndex];
    }
    
    // Function to try the next model
    function tryNextModel() {
        currentModelIndex = (currentModelIndex + 1) % AI_MODELS.length;
        const newModel = AI_MODELS[currentModelIndex];
        
        // Update the model selector if it exists
        if (modelSelector) {
            modelSelector.value = newModel;
        }
        
        console.log(`Switching to model: ${newModel}`);
        return newModel;
    }
    
    // Handle form submission with enhanced error handling
    chatForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Check for popup blockers again on submission
        checkForPopupBlocker();
        
        const message = userInput.value.trim();
        const currentModel = getCurrentModel();
        
        if (message === '' && currentModel !== 'dall-e-3') return;
        
        // Special case for DALL-E 3 image generation
        if (currentModel === 'dall-e-3') {
            if (message === '') {
                addSystemMessage('Please enter a description for the image you want to generate.', true);
                return;
            }
            
            // Add user message to chat
            addUserMessage(message);
            
            // Clear input
            userInput.value = '';
            userInput.focus();
            
            // Generate image
            processImageGeneration(message);
            return;
        }
        
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input
        userInput.value = '';
        userInput.focus();
        
        // Process with retries
        processMessageWithRetries(message, 0);
    });
    
    // Process message with automatic retries
    async function processMessageWithRetries(message, retryCount) {
        // Add typing indicator
        const typingIndicatorId = addTypingIndicator();
        
        try {
            const currentModel = getCurrentModel();
            
            // Handle vision model differently
            if (currentModel === 'gpt-4o-vision' && currentUploadedImageUrl) {
                await processVisionRequest(message, currentUploadedImageUrl, typingIndicatorId);
                resetImageUpload();
            } else {
                // Use streaming for a better user experience for text models
                await streamAIResponse(message, typingIndicatorId);
            }
            
            // Save to history after successful exchange
            saveChatToHistory();
            
        } catch (error) {
            // Remove typing indicator
            removeTypingIndicator(typingIndicatorId);
            
            console.error(`Attempt ${retryCount + 1} failed:`, error);
            
            // Check for consent errors specifically
            if (error.message && (error.message.includes("consent") || error.message.includes("permission"))) {
                consentErrorSeen = true;
                
                // This is likely a consent issue - force check for popup blockers
                if (detectPopupBlocker()) {
                    const browser = detectBrowser();
                    showPopupHelper(browser);
                    
                    addSystemMessage("Error: " + formatModelName(getCurrentModel()) + " needs your permission. A popup may have been blocked. Please check your browser's address bar for popup blocking icons and allow popups for this site.", true, true, null, message);
                    return;
                }
            }
            
            // Auto-retry if we haven't reached max retries
            if (retryCount < MAX_RETRIES) {
                // If it's the first retry, try a different model
                if (retryCount === 0) {
                    const nextModel = tryNextModel();
                    addSystemMessage(`Trying with ${formatModelName(nextModel)} instead...`);
                } else {
                    // For subsequent retries, add a delay message
                    addSystemMessage(`Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
                }
                
                // Wait a moment before retrying
                setTimeout(() => {
                    processMessageWithRetries(message, retryCount + 1);
                }, 1500);
            } else {
                // We've exhausted our retries
                handleFinalError(error, message);
            }
        }
    }
    
    // Handle final error when all retries have failed
    function handleFinalError(error, message) {
        // Check for popup blocker again
        const popupBlocked = detectPopupBlocker();
        
        // Specific error message based on diagnostics
        if (popupBlocked || consentErrorSeen) {
            addSystemMessage(
                "Error: This application requires popup windows for user consent. Please allow popups for this site, then refresh the page and try again.",
                true, true, null, message
            );
            
            // Show instructions for refreshing after allowing popups
            const refreshButton = document.createElement('button');
            refreshButton.className = 'ml-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors';
            refreshButton.textContent = 'Refresh Page';
            refreshButton.addEventListener('click', function() {
                window.location.reload();
            });
            
            // Find the latest system message and append the button
            const systemMessages = Array.from(chatMessages.querySelectorAll('.flex.items-center.justify-center'));
            if (systemMessages.length > 0) {
                const lastSystemMessage = systemMessages[systemMessages.length - 1];
                lastSystemMessage.appendChild(refreshButton);
            }
            
        } else if (error.message && error.message.includes("consent")) {
            addSystemMessage(
                "Error: User consent required. Please accept the Puter.js consent dialog when it appears.",
                true, true, null, message
            );
        } else if (thinkingMode && error.message && error.message.includes("Claude 3-opus")) {
            // Special handling for Claude 3 Opus errors in thinking mode
            addSystemMessage(
                "Error: Claude 3 Opus has encountered a limitation in thinking mode. Switching to Claude 3.5 Sonnet.",
                true, true, null, message
            );
            // Auto-switch to Claude 3.5 Sonnet
            if (modelSelector) {
                modelSelector.value = 'claude-3-5-sonnet';
                modelSelector.dispatchEvent(new Event('change'));
            }
        } else if (thinkingMode && error.message && error.message.includes("token limit")) {
            // Special handling for token limit errors in thinking mode
            addSystemMessage(
                "Error: The model reached its token limit while in thinking mode. Consider breaking your query into smaller parts or disabling thinking mode for this question.",
                true, true, null, message
            );
        } else {
            // General error with retry button
            addSystemMessage(
                `Error: ${error.message || 'Failed to get response from Claude. Please try again.'}`,
                true, true, null, message
            );
        }
        
        // Log detailed error
        console.error('All retries failed. Final error:', error);
    }

    // Function to stream AI response with improved error handling and metrics
    async function streamAIResponse(prompt, typingIndicatorId) {
        try {
            // Record start time for metrics
            requestStartTime = Date.now();
            
            // Create a div for the assistant's message
            const assistantMessageWrapper = document.createElement('div');
            assistantMessageWrapper.className = 'flex items-start';
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-2 mr-3';
            
            const avatarIcon = document.createElement('i');
            avatarIcon.className = 'fas fa-robot text-white';
            avatarDiv.appendChild(avatarIcon);
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-gray-200 rounded-lg p-3 max-w-3xl dark:bg-gray-700';
            
            const messageParagraph = document.createElement('p');
            messageParagraph.className = 'text-gray-800 dark:text-gray-100';
            messageDiv.appendChild(messageParagraph);
            
            // Add thinking mode badge if in thinking mode
            if (thinkingMode) {
                const thinkingBadge = document.createElement('div');
                thinkingBadge.className = 'text-xs inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300 mr-2 mb-2';
                thinkingBadge.innerHTML = '<i class="fas fa-brain mr-1"></i>Thinking Mode';
                messageDiv.insertBefore(thinkingBadge, messageParagraph);
            }
            
            // Add performance mode badge if in performance mode
            if (performanceMode) {
                const speedBadge = document.createElement('div');
                speedBadge.className = 'text-xs inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300 mr-2 mb-2';
                speedBadge.innerHTML = '<i class="fas fa-bolt mr-1"></i>Speed Mode';
                messageDiv.insertBefore(speedBadge, messageParagraph);
            }
            
            // Add model badge showing which model is being used
            const displayModel = getCurrentModel();
            const modelBadge = document.createElement('div');
            
            // Define styles and icons based on model families
            let badgeStyle = '';
            let modelIcon = 'fa-robot';
            
            if (displayModel.includes('claude')) {
                badgeStyle = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-300';
                modelIcon = 'fa-circle-nodes';
                // Apply a subtle border to the message container for Claude
                messageDiv.classList.add('border-l-4', 'border-indigo-300', 'dark:border-indigo-700');
            } else if (displayModel.includes('gpt')) {
                badgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:bg-opacity-30 dark:text-emerald-300';
                modelIcon = 'fa-comment-dots';
                messageDiv.classList.add('border-l-4', 'border-emerald-300', 'dark:border-emerald-700');
            } else if (displayModel.includes('gemini')) {
                badgeStyle = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300';
                modelIcon = 'fa-sparkles';
                messageDiv.classList.add('border-l-4', 'border-blue-300', 'dark:border-blue-700');
            } else if (displayModel.includes('deepseek')) {
                badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:bg-opacity-30 dark:text-amber-300';
                modelIcon = 'fa-code';
                messageDiv.classList.add('border-l-4', 'border-amber-300', 'dark:border-amber-700');
            } else if (displayModel.includes('dall-e')) {
                badgeStyle = 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:bg-opacity-30 dark:text-pink-300';
                modelIcon = 'fa-image';
                messageDiv.classList.add('border-l-4', 'border-pink-300', 'dark:border-pink-700');
            }
            
            modelBadge.className = `text-xs inline-block px-2 py-1 rounded-full mr-2 mb-2 ${badgeStyle}`;
            modelBadge.innerHTML = `<i class="fas ${modelIcon} mr-1"></i>${formatModelName(displayModel)}`;
            messageDiv.insertBefore(modelBadge, messageParagraph);
            
            // Add a subtle animation class based on the mode
            if (thinkingMode) {
                messageDiv.classList.add('thinking-animation');
            } else if (performanceMode) {
                messageDiv.classList.add('speed-animation');
            } else {
                messageDiv.classList.add('standard-animation');
            }
            
            // Add special model-specific styling
            if (displayModel.includes('claude')) {
                messageDiv.classList.add('claude-style');
                messageParagraph.classList.add('claude-font');
            } else if (displayModel.includes('gpt')) {
                messageDiv.classList.add('gpt-style');
                messageParagraph.classList.add('gpt-font');
            } else if (displayModel.includes('gemini')) {
                messageDiv.classList.add('gemini-style');
                messageParagraph.classList.add('gemini-font');
            } else if (displayModel.includes('deepseek')) {
                messageDiv.classList.add('deepseek-style');
            }
            
            // Add stop generation button to the message
            const stopButton = document.createElement('button');
            stopButton.className = 'mt-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors hidden dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300';
            stopButton.textContent = 'Stop generating';
            stopButton.addEventListener('click', stopGeneration);
            messageDiv.appendChild(stopButton);
            
            // Add response time element
            const responseTimeEl = document.createElement('div');
            responseTimeEl.className = 'text-xs text-gray-500 mt-2 hidden dark:text-gray-400';
            messageDiv.appendChild(responseTimeEl);
            
            // Add copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'mt-2 ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors hidden dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300';
            copyButton.innerHTML = '<i class="fas fa-copy mr-1"></i>Copy';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(messageParagraph.textContent)
                    .then(() => {
                        // Show success feedback
                        const originalText = copyButton.innerHTML;
                        copyButton.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
                        copyButton.classList.remove('bg-blue-100', 'text-blue-700', 'dark:bg-blue-900', 'dark:text-blue-300');
                        copyButton.classList.add('bg-green-100', 'text-green-700', 'dark:bg-green-900', 'dark:bg-opacity-30', 'dark:text-green-300');
                        
                        setTimeout(() => {
                            copyButton.innerHTML = originalText;
                            copyButton.classList.add('bg-blue-100', 'text-blue-700', 'dark:bg-blue-900', 'dark:text-blue-300');
                            copyButton.classList.remove('bg-green-100', 'text-green-700', 'dark:bg-green-900', 'dark:bg-opacity-30', 'dark:text-green-300');
                        }, 2000);
                    })
                    .catch(err => console.error('Failed to copy text: ', err));
            });
            messageDiv.appendChild(copyButton);
            
            // Add regenerate button
            const regenerateButton = document.createElement('button');
            regenerateButton.className = 'mt-2 ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors hidden dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300';
            regenerateButton.innerHTML = '<i class="fas fa-redo-alt mr-1"></i>Regenerate';
            regenerateButton.addEventListener('click', () => {
                // Store the original prompt for regeneration
                const originalPrompt = prompt;
                
                // Remove the current response
                assistantMessageWrapper.remove();
                
                // Add typing indicator and regenerate the response
                const typingIndicatorId = addTypingIndicator();
                
                // Process with retries
                (async () => {
                    try {
                        await streamAIResponse(originalPrompt, typingIndicatorId);
                        saveChatToHistory();
                    } catch (error) {
                        removeTypingIndicator(typingIndicatorId);
                        handleFinalError(error, originalPrompt);
                    }
                })();
            });
            messageDiv.appendChild(regenerateButton);
            
            // Add feedback buttons for like and dislike
            const feedbackWrapper = document.createElement('div');
            feedbackWrapper.className = 'mt-2 flex items-center space-x-1 hidden';
            
            // Like button
            const likeButton = document.createElement('button');
            likeButton.className = 'text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300';
            likeButton.innerHTML = '<i class="fas fa-thumbs-up mr-1"></i>Good';
            likeButton.addEventListener('click', () => {
                // Show temporary feedback
                const feedbackMsg = document.createElement('span');
                feedbackMsg.className = 'text-xs text-green-600 ml-2 dark:text-green-400';
                feedbackMsg.textContent = 'Thanks for your feedback!';
                feedbackWrapper.appendChild(feedbackMsg);
                
                // Visual feedback - disable buttons
                likeButton.disabled = true;
                likeButton.classList.add('opacity-50');
                dislikeButton.disabled = true;
                dislikeButton.classList.add('opacity-50');
                
                // Remove feedback message after delay
                setTimeout(() => {
                    feedbackMsg.remove();
                }, 3000);
                
                // Could add analytics or feedback tracking here
            });
            feedbackWrapper.appendChild(likeButton);
            
            // Dislike button
            const dislikeButton = document.createElement('button');
            dislikeButton.className = 'text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300';
            dislikeButton.innerHTML = '<i class="fas fa-thumbs-down mr-1"></i>Bad';
            dislikeButton.addEventListener('click', () => {
                // Remove existing feedback elements if any
                Array.from(feedbackWrapper.querySelectorAll('.feedback-form')).forEach(el => el.remove());
                
                // Create feedback form
                const feedbackForm = document.createElement('div');
                feedbackForm.className = 'feedback-form ml-2 flex-1';
                
                const feedbackInput = document.createElement('input');
                feedbackInput.type = 'text';
                feedbackInput.className = 'text-xs p-1 border border-gray-300 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white';
                feedbackInput.placeholder = 'What would you like to improve? (optional)';
                feedbackForm.appendChild(feedbackInput);
                
                const feedbackSubmit = document.createElement('button');
                feedbackSubmit.className = 'text-xs ml-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors';
                feedbackSubmit.textContent = 'Submit & Regenerate';
                feedbackSubmit.addEventListener('click', () => {
                    const feedbackText = feedbackInput.value.trim();
                    
                    // Remove the current response
                    assistantMessageWrapper.remove();
                    
                    // Prepare a new prompt with feedback
                    let newPrompt = prompt;
                    if (feedbackText) {
                        newPrompt = `${prompt}\n\nPlease improve your response. User feedback: ${feedbackText}`;
                    }
                    
                    // Add typing indicator and regenerate
                    const typingIndicatorId = addTypingIndicator();
                    
                    // Process with retries
                    (async () => {
                        try {
                            await streamAIResponse(newPrompt, typingIndicatorId);
                            saveChatToHistory();
                        } catch (error) {
                            removeTypingIndicator(typingIndicatorId);
                            handleFinalError(error, newPrompt);
                        }
                    })();
                });
                feedbackForm.appendChild(feedbackSubmit);
                
                const cancelButton = document.createElement('button');
                cancelButton.className = 'text-xs ml-1 px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500';
                cancelButton.textContent = 'Cancel';
                cancelButton.addEventListener('click', () => {
                    feedbackForm.remove();
                    
                    // Re-enable buttons
                    likeButton.disabled = false;
                    likeButton.classList.remove('opacity-50');
                    dislikeButton.disabled = false;
                    dislikeButton.classList.remove('opacity-50');
                });
                feedbackForm.appendChild(cancelButton);
                
                feedbackWrapper.appendChild(feedbackForm);
                
                // Disable buttons during feedback
                likeButton.disabled = true;
                likeButton.classList.add('opacity-50');
                dislikeButton.disabled = true;
                dislikeButton.classList.add('opacity-50');
            });
            feedbackWrapper.appendChild(dislikeButton);
            
            messageDiv.appendChild(feedbackWrapper);
            
            assistantMessageWrapper.appendChild(avatarDiv);
            assistantMessageWrapper.appendChild(messageDiv);
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicatorId);
            
            // Add the message wrapper to the chat
            chatMessages.appendChild(assistantMessageWrapper);
            
            const responseSelectedModel = getCurrentModel();
            
            // Check cache first for fast responses
            const cachedResponse = checkResponseCache(prompt, responseSelectedModel);
            if (cachedResponse) {
                messageParagraph.textContent = cachedResponse;
                chatContainer.scrollTop = chatContainer.scrollHeight;
                
                // Show response was from cache
                const responseTime = 0.1; // Cached responses are essentially instant
                responseTimeEl.textContent = `Cached response (saved ${responseTime.toFixed(1)}s)`;
                responseTimeEl.classList.remove('hidden');
                
                // Show copy button
                copyButton.classList.remove('hidden');
                
                // Show regenerate button and feedback buttons
                regenerateButton.classList.remove('hidden');
                feedbackWrapper.classList.remove('hidden');
                
                return; // Success! Return early
            }
            
            // Create a timeout promise that rejects after 30 seconds
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Request timed out. This may be due to a popup being blocked or connection issues.")), 30000);
            });
            
            // Increment request counter
            incrementRequestCounter();
            
            // Try different approach based on whether we've seen consent errors
            if (consentErrorSeen) {
                // If we've already seen consent errors, try non-streaming first
                try {
                    // Add performance mode parameter if enabled
                    const options = {
                        model: responseSelectedModel, 
                        stream: false
                    };
                    
                    if (performanceMode) {
                        options.temperature = 0.1; // Even lower temperature for faster, more deterministic responses
                        options.max_tokens = 750; // Stricter token limit for faster responses 
                        options.top_p = 0.8; // Add top_p parameter to further increase speed
                    } else if (thinkingMode) {
                        options.temperature = 0.5; // Balanced temperature for thoughtful but somewhat diverse responses
                        options.max_tokens = 4000; // Increased token limit for more comprehensive responses
                        options.top_p = 0.9; // Slightly diverse token selection that still focuses on most likely tokens
                        
                        // Add a thinking prompt wrapper to guide the model's reasoning process
                        const originalPrompt = prompt;
                        prompt = `I need a well-reasoned, step-by-step analysis of the following question or request. 
Please structure your thinking as follows:
1. Initial understanding of the question
2. Key considerations and factors to analyze
3. Step-by-step reasoning and analysis
4. Conclusion or recommendation

The question or request is: 

${originalPrompt}

Take your time to think through this carefully and provide a thorough analysis.`;
                    }
                    
                    const nonStreamPromise = puter.ai.chat(prompt, options);
                    
                    // Race against timeout
                    const nonStreamResponse = await Promise.race([nonStreamPromise, timeoutPromise]);
                    
                    if (nonStreamResponse && nonStreamResponse.message && 
                        nonStreamResponse.message.content && 
                        nonStreamResponse.message.content.length > 0 && 
                        nonStreamResponse.message.content[0].text) {
                        
                        const responseText = nonStreamResponse.message.content[0].text;
                        messageParagraph.textContent = responseText;
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                        
                        // Calculate and display response time
                        const responseTime = (Date.now() - requestStartTime) / 1000;
                        responseTimeEl.textContent = `Response time: ${responseTime.toFixed(1)}s`;
                        responseTimeEl.classList.remove('hidden');
                        
                        // Show copy button
                        copyButton.classList.remove('hidden');
                        
                        // Show regenerate button and feedback buttons
                        regenerateButton.classList.remove('hidden');
                        feedbackWrapper.classList.remove('hidden');
                        
                        // Update metrics
                        updateModelMetrics(responseSelectedModel, responseTime);
                        
                        // Add to cache
                        addToResponseCache(prompt, responseSelectedModel, responseText);
                        
                        return; // Success! Return early
                    }
                } catch (error) {
                    console.warn("Non-streaming approach failed, will try streaming:", error);
                    // Continue to streaming approach
                }
            }
            
            // Prioritize faster models based on performance metrics and performance mode
            let modelToUse = responseSelectedModel;
            if (performanceMode) {
                // In performance mode, aggressively prefer faster models
                const fastModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'claude-3-haiku', 'deepseek-chat'];
                
                // If current model isn't already a fast one, always switch to the fastest model
                if (!fastModels.includes(responseSelectedModel) && 
                    responseSelectedModel !== 'gpt-4o-vision' && 
                    responseSelectedModel !== 'dall-e-3') {
                    
                    // Show a message about using a faster model
                    const modelSuggestion = document.createElement('div');
                    modelSuggestion.className = 'text-xs text-blue-600 mb-2 dark:text-blue-400';
                    modelSuggestion.textContent = `💡 Using ${formatModelName('gemini-2.0-flash')} for faster response (Speed Mode)`;
                    messageDiv.insertBefore(modelSuggestion, messageParagraph);
                    
                    modelToUse = 'gemini-2.0-flash';
                } else if (responseSelectedModel === 'gemini-1.5-flash') {
                    // If using gemini-1.5-flash, suggest switching to gemini-2.0-flash
                    const modelSuggestion = document.createElement('div');
                    modelSuggestion.className = 'text-xs text-blue-600 mb-2 dark:text-blue-400';
                    modelSuggestion.textContent = `💡 Using ${formatModelName('gemini-2.0-flash')} for faster response (Speed Mode)`;
                    messageDiv.insertBefore(modelSuggestion, messageParagraph);
                    
                    modelToUse = 'gemini-2.0-flash';
                }
            } else if (thinkingMode) {
                // In thinking mode, prefer more powerful models
                const thinkingModels = [
                    'claude-3-5-sonnet', 
                    'gpt-4o', 
                    'deepseek-reasoner', 
                    'claude-3-opus',
                    'gemini-1.5-pro',
                    'claude-3-haiku',
                    'gemini-2.0-flash'
                ];
                
                // Only switch if not already using a thinking model or specialized model
                if (!thinkingModels.includes(responseSelectedModel) && 
                    responseSelectedModel !== 'gpt-4o-vision' && 
                    responseSelectedModel !== 'dall-e-3') {
                    
                    // Show a message about using a more powerful model
                    const modelSuggestion = document.createElement('div');
                    modelSuggestion.className = 'text-xs text-blue-600 mb-2 dark:text-blue-400';
                    modelSuggestion.textContent = `💡 Using ${formatModelName('claude-3-5-sonnet')} for deeper analysis (Thinking Mode)`;
                    messageDiv.insertBefore(modelSuggestion, messageParagraph);
                    
                    modelToUse = 'claude-3-5-sonnet'; // Use claude-3-5-sonnet as default for thinking mode
                }
            } else if (modelPerformanceMetrics) {
                // Check if there's a significantly faster model available
                const currentMetrics = modelPerformanceMetrics[responseSelectedModel];
                if (currentMetrics && currentMetrics.avgResponseTime > 5) {
                    // Get models with at least 3 responses and faster average time
                    const fasterModels = Object.entries(modelPerformanceMetrics)
                        .filter(([model, metrics]) => {
                            return metrics.responseCount >= 3 &&
                                metrics.avgResponseTime < currentMetrics.avgResponseTime * 0.7 &&
                                model !== 'gpt-4o-vision' && model !== 'dall-e-3';
                        })
                        .sort((a, b) => a[1].avgResponseTime - b[1].avgResponseTime);
                    
                    if (fasterModels.length > 0) {
                        // Add a message about using a faster model
                        const fasterModel = fasterModels[0][0];
                        const speedup = (currentMetrics.avgResponseTime / modelPerformanceMetrics[fasterModel].avgResponseTime).toFixed(1);
                        
                        // Only suggest if significant speedup
                        if (parseFloat(speedup) > 1.5) {
                            const modelSuggestion = document.createElement('div');
                            modelSuggestion.className = 'text-xs text-blue-600 mb-2 dark:text-blue-400';
                            modelSuggestion.textContent = `💡 Tip: ${formatModelName(fasterModel)} is ~${speedup}x faster. Click to switch.`;
                            modelSuggestion.style.cursor = 'pointer';
                            modelSuggestion.addEventListener('click', () => {
                                if (modelSelector) {
                                    modelSelector.value = fasterModel;
                                    // Trigger the change event
                                    modelSelector.dispatchEvent(new Event('change'));
                                }
                            });
                            messageDiv.insertBefore(modelSuggestion, messageParagraph);
                        }
                    }
                }
            }
            
            // Standard streaming approach
            try {
                // Add performance mode options
                const options = {
                    model: modelToUse,
                    stream: true
                };
                
                if (performanceMode) {
                    options.temperature = 0.3; // Lower temperature for faster, more deterministic responses
                    options.max_tokens = 1024; // Limit token count for faster responses
                } else if (thinkingMode) {
                    options.temperature = 0.5; // Balanced temperature for thoughtful but somewhat diverse responses
                    options.max_tokens = 4000; // Increased token limit for more comprehensive responses
                    options.top_p = 0.9; // Slightly diverse token selection that still focuses on most likely tokens
                    
                    // Add a thinking prompt wrapper to guide the model's reasoning process
                    const originalPrompt = prompt;
                    prompt = `I need a well-reasoned, step-by-step analysis of the following question or request. 
Please structure your thinking as follows:
1. Initial understanding of the question
2. Key considerations and factors to analyze
3. Step-by-step reasoning and analysis
4. Conclusion or recommendation

The question or request is: 

${originalPrompt}

Take your time to think through this carefully and provide a thorough analysis.`;
                }
                
                if (thinkingMode) {
                    options.temperature = 0.7; // Higher temperature for more creative, diverse responses
                    options.max_tokens = 2500; // Reduced token limit to prevent errors with Claude models
                    options.top_p = 0.95; // More diverse token selection
                }
                
                // First try to create an "empty" request to trigger any auth popups
                try {
                    await puter.ai.chat("test", {model: modelToUse, stream: false});
                } catch (authError) {
                    // This is expected to fail in some cases but may trigger auth popups
                    console.log("Auth trigger attempt:", authError);
                }
                
                // Get streaming response with timeout
                const responsePromise = puter.ai.chat(prompt, options);
                
                // Save reference for potential cancellation
                currentStreamingResponse = responsePromise;
                
                // Show the stop button after a short delay if streaming is working
                setTimeout(() => {
                    if (currentStreamingResponse) {
                        stopButton.classList.remove('hidden');
                    }
                }, 500);
                
                // Race the response against the timeout
                const response = await Promise.race([responsePromise, timeoutPromise]);
                
                // Process each part of the streaming response
                let fullResponse = '';
                let firstChunkReceived = false;
                let streamStartTime = 0;
                
                for await (const part of response) {
                    if (!firstChunkReceived) {
                        firstChunkReceived = true;
                        streamStartTime = Date.now();
                        // Remove the stop button if the response is very fast
                        if (Date.now() - requestStartTime < 1000) {
                            stopButton.classList.add('hidden');
                        }
                    }
                    
                    if (part && part.text) {
                        fullResponse += part.text;
                        messageParagraph.textContent = fullResponse;
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                }
                
                // Hide stop button once generation is complete
                stopButton.classList.add('hidden');
                
                // Show copy button
                copyButton.classList.remove('hidden');
                
                // Show regenerate button and feedback buttons
                regenerateButton.classList.remove('hidden');
                feedbackWrapper.classList.remove('hidden');
                
                // Calculate and display response time
                const responseTime = (Date.now() - requestStartTime) / 1000;
                const streamingTime = firstChunkReceived ? (Date.now() - streamStartTime) / 1000 : 0;
                responseTimeEl.textContent = `Response: ${responseTime.toFixed(1)}s · Streaming: ${streamingTime.toFixed(1)}s`;
                responseTimeEl.classList.remove('hidden');
                
                // Update metrics
                updateModelMetrics(modelToUse, responseTime);
                
                // Clear current response reference
                currentStreamingResponse = null;
                
                // Add to cache
                addToResponseCache(prompt, modelToUse, fullResponse);
                
                // If we got an empty response, throw an error
                if (!fullResponse.trim()) {
                    throw new Error(`Received empty response from ${formatModelName(modelToUse)}. This model might be temporarily unavailable.`);
                }
            } catch (streamError) {
                console.warn("Streaming failed, trying non-streaming approach:", streamError);
                
                // Hide stop button if there was an error
                stopButton.classList.add('hidden');
                
                // If we aborted, don't continue with fallback
                if (streamError.name === 'AbortError') {
                    responseTimeEl.textContent = 'Generation stopped after ' + 
                        ((Date.now() - requestStartTime) / 1000).toFixed(1) + 's';
                    responseTimeEl.classList.remove('hidden');
                    return;
                }
                
                // Fallback to non-streaming approach
                try {
                    // Add performance mode options
                    const options = {
                        model: modelToUse,
                        stream: false
                    };
                    
                    if (performanceMode) {
                        options.temperature = 0.3;
                        options.max_tokens = 1024;
                    } else if (thinkingMode) {
                        options.temperature = 0.7; // Higher temperature for more creative, diverse responses
                        options.max_tokens = 2500; // Reduced token limit to prevent errors with Claude models
                        options.top_p = 0.95; // More diverse token selection
                    }
                    
                    const nonStreamPromise = puter.ai.chat(prompt, options);
                    
                    // Race against timeout
                    const nonStreamResponse = await Promise.race([nonStreamPromise, timeoutPromise]);
                    
                    if (nonStreamResponse && nonStreamResponse.message && 
                        nonStreamResponse.message.content && 
                        nonStreamResponse.message.content.length > 0 && 
                        nonStreamResponse.message.content[0].text) {
                        
                        const responseText = nonStreamResponse.message.content[0].text;
                        messageParagraph.textContent = responseText;
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                        
                        // Show copy button
                        copyButton.classList.remove('hidden');
                        
                        // Show regenerate button and feedback buttons
                        regenerateButton.classList.remove('hidden');
                        feedbackWrapper.classList.remove('hidden');
                        
                        // Calculate and display response time
                        const responseTime = (Date.now() - requestStartTime) / 1000;
                        responseTimeEl.textContent = `Response time: ${responseTime.toFixed(1)}s`;
                        responseTimeEl.classList.remove('hidden');
                        
                        // Update metrics
                        updateModelMetrics(modelToUse, responseTime);
                        
                        // Add to cache
                        addToResponseCache(prompt, modelToUse, responseText);
                    } else {
                        throw new Error("Invalid response format from " + formatModelName(modelToUse));
                    }
                } catch (nonStreamError) {
                    // If both streaming and non-streaming failed, throw a more detailed error
                    const errorMsg = nonStreamError.message || "Unknown error";
                    throw new Error(`${formatModelName(modelToUse)} response failed: ${errorMsg}`);
                }
            }
        } catch (error) {
            console.error("AI response error:", error);
            throw error;
        }
    }
    
    // Process GPT-4o Vision requests with metrics
    async function processVisionRequest(prompt, imageUrl, typingIndicatorId) {
        const startTime = Date.now();
        try {
            // Create a div for the assistant's message
            const assistantMessageWrapper = document.createElement('div');
            assistantMessageWrapper.className = 'flex items-start';
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-2 mr-3';
            
            const avatarIcon = document.createElement('i');
            avatarIcon.className = 'fas fa-robot text-white';
            avatarDiv.appendChild(avatarIcon);
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-gray-200 rounded-lg p-3 max-w-3xl';
            
            const messageParagraph = document.createElement('p');
            messageParagraph.className = 'text-gray-800';
            messageDiv.appendChild(messageParagraph);
            
            assistantMessageWrapper.appendChild(avatarDiv);
            assistantMessageWrapper.appendChild(messageDiv);
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicatorId);
            
            // Add the message wrapper to the chat
            chatMessages.appendChild(assistantMessageWrapper);
            
            // Timeout for the request
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Vision request timed out.")), 30000);
            });
            
            try {
                const visionPromise = puter.ai.chat(prompt, imageUrl);
                const visionResponse = await Promise.race([visionPromise, timeoutPromise]);
                
                if (visionResponse && visionResponse.message && 
                    visionResponse.message.content && 
                    visionResponse.message.content.length > 0 && 
                    visionResponse.message.content[0].text) {
                    
                    messageParagraph.textContent = visionResponse.message.content[0].text;
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    
                    // Calculate and display response time
                    const responseTime = (Date.now() - startTime) / 1000;
                    const responseTimeEl = document.createElement('div');
                    responseTimeEl.className = 'text-xs text-gray-500 mt-2';
                    responseTimeEl.textContent = `Response time: ${responseTime.toFixed(1)}s`;
                    messageDiv.appendChild(responseTimeEl);
                    
                    // Update metrics
                    updateModelMetrics('gpt-4o-vision', responseTime);
                } else {
                    throw new Error("Invalid response format from GPT-4o Vision");
                }
            } catch (error) {
                console.error("Vision request error:", error);
                throw error;
            }
        } catch (error) {
            console.error("Vision processing error:", error);
            throw error;
        }
    }
    
    // Process DALL-E image generation with metrics
    async function processImageGeneration(prompt) {
        const startTime = Date.now();
        // Add typing indicator
        const typingIndicatorId = addTypingIndicator();
        
        try {
            // Create a div for the assistant's message
            const assistantMessageWrapper = document.createElement('div');
            assistantMessageWrapper.className = 'flex items-start';
            
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-2 mr-3';
            
            const avatarIcon = document.createElement('i');
            avatarIcon.className = 'fas fa-robot text-white';
            avatarDiv.appendChild(avatarIcon);
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bg-gray-200 rounded-lg p-3 max-w-3xl';
            
            // Remove typing indicator
            removeTypingIndicator(typingIndicatorId);
            
            // Add a waiting message
            const waitingParagraph = document.createElement('p');
            waitingParagraph.className = 'text-gray-800 mb-3';
            waitingParagraph.textContent = 'Generating image...';
            messageDiv.appendChild(waitingParagraph);
            
            assistantMessageWrapper.appendChild(avatarDiv);
            assistantMessageWrapper.appendChild(messageDiv);
            
            // Add the message wrapper to the chat
            chatMessages.appendChild(assistantMessageWrapper);
            
            // Timeout for the request
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Image generation timed out.")), 60000); // Longer timeout for image generation
            });
            
            try {
                const imagePromise = puter.ai.txt2img(prompt);
                const imageElement = await Promise.race([imagePromise, timeoutPromise]);
                
                if (imageElement) {
                    // Remove the waiting message
                    waitingParagraph.remove();
                    
                    // Style the image
                    imageElement.className = 'rounded-lg max-w-full max-h-80 mt-2';
                    imageElement.style.maxWidth = '100%';
                    
                    // Add image description
                    const descriptionParagraph = document.createElement('p');
                    descriptionParagraph.className = 'text-gray-800 mb-2';
                    descriptionParagraph.textContent = 'Generated image based on: "' + prompt + '"';
                    messageDiv.appendChild(descriptionParagraph);
                    
                    // Add the image to the message
                    messageDiv.appendChild(imageElement);
                    
                    // Calculate and display response time
                    const responseTime = (Date.now() - startTime) / 1000;
                    const responseTimeEl = document.createElement('div');
                    responseTimeEl.className = 'text-xs text-gray-500 mt-2';
                    responseTimeEl.textContent = `Generation time: ${responseTime.toFixed(1)}s`;
                    messageDiv.appendChild(responseTimeEl);
                    
                    // Update metrics
                    updateModelMetrics('dall-e-3', responseTime);
                    
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                } else {
                    throw new Error("Failed to generate image");
                }
            } catch (error) {
                messageDiv.innerHTML = `
                    <p class="text-red-600">Error generating image: ${error.message || 'Unknown error'}</p>
                    <p class="text-gray-700 mt-2">Try a different prompt or select another model.</p>
                `;
                console.error("Image generation error:", error);
            }
            
            // Save to history after image generation
            saveChatToHistory();
            
        } catch (error) {
            removeTypingIndicator(typingIndicatorId);
            addSystemMessage(`Error generating image: ${error.message || 'Unknown error'}`, true);
            console.error("Image processing error:", error);
        }
    }
    
    // Image upload functionality
    if (imageUploadBtn && imageUploadInput) {
        // Show image upload when GPT-4o Vision is selected
        modelSelector.addEventListener('change', function() {
            if (modelSelector.value === 'gpt-4o-vision') {
                imageUploadContainer.style.display = 'flex';
            } else {
                imageUploadContainer.style.display = 'none';
            }
        });
        
        // Initial check
        if (modelSelector.value === 'gpt-4o-vision') {
            imageUploadContainer.style.display = 'flex';
        }
        
        // Trigger file input when button is clicked
        imageUploadBtn.addEventListener('click', function() {
            imageUploadInput.click();
        });
        
        // Handle file selection
        imageUploadInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        // Store image data for upload
                        currentUploadedImageData = event.target.result;
                        
                        // For GPT-4o Vision, we need to create a blob URL
                        const blob = dataURItoBlob(currentUploadedImageData);
                        currentUploadedImageUrl = URL.createObjectURL(blob);
                        
                        // Show preview
                        imagePreview.src = currentUploadedImageData;
                        imagePreviewContainer.classList.remove('hidden');
                        imagePreviewContainer.classList.add('flex');
                    };
                    
                    reader.readAsDataURL(file);
                } else {
                    addSystemMessage('Please select a valid image file.', true);
                }
            }
        });
        
        // Handle image removal
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', function() {
                resetImageUpload();
            });
        }
    }
    
    // Reset image upload
    function resetImageUpload() {
        if (imageUploadInput) {
            imageUploadInput.value = '';
            
            if (currentUploadedImageUrl) {
                URL.revokeObjectURL(currentUploadedImageUrl);
            }
            
            currentUploadedImageData = null;
            currentUploadedImageUrl = null;
            
            if (imagePreviewContainer) {
                imagePreviewContainer.classList.add('hidden');
                imagePreviewContainer.classList.remove('flex');
            }
        }
    }
    
    // Convert data URI to Blob
    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ab], { type: mimeString });
    }

    // Function to add a typing indicator to the chat
    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingWrapper = document.createElement('div');
        typingWrapper.className = 'flex items-start';
        typingWrapper.id = id;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-2 mr-3';
        
        const avatarIcon = document.createElement('i');
        avatarIcon.className = 'fas fa-robot text-white';
        avatarDiv.appendChild(avatarIcon);
        
        const typingDiv = document.createElement('div');
        
        // Use different UI based on whether we want skeleton or traditional typing indicator
        const useSkeletonUI = true; // Set to false to use traditional typing dots
        
        if (useSkeletonUI) {
            // Skeleton loading UI
            typingDiv.className = 'bg-gray-200 rounded-lg p-3 max-w-3xl dark:bg-gray-700 w-full';
            
            // Message skeleton
            const skeletonLines = document.createElement('div');
            skeletonLines.className = 'space-y-2';
            
            // Create 3-5 skeleton lines depending on the mode
            const lineCount = thinkingMode ? 5 : (performanceMode ? 2 : 3);
            
            for (let i = 0; i < lineCount; i++) {
                const lineWidth = i === lineCount - 1 ? 
                    (Math.random() * 50 + 20) + '%' : // Last line is shorter
                    (Math.random() * 30 + 70) + '%'; // Other lines are longer
                
                const skeletonLine = document.createElement('div');
                skeletonLine.className = 'h-4 bg-gray-300 rounded loading-shimmer dark:bg-gray-600';
                skeletonLine.style.width = lineWidth;
                skeletonLines.appendChild(skeletonLine);
            }
            
            // Status text below skeleton
            const statusText = document.createElement('div');
            statusText.className = 'text-xs text-gray-500 mt-2 dark:text-gray-400';
            
            // Show different message based on mode
            const model = formatModelName(getCurrentModel());
            statusText.textContent = performanceMode ? 
                `${model} is responding (speed mode)` : 
                (thinkingMode ? `${model} is analyzing (thinking mode)` : `${model} is thinking`);
            
            typingDiv.appendChild(skeletonLines);
            typingDiv.appendChild(statusText);
        } else {
            // Traditional typing indicator with dots
            typingDiv.className = 'bg-gray-200 rounded-lg p-3 dark:bg-gray-700 animate-pulse';
            
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'flex items-center';
            
            const statusText = document.createElement('span');
            statusText.className = 'text-xs text-gray-600 mr-2 dark:text-gray-300';
            
            // Show different message based on performance mode
            const model = formatModelName(getCurrentModel());
            statusText.textContent = performanceMode ? 
                `${model} is responding (speed mode)` : 
                (thinkingMode ? `${model} is analyzing (thinking mode)` : `${model} is thinking`);
                
            typingIndicator.appendChild(statusText);
            
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'typing-indicator';
            
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('span');
                dotsContainer.appendChild(dot);
            }
            
            typingIndicator.appendChild(dotsContainer);
            typingDiv.appendChild(typingIndicator);
        }
        
        typingWrapper.appendChild(avatarDiv);
        typingWrapper.appendChild(typingDiv);
        
        chatMessages.appendChild(typingWrapper);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Start progress animation - optimized to use fewer setInterval calls
        let progress = 0;
        let speed = performanceMode ? 100 : (thinkingMode ? 500 : 300); // Adjust speed based on mode
        
        const progressInterval = setInterval(() => {
            progress += 1;
            if (progress > 100) {
                clearInterval(progressInterval);
                return;
            }
            
            const el = document.getElementById(id);
            if (el) {
                const statusTextEl = useSkeletonUI ? 
                    el.querySelector('.text-gray-500') : 
                    el.querySelector('span');
                    
                if (statusTextEl) {
                    const model = formatModelName(getCurrentModel());
                    statusTextEl.textContent = performanceMode ? 
                        `${model} is responding (${progress}%)` : 
                        (thinkingMode ? `${model} is analyzing (${progress}%)` : `${model} is thinking (${progress}%)`);
                }
            } else {
                clearInterval(progressInterval);
            }
        }, speed);
        
        // Store the interval ID with the element
        typingWrapper.dataset.progressInterval = progressInterval;
        
        return id;
    }

    // Enhanced function to remove typing indicator
    function removeTypingIndicator(id) {
        const typingIndicator = document.getElementById(id);
        if (typingIndicator) {
            // Clear the progress interval if it exists
            if (typingIndicator.dataset.progressInterval) {
                clearInterval(parseInt(typingIndicator.dataset.progressInterval));
            }
            typingIndicator.remove();
        }
    }

    // Function to add a user message to the chat
    function addUserMessage(message) {
        const userMessageWrapper = document.createElement('div');
        userMessageWrapper.className = 'flex items-start justify-end';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg p-3 max-w-3xl';
        
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        messageDiv.appendChild(messageParagraph);
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'flex-shrink-0 bg-gray-300 rounded-full p-2 ml-3 dark:bg-gray-600';
        
        const avatarIcon = document.createElement('i');
        avatarIcon.className = 'fas fa-user text-gray-600 dark:text-gray-300';
        avatarDiv.appendChild(avatarIcon);
        
        userMessageWrapper.appendChild(messageDiv);
        userMessageWrapper.appendChild(avatarDiv);
        
        chatMessages.appendChild(userMessageWrapper);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Enhanced system message function with dark mode support
    function addSystemMessage(message, isError = false, addRetryButton = false, id = null, retryMessage = null) {
        const systemMessageWrapper = document.createElement('div');
        systemMessageWrapper.className = 'flex items-center justify-center';
        if (id) systemMessageWrapper.id = id;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = isError 
            ? 'bg-red-100 text-red-800 rounded-lg p-2 max-w-3xl text-center border border-red-200 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300 dark:border-red-800'
            : 'bg-yellow-100 text-yellow-800 rounded-lg p-2 max-w-3xl text-center border border-yellow-200 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-300 dark:border-yellow-800';
        
        const messageParagraph = document.createElement('p');
        messageParagraph.className = 'text-sm';
        messageParagraph.textContent = message;
        messageDiv.appendChild(messageParagraph);
        
        systemMessageWrapper.appendChild(messageDiv);
        
        // Add retry button if needed
        if (addRetryButton && (retryMessage || message.includes("Failed to get response"))) {
            const retryButton = document.createElement('button');
            retryButton.className = 'ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:opacity-90 transition-opacity';
            retryButton.textContent = 'Retry';
            
            retryButton.addEventListener('click', function() {
                // Remove the error message
                systemMessageWrapper.remove();
                
                // If we have a retry message, use it
                if (retryMessage) {
                    // Add typing indicator
                    const typingIndicatorId = addTypingIndicator();
                    
                    // Try again with the saved message
                    processMessageWithRetries(retryMessage, 0);
                } else {
                    // Otherwise try to get the last user message
                    const userMessages = Array.from(chatMessages.querySelectorAll('.flex.items-start.justify-end'));
                    if (userMessages.length > 0) {
                        const lastUserMessage = userMessages[userMessages.length - 1];
                        const messageParagraph = lastUserMessage.querySelector('p');
                        if (messageParagraph) {
                            const lastMessage = messageParagraph.textContent;
                            
                            // Process with retries
                            processMessageWithRetries(lastMessage, 0);
                        }
                    }
                }
            });
            
            systemMessageWrapper.appendChild(retryButton);
        }
        
        // For popup warnings, add a "Check How" button
        if (id === 'popup-warning') {
            const helpButton = document.createElement('button');
            helpButton.className = 'ml-2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors';
            helpButton.textContent = 'How to Fix';
            
            helpButton.addEventListener('click', function() {
                const browserName = detectBrowser();
                showPopupHelp(browserName);
            });
            
            systemMessageWrapper.appendChild(helpButton);
        }
        
        chatMessages.appendChild(systemMessageWrapper);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Show browser-specific popup help
    function showPopupHelp(browser) {
        let helpMessage = "To allow pop-ups for this site:\n\n";
        
        switch(browser) {
            case 'Chrome':
                helpMessage += "1. Look for the pop-up blocker icon (🚫) in the address bar\n";
                helpMessage += "2. Click it and select 'Always allow pop-ups from this site'\n";
                helpMessage += "3. Click 'Done' and refresh the page";
                break;
            case 'Firefox':
                helpMessage += "1. Look for the pop-up blocker icon in the address bar\n";
                helpMessage += "2. Click it and select 'Allow pop-ups for this site'\n";
                helpMessage += "3. Refresh the page";
                break;
            case 'Safari':
                helpMessage += "1. Go to Safari > Preferences > Websites > Pop-up Windows\n";
                helpMessage += "2. Find this website and select 'Allow'\n";
                helpMessage += "3. Refresh the page";
                break;
            case 'Edge':
                helpMessage += "1. Look for the pop-up blocker icon in the address bar\n";
                helpMessage += "2. Click it and select 'Always allow pop-ups from this site'\n";
                helpMessage += "3. Click 'Done' and refresh the page";
                break;
            default:
                helpMessage += "Look for pop-up blocker settings in your browser and add this site to the allowed list.\n";
                helpMessage += "After changing the settings, refresh the page.";
        }
        
        alert(helpMessage);
    }
    
    // Detect which browser the user is using
    function detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } else if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox";
        } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
            return "Edge";
        } else {
            return "Other";
        }
    }

    // Function to enhance model selector with performance metrics
    function updateModelSelectionUI() {
        if (!modelSelector) return;
        
        // Get all options
        const options = Array.from(modelSelector.querySelectorAll('option'));
        
        options.forEach(option => {
            const model = option.value;
            const metrics = modelPerformanceMetrics[model];

            if (metrics) {
                // Format option text to include metrics
                const baseName = formatModelName(model);
                const avgTime = metrics.avgResponseTime.toFixed(1);
                
                // Style by response time - under 3s is fast, 3-6s is medium, over 6s is slow
                let speedIndicator = '';
                
                if (metrics.avgResponseTime < 3) {
                    speedIndicator = '⚡ '; // Fast
                } else if (metrics.avgResponseTime < 6) {
                    speedIndicator = '⏱️ '; // Medium
                } else {
                    speedIndicator = '🐢 '; // Slow
                }
                
                
                // Update option text with performance data
                const description = option.textContent.split(' - ')[1] || '';
                option.textContent = `${speedIndicator}${baseName} - ${description} (avg: ${avgTime}s)`;

                // Add tooltip
                const capabilities = getModelCapabilities(model);
                const truncatedDescription = description.length > 50 ? description.substring(0, 50) + '...' : description;
                let truncatedCapabilities = capabilities.slice(0, 3).map(cap => cap.name).join(', ');
                if (capabilities.length > 3) {
                    truncatedCapabilities += '...';
                }
                const tooltipText = `${truncatedDescription} Average response time: ${avgTime}s Capabilities: ${truncatedCapabilities}`;
                option.title = tooltipText;
            }
        });
    }
    // Initialize model selection UI with any existing metrics
    updateModelSelectionUI();

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Cmd/Ctrl + Enter to submit
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            if (chatForm) chatForm.dispatchEvent(new Event('submit'));
        }
        
        // Escape to close any panels
        if (event.key === 'Escape') {
            if (historyPanel && historyPanel.classList.contains('active')) {
                historyPanel.classList.remove('active');
            }
            if (popupHelper && popupHelper.classList.contains('active')) {
                popupHelper.classList.remove('active');
            }
        }
        
        // Cmd/Ctrl + / to show keyboard shortcuts
        if ((event.metaKey || event.ctrlKey) && event.key === '/') {
            event.preventDefault();
            showKeyboardShortcuts();
        }
        
        // Cmd/Ctrl + N for new chat
        if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
            event.preventDefault();
            startNewChat();
        }
        
        // Cmd/Ctrl + H to toggle history panel
        if ((event.metaKey || event.ctrlKey) && event.key === 'h') {
            event.preventDefault();
            if (historyPanel) {
                historyPanel.classList.toggle('active');
                if (historyPanel.classList.contains('active')) {
                    renderChatHistory();
                }
            }
        }
        
        // Cmd/Ctrl + S to stop generation
        if ((event.metaKey || event.ctrlKey) && event.key === 's') {
            event.preventDefault();
            stopGeneration();
        }
    });
    
    // Function to show keyboard shortcuts modal
    function showKeyboardShortcuts() {
        // Check if modal already exists
        let shortcutsModal = document.getElementById('shortcuts-modal');
        
        if (!shortcutsModal) {
            // Create the modal element
            shortcutsModal = document.createElement('div');
            shortcutsModal.id = 'shortcuts-modal';
            shortcutsModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto';
            
            modalContent.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-gray-900">Keyboard Shortcuts</h3>
                    <button id="close-shortcuts" class="text-gray-400 hover:text-gray-500">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-700">Send message</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Ctrl/Cmd + Enter</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">New chat</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Ctrl/Cmd + N</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">Toggle history</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Ctrl/Cmd + H</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">Stop generation</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Ctrl/Cmd + S</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">Show this dialog</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Ctrl/Cmd + /</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-700">Close panels/dialogs</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Esc</span>
                    </div>
                </div>
            `;
            
            shortcutsModal.appendChild(modalContent);
            document.body.appendChild(shortcutsModal);
            
            // Close button event
            document.getElementById('close-shortcuts').addEventListener('click', function() {
                shortcutsModal.remove();
            });
            
            // Click outside to close
            shortcutsModal.addEventListener('click', function(e) {
                if (e.target === shortcutsModal) {
                    shortcutsModal.remove();
                }
            });
        } else {
            // Remove existing modal
            shortcutsModal.remove();
        }
    }
    
    // Add keyboard shortcut hint to UI
    const keyboardHintEl = document.createElement('div');
    keyboardHintEl.className = 'text-center mt-2 text-xs text-gray-500';
    keyboardHintEl.innerHTML = 'Pro tip: Press <span class="bg-gray-200 px-1 rounded">Ctrl/⌘ + /</span> for keyboard shortcuts';
    document.querySelector('.container').appendChild(keyboardHintEl);
    
    // Enhance user input with better responsiveness
    if (userInput) {
        // Auto-resize input field
        userInput.addEventListener('input', function() {
            // Reset height to ensure proper calculation
            this.style.height = 'auto';
            
            // Calculate new height based on scrollHeight (with max height)
            const newHeight = Math.min(this.scrollHeight, 150);
            this.style.height = newHeight + 'px';
            
            // Adjust chat container height
            if (chatContainer) {
                const baseHeight = consentBanner && consentBanner.style.display !== 'none' ? 230 : 180;
                const extraHeight = newHeight - 41; // 41px is the default input height
                chatContainer.style.height = `calc(100vh - ${baseHeight + extraHeight}px)`;
            }
        });
        
        // Add placeholder animation
        let placeholders = [
            "Ask me anything...",
            "What can I help you with?",
            "Type your message here...",
            "Try 'Explain quantum computing'",
            "Ask 'What's the best way to learn JavaScript?'",
            "Try 'Write a poem about AI'",
            "Ask 'How do I improve my website performance?'"
        ];
        
        let currentPlaceholder = 0;
        setInterval(() => {
            if (document.activeElement !== userInput) { // Only change if not focused
                currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
                userInput.setAttribute('placeholder', placeholders[currentPlaceholder]);
            }
        }, 5000);
    }
    
    // Add model info button to show capabilities 
    const modelInfoBtn = document.createElement('button');
    modelInfoBtn.className = 'ml-2 bg-white bg-opacity-20 rounded p-2 hover:bg-opacity-30 transition-colors';
    modelInfoBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
    modelInfoBtn.title = 'Model information';
    modelInfoBtn.setAttribute('aria-label', 'Show model information');
    
    // Insert before the model selector
    if (modelSelector && modelSelector.parentNode) {
        modelSelector.parentNode.insertBefore(modelInfoBtn, modelSelector);
    }
    
    // Model info click handler
    modelInfoBtn.addEventListener('click', function() {
        const currentModel = getCurrentModel();
        showModelInfo(currentModel);
    });
    
    // Function to show model capabilities and info
    function showModelInfo(modelId) {
        const modelName = formatModelName(modelId);
        
        // Get model capabilities
        const capabilities = getModelCapabilities(modelId);
        
        // Create modal
        const infoModal = document.createElement('div');
        infoModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto';
        
        // Get performance metrics
        const metrics = modelPerformanceMetrics[modelId] || { avgResponseTime: 'Unknown', responseCount: 0 };
        const avgResponseTime = typeof metrics.avgResponseTime === 'number' ? 
            `${metrics.avgResponseTime.toFixed(1)}s` : metrics.avgResponseTime;
        
        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900">${modelName}</h3>
                <button id="close-model-info" class="text-gray-400 hover:text-gray-500">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-4">
                <div class="text-sm font-medium text-gray-500 mb-1">Performance</div>
                <div class="flex items-center mb-2">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-purple-600 h-2 rounded-full" style="width: ${getPerformanceWidth(metrics.avgResponseTime)}%"></div>
                    </div>
                </div>
                <div class="flex justify-between text-xs text-gray-600">
                    <span>Average response time: ${avgResponseTime}</span>
                    <span>Used ${metrics.responseCount} times</span>
                </div>
            </div>
            <div class="space-y-3">
                <div class="text-sm font-medium text-gray-500">Capabilities</div>
                ${capabilities.map(cap => `
                    <div class="flex items-start">
                        <div class="text-${cap.color}-500 mr-2"><i class="fas fa-${cap.icon}"></i></div>
                        <div>
                            <div class="font-medium">${cap.name}</div>
                            <div class="text-sm text-gray-600">${cap.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        infoModal.appendChild(modalContent);
        document.body.appendChild(infoModal);
        
        // Close button event
        document.getElementById('close-model-info').addEventListener('click', function() {
            infoModal.remove();
        });
        
        // Click outside to close
        infoModal.addEventListener('click', function(e) {
            if (e.target === infoModal) {
                infoModal.remove();
            }
        });
    }
    
    // Calculate performance width percentage for progress bar
    function getPerformanceWidth(avgTime) {
        if (typeof avgTime !== 'number') return 50; // Default middle value
        
        // Convert response time to a percentage value (1s = 100%, 10s+ = 0%)
        const percentage = Math.max(0, 100 - (avgTime * 10));
        return percentage;
    }
    
    // Get model capabilities
    function getModelCapabilities(modelId) {
        const baseCapabilities = [
            {
                name: "Text Generation", 
                description: "Generate coherent and contextually relevant text responses.",
                icon: "comment",
                color: "blue"
            }
        ];
        
        if (modelId === 'gpt-4o-vision') {
            return [
                ...baseCapabilities,
                {
                    name: "Image Analysis", 
                    description: "Analyze and describe the content of images in detail.",
                    icon: "image",
                    color: "green"
                }
            ];
        } else if (modelId === 'dall-e-3') {
            return [
                {
                    name: "Image Generation", 
                    description: "Create detailed, high-quality images from text descriptions.",
                    icon: "palette",
                    color: "purple"
                }
            ];
        } else if (modelId.includes('claude-3-opus')) {
            return [
                ...baseCapabilities,
                {
                    name: "Advanced Reasoning", 
                    description: "Superior reasoning capabilities for complex problems.",
                    icon: "brain",
                    color: "indigo"
                },
                {
                    name: "Detailed Responses", 
                    description: "Provides comprehensive and nuanced responses.",
                    icon: "file-alt",
                    color: "teal"
                }
            ];
        } else if (modelId === 'deepseek-reasoner') {
            return [
                ...baseCapabilities,
                {
                    name: "Problem Solving", 
                    description: "Specialized in mathematical and logical reasoning tasks.",
                    icon: "calculator",
                    color: "red"
                }
            ];
        }
        
        // Default capabilities
        return baseCapabilities;
    }

    // UI enhancement elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const performanceModeToggle = document.getElementById('performance-mode');
    const usageCounter = document.getElementById('usage-counter');
    
    // Track request count
    let requestCount = localStorage.getItem('ai_request_count') || 0;
    
    // Initialize request counter
    updateRequestCounter();
    
    // Performance mode state
    let performanceMode = localStorage.getItem('performance_mode') === 'true';
    
    // Thinking mode state
    let thinkingMode = localStorage.getItem('thinking_mode') === 'true';
    
    // Initialize performance mode
    if (performanceModeToggle) {
        performanceModeToggle.checked = performanceMode;
        performanceModeToggle.addEventListener('change', function() {
            performanceMode = performanceModeToggle.checked;
            localStorage.setItem('performance_mode', performanceMode);
            
            // If thinking mode is on, turn it off (they're mutually exclusive)
            if (performanceMode && thinkingMode) {
                thinkingMode = false;
                if (thinkingModeToggle) {
                    thinkingModeToggle.checked = false;
                    localStorage.setItem('thinking_mode', 'false');
                }
            }
            
            // Show feedback about the mode change
            const modeMessage = performanceMode ? 
                "Speed mode enabled. Responses will prioritize speed over detail." : 
                "Speed mode disabled. Responses will return to normal detail level.";
            
            addSystemMessage(modeMessage);
        });
    }
    
    // Initialize thinking mode
    const thinkingModeToggle = document.getElementById('thinking-mode');
    if (thinkingModeToggle) {
        thinkingModeToggle.checked = thinkingMode;
        thinkingModeToggle.addEventListener('change', function() {
            thinkingMode = thinkingModeToggle.checked;
            localStorage.setItem('thinking_mode', thinkingMode);
            
            // If performance mode is on, turn it off (they're mutually exclusive)
            if (thinkingMode && performanceMode) {
                performanceMode = false;
                if (performanceModeToggle) {
                    performanceModeToggle.checked = false;
                    localStorage.setItem('performance_mode', 'false');
                }
            }
            
            // Show feedback about the mode change
            const modeMessage = thinkingMode ? 
                "Thinking & Reasoning mode enabled. Responses will include deeper analysis, step-by-step reasoning, and detailed explanations. Note that responses may take longer but will be more thorough." : 
                "Thinking & Reasoning mode disabled. Responses will return to normal detail level.";
            
            addSystemMessage(modeMessage);
        });
    }
    
    // Initialize dark mode
    if (darkModeToggle) {
        // Check system preference and localStorage
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const userPreference = localStorage.getItem('dark_mode');
        
        // Apply dark mode if user preference exists, otherwise use system preference
        const shouldUseDarkMode = userPreference !== null ? userPreference === 'true' : prefersDark;
        
        if (shouldUseDarkMode) {
            document.documentElement.classList.add('dark');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.classList.remove('dark');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Toggle dark mode on click
        darkModeToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            
            // Update icon
            darkModeToggle.innerHTML = isDark ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
            
            // Save preference
            localStorage.setItem('dark_mode', isDark.toString());
        });
    }
    
    // Function to update request counter
    function updateRequestCounter() {
        if (usageCounter) {
            usageCounter.textContent = `Requests: ${requestCount}`;
        }
    }
    
    // Function to increment request counter
    function incrementRequestCounter() {
        requestCount++;
        localStorage.setItem('ai_request_count', requestCount);
        updateRequestCounter();
    }

    // Add a welcome message about the performance and dark mode features
    if (localStorage.getItem('features_welcome') !== 'true') {
        setTimeout(() => {
            addSystemMessage('🚀 New features: Dark mode, Speed mode, Thinking & Reasoning mode, and response caching for better answers! Use the toggles in the top-right corner.');
            localStorage.setItem('features_welcome', 'true');
        }, 1000);
    }

    // Add CSS for the animations
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        /* Response animations based on mode */
        .thinking-animation {
            transition: all 0.5s ease;
            border-left-width: 4px;
        }
        .speed-animation {
            transition: all 0.2s ease;
            border-left-width: 4px;
        }
        .standard-animation {
            transition: all 0.3s ease;
            border-left-width: 4px;
        }
        
        /* Font styling for models */
        .claude-font {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
        }
        .gpt-font {
            font-family: 'SF Pro Display', Arial, sans-serif;
            line-height: 1.5;
        }
        .gemini-font {
            font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
            line-height: 1.7;
        }
        
        /* Model-specific styles */
        .claude-style {
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
        }
        .claude-style code {
            background-color: rgba(124, 58, 237, 0.05);
        }
        
        .gpt-style {
            box-shadow: 0 2px 8px rgba(5, 150, 105, 0.1);
        }
        .gpt-style code {
            background-color: rgba(5, 150, 105, 0.05);
        }
        
        .gemini-style {
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
        }
        .gemini-style code {
            background-color: rgba(37, 99, 235, 0.05);
        }
        
        .deepseek-style {
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
        }
        .deepseek-style code {
            background-color: rgba(245, 158, 11, 0.05);
        }
        
        /* Dark mode adjustments */
        html.dark .claude-style {
            box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
        }
        html.dark .claude-style code {
            background-color: rgba(124, 58, 237, 0.1);
        }
        
        html.dark .gpt-style {
            box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
        }
        html.dark .gpt-style code {
            background-color: rgba(5, 150, 105, 0.1);
        }
        
        html.dark .gemini-style {
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
        }
        html.dark .gemini-style code {
            background-color: rgba(37, 99, 235, 0.1);
        }
        
        html.dark .deepseek-style {
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
        }
        html.dark .deepseek-style code {
            background-color: rgba(245, 158, 11, 0.1);
        }
        
        /* Speed mode indicator animation */
        @keyframes speedPulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }
        
        /* Thinking mode indicator animation */
        @keyframes thinkingPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .fa-bolt {
            animation: speedPulse 1.5s infinite;
            color: #10b981;
        }
        
        .fa-brain {
            animation: thinkingPulse 2s infinite;
            color: #8b5cf6;
        }
    `;
    document.head.appendChild(styleEl);
}); 