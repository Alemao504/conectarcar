import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart2,
  Car,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Play,
  QrCode,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "../backend";
import { useQRScanner } from "../qr-code/useQRScanner";
import { AVATAR_IMAGES } from "../utils/avatars";
import {
  AD_NAMES,
  MANDATORY_ADS,
  MOCK_ADS,
  MOCK_ADS_WITH_IMAGES,
  MOCK_TRIPS,
  formatCurrency,
  formatDate,
  formatTime,
} from "../utils/mockData";

interface PassengerDashboardProps {
  profile: UserProfile;
}

interface ActiveSession {
  driverName: string;
  driverId: string;
  ratePerMinute: number;
  timeRemaining: number;
  totalFreeTime: number;
}

interface TimeRequest {
  minutes: number;
  status: "idle" | "pending" | "confirmed";
}

interface DriverHistory {
  driverId: string;
  driverName: string;
  driverAvatar: number;
  vehicleModel: string;
  vehiclePlate: string;
  totalTrips: number;
  totalMinutes: number;
  totalSpent: number;
  lastTripDate: string;
  timeRemainingSeconds: number;
}

const MOCK_DRIVER_HISTORY: DriverHistory[] = [
  {
    driverId: "driver_001",
    driverName: "Carlos",
    driverAvatar: 2,
    vehicleModel: "Corolla",
    vehiclePlate: "ABC-1234",
    totalTrips: 8,
    totalMinutes: 94,
    totalSpent: 4200,
    lastTripDate: "02/04/2026",
    timeRemainingSeconds: 7 * 60 + 23,
  },
  {
    driverId: "driver_002",
    driverName: "Ana",
    driverAvatar: 1,
    vehicleModel: "Onix Plus",
    vehiclePlate: "DEF-5678",
    totalTrips: 5,
    totalMinutes: 58,
    totalSpent: 2750,
    lastTripDate: "01/04/2026",
    timeRemainingSeconds: 0,
  },
  {
    driverId: "driver_003",
    driverName: "João",
    driverAvatar: 0,
    vehicleModel: "HB20",
    vehiclePlate: "GHI-9012",
    totalTrips: 12,
    totalMinutes: 145,
    totalSpent: 6800,
    lastTripDate: "28/03/2026",
    timeRemainingSeconds: 12 * 60 + 45,
  },
  {
    driverId: "driver_004",
    driverName: "Fernanda",
    driverAvatar: 3,
    vehicleModel: "Argo",
    vehiclePlate: "JKL-3456",
    totalTrips: 3,
    totalMinutes: 32,
    totalSpent: 1500,
    lastTripDate: "25/03/2026",
    timeRemainingSeconds: 0,
  },
];

const VISUAL_ADS = [
  {
    id: "vad_1",
    name: "Pizzaria Roma",
    category: "Restaurante",
    tagline: "Delivery rápido em toda Cascavel",
    contactLink: "https://wa.me/554499990001",
    views: 342,
    gradient: "from-[oklch(0.45_0.22_293)] to-[oklch(0.35_0.18_320)]",
    glowColor: "oklch(var(--neon-purple))",
    borderClass: "neon-border-purple",
    emoji: "🍕",
  },
  {
    id: "vad_2",
    name: "Farmácia Central",
    category: "Farmácia",
    tagline: "Medicamentos com os melhores preços",
    contactLink: "https://farmaciacentral.com.br",
    views: 219,
    gradient: "from-[oklch(0.4_0.2_200)] to-[oklch(0.3_0.14_220)]",
    glowColor: "oklch(var(--neon-cyan))",
    borderClass: "neon-border-cyan",
    emoji: "💊",
  },
  {
    id: "vad_3",
    name: "Auto Peças",
    category: "Auto Peças",
    tagline: "Tudo para seu veículo com garantia",
    contactLink: "https://wa.me/554499990003",
    views: 158,
    gradient: "from-[oklch(0.45_0.2_145)] to-[oklch(0.35_0.15_160)]",
    glowColor: "oklch(var(--neon-green))",
    borderClass: "neon-border-green",
    emoji: "🔧",
  },
  {
    id: "vad_4",
    name: "Academia FitNow",
    category: "Academia",
    tagline: "Primeira semana grátis para você",
    contactLink: "https://wa.me/554499990004",
    views: 97,
    gradient: "from-[oklch(0.5_0.2_40)] to-[oklch(0.38_0.16_20)]",
    glowColor: "oklch(var(--neon-orange))",
    borderClass: "",
    emoji: "💪",
  },
  {
    id: "vad_5",
    name: "Supermercado Bom Preço",
    category: "Supermercado",
    tagline: "Promoções imperdíveis todo dia",
    contactLink: "https://wa.me/554499990005",
    views: 271,
    gradient: "from-[oklch(0.42_0.18_255)] to-[oklch(0.32_0.14_280)]",
    glowColor: "oklch(var(--neon-blue))",
    borderClass: "",
    emoji: "🛒",
  },
  {
    id: "vad_6",
    name: "Escola de Inglês",
    category: "Educação",
    tagline: "Aprenda inglês de onde estiver",
    contactLink: "https://wa.me/554499990006",
    views: 134,
    gradient: "from-[oklch(0.44_0.22_293)] to-[oklch(0.36_0.16_200)]",
    glowColor: "oklch(var(--neon-cyan))",
    borderClass: "neon-border-cyan",
    emoji: "📚",
  },
];

export function PassengerDashboard({
  profile: _profile,
}: PassengerDashboardProps) {
  const profile = _profile;
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [timeRequest, setTimeRequest] = useState<TimeRequest | null>(null);
  const [requestMinutes, setRequestMinutes] = useState(5);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [adPhase, setAdPhase] = useState(true);
  const pastTrips = MOCK_TRIPS;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Settings state
  const [editName, setEditName] = useState(profile.name || "");
  const [editCity, setEditCity] = useState(profile.city || "");
  const [editState, setEditState] = useState(profile.state || "");
  const [settingsSaved, setSettingsSaved] = useState(false);

  const {
    qrResults,
    isScanning,
    videoRef,
    canvasRef,
    startScanning,
    stopScanning,
    canStartScanning,
  } = useQRScanner({ facingMode: "environment" });

  useEffect(() => {
    if (qrResults.length > 0) {
      const result = qrResults[0].data;
      if (result.startsWith("conectarcar://driver/")) {
        const driverId = result.replace("conectarcar://driver/", "");
        stopScanning();
        setShowQrScanner(false);
        setAdPhase(true);
        sessionStorage.setItem("pendingDriverId", driverId);
      }
    }
  }, [qrResults, stopScanning]);

  const activeDriverId = activeSession?.driverId ?? null;

  useEffect(() => {
    if (!activeDriverId) return;
    timerRef.current = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev) return null;
        const newTime = prev.timeRemaining - 1;
        if (newTime === 120) setShowTimeWarning(true);
        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          return null;
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeDriverId]);

  const handleAdComplete = () => {
    const driverId = sessionStorage.getItem("pendingDriverId") || "driver_demo";
    setAdPhase(false);
    setActiveSession({
      driverName: "Carlos Silva",
      driverId,
      ratePerMinute: 50,
      timeRemaining: 5 * 60,
      totalFreeTime: 5 * 60,
    });
  };

  const handleRequestMoreTime = () => {
    if (!activeSession) return;
    setTimeRequest({ minutes: requestMinutes, status: "pending" });
    setShowTimeWarning(false);
    setTimeout(() => {
      setTimeRequest((prev) =>
        prev ? { ...prev, status: "confirmed" } : null,
      );
      setActiveSession((prev) =>
        prev
          ? { ...prev, timeRemaining: prev.timeRemaining + requestMinutes * 60 }
          : null,
      );
      setTimeout(() => setTimeRequest(null), 2000);
    }, 3000);
  };

  const spendingByWeek = [
    { label: "Sem 1", value: 550 },
    { label: "Sem 2", value: 400 },
    { label: "Sem 3", value: 750 },
    { label: "Sem 4", value: 300 },
  ];
  const maxSpend = Math.max(...spendingByWeek.map((w) => w.value));

  if (adPhase) {
    return <AdPhaseWrapper onComplete={handleAdComplete} />;
  }

  const totalHistoryTrips = MOCK_DRIVER_HISTORY.reduce(
    (acc, d) => acc + d.totalTrips,
    0,
  );
  const totalHistorySpent = MOCK_DRIVER_HISTORY.reduce(
    (acc, d) => acc + d.totalSpent,
    0,
  );

  return (
    <div className="min-h-screen pt-16 pb-8 px-4">
      <Tabs defaultValue="conectar" className="max-w-sm mx-auto">
        <TabsList
          className="w-full mb-4 bg-card border border-border rounded-xl p-1 mt-4"
          data-ocid="passenger.tab"
        >
          <TabsTrigger
            value="conectar"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Wifi size={12} className="mr-1" />
            Conectar
          </TabsTrigger>
          <TabsTrigger
            value="anuncios"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Play size={12} className="mr-1" />
            Anúncios
          </TabsTrigger>
          <TabsTrigger
            value="corridas"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Car size={12} className="mr-1" />
            Corridas
          </TabsTrigger>
          <TabsTrigger
            value="gastos"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <BarChart2 size={12} className="mr-1" />
            Gastos
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Settings size={12} className="mr-1" />
            Perfil
          </TabsTrigger>
        </TabsList>

        {/* CONECTAR TAB */}
        <TabsContent value="conectar" className="mt-0">
          <AnimatePresence mode="wait">
            {!activeSession ? (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-cyber p-6 text-center space-y-5"
                data-ocid="passenger.card"
              >
                <div
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: "oklch(var(--neon-purple) / 0.1)" }}
                >
                  <QrCode size={36} className="text-neon-purple" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">
                    Conectar ao Wi-Fi
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Escaneie o QR Code do seu motorista para começar
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowQrScanner(true)}
                  className="w-full gradient-btn-secondary rounded-xl py-6 text-base font-bold"
                  data-ocid="passenger.primary_button"
                >
                  <QrCode size={18} className="mr-2" /> Escanear QR Code
                </Button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline"
                  onClick={() => {
                    setAdPhase(true);
                  }}
                  data-ocid="passenger.secondary_button"
                >
                  Demo: simular conexão
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="session"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div
                  className="card-cyber p-5 neon-border-green"
                  data-ocid="passenger.card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                      <span className="text-neon-green text-sm font-semibold">
                        Conectado
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activeSession.driverName}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="timer-display">
                      {formatTime(activeSession.timeRemaining)}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      tempo restante
                    </p>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all"
                      style={{
                        width: `${(activeSession.timeRemaining / activeSession.totalFreeTime) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {timeRequest && (
                  <div
                    className="card-cyber p-4"
                    data-ocid="passenger.loading_state"
                  >
                    {timeRequest.status === "pending" && (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Aguardando confirmação do motorista...
                        </span>
                      </div>
                    )}
                    {timeRequest.status === "confirmed" && (
                      <div
                        className="flex items-center gap-3 text-neon-green"
                        data-ocid="passenger.success_state"
                      >
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-semibold">
                          {timeRequest.minutes} minutos liberados!
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setActiveSession(null);
                    if (timerRef.current) clearInterval(timerRef.current);
                  }}
                  data-ocid="passenger.delete_button"
                >
                  <WifiOff size={14} className="mr-2" /> Desconectar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ANÚNCIOS TAB — visual grid */}
        <TabsContent value="anuncios" className="mt-0">
          <div className="mb-3">
            <p className="text-xs text-muted-foreground text-center">
              Anúncios locais de Cascavel — toque para entrar em contato
            </p>
          </div>

          {/* IMAGE ADS GRID */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {MOCK_ADS_WITH_IMAGES.map((ad, i) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="card-cyber overflow-hidden flex flex-col"
                data-ocid={`passenger.item.${i + 1}`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={ad.imageSrc}
                    alt={ad.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                    }}
                  >
                    <h3 className="text-white font-display font-bold text-xs leading-tight truncate">
                      {ad.name}
                    </h3>
                  </div>
                </div>
                <div className="p-2.5 flex flex-col gap-1.5">
                  <p className="text-muted-foreground text-[10px] leading-snug line-clamp-2 flex-1">
                    {ad.description}
                  </p>
                  <a
                    href={ad.contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-colors"
                    style={{
                      background: "oklch(var(--neon-cyan) / 0.12)",
                      color: "oklch(var(--neon-cyan))",
                      border: "1px solid oklch(var(--neon-cyan) / 0.3)",
                    }}
                    data-ocid={`passenger.secondary_button.${i + 1}`}
                  >
                    {ad.whatsapp ? (
                      <MessageCircle size={10} />
                    ) : (
                      <ExternalLink size={10} />
                    )}
                    {ad.whatsapp ? "WhatsApp" : "Ver site"}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 mb-3">
            Mais anúncios
          </p>
          <div className="grid grid-cols-2 gap-3">
            {VISUAL_ADS.map((ad, i) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`card-cyber overflow-hidden flex flex-col ${ad.borderClass}`}
                data-ocid={`passenger.item.${i + 1}`}
              >
                {/* Colored header area */}
                <div
                  className={`bg-gradient-to-br ${ad.gradient} flex flex-col items-center justify-center pt-5 pb-4 px-3`}
                >
                  <span className="text-3xl mb-1">{ad.emoji}</span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2"
                    style={{
                      background: "oklch(1 0 0 / 0.15)",
                      color: "oklch(0.96 0.01 240)",
                    }}
                  >
                    {ad.category}
                  </span>
                  <h3
                    className="font-display font-extrabold text-sm text-center leading-tight"
                    style={{ color: "oklch(0.97 0.01 240)" }}
                  >
                    {ad.name}
                  </h3>
                </div>
                {/* Body */}
                <div className="p-3 flex flex-col flex-1 gap-2">
                  <p className="text-muted-foreground text-[10px] leading-snug text-center flex-1">
                    {ad.tagline}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                    <span>{ad.views} views</span>
                  </div>
                  <a
                    href={ad.contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-colors"
                    style={{
                      background: ad.glowColor.replace(")", " / 0.15)"),
                      color: ad.glowColor,
                      border: `1px solid ${ad.glowColor.replace(")", " / 0.3)")}`,
                    }}
                    data-ocid={`passenger.secondary_button.${i + 1}`}
                  >
                    <MessageCircle size={10} /> Ver mais
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Keep original MOCK_ADS below for extra content */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">
              Mais anúncios
            </p>
            {MOCK_ADS.map((ad, i) => (
              <div
                key={ad.id}
                className="card-cyber p-3 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-xs">{AD_NAMES[i]}</h4>
                  <p className="text-muted-foreground text-[10px] mt-0.5">
                    {Number(ad.viewCount)} views
                  </p>
                </div>
                <a
                  href={ad.contactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-neon-cyan"
                >
                  <ExternalLink size={10} /> Contato
                </a>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* CORRIDAS TAB — rich driver history */}
        <TabsContent value="corridas" className="mt-0 space-y-3">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card-cyber p-4 text-center">
              <div className="text-2xl font-display font-bold neon-text-purple">
                {totalHistoryTrips}
              </div>
              <div className="text-xs text-muted-foreground mt-1">corridas</div>
            </div>
            <div className="card-cyber p-4 text-center">
              <div className="text-xl font-display font-bold neon-text-green">
                {formatCurrency(totalHistorySpent)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                total gasto
              </div>
            </div>
          </div>

          {/* Driver history cards */}
          {MOCK_DRIVER_HISTORY.map((driver, i) => (
            <motion.div
              key={driver.driverId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-cyber p-4"
              data-ocid={`passenger.item.${i + 1}`}
            >
              <div className="flex items-start gap-3">
                {/* Driver avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden border-2"
                    style={{
                      borderColor: "oklch(var(--neon-cyan) / 0.5)",
                      boxShadow:
                        "0 0 14px oklch(var(--neon-cyan) / 0.3), 0 0 28px oklch(var(--neon-cyan) / 0.12)",
                    }}
                  >
                    <img
                      src={AVATAR_IMAGES[driver.driverAvatar]}
                      alt={driver.driverName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {driver.timeRemainingSeconds > 0 && (
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neon-green flex items-center justify-center"
                      style={{
                        boxShadow: "0 0 6px oklch(var(--neon-green) / 0.8)",
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-display font-bold text-sm truncate">
                      {driver.driverName}
                    </h3>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 flex-shrink-0"
                      style={{
                        background: "oklch(var(--neon-purple) / 0.15)",
                        color: "oklch(var(--neon-purple))",
                      }}
                    >
                      {driver.totalTrips} viagens
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {driver.vehicleModel} ·{" "}
                    <span className="font-mono">{driver.vehiclePlate}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Gasto total</span>
                      <div className="font-bold text-neon-green text-xs">
                        {formatCurrency(driver.totalSpent)}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Última corrida
                      </span>
                      <div className="font-semibold text-xs">
                        {driver.lastTripDate}
                      </div>
                    </div>
                  </div>

                  {/* Time remaining */}
                  {driver.timeRemainingSeconds > 0 ? (
                    <div
                      className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{ background: "oklch(var(--neon-green) / 0.1)" }}
                    >
                      <Wifi size={10} className="text-neon-green" />
                      <span className="text-[10px] text-neon-green font-semibold">
                        {formatTime(driver.timeRemainingSeconds)} disponível
                      </span>
                    </div>
                  ) : (
                    <div
                      className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                      style={{ background: "oklch(var(--border) / 0.5)" }}
                    >
                      <WifiOff size={10} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        Sem tempo disponível
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {driver.totalMinutes}min de internet usados
                </span>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] font-semibold text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  data-ocid={`passenger.secondary_button.${i + 1}`}
                >
                  <RefreshCw size={10} /> Reconectar
                </button>
              </div>
            </motion.div>
          ))}

          {/* Legacy trips */}
          {pastTrips.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1">
                Histórico de sessões
              </p>
              {pastTrips.map((trip, i) => (
                <div
                  key={trip.id}
                  className="card-cyber p-3 flex items-center justify-between"
                  data-ocid={`passenger.item.${MOCK_DRIVER_HISTORY.length + i + 1}`}
                >
                  <div>
                    <div className="font-semibold text-xs">Sessão #{i + 1}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(Number(trip.startTime))} ·{" "}
                      {Number(trip.paidMinutes) + Number(trip.freeMinutesUsed)}
                      min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-neon-green font-bold text-xs">
                      {formatCurrency(Number(trip.totalPaid))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {Number(trip.paidMinutes)}min pago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* GASTOS TAB */}
        <TabsContent value="gastos" className="mt-0 space-y-4">
          <div className="card-cyber p-4">
            <h3 className="font-display font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
              Gastos por Semana
            </h3>
            <div className="flex items-end gap-2 h-28">
              {spendingByWeek.map((week) => (
                <div
                  key={week.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-neon-green font-semibold">
                    {formatCurrency(week.value)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-neon-purple to-neon-cyan"
                    style={{ height: `${(week.value / maxSpend) * 80}px` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {week.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-cyber p-4 text-center">
              <div className="text-xl font-display font-bold neon-text-green">
                {formatCurrency(2000)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                total este mês
              </div>
            </div>
            <div className="card-cyber p-4 text-center">
              <div className="text-xl font-display font-bold neon-text-cyan">
                {formatCurrency(500)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                média por corrida
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CONFIGURAÇÕES TAB */}
        <TabsContent value="config" className="mt-0">
          <div className="card-cyber p-5 space-y-5" data-ocid="passenger.card">
            <h2 className="font-display text-lg font-bold">Meu Perfil</h2>
            <p className="text-muted-foreground text-xs -mt-3">
              Suas informações pessoais — visíveis apenas para você.
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <Input
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setSettingsSaved(false);
                  }}
                  placeholder="Seu nome"
                  className="mt-1 bg-input border-border"
                  data-ocid="passenger.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Cidade
                  </Label>
                  <Input
                    value={editCity}
                    onChange={(e) => {
                      setEditCity(e.target.value);
                      setSettingsSaved(false);
                    }}
                    placeholder="Sua cidade"
                    className="mt-1 bg-input border-border"
                    data-ocid="passenger.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Estado
                  </Label>
                  <Input
                    value={editState}
                    onChange={(e) => {
                      setEditState(e.target.value);
                      setSettingsSaved(false);
                    }}
                    placeholder="UF"
                    maxLength={2}
                    className="mt-1 bg-input border-border uppercase"
                    data-ocid="passenger.input"
                  />
                </div>
              </div>
            </div>

            {/* Read-only sensitive info */}
            <div
              className="p-3 rounded-xl space-y-2"
              style={{
                background: "oklch(var(--neon-purple) / 0.06)",
                border: "1px solid oklch(var(--neon-purple) / 0.2)",
              }}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Dados cadastrais
              </p>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">CPF</span>
                <span className="text-xs font-mono">
                  {profile.cpf
                    ? `${profile.cpf.slice(0, 3)}.***.***-${profile.cpf.slice(-2)}`
                    : "Não informado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Conta</span>
                <span className="text-xs text-neon-cyan">Passageiro</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setSettingsSaved(true)}
              className="w-full gradient-btn-primary rounded-xl"
              data-ocid="passenger.save_button"
            >
              {settingsSaved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Salvo!
                </span>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* QR Scanner Dialog */}
      <Dialog
        open={showQrScanner}
        onOpenChange={(o) => {
          if (!o) stopScanning();
          setShowQrScanner(o);
        }}
      >
        <DialogContent
          className="card-cyber max-w-sm"
          data-ocid="passenger.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Escanear QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden aspect-square bg-muted">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-40 h-40 rounded-xl border-2 border-neon-cyan"
                  style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)" }}
                />
              </div>
            </div>
            {!isScanning ? (
              <Button
                type="button"
                onClick={startScanning}
                disabled={!canStartScanning}
                className="w-full gradient-btn-secondary rounded-xl"
                data-ocid="passenger.primary_button"
              >
                Iniciar Câmera
              </Button>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Aponte para o QR Code do motorista...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent
          className="card-cyber max-w-sm"
          data-ocid="passenger.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle size={18} className="text-neon-orange" />
              Tempo Acabando!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Seu tempo está acabando. Deseja comprar mais tempo?
            </p>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  Minutos adicionais
                </span>
                <span className="font-bold text-foreground">
                  {requestMinutes} min
                </span>
              </div>
              <Slider
                value={[requestMinutes]}
                onValueChange={([v]) => setRequestMinutes(v)}
                min={1}
                max={20}
                step={1}
                className="my-2"
                data-ocid="passenger.select"
              />
              <div className="flex justify-between text-sm mt-3">
                <span className="text-muted-foreground">Total</span>
                <span className="text-neon-green font-bold">
                  {formatCurrency(
                    requestMinutes * (activeSession?.ratePerMinute || 50),
                  )}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setShowTimeWarning(false)}
                data-ocid="passenger.cancel_button"
              >
                Encerrar
              </Button>
              <Button
                type="button"
                onClick={handleRequestMoreTime}
                className="flex-1 gradient-btn-primary rounded-xl"
                data-ocid="passenger.confirm_button"
              >
                Comprar Tempo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdPhaseWrapper({ onComplete }: { onComplete: () => void }) {
  const AD_DURATION = (() => {
    const s = localStorage.getItem("conectarcar_ad_duration");
    if (!s) return 30;
    const n = Number.parseInt(s, 10);
    return Number.isNaN(n) ? 30 : n;
  })();
  const totalAds = 3;
  const ads = MANDATORY_ADS.slice(0, totalAds);

  const [currentAd, setCurrentAd] = useState(0);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [showSuccess, setShowSuccess] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-start on mount and when ad changes
  useEffect(() => {
    setCountdown(AD_DURATION);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [AD_DURATION]);

  useEffect(() => {
    if (countdown !== 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (currentAd < totalAds - 1) {
      successTimerRef.current = setTimeout(() => {
        setCurrentAd((prev) => prev + 1);
      }, 400);
    } else {
      setShowSuccess(true);
      successTimerRef.current = setTimeout(() => {
        onComplete();
      }, 2000);
    }
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [countdown, currentAd, onComplete]);

  const ad = ads[currentAd];
  const progress = ((AD_DURATION - countdown) / AD_DURATION) * 100;

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.22 0.08 145) 0%, oklch(0.08 0.02 260) 70%)",
        }}
        data-ocid="ad.success_state"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "oklch(var(--neon-green) / 0.15)",
            boxShadow:
              "0 0 60px oklch(var(--neon-green) / 0.4), 0 0 120px oklch(var(--neon-green) / 0.15)",
            border: "2px solid oklch(var(--neon-green) / 0.5)",
          }}
        >
          <CheckCircle2 size={56} className="text-neon-green" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl font-bold neon-text-green mb-3"
        >
          Internet Liberada!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground text-center px-8"
        >
          Obrigado por assistir os anúncios. Aproveite a viagem!
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black" data-ocid="ad.panel">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full"
        >
          {/* Full-screen background image */}
          <img
            src={ad.imageSrc}
            alt={ad.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)",
            }}
          />

          {/* TOP BAR */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-12 pb-4">
            <span
              className="text-white/90 font-semibold text-sm px-3 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.45)" }}
            >
              Anúncio {currentAd + 1} de {totalAds}
            </span>
            <div className="flex gap-2">
              {ads.map((_, i) => (
                <div
                  key={ads[i].id}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === currentAd ? "24px" : "8px",
                    height: "8px",
                    background:
                      i < currentAd
                        ? "oklch(var(--neon-green))"
                        : i === currentAd
                          ? "oklch(var(--neon-cyan))"
                          : "rgba(255,255,255,0.35)",
                    boxShadow:
                      i === currentAd
                        ? "0 0 8px oklch(var(--neon-cyan) / 0.8)"
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* CENTER — Giant countdown */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              key={countdown}
              initial={{ scale: 1.3, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div
                className="w-36 h-36 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "3px solid oklch(var(--neon-cyan) / 0.6)",
                  boxShadow:
                    "0 0 30px oklch(var(--neon-cyan) / 0.4), 0 0 60px oklch(var(--neon-cyan) / 0.15), inset 0 0 20px rgba(0,0,0,0.3)",
                }}
              >
                <span
                  className="font-display font-black leading-none"
                  style={{
                    fontSize: "4.5rem",
                    color: "oklch(var(--neon-cyan))",
                    textShadow:
                      "0 0 20px oklch(var(--neon-cyan) / 0.8), 0 0 40px oklch(var(--neon-cyan) / 0.4)",
                  }}
                >
                  {countdown}
                </span>
              </div>
              <p
                className="text-white/70 text-sm mt-3 font-medium"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
              >
                segundos restantes
              </p>
            </motion.div>
          </div>

          {/* BOTTOM OVERLAY */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-8">
            <div className="space-y-3">
              <div>
                <h2
                  className="text-white font-display font-extrabold text-2xl leading-tight"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
                >
                  {ad.name}
                </h2>
                <p
                  className="text-white/80 text-sm mt-1"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                >
                  {ad.description}
                </p>
              </div>
              <a
                href={ad.contactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  background: "oklch(var(--neon-cyan) / 0.2)",
                  border: "1px solid oklch(var(--neon-cyan) / 0.5)",
                  color: "oklch(var(--neon-cyan))",
                  boxShadow: "0 0 16px oklch(var(--neon-cyan) / 0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {ad.whatsapp ? (
                  <MessageCircle size={16} />
                ) : (
                  <ExternalLink size={16} />
                )}
                {ad.whatsapp ? "Chamar no WhatsApp" : "Visitar site"}
              </a>
            </div>
            <div
              className="mt-4 h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(to right, oklch(var(--neon-cyan)), oklch(var(--neon-purple)))",
                  boxShadow: "0 0 8px oklch(var(--neon-cyan) / 0.6)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
