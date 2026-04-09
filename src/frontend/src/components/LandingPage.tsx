import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  BarChart2,
  Car,
  Eye,
  EyeOff,
  Megaphone,
  Shield,
  Sparkles,
  User,
  Wifi,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AVATAR_IMAGES } from "../utils/avatars";
import { AvatarPicker } from "./AvatarPicker";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  onRoleSelect: (role: "passenger" | "driver" | "advertiser") => void;
}

const ROLE_CARDS = [
  {
    role: "passenger" as const,
    label: "Passageiro",
    desc: "Assista 3 anúncios rápidos e aproveite o Wi-Fi de graça durante sua viagem.",
    icon: <User size={18} />,
    avatar: AVATAR_IMAGES[0],
    glowColor: "oklch(var(--neon-purple))",
    borderClass: "neon-border-purple",
    btnClass: "gradient-btn-secondary",
    hoverBg: "oklch(var(--neon-purple) / 0.08)",
    badgeColor: "text-neon-purple",
    badgeBg: "oklch(var(--neon-purple) / 0.12)",
  },
  {
    role: "driver" as const,
    label: "Motorista",
    desc: "Compartilhe seu internet de forma inteligente. Configure tarifas e acompanhe seus ganhos.",
    icon: <Car size={18} />,
    avatar: AVATAR_IMAGES[2],
    glowColor: "oklch(var(--neon-green))",
    borderClass: "neon-border-green",
    btnClass: "gradient-btn-primary",
    hoverBg: "oklch(var(--neon-green) / 0.08)",
    badgeColor: "text-neon-green",
    badgeBg: "oklch(var(--neon-green) / 0.12)",
  },
  {
    role: "advertiser" as const,
    label: "Anunciante",
    desc: "Alcance centenas de passageiros na sua cidade. Anuncie em vídeo de 30s.",
    icon: <Megaphone size={18} />,
    avatar: AVATAR_IMAGES[4],
    glowColor: "oklch(var(--neon-orange))",
    borderClass: "",
    btnClass: "gradient-btn-secondary",
    hoverBg: "oklch(var(--neon-orange) / 0.08)",
    badgeColor: "text-neon-orange",
    badgeBg: "oklch(var(--neon-orange) / 0.12)",
  },
];

const FEATURES = [
  {
    icon: <Wifi size={22} className="text-neon-cyan" />,
    title: "Wi-Fi Inteligente",
    desc: "Controle quem usa sua internet e por quanto tempo",
    color: "oklch(var(--neon-cyan))",
  },
  {
    icon: <Zap size={22} className="text-neon-green" />,
    title: "Pagamento Rápido",
    desc: "Pix ou dinheiro direto entre passageiro e motorista",
    color: "oklch(var(--neon-green))",
  },
  {
    icon: <BarChart2 size={22} className="text-neon-purple" />,
    title: "Ganhos Reais",
    desc: "Motoristas ganham, anunciantes divulgam, todos saem ganhando",
    color: "oklch(var(--neon-purple))",
  },
  {
    icon: <Shield size={22} className="text-neon-orange" />,
    title: "Seguro e Privado",
    desc: "Dados protegidos na blockchain do Internet Computer",
    color: "oklch(var(--neon-orange))",
  },
];

type LoginView = "choose" | "email-form";

export function LandingPage({
  onLogin,
  isLoggingIn,
  onRoleSelect,
}: LandingPageProps) {
  const currentYear = new Date().getFullYear();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [loginView, setLoginView] = useState<LoginView>("choose");
  const [selectedRole, setSelectedRole] = useState<
    "passenger" | "driver" | "advertiser" | null
  >(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleRoleCardClick = (role: "passenger" | "driver" | "advertiser") => {
    setSelectedRole(role);
    setLoginView("email-form");
    setEmailError("");
  };

  const handleEmailLogin = () => {
    if (!email.trim()) {
      setEmailError("E-mail é obrigatório");
      return;
    }
    if (!password.trim()) {
      setEmailError("Senha é obrigatória");
      return;
    }
    setEmailError("");
    // Trigger role selection + login flow
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  const handleBack = () => {
    setLoginView("choose");
    setEmailError("");
    setEmail("");
    setPassword("");
  };

  const selectedRoleCard = ROLE_CARDS.find((c) => c.role === selectedRole);

  return (
    <div className="min-h-screen" data-ocid="landing.page">
      {/* Hero */}
      <section className="pt-24 pb-12 px-4 text-center relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-10 left-1/4 w-80 h-80 rounded-full opacity-[0.07] blur-3xl"
            style={{ background: "oklch(var(--neon-purple))" }}
          />
          <div
            className="absolute top-20 right-1/4 w-64 h-64 rounded-full opacity-[0.06] blur-3xl"
            style={{ background: "oklch(var(--neon-cyan))" }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 opacity-[0.05] blur-3xl"
            style={{ background: "oklch(var(--neon-green))" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          {/* Avatar hero */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{
                  background:
                    "radial-gradient(circle, oklch(var(--neon-purple)), transparent 70%)",
                  transform: "scale(1.4)",
                  animationDuration: "3s",
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow:
                    "0 0 0 3px oklch(var(--neon-purple) / 0.5), 0 0 0 7px oklch(var(--neon-cyan) / 0.2), 0 0 40px oklch(var(--neon-purple) / 0.4), 0 0 80px oklch(var(--neon-purple) / 0.15)",
                  borderRadius: "9999px",
                }}
              />
              <div
                className="w-32 h-32 rounded-full overflow-hidden border-2"
                style={{ borderColor: "oklch(var(--neon-purple) / 0.7)" }}
              >
                <img
                  src={AVATAR_IMAGES[selectedAvatarIndex]}
                  alt="Seu Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.button
              type="button"
              onClick={() => setAvatarPickerOpen(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              data-ocid="landing.toggle"
            >
              <Sparkles size={11} />
              Escolha seu avatar
            </motion.button>
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 mb-6"
            style={{ background: "oklch(var(--neon-cyan) / 0.08)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-neon-cyan text-xs font-semibold">
              Novo jeito de viajar conectado
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            Sua Viagem, <span className="neon-text-cyan">Mais Conectada.</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto mb-8">
            Wi-Fi no Uber e 99 com qualidade. Para motoristas que querem ganhar
            mais e passageiros que precisam ficar conectados.
          </p>
        </motion.div>
      </section>

      {/* Acesse sua Conta — glassmorphism */}
      <section className="px-4 py-14" id="acesso">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-3xl p-8 mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-center mb-1">
              Acesse sua Conta
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Escolha seu perfil para entrar na plataforma
            </p>

            <AnimatePresence mode="wait">
              {loginView === "choose" ? (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="grid gap-5 sm:grid-cols-3">
                    {ROLE_CARDS.map((card, i) => (
                      <motion.div
                        key={card.role}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.12, duration: 0.5 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className={`card-cyber p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 role-card ${card.borderClass}`}
                        style={
                          {
                            "--card-glow": card.glowColor,
                          } as React.CSSProperties
                        }
                        data-ocid={`landing.item.${i + 1}`}
                        onClick={() => handleRoleCardClick(card.role)}
                      >
                        {/* Avatar */}
                        <div className="relative mb-4">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              boxShadow: `0 0 20px ${card.glowColor.replace(")", " / 0.5)")}, 0 0 40px ${card.glowColor.replace(")", " / 0.2)")}`,
                            }}
                          />
                          <div
                            className="w-24 h-24 rounded-full overflow-hidden border-2"
                            style={{
                              borderColor: card.glowColor.replace(
                                ")",
                                " / 0.6)",
                              ),
                            }}
                          >
                            <img
                              src={card.avatar}
                              alt={card.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
                          style={{
                            background: card.badgeBg,
                            color: card.glowColor,
                          }}
                        >
                          {card.icon}
                          {card.label}
                        </div>

                        <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                          {card.desc}
                        </p>

                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleCardClick(card.role);
                          }}
                          className={`w-full rounded-xl ${card.btnClass}`}
                          data-ocid={`landing.primary_button.${i + 1}`}
                        >
                          Entrar <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Internet Identity fallback */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      ou acesse com
                    </p>
                    <Button
                      type="button"
                      onClick={onLogin}
                      disabled={isLoggingIn}
                      variant="outline"
                      className="border-border hover:border-primary text-sm"
                      data-ocid="landing.secondary_button"
                    >
                      {isLoggingIn ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-border border-t-foreground animate-spin" />
                          Entrando...
                        </span>
                      ) : (
                        "Internet Identity"
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="email-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-sm mx-auto"
                >
                  {/* Selected role indicator */}
                  {selectedRoleCard && (
                    <div
                      className="flex items-center gap-3 mb-6 p-3 rounded-2xl"
                      style={{
                        background: selectedRoleCard.glowColor.replace(
                          ")",
                          " / 0.08)",
                        ),
                        border: `1px solid ${selectedRoleCard.glowColor.replace(")", " / 0.25)")}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden border flex-shrink-0"
                        style={{
                          borderColor: selectedRoleCard.glowColor.replace(
                            ")",
                            " / 0.5)",
                          ),
                        }}
                      >
                        <img
                          src={selectedRoleCard.avatar}
                          alt={selectedRoleCard.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Entrando como
                        </p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: selectedRoleCard.glowColor }}
                        >
                          {selectedRoleCard.label}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleBack}
                        className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                        data-ocid="landing.toggle"
                      >
                        Trocar
                      </button>
                    </div>
                  )}

                  {/* Email + Password form */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        E-mail
                      </Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        placeholder="seu@email.com"
                        className="mt-1 bg-input border-border"
                        autoComplete="email"
                        data-ocid="landing.email_input"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Senha
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setEmailError("");
                          }}
                          placeholder="••••••••"
                          className="bg-input border-border pr-10"
                          autoComplete="current-password"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEmailLogin();
                          }}
                          data-ocid="landing.password_input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={
                            showPassword ? "Ocultar senha" : "Mostrar senha"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {emailError && (
                      <p
                        className="text-destructive text-xs"
                        data-ocid="landing.error_state"
                      >
                        {emailError}
                      </p>
                    )}

                    <Button
                      type="button"
                      onClick={handleEmailLogin}
                      disabled={isLoggingIn}
                      className={`w-full rounded-xl py-6 text-base font-bold ${selectedRoleCard?.btnClass || "gradient-btn-primary"}`}
                      data-ocid="landing.primary_button"
                    >
                      <AnimatePresence mode="wait">
                        {isLoggingIn ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            Entrando...
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            Entrar na plataforma
                            <ArrowRight size={16} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      Novo por aqui?{" "}
                      <button
                        type="button"
                        onClick={handleEmailLogin}
                        className="text-neon-cyan hover:underline font-semibold"
                        data-ocid="landing.register_link"
                      >
                        Criar conta
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-8">
            Por que ConectarCar?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="card-cyber p-5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: f.color.replace(")", " / 0.12)") }}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-sm mb-1">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg gradient-btn-secondary flex items-center justify-center">
                  <Wifi size={12} className="text-white" />
                </div>
                <span className="font-display font-bold text-sm neon-text-cyan">
                  ConectarCar
                </span>
              </div>
              <p className="text-muted-foreground text-xs max-w-[180px]">
                Wi-Fi inteligente para motoristas de aplicativo.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-xs mb-2">Sobre</h4>
                <ul className="space-y-1.5">
                  <li>
                    <span className="text-muted-foreground text-xs">
                      Como funciona
                    </span>
                  </li>
                  <li>
                    <span className="text-muted-foreground text-xs">
                      Preços
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-xs mb-2">Recursos</h4>
                <ul className="space-y-1.5">
                  <li>
                    <span className="text-muted-foreground text-xs">
                      Para motoristas
                    </span>
                  </li>
                  <li>
                    <span className="text-muted-foreground text-xs">
                      Para anunciantes
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-xs mb-2">Legal</h4>
                <ul className="space-y-1.5">
                  <li>
                    <span className="text-muted-foreground text-xs">
                      Termos
                    </span>
                  </li>
                  <li>
                    <span className="text-muted-foreground text-xs">
                      Privacidade
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-muted-foreground text-xs">
              &copy; {currentYear}. Feito com ❤️ usando{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <AvatarPicker
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        selectedIndex={selectedAvatarIndex}
        onSelect={(i) => {
          setSelectedAvatarIndex(i);
          setAvatarPickerOpen(false);
        }}
      />
    </div>
  );
}
