import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  LayoutTemplate,
  Check,
  Grid,
  Square,
  Activity,
  Maximize2,
  Download,
  Plus,
  Compass,
  FileSpreadsheet,
  Table,
  Layers,
  Sparkles,
  PieChart,
  Sliders,
  AlignJustify,
  Crop,
  RotateCcw,
  Scissors,
  Zap,
} from 'lucide-react';
import { BackgroundStyle } from '../../types';

export interface TemplateItem {
  id: string;
  title: string;
  category: 'grids' | 'geometry' | 'algebra' | 'stats' | 'notes';
  description: string;
  recommendedBg?: BackgroundStyle;
  generateCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number, isDark: boolean) => void;
}

export const TEMPLATES_LIBRARY: TemplateItem[] = [
  // 1. GRIDS & COORDINATE SYSTEMS
  {
    id: 'cartesian-4quad',
    title: '4-Quadrant Cartesian Grid (-10 to +10)',
    category: 'grids',
    description: 'Full Cartesian coordinate plane with labeled integer axes, origin (0,0), and fine grid lines.',
    recommendedBg: 'graph-dark',
    generateCanvas: (ctx, w, h, isDark) => {
      const cx = w / 2;
      const cy = h / 2;
      const step = Math.min(w, h) / 24;

      // Background
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.45)' : 'rgba(203, 213, 225, 0.7)';
      for (let x = cx % step; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = cy % step; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Main Axes
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      // X axis
      ctx.moveTo(30, cy);
      ctx.lineTo(w - 30, cy);
      // Arrowheads
      ctx.lineTo(w - 42, cy - 6);
      ctx.moveTo(w - 30, cy);
      ctx.lineTo(w - 42, cy + 6);
      // Y axis
      ctx.moveTo(cx, h - 30);
      ctx.lineTo(cx, 30);
      // Arrowheads
      ctx.lineTo(cx - 6, 42);
      ctx.moveTo(cx, 30);
      ctx.lineTo(cx + 6, 42);
      ctx.stroke();

      // Axis labels & Numbers
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // X ticks
      let val = -10;
      for (let x = cx - 10 * step; x <= cx + 10 * step; x += step) {
        if (Math.abs(val) > 0 && Math.abs(val) <= 10) {
          ctx.beginPath();
          ctx.moveTo(x, cy - 4);
          ctx.lineTo(x, cy + 4);
          ctx.stroke();
          ctx.fillText(val.toString(), x, cy + 14);
        }
        val++;
      }

      // Y ticks
      val = -10;
      for (let y = cy + 10 * step; y >= cy - 10 * step; y -= step) {
        if (Math.abs(val) > 0 && Math.abs(val) <= 10) {
          ctx.beginPath();
          ctx.moveTo(cx - 4, y);
          ctx.lineTo(cx + 4, y);
          ctx.stroke();
          ctx.fillText(val.toString(), cx - 16, y);
        }
        val++;
      }

      // Axis titles
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('x', w - 18, cy - 14);
      ctx.fillText('y', cx + 18, 22);
      ctx.fillText('O', cx - 12, cy + 14);
    },
  },
  {
    id: 'quadrant-1',
    title: 'First Quadrant (Data & Real-World Modeling)',
    category: 'grids',
    description: 'Positive X-Y quadrant designed for distance-time graphs, cost-quantity relationships, and statistics.',
    generateCanvas: (ctx, w, h, isDark) => {
      const ox = 70;
      const oy = h - 60;
      const stepX = (w - 110) / 10;
      const stepY = (oy - 50) / 10;

      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
      for (let i = 0; i <= 10; i++) {
        const x = ox + i * stepX;
        ctx.beginPath();
        ctx.moveTo(x, oy);
        ctx.lineTo(x, 40);
        ctx.stroke();

        const y = oy - i * stepY;
        ctx.beginPath();
        ctx.moveTo(ox, y);
        ctx.lineTo(w - 40, y);
        ctx.stroke();
      }

      // Axes
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#10b981' : '#059669';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(w - 30, oy);
      ctx.lineTo(w - 42, oy - 6);
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, 30);
      ctx.lineTo(ox - 6, 42);
      ctx.stroke();

      // Labels
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 10; i++) {
        ctx.fillText(i.toString(), ox + i * stepX, oy + 18);
        ctx.fillText((i * 10).toString(), ox - 24, oy - i * stepY);
      }
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#10b981' : '#059669';
      ctx.fillText('Time / Quantity (x)', w / 2, h - 18);
      ctx.save();
      ctx.translate(22, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Value / Distance (y)', 0, 0);
      ctx.restore();
    },
  },
  {
    id: 'polar-grid',
    title: 'Polar Coordinate Grid (r, θ)',
    category: 'grids',
    description: 'Concentric circles for polar radius r and radial rays spaced at 15°, 30°, 45°, 60°, and 90° intervals.',
    generateCanvas: (ctx, w, h, isDark) => {
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.44;
      const rings = 5;

      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Concentric circles
      for (let i = 1; i <= rings; i++) {
        const r = (maxR / rings) * i;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.lineWidth = i === rings ? 2 : 1;
        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.3)';
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = isDark ? '#7dd3fc' : '#0284c7';
        ctx.fillText(`r=${i}`, cx + r + 4, cy - 4);
      }

      // Radial Rays
      const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
      angles.forEach(deg => {
        const rad = (deg * Math.PI) / 180;
        const x = cx + Math.cos(rad) * maxR;
        const y = cy - Math.sin(rad) * maxR;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.lineWidth = deg % 90 === 0 ? 2 : 1;
        ctx.strokeStyle = deg % 90 === 0
          ? (isDark ? '#38bdf8' : '#0284c7')
          : (isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.45)');
        ctx.stroke();

        // Degrees label
        const lx = cx + Math.cos(rad) * (maxR + 18);
        const ly = cy - Math.sin(rad) * (maxR + 18);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, lx, ly);
      });
    },
  },
  {
    id: 'trig-radian-grid',
    title: 'Trigonometric Radians Grid (-2π to 2π)',
    category: 'grids',
    description: 'X-axis calibrated in exact multiples of π/2 and π for graphing sin(x), cos(x), and tan(x).',
    generateCanvas: (ctx, w, h, isDark) => {
      const cx = w / 2;
      const cy = h / 2;
      const stepX = (w - 80) / 8; // Each step is pi/2
      const stepY = (h - 80) / 6; // Each step is 1 unit

      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
      for (let i = -4; i <= 4; i++) {
        const x = cx + i * stepX;
        ctx.beginPath();
        ctx.moveTo(x, 30);
        ctx.lineTo(x, h - 30);
        ctx.stroke();
      }
      for (let j = -3; j <= 3; j++) {
        const y = cy + j * stepY;
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(w - 30, y);
        ctx.stroke();
      }

      // Axes
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#e879f9' : '#c026d3';
      ctx.beginPath();
      ctx.moveTo(25, cy);
      ctx.lineTo(w - 25, cy);
      ctx.moveTo(cx, h - 25);
      ctx.lineTo(cx, 25);
      ctx.stroke();

      // Radian Labels
      const radLabels = ['-2π', '-3π/2', '-π', '-π/2', '0', 'π/2', 'π', '3π/2', '2π'];
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = isDark ? '#f0abfc' : '#a21caf';
      ctx.textAlign = 'center';
      for (let i = -4; i <= 4; i++) {
        const x = cx + i * stepX;
        ctx.fillText(radLabels[i + 4], x, cy + 18);
      }
      for (let j = -3; j <= 3; j++) {
        if (j !== 0) {
          const y = cy - j * stepY;
          ctx.fillText(j.toString(), cx - 18, y + 4);
        }
      }
    },
  },
  {
    id: 'number-line-integers',
    title: 'Integer Number Line (-10 to +10)',
    category: 'grids',
    description: 'Horizontal number line with zero benchmark, positive & negative integer tick marks, and directional arrows.',
    generateCanvas: (ctx, w, h, isDark) => {
      const cy = h / 2;
      const startX = 60;
      const endX = w - 60;
      const step = (endX - startX) / 20;

      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Line
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      ctx.moveTo(startX, cy);
      ctx.lineTo(endX, cy);
      // Arrows
      ctx.lineTo(endX - 12, cy - 8);
      ctx.moveTo(endX, cy);
      ctx.lineTo(endX - 12, cy + 8);
      ctx.moveTo(startX, cy);
      ctx.lineTo(startX + 12, cy - 8);
      ctx.moveTo(startX, cy);
      ctx.lineTo(startX + 12, cy + 8);
      ctx.stroke();

      // Ticks & Numbers
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      for (let i = -10; i <= 10; i++) {
        const x = startX + (i + 10) * step;
        const isZero = i === 0;
        ctx.lineWidth = isZero ? 3 : 1.5;
        ctx.strokeStyle = isZero ? '#f59e0b' : (isDark ? '#94a3b8' : '#475569');
        ctx.beginPath();
        ctx.moveTo(x, cy - (isZero ? 16 : 9));
        ctx.lineTo(x, cy + (isZero ? 16 : 9));
        ctx.stroke();

        ctx.fillStyle = isZero ? '#f59e0b' : (isDark ? '#e2e8f0' : '#0f172a');
        ctx.fillText(i.toString(), x, cy + 32);
      }
    },
  },

  // 2. GEOMETRY & TRIGONOMETRY TEMPLATES
  {
    id: 'unit-circle-complete',
    title: 'Unit Circle with Radians & Exact Coordinates',
    category: 'geometry',
    description: 'Complete unit circle showing all 16 special angles (0°, 30°, 45°, 60°...), radians (π/6, π/4...), and (cos, sin) values.',
    generateCanvas: (ctx, w, h, isDark) => {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.35;

      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Axes
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(cx - r - 45, cy);
      ctx.lineTo(cx + r + 45, cy);
      ctx.moveTo(cx, cy - r - 45);
      ctx.lineTo(cx, cy + r + 45);
      ctx.stroke();

      // Circle
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      const keyAngles = [
        { deg: 0, rad: '0', coord: '(1, 0)' },
        { deg: 30, rad: 'π/6', coord: '(√3/2, 1/2)' },
        { deg: 45, rad: 'π/4', coord: '(√2/2, √2/2)' },
        { deg: 60, rad: 'π/3', coord: '(1/2, √3/2)' },
        { deg: 90, rad: 'π/2', coord: '(0, 1)' },
        { deg: 120, rad: '2π/3', coord: '(-1/2, √3/2)' },
        { deg: 135, rad: '3π/4', coord: '(-√2/2, √2/2)' },
        { deg: 150, rad: '5π/6', coord: '(-√3/2, 1/2)' },
        { deg: 180, rad: 'π', coord: '(-1, 0)' },
        { deg: 210, rad: '7π/6', coord: '(-√3/2, -1/2)' },
        { deg: 225, rad: '5π/4', coord: '(-√2/2, -√2/2)' },
        { deg: 240, rad: '4π/3', coord: '(-1/2, -√3/2)' },
        { deg: 270, rad: '3π/2', coord: '(0, -1)' },
        { deg: 300, rad: '5π/3', coord: '(1/2, -√3/2)' },
        { deg: 315, rad: '7π/4', coord: '(√2/2, -√2/2)' },
        { deg: 330, rad: '11π/6', coord: '(√3/2, -1/2)' },
      ];

      keyAngles.forEach(item => {
        const rad = (item.deg * Math.PI) / 180;
        const px = cx + Math.cos(rad) * r;
        const py = cy - Math.sin(rad) * r;

        // Radius line
        ctx.lineWidth = 1;
        ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Point
        ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        // Coordinates
        const lx = cx + Math.cos(rad) * (r + 28);
        const ly = cy - Math.sin(rad) * (r + 28);
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = isDark ? '#fbbf24' : '#b45309';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.deg + '° ' + item.rad, lx, ly - 6);
        ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
        ctx.fillText(item.coord, lx, ly + 6);
      });
    },
  },
  {
    id: 'geometry-proof-table',
    title: 'Two-Column Geometry Proof (Statements & Reasons)',
    category: 'geometry',
    description: 'Structured formal proof table with Statements, Reasons, and numbered steps for Euclidean theorems.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Title & Given block
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('GEOMETRIC PROOF', 40, 40);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('Given: ________________________   Prove: ________________________', 40, 64);

      // Table Box
      const topY = 85;
      const botY = h - 35;
      const midX = w / 2;

      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.strokeRect(40, topY, w - 80, botY - topY);

      // Header row
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(40, topY, w - 80, 36);
      ctx.beginPath();
      ctx.moveTo(40, topY + 36);
      ctx.lineTo(w - 40, topY + 36);
      // Divider
      ctx.moveTo(midX, topY);
      ctx.lineTo(midX, botY);
      ctx.stroke();

      // Headers text
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('STATEMENTS', (40 + midX) / 2, topY + 23);
      ctx.fillText('REASONS', (midX + w - 40) / 2, topY + 23);

      // Horizontal Rows
      const rowCount = 7;
      const rowHeight = (botY - topY - 36) / rowCount;
      ctx.lineWidth = 1;
      ctx.textAlign = 'left';
      for (let i = 1; i <= rowCount; i++) {
        const y = topY + 36 + i * rowHeight;
        if (i < rowCount) {
          ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(w - 40, y);
          ctx.stroke();
        }
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.fillText(`${i}.`, 50, y - rowHeight / 2 + 4);
        ctx.fillText(`${i}.`, midX + 10, y - rowHeight / 2 + 4);
      }
    },
  },

  // 3. ALGEBRA & PROBLEM SOLVING TEMPLATES
  {
    id: 'frayer-model',
    title: 'Frayer Model (Math Vocabulary Organizer)',
    category: 'algebra',
    description: 'Four-quadrant organizer: Definition, Characteristics, Examples, and Non-Examples centered on a target math term.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const midX = w / 2;
      const midY = h / 2;

      // Outer border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.strokeRect(30, 30, w - 60, h - 60);

      // Quadrant lines
      ctx.beginPath();
      ctx.moveTo(30, midY);
      ctx.lineTo(w - 30, midY);
      ctx.moveTo(midX, 30);
      ctx.lineTo(midX, h - 60);
      ctx.stroke();

      // Center Oval / Circle
      const rw = Math.min(w, h) * 0.22;
      const rh = rw * 0.65;
      ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(midX, midY, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Center Title
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET TERM /', midX, midY - 6);
      ctx.fillText('CONCEPT', midX, midY + 12);

      // Quadrant Headers
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.textAlign = 'left';
      ctx.fillText('1. DEFINITION', 45, 55);

      ctx.fillStyle = isDark ? '#10b981' : '#059669';
      ctx.fillText('2. CHARACTERISTICS', midX + 20, 55);

      ctx.fillStyle = isDark ? '#a855f7' : '#7e22ce';
      ctx.fillText('3. EXAMPLES', 45, midY + 25);

      ctx.fillStyle = isDark ? '#f43f5e' : '#e11d48';
      ctx.fillText('4. NON-EXAMPLES', midX + 20, midY + 25);
    },
  },
  {
    id: 'four-square-math',
    title: '4-Square Problem Solving (Understand, Plan, Solve, Check)',
    category: 'algebra',
    description: 'Systematic mathematical problem-solving template based on George Pólya’s 4-step framework.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const midX = w / 2;
      const midY = h / 2;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.strokeRect(30, 30, w - 60, h - 60);

      ctx.beginPath();
      ctx.moveTo(30, midY);
      ctx.lineTo(w - 30, midY);
      ctx.moveTo(midX, 30);
      ctx.lineTo(midX, h - 30);
      ctx.stroke();

      // Quadrant 1
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('1. UNDERSTAND THE PROBLEM', 45, 55);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('• What is given? What are the unknowns? What is asked?', 45, 75);

      // Quadrant 2
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#10b981' : '#059669';
      ctx.fillText('2. DEVISE A PLAN (STRATEGY)', midX + 20, 55);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('• Formula, equation, diagram, table, or pattern to use', midX + 20, 75);

      // Quadrant 3
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillText('3. CARRY OUT PLAN (SOLVE)', 45, midY + 25);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('• Show detailed step-by-step calculations and units', 45, midY + 45);

      // Quadrant 4
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#ec4899' : '#db2777';
      ctx.fillText('4. LOOK BACK (CHECK & REFLECT)', midX + 20, midY + 25);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('• Does the answer make sense? Substitute back into problem.', midX + 20, midY + 45);
    },
  },
  {
    id: 'venn-2circle',
    title: 'Two-Set Venn Diagram (A ∩ B)',
    category: 'algebra',
    description: 'Overlapping circles for Set A, Set B, intersection, and universal set boundary with probability annotations.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Universal box
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.strokeRect(40, 40, w - 80, h - 80);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('Universal Set (ξ / U)', 55, 62);

      const r = Math.min(w, h) * 0.32;
      const cy = h / 2 + 10;
      const cx1 = w / 2 - r * 0.55;
      const cx2 = w / 2 + r * 0.55;

      // Circle A
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)';
      ctx.beginPath();
      ctx.arc(cx1, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Circle B
      ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)';
      ctx.beginPath();
      ctx.arc(cx2, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Labels
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.textAlign = 'center';
      ctx.fillText('Set A', cx1 - r * 0.45, cy - r * 0.6);

      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillText('Set B', cx2 + r * 0.45, cy - r * 0.6);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillText('A ∩ B', w / 2, cy);
    },
  },

  // 4. STATISTICS & PROBABILITY TEMPLATES
  {
    id: 'normal-bell-curve',
    title: 'Normal Distribution Bell Curve (Empirical Rule 68-95-99.7)',
    category: 'stats',
    description: 'Gaussian normal distribution curve with mean μ and standard deviations ±1σ, ±2σ, ±3σ highlighted.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h - 70;
      const sigma = (w - 120) / 7;
      const peakH = h * 0.58;

      // Base line
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(40, cy);
      ctx.lineTo(w - 40, cy);
      ctx.stroke();

      // Normal Bell Curve Function
      ctx.beginPath();
      for (let x = 40; x <= w - 40; x += 2) {
        const z = (x - cx) / sigma;
        const yVal = Math.exp(-0.5 * z * z);
        const y = cy - yVal * peakH;
        if (x === 40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.stroke();

      // Sigma vertical lines & labels
      const sigmas = [-3, -2, -1, 0, 1, 2, 3];
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      sigmas.forEach(s => {
        const x = cx + s * sigma;
        const z = s;
        const yVal = Math.exp(-0.5 * z * z);
        const yTop = cy - yVal * peakH;

        ctx.lineWidth = s === 0 ? 2 : 1;
        ctx.strokeStyle = s === 0 ? '#f59e0b' : (isDark ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.6)');
        ctx.beginPath();
        ctx.moveTo(x, cy);
        ctx.lineTo(x, yTop);
        ctx.stroke();

        ctx.fillStyle = s === 0 ? '#f59e0b' : (isDark ? '#e2e8f0' : '#1e293b');
        const text = s === 0 ? 'μ' : s > 0 ? `μ+${s}σ` : `μ${s}σ`;
        ctx.fillText(text, x, cy + 22);
      });

      // Empirical percentages
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('68.2% within ±1σ', cx, cy - peakH * 0.4);
      ctx.fillStyle = isDark ? '#a855f7' : '#7e22ce';
      ctx.fillText('95.4% within ±2σ', cx, cy - peakH * 0.7);
    },
  },
  {
    id: 'box-whisker-plot',
    title: 'Box-and-Whisker Plot Five-Number Summary',
    category: 'stats',
    description: 'Five-number summary diagram: Minimum, First Quartile Q1, Median Q2, Third Quartile Q3, and Maximum.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const cy = h / 2 - 20;
      const minX = 100;
      const q1X = w * 0.35;
      const medX = w * 0.52;
      const q3X = w * 0.72;
      const maxX = w - 100;
      const boxH = 70;

      // Whiskers
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      // Left whisker
      ctx.moveTo(minX, cy);
      ctx.lineTo(q1X, cy);
      // Min end tick
      ctx.moveTo(minX, cy - 20);
      ctx.lineTo(minX, cy + 20);
      // Right whisker
      ctx.moveTo(q3X, cy);
      ctx.lineTo(maxX, cy);
      // Max end tick
      ctx.moveTo(maxX, cy - 20);
      ctx.lineTo(maxX, cy + 20);
      ctx.stroke();

      // Box (Q1 to Q3)
      ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.15)';
      ctx.fillRect(q1X, cy - boxH / 2, q3X - q1X, boxH);
      ctx.strokeRect(q1X, cy - boxH / 2, q3X - q1X, boxH);

      // Median Line
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(medX, cy - boxH / 2);
      ctx.lineTo(medX, cy + boxH / 2);
      ctx.stroke();

      // Number line scale below
      const scaleY = h - 60;
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(60, scaleY);
      ctx.lineTo(w - 60, scaleY);
      ctx.stroke();

      // Labels
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.textAlign = 'center';
      ctx.fillText('Minimum', minX, cy - 30);
      ctx.fillText('Q1 (25%)', q1X, cy - boxH / 2 - 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('Median (Q2)', medX, cy - boxH / 2 - 12);
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.fillText('Q3 (75%)', q3X, cy - boxH / 2 - 12);
      ctx.fillText('Maximum', maxX, cy - 30);
      ctx.fillText('Interquartile Range (IQR = Q3 - Q1)', (q1X + q3X) / 2, cy + boxH / 2 + 25);
    },
  },

  // 5. CLASSROOM & NOTES TEMPLATES
  {
    id: 'cornell-math-notes',
    title: 'Cornell Notes (Cues, Main Notes & Summary)',
    category: 'notes',
    description: 'Divided note-taking template with Left Recall/Cue column, Right Lecture Notes area, and Bottom Summary block.',
    recommendedBg: 'ruled-white',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const cueW = Math.max(160, w * 0.28);
      const sumH = 110;

      // Header block
      ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
      ctx.fillRect(30, 20, w - 60, 45);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.strokeRect(30, 20, w - 60, 45);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('TOPIC / OBJECTIVE: _____________________________________', 45, 48);
      ctx.fillText('DATE: ___________', w - 180, 48);

      // Main Outer Frame
      ctx.strokeRect(30, 75, w - 60, h - 95);

      // Vertical Divider for Cue Column
      ctx.beginPath();
      ctx.moveTo(30 + cueW, 75);
      ctx.lineTo(30 + cueW, h - 20 - sumH);
      // Horizontal Divider for Summary
      ctx.moveTo(30, h - 20 - sumH);
      ctx.lineTo(w - 30, h - 20 - sumH);
      ctx.stroke();

      // Labels
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillText('QUESTIONS / FORMULAS / KEYWORDS', 45, 98);

      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('LECTURE NOTES / STEP-BY-STEP EXAMPLES', 30 + cueW + 20, 98);

      ctx.fillStyle = isDark ? '#10b981' : '#059669';
      ctx.fillText('SUMMARY (2-3 SENTENCES SYNTHESIS)', 45, h - sumH - 2);
    },
  },
  {
    id: 'split-screen-teach',
    title: 'Split-Screen Teaching Board (Problem Left | Solution Right)',
    category: 'notes',
    description: 'Clean split-board layout for teachers: Display problem statement & diagram on left, derive solution on right.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const midX = w / 2;

      // Vertical Divider
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(midX, 20);
      ctx.lineTo(midX, h - 20);
      ctx.stroke();

      // Headers
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('PROBLEM STATEMENT & GIVEN DIAGRAM', 35, 45);

      ctx.fillStyle = isDark ? '#10b981' : '#059669';
      ctx.fillText('STEP-BY-STEP DERIVATION & SOLUTION', midX + 25, 45);

      // Subtle dashed guideline
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(35, 65);
      ctx.lineTo(midX - 25, 65);
      ctx.moveTo(midX + 25, 65);
      ctx.lineTo(w - 35, 65);
      ctx.stroke();
      ctx.setLineDash([]);
    },
  },
  {
    id: 'isometric-3d-grid',
    title: 'Isometric 3D Projection Grid (30° Triangles)',
    category: 'grids',
    description: 'Calibrated isometric triangular grid for constructing 3D polyhedra, cubes, prisms, cylinders, and engineering orthographic projections.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const spacing = 32;
      const rowHeight = spacing * Math.sin(Math.PI / 3);

      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(2, 132, 199, 0.25)';

      // Vertical lines
      for (let x = 0; x <= w + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Diagonal +30 deg and -30 deg
      const numDiag = Math.ceil((w + h * 2) / spacing);
      for (let i = -numDiag; i <= numDiag; i++) {
        // +30 degree lines
        ctx.beginPath();
        ctx.moveTo(i * spacing, 0);
        ctx.lineTo(i * spacing + h / Math.tan(Math.PI / 3), h);
        ctx.stroke();

        // -30 degree lines
        ctx.beginPath();
        ctx.moveTo(i * spacing, 0);
        ctx.lineTo(i * spacing - h / Math.tan(Math.PI / 3), h);
        ctx.stroke();
      }

      // Title & compass badge
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('ISOMETRIC 3D GRID (30° AXES: X, Y, Z)', 30, 32);

      // 3D coordinate trihedron in corner
      const ox = 70;
      const oy = h - 60;
      const arm = 35;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ef4444'; // Z up
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox, oy - arm);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('z (height)', ox + 4, oy - arm);

      ctx.strokeStyle = '#10b981'; // X (+30 deg)
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + arm * Math.cos(Math.PI / 6), oy + arm * Math.sin(Math.PI / 6));
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.fillText('x (width)', ox + arm * Math.cos(Math.PI / 6) + 4, oy + arm * Math.sin(Math.PI / 6));

      ctx.strokeStyle = '#38bdf8'; // Y (-30 deg)
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox - arm * Math.cos(Math.PI / 6), oy + arm * Math.sin(Math.PI / 6));
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('y (depth)', ox - arm * Math.cos(Math.PI / 6) - 45, oy + arm * Math.sin(Math.PI / 6));
    },
  },
  {
    id: 'pythagorean-geometric-proof',
    title: 'Pythagorean Theorem Visual Proof (a² + b² = c²)',
    category: 'geometry',
    description: 'Visual geometric proof with a 3-4-5 right triangle and square areas a²=9, b²=16, c²=25 rendered on each side.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const u = Math.min(w, h) * 0.055;
      const ox = w * 0.44;
      const oy = h * 0.58;

      const a = 3 * u;
      const b = 4 * u;

      // Triangle Vertices: C is right angle at (ox, oy), B at (ox + b, oy), A at (ox, oy - a)
      const pC = { x: ox, y: oy };
      const pB = { x: ox + b, y: oy };
      const pA = { x: ox, y: oy - a };

      // Draw Square a on leg AC (left)
      ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.18)';
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.fillRect(pC.x - a, pA.y, a, a);
      ctx.strokeRect(pC.x - a, pA.y, a, a);

      // Draw grid lines inside Square a
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.3)';
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(pC.x - a + i * u, pA.y);
        ctx.lineTo(pC.x - a + i * u, pA.y + a);
        ctx.moveTo(pC.x - a, pA.y + i * u);
        ctx.lineTo(pC.x, pA.y + i * u);
        ctx.stroke();
      }

      // Draw Square b on leg CB (bottom)
      ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.18)';
      ctx.strokeStyle = isDark ? '#10b981' : '#059669';
      ctx.lineWidth = 2.5;
      ctx.fillRect(pC.x, pC.y, b, b);
      ctx.strokeRect(pC.x, pC.y, b, b);

      // Grid lines inside Square b
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.3)';
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(pC.x + i * u, pC.y);
        ctx.lineTo(pC.x + i * u, pC.y + b);
        ctx.moveTo(pC.x, pC.y + i * u);
        ctx.lineTo(pC.x + b, pC.y + i * u);
        ctx.stroke();
      }

      // Draw Square c on hypotenuse AB (exterior)
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      // Normal pointing outwards: (-dy, dx)
      const c = Math.hypot(dx, dy);
      const nx = -dy / c * c;
      const ny = dx / c * c;

      const pD = { x: pB.x + nx, y: pB.y + ny };
      const pE = { x: pA.x + nx, y: pA.y + ny };

      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pD.x, pD.y);
      ctx.lineTo(pE.x, pE.y);
      ctx.closePath();
      ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.18)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.stroke();

      // Right Triangle ABC
      ctx.beginPath();
      ctx.moveTo(pC.x, pC.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(pA.x, pA.y);
      ctx.closePath();
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.stroke();

      // Right angle marker
      const sq = 14;
      ctx.strokeRect(pC.x, pC.y - sq, sq, sq);

      // Labels & Math Formulas
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('a² = 3² = 9', pC.x - a / 2 - 35, pA.y + a / 2 + 5);

      ctx.fillStyle = isDark ? '#10b981' : '#059669';
      ctx.fillText('b² = 4² = 16', pC.x + b / 2 - 35, pC.y + b / 2 + 5);

      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillText('c² = 5² = 25', (pA.x + pD.x) / 2 - 35, (pA.y + pD.y) / 2);

      // Title & Proof Box
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillText('PYTHAGOREAN THEOREM PROOF', 35, 45);

      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillText('a² + b² = c²', 35, 75);
      ctx.font = '13px monospace';
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.fillText('9 + 16 = 25  ✓  (Always holds for right triangles)', 35, 96);
    },
  },
  {
    id: 'venn-3circle',
    title: 'Three-Set Venn Diagram (A, B, C with 8 Regions)',
    category: 'algebra',
    description: 'Three mutually overlapping sets for Set Theory, Boolean Logic, and Probability with all 8 regions labeled.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Universal Set Frame
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.strokeRect(30, 25, w - 60, h - 50);

      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('Universal Set (ξ / U)', 45, 48);

      const r = Math.min(w, h) * 0.28;
      const cx = w / 2;
      const cy = h / 2 + 15;

      const c1 = { x: cx - r * 0.55, y: cy - r * 0.35 }; // Top-left A
      const c2 = { x: cx + r * 0.55, y: cy - r * 0.35 }; // Top-right B
      const c3 = { x: cx, y: cy + r * 0.55 };            // Bottom C

      // Circle A
      ctx.beginPath();
      ctx.arc(c1.x, c1.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.stroke();

      // Circle B
      ctx.beginPath();
      ctx.arc(c2.x, c2.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.stroke();

      // Circle C
      ctx.beginPath();
      ctx.arc(c3.x, c3.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.12)';
      ctx.fill();
      ctx.strokeStyle = isDark ? '#10b981' : '#059669';
      ctx.stroke();

      // Labels
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('Set A', c1.x - r * 0.7, c1.y - r * 0.7);

      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillText('Set B', c2.x + r * 0.45, c2.y - r * 0.7);

      ctx.fillStyle = isDark ? '#10b981' : '#059669';
      ctx.fillText('Set C', c3.x - 20, c3.y + r + 24);

      // Center intersection label
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('A ∩ B ∩ C', cx, cy);
      ctx.fillText('A ∩ B', cx, cy - r * 0.45);
      ctx.fillText('A ∩ C', cx - r * 0.4, cy + r * 0.15);
      ctx.fillText('B ∩ C', cx + r * 0.4, cy + r * 0.15);
      ctx.textAlign = 'left';
    },
  },
  {
    id: 'probability-tree',
    title: 'Two-Stage Probability Tree Diagram',
    category: 'stats',
    description: 'Branching tree framework for conditional probability P(A), P(B|A), and combined branch product calculations.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('TWO-STAGE PROBABILITY TREE', 40, 42);

      const rootX = 90;
      const rootY = h / 2;
      const stage1X = w * 0.42;
      const stage2X = w * 0.78;

      const yA1 = h * 0.28;
      const yA2 = h * 0.72;

      const yB1 = h * 0.16;
      const yB2 = h * 0.40;
      const yB3 = h * 0.60;
      const yB4 = h * 0.84;

      ctx.lineWidth = 2.5;

      // Root to Stage 1
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(stage1X, yA1);
      ctx.moveTo(rootX, rootY);
      ctx.lineTo(stage1X, yA2);
      ctx.stroke();

      // Stage 1 to Stage 2
      ctx.strokeStyle = isDark ? '#10b981' : '#059669';
      ctx.beginPath();
      // From A
      ctx.moveTo(stage1X, yA1);
      ctx.lineTo(stage2X, yB1);
      ctx.moveTo(stage1X, yA1);
      ctx.lineTo(stage2X, yB2);
      // From A'
      ctx.moveTo(stage1X, yA2);
      ctx.lineTo(stage2X, yB3);
      ctx.moveTo(stage1X, yA2);
      ctx.lineTo(stage2X, yB4);
      ctx.stroke();

      // Node Circles
      const drawNode = (x: number, y: number, text: string, color: string) => {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
      };

      drawNode(rootX, rootY, 'Start', '#94a3b8');
      drawNode(stage1X, yA1, 'A', '#38bdf8');
      drawNode(stage1X, yA2, "A'", '#38bdf8');
      drawNode(stage2X, yB1, 'B', '#10b981');
      drawNode(stage2X, yB2, "B'", '#10b981');
      drawNode(stage2X, yB3, 'B', '#10b981');
      drawNode(stage2X, yB4, "B'", '#10b981');

      // Probabilities along branches
      ctx.font = '11px monospace';
      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.textAlign = 'center';
      ctx.fillText('P(A)', (rootX + stage1X) / 2 - 10, (rootY + yA1) / 2 - 12);
      ctx.fillText("P(A')", (rootX + stage1X) / 2 - 10, (rootY + yA2) / 2 + 14);

      ctx.fillText('P(B|A)', (stage1X + stage2X) / 2, (yA1 + yB1) / 2 - 12);
      ctx.fillText("P(B'|A)", (stage1X + stage2X) / 2, (yA1 + yB2) / 2 + 14);
      ctx.fillText("P(B|A')", (stage1X + stage2X) / 2, (yA2 + yB3) / 2 - 12);
      ctx.fillText("P(B'|A')", (stage1X + stage2X) / 2, (yA2 + yB4) / 2 + 14);

      // Outcome values at right
      ctx.textAlign = 'left';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillText('Outcome A ∩ B:  P(A) × P(B|A)', stage2X + 24, yB1);
      ctx.fillText("Outcome A ∩ B': P(A) × P(B'|A)", stage2X + 24, yB2);
      ctx.fillText("Outcome A' ∩ B: P(A') × P(B|A')", stage2X + 24, yB3);
      ctx.fillText("Outcome A' ∩ B':P(A') × P(B'|A')", stage2X + 24, yB4);
    },
  },
  {
    id: 'sine-cosine-circle-wave',
    title: 'Unit Circle to Sine Wave Projection Generator',
    category: 'geometry',
    description: 'Visual bridge linking rotating unit circle phasor (cos θ, sin θ) to the periodic sine and cosine wave functions.',
    generateCanvas: (ctx, w, h, isDark) => {
      ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.fillText('UNIT CIRCLE ↔ SINE WAVE PROJECTION: y = sin(θ)', 35, 38);

      const r = Math.min(w, h) * 0.26;
      const cx = 45 + r;
      const cy = h / 2 + 15;

      // Unit Circle Axes
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(cx - r - 20, cy);
      ctx.lineTo(cx + r + 20, cy);
      ctx.moveTo(cx, cy - r - 20);
      ctx.lineTo(cx, cy + r + 20);
      ctx.stroke();

      // Unit Circle
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Sine Wave Axis on Right
      const waveStartX = cx + r + 50;
      const waveEndX = w - 40;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(waveStartX, cy);
      ctx.lineTo(waveEndX, cy);
      ctx.stroke();

      // Current angle θ = 60 deg
      const theta = Math.PI / 3;
      const px = cx + Math.cos(theta) * r;
      const py = cy - Math.sin(theta) * r;

      // Radius arm to point P
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Point P on circle
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Sine Wave Line y = sin(x)
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = isDark ? '#ec4899' : '#db2777';
      const waveLen = waveEndX - waveStartX;
      for (let x = 0; x <= waveLen; x += 2) {
        const angle = (x / waveLen) * (2 * Math.PI);
        const y = cy - Math.sin(angle) * r;
        if (x === 0) ctx.moveTo(waveStartX + x, y);
        else ctx.lineTo(waveStartX + x, y);
      }
      ctx.stroke();

      // Projection line from circle to wave point
      const wavePtX = waveStartX + (theta / (2 * Math.PI)) * waveLen;
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(wavePtX, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point on Sine Wave
      ctx.beginPath();
      ctx.arc(wavePtX, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Labels
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.fillText('θ = 60° (π/3)', cx + 10, cy - 14);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('0', waveStartX - 4, cy + 16);
      ctx.fillText('π/2', waveStartX + waveLen * 0.25 - 8, cy + 16);
      ctx.fillText('π', waveStartX + waveLen * 0.5 - 4, cy + 16);
      ctx.fillText('3π/2', waveStartX + waveLen * 0.75 - 12, cy + 16);
      ctx.fillText('2π', waveEndX - 8, cy + 16);
      ctx.fillText('+1', waveStartX - 20, cy - r + 4);
      ctx.fillText('-1', waveStartX - 20, cy + r + 4);
    },
  },
];

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBackground: (bg: BackgroundStyle) => void;
  onInsertGraphic: (dataUrl: string, width: number, height: number, label: string) => void;
}

interface CropBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyBackground,
  onInsertGraphic,
}) => {
  const [selectedCat, setSelectedCat] = useState<'all' | 'grids' | 'geometry' | 'algebra' | 'stats' | 'notes'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(TEMPLATES_LIBRARY[0]);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Cropping State
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);

  // Reset crop when switching templates
  useEffect(() => {
    setCropBox(null);
  }, [selectedTemplate]);

  // Render high-res preview whenever selection changes
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current || !selectedTemplate) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    selectedTemplate.generateCanvas(ctx, canvas.width, canvas.height, true);
  }, [isOpen, selectedTemplate]);

  if (!isOpen) return null;

  const filtered = selectedCat === 'all'
    ? TEMPLATES_LIBRARY
    : TEMPLATES_LIBRARY.filter(t => t.category === selectedCat);

  // Manual Crop Pointer Events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCropping || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setIsDraggingCrop(true);
    setCropBox({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrop || !cropBox || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    setCropBox(prev => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  const handlePointerUp = () => {
    setIsDraggingCrop(false);
  };

  // Normalized relative and pixel crop bounds
  const getCropRect = () => {
    if (!cropBox || !previewCanvasRef.current) return null;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const minX = Math.min(cropBox.startX, cropBox.currentX);
    const minY = Math.min(cropBox.startY, cropBox.currentY);
    const w = Math.abs(cropBox.currentX - cropBox.startX);
    const h = Math.abs(cropBox.currentY - cropBox.startY);

    return {
      relX: minX / rect.width,
      relY: minY / rect.height,
      relW: w / rect.width,
      relH: h / rect.height,
      pixelX: minX,
      pixelY: minY,
      pixelW: w,
      pixelH: h,
    };
  };

  const currentCropRect = getCropRect();
  const hasValidCrop = !!(currentCropRect && currentCropRect.pixelW > 25 && currentCropRect.pixelH > 25);

  // Smart Auto-Trim: Scans canvas pixels and crops tightly to the drawn content
  const handleAutoTrim = () => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const imgData = ctx.getImageData(0, 0, cw, ch);
    const data = imgData.data;

    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];

    let minX = cw, maxX = 0, minY = ch, maxY = 0;
    let foundContent = false;

    for (let y = 0; y < ch; y += 2) {
      for (let x = 0; x < cw; x += 2) {
        const idx = (y * cw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (a > 20 && diff > 25) {
          foundContent = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!foundContent) return;

    // Generous padding around content
    const pad = 16;
    const clampedMinX = Math.max(0, minX - pad);
    const clampedMaxX = Math.min(cw, maxX + pad);
    const clampedMinY = Math.max(0, minY - pad);
    const clampedMaxY = Math.min(ch, maxY + pad);

    const domRect = canvas.getBoundingClientRect();
    const scaleX = domRect.width / cw;
    const scaleY = domRect.height / ch;

    setCropBox({
      startX: clampedMinX * scaleX,
      startY: clampedMinY * scaleY,
      currentX: clampedMaxX * scaleX,
      currentY: clampedMaxY * scaleY,
    });
    setIsCropping(true);
  };

  // Insert as Movable Graphic Element on Whiteboard (with crop support)
  const handleInsertGraphic = (forceFull: boolean = false) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1200;
    offscreen.height = 800;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    selectedTemplate.generateCanvas(offCtx, 1200, 800, true);

    if (!forceFull && hasValidCrop && currentCropRect) {
      const cropX = Math.max(0, Math.round(currentCropRect.relX * 1200));
      const cropY = Math.max(0, Math.round(currentCropRect.relY * 800));
      const cropW = Math.min(1200 - cropX, Math.round(currentCropRect.relW * 1200));
      const cropH = Math.min(800 - cropY, Math.round(currentCropRect.relH * 800));

      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = Math.max(10, cropW);
      croppedCanvas.height = Math.max(10, cropH);
      const croppedCtx = croppedCanvas.getContext('2d');
      if (croppedCtx) {
        croppedCtx.drawImage(
          offscreen,
          cropX, cropY, cropW, cropH,
          0, 0, cropW, cropH
        );
        const dataUrl = croppedCanvas.toDataURL('image/png');
        const aspect = cropW / cropH;
        const fitWidth = Math.min(840, Math.max(260, Math.round(cropW * 0.72)));
        const fitHeight = Math.round(fitWidth / aspect);
        onInsertGraphic(dataUrl, fitWidth, fitHeight, `Template (Cropped): ${selectedTemplate.title}`);
        onClose();
        return;
      }
    }

    const dataUrl = offscreen.toDataURL('image/png');
    onInsertGraphic(dataUrl, 720, 480, `Template: ${selectedTemplate.title}`);
    onClose();
  };

  // Apply as full-screen slide background
  const handleApplyAsBackground = () => {
    if (selectedTemplate.recommendedBg) {
      onApplyBackground(selectedTemplate.recommendedBg);
    } else {
      handleInsertGraphic(true);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 select-none animate-fadeIn">
      <div className="w-full max-w-5xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Math Whiteboard Templates</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Ready-to-Teach Frameworks
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Coordinate grids, geometry proofs, algebra problem-solving organizers, and statistics charts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0 overflow-x-auto">
          {[
            { id: 'all', label: 'All Templates' },
            { id: 'grids', label: 'Coordinate Grids' },
            { id: 'geometry', label: 'Geometry & Trig' },
            { id: 'algebra', label: 'Algebra & Organizers' },
            { id: 'stats', label: 'Statistics & Data' },
            { id: 'notes', label: 'Classroom & Notes' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCat(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCat === tab.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Split: List & Interactive Live Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Templates Library Column */}
          <div className="md:col-span-5 p-3 overflow-y-auto space-y-2 border-r border-slate-800 bg-slate-900/50">
            {filtered.map(tmpl => {
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{tmpl.title}</span>
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Preview & Action Column */}
          <div className="md:col-span-7 p-4 bg-slate-950 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedTemplate.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedTemplate.description}</p>
                </div>

                {/* Crop Controls Toolbar */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCropping(!isCropping);
                      if (isCropping) setCropBox(null);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      isCropping
                        ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                    title="Toggle manual drag-to-crop region"
                  >
                    <Crop className="w-3.5 h-3.5 text-sky-300" />
                    <span>{isCropping ? 'Crop Mode (Active)' : 'Crop Tool'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoTrim}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white transition"
                    title="Auto-detect non-blank content and trim blank margins"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Auto-Trim</span>
                  </button>

                  {hasValidCrop && (
                    <button
                      type="button"
                      onClick={() => setCropBox(null)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition"
                      title="Reset crop selection to full template"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Preview & Draggable Crop Overlay */}
              <div
                ref={previewContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`relative rounded-xl border-2 overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center transition ${
                  isCropping ? 'cursor-crosshair border-sky-500/60 ring-2 ring-sky-500/20' : 'border-slate-700'
                }`}
              >
                <canvas
                  ref={previewCanvasRef}
                  width={680}
                  height={450}
                  className="w-full h-auto max-h-[360px] object-contain rounded-lg pointer-events-none select-none"
                />

                {/* Active Crop Box Overlay with Dimmed Masks and Handles */}
                {currentCropRect && hasValidCrop && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dimmed Surrounding Mask */}
                    <div
                      className="absolute bg-black/65"
                      style={{ top: 0, left: 0, right: 0, height: `${currentCropRect.pixelY}px` }}
                    />
                    <div
                      className="absolute bg-black/65"
                      style={{
                        top: `${currentCropRect.pixelY + currentCropRect.pixelH}px`,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    />
                    <div
                      className="absolute bg-black/65"
                      style={{
                        top: `${currentCropRect.pixelY}px`,
                        left: 0,
                        width: `${currentCropRect.pixelX}px`,
                        height: `${currentCropRect.pixelH}px`,
                      }}
                    />
                    <div
                      className="absolute bg-black/65"
                      style={{
                        top: `${currentCropRect.pixelY}px`,
                        left: `${currentCropRect.pixelX + currentCropRect.pixelW}px`,
                        right: 0,
                        height: `${currentCropRect.pixelH}px`,
                      }}
                    />

                    {/* Draggable Crop Rectangle */}
                    <div
                      style={{
                        left: `${currentCropRect.pixelX}px`,
                        top: `${currentCropRect.pixelY}px`,
                        width: `${currentCropRect.pixelW}px`,
                        height: `${currentCropRect.pixelH}px`,
                      }}
                      className="absolute border-2 border-dashed border-sky-400 bg-sky-400/10 shadow-2xl ring-1 ring-white/40"
                    >
                      {/* Corner Handle Dots */}
                      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />
                      <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-sky-400 border-2 border-white rounded-full shadow" />

                      {/* Dimension readout tag */}
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-sky-300 font-mono text-[9px] font-bold border border-sky-500/40">
                        {Math.round(currentCropRect.pixelW)} × {Math.round(currentCropRect.pixelH)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Helper hint banner when in crop mode */}
                {isCropping && !hasValidCrop && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/90 border border-sky-500/50 text-sky-200 text-[11px] font-semibold shadow-lg pointer-events-none animate-pulse">
                    Drag across the canvas to crop or click Auto-Trim
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400">
                {hasValidCrop ? (
                  <span className="text-sky-300 font-medium">
                    ✂️ Custom cropped area ready • Blank margins removed
                  </span>
                ) : (
                  'Vector precision layout • Resizable on canvas'
                )}
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                {hasValidCrop && (
                  <button
                    onClick={() => handleInsertGraphic(true)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition border border-slate-700"
                    title="Insert full template without cropping"
                  >
                    Insert Full
                  </button>
                )}

                <button
                  onClick={() => handleInsertGraphic(false)}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition active:scale-95 ${
                    hasValidCrop
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-900/50'
                      : 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/40'
                  }`}
                  title="Insert this math template as an interactive, scalable graphic onto the board"
                >
                  {hasValidCrop ? <Scissors className="w-4 h-4 text-sky-200" /> : <Plus className="w-4 h-4" />}
                  <span>{hasValidCrop ? 'Insert Cropped Area onto Board' : 'Insert onto Whiteboard'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
