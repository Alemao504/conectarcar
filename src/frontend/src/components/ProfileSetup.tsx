import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Car, Megaphone, User, Wifi } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { type UserProfile, UserRole } from "../backend";
import {
  AVATAR_NAMES,
  getStoredAvatarIndex,
  setStoredAvatarIndex,
} from "../utils/avatars";
import { generateDeviceFingerprint } from "../utils/deviceFingerprint";
import { AvatarDisplay, AvatarPicker } from "./AvatarPicker";

interface ProfileSetupProps {
  onComplete: (
    profile: Omit<UserProfile, "id" | "createdAt">,
    avatarIndex: number,
  ) => void;
  defaultRole?: UserRole;
  principalId: string;
}

const BRAZIL_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export function ProfileSetup({
  onComplete,
  defaultRole,
  principalId,
}: ProfileSetupProps) {
  const [role, setRole] = useState<UserRole>(defaultRole || UserRole.passenger);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [freeMinutes, setFreeMinutes] = useState(5);
  const [minuteRate, setMinuteRate] = useState(50);
  const [companyName, setCompanyName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(getStoredAvatarIndex());
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleConfigs = [
    {
      value: UserRole.passenger,
      label: "Passageiro",
      icon: <User size={18} />,
      desc: "Conecte-se ao Wi-Fi durante suas viagens",
    },
    {
      value: UserRole.driver,
      label: "Motorista",
      icon: <Car size={18} />,
      desc: "Compartilhe e monetize seu internet",
    },
    {
      value: UserRole.advertiser,
      label: "Anunciante",
      icon: <Megaphone size={18} />,
      desc: "Anuncie para passageiros em viagem",
    },
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() && role !== UserRole.advertiser)
      errs.name = "Nome é obrigatório";
    if (!city.trim()) errs.city = "Cidade é obrigatória";
    if (!state.trim()) errs.state = "Estado é obrigatório";
    if (role === UserRole.passenger && !cpf.trim())
      errs.cpf = "CPF é obrigatório";
    if (role === UserRole.driver) {
      if (!carModel.trim()) errs.carModel = "Modelo do carro é obrigatório";
      if (!carPlate.trim()) errs.carPlate = "Placa é obrigatória";
    }
    if (role === UserRole.advertiser) {
      if (!companyName.trim())
        errs.companyName = "Nome da empresa é obrigatório";
      if (!whatsapp.trim()) errs.whatsapp = "WhatsApp é obrigatório";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setStoredAvatarIndex(avatarIndex);

    // Silently capture device fingerprint in background
    const deviceId = await generateDeviceFingerprint().catch(
      () => "unknown-device",
    );

    const profile: Omit<UserProfile, "id" | "createdAt"> = {
      name: role === UserRole.advertiser ? companyName : name,
      city,
      state,
      role,
      deviceId,
      isBanned: false,
      subscriptionExpiry: BigInt(0),
      subscriptionPlan: "none",
      cpf: cpf || undefined,
      carModel: carModel || undefined,
      carPlate: carPlate || undefined,
      freeMinutes: role === UserRole.driver ? BigInt(freeMinutes) : undefined,
      minuteRate: role === UserRole.driver ? BigInt(minuteRate) : undefined,
      adsLink:
        role === UserRole.advertiser
          ? `https://wa.me/55${whatsapp}`
          : undefined,
      paymentLink: undefined,
      totalEarnings: role === UserRole.driver ? BigInt(0) : undefined,
      qrCode:
        role === UserRole.driver
          ? `conectarcar://driver/${principalId}`
          : undefined,
    };

    setIsSubmitting(false);
    onComplete(profile, avatarIndex);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl gradient-btn-secondary flex items-center justify-center mx-auto mb-3">
            <Wifi size={28} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">
            Configure seu perfil
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bem-vindo ao ConectarCar! Vamos começar.
          </p>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <AvatarDisplay
            index={avatarIndex}
            size="lg"
            onClick={() => setShowAvatarPicker(true)}
            glow
          />
          <button
            type="button"
            onClick={() => setShowAvatarPicker(true)}
            className="text-xs text-neon-cyan underline"
            data-ocid="profile.open_modal_button"
          >
            Escolher avatar: {AVATAR_NAMES[avatarIndex]}
          </button>
        </div>

        {/* Role selection */}
        {!defaultRole && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Tipo de conta
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {roleConfigs.map((rc) => (
                <button
                  type="button"
                  key={rc.value}
                  onClick={() => setRole(rc.value)}
                  className={`card-cyber p-3 text-center transition-all ${role === rc.value ? "neon-border-purple" : "hover:border-primary/50"}`}
                  data-ocid="profile.radio"
                >
                  <div
                    className={`mx-auto mb-1 ${role === rc.value ? "text-neon-purple" : "text-muted-foreground"}`}
                  >
                    {rc.icon}
                  </div>
                  <span
                    className={`text-xs font-semibold ${role === rc.value ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {rc.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3">
          {role !== UserRole.advertiser && (
            <div>
              <Label className="text-xs text-muted-foreground">
                Nome completo
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="mt-1 bg-input border-border"
                data-ocid="profile.input"
              />
              {errors.name && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="profile.error_state"
                >
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Cidade</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cascavel"
                className="mt-1 bg-input border-border"
                data-ocid="profile.input"
              />
              {errors.city && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="profile.error_state"
                >
                  {errors.city}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                data-ocid="profile.select"
              >
                <option value="">UF</option>
                {BRAZIL_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="profile.error_state"
                >
                  {errors.state}
                </p>
              )}
            </div>
          </div>

          {role === UserRole.passenger && (
            <div>
              <Label className="text-xs text-muted-foreground">CPF</Label>
              <Input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="mt-1 bg-input border-border"
                data-ocid="profile.input"
              />
              {errors.cpf && (
                <p
                  className="text-destructive text-xs mt-1"
                  data-ocid="profile.error_state"
                >
                  {errors.cpf}
                </p>
              )}
            </div>
          )}

          {role === UserRole.driver && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Modelo do carro
                </Label>
                <Input
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Ex: Hyundai HB20"
                  className="mt-1 bg-input border-border"
                  data-ocid="profile.input"
                />
                {errors.carModel && (
                  <p
                    className="text-destructive text-xs mt-1"
                    data-ocid="profile.error_state"
                  >
                    {errors.carModel}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Placa</Label>
                <Input
                  value={carPlate}
                  onChange={(e) => setCarPlate(e.target.value)}
                  placeholder="ABC-1234"
                  className="mt-1 bg-input border-border"
                  data-ocid="profile.input"
                />
                {errors.carPlate && (
                  <p
                    className="text-destructive text-xs mt-1"
                    data-ocid="profile.error_state"
                  >
                    {errors.carPlate}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Minutos gratuitos
                  </Label>
                  <span className="text-xs font-bold">{freeMinutes} min</span>
                </div>
                <Slider
                  value={[freeMinutes]}
                  onValueChange={([v]) => setFreeMinutes(v)}
                  min={5}
                  max={10}
                  step={1}
                  data-ocid="profile.select"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Valor por minuto
                  </Label>
                  <span className="text-xs font-bold text-neon-green">
                    R$ {(minuteRate / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <Slider
                  value={[minuteRate]}
                  onValueChange={([v]) => setMinuteRate(v)}
                  min={50}
                  max={100}
                  step={5}
                  data-ocid="profile.select"
                />
              </div>
            </>
          )}

          {role === UserRole.advertiser && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Nome da empresa
                </Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Sua empresa"
                  className="mt-1 bg-input border-border"
                  data-ocid="profile.input"
                />
                {errors.companyName && (
                  <p
                    className="text-destructive text-xs mt-1"
                    data-ocid="profile.error_state"
                  >
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  WhatsApp
                </Label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="44999990000"
                  className="mt-1 bg-input border-border"
                  data-ocid="profile.input"
                />
                {errors.whatsapp && (
                  <p
                    className="text-destructive text-xs mt-1"
                    data-ocid="profile.error_state"
                  >
                    {errors.whatsapp}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full gradient-btn-primary rounded-xl py-6 text-base font-bold"
          data-ocid="profile.submit_button"
        >
          {isSubmitting ? (
            "Criando perfil..."
          ) : (
            <>
              Criar Perfil <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </motion.div>

      <AvatarPicker
        open={showAvatarPicker}
        onOpenChange={setShowAvatarPicker}
        selectedIndex={avatarIndex}
        onSelect={(i) => {
          setAvatarIndex(i);
          setStoredAvatarIndex(i);
        }}
      />
    </div>
  );
}
