import React, { useEffect, useState } from 'react';
import { Anchor, ArrowRight, CheckCircle2, Clock, MapPin, QrCode, TicketCheck, X } from 'lucide-react';
import { ActiveVoucher, CrossAlliance, Merchant } from '../types/commerce';
import { MerchantIllustration } from './MerchantIllustration';

interface MerchantDetailDrawerProps {
  merchant: Merchant | null;
  allMerchants: Merchant[];
  alliances: CrossAlliance[];
  vouchers: ActiveVoucher[];
  onClose: () => void;
  onSelectPartner: (merchantId: string) => void;
  onStampPurchase: (merchant: Merchant, amountEur: number) => void;
  onRedeemVoucher: (voucherId: string) => void;
  onOpenQrForMerchant: (merchantId: string) => void;
}

export const MerchantDetailDrawer: React.FC<MerchantDetailDrawerProps> = ({
  merchant,
  allMerchants,
  alliances,
  vouchers,
  onClose,
  onSelectPartner,
  onStampPurchase,
  onRedeemVoucher,
  onOpenQrForMerchant,
}) => {
  const [ticketAmount, setTicketAmount] = useState<string>('20');
  const [stampFeedback, setStampFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (merchant) {
      setTicketAmount(String(merchant.minTicketEur + 4));
      setStampFeedback(null);
    }
  }, [merchant]);

  useEffect(() => {
    if (!merchant) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [merchant, onClose]);

  if (!merchant) return null;

  const merchantMap = new Map(allMerchants.map((m) => [m.id, m]));
  const outgoing = alliances.filter((a) => a.sourceId === merchant.id);
  const incoming = alliances.filter((a) => a.targetId === merchant.id);
  const redeemableVouchers = vouchers.filter(
    (v) => !v.used && v.redeemAtMerchantId === merchant.id
  );

  const parsedAmount = Number(ticketAmount) || 0;
  const qualifiesForStamp = parsedAmount >= merchant.minTicketEur;

  const handleConfirmStamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualifiesForStamp) return;
    onStampPurchase(merchant, parsedAmount);
    setStampFeedback(
      `Sello registrado por ${parsedAmount.toFixed(2)} € en ${merchant.name}.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-merchant-title"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-civic-l3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xs">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              {merchant.category} · {merchant.neighborhood}
            </p>
            <h2
              id="drawer-merchant-title"
              className="truncate text-lg font-semibold text-slate-900"
            >
              {merchant.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha de comercio"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <MerchantIllustration category={merchant.category} name={merchant.name} />

        <div className="space-y-6 p-6">
          {/* Core Info */}
          <div>
            <p className="text-sm leading-relaxed text-slate-700">
              {merchant.shortDescription}
            </p>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#0A3663]" aria-hidden="true" />
                <span>
                  {merchant.address} ({merchant.distanceLabel})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-[#0A3663]" aria-hidden="true" />
                <span className="tabular-nums">Horario: {merchant.schedule}</span>
              </div>
            </div>
          </div>

          {/* Redeemable Vouchers Here */}
          {redeemableVouchers.length > 0 && (
            <div className="rounded-xl border border-[#E06D53]/35 bg-[#FAF8FF] p-4">
              <h3 className="text-xs font-semibold text-[#A13E28]">
                Vales disponibles para canjear en este comercio
              </h3>
              <ul className="mt-2.5 space-y-2">
                {redeemableVouchers.map((voucher) => (
                  <li
                    key={voucher.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900">
                        {voucher.title}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500">
                        Código {voucher.code} · {voucher.expiresInDays} días restantes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRedeemVoucher(voucher.id)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#E06D53] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#A13E28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
                    >
                      <TicketCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Canjear
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Purchase & Stamp Simulator */}
          <form
            onSubmit={handleConfirmStamp}
            className="rounded-xl border border-slate-200 bg-[#FAF8FF] p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Registrar compra y añadir sello
              </h3>
              <span className="text-xs font-medium text-[#0A3663] tabular-nums">
                Mínimo {merchant.minTicketEur.toFixed(2)} €
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-600">
              Al validar el ticket en mostrador sumas un sello en tu pasaporte y activas los bonos cruzados salientes.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="ticket-amount-input"
                  className="block text-xs font-medium text-slate-700"
                >
                  Importe del ticket (€)
                </label>
                <input
                  id="ticket-amount-input"
                  type="number"
                  min={1}
                  step="0.5"
                  value={ticketAmount}
                  onChange={(e) => setTicketAmount(e.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 tabular-nums focus:border-[#0A3663] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                />
              </div>

              <button
                type="submit"
                disabled={!qualifiesForStamp}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0A3663] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#002042] disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
              >
                <Anchor className="h-3.5 w-3.5" aria-hidden="true" />
                Sellar en pasaporte
              </button>
            </div>

            {!qualifiesForStamp && (
              <p className="mt-2 text-xs text-[#BA1A1A]">
                El importe debe ser de al menos {merchant.minTicketEur.toFixed(2)} € para obtener sello.
              </p>
            )}

            {stampFeedback && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>{stampFeedback}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onOpenQrForMerchant(merchant.id)}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-[#0A3663] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
            >
              <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
              Generar pase QR para este comercio
            </button>
          </form>

          {/* Outgoing Alliances */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Alianzas cruzadas que desbloquea ({outgoing.length})
            </h3>
            {outgoing.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {outgoing.map((al) => {
                  const target = merchantMap.get(al.targetId);
                  if (!target) return null;
                  return (
                    <li key={al.id}>
                      <button
                        type="button"
                        onClick={() => onSelectPartner(target.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-[#0A3663]/40 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A3663]">
                            {al.benefitTitle}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-900">
                            {target.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {al.discountLabel} · Validez {al.validityDays} días
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Este establecimiento suma sellos válidos para el bono municipal general de Torrevieja Conecta.
              </p>
            )}
          </div>

          {/* Incoming Alliances */}
          {incoming.length > 0 && (
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Comercios que te derivan ventajas aquí ({incoming.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {incoming.map((al) => {
                  const source = merchantMap.get(al.sourceId);
                  if (!source) return null;
                  return (
                    <li key={al.id}>
                      <button
                        type="button"
                        onClick={() => onSelectPartner(source.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-[#FAF8FF] px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-white"
                      >
                        <span className="font-medium text-slate-800">
                          Comprando en <strong>{source.name}</strong>
                        </span>
                        <span className="font-mono font-semibold text-[#A13E28]">
                          {al.discountLabel}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
