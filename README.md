# 📚 Booky - A personal book review and management system in your browser

A modern, responsive web application for tracking your book collection, reading progress, and reviews. Built with vanilla JavaScript, featuring IndexedDB for persistent storage, JSON export/import functionality, and beautiful toast notifications.

<!-- ![Book Library Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=Book+Library+App) -->

## ✨ Features

### 📖 Book Management
- **Add Books**: Track books with title, rating, review, bookmark location, and reading status
- **Edit Books**: Update book information anytime
- **Delete Books**: Remove books with confirmation dialog
- **Star Rating**: Interactive 5-star rating system

### 💾 Data Persistence
- **IndexedDB Storage**: Robust client-side database for large book collections
- **Persistent Data**: Books survive browser restarts and clear local data operations
- **No External Dependencies**: Works offline without server requirements

### 📤📥 Export/Import
- **JSON Export**: Download your entire library as a formatted JSON file
- **JSON Import**: Import books from JSON files with automatic validation
- **Conflict Resolution**: Handle duplicate books with merge options
- **Data Integrity**: Validates imported data structure and content

### 🔔 Notifications
- **Toast Notifications**: Beautiful animated notifications for all actions
- **Multiple Types**: Success, error, warning, and info notifications
- **Responsive Design**: Notifications adapt to different screen sizes
- **Auto-dismiss**: Notifications automatically disappear after 5 seconds

### 🎨 User Interface
- **Modern Design**: Gradient backgrounds with glassmorphism effects
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Card hover effects and modal transitions
- **Accessible Colors**: High contrast status indicators and rating stars

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- No special setup required - works offline!

### Installation
1. **Clone or Download** the project files to your local machine
2. **Open** `index.html` in your web browser
3. **Start** adding books to your library!


## 📋 Usage Guide

### Adding a Book
1. Click the **"Add New Book"** button
2. Fill in the book details:
   - **Book Name** (required): Title of the book
   - **Review**: Your thoughts and comments
   - **Rating**: Click stars to rate (1-5)
   - **Bookmark**: Page number and/or line number
   - **Status**: Reading progress (Yet to Start, Ongoing, Completed, Dropped)
3. Click **"Save Book"** to add it to your library

### Managing Books
- **Edit**: Click the edit button on any book card
- **Delete**: Click delete with confirmation dialog
- **Rating**: Interactive star rating in the modal

### Data Operations
- **Export**: Click "Export as JSON" to download your library
- **Import**: Click "Import from JSON" to load books from a file
  - Handles duplicates automatically
  - Validates data integrity
  - Provides detailed feedback

## 🏗️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: IndexedDB API for client-side databases
- **Styling**: CSS3 with responsive design
- **Icons**: Font Awesome 6 for beautiful iconography
- **No Dependencies**: Pure web technologies

### Data Model
```javascript
{
  id: number,           // Unique identifier (timestamp)
  name: string,         // Book title (required)
  review: string,       // Personal review/notes
  rating: number,       // 0-5 star rating
  bookmarkPage: number, // Current page (nullable)
  bookmarkLine: number,  // Current line (nullable)
  status: string        // 'yet-to-start', 'ongoing', 'completed', 'dropped'
}
```

### IndexedDB Schema
- **Database**: `BookLibraryDB`
- **Version**: 1
- **Object Store**: `books`
- **Key Path**: `id` (primary key)

### JSON Export Format
The export creates a properly formatted JSON array of book objects:
```json
[
  {
    "id": 1704085200000,
    "name": "The Great Gatsby",
    "review": "A masterpiece of American literature...",
    "rating": 5,
    "bookmarkPage": null,
    "bookmarkLine": null,
    "status": "completed"
  }
]
```

## 📱 Browser Support

### ✅ Fully Supported
- **Chrome/Chromium**: 58+
- **Firefox**: 60+
- **Safari**: 10.1+
- **Edge**: 79+ (Chromium-based)

### ⚠️ Partially Supported
- **Legacy Edge**: 16+ (limited IndexedDB features)
- **Safari iOS**: 10.3+ (may have storage limits)

### ❌ Not Supported
- **Internet Explorer 11** and older versions

## 📁 Project Structure

```
booky/
├── index.html          # Main HTML page
├── styles.css          # Application styles
├── app.js             # Application logic
└── README.md          # This file
```

### File Descriptions

- **`index.html`**: HTML5 structure with semantic markup, modal dialogs, and form controls
- **`styles.css`**: Responsive CSS with modern design patterns, animations, and mobile-first approach
- **`app.js`**: Complete application logic including IndexedDB operations, form handling, and UI updates

## 🔧 Development

### Running Locally
```bash
# Method 1: Direct browser opening
# Simply double-click index.html or drag to browser

# Method 2: Local server (recommended for some browsers)
# Use any static file server
cd /path/to/booky
python -m http.server 8000
# Then visit http://localhost:8000
```

### Code Style
- **JavaScript**: ES6+ features with async/await
- **CSS**: BEM-like naming conventions
- **HTML**: Semantic and accessible markup
- **Comments**: Well-documented functions and complex logic

### Testing Features
1. **Add multiple books** with different statuses
2. **Test export/import** functionality
3. **Browser refresh persistence** test
4. **Mobile responsiveness** check
5. **Error handling** with invalid import files

## 🤝 Contributing

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Improvement Ideas
- **Search functionality** for large book collections
- **Categories/genres** for book organization
- **Statistics dashboard** with reading progress charts
- **Tags system** for custom organization
- **Reading log** with date tracking
- **Bulk operations** for managing multiple books
- **Cloud sync** with account system

### Code Quality
- Use async/await for all async operations
- Handle errors gracefully with user feedback
- Maintain responsive design principles
- Test on multiple browsers and devices
- Follow accessibility best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome**: Beautiful icons used throughout the application
- **Google Fonts**: Typography for enhanced readability
- **Web Standards**: Using modern web APIs like IndexedDB and File API

## 🐛 Troubleshooting

### Common Issues

**Books not loading after page refresh:**
- Clear browser data for this site
- Check browser console for IndexedDB errors
- Ensure JavaScript is enabled

**Import fails:**
- Verify JSON file format matches export structure
- Check file size (browser limits apply)
- Ensure valid JSON syntax

**Notifications not appearing:**
- Check if JavaScript is blocked
- Clear browser cache and cookies
- Try a different browser

**Performance issues with large collections:**
- IndexedDB handles large datasets well
- Clear browser storage if needed
- Consider smaller batch imports


---

**Happy Reading and Reviewing! 📖✨**

*Built with ❤️ by knightlesssword*

