const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

// Keep in-memory canvas state
let canvasState = {
    width: 800,
    height: 500,
    elements: [],
    undone: []
};

// ========================
// Initialize canvas size
// ========================
router.post('/init', (req, res) => {
    const { width, height } = req.body;
    canvasState.width = width;
    canvasState.height = height;
    res.json({ status: 'ok', width, height });
});

// ========================
// Get current canvas state
// ========================
router.get('/state', (req, res) => {
    res.json(canvasState);
});

// ========================
// Add shape/element
// ========================
router.post('/add-shape', (req, res) => {
    const shape = {
        ...req.body,
        id: Date.now() + Math.random(), // Unique ID for each element
        strokeColor: req.body.strokeColor || 'black',
        fillColor: req.body.fillColor || null,
        lineWidth: req.body.lineWidth || 1,
        font: req.body.font || 'Helvetica'
    };
    canvasState.elements.push(shape);
    canvasState.undone = [];
    res.json({ status: 'ok', shape });
});

// ========================
// Undo
// ========================
router.post('/undo', (req, res) => {
    if (canvasState.elements.length > 0) {
        canvasState.undone.push(canvasState.elements.pop());
    }
    res.json({ status: 'ok' });
});

// ========================
// Redo
// ========================
router.post('/redo', (req, res) => {
    if (canvasState.undone.length > 0) {
        canvasState.elements.push(canvasState.undone.pop());
    }
    res.json({ status: 'ok' });
});

// ========================
// Clear canvas
// ========================
router.post('/clear', (req, res) => {
    canvasState.elements = [];
    canvasState.undone = [];
    res.json({ status: 'ok' });
});

// ========================
// Export PDF
// ========================
// Export PDF from canvas image
router.post('/export-pdf', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const { imageData } = JSON.parse(body);

            if (!imageData || !imageData.startsWith('data:image')) {
                res.status(400).send('Invalid image data');
                return;
            }

            const doc = new PDFDocument({
                size: [canvasState.width, canvasState.height],
                compress: true
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="canvas.pdf"');

            doc.pipe(res);

            const imgBuffer = Buffer.from(imageData.split(',')[1], 'base64');
            doc.image(imgBuffer, 0, 0, { width: canvasState.width, height: canvasState.height });

            doc.end();
        } catch (err) {
            console.error('PDF generation error:', err);
            res.status(500).send('Error creating PDF');
        }
    });
});

module.exports = router;
