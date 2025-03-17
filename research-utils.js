/**
 * Research Utilities for AI Chat
 * Provides citation formatting, academic search integration, and LaTeX rendering
 */

class ResearchUtilsManager {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        // Set up MathJax/KaTeX detection and rendering
        this.setupMathRendering();
        
        // Set up citation handling
        document.addEventListener('click', (e) => {
            // Handle citation clicks
            if (e.target.closest('.citation-link')) {
                const citationLink = e.target.closest('.citation-link');
                this.showCitationDetails(citationLink.dataset.citationId);
            }
        });
        
        // Set up research search integration
        const researchBtn = document.getElementById('research-search-btn');
        if (researchBtn) {
            researchBtn.addEventListener('click', () => {
                this.showResearchSearch();
            });
        }
    }
    
    /**
     * Set up math rendering with KaTeX
     */
    setupMathRendering() {
        // Create observer to auto-render math in new content
        this.mathObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            this.renderMathInElement(node);
                        }
                    });
                }
            });
        });
        
        // Start observing the chat container
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            this.mathObserver.observe(chatContainer, { childList: true, subtree: true });
        }
    }
    
    /**
     * Render math expressions in an element using KaTeX
     * @param {Element} element - The element to scan for math
     */
    renderMathInElement(element) {
        // Skip if KaTeX is not available
        if (!window.katex || !window.renderMathInElement) return;
        
        try {
            // Check if element contains math notation
            if (element.textContent.includes('$') || 
                element.innerHTML.includes('\\begin{') || 
                element.innerHTML.includes('\\[') ||
                element.innerHTML.includes('\\(')) {
                
                window.renderMathInElement(element, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '\\begin{equation}', right: '\\end{equation}', display: true},
                        {left: '\\begin{align}', right: '\\end{align}', display: true},
                        {left: '\\begin{alignat}', right: '\\end{alignat}', display: true},
                        {left: '\\begin{gather}', right: '\\end{gather}', display: true},
                        {left: '\\begin{CD}', right: '\\end{CD}', display: true}
                    ],
                    throwOnError: false,
                    trust: true,
                    strict: false
                });
            }
        } catch (error) {
            console.warn('Error rendering math:', error);
        }
    }
    
    /**
     * Process citations in an AI response
     * @param {Element} container - The container with the response
     */
    processCitations(container) {
        if (!container) return;
        
        // Find all citation formats: [1], (Author, Year), etc.
        const citationRegex = /\[(\d+)\]|\[([\w\s]+, \d{4})\]/g;
        const textNodes = this.getTextNodes(container);
        
        textNodes.forEach(node => {
            const text = node.textContent;
            let lastIndex = 0;
            let match;
            
            // Create a document fragment to hold the new content
            const fragment = document.createDocumentFragment();
            
            while ((match = citationRegex.exec(text)) !== null) {
                // Add the text before the citation
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                
                // Create the citation link
                const citationId = match[1] || match[2];
                const citationLink = document.createElement('a');
                citationLink.href = '#';
                citationLink.className = 'citation-link text-blue-600 dark:text-blue-400 hover:underline';
                citationLink.textContent = match[0];
                citationLink.dataset.citationId = citationId;
                
                fragment.appendChild(citationLink);
                lastIndex = match.index + match[0].length;
            }
            
            // Add any remaining text
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }
            
            // Replace the original text node with the fragment
            if (lastIndex > 0) {
                node.parentNode.replaceChild(fragment, node);
            }
        });
        
        // Find citation blocks
        const references = container.querySelectorAll('h2, h3, h4');
        references.forEach(heading => {
            if (heading.textContent.toLowerCase().includes('reference') || 
                heading.textContent.toLowerCase().includes('citation') ||
                heading.textContent.toLowerCase().includes('bibliograph')) {
                
                // Process the list following the heading
                let list = heading.nextElementSibling;
                if (list && (list.tagName === 'UL' || list.tagName === 'OL')) {
                    const citations = Array.from(list.children);
                    citations.forEach(citation => {
                        citation.classList.add('citation-item');
                        
                        // Try to extract an identifier from the citation
                        const idMatch = citation.textContent.match(/^\[(\d+)\]|^(\d+)\.|^([A-Za-z]+, \d{4})/);
                        if (idMatch) {
                            const id = idMatch[1] || idMatch[2] || idMatch[3];
                            citation.dataset.citationId = id;
                        }
                    });
                }
            }
        });
    }
    
    /**
     * Get all text nodes in an element
     * @param {Element} element - The element to scan for text nodes
     * @returns {Array} - Array of text nodes
     */
    getTextNodes(element) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip nodes in pre, code, and script tags
                    if (node.parentNode.nodeName === 'PRE' || 
                        node.parentNode.nodeName === 'CODE' ||
                        node.parentNode.nodeName === 'SCRIPT') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        const textNodes = [];
        let currentNode;
        while (currentNode = walker.nextNode()) {
            textNodes.push(currentNode);
        }
        
        return textNodes;
    }
    
    /**
     * Show detailed information about a citation
     * @param {string} citationId - The citation identifier
     */
    showCitationDetails(citationId) {
        // Find the citation in the references section
        const citationItem = document.querySelector(`.citation-item[data-citation-id="${citationId}"]`);
        
        // Create the citation modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:text-white';
        
        // Modal content
        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Citation Details</h3>
                <button id="close-citation" class="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-4">
                <div class="citation p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded">
                    ${citationItem ? citationItem.innerHTML : 'Citation #' + citationId}
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-4">
                ${this.getCitationActionButtons(citationId, citationItem)}
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close button event
        document.getElementById('close-citation').addEventListener('click', () => {
            modal.remove();
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Button click handlers
        const googleScholarBtn = document.getElementById('google-scholar-btn');
        if (googleScholarBtn) {
            googleScholarBtn.addEventListener('click', () => {
                this.searchGoogleScholar(this.extractCitationText(citationId, citationItem));
            });
        }
        
        const crossrefBtn = document.getElementById('crossref-btn');
        if (crossrefBtn) {
            crossrefBtn.addEventListener('click', () => {
                this.searchCrossref(this.extractCitationText(citationId, citationItem));
            });
        }
        
        const copyBtn = document.getElementById('copy-citation-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyCitation(this.extractCitationText(citationId, citationItem));
            });
        }
    }
    
    /**
     * Extract the full text of a citation
     * @param {string} citationId - The citation identifier
     * @param {Element} citationItem - The citation element if found
     * @returns {string} - The citation text
     */
    extractCitationText(citationId, citationItem) {
        if (citationItem) {
            return citationItem.textContent;
        }
        return citationId;
    }
    
    /**
     * Generate HTML for citation action buttons
     * @param {string} citationId - The citation identifier
     * @param {Element} citationItem - The citation element if found
     * @returns {string} - HTML for the buttons
     */
    getCitationActionButtons(citationId, citationItem) {
        return `
            <button id="google-scholar-btn" class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center">
                <i class="fas fa-search mr-2"></i> Search Google Scholar
            </button>
            <button id="crossref-btn" class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center">
                <i class="fas fa-book mr-2"></i> Search CrossRef
            </button>
            <button id="copy-citation-btn" class="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center">
                <i class="fas fa-copy mr-2"></i> Copy Citation
            </button>
        `;
    }
    
    /**
     * Search Google Scholar for a citation
     * @param {string} citation - Citation text to search for
     */
    searchGoogleScholar(citation) {
        // Extract key terms from the citation
        const searchTerms = this.extractSearchTerms(citation);
        
        // Create search URL
        const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(searchTerms)}`;
        
        // Open in new tab
        window.open(searchUrl, '_blank');
    }
    
    /**
     * Search CrossRef for a citation
     * @param {string} citation - Citation text to search for
     */
    searchCrossref(citation) {
        // Extract key terms from the citation
        const searchTerms = this.extractSearchTerms(citation);
        
        // Create search URL
        const searchUrl = `https://search.crossref.org/?q=${encodeURIComponent(searchTerms)}`;
        
        // Open in new tab
        window.open(searchUrl, '_blank');
    }
    
    /**
     * Copy citation text to clipboard
     * @param {string} citation - Citation text to copy
     */
    copyCitation(citation) {
        navigator.clipboard.writeText(citation)
            .then(() => {
                // Show a success message
                const message = document.createElement('div');
                message.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                message.textContent = 'Citation copied to clipboard!';
                document.body.appendChild(message);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    message.remove();
                }, 3000);
            })
            .catch(err => {
                console.error('Failed to copy citation:', err);
                alert('Failed to copy citation. Please try again manually.');
            });
    }
    
    /**
     * Extract key terms from a citation for search
     * @param {string} citation - Full citation text
     * @returns {string} - Key search terms
     */
    extractSearchTerms(citation) {
        // Try to extract author and year
        const authorYearMatch = citation.match(/([A-Za-z]+(?:,?\s[A-Za-z]+)*),?\s(\d{4})/);
        
        if (authorYearMatch) {
            const [, author, year] = authorYearMatch;
            
            // Try to extract title - usually after year and before journal/publisher
            const afterYear = citation.substring(citation.indexOf(year) + year.length);
            const titleMatch = afterYear.match(/[.,"']?\s+["']?([^."']*?)["']?[.,]/);
            
            if (titleMatch && titleMatch[1]) {
                return `${author} ${titleMatch[1]}`;
            }
            
            // Fallback to author and year
            return `${author} ${year}`;
        }
        
        // Title-based extraction (if no author-year pattern found)
        const titleMatch = citation.match(/["']([^"']+)["']/);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1];
        }
        
        // Remove citation numbers and take the first N words
        return citation.replace(/^\[\d+\]|\(\d{4}\)|\d+\./g, '').trim().split(/\s+/).slice(0, 6).join(' ');
    }
    
    /**
     * Show research paper search interface
     */
    showResearchSearch() {
        // Create the search modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:text-white';
        
        // Modal content
        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Research Paper Search</h3>
                <button id="close-research-search" class="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-4">
                <div class="flex space-x-2">
                    <input type="text" id="paper-search-input" class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Enter paper title, author, or keywords">
                    <button id="search-papers-btn" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                        <i class="fas fa-search mr-2"></i> Search
                    </button>
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                    <button class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300 search-source" data-source="arxiv">
                        arXiv
                    </button>
                    <button class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300 search-source" data-source="googleScholar">
                        Google Scholar
                    </button>
                    <button class="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-300 search-source" data-source="semanticScholar">
                        Semantic Scholar
                    </button>
                    <button class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors dark:bg-red-900 dark:bg-opacity-30 dark:text-red-300 search-source" data-source="pubmed">
                        PubMed
                    </button>
                    <button class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300 search-source" data-source="crossref">
                        CrossRef
                    </button>
                </div>
            </div>
            <div id="search-results" class="mt-4">
                <div class="text-center text-gray-500 dark:text-gray-400">
                    Enter your search query and select a source to find relevant papers
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close button event
        document.getElementById('close-research-search').addEventListener('click', () => {
            modal.remove();
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Search button handler
        const searchBtn = document.getElementById('search-papers-btn');
        const searchInput = document.getElementById('paper-search-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    this.searchGoogleScholar(query);
                }
            });
            
            // Enter key to search
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.searchGoogleScholar(query);
                    }
                }
            });
        }
        
        // Source button handlers
        const sourceButtons = document.querySelectorAll('.search-source');
        sourceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const source = button.getAttribute('data-source');
                const query = searchInput.value.trim();
                
                if (!query) {
                    searchInput.focus();
                    return;
                }
                
                let searchUrl = '';
                
                switch (source) {
                    case 'arxiv':
                        searchUrl = `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`;
                        break;
                    case 'googleScholar':
                        searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
                        break;
                    case 'semanticScholar':
                        searchUrl = `https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}`;
                        break;
                    case 'pubmed':
                        searchUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`;
                        break;
                    case 'crossref':
                        searchUrl = `https://search.crossref.org/?q=${encodeURIComponent(query)}`;
                        break;
                }
                
                if (searchUrl) {
                    window.open(searchUrl, '_blank');
                }
            });
        });
    }
}

// Initialize the research utilities manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.researchUtils = new ResearchUtilsManager();
});
