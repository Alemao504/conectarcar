import { type Ad, type Trip, UserProfile, UserRole } from "../backend";

// Mock data for demo purposes
export const MOCK_ADS: Ad[] = [
  {
    id: "ad_1",
    contactLink: "https://wa.me/554499990001",
    video: {} as any,
    city: "Cascavel",
    createdAt: BigInt(Date.now()),
    viewCount: BigInt(342),
    approved: true,
    advertiser: {} as any,
  },
  {
    id: "ad_2",
    contactLink: "https://farmaciacentral.com.br",
    video: {} as any,
    city: "Cascavel",
    createdAt: BigInt(Date.now()),
    viewCount: BigInt(219),
    approved: true,
    advertiser: {} as any,
  },
  {
    id: "ad_3",
    contactLink: "https://wa.me/554499990003",
    video: {} as any,
    city: "Cascavel",
    createdAt: BigInt(Date.now()),
    viewCount: BigInt(158),
    approved: true,
    advertiser: {} as any,
  },
];

export const AD_NAMES = [
  "Pizzaria Roma",
  "Farmácia Central",
  "Auto Peças Cascavel",
];

export const AD_DESCRIPTIONS = [
  "As melhores pizzas de Cascavel! Delivery em toda a cidade.",
  "Medicamentos, dermocosméticos e muito mais com os melhores preços.",
  "Peças e acessórios para seu veículo com qualidade garantida.",
];

export interface AdWithImage {
  id: string;
  name: string;
  description: string;
  contactLink: string;
  imageSrc: string;
  whatsapp: boolean;
}

export const MOCK_ADS_WITH_IMAGES: AdWithImage[] = [
  {
    id: "img_ad_1",
    name: "Pizza Bravissima",
    description: "A melhor pizza de Cascavel! Delivery em toda a cidade.",
    contactLink: "https://wa.me/554499990001",
    imageSrc: "/assets/generated/ad-pizza.dim_800x600.jpg",
    whatsapp: true,
  },
  {
    id: "img_ad_2",
    name: "Farmácia Saúde Total",
    description: "Medicamentos e dermocosméticos com os melhores preços.",
    contactLink: "https://farmaciacentral.com.br",
    imageSrc: "/assets/generated/ad-farmacia.dim_800x600.jpg",
    whatsapp: false,
  },
  {
    id: "img_ad_3",
    name: "Academia PowerFit",
    description: "1º mês GRÁTIS! Musculação, spinning e muito mais.",
    contactLink: "https://wa.me/554499990004",
    imageSrc: "/assets/generated/ad-academia.dim_800x600.jpg",
    whatsapp: true,
  },
  {
    id: "img_ad_4",
    name: "AutoPeças Cascavel",
    description: "Peças e acessórios para seu veículo com qualidade garantida.",
    contactLink: "https://wa.me/554499990003",
    imageSrc: "/assets/generated/ad-autopecas.dim_800x600.jpg",
    whatsapp: true,
  },
  {
    id: "img_ad_5",
    name: "Supermercado BomPreço",
    description: "Ofertas toda semana! Frutas e verduras fresquinhas.",
    contactLink: "https://wa.me/554499990005",
    imageSrc: "/assets/generated/ad-supermercado.dim_800x600.jpg",
    whatsapp: true,
  },
];

export const MANDATORY_ADS: AdWithImage[] = [
  {
    id: "mandatory_1",
    name: "Concessionária Drive Auto",
    description:
      "Condições especiais de financiamento! Carro novo a partir de R$ 1.299/mês.",
    contactLink: "https://wa.me/554499990010",
    imageSrc: "/assets/generated/ad-carro.dim_800x600.jpg",
    whatsapp: true,
  },
  {
    id: "mandatory_2",
    name: "Burger House",
    description:
      "Combo Gigante por apenas R$ 29,90! Delivery rápido na sua cidade.",
    contactLink: "https://wa.me/554499990011",
    imageSrc: "/assets/generated/ad-burger.dim_800x600.jpg",
    whatsapp: true,
  },
  {
    id: "mandatory_3",
    name: "Mobile Store",
    description:
      "iPhone 15 no Pix sem juros! Melhor preço em smartphones da região.",
    contactLink: "https://wa.me/554499990012",
    imageSrc: "/assets/generated/ad-celular.dim_800x600.jpg",
    whatsapp: false,
  },
];

export function getAdDuration(): number {
  const stored = localStorage.getItem("conectarcar_ad_duration");
  if (!stored) return 30;
  const parsed = Number.parseInt(stored, 10);
  return Number.isNaN(parsed) ? 30 : parsed;
}

export const MOCK_TRIPS: Trip[] = [
  {
    id: "trip_1",
    startTime: BigInt(Date.now() - 86400000),
    status: "completed" as any,
    passenger: {} as any,
    paidMinutes: BigInt(10),
    totalPaid: BigInt(500),
    freeMinutesUsed: BigInt(5),
    driver: {} as any,
  },
  {
    id: "trip_2",
    startTime: BigInt(Date.now() - 172800000),
    status: "completed" as any,
    passenger: {} as any,
    paidMinutes: BigInt(8),
    totalPaid: BigInt(400),
    freeMinutesUsed: BigInt(5),
    driver: {} as any,
  },
  {
    id: "trip_3",
    startTime: BigInt(Date.now() - 259200000),
    status: "completed" as any,
    passenger: {} as any,
    paidMinutes: BigInt(15),
    totalPaid: BigInt(750),
    freeMinutesUsed: BigInt(5),
    driver: {} as any,
  },
];

export const MOCK_DRIVER_NAMES = [
  "Carlos Silva",
  "Ana Rodrigues",
  "João Souza",
];

export function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
