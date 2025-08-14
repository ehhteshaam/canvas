const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const canvasRoutes = require('./routes/canvas');

// ===========================
// MIDDLEWARE
// ===========================
app.use(express.static('public'));

// Apply JSON body parser to all routes **except** PDF export
app.use((req, res, next) => {
    if (req.originalUrl === '/api/canvas/export-pdf') {
        // Skip bodyParser.json() for this one
        next();
    } else {
        bodyParser.json({ limit: '20mb' })(req, res, next);
    }
});

// ===========================
// ROUTES
// ===========================
app.use('/api/canvas', canvasRoutes);

// ===========================
// START SERVER
// ===========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
