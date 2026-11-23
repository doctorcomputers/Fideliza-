import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  CellCoord,
  WORD_SEARCH_EDITIONS,
  WordDirection,
  coordKey,
  generateWordSearchBoard,
  getLineCells,
} from '../utils/wordSearchGenerator';

interface ApymecoWordSearchProps {
  claimedEditions: string[];
  onClaimBonusStamp: (editionId: string, editionTitle: string) => void;
  onOpenMerchantDetail: (merchantId: string) => void;
}

const FOUND_CELL_STYLES = [
  'bg-[#0A3663] text-white border-[#0A3663]',
  'bg-[#E06D53] text-white border-[#E06D53]',
  'bg-[#0284C7] text-white border-[#0284C7]',
  'bg-[#D97706] text-white border-[#D97706]',
  'bg-[#0F766E] text-white border-[#0F766E]',
  'bg-[#7C2D12] text-white border-[#7C2D12]',
];

const DIRECTION_LABEL: Record<WordDirection, string> = {
  HORIZONTAL: 'Horizontal (izquierda a derecha)',
  VERTICAL: 'Vertical (arriba hacia abajo)',
  DIAGONAL: 'Diagonal (arriba-izquierda a abajo-derecha)',
};

function playChime(type: 'found' | 'victory' | 'select', muted: boolean) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, startOffset: number, duration: number, gainPeak: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(gainPeak, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.02);
    };

    if (type === 'select') {
      playTone(520, 0, 0.07, 0.04);
    } else if (type === 'found') {
      playTone(523.25, 0, 0.14, 0.08);
      playTone(659.25, 0.09, 0.18, 0.09);
    } else {
      playTone(523.25, 0, 0.16, 0.08);
      playTone(659.25, 0.11, 0.16, 0.08);
      playTone(783.99, 0.22, 0.24, 0.09);
      playTone(1046.5, 0.34, 0.34, 0.08);
    }
  } catch {
    // Audio playback is optional enhancement
  }
}

export const ApymecoWordSearch: React.FC<ApymecoWordSearchProps> = ({
  claimedEditions,
  onClaimBonusStamp,
  onOpenMerchantDetail,
}) => {
  const [editionIndex, setEditionIndex] = useState(0);
  const [allowDiagonals, setAllowDiagonals] = useState(false);
  const [boardSeed, setBoardSeed] = useState(2026);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [soundMuted, setSoundMuted] = useState(false);

  // Selection state (supports both pointer drag and accessible 2-click start -> end)
  const [dragStart, setDragStart] = useState<CellCoord | null>(null);
  const [dragCurrent, setDragCurrent] = useState<CellCoord | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [clickAnchor, setClickAnchor] = useState<CellCoord | null>(null);
  const [lastFoundMerchant, setLastFoundMerchant] = useState<{
    merchantId: string;
    merchantName: string;
    hintClue: string;
  } | null>(null);

  // 4-Tier Progressive Hint state
  const [hintTargetWord, setHintTargetWord] = useState<string | null>(null);
  const [hintTier, setHintTier] = useState<number>(0);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const edition = WORD_SEARCH_EDITIONS[editionIndex];
  const board = useMemo(
    () => generateWordSearchBoard(edition, allowDiagonals, boardSeed),
    [edition, allowDiagonals, boardSeed]
  );

  const isCompleted = foundWords.length === board.placedWords.length;
  const isRewardClaimed = claimedEditions.includes(edition.id);

  // Map every permanently found cell to its word color index
  const foundCellColorMap = useMemo(() => {
    const map = new Map<string, number>();
    board.placedWords.forEach((pw) => {
      if (foundWords.includes(pw.word)) {
        pw.cells.forEach((cell) => {
          map.set(coordKey(cell), pw.colorIndex);
        });
      }
    });
    return map;
  }, [board.placedWords, foundWords]);

  // Active preview line cells while dragging or after first click
  const activeSelectionKeys = useMemo(() => {
    const set = new Set<string>();
    if (isPointerDragging && dragStart && dragCurrent) {
      getLineCells(dragStart, dragCurrent).forEach((c) => set.add(coordKey(c)));
    } else if (clickAnchor) {
      set.add(coordKey(clickAnchor));
    }
    return set;
  }, [isPointerDragging, dragStart, dragCurrent, clickAnchor]);

  // Active hint highlighted first cell (Tier 4)
  const hintedStartCellKey = useMemo(() => {
    if (!hintTargetWord || hintTier < 4) return null;
    const target = board.placedWords.find((w) => w.word === hintTargetWord);
    if (!target || foundWords.includes(target.word)) return null;
    return coordKey(target.cells[0]);
  }, [board.placedWords, foundWords, hintTargetWord, hintTier]);

  const resetPuzzleState = useCallback((nextSeed?: number) => {
    setFoundWords([]);
    setDragStart(null);
    setDragCurrent(null);
    setIsPointerDragging(false);
    setClickAnchor(null);
    setHintTargetWord(null);
    setHintTier(0);
    setLastFoundMerchant(null);
    if (typeof nextSeed === 'number') {
      setBoardSeed(nextSeed);
    }
  }, []);

  const handleChangeEdition = (idx: number) => {
    setEditionIndex(idx);
    resetPuzzleState(2026 + idx * 131);
  };

  const handleToggleDifficulty = (diagonals: boolean) => {
    setAllowDiagonals(diagonals);
    resetPuzzleState(boardSeed + 17);
  };

  const evaluateSelection = useCallback(
    (start: CellCoord, end: CellCoord): boolean => {
      const cells = getLineCells(start, end);
      if (cells.length < 2) return false;

      const forwardText = cells.map((c) => board.grid[c.row][c.col]).join('');
      const reverseText = [...forwardText].reverse().join('');

      const matched = board.placedWords.find(
        (pw) =>
          !foundWords.includes(pw.word) &&
          (pw.word === forwardText || pw.word === reverseText)
      );

      if (!matched) return false;

      const nextFound = [...foundWords, matched.word];
      setFoundWords(nextFound);
      setLastFoundMerchant({
        merchantId: matched.merchantId,
        merchantName: matched.merchantName,
        hintClue: matched.hintClue,
      });

      if (hintTargetWord === matched.word) {
        setHintTargetWord(null);
        setHintTier(0);
      }

      if (nextFound.length === board.placedWords.length) {
        playChime('victory', soundMuted);
      } else {
        playChime('found', soundMuted);
      }
      return true;
    },
    [board.grid, board.placedWords, foundWords, hintTargetWord, soundMuted]
  );

  const handleCellPointerDown = (cell: CellCoord) => {
    setDragStart(cell);
    setDragCurrent(cell);
    setIsPointerDragging(true);
  };

  const handleCellPointerEnter = (cell: CellCoord) => {
    if (!isPointerDragging) return;
    setDragCurrent(cell);
  };

  const handleGridPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDragging || e.pointerType === 'mouse') return;
    // Touch slide support: find the grid cell under the user's finger
    const targetEl = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const cellEl = targetEl?.closest('[data-cell-row]') as HTMLElement | null;
    if (!cellEl) return;
    const row = Number(cellEl.dataset.cellRow);
    const col = Number(cellEl.dataset.cellCol);
    if (!Number.isNaN(row) && !Number.isNaN(col)) {
      setDragCurrent((prev) =>
        prev && prev.row === row && prev.col === col ? prev : { row, col }
      );
    }
  };

  const handlePointerRelease = () => {
    if (!isPointerDragging || !dragStart || !dragCurrent) {
      setIsPointerDragging(false);
      return;
    }

    const isSingleTap =
      dragStart.row === dragCurrent.row && dragStart.col === dragCurrent.col;

    if (isSingleTap) {
      // Accessible 2-click mode: first tap anchors, second tap completes straight line
      if (!clickAnchor) {
        setClickAnchor(dragStart);
        playChime('select', soundMuted);
      } else if (
        clickAnchor.row === dragStart.row &&
        clickAnchor.col === dragStart.col
      ) {
        setClickAnchor(null);
      } else {
        const matched = evaluateSelection(clickAnchor, dragStart);
        setClickAnchor(matched ? null : dragStart);
        if (!matched) playChime('select', soundMuted);
      }
    } else {
      evaluateSelection(dragStart, dragCurrent);
      setClickAnchor(null);
    }

    setIsPointerDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  // 4-Tier Progressive Hint Handler
  const handleRequestHint = () => {
    const remaining = board.placedWords.filter(
      (pw) => !foundWords.includes(pw.word)
    );
    if (remaining.length === 0) return;

    const currentTargetStillPending = remaining.find(
      (pw) => pw.word === hintTargetWord
    );

    if (!currentTargetStillPending) {
      setHintTargetWord(remaining[0].word);
      setHintTier(1);
      return;
    }

    setHintTier((prev) => Math.min(4, prev + 1));
  };

  const activeHintWord = useMemo(() => {
    if (!hintTargetWord) return null;
    const match = board.placedWords.find((w) => w.word === hintTargetWord);
    if (!match || foundWords.includes(match.word)) return null;
    return match;
  }, [board.placedWords, foundWords, hintTargetWord]);

  const handleNextEdition = () => {
    const nextIdx = (editionIndex + 1) % WORD_SEARCH_EDITIONS.length;
    handleChangeEdition(nextIdx);
  };

  return (
    <section
      id="sopa-letras"
      aria-labelledby="sopa-letras-heading"
      className="rounded-2xl border border-slate-900/10 bg-white shadow-civic-l2"
    >
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-xs font-medium text-[#A13E28]">
            Minijuego Ciudadano · Comercios Asociados APYMECO
          </p>
          <h2
            id="sopa-letras-heading"
            className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
          >
            Sopa de Letras APYMECO
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Encuentra los 6 comercios de Torrevieja en el tablero y gana{' '}
            <strong className="font-semibold text-[#0A3663]">+1 sello bonus</strong>{' '}
            para tu pasaporte del iPhone 18 Pro.
          </p>
        </div>

        {/* Utility Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-lg bg-slate-100 p-1"
            role="group"
            aria-label="Modo de dificultad de la sopa de letras"
          >
            <button
              type="button"
              onClick={() => handleToggleDifficulty(false)}
              className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                !allowDiagonals
                  ? 'bg-white text-[#0A3663] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clásico
            </button>
            <button
              type="button"
              onClick={() => handleToggleDifficulty(true)}
              className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                allowDiagonals
                  ? 'bg-white text-[#0A3663] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Con diagonales
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSoundMuted((prev) => !prev)}
            aria-label={soundMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0A3663] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
          >
            {soundMuted ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => resetPuzzleState(boardSeed + 53)}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0A3663] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Mezclar tablero
          </button>
        </div>
      </div>

      {/* Edition Selector Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#FAF8FF] px-6 py-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="tablist"
          aria-label="Ediciones de la sopa de letras APYMECO"
        >
          {WORD_SEARCH_EDITIONS.map((ed, idx) => {
            const active = idx === editionIndex;
            const claimed = claimedEditions.includes(ed.id);
            return (
              <button
                key={ed.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleChangeEdition(idx)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
                  active
                    ? 'bg-[#0A3663] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ed.title}
                {claimed ? ' ✓' : ''}
              </button>
            );
          })}
        </div>

        <span className="font-mono text-xs font-semibold text-[#0A3663] tabular-nums">
          Progreso: {foundWords.length}/{board.placedWords.length} comercios
        </span>
      </div>

      {/* Main Split: Left 10x10 Grid | Right Word Checklist + Hints + Reward */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Interactive Grid */}
        <div className="border-b border-slate-200 p-4 sm:p-6 lg:col-span-7 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>
              Arrastra sobre las letras o haz clic en la <strong>primera</strong> y{' '}
              <strong>última</strong> letra.
            </span>
            {clickAnchor && (
              <span className="font-semibold text-[#0A3663]">
                Inicio marcado (F{clickAnchor.row + 1}·C{clickAnchor.col + 1}) — elige el final
              </span>
            )}
          </div>

          <div
            ref={gridRef}
            onPointerUp={handlePointerRelease}
            onPointerLeave={() => {
              if (isPointerDragging) handlePointerRelease();
            }}
            onPointerMove={handleGridPointerMove}
            className="mx-auto grid max-w-[520px] grid-cols-10 gap-1 sm:gap-1.5 touch-none select-none rounded-xl border border-slate-200 bg-[#F8FAFC] p-2 sm:p-3"
            role="grid"
            aria-label={`Tablero de sopa de letras ${edition.title}`}
          >
            {board.grid.map((row, rIdx) =>
              row.map((letter, cIdx) => {
                const key = `${rIdx}-${cIdx}`;
                const foundColorIdx = foundCellColorMap.get(key);
                const isSelected = activeSelectionKeys.has(key);
                const isHintStart = hintedStartCellKey === key;

                let cellStyle =
                  'bg-white text-slate-900 border-slate-200 hover:border-[#0A3663]/50 hover:bg-sky-50/50';
                if (isSelected) {
                  cellStyle =
                    'bg-[#0EA5E9] text-white border-[#0284C7] scale-[1.03] shadow-xs';
                } else if (typeof foundColorIdx === 'number') {
                  cellStyle = FOUND_CELL_STYLES[foundColorIdx];
                } else if (isHintStart) {
                  cellStyle =
                    'bg-amber-100 text-[#0A3663] border-[#F59E0B] ring-2 ring-[#F59E0B]/60';
                }

                return (
                  <button
                    key={key}
                    type="button"
                    data-cell-row={rIdx}
                    data-cell-col={cIdx}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleCellPointerDown({ row: rIdx, col: cIdx });
                    }}
                    onPointerEnter={() =>
                      handleCellPointerEnter({ row: rIdx, col: cIdx })
                    }
                    aria-label={`Fila ${rIdx + 1}, Columna ${cIdx + 1}, letra ${letter}`}
                    className={`flex aspect-square min-h-9 sm:min-h-11 w-full items-center justify-center rounded-md border font-display text-base sm:text-lg font-bold transition-transform duration-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0EA5E9] ${cellStyle}`}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>

          {/* Last Discovered Merchant Feedback Strip */}
          {lastFoundMerchant && !isCompleted && (
            <div className="mx-auto mt-4 flex max-w-[520px] flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-950">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>
                  ¡Encontrado <strong>{lastFoundMerchant.merchantName}</strong>!{' '}
                  {lastFoundMerchant.hintClue}.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenMerchantDetail(lastFoundMerchant.merchantId)}
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#0A3663] hover:underline"
              >
                Ver oferta
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Merchant Checklist, 4-Tier Hints & Passport Reward */}
        <div className="flex flex-col justify-between p-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Comercios escondidos ({foundWords.length}/{board.placedWords.length})
              </h3>
              {!isCompleted && (
                <button
                  type="button"
                  onClick={handleRequestHint}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/50 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#92400E] transition-colors hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
                >
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeHintWord && hintTier < 4
                    ? `Más pista (${hintTier}/4)`
                    : 'Pedir pista'}
                </button>
              )}
            </div>

            {/* 4-Tier Progressive Hint Panel */}
            {activeHintWord && !isCompleted && (
              <div className="mt-3 rounded-xl border border-[#F59E0B]/40 bg-amber-50/70 p-3.5 text-xs text-slate-800">
                <p className="font-semibold text-[#92400E]">
                  Pista progresiva ({hintTier}/4) para «{activeHintWord.word}»
                </p>
                <ul className="mt-1.5 space-y-1 text-slate-700">
                  {hintTier >= 1 && (
                    <li>
                      1. Empieza por la letra <strong>{activeHintWord.word[0]}</strong> ·{' '}
                      {activeHintWord.hintClue}.
                    </li>
                  )}
                  {hintTier >= 2 && (
                    <li>
                      2. Dirección: <strong>{DIRECTION_LABEL[activeHintWord.direction]}</strong>.
                    </li>
                  )}
                  {hintTier >= 3 && (
                    <li className="tabular-nums">
                      3. Ubicación: <strong>Fila {activeHintWord.cells[0].row + 1}</strong>,{' '}
                      <strong>Columna {activeHintWord.cells[0].col + 1}</strong>.
                    </li>
                  )}
                  {hintTier >= 4 && (
                    <li>
                      4. Primera letra resaltada en dorado directamente en el tablero.
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Word List */}
            <ul className="mt-4 space-y-2">
              {board.placedWords.map((pw) => {
                const isFound = foundWords.includes(pw.word);
                return (
                  <li
                    key={pw.word}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors ${
                      isFound
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-sm font-bold tracking-wider ${
                            isFound
                              ? 'text-emerald-800 line-through'
                              : 'text-[#0A3663]'
                          }`}
                        >
                          {pw.word}
                        </span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="truncate text-xs font-medium text-slate-700">
                          {pw.merchantName}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {pw.hintClue}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenMerchantDetail(pw.merchantId)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#0A3663] hover:bg-slate-100"
                    >
                      Ficha
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Victory Celebration & Passport Bonus Claim */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            {isCompleted ? (
              <div className="rounded-xl border border-[#F59E0B] bg-amber-50/80 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0A3663]">
                  <Trophy className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
                  <span>¡Sopa de letras completada!</span>
                </div>
                <p className="mt-1 text-xs text-slate-700">
                  Has descubierto los 6 comercios de {edition.title}.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {!isRewardClaimed ? (
                    <button
                      type="button"
                      onClick={() => onClaimBonusStamp(edition.id, edition.title)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#E06D53] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#A13E28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
                    >
                      Reclamar +1 Sello Bonus (iPhone 18 Pro)
                    </button>
                  ) : (
                    <span className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-100 px-3 text-xs font-semibold text-emerald-900">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Sello bonus ya acreditado
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleNextEdition}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#0A3663] transition-colors hover:bg-slate-50"
                  >
                    Siguiente edición
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                <span>Recompensa al completar el tablero:</span>
                <span className="font-semibold text-[#A13E28]">
                  +1 Sello para el iPhone 18 Pro
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
