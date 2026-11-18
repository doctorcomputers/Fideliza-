import React, { useMemo } from 'react';

interface QrMatrixSvgProps {
  tokenHash: string;
  size?: number;
}

/**
 * Generates a deterministic 25x25 QR-style SVG matrix from a cryptographic token string.
 * Includes authentic 7x7 corner finder patterns, timing patterns, and an alignment box.
 */
export const QrMatrixSvg: React.FC<QrMatrixSvgProps> = ({ tokenHash, size = 200 }) => {
  const modules = useMemo(() => {
    const gridSize = 25;
    const grid: boolean[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => false)
    );

    const isFinderArea = (r: number, c: number) => {
      const topLeft = r < 8 && c < 8;
      const topRight = r < 8 && c >= gridSize - 8;
      const bottomLeft = r >= gridSize - 8 && c < 8;
      return topLeft || topRight || bottomLeft;
    };

    const paintFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startR + r][startC + c] = isOuter || isInner;
        }
      }
    };

    paintFinder(0, 0);
    paintFinder(0, gridSize - 7);
    paintFinder(gridSize - 7, 0);

    // Alignment pattern near bottom-right (16, 16 to 20, 20)
    const isAlignmentArea = (r: number, c: number) => r >= 16 && r <= 20 && c >= 16 && c <= 20;
    for (let r = 16; r <= 20; r++) {
      for (let c = 16; c <= 20; c++) {
        const dr = Math.abs(r - 18);
        const dc = Math.abs(c - 18);
        grid[r][c] = dr === 2 || dc === 2 || (dr === 0 && dc === 0);
      }
    }

    // Timing tracks
    for (let i = 8; i < gridSize - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Seed PRNG from tokenHash
    let seed = 2166136261;
    for (let i = 0; i < tokenHash.length; i++) {
      seed ^= tokenHash.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (isFinderArea(r, c) || isAlignmentArea(r, c) || r === 6 || c === 6) {
          continue;
        }
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        grid[r][c] = (seed >>> 0) % 100 < 52;
      }
    }

    return grid;
  }, [tokenHash]);

  const gridSize = 25;
  const quietZone = 2;
  const viewSize = gridSize + quietZone * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      role="img"
      aria-label={`Código QR de verificación municipal ${tokenHash}`}
      className="block rounded-md bg-white"
    >
      <rect width={viewSize} height={viewSize} fill="#FFFFFF" />
      {modules.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c + quietZone}
              y={r + quietZone}
              width={1}
              height={1}
              fill="#002042"
              rx={0.12}
            />
          ) : null
        )
      )}
    </svg>
  );
};
