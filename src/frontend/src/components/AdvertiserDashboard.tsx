import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Settings,
  Upload,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";

interface AdvertiserDashboardProps {
  profile: UserProfile;
}

type AdStatus = "pending" | "approved" | "rejected";

export function AdvertiserDashboard({ profile }: AdvertiserDashboardProps) {
  const [adStatus] = useState<AdStatus>("approved");
  const [contactLink, setContactLink] = useState(profile.adsLink || "");
  const [city, setCity] = useState(profile.city || "Cascavel");
  const [hasVideo, setHasVideo] = useState(true);

  // Profile settings
  const [editCompany, setEditCompany] = useState(profile.name || "");
  const [editWhatsapp, setEditWhatsapp] = useState(
    profile.adsLink?.replace("https://wa.me/55", "") || "",
  );
  const [editCity, setEditCity] = useState(profile.city || "");
  const [editState, setEditState] = useState(profile.state || "");
  const [profileSaved, setProfileSaved] = useState(false);

  const totalViews = 1247;
  const viewsByWeek = [
    { label: "Sem 1", value: 280 },
    { label: "Sem 2", value: 340 },
    { label: "Sem 3", value: 390 },
    { label: "Sem 4", value: 237 },
  ];
  const maxViews = Math.max(...viewsByWeek.map((w) => w.value));

  const statusConfig = {
    pending: {
      label: "Aguardando Aprovação",
      color: "text-neon-orange",
      icon: <Clock size={14} />,
      border: "neon-border-purple",
    },
    approved: {
      label: "Aprovado ✓",
      color: "text-neon-green",
      icon: <CheckCircle2 size={14} />,
      border: "neon-border-green",
    },
    rejected: {
      label: "Recusado",
      color: "text-destructive",
      icon: <XCircle size={14} />,
      border: "",
    },
  };
  const status = statusConfig[adStatus];

  const handleVideoClick = () => {
    setHasVideo(true);
    toast.success("Upload simulado!");
  };

  return (
    <div className="min-h-screen pt-16 pb-8 px-4">
      <Tabs defaultValue="anuncio" className="max-w-sm mx-auto">
        <TabsList
          className="w-full mb-4 bg-card border border-border rounded-xl p-1 mt-4"
          data-ocid="advertiser.tab"
        >
          <TabsTrigger
            value="anuncio"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Upload size={11} className="mr-1" />
            Meu Anúncio
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <BarChart2 size={11} className="mr-1" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger
            value="conta"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <CreditCard size={11} className="mr-1" />
            Conta
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <Settings size={11} className="mr-1" />
            Perfil
          </TabsTrigger>
        </TabsList>

        {/* MEU ANÚNCIO */}
        <TabsContent value="anuncio">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card-cyber p-5 space-y-4 ${status.border}`}
            data-ocid="advertiser.card"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Meu Anúncio</h2>
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold ${status.color}`}
                data-ocid="advertiser.success_state"
              >
                {status.icon} {status.label}
              </span>
            </div>

            <button
              type="button"
              className="relative rounded-xl overflow-hidden aspect-video flex items-center justify-center cursor-pointer group w-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.04 255), oklch(0.22 0.06 293))",
              }}
              onClick={handleVideoClick}
              data-ocid="advertiser.dropzone"
            >
              {hasVideo ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full gradient-btn-primary flex items-center justify-center mx-auto mb-2">
                    <Eye size={20} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {profile.name || "Meu Negócio"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    30 segundos • Clique para alterar
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload
                    size={32}
                    className="text-muted-foreground mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    Clique para enviar vídeo (30s)
                  </p>
                </div>
              )}
              <div className="absolute inset-0 group-hover:bg-white/5 transition-colors" />
            </button>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Link de Contato (WhatsApp ou site)
                </Label>
                <Input
                  value={contactLink}
                  onChange={(e) => setContactLink(e.target.value)}
                  placeholder="https://wa.me/55... ou https://..."
                  className="mt-1 bg-input border-border text-sm"
                  data-ocid="advertiser.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Cidade alvo
                </Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cascavel"
                  className="mt-1 bg-input border-border text-sm"
                  data-ocid="advertiser.input"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={() =>
                toast.success("Anúncio salvo e enviado para aprovação!")
              }
              className="w-full gradient-btn-secondary rounded-xl"
              data-ocid="advertiser.save_button"
            >
              Salvar e Enviar
            </Button>
          </motion.div>
        </TabsContent>

        {/* ESTATÍSTICAS */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card-cyber p-4 text-center">
              <div className="text-2xl font-display font-bold neon-text-purple">
                {totalViews.toLocaleString("pt-BR")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                visualizações
              </div>
            </div>
            <div className="card-cyber p-4 text-center">
              <div className="text-2xl font-display font-bold neon-text-green">
                +{Math.round(totalViews * 0.08)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                cliques no link
              </div>
            </div>
          </div>
          <div className="card-cyber p-4">
            <h3 className="font-display font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
              Visualizações por Semana
            </h3>
            <div className="flex items-end gap-2 h-28">
              {viewsByWeek.map((week) => (
                <div
                  key={week.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-neon-purple font-semibold">
                    {week.value}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-neon-purple to-neon-cyan"
                    style={{ height: `${(week.value / maxViews) * 80}px` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {week.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-cyber p-4">
            <h3 className="font-display font-bold text-sm mb-3">Por Cidade</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cascavel</span>
                <span className="text-neon-green font-semibold">847 views</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Foz do Iguaçu</span>
                <span className="text-neon-cyan font-semibold">274 views</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Toledo</span>
                <span className="text-muted-foreground">126 views</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CONTA */}
        <TabsContent value="conta">
          <div className="card-cyber p-5 space-y-4" data-ocid="advertiser.card">
            <h2 className="font-display text-lg font-bold">Minha Conta</h2>
            <div className="p-4 rounded-xl neon-border-green space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Plano</span>
                <Badge className="gradient-btn-primary text-black text-xs">
                  Ativo
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Valor mensal
                </span>
                <span className="text-foreground font-bold">R$ 15,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  Próximo pagamento
                </span>
                <span className="text-foreground text-sm">01/05/2026</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              O pagamento é processado mensalmente via Mercado Pago. Cancele a
              qualquer momento sem taxas extras.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border-border hover:border-primary text-sm"
              onClick={() => toast.info("Redirecionando para Mercado Pago...")}
              data-ocid="advertiser.primary_button"
            >
              Gerenciar Assinatura
            </Button>
          </div>
        </TabsContent>

        {/* PERFIL / CONFIGURAÇÕES TAB */}
        <TabsContent value="config">
          <div className="card-cyber p-5 space-y-5" data-ocid="advertiser.card">
            <h2 className="font-display text-lg font-bold">Meu Perfil</h2>
            <p className="text-muted-foreground text-xs -mt-3">
              Suas informações — visíveis apenas para você.
            </p>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Nome da empresa
                </Label>
                <Input
                  value={editCompany}
                  onChange={(e) => {
                    setEditCompany(e.target.value);
                    setProfileSaved(false);
                  }}
                  placeholder="Nome da sua empresa"
                  className="mt-1 bg-input border-border"
                  data-ocid="advertiser.input"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  WhatsApp
                </Label>
                <Input
                  value={editWhatsapp}
                  onChange={(e) => {
                    setEditWhatsapp(e.target.value);
                    setProfileSaved(false);
                  }}
                  placeholder="44999990000"
                  className="mt-1 bg-input border-border"
                  data-ocid="advertiser.input"
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
                    data-ocid="advertiser.input"
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
                    data-ocid="advertiser.input"
                  />
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-xl space-y-2"
              style={{
                background: "oklch(var(--neon-orange) / 0.06)",
                border: "1px solid oklch(var(--neon-orange) / 0.2)",
              }}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Status da conta
              </p>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Perfil</span>
                <span className="text-xs text-neon-orange">Anunciante</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  Mensalidade
                </span>
                <span className="text-xs font-bold">R$ 15,00/mês</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                setProfileSaved(true);
                toast.success("Perfil atualizado!");
              }}
              className="w-full gradient-btn-secondary rounded-xl"
              data-ocid="advertiser.save_button"
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
