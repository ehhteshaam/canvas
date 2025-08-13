// ===========================================
// CANVAS SETUP
// ===========================================
// Grab the canvas and its drawing context
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const container = document.querySelector('.canvas-container');

// ===========================================
// STATE VARIABLES
// ===========================================
let tool = null;            // Current tool: rectangle, circle, line, text, image
let drawing = false;        // Are we currently drawing?
let startX, startY;         // Starting point for drawing
let shapes = [];            // All shapes on the canvas
let undone = [];            // Shapes that were undone (for redo)
let borderColor = "#000000"; // Default border color
let tempImage = null;        // Temporarily holds image being placed

// Moving shapes
let selectedShape = null;   // Shape being moved
let isMoving = false;       // Flag for move mode

// ===========================================
// CANVAS RESIZE
// ===========================================
// Resize the canvas to match the container
function resizeCanvas() {
    const oldImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    ctx.putImageData(oldImage, 0, 0);
    redraw();
}

// Initial resize
resizeCanvas();

// Observe container for manual resize
const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(container);

// ===========================================
// TOOL SELECTION
// ===========================================
document.getElementById('rectBtn').onclick = () => tool = 'rectangle';
document.getElementById('circleBtn').onclick = () => tool = 'circle';
document.getElementById('lineBtn').onclick = () => tool = 'line';
document.getElementById('textBtn').onclick = () => tool = 'text';
document.getElementById('imageBtn').onclick = () => {
    // Open image upload modal
    const rect = imageBtn.getBoundingClientRect();
    imageUploadModal.style.top = rect.bottom + "px";
    imageUploadModal.style.left = rect.left + "px";
    imageUploadModal.style.display = "flex";
};

// ===========================================
// UNDO / REDO
// ===========================================
document.getElementById('undoBtn').onclick = () => {
    if (shapes.length > 0) {
        undone.push(shapes.pop());
        redraw();
    }
};

document.getElementById('redoBtn').onclick = () => {
    if (undone.length > 0) {
        shapes.push(undone.pop());
        redraw();
    }
};

// ===========================================
// COLOR PICKER
// ===========================================
const colorBtn = document.getElementById('colorPickerBtn');
let picker = new Picker({
    parent: colorBtn,
    popup: 'bottom',
    alpha: false,
    color: borderColor,
    onChange: (color) => { borderColor = color.hex; }
});

// ===========================================
// MOUSE EVENTS: DRAW & MOVE
// ===========================================
canvas.addEventListener('mousedown', e => {
    const x = e.offsetX, y = e.offsetY;

    // Check if clicked on an existing shape
    selectedShape = getShapeAtPoint(x, y);
    if (selectedShape) {
        isMoving = true;
        startX = x;
        startY = y;
        return;
    }

    // Otherwise, start drawing a new shape
    drawing = true;
    startX = x;
    startY = y;

    if (tool === 'text' || tool === 'image') {
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = borderColor;
    }
});

canvas.addEventListener('mousemove', e => {
    const x = e.offsetX, y = e.offsetY;

    // MOVE MODE
    if (isMoving && selectedShape) {
        const dx = x - startX;
        const dy = y - startY;
        moveShape(selectedShape, dx, dy);
        startX = x;
        startY = y;
        redraw();
        return;
    }

    // DRAW MODE
    if (!drawing) return;

    redraw();
    ctx.setLineDash([]);
    ctx.strokeStyle = borderColor;

    switch (tool) {
        case 'rectangle':
            ctx.strokeRect(startX, startY, x - startX, y - startY);
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(startX, startY, Math.sqrt((x - startX) ** 2 + (y - startY) ** 2), 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'line':
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'text':
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(startX, startY, x - startX, y - startY);
            break;
        case 'image':
            if (tempImage) {
                ctx.drawImage(tempImage, startX, startY, x - startX, y - startY);
                ctx.setLineDash([5, 3]);
                ctx.strokeRect(startX, startY, x - startX, y - startY);
            }
            break;
    }
});

canvas.addEventListener('mouseup', e => {
    drawing = false;
    isMoving = false;
    const endX = e.offsetX, endY = e.offsetY;

    // If a shape was being moved, finish move
    if (selectedShape) {
        selectedShape = null;
        return;
    }

    // Add new shape to array
    switch (tool) {
        case 'rectangle':
            shapes.push({ type: 'rectangle', x: startX, y: startY, w: endX - startX, h: endY - startY, color: borderColor });
            break;
        case 'circle':
            shapes.push({ type: 'circle', x: startX, y: startY, r: Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2), color: borderColor });
            break;
        case 'line':
            shapes.push({ type: 'line', x1: startX, y1: startY, x2: endX, y2: endY, color: borderColor });
            break;
        case 'text':
            const th = endY - startY;
            const t = prompt("Enter your text:");
            if (t) {
                shapes.push({ type: 'text', text: t, x: startX, y: startY + th, size: th, color: borderColor });
            }
            break;
        case 'image':
            if (tempImage) {
                shapes.push({ type: 'image', img: tempImage, x: startX, y: startY, w: endX - startX, h: endY - startY });
                tempImage = null;
            }
            break;
    }

    ctx.setLineDash([]);
    redraw();
});

// ===========================================
// REDRAW FUNCTION
// ===========================================
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach(s => {
        ctx.strokeStyle = s.color || "#000";

        switch (s.type) {
            case 'rectangle':
                ctx.strokeRect(s.x, s.y, s.w, s.h);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(s.x1, s.y1);
                ctx.lineTo(s.x2, s.y2);
                ctx.stroke();
                break;
            case 'text':
                ctx.font = `${s.size}px Arial`;
                ctx.fillStyle = s.color;
                ctx.fillText(s.text, s.x, s.y);
                break;
            case 'image':
                ctx.drawImage(s.img, s.x, s.y, s.w, s.h);
                break;
        }
    });
}

// ===========================================
// HELPER FUNCTIONS FOR MOVING SHAPES
// ===========================================
function getShapeAtPoint(x, y) {
    // Iterate from top to bottom so topmost shapes are selected first
    for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        if (s.type === 'rectangle' || s.type === 'image') {
            if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s;
        } else if (s.type === 'circle') {
            const dx = x - s.x, dy = y - s.y;
            if (Math.sqrt(dx * dx + dy * dy) <= s.r) return s;
        } else if (s.type === 'text') {
            if (x >= s.x && x <= s.x + s.size * s.text.length * 0.6 && y >= s.y - s.size && y <= s.y) return s;
        } else if (s.type === 'line') {
            if (pointLineDistance(x, y, s.x1, s.y1, s.x2, s.y2) < 5) return s;
        }
    }
    return null;
}

function moveShape(shape, dx, dy) {
    if (shape.type === 'rectangle' || shape.type === 'image' || shape.type === 'text') {
        shape.x += dx; shape.y += dy;
    } else if (shape.type === 'circle') {
        shape.x += dx; shape.y += dy;
    } else if (shape.type === 'line') {
        shape.x1 += dx; shape.y1 += dy; shape.x2 += dx; shape.y2 += dy;
    }
}

function pointLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1;
    const C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) { xx = x1; yy = y1; }
    else if (param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx, dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// ===========================================
// PDF EXPORT (WITH BASIC COMPRESSION)
// ===========================================
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;

    // Create PDF
    const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    // Compress canvas by converting to JPEG (80% quality)
    const imgData = canvas.toDataURL("image/jpeg", 0.8);
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('canvas.pdf');
});

// ===========================================
// CANVAS SIZE SETTER
// ===========================================
document.getElementById('setCanvasSizeBtn').addEventListener('click', () => {
    const width = parseInt(document.getElementById('canvasWidthInput').value);
    const height = parseInt(document.getElementById('canvasHeightInput').value);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        alert("Enter valid width & height!");
        return;
    }

    const oldImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    container.style.width = width + "px";
    container.style.height = height + "px";
    ctx.putImageData(oldImage, 0, 0);
    redraw();
});

// ===========================================
// CLEAR CANVAS
// ===========================================
document.getElementById('clearCanvasBtn').addEventListener('click', () => {
    shapes = [];
    undone = [];
    redraw();
});

// ===========================================
// IMAGE UPLOAD MODAL
// ===========================================
const imageUploadModal = document.getElementById('imageUploadModal');
const imageBtn = document.getElementById('imageBtn');
const imageUpload = document.getElementById('imageUpload');
const imageUrlInput = document.getElementById('imageUrlInput');

document.getElementById('closeModalBtn').addEventListener('click', () => {
    imageUploadModal.style.display = "none";
});

// Local file upload
document.getElementById('uploadLocalBtn').addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => { tempImage = img; tool = 'image'; imageUploadModal.style.display = "none"; };
    img.src = URL.createObjectURL(file);
});

// Upload via URL
document.getElementById('uploadUrlBtn').addEventListener('click', () => {
    const url = imageUrlInput.value.trim();
    if (!url) return alert("Enter image URL");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { tempImage = img; tool = 'image'; imageUploadModal.style.display = "none"; };
    img.onerror = () => alert("Failed to load image. Check URL.");
    img.src = url;
});
