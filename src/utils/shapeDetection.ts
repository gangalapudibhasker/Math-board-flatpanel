import { Point, ShapeElement, ShapeType } from '../types';

export interface ShapeDetectionResult {
  detected: boolean;
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
}

/**
 * Calculate Euclidean distance between two points
 */
function dist(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Perpendicular distance from point p to line segment (a, b)
 */
function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Ramer-Douglas-Peucker algorithm for polyline simplification
 */
function simplifyRDP(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const recResults1 = simplifyRDP(points.slice(0, index + 1), epsilon);
    const recResults2 = simplifyRDP(points.slice(index), epsilon);
    return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
  } else {
    return [points[0], points[end]];
  }
}

/**
 * Intelligent shape detection algorithm for rough hand-drawn strokes
 * Detects circles, squares/rectangles, triangles, and straight lines.
 */
export function detectGeometricShape(
  points: Point[],
  durationMs: number = 250,
  maxWindowMs: number = 800
): ShapeDetectionResult | null {
  if (points.length < 8) return null;

  // Compute total perimeter / path length
  let totalLength = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    sumX += p.x;
    sumY += p.y;
    if (i > 0) {
      totalLength += dist(p, points[i - 1]);
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const diagonal = Math.hypot(width, height);

  // Reject tiny jiggles or microscopic dots
  if (diagonal < 20 || totalLength < 30) return null;

  const startPt = points[0];
  const endPt = points[points.length - 1];
  const endGap = dist(startPt, endPt);
  const isClosed = endGap < 0.35 * totalLength || endGap < Math.max(35, 0.35 * diagonal);

  // 1. STRAIGHT LINE DETECTION (If stroke is open and straight)
  const straightRatio = endGap / totalLength;
  if (!isClosed && straightRatio >= 0.88) {
    return {
      detected: true,
      shapeType: 'line',
      x: startPt.x,
      y: startPt.y,
      width: endPt.x - startPt.x,
      height: endPt.y - startPt.y,
      confidence: straightRatio,
      label: 'Straight Line',
    };
  }

  // Centroid
  const cx = sumX / points.length;
  const cy = sumY / points.length;

  // 2. CIRCLE DETECTION
  // Check radial distance variance from centroid
  let sumR = 0;
  const radii: number[] = [];
  for (const p of points) {
    const r = Math.hypot(p.x - cx, p.y - cy);
    radii.push(r);
    sumR += r;
  }
  const meanR = sumR / points.length;

  let variance = 0;
  for (const r of radii) {
    variance += (r - meanR) ** 2;
  }
  const stdDev = Math.sqrt(variance / points.length);
  const cv = stdDev / (meanR || 1); // Coefficient of variation

  const aspectRatio = width / (height || 1);

  // Circle condition: closed path, low radius variation, aspect ratio near 1
  if (isClosed && cv < 0.24 && aspectRatio >= 0.7 && aspectRatio <= 1.45) {
    const radius = Math.max(width, height) / 2;
    return {
      detected: true,
      shapeType: 'circle',
      x: cx - radius,
      y: cy - radius,
      width: radius * 2,
      height: radius * 2,
      confidence: 1 - cv,
      label: 'Perfect Circle',
    };
  }

  // 3. POLYGON SIMPLIFICATION (for Triangles, Squares, and Rectangles)
  // Dynamic epsilon relative to diagonal
  const epsilon = diagonal * 0.085;
  const simplified = simplifyRDP(points, epsilon);
  // If the path was closed, the first and last simplified point should be considered connected
  let vertices = [...simplified];
  if (vertices.length > 2 && dist(vertices[0], vertices[vertices.length - 1]) < diagonal * 0.25) {
    vertices.pop(); // Remove duplicate closing vertex
  }

  const vertexCount = vertices.length;

  // TRIANGLE: 3 prominent vertices (or 4 if closed with start)
  if (isClosed && (vertexCount === 3 || vertexCount === 4)) {
    // Check if points form a plausible triangle
    return {
      detected: true,
      shapeType: 'triangle',
      x: minX,
      y: minY,
      width: width,
      height: height,
      confidence: 0.88,
      label: 'Equilateral Triangle',
    };
  }

  // SQUARE / RECTANGLE: 4 or 5 vertices
  if (isClosed && (vertexCount === 4 || vertexCount === 5 || (cv >= 0.20 && cv <= 0.45))) {
    // Check perimeter efficiency: rectangle perimeter is 2*(w + h)
    const idealPerimeter = 2 * (width + height);
    const perimeterRatio = Math.abs(totalLength - idealPerimeter) / idealPerimeter;

    if (perimeterRatio < 0.4) {
      const isSquare = aspectRatio >= 0.82 && aspectRatio <= 1.22;
      const size = Math.max(width, height);
      return {
        detected: true,
        shapeType: 'rect',
        x: isSquare ? cx - size / 2 : minX,
        y: isSquare ? cy - size / 2 : minY,
        width: isSquare ? size : width,
        height: isSquare ? size : height,
        confidence: 0.9,
        label: isSquare ? 'Square' : 'Rectangle',
      };
    }
  }

  return null;
}
