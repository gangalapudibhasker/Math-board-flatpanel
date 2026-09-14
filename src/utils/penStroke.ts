import { Point, StrokeElement, PenSensitivityConfig, PenProfile, PenNibStyle } from '../types';

export const DEFAULT_PEN_SENSITIVITY: PenSensitivityConfig = {
  enabled: true,
  profile: 'medium',
  nibStyle: 'ballpoint',
  minScale: 0.65,
  maxScale: 1.35,
};

/**
 * Calculates dynamically scaled widths for each point along a stroke path
 * based on hardware pressure, velocity dynamics, and user sensitivity profile.
 *
 * @param isLive When true, suppresses end-tapering so the ink directly beneath
 * the active pen tip doesn't pulse or shrink while drawing.
 */
export function calculateStrokeWidths(
  points: Point[],
  baseWidth: number,
  config: PenSensitivityConfig = DEFAULT_PEN_SENSITIVITY,
  isLive: boolean = false
): number[] {
  if (points.length === 0) return [];
  if (points.length === 1) return [baseWidth];

  // If sensitivity is disabled or set to uniform, use constant width
  if (!config.enabled || config.profile === 'uniform') {
    return points.map(() => baseWidth);
  }

  const isBallpoint = config.nibStyle === 'ballpoint';
  const isCalligraphy = config.nibStyle === 'calligraphy';

  // Ballpoint has a tighter, crisper dynamic range for neat math notation
  const minRatio = isBallpoint ? 0.75 : (config.minScale ?? 0.65);
  const maxRatio = isBallpoint ? 1.25 : (config.maxScale ?? 1.35);

  // Check if hardware pressure is active & varying
  let hasHardwarePressure = false;
  for (const p of points) {
    if (typeof p.pressure === 'number' && p.pressure > 0 && Math.abs(p.pressure - 0.5) > 0.04) {
      hasHardwarePressure = true;
      break;
    }
  }

  const rawWidths: number[] = [];

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    let effectivePressure = 0.5;

    if (hasHardwarePressure && typeof pt.pressure === 'number' && pt.pressure > 0) {
      // Clamped hardware pressure [0.02, 1.0]
      const p = Math.max(0.02, Math.min(1.0, pt.pressure));

      switch (config.profile) {
        case 'soft':
          // Soft Touch: light touch produces fuller line
          effectivePressure = Math.pow(p, 0.65);
          break;
        case 'firm':
          // Firm: deliberate pressure required
          effectivePressure = Math.pow(p, 1.3);
          break;
        case 'velocity':
          // Velocity mode
          effectivePressure = getVelocityPressure(points, i);
          break;
        case 'medium':
        default:
          // Balanced natural response
          effectivePressure = Math.pow(p, 0.85);
          break;
      }
    } else {
      // Velocity-based fallback for infrared flat panels, touch screens, and mice
      effectivePressure = getVelocityPressure(points, i);
    }

    // Map effective pressure to width range
    let w = baseWidth * (minRatio + effectivePressure * (maxRatio - minRatio));

    // Calligraphy chisel nib: varies width by stroke direction
    if (isCalligraphy && i > 0) {
      const prev = points[i - 1];
      const angle = Math.atan2(pt.y - prev.y, pt.x - prev.x);
      const chiselAngle = Math.PI / 4;
      const angleFactor = Math.abs(Math.sin(angle - chiselAngle));
      w = w * (0.65 + angleFactor * 0.7);
    }

    rawWidths.push(Math.max(1, w));
  }

  // Low-Pass Filter: smooth width transitions to eliminate digitizer noise / stepping
  const smoothedWidths: number[] = [];
  let prevW = rawWidths[0];
  const alpha = 0.35; // Filter smoothing constant

  for (let i = 0; i < rawWidths.length; i++) {
    const curW = rawWidths[i];
    const smoothW = prevW * (1 - alpha) + curW * alpha;
    smoothedWidths.push(smoothW);
    prevW = smoothW;
  }

  // Start & End Taper: natural pen lift-off and initial contact
  // CRITICAL: Only taper the end when the stroke is finished (pen lifted)
  const taperLen = Math.min(3, Math.floor(points.length / 2));
  for (let i = 0; i < taperLen; i++) {
    const startRatio = (i + 1) / (taperLen + 1);
    smoothedWidths[i] *= 0.65 + 0.35 * startRatio;

    if (!isLive) {
      const endIdx = points.length - 1 - i;
      const endRatio = (i + 1) / (taperLen + 1);
      smoothedWidths[endIdx] *= 0.65 + 0.35 * endRatio;
    }
  }

  return smoothedWidths;
}

/**
 * Computes velocity-based normalized pressure [0, 1]
 * Smooth, controlled response to avoid erratic thick/thin spikes.
 */
function getVelocityPressure(points: Point[], index: number): number {
  if (index === 0) {
    if (points.length > 1) {
      const dist = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      return Math.max(0.35, Math.min(0.85, 1.0 - dist / 40));
    }
    return 0.5;
  }

  const cur = points[index];
  const prev = points[index - 1];
  const dist = Math.hypot(cur.x - prev.x, cur.y - prev.y);

  // If timestamps are provided, calculate true velocity (px / ms)
  if (cur.time && prev.time && cur.time > prev.time) {
    const dt = Math.max(4, cur.time - prev.time);
    const velocity = dist / dt; // px/ms
    // Typical writing velocity: 0.1 to 3.0 px/ms
    const speedRatio = Math.max(0, Math.min(1.0, (velocity - 0.2) / 2.5));
    return 1.0 - speedRatio * 0.45;
  }

  // Fallback to spatial distance per step
  const speedRatio = Math.max(0, Math.min(1.0, (dist - 2) / 30));
  return 1.0 - speedRatio * 0.45;
}

/**
 * Multi-point smoothing for strokes (Chaikin's algorithm)
 * Preserves pressure and timestamp data for each smoothed point.
 */
export function smoothStrokePointsWithPressure(points: Point[]): Point[] {
  if (points.length <= 2) return points;
  const smoothed: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];

    smoothed.push({
      x: 0.25 * p0.x + 0.5 * p1.x + 0.25 * p2.x,
      y: 0.25 * p0.y + 0.5 * p1.y + 0.25 * p2.y,
      pressure: p1.pressure,
      time: p1.time,
    });
  }

  smoothed.push(points[points.length - 1]);
  return smoothed;
}

/**
 * Universal stroke renderer for HTML5 Canvas.
 * Renders high-fidelity, variable-width Bézier curves with round caps and joins.
 * Works seamlessly in live overlay, main canvas, and export renderers.
 */
export function renderStrokeToContext(
  ctx: CanvasRenderingContext2D,
  stroke: {
    points: Point[];
    color: string;
    width: number;
    opacity: number;
    isHighlighter?: boolean;
    widths?: number[];
    nibStyle?: PenNibStyle;
    profile?: PenProfile;
  },
  config?: PenSensitivityConfig,
  isLive: boolean = false
): void {
  const pts = stroke.points;
  if (!pts || pts.length === 0) return;

  const color = stroke.color || '#ffffff';
  const opacity = typeof stroke.opacity === 'number' ? Math.max(0, Math.min(1, stroke.opacity)) : 1;
  const baseWidth = typeof stroke.width === 'number' && stroke.width > 0 ? stroke.width : 4;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = opacity;

  // HIGHLIGHTER: uniform translucent stroke to prevent overlap accumulation
  if (stroke.isHighlighter) {
    ctx.lineWidth = baseWidth;
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, Math.max(1, stroke.width / 2), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      if (pts.length >= 2) {
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // SINGLE POINT: Fast dot rendering (for math decimals, multiplication dots, periods)
  if (pts.length === 1) {
    const w = stroke.widths && stroke.widths[0] ? stroke.widths[0] : stroke.width;
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, Math.max(1, w / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Determine widths array
  let widths = stroke.widths;
  if (!widths || widths.length !== pts.length) {
    const activeCfg: PenSensitivityConfig = config || {
      enabled: stroke.profile !== 'uniform',
      profile: stroke.profile || 'medium',
      nibStyle: stroke.nibStyle || 'ballpoint',
      minScale: 0.65,
      maxScale: 1.35,
    };
    widths = calculateStrokeWidths(pts, stroke.width, activeCfg, isLive);
  }

  // TWO POINTS: single straight segment
  if (pts.length === 2) {
    const segWidth = (widths[0] + widths[1]) / 2;
    ctx.lineWidth = Math.max(1, segWidth);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 3+ POINTS: Smooth quadratic Bézier segments between midpoints
  // Check if widths are effectively uniform
  const isUniform = !widths || widths.every(w => Math.abs(w - widths[0]) < 0.2);
  if (isUniform) {
    ctx.lineWidth = Math.max(1, widths ? widths[0] : stroke.width);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    const m0x = (pts[0].x + pts[1].x) / 2;
    const m0y = (pts[0].y + pts[1].y) / 2;
    ctx.lineTo(m0x, m0y);
    for (let i = 1; i < pts.length - 1; i++) {
      const nextMidX = (pts[i].x + pts[i + 1].x) / 2;
      const nextMidY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, nextMidX, nextMidY);
    }
    const lastIdx = pts.length - 1;
    ctx.lineTo(pts[lastIdx].x, pts[lastIdx].y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Variable width rendering: Batch segments where width difference is subtle (< 0.4px)
  // for peak 60fps/120fps interactive flat panel performance
  let currentWidth = widths[0];
  ctx.lineWidth = Math.max(1, currentWidth);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  const m0x = (pts[0].x + pts[1].x) / 2;
  const m0y = (pts[0].y + pts[1].y) / 2;
  ctx.lineTo(m0x, m0y);

  for (let i = 1; i < pts.length - 1; i++) {
    const pCur = pts[i];
    const pNext = pts[i + 1];
    const nextMidX = (pCur.x + pNext.x) / 2;
    const nextMidY = (pCur.y + pNext.y) / 2;
    const w = widths[i] ?? stroke.width;

    if (Math.abs(w - currentWidth) > 0.35) {
      ctx.stroke();
      ctx.beginPath();
      const prevMidX = (pts[i - 1].x + pCur.x) / 2;
      const prevMidY = (pts[i - 1].y + pCur.y) / 2;
      ctx.moveTo(prevMidX, prevMidY);
      currentWidth = w;
      ctx.lineWidth = Math.max(1, currentWidth);
    }
    ctx.quadraticCurveTo(pCur.x, pCur.y, nextMidX, nextMidY);
  }

  const lastIdx = pts.length - 1;
  ctx.lineTo(pts[lastIdx].x, pts[lastIdx].y);
  ctx.stroke();

  ctx.restore();
}
