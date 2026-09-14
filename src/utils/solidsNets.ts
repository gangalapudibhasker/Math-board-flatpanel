import { SolidType } from '../types';

export interface NetFace {
  name: string;
  latexArea: string;
  color?: string;
  isInternalJoint?: boolean; // For combination of solids: internal circular interfaces that do not count toward TSA
}

export interface SolidNetInfo {
  type: SolidType;
  title: string;
  facesCount: number;
  formulaTSA: string;
  latexTSA: string;
  explanation: string;
  faces: NetFace[];
}

export const SOLIDS_NETS_CATALOG: Record<SolidType, SolidNetInfo> = {
  cube: {
    type: 'cube',
    title: 'Net of a Cube',
    facesCount: 6,
    formulaTSA: 'TSA = 6a²',
    latexTSA: '\\text{TSA} = 6a^2',
    explanation: 'Latin cross unfolding consisting of 6 congruent squares of side a.',
    faces: [
      { name: 'Top Face', latexArea: 'a^2' },
      { name: 'Left Face', latexArea: 'a^2' },
      { name: 'Center/Base', latexArea: 'a^2' },
      { name: 'Right Face', latexArea: 'a^2' },
      { name: 'Bottom Face', latexArea: 'a^2' },
      { name: 'Back Face', latexArea: 'a^2' },
    ],
  },
  cuboid: {
    type: 'cuboid',
    title: 'Net of a Cuboid (Rectangular Box)',
    facesCount: 6,
    formulaTSA: 'TSA = 2(lb + bh + hl)',
    latexTSA: '\\text{TSA} = 2(l \\cdot b + b \\cdot h + h \\cdot l)',
    explanation: '6 rectangular faces paired in congruent opposite pairs: 2 of (l×b), 2 of (b×h), and 2 of (h×l).',
    faces: [
      { name: 'Top (l × b)', latexArea: 'l \\cdot b' },
      { name: 'Bottom (l × b)', latexArea: 'l \\cdot b' },
      { name: 'Front (l × h)', latexArea: 'l \\cdot h' },
      { name: 'Back (l × h)', latexArea: 'l \\cdot h' },
      { name: 'Left (b × h)', latexArea: 'b \\cdot h' },
      { name: 'Right (b × h)', latexArea: 'b \\cdot h' },
    ],
  },
  cylinder: {
    type: 'cylinder',
    title: 'Net of a Right Circular Cylinder',
    facesCount: 3,
    formulaTSA: 'TSA = 2πrh + 2πr² = 2πr(r + h)',
    latexTSA: '\\text{TSA} = 2\\pi r h + 2\\pi r^2 = 2\\pi r(r + h)',
    explanation: 'Unrolls into 1 large central rectangle of width = circumference (2πr) and height h, plus 2 identical circular bases of radius r.',
    faces: [
      { name: 'Top Circular Lid', latexArea: '\\pi r^2' },
      { name: 'Curved Surface (Unrolled Rect)', latexArea: '2\\pi r h' },
      { name: 'Bottom Circular Base', latexArea: '\\pi r^2' },
    ],
  },
  cone: {
    type: 'cone',
    title: 'Net of a Right Circular Cone',
    facesCount: 2,
    formulaTSA: 'TSA = πrl + πr² = πr(l + r)',
    latexTSA: '\\text{TSA} = \\pi r l + \\pi r^2 = \\pi r(l + r)',
    explanation: 'Unrolls into a circular sector of radius l (slant height) with arc length = 2πr (central angle θ = 360°·r/l), attached to a circular base of radius r.',
    faces: [
      { name: 'Curved Surface (Sector of radius l)', latexArea: '\\pi r l' },
      { name: 'Circular Base (radius r)', latexArea: '\\pi r^2' },
    ],
  },
  sphere: {
    type: 'sphere',
    title: 'Gores Net of a Sphere (Sinusoidal Projection)',
    facesCount: 8,
    formulaTSA: 'TSA = 4πr²',
    latexTSA: '\\text{TSA} = 4\\pi r^2',
    explanation: 'Because a sphere has Gaussian curvature K > 0 (Theorema Egregium), it cannot be flattened without distortion. Its net is represented by equal sinusoidal gores summing to 4πr².',
    faces: [
      { name: '8 Sinusoidal Gores', latexArea: '4\\pi r^2' },
    ],
  },
  hemisphere: {
    type: 'hemisphere',
    title: 'Net of a Solid Hemisphere',
    facesCount: 2,
    formulaTSA: 'TSA = 2πr² + πr² = 3πr²',
    latexTSA: '\\text{TSA} = 2\\pi r^2 + \\pi r^2 = 3\\pi r^2',
    explanation: 'Comprises a flat circular base of area πr² and the curved dome surface of area 2πr².',
    faces: [
      { name: 'Curved Dome Surface', latexArea: '2\\pi r^2' },
      { name: 'Flat Circular Base', latexArea: '\\pi r^2' },
    ],
  },
  'square-pyramid': {
    type: 'square-pyramid',
    title: 'Net of a Square Pyramid',
    facesCount: 5,
    formulaTSA: 'TSA = a² + 2al',
    latexTSA: '\\text{TSA} = a^2 + 2al \\quad (l = \\sqrt{h^2 + (a/2)^2})',
    explanation: 'Central square base of side a with 4 isosceles triangles attached to each edge, each of area ½·a·l.',
    faces: [
      { name: 'Square Base', latexArea: 'a^2' },
      { name: '4 Triangular Slanted Faces', latexArea: '4 \\times (\\frac{1}{2}al) = 2al' },
    ],
  },
  tetrahedron: {
    type: 'tetrahedron',
    title: 'Net of a Regular Tetrahedron (Triangular Pyramid)',
    facesCount: 4,
    formulaTSA: 'TSA = √3 a²',
    latexTSA: '\\text{TSA} = 4 \\times \\left(\\frac{\\sqrt{3}}{4}a^2\\right) = \\sqrt{3}a^2',
    explanation: '1 central equilateral triangle with 3 identical equilateral triangles folded along its 3 edges.',
    faces: [
      { name: 'Base Equilateral Triangle', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: '3 Lateral Equilateral Triangles', latexArea: '3 \\times \\frac{\\sqrt{3}}{4}a^2' },
    ],
  },
  'triangular-prism': {
    type: 'triangular-prism',
    title: 'Net of a Triangular Prism',
    facesCount: 5,
    formulaTSA: 'TSA = b·h_tri + (s₁ + s₂ + s₃)L',
    latexTSA: '\\text{TSA} = b \\cdot h_{\\text{tri}} + (s_1 + s_2 + s_3)L',
    explanation: '3 connected rectangular side faces of width s₁, s₂, s₃ and length L, plus 2 congruent triangular end caps.',
    faces: [
      { name: '3 Rectangular Lateral Faces', latexArea: '(s_1 + s_2 + s_3)L' },
      { name: '2 Triangular Base Caps', latexArea: '2 \\times (\\frac{1}{2}b h_{\\text{tri}}) = b h_{\\text{tri}}' },
    ],
  },
  hourglass: {
    type: 'hourglass',
    title: 'Net of an Hourglass (Double Frustum)',
    facesCount: 4,
    formulaTSA: 'TSA = 2π(r₁ + r₂)l + 2πr₁²',
    latexTSA: '\\text{TSA} = 2\\pi(r_1 + r_2)l + 2\\pi r_1^2',
    explanation: 'Two inverted frustum annular curved sectors connected at the neck (internal waist), with two circular external end bases.',
    faces: [
      { name: 'Top Frustum Lateral Sector', latexArea: '\\pi(r_1 + r_2)l' },
      { name: 'Bottom Frustum Lateral Sector', latexArea: '\\pi(r_1 + r_2)l' },
      { name: 'Top Base Lid', latexArea: '\\pi r_1^2' },
      { name: 'Bottom Base Floor', latexArea: '\\pi r_1^2' },
    ],
  },
  'cone-on-cylinder': {
    type: 'cone-on-cylinder',
    title: 'Net of Cone on Cylinder (Circus Tent / Rocket)',
    facesCount: 3,
    formulaTSA: 'TSA = πr² + 2πrh_cyl + πrl_cone',
    latexTSA: '\\text{TSA} = \\pi r^2 + 2\\pi r h_{\\text{cyl}} + \\pi r l_{\\text{cone}}',
    explanation: 'Bottom circular floor + cylinder unrolled rectangle + conical roof sector. NOTICE: The circular boundary between cone and cylinder is internal, so it is NOT added to TSA!',
    faces: [
      { name: 'Bottom Circular Floor', latexArea: '\\pi r^2' },
      { name: 'Cylinder Curved Surface', latexArea: '2\\pi r h_{\\text{cyl}}' },
      { name: 'Cone Curved Roof', latexArea: '\\pi r l_{\\text{cone}}' },
      { name: 'Internal Joint Interface (NOT in TSA)', latexArea: '\\text{Internal}', isInternalJoint: true },
    ],
  },
  'hemisphere-on-cylinder': {
    type: 'hemisphere-on-cylinder',
    title: 'Net of Hemisphere on Cylinder (Medicine Capsule)',
    facesCount: 3,
    formulaTSA: 'TSA = πr² + 2πrh + 2πr²',
    latexTSA: '\\text{TSA} = \\pi r^2 + 2\\pi r h + 2\\pi r^2',
    explanation: 'Cylindrical tubular body + hemisphere curved dome + flat circular base. Joint disc is internal.',
    faces: [
      { name: 'Bottom Circular Base', latexArea: '\\pi r^2' },
      { name: 'Cylinder Body', latexArea: '2\\pi r h' },
      { name: 'Hemisphere Dome Surface', latexArea: '2\\pi r^2' },
    ],
  },
  'hemisphere-on-cube': {
    type: 'hemisphere-on-cube',
    title: 'Net of Hemisphere mounted on Cube',
    facesCount: 7,
    formulaTSA: 'TSA = 6a² - πr² + 2πr² = 6a² + πr²',
    latexTSA: '\\text{TSA} = 6a^2 - \\pi r^2 + 2\\pi r^2 = 6a^2 + \\pi r^2',
    explanation: '5 full square faces + 1 top square face with circular hole subtracted (-πr²) + hemisphere dome (+2πr²).',
    faces: [
      { name: '5 Square Faces', latexArea: '5a^2' },
      { name: 'Top Face (with circular cutout)', latexArea: 'a^2 - \\pi r^2' },
      { name: 'Hemisphere Dome', latexArea: '2\\pi r^2' },
    ],
  },
  'cylinder-with-conical-cavity': {
    type: 'cylinder-with-conical-cavity',
    title: 'Net of Cylinder with Conical Cavity scooped out',
    facesCount: 3,
    formulaTSA: 'TSA = πr² + 2πrh + πrl',
    latexTSA: '\\text{TSA} = \\pi r^2 + 2\\pi r h + \\pi r l',
    explanation: 'Flat circular bottom + external cylindrical wall + internal conical cavity surface.',
    faces: [
      { name: 'Bottom Flat Base', latexArea: '\\pi r^2' },
      { name: 'Outer Cylinder CSA', latexArea: '2\\pi r h' },
      { name: 'Internal Cone Cavity CSA', latexArea: '\\pi r l' },
    ],
  },
  frustum: {
    type: 'frustum',
    title: 'Net of a Frustum of a Cone (Bucket)',
    facesCount: 3,
    formulaTSA: 'TSA = π(r₁ + r₂)l + πr₁² + πr₂²',
    latexTSA: '\\text{TSA} = \\pi(r_1 + r_2)l + \\pi r_1^2 + \\pi r_2^2',
    explanation: 'Curved surface unrolls into an annular sector between two concentric circular arcs of radii L and L-l, plus top circular lid and bottom circular base.',
    faces: [
      { name: 'Top Circular Lid (radius r₁)', latexArea: '\\pi r_1^2' },
      { name: 'Annular Slant Sector', latexArea: '\\pi(r_1 + r_2)l' },
      { name: 'Bottom Circular Base (radius r₂)', latexArea: '\\pi r_2^2' },
    ],
  },
  octahedron: {
    type: 'octahedron',
    title: 'Net of a Regular Octahedron',
    facesCount: 8,
    formulaTSA: 'TSA = 2√3 a²',
    latexTSA: '\\text{TSA} = 2\\sqrt{3}a^2',
    explanation: 'Unfolding of 8 congruent equilateral triangles arranged in two interconnected rows of 4 triangles.',
    faces: [
      { name: 'Upper Face 1', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: 'Upper Face 2', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: 'Upper Face 3', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: 'Upper Face 4', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: 'Lower Face 1', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: 'Lower Face 2', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: 'Lower Face 3', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
      { name: 'Lower Face 4', latexArea: '\\frac{\\sqrt{3}}{4}a^2' },
    ],
  },
  dodecahedron: {
    type: 'dodecahedron',
    title: 'Net of a Regular Dodecahedron',
    facesCount: 12,
    formulaTSA: 'TSA = 3√(25 + 10√5) a² ≈ 20.646 a²',
    latexTSA: '\\text{TSA} = 3\\sqrt{25 + 10\\sqrt{5}}\\,a^2',
    explanation: 'Two clusters of 6 regular pentagons: one central base surrounded by 5 petals, connected to an inverted identical cluster.',
    faces: Array.from({ length: 12 }, (_, i) => ({
      name: `Pentagonal Face ${i + 1}`,
      latexArea: '\\frac{1}{4}\\sqrt{25+10\\sqrt{5}}\\,a^2',
    })),
  },
  icosahedron: {
    type: 'icosahedron',
    title: 'Net of a Regular Icosahedron',
    facesCount: 20,
    formulaTSA: 'TSA = 5√3 a² ≈ 8.660 a²',
    latexTSA: '\\text{TSA} = 5\\sqrt{3}a^2',
    explanation: 'Central strip of 10 alternating equilateral triangles flanked by top and bottom caps of 5 triangles each.',
    faces: Array.from({ length: 20 }, (_, i) => ({
      name: `Equilateral Face ${i + 1}`,
      latexArea: '\\frac{\\sqrt{3}}{4}a^2',
    })),
  },
  'pawn-sphere': {
    type: 'pawn-sphere',
    title: 'Net Breakdown of Pedestal Sphere (Pawn)',
    facesCount: 3,
    formulaTSA: 'TSA = 4πr² + Pedestal Area',
    latexTSA: '\\text{TSA} = 4\\pi r^2 + \\text{Area}_{\\text{pedestal}}',
    explanation: 'Surface breakdown consisting of the upper spherical surface (equivalent to 4 circular projection areas) plus flared pedestal lateral and base.',
    faces: [
      { name: 'Spherical Surface Area', latexArea: '4\\pi r^2' },
      { name: 'Flared Pedestal Lateral', latexArea: '2\\pi r_{\\text{mid}} h' },
      { name: 'Plinth Base Face', latexArea: '\\pi r_{\\text{base}}^2' },
    ],
  },
  'faceted-gem': {
    type: 'faceted-gem',
    title: 'Net of a Faceted Polyhedral Gem',
    facesCount: 16,
    formulaTSA: 'TSA = Sum of Facet Areas',
    latexTSA: '\\text{TSA} = \\sum A_{\\text{facets}}',
    explanation: 'Polyhedral gem net with horizontal table facet, 8 crown triangular facets, and 8 pavilion lower triangular facets.',
    faces: Array.from({ length: 16 }, (_, i) => ({
      name: `Facet ${i + 1}`,
      latexArea: 'A_{\\text{facet}}',
    })),
  },
  'cone-on-hemisphere': {
    type: 'cone-on-hemisphere',
    title: 'Net of Cone on Hemisphere (Spinning Top / Toy)',
    facesCount: 2,
    formulaTSA: 'TSA = πrl + 2πr²',
    latexTSA: '\\text{TSA} = \\pi r l + 2\\pi r^2',
    explanation: 'Surface consists of conical lateral sector (radius l, arc 2πr) plus hemispherical dome surface (2πr²). Common joint base πr² is internal.',
    faces: [
      { name: 'Conical Lateral Sector', latexArea: '\\pi r l' },
      { name: 'Hemispherical Dome Surface', latexArea: '2\\pi r^2' },
    ],
  },
  capsule: {
    type: 'capsule',
    title: 'Net Breakdown of Capsule (Cylinder + 2 Hemispheres)',
    facesCount: 3,
    formulaTSA: 'TSA = 2πrh + 4πr²',
    latexTSA: '\\text{TSA} = 2\\pi r h + 4\\pi r^2',
    explanation: 'Unrolls into central cylinder rectangle (2πr × h) plus two hemispherical caps that together equal 1 full spherical surface (4πr²).',
    faces: [
      { name: 'Cylinder Body (2πr × h)', latexArea: '2\\pi r h' },
      { name: 'Top Dome Surface', latexArea: '2\\pi r^2' },
      { name: 'Bottom Dome Surface', latexArea: '2\\pi r^2' },
    ],
  },
};

/**
 * Draw complete high-resolution 2D Net Diagram with face labels, dimensions, and folding creases
 */
export function drawSolidNetDiagram(
  ctx: CanvasRenderingContext2D,
  type: SolidType,
  width: number,
  height: number,
  foldRatio: number = 0,
  accentColor: string = '#38bdf8'
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // Background subtle grid/card
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Styling
  ctx.lineWidth = 2;
  ctx.strokeStyle = accentColor;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';

  const drawLabel = (text: string, x: number, y: number, subText?: string) => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(text, x, subText ? y - 8 : y);
    if (subText) {
      ctx.font = '10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(subText, x, y + 8);
    }
    ctx.restore();
  };

  const drawDashedFoldLine = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  // Fold angle factor (0 = flat, 1 = 90 deg folded)
  const foldCos = Math.cos(foldRatio * (Math.PI / 2.2));

  switch (type) {
    case 'cube': {
      const s = Math.min(width, height) * 0.18;
      // Latin Cross: column of 4 squares at cx, plus wings at left and right
      const colX = cx - s / 2;
      const rowY0 = cy - 2 * s;

      // Draw 6 faces with fold transform
      const wingW = s * foldCos;

      // Center column: [Top, Back, Base, Front]
      for (let i = 0; i < 4; i++) {
        const y = rowY0 + i * s;
        ctx.fillStyle = i === 2 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(56, 189, 248, 0.12)';
        ctx.strokeRect(colX, y, s, s);
        ctx.fillRect(colX, y, s, s);

        const labels = ['Top Face', 'Back', 'Base (a²)', 'Front'];
        drawLabel(labels[i], cx, y + s / 2, 'a²');

        if (i > 0) {
          drawDashedFoldLine(colX, y, colX + s, y);
        }
      }

      // Left wing attached to Base (index 2)
      const baseY = rowY0 + 2 * s;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.strokeRect(colX - wingW, baseY, wingW, s);
      ctx.fillRect(colX - wingW, baseY, wingW, s);
      drawDashedFoldLine(colX, baseY, colX, baseY + s);
      if (wingW > 15) drawLabel('Left', colX - wingW / 2, baseY + s / 2, 'a²');

      // Right wing attached to Base
      ctx.strokeRect(colX + s, baseY, wingW, s);
      ctx.fillRect(colX + s, baseY, wingW, s);
      drawDashedFoldLine(colX + s, baseY, colX + s, baseY + s);
      if (wingW > 15) drawLabel('Right', colX + s + wingW / 2, baseY + s / 2, 'a²');
      break;
    }

    case 'cuboid': {
      const l = Math.min(width, height) * 0.22;
      const b = l * 0.65;
      const h = l * 0.75 * foldCos;

      const x0 = cx - l / 2;
      const y0 = cy - b / 2;

      // Bottom Base (l x b)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.strokeRect(x0, y0, l, b);
      ctx.fillRect(x0, y0, l, b);
      drawLabel('Base', cx, cy, 'l · b');

      // Top Lid (l x b) above Back
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.strokeRect(x0, y0 - h - b, l, b);
      ctx.fillRect(x0, y0 - h - b, l, b);
      drawLabel('Top Lid', cx, y0 - h - b / 2, 'l · b');
      drawDashedFoldLine(x0, y0 - h, x0 + l, y0 - h);

      // Back (l x h)
      ctx.strokeRect(x0, y0 - h, l, h);
      ctx.fillRect(x0, y0 - h, l, h);
      drawLabel('Back', cx, y0 - h / 2, 'l · h');
      drawDashedFoldLine(x0, y0, x0 + l, y0);

      // Front (l x h)
      ctx.strokeRect(x0, y0 + b, l, h);
      ctx.fillRect(x0, y0 + b, l, h);
      drawLabel('Front', cx, y0 + b + h / 2, 'l · h');
      drawDashedFoldLine(x0, y0 + b, x0 + l, y0 + b);

      // Left (b x h)
      ctx.strokeRect(x0 - h, y0, h, b);
      ctx.fillRect(x0 - h, y0, h, b);
      drawLabel('Left', x0 - h / 2, cy, 'b · h');
      drawDashedFoldLine(x0, y0, x0, y0 + b);

      // Right (b x h)
      ctx.strokeRect(x0 + l, y0, h, b);
      ctx.fillRect(x0 + l, y0, h, b);
      drawLabel('Right', x0 + l + h / 2, cy, 'b · h');
      drawDashedFoldLine(x0 + l, y0, x0 + l, y0 + b);
      break;
    }

    case 'cylinder': {
      const rectW = Math.min(width, height) * 0.52; // represents 2*pi*r
      const rectH = rectW * 0.42; // represents h
      const r = (rectW / (Math.PI * 2)) * 1.35;

      const rx = cx - rectW / 2;
      const ry = cy - rectH / 2;

      // Central Unrolled Rect (CSA = 2*pi*r*h)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.strokeRect(rx, ry, rectW, rectH);
      ctx.fillRect(rx, ry, rectW, rectH);

      drawLabel('Curved Surface Area (CSA)', cx, cy - 8);
      drawLabel('Width = 2πr, Height = h', cx, cy + 12, 'CSA = 2πrh');

      // Top circular lid
      const topCy = ry - r - 6;
      ctx.beginPath();
      ctx.arc(cx - rectW * 0.22, topCy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Top Circular Lid', cx - rectW * 0.22, topCy, 'Area = πr²');
      drawDashedFoldLine(cx - rectW * 0.22, ry, cx - rectW * 0.22, ry - 6);

      // Bottom circular base
      const botCy = ry + rectH + r + 6;
      ctx.beginPath();
      ctx.arc(cx + rectW * 0.22, botCy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Bottom Circular Base', cx + rectW * 0.22, botCy, 'Area = πr²');
      drawDashedFoldLine(cx + rectW * 0.22, ry + rectH, cx + rectW * 0.22, ry + rectH + 6);
      break;
    }

    case 'cone': {
      const l = Math.min(width, height) * 0.38; // Slant height
      const r = l * 0.45;
      const angle = (Math.PI * 2 * r) / l; // theta = 2*pi*r / l

      // Draw circular sector
      ctx.save();
      ctx.translate(cx, cy - l * 0.35);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, l, Math.PI / 2 - angle / 2, Math.PI / 2 + angle / 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fill();
      ctx.stroke();

      drawLabel('Conical Curved Sector', 0, l * 0.55);
      drawLabel('Radius = l (Slant Height)', 0, l * 0.7, 'CSA = πrl');

      // Draw circular base below sector
      const baseCy = l + r + 10;
      ctx.beginPath();
      ctx.arc(0, baseCy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Base Circle', 0, baseCy, 'Area = πr²');
      drawDashedFoldLine(0, l, 0, l + 10);
      ctx.restore();
      break;
    }

    case 'square-pyramid': {
      const a = Math.min(width, height) * 0.26;
      const l = a * 0.95 * foldCos; // slant height of triangles

      // Center square base
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.strokeRect(cx - a / 2, cy - a / 2, a, a);
      ctx.fillRect(cx - a / 2, cy - a / 2, a, a);
      drawLabel('Square Base', cx, cy, 'a²');

      // 4 attached triangles
      const drawTri = (p1: [number, number], p2: [number, number], apex: [number, number], label: string) => {
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(apex[0], apex[1]);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.stroke();
        drawDashedFoldLine(p1[0], p1[1], p2[0], p2[1]);
      };

      // Top triangle
      drawTri([cx - a / 2, cy - a / 2], [cx + a / 2, cy - a / 2], [cx, cy - a / 2 - l], 'Face 1');
      // Bottom triangle
      drawTri([cx - a / 2, cy + a / 2], [cx + a / 2, cy + a / 2], [cx, cy + a / 2 + l], 'Face 2');
      // Left triangle
      drawTri([cx - a / 2, cy - a / 2], [cx - a / 2, cy + a / 2], [cx - a / 2 - l, cy], 'Face 3');
      // Right triangle
      drawTri([cx + a / 2, cy - a / 2], [cx + a / 2, cy + a / 2], [cx + a / 2 + l, cy], 'Face 4');
      break;
    }

    case 'tetrahedron': {
      const a = Math.min(width, height) * 0.32;
      const hTri = (Math.sqrt(3) / 2) * a;

      // Central triangle
      const p1: [number, number] = [cx, cy - (hTri * 2) / 3];
      const p2: [number, number] = [cx - a / 2, cy + hTri / 3];
      const p3: [number, number] = [cx + a / 2, cy + hTri / 3];

      ctx.beginPath();
      ctx.moveTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.lineTo(p3[0], p3[1]);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Base Triangle', cx, cy, '√3/4 a²');

      // 3 Outer triangles
      const drawFlap = (a1: [number, number], a2: [number, number], apex: [number, number]) => {
        ctx.beginPath();
        ctx.moveTo(a1[0], a1[1]);
        ctx.lineTo(a2[0], a2[1]);
        ctx.lineTo(apex[0], apex[1]);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();
        ctx.stroke();
        drawDashedFoldLine(a1[0], a1[1], a2[0], a2[1]);
      };

      drawFlap(p1, p2, [cx - a, cy - (hTri * 2) / 3]);
      drawFlap(p1, p3, [cx + a, cy - (hTri * 2) / 3]);
      drawFlap(p2, p3, [cx, cy + (hTri * 4) / 3]);
      break;
    }

    case 'cone-on-cylinder': {
      // Combination Solid Net
      const rw = Math.min(width, height) * 0.48;
      const rh = rw * 0.35;
      const r = (rw / (Math.PI * 2)) * 1.3;
      const l = r * 2.2;
      const coneAngle = (Math.PI * 2 * r) / l;

      const rx = cx - rw / 2;
      const ry = cy - rh / 2;

      // Cylinder body (CSA = 2*pi*r*h_cyl)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.fillRect(rx, ry, rw, rh);
      drawLabel('Cylinder Curved Wall (2πr · h_cyl)', cx, cy);

      // Bottom circular floor (TSA includes this!)
      const botCy = ry + rh + r + 8;
      ctx.beginPath();
      ctx.arc(cx, botCy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Floor Circular Base', cx, botCy, 'Included: πr²');

      // Top conical sector
      ctx.save();
      ctx.translate(cx, ry - 10);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, l, Math.PI / 2 - coneAngle / 2, Math.PI / 2 + coneAngle / 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(244, 114, 182, 0.25)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Cone Roof (πrl)', 0, l * 0.6);
      ctx.restore();

      // Key Pedagogical Note: Internal joint face crossed out
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.fillText('⚠ Internal circular joint is covered → NOT counted in TSA!', cx, ry - 4);
      ctx.restore();
      break;
    }

    case 'octahedron': {
      const s = Math.min(width, height) * 0.14;
      const hTri = s * (Math.sqrt(3) / 2);
      const startX = cx - 2 * s;
      const startY = cy - hTri / 2;

      // Row of 4 upward-pointing triangles and 4 downward-pointing triangles
      for (let i = 0; i < 4; i++) {
        const x0 = startX + i * s;
        // Upward triangle
        ctx.beginPath();
        ctx.moveTo(x0, startY + hTri);
        ctx.lineTo(x0 + s / 2, startY);
        ctx.lineTo(x0 + s, startY + hTri);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.stroke();
        drawLabel(`F${i + 1}`, x0 + s / 2, startY + hTri * 0.65, '√3/4 a²');

        // Downward triangle attached to top
        ctx.beginPath();
        ctx.moveTo(x0 + s / 2, startY);
        ctx.lineTo(x0 + s, startY + hTri);
        ctx.lineTo(x0 + s * 1.5, startY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.fill();
        ctx.stroke();
        drawLabel(`F${i + 5}`, x0 + s, startY + hTri * 0.35, '√3/4 a²');

        drawDashedFoldLine(x0 + s / 2, startY, x0 + s, startY + hTri);
      }
      break;
    }

    case 'dodecahedron': {
      const r = Math.min(width, height) * 0.09;
      // Draw two clusters of 6 pentagons
      const drawPentagon = (px: number, py: number, rad: number, rot: number, label: string) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const ang = rot + (i * Math.PI * 2) / 5;
          const x = px + Math.cos(ang) * rad;
          const y = py + Math.sin(ang) * rad;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(217, 119, 6, 0.22)';
        ctx.fill();
        ctx.stroke();
        drawLabel(label, px, py, 'Pentagon');
      };

      // Cluster 1 (Left)
      const c1X = cx - r * 2.3;
      const c1Y = cy;
      drawPentagon(c1X, c1Y, r, -Math.PI / 2, 'Base');
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        const petalDist = r * 1.8 * foldCos;
        const px = c1X + Math.cos(ang) * petalDist;
        const py = c1Y + Math.sin(ang) * petalDist;
        drawPentagon(px, py, r * 0.9, ang, `P${i + 1}`);
      }

      // Cluster 2 (Right)
      const c2X = cx + r * 2.3;
      const c2Y = cy;
      drawPentagon(c2X, c2Y, r, Math.PI / 2, 'Top');
      for (let i = 0; i < 5; i++) {
        const ang = Math.PI / 2 + (i * Math.PI * 2) / 5;
        const petalDist = r * 1.8 * foldCos;
        const px = c2X + Math.cos(ang) * petalDist;
        const py = c2Y + Math.sin(ang) * petalDist;
        drawPentagon(px, py, r * 0.9, ang, `P${i + 6}`);
      }
      break;
    }

    case 'icosahedron': {
      const s = Math.min(width, height) * 0.11;
      const hTri = s * (Math.sqrt(3) / 2);
      const startX = cx - 2.5 * s;
      const midY = cy;

      // Central strip of 10 alternating triangles
      for (let i = 0; i < 10; i++) {
        const x = startX + (i * s) / 2;
        const isUp = i % 2 === 0;
        ctx.beginPath();
        if (isUp) {
          ctx.moveTo(x, midY + hTri / 2);
          ctx.lineTo(x + s / 2, midY - hTri / 2);
          ctx.lineTo(x + s, midY + hTri / 2);
        } else {
          ctx.moveTo(x, midY - hTri / 2);
          ctx.lineTo(x + s / 2, midY + hTri / 2);
          ctx.lineTo(x + s, midY - hTri / 2);
        }
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? 'rgba(248, 250, 252, 0.25)' : 'rgba(226, 232, 240, 0.18)';
        ctx.fill();
        ctx.stroke();
        drawLabel(`${i + 1}`, x + s / 2, midY, 'a²√3/4');
      }
      break;
    }

    case 'pawn-sphere': {
      const r = Math.min(width, height) * 0.15;
      // Upper sphere projection (4 circles representing 4πr²)
      ctx.beginPath();
      ctx.arc(cx, cy - r * 1.1, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.25)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Sphere Ball', cx, cy - r * 1.1, '4πr²');

      // Pedestal lateral unroll (rectangle)
      const rectW = 2 * Math.PI * (r * 0.6);
      const rectH = r * 1.2;
      ctx.strokeRect(cx - rectW / 2, cy + r * 0.2, rectW, rectH);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.15)';
      ctx.fillRect(cx - rectW / 2, cy + r * 0.2, rectW, rectH);
      drawLabel('Flared Pedestal Lateral', cx, cy + r * 0.8, '2πr·h');

      // Base circle
      ctx.beginPath();
      ctx.arc(cx, cy + r * 1.9, r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.3)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Plinth Base', cx, cy + r * 1.9, 'πr_base²');
      break;
    }

    case 'faceted-gem': {
      const r = Math.min(width, height) * 0.18;
      // Octagonal Table facet in center
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8;
        const x = cx + Math.cos(ang) * (r * 0.55);
        const y = cy + Math.sin(ang) * (r * 0.55);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(220, 38, 38, 0.35)';
      ctx.fill();
      ctx.stroke();
      drawLabel('Table', cx, cy, 'Top Facet');

      // 8 radiating crown facets
      for (let i = 0; i < 8; i++) {
        const a1 = (i * Math.PI * 2) / 8;
        const a2 = ((i + 1) * Math.PI * 2) / 8;
        const p1x = cx + Math.cos(a1) * (r * 0.55);
        const p1y = cy + Math.sin(a1) * (r * 0.55);
        const p2x = cx + Math.cos(a2) * (r * 0.55);
        const p2y = cy + Math.sin(a2) * (r * 0.55);
        const tipX = cx + Math.cos((a1 + a2) / 2) * r * foldCos;
        const tipY = cy + Math.sin((a1 + a2) / 2) * r * foldCos;

        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(p2x, p2y);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(185, 28, 28, 0.2)';
        ctx.fill();
        ctx.stroke();
        drawDashedFoldLine(p1x, p1y, p2x, p2y);
      }
      break;
    }

    default: {
      // Generic Net Fallback (Spherical gores or cylinder net)
      const w = Math.min(width, height) * 0.4;
      ctx.strokeRect(cx - w / 2, cy - w / 2, w, w);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(cx - w / 2, cy - w / 2, w, w);
      drawLabel(type.toUpperCase() + ' NET', cx, cy, 'TSA Net Diagram');
      break;
    }
  }

  // Header Title & Formula banner
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(SOLIDS_NETS_CATALOG[type]?.title || 'Net Diagram', 20, 16);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(SOLIDS_NETS_CATALOG[type]?.formulaTSA || '', 20, 36);

  // Legend
  ctx.textAlign = 'right';
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('--- Fold crease (Dashed)', width - 20, 20);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Solid outline = Cut boundary', width - 20, 36);
  ctx.restore();

  ctx.restore();
}

/**
 * Generate a PNG dataURL of the 2D Net Diagram for stamping onto the whiteboard canvas
 */
export function generateNetImageDataUrl(
  type: SolidType,
  width: number = 800,
  height: number = 600,
  accentColor: string = '#38bdf8'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  drawSolidNetDiagram(ctx, type, width, height, 0, accentColor);
  return canvas.toDataURL('image/png');
}
