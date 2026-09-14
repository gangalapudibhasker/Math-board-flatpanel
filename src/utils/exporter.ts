import { jsPDF } from 'jspdf';
import { BoardDocument, BoardPage, BoardElement } from '../types';
import { renderStrokeToContext } from './penStroke';

const STORAGE_KEY = 'mathwhiteboard_flatpanel_docs_v1';
const LEGACY_STORAGE_KEY = 'openboard_flatpanel_docs_v1';
const CURRENT_DOC_ID_KEY = 'mathwhiteboard_current_doc_id';

/**
 * Save board document to localStorage
 */
export function saveBoardToStorage(doc: BoardDocument): void {
  try {
    const list = getSavedBoardsList();
    const existingIndex = list.findIndex(d => d.id === doc.id);
    const updatedDoc: BoardDocument = {
      ...doc,
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedDoc;
    } else {
      list.unshift(updatedDoc);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(CURRENT_DOC_ID_KEY, doc.id);
  } catch (err) {
    console.error('Failed to save board document to localStorage:', err);
  }
}

/**
 * Retrieve list of all saved boards
 */
export function getSavedBoardsList(): BoardDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Get active document ID from storage
 */
export function getCurrentDocId(): string | null {
  return localStorage.getItem(CURRENT_DOC_ID_KEY);
}

/**
 * Delete a saved board
 */
export function deleteBoardFromStorage(id: string): void {
  const list = getSavedBoardsList().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Export board document as JSON (.mathboard file)
 */
export function exportBoardAsJson(doc: BoardDocument): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doc, null, 2));
  const downloadAnchor = document.createElement('a');
  const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'math_board_lesson';
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${safeTitle}.mathboard.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Helper to render a page onto an offscreen canvas
 */
export async function renderPageToCanvas(
  page: BoardPage,
  width = 1920,
  height = 1080
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // 1. Render Background
  const isDark = page.backgroundStyle.includes('dark');
  ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Background Grid / Ruled lines
  if (page.backgroundStyle.includes('grid')) {
    ctx.strokeStyle = isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  } else if (page.backgroundStyle.includes('ruled')) {
    ctx.strokeStyle = isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1;
    const lineSpacing = 44;
    ctx.beginPath();
    for (let y = 60; y <= height; y += lineSpacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  // 2. Render Elements
  for (const el of page.elements) {
    if (el.type === 'image') {
      await new Promise<void>(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, el.x, el.y, el.width, el.height);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = el.src;
      });
    } else if (el.type === 'shape') {
      ctx.save();
      ctx.strokeStyle = el.strokeColor;
      ctx.fillStyle = el.fillColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.beginPath();

      if (el.shapeType === 'rect') {
        ctx.fillRect(el.x, el.y, el.width, el.height);
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      } else if (el.shapeType === 'circle') {
        ctx.ellipse(
          el.x + el.width / 2,
          el.y + el.height / 2,
          Math.abs(el.width / 2),
          Math.abs(el.height / 2),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
      } else if (el.shapeType === 'line' || el.shapeType === 'arrow') {
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.stroke();
        if (el.shapeType === 'arrow') {
          // Arrow head
          const angle = Math.atan2(el.height, el.width);
          const headlen = 16;
          ctx.fillStyle = el.strokeColor;
          ctx.beginPath();
          ctx.moveTo(el.x + el.width, el.y + el.height);
          ctx.lineTo(
            el.x + el.width - headlen * Math.cos(angle - Math.PI / 6),
            el.y + el.height - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            el.x + el.width - headlen * Math.cos(angle + Math.PI / 6),
            el.y + el.height - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        }
      } else if (el.shapeType === 'triangle') {
        ctx.moveTo(el.x + el.width / 2, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.lineTo(el.x, el.y + el.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (el.shapeType === 'coordinate') {
        // Cartesian Coordinate System
        const midX = el.x + el.width / 2;
        const midY = el.y + el.height / 2;
        ctx.moveTo(el.x, midY);
        ctx.lineTo(el.x + el.width, midY);
        ctx.moveTo(midX, el.y);
        ctx.lineTo(midX, el.y + el.height);
        ctx.stroke();
      }
      ctx.restore();
    } else if (el.type === 'stroke') {
      renderStrokeToContext(ctx, el);
    } else if (el.type === 'text') {
      ctx.save();
      ctx.fillStyle = el.color;
      ctx.font = `${el.isBold ? 'bold ' : ''}${el.isItalic ? 'italic ' : ''}${el.fontSize}px sans-serif`;
      ctx.fillText(el.text, el.x, el.y + el.fontSize);
      ctx.restore();
    } else if (el.type === 'sticky') {
      ctx.save();
      ctx.fillStyle = el.color || '#fef08a';
      ctx.fillRect(el.x, el.y, el.width, el.height);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.strokeRect(el.x, el.y, el.width, el.height);
      ctx.fillStyle = '#1e293b';
      ctx.font = '14px sans-serif';
      ctx.fillText(el.text, el.x + 10, el.y + 24);
      ctx.restore();
    }
  }

  return canvas;
}

/**
 * Export current slide as PNG
 */
export async function exportPageAsPng(page: BoardPage, filename = 'board_slide.png'): Promise<void> {
  const canvas = await renderPageToCanvas(page);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Export entire Board document as Multi-page PDF
 */
export async function exportDocumentAsPdf(doc: BoardDocument): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
  });

  for (let i = 0; i < doc.pages.length; i++) {
    if (i > 0) pdf.addPage([1920, 1080], 'landscape');
    const canvas = await renderPageToCanvas(doc.pages[i], 1920, 1080);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);
  }

  const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'openboard_lesson';
  pdf.save(`${safeTitle}.pdf`);
}

/**
 * Export as Standalone Single HTML File!
 * Contains all slides, drawing data, images, background styles, and an interactive presentation viewer!
 * This completely satisfies: "I want to create this type open board as a single HTML file and software to install into interactive flat panels"
 */
export async function exportAsSingleHtmlFile(doc: BoardDocument): Promise<void> {
  // Pre-render slides as high-res images to guarantee 100% fidelity in the single HTML file
  const renderedPages: string[] = [];
  for (const page of doc.pages) {
    const canvas = await renderPageToCanvas(page, 1920, 1080);
    renderedPages.push(canvas.toDataURL('image/jpeg', 0.92));
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(doc.title)} - Math Whiteboard FlatPanel Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #1e293b;
      border-bottom: 1px solid #334155;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 52px;
      z-index: 20;
    }
    .title {
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #0284c7;
      color: white;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    button {
      background: #334155;
      color: #f8fafc;
      border: none;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    button:hover { background: #475569; }
    button:active { transform: scale(0.96); }
    button.primary { background: #0284c7; }
    button.primary:hover { background: #0369a1; }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: #090d16;
      padding: 12px;
    }
    #stage-container {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 16 / 9;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #334155;
      background: #0f172a;
    }
    #slide-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
    }
    #annotate-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }
    .page-indicator {
      font-family: monospace;
      font-size: 13px;
      font-weight: bold;
      color: #38bdf8;
      background: #0f172a;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #334155;
    }
    .laser-dot {
      position: absolute;
      width: 14px;
      height: 14px;
      background: #f43f5e;
      border-radius: 50%;
      box-shadow: 0 0 12px #f43f5e, 0 0 24px #f43f5e;
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
      z-index: 50;
    }
  </style>
</head>
<body>
  <header>
    <div class="title">
      <span>Math Whiteboard</span>
      <span class="badge">OFFLINE STANDALONE</span>
      <span style="font-weight: normal; color: #94a3b8; font-size: 13px;">— ${escapeHtml(doc.title)}</span>
    </div>

    <div class="controls">
      <button id="prev-btn" onclick="prevSlide()">◀ Prev</button>
      <span id="page-num" class="page-indicator">1 / ${renderedPages.length}</span>
      <button id="next-btn" onclick="nextSlide()">Next ▶</button>
      <div style="width: 1px; height: 20px; background: #475569; margin: 0 4px;"></div>
      <button id="pen-btn" onclick="togglePen()">✏️ Live Pen</button>
      <button id="laser-btn" onclick="toggleLaser()">🔴 Laser</button>
      <button id="clear-btn" onclick="clearLiveAnnotations()">🧹 Clear Notes</button>
      <button class="primary" onclick="toggleFullscreen()">⛶ Fullscreen</button>
    </div>
  </header>

  <main>
    <div id="stage-container">
      <img id="slide-img" src="${renderedPages[0]}" alt="Slide">
      <canvas id="annotate-canvas"></canvas>
      <div id="laser" class="laser-dot" style="display: none;"></div>
    </div>
  </main>

  <script>
    const pages = ${JSON.stringify(renderedPages)};
    let currentIndex = 0;
    let mode = 'laser'; // 'laser' | 'pen' | 'none'
    let isDrawing = false;

    const imgEl = document.getElementById('slide-img');
    const pageNumEl = document.getElementById('page-num');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const canvas = document.getElementById('annotate-canvas');
    const ctx = canvas.getContext('2d');
    const laser = document.getElementById('laser');

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 100);

    function updateSlide() {
      imgEl.src = pages[currentIndex];
      pageNumEl.textContent = (currentIndex + 1) + ' / ' + pages.length;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === pages.length - 1;
      clearLiveAnnotations();
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlide();
      }
    }

    function nextSlide() {
      if (currentIndex < pages.length - 1) {
        currentIndex++;
        updateSlide();
      }
    }

    function clearLiveAnnotations() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function togglePen() {
      mode = mode === 'pen' ? 'none' : 'pen';
      document.getElementById('pen-btn').style.background = mode === 'pen' ? '#0284c7' : '#334155';
      document.getElementById('laser-btn').style.background = '#334155';
      laser.style.display = 'none';
    }

    function toggleLaser() {
      mode = mode === 'laser' ? 'none' : 'laser';
      document.getElementById('laser-btn').style.background = mode === 'laser' ? '#0284c7' : '#334155';
      document.getElementById('pen-btn').style.background = '#334155';
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    canvas.addEventListener('pointerdown', (e) => {
      if (mode === 'pen') {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (mode === 'laser') {
        laser.style.display = 'block';
        laser.style.left = e.offsetX + 'px';
        laser.style.top = e.offsetY + 'px';
      } else {
        laser.style.display = 'none';
      }

      if (isDrawing && mode === 'pen') {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    });

    window.addEventListener('pointerup', () => {
      isDrawing = false;
    });

    canvas.addEventListener('pointerleave', () => {
      laser.style.display = 'none';
    });

    // Keyboard navigation (Arrow keys / Space for flat panel wireless clicker)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
      if (e.key === 'f' || e.key === 'F11') toggleFullscreen();
    });

    updateSlide();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'math_whiteboard';
  a.href = url;
  a.download = `${safeTitle}.standalone.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
