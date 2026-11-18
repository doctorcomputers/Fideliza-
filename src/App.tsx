import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  QrCode,
  RotateCcw,
  Route,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { MerchantCard } from './components/MerchantCard';
import { MerchantDetailDrawer } from './components/MerchantDetailDrawer';
import { QrTicketModal } from './components/QrTicketModal';
import { RedCruzadaExplorer } from './components/RedCruzadaExplorer';
import { StampPassportCard } from './components/StampPassportCard';
import {
  CATEGORIES,
  CROSS_ALLIANCES,
  CROSS_ROUTES,
  INITIAL_STAMPS,
  INITIAL_VOUCHERS,
  MERCHANTS,
  NEIGHBORHOODS,
} from './data/torreviejaData';
import {
  ActiveVoucher,
  CitizenSegment,
  Merchant,
  MerchantCategory,
  Neighborhood,
  StampEntry,
} from './types/commerce';

export default function App() {
  // Interactive Passport & Loyalty State
  const [stamps, setStamps] = useState<StampEntry[]>(INITIAL_STAMPS);
  const [vouchers, setVouchers] = useState<ActiveVoucher[]>(INITIAL_VOUCHERS);
  const [segment, setSegment] = useState<CitizenSegment>('Residente Frecuente');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    'cafe-muelle',
    'optica-maritima',
  ]);

  // Explorer & Directory Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MerchantCategory | 'Todos'>(
    'Todos'
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | 'Todos'>(
    'Todos'
  );
  const [onlyCrossPromo, setOnlyCrossPromo] = useState(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  // Selection & Overlays State
  const [networkSelectedId, setNetworkSelectedId] = useState<string>(MERCHANTS[0].id);
  const [drawerMerchantId, setDrawerMerchantId] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrInitialMerchantId, setQrInitialMerchantId] = useState<string | undefined>(
    undefined
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4200);
  };

  const merchantMap = useMemo(
    () => new Map(MERCHANTS.map((m) => [m.id, m])),
    []
  );

  // Partner lookup per merchant for directory cards
  const partnersByMerchant = useMemo(() => {
    const map = new Map<string, string[]>();
    MERCHANTS.forEach((m) => map.set(m.id, []));

    CROSS_ALLIANCES.forEach((al) => {
      const source = merchantMap.get(al.sourceId);
      const target = merchantMap.get(al.targetId);
      if (source && target) {
        const sList = map.get(source.id) ?? [];
        if (!sList.includes(target.name)) sList.push(target.name);
        map.set(source.id, sList);

        const tList = map.get(target.id) ?? [];
        if (!tList.includes(source.name)) tList.push(source.name);
        map.set(target.id, tList);
      }
    });
    return map;
  }, [merchantMap]);

  const activeRoute = useMemo(
    () => CROSS_ROUTES.find((r) => r.id === activeRouteId) ?? null,
    [activeRouteId]
  );

  const filteredMerchants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MERCHANTS.filter((m) => {
      if (selectedCategory !== 'Todos' && m.category !== selectedCategory) {
        return false;
      }
      if (selectedNeighborhood !== 'Todos' && m.neighborhood !== selectedNeighborhood) {
        return false;
      }
      if (onlyCrossPromo && !m.hasActiveCrossPromo) {
        return false;
      }
      if (onlyBookmarked && !bookmarkedIds.includes(m.id)) {
        return false;
      }
      if (activeRoute && !activeRoute.merchantIds.includes(m.id)) {
        return false;
      }
      if (q) {
        const partners = (partnersByMerchant.get(m.id) ?? []).join(' ').toLowerCase();
        const haystack =
          `${m.name} ${m.category} ${m.neighborhood} ${m.address} ${m.shortDescription} ${partners}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedNeighborhood,
    onlyCrossPromo,
    onlyBookmarked,
    activeRoute,
    bookmarkedIds,
    partnersByMerchant,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todos');
    setSelectedNeighborhood('Todos');
    setOnlyCrossPromo(false);
    setOnlyBookmarked(false);
    setActiveRouteId(null);
  };

  const handleToggleBookmark = (merchantId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(merchantId)
        ? prev.filter((id) => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  const handleInspectInNetwork = (merchantId: string) => {
    setNetworkSelectedId(merchantId);
    const section = document.getElementById('red-cruzada');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const awardStampAndCrossVouchers = (merchant: Merchant) => {
    // Award next available stamp slot (or cycle reset notice if full)
    setStamps((prev) => {
      const nextEmpty = prev.findIndex((s) => !s.stamped);
      if (nextEmpty === -1) {
        return prev;
      }
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      return prev.map((slot, idx) =>
        idx === nextEmpty
          ? {
              ...slot,
              stamped: true,
              merchantId: merchant.id,
              merchantName: merchant.name,
              timestampLabel: `Hoy · ${timeStr}`,
            }
          : slot
      );
    });

    // Unlock outgoing cross-network voucher if not already active
    const outgoing = CROSS_ALLIANCES.filter((a) => a.sourceId === merchant.id);
    if (outgoing.length > 0) {
      const firstAlliance = outgoing[0];
      const target = merchantMap.get(firstAlliance.targetId);
      if (target) {
        setVouchers((prev) => {
          const exists = prev.some(
            (v) =>
              !v.used &&
              v.redeemAtMerchantId === target.id &&
              v.fromMerchantName === merchant.name
          );
          if (exists) return prev;
          const newVoucher: ActiveVoucher = {
            id: `v-${Date.now()}`,
            code: `TRV-${target.id.slice(0, 3).toUpperCase()}-${Math.floor(
              10 + Math.random() * 89
            )}`,
            title: firstAlliance.discountLabel,
            fromMerchantName: merchant.name,
            redeemAtMerchantId: target.id,
            redeemAtMerchantName: target.name,
            valueLabel: firstAlliance.discountLabel.split(' ')[0],
            expiresInDays: firstAlliance.validityDays,
            used: false,
          };
          return [newVoucher, ...prev];
        });
        showToast(
          `Sello añadido en ${merchant.name} y vale desbloqueado para ${target.name}.`
        );
        return;
      }
    }

    showToast(`Sello registrado en ${merchant.name}.`);
  };

  const handleRedeemVoucher = (voucherId: string) => {
    const voucher = vouchers.find((v) => v.id === voucherId);
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, used: true } : v))
    );
    if (voucher) {
      showToast(
        `Vale "${voucher.title}" canjeado correctamente en ${voucher.redeemAtMerchantName}.`
      );
    }
  };

  const handleActivateRoute = (routeId: string) => {
    const isSame = activeRouteId === routeId;
    if (isSame) {
      setActiveRouteId(null);
      return;
    }
    const route = CROSS_ROUTES.find((r) => r.id === routeId);
    setActiveRouteId(routeId);
    if (route && route.merchantIds[0]) {
      setNetworkSelectedId(route.merchantIds[0]);
      showToast(`Ruta "${route.title}" aplicada al mapa y al directorio.`);
    }
    const dir = document.getElementById('comercios');
    dir?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const drawerMerchant = drawerMerchantId
    ? merchantMap.get(drawerMerchantId) ?? null
    : null;

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'Todos' ||
    selectedNeighborhood !== 'Todos' ||
    onlyCrossPromo ||
    onlyBookmarked ||
    activeRouteId !== null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-900/8 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-8 px-4 sm:px-8 lg:px-12">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#inicio"
            className="whitespace-nowrap shrink-0 font-display text-lg font-bold tracking-tight text-[#0A3663]"
          >
            Torrevieja Conecta
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#red-cruzada"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0A3663] hover:underline hover:underline-offset-4"
            >
              Red Cruzada
            </a>
            <a
              href="#comercios"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0A3663] hover:underline hover:underline-offset-4"
            >
              Comercios
            </a>
            <a
              href="#rutas"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0A3663] hover:underline hover:underline-offset-4"
            >
              Rutas
            </a>
            <a
              href="#pasaporte-digital"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-[#0A3663] hover:underline hover:underline-offset-4"
            >
              Mi Pasaporte
            </a>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => {
                setQrInitialMerchantId(networkSelectedId);
                setIsQrModalOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-[#0A3663] px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#002042] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Mostrar Tarjeta QR
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="inicio" className="mx-auto max-w-[1280px] space-y-12 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        {/* Hero Split + Pasaporte Digital */}
        <section
          aria-labelledby="hero-heading"
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
        >
          {/* Left 7 Columns: Civic Intro + Metrics + Search/Filter Command Strip */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-wide text-[#0A3663]">
              Red Municipal de Comercio Local · Torrevieja
            </p>
            <h1
              id="hero-heading"
              className="mt-2 max-w-2xl text-[32px] font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-[40px]"
              style={{ textWrap: 'balance' }}
            >
              Explorar Comercios y Red Cruzada
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Descubre establecimientos adheridos por barrio, visualiza las alianzas
              cruzadas entre comercios vecinos y acumula sellos en tu pasaporte
              municipal con cada compra local.
            </p>

            {/* Tabular Civic Figures */}
            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-slate-200 py-4">
              <div>
                <dt className="text-xs text-slate-500">Comercios activos</dt>
                <dd className="mt-1 text-2xl font-bold text-[#0A3663] tabular-nums">
                  {MERCHANTS.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Alianzas cruzadas</dt>
                <dd className="mt-1 text-2xl font-bold text-[#A13E28] tabular-nums">
                  {CROSS_ALLIANCES.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Barrios conectados</dt>
                <dd className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                  {NEIGHBORHOODS.length}
                </dd>
              </div>
            </dl>

            {/* Search & District Filter Bar */}
            <div className="mt-6 rounded-xl border border-slate-900/10 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar comercio, calle o aliado..."
                    aria-label="Buscar comercio por nombre, calle o aliado"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3663] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                  />
                </div>

                <div className="sm:w-52">
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) =>
                      setSelectedNeighborhood(e.target.value as Neighborhood | 'Todos')
                    }
                    aria-label="Filtrar por barrio de Torrevieja"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 focus:border-[#0A3663] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                  >
                    <option value="Todos">Todos los barrios</option>
                    {NEIGHBORHOODS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Segmented Controls */}
              <div
                className="mt-3 flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label="Filtrar por categoría comercial"
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Todos')}
                  className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
                    selectedCategory === 'Todos'
                      ? 'bg-[#0A3663] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  Todas las categorías
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
                      selectedCategory === cat
                        ? 'bg-[#0A3663] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Digital Stamp Passport */}
          <div className="lg:col-span-5">
            <StampPassportCard
              stamps={stamps}
              vouchers={vouchers}
              segment={segment}
              onSegmentChange={setSegment}
              onOpenQrModal={() => {
                setQrInitialMerchantId(networkSelectedId);
                setIsQrModalOpen(true);
              }}
              onSelectVoucherMerchant={(merchantId) => {
                setDrawerMerchantId(merchantId);
                setNetworkSelectedId(merchantId);
              }}
            />
          </div>
        </section>

        {/* Interactive Red Cruzada Explorer */}
        <RedCruzadaExplorer
          merchants={MERCHANTS}
          alliances={CROSS_ALLIANCES}
          selectedMerchantId={networkSelectedId}
          onSelectMerchant={(id) => setNetworkSelectedId(id)}
          onOpenMerchantDrawer={(id) => setDrawerMerchantId(id)}
          highlightedRouteMerchantIds={activeRoute?.merchantIds}
        />

        {/* Merchant Directory Grid */}
        <section id="comercios" aria-labelledby="directory-heading" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Catálogo Municipal Verificado
              </p>
              <h2
                id="directory-heading"
                className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900"
              >
                Comercios Adheridos ({filteredMerchants.length})
              </h2>
            </div>

            {/* Secondary Filter Toggles */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyCrossPromo}
                  onChange={(e) => setOnlyCrossPromo(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#0A3663]"
                />
                Solo con alianza cruzada
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyBookmarked}
                  onChange={(e) => setOnlyBookmarked(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#0A3663]"
                />
                Guardados ({bookmarkedIds.length})
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Restablecer filtros
                </button>
              )}
            </div>
          </div>

          {activeRoute && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0A3663]/20 bg-[#FAF8FF] px-4 py-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Route className="h-4 w-4 text-[#0A3663]" aria-hidden="true" />
                <span>
                  Mostrando paradas de la ruta:{' '}
                  <strong className="text-[#0A3663]">{activeRoute.title}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveRouteId(null)}
                className="font-semibold text-[#A13E28] hover:underline"
              >
                Ver todos los comercios
              </button>
            </div>
          )}

          {filteredMerchants.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMerchants.map((merchant) => (
                <MerchantCard
                  key={merchant.id}
                  merchant={merchant}
                  partnerNames={partnersByMerchant.get(merchant.id) ?? []}
                  isSelectedInNetwork={networkSelectedId === merchant.id}
                  isBookmarked={bookmarkedIds.includes(merchant.id)}
                  onInspectNetwork={handleInspectInNetwork}
                  onOpenDetail={(id) => setDrawerMerchantId(id)}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <SlidersHorizontal className="h-8 w-8 text-slate-400" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                Ningún comercio coincide con los filtros actuales
              </h3>
              <p className="mt-1 max-w-md text-sm text-slate-600">
                Prueba a limpiar el término de búsqueda o ampliar los barrios y categorías
                seleccionadas.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-[#0A3663] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#002042]"
              >
                Mostrar los {MERCHANTS.length} comercios
              </button>
            </div>
          )}
        </section>

        {/* Curated Cross-Network Thematic Routes */}
        <section id="rutas" aria-labelledby="routes-heading" className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-medium text-slate-500">
              Circuitos Recomendados entre Establecimientos
            </p>
            <h2
              id="routes-heading"
              className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900"
            >
              Rutas de Red Cruzada
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {CROSS_ROUTES.map((route) => {
              const isSelected = activeRouteId === route.id;
              const stops = route.merchantIds
                .map((id) => merchantMap.get(id))
                .filter((m): m is Merchant => Boolean(m));

              return (
                <article
                  key={route.id}
                  className={`flex flex-col justify-between rounded-xl border bg-white p-6 transition-colors ${
                    isSelected
                      ? 'border-[#0A3663] ring-1 ring-[#0A3663]/20'
                      : 'border-slate-900/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{route.districtSummary}</span>
                      <span className="font-mono tabular-nums">{route.durationLabel}</span>
                    </div>

                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      {route.title}
                    </h3>

                    {/* Ordered Route Chain */}
                    <ol className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                      {stops.map((stop, idx) => (
                        <li
                          key={stop.id}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => setDrawerMerchantId(stop.id)}
                            className="flex min-w-0 items-center gap-2 text-left font-medium text-slate-800 hover:text-[#0A3663]"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] font-semibold text-[#0A3663] tabular-nums">
                              {idx + 1}
                            </span>
                            <span className="truncate">{stop.name}</span>
                          </button>
                          <span className="shrink-0 text-slate-500">
                            {stop.neighborhood}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="text-slate-600">{route.completionBonus}</span>
                      <span className="shrink-0 font-mono font-semibold text-[#A13E28] tabular-nums">
                        Ahorro ~{route.estimatedSavingsEur} €
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleActivateRoute(route.id)}
                      className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9] ${
                        isSelected
                          ? 'bg-[#E06D53] text-white hover:bg-[#A13E28]'
                          : 'border border-slate-200 bg-[#FAF8FF] text-[#0A3663] hover:bg-[#0A3663] hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Ruta activa en directorio' : 'Explorar esta ruta'}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* Civic Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 px-4 py-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <div>
            <p className="font-display text-sm font-semibold text-[#0A3663]">
              Torrevieja Conecta
            </p>
            <p className="mt-1">
              Programa municipal de dinamización comercial y red de alianzas locales.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#red-cruzada" className="hover:text-[#0A3663]">
              Mapa de Alianzas
            </a>
            <a href="#comercios" className="hover:text-[#0A3663]">
              Directorio
            </a>
            <a href="#rutas" className="hover:text-[#0A3663]">
              Rutas Comerciales
            </a>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="font-semibold text-[#0A3663] hover:underline"
            >
              Abrir Tarjeta QR
            </button>
          </div>
        </div>
      </footer>

      {/* Merchant Detail & Stamp Simulator Drawer */}
      <MerchantDetailDrawer
        merchant={drawerMerchant}
        allMerchants={MERCHANTS}
        alliances={CROSS_ALLIANCES}
        vouchers={vouchers}
        onClose={() => setDrawerMerchantId(null)}
        onSelectPartner={(id) => {
          setDrawerMerchantId(id);
          setNetworkSelectedId(id);
        }}
        onStampPurchase={(merchant) => awardStampAndCrossVouchers(merchant)}
        onRedeemVoucher={handleRedeemVoucher}
        onOpenQrForMerchant={(merchantId) => {
          setDrawerMerchantId(null);
          setQrInitialMerchantId(merchantId);
          setIsQrModalOpen(true);
        }}
      />

      {/* Perforated Ticket QR Modal */}
      <QrTicketModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        segment={segment}
        merchants={MERCHANTS}
        initialMerchantId={qrInitialMerchantId}
        onSimulatePosScan={awardStampAndCrossVouchers}
      />

      {/* Live Action Confirmation Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2.5 rounded-xl border border-slate-900/10 bg-[#002042] px-4 py-3 text-xs font-medium text-white shadow-civic-l3"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0EA5E9]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
