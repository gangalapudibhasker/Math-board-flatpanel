import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  try {
    // Attempt local worker URL or unpkg/cdnjs fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  } catch (err) {
    console.warn('PDF.js worker setup warning:', err);
  }
}

export interface PdfDocumentInfo {
  numPages: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  filename: string;
}

export async function loadPdfDocument(file: File | ArrayBuffer | Uint8Array, filename = 'document.pdf'): Promise<PdfDocumentInfo> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;
  return {
    numPages: pdfDoc.numPages,
    pdfDoc,
    filename,
  };
}

export async function renderPdfPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale = 1.5
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not get 2D canvas context');
  
  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return { canvas, width: viewport.width, height: viewport.height };
}

export async function renderPdfPageToDataUrl(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale = 1.5
): Promise<string> {
  const { canvas } = await renderPdfPageToCanvas(pdfDoc, pageNum, scale);
  return canvas.toDataURL('image/png');
}

export async function cropPdfRegion(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  cropBox: { x: number; y: number; width: number; height: number }, // Relative (0-1) or absolute in viewport
  displayScale: number,
  highResMultiplier = 2.0 // Render 2x sharper for 4K Flat Panels
): Promise<{ dataUrl: string; width: number; height: number; aspectRatio: number }> {
  // Render page at high resolution
  const renderScale = displayScale * highResMultiplier;
  const { canvas } = await renderPdfPageToCanvas(pdfDoc, pageNum, renderScale);

  // Calculate crop coordinates on the high-res canvas
  const cropX = Math.max(0, cropBox.x * highResMultiplier);
  const cropY = Math.max(0, cropBox.y * highResMultiplier);
  const cropW = Math.min(canvas.width - cropX, cropBox.width * highResMultiplier);
  const cropH = Math.min(canvas.height - cropY, cropBox.height * highResMultiplier);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = Math.max(1, Math.round(cropW));
  croppedCanvas.height = Math.max(1, Math.round(cropH));
  const ctx = croppedCanvas.getContext('2d');
  
  if (!ctx) throw new Error('Could not create crop canvas');

  // Fill with crisp white background before drawing
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);

  ctx.drawImage(
    canvas,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  const dataUrl = croppedCanvas.toDataURL('image/png');
  return {
    dataUrl,
    width: croppedCanvas.width,
    height: croppedCanvas.height,
    aspectRatio: croppedCanvas.width / croppedCanvas.height,
  };
}

/**
 * Generates an instant sample lesson PDF with rich math and science content
 * so teachers can immediately test the PDF loader and Cropping tool!
 */
export function generateSampleLessonPdf(): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Page 1: Math & Geometry Worksheet
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text('Algebra & Geometry Classroom Worksheet', 20, 25);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('Math Whiteboard Teaching Material • Lesson 4: Coordinate Geometry & Triangles', 20, 33);
  doc.setDrawColor(203, 213, 225);
  doc.line(20, 37, 190, 37);

  // Problem 1 Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 45, 170, 52, 3, 3, 'FD');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Question 1: Quadratic Function Analysis', 26, 55);
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('Given the quadratic function:  f(x) = 2x² - 8x + 6', 26, 64);
  doc.text('(a) Find the roots of the equation f(x) = 0 by factoring.', 26, 72);
  doc.text('(b) Determine the coordinates of the vertex (h, k).', 26, 80);
  doc.text('(c) Sketch the parabolic curve on the interactive board.', 26, 88);

  // Problem 2 Box (Right Triangle with drawn diagram)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 105, 170, 75, 3, 3, 'FD');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Question 2: Pythagorean Theorem & Trigonometry', 26, 115);
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('In right-angled triangle ABC, with right angle at C:', 26, 124);
  doc.text('• Leg AC = 6 cm', 26, 132);
  doc.text('• Leg BC = 8 cm', 26, 140);
  doc.text('Task: Calculate Hypotenuse AB, sin(A), and cos(A).', 26, 148);

  // Vector triangle graphic
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.8);
  doc.line(130, 165, 175, 165); // BC = 8
  doc.line(130, 165, 130, 130); // AC = 6
  doc.line(130, 130, 175, 165); // AB
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.text('A', 128, 128);
  doc.text('C', 126, 170);
  doc.text('B', 178, 168);
  doc.text('6 cm', 119, 148);
  doc.text('8 cm', 150, 170);

  // Problem 3 Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 188, 170, 85, 3, 3, 'FD');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Question 3: Physics - Velocity vs. Time Graph', 26, 198);
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text('A vehicle accelerates uniformly from rest at a = 2.5 m/s² for 8 seconds.', 26, 207);
  doc.text('It then cruises at constant speed for 12 seconds before braking to rest in 4 seconds.', 26, 215);
  doc.text('1. Calculate the peak velocity attained.', 26, 223);
  doc.text('2. Determine total distance traveled by calculating area under the curve.', 26, 231);
  doc.text('3. Use the whiteboard ruler tool to sketch the v-t graph.', 26, 239);

  // Page 2: Science & Biology Diagrams
  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text('Science & Cell Biology Illustrated Guide', 20, 25);
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text('Use the Math Whiteboard PDF Snipper to crop sections onto your board', 20, 33);
  doc.setDrawColor(203, 213, 225);
  doc.line(20, 37, 190, 37);

  // Diagram 1
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 45, 170, 110, 3, 3, 'FD');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('Plant Cell vs Animal Cell Structures', 26, 56);
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Key Organelles for classroom discussion:', 26, 66);
  doc.text('1. Nucleus: Contains genetic material (DNA) controlling cell activity.', 26, 76);
  doc.text('2. Mitochondria: Powerhouse of the cell, generates ATP via cellular respiration.', 26, 86);
  doc.text('3. Chloroplasts: Unique to plant cells, contains chlorophyll for photosynthesis.', 26, 96);
  doc.text('4. Cell Wall: Rigid cellulose layer providing structural support to plants.', 26, 106);
  doc.text('5. Ribosomes: Sites of biological protein synthesis.', 26, 116);
  doc.text('Exercise: Drag & drop labels onto the organelles on your board.', 26, 130);

  // Chemistry Periodic Table Section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 165, 170, 105, 3, 3, 'FD');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text('Chemistry: Stoichiometry & Chemical Equations', 26, 176);
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Balance the following combustion and redox reactions:', 26, 187);
  doc.setFont('courier', 'bold');
  doc.text('Reaction 1:  _ C₃H₈ + _ O₂  --->  _ CO₂ + _ H₂O', 26, 198);
  doc.text('Reaction 2:  _ Fe + _ O₂  --->  _ Fe₂O₃', 26, 208);
  doc.text('Reaction 3:  _ Al + _ HCl --->  _ AlCl₃ + _ H₂', 26, 218);
  doc.setFont('helvetica', 'normal');
  doc.text('Teacher Note: Crop each reaction individually to solve step-by-step with students!', 26, 235);

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}
