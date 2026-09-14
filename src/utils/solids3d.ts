import { Solid3DElement, SolidType } from '../types';
import { drawSolidNetDiagram } from './solidsNets';

export interface SolidInfo {
  type: SolidType;
  name: string;
  category: 'single' | 'combination';
  formulaV: string;
  formulaCSA: string;
  formulaTSA: string;
  latexV: string;
  latexCSA: string;
  latexTSA: string;
  latexVars?: string;
  description: string;
  isCombination?: boolean;
  explodeDescription?: string;
  defaultDimensions: {
    radius?: number;
    height3d?: number;
    length?: number;
    width3d?: number;
  };
}

export const SOLIDS_CATALOG: Record<SolidType, SolidInfo> = {
  cube: {
    type: 'cube',
    name: 'Cube',
    category: 'single',
    formulaV: 'V = a³',
    formulaCSA: 'LSA = 4a²',
    formulaTSA: 'TSA = 6a²',
    latexV: 'V = a^3',
    latexCSA: '\\text{LSA} = 4a^2',
    latexTSA: '\\text{TSA} = 6a^2',
    latexVars: 'a = \\text{edge length}',
    description: 'Regular hexahedron with 6 congruent square faces.',
    defaultDimensions: { length: 110, width3d: 110, height3d: 110 },
  },
  cuboid: {
    type: 'cuboid',
    name: 'Cuboid (Rectangular Prism)',
    category: 'single',
    formulaV: 'V = l × b × h',
    formulaCSA: 'LSA = 2h(l + b)',
    formulaTSA: 'TSA = 2(lb + bh + hl)',
    latexV: 'V = l \\cdot b \\cdot h',
    latexCSA: '\\text{LSA} = 2h(l + b)',
    latexTSA: '\\text{TSA} = 2(lb + bh + hl)',
    latexVars: 'l = \\text{length}, \\; b = \\text{breadth}, \\; h = \\text{height}',
    description: 'Box-shaped solid with six rectangular faces.',
    defaultDimensions: { length: 140, width3d: 85, height3d: 95 },
  },
  cylinder: {
    type: 'cylinder',
    name: 'Right Circular Cylinder',
    category: 'single',
    formulaV: 'V = π r² h',
    formulaCSA: 'CSA = 2 π r h',
    formulaTSA: 'TSA = 2 π r (r + h)',
    latexV: 'V = \\pi r^2 h',
    latexCSA: '\\text{CSA} = 2\\pi r h',
    latexTSA: '\\text{TSA} = 2\\pi r (r + h)',
    latexVars: 'r = \\text{radius}, \\; h = \\text{height}',
    description: 'Solid with parallel congruent circular bases connected by curved surface.',
    defaultDimensions: { radius: 55, height3d: 125 },
  },
  cone: {
    type: 'cone',
    name: 'Right Circular Cone',
    category: 'single',
    formulaV: 'V = ⅓ π r² h',
    formulaCSA: 'CSA = π r l  (l = √(r² + h²))',
    formulaTSA: 'TSA = π r (r + l)',
    latexV: 'V = \\frac{1}{3}\\pi r^2 h',
    latexCSA: '\\text{CSA} = \\pi r l \\quad (l = \\sqrt{r^2 + h^2})',
    latexTSA: '\\text{TSA} = \\pi r (r + l)',
    latexVars: 'r = \\text{radius}, \\; h = \\text{height}, \\; l = \\text{slant height}',
    description: 'Pyramidal solid tapering smoothly from flat circular base to apex.',
    defaultDimensions: { radius: 60, height3d: 125 },
  },
  sphere: {
    type: 'sphere',
    name: 'Sphere',
    category: 'single',
    formulaV: 'V = ⁴⁄₃ π r³',
    formulaCSA: 'CSA = 4 π r²',
    formulaTSA: 'TSA = 4 π r²',
    latexV: 'V = \\frac{4}{3}\\pi r^3',
    latexCSA: '\\text{CSA} = 4\\pi r^2',
    latexTSA: '\\text{TSA} = 4\\pi r^2',
    latexVars: 'r = \\text{radius}',
    description: 'Perfect round geometrical object in 3D space.',
    defaultDimensions: { radius: 65 },
  },
  hemisphere: {
    type: 'hemisphere',
    name: 'Hemisphere',
    category: 'single',
    formulaV: 'V = ⅔ π r³',
    formulaCSA: 'CSA = 2 π r²',
    formulaTSA: 'TSA = 3 π r²',
    latexV: 'V = \\frac{2}{3}\\pi r^3',
    latexCSA: '\\text{CSA} = 2\\pi r^2',
    latexTSA: '\\text{TSA} = 3\\pi r^2',
    latexVars: 'r = \\text{radius}',
    description: 'Half of a sphere bounded by a flat circular plane.',
    defaultDimensions: { radius: 65 },
  },
  'square-pyramid': {
    type: 'square-pyramid',
    name: 'Square Pyramid',
    category: 'single',
    formulaV: 'V = ⅓ a² h',
    formulaCSA: 'LSA = 2 a l',
    formulaTSA: 'TSA = a² + 2 a l',
    latexV: 'V = \\frac{1}{3}a^2 h',
    latexCSA: '\\text{LSA} = 2a l \\quad (l = \\sqrt{h^2 + (a/2)^2})',
    latexTSA: '\\text{TSA} = a^2 + 2a l',
    latexVars: 'a = \\text{base side}, \\; h = \\text{vertical height}, \\; l = \\text{slant height}',
    description: 'Pyramid with a square base and four triangular faces meeting at apex.',
    defaultDimensions: { length: 110, height3d: 125 },
  },
  'triangular-prism': {
    type: 'triangular-prism',
    name: 'Triangular Prism',
    category: 'single',
    formulaV: 'V = ½ b × h_tri × L',
    formulaCSA: 'LSA = (s₁ + s₂ + s₃) × L',
    formulaTSA: 'TSA = b × h_tri + (s₁ + s₂ + s₃)L',
    latexV: 'V = \\frac{1}{2} b \\cdot h_{\\text{tri}} \\cdot L',
    latexCSA: '\\text{LSA} = (s_1 + s_2 + s_3)L',
    latexTSA: '\\text{TSA} = b \\cdot h_{\\text{tri}} + (s_1 + s_2 + s_3)L',
    latexVars: 'b = \\text{base}, \\; h_{\\text{tri}} = \\text{triangle height}, \\; L = \\text{prism length}',
    description: 'Polyhedron made of 2 triangular bases and 3 rectangular sides.',
    defaultDimensions: { length: 125, width3d: 85, height3d: 95 },
  },
  'cone-on-cylinder': {
    type: 'cone-on-cylinder',
    name: 'Cone on Cylinder (Rocket / Tent)',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = π r² h_cyl + ⅓ π r² h_cone',
    formulaCSA: 'CSA = 2 π r h_cyl + π r l_cone',
    formulaTSA: 'TSA = π r² + 2 π r h_cyl + π r l_cone',
    latexV: 'V = \\pi r^2 h_{\\text{cyl}} + \\frac{1}{3}\\pi r^2 h_{\\text{cone}}',
    latexCSA: '\\text{CSA} = 2\\pi r h_{\\text{cyl}} + \\pi r l_{\\text{cone}}',
    latexTSA: '\\text{TSA} = \\pi r^2 + 2\\pi r h_{\\text{cyl}} + \\pi r l_{\\text{cone}}',
    latexVars: 'r = \\text{radius}, \\; h_{\\text{cyl}} = \\text{cylinder height}, \\; h_{\\text{cone}} = \\text{cone height}',
    explodeDescription: 'Explodes conical roof upwards from cylinder body, displaying the internal joint boundary.',
    description: 'Classic combination solid: conical roof or rocket nose mounted on a cylinder.',
    defaultDimensions: { radius: 55, height3d: 155 },
  },
  'hemisphere-on-cylinder': {
    type: 'hemisphere-on-cylinder',
    name: 'Hemisphere on Cylinder (Capsule)',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = π r² h + ⅔ π r³',
    formulaCSA: 'CSA = 2 π r h + 2 π r²',
    formulaTSA: 'TSA = π r² + 2 π r h + 2 π r²',
    latexV: 'V = \\pi r^2 h + \\frac{2}{3}\\pi r^3',
    latexCSA: '\\text{CSA} = 2\\pi r h + 2\\pi r^2',
    latexTSA: '\\text{TSA} = \\pi r^2 + 2\\pi r h + 2\\pi r^2',
    latexVars: 'r = \\text{common radius}, \\; h = \\text{cylinder body height}',
    explodeDescription: 'Separates hemisphere dome from cylinder to expose the circular joint face.',
    description: 'Medicine capsule or storage silo: hemisphere attached to cylindrical body.',
    defaultDimensions: { radius: 55, height3d: 145 },
  },
  'hemisphere-on-cube': {
    type: 'hemisphere-on-cube',
    name: 'Hemisphere on Cube',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = a³ + ⅔ π r³',
    formulaCSA: 'Dome CSA = 2 π r²',
    formulaTSA: 'TSA = 6a² - π r² + 2 π r²',
    latexV: 'V = a^3 + \\frac{2}{3}\\pi r^3',
    latexCSA: '\\text{Dome CSA} = 2\\pi r^2',
    latexTSA: '\\text{TSA} = 6a^2 - \\pi r^2 + 2\\pi r^2 = 6a^2 + \\pi r^2',
    latexVars: 'a = \\text{cube side}, \\; r = \\text{hemisphere radius}',
    explodeDescription: 'Lifts dome off cube top face, highlighting the circular imprint subtracted from the top.',
    description: 'Decorative architectural block: hemisphere mounted on top face of cube.',
    defaultDimensions: { length: 110, radius: 48 },
  },
  'cylinder-with-conical-cavity': {
    type: 'cylinder-with-conical-cavity',
    name: 'Cylinder with Conical Cavity',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = π r² h - ⅓ π r² h = ⅔ π r² h',
    formulaCSA: 'Internal CSA = π r l',
    formulaTSA: 'TSA = π r² + 2 π r h + π r l',
    latexV: 'V = \\pi r^2 h - \\frac{1}{3}\\pi r^2 h = \\frac{2}{3}\\pi r^2 h',
    latexCSA: '\\text{Internal CSA} = \\pi r l',
    latexTSA: '\\text{TSA} = \\pi r^2 + 2\\pi r h + \\pi r l',
    latexVars: 'r = \\text{radius}, \\; h = \\text{height}, \\; l = \\text{cavity slant height}',
    explodeDescription: 'Extracts the carved cone plug upwards from inside the hollow cylinder to illustrate subtraction.',
    description: 'Hollowed cylinder with an inverted conical cavity scooped out.',
    defaultDimensions: { radius: 55, height3d: 135 },
  },
  frustum: {
    type: 'frustum',
    name: 'Frustum of a Cone (Bucket / Tumbler)',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = ⅓ π h (r₁² + r₂² + r₁r₂)',
    formulaCSA: 'CSA = π (r₁ + r₂) l',
    formulaTSA: 'TSA = π [ (r₁ + r₂) l + r₁² + r₂² ]',
    latexV: 'V = \\frac{1}{3}\\pi h(r_1^2 + r_2^2 + r_1 r_2)',
    latexCSA: '\\text{CSA} = \\pi (r_1 + r_2)l \\quad (l = \\sqrt{h^2 + (r_1 - r_2)^2})',
    latexTSA: '\\text{TSA} = \\pi [(r_1 + r_2)l + r_1^2 + r_2^2]',
    latexVars: 'r_1 = \\text{top radius}, \\; r_2 = \\text{bottom radius}, \\; h = \\text{height}',
    explodeDescription: 'Separates top slicing cone from bottom frustum to explain cone slicing theorem.',
    description: 'Portion of a cone that lies between two parallel cutting planes.',
    defaultDimensions: { radius: 60, width3d: 38, height3d: 120 },
  },
  'cone-on-hemisphere': {
    type: 'cone-on-hemisphere',
    name: 'Cone on Hemisphere (Spinning Top / Toy)',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = ⅓ π r² h + ⅔ π r³',
    formulaCSA: 'CSA = π r l + 2 π r²',
    formulaTSA: 'TSA = π r l + 2 π r²',
    latexV: 'V = \\frac{1}{3}\\pi r^2 h + \\frac{2}{3}\\pi r^3',
    latexCSA: '\\text{CSA} = \\pi r l + 2\\pi r^2 \\quad (l = \\sqrt{r^2 + h^2})',
    latexTSA: '\\text{TSA} = \\pi r l + 2\\pi r^2',
    latexVars: 'r = \\text{common radius}, \\; h = \\text{cone height}, \\; l = \\text{slant height}',
    explodeDescription: 'Separates the upper hemisphere dome from the lower cone base, revealing the circular joint interface.',
    description: 'Classic combination solid: spinning top toy or ice-cream cone with hemispherical top.',
    defaultDimensions: { radius: 55, height3d: 140 },
  },
  capsule: {
    type: 'capsule',
    name: 'Capsule (Cylinder with Hemispherical Ends)',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = π r² h + ⁴⁄₃ π r³',
    formulaCSA: 'CSA = 2 π r h + 4 π r²',
    formulaTSA: 'TSA = 2 π r h + 4 π r²',
    latexV: 'V = \\pi r^2 h + \\frac{4}{3}\\pi r^3',
    latexCSA: '\\text{CSA} = 2\\pi r h + 4\\pi r^2',
    latexTSA: '\\text{TSA} = 2\\pi r h + 4\\pi r^2',
    latexVars: 'r = \\text{radius}, \\; h = \\text{cylinder body height}',
    explodeDescription: 'Separates both hemispherical caps outward from the cylindrical body to expose internal joints.',
    description: 'Storage silo or medicine capsule: cylinder bounded by two hemispherical domes.',
    defaultDimensions: { radius: 50, height3d: 150 },
  },
  tetrahedron: {
    type: 'tetrahedron',
    name: 'Regular Tetrahedron (Triangular Pyramid)',
    category: 'single',
    formulaV: 'V = a³ / (6√2)',
    formulaCSA: 'LSA = 3 × (√3/4 a²)',
    formulaTSA: 'TSA = √3 a²',
    latexV: 'V = \\frac{a^3}{6\\sqrt{2}}',
    latexCSA: '\\text{LSA} = \\frac{3\\sqrt{3}}{4}a^2',
    latexTSA: '\\text{TSA} = \\sqrt{3}a^2',
    latexVars: 'a = \\text{edge length}',
    description: 'Regular polyhedron composed of four equilateral triangular faces (matching uploaded image).',
    defaultDimensions: { length: 120, height3d: 110 },
  },
  hourglass: {
    type: 'hourglass',
    name: 'Hourglass (Double Frustum)',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = 2 × [⅓ π h (r₁² + r₂² + r₁r₂)]',
    formulaCSA: 'CSA = 2 × π(r₁ + r₂)l',
    formulaTSA: 'TSA = 2π(r₁ + r₂)l + 2πr₁²',
    latexV: 'V = 2 \\times \\frac{1}{3}\\pi h(r_1^2 + r_2^2 + r_1 r_2)',
    latexCSA: '\\text{CSA} = 2\\pi(r_1 + r_2)l',
    latexTSA: '\\text{TSA} = 2\\pi(r_1 + r_2)l + 2\\pi r_1^2',
    latexVars: 'r_1 = \\text{base radius}, \\; r_2 = \\text{neck radius}, \\; h = \\text{half height}',
    explodeDescription: 'Separates top frustum chamber from bottom frustum at the center waist.',
    description: 'Symmetrical hourglass consisting of two flared frustums meeting at a narrow waist (matching uploaded image).',
    defaultDimensions: { radius: 55, width3d: 18, height3d: 140 },
  },
  octahedron: {
    type: 'octahedron',
    name: 'Regular Octahedron (Natural Sandstone)',
    category: 'single',
    formulaV: 'V = (√2 / 3) a³ ≈ 0.471 a³',
    formulaCSA: 'LSA = √3 a²',
    formulaTSA: 'TSA = 2√3 a² ≈ 3.464 a²',
    latexV: 'V = \\frac{\\sqrt{2}}{3}a^3',
    latexCSA: '\\text{LSA} = \\sqrt{3}a^2',
    latexTSA: '\\text{TSA} = 2\\sqrt{3}a^2',
    latexVars: 'a = \\text{edge length}, \\; 8 \\text{ equilateral triangular faces}',
    description: 'Platonic solid with 8 equilateral triangular faces standing as a diamond bipyramid in natural sandstone (as in image).',
    defaultDimensions: { length: 110, height3d: 130 },
  },
  dodecahedron: {
    type: 'dodecahedron',
    name: 'Regular Dodecahedron (Natural Wood)',
    category: 'single',
    formulaV: 'V = ((15 + 7√5)/4) a³ ≈ 7.663 a³',
    formulaCSA: 'LSA = 10 × A_pentagon',
    formulaTSA: 'TSA = 3√(25 + 10√5) a² ≈ 20.646 a²',
    latexV: 'V = \\frac{15 + 7\\sqrt{5}}{4}a^3',
    latexCSA: '\\text{LSA} = 10 \\times \\text{Area of pentagon}',
    latexTSA: '\\text{TSA} = 3\\sqrt{25 + 10\\sqrt{5}}\\,a^2',
    latexVars: 'a = \\text{edge length}, \\; 12 \\text{ regular pentagonal faces}',
    description: 'Platonic solid with 12 regular pentagonal faces, crafted in rich natural wood with warm studio lighting (center figure in image).',
    defaultDimensions: { length: 95, height3d: 95 },
  },
  icosahedron: {
    type: 'icosahedron',
    name: 'Regular Icosahedron (White Marble)',
    category: 'single',
    formulaV: 'V = (5(3 + √5)/12) a³ ≈ 2.182 a³',
    formulaCSA: 'LSA = 10 × (√3/4 a²)',
    formulaTSA: 'TSA = 5√3 a² ≈ 8.660 a²',
    latexV: 'V = \\frac{5(3 + \\sqrt{5})}{12}a^3',
    latexCSA: '\\text{LSA} = 10 \\times \\frac{\\sqrt{3}}{4}a^2',
    latexTSA: '\\text{TSA} = 5\\sqrt{3}a^2',
    latexVars: 'a = \\text{edge length}, \\; 20 \\text{ equilateral triangular faces}',
    description: 'Platonic solid with 20 equilateral triangular faces sculpted in smooth white marble (as in image).',
    defaultDimensions: { length: 85, height3d: 85 },
  },
  'pawn-sphere': {
    type: 'pawn-sphere',
    name: 'Pedestal Sphere / Pawn (Terracotta)',
    category: 'combination',
    isCombination: true,
    formulaV: 'V = ⁴⁄₃ π r³ + V_pedestal',
    formulaCSA: 'CSA = 4 π r² + 2 π r_mid h',
    formulaTSA: 'TSA = 4 π r² + TSA_pedestal',
    latexV: 'V = \\frac{4}{3}\\pi r^3 + V_{\\text{pedestal}}',
    latexCSA: '\\text{CSA} = 4\\pi r^2 + 2\\pi r_{\\text{mid}} h',
    latexTSA: '\\text{TSA} = 4\\pi r^2 + \\text{Area}_{\\text{pedestal}}',
    latexVars: 'r = \\text{sphere radius}, \\; h = \\text{pedestal height}',
    explodeDescription: 'Lifts the upper spherical finial upward from the architectural pedestal column.',
    description: 'Architectural terracotta sphere finial resting on a flared pedestal base (as in image).',
    defaultDimensions: { radius: 48, height3d: 130 },
  },
  'faceted-gem': {
    type: 'faceted-gem',
    name: 'Faceted Garnet Gem / Polyhedron',
    category: 'single',
    formulaV: 'V ≈ 2.45 a³',
    formulaCSA: 'LSA = Lateral Facet Area',
    formulaTSA: 'TSA = Sum of all 16 Facet Areas',
    latexV: 'V \\approx 2.45 a^3',
    latexCSA: '\\text{LSA} = \\sum A_{\\text{crown}} + \\sum A_{\\text{pavilion}}',
    latexTSA: '\\text{TSA} = \\sum A_{\\text{facets}}',
    latexVars: 'a = \\text{facet dimension}',
    description: 'Brilliant faceted garnet/ruby polyhedral jewel with dynamic reflective facets (as in image).',
    defaultDimensions: { length: 80, height3d: 80 },
  },
};

/**
 * 3D point rotation with pitch (around X) and yaw (around Y)
 */
export function rotate3D(
  x: number,
  y: number,
  z: number,
  pitchRad: number,
  yawRad: number
): { x: number; y: number; z: number } {
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const x1 = x * cosY + z * sinY;
  const y1 = y;
  const z1 = -x * sinY + z * cosY;

  const cosX = Math.cos(pitchRad);
  const sinX = Math.sin(pitchRad);
  const x2 = x1;
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  return { x: x2, y: y2, z: z2 };
}

/**
 * Natural Physical Shading & Material Lighting Engine
 * Produces photorealistic, natural figures (Ivory/Alabaster, Warm Wood, Marble, Sandstone, Terracotta, Patina Bronze)
 */
export interface MaterialPalette {
  name: string;
  baseR: number;
  baseG: number;
  baseB: number;
  specularFactor: number;
  stroke: string;
}

export function getDefaultNaturalStyleForSolid(solidType?: SolidType): string {
  if (!solidType) return 'natural';
  switch (solidType) {
    case 'dodecahedron':
    case 'cuboid':
    case 'cube':
    case 'hourglass':
      return 'wood';
    case 'cylinder':
    case 'triangular-prism':
    case 'icosahedron':
    case 'capsule':
    case 'hemisphere-on-cylinder':
    case 'hemisphere-on-cube':
      return 'marble';
    case 'octahedron':
    case 'tetrahedron':
    case 'square-pyramid':
    case 'cone-on-cylinder':
    case 'cylinder-with-conical-cavity':
      return 'sandstone';
    case 'cone':
    case 'frustum':
    case 'cone-on-hemisphere':
    case 'pawn-sphere':
      return 'terracotta';
    case 'faceted-gem':
      return 'patina';
    case 'hemisphere':
    case 'sphere':
    default:
      return 'natural';
  }
}

export function getMaterialPalette(style?: string, baseColor?: string, solidType?: SolidType): MaterialPalette {
  const effectiveStyle = (!style || style === 'natural') && solidType ? getDefaultNaturalStyleForSolid(solidType) : (style || 'natural');

  switch (effectiveStyle) {
    case 'wood':
      return { name: 'wood', baseR: 195, baseG: 130, baseB: 65, specularFactor: 0.18, stroke: 'rgba(90, 50, 20, 0.50)' };
    case 'marble':
      return { name: 'marble', baseR: 242, baseG: 245, baseB: 248, specularFactor: 0.35, stroke: 'rgba(100, 116, 139, 0.42)' };
    case 'sandstone':
      return { name: 'sandstone', baseR: 236, baseG: 215, baseB: 180, specularFactor: 0.12, stroke: 'rgba(140, 105, 70, 0.45)' };
    case 'terracotta':
      return { name: 'terracotta', baseR: 215, baseG: 95, baseB: 42, specularFactor: 0.16, stroke: 'rgba(95, 30, 10, 0.50)' };
    case 'patina':
      return { name: 'patina', baseR: 40, baseG: 165, baseB: 150, specularFactor: 0.22, stroke: 'rgba(15, 80, 70, 0.48)' };
    case 'slate':
      return { name: 'slate', baseR: 80, baseG: 90, baseB: 105, specularFactor: 0.15, stroke: 'rgba(30, 41, 59, 0.60)' };
    case 'obsidian':
      return { name: 'obsidian', baseR: 35, baseG: 38, baseB: 45, specularFactor: 0.45, stroke: 'rgba(15, 23, 42, 0.80)' };
    case 'natural':
    default:
      if (baseColor && baseColor.startsWith('#') && baseColor.length >= 7 && baseColor !== '#38bdf8' && baseColor !== '#0284c7' && baseColor !== '#2563eb') {
        const r = parseInt(baseColor.slice(1, 3), 16) || 238;
        const g = parseInt(baseColor.slice(3, 5), 16) || 232;
        const b = parseInt(baseColor.slice(5, 7), 16) || 222;
        return { name: 'custom', baseR: r, baseG: g, baseB: b, specularFactor: 0.25, stroke: 'rgba(51, 65, 85, 0.45)' };
      }
      // Natural architectural ivory alabaster / limestone - warm, photorealistic, elegant studio aesthetic
      return { name: 'natural', baseR: 238, baseG: 232, baseB: 222, specularFactor: 0.28, stroke: 'rgba(51, 65, 85, 0.42)' };
  }
}

/**
 * Returns a harmoniously matched natural material for secondary components in combination solids
 * Creates authentic architectural / artisan contrast (e.g. turned wood roof on carved limestone cylinder)
 */
export function getSecondaryMaterial(mat: MaterialPalette): MaterialPalette {
  switch (mat.name) {
    case 'wood':
      return { name: 'terracotta', baseR: 215, baseG: 95, baseB: 42, specularFactor: 0.16, stroke: 'rgba(95, 30, 10, 0.50)' };
    case 'marble':
      return { name: 'wood', baseR: 195, baseG: 130, baseB: 65, specularFactor: 0.18, stroke: 'rgba(90, 50, 20, 0.50)' };
    case 'sandstone':
      return { name: 'wood', baseR: 180, baseG: 115, baseB: 55, specularFactor: 0.18, stroke: 'rgba(90, 50, 20, 0.50)' };
    case 'terracotta':
      return { name: 'sandstone', baseR: 236, baseG: 215, baseB: 180, specularFactor: 0.12, stroke: 'rgba(140, 105, 70, 0.45)' };
    case 'patina':
      return { name: 'natural', baseR: 238, baseG: 232, baseB: 222, specularFactor: 0.28, stroke: 'rgba(51, 65, 85, 0.42)' };
    default:
      // For natural alabaster: complement with rich warm polished timber accent
      return { name: 'wood', baseR: 195, baseG: 130, baseB: 65, specularFactor: 0.18, stroke: 'rgba(90, 50, 20, 0.50)' };
  }
}

export function computeRealisticLighting(
  normal: { x: number; y: number; z: number },
  mat: MaterialPalette,
  ambientBoost: number = 0
): { fill: string; brightness: number } {
  // Key light from top-left front
  const l1x = -0.45, l1y = -0.75, l1z = 0.48;
  // Soft fill light from bottom-right front
  const l2x = 0.52, l2y = 0.35, l2z = 0.60;

  const dot1 = Math.max(0, -(normal.x * l1x + normal.y * l1y + normal.z * l1z));
  const dot2 = Math.max(0, -(normal.x * l2x + normal.y * l2y + normal.z * l2z));

  const ambient = 0.35 + ambientBoost;
  const brightness = Math.min(1, ambient + 0.50 * dot1 + 0.15 * dot2);

  // Blinn-Phong specular highlight
  const hx = -0.28, hy = -0.48, hz = 0.83;
  const specDot = Math.max(0, -(normal.x * hx + normal.y * hy + normal.z * hz));
  const spec = Math.pow(specDot, 18) * mat.specularFactor;

  const r = Math.min(255, Math.round(mat.baseR * brightness + 255 * spec));
  const g = Math.min(255, Math.round(mat.baseG * brightness + 255 * spec));
  const b = Math.min(255, Math.round(mat.baseB * brightness + 255 * spec));

  return { fill: `rgb(${r}, ${g}, ${b})`, brightness };
}

export function createNaturalCurvedGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  mat: MaterialPalette
): CanvasGradient {
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  const rHigh = Math.min(255, Math.round(mat.baseR * 1.10));
  const gHigh = Math.min(255, Math.round(mat.baseG * 1.10));
  const bHigh = Math.min(255, Math.round(mat.baseB * 1.10));

  const rSpec = Math.min(255, Math.round(mat.baseR * 1.05 + 40));
  const gSpec = Math.min(255, Math.round(mat.baseG * 1.05 + 40));
  const bSpec = Math.min(255, Math.round(mat.baseB * 1.05 + 40));

  const rMid = Math.round(mat.baseR * 0.85);
  const gMid = Math.round(mat.baseG * 0.85);
  const bMid = Math.round(mat.baseB * 0.85);

  const rShad = Math.round(mat.baseR * 0.52);
  const gShad = Math.round(mat.baseG * 0.52);
  const bShad = Math.round(mat.baseB * 0.52);

  const rBounce = Math.round(mat.baseR * 0.62);
  const gBounce = Math.round(mat.baseG * 0.62);
  const bBounce = Math.round(mat.baseB * 0.62);

  grad.addColorStop(0.0, `rgb(${rHigh}, ${gHigh}, ${bHigh})`);
  grad.addColorStop(0.22, `rgb(${rSpec}, ${gSpec}, ${bSpec})`);
  grad.addColorStop(0.55, `rgb(${rMid}, ${gMid}, ${bMid})`);
  grad.addColorStop(0.85, `rgb(${rShad}, ${gShad}, ${bShad})`);
  grad.addColorStop(1.0, `rgb(${rBounce}, ${gBounce}, ${bBounce})`);
  return grad;
}

export function createNaturalRadialGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  mat: MaterialPalette
): CanvasGradient {
  const grad = ctx.createRadialGradient(
    cx - r * 0.35,
    cy - r * 0.38,
    r * 0.05,
    cx,
    cy,
    r
  );
  const rSpec = Math.min(255, Math.round(mat.baseR * 1.08 + 45));
  const gSpec = Math.min(255, Math.round(mat.baseG * 1.08 + 45));
  const bSpec = Math.min(255, Math.round(mat.baseB * 1.08 + 45));

  const rMid = Math.round(mat.baseR * 0.88);
  const gMid = Math.round(mat.baseG * 0.88);
  const bMid = Math.round(mat.baseB * 0.88);

  const rShad = Math.round(mat.baseR * 0.48);
  const gShad = Math.round(mat.baseG * 0.48);
  const bShad = Math.round(mat.baseB * 0.48);

  grad.addColorStop(0.0, '#ffffff'); // clean crisp specular glint
  grad.addColorStop(0.12, `rgb(${rSpec}, ${gSpec}, ${bSpec})`);
  grad.addColorStop(0.55, `rgb(${rMid}, ${gMid}, ${bMid})`);
  grad.addColorStop(0.85, `rgb(${rShad}, ${gShad}, ${bShad})`);
  grad.addColorStop(1.0, `rgb(${Math.round(mat.baseR * 0.58)}, ${Math.round(mat.baseG * 0.58)}, ${Math.round(mat.baseB * 0.58)})`);
  return grad;
}

export function createIridescentLinearGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): CanvasGradient {
  return createNaturalCurvedGradient(ctx, x1, y1, x2, y2, getMaterialPalette('natural'));
}

export function createIridescentRadialGradient(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
): CanvasGradient {
  return createNaturalRadialGradient(ctx, cx, cy, r, getMaterialPalette('natural'));
}

/**
 * Photorealistic 3D Cylinder Renderer with true depth sorting and physical lighting
 */
export function render3DCylinder(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number; z: number },
  cx: number,
  cz: number,
  yTop: number,
  yBot: number,
  r: number,
  pitch: number,
  yaw: number,
  mat: MaterialPalette,
  wireframeOnly: boolean,
  zoom: number,
  options: {
    drawTopCap?: boolean;
    drawBotCap?: boolean;
    strokeColor?: string;
  } = {}
) {
  const numSteps = 32;
  const topScreenPts: { x: number; y: number; z: number }[] = [];
  const botScreenPts: { x: number; y: number; z: number }[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const ang = (i / numSteps) * Math.PI * 2;
    const px = cx + Math.cos(ang) * r;
    const pz = cz + Math.sin(ang) * r;
    topScreenPts.push(project(px, yTop, pz));
    botScreenPts.push(project(px, yBot, pz));
  }

  interface FaceItem {
    pts: { x: number; y: number }[];
    avgZ: number;
    rotN: { x: number; y: number; z: number };
    isCap: boolean;
    capType?: 'top' | 'bot';
  }
  const faces: FaceItem[] = [];

  for (let i = 0; i < numSteps; i++) {
    const angMid = ((i + 0.5) / numSteps) * Math.PI * 2;
    const normX = Math.cos(angMid);
    const normZ = Math.sin(angMid);
    const rotN = rotate3D(normX, 0, normZ, pitch, yaw);
    const p1 = topScreenPts[i];
    const p2 = topScreenPts[i + 1];
    const p3 = botScreenPts[i + 1];
    const p4 = botScreenPts[i];
    const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;

    faces.push({
      pts: [p1, p2, p3, p4],
      avgZ,
      rotN,
      isCap: false,
    });
  }

  // Top cap
  const rotNTop = rotate3D(0, -1, 0, pitch, yaw);
  if (options.drawTopCap !== false) {
    const avgZTop = topScreenPts.reduce((sum, p) => sum + p.z, 0) / topScreenPts.length;
    faces.push({
      pts: topScreenPts.slice(0, numSteps),
      avgZ: avgZTop,
      rotN: rotNTop,
      isCap: true,
      capType: 'top',
    });
  }

  // Bottom cap
  const rotNBot = rotate3D(0, 1, 0, pitch, yaw);
  if (options.drawBotCap !== false) {
    const avgZBot = botScreenPts.reduce((sum, p) => sum + p.z, 0) / botScreenPts.length;
    faces.push({
      pts: botScreenPts.slice(0, numSteps),
      avgZ: avgZBot,
      rotN: rotNBot,
      isCap: true,
      capType: 'bot',
    });
  }

  // Sort back to front (largest Z first)
  faces.sort((a, b) => b.avgZ - a.avgZ);

  // Render faces
  faces.forEach(f => {
    if (!wireframeOnly && f.rotN.z > 0.10 && !f.isCap) return;
    if (!wireframeOnly && f.rotN.z > 0.05 && f.isCap) return;

    ctx.beginPath();
    ctx.moveTo(f.pts[0].x, f.pts[0].y);
    for (let k = 1; k < f.pts.length; k++) {
      ctx.lineTo(f.pts[k].x, f.pts[k].y);
    }
    ctx.closePath();

    if (!wireframeOnly) {
      const boost = f.capType === 'top' ? 0.07 : f.capType === 'bot' ? -0.10 : 0;
      ctx.fillStyle = computeRealisticLighting(f.rotN, mat, boost).fill;
      ctx.fill();
    }
    if (wireframeOnly) {
      ctx.strokeStyle = options.strokeColor || mat.stroke;
      ctx.lineWidth = 1.0 / zoom;
      ctx.stroke();
    }
  });

  // Stroke rims & outer silhouette contour
  const strokeCol = options.strokeColor || mat.stroke;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = wireframeOnly ? 2 / zoom : 1.6 / zoom;

  // Top rim
  ctx.beginPath();
  ctx.moveTo(topScreenPts[0].x, topScreenPts[0].y);
  for (let k = 1; k < topScreenPts.length; k++) ctx.lineTo(topScreenPts[k].x, topScreenPts[k].y);
  ctx.closePath();
  ctx.stroke();

  // Bottom rim
  ctx.beginPath();
  ctx.moveTo(botScreenPts[0].x, botScreenPts[0].y);
  for (let k = 1; k < botScreenPts.length; k++) ctx.lineTo(botScreenPts[k].x, botScreenPts[k].y);
  ctx.closePath();
  ctx.stroke();

  // Outer silhouette: find min and max screen X points
  let minIdx = 0, maxIdx = 0;
  for (let i = 1; i < numSteps; i++) {
    if (topScreenPts[i].x < topScreenPts[minIdx].x) minIdx = i;
    if (topScreenPts[i].x > topScreenPts[maxIdx].x) maxIdx = i;
  }
  ctx.beginPath();
  ctx.moveTo(topScreenPts[minIdx].x, topScreenPts[minIdx].y);
  ctx.lineTo(botScreenPts[minIdx].x, botScreenPts[minIdx].y);
  ctx.moveTo(topScreenPts[maxIdx].x, topScreenPts[maxIdx].y);
  ctx.lineTo(botScreenPts[maxIdx].x, botScreenPts[maxIdx].y);
  ctx.stroke();
}

/**
 * Photorealistic 3D Cone Renderer with true depth sorting and physical lighting
 */
export function render3DCone(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number; z: number },
  apexX: number,
  apexY: number,
  apexZ: number,
  baseCenterX: number,
  baseCenterY: number,
  baseCenterZ: number,
  r: number,
  pitch: number,
  yaw: number,
  mat: MaterialPalette,
  wireframeOnly: boolean,
  zoom: number,
  options: {
    drawBaseCap?: boolean;
    strokeColor?: string;
  } = {}
) {
  const numSteps = 32;
  const pApex = project(apexX, apexY, apexZ);
  const baseScreenPts: { x: number; y: number; z: number }[] = [];

  const h = Math.hypot(apexX - baseCenterX, apexY - baseCenterY, apexZ - baseCenterZ) || 1;
  const slantLen = Math.hypot(h, r) || 1;
  const slantCos = r / slantLen;
  const slantSin = h / slantLen;
  const coneDir = apexY < baseCenterY ? -1 : 1;

  for (let i = 0; i <= numSteps; i++) {
    const ang = (i / numSteps) * Math.PI * 2;
    const px = baseCenterX + Math.cos(ang) * r;
    const py = baseCenterY;
    const pz = baseCenterZ + Math.sin(ang) * r;
    baseScreenPts.push(project(px, py, pz));
  }

  interface FaceItem {
    pts: { x: number; y: number }[];
    avgZ: number;
    rotN: { x: number; y: number; z: number };
    isCap: boolean;
  }
  const faces: FaceItem[] = [];

  for (let i = 0; i < numSteps; i++) {
    const angMid = ((i + 0.5) / numSteps) * Math.PI * 2;
    const cos = Math.cos(angMid);
    const sin = Math.sin(angMid);
    const normX = cos * slantSin;
    const normY = coneDir * slantCos;
    const normZ = sin * slantSin;
    const rotN = rotate3D(normX, normY, normZ, pitch, yaw);

    const p1 = pApex;
    const p2 = baseScreenPts[i];
    const p3 = baseScreenPts[i + 1];
    const avgZ = (p1.z + p2.z + p3.z) / 3;

    faces.push({
      pts: [p1, p2, p3],
      avgZ,
      rotN,
      isCap: false,
    });
  }

  // Base cap
  const baseNormY = coneDir === -1 ? 1 : -1;
  const rotNBase = rotate3D(0, baseNormY, 0, pitch, yaw);
  if (options.drawBaseCap !== false) {
    const avgZBase = baseScreenPts.reduce((sum, p) => sum + p.z, 0) / baseScreenPts.length;
    faces.push({
      pts: baseScreenPts.slice(0, numSteps),
      avgZ: avgZBase,
      rotN: rotNBase,
      isCap: true,
    });
  }

  faces.sort((a, b) => b.avgZ - a.avgZ);

  faces.forEach(f => {
    if (!wireframeOnly && f.rotN.z > 0.10 && !f.isCap) return;
    if (!wireframeOnly && f.rotN.z > 0.05 && f.isCap) return;

    ctx.beginPath();
    ctx.moveTo(f.pts[0].x, f.pts[0].y);
    for (let k = 1; k < f.pts.length; k++) ctx.lineTo(f.pts[k].x, f.pts[k].y);
    ctx.closePath();

    if (!wireframeOnly) {
      const boost = f.isCap ? -0.10 : 0.02;
      ctx.fillStyle = computeRealisticLighting(f.rotN, mat, boost).fill;
      ctx.fill();
    }
    if (wireframeOnly) {
      ctx.strokeStyle = options.strokeColor || mat.stroke;
      ctx.lineWidth = 1.0 / zoom;
      ctx.stroke();
    }
  });

  const strokeCol = options.strokeColor || mat.stroke;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = wireframeOnly ? 2 / zoom : 1.6 / zoom;

  // Base rim
  ctx.beginPath();
  ctx.moveTo(baseScreenPts[0].x, baseScreenPts[0].y);
  for (let k = 1; k < baseScreenPts.length; k++) ctx.lineTo(baseScreenPts[k].x, baseScreenPts[k].y);
  ctx.closePath();
  ctx.stroke();

  // Silhouette side lines
  let minIdx = 0, maxIdx = 0;
  for (let i = 1; i < numSteps; i++) {
    if (baseScreenPts[i].x < baseScreenPts[minIdx].x) minIdx = i;
    if (baseScreenPts[i].x > baseScreenPts[maxIdx].x) maxIdx = i;
  }
  ctx.beginPath();
  ctx.moveTo(pApex.x, pApex.y);
  ctx.lineTo(baseScreenPts[minIdx].x, baseScreenPts[minIdx].y);
  ctx.moveTo(pApex.x, pApex.y);
  ctx.lineTo(baseScreenPts[maxIdx].x, baseScreenPts[maxIdx].y);
  ctx.stroke();
}

/**
 * Photorealistic 3D Hemisphere Renderer
 * Renders a true 3D spherical dome with depth sorting, Blinn-Phong lighting, and circular base disk.
 */
export function render3DHemisphere(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number; z: number },
  cx: number,
  cy: number,
  cz: number,
  r: number,
  domeDir: 1 | -1, // -1: upward dome, 1: downward dome
  pitch: number,
  yaw: number,
  mat: MaterialPalette,
  wireframeOnly: boolean,
  zoom: number,
  options: {
    drawBaseDisk?: boolean;
    strokeColor?: string;
    ambientBoost?: number;
  } = {}
) {
  const nBands = 14;
  const nSectors = 28;

  interface FaceItem {
    pts: { x: number; y: number }[];
    avgZ: number;
    rotN: { x: number; y: number; z: number };
    isBase: boolean;
  }
  const faces: FaceItem[] = [];

  // 1. Hemisphere Dome Spherical Surface Quads
  for (let j = 0; j < nBands; j++) {
    const phi0 = (j / nBands) * (Math.PI / 2);
    const phi1 = ((j + 1) / nBands) * (Math.PI / 2);

    const cosPhi0 = Math.cos(phi0);
    const sinPhi0 = Math.sin(phi0);
    const cosPhi1 = Math.cos(phi1);
    const sinPhi1 = Math.sin(phi1);

    const phiMid = (phi0 + phi1) / 2;
    const cosPhiM = Math.cos(phiMid);
    const sinPhiM = Math.sin(phiMid);

    for (let i = 0; i < nSectors; i++) {
      const theta0 = (i / nSectors) * Math.PI * 2;
      const theta1 = ((i + 1) / nSectors) * Math.PI * 2;
      const thetaM = (theta0 + theta1) / 2;

      const v00 = {
        x: cx + r * cosPhi0 * Math.cos(theta0),
        y: cy + domeDir * r * sinPhi0,
        z: cz + r * cosPhi0 * Math.sin(theta0),
      };
      const v10 = {
        x: cx + r * cosPhi0 * Math.cos(theta1),
        y: cy + domeDir * r * sinPhi0,
        z: cz + r * cosPhi0 * Math.sin(theta1),
      };
      const v11 = {
        x: cx + r * cosPhi1 * Math.cos(theta1),
        y: cy + domeDir * r * sinPhi1,
        z: cz + r * cosPhi1 * Math.sin(theta1),
      };
      const v01 = {
        x: cx + r * cosPhi1 * Math.cos(theta0),
        y: cy + domeDir * r * sinPhi1,
        z: cz + r * cosPhi1 * Math.sin(theta0),
      };

      const nx = cosPhiM * Math.cos(thetaM);
      const ny = domeDir * sinPhiM;
      const nz = cosPhiM * Math.sin(thetaM);
      const rotN = rotate3D(nx, ny, nz, pitch, yaw);

      const p00 = project(v00.x, v00.y, v00.z);
      const p10 = project(v10.x, v10.y, v10.z);
      const p11 = project(v11.x, v11.y, v11.z);
      const p01 = project(v01.x, v01.y, v01.z);

      const avgZ = (p00.z + p10.z + p11.z + p01.z) / 4;

      faces.push({
        pts: [p00, p10, p11, p01],
        avgZ,
        rotN,
        isBase: false,
      });
    }
  }

  // 2. Base Disk at y = cy
  const baseScreenPts: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i <= nSectors; i++) {
    const theta = (i / nSectors) * Math.PI * 2;
    const bx = cx + r * Math.cos(theta);
    const by = cy;
    const bz = cz + r * Math.sin(theta);
    baseScreenPts.push(project(bx, by, bz));
  }

  const baseNormY = -domeDir;
  const rotNBase = rotate3D(0, baseNormY, 0, pitch, yaw);

  if (options.drawBaseDisk !== false) {
    const avgZBase = baseScreenPts.reduce((sum, p) => sum + p.z, 0) / baseScreenPts.length;
    faces.push({
      pts: baseScreenPts.slice(0, nSectors),
      avgZ: avgZBase,
      rotN: rotNBase,
      isBase: true,
    });
  }

  // Sort back to front
  faces.sort((a, b) => b.avgZ - a.avgZ);

  faces.forEach(f => {
    if (!wireframeOnly && f.rotN.z > 0.12 && !f.isBase) return;
    if (!wireframeOnly && f.rotN.z > 0.05 && f.isBase) return;

    ctx.beginPath();
    ctx.moveTo(f.pts[0].x, f.pts[0].y);
    for (let k = 1; k < f.pts.length; k++) {
      ctx.lineTo(f.pts[k].x, f.pts[k].y);
    }
    ctx.closePath();

    if (!wireframeOnly) {
      const boost = (options.ambientBoost || 0) + (f.isBase ? -0.08 : 0.02);
      ctx.fillStyle = computeRealisticLighting(f.rotN, mat, boost).fill;
      ctx.fill();
    }
    if (wireframeOnly) {
      ctx.strokeStyle = options.strokeColor || mat.stroke;
      ctx.lineWidth = 1.0 / zoom;
      ctx.stroke();
    }
  });

  const strokeCol = options.strokeColor || mat.stroke;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = wireframeOnly ? 2 / zoom : 1.6 / zoom;

  // Base Rim
  ctx.beginPath();
  ctx.moveTo(baseScreenPts[0].x, baseScreenPts[0].y);
  for (let k = 1; k < baseScreenPts.length; k++) {
    ctx.lineTo(baseScreenPts[k].x, baseScreenPts[k].y);
  }
  ctx.closePath();
  ctx.stroke();

  // Silhouette arc connecting left & right base tangents through apex
  const pApex = project(cx, cy + domeDir * r, cz);
  let minIdx = 0, maxIdx = 0;
  for (let i = 1; i < nSectors; i++) {
    if (baseScreenPts[i].x < baseScreenPts[minIdx].x) minIdx = i;
    if (baseScreenPts[i].x > baseScreenPts[maxIdx].x) maxIdx = i;
  }
  const pLeft = baseScreenPts[minIdx];
  const pRight = baseScreenPts[maxIdx];

  ctx.beginPath();
  ctx.moveTo(pLeft.x, pLeft.y);
  ctx.quadraticCurveTo(pApex.x, pApex.y, pRight.x, pRight.y);
  ctx.stroke();
}

/**
 * Photorealistic 3D Frustum Renderer
 */
export function render3DFrustum(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number; z: number },
  cx: number,
  cz: number,
  yTop: number,
  yBot: number,
  rTop: number,
  rBot: number,
  pitch: number,
  yaw: number,
  mat: MaterialPalette,
  wireframeOnly: boolean,
  zoom: number,
  options: {
    drawTopCap?: boolean;
    drawBotCap?: boolean;
    strokeColor?: string;
  } = {}
) {
  const numSteps = 32;
  const topScreenPts: { x: number; y: number; z: number }[] = [];
  const botScreenPts: { x: number; y: number; z: number }[] = [];

  const h = Math.abs(yBot - yTop) || 1;
  const dr = rBot - rTop;
  const slantLen = Math.hypot(h, dr) || 1;
  const slantCos = dr / slantLen;
  const slantSin = h / slantLen;

  for (let i = 0; i <= numSteps; i++) {
    const ang = (i / numSteps) * Math.PI * 2;
    topScreenPts.push(project(cx + Math.cos(ang) * rTop, yTop, cz + Math.sin(ang) * rTop));
    botScreenPts.push(project(cx + Math.cos(ang) * rBot, yBot, cz + Math.sin(ang) * rBot));
  }

  interface FaceItem {
    pts: { x: number; y: number }[];
    avgZ: number;
    rotN: { x: number; y: number; z: number };
    isCap: boolean;
    capType?: 'top' | 'bot';
  }
  const faces: FaceItem[] = [];

  for (let i = 0; i < numSteps; i++) {
    const angMid = ((i + 0.5) / numSteps) * Math.PI * 2;
    const cos = Math.cos(angMid);
    const sin = Math.sin(angMid);
    const rotN = rotate3D(cos * slantSin, -slantCos, sin * slantSin, pitch, yaw);

    const p1 = topScreenPts[i];
    const p2 = topScreenPts[i + 1];
    const p3 = botScreenPts[i + 1];
    const p4 = botScreenPts[i];
    const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;

    faces.push({ pts: [p1, p2, p3, p4], avgZ, rotN, isCap: false });
  }

  // Top cap
  const rotNTop = rotate3D(0, -1, 0, pitch, yaw);
  if (options.drawTopCap !== false) {
    const avgZTop = topScreenPts.reduce((sum, p) => sum + p.z, 0) / topScreenPts.length;
    faces.push({ pts: topScreenPts.slice(0, numSteps), avgZ: avgZTop, rotN: rotNTop, isCap: true, capType: 'top' });
  }

  // Bottom cap
  const rotNBot = rotate3D(0, 1, 0, pitch, yaw);
  if (options.drawBotCap !== false) {
    const avgZBot = botScreenPts.reduce((sum, p) => sum + p.z, 0) / botScreenPts.length;
    faces.push({ pts: botScreenPts.slice(0, numSteps), avgZ: avgZBot, rotN: rotNBot, isCap: true, capType: 'bot' });
  }

  faces.sort((a, b) => b.avgZ - a.avgZ);

  faces.forEach(f => {
    if (!wireframeOnly && f.rotN.z > 0.10 && !f.isCap) return;
    if (!wireframeOnly && f.rotN.z > 0.05 && f.isCap) return;

    ctx.beginPath();
    ctx.moveTo(f.pts[0].x, f.pts[0].y);
    for (let k = 1; k < f.pts.length; k++) ctx.lineTo(f.pts[k].x, f.pts[k].y);
    ctx.closePath();

    if (!wireframeOnly) {
      const boost = f.capType === 'top' ? 0.07 : f.capType === 'bot' ? -0.10 : 0;
      ctx.fillStyle = computeRealisticLighting(f.rotN, mat, boost).fill;
      ctx.fill();
    }
    if (wireframeOnly) {
      ctx.strokeStyle = options.strokeColor || mat.stroke;
      ctx.lineWidth = 1.0 / zoom;
      ctx.stroke();
    }
  });

  const strokeCol = options.strokeColor || mat.stroke;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = wireframeOnly ? 2 / zoom : 1.6 / zoom;

  // Top rim
  ctx.beginPath();
  ctx.moveTo(topScreenPts[0].x, topScreenPts[0].y);
  for (let k = 1; k < topScreenPts.length; k++) ctx.lineTo(topScreenPts[k].x, topScreenPts[k].y);
  ctx.closePath();
  ctx.stroke();

  // Bottom rim
  ctx.beginPath();
  ctx.moveTo(botScreenPts[0].x, botScreenPts[0].y);
  for (let k = 1; k < botScreenPts.length; k++) ctx.lineTo(botScreenPts[k].x, botScreenPts[k].y);
  ctx.closePath();
  ctx.stroke();

  // Side contours
  let minIdx = 0, maxIdx = 0;
  for (let i = 1; i < numSteps; i++) {
    if (topScreenPts[i].x < topScreenPts[minIdx].x) minIdx = i;
    if (topScreenPts[i].x > topScreenPts[maxIdx].x) maxIdx = i;
  }
  ctx.beginPath();
  ctx.moveTo(topScreenPts[minIdx].x, topScreenPts[minIdx].y);
  ctx.lineTo(botScreenPts[minIdx].x, botScreenPts[minIdx].y);
  ctx.moveTo(topScreenPts[maxIdx].x, topScreenPts[maxIdx].y);
  ctx.lineTo(botScreenPts[maxIdx].x, botScreenPts[maxIdx].y);
  ctx.stroke();
}

/**
 * Render Realistic Movable 3D Solid on Canvas
 */
export function drawSolid3D(
  ctx: CanvasRenderingContext2D,
  el: Solid3DElement,
  zoom: number = 1
): void {
  // If user requested the 2D Net Diagram view of this solid:
  if (el.showNet) {
    ctx.save();
    ctx.translate(el.x, el.y);
    drawSolidNetDiagram(ctx, el.solidType, el.width || 280, el.height || 280, el.netFoldRatio || 0, el.color || '#38bdf8');
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(el.x, el.y);

  // Material and lighting resolution
  const mat = getMaterialPalette(el.shadingStyle, el.color, el.solidType);
  const strokeColor = el.wireframeOnly ? (el.color || '#38bdf8') : mat.stroke;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = el.wireframeOnly ? Math.max(1.8, 2.4 / zoom) : Math.max(1.2, 1.5 / zoom);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const pitch = ((el.rotationX ?? -22) * Math.PI) / 180;
  const yaw = ((el.rotationY ?? 32) * Math.PI) / 180;

  const w = el.width || 260;
  const h = el.height || 260;
  const cx = w / 2;
  const cy = h / 2;

  // Proportional dynamic scale factor relative to 280px standard bounding box
  const baseScale = Math.min(w, h) / 280;
  const scaleX = w / 280;
  const scaleY = h / 280;

  // Responsive dimension calculators so resizing w/h scales the 3D geometry smoothly
  const rScale = (val?: number, fallback: number = Math.min(w, h) * 0.36) =>
    val !== undefined ? val * baseScale : fallback;
  const hScale = (val?: number, fallback: number = h * 0.72) =>
    val !== undefined ? val * scaleY : fallback;
  const lScale = (val?: number, fallback: number = w * 0.42) =>
    val !== undefined ? val * scaleX : fallback;
  const wScale = (val?: number, fallback: number = w * 0.34) =>
    val !== undefined ? val * scaleX : fallback;

  // Projection helper
  const project = (px: number, py: number, pz: number) => {
    const rot = rotate3D(px, py, pz, pitch, yaw);
    return { x: cx + rot.x, y: cy + rot.y, z: rot.z };
  };

  // Explode separation distance for combination solids
  const isExploded = !!el.exploded || (el.explodeRatio !== undefined && el.explodeRatio > 0);
  const explodeRatio = el.explodeRatio !== undefined ? el.explodeRatio : (isExploded ? 0.75 : 0);
  const explodeGap = explodeRatio * 75 * baseScale;

  // Realistic Studio Drop Shadow on Floor
  if (!el.wireframeOnly) {
    ctx.save();
    const shadowY = cy + hScale(el.height3d, 120 * scaleY) * 0.52 + 25 * scaleY;
    const shadowR = Math.min(w, h) * 0.38;
    const gradShadow = ctx.createRadialGradient(cx, shadowY, 5 * baseScale, cx, shadowY, shadowR);
    gradShadow.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    gradShadow.addColorStop(0.5, 'rgba(15, 23, 42, 0.20)');
    gradShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.ellipse(cx, shadowY, shadowR, shadowR * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradShadow;
    ctx.fill();
    ctx.restore();
  }

  switch (el.solidType) {
    case 'cube':
    case 'cuboid': {
      const a = el.solidType === 'cube' ? Math.min(w, h) * 0.42 : w * 0.42;
      const b = el.solidType === 'cube' ? a : lScale(el.length, w * 0.34);
      const c = el.solidType === 'cube' ? a : hScale(el.height3d, h * 0.42);

      const rawVerts = [
        { x: -a, y: -c, z: -b }, // 0
        { x:  a, y: -c, z: -b }, // 1
        { x:  a, y:  c, z: -b }, // 2
        { x: -a, y:  c, z: -b }, // 3
        { x: -a, y: -c, z:  b }, // 4
        { x:  a, y: -c, z:  b }, // 5
        { x:  a, y:  c, z:  b }, // 6
        { x: -a, y:  c, z:  b }, // 7
      ];

      const projVerts = rawVerts.map(v => project(v.x, v.y, v.z));

      const boxFaces = [
        { indices: [0, 1, 5, 4], norm: { x: 0, y: -1, z: 0 } }, // Top
        { indices: [3, 2, 6, 7], norm: { x: 0, y: 1, z: 0 } },  // Bottom
        { indices: [4, 5, 6, 7], norm: { x: 0, y: 0, z: 1 } },  // Front
        { indices: [0, 1, 2, 3], norm: { x: 0, y: 0, z: -1 } }, // Back
        { indices: [0, 3, 7, 4], norm: { x: -1, y: 0, z: 0 } }, // Left
        { indices: [1, 2, 6, 5], norm: { x: 1, y: 0, z: 0 } },  // Right
      ];

      const sortedFaces = boxFaces.map(f => {
        const rotN = rotate3D(f.norm.x, f.norm.y, f.norm.z, pitch, yaw);
        const avgZ = f.indices.reduce((sum, idx) => sum + projVerts[idx].z, 0) / f.indices.length;
        return { ...f, rotN, avgZ };
      }).sort((f1, f2) => f2.avgZ - f1.avgZ);

      sortedFaces.forEach(f => {
        if (!el.wireframeOnly && f.rotN.z > 0.08) return; // Backface culling
        ctx.beginPath();
        ctx.moveTo(projVerts[f.indices[0]].x, projVerts[f.indices[0]].y);
        for (let i = 1; i < f.indices.length; i++) {
          ctx.lineTo(projVerts[f.indices[i]].x, projVerts[f.indices[i]].y);
        }
        ctx.closePath();

        if (!el.wireframeOnly) {
          const lighting = computeRealisticLighting(f.rotN, mat);
          ctx.fillStyle = lighting.fill;
          ctx.fill();
        }
        ctx.stroke();
      });
      break;
    }

    case 'square-pyramid': {
      const a = lScale(el.length, Math.min(w, h) * 0.44) * 0.40;
      const pyrH = hScale(el.height3d, h * 0.65) * 0.50;

      const apexRaw = { x: 0, y: -pyrH, z: 0 };
      const baseRaw = [
        { x: -a, y: pyrH, z: -a }, // 0: back-left
        { x:  a, y: pyrH, z: -a }, // 1: back-right
        { x:  a, y: pyrH, z:  a }, // 2: front-right
        { x: -a, y: pyrH, z:  a }, // 3: front-left
      ];

      const pApex = project(apexRaw.x, apexRaw.y, apexRaw.z);
      const pBase = baseRaw.map(v => project(v.x, v.y, v.z));

      const pyrFaces = [
        {
          verts: [pBase[0], pBase[1], pBase[2], pBase[3]],
          norm: { x: 0, y: 1, z: 0 },
          avgZ: (pBase[0].z + pBase[1].z + pBase[2].z + pBase[3].z) / 4,
        },
        {
          verts: [pApex, pBase[3], pBase[2]], // Front
          norm: (() => {
            const len = Math.hypot(pyrH, a) || 1;
            return { x: 0, y: -a / len, z: pyrH / len };
          })(),
          avgZ: (pApex.z + pBase[3].z + pBase[2].z) / 3,
        },
        {
          verts: [pApex, pBase[2], pBase[1]], // Right
          norm: (() => {
            const len = Math.hypot(pyrH, a) || 1;
            return { x: pyrH / len, y: -a / len, z: 0 };
          })(),
          avgZ: (pApex.z + pBase[2].z + pBase[1].z) / 3,
        },
        {
          verts: [pApex, pBase[1], pBase[0]], // Back
          norm: (() => {
            const len = Math.hypot(pyrH, a) || 1;
            return { x: 0, y: -a / len, z: -pyrH / len };
          })(),
          avgZ: (pApex.z + pBase[1].z + pBase[0].z) / 3,
        },
        {
          verts: [pApex, pBase[0], pBase[3]], // Left
          norm: (() => {
            const len = Math.hypot(pyrH, a) || 1;
            return { x: -pyrH / len, y: -a / len, z: 0 };
          })(),
          avgZ: (pApex.z + pBase[0].z + pBase[3].z) / 3,
        },
      ];

      const sortedFaces = pyrFaces.map(f => {
        const rotN = rotate3D(f.norm.x, f.norm.y, f.norm.z, pitch, yaw);
        return { ...f, rotN };
      }).sort((f1, f2) => f2.avgZ - f1.avgZ);

      sortedFaces.forEach(f => {
        if (!el.wireframeOnly && f.rotN.z > 0.08) return;
        ctx.beginPath();
        ctx.moveTo(f.verts[0].x, f.verts[0].y);
        for (let i = 1; i < f.verts.length; i++) ctx.lineTo(f.verts[i].x, f.verts[i].y);
        ctx.closePath();

        if (!el.wireframeOnly) {
          const lighting = computeRealisticLighting(f.rotN, mat);
          ctx.fillStyle = lighting.fill;
          ctx.fill();
        }
        ctx.stroke();
      });

      // Altitude & Slant Height guides
      if (el.showDimensions) {
        ctx.save();
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = '#94a3b8';
        const pCenter = project(0, pyrH, 0);
        ctx.beginPath();
        ctx.moveTo(pApex.x, pApex.y);
        ctx.lineTo(pCenter.x, pCenter.y);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'triangular-prism': {
      const s = wScale(el.width3d || el.width, Math.min(w, h) * 0.44) * 0.45;
      const prismL = hScale(el.height3d, h * 0.65) * 0.48;

      const rCirc = s * 0.577;
      const vTopRaw = [
        { x: 0, y: -prismL, z: -rCirc },
        { x: -s * 0.5, y: -prismL, z: rCirc * 0.5 },
        { x:  s * 0.5, y: -prismL, z: rCirc * 0.5 },
      ];
      const vBotRaw = [
        { x: 0, y: prismL, z: -rCirc },
        { x: -s * 0.5, y: prismL, z: rCirc * 0.5 },
        { x:  s * 0.5, y: prismL, z: rCirc * 0.5 },
      ];

      const pTop = vTopRaw.map(v => project(v.x, v.y, v.z));
      const pBot = vBotRaw.map(v => project(v.x, v.y, v.z));

      const prismFaces = [
        {
          verts: [pTop[0], pTop[1], pTop[2]],
          norm: { x: 0, y: -1, z: 0 },
          avgZ: (pTop[0].z + pTop[1].z + pTop[2].z) / 3,
        },
        {
          verts: [pBot[0], pBot[2], pBot[1]],
          norm: { x: 0, y: 1, z: 0 },
          avgZ: (pBot[0].z + pBot[1].z + pBot[2].z) / 3,
        },
        {
          verts: [pTop[1], pBot[1], pBot[2], pTop[2]],
          norm: { x: 0, y: 0, z: 1 },
          avgZ: (pTop[1].z + pBot[1].z + pBot[2].z + pTop[2].z) / 4,
        },
        {
          verts: [pTop[2], pBot[2], pBot[0], pTop[0]],
          norm: { x: 0.866, y: 0, z: -0.5 },
          avgZ: (pTop[2].z + pBot[2].z + pBot[0].z + pTop[0].z) / 4,
        },
        {
          verts: [pTop[0], pBot[0], pBot[1], pTop[1]],
          norm: { x: -0.866, y: 0, z: -0.5 },
          avgZ: (pTop[0].z + pBot[0].z + pBot[1].z + pTop[1].z) / 4,
        },
      ];

      const sortedPrism = prismFaces.map(f => {
        const rotN = rotate3D(f.norm.x, f.norm.y, f.norm.z, pitch, yaw);
        return { ...f, rotN };
      }).sort((f1, f2) => f2.avgZ - f1.avgZ);

      sortedPrism.forEach(f => {
        if (!el.wireframeOnly && f.rotN.z > 0.08) return;
        ctx.beginPath();
        ctx.moveTo(f.verts[0].x, f.verts[0].y);
        for (let i = 1; i < f.verts.length; i++) ctx.lineTo(f.verts[i].x, f.verts[i].y);
        ctx.closePath();

        if (!el.wireframeOnly) {
          const lighting = computeRealisticLighting(f.rotN, mat);
          ctx.fillStyle = lighting.fill;
          ctx.fill();
        }
        ctx.stroke();
      });
      break;
    }

    case 'cylinder': {
      const r = rScale(el.radius, Math.min(w, h) * 0.34);
      const halfH = hScale(el.height3d, h * 0.68) / 2;

      render3DCylinder(ctx, project, 0, 0, -halfH, halfH, r, pitch, yaw, mat, el.wireframeOnly, zoom);

      // Height axis dashed line
      ctx.save();
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      ctx.strokeStyle = mat.stroke;
      const cTop = project(0, -halfH, 0);
      const cBot = project(0, halfH, 0);
      ctx.beginPath();
      ctx.moveTo(cTop.x, cTop.y);
      ctx.lineTo(cBot.x, cBot.y);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'cone': {
      const r = rScale(el.radius, Math.min(w, h) * 0.36);
      const coneH = hScale(el.height3d, h * 0.72);

      render3DCone(ctx, project, 0, -coneH / 2, 0, 0, coneH / 2, 0, r, pitch, yaw, mat, el.wireframeOnly, zoom);

      // Slant height & vertical height indicators
      ctx.save();
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      ctx.strokeStyle = mat.stroke;
      const apex = project(0, -coneH / 2, 0);
      const cBase = project(0, coneH / 2, 0);
      const pRight = project(r, coneH / 2, 0);
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(cBase.x, cBase.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'sphere': {
      const r = rScale(el.radius, Math.min(w, h) * 0.38);
      const center = project(0, 0, 0);

      // Realistic Natural Studio Figure Sphere with Blinn-Phong lighting
      if (!el.wireframeOnly) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);

        // Light is at (-0.45, -0.75, 0.48) in screen space
        const lightOffsetX = -r * 0.32;
        const lightOffsetY = -r * 0.38;
        const grad = ctx.createRadialGradient(
          center.x + lightOffsetX,
          center.y + lightOffsetY,
          r * 0.04,
          center.x,
          center.y,
          r * 1.05
        );

        const rB = mat.baseR;
        const gB = mat.baseG;
        const bB = mat.baseB;

        // Specular apex highlight
        grad.addColorStop(0, '#ffffff');
        // Diffuse lit region
        grad.addColorStop(0.25, `rgb(${Math.min(255, Math.round(rB * 1.15))}, ${Math.min(255, Math.round(gB * 1.15))}, ${Math.min(255, Math.round(bB * 1.15))})`);
        // Base tone
        grad.addColorStop(0.60, `rgb(${rB}, ${gB}, ${bB})`);
        // Shadow terminator
        grad.addColorStop(0.85, `rgb(${Math.round(rB * 0.55)}, ${Math.round(gB * 0.55)}, ${Math.round(bB * 0.55)})`);
        // Bounce ambient rim
        grad.addColorStop(1, `rgb(${Math.round(rB * 0.40)}, ${Math.round(gB * 0.40)}, ${Math.round(bB * 0.40)})`);

        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Outer rim
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = mat.stroke;
      ctx.lineWidth = el.wireframeOnly ? 2 / zoom : 1.6 / zoom;
      ctx.stroke();

      // Equator & Prime Meridian depth ellipses
      const numPts = 32;
      ctx.save();
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      ctx.strokeStyle = el.wireframeOnly ? mat.stroke : 'rgba(100, 116, 139, 0.45)';

      // Equator
      ctx.beginPath();
      for (let i = 0; i <= numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        const p = project(Math.cos(ang) * r, 0, Math.sin(ang) * r);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Prime Meridian
      ctx.beginPath();
      for (let i = 0; i <= numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        const p = project(0, Math.cos(ang) * r, Math.sin(ang) * r);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'tetrahedron': {
      const a = lScale(el.length, 130 * baseScale) * 0.55;
      const hTet = a * Math.sqrt(2 / 3);
      const rBase = a / Math.sqrt(3);

      const rawApex = { x: 0, y: -hTet * 0.65, z: 0 };
      const rawB1 = { x: 0, y: hTet * 0.35, z: rBase };
      const rawB2 = { x: -rBase * Math.cos(Math.PI / 6), y: hTet * 0.35, z: -rBase * Math.sin(Math.PI / 6) };
      const rawB3 = { x: rBase * Math.cos(Math.PI / 6), y: hTet * 0.35, z: -rBase * Math.sin(Math.PI / 6) };

      const pApex = project(rawApex.x, rawApex.y, rawApex.z);
      const pB1 = project(rawB1.x, rawB1.y, rawB1.z);
      const pB2 = project(rawB2.x, rawB2.y, rawB2.z);
      const pB3 = project(rawB3.x, rawB3.y, rawB3.z);

      const tetFaces = [
        {
          projPts: [pB1, pB2, pB3],
          norm: { x: 0, y: 1, z: 0 },
        },
        {
          projPts: [pApex, rawB3, rawB2].map(v => project(v.x, v.y, v.z)),
          norm: (() => {
            const ax = rawB3.x - rawApex.x, ay = rawB3.y - rawApex.y, az = rawB3.z - rawApex.z;
            const bx = rawB2.x - rawApex.x, by = rawB2.y - rawApex.y, bz = rawB2.z - rawApex.z;
            const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
            const l = Math.hypot(nx, ny, nz) || 1;
            return { x: nx / l, y: ny / l, z: nz / l };
          })(),
        },
        {
          projPts: [pApex, pB1, pB3],
          norm: (() => {
            const ax = rawB1.x - rawApex.x, ay = rawB1.y - rawApex.y, az = rawB1.z - rawApex.z;
            const bx = rawB3.x - rawApex.x, by = rawB3.y - rawApex.y, bz = rawB3.z - rawApex.z;
            const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
            const l = Math.hypot(nx, ny, nz) || 1;
            return { x: nx / l, y: ny / l, z: nz / l };
          })(),
        },
        {
          projPts: [pApex, pB2, pB1],
          norm: (() => {
            const ax = rawB2.x - rawApex.x, ay = rawB2.y - rawApex.y, az = rawB2.z - rawApex.z;
            const bx = rawB1.x - rawApex.x, by = rawB1.y - rawApex.y, bz = rawB1.z - rawApex.z;
            const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
            const l = Math.hypot(nx, ny, nz) || 1;
            return { x: nx / l, y: ny / l, z: nz / l };
          })(),
        },
      ];

      const sortedTet = tetFaces.map(f => {
        const rotN = rotate3D(f.norm.x, f.norm.y, f.norm.z, pitch, yaw);
        const avgZ = (f.projPts[0].z + f.projPts[1].z + f.projPts[2].z) / 3;
        return { ...f, rotN, avgZ };
      }).sort((f1, f2) => f2.avgZ - f1.avgZ);

      sortedTet.forEach(f => {
        if (!el.wireframeOnly && f.rotN.z > 0.08) return;
        ctx.beginPath();
        ctx.moveTo(f.projPts[0].x, f.projPts[0].y);
        ctx.lineTo(f.projPts[1].x, f.projPts[1].y);
        ctx.lineTo(f.projPts[2].x, f.projPts[2].y);
        ctx.closePath();

        if (!el.wireframeOnly) {
          const lighting = computeRealisticLighting(f.rotN, mat);
          ctx.fillStyle = lighting.fill;
          ctx.fill();
        }
        ctx.stroke();
      });
      break;
    }

    case 'hourglass': {
      const rTop = rScale(el.radius, Math.min(w, h) * 0.32);
      const rNeck = wScale(el.width3d, rTop * 0.28);
      const totalH = hScale(el.height3d, h * 0.72);
      const halfH = totalH / 2;

      const topShiftY = isExploded ? -explodeGap : 0;
      const botShiftY = isExploded ? explodeGap : 0;

      // Upper inverted frustum (tapering from rTop down to rNeck)
      render3DFrustum(ctx, project, 0, 0, -halfH + topShiftY, topShiftY, rTop, rNeck, pitch, yaw, mat, el.wireframeOnly, zoom, {
        drawTopCap: true,
        drawBotCap: false,
      });

      // Lower upright frustum (flaring from rNeck to rTop)
      render3DFrustum(ctx, project, 0, 0, botShiftY, halfH + botShiftY, rNeck, rTop, pitch, yaw, mat, el.wireframeOnly, zoom, {
        drawTopCap: false,
        drawBotCap: true,
      });

      // Waist neck rim
      const neckPts: { x: number; y: number }[] = [];
      const numPts = 32;
      for (let i = 0; i <= numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        neckPts.push(project(Math.cos(ang) * (rNeck * 1.05), 0, Math.sin(ang) * (rNeck * 1.05)));
      }
      ctx.beginPath();
      ctx.moveTo(neckPts[0].x, neckPts[0].y);
      for (const p of neckPts) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.strokeStyle = mat.stroke;
      ctx.lineWidth = el.wireframeOnly ? 2 / zoom : 1.6 / zoom;
      ctx.stroke();
      break;
    }

    case 'hemisphere': {
      const r = rScale(el.radius, Math.min(w, h) * 0.38);
      // Photorealistic True 3D Hemisphere with 3D projection, depth sorting, and base rim
      render3DHemisphere(ctx, project, 0, 0, 0, r, -1, pitch, yaw, mat, el.wireframeOnly, zoom, {
        drawBaseDisk: true,
      });
      break;
    }

    // ==========================================
    // COMBINATION OF SOLIDS WITH EXPLODE OPTION
    // ==========================================

    case 'cone-on-cylinder': {
      const r = rScale(el.radius, Math.min(w, h) * 0.30);
      const cylH = hScale(el.height3d, h * 0.65) * 0.55;
      const coneH = hScale(el.height3d, h * 0.65) * 0.45;
      const matCyl = mat;
      const matCone = getSecondaryMaterial(mat);
      const coneShiftY = -explodeGap;
      const yBot = cylH / 2;
      const yMid = -cylH / 2;
      const yApex = yMid - coneH + coneShiftY;

      // Lower Cylinder Base
      render3DCylinder(ctx, project, 0, 0, yMid, yBot, r, pitch, yaw, matCyl, el.wireframeOnly, zoom, {
        drawTopCap: true,
        drawBotCap: true,
      });

      // Explode Guide Rays & Callouts
      if (explodeGap > 5) {
        ctx.save();
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = matCone.stroke;
        ctx.lineWidth = 1.4 / zoom;
        const pMidL = project(-r, yMid, 0);
        const pMidR = project(r, yMid, 0);
        const pConeL = project(-r, yMid + coneShiftY, 0);
        const pConeR = project(r, yMid + coneShiftY, 0);
        ctx.beginPath();
        ctx.moveTo(pMidL.x, pMidL.y); ctx.lineTo(pConeL.x, pConeL.y);
        ctx.moveTo(pMidR.x, pMidR.y); ctx.lineTo(pConeR.x, pConeR.y);
        ctx.stroke();

        ctx.fillStyle = matCone.stroke;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('▲ Conical Roof', pConeR.x + 10, pConeR.y);
        ctx.fillStyle = matCyl.stroke;
        ctx.fillText('■ Cylindrical Base', pMidR.x + 10, pMidR.y + 12);
        ctx.restore();
      }

      // Upper Conical Roof
      render3DCone(ctx, project, 0, yApex, 0, 0, yMid + coneShiftY, 0, r, pitch, yaw, matCone, el.wireframeOnly, zoom, {
        drawBaseCap: explodeGap > 5,
      });
      break;
    }

    case 'hemisphere-on-cylinder': {
      const r = rScale(el.radius, Math.min(w, h) * 0.30);
      const cylH = hScale(el.height3d, h * 0.65) * 0.58;
      const matCyl = mat;
      const matDome = getSecondaryMaterial(mat);
      const hemiShiftY = -explodeGap;
      const yBot = cylH / 2;
      const yMid = -cylH / 2;

      // Lower Cylinder Base
      render3DCylinder(ctx, project, 0, 0, yMid, yBot, r, pitch, yaw, matCyl, el.wireframeOnly, zoom, {
        drawTopCap: true,
        drawBotCap: true,
      });

      // Explode Guide Rays
      if (explodeGap > 5) {
        ctx.save();
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = matDome.stroke;
        ctx.lineWidth = 1.4 / zoom;
        const pMidL = project(-r, yMid, 0);
        const pMidR = project(r, yMid, 0);
        const pHemiL = project(-r, yMid + hemiShiftY, 0);
        const pHemiR = project(r, yMid + hemiShiftY, 0);
        ctx.beginPath();
        ctx.moveTo(pMidL.x, pMidL.y); ctx.lineTo(pHemiL.x, pHemiL.y);
        ctx.moveTo(pMidR.x, pMidR.y); ctx.lineTo(pHemiR.x, pHemiR.y);
        ctx.stroke();

        ctx.fillStyle = matDome.stroke;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('◐ Hemisphere Dome', pHemiR.x + 10, pHemiR.y);
        ctx.fillStyle = matCyl.stroke;
        ctx.fillText('■ Cylinder Body', pMidR.x + 10, pMidR.y + 12);
        ctx.restore();
      }

      // Upper Hemisphere Dome (domeDir: -1)
      render3DHemisphere(ctx, project, 0, yMid + hemiShiftY, 0, r, -1, pitch, yaw, matDome, el.wireframeOnly, zoom, {
        drawBaseDisk: explodeGap > 5,
      });
      break;
    }

    case 'cone-on-hemisphere': {
      const r = rScale(el.radius, Math.min(w, h) * 0.30);
      const coneH = hScale(el.height3d, h * 0.65) * 0.60;
      const matCone = mat;
      const matDome = getSecondaryMaterial(mat);
      const hemiShiftY = -explodeGap;
      const yApex = coneH;

      // Lower Inverted Cone
      render3DCone(ctx, project, 0, yApex, 0, 0, 0, 0, r, pitch, yaw, matCone, el.wireframeOnly, zoom, {
        drawBaseCap: true,
      });

      // Explode Guide Rays
      if (explodeGap > 5) {
        ctx.save();
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = matDome.stroke;
        ctx.lineWidth = 1.4 / zoom;
        const pMidL = project(-r, 0, 0);
        const pMidR = project(r, 0, 0);
        const pHemiL = project(-r, hemiShiftY, 0);
        const pHemiR = project(r, hemiShiftY, 0);
        ctx.beginPath();
        ctx.moveTo(pMidL.x, pMidL.y); ctx.lineTo(pHemiL.x, pHemiL.y);
        ctx.moveTo(pMidR.x, pMidR.y); ctx.lineTo(pHemiR.x, pHemiR.y);
        ctx.stroke();

        ctx.fillStyle = matDome.stroke;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('◐ Hemisphere Cap', pHemiR.x + 10, pHemiR.y);
        ctx.fillStyle = matCone.stroke;
        ctx.fillText('▼ Inverted Cone Body', pMidR.x + 10, pMidR.y + 12);
        ctx.restore();
      }

      // Upper Hemisphere Dome
      render3DHemisphere(ctx, project, 0, hemiShiftY, 0, r, -1, pitch, yaw, matDome, el.wireframeOnly, zoom, {
        drawBaseDisk: explodeGap > 5,
      });
      break;
    }

    case 'capsule': {
      const r = rScale(el.radius, Math.min(w, h) * 0.28);
      const cylH = hScale(el.height3d, h * 0.65) * 0.50;
      const matCyl = mat;
      const matCaps = getSecondaryMaterial(mat);
      const topShiftY = -explodeGap;
      const botShiftY = explodeGap;
      const yTop = -cylH / 2;
      const yBot = cylH / 2;

      // Central Cylindrical Body
      render3DCylinder(ctx, project, 0, 0, yTop, yBot, r, pitch, yaw, matCyl, el.wireframeOnly, zoom, {
        drawTopCap: explodeGap > 5,
        drawBotCap: explodeGap > 5,
      });

      // Explode Guide Rays
      if (explodeGap > 5) {
        ctx.save();
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = matCaps.stroke;
        ctx.lineWidth = 1.4 / zoom;
        const pTopL = project(-r, yTop, 0);
        const pTopR = project(r, yTop, 0);
        const pBotL = project(-r, yBot, 0);
        const pBotR = project(r, yBot, 0);
        const pCapTopL = project(-r, yTop + topShiftY, 0);
        const pCapTopR = project(r, yTop + topShiftY, 0);
        const pCapBotL = project(-r, yBot + botShiftY, 0);
        const pCapBotR = project(r, yBot + botShiftY, 0);

        ctx.beginPath();
        ctx.moveTo(pTopL.x, pTopL.y); ctx.lineTo(pCapTopL.x, pCapTopL.y);
        ctx.moveTo(pTopR.x, pTopR.y); ctx.lineTo(pCapTopR.x, pCapTopR.y);
        ctx.moveTo(pBotL.x, pBotL.y); ctx.lineTo(pCapBotL.x, pCapBotL.y);
        ctx.moveTo(pBotR.x, pBotR.y); ctx.lineTo(pCapBotR.x, pCapBotR.y);
        ctx.stroke();

        ctx.fillStyle = matCaps.stroke;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('▲ Top Dome Cap', pCapTopR.x + 10, pCapTopR.y);
        ctx.fillText('▼ Bottom Dome Cap', pCapBotR.x + 10, pCapBotR.y);
        ctx.fillStyle = matCyl.stroke;
        ctx.fillText('■ Cylinder Body', pTopR.x + 10, cy);
        ctx.restore();
      }

      // Upper Hemispherical Dome (domeDir: -1)
      render3DHemisphere(ctx, project, 0, yTop + topShiftY, 0, r, -1, pitch, yaw, matCaps, el.wireframeOnly, zoom, {
        drawBaseDisk: explodeGap > 5,
      });

      // Lower Hemispherical Dome (domeDir: 1)
      render3DHemisphere(ctx, project, 0, yBot + botShiftY, 0, r, 1, pitch, yaw, matCaps, el.wireframeOnly, zoom, {
        drawBaseDisk: explodeGap > 5,
      });
      break;
    }

    case 'hemisphere-on-cube': {
      const a = lScale(el.length, 100 * baseScale) * 0.42;
      const r = rScale(el.radius, 48 * baseScale);
      const hemiShiftY = -explodeGap;

      const matCube = mat;
      const matDome = getSecondaryMaterial(mat);

      const rawVertices = [
        { x: -a, y:  a, z: -a }, { x:  a, y:  a, z: -a }, { x:  a, y: -a, z: -a }, { x: -a, y: -a, z: -a },
        { x: -a, y:  a, z:  a }, { x:  a, y:  a, z:  a }, { x:  a, y: -a, z:  a }, { x: -a, y: -a, z:  a },
      ];
      const vertices = rawVertices.map(v => project(v.x, v.y, v.z));

      // Realistic 3D Cube Faces with Face Normals
      const cubeFaces = [
        { indices: [0, 1, 2, 3], norm: { x: 0, y: 0, z: -1 } },
        { indices: [0, 3, 7, 4], norm: { x: -1, y: 0, z: 0 } },
        { indices: [1, 2, 6, 5], norm: { x: 1, y: 0, z: 0 } },
        { indices: [4, 5, 6, 7], norm: { x: 0, y: 0, z: 1 } },
        { indices: [3, 2, 6, 7], norm: { x: 0, y: -1, z: 0 } }, // Top face
      ];

      cubeFaces.forEach(f => {
        const rotN = rotate3D(f.norm.x, f.norm.y, f.norm.z, pitch, yaw);
        if (!el.wireframeOnly && rotN.z > 0.08) return;

        ctx.beginPath();
        ctx.moveTo(vertices[f.indices[0]].x, vertices[f.indices[0]].y);
        for (let i = 1; i < f.indices.length; i++) {
          ctx.lineTo(vertices[f.indices[i]].x, vertices[f.indices[i]].y);
        }
        ctx.closePath();

        if (!el.wireframeOnly) {
          ctx.fillStyle = computeRealisticLighting(rotN, matCube).fill;
          ctx.fill();
        }
        ctx.strokeStyle = el.wireframeOnly ? (el.color || '#38bdf8') : matCube.stroke;
        ctx.stroke();
      });

      // Highlight circular footprint / inlaid perimeter on top face
      const numPts = 32;
      ctx.save();
      ctx.setLineDash([3 / zoom, 3 / zoom]);
      ctx.strokeStyle = matDome.stroke;
      ctx.beginPath();
      for (let i = 0; i <= numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        const p = project(Math.cos(ang) * r, -a, Math.sin(ang) * r);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Explode guide lines
      if (explodeGap > 5) {
        ctx.save();
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = matDome.stroke;
        const pCubeTopL = project(-r, -a, 0);
        const pCubeTopR = project(r, -a, 0);
        const pDomeL = project(-r, -a + hemiShiftY, 0);
        const pDomeR = project(r, -a + hemiShiftY, 0);
        ctx.beginPath();
        ctx.moveTo(pCubeTopL.x, pCubeTopL.y);
        ctx.lineTo(pDomeL.x, pDomeL.y);
        ctx.moveTo(pCubeTopR.x, pCubeTopR.y);
        ctx.lineTo(pDomeR.x, pDomeR.y);
        ctx.stroke();

        ctx.fillStyle = matDome.stroke;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('◐ Sculptured Dome', pDomeR.x + 10, pDomeR.y);
        ctx.fillStyle = matCube.stroke;
        ctx.fillText('■ Plinth Block', pCubeTopR.x + 10, pCubeTopR.y + 14);
        ctx.restore();
      }

      // Hemisphere Dome floating above
      render3DHemisphere(ctx, project, 0, -a + hemiShiftY, 0, r, -1, pitch, yaw, matDome, el.wireframeOnly, zoom, {
        drawBaseDisk: explodeGap > 5,
      });
      break;
    }

    case 'cylinder-with-conical-cavity': {
      const r = rScale(el.radius, Math.min(w, h) * 0.30);
      const cylH = hScale(el.height3d, h * 0.65) * 0.68;
      const matCyl = mat;
      const matCone = getSecondaryMaterial(mat);
      const cavityShiftY = -explodeGap * 1.15;
      const yBot = cylH / 2;
      const yTop = -cylH / 2;

      // Outer Cylinder
      render3DCylinder(ctx, project, 0, 0, yTop, yBot, r, pitch, yaw, matCyl, el.wireframeOnly, zoom, {
        drawTopCap: true,
        drawBotCap: true,
      });

      const pTopL = project(-r, yTop, 0);
      const pTopR = project(r, yTop, 0);
      const cavityApex = project(0, yBot, 0);

      // Internal Conical Cavity (hollow scoop representation)
      ctx.save();
      if (!el.wireframeOnly) {
        ctx.beginPath();
        ctx.moveTo(pTopL.x, pTopL.y);
        ctx.lineTo(cavityApex.x, cavityApex.y);
        ctx.lineTo(pTopR.x, pTopR.y);
        ctx.closePath();
        const cavityGrad = ctx.createLinearGradient(pTopL.x, pTopL.y, pTopR.x, cavityApex.y);
        cavityGrad.addColorStop(0, 'rgba(15, 23, 42, 0.70)');
        cavityGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.90)');
        cavityGrad.addColorStop(1, 'rgba(15, 23, 42, 0.55)');
        ctx.fillStyle = cavityGrad;
        ctx.fill();
      }
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      ctx.strokeStyle = matCone.stroke;
      ctx.lineWidth = 1.6 / zoom;
      ctx.beginPath();
      ctx.moveTo(pTopL.x, pTopL.y);
      ctx.lineTo(cavityApex.x, cavityApex.y);
      ctx.lineTo(pTopR.x, pTopR.y);
      ctx.stroke();
      ctx.restore();

      // If Exploded: Draw the Carved Conical Plug extracted upwards using photorealistic cone
      if (explodeGap > 5) {
        ctx.save();
        ctx.strokeStyle = matCone.stroke;
        const extApex = project(0, yBot + cavityShiftY, 0);
        const pExtR = project(r, yTop + cavityShiftY, 0);

        // Extraction trajectory lines
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.beginPath();
        ctx.moveTo(cavityApex.x, cavityApex.y);
        ctx.lineTo(extApex.x, extApex.y);
        ctx.stroke();

        ctx.fillStyle = matCone.stroke;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('▼ Extracted Conical Core', pExtR.x + 10, pExtR.y);
        ctx.fillStyle = matCyl.stroke;
        ctx.fillText('■ Hollowed Cylinder Shell', pTopR.x + 10, cy);
        ctx.restore();

        // Photorealistic inverted extracted cone plug (apex at bottom, base at top)
        render3DCone(ctx, project, 0, yBot + cavityShiftY, 0, 0, yTop + cavityShiftY, 0, r, pitch, yaw, matCone, el.wireframeOnly, zoom, {
          drawBaseCap: true,
        });
      }
      break;
    }

    case 'frustum': {
      const r1 = rScale(el.radius, Math.min(w, h) * 0.36); // Top radius
      const r2 = wScale(el.width3d, r1 * 0.58);          // Bottom radius
      const fH = hScale(el.height3d, h * 0.68);

      // Photorealistic True 3D Frustum with segmented surface normals, Blinn-Phong lighting & caps
      render3DFrustum(ctx, project, 0, 0, -fH / 2, fH / 2, r1, r2, pitch, yaw, mat, el.wireframeOnly, zoom, {
        drawTopCap: true,
        drawBotCap: true,
      });

      // Exploded: show top cutoff apex cone separating to explain theorem
      if (explodeGap > 5) {
        ctx.save();
        const topConeH = fH * (r2 / Math.max(1, r1 - r2));
        const apexPt = project(0, -fH / 2 - topConeH - explodeGap, 0);
        const pTopR = project(r1, -fH / 2, 0);
        const numPts = 32;
        const topPt0 = project(Math.cos(0) * r1, -fH / 2, Math.sin(0) * r1);
        const topPtOpp = project(Math.cos(Math.PI) * r1, -fH / 2, Math.sin(Math.PI) * r1);
        ctx.setLineDash([4 / zoom, 3 / zoom]);
        ctx.strokeStyle = mat.stroke;
        ctx.beginPath();
        ctx.moveTo(topPt0.x, topPt0.y);
        ctx.lineTo(apexPt.x, apexPt.y);
        ctx.lineTo(topPtOpp.x, topPtOpp.y);
        ctx.stroke();

        ctx.fillStyle = mat.stroke;
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('▲ Slicing Apex Cone (Cutoff)', pTopR.x + 10, apexPt.y + 20);
        ctx.restore();
      }
      break;
    }

    case 'octahedron': {
      const a = lScale(el.length, Math.min(w, h) * 0.46) * 0.52;
      const hOct = hScale(el.height3d, a * 2.2) * 0.52;

      const rawVerts = [
        { x: 0, y: -hOct, z: 0 }, // 0: Top Apex
        { x: a, y: 0, z: 0 },    // 1: Right
        { x: 0, y: 0, z: a },    // 2: Front
        { x: -a, y: 0, z: 0 },   // 3: Left
        { x: 0, y: 0, z: -a },   // 4: Back
        { x: 0, y: hOct, z: 0 },  // 5: Bottom Apex
      ];

      const projVerts = rawVerts.map(v => project(v.x, v.y, v.z));

      const faces = [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], // Upper pyramid
        [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4], // Lower pyramid
      ];

      const lx = -0.42, ly = -0.85, lz = 0.35;
      const lLen = Math.hypot(lx, ly, lz);
      const nLx = lx / lLen, nLy = ly / lLen, nLz = lz / lLen;

      const renderedFaces = faces.map(f => {
        const v0 = rawVerts[f[0]];
        const v1 = rawVerts[f[1]];
        const v2 = rawVerts[f[2]];
        const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
        const bx = v2.x - v0.x, by = v2.y - v0.y, bz = v2.z - v0.z;
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const len = Math.hypot(nx, ny, nz) || 1;
        const norm = { x: nx / len, y: ny / len, z: nz / len };
        const rotNorm = rotate3D(norm.x, norm.y, norm.z, pitch, yaw);
        const avgZ = (projVerts[f[0]].z + projVerts[f[1]].z + projVerts[f[2]].z) / 3;
        return { indices: f, avgZ, normal: rotNorm };
      }).filter(f => el.wireframeOnly || f.normal.z < 0.15)
        .sort((a, b) => b.avgZ - a.avgZ);

      renderedFaces.forEach(({ indices, normal }) => {
        const p0 = projVerts[indices[0]];
        const p1 = projVerts[indices[1]];
        const p2 = projVerts[indices[2]];

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        if (!el.wireframeOnly) {
          const dot = Math.max(0, -(normal.x * nLx + normal.y * nLy + normal.z * nLz));
          const brightness = 0.38 + 0.62 * dot;

          if (el.shadingStyle === 'wood') {
            ctx.fillStyle = `rgb(${Math.round(180 * brightness)}, ${Math.round(110 * brightness)}, ${Math.round(55 * brightness)})`;
          } else if (el.shadingStyle === 'marble') {
            ctx.fillStyle = `rgb(${Math.round(245 * brightness)}, ${Math.round(248 * brightness)}, ${Math.round(252 * brightness)})`;
          } else if (el.shadingStyle === 'terracotta') {
            ctx.fillStyle = `rgb(${Math.round(225 * brightness)}, ${Math.round(105 * brightness)}, ${Math.round(45 * brightness)})`;
          } else {
            // Natural Sandstone / Ivory (as in photo right-side standing octahedron)
            ctx.fillStyle = `rgb(${Math.round(238 * brightness)}, ${Math.round(222 * brightness)}, ${Math.round(195 * brightness)})`;
          }
          ctx.fill();
        }

        ctx.strokeStyle = el.wireframeOnly ? (el.color || '#38bdf8') : 'rgba(140, 110, 80, 0.4)';
        ctx.lineWidth = 1.6 / zoom;
        ctx.stroke();
      });
      break;
    }

    case 'dodecahedron': {
      const phi = (1 + Math.sqrt(5)) / 2;
      const invPhi = 1 / phi;
      const s = lScale(el.length, Math.min(w, h) * 0.44) * 0.32;

      const r1 = s;
      const rP = s * phi;
      const rIp = s * invPhi;

      const rawVerts = [
        { x: -r1, y: -r1, z: -r1 }, // 0
        { x: -r1, y: -r1, z:  r1 }, // 1
        { x: -r1, y:  r1, z: -r1 }, // 2
        { x: -r1, y:  r1, z:  r1 }, // 3
        { x:  r1, y: -r1, z: -r1 }, // 4
        { x:  r1, y: -r1, z:  r1 }, // 5
        { x:  r1, y:  r1, z: -r1 }, // 6
        { x:  r1, y:  r1, z:  r1 }, // 7
        { x: 0, y: -rIp, z: -rP }, // 8
        { x: 0, y: -rIp, z:  rP }, // 9
        { x: 0, y:  rIp, z: -rP }, // 10
        { x: 0, y:  rIp, z:  rP }, // 11
        { x: -rIp, y: -rP, z: 0 }, // 12
        { x: -rIp, y:  rP, z: 0 }, // 13
        { x:  rIp, y: -rP, z: 0 }, // 14
        { x:  rIp, y:  rP, z: 0 }, // 15
        { x: -rP, y: 0, z: -rIp }, // 16
        { x: -rP, y: 0, z:  rIp }, // 17
        { x:  rP, y: 0, z: -rIp }, // 18
        { x:  rP, y: 0, z:  rIp }, // 19
      ];

      const projVerts = rawVerts.map(v => project(v.x, v.y, v.z));

      const pentagons = [
        [11, 7, 19, 5, 9],
        [11, 9, 1, 17, 3],
        [11, 3, 13, 15, 7],
        [19, 7, 15, 6, 18],
        [5, 19, 18, 4, 14],
        [9, 5, 14, 12, 1],
        [1, 12, 0, 16, 17],
        [3, 17, 16, 2, 13],
        [8, 10, 2, 16, 0],
        [8, 0, 12, 14, 4],
        [8, 4, 18, 6, 10],
        [10, 6, 15, 13, 2],
      ];

      const lx = -0.45, ly = -0.8, lz = 0.4;
      const lLen = Math.hypot(lx, ly, lz);
      const nLx = lx / lLen, nLy = ly / lLen, nLz = lz / lLen;

      const renderedFaces = pentagons.map(f => {
        const v0 = rawVerts[f[0]];
        const v1 = rawVerts[f[1]];
        const v2 = rawVerts[f[2]];
        const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
        const bx = v2.x - v0.x, by = v2.y - v0.y, bz = v2.z - v0.z;
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const len = Math.hypot(nx, ny, nz) || 1;
        const norm = { x: nx / len, y: ny / len, z: nz / len };
        const rotNorm = rotate3D(norm.x, norm.y, norm.z, pitch, yaw);
        const avgZ = f.reduce((acc, idx) => acc + projVerts[idx].z, 0) / f.length;
        return { indices: f, avgZ, normal: rotNorm };
      }).filter(f => el.wireframeOnly || f.normal.z < 0.15)
        .sort((a, b) => b.avgZ - a.avgZ);

      renderedFaces.forEach(({ indices, normal }) => {
        ctx.beginPath();
        const p0 = projVerts[indices[0]];
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < indices.length; i++) {
          const pt = projVerts[indices[i]];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();

        if (!el.wireframeOnly) {
          const dot = Math.max(0, -(normal.x * nLx + normal.y * nLy + normal.z * nLz));
          const brightness = 0.32 + 0.68 * dot;

          if (el.shadingStyle === 'marble') {
            ctx.fillStyle = `rgb(${Math.round(242 * brightness)}, ${Math.round(245 * brightness)}, ${Math.round(250 * brightness)})`;
          } else if (el.shadingStyle === 'sandstone') {
            ctx.fillStyle = `rgb(${Math.round(230 * brightness)}, ${Math.round(210 * brightness)}, ${Math.round(180 * brightness)})`;
          } else if (el.shadingStyle === 'terracotta') {
            ctx.fillStyle = `rgb(${Math.round(215 * brightness)}, ${Math.round(95 * brightness)}, ${Math.round(40 * brightness)})`;
          } else {
            // Natural Rich Polished Wood (as in center figure of photo)
            const rVal = Math.round(155 * brightness);
            const gVal = Math.round(85 * brightness);
            const bVal = Math.round(38 * brightness);
            ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
          }
          ctx.fill();
        }

        ctx.strokeStyle = el.wireframeOnly ? (el.color || '#38bdf8') : 'rgba(70, 35, 12, 0.55)';
        ctx.lineWidth = 1.6 / zoom;
        ctx.stroke();
      });
      break;
    }

    case 'icosahedron': {
      const phi = (1 + Math.sqrt(5)) / 2;
      const s = lScale(el.length, Math.min(w, h) * 0.44) * 0.36;

      const rawVerts = [
        { x: -s, y:  s * phi, z: 0 }, // 0
        { x:  s, y:  s * phi, z: 0 }, // 1
        { x: -s, y: -s * phi, z: 0 }, // 2
        { x:  s, y: -s * phi, z: 0 }, // 3
        { x: 0, y: -s, z:  s * phi }, // 4
        { x: 0, y:  s, z:  s * phi }, // 5
        { x: 0, y: -s, z: -s * phi }, // 6
        { x: 0, y:  s, z: -s * phi }, // 7
        { x:  s * phi, y: 0, z: -s }, // 8
        { x:  s * phi, y: 0, z:  s }, // 9
        { x: -s * phi, y: 0, z: -s }, // 10
        { x: -s * phi, y: 0, z:  s }, // 11
      ];

      const projVerts = rawVerts.map(v => project(v.x, v.y, v.z));

      const triangles = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
      ];

      const lx = -0.45, ly = -0.8, lz = 0.4;
      const lLen = Math.hypot(lx, ly, lz);
      const nLx = lx / lLen, nLy = ly / lLen, nLz = lz / lLen;

      const renderedFaces = triangles.map(f => {
        const v0 = rawVerts[f[0]];
        const v1 = rawVerts[f[1]];
        const v2 = rawVerts[f[2]];
        const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
        const bx = v2.x - v0.x, by = v2.y - v0.y, bz = v2.z - v0.z;
        const nx = ay * bz - az * by;
        const ny = az * bx - ax * bz;
        const nz = ax * by - ay * bx;
        const len = Math.hypot(nx, ny, nz) || 1;
        const norm = { x: nx / len, y: ny / len, z: nz / len };
        const rotNorm = rotate3D(norm.x, norm.y, norm.z, pitch, yaw);
        const avgZ = (projVerts[f[0]].z + projVerts[f[1]].z + projVerts[f[2]].z) / 3;
        return { indices: f, avgZ, normal: rotNorm };
      }).filter(f => el.wireframeOnly || f.normal.z < 0.15)
        .sort((a, b) => b.avgZ - a.avgZ);

      renderedFaces.forEach(({ indices, normal }) => {
        const p0 = projVerts[indices[0]];
        const p1 = projVerts[indices[1]];
        const p2 = projVerts[indices[2]];

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();

        if (!el.wireframeOnly) {
          const dot = Math.max(0, -(normal.x * nLx + normal.y * nLy + normal.z * nLz));
          const brightness = 0.38 + 0.62 * dot;

          if (el.shadingStyle === 'wood') {
            ctx.fillStyle = `rgb(${Math.round(175 * brightness)}, ${Math.round(105 * brightness)}, ${Math.round(50 * brightness)})`;
          } else if (el.shadingStyle === 'terracotta') {
            ctx.fillStyle = `rgb(${Math.round(225 * brightness)}, ${Math.round(105 * brightness)}, ${Math.round(45 * brightness)})`;
          } else {
            // White Porcelain / Sculpted Marble (as in photo foreground left)
            ctx.fillStyle = `rgb(${Math.round(245 * brightness)}, ${Math.round(248 * brightness)}, ${Math.round(252 * brightness)})`;
          }
          ctx.fill();
        }

        ctx.strokeStyle = el.wireframeOnly ? (el.color || '#38bdf8') : 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1.5 / zoom;
        ctx.stroke();
      });
      break;
    }

    case 'pawn-sphere': {
      const r = rScale(el.radius, Math.min(w, h) * 0.28);
      const totalH = hScale(el.height3d, h * 0.75);
      const sphereCenterY = isExploded ? -totalH * 0.32 - explodeGap : -totalH * 0.25;
      const center = project(0, sphereCenterY, 0);

      // Flared Pedestal Neck and Plinth Base
      const numSteps = 24;
      const neckPts: { x: number; y: number }[] = [];
      const basePts: { x: number; y: number }[] = [];
      const plinthTopY = totalH * 0.22;
      const plinthBotY = totalH * 0.42;

      for (let i = 0; i <= numSteps; i++) {
        const ang = (i / numSteps) * Math.PI * 2;
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);
        neckPts.push(project(cos * (r * 0.52), -r * 0.15, sin * (r * 0.52)));
        basePts.push(project(cos * (r * 0.95), plinthTopY, sin * (r * 0.95)));
      }

      // Pedestal body
      if (!el.wireframeOnly) {
        ctx.beginPath();
        ctx.moveTo(neckPts[0].x, neckPts[0].y);
        for (const p of neckPts) ctx.lineTo(p.x, p.y);
        for (let i = basePts.length - 1; i >= 0; i--) ctx.lineTo(basePts[i].x, basePts[i].y);
        ctx.closePath();
        ctx.fillStyle = createNaturalCurvedGradient(ctx, cx - r, cy, cx + r, cy + totalH * 0.3, mat);
        ctx.fill();
        ctx.strokeStyle = el.wireframeOnly ? (el.color || '#38bdf8') : mat.stroke;
        ctx.stroke();

        // Plinth box
        const pw = r * 1.1;
        const plinthVerts = [
          project(-pw, plinthTopY, -pw),
          project( pw, plinthTopY, -pw),
          project( pw, plinthTopY,  pw),
          project(-pw, plinthTopY,  pw),
          project(-pw, plinthBotY, -pw),
          project( pw, plinthBotY, -pw),
          project( pw, plinthBotY,  pw),
          project(-pw, plinthBotY,  pw),
        ];
        // Front face of plinth
        ctx.beginPath();
        ctx.moveTo(plinthVerts[3].x, plinthVerts[3].y);
        ctx.lineTo(plinthVerts[2].x, plinthVerts[2].y);
        ctx.lineTo(plinthVerts[6].x, plinthVerts[6].y);
        ctx.lineTo(plinthVerts[7].x, plinthVerts[7].y);
        ctx.closePath();
        const plinthRotN = rotate3D(0, 0, 1, pitch, yaw);
        ctx.fillStyle = computeRealisticLighting(plinthRotN, mat, -0.05).fill;
        ctx.fill();
        ctx.strokeStyle = mat.stroke;
        ctx.stroke();
      }

      // Spherical Ball Head with Natural Radial Gradient
      if (!el.wireframeOnly) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.fillStyle = createNaturalRadialGradient(ctx, center.x, center.y, r, mat);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = el.wireframeOnly ? (el.color || '#38bdf8') : mat.stroke;
      ctx.lineWidth = 1.8 / zoom;
      ctx.stroke();
      break;
    }

    case 'faceted-gem': {
      const r = lScale(el.length, Math.min(w, h) * 0.42) * 0.48;
      const hGem = hScale(el.height3d, r * 1.8) * 0.5;

      const numPts = 8;
      const tablePts: { x: number; y: number; z: number }[] = [];
      const girdlePts: { x: number; y: number; z: number }[] = [];
      const culetPt = { x: 0, y: hGem, z: 0 };

      for (let i = 0; i < numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        tablePts.push({ x: Math.cos(ang) * (r * 0.55), y: -hGem * 0.6, z: Math.sin(ang) * (r * 0.55) });
        girdlePts.push({ x: Math.cos(ang) * r, y: 0, z: Math.sin(ang) * r });
      }

      const pTable = tablePts.map(p => project(p.x, p.y, p.z));
      const pGirdle = girdlePts.map(p => project(p.x, p.y, p.z));
      const pCulet = project(culetPt.x, culetPt.y, culetPt.z);

      // Draw table facet
      ctx.beginPath();
      ctx.moveTo(pTable[0].x, pTable[0].y);
      for (const p of pTable) ctx.lineTo(p.x, p.y);
      ctx.closePath();
      if (!el.wireframeOnly) {
        const topRotN = rotate3D(0, -1, 0, pitch, yaw);
        ctx.fillStyle = computeRealisticLighting(topRotN, mat, 0.12).fill;
        ctx.fill();
      }
      ctx.stroke();

      // Crown facets
      for (let i = 0; i < numPts; i++) {
        const next = (i + 1) % numPts;
        ctx.beginPath();
        ctx.moveTo(pTable[i].x, pTable[i].y);
        ctx.lineTo(pGirdle[i].x, pGirdle[i].y);
        ctx.lineTo(pGirdle[next].x, pGirdle[next].y);
        ctx.lineTo(pTable[next].x, pTable[next].y);
        ctx.closePath();
        if (!el.wireframeOnly) {
          const midX = (tablePts[i].x + girdlePts[i].x + girdlePts[next].x + tablePts[next].x) / 4;
          const midZ = (tablePts[i].z + girdlePts[i].z + girdlePts[next].z + tablePts[next].z) / 4;
          const len = Math.hypot(midX, midZ) || 1;
          const facetNorm = rotate3D(midX / len, -0.65, midZ / len, pitch, yaw);
          ctx.fillStyle = computeRealisticLighting(facetNorm, mat).fill;
          ctx.fill();
        }
        ctx.stroke();

        // Pavilion facet
        ctx.beginPath();
        ctx.moveTo(pGirdle[i].x, pGirdle[i].y);
        ctx.lineTo(pCulet.x, pCulet.y);
        ctx.lineTo(pGirdle[next].x, pGirdle[next].y);
        ctx.closePath();
        if (!el.wireframeOnly) {
          const midX = (girdlePts[i].x + girdlePts[next].x) / 2;
          const midZ = (girdlePts[i].z + girdlePts[next].z) / 2;
          const len = Math.hypot(midX, midZ) || 1;
          const pavNorm = rotate3D(midX / len, 0.75, midZ / len, pitch, yaw);
          ctx.fillStyle = computeRealisticLighting(pavNorm, mat, -0.1).fill;
          ctx.fill();
        }
        ctx.stroke();
      }
      break;
    }

    default: {
      // Fallback: render a clean 3D natural box
      const a = Math.min(w, h) * 0.35;
      const f1 = project(-a, -a, a);
      const f2 = project(a, -a, a);
      const f3 = project(a, a, a);
      const f4 = project(-a, a, a);
      ctx.beginPath();
      ctx.moveTo(f1.x, f1.y);
      ctx.lineTo(f2.x, f2.y);
      ctx.lineTo(f3.x, f3.y);
      ctx.lineTo(f4.x, f4.y);
      ctx.closePath();
      if (!el.wireframeOnly) {
        ctx.fillStyle = computeRealisticLighting({ x: 0, y: 0, z: 1 }, mat).fill;
        ctx.fill();
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}
