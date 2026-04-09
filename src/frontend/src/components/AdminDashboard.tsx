import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  BarChart2,
  Car,
  ChevronLeft,
  ChevronRight,
  Copy,
  LogOut,
  MapPin,
  Megaphone,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { UserRole } from "../backend";
import {
  useAdminBanUser,
  useAdminDeleteUser,
  useAdminGetAllProfiles,
  useAdminGetStats,
} from "../hooks/useQueries";

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "pauloroberto5002@gmail.com";
const ADMIN_PASSWORD = "Paulo@67501388@Paulo";
const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeSince(createdAt: bigint): string {
  const ms = Number(createdAt);
  const now = Date.now();
  const diff = now - ms;
  const days = Math.floor(diff / 86400000);
  if (days > 365) return `${Math.floor(days / 365)}a`;
  if (days > 30) return `${Math.floor(days / 30)}m`;
  if (days > 0) return `${days}d`;
  return "hoje";
}

function truncateDeviceId(id: string): string {
  if (!id || id === "unknown-device") return "—";
  return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

function getStatusLabel(profile: UserProfile): {
  label: string;
  color: string;
} {
  if (profile.isBanned)
    return {
      label: "Banido",
      color: "text-red-400 bg-red-900/30 border-red-700/40",
    };
  if (
    profile.subscriptionPlan === "none" ||
    profile.subscriptionExpiry === BigInt(0)
  )
    return {
      label: "Sem Assinatura",
      color: "text-yellow-400 bg-yellow-900/20 border-yellow-700/40",
    };
  return {
    label: "Ativo",
    color: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40",
  };
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  user: UserProfile | null;
  action: "ban" | "delete" | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  user,
  action,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!user || !action) return null;
  const isBan = action === "ban";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 border border-slate-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isBan ? "bg-yellow-900/40" : "bg-red-900/40"}`}
        >
          {isBan ? (
            <AlertTriangle size={24} className="text-yellow-400" />
          ) : (
            <Trash2 size={24} className="text-red-400" />
          )}
        </div>
        <h3 className="text-slate-100 font-bold text-lg text-center mb-1">
          Tem certeza?
        </h3>
        <p className="text-slate-400 text-sm text-center mb-4">
          {isBan ? "Banir" : "Excluir permanentemente"}{" "}
          <strong className="text-slate-200">{user.name}</strong>?
        </p>
        <div className="bg-slate-900/60 rounded-xl p-3 mb-5 space-y-1 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Papel:</span>
            <span className="text-slate-300">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span>Cidade:</span>
            <span className="text-slate-300">
              {user.city}/{user.state}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Device ID:</span>
            <span className="text-slate-300 font-mono">
              {truncateDeviceId(user.deviceId)}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 font-bold ${isBan ? "bg-yellow-600 hover:bg-yellow-500 text-black" : "bg-red-600 hover:bg-red-500 text-white"}`}
            data-ocid="admin.confirm_button"
          >
            {isBan ? "Banir" : "Excluir"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── User Table ───────────────────────────────────────────────────────────────
interface UserTableProps {
  profiles: UserProfile[];
  onBan: (u: UserProfile) => void;
  onDelete: (u: UserProfile) => void;
}

function UserTable({ profiles, onBan, onDelete }: UserTableProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(profiles.length / PAGE_SIZE));
  const slice = profiles.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (profiles.length === 0) {
    return (
      <div
        className="text-center py-12 text-slate-500"
        data-ocid="admin.empty_state"
      >
        <Users size={32} className="mx-auto mb-3 opacity-40" />
        <p>Nenhum usuário encontrado</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80">
              {[
                "Nome / E-mail",
                "Cidade / Estado",
                "Device ID",
                "Status",
                "Assinatura",
                "Na plataforma",
                "Ações",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((u, i) => {
              const status = getStatusLabel(u);
              const principalStr = u.id.toString();
              return (
                <tr
                  key={principalStr}
                  className={`border-b border-slate-700/50 transition-colors hover:bg-slate-700/30 ${i % 2 === 0 ? "bg-slate-800/20" : "bg-slate-900/20"}`}
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-200 font-semibold truncate max-w-[120px]">
                          {u.name}
                        </p>
                        <p className="text-slate-500 text-xs font-mono truncate max-w-[120px]">
                          {principalStr.slice(0, 12)}…
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {u.city}
                    <span className="text-slate-500">/{u.state}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(u.deviceId);
                        toast.success("Device ID copiado!");
                      }}
                      className="font-mono text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      title={u.deviceId}
                    >
                      {truncateDeviceId(u.deviceId)}
                      <Copy size={10} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {u.subscriptionPlan === "none" ? (
                      <span className="text-slate-600">—</span>
                    ) : (
                      <>
                        <span className="text-blue-400">
                          {u.subscriptionPlan}
                        </span>
                        {u.subscriptionExpiry > BigInt(0) && (
                          <p className="text-slate-600">
                            {new Date(
                              Number(u.subscriptionExpiry),
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {timeSince(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onBan(u)}
                        title="Banir usuário"
                        className="p-1.5 rounded-lg bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/60 transition-colors"
                        data-ocid={`admin.ban_button.${i + 1}`}
                      >
                        <AlertTriangle size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(u)}
                        title="Excluir usuário"
                        className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/60 transition-colors"
                        data-ocid={`admin.delete_button.${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-slate-500 text-xs">
            Página {page + 1} de {totalPages} • {profiles.length} usuários
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="border-slate-600 text-slate-400 hover:bg-slate-700 h-8 w-8 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-600 text-slate-400 hover:bg-slate-700 h-8 w-8 p-0"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuth", "true");
      onSuccess();
    } else {
      setError("Credenciais inválidas");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/40">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-display">
            ConectarCar
          </h1>
          <p className="text-slate-500 text-sm mt-1">Acesso Administrativo</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="text-xs text-slate-400 font-medium uppercase tracking-wider"
            >
              E-mail
            </label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              className="mt-1.5 bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-600 focus:border-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              data-ocid="admin.input"
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="text-xs text-slate-400 font-medium uppercase tracking-wider"
            >
              Senha
            </label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-600 focus:border-blue-500"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              data-ocid="admin.input"
            />
          </div>
          {error && (
            <p
              className="text-red-400 text-sm font-medium text-center bg-red-900/20 border border-red-700/40 rounded-lg py-2"
              data-ocid="admin.error_state"
            >
              {error}
            </p>
          )}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-5 rounded-xl mt-1"
            data-ocid="admin.submit_button"
          >
            {loading ? "Verificando..." : "Entrar como Administrador"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
export function AdminDashboard() {
  const [isAuthed, setIsAuthed] = useState(
    () => sessionStorage.getItem("adminAuth") === "true",
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "drivers" | "passengers" | "advertisers"
  >("overview");
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [confirmUser, setConfirmUser] = useState<UserProfile | null>(null);
  const [confirmAction, setConfirmAction] = useState<"ban" | "delete" | null>(
    null,
  );

  const { data: allProfiles = [], isLoading } = useAdminGetAllProfiles();
  const { data: stats } = useAdminGetStats();
  const banUser = useAdminBanUser();
  const deleteUser = useAdminDeleteUser();

  const drivers = useMemo(
    () => allProfiles.filter((p) => p.role === UserRole.driver),
    [allProfiles],
  );
  const passengers = useMemo(
    () => allProfiles.filter((p) => p.role === UserRole.passenger),
    [allProfiles],
  );
  const advertisers = useMemo(
    () => allProfiles.filter((p) => p.role === UserRole.advertiser),
    [allProfiles],
  );

  const availableStates = useMemo(
    () => [...new Set(allProfiles.map((p) => p.state).filter(Boolean))].sort(),
    [allProfiles],
  );
  const availableCities = useMemo(() => {
    const src = filterState
      ? allProfiles.filter((p) => p.state === filterState)
      : allProfiles;
    return [...new Set(src.map((p) => p.city).filter(Boolean))].sort();
  }, [allProfiles, filterState]);

  // Reset city when state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on filterState change
  useEffect(() => {
    setFilterCity("");
  }, [filterState]);

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((p) => {
        const matchSearch =
          !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchState = !filterState || p.state === filterState;
        const matchCity = !filterCity || p.city === filterCity;
        return matchSearch && matchState && matchCity;
      }),
    [drivers, search, filterState, filterCity],
  );

  const filteredPassengers = useMemo(
    () =>
      passengers.filter((p) => {
        const matchSearch =
          !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchState = !filterState || p.state === filterState;
        const matchCity = !filterCity || p.city === filterCity;
        return matchSearch && matchState && matchCity;
      }),
    [passengers, search, filterState, filterCity],
  );

  const filteredAdvertisers = useMemo(
    () =>
      advertisers.filter((p) => {
        const matchSearch =
          !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchState = !filterState || p.state === filterState;
        const matchCity = !filterCity || p.city === filterCity;
        return matchSearch && matchState && matchCity;
      }),
    [advertisers, search, filterState, filterCity],
  );

  const handleConfirm = async () => {
    if (!confirmUser || !confirmAction) return;
    const userId = confirmUser.id.toString();
    try {
      if (confirmAction === "ban") {
        await banUser.mutateAsync(userId);
        toast.success(`${confirmUser.name} banido com sucesso.`);
      } else {
        await deleteUser.mutateAsync(userId);
        toast.success(`${confirmUser.name} excluído da plataforma.`);
      }
    } catch {
      toast.error("Erro ao executar ação. Tente novamente.");
    }
    setConfirmUser(null);
    setConfirmAction(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthed(false);
  };

  if (!isAuthed) {
    return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
  }

  const totalBanned = stats
    ? Number(stats.totalBanned)
    : allProfiles.filter((p) => p.isBanned).length;
  const activeSubscriptions = stats ? Number(stats.activeSubscriptions) : 0;
  const estimatedRevenue = (drivers.length * 9.9 + advertisers.length * 15)
    .toFixed(2)
    .replace(".", ",");

  const overviewCards = [
    {
      label: "Total Motoristas",
      value: stats ? Number(stats.totalDrivers) : drivers.length,
      icon: <Car size={20} />,
      color: "from-cyan-600 to-blue-600",
      glow: "shadow-cyan-900/30",
    },
    {
      label: "Total Passageiros",
      value: stats ? Number(stats.totalPassengers) : passengers.length,
      icon: <User size={20} />,
      color: "from-purple-600 to-violet-600",
      glow: "shadow-purple-900/30",
    },
    {
      label: "Total Anunciantes",
      value: stats ? Number(stats.totalAdvertisers) : advertisers.length,
      icon: <Megaphone size={20} />,
      color: "from-orange-600 to-amber-500",
      glow: "shadow-orange-900/30",
    },
    {
      label: "Usuários Banidos",
      value: totalBanned,
      icon: <Shield size={20} />,
      color: "from-red-700 to-rose-600",
      glow: "shadow-red-900/30",
    },
    {
      label: "Assinaturas Ativas",
      value: activeSubscriptions,
      icon: <Wifi size={20} />,
      color: "from-emerald-600 to-teal-500",
      glow: "shadow-emerald-900/30",
    },
    {
      label: "Receita Estimada",
      value: `R$ ${estimatedRevenue}`,
      icon: <BarChart2 size={20} />,
      color: "from-green-600 to-emerald-500",
      glow: "shadow-green-900/30",
    },
  ];

  const tabs = [
    {
      id: "overview" as const,
      label: "Visão Geral",
      icon: <BarChart2 size={15} />,
      count: null,
    },
    {
      id: "drivers" as const,
      label: "Motoristas",
      icon: <Car size={15} />,
      count: filteredDrivers.length,
    },
    {
      id: "passengers" as const,
      label: "Passageiros",
      icon: <User size={15} />,
      count: filteredPassengers.length,
    },
    {
      id: "advertisers" as const,
      label: "Anunciantes",
      icon: <Megaphone size={15} />,
      count: filteredAdvertisers.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-700/60 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-slate-100 text-sm">
              ConectarCar
            </span>
            <span className="text-slate-500 text-xs ml-2 hidden sm:inline">
              Painel Administrativo
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 bg-slate-800 border border-slate-700 hover:border-red-700/50 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
            data-ocid="admin.logout_button"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>

        {/* Filters row — always visible, stacks on mobile */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-2">
          <MapPin size={14} className="text-slate-500 flex-shrink-0" />
          <label htmlFor="filter-state" className="sr-only">
            Filtrar por estado
          </label>
          <select
            id="filter-state"
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 flex-1 min-w-[120px]"
            data-ocid="admin.filter_state"
          >
            <option value="">Todos estados</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label htmlFor="filter-city" className="sr-only">
            Filtrar por cidade
          </label>
          <select
            id="filter-city"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 flex-1 min-w-[120px]"
            data-ocid="admin.filter_city"
          >
            <option value="">Todas cidades</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {overviewCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 shadow-lg ${card.glow}`}
                data-ocid={`admin.item.${i + 1}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3 shadow-md`}
                >
                  {card.icon}
                </div>
                <div className="text-xl font-bold text-slate-100">
                  {isLoading ? (
                    <Skeleton className="h-6 w-14 bg-slate-700" />
                  ) : (
                    card.value
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {card.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <div
          className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-1"
          data-ocid="admin.tab"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? "bg-white/20" : "bg-slate-700"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search bar (for user tabs) */}
        {activeTab !== "overview" && (
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="pl-9 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-blue-500"
              data-ocid="admin.search_input"
            />
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
                <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart2 size={16} className="text-blue-400" /> Receita
                  Mensal Estimada
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: `Mensalidades motoristas (${drivers.length})`,
                      value: drivers.length * 9.9,
                    },
                    {
                      label: `Mensalidades anunciantes (${advertisers.length})`,
                      value: advertisers.length * 15,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-400 text-sm">
                        {row.label}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        R$ {row.value.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-200">Total</span>
                    <span className="text-emerald-400 font-bold text-xl">
                      R$ {estimatedRevenue}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "drivers" && (
            <motion.div
              key="drivers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-16 w-full bg-slate-800 rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <UserTable
                  profiles={filteredDrivers}
                  onBan={(u) => {
                    setConfirmUser(u);
                    setConfirmAction("ban");
                  }}
                  onDelete={(u) => {
                    setConfirmUser(u);
                    setConfirmAction("delete");
                  }}
                />
              )}
            </motion.div>
          )}

          {activeTab === "passengers" && (
            <motion.div
              key="passengers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-16 w-full bg-slate-800 rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <UserTable
                  profiles={filteredPassengers}
                  onBan={(u) => {
                    setConfirmUser(u);
                    setConfirmAction("ban");
                  }}
                  onDelete={(u) => {
                    setConfirmUser(u);
                    setConfirmAction("delete");
                  }}
                />
              )}
            </motion.div>
          )}

          {activeTab === "advertisers" && (
            <motion.div
              key="advertisers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      className="h-16 w-full bg-slate-800 rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <UserTable
                  profiles={filteredAdvertisers}
                  onBan={(u) => {
                    setConfirmUser(u);
                    setConfirmAction("ban");
                  }}
                  onDelete={(u) => {
                    setConfirmUser(u);
                    setConfirmAction("delete");
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        user={confirmUser}
        action={confirmAction}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmUser(null);
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
