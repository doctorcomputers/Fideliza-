import React from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Merchant } from '../types/commerce';
import { MerchantIllustration } from './MerchantIllustration';

interface MerchantCardProps {
  merchant: Merchant;
  partnerNames: string[];
  isSelectedInNetwork: boolean;
  isBookmarked: boolean;
  onInspectNetwork: (merchantId: string) => void;
  onOpenDetail: (merchantId: string) => void;
  onToggleBookmark: (merchantId: string) => void;
}

export const MerchantCard: React.FC<MerchantCardProps> = ({
  merchant,
  partnerNames,
  isSelectedInNetwork,
  isBookmarked,
  onInspectNetwork,
  onOpenDetail,
  onToggleBookmark,
}) => {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-transform duration-150 hover:-translate-y-0.5 ${
        isSelectedInNetwork
          ? 'border-[#0A3663] ring-1 ring-[#0A3663]/20'
          : 'border-slate-900/10'
      }`}
    >
      <MerchantIllustration category={merchant.category} name={merchant.name} />

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Clean unboxed metadata line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{merchant.category}</span>
            <span aria-hidden="true">·</span>
            <span>{merchant.neighborhood}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{merchant.distanceLabel}</span>
          </div>

          <h3 className="mt-1.5 text-lg font-semibold leading-snug text-slate-900">
            {merchant.name}
          </h3>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{merchant.address}</span>
          </p>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {merchant.shortDescription}
          </p>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3.5">
          {/* Cross-Network Connection Summary */}
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-[#0A3663]">Red cruzada: </span>
            {partnerNames.length > 0
              ? partnerNames.join(', ')
              : 'Sello municipal directo'}
          </p>

          <div className="mt-1.5 flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium text-slate-700 tabular-nums">
              {merchant.stampRule}
            </span>
            <span className="font-semibold text-[#A13E28] tabular-nums">
              {merchant.baseRewardText}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDetail(merchant.id)}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0A3663] px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#002042] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
            >
              Ver alianza y sellar
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onInspectNetwork(merchant.id)}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-[#0A3663]/5 hover:text-[#0A3663] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
            >
              En grafo
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(merchant.id)}
              aria-pressed={isBookmarked}
              aria-label={
                isBookmarked
                  ? `Quitar ${merchant.name} de guardados`
                  : `Guardar ${merchant.name}`
              }
              className={`inline-flex min-h-10 items-center justify-center rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
                isBookmarked
                  ? 'border-[#E06D53] bg-[#E06D53]/10 text-[#A13E28]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isBookmarked ? 'Guardado' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
