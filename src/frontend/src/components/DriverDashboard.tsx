import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  QrCode,
  Settings,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { AVATAR_IMAGES } from "../utils/avatars";
import { formatCurrency } from "../utils/mockData";

interface DriverDashboardProps {
  profile: UserProfile;
  onProfileUpdate?: (updates: Partial<UserProfile>) => void;
}

interface PendingRequest {
  id: string;
  passengerName: string;
  minutes: number;
  amount: number;
  method: "pix" | "cash";
}

interface PassengerRecord {
  passengerId: string;
  passengerName: string;
  passengerAvatar: number;
  totalTrips: number;
  totalMinutesUsed: number;
  lastSeen: string;
}

const MOCK_REQUESTS: PendingRequest[] = [
  {
    id: "req_1",
    passengerName: "Maria Santos",
    minutes: 5,
    amount: 250,
    method: "pix",
  },
  {
    id: "req_2",
    passengerName: "Pedro Costa",
    minutes: 10,
    amount: 500,
    method: "cash",
  },
];

const MOCK_PASSENGERS: PassengerRecord[] = [
  {
    passengerId: "pass_001",
    passengerName: "Maria",
    passengerAvatar: 0,
    totalTrips: 6,
    totalMinutesUsed: 72,
    lastSeen: "02/04/2026",
  },
  {
    passengerId: "pass_002",
    passengerName: "Pedro",
    passengerAvatar: 3,
    totalTrips: 4,
    totalMinutesUsed: 48,
    lastSeen: "01/04/2026",
  },
  {
    passengerId: "pass_003",
    passengerName: "Luiza",
    passengerAvatar: 1,
    totalTrips: 9,
    totalMinutesUsed: 113,
    lastSeen: "31/03/2026",
  },
  {
    passengerId: "pass_004",
    passengerName: "Rafael",
    passengerAvatar: 4,
    totalTrips: 2,
    totalMinutesUsed: 18,
    lastSeen: "28/03/2026",
  },
  {
    passengerId: "pass_005",
    passengerName: "Ana",
    passengerAvatar: 2,
    totalTrips: 7,
    totalMinutesUsed: 85,
    lastSeen: "25/03/2026",
  },
];

export function DriverDashboard({
  profile,
  onProfileUpdate,
}: DriverDashboardProps) {
  const [freeMinutes, setFreeMinutes] = useState(
    Number(profile.freeMinutes) || 5,
  );
  const [ratePerMin, setRatePerMin] = useState(
    Number(profile.minuteRate) || 50,
  );
  const [isActive, setIsActive] = useState(true);
  const [adDuration, setAdDuration] = useState<30 | 60>(
    () =>
      (Number.parseInt(
        localStorage.getItem("conectarcar_ad_duration") || "30",
        10,
      ) as 30 | 60) || 30,
  );
  const [pendingRequests, setPendingRequests] =
    useState<PendingRequest[]>(MOCK_REQUESTS);
  const [confirmedPayments, setConfirmedPayments] = useState<
    Array<{ name: string; amount: number; minutes: number }>
  >([]);

  // Profile settings state
  const [editName, setEditName] = useState(profile.name || "");
  const [editCity, setEditCity] = useState(profile.city || "");
  const [editState, setEditState] = useState(profile.state || "");
  const [editCarModel, setEditCarModel] = useState(profile.carModel || "");
  const [editCarPlate, setEditCarPlate] = useState(profile.carPlate || "");
  const [profileSaved, setProfileSaved] = useState(false);

  const driverId = profile.id.toString();
  const qrContent = `conectarcar://driver/${driverId}`;
  const earningsThisMonth =
    confirmedPayments.reduce((acc, p) => acc + p.amount, 0) + 3450;

  const earningsByWeek = [
    { label: "Sem 1", value: 1200 },
    { label: "Sem 2", value: 850 },
    { label: "Sem 3", value: 1400 },
    { label: "Sem 4", value: Math.max(earningsThisMonth - 3450, 0) },
  ];
  const maxEarning = Math.max(...earningsByWeek.map((w) => w.value), 1);

  const confirmRequest = (req: PendingRequest) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    setConfirmedPayments((prev) => [
      ...prev,
      { name: req.passengerName, amount: req.amount, minutes: req.minutes },
    ]);
    toast.success(
      `${req.minutes} minutos liberados para ${req.passengerName}!`,
    );
  };

  const saveSettings = () => {
    if (onProfileUpdate) {
      onProfileUpdate({
        freeMinutes: BigInt(freeMinutes),
        minuteRate: BigInt(ratePerMin),
      });
    }
    localStorage.setItem("conectarcar_ad_duration", String(adDuration));
    toast.success("Configurações salvas!");
  };

  return (
    <div className="min-h-screen pt-16 pb-8 px-4">
      <Tabs defaultValue="qrcode" className="max-w-sm mx-auto">
        <TabsList
          className="w-full mb-4 bg-card border border-border rounded-xl p-1 mt-4 grid grid-cols-6"
          data-ocid="driver.tab"
        >
          <TabsTrigger
            value="qrcode"
            className="text-[9px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-0.5 py-1.5"
          >
            <QrCode size={11} />
            <span>QR</span>
          </TabsTrigger>
          <TabsTrigger
            value="notif"
            className="text-[9px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-0.5 py-1.5"
          >
            <Bell size={11} />
            <span>Pedidos</span>
          </TabsTrigger>
          <TabsTrigger
            value="passageiros"
            className="text-[9px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-0.5 py-1.5"
          >
            <Users size={11} />
            <span>Pass.</span>
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="text-[9px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-0.5 py-1.5"
          >
            <Settings size={11} />
            <span>Config</span>
          </TabsTrigger>
          <TabsTrigger
            value="ganhos"
            className="text-[9px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-0.5 py-1.5"
          >
            <TrendingUp size={11} />
            <span>Ganhos</span>
          </TabsTrigger>
          <TabsTrigger
            value="perfil"
            className="text-[9px] rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex flex-col gap-0.5 py-1.5"
          >
            <Settings size={11} />
            <span>Perfil</span>
          </TabsTrigger>
        </TabsList>

        {/* QR CODE TAB */}
        <TabsContent value="qrcode">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-cyber p-5 space-y-4"
            data-ocid="driver.card"
          >
            <div className="text-center">
              <h2 className="font-display text-xl font-bold">Seu QR Code</h2>
              <p className="text-muted-foreground text-xs mt-1">
                Mostre para o passageiro escanear
              </p>
            </div>
            <div
              className="w-48 h-48 mx-auto rounded-xl p-3 flex items-center justify-center"
              style={{ background: "white" }}
            >
              <div className="relative w-full h-full">
                <QrCodeDisplay value={qrContent} />
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">ID do Motorista</p>
              <p className="text-xs font-mono text-foreground mt-0.5 break-all">
                {driverId.slice(0, 20)}...
              </p>
            </div>
            <Button
              type="button"
              onClick={() => toast.success("QR Code copiado!")}
              className="w-full gradient-btn-secondary rounded-xl"
              data-ocid="driver.primary_button"
            >
              <Download size={14} className="mr-2" /> Baixar / Imprimir
            </Button>
          </motion.div>
        </TabsContent>

        {/* NOTIFICAÇÕES TAB */}
        <TabsContent value="notif" className="space-y-3">
          {pendingRequests.length === 0 && confirmedPayments.length === 0 && (
            <div
              className="card-cyber p-8 text-center text-muted-foreground"
              data-ocid="driver.empty_state"
            >
              Nenhum pedido pendente
            </div>
          )}
          {pendingRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-cyber p-4 neon-border-purple"
              data-ocid={`driver.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm">{req.passengerName}</h3>
                  <p className="text-muted-foreground text-xs">
                    Quer mais{" "}
                    <strong className="text-foreground">
                      {req.minutes} minutos
                    </strong>
                  </p>
                </div>
                <span className="text-neon-green font-bold">
                  {formatCurrency(req.amount)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => confirmRequest(req)}
                  className="flex-1 gradient-btn-primary rounded-xl text-xs"
                  data-ocid={`driver.confirm_button.${i + 1}`}
                >
                  <Check size={12} className="mr-1" /> Confirmar (Pix)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => confirmRequest(req)}
                  className="flex-1 border-neon-cyan/40 text-neon-cyan text-xs hover:bg-neon-cyan/10"
                  data-ocid={`driver.secondary_button.${i + 1}`}
                >
                  <DollarSign size={12} className="mr-1" /> Liberar (Dinheiro)
                </Button>
              </div>
            </motion.div>
          ))}
          {confirmedPayments.map((p, i) => (
            <div
              key={`confirmed-${p.name}-${i}`}
              className="card-cyber p-3 flex items-center justify-between opacity-60"
              data-ocid={`driver.item.${pendingRequests.length + i + 1}`}
            >
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-neon-green">
                  {p.minutes}min liberados ✓
                </p>
              </div>
              <span className="text-neon-green font-bold text-sm">
                {formatCurrency(p.amount)}
              </span>
            </div>
          ))}
        </TabsContent>

        {/* PASSAGEIROS TAB */}
        <TabsContent value="passageiros" className="space-y-3">
          <div className="card-cyber p-3 mb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Controle de Passageiros
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(var(--neon-green) / 0.12)",
                  color: "oklch(var(--neon-green))",
                }}
              >
                {MOCK_PASSENGERS.length} total
              </span>
            </div>
          </div>
          {MOCK_PASSENGERS.map((passenger, i) => (
            <motion.div
              key={passenger.passengerId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card-cyber p-4 flex items-center gap-3"
              data-ocid={`driver.item.${i + 1}`}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border"
                style={{
                  borderColor: "oklch(var(--neon-cyan) / 0.4)",
                  boxShadow:
                    "0 0 10px oklch(var(--neon-cyan) / 0.25), 0 0 20px oklch(var(--neon-cyan) / 0.1)",
                }}
              >
                <img
                  src={AVATAR_IMAGES[passenger.passengerAvatar]}
                  alt={passenger.passengerName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm truncate">
                    {passenger.passengerName}
                  </h3>
                  <span
                    className="text-[10px] font-bold ml-1 flex-shrink-0"
                    style={{ color: "oklch(var(--neon-purple))" }}
                  >
                    {passenger.totalTrips} viagens
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(var(--neon-green))" }}
                  >
                    {passenger.totalMinutesUsed}min total
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Visto: {passenger.lastSeen}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {MOCK_PASSENGERS.length === 0 && (
            <div
              className="card-cyber p-8 text-center text-muted-foreground"
              data-ocid="driver.empty_state"
            >
              Nenhum passageiro ainda
            </div>
          )}
        </TabsContent>

        {/* CONFIGURAÇÕES TAB */}
        <TabsContent value="config">
          <div className="card-cyber p-5 space-y-6" data-ocid="driver.card">
            <h2 className="font-display text-lg font-bold">Configurações</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minutos gratuitos</span>
                <span className="font-bold">{freeMinutes} min</span>
              </div>
              <Slider
                value={[freeMinutes]}
                onValueChange={([v]) => setFreeMinutes(v)}
                min={5}
                max={10}
                step={1}
                data-ocid="driver.select"
              />
              <p className="text-xs text-muted-foreground">
                Tempo gratuito após assistir os anúncios
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor por minuto</span>
                <span className="font-bold text-neon-green">
                  {formatCurrency(ratePerMin)}
                </span>
              </div>
              <Slider
                value={[ratePerMin]}
                onValueChange={([v]) => setRatePerMin(v)}
                min={50}
                max={100}
                step={5}
                data-ocid="driver.select"
              />
              <p className="text-xs text-muted-foreground">
                R$ 0,50 a R$ 1,00 por minuto
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Aceitar conexões</Label>
                <p className="text-xs text-muted-foreground">
                  Ative para permitir novos passageiros
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                data-ocid="driver.switch"
              />
            </div>
            <div
              className="p-3 rounded-xl"
              style={{
                background: isActive
                  ? "oklch(var(--neon-green) / 0.1)"
                  : "oklch(var(--border))",
              }}
            >
              <div className="flex items-center gap-2">
                {isActive ? (
                  <Wifi size={14} className="text-neon-green" />
                ) : (
                  <WifiOff size={14} className="text-muted-foreground" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-neon-green" : "text-muted-foreground"
                  }`}
                >
                  {isActive ? "Aceitando passageiros" : "Offline"}
                </span>
              </div>
            </div>

            {/* AD DURATION SETTING */}
            <div
              className="p-4 rounded-xl space-y-3"
              style={{
                background: "oklch(var(--neon-purple) / 0.07)",
                border: "1px solid oklch(var(--neon-purple) / 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock
                  size={14}
                  style={{ color: "oklch(var(--neon-purple))" }}
                />
                <span className="text-sm font-semibold">
                  Duração dos Anúncios
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdDuration(30)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background:
                      adDuration === 30
                        ? "oklch(var(--neon-purple) / 0.25)"
                        : "oklch(var(--card))",
                    border:
                      adDuration === 30
                        ? "1.5px solid oklch(var(--neon-purple) / 0.7)"
                        : "1.5px solid oklch(var(--border))",
                    color:
                      adDuration === 30
                        ? "oklch(var(--neon-purple))"
                        : "oklch(var(--muted-foreground))",
                    boxShadow:
                      adDuration === 30
                        ? "0 0 12px oklch(var(--neon-purple) / 0.3)"
                        : "none",
                  }}
                  data-ocid="driver.toggle"
                >
                  30 seg
                </button>
                <button
                  type="button"
                  onClick={() => setAdDuration(60)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background:
                      adDuration === 60
                        ? "oklch(var(--neon-purple) / 0.25)"
                        : "oklch(var(--card))",
                    border:
                      adDuration === 60
                        ? "1.5px solid oklch(var(--neon-purple) / 0.7)"
                        : "1.5px solid oklch(var(--border))",
                    color:
                      adDuration === 60
                        ? "oklch(var(--neon-purple))"
                        : "oklch(var(--muted-foreground))",
                    boxShadow:
                      adDuration === 60
                        ? "0 0 12px oklch(var(--neon-purple) / 0.3)"
                        : "none",
                  }}
                  data-ocid="driver.toggle"
                >
                  60 seg
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tempo que cada anúncio fica na tela do passageiro
              </p>
            </div>

            <Button
              type="button"
              onClick={saveSettings}
              className="w-full gradient-btn-primary rounded-xl"
              data-ocid="driver.save_button"
            >
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>

        {/* GANHOS TAB */}
        <TabsContent value="ganhos" className="space-y-4">
          <div className="card-cyber p-5">
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
              Este mês
            </p>
            <div className="text-3xl font-display font-bold neon-text-green">
              {formatCurrency(earningsThisMonth)}
            </div>
          </div>
          <div className="card-cyber p-4">
            <h3 className="font-display font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
              Ganhos por Semana
            </h3>
            <div className="flex items-end gap-2 h-28">
              {earningsByWeek.map((week) => (
                <div
                  key={week.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-neon-green font-semibold">
                    {formatCurrency(week.value)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-neon-green to-neon-cyan"
                    style={{ height: `${(week.value / maxEarning) * 80}px` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {week.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {confirmedPayments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider px-1">
                Pagamentos Confirmados
              </h3>
              {confirmedPayments.map((p, i) => (
                <div
                  key={`payment-${p.name}-${i}`}
                  className="card-cyber p-3 flex justify-between items-center"
                >
                  <span className="text-sm">
                    {p.name} — {p.minutes}min
                  </span>
                  <span className="text-neon-green font-bold text-sm">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PARCERIAS / PERFIL TAB */}
        <TabsContent value="perfil" className="space-y-3">
          <div className="card-cyber p-5 space-y-5" data-ocid="driver.card">
            <h2 className="font-display text-lg font-bold">Meu Perfil</h2>
            <p className="text-muted-foreground text-xs -mt-3">
              Suas informações — visíveis apenas para você.
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Nome</Label>
                <Input
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setProfileSaved(false);
                  }}
                  placeholder="Seu nome"
                  className="mt-1 bg-input border-border"
                  data-ocid="driver.input"
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
                      setProfileSaved(false);
                    }}
                    placeholder="Sua cidade"
                    className="mt-1 bg-input border-border"
                    data-ocid="driver.input"
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
                      setProfileSaved(false);
                    }}
                    placeholder="UF"
                    maxLength={2}
                    className="mt-1 bg-input border-border uppercase"
                    data-ocid="driver.input"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Modelo do veículo
                </Label>
                <Input
                  value={editCarModel}
                  onChange={(e) => {
                    setEditCarModel(e.target.value);
                    setProfileSaved(false);
                  }}
                  placeholder="Ex: Hyundai HB20"
                  className="mt-1 bg-input border-border"
                  data-ocid="driver.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Placa</Label>
                <Input
                  value={editCarPlate}
                  onChange={(e) => {
                    setEditCarPlate(e.target.value);
                    setProfileSaved(false);
                  }}
                  placeholder="ABC-1234"
                  className="mt-1 bg-input border-border"
                  data-ocid="driver.input"
                />
              </div>
            </div>

            <div
              className="p-3 rounded-xl space-y-2"
              style={{
                background: "oklch(var(--neon-green) / 0.06)",
                border: "1px solid oklch(var(--neon-green) / 0.2)",
              }}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Status da conta
              </p>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Perfil</span>
                <span className="text-xs text-neon-green">Motorista</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Mensalidade
                </span>
                <span className="text-xs font-bold">R$ 9,90/mês</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                setProfileSaved(true);
                toast.success("Perfil atualizado!");
              }}
              className="w-full gradient-btn-primary rounded-xl"
              data-ocid="driver.save_button"
            >
              {profileSaved ? (
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
    </div>
  );
}

function QrCodeDisplay({ value }: { value: string }) {
  const size = 15;
  const cells: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  for (let r = 0; r < size; r++) {
    cells[r] = [];
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 7 && c < 7) ||
        (r < 7 && c >= size - 7) ||
        (r >= size - 7 && c < 7);
      if (inFinder) {
        const inOuter =
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          r === size - 7 ||
          r === size - 1 ||
          c === size - 7 ||
          c === size - 1;
        const inInner =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
          (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4);
        cells[r][c] = inOuter || inInner;
      } else {
        const seed = (hash ^ (r * 17 + c * 31)) >>> 0;
        cells[r][c] = seed % 3 !== 0;
      }
    }
  }

  return (
    <div
      className="grid w-full h-full"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gap: "1px" }}
    >
      {cells.flat().map((filled, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: flat grid cells are positional by nature
        <div key={i} style={{ background: filled ? "#000" : "#fff" }} />
      ))}
    </div>
  );
}
