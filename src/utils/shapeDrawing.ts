import { ShapeType } from '../types';

/**
 * Draws any of the 26 geometric shapes onto a canvas 2D rendering context.
 * Supports dashed hidden rear lines for 3D shapes (cylinder, cone, cube, sphere).
 */
export function drawGeometricShape(
  ctx: CanvasRenderingContext2D,
  shapeType: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeColor: string,
  fillColor: string,
  strokeWidth: number,
  rotation?: number
) {
  ctx.save();

  if (rotation) {
    const cx = x + width / 2;
    const cy = y + height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = width;
  const h = height;
  const cx = x + w / 2;
  const cy = y + h / 2;

  switch (shapeType) {
    case 'line': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      break;
    }

    case 'dashed-line': {
      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'arrow': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      const angle = Math.atan2(h, w);
      const headlen = Math.min(26, Math.max(12, strokeWidth * 3.5));
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(x + w, y + h);
      ctx.lineTo(
        x + w - headlen * Math.cos(angle - Math.PI / 6),
        y + h - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        x + w - headlen * Math.cos(angle + Math.PI / 6),
        y + h - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'double-arrow': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      const angle = Math.atan2(h, w);
      const headlen = Math.min(26, Math.max(12, strokeWidth * 3.5));
      ctx.fillStyle = strokeColor;
      // Head at end
      ctx.beginPath();
      ctx.moveTo(x + w, y + h);
      ctx.lineTo(
        x + w - headlen * Math.cos(angle - Math.PI / 6),
        y + h - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        x + w - headlen * Math.cos(angle + Math.PI / 6),
        y + h - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      // Head at start
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + headlen * Math.cos(angle - Math.PI / 6),
        y + headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        x + headlen * Math.cos(angle + Math.PI / 6),
        y + headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'ray': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      // Dot at start
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3.5, strokeWidth * 1.5), 0, Math.PI * 2);
      ctx.fill();
      // Arrowhead at end
      const angle = Math.atan2(h, w);
      const headlen = Math.min(26, Math.max(12, strokeWidth * 3.5));
      ctx.beginPath();
      ctx.moveTo(x + w, y + h);
      ctx.lineTo(
        x + w - headlen * Math.cos(angle - Math.PI / 6),
        y + h - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        x + w - headlen * Math.cos(angle + Math.PI / 6),
        y + h - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'angle': {
      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
      // Arc indicating interior angle
      const arcR = Math.min(w * 0.35, h * 0.35, 36);
      const angle1 = Math.atan2(-h, w);
      ctx.beginPath();
      ctx.arc(x, y + h, arcR, 0, angle1, true);
      ctx.stroke();
      break;
    }

    case 'rect': {
      if (fillColor && fillColor !== 'transparent') ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      break;
    }

    case 'square': {
      const side = Math.min(Math.abs(w), Math.abs(h));
      if (fillColor && fillColor !== 'transparent') ctx.fillRect(x, y, side, side);
      ctx.strokeRect(x, y, side, side);
      break;
    }

    case 'circle': {
      const r = Math.min(Math.abs(w), Math.abs(h)) / 2;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'ellipse': {
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'triangle': {
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'right-triangle': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      // Right angle marker
      const sq = Math.min(w * 0.15, h * 0.15, 20);
      ctx.beginPath();
      ctx.moveTo(x, y + h - sq);
      ctx.lineTo(x + sq, y + h - sq);
      ctx.lineTo(x + sq, y + h);
      ctx.stroke();
      break;
    }

    case 'scalene-triangle': {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.35, y);
      ctx.lineTo(x + w, y + h * 0.95);
      ctx.lineTo(x, y + h * 0.8);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'parallelogram': {
      const shift = w * 0.25;
      ctx.beginPath();
      ctx.moveTo(x + shift, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - shift, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'rhombus': {
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + w, cy);
      ctx.lineTo(cx, y + h);
      ctx.lineTo(x, cy);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'trapezoid': {
      const inset = w * 0.22;
      ctx.beginPath();
      ctx.moveTo(x + inset, y);
      ctx.lineTo(x + w - inset, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'kite': {
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + w * 0.85, y + h * 0.35);
      ctx.lineTo(cx, y + h);
      ctx.lineTo(x + w * 0.15, y + h * 0.35);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'pentagon': {
      ctx.beginPath();
      const r = Math.min(Math.abs(w), Math.abs(h)) / 2;
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'hexagon': {
      ctx.beginPath();
      const r = Math.min(Math.abs(w), Math.abs(h)) / 2;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'star': {
      const spikes = 5;
      const outerR = Math.min(Math.abs(w), Math.abs(h)) / 2;
      const innerR = outerR * 0.45;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
      }
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'semicircle': {
      const r = Math.min(Math.abs(w), Math.abs(h) * 2) / 2;
      ctx.beginPath();
      ctx.arc(cx, y + h, r, Math.PI, 0);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'sector': {
      const r = Math.min(Math.abs(w), Math.abs(h));
      ctx.beginPath();
      ctx.moveTo(cx, y + h);
      ctx.arc(cx, y + h, r, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.closePath();
      if (fillColor && fillColor !== 'transparent') ctx.fill();
      ctx.stroke();
      break;
    }

    case 'cube': {
      // 3D Isometric Wireframe Cube with fill support
      const d = Math.min(Math.abs(w) * 0.28, Math.abs(h) * 0.28);
      const fw = Math.abs(w) - d;
      const fh = Math.abs(h) - d;

      if (fillColor && fillColor !== 'transparent') {
        ctx.save();
        // Top Face
        ctx.beginPath();
        ctx.moveTo(x, y + d);
        ctx.lineTo(x + d, y);
        ctx.lineTo(x + fw + d, y);
        ctx.lineTo(x + fw, y + d);
        ctx.closePath();
        ctx.fill();

        // Right Face
        ctx.beginPath();
        ctx.moveTo(x + fw, y + d);
        ctx.lineTo(x + fw + d, y);
        ctx.lineTo(x + fw + d, y + fh);
        ctx.lineTo(x + fw, y + d + fh);
        ctx.closePath();
        ctx.fill();

        // Front Face
        ctx.fillRect(x, y + d, fw, fh);
        ctx.restore();
      }

      // Front square
      ctx.strokeRect(x, y + d, fw, fh);
      // Rear square
      ctx.strokeRect(x + d, y, fw, fh);
      // Connecting 4 edges
      ctx.beginPath();
      ctx.moveTo(x, y + d);
      ctx.lineTo(x + d, y);
      ctx.moveTo(x + fw, y + d);
      ctx.lineTo(x + fw + d, y);
      ctx.moveTo(x, y + d + fh);
      ctx.lineTo(x + d, y + fh);
      ctx.moveTo(x + fw, y + d + fh);
      ctx.lineTo(x + fw + d, y + fh);
      ctx.stroke();
      break;
    }

    case 'cylinder': {
      // 3D Cylinder with dashed rear curve matching screenshot!
      const rx = Math.abs(w) / 2;
      const ry = Math.min(Math.abs(h) * 0.2, rx * 0.45);
      const topCy = y + ry;
      const botCy = y + Math.abs(h) - ry;

      if (fillColor && fillColor !== 'transparent') {
        // Body fill: seamless path connecting left side, bottom ellipse arc, right side, and top ellipse arc
        ctx.beginPath();
        ctx.moveTo(x, topCy);
        ctx.lineTo(x, botCy);
        ctx.ellipse(cx, botCy, rx, ry, 0, Math.PI, 0, true);
        ctx.lineTo(x + Math.abs(w), topCy);
        ctx.ellipse(cx, topCy, rx, ry, 0, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // Top cap fill
        ctx.beginPath();
        ctx.ellipse(cx, topCy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Top complete ellipse
      ctx.beginPath();
      ctx.ellipse(cx, topCy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Left and right vertical sides
      ctx.beginPath();
      ctx.moveTo(x, topCy);
      ctx.lineTo(x, botCy);
      ctx.moveTo(x + Math.abs(w), topCy);
      ctx.lineTo(x + Math.abs(w), botCy);
      ctx.stroke();

      // Bottom ellipse: front solid half
      ctx.beginPath();
      ctx.ellipse(cx, botCy, rx, ry, 0, 0, Math.PI);
      ctx.stroke();

      // Bottom ellipse: rear hidden dashed half (matching screenshot!)
      ctx.save();
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.ellipse(cx, botCy, rx, ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'cone': {
      // 3D Cone with dashed rear base curve matching screenshot!
      const rx = Math.abs(w) / 2;
      const ry = Math.min(Math.abs(h) * 0.2, rx * 0.45);
      const apexX = cx;
      const apexY = y;
      const baseCy = y + Math.abs(h) - ry;

      if (fillColor && fillColor !== 'transparent') {
        // Seamless cone fill: apex to bottom-left, along front base curve to bottom-right, back to apex
        ctx.beginPath();
        ctx.moveTo(apexX, apexY);
        ctx.lineTo(x, baseCy);
        ctx.ellipse(cx, baseCy, rx, ry, 0, Math.PI, 0, true);
        ctx.lineTo(apexX, apexY);
        ctx.closePath();
        ctx.fill();
      }

      // Two side lines from apex to base extremes
      ctx.beginPath();
      ctx.moveTo(apexX, apexY);
      ctx.lineTo(x, baseCy);
      ctx.moveTo(apexX, apexY);
      ctx.lineTo(x + Math.abs(w), baseCy);
      ctx.stroke();

      // Base ellipse: front solid half
      ctx.beginPath();
      ctx.ellipse(cx, baseCy, rx, ry, 0, 0, Math.PI);
      ctx.stroke();

      // Base ellipse: rear hidden dashed half (matching screenshot!)
      ctx.save();
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.ellipse(cx, baseCy, rx, ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'sphere': {
      // 3D Sphere with equator wireframe and fill support
      const r = Math.min(Math.abs(w), Math.abs(h)) / 2;

      if (fillColor && fillColor !== 'transparent') {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Equator ellipse: front half solid
      const eqRy = r * 0.35;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, eqRy, 0, 0, Math.PI);
      ctx.stroke();

      // Equator ellipse: back half dashed
      ctx.save();
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, eqRy, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'coordinate': {
      const midX = x + w / 2;
      const midY = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(x, midY);
      ctx.lineTo(x + w, midY);
      ctx.moveTo(midX, y);
      ctx.lineTo(midX, y + h);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Standard Ray Casting algorithm for point-in-polygon containment test.
 */
export function isPointInPolygon(
  point: { x: number; y: number },
  polygon: { x: number; y: number }[]
): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
