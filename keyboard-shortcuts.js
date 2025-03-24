/**
 * Keyboard Shortcuts Manager
 * Handles all keyboard shortcuts and related UI for the AI Chat application
 */

class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = [
            { key: 'Enter', modifiers: ['ctrl', 'meta'], description: 'Send message', action: this.submitForm },
            { key: 'n', modifiers: ['ctrl', 'meta'], description: 'New chat', action: this.newChat },
            { key: 'h', modifiers: ['ctrl', 'meta'], description: 'Toggle history panel', action: this.toggleHistory },
            { key: 's', modifiers: ['ctrl', 'meta'], description: 'Stop generation', action: this.stopGeneration },
            { key: '/', modifiers: ['ctrl', 'meta'], description: 'Show keyboard shortcuts', action: this.showShortcuts },
            { key: 'Escape', modifiers: [], description: 'Close panels/dialogs', action: this.closeAll },
            { key: 'ArrowUp', modifiers: ['alt'], description: 'Edit last message', action: this.editLastMessage },
            { key: 'd', modifiers: ['ctrl', 'meta'], description: 'Toggle dark mode', action: this.toggleDarkMode }
        ];
        
        this.initialize();
    }
    
    initialize() {
        // Add keyboard shortcut listener
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Add keyboard shortcuts button handler
        const shortcutsBtn = document.getElementById('keyboard-shortcuts-btn');
        if (shortcutsBtn) {
            shortcutsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showShortcuts();
            });
        }
    }
    
    handleKeyDown(event) {
        // Check if typing in an input field (but still allow some shortcuts)
        const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        const isCtrlOrMeta = event.ctrlKey || event.metaKey;
        
        // Find matching shortcuts
        for (const shortcut of this.shortcuts) {
            // Check if key matches
            if (event.key === shortcut.key) {
                // Check if required modifiers match
                const ctrlMatch = shortcut.modifiers.includes('ctrl') ? event.ctrlKey : true;
                const metaMatch = shortcut.modifiers.includes('meta') ? event.metaKey : true;
                const altMatch = shortcut.modifiers.includes('alt') ? event.altKey : true;
                const shiftMatch = shortcut.modifiers.includes('shift') ? event.shiftKey : true;
                
                // If all conditions match
                if (ctrlMatch && metaMatch && altMatch && shiftMatch) {
                    // If typing, only allow certain shortcuts to work
                    if (isTyping && !(
                        event.key === 'Enter' && isCtrlOrMeta || // Allow Ctrl+Enter when typing
                        event.key === 'Escape' || // Always allow Escape
                        event.key === '/' && isCtrlOrMeta // Allow Ctrl+/ for help
                    )) {
                        continue;
                    }
                    
                    // Prevent default behavior and execute the action
                    event.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        }
    }
    
    // Actions for shortcuts
    submitForm() {
        const chatForm = document.getElementById('chat-form');
        if (chatForm) chatForm.dispatchEvent(new Event('submit'));
    }
    
    newChat() {
        window.startNewChat?.();
    }
    
    toggleHistory() {
        const historyPanel = document.getElementById('history-panel');
        if (historyPanel) {
            historyPanel.classList.toggle('active');
            if (historyPanel.classList.contains('active')) {
                window.renderChatHistory?.();
            }
        }
    }
    
    stopGeneration() {
        window.stopGeneration?.();
    }
    
    showShortcuts() {
        this.createShortcutsModal();
    }
    
    closeAll() {
        // Close history panel if open
        const historyPanel = document.getElementById('history-panel');
        if (historyPanel && historyPanel.classList.contains('active')) {
            historyPanel.classList.remove('active');
            return;
        }
        
        // Close popup helper if open
        const popupHelper = document.getElementById('popup-helper');
        if (popupHelper && popupHelper.classList.contains('active')) {
            popupHelper.classList.remove('active');
            return;
        }
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            const mobileMenuContent = mobileMenu.querySelector('div.transform');
            if (mobileMenuContent) {
                mobileMenuContent.classList.add('translate-x-full');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300);
            }
            return;
        }
        
        // Close any modals with the class 'modal'
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        
        // Close shortcuts modal
        const shortcutsModal = document.getElementById('shortcuts-modal');
        if (shortcutsModal) {
            shortcutsModal.remove();
            return;
        }
    }
    
    editLastMessage() {
        // Find the last user message
        const userMessages = Array.from(document.querySelectorAll('.flex.items-start.justify-end'));
        if (userMessages.length > 0) {
            const lastUserMessage = userMessages[userMessages.length - 1];
            const messageParagraph = lastUserMessage.querySelector('p');
            if (messageParagraph) {
                const lastMessage = messageParagraph.textContent;
                const userInput = document.getElementById('user-input');
                if (userInput) {
                    userInput.value = lastMessage;
                    userInput.focus();
                }
            }
        }
    }
    
    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        
        // Update icon if it exists
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.innerHTML = isDark ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        }
        
        // Save preference
        localStorage.setItem('dark_mode', isDark.toString());
    }
    
    createShortcutsModal() {
        // Check if modal already exists
        let shortcutsModal = document.getElementById('shortcuts-modal');
        
        if (shortcutsModal) {
            shortcutsModal.remove();
            return;
        }
        
        // Create the modal element
        shortcutsModal = document.createElement('div');
        shortcutsModal.id = 'shortcuts-modal';
        shortcutsModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:text-white';
        
        let shortcutsList = '';
        this.shortcuts.forEach(shortcut => {
            const keys = [];
            if (shortcut.modifiers.includes('ctrl') || shortcut.modifiers.includes('meta')) {
                keys.push('<span class="text-purple-600 dark:text-purple-400">Ctrl/⌘</span>');
            }
            if (shortcut.modifiers.includes('alt')) {
                keys.push('<span class="text-purple-600 dark:text-purple-400">Alt</span>');
            }
            if (shortcut.modifiers.includes('shift')) {
                keys.push('<span class="text-purple-600 dark:text-purple-400">Shift</span>');
            }
            keys.push(`<span class="text-purple-600 dark:text-purple-400">${shortcut.key}</span>`);
            
            const keyCombo = keys.join(' + ');
            
            shortcutsList += `
                <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <span class="text-gray-700 dark:text-gray-300">${shortcut.description}</span>
                    <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm dark:bg-gray-700 dark:text-gray-300">${keyCombo}</span>
                </div>
            `;
        });
        
        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
                <button id="close-shortcuts" class="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-1">
                ${shortcutsList}
            </div>
            <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Press <span class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">Esc</span> to close this dialog
            </div>
        `;
        
        shortcutsModal.appendChild(modalContent);
        document.body.appendChild(shortcutsModal);
        
        // Close button event
        document.getElementById('close-shortcuts').addEventListener('click', () => {
            shortcutsModal.remove();
        });
        
        // Click outside to close
        shortcutsModal.addEventListener('click', (e) => {
            if (e.target === shortcutsModal) {
                shortcutsModal.remove();
            }
        });
    }
}

// Initialize the keyboard shortcuts manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.keyboardShortcuts = new KeyboardShortcutsManager();
});

// Expose the shortcuts manager globally so it can be accessed from app.js
window.KeyboardShortcutsManager = KeyboardShortcutsManager;

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Search messages (Ctrl/Cmd + F)
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchToggle = document.querySelector('#search-toggle');
        const searchContainer = document.querySelector('#message-search');
        const searchInput = searchContainer?.querySelector('input');
        
        if (searchToggle && searchContainer && searchInput) {
            searchContainer.classList.remove('hidden');
            searchInput.focus();
        }
    }
    
    // Copy message/code (Ctrl/Cmd + C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selection = window.getSelection().toString();
        if (!selection) {
            const activeElement = document.activeElement;
            const messageWrapper = activeElement.closest('.message-wrapper');
            if (messageWrapper) {
                const message = messageWrapper.querySelector('p').textContent;
                copyToClipboard(message);
                showToast('Message copied to clipboard');
            }
        }
    }
    
    // Edit message (Ctrl/Cmd + E)
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const activeElement = document.activeElement;
        const messageWrapper = activeElement.closest('.message-wrapper');
        if (messageWrapper && messageWrapper.querySelector('.message-action-btn[title="Edit message"]')) {
            toggleMessageEdit(messageWrapper);
        }
    }
    
    // Reply in thread (Ctrl/Cmd + R)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        const activeElement = document.activeElement;
        const messageWrapper = activeElement.closest('.message-wrapper');
        if (messageWrapper) {
            showThreadReply(messageWrapper);
        }
    }
    
    // Add reaction (Ctrl/Cmd + Shift + E)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        const activeElement = document.activeElement;
        const messageWrapper = activeElement.closest('.message-wrapper');
        if (messageWrapper) {
            const reactionBtn = messageWrapper.querySelector('.reaction-btn.add-reaction');
            if (reactionBtn) {
                showEmojiPicker(reactionBtn);
            }
        }
    }
    
    // Navigate search results (Up/Down arrows when search is active)
    const searchResults = document.querySelector('.search-results.active');
    if (searchResults) {
        const results = Array.from(searchResults.querySelectorAll('.search-result-item'));
        const activeResult = searchResults.querySelector('.search-result-item.active');
        let activeIndex = results.indexOf(activeResult);
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeIndex < results.length - 1) {
                results[activeIndex]?.classList.remove('active');
                results[activeIndex + 1]?.classList.add('active');
                results[activeIndex + 1]?.scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeIndex > 0) {
                results[activeIndex]?.classList.remove('active');
                results[activeIndex - 1]?.classList.add('active');
                results[activeIndex - 1]?.scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'Enter' && activeResult) {
            e.preventDefault();
            activeResult.click();
        }
    }
});
