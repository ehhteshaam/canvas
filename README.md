# 🎨 Canvas Builder API with PDF Export

A full-stack web application that provides a professional canvas design tool with the ability to create, edit, and export designs as high-quality PDF files.

## ✨ Features

### 🖼️ Canvas Management
- **Customizable Canvas Dimensions**: Set canvas size from 100×100 to 2000×2000 pixels
- **Real-time Preview**: See changes as you draw
- **Responsive Design**: Works on desktop and mobile devices

### 🎯 Drawing Tools
- **Shapes**: Rectangle, Circle, Line
- **Text**: Add custom text with adjustable font sizes
- **Images**: Upload local files or add images from URLs
- **Color Control**: Custom border color picker

### 📁 Export Capabilities
- **PDF Export**: High-quality PDF with compression optimization
- **Server-side Rendering**: Uses PDFKit for consistent output

### 🔧 Advanced Features
- **Undo/Redo**: Full history management
- **Element Management**: Add and modify canvas elements
- **Image Caching**: Optimized image loading and storage
- **Error Handling**: Graceful fallbacks for failed operations

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: No framework dependencies for optimal performance
- **Canvas API**: HTML5 Canvas for drawing operations

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **PDFKit**: PDF generation with optimization

### Libraries & Dependencies
- **Vanilla Picker**: Color selection component
- **Body Parser**: Request body parsing
- **CORS**: Cross-origin resource sharing

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/ehhteshaam/canvas.git
cd canvas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 📖 API Documentation

### Canvas Management

#### Initialize Canvas
```http
POST /api/canvas/init
Content-Type: application/json

{
  "width": 800,
  "height": 600
}
```

#### Get Canvas State
```http
GET /api/canvas/state
```

### Element Operations

#### Add Shape/Element
```http
POST /api/canvas/add-shape
Content-Type: application/json

{
  "type": "rectangle",
  "x": 100,
  "y": 100,
  "w": 200,
  "h": 150,
  "strokeColor": "#000000"
}
```

#### Undo Last Action
```http
POST /api/canvas/undo
```

#### Redo Last Action
```http
POST /api/canvas/redo
```

#### Clear Canvas
```http
POST /api/canvas/clear
```

### Export Functions

#### Export as PDF
```http
POST /api/canvas/export-pdf
```

## 🎨 Usage Guide

### 1. Setting Up Your Canvas
- Use the canvas size controls to set dimensions
- Click "Set Size" to apply changes

### 2. Drawing Elements
- **Select a Tool**: Click on rectangle, circle, line, text, or image
- **Choose Colors**: Use the color picker for border colors
- **Draw**: Click and drag on the canvas to create elements

### 3. Adding Text
- Select the text tool
- Click and drag to define text area
- Enter your text in the prompt dialog

### 4. Adding Images
- Select the image tool
- Choose between local file upload or URL input
- Click and drag to position and size the image

### 5. Exporting Your Design
- **PDF Export**: Click the PDF button for high-quality PDF download

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production         # Environment mode
```

### Canvas Settings
- **Maximum Size**: 2000×2000 pixels
- **Default Size**: 800×500 pixels
- **Supported Formats**: PDF for documents

## 📱 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+



3. **Environment Setup**
- Set `NODE_ENV=production`
- Configure any additional environment variables

### Alternative Platforms
- **Heroku**: Add `engines` to package.json
- **Netlify**: Configure build settings
- **Railway**: Direct deployment from GitHub

## 🧪 Testing

### Manual Testing
1. Test all drawing tools
2. Verify export functionality
3. Check responsive design
4. Test error handling

### Automated Testing (Future Enhancement)
```bash
npm test
```

## 📊 Performance Features

- **Image Caching**: Reduces redundant image loading
- **PDF Compression**: Optimized file sizes
- **Lazy Loading**: Efficient resource management
- **Responsive Canvas**: Adapts to different screen sizes

## 🔒 Security Considerations

- **Input Validation**: All user inputs are validated
- **File Upload Limits**: Restricted to image files
- **CORS Configuration**: Proper cross-origin handling
- **Error Handling**: No sensitive information exposure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request



## 🙏 Acknowledgments

- **Canvas API**: For drawing capabilities
- **PDFKit**: For PDF generation
- **Vanilla Picker**: For color selection
- **Express.js**: For the web framework

