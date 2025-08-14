// ===========================
// FRONTEND SCRIPT.JS
// ===========================

// Canvas & context
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const container = document.querySelector('.canvas-container');

// State
let tool = null;
let drawing = false;
let startX = 0, startY = 0;
let borderColor = '#000000';
let tempImage = null; // image being placed (preview)
let currentPreviewShape = null; // current ghost shape
let backendShapes = []; // shapes from backend
const imageCache = new Map(); // cache HTMLImageElements by src

// ===========================
// TOOL SELECTION
// ===========================
document.getElementById('rectBtn').onclick = () => tool = 'rectangle';
document.getElementById('circleBtn').onclick = () => tool = 'circle';
document.getElementById('lineBtn').onclick = () => tool = 'line';
document.getElementById('textBtn').onclick = () => tool = 'text';
document.getElementById('imageBtn').onclick = () => document.getElementById('imageUploadModal').style.display = 'flex';

// ===========================
// COLOR PICKER
// ===========================
new Picker({
    parent: document.getElementById('colorPickerBtn'),
    popup: 'bottom',
    alpha: false,
    color: borderColor,
    onChange: c => { borderColor = c.hex; }
});

// ===========================
// HELPERS
// ===========================
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
}

async function fetchState() {
    const res = await fetch('/api/canvas/state');
    const data = await res.json();
    backendShapes = Array.isArray(data.elements) ? data.elements : [];

    // warm image cache
    backendShapes.forEach(s => {
        if (s.type === 'image') {
            const src = s.imgSrc || s.img;
            if (src && !imageCache.has(src)) {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    imageCache.set(src, img);
                    drawAll();
                };
                imageCache.set(src, img); // set immediately (may not be loaded yet)
            }
        }
    });
}

function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    backendShapes.forEach(s => {
        ctx.setLineDash([]); // solid by default for saved shapes
        ctx.strokeStyle = s.color || '#000';
        ctx.fillStyle = s.color || '#000';

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
                ctx.font = `${Math.max(1, s.size || 20)}px Arial`;
                ctx.fillText(s.text, s.x, s.y);
                break;

            case 'image': {
                const src = s.imgSrc || s.img;
                const img = src ? imageCache.get(src) : null;
                if (img && img.complete) {
                    ctx.drawImage(img, s.x, s.y, s.w, s.h);
                } else if (src && !imageCache.has(src)) {
                    const im = new Image();
                    im.src = src;
                    im.onload = () => {
                        imageCache.set(src, im);
                        drawAll();
                    };
                    imageCache.set(src, im);
                }
                break;
            }
        }
    });
}

function drawPreview() {
    if (!currentPreviewShape) return;
    const s = currentPreviewShape;

    // dashed only for text/image box preview
    const dashed = (s.type === 'text' || s.type === 'image');
    ctx.setLineDash(dashed ? [5, 3] : []);
    ctx.strokeStyle = s.color || borderColor || '#000';
    ctx.fillStyle = s.color || borderColor || '#000';

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
            ctx.strokeRect(s.x, s.y, s.w, s.h);
            break;

        case 'image':
            if (s.img) ctx.drawImage(s.img, s.x, s.y, s.w, s.h);
            ctx.strokeRect(s.x, s.y, s.w, s.h);
            break;
    }
    ctx.setLineDash([]); // reset
}

// ===========================
// EVENTS: DRAW
// ===========================
canvas.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    startX = pos.x;
    startY = pos.y;
    drawing = true;
    currentPreviewShape = null;
});

canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const { x, y } = getMousePos(e);

    switch (tool) {
        case 'rectangle':
            currentPreviewShape = {
                type: 'rectangle', x: startX, y: startY,
                w: x - startX, h: y - startY, color: borderColor
            };
            break;

        case 'circle':
            currentPreviewShape = {
                type: 'circle', x: startX, y: startY,
                r: Math.sqrt((x - startX) ** 2 + (y - startY) ** 2), color: borderColor
            };
            break;

        case 'line':
            currentPreviewShape = {
                type: 'line', x1: startX, y1: startY, x2: x, y2: y, color: borderColor
            };
            break;

        case 'text':
            currentPreviewShape = {
                type: 'text', x: startX, y: startY,
                w: x - startX, h: y - startY, color: borderColor
            };
            break;

        case 'image':
            if (tempImage) {
                currentPreviewShape = {
                    type: 'image', img: tempImage,
                    x: startX, y: startY, w: x - startX, h: y - startY
                };
            }
            break;

        default:
            currentPreviewShape = null;
    }

    // draw saved shapes, then preview on top
    drawAll();
    drawPreview();
});

canvas.addEventListener('mouseup', async e => {
    if (!drawing) return;
    drawing = false;
    const { x, y } = getMousePos(e);
    let shape = null;

    switch (tool) {
        case 'rectangle':
        case 'circle':
        case 'line':
            shape = currentPreviewShape ? { ...currentPreviewShape } : null;
            break;

        case 'text': {
            const t = prompt('Enter your text:');
            if (t) {
                const size = Math.abs(y - startY) || 20;
                shape = {
                    type: 'text',
                    x: startX,
                    y: startY + (y - startY),
                    size,
                    color: borderColor,
                    text: t
                };
            }
            break;
        }

        case 'image':
            if (tempImage) {
                shape = {
                    type: 'image',
                    imgSrc: tempImage.src,
                    x: startX, y: startY, w: x - startX, h: y - startY
                };
            }
            tempImage = null;
            break;
    }

    currentPreviewShape = null;
    if (shape) {
        await fetch('/api/canvas/add-shape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shape)
        });
        await fetchState();
        drawAll();
    } else {
        drawAll(); // just clear preview
    }
});

// ===========================
// CANVAS SIZE
// ===========================
document.getElementById('setCanvasSizeBtn').onclick = async () => {
    const width = parseInt(document.getElementById('canvasWidthInput').value);
    const height = parseInt(document.getElementById('canvasHeightInput').value);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        alert('Enter valid width & height!');
        return;
    }

    await fetch('/api/canvas/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ width, height })
    });

    canvas.width = width;
    canvas.height = height;
    container.style.width = width + 'px';
    container.style.height = height + 'px';

    await fetchState();
    drawAll();
};

// Keep mouse mapping correct when user resizes container
new ResizeObserver(() => {
    drawAll();
}).observe(container);

// ===========================
// UNDO / REDO / CLEAR
// ===========================
document.getElementById('undoBtn').onclick = async () => {
    await fetch('/api/canvas/undo', { method: 'POST' });
    await fetchState();
    drawAll();
};

document.getElementById('redoBtn').onclick = async () => {
    await fetch('/api/canvas/redo', { method: 'POST' });
    await fetchState();
    drawAll();
};

document.getElementById('clearCanvasBtn').onclick = async () => {
    await fetch('/api/canvas/clear', { method: 'POST' });
    await fetchState();
    drawAll();
};

// ===========================
// PDF EXPORT
// ===========================
document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    const imgData = canvas.toDataURL("image/jpeg", 0.8);

    fetch('/api/canvas/export-pdf', {
        method: 'POST',
        body: JSON.stringify({ imageData: imgData })
    })
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canvas.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    })
    .catch(err => console.error('Error downloading PDF:', err));
});

// ===========================
// IMAGE UPLOAD MODAL
// ===========================
const imageUploadModal = document.getElementById('imageUploadModal');

document.getElementById('closeModalBtn').onclick = () =>
    imageUploadModal.style.display = 'none';

document.getElementById('uploadLocalBtn').onclick = () =>
    document.getElementById('imageUpload').click();

document.getElementById('imageUpload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        tempImage = img;
        tool = 'image';
        imageUploadModal.style.display = 'none';
    };
    img.src = URL.createObjectURL(file);
});

document.getElementById('uploadUrlBtn').onclick = () => {
    const url = document.getElementById('imageUrlInput').value.trim();
    if (!url) return alert('Enter image URL');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        tempImage = img;
        tool = 'image';
        imageUploadModal.style.display = 'none';
    };
    img.onerror = () => alert('Failed to load image. Check URL.');
    img.src = url;
};

// ===========================
// INITIAL LOAD
// ===========================
(async () => {
    await fetchState();
    drawAll();
})();
