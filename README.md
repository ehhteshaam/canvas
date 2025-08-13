# 🚀 Rocketium Canvas Tool

Welcome to **Rocketium Canvas**, a simple yet powerful browser-based drawing tool! Create shapes, add text, upload images, move them around, and export your masterpiece as a PDF—all in your browser.  

Check out the live version here: [Rocketium Canvas Live](https://canvas-mlxg.onrender.com/)  
Source code: [GitHub Repository](https://github.com/ehhteshaam/canvas)

---

## 🌟 Features

- **Draw Shapes:** Rectangle, Circle, and Line tools
- **Text Tool:** Add custom text with adjustable size
- **Image Upload:** Upload from your device or via URL
- **Move Objects:** Click and drag any object on the canvas
- **Undo / Redo:** Easily correct mistakes
- **Canvas Resize:** Set your preferred canvas width & height
- **PDF Export:** Download your canvas as a compressed PDF
- **Color Picker:** Choose custom border colors

---

## 🖥️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Vanilla-Picker for colors
- **Backend:** Node.js, Express
- **PDF Export:** jsPDF
- **Deployment:** [Render](https://render.com/)

---

## ⚡ Getting Started (Locally)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/ehhteshaam/canvas.git
   cd canvas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the server:**
   ```bash
   node index.js
   ```

4. **Open in browser:**  
   Go to `http://localhost:3000`

---

## 🖌️ How to Use

1. Select a tool from the toolbar.
2. Draw shapes, type text, or upload images.
3. Click and drag objects to move them around.
4. Use Undo/Redo to fix mistakes.
5. Resize the canvas if needed.
6. Download your canvas as a PDF when finished.

---

## 🎨 Folder Structure

```
canvas/
│
├─ public/
│   ├─ icons/          # All toolbar icons
│   ├─ index.html      # Main HTML file
│   ├─ style.css       # CSS for styling
│   └─ script.js       # JS logic for drawing & moving
│
├─ index.js            # Express server
├─ package.json        # Node.js dependencies & scripts
└─ README.md           # This file
```

---

## 🙌 Contributions

Feel free to fork this repo, add features, and make it even cooler! Pull requests are welcome.  

---

Enjoy creating your canvas masterpieces! 🎨
