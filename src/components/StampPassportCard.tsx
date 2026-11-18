import React from 'react';
import { QrCode, Anchor, TicketCheck } from 'lucide-react';
import { ActiveVoucher, CitizenSegment, StampEntry } from '../types/commerce';

interface StampPassportCardProps {
  stamps: StampEntry[];
  vouchers: ActiveVoucher[];
  segment: CitizenSegment;
  onSegmentChange: (segment: CitizenSegment) => void;
  onOpenQrModal: () => void;
  onSelectVoucherMerchant: (merchantId: string) => void;
}

export const StampPassportCard: React.FC<StampPassportCardProps> = ({
  stamps,
  vouchers,
  segment,
  onSegmentChange,
  onOpenQrModal,
  onSelectVoucherMerchant,
}) => {
  const stampedCount = stamps.filter((s) => s.stamped).length;
  const totalSlots = stamps.length;
  const activeVouchers = vouchers.filter((v) => !v.used);
  const progressPct = Math.round((stampedCount / totalSlots) * 100);

  return (
    <aside
      id="pasaporte-digital"
      aria-label="Pasaporte Digital de Sellos y Vales"
      className="rounded-2xl border border-slate-900/10 bg-white p-6 shadow-civic-l2"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Pasaporte Ciudadano · Red Torrevieja
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Tarjeta de Sellos Cruzados
          </h2>
        </div>

        {/* Interactive Segment Switcher */}
        <div
          className="inline-flex rounded-lg bg-slate-100 p-0.5"
          role="group"
          aria-label="Perfil de pasaporte"
        >
          {(['Residente Frecuente', 'Visitante Estacional'] as CitizenSegment[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSegmentChange(opt)}
              className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
                segment === opt
                  ? 'bg-white text-[#0A3663] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt === 'Residente Frecuente' ? 'Residente' : 'Visitante'}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Line */}
      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-sm text-slate-700">
          <span className="font-semibold text-[#0A3663] tabular-nums">
            {stampedCount}/{totalSlots}
          </span>{' '}
          sellos acumulados
        </div>
        <span className="text-xs font-medium text-[#A13E28] tabular-nums">
          {stampedCount >= totalSlots
            ? 'Bono de 15,00 € desbloqueado'
            : `Faltan ${totalSlots - stampedCount} para bono de 15,00 €`}
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#E06D53] transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 4x2 Digital Stamp Grid (36px circular nodes) */}
      <div
        className="mt-5 grid grid-cols-4 gap-3 rounded-xl border border-slate-200/80 bg-[#FAF8FF] p-4"
        aria-label="Cuadrícula de 8 sellos digitales"
      >
        {stamps.map((slot) => (
          <div
            key={slot.slotIndex}
            className="flex flex-col items-center gap-1.5 text-center"
            title={
              slot.stamped
                ? `${slot.merchantName} (${slot.timestampLabel})`
                : `Sello #${slot.slotIndex + 1} disponible`
            }
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 ${
                slot.stamped
                  ? 'bg-[#E06D53] text-white shadow-xs ring-2 ring-[#E06D53]/20'
                  : 'border-2 border-dashed border-slate-300 bg-white text-slate-400'
              }`}
            >
              {slot.stamped ? (
                <Anchor className="h-4 w-4 stroke-[2.2]" aria-hidden="true" />
              ) : (
                <span className="text-xs font-medium tabular-nums">
                  {slot.slotIndex + 1}
                </span>
              )}
            </div>
            <span className="w-full truncate text-[11px] font-medium text-slate-600">
              {slot.stamped ? slot.merchantName?.split(' ')[0] : 'Libre'}
            </span>
          </div>
        ))}
      </div>

      {/* Active Cross-Network Vouchers */}
      <div className="mt-5 border-t border-slate-200/80 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Vales cruzados listos para canje ({activeVouchers.length})
          </span>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {segment === 'Residente Frecuente' ? 'Tarifa Residente' : 'Pase 14 días'}
          </span>
        </div>

        {activeVouchers.length > 0 ? (
          <ul className="mt-2.5 space-y-2">
            {activeVouchers.slice(0, 2).map((voucher) => (
              <li key={voucher.id}>
                <button
                  type="button"
                  onClick={() => onSelectVoucherMerchant(voucher.redeemAtMerchantId)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors duration-150 hover:border-[#0A3663]/35 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-900">
                      {voucher.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      Vía {voucher.fromMerchantName} · {voucher.expiresInDays} días rest.
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs font-semibold text-[#0A3663] tabular-nums">
                    <TicketCheck className="h-3.5 w-3.5 text-[#E06D53]" aria-hidden="true" />
                    {voucher.valueLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            Sella tu primera compra en cualquier comercio adherido para recibir un vale cruzado.
          </p>
        )}
      </div>

      {/* Primary Action */}
      <button
        type="button"
        onClick={onOpenQrModal}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0A3663] px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#002042] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
      >
        <QrCode className="h-4 w-4" aria-hidden="true" />
        Mostrar Tarjeta QR en Caja
      </button>
    </aside>
  );
};
