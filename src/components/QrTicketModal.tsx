import React, { useEffect, useState } from 'react';
import { RefreshCw, ScanLine, X } from 'lucide-react';
import { CitizenSegment, Merchant } from '../types/commerce';
import { QrMatrixSvg } from './QrMatrixSvg';

interface QrTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: CitizenSegment;
  merchants: Merchant[];
  initialMerchantId?: string;
  onSimulatePosScan: (merchant: Merchant) => void;
}

function generateHash(seedSuffix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  let n = Date.now() + seedSuffix.length * 7919;
  for (let i = 0; i < 4; i++) {
    n = (n * 1664525 + 1013904223) >>> 0;
    part1 += chars[n % chars.length];
  }
  for (let i = 0; i < 4; i++) {
    n = (n * 1664525 + 1013904223) >>> 0;
    part2 += chars[n % chars.length];
  }
  return `TRV-${part1}-${part2}`;
}

export const QrTicketModal: React.FC<QrTicketModalProps> = ({
  isOpen,
  onClose,
  segment,
  merchants,
  initialMerchantId,
  onSimulatePosScan,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [tokenHash, setTokenHash] = useState(() => generateHash('init'));
  const [selectedPosMerchantId, setSelectedPosMerchantId] = useState<string>(
    initialMerchantId || merchants[0]?.id || ''
  );
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialMerchantId) {
      setSelectedPosMerchantId(initialMerchantId);
    }
  }, [initialMerchantId]);

  useEffect(() => {
    if (!isOpen) return;
    setScanSuccessMsg(null);
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTokenHash(generateHash(String(Math.random())));
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRenew = () => {
    setTokenHash(generateHash(selectedPosMerchantId));
    setSecondsLeft(60);
    setScanSuccessMsg(null);
  };

  const handlePosSimulate = () => {
    const merchant = merchants.find((m) => m.id === selectedPosMerchantId);
    if (!merchant) return;
    onSimulatePosScan(merchant);
    setScanSuccessMsg(
      `Lectura validada en ${merchant.name}. Sello añadido al pasaporte.`
    );
    setTokenHash(generateHash(merchant.id));
    setSecondsLeft(60);
  };

  const formattedSeconds = `00:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#FAF8FF] shadow-civic-l3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Civic Header */}
        <div className="flex items-center justify-between bg-[#0A3663] px-6 py-4 text-white">
          <div>
            <p className="text-xs font-medium text-sky-200">
              Torrevieja Conecta · Token de Caja
            </p>
            <h2 id="qr-modal-title" className="text-base font-semibold">
              Tarjeta QR Ciudadana
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar tarjeta QR"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Perforated Ticket Panel */}
        <div className="p-6">
          <div className="relative rounded-2xl border border-slate-200 bg-white p-6 text-center">
            {/* Micro-perforation side notches */}
            <span
              aria-hidden="true"
              className="absolute -left-3 top-[66%] h-6 w-6 rounded-full border-r border-slate-200 bg-[#FAF8FF]"
            />
            <span
              aria-hidden="true"
              className="absolute -right-3 top-[66%] h-6 w-6 rounded-full border-l border-slate-200 bg-[#FAF8FF]"
            />

            <p className="text-xs font-medium text-slate-500">
              Perfil activo: <strong className="text-slate-800">{segment}</strong>
            </p>

            {/* Centered 200px Dynamic SVG QR */}
            <div className="mx-auto mt-4 flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-white p-3">
              <QrMatrixSvg tokenHash={tokenHash} size={200} />
            </div>

            {/* Perforation Divider */}
            <div className="my-5 border-t border-dashed border-slate-300" />

            {/* Countdown Timer & Cryptographic Hash */}
            <div className="flex items-center justify-between gap-2 text-left">
              <div>
                <p className="text-[11px] font-medium text-slate-500">
                  Hash de verificación
                </p>
                <p className="font-mono text-xs font-semibold text-[#002042] tabular-nums">
                  {tokenHash}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-slate-500">
                  Validez temporal
                </p>
                <p
                  className={`font-mono text-sm font-semibold tabular-nums ${
                    secondsLeft <= 15 ? 'text-[#A13E28]' : 'text-[#0A3663]'
                  }`}
                >
                  {formattedSeconds}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRenew}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Renovar código QR ahora
            </button>
          </div>

          {/* Interactive POS Scan Simulator */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <label
              htmlFor="pos-merchant-select"
              className="block text-xs font-semibold text-slate-800"
            >
              Simular lectura en TPV de comercio adherido
            </label>
            <div className="mt-2 flex gap-2">
              <select
                id="pos-merchant-select"
                value={selectedPosMerchantId}
                onChange={(e) => setSelectedPosMerchantId(e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#0A3663] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.neighborhood})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handlePosSimulate}
                className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-[#E06D53] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#A13E28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
              >
                <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                Validar TPV
              </button>
            </div>

            {scanSuccessMsg && (
              <p className="mt-2.5 text-xs font-medium text-emerald-800">
                {scanSuccessMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
