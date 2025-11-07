// Book management application
let books = [];
let editingBookId = null;
let db = null;

// DOM elements
const booksGrid = document.getElementById('books-grid');
const addBookBtn = document.getElementById('add-book-btn');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const modal = document.getElementById('book-modal');
const modalTitle = document.getElementById('modal-title');
const bookForm = document.getElementById('book-form');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancel-btn');
const ratingStars = document.getElementById('rating-stars');

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BookLibraryDB', 1);

        request.onerror = () => {
            showToast('Failed to open IndexedDB', 'error');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'id' });
            }
        };
    });
}

// Load books from IndexedDB
async function loadBooks() {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['books'], 'readonly');
        const store = transaction.objectStore('books');
        const request = store.getAll();

        request.onsuccess = () => {
            books = request.result;
            resolve(books);
        };

        request.onerror = () => {
            showToast('Failed to load books from database', 'error');
            reject(request.error);
        };
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadBooks();
        renderBooks();
    } catch (error) {
        console.error('Failed to load books:', error);
        showToast('Failed to load books from database', 'error');
        books = [];
        renderBooks();
    }

    // Event listeners
    addBookBtn.addEventListener('click', () => openModal());
    exportBtn.addEventListener('click', exportBooks);
    importFile.addEventListener('change', importBooks);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    bookForm.addEventListener('submit', handleFormSubmit);
    ratingStars.addEventListener('click', handleRatingClick);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});

// Render books
function renderBooks() {
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        booksGrid.innerHTML = '<p style="text-align: center; color: white; font-size: 1.2rem;">No books added yet. Click "Add New Book" to get started!</p>';
        return;
    }
    
    books.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });
}

// Create book card
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.id = book.id;
    
    const statusClass = getStatusClass(book.status);
    
    card.innerHTML = `
        <div class="book-header">
            <div class="book-title">${escapeHtml(book.name)}</div>
            <span class="status-badge ${statusClass}">${formatStatus(book.status)}</span>
        </div>
        <div class="book-content">
            ${book.rating > 0 ? `
            <div class="book-details">
                <div class="detail-row">
                    <span class="detail-label">Rating:</span>
                    <span class="detail-value rating-display">${createStarDisplay(book.rating)}</span>
                </div>
            </div>` : ''}
            
            ${(book.bookmarkPage || book.bookmarkLine) ? `
            <div class="book-details">
                <div class="detail-row">
                    <span class="detail-label">Bookmark:</span>
                    <span class="detail-value">${book.bookmarkPage ? `Page ${book.bookmarkPage}` : ''}${book.bookmarkPage && book.bookmarkLine ? ', ' : ''}${book.bookmarkLine ? `Line ${book.bookmarkLine}` : ''}</span>
                </div>
            </div>` : ''}
            
            ${book.review ? `
            <div class="book-review">
                "${escapeHtml(book.review)}"
            </div>` : ''}
            
            <div class="book-actions">
                <button class="btn-edit" onclick="editBook(${book.id})">Edit</button>
                <button class="btn-delete" onclick="deleteBook(${book.id})">Delete</button>
            </div>
        </div>
    `;
    
    return card;
}

// Format status for display
function formatStatus(status) {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Get status CSS class
function getStatusClass(status) {
    return `status-${status}`;
}

// Create star display
function createStarDisplay(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return stars;
}

// Open modal for add/edit
function openModal(book = null) {
    if (book) {
        editingBookId = book.id;
        modalTitle.textContent = 'Edit Book';
        
        // Populate form
        document.getElementById('book-name').value = book.name;
        document.getElementById('book-review').value = book.review || '';
        document.getElementById('book-rating').value = book.rating;
        document.getElementById('bookmark-page').value = book.bookmarkPage || '';
        document.getElementById('bookmark-line').value = book.bookmarkLine || '';
        document.getElementById('book-status').value = book.status;
        
        // Update rating display
        updateRatingDisplay(book.rating);
    } else {
        editingBookId = null;
        modalTitle.textContent = 'Add New Book';
        bookForm.reset();
        updateRatingDisplay(0);
    }
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    editingBookId = null;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const bookData = {
        name: document.getElementById('book-name').value.trim(),
        review: document.getElementById('book-review').value.trim(),
        rating: parseInt(document.getElementById('book-rating').value),
        bookmarkPage: parseInt(document.getElementById('bookmark-page').value) || null,
        bookmarkLine: parseInt(document.getElementById('bookmark-line').value) || null,
        status: document.getElementById('book-status').value
    };

    if (editingBookId) {
        // Update existing book
        const bookIndex = books.findIndex(book => book.id === editingBookId);
        if (bookIndex !== -1) {
            bookData.id = editingBookId;
            books[bookIndex] = bookData;
        }
    } else {
        // Add new book
        bookData.id = Date.now();
        books.push(bookData);
    }

    try {
        await saveBooks();
        renderBooks();
        closeModal();
    } catch (error) {
        console.error('Failed to save book:', error);
        showToast('Failed to save book', 'error');
    }
}

// Handle rating stars
function handleRatingClick(e) {
    if (e.target.tagName === 'I') {
        const rating = parseInt(e.target.dataset.rating);
        document.getElementById('book-rating').value = rating;
        updateRatingDisplay(rating);
    }
}

function updateRatingDisplay(rating) {
    const stars = ratingStars.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });
}

// Edit book
function editBook(bookId) {
    const book = books.find(book => book.id === bookId);
    if (book) {
        openModal(book);
    }
}

// Delete book
async function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(book => book.id !== bookId);
        try {
            await saveBooks();
            renderBooks();
        } catch (error) {
            console.error('Failed to save after deletion:', error);
            showToast('Failed to delete book', 'error');
            // Reload books to restore original state
            await loadBooks();
            renderBooks();
        }
    }
}

// Save books to IndexedDB
async function saveBooks() {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['books'], 'readwrite');
        const store = transaction.objectStore('books');

        // Clear existing data
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            // Add all books
            let addCount = 0;
            const totalBooks = books.length;

            if (totalBooks === 0) {
                resolve();
                return;
            }

            books.forEach(book => {
                const request = store.add(book);
                request.onsuccess = () => {
                    addCount++;
                    if (addCount === totalBooks) {
                        showToast('Books saved successfully', 'success');
                        resolve();
                    }
                };
                request.onerror = () => {
                    showToast('Failed to save book: ' + book.name, 'error');
                    reject(request.error);
                };
            });
        };

        clearRequest.onerror = () => {
            showToast('Failed to clear database', 'error');
            reject(clearRequest.error);
        };
    });
}

// Export books as JSON
function exportBooks() {
    if (books.length === 0) {
        showToast('No books to export', 'warning');
        return;
    }

    try {
        const dataStr = JSON.stringify(books, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `book-library-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Exported ${books.length} book(s) successfully`, 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showToast('Failed to export books', 'error');
    }
}

// Import books from JSON
function importBooks(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showToast('Please select a valid JSON file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedBooks = JSON.parse(e.target.result);

            // Validate imported data
            if (!Array.isArray(importedBooks)) {
                showToast('Invalid JSON format: expected array of books', 'error');
                return;
            }

            // Validate each book
            const validBooks = [];
            const errors = [];

            importedBooks.forEach((book, index) => {
                if (typeof book === 'object' && book !== null && book.name && typeof book.name === 'string') {
                    // Create a clean book object with defaults
                    const cleanBook = {
                        id: book.id || Date.now() + index,
                        name: book.name.trim(),
                        review: (book.review || '').trim(),
                        rating: Math.max(0, Math.min(5, parseInt(book.rating) || 0)),
                        bookmarkPage: book.bookmarkPage ? parseInt(book.bookmarkPage) : null,
                        bookmarkLine: book.bookmarkLine ? parseInt(book.bookmarkLine) : null,
                        status: ['yet-to-start', 'ongoing', 'completed', 'dropped'].includes(book.status)
                            ? book.status : 'yet-to-start'
                    };
                    validBooks.push(cleanBook);
                } else {
                    errors.push(`Book at index ${index}: invalid format`);
                }
            });

            if (validBooks.length === 0) {
                showToast('No valid books found in the file', 'error');
                return;
            }

            // Check for duplicates by name
            const existingNames = books.map(book => book.name.toLowerCase());
            const conflicts = validBooks.filter(book =>
                existingNames.includes(book.name.toLowerCase())
            );

            let finalBooks = [];
            if (conflicts.length > 0) {
                if (confirm(`${conflicts.length} book(s) already exist by name. Do you want to replace them?`)) {
                    // Merge books, replacing existing ones with same name
                    const mergedBooks = [...books];
                    validBooks.forEach(newBook => {
                        const existingIndex = mergedBooks.findIndex(book =>
                            book.name.toLowerCase() === newBook.name.toLowerCase()
                        );
                        if (existingIndex >= 0) {
                            newBook.id = mergedBooks[existingIndex].id; // Keep original ID
                            mergedBooks[existingIndex] = newBook;
                        } else {
                            mergedBooks.push(newBook);
                        }
                    });
                    finalBooks = mergedBooks;
                } else {
                    // Skip duplicates
                    finalBooks = [...books, ...validBooks.filter(book =>
                        !existingNames.includes(book.name.toLowerCase())
                    )];
                }
            } else {
                finalBooks = [...books, ...validBooks];
            }

            // Update books and save
            books = finalBooks.filter((book, index, arr) =>
                arr.findIndex(b => b.id === book.id) === index
            ); // Remove any duplicate IDs

            await saveBooks();
            renderBooks();

            if (errors.length > 0) {
                showToast(`Imported ${validBooks.length - conflicts.length} books, ${errors.length} errors. Check console for details.`, 'warning');
                console.warn('Import errors:', errors);
            } else {
                showToast(`Successfully imported ${validBooks.length} book(s)`, 'success');
            }

        } catch (error) {
            console.error('Import failed:', error);
            showToast('Failed to parse JSON file', 'error');
        }
    };

    reader.onerror = () => {
        showToast('Failed to read file', 'error');
    };

    reader.readAsText(file);

    // Clear the input so user can select the same file again if needed
    event.target.value = '';
}

// HTML escape for security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// Toast notifications
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Add icon based on type
    const icon = type === 'error' ? 'fas fa-exclamation-triangle' :
                 type === 'success' ? 'fas fa-check-circle' :
                 'fas fa-info-circle';

    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${escapeHtml(message)}</span>
        <button class="toast-close">&times;</button>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
}
