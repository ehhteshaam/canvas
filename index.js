// ===========================
// SERVER SETUP
// ===========================
const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit'); // For PDF generation
const fs = require('fs');               // Optional: for saving files locally
const app = express();

// ===========================
// MIDDLEWARE
// ===========================

// Serve static files from the 'public' folder (HTML, CSS, JS, images)
app.use(express.static('public'));

// Parse JSON bodies (supports large base64 images)
app.use(bodyParser.json({ limit: '10mb' }));

// ===========================
// ROUTES
// ===========================

// POST endpoint to receive base64 image and return PDF
app.post('/export-pdf', (req, res) => {
    const { image } = req.body; // Expecting { image: "data:image/png;base64,..." }

    // Create a new PDF document without the first page automatically
    const doc = new PDFDocument({ autoFirstPage: false });

    // Set response headers to indicate PDF file
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the PDF output directly to the HTTP response
    doc.pipe(res);

    // Add a single page with fixed size
    doc.addPage({ size: [800, 600] });

    // Add the image to the PDF, decoding from base64
    doc.image(Buffer.from(image.split(',')[1], 'base64'), 0, 0, { width: 800 });

    // Finalize the PDF and end the response
    doc.end();
});

// ===========================
// START SERVER
// ===========================
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
