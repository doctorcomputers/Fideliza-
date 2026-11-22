import React, { useMemo, useState } from 'react';
import { ArrowRight, Compass, GitFork, MapPin, Store } from 'lucide-react';
import { CrossAlliance, Merchant } from '../types/commerce';

interface RedCruzadaExplorerProps {
  merchants: Merchant[];
  alliances: CrossAlliance[];
  selectedMerchantId: string;
  onSelectMerchant: (merchantId: string) => void;
  onOpenMerchantDrawer: (merchantId: string) => void;
  highlightedRouteMerchantIds?: string[];
}

type ExplorerViewMode = 'graph' | 'map';

export const RedCruzadaExplorer: React.FC<RedCruzadaExplorerProps> = ({
  merchants,
  alliances,
  selectedMerchantId,
  onSelectMerchant,
  onOpenMerchantDrawer,
  highlightedRouteMerchantIds = [],
}) => {
  const [viewMode, setViewMode] = useState<ExplorerViewMode>('graph');

  const merchantById = useMemo(() => {
    const map = new Map<string, Merchant>();
    merchants.forEach((m) => map.set(m.id, m));
    return map;
  }, [merchants]);

  const selectedMerchant =
    merchantById.get(selectedMerchantId) ?? merchants[0];

  const outgoingAlliances = useMemo(
    () => alliances.filter((a) => a.sourceId === selectedMerchant.id),
    [alliances, selectedMerchant.id]
  );

  const incomingAlliances = useMemo(
    () => alliances.filter((a) => a.targetId === selectedMerchant.id),
    [alliances, selectedMerchant.id]
  );

  const connectedIds = useMemo(() => {
    const ids = new Set<string>([selectedMerchant.id]);
    outgoingAlliances.forEach((a) => ids.add(a.targetId));
    incomingAlliances.forEach((a) => ids.add(a.sourceId));
    highlightedRouteMerchantIds.forEach((id) => ids.add(id));
    return ids;
  }, [
    selectedMerchant.id,
    outgoingAlliances,
    incomingAlliances,
    highlightedRouteMerchantIds,
  ]);

  const getCoords = (m: Merchant) =>
    viewMode === 'graph' ? m.graphCoords : m.mapCoords;

  return (
    <section
      id="red-cruzada"
      aria-labelledby="red-cruzada-heading"
      className="rounded-2xl border border-slate-900/10 bg-white shadow-civic-l2"
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Alianzas Locales entre Asociados de APYMECO
          </p>
          <h2
            id="red-cruzada-heading"
            className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900"
          >
            Red Cruzada de Comercios APYMECO
          </h2>
        </div>

        <div
          className="inline-flex rounded-lg bg-slate-100 p-1"
          role="tablist"
          aria-label="Modo de visualización de la red cruzada"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'graph'}
            onClick={() => setViewMode('graph')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
              viewMode === 'graph'
                ? 'bg-white text-[#0A3663] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
            Grafo de Alianzas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'map'}
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
              viewMode === 'map'
                ? 'bg-white text-[#0A3663] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            Plano de Distritos
          </button>
        </div>
      </div>

      {/* Split Explorer Canvas + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Interactive SVG Visualization */}
        <div className="relative border-b border-slate-200 bg-[#FAF8FF] p-4 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-6">
          {/* Legend Row */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>
              Haz clic en cualquier comercio de APYMECO para inspeccionar sus alianzas cruzadas.
            </span>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0A3663]" />
                Comercio seleccionado
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E06D53]" />
                Comercio aliado
              </span>
            </div>
          </div>

          <div className="relative aspect-16/11 w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full select-none"
              role="img"
              aria-label={
                viewMode === 'graph'
                  ? 'Grafo de alianzas cruzadas entre comercios APYMECO de Torrevieja'
                  : 'Plano de distritos de Torrevieja con comercios APYMECO'
              }
            >
              {/* Background Geometry */}
              {viewMode === 'map' ? (
                <g>
                  {/* Mediterranean Sea (East/South-East) */}
                  <path
                    d="M 100 0 L 100 100 L 18 100 C 30 82, 46 68, 56 54 C 66 42, 76 32, 88 18 L 95 0 Z"
                    fill="#EAF5FC"
                  />
                  {/* Laguna Rosa de Torrevieja & Parque Natural (West) */}
                  <ellipse
                    cx="13"
                    cy="34"
                    rx="11"
                    ry="19"
                    fill="#FDEEEB"
                    stroke="#E06D53"
                    strokeOpacity="0.28"
                    strokeWidth="0.4"
                  />
                  <text
                    x="13"
                    y="35"
                    textAnchor="middle"
                    fontSize="2.3"
                    fill="#A13E28"
                    fontWeight="600"
                  >
                    Laguna Salada
                  </text>
                  {/* Coastline Stroke */}
                  <path
                    d="M 18 100 C 30 82, 46 68, 56 54 C 66 42, 76 32, 88 18 L 95 0"
                    fill="none"
                    stroke="#0EA5E9"
                    strokeWidth="0.7"
                    strokeOpacity="0.6"
                  />
                  {/* Dique de Levante Pier */}
                  <path
                    d="M 46 62 L 60 72 L 66 68"
                    fill="none"
                    stroke="#0A3663"
                    strokeWidth="0.7"
                    strokeOpacity="0.35"
                  />
                  {/* District Labels */}
                  <text x="43" y="38" fontSize="2.4" fill="#64748B" fontWeight="600">
                    CENTRO
                  </text>
                  <text x="63" y="29" fontSize="2.2" fill="#64748B" fontWeight="600">
                    PLAYA DEL CURA
                  </text>
                  <text x="74" y="13" fontSize="2.2" fill="#64748B" fontWeight="600">
                    LA MATA
                  </text>
                  <text x="14" y="83" fontSize="2.1" fill="#64748B" fontWeight="600">
                    ACEQUIÓN Y PARQUE NACIONES
                  </text>
                  <text x="76" y="76" fontSize="2.8" fill="#0284C7" fontWeight="600" opacity="0.7">
                    Mar Mediterráneo
                  </text>
                </g>
              ) : (
                <g>
                  {/* Subtle Coordinate Grid for Force Graph */}
                  {[20, 40, 60, 80].map((pos) => (
                    <React.Fragment key={pos}>
                      <line
                        x1={pos}
                        y1={4}
                        x2={pos}
                        y2={96}
                        stroke="#E2E8F0"
                        strokeWidth="0.25"
                        strokeDasharray="1.2 1.2"
                      />
                      <line
                        x1={4}
                        y1={pos}
                        x2={96}
                        y2={pos}
                        stroke="#E2E8F0"
                        strokeWidth="0.25"
                        strokeDasharray="1.2 1.2"
                      />
                    </React.Fragment>
                  ))}
                </g>
              )}

              {/* Alliance Curved Edges */}
              {alliances.map((alliance) => {
                const source = merchantById.get(alliance.sourceId);
                const target = merchantById.get(alliance.targetId);
                if (!source || !target) return null;

                const s = getCoords(source);
                const t = getCoords(target);
                const mx = (s.x + t.x) / 2;
                const my = (s.y + t.y) / 2;
                const dx = t.x - s.x;
                const dy = t.y - s.y;
                // Gentle arc offset perpendicular to segment
                const cx = mx - dy * 0.14;
                const cy = my + dx * 0.14;

                const isOutgoing = alliance.sourceId === selectedMerchant.id;
                const isIncoming = alliance.targetId === selectedMerchant.id;
                const isHighlighted = isOutgoing || isIncoming;

                return (
                  <path
                    key={alliance.id}
                    d={`M ${s.x} ${s.y} Q ${cx} ${cy} ${t.x} ${t.y}`}
                    fill="none"
                    stroke={
                      isOutgoing
                        ? '#0A3663'
                        : isIncoming
                          ? '#E06D53'
                          : '#CBD5E1'
                    }
                    strokeWidth={isHighlighted ? 0.75 : 0.35}
                    strokeOpacity={isHighlighted ? 0.92 : 0.6}
                    strokeDasharray={isIncoming ? '1.6 1' : undefined}
                  />
                );
              })}

              {/* Merchant Nodes */}
              {merchants.map((m) => {
                const { x, y } = getCoords(m);
                const isSelected = m.id === selectedMerchant.id;
                const isConnected = connectedIds.has(m.id);
                const isInRoute = highlightedRouteMerchantIds.includes(m.id);

                return (
                  <g
                    key={m.id}
                    onClick={() => onSelectMerchant(m.id)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Seleccionar ${m.name} (${m.neighborhood})`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectMerchant(m.id);
                      }
                    }}
                  >
                    {(isSelected || isInRoute) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 4.4 : 3.6}
                        fill="none"
                        stroke={isSelected ? '#0EA5E9' : '#F59E0B'}
                        strokeWidth="0.55"
                        strokeOpacity="0.85"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 2.7 : isConnected ? 2.2 : 1.75}
                      fill={
                        isSelected
                          ? '#0A3663'
                          : isConnected
                            ? '#E06D53'
                            : '#94A3B8'
                      }
                      stroke="#FFFFFF"
                      strokeWidth="0.6"
                    />
                    <text
                      x={x}
                      y={y + (y > 78 ? -3.4 : 4.6)}
                      textAnchor="middle"
                      fontSize={isSelected ? '2.55' : '2.15'}
                      fontWeight={isSelected ? '700' : isConnected ? '600' : '500'}
                      fill={isSelected ? '#002042' : isConnected ? '#0F172A' : '#64748B'}
                    >
                      {m.name.length > 21 ? `${m.name.slice(0, 19)}…` : m.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Alliance Inspector */}
        <div className="flex flex-col justify-between p-6 lg:col-span-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{selectedMerchant.category}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedMerchant.neighborhood}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{selectedMerchant.distanceLabel}</span>
            </div>

            <h3 className="mt-1.5 text-xl font-semibold text-slate-900">
              {selectedMerchant.name}
            </h3>

            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              {selectedMerchant.address}
            </p>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {selectedMerchant.shortDescription}
            </p>

            {/* Outgoing Alliances */}
            <div className="mt-5 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-semibold text-[#0A3663]">
                Si compras aquí, desbloqueas ({outgoingAlliances.length})
              </h4>
              {outgoingAlliances.length > 0 ? (
                <ul className="mt-2.5 space-y-2">
                  {outgoingAlliances.map((al) => {
                    const target = merchantById.get(al.targetId);
                    if (!target) return null;
                    return (
                      <li key={al.id}>
                        <button
                          type="button"
                          onClick={() => onSelectMerchant(target.id)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-[#FAF8FF] px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-[#0A3663]/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {target.name}
                            </p>
                            <p className="truncate text-xs text-slate-600">
                              {al.discountLabel} · +{al.bonusStamps} sello
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-[#0A3663]" aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Comercio independiente adherido al sello municipal general.
                </p>
              )}
            </div>

            {/* Incoming Alliances */}
            {incomingAlliances.length > 0 && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <h4 className="text-xs font-semibold text-[#A13E28]">
                  Te envían ventajas hacia este comercio ({incomingAlliances.length})
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {incomingAlliances.map((al) => {
                    const source = merchantById.get(al.sourceId);
                    if (!source) return null;
                    return (
                      <li key={al.id}>
                        <button
                          type="button"
                          onClick={() => onSelectMerchant(source.id)}
                          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          <span className="truncate font-medium">
                            Desde {source.name}
                          </span>
                          <span className="shrink-0 font-mono font-semibold text-[#A13E28] tabular-nums">
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

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => onOpenMerchantDrawer(selectedMerchant.id)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0A3663] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#002042] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
            >
              <Store className="h-4 w-4" aria-hidden="true" />
              Abrir ficha y sellar visita
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
