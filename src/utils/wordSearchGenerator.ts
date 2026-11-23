export type WordDirection = 'HORIZONTAL' | 'VERTICAL' | 'DIAGONAL';

export interface WordSearchTarget {
  word: string;
  merchantId: string;
  merchantName: string;
  hintClue: string;
}

export interface WordSearchEdition {
  id: string;
  title: string;
  subtitle: string;
  targets: WordSearchTarget[];
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface PlacedWord extends WordSearchTarget {
  cells: CellCoord[];
  direction: WordDirection;
  colorIndex: number;
}

export interface WordSearchBoard {
  size: number;
  grid: string[][];
  placedWords: PlacedWord[];
}

export const WORD_SEARCH_EDITIONS: WordSearchEdition[] = [
  {
    id: 'ramon-gallud',
    title: 'Edición 1: Eje Ramón Gallud',
    subtitle: 'Comercios emblemáticos del centro comercial de Torrevieja',
    targets: [
      {
        word: 'CHANTAL',
        merchantId: 'optica-chantal',
        merchantName: 'Óptica Chantal',
        hintClue: 'Óptica en Calle Ramón Gallud, 62',
      },
      {
        word: 'RIERA',
        merchantId: 'perfumeria-riera',
        merchantName: 'Perfumería Riera',
        hintClue: 'Perfumería tradicional en Ramón Gallud, 66',
      },
      {
        word: 'CARMINA',
        merchantId: 'floristeria-carmina',
        merchantName: 'Floristería Carmina',
        hintClue: 'Arte floral en Calle Ramón Gallud, 40',
      },
      {
        word: 'TRINI',
        merchantId: 'libreria-papeleria-trini',
        merchantName: 'Librería Papelería Trini',
        hintClue: 'Papelería y libros en Ramón Gallud, 128',
      },
      {
        word: 'ANDRES',
        merchantId: 'andres-gourmet-seleccion',
        merchantName: 'Andrés Gourmet Selección',
        hintClue: 'Productos gourmet en Ramón Gallud, 62',
      },
      {
        word: 'CALZADOS',
        merchantId: 'calzados-toni',
        merchantName: 'Calzados Toñi',
        hintClue: 'Zapatería de confianza en Ramón Gallud, 50',
      },
    ],
  },
  {
    id: 'costa-barrios',
    title: 'Edición 2: Costa y Barrios',
    subtitle: 'Tecnología, náutica y comercio de proximidad por distritos',
    targets: [
      {
        word: 'DOCTOR',
        merchantId: 'doctor-computers',
        merchantName: 'Doctor Computers',
        hintClue: 'Informática y soporte en Antonio Machado, 51',
      },
      {
        word: 'ODISEA',
        merchantId: 'odisea-diving',
        merchantName: 'Odisea Diving',
        hintClue: 'Centro de buceo en Playa del Cura',
      },
      {
        word: 'CONESA',
        merchantId: 'ferreteria-conesa',
        merchantName: 'Ferretería Conesa',
        hintClue: 'Ferretería y cerrajería en Calle Villa Madrid, 1',
      },
      {
        word: 'LORCA',
        merchantId: 'pescados-lorca',
        merchantName: 'Pescados Lorca',
        hintClue: 'Pescadería fresca en Calle Gavia, 13',
      },
      {
        word: 'FRAGATA',
        merchantId: 'farmacia-fragata-36',
        merchantName: 'Farmacia Fragata 36',
        hintClue: 'Atención farmacéutica en Calle Fragata, 36',
      },
      {
        word: 'NAUTICA',
        merchantId: 'nautica-martinez',
        merchantName: 'Náutica Martínez',
        hintClue: 'Equipamiento marino en Parque de las Naciones',
      },
    ],
  },
  {
    id: 'sabores-tradicion',
    title: 'Edición 3: Sabores y Tradición',
    subtitle: 'Obradores artesanales, salud natural y joyería local',
    targets: [
      {
        word: 'MONTECARLO',
        merchantId: 'joyeria-montecarlo',
        merchantName: 'Joyería Montecarlo',
        hintClue: 'Joyería y relojería en Fotógrafos Darblade, 21',
      },
      {
        word: 'HERNANDEZ',
        merchantId: 'panaderia-miguel-hernandez',
        merchantName: 'Panadería Miguel Hernández',
        hintClue: 'Pan artesanal en Calle Mayor, 23 (La Mata)',
      },
      {
        word: 'DULCE',
        merchantId: 'pasteleria-dulce-de-leche',
        merchantName: 'Pastelería Dulce de Leche',
        hintClue: 'Obrador de tartas en Caballero de Rodas, 106',
      },
      {
        word: 'ALOES',
        merchantId: 'herbolario-aloes',
        merchantName: "Herbolario Aloe's",
        hintClue: 'Fitoterapia y tés en Caballero de Rodas, 72',
      },
      {
        word: 'DOCTOR',
        merchantId: 'doctor-computers',
        merchantName: 'Doctor Computers',
        hintClue: 'Servicio técnico informático en Antonio Machado, 51',
      },
      {
        word: 'CHANTAL',
        merchantId: 'optica-chantal',
        merchantName: 'Óptica Chantal',
        hintClue: 'Centro óptico en Calle Ramón Gallud, 62',
      },
    ],
  },
];

const SPANISH_FILL_LETTERS = 'AAEIOUOSNRDLCTMPBGVFJQHZY';

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

interface DirectionVector {
  dr: number;
  dc: number;
  label: WordDirection;
}

const CLASSIC_VECTORS: DirectionVector[] = [
  { dr: 0, dc: 1, label: 'HORIZONTAL' },
  { dr: 1, dc: 0, label: 'VERTICAL' },
];

const CHALLENGE_VECTORS: DirectionVector[] = [
  { dr: 0, dc: 1, label: 'HORIZONTAL' },
  { dr: 1, dc: 0, label: 'VERTICAL' },
  { dr: 1, dc: 1, label: 'DIAGONAL' },
];

/**
 * Generates a guaranteed 10x10 Spanish word search board for the given APYMECO edition.
 */
export function generateWordSearchBoard(
  edition: WordSearchEdition,
  allowDiagonals: boolean,
  seed: number
): WordSearchBoard {
  const size = 10;
  const vectors = allowDiagonals ? CHALLENGE_VECTORS : CLASSIC_VECTORS;
  const sortedTargets = [...edition.targets].sort(
    (a, b) => b.word.length - a.word.length
  );

  for (let attempt = 0; attempt < 40; attempt++) {
    const rng = createRng(seed + attempt * 9973);
    const grid: (string | null)[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null)
    );
    const placed: PlacedWord[] = [];
    let allPlaced = true;

    for (let idx = 0; idx < sortedTargets.length; idx++) {
      const target = sortedTargets[idx];
      const word = target.word.toUpperCase();
      const candidates: Array<{
        row: number;
        col: number;
        vec: DirectionVector;
        overlapScore: number;
      }> = [];

      for (const vec of vectors) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            const endR = r + vec.dr * (word.length - 1);
            const endC = c + vec.dc * (word.length - 1);
            if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

            let fits = true;
            let overlapScore = 0;
            for (let k = 0; k < word.length; k++) {
              const cur = grid[r + vec.dr * k][c + vec.dc * k];
              if (cur !== null && cur !== word[k]) {
                fits = false;
                break;
              }
              if (cur === word[k]) overlapScore++;
            }

            if (fits) {
              candidates.push({ row: r, col: c, vec, overlapScore });
            }
          }
        }
      }

      if (candidates.length === 0) {
        allPlaced = false;
        break;
      }

      // Slightly prefer varied directions and gentle letter intersections
      candidates.sort((a, b) => {
        const aScore = a.overlapScore * 0.4 + rng();
        const bScore = b.overlapScore * 0.4 + rng();
        return bScore - aScore;
      });

      const chosen = candidates[0];
      const cells: CellCoord[] = [];
      for (let k = 0; k < word.length; k++) {
        const r = chosen.row + chosen.vec.dr * k;
        const c = chosen.col + chosen.vec.dc * k;
        grid[r][c] = word[k];
        cells.push({ row: r, col: c });
      }

      placed.push({
        ...target,
        word,
        cells,
        direction: chosen.vec.label,
        colorIndex: idx % 6,
      });
    }

    if (allPlaced) {
      const finalGrid: string[][] = grid.map((row) =>
        row.map((cell) => {
          if (cell !== null) return cell;
          const letterIdx = Math.floor(rng() * SPANISH_FILL_LETTERS.length);
          return SPANISH_FILL_LETTERS[letterIdx];
        })
      );

      // Return placedWords in original edition order
      const orderedPlaced = edition.targets
        .map((t, originalIdx) => {
          const found = placed.find((p) => p.word === t.word.toUpperCase());
          return found ? { ...found, colorIndex: originalIdx % 6 } : null;
        })
        .filter((p): p is PlacedWord => p !== null);

      return {
        size,
        grid: finalGrid,
        placedWords: orderedPlaced,
      };
    }
  }

  // Deterministic horizontal fallback (guaranteed fit since max word length <= 10)
  const fallbackGrid: string[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      const idx = (r * 7 + c * 3) % SPANISH_FILL_LETTERS.length;
      return SPANISH_FILL_LETTERS[idx];
    })
  );
  const fallbackPlaced: PlacedWord[] = edition.targets.map((target, idx) => {
    const word = target.word.toUpperCase();
    const row = idx;
    const cells: CellCoord[] = [];
    for (let c = 0; c < word.length; c++) {
      fallbackGrid[row][c] = word[c];
      cells.push({ row, col: c });
    }
    return {
      ...target,
      word,
      cells,
      direction: 'HORIZONTAL',
      colorIndex: idx % 6,
    };
  });

  return {
    size,
    grid: fallbackGrid,
    placedWords: fallbackPlaced,
  };
}

/**
 * Returns straight-line cells between start and end if aligned horizontally, vertically, or diagonally.
 */
export function getLineCells(start: CellCoord, end: CellCoord): CellCoord[] {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  if (dr === 0 && dc === 0) return [start];

  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  // Must be horizontal, vertical, or exact 45-degree diagonal
  if (dr !== 0 && dc !== 0 && absR !== absC) {
    return [start];
  }

  const steps = Math.max(absR, absC);
  const stepR = dr === 0 ? 0 : dr / absR;
  const stepC = dc === 0 ? 0 : dc / absC;

  const cells: CellCoord[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({
      row: start.row + stepR * i,
      col: start.col + stepC * i,
    });
  }
  return cells;
}

export function coordKey(c: CellCoord): string {
  return `${c.row}-${c.col}`;
}
