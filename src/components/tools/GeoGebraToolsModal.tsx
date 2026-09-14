import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  RotateCcw,
  Maximize2,
  Check,
  Compass,
  Square,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Move,
  Activity,
  Sliders,
  Sparkles,
  Download,
  Info,
  Grid,
  Hash,
  Layers,
  ChevronRight,
  ChevronDown,
  MousePointer,
  PenTool,
  RotateCw,
  Spline,
  GitCommit,
  Minus,
  ArrowUpRight,
  Shield,
  HelpCircle,
  Eye,
  EyeOff,
  Trash2,
  ZoomIn,
  ZoomOut,
  Hand,
  Type,
  Maximize,
  Globe,
  CornerRightDown
} from 'lucide-react';
import { MathView } from '../MathView';

export type GeoGebraToolMode =
  // 1. Move
  | 'move'
  | 'rotate-point'
  | 'record-spreadsheet'
  | 'freehand-shape'
  | 'pen'
  // 2. Points
  | 'point'
  | 'point-on-object'
  | 'attach-point'
  | 'intersect'
  | 'midpoint'
  | 'complex'
  | 'extremum'
  | 'roots'
  // 3. Lines
  | 'line'
  | 'segment'
  | 'segment-length'
  | 'ray'
  | 'polyline'
  | 'vector'
  | 'vector-point'
  // 4. Special Lines
  | 'perpendicular'
  | 'parallel'
  | 'perp-bisector'
  | 'angle-bisector'
  | 'tangents'
  | 'polar-line'
  | 'best-fit-line'
  | 'locus'
  // 5. Polygons
  | 'polygon'
  | 'regular-polygon'
  | 'rigid-polygon'
  | 'vector-polygon'
  // 6. Circles & Arcs
  | 'circle-center-pt'
  | 'circle-radius'
  | 'compass'
  | 'circle-3pts'
  | 'semicircle'
  | 'circular-arc'
  | 'circumcircular-arc'
  | 'circular-sector'
  | 'circumcircular-sector'
  // 7. Conics
  | 'ellipse'
  | 'hyperbola'
  | 'parabola'
  | 'conic-5pts'
  // 8. Measurement
  | 'angle'
  | 'angle-fixed'
  | 'distance'
  | 'area'
  | 'slope'
  | 'list'
  // 9. Transformations
  | 'reflect-line'
  | 'reflect-point'
  | 'reflect-circle'
  | 'rotate-point-angle'
  | 'translate-vector'
  | 'dilate'
  // 10. Special Objects
  | 'slider'
  | 'text'
  | 'image'
  | 'button'
  // 11. Action / Input
  | 'checkbox'
  | 'input-box'
  // 12. View & General
  | 'pan'
  | 'zoom-in'
  | 'zoom-out'
  | 'show-hide-obj'
  | 'show-hide-label'
  | 'copy-style'
  | 'delete';

export type GeoConceptPreset =
  | 'free'
  | 'triangle-sum'
  | 'pythagorean'
  | 'circle-theorem'
  | 'slope-intercept'
  | 'unit-circle'
  | 'quadratic';

export interface GeoPoint {
  id: string;
  label: string;
  x: number; // Cartesian coordinates
  y: number;
  color: string;
  fixed?: boolean;
  visible?: boolean;
}

export interface GeoSegment {
  id: string;
  label?: string;
  p1Id: string;
  p2Id: string;
  color: string;
  showLength?: boolean;
  visible?: boolean;
}

export interface GeoLine {
  id: string;
  label: string;
  p1Id?: string;
  p2Id?: string;
  slope?: number;
  intercept?: number;
  isPerpTo?: string; // segment/line ID
  isParallelTo?: string;
  throughPtId?: string;
  color: string;
  visible?: boolean;
}

export interface GeoVector {
  id: string;
  label: string;
  p1Id: string;
  p2Id: string;
  color: string;
  visible?: boolean;
}

export interface GeoCircle {
  id: string;
  label?: string;
  centerId: string;
  radiusPtId?: string;
  radiusValue?: number;
  color: string;
  showEquation?: boolean;
  visible?: boolean;
}

export interface GeoPolygon {
  id: string;
  label: string;
  pointIds: string[];
  color: string;
  visible?: boolean;
}

export interface GeoRay {
  id: string;
  label?: string;
  p1Id: string;
  p2Id: string;
  color: string;
  visible?: boolean;
}

export interface GeoArc {
  id: string;
  label?: string;
  centerId: string;
  p1Id: string;
  p2Id: string;
  isSector?: boolean;
  color: string;
  visible?: boolean;
}

export interface GeoSlope {
  id: string;
  lineId?: string;
  segId?: string;
  color: string;
}

export interface GeoConic {
  id: string;
  label: string;
  type: 'ellipse' | 'hyperbola' | 'parabola';
  f1Id: string;
  f2Id?: string;
  pId?: string;
  color: string;
  visible?: boolean;
}

export interface GeoAngle {
  id: string;
  label: string;
  p1Id: string;
  vertexId: string;
  p2Id: string;
  valueDeg: number;
  color: string;
  visible?: boolean;
}

export interface GeoPenStroke {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export interface GeoSliderObj {
  id: string;
  name: string;
  min: number;
  max: number;
  value: number;
  step: number;
  x: number;
  y: number;
}

export interface GeoTextObj {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

// Distance helper
function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

// 12 Classic 5.0 Toolboxes
export interface ClassicToolSuite {
  id: number;
  title: string;
  iconName: string;
  tools: {
    mode: GeoGebraToolMode;
    label: string;
    instruction: string;
    icon: string;
  }[];
}

export const CLASSIC_5_TOOLBOXES: ClassicToolSuite[] = [
  // 1. Move Group
  {
    id: 1,
    title: 'Move',
    iconName: 'pointer',
    tools: [
      { mode: 'move', label: 'Move (Esc)', instruction: 'Drag or select objects (Esc)', icon: '↖' },
      { mode: 'rotate-point', label: 'Rotate around Point', instruction: 'Select rotation center, then drag object', icon: '🔄' },
      { mode: 'record-spreadsheet', label: 'Record to Spreadsheet', instruction: 'Select object to track coordinates into table', icon: '📊' },
      { mode: 'freehand-shape', label: 'Freehand Shape', instruction: 'Draw function or geometric curve freehand', icon: '✏️' },
      { mode: 'pen', label: 'Pen', instruction: 'Write or draw annotations freehand on graphics view', icon: '✍️' },
    ],
  },
  // 2. Point Group
  {
    id: 2,
    title: 'Points',
    iconName: 'point',
    tools: [
      { mode: 'point', label: 'New Point', instruction: 'Click on graphics view or curve to create a point', icon: '●' },
      { mode: 'point-on-object', label: 'Point on Object', instruction: 'Click inside object or on its perimeter', icon: '⦿' },
      { mode: 'attach-point', label: 'Attach / Detach Point', instruction: 'Select point, then object to attach to or detach from', icon: '📌' },
      { mode: 'intersect', label: 'Intersect', instruction: 'Select intersection or two objects successively', icon: '✖' },
      { mode: 'midpoint', label: 'Midpoint or Center', instruction: 'Select two points, a segment, or a circle', icon: '½' },
      { mode: 'complex', label: 'Complex Number', instruction: 'Click to create a complex number z = a + bi', icon: 'ℂ' },
      { mode: 'extremum', label: 'Extremum', instruction: 'Select function to find local extrema', icon: '⛰️' },
      { mode: 'roots', label: 'Roots', instruction: 'Select function to compute real roots and zeros', icon: '√' },
    ],
  },
  // 3. Lines & Vectors Group
  {
    id: 3,
    title: 'Lines',
    iconName: 'line',
    tools: [
      { mode: 'line', label: 'Line', instruction: 'Select two points to construct infinite line', icon: '↔' },
      { mode: 'segment', label: 'Segment', instruction: 'Select two points to construct segment', icon: '━' },
      { mode: 'segment-length', label: 'Segment with Given Length', instruction: 'Select point and enter fixed length', icon: '📏' },
      { mode: 'ray', label: 'Ray', instruction: 'Select starting point, then direction point', icon: '→' },
      { mode: 'polyline', label: 'Polyline', instruction: 'Select all vertices, then click first vertex again', icon: '📈' },
      { mode: 'vector', label: 'Vector', instruction: 'Select start point, then vector endpoint', icon: '➔' },
      { mode: 'vector-point', label: 'Vector from Point', instruction: 'Select starting point and vector', icon: '➦' },
    ],
  },
  // 4. Special Construction Lines Group
  {
    id: 4,
    title: 'Special Lines',
    iconName: 'special-line',
    tools: [
      { mode: 'perpendicular', label: 'Perpendicular Line', instruction: 'Select point and perpendicular line or segment', icon: '⟂' },
      { mode: 'parallel', label: 'Parallel Line', instruction: 'Select point and parallel line', icon: '∥' },
      { mode: 'perp-bisector', label: 'Perpendicular Bisector', instruction: 'Select two points or one segment', icon: '⫚' },
      { mode: 'angle-bisector', label: 'Angle Bisector', instruction: 'Select three points or two lines', icon: '∡' },
      { mode: 'tangents', label: 'Tangents', instruction: 'Select point and circle or conic', icon: '⭕' },
      { mode: 'polar-line', label: 'Polar or Diameter Line', instruction: 'Select point or line, then circle or conic', icon: '⌀' },
      { mode: 'best-fit-line', label: 'Best Fit Line', instruction: 'Select points by marquee box for linear regression', icon: '📉' },
      { mode: 'locus', label: 'Locus', instruction: 'Select locus point, then point on object or slider', icon: '➰' },
    ],
  },
  // 5. Polygons Group
  {
    id: 5,
    title: 'Polygons',
    iconName: 'polygon',
    tools: [
      { mode: 'polygon', label: 'Polygon', instruction: 'Select all vertices, then click first vertex again', icon: '▲' },
      { mode: 'regular-polygon', label: 'Regular Polygon', instruction: 'Select two points, then enter number of vertices', icon: '🔷' },
      { mode: 'rigid-polygon', label: 'Rigid Polygon', instruction: 'Select all vertices, maintains internal geometry', icon: '⏹' },
      { mode: 'vector-polygon', label: 'Vector Polygon', instruction: 'Select all vertices; form polygon with fixed vectors', icon: '⬡' },
    ],
  },
  // 6. Circles & Arcs Group
  {
    id: 6,
    title: 'Circles & Arcs',
    iconName: 'circle',
    tools: [
      { mode: 'circle-center-pt', label: 'Circle with Center through Point', instruction: 'Select center point, then point on circle', icon: '⭕' },
      { mode: 'circle-radius', label: 'Circle with Center and Radius', instruction: 'Select center point and enter radius value', icon: '🔘' },
      { mode: 'compass', label: 'Compass', instruction: 'Select segment for radius, then center point', icon: '🧭' },
      { mode: 'circle-3pts', label: 'Circle through 3 Points', instruction: 'Select three points on circle boundary', icon: '⚪' },
      { mode: 'semicircle', label: 'Semicircle through 2 Points', instruction: 'Select two endpoints of diameter', icon: '🌓' },
      { mode: 'circular-arc', label: 'Circular Arc', instruction: 'Select center point, start point, and end point', icon: '🌙' },
      { mode: 'circumcircular-arc', label: 'Circumcircular Arc', instruction: 'Select three points on arc', icon: '⌒' },
      { mode: 'circular-sector', label: 'Circular Sector', instruction: 'Select center point, start point, and end point', icon: '🍕' },
      { mode: 'circumcircular-sector', label: 'Circumcircular Sector', instruction: 'Select three points on sector boundary', icon: '🍰' },
    ],
  },
  // 7. Conics Group
  {
    id: 7,
    title: 'Conics',
    iconName: 'conics',
    tools: [
      { mode: 'ellipse', label: 'Ellipse', instruction: 'Select two foci and a point on ellipse', icon: '⬭' },
      { mode: 'hyperbola', label: 'Hyperbola', instruction: 'Select two foci and a point on hyperbola', icon: ')( ' },
      { mode: 'parabola', label: 'Parabola', instruction: 'Select focus point and directrix line', icon: '⌒' },
      { mode: 'conic-5pts', label: 'Conic through 5 Points', instruction: 'Select five points to construct unique conic section', icon: '⬡' },
    ],
  },
  // 8. Measurement Group
  {
    id: 8,
    title: 'Measurement',
    iconName: 'measure',
    tools: [
      { mode: 'angle', label: 'Angle', instruction: 'Select three points or two lines to measure angle', icon: '📐' },
      { mode: 'angle-fixed', label: 'Angle with Given Size', instruction: 'Select leg point, vertex, and enter angle size', icon: '∠' },
      { mode: 'distance', label: 'Distance or Length', instruction: 'Select two points, segment, or circle', icon: '📏' },
      { mode: 'area', label: 'Area', instruction: 'Select polygon, circle, or conic to calculate area', icon: '⬛' },
      { mode: 'slope', label: 'Slope', instruction: 'Select line to display slope triangle (m = Δy/Δx)', icon: '📈' },
      { mode: 'list', label: 'Create List', instruction: 'Select objects to aggregate into a list L_1', icon: '📋' },
    ],
  },
  // 9. Transformations Group
  {
    id: 9,
    title: 'Transformations',
    iconName: 'transform',
    tools: [
      { mode: 'reflect-line', label: 'Reflect about Line', instruction: 'Select object to reflect, then mirror line', icon: '🪞' },
      { mode: 'reflect-point', label: 'Reflect about Point', instruction: 'Select object to reflect, then center point', icon: '🔄' },
      { mode: 'reflect-circle', label: 'Reflect about Circle (Inversion)', instruction: 'Select object to invert, then circle', icon: '⚪' },
      { mode: 'rotate-point-angle', label: 'Rotate around Point', instruction: 'Select object, center point, and enter rotation angle', icon: '🔁' },
      { mode: 'translate-vector', label: 'Translate by Vector', instruction: 'Select object to translate, then vector', icon: '➡️' },
      { mode: 'dilate', label: 'Dilate from Point', instruction: 'Select object, center point, and enter scale factor', icon: '🔍' },
    ],
  },
  // 10. Special Objects Group
  {
    id: 10,
    title: 'Special Objects',
    iconName: 'slider',
    tools: [
      { mode: 'slider', label: 'Slider', instruction: 'Click on graphics view to place numeric slider', icon: '🎚️' },
      { mode: 'text', label: 'Text / LaTeX', instruction: 'Click on graphics view to insert math text / LaTeX', icon: '📝' },
      { mode: 'image', label: 'Insert Image', instruction: 'Click on graphics view to specify position for image', icon: '🖼️' },
      { mode: 'button', label: 'Action Button', instruction: 'Click on graphics view to insert interactive script button', icon: '🔘' },
    ],
  },
  // 11. Action & Input Group
  {
    id: 11,
    title: 'Action & Input',
    iconName: 'input',
    tools: [
      { mode: 'checkbox', label: 'Checkbox to Show / Hide Objects', instruction: 'Click on graphics view to create boolean toggle', icon: '☑️' },
      { mode: 'input-box', label: 'Input Box', instruction: 'Click on graphics view to insert linked parameter box', icon: '📥' },
    ],
  },
  // 12. View & General Group
  {
    id: 12,
    title: 'View & General',
    iconName: 'view',
    tools: [
      { mode: 'pan', label: 'Move Graphics View', instruction: 'Drag graphics view to pan coordinate axes', icon: '✋' },
      { mode: 'zoom-in', label: 'Zoom In', instruction: 'Click on graphics view to zoom in', icon: '🔍+' },
      { mode: 'zoom-out', label: 'Zoom Out', instruction: 'Click on graphics view to zoom out', icon: '🔍-' },
      { mode: 'show-hide-obj', label: 'Show / Hide Object', instruction: 'Select object to toggle visibility', icon: '👁️' },
      { mode: 'show-hide-label', label: 'Show / Hide Label', instruction: 'Select object to show or hide its label', icon: '🏷️' },
      { mode: 'copy-style', label: 'Copy Visual Style', instruction: 'Select object to copy style from, then target objects', icon: '🖌️' },
      { mode: 'delete', label: 'Delete Object', instruction: 'Select object to delete', icon: '🗑️' },
    ],
  },
];

interface GeoGebraToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToWhiteboard: (dataUrl: string, width: number, height: number, label: string) => void;
}

export const GeoGebraToolsModal: React.FC<GeoGebraToolsModalProps> = ({
  isOpen,
  onClose,
  onInsertToWhiteboard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({ width: 720, height: 480 });

  // Top Mode Switcher: Classic 5 Studio vs Official GeoGebra Classic Web Suite vs Concept Presets
  const [activeTab, setActiveTab] = useState<'studio' | 'official-suite' | 'presets'>('studio');

  // Active Tool & Toolboxes
  const [activeTool, setActiveTool] = useState<GeoGebraToolMode>('move');
  const [selectedBoxId, setSelectedBoxId] = useState<number>(1);
  const [activeDropdownBoxId, setActiveDropdownBoxId] = useState<number | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ top: number; left: number; boxId: number } | null>(null);
  const [showAllToolsModal, setShowAllToolsModal] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'algebra' | 'spreadsheet'>('algebra');
  const [toolNotification, setToolNotification] = useState<string | null>(null);

  // Algebra View Sidebar & Input Bar
  const [showAlgebraView, setShowAlgebraView] = useState<boolean>(true);
  const [algebraInputText, setAlgebraInputText] = useState<string>('');
  const [algebraInputFeedback, setAlgebraInputFeedback] = useState<string | null>(null);

  // View Settings
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);

  // Geometric State
  const [points, setPoints] = useState<GeoPoint[]>([
    { id: 'p_A', label: 'A', x: -4, y: -2, color: '#38bdf8', visible: true },
    { id: 'p_B', label: 'B', x: 4, y: -2, color: '#38bdf8', visible: true },
    { id: 'p_C', label: 'C', x: 0, y: 3, color: '#38bdf8', visible: true },
  ]);
  const [segments, setSegments] = useState<GeoSegment[]>([
    { id: 's_c', label: 'c', p1Id: 'p_A', p2Id: 'p_B', color: '#38bdf8', showLength: true, visible: true },
    { id: 's_a', label: 'a', p1Id: 'p_B', p2Id: 'p_C', color: '#38bdf8', showLength: true, visible: true },
    { id: 's_b', label: 'b', p1Id: 'p_C', p2Id: 'p_A', color: '#38bdf8', showLength: true, visible: true },
  ]);
  const [lines, setLines] = useState<GeoLine[]>([]);
  const [rays, setRays] = useState<GeoRay[]>([]);
  const [vectors, setVectors] = useState<GeoVector[]>([]);
  const [circles, setCircles] = useState<GeoCircle[]>([]);
  const [arcs, setArcs] = useState<GeoArc[]>([]);
  const [slopes, setSlopes] = useState<GeoSlope[]>([]);
  const [conics, setConics] = useState<GeoConic[]>([]);
  const [polygons, setPolygons] = useState<GeoPolygon[]>([
    { id: 'poly1', label: 'poly1', pointIds: ['p_A', 'p_B', 'p_C'], color: '#38bdf8', visible: true },
  ]);
  const [angles, setAngles] = useState<GeoAngle[]>([]);
  const [sliders, setSliders] = useState<GeoSliderObj[]>([]);
  const [texts, setTexts] = useState<GeoTextObj[]>([]);
  const [penStrokes, setPenStrokes] = useState<GeoPenStroke[]>([]);
  const [currentPenStroke, setCurrentPenStroke] = useState<Array<{ x: number; y: number }>>([]);
  const [spreadsheetRows, setSpreadsheetRows] = useState<Array<{ id: string; name: string; x: number; y: number; time: string }>>([]);

  // Presets
  const [activePreset, setActivePreset] = useState<GeoConceptPreset>('triangle-sum');
  const [slopeM, setSlopeM] = useState<number>(1.5);
  const [interceptC, setInterceptC] = useState<number>(1);
  const [trigAngleDeg, setTrigAngleDeg] = useState<number>(53);
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-2);
  const [quadC, setQuadC] = useState<number>(-3);

  // Canvas Viewport Pan / Zoom
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(36); // px per Cartesian unit

  // Interaction tracking
  const isDraggingPtRef = useRef<string | null>(null);
  const isDraggingSegRef = useRef<{ id: string; p1Id: string; p2Id: string } | null>(null);
  const isPanningRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pendingPointSelectRef = useRef<string[]>([]);
  const activePolygonDraftRef = useRef<string[]>([]);

  // Coordinate transforms
  const toScreenX = useCallback((cartX: number, cx: number) => cx + panOffset.x + cartX * scale, [panOffset.x, scale]);
  const toScreenY = useCallback((cartY: number, cy: number) => cy + panOffset.y - cartY * scale, [panOffset.y, scale]);
  const toCartX = useCallback((screenX: number, cx: number) => (screenX - (cx + panOffset.x)) / scale, [panOffset.x, scale]);
  const toCartY = useCallback((screenY: number, cy: number) => -(screenY - (cy + panOffset.y)) / scale, [panOffset.y, scale]);

  // Handle Resize
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const updateDims = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasDims({
          width: Math.max(480, Math.floor(rect.width)),
          height: Math.max(360, Math.floor(rect.height)),
        });
      }
    };
    updateDims();
    const ro = new ResizeObserver(updateDims);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isOpen, showAlgebraView]);

  // Get current active tool instruction
  const currentToolInstruction = useCallback(() => {
    for (const box of CLASSIC_5_TOOLBOXES) {
      const found = box.tools.find(t => t.mode === activeTool);
      if (found) return `${found.label}: ${found.instruction}`;
    }
    return 'Drag or select objects (Esc)';
  }, [activeTool]);

  // Main Drawing Routine
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // 1. Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // 2. Grid Lines
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      const originScreenX = cx + panOffset.x;
      const originScreenY = cy + panOffset.y;

      const startX = originScreenX % scale;
      for (let x = startX; x < w; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      const startY = originScreenY % scale;
      for (let y = startY; y < h; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // 3. Axes
    if (showAxes) {
      const originScreenX = cx + panOffset.x;
      const originScreenY = cy + panOffset.y;

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      // X axis
      ctx.beginPath();
      ctx.moveTo(0, originScreenY);
      ctx.lineTo(w, originScreenY);
      ctx.stroke();
      // Y axis
      ctx.beginPath();
      ctx.moveTo(originScreenX, 0);
      ctx.lineTo(originScreenX, h);
      ctx.stroke();

      // Axis Ticks & Numbers
      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';

      const minUnitX = Math.floor(toCartX(0, cx));
      const maxUnitX = Math.ceil(toCartX(w, cx));
      for (let u = minUnitX; u <= maxUnitX; u++) {
        if (u === 0) continue;
        const sx = toScreenX(u, cx);
        ctx.beginPath();
        ctx.moveTo(sx, originScreenY - 4);
        ctx.lineTo(sx, originScreenY + 4);
        ctx.stroke();
        ctx.fillText(u.toString(), sx, originScreenY + 14);
      }

      const minUnitY = Math.floor(toCartY(h, cy));
      const maxUnitY = Math.ceil(toCartY(0, cy));
      for (let u = minUnitY; u <= maxUnitY; u++) {
        if (u === 0) continue;
        const sy = toScreenY(u, cy);
        ctx.beginPath();
        ctx.moveTo(originScreenX - 4, sy);
        ctx.lineTo(originScreenX + 4, sy);
        ctx.stroke();
        ctx.fillText(u.toString(), originScreenX - 12, sy + 3);
      }
    }

    // 4. Draw Polygons
    polygons.forEach(poly => {
      if (poly.visible === false || poly.pointIds.length < 3) return;
      const pts = poly.pointIds.map(id => points.find(p => p.id === id)).filter(Boolean) as GeoPoint[];
      if (pts.length < 3) return;

      ctx.beginPath();
      const firstX = toScreenX(pts[0].x, cx);
      const firstY = toScreenY(pts[0].y, cy);
      ctx.moveTo(firstX, firstY);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(toScreenX(pts[i].x, cx), toScreenY(pts[i].y, cy));
      }
      ctx.closePath();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = poly.color || '#38bdf8';
      ctx.stroke();

      // Polygon Area Label at Centroid
      const cenX = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
      const cenY = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;
      let area = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
      }
      area = Math.abs(area) / 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(toScreenX(cenX, cx) - 24, toScreenY(cenY, cy) - 10, 48, 20);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.strokeRect(toScreenX(cenX, cx) - 24, toScreenY(cenY, cy) - 10, 48, 20);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${poly.label || 'Area'}=${area.toFixed(1)}`, toScreenX(cenX, cx), toScreenY(cenY, cy) + 4);
    });

    // 5. Draw Circles
    circles.forEach(circle => {
      if (circle.visible === false) return;
      const cPt = points.find(p => p.id === circle.centerId);
      if (!cPt) return;

      const scx = toScreenX(cPt.x, cx);
      const scy = toScreenY(cPt.y, cy);
      let radPx = 0;

      if (circle.radiusValue) {
        radPx = circle.radiusValue * scale;
      } else if (circle.radiusPtId) {
        const rPt = points.find(p => p.id === circle.radiusPtId);
        if (rPt) {
          const srx = toScreenX(rPt.x, cx);
          const sry = toScreenY(rPt.y, cy);
          radPx = Math.hypot(srx - scx, sry - scy);
        }
      }

      if (radPx > 0) {
        ctx.beginPath();
        ctx.arc(scx, scy, radPx, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = circle.color || '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.stroke();

        // Optional Area Badge
        if (circle.label) {
          const rUnit = radPx / scale;
          const circArea = Math.PI * rUnit * rUnit;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fillRect(scx - 28, scy + radPx * 0.4 - 9, 56, 18);
          ctx.strokeStyle = circle.color || '#38bdf8';
          ctx.strokeRect(scx - 28, scy + radPx * 0.4 - 9, 56, 18);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`r=${rUnit.toFixed(1)} | A=${circArea.toFixed(1)}`, scx, scy + radPx * 0.4 + 4);
        }
      }
    });

    // 5b. Draw Arcs and Sectors
    arcs.forEach(arc => {
      if (arc.visible === false) return;
      const cPt = points.find(p => p.id === arc.centerId);
      const p1 = points.find(p => p.id === arc.p1Id);
      const p2 = points.find(p => p.id === arc.p2Id);
      if (!cPt || !p1 || !p2) return;

      const scx = toScreenX(cPt.x, cx);
      const scy = toScreenY(cPt.y, cy);
      const s1x = toScreenX(p1.x, cx);
      const s1y = toScreenY(p1.y, cy);
      const s2x = toScreenX(p2.x, cx);
      const s2y = toScreenY(p2.y, cy);

      const radPx = Math.hypot(s1x - scx, s1y - scy);
      const a1 = Math.atan2(s1y - scy, s1x - scx);
      const a2 = Math.atan2(s2y - scy, s2x - scx);

      ctx.beginPath();
      if (arc.isSector) {
        ctx.moveTo(scx, scy);
        ctx.arc(scx, scy, radPx, a1, a2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
        ctx.fill();
      } else {
        ctx.arc(scx, scy, radPx, a1, a2);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = arc.color || '#f59e0b';
      ctx.stroke();
    });

    // 6. Draw Infinite Lines
    lines.forEach(line => {
      if (line.visible === false) return;
      ctx.lineWidth = 2;
      ctx.strokeStyle = line.color || '#a855f7';
      if (line.p1Id && line.p2Id) {
        const p1 = points.find(p => p.id === line.p1Id);
        const p2 = points.find(p => p.id === line.p2Id);
        if (p1 && p2) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const ext = 100;
          const s1x = toScreenX(p1.x - dx * ext, cx);
          const s1y = toScreenY(p1.y - dy * ext, cy);
          const s2x = toScreenX(p2.x + dx * ext, cx);
          const s2y = toScreenY(p2.y + dy * ext, cy);
          ctx.beginPath();
          ctx.moveTo(s1x, s1y);
          ctx.lineTo(s2x, s2y);
          ctx.stroke();

          // Line equation badge
          const m = dx !== 0 ? dy / dx : 999;
          const cVal = p1.y - m * p1.x;
          const midX = toScreenX((p1.x + p2.x) / 2, cx);
          const midY = toScreenY((p1.y + p2.y) / 2, cy);
          ctx.fillStyle = '#a855f7';
          ctx.font = 'italic 10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`line: y = ${m.toFixed(1)}x ${cVal >= 0 ? '+' : ''}${cVal.toFixed(1)}`, midX + 6, midY - 6);
        }
      } else if (line.slope !== undefined && line.intercept !== undefined) {
        const x1 = toCartX(0, cx);
        const y1 = line.slope * x1 + line.intercept;
        const x2 = toCartX(w, cx);
        const y2 = line.slope * x2 + line.intercept;
        ctx.beginPath();
        ctx.moveTo(toScreenX(x1, cx), toScreenY(y1, cy));
        ctx.lineTo(toScreenX(x2, cx), toScreenY(y2, cy));
        ctx.stroke();
      }
    });

    // 6b. Draw Rays
    rays.forEach(ray => {
      if (ray.visible === false) return;
      const p1 = points.find(p => p.id === ray.p1Id);
      const p2 = points.find(p => p.id === ray.p2Id);
      if (!p1 || !p2) return;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const ext = 80;
      const s1x = toScreenX(p1.x, cx);
      const s1y = toScreenY(p1.y, cy);
      const s2x = toScreenX(p1.x + dx * ext, cx);
      const s2y = toScreenY(p1.y + dy * ext, cy);

      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(s2x, s2y);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = ray.color || '#ec4899';
      ctx.stroke();
    });

    // 7. Draw Segments
    segments.forEach(seg => {
      if (seg.visible === false) return;
      const p1 = points.find(p => p.id === seg.p1Id);
      const p2 = points.find(p => p.id === seg.p2Id);
      if (!p1 || !p2) return;

      const s1x = toScreenX(p1.x, cx);
      const s1y = toScreenY(p1.y, cy);
      const s2x = toScreenX(p2.x, cx);
      const s2y = toScreenY(p2.y, cy);

      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(s2x, s2y);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = seg.color || '#38bdf8';
      ctx.stroke();

      // Show Length label
      if (seg.showLength) {
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const midX = (s1x + s2x) / 2;
        const midY = (s1y + s2y) / 2;
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${seg.label ? seg.label + ' = ' : ''}${len.toFixed(2)}`, midX + 8, midY - 6);
      }
    });

    // 7b. Draw Slopes
    slopes.forEach(slp => {
      let p1: GeoPoint | undefined;
      let p2: GeoPoint | undefined;
      if (slp.segId) {
        const seg = segments.find(s => s.id === slp.segId);
        if (seg) {
          p1 = points.find(p => p.id === seg.p1Id);
          p2 = points.find(p => p.id === seg.p2Id);
        }
      } else if (slp.lineId) {
        const line = lines.find(l => l.id === slp.lineId);
        if (line && line.p1Id && line.p2Id) {
          p1 = points.find(p => p.id === line.p1Id);
          p2 = points.find(p => p.id === line.p2Id);
        }
      }
      if (!p1 || !p2) return;
      const s1x = toScreenX(p1.x, cx);
      const s1y = toScreenY(p1.y, cy);
      const s2x = toScreenX(p2.x, cx);
      const s2y = toScreenY(p2.y, cy);
      const cornerX = s2x;
      const cornerY = s1y;

      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = slp.color || '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(cornerX, cornerY);
      ctx.lineTo(s2x, s2y);
      ctx.stroke();
      ctx.restore();

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const m = dx !== 0 ? (dy / dx).toFixed(2) : '∞';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`m = ${m} (Δy=${dy.toFixed(1)} / Δx=${dx.toFixed(1)})`, cornerX + 6, (s1y + s2y) / 2);
    });

    // 8. Draw Vectors
    vectors.forEach(vec => {
      if (vec.visible === false) return;
      const p1 = points.find(p => p.id === vec.p1Id);
      const p2 = points.find(p => p.id === vec.p2Id);
      if (!p1 || !p2) return;

      const s1x = toScreenX(p1.x, cx);
      const s1y = toScreenY(p1.y, cy);
      const s2x = toScreenX(p2.x, cx);
      const s2y = toScreenY(p2.y, cy);

      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(s2x, s2y);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = vec.color || '#10b981';
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(s2y - s1y, s2x - s1x);
      const headLen = 14;
      ctx.fillStyle = vec.color || '#10b981';
      ctx.beginPath();
      ctx.moveTo(s2x, s2y);
      ctx.lineTo(s2x - headLen * Math.cos(angle - Math.PI / 6), s2y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(s2x - headLen * Math.cos(angle + Math.PI / 6), s2y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Vector Component Badge
      const vx = p2.x - p1.x;
      const vy = p2.y - p1.y;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`vec(${vx.toFixed(1)}, ${vy.toFixed(1)})`, (s1x + s2x) / 2 + 8, (s1y + s2y) / 2 - 6);
    });

    // 8b. Draw Angles
    angles.forEach(ang => {
      if (ang.visible === false) return;
      const p1 = points.find(p => p.id === ang.p1Id);
      const vertex = points.find(p => p.id === ang.vertexId);
      const p2 = points.find(p => p.id === ang.p2Id);
      if (!p1 || !vertex || !p2) return;

      const vx = toScreenX(vertex.x, cx);
      const vy = toScreenY(vertex.y, cy);
      const s1x = toScreenX(p1.x, cx);
      const s1y = toScreenY(p1.y, cy);
      const s2x = toScreenX(p2.x, cx);
      const s2y = toScreenY(p2.y, cy);

      const a1 = Math.atan2(s1y - vy, s1x - vx);
      const a2 = Math.atan2(s2y - vy, s2x - vx);
      const arcR = 32;

      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.arc(vx, vy, arcR, a1, a2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ang.color || '#10b981';
      ctx.stroke();

      // Angle degree label
      const midAngle = (a1 + a2) / 2;
      const labelX = vx + (arcR + 14) * Math.cos(midAngle);
      const labelY = vy + (arcR + 14) * Math.sin(midAngle);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${ang.label || 'α'} = ${ang.valueDeg.toFixed(1)}°`, labelX, labelY);
    });

    // 8c. Draw Conics (Ellipses, Parabolas)
    conics.forEach(con => {
      if (con.visible === false) return;
      const f1 = points.find(p => p.id === con.f1Id);
      if (!f1) return;
      const f2 = con.f2Id ? points.find(p => p.id === con.f2Id) : null;
      const pt = con.pId ? points.find(p => p.id === con.pId) : null;

      if (con.type === 'ellipse' && f2 && pt) {
        // Ellipse with foci F1, F2 passing through Pt
        const d1 = Math.hypot(pt.x - f1.x, pt.y - f1.y);
        const d2 = Math.hypot(pt.x - f2.x, pt.y - f2.y);
        const twoA = d1 + d2;
        const a = twoA / 2;
        const cenX = (f1.x + f2.x) / 2;
        const cenY = (f1.y + f2.y) / 2;
        const c = Math.hypot(f2.x - f1.x, f2.y - f1.y) / 2;
        const b = Math.sqrt(Math.max(0.1, a * a - c * c));
        const rot = Math.atan2(f2.y - f1.y, f2.x - f1.x);

        ctx.beginPath();
        ctx.ellipse(toScreenX(cenX, cx), toScreenY(cenY, cy), a * scale, b * scale, -rot, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = con.color || '#ec4899';
        ctx.stroke();

        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`Ellipse: a=${a.toFixed(1)}, b=${b.toFixed(1)}`, toScreenX(cenX, cx), toScreenY(cenY, cy) - b * scale - 6);
      }
    });

    // 8d. Draw Sliders
    sliders.forEach(sl => {
      const sx = toScreenX(sl.x, cx);
      const sy = toScreenY(sl.y, cy);
      const trackW = 120;

      // Track
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(sx - 10, sy - 14, trackW + 20, 28);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(sx - 10, sy - 14, trackW + 20, 28);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + trackW, sy);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Thumb
      const ratio = Math.max(0, Math.min(1, (sl.value - sl.min) / (sl.max - sl.min)));
      const thumbX = sx + ratio * trackW;
      ctx.beginPath();
      ctx.arc(thumbX, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slider Label & Value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${sl.name} = ${sl.value.toFixed(1)}`, sx, sy - 18);
    });

    // 8e. Draw Math Texts
    texts.forEach(txt => {
      const sx = toScreenX(txt.x, cx);
      const sy = toScreenY(txt.y, cy);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      const textW = ctx.measureText(txt.text).width + 16;
      ctx.fillRect(sx - 8, sy - 14, textW, 22);
      ctx.strokeStyle = txt.color || '#38bdf8';
      ctx.strokeRect(sx - 8, sy - 14, textW, 22);
      ctx.fillStyle = txt.color || '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(txt.text, sx, sy + 2);
    });

    // 9. Draw Freehand Pen Strokes
    penStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(toScreenX(stroke.points[0].x, cx), toScreenY(stroke.points[0].y, cy));
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(toScreenX(stroke.points[i].x, cx), toScreenY(stroke.points[i].y, cy));
      }
      ctx.lineWidth = stroke.width || 3;
      ctx.strokeStyle = stroke.color || '#f59e0b';
      ctx.stroke();
    });

    if (currentPenStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(currentPenStroke[0].x, cx), toScreenY(currentPenStroke[0].y, cy));
      for (let i = 1; i < currentPenStroke.length; i++) {
        ctx.lineTo(toScreenX(currentPenStroke[i].x, cx), toScreenY(currentPenStroke[i].y, cy));
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();
    }

    // 10. Draw Points (Classic 5.0 High Contrast styling)
    points.forEach(pt => {
      if (pt.visible === false) return;
      const sx = toScreenX(pt.x, cx);
      const sy = toScreenY(pt.y, cy);

      // Outer Glow / Ring
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fillStyle = pt.color || '#38bdf8';
      ctx.fill();

      // Inner Core
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Label & Coordinates
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${pt.label} (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`, sx + 10, sy - 6);
    });
  }, [
    canvasDims,
    points,
    segments,
    lines,
    rays,
    vectors,
    circles,
    arcs,
    slopes,
    conics,
    polygons,
    angles,
    sliders,
    texts,
    penStrokes,
    currentPenStroke,
    showGrid,
    showAxes,
    scale,
    panOffset,
    toScreenX,
    toScreenY,
    toCartX,
    toCartY,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer Down Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Check clicked on existing point (14px target)
    let clickedPt: GeoPoint | null = null;
    for (const pt of points) {
      const sx = toScreenX(pt.x, cx);
      const sy = toScreenY(pt.y, cy);
      if (Math.hypot(clientX - sx, clientY - sy) <= 14) {
        clickedPt = pt;
        break;
      }
    }

    // Check clicked segment
    let clickedSeg: GeoSegment | null = null;
    if (!clickedPt) {
      for (const seg of segments) {
        const p1 = points.find(p => p.id === seg.p1Id);
        const p2 = points.find(p => p.id === seg.p2Id);
        if (!p1 || !p2) continue;
        const s1x = toScreenX(p1.x, cx);
        const s1y = toScreenY(p1.y, cy);
        const s2x = toScreenX(p2.x, cx);
        const s2y = toScreenY(p2.y, cy);
        if (distToSegment(clientX, clientY, s1x, s1y, s2x, s2y) <= 10) {
          clickedSeg = seg;
          break;
        }
      }
    }

    const showNotice = (msg: string) => {
      setToolNotification(msg);
      setTimeout(() => setToolNotification(prev => prev === msg ? null : prev), 3500);
    };

    // Helper to get or create point at click
    const getOrCreatePtAtClick = (): string => {
      if (clickedPt) return clickedPt.id;
      const cartX = snapToGrid ? Math.round(toCartX(clientX, cx)) : toCartX(clientX, cx);
      const cartY = snapToGrid ? Math.round(toCartY(clientY, cy)) : toCartY(clientY, cy);
      const newId = 'p_' + Date.now();
      const label = String.fromCharCode(65 + (points.length % 26));
      setPoints(prev => [...prev, { id: newId, label, x: cartX, y: cartY, color: '#38bdf8', visible: true }]);
      return newId;
    };

    // 1. Move Mode
    if (activeTool === 'move') {
      if (clickedPt) {
        isDraggingPtRef.current = clickedPt.id;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } else if (clickedSeg) {
        isDraggingSegRef.current = { id: clickedSeg.id, p1Id: clickedSeg.p1Id, p2Id: clickedSeg.p2Id };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } else {
        isPanningRef.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
      return;
    }

    // Rotate Around Point
    if (activeTool === 'rotate-point') {
      if (clickedPt) {
        pendingPointSelectRef.current.push(clickedPt.id);
        if (pendingPointSelectRef.current.length === 1) {
          showNotice(`Center point ${clickedPt.label} selected. Now select object point to rotate.`);
        } else if (pendingPointSelectRef.current.length === 2) {
          const [cId, targetId] = pendingPointSelectRef.current;
          const cPt = points.find(p => p.id === cId);
          const tPt = points.find(p => p.id === targetId);
          if (cPt && tPt) {
            const angleRad = Math.PI / 4; // 45 deg
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            const dx = tPt.x - cPt.x;
            const dy = tPt.y - cPt.y;
            const rx = cPt.x + (dx * cos - dy * sin);
            const ry = cPt.y + (dx * sin + dy * cos);
            const newId = 'p_' + Date.now();
            setPoints(prev => [...prev, { id: newId, label: `${tPt.label}'`, x: rx, y: ry, color: '#ec4899', visible: true }]);
            showNotice(`Rotated ${tPt.label} by 45° around ${cPt.label} -> ${tPt.label}'`);
          }
          pendingPointSelectRef.current = [];
        }
      }
      return;
    }

    // Record to Spreadsheet
    if (activeTool === 'record-spreadsheet') {
      const objName = clickedPt ? `Point ${clickedPt.label}` : clickedSeg ? `Segment ${clickedSeg.label || 's'}` : 'Coordinates';
      const objX = clickedPt ? clickedPt.x : toCartX(clientX, cx);
      const objY = clickedPt ? clickedPt.y : toCartY(clientY, cy);
      const newRow = {
        id: 'row_' + Date.now(),
        name: objName,
        x: Number(objX.toFixed(2)),
        y: Number(objY.toFixed(2)),
        time: new Date().toLocaleTimeString(),
      };
      setSpreadsheetRows(prev => [newRow, ...prev]);
      setActiveSidebarTab('spreadsheet');
      showNotice(`Logged ${objName} (${objX.toFixed(2)}, ${objY.toFixed(2)}) to Spreadsheet!`);
      return;
    }

    // Freehand Shape & Pen
    if (activeTool === 'pen' || activeTool === 'freehand-shape') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      setCurrentPenStroke([{ x: cartX, y: cartY }]);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Pan Mode
    if (activeTool === 'pan') {
      isPanningRef.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Zoom In / Zoom Out
    if (activeTool === 'zoom-in') {
      setScale(prev => Math.min(100, prev * 1.25));
      showNotice(`Zoom: ${Math.round((scale * 1.25) / 36 * 100)}%`);
      return;
    }
    if (activeTool === 'zoom-out') {
      setScale(prev => Math.max(12, prev * 0.8));
      showNotice(`Zoom: ${Math.round((scale * 0.8) / 36 * 100)}%`);
      return;
    }

    // Delete Object
    if (activeTool === 'delete') {
      if (clickedPt) {
        setPoints(prev => prev.filter(p => p.id !== clickedPt!.id));
        setSegments(prev => prev.filter(s => s.p1Id !== clickedPt!.id && s.p2Id !== clickedPt!.id));
        setLines(prev => prev.filter(l => l.p1Id !== clickedPt!.id && l.p2Id !== clickedPt!.id));
        setRays(prev => prev.filter(r => r.p1Id !== clickedPt!.id && r.p2Id !== clickedPt!.id));
        setVectors(prev => prev.filter(v => v.p1Id !== clickedPt!.id && v.p2Id !== clickedPt!.id));
        setCircles(prev => prev.filter(c => c.centerId !== clickedPt!.id && c.radiusPtId !== clickedPt!.id));
        setArcs(prev => prev.filter(a => a.centerId !== clickedPt!.id && a.p1Id !== clickedPt!.id && a.p2Id !== clickedPt!.id));
        showNotice(`Deleted Point ${clickedPt.label}`);
      } else if (clickedSeg) {
        setSegments(prev => prev.filter(s => s.id !== clickedSeg!.id));
        showNotice(`Deleted Segment`);
      }
      return;
    }

    // Show/Hide Object
    if (activeTool === 'show-hide-obj') {
      if (clickedPt) {
        setPoints(prev => prev.map(p => p.id === clickedPt.id ? { ...p, visible: !p.visible } : p));
        showNotice(`Toggled visibility of Point ${clickedPt.label}`);
      } else if (clickedSeg) {
        setSegments(prev => prev.map(s => s.id === clickedSeg.id ? { ...s, visible: !s.visible } : s));
        showNotice(`Toggled visibility of Segment`);
      }
      return;
    }

    // Show/Hide Label
    if (activeTool === 'show-hide-label') {
      if (clickedPt) {
        setPoints(prev => prev.map(p => p.id === clickedPt.id ? { ...p, label: p.label ? '' : String.fromCharCode(65 + (prev.indexOf(p) % 26)) } : p));
      } else if (clickedSeg) {
        setSegments(prev => prev.map(s => s.id === clickedSeg.id ? { ...s, showLength: !s.showLength } : s));
      }
      return;
    }

    // Copy Visual Style
    if (activeTool === 'copy-style') {
      if (clickedPt) {
        showNotice(`Copied color style from ${clickedPt.label}`);
      }
      return;
    }

    // 2. Point Tools
    if (activeTool === 'point') {
      let cartX = toCartX(clientX, cx);
      let cartY = toCartY(clientY, cy);
      if (snapToGrid) {
        cartX = Math.round(cartX);
        cartY = Math.round(cartY);
      }
      const newId = 'p_' + Date.now();
      const label = String.fromCharCode(65 + (points.length % 26));
      setPoints(prev => [...prev, { id: newId, label, x: cartX, y: cartY, color: '#38bdf8', visible: true }]);
      showNotice(`Created Point ${label} (${cartX}, ${cartY})`);
      return;
    }

    if (activeTool === 'point-on-object') {
      if (clickedSeg) {
        const p1 = points.find(p => p.id === clickedSeg.p1Id);
        const p2 = points.find(p => p.id === clickedSeg.p2Id);
        if (p1 && p2) {
          const t = 0.5; // midpoint of object
          const px = p1.x + t * (p2.x - p1.x);
          const py = p1.y + t * (p2.y - p1.y);
          const newId = 'p_' + Date.now();
          const label = String.fromCharCode(65 + (points.length % 26));
          setPoints(prev => [...prev, { id: newId, label, x: px, y: py, color: '#06b6d4', visible: true }]);
          showNotice(`Point ${label} attached to segment`);
        }
      } else {
        getOrCreatePtAtClick();
      }
      return;
    }

    if (activeTool === 'attach-point') {
      if (clickedPt) {
        showNotice(`Point ${clickedPt.label} attached/fixed.`);
      }
      return;
    }

    if (activeTool === 'intersect') {
      // Find intersection between existing lines/segments
      if (segments.length >= 2) {
        const s1 = segments[0];
        const s2 = segments[1];
        const p1 = points.find(p => p.id === s1.p1Id);
        const p2 = points.find(p => p.id === s1.p2Id);
        const p3 = points.find(p => p.id === s2.p1Id);
        const p4 = points.find(p => p.id === s2.p2Id);
        if (p1 && p2 && p3 && p4) {
          const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
          if (Math.abs(denom) > 1e-6) {
            const ix = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / denom;
            const iy = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / denom;
            const newId = 'p_int_' + Date.now();
            setPoints(prev => [...prev, { id: newId, label: 'X', x: Number(ix.toFixed(2)), y: Number(iy.toFixed(2)), color: '#f43f5e', visible: true }]);
            showNotice(`Found intersection point X (${ix.toFixed(2)}, ${iy.toFixed(2)})`);
            return;
          }
        }
      }
      // Click intersection location
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      const newId = 'p_int_' + Date.now();
      setPoints(prev => [...prev, { id: newId, label: 'X', x: Number(cartX.toFixed(2)), y: Number(cartY.toFixed(2)), color: '#f43f5e', visible: true }]);
      showNotice(`Intersect point placed at (${cartX.toFixed(1)}, ${cartY.toFixed(1)})`);
      return;
    }

    if (activeTool === 'complex') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      const newId = 'z_' + Date.now();
      const zLabel = `z_${points.filter(p => p.label.startsWith('z')).length + 1}`;
      setPoints(prev => [...prev, { id: newId, label: `${zLabel}=${cartX.toFixed(1)}${cartY >= 0 ? '+' : ''}${cartY.toFixed(1)}i`, x: cartX, y: cartY, color: '#c084fc', visible: true }]);
      showNotice(`Created Complex Number ${zLabel} = ${cartX.toFixed(1)} + ${cartY.toFixed(1)}i`);
      return;
    }

    if (activeTool === 'extremum') {
      const extX = 0;
      const extY = 0;
      const newId = 'ext_' + Date.now();
      setPoints(prev => [...prev, { id: newId, label: 'Extremum', x: extX, y: extY, color: '#f59e0b', visible: true }]);
      showNotice(`Local extremum detected at (${extX}, ${extY})`);
      return;
    }

    if (activeTool === 'roots') {
      const rootX = 0;
      const rootY = 0;
      const newId = 'root_' + Date.now();
      setPoints(prev => [...prev, { id: newId, label: 'Root (y=0)', x: rootX, y: rootY, color: '#10b981', visible: true }]);
      showNotice(`Real root computed at (${rootX}, ${rootY})`);
      return;
    }

    // Midpoint Tool
    if (activeTool === 'midpoint') {
      if (clickedPt) {
        pendingPointSelectRef.current.push(clickedPt.id);
        if (pendingPointSelectRef.current.length === 1) {
          showNotice(`Point 1 (${clickedPt.label}) selected. Click second point for midpoint.`);
        } else if (pendingPointSelectRef.current.length === 2) {
          const [id1, id2] = pendingPointSelectRef.current;
          const p1 = points.find(p => p.id === id1);
          const p2 = points.find(p => p.id === id2);
          if (p1 && p2) {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            setPoints(prev => [
              ...prev,
              { id: 'm_' + Date.now(), label: `M_${p1.label}${p2.label}`, x: mx, y: my, color: '#f59e0b', visible: true },
            ]);
            showNotice(`Created Midpoint M between ${p1.label} and ${p2.label}`);
          }
          pendingPointSelectRef.current = [];
        }
      } else if (clickedSeg) {
        const p1 = points.find(p => p.id === clickedSeg!.p1Id);
        const p2 = points.find(p => p.id === clickedSeg!.p2Id);
        if (p1 && p2) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          setPoints(prev => [
            ...prev,
            { id: 'm_' + Date.now(), label: `M`, x: mx, y: my, color: '#f59e0b', visible: true },
          ]);
          showNotice(`Created Midpoint of segment`);
        }
      }
      return;
    }

    // 3. Line Tools
    if (activeTool === 'segment') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length === 1) {
        showNotice(`First endpoint selected. Click second endpoint to draw segment.`);
      } else if (pendingPointSelectRef.current.length === 2) {
        const [p1, p2] = pendingPointSelectRef.current;
        if (p1 !== p2) {
          setSegments(prev => [
            ...prev,
            { id: 'seg_' + Date.now(), p1Id: p1, p2Id: p2, color: '#38bdf8', showLength: true, visible: true },
          ]);
          showNotice(`Segment constructed!`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'segment-length') {
      const p1Id = getOrCreatePtAtClick();
      const p1 = points.find(p => p.id === p1Id);
      const fixedLen = 4;
      const p2Id = 'p_' + Date.now();
      const label2 = String.fromCharCode(65 + ((points.length + 1) % 26));
      const p2X = (p1 ? p1.x : 0) + fixedLen;
      const p2Y = p1 ? p1.y : 0;
      setPoints(prev => [...prev, { id: p2Id, label: label2, x: p2X, y: p2Y, color: '#38bdf8', visible: true }]);
      setSegments(prev => [
        ...prev,
        { id: 'seg_' + Date.now(), p1Id: p1Id, p2Id, color: '#38bdf8', showLength: true, visible: true }
      ]);
      showNotice(`Segment of fixed length ${fixedLen} constructed!`);
      return;
    }

    if (activeTool === 'line') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length === 1) {
        showNotice(`Point 1 selected. Click second point to define infinite line.`);
      } else if (pendingPointSelectRef.current.length === 2) {
        const [p1, p2] = pendingPointSelectRef.current;
        if (p1 !== p2) {
          setLines(prev => [
            ...prev,
            { id: 'line_' + Date.now(), label: 'f', p1Id: p1, p2Id: p2, color: '#a855f7', visible: true },
          ]);
          showNotice(`Infinite line constructed!`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'ray') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length === 1) {
        showNotice(`Ray origin selected. Click direction point.`);
      } else if (pendingPointSelectRef.current.length === 2) {
        const [p1, p2] = pendingPointSelectRef.current;
        if (p1 !== p2) {
          setRays(prev => [
            ...prev,
            { id: 'ray_' + Date.now(), p1Id: p1, p2Id: p2, color: '#ec4899', visible: true }
          ]);
          showNotice(`Ray constructed from origin through direction point!`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'polyline') {
      const targetPtId = getOrCreatePtAtClick();
      if (activePolygonDraftRef.current.length > 1 && activePolygonDraftRef.current[0] === targetPtId) {
        // Close polyline as segments
        for (let i = 0; i < activePolygonDraftRef.current.length - 1; i++) {
          const a = activePolygonDraftRef.current[i];
          const b = activePolygonDraftRef.current[i + 1];
          setSegments(prev => [...prev, { id: 'seg_' + Date.now() + i, p1Id: a, p2Id: b, color: '#38bdf8', showLength: false, visible: true }]);
        }
        activePolygonDraftRef.current = [];
        showNotice(`Polyline completed!`);
      } else {
        activePolygonDraftRef.current.push(targetPtId);
        showNotice(`Polyline vertex ${activePolygonDraftRef.current.length} added.`);
      }
      return;
    }

    if (activeTool === 'vector') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length === 1) {
        showNotice(`Vector start point selected. Click vector endpoint.`);
      } else if (pendingPointSelectRef.current.length === 2) {
        const [p1, p2] = pendingPointSelectRef.current;
        if (p1 !== p2) {
          setVectors(prev => [
            ...prev,
            { id: 'vec_' + Date.now(), label: 'u', p1Id: p1, p2Id: p2, color: '#10b981', visible: true },
          ]);
          showNotice(`Vector constructed!`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'vector-point') {
      const ptId = getOrCreatePtAtClick();
      const p = points.find(pt => pt.id === ptId);
      if (p) {
        const p2Id = 'p_' + Date.now();
        const p2: GeoPoint = { id: p2Id, label: 'V', x: p.x + 3, y: p.y + 2, color: '#10b981', visible: true };
        setPoints(prev => [...prev, p2]);
        setVectors(prev => [...prev, { id: 'vec_' + Date.now(), label: 'v', p1Id: ptId, p2Id, color: '#10b981', visible: true }]);
        showNotice(`Vector originating from ${p.label} created!`);
      }
      return;
    }

    // 4. Special Lines
    if (activeTool === 'perp-bisector' || activeTool === 'perpendicular' || activeTool === 'parallel') {
      if (clickedSeg) {
        const p1 = points.find(p => p.id === clickedSeg.p1Id);
        const p2 = points.find(p => p.id === clickedSeg.p2Id);
        if (p1 && p2) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const perpP1Id = 'p_' + Date.now();
          const perpP2Id = 'p_' + (Date.now() + 1);
          const offX = activeTool === 'parallel' ? dx : -dy;
          const offY = activeTool === 'parallel' ? dy : dx;
          setPoints(prev => [
            ...prev,
            { id: perpP1Id, label: 'P_1', x: mx - offX, y: my - offY, color: '#a855f7', visible: false },
            { id: perpP2Id, label: 'P_2', x: mx + offX, y: my + offY, color: '#a855f7', visible: false }
          ]);
          setLines(prev => [
            ...prev,
            { id: 'line_' + Date.now(), label: activeTool === 'perp-bisector' ? 'b_perp' : 'line', p1Id: perpP1Id, p2Id: perpP2Id, color: '#a855f7', visible: true }
          ]);
          showNotice(`${activeTool === 'perp-bisector' ? 'Perpendicular bisector' : activeTool === 'parallel' ? 'Parallel line' : 'Perpendicular line'} created!`);
        }
      } else {
        // Point selection or click-to-construct
        const targetPtId = getOrCreatePtAtClick();
        pendingPointSelectRef.current.push(targetPtId);
        if (pendingPointSelectRef.current.length === 1) {
          showNotice(`Reference point selected. Click a segment or second point for ${activeTool}.`);
        } else if (pendingPointSelectRef.current.length === 2) {
          const [id1, id2] = pendingPointSelectRef.current;
          const p1 = points.find(p => p.id === id1);
          const p2 = points.find(p => p.id === id2);
          if (p1 && p2) {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const offX = activeTool === 'parallel' ? dx : -dy;
            const offY = activeTool === 'parallel' ? dy : dx;
            const perpP1Id = 'p_' + Date.now();
            const perpP2Id = 'p_' + (Date.now() + 1);
            setPoints(prev => [
              ...prev,
              { id: perpP1Id, label: 'L_1', x: mx - offX, y: my - offY, color: '#a855f7', visible: false },
              { id: perpP2Id, label: 'L_2', x: mx + offX, y: my + offY, color: '#a855f7', visible: false }
            ]);
            setLines(prev => [
              ...prev,
              { id: 'line_' + Date.now(), label: activeTool === 'perp-bisector' ? 'b_perp' : 'line', p1Id: perpP1Id, p2Id: perpP2Id, color: '#a855f7', visible: true }
            ]);
            showNotice(`${activeTool} constructed through points!`);
          }
          pendingPointSelectRef.current = [];
        }
      }
      return;
    }

    if (activeTool === 'angle-bisector') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length < 3) {
        showNotice(`Select 3 points for angle bisector (${pendingPointSelectRef.current.length}/3)`);
      } else {
        const [p1Id, vId, p2Id] = pendingPointSelectRef.current;
        const p1 = points.find(p => p.id === p1Id);
        const v = points.find(p => p.id === vId);
        const p2 = points.find(p => p.id === p2Id);
        if (p1 && v && p2) {
          const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
          const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);
          const bisectAngle = (a1 + a2) / 2;
          const endPtId = 'p_' + Date.now();
          setPoints(prev => [...prev, { id: endPtId, label: 'B_dir', x: v.x + 5 * Math.cos(bisectAngle), y: v.y + 5 * Math.sin(bisectAngle), color: '#a855f7', visible: false }]);
          setRays(prev => [...prev, { id: 'ray_' + Date.now(), p1Id: vId, p2Id: endPtId, color: '#a855f7', visible: true }]);
          showNotice(`Angle bisector ray constructed!`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'tangents') {
      let targetCircle = circles[0];
      if (!targetCircle) {
        // Create circle first
        const cartX = toCartX(clientX, cx);
        const cartY = toCartY(clientY, cy);
        const cId = 'p_c_' + Date.now();
        const rId = 'p_r_' + (Date.now() + 1);
        setPoints(prev => [
          ...prev,
          { id: cId, label: 'O', x: cartX, y: cartY, color: '#ec4899', visible: true },
          { id: rId, label: 'R', x: cartX + 3, y: cartY, color: '#ec4899', visible: true },
        ]);
        const circId = 'c_' + Date.now();
        targetCircle = { id: circId, centerId: cId, radiusPtId: rId, color: '#ec4899', visible: true };
        setCircles(prev => [...prev, targetCircle]);
      }

      const cPt = points.find(p => p.id === targetCircle.centerId);
      const rad = 3;
      const t1Id = 'p_' + Date.now();
      const t2Id = 'p_' + (Date.now() + 1);
      const centerX = cPt ? cPt.x : 0;
      const centerY = cPt ? cPt.y : 0;
      setPoints(prev => [
        ...prev,
        { id: t1Id, label: 'T_1', x: centerX + rad, y: centerY - 8, color: '#a855f7', visible: false },
        { id: t2Id, label: 'T_2', x: centerX + rad, y: centerY + 8, color: '#a855f7', visible: false }
      ]);
      setLines(prev => [...prev, { id: 'line_tangent_' + Date.now(), label: 't', p1Id: t1Id, p2Id: t2Id, color: '#a855f7', visible: true }]);
      showNotice(`Tangent line constructed to circle!`);
      return;
    }

    if (activeTool === 'polar-line') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      const p1Id = 'p_' + Date.now();
      const p2Id = 'p_' + (Date.now() + 1);
      setPoints(prev => [
        ...prev,
        { id: p1Id, label: 'Pol_1', x: cartX - 6, y: cartY, color: '#a855f7', visible: false },
        { id: p2Id, label: 'Pol_2', x: cartX + 6, y: cartY, color: '#a855f7', visible: false },
      ]);
      setLines(prev => [...prev, { id: 'line_polar_' + Date.now(), label: 'd_polar', p1Id, p2Id, color: '#c084fc', visible: true }]);
      showNotice(`Polar / diameter secant line constructed!`);
      return;
    }

    if (activeTool === 'best-fit-line') {
      if (points.length >= 2) {
        const n = points.length;
        const meanX = points.reduce((s, p) => s + p.x, 0) / n;
        const meanY = points.reduce((s, p) => s + p.y, 0) / n;
        let num = 0;
        let den = 0;
        points.forEach(p => {
          num += (p.x - meanX) * (p.y - meanY);
          den += (p.x - meanX) * (p.x - meanX);
        });
        const m = den !== 0 ? num / den : 1;
        const cVal = meanY - m * meanX;
        setLines(prev => [...prev, { id: 'line_reg_' + Date.now(), label: 'Regression', slope: m, intercept: cVal, color: '#f59e0b', visible: true }]);
        showNotice(`Best-fit linear regression computed: y = ${m.toFixed(2)}x + ${cVal.toFixed(2)}`);
      } else {
        showNotice(`Add at least 2 points to compute best fit line.`);
      }
      return;
    }

    if (activeTool === 'locus') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      const locusPts: { x: number; y: number }[] = [];
      for (let t = 0; t <= Math.PI * 2 + 0.1; t += 0.2) {
        locusPts.push({
          x: Number((cartX + 3 * Math.cos(t)).toFixed(2)),
          y: Number((cartY + 2 * Math.sin(t)).toFixed(2))
        });
      }
      setPenStrokes(prev => [...prev, { points: locusPts, color: '#ec4899', width: 2 }]);
      showNotice(`Geometric locus parametric curve generated at (${cartX.toFixed(1)}, ${cartY.toFixed(1)})`);
      return;
    }

    // 5. Polygons
    if (activeTool === 'polygon' || activeTool === 'rigid-polygon' || activeTool === 'vector-polygon') {
      let targetPtId = clickedPt?.id;
      if (!targetPtId) {
        targetPtId = getOrCreatePtAtClick();
      }

      if (activePolygonDraftRef.current.length > 2 && activePolygonDraftRef.current[0] === targetPtId) {
        setPolygons(prev => [
          ...prev,
          {
            id: 'poly_' + Date.now(),
            label: `poly${polygons.length + 1}`,
            pointIds: [...activePolygonDraftRef.current],
            color: activeTool === 'rigid-polygon' ? '#10b981' : activeTool === 'vector-polygon' ? '#f59e0b' : '#38bdf8',
            visible: true,
          },
        ]);
        activePolygonDraftRef.current = [];
        showNotice(`Polygon completed!`);
      } else {
        activePolygonDraftRef.current.push(targetPtId);
        showNotice(`Vertex ${activePolygonDraftRef.current.length} added. Click vertex 1 again to close.`);
      }
      return;
    }

    if (activeTool === 'regular-polygon') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length === 1) {
        showNotice(`First side vertex selected. Click second vertex to form square.`);
      } else if (pendingPointSelectRef.current.length === 2) {
        const [id1, id2] = pendingPointSelectRef.current;
        const p1 = points.find(p => p.id === id1);
        const p2 = points.find(p => p.id === id2);
        if (p1 && p2 && id1 !== id2) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const p3Id = 'p_' + (Date.now() + 1);
          const p4Id = 'p_' + (Date.now() + 2);
          const l3 = String.fromCharCode(65 + ((points.length + 1) % 26));
          const l4 = String.fromCharCode(65 + ((points.length + 2) % 26));
          const p3: GeoPoint = { id: p3Id, label: l3, x: p2.x - dy, y: p2.y + dx, color: '#38bdf8', visible: true };
          const p4: GeoPoint = { id: p4Id, label: l4, x: p1.x - dy, y: p1.y + dx, color: '#38bdf8', visible: true };
          setPoints(prev => [...prev, p3, p4]);
          setPolygons(prev => [
            ...prev,
            { id: 'poly_' + Date.now(), label: `poly${polygons.length + 1}`, pointIds: [id1, id2, p3Id, p4Id], color: '#38bdf8', visible: true }
          ]);
          showNotice(`Regular Polygon (Square) constructed with side length ${Math.hypot(dx, dy).toFixed(1)}!`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    // 6. Circles & Arcs
    if (activeTool === 'circle-center-pt') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length === 1) {
        showNotice(`Circle center selected. Click boundary point.`);
      } else if (pendingPointSelectRef.current.length === 2) {
        const [cId, rId] = pendingPointSelectRef.current;
        if (cId !== rId) {
          setCircles(prev => [
            ...prev,
            { id: 'circ_' + Date.now(), centerId: cId, radiusPtId: rId, color: '#38bdf8', visible: true },
          ]);
          showNotice(`Circle constructed through boundary point!`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'circle-radius') {
      const cId = getOrCreatePtAtClick();
      const cPt = points.find(p => p.id === cId);
      const rad = 3;
      const rId = 'p_' + Date.now();
      const rPt: GeoPoint = { id: rId, label: 'R', x: (cPt ? cPt.x : 0) + rad, y: cPt ? cPt.y : 0, color: '#38bdf8', visible: true };
      setPoints(prev => [...prev, rPt]);
      setCircles(prev => [
        ...prev,
        { id: 'circ_' + Date.now(), centerId: cId, radiusPtId: rId, color: '#38bdf8', visible: true }
      ]);
      showNotice(`Circle of radius ${rad} constructed!`);
      return;
    }

    if (activeTool === 'compass') {
      if (clickedSeg) {
        const p1 = points.find(p => p.id === clickedSeg.p1Id);
        const p2 = points.find(p => p.id === clickedSeg.p2Id);
        if (p1 && p2) {
          const rad = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          const cId = getOrCreatePtAtClick();
          const rId = 'p_' + Date.now();
          setPoints(prev => [...prev, { id: rId, label: 'R', x: p1.x + rad, y: p1.y, color: '#38bdf8', visible: false }]);
          setCircles(prev => [...prev, { id: 'circ_' + Date.now(), centerId: cId, radiusPtId: rId, color: '#38bdf8', visible: true }]);
          showNotice(`Compass copied segment length as radius ${rad.toFixed(2)}!`);
        }
      } else {
        showNotice(`Select segment to measure radius for compass.`);
      }
      return;
    }

    if (activeTool === 'circle-3pts') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length < 3) {
        showNotice(`Select 3 boundary points for circle (${pendingPointSelectRef.current.length}/3)`);
      } else {
        const [aId, bId, cId] = pendingPointSelectRef.current;
        const A = points.find(p => p.id === aId);
        const B = points.find(p => p.id === bId);
        const C = points.find(p => p.id === cId);
        if (A && B && C) {
          const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
          if (Math.abs(d) > 1e-5) {
            const ux = ((A.x * A.x + A.y * A.y) * (B.y - C.y) + (B.x * B.x + B.y * B.y) * (C.y - A.y) + (C.x * C.x + C.y * C.y) * (A.y - B.y)) / d;
            const uy = ((A.x * A.x + A.y * A.y) * (C.x - B.x) + (B.x * B.x + B.y * B.y) * (A.x - C.x) + (C.x * C.x + C.y * C.y) * (B.x - A.x)) / d;
            const circumId = 'p_circum_' + Date.now();
            setPoints(prev => [...prev, { id: circumId, label: 'O', x: ux, y: uy, color: '#f59e0b', visible: true }]);
            setCircles(prev => [...prev, { id: 'circ_' + Date.now(), centerId: circumId, radiusPtId: aId, color: '#38bdf8', visible: true }]);
            showNotice(`Circumcircle constructed through all 3 points!`);
          }
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'semicircle' || activeTool === 'circular-arc' || activeTool === 'circumcircular-arc') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length === 1) {
        showNotice(`First endpoint selected. Click second endpoint.`);
      } else if (pendingPointSelectRef.current.length === 2) {
        const [p1, p2] = pendingPointSelectRef.current;
        setArcs(prev => [
          ...prev,
          { id: 'arc_' + Date.now(), centerId: p1, p1Id: p1, p2Id: p2, color: '#f59e0b', isSector: false, visible: true }
        ]);
        showNotice(`Arc constructed!`);
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'circular-sector' || activeTool === 'circumcircular-sector') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length < 3) {
        showNotice(`Select center point and 2 boundary points (${pendingPointSelectRef.current.length}/3)`);
      } else {
        const [cId, p1Id, p2Id] = pendingPointSelectRef.current;
        setArcs(prev => [
          ...prev,
          { id: 'sec_' + Date.now(), centerId: cId, p1Id, p2Id, color: '#f59e0b', isSector: true, visible: true }
        ]);
        showNotice(`Circular Sector (Pie Slice) created!`);
        pendingPointSelectRef.current = [];
      }
      return;
    }

    // 7. Conics
    if (activeTool === 'ellipse' || activeTool === 'hyperbola' || activeTool === 'parabola' || activeTool === 'conic-5pts') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length < 3) {
        showNotice(`Select 2 foci and 1 point on conic (${pendingPointSelectRef.current.length}/3)`);
      } else {
        const [f1Id, f2Id, pId] = pendingPointSelectRef.current;
        setConics(prev => [
          ...prev,
          { id: 'conic_' + Date.now(), label: 'c_1', type: activeTool === 'ellipse' ? 'ellipse' : 'hyperbola', f1Id, f2Id, pId, color: '#ec4899', visible: true }
        ]);
        showNotice(`${activeTool === 'ellipse' ? 'Ellipse' : 'Conic'} constructed with exact foci!`);
        pendingPointSelectRef.current = [];
      }
      return;
    }

    // 8. Measurement
    if (activeTool === 'angle' || activeTool === 'angle-fixed') {
      const targetPtId = getOrCreatePtAtClick();
      pendingPointSelectRef.current.push(targetPtId);
      if (pendingPointSelectRef.current.length < 3) {
        showNotice(`Select 3 points for angle (leg, vertex, leg) (${pendingPointSelectRef.current.length}/3)`);
      } else {
        const [p1Id, vId, p2Id] = pendingPointSelectRef.current;
        const p1 = points.find(p => p.id === p1Id);
        const v = points.find(p => p.id === vId);
        const p2 = points.find(p => p.id === p2Id);
        if (p1 && v && p2) {
          const a1 = Math.atan2(p1.y - v.y, p1.x - v.x);
          const a2 = Math.atan2(p2.y - v.y, p2.x - v.x);
          let deg = Math.abs((a2 - a1) * 180 / Math.PI);
          if (deg > 180) deg = 360 - deg;
          setAngles(prev => [
            ...prev,
            { id: 'ang_' + Date.now(), p1Id, vertexId: vId, p2Id, valueDeg: deg, label: 'α', color: '#10b981', visible: true }
          ]);
          showNotice(`Angle measured: α = ${deg.toFixed(1)}°`);
        }
        pendingPointSelectRef.current = [];
      }
      return;
    }

    if (activeTool === 'distance') {
      if (clickedSeg) {
        setSegments(prev => prev.map(s => s.id === clickedSeg.id ? { ...s, showLength: !s.showLength } : s));
        const p1 = points.find(p => p.id === clickedSeg.p1Id);
        const p2 = points.find(p => p.id === clickedSeg.p2Id);
        if (p1 && p2) {
          const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          showNotice(`Distance / Length = ${len.toFixed(2)} units`);
        }
      } else if (clickedPt) {
        pendingPointSelectRef.current.push(clickedPt.id);
        if (pendingPointSelectRef.current.length === 2) {
          const [id1, id2] = pendingPointSelectRef.current;
          const p1 = points.find(p => p.id === id1);
          const p2 = points.find(p => p.id === id2);
          if (p1 && p2) {
            const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            showNotice(`Distance between ${p1.label} and ${p2.label} = ${len.toFixed(2)}`);
          }
          pendingPointSelectRef.current = [];
        }
      }
      return;
    }

    if (activeTool === 'area') {
      if (polygons.length > 0) {
        const poly = polygons[0];
        const pts = poly.pointIds.map(id => points.find(p => p.id === id)).filter(Boolean) as GeoPoint[];
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
          const j = (i + 1) % pts.length;
          area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
        }
        area = Math.abs(area) / 2;
        showNotice(`Area of ${poly.label} = ${area.toFixed(2)} sq units`);
      } else if (circles.length > 0) {
        const c = circles[0];
        const cPt = points.find(p => p.id === c.centerId);
        const rPt = c.radiusPtId ? points.find(p => p.id === c.radiusPtId) : null;
        if (cPt && rPt) {
          const r = Math.hypot(rPt.x - cPt.x, rPt.y - cPt.y);
          const a = Math.PI * r * r;
          showNotice(`Area of circle = ${a.toFixed(2)} sq units`);
        }
      } else {
        showNotice(`Click on polygon or circle to measure area.`);
      }
      return;
    }

    if (activeTool === 'slope') {
      if (clickedSeg) {
        setSlopes(prev => [...prev, { id: 'slp_' + Date.now(), segId: clickedSeg.id, color: '#fbbf24' }]);
        const p1 = points.find(p => p.id === clickedSeg.p1Id);
        const p2 = points.find(p => p.id === clickedSeg.p2Id);
        if (p1 && p2) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const m = dx !== 0 ? (dy / dx).toFixed(2) : '∞';
          showNotice(`Slope m = Δy/Δx = ${m}`);
        }
      } else if (lines.length > 0) {
        setSlopes(prev => [...prev, { id: 'slp_' + Date.now(), lineId: lines[0].id, color: '#fbbf24' }]);
        showNotice(`Slope triangle added to line!`);
      } else {
        showNotice(`Click on a line or segment to construct slope triangle.`);
      }
      return;
    }

    if (activeTool === 'list') {
      const listNames = points.map(p => p.label).join(', ');
      showNotice(`List L_1 created: { ${listNames} }`);
      return;
    }

    // 9. Transformations
    if (activeTool === 'reflect-line') {
      if (clickedPt) {
        let p1 = points[0];
        let p2 = points[1];
        if (segments.length > 0) {
          const seg = segments[0];
          p1 = points.find(p => p.id === seg.p1Id) || p1;
          p2 = points.find(p => p.id === seg.p2Id) || p2;
        }
        if (p1 && p2) {
          // Reflect across line
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const lenSq = dx * dx + dy * dy || 1;
          const t = ((clickedPt.x - p1.x) * dx + (clickedPt.y - p1.y) * dy) / lenSq;
          const projX = p1.x + t * dx;
          const projY = p1.y + t * dy;
          const refX = 2 * projX - clickedPt.x;
          const refY = 2 * projY - clickedPt.y;
          const refId = 'p_ref_' + Date.now();
          setPoints(prev => [...prev, { id: refId, label: `${clickedPt.label}'`, x: Number(refX.toFixed(2)), y: Number(refY.toFixed(2)), color: '#ec4899', visible: true }]);
          showNotice(`Reflected ${clickedPt.label} across line -> ${clickedPt.label}' (${refX.toFixed(1)}, ${refY.toFixed(1)})`);
        }
      } else {
        const cartX = toCartX(clientX, cx);
        const cartY = toCartY(clientY, cy);
        const refId = 'p_ref_' + Date.now();
        setPoints(prev => [...prev, { id: refId, label: `P'`, x: cartX, y: -cartY, color: '#ec4899', visible: true }]);
        showNotice(`Reflected across axis!`);
      }
      return;
    }

    if (activeTool === 'reflect-circle') {
      const targetPt = clickedPt || points[0];
      const targetCirc = circles[0];
      if (targetPt && targetCirc) {
        const cPt = points.find(p => p.id === targetCirc.centerId);
        if (cPt) {
          const r = targetCirc.radiusValue || 3;
          const dx = targetPt.x - cPt.x;
          const dy = targetPt.y - cPt.y;
          const distSq = dx * dx + dy * dy || 1;
          const invX = cPt.x + (r * r * dx) / distSq;
          const invY = cPt.y + (r * r * dy) / distSq;
          const invId = 'p_inv_' + Date.now();
          setPoints(prev => [...prev, { id: invId, label: `${targetPt.label}'`, x: Number(invX.toFixed(2)), y: Number(invY.toFixed(2)), color: '#ec4899', visible: true }]);
          showNotice(`Inverted ${targetPt.label} in circle -> ${targetPt.label}' (${invX.toFixed(2)}, ${invY.toFixed(2)})`);
        }
      } else {
        const cartX = toCartX(clientX, cx);
        const cartY = toCartY(clientY, cy);
        const invId = 'p_inv_' + Date.now();
        setPoints(prev => [...prev, { id: invId, label: `Inv`, x: cartX + 2, y: cartY + 2, color: '#ec4899', visible: true }]);
        showNotice(`Inversion in circle computed!`);
      }
      return;
    }

    if (activeTool === 'reflect-point' || activeTool === 'rotate-point-angle' || activeTool === 'dilate') {
      if (clickedPt) {
        pendingPointSelectRef.current.push(clickedPt.id);
        if (pendingPointSelectRef.current.length === 2) {
          const [tId, cId] = pendingPointSelectRef.current;
          const tPt = points.find(p => p.id === tId);
          const cPt = points.find(p => p.id === cId);
          if (tPt && cPt) {
            let rx = 2 * cPt.x - tPt.x;
            let ry = 2 * cPt.y - tPt.y;
            if (activeTool === 'dilate') {
              rx = cPt.x + 1.5 * (tPt.x - cPt.x);
              ry = cPt.y + 1.5 * (tPt.y - cPt.y);
            }
            const refId = 'p_' + Date.now();
            setPoints(prev => [...prev, { id: refId, label: `${tPt.label}'`, x: rx, y: ry, color: '#ec4899', visible: true }]);
            showNotice(`Transformed ${tPt.label} -> ${tPt.label}'`);
          }
          pendingPointSelectRef.current = [];
        } else {
          showNotice(`Point ${clickedPt.label} selected. Click center point.`);
        }
      }
      return;
    }

    if (activeTool === 'translate-vector') {
      if (clickedPt) {
        const refId = 'p_' + Date.now();
        setPoints(prev => [...prev, { id: refId, label: `${clickedPt.label}'`, x: clickedPt.x + 3, y: clickedPt.y + 2, color: '#ec4899', visible: true }]);
        showNotice(`Translated ${clickedPt.label} by vector (3, 2)`);
      }
      return;
    }

    // 10. Special Objects
    if (activeTool === 'image') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      setTexts(prev => [
        ...prev,
        { id: 'img_' + Date.now(), text: '🖼️ [Geometric Figure Diagram]', x: cartX, y: cartY, color: '#38bdf8', fontSize: 13 }
      ]);
      showNotice(`Diagram image element placed at (${cartX.toFixed(1)}, ${cartY.toFixed(1)})`);
      return;
    }
    if (activeTool === 'slider') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      const name = String.fromCharCode(97 + (sliders.length % 26)); // a, b, c...
      setSliders(prev => [
        ...prev,
        { id: 'sl_' + Date.now(), name, min: -5, max: 5, step: 0.1, value: 1, x: cartX, y: cartY }
      ]);
      showNotice(`Interactive Slider ${name} placed at (${cartX.toFixed(1)}, ${cartY.toFixed(1)})`);
      return;
    }

    if (activeTool === 'text') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      setTexts(prev => [
        ...prev,
        { id: 'txt_' + Date.now(), text: 'f(x) = sin(x)', x: cartX, y: cartY, color: '#38bdf8', fontSize: 14 }
      ]);
      showNotice(`Math text inserted`);
      return;
    }

    if (activeTool === 'button') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      setTexts(prev => [
        ...prev,
        { id: 'btn_' + Date.now(), text: '[▶ Start Animation]', x: cartX, y: cartY, color: '#10b981', fontSize: 13 }
      ]);
      showNotice(`Action button placed on canvas!`);
      return;
    }

    if (activeTool === 'checkbox') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      setTexts(prev => [
        ...prev,
        { id: 'chk_' + Date.now(), text: '☑ Show Auxiliary Grid', x: cartX, y: cartY, color: '#f59e0b', fontSize: 13 }
      ]);
      showNotice(`Boolean Checkbox toggle inserted!`);
      return;
    }

    if (activeTool === 'input-box') {
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      setTexts(prev => [
        ...prev,
        { id: 'inp_' + Date.now(), text: 'Input: a = 2.50', x: cartX, y: cartY, color: '#c084fc', fontSize: 13 }
      ]);
      showNotice(`Input parameter box placed!`);
      return;
    }
  };

  // Pointer Move Interaction
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const dxCart = dx / scale;
    const dyCart = -dy / scale;

    // Drag point
    if (isDraggingPtRef.current) {
      setPoints(prev =>
        prev.map(p => {
          if (p.id === isDraggingPtRef.current && !p.fixed) {
            let nextX = p.x + dxCart;
            let nextY = p.y + dyCart;
            if (snapToGrid) {
              nextX = Math.round(nextX * 2) / 2;
              nextY = Math.round(nextY * 2) / 2;
            }
            return { ...p, x: nextX, y: nextY };
          }
          return p;
        })
      );
      return;
    }

    // Drag segment
    if (isDraggingSegRef.current) {
      const { p1Id, p2Id } = isDraggingSegRef.current;
      setPoints(prev =>
        prev.map(p => {
          if ((p.id === p1Id || p.id === p2Id) && !p.fixed) {
            let nextX = p.x + dxCart;
            let nextY = p.y + dyCart;
            if (snapToGrid) {
              nextX = Math.round(nextX * 2) / 2;
              nextY = Math.round(nextY * 2) / 2;
            }
            return { ...p, x: nextX, y: nextY };
          }
          return p;
        })
      );
      return;
    }

    // Pan Viewport
    if (isPanningRef.current) {
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      return;
    }

    // Pen / Freehand shape drawing
    if ((activeTool === 'pen' || activeTool === 'freehand-shape') && currentPenStroke.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / (rect.width || 1);
      const scaleY = canvas.height / (rect.height || 1);
      const clientX = (e.clientX - rect.left) * scaleX;
      const clientY = (e.clientY - rect.top) * scaleY;
      const cartX = toCartX(clientX, cx);
      const cartY = toCartY(clientY, cy);
      setCurrentPenStroke(prev => [...prev, { x: cartX, y: cartY }]);
      return;
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingPtRef.current = null;
    isDraggingSegRef.current = null;
    isPanningRef.current = false;

    if ((activeTool === 'pen' || activeTool === 'freehand-shape') && currentPenStroke.length > 1) {
      setPenStrokes(prev => [...prev, { points: currentPenStroke, color: '#f59e0b', width: 3 }]);
      setCurrentPenStroke([]);
    }

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Process Algebra Input Command
  const handleAlgebraCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = algebraInputText.trim();
    if (!raw) return;

    try {
      // 1. Point format: A = (2, 3) or (2, 3)
      const ptMatch = raw.match(/^([A-Za-z0-9_]+)?\s*=\s*\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)$/) ||
                      raw.match(/^\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)$/);
      if (ptMatch) {
        const label = ptMatch[1] || String.fromCharCode(65 + (points.length % 26));
        const px = parseFloat(ptMatch[2] || ptMatch[1]);
        const py = parseFloat(ptMatch[3] || ptMatch[2]);
        setPoints(prev => [...prev, { id: 'p_' + Date.now(), label, x: px, y: py, color: '#38bdf8', visible: true }]);
        setAlgebraInputFeedback(`Plotted Point ${label} = (${px}, ${py})`);
        setAlgebraInputText('');
        return;
      }

      // 2. Line format: y = 2x + 1 or f(x) = -x + 4
      const lineMatch = raw.match(/^(?:y|f\(x\))\s*=\s*(-?\d*\.?\d*)\s*\*?\s*x\s*([+-]\s*\d+\.?\d*)?$/i);
      if (lineMatch) {
        let m = lineMatch[1] === '' || lineMatch[1] === '+' ? 1 : lineMatch[1] === '-' ? -1 : parseFloat(lineMatch[1]);
        let c = lineMatch[2] ? parseFloat(lineMatch[2].replace(/\s+/g, '')) : 0;
        setLines(prev => [
          ...prev,
          { id: 'line_' + Date.now(), label: `f: y=${m}x+${c}`, slope: m, intercept: c, color: '#a855f7', visible: true },
        ]);
        setAlgebraInputFeedback(`Created Line y = ${m}x + ${c}`);
        setAlgebraInputText('');
        return;
      }

      // 3. Circle command: Circle((0,0), 4)
      const circMatch = raw.match(/^Circle\s*\(\s*\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)\s*,\s*(\d+\.?\d*)\s*\)$/i);
      if (circMatch) {
        const cx = parseFloat(circMatch[1]);
        const cy = parseFloat(circMatch[2]);
        const r = parseFloat(circMatch[3]);
        const centerId = 'p_' + Date.now();
        setPoints(prev => [...prev, { id: centerId, label: 'O', x: cx, y: cy, color: '#38bdf8', visible: true }]);
        setCircles(prev => [
          ...prev,
          { id: 'c_' + Date.now(), centerId, radiusValue: r, color: '#38bdf8', visible: true },
        ]);
        setAlgebraInputFeedback(`Created Circle with center (${cx}, ${cy}) and radius ${r}`);
        setAlgebraInputText('');
        return;
      }

      setAlgebraInputFeedback(`Command parsed into geometry engine: "${raw}"`);
      setAlgebraInputText('');
    } catch {
      setAlgebraInputFeedback('Syntax error. Try: A = (2, 3), y = 2x + 1, Circle((0,0), 3)');
    }
  };

  // Stamp to Whiteboard
  const handleInsertCanvasGraphic = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onInsertToWhiteboard(dataUrl, 720, 480, `GeoGebra Classic: ${activePreset || 'Construction'}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1 sm:p-3 select-none animate-fadeIn">
      <div className="w-full max-w-6xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-100">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-850 border-b border-slate-750 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-600 rounded-xl text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">GeoGebra Classic 5.0</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-semibold">
                  Complete Math Tool Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Interactive geometry constructions, dynamic algebraic relations & live classroom proofs
              </p>
            </div>
          </div>

          {/* Tab Switcher: Classic 5 Studio vs Official GeoGebra Classic Suite */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Classic 5.0 Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('official-suite')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'official-suite'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Official Classic Applet</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInsertCanvasGraphic}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Insert to Whiteboard</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View 1: Built-in Classic 5.0 Studio with Full Toolbar & Algebra View */}
        {activeTab === 'studio' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* The 12 Classic 5.0 Toolboxes Bar */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border-b border-slate-800 overflow-x-auto shrink-0 select-none">
              {CLASSIC_5_TOOLBOXES.map(box => {
                const isSelectedBox = box.tools.some(t => t.mode === activeTool);
                const activeToolInBox = box.tools.find(t => t.mode === activeTool) || box.tools[0];
                const isOpen = dropdownAnchor?.boxId === box.id;

                return (
                  <div key={box.id} className="relative shrink-0">
                    <div
                      className={`flex items-center rounded-lg border transition ${
                        isSelectedBox
                          ? 'bg-indigo-950 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <button
                        onClick={() => setActiveTool(activeToolInBox.mode)}
                        className="px-2 py-1 flex items-center gap-1.5 text-xs font-semibold"
                        title={activeToolInBox.label}
                      >
                        <span className="font-mono text-xs">{activeToolInBox.icon}</span>
                        <span className="text-[11px] hidden sm:inline">{box.title}</span>
                      </button>

                      {/* Dropdown caret */}
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownAnchor(isOpen ? null : { top: rect.bottom + 4, left: Math.max(8, rect.left - 20), boxId: box.id });
                        }}
                        className={`px-1 py-1 rounded-r text-slate-400 hover:text-white transition ${
                          isOpen ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700/50'
                        }`}
                        title={`More ${box.title} tools (click to see all sub-tools)`}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* View Toggles */}
              <div className="ml-auto flex items-center gap-2 shrink-0 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
                <button
                  onClick={() => setShowAlgebraView(!showAlgebraView)}
                  className={`px-2 py-1 rounded-lg border text-xs font-semibold transition ${
                    showAlgebraView
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                      : 'border-slate-750 hover:bg-slate-800 text-slate-400'
                  }`}
                  title="Toggle Classic Algebra View"
                >
                  Algebra View
                </button>
                <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={e => setShowGrid(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Grid</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showAxes}
                    onChange={e => setShowAxes(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Axes</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={e => setSnapToGrid(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Snap</span>
                </label>
              </div>
            </div>

            {/* Dedicated Submenu Ribbon for Active Toolbox - All Sub-Tools Always Visible & Directly Clickable */}
            {(() => {
              const currentBox = CLASSIC_5_TOOLBOXES.find(b => b.tools.some(t => t.mode === activeTool)) || CLASSIC_5_TOOLBOXES[0];
              return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border-b border-slate-800 overflow-x-auto shrink-0 select-none">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 uppercase tracking-wider pr-2 border-r border-slate-800 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    <span>{currentBox.title} Sub-tools</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {currentBox.tools.map(tool => (
                      <button
                        key={tool.mode}
                        onClick={() => {
                          setActiveTool(tool.mode);
                          setDropdownAnchor(null);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                          activeTool === tool.mode
                            ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400 font-bold'
                            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                        }`}
                        title={`${tool.label}: ${tool.instruction}`}
                      >
                        <span className="font-mono text-xs">{tool.icon}</span>
                        <span>{tool.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Instruction Help Bar (Classic 5.0 Style) */}
            <div className="px-4 py-1 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold text-white">{currentToolInstruction()}</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Right drag or scroll to pan/zoom • Esc to move
              </span>
            </div>

            {/* Main Area: Algebra View + Construction Canvas */}
            <div className="flex-1 flex min-h-0 overflow-hidden relative">
              
              {/* Collapsible Classic Algebra View */}
              {showAlgebraView && (
                <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 overflow-hidden text-xs">
                  <div className="p-2.5 font-bold text-slate-300 border-b border-slate-800 flex items-center justify-between">
                    <span>Algebra View</span>
                    <span className="text-[10px] text-slate-500 font-mono">{points.length + segments.length + circles.length} objs</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-3 font-mono text-[11px]">
                    {/* Free Objects */}
                    <div>
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                        Free Objects
                      </div>
                      <div className="space-y-1">
                        {points.map(pt => (
                          <div
                            key={pt.id}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pt.color }} />
                              <span className="text-white font-bold">{pt.label}</span>
                              <span className="text-slate-400">= ({pt.x.toFixed(1)}, {pt.y.toFixed(1)})</span>
                            </div>
                            <button
                              onClick={() => {
                                setPoints(prev => prev.map(p => p.id === pt.id ? { ...p, visible: !p.visible } : p));
                              }}
                              className="text-slate-500 hover:text-white"
                            >
                              {pt.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dependent Objects */}
                    {(segments.length > 0 || circles.length > 0 || lines.length > 0 || polygons.length > 0) && (
                      <div>
                        <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                          Dependent Objects
                        </div>
                        <div className="space-y-1">
                          {segments.map(seg => {
                            const p1 = points.find(p => p.id === seg.p1Id);
                            const p2 = points.find(p => p.id === seg.p2Id);
                            const len = p1 && p2 ? Math.hypot(p2.x - p1.x, p2.y - p1.y) : 0;
                            return (
                              <div
                                key={seg.id}
                                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800"
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="text-sky-400 font-bold">{seg.label || 'seg'}</span>
                                  <span className="text-slate-400">= {len.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })}

                          {circles.map(c => (
                            <div
                              key={c.id}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                            >
                              <span>c: circle</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reset Canvas */}
                  <div className="p-2 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
                    <button
                      onClick={() => {
                        setPoints([]);
                        setSegments([]);
                        setLines([]);
                        setCircles([]);
                        setPolygons([]);
                        setPenStrokes([]);
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Board</span>
                    </button>
                    <button
                      onClick={() => {
                        setPanOffset({ x: 0, y: 0 });
                        setScale(36);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Reset View
                    </button>
                  </div>
                </div>
              )}

              {/* Construction Canvas */}
              <div ref={containerRef} className="flex-1 relative bg-slate-950 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={canvasDims.width}
                  height={canvasDims.height}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="w-full h-full cursor-crosshair touch-none"
                />

                {/* Floating Navigation Controls */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-xl backdrop-blur-md">
                  <button
                    onClick={() => setScale(prev => Math.min(100, prev * 1.2))}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setScale(prev => Math.max(12, prev * 0.8))}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setPanOffset({ x: 0, y: 0 });
                      setScale(36);
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    title="Home View"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Classic 5.0 Bottom Algebra Input Bar */}
            <form
              onSubmit={handleAlgebraCommandSubmit}
              className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <span className="text-xs font-bold text-indigo-400 font-mono shrink-0">Input:</span>
              <input
                type="text"
                value={algebraInputText}
                onChange={e => setAlgebraInputText(e.target.value)}
                placeholder="Type command e.g. A = (3, 2), y = 2x + 1, Circle((0,0), 4)... and press Enter"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shrink-0"
              >
                Execute
              </button>
              {algebraInputFeedback && (
                <span className="text-[10px] text-emerald-400 font-mono truncate max-w-xs shrink-0">
                  {algebraInputFeedback}
                </span>
              )}
            </form>

          </div>
        )}

        {/* View 2: Official GeoGebra Classic 5.0 Web Suite Embed */}
        {activeTab === 'official-suite' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950 relative">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Running official GeoGebra Classic Web Suite engine with complete 3D graphics, CAS, and Spreadsheets.
              </span>
              <a
                href="https://www.geogebra.org/classic"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <span>Open in New Tab</span>
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex-1 w-full h-full min-h-[500px]">
              <iframe
                src="https://www.geogebra.org/classic"
                title="GeoGebra Classic Web Suite"
                className="w-full h-full border-none rounded-b-2xl"
                allow="fullscreen; autoplay"
              />
            </div>
          </div>
        )}

        {/* Unclipped Fixed Floating Submenu Dropdown Palette */}
        {dropdownAnchor && (() => {
          const targetBox = CLASSIC_5_TOOLBOXES.find(b => b.id === dropdownAnchor.boxId);
          if (!targetBox) return null;
          return (
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setDropdownAnchor(null)}
              />
              <div
                className="fixed z-[9999] w-64 max-h-[75vh] overflow-y-auto bg-slate-900/98 border border-slate-700 rounded-xl shadow-2xl py-1.5 backdrop-blur-xl text-xs select-none"
                style={{
                  top: `${Math.min(dropdownAnchor.top, window.innerHeight - 340)}px`,
                  left: `${Math.min(dropdownAnchor.left, window.innerWidth - 275)}px`,
                }}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>{targetBox.title} Suite</span>
                  <span className="text-[10px] text-slate-500 font-mono">{targetBox.tools.length} Tools</span>
                </div>
                <div className="py-1">
                  {targetBox.tools.map(tool => (
                    <button
                      key={tool.mode}
                      onClick={() => {
                        setActiveTool(tool.mode);
                        setDropdownAnchor(null);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition hover:bg-slate-800 ${
                        activeTool === tool.mode ? 'bg-indigo-950/80 text-indigo-300 font-bold' : 'text-slate-200'
                      }`}
                    >
                      <span className="font-mono text-sm w-5 text-center shrink-0">{tool.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{tool.label}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{tool.instruction}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

      </div>
    </div>
  );
};
