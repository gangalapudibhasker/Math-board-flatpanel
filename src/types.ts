export type ToolType =
  | 'select'
  | 'lasso'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'laser'
  | 'hand'
  | 'text'
  | 'shape'
  | 'ruler'
  | 'protractor'
  | 'spotlight'
  | 'curtain'
  | 'timer'
  | 'dice';

export type BackgroundStyle =
  | 'plain-white'
  | 'grid-white'
  | 'ruled-white'
  | 'graph-white'
  | 'plain-dark'
  | 'grid-dark'
  | 'ruled-dark'
  | 'graph-dark';

export type SolidType =
  | 'cube'
  | 'cuboid'
  | 'cylinder'
  | 'cone'
  | 'sphere'
  | 'hemisphere'
  | 'square-pyramid'
  | 'tetrahedron'
  | 'octahedron'
  | 'dodecahedron'
  | 'icosahedron'
  | 'pawn-sphere'
  | 'faceted-gem'
  | 'triangular-prism'
  | 'hourglass'
  | 'cone-on-cylinder'
  | 'hemisphere-on-cylinder'
  | 'hemisphere-on-cube'
  | 'cylinder-with-conical-cavity'
  | 'frustum'
  | 'cone-on-hemisphere'
  | 'capsule';

export interface Solid3DElement {
  id: string;
  type: 'solid3d';
  solidType: SolidType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotationX: number; // pitch (-90 to 90)
  rotationY: number; // yaw (-180 to 180)
  rotation?: number; // 2D rotation in degrees (0-360)
  color: string;
  shadingStyle?: 'natural' | 'wood' | 'sandstone' | 'marble' | 'terracotta' | 'patina' | 'iridescent' | 'matte' | 'wireframe' | 'blueprint';
  wireframeOnly?: boolean;
  showDimensions?: boolean;
  showFormulas?: boolean;
  showNet?: boolean; // Display 2D Net Diagram unfolding instead of 3D solid
  netFoldRatio?: number; // 0 for flat 2D net, 1 for fully folded 3D solid
  exploded?: boolean;
  explodeRatio?: number; // 0 (assembled) to 1 (fully separated)
  radius?: number;
  height3d?: number;
  length?: number;
  width3d?: number;
  label?: string;
}

export type ShapeType =
  // Row 1
  | 'line'
  | 'dashed-line'
  | 'arrow'
  | 'double-arrow'
  | 'ray'
  | 'angle'
  // Row 2
  | 'rect'
  | 'square'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'right-triangle'
  // Row 3
  | 'scalene-triangle'
  | 'parallelogram'
  | 'rhombus'
  | 'trapezoid'
  | 'kite'
  | 'pentagon'
  // Row 4
  | 'hexagon'
  | 'star'
  | 'semicircle'
  | 'sector'
  | 'cube'
  | 'cylinder'
  // Row 5
  | 'cone'
  | 'sphere'
  // Legacy
  | 'coordinate';

export type PenProfile = 'soft' | 'medium' | 'firm' | 'velocity' | 'uniform';
export type PenNibStyle = 'ballpoint' | 'marker' | 'calligraphy';

export interface PenSensitivityConfig {
  enabled: boolean;
  profile: PenProfile;
  nibStyle: PenNibStyle;
  minScale: number;
  maxScale: number;
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  time?: number;
}

export interface StrokeElement {
  id: string;
  type: 'stroke';
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  isHighlighter?: boolean;
  widths?: number[];
  nibStyle?: PenNibStyle;
  profile?: PenProfile;
  rotation?: number;
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeDash?: boolean;
  rotation?: number;
}

export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'handwriting';
  isBold?: boolean;
  isItalic?: boolean;
  rotation?: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string; // base64 or blob url
  aspectRatio: number;
  isCroppedPdf?: boolean;
  pdfOriginalName?: string;
  pdfPageNum?: number;
  rotation?: number;
}

export interface StickyNoteElement {
  id: string;
  type: 'sticky';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string; // yellow, blue, green, pink
  rotation?: number;
}

export type BoardElement =
  | StrokeElement
  | ShapeElement
  | TextElement
  | ImageElement
  | StickyNoteElement
  | Solid3DElement;

export interface BoardPage {
  id: string;
  backgroundStyle: BackgroundStyle;
  backgroundColor?: string;
  elements: BoardElement[];
  thumbnail?: string;
}

export interface BoardDocument {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pages: BoardPage[];
  activePageIndex: number;
}

export interface TeachingWidgetsState {
  ruler: {
    active: boolean;
    x: number;
    y: number;
    length: number;
    rotation: number;
  };
  protractor: {
    active: boolean;
    x: number;
    y: number;
    radius: number;
    rotation: number;
  };
  spotlight: {
    active: boolean;
    x: number;
    y: number;
    radius: number;
  };
  curtain: {
    active: boolean;
    revealRatio: number; // 0 to 1
  };
  timer: {
    active: boolean;
    mode: 'countdown' | 'stopwatch';
    secondsRemaining: number;
    initialSeconds: number;
    isRunning: boolean;
  };
  dice: {
    active: boolean;
    value: number;
    isRolling: boolean;
  };
}
