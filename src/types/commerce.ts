export type MerchantCategory =
  | 'Alimentación y Gastronomía'
  | 'Moda, Joyería y Hogar'
  | 'Salud, Óptica y Estética'
  | 'Náutica y Ocio'
  | 'Tecnología y Papelería';

export type Neighborhood =
  | 'Centro'
  | 'Playa del Cura'
  | 'La Mata'
  | 'Acequión y Parque Naciones';

export type CitizenSegment = 'Residente Frecuente' | 'Visitante Estacional';

export interface CrossAlliance {
  id: string;
  sourceId: string;
  targetId: string;
  benefitTitle: string;
  triggerRule: string;
  discountLabel: string;
  bonusStamps: number;
  validityDays: number;
}

export interface Merchant {
  id: string;
  name: string;
  apymecoUrl: string;
  category: MerchantCategory;
  neighborhood: Neighborhood;
  address: string;
  schedule: string;
  distanceLabel: string;
  shortDescription: string;
  stampRule: string;
  minTicketEur: number;
  baseRewardText: string;
  hasActiveCrossPromo: boolean;
  isAnchorMerchant: boolean;
  /** Normalized coordinates (0-100) for the Torrevieja urban district map */
  mapCoords: { x: number; y: number };
  /** Normalized coordinates (0-100) for the Cross-Network force graph */
  graphCoords: { x: number; y: number };
  featuredOffer: string;
}

export interface CrossRoute {
  id: string;
  title: string;
  districtSummary: string;
  merchantIds: string[];
  completionBonus: string;
  estimatedSavingsEur: number;
  durationLabel: string;
}

export interface StampEntry {
  slotIndex: number;
  stamped: boolean;
  merchantId?: string;
  merchantName?: string;
  timestampLabel?: string;
}

export interface ActiveVoucher {
  id: string;
  code: string;
  title: string;
  fromMerchantName: string;
  redeemAtMerchantId: string;
  redeemAtMerchantName: string;
  valueLabel: string;
  expiresInDays: number;
  used: boolean;
}
