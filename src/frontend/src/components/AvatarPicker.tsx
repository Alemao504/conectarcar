import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { Wifi } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AVATAR_IMAGES, AVATAR_NAMES } from "../utils/avatars";

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function AvatarPicker({
  open,
  onOpenChange,
  selectedIndex,
  onSelect,
}: AvatarPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="card-cyber max-w-sm mx-auto"
        data-ocid="avatar.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Escolha seu Avatar
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 pt-2">
          {AVATAR_IMAGES.map((src, i) => (
            <motion.button
              key={src}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-xl overflow-hidden aspect-square cursor-pointer transition-all ${
                selectedIndex === i
                  ? "neon-border-purple"
                  : "border border-border hover:border-primary"
              }`}
              onClick={() => {
                onSelect(i);
                onOpenChange(false);
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              data-ocid={`avatar.item.${i + 1}`}
            >
              <img
                src={src}
                alt={AVATAR_NAMES[i]}
                className="w-full h-full object-cover"
              />
              <AnimatePresence>
                {selectedIndex === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-primary/30"
                  >
                    <div className="w-7 h-7 rounded-full bg-neon-green flex items-center justify-center">
                      <Check size={14} className="text-black" />
                    </div>
                  </motion.div>
                )}
                {hovered === i && selectedIndex !== i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 inset-x-0 bg-card/80 text-xs text-center py-1 text-foreground/80"
                  >
                    {AVATAR_NAMES[i]}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2 border-border hover:border-primary"
          onClick={() => onOpenChange(false)}
          data-ocid="avatar.close_button"
        >
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarDisplayProps {
  index: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  glow?: boolean;
}

export function AvatarDisplay({
  index,
  size = "md",
  onClick,
  glow,
}: AvatarDisplayProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full overflow-hidden ${sizeClasses[size]} ${
        glow ? "glow-avatar" : ""
      } ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : "cursor-default"} flex-shrink-0`}
      data-ocid="avatar.toggle"
    >
      <img
        src={AVATAR_IMAGES[index] || AVATAR_IMAGES[0]}
        alt="Avatar"
        className="w-full h-full object-cover"
      />
    </button>
  );
}

interface HeaderProps {
  avatarIndex?: number;
  onAvatarClick?: () => void;
  userName?: string;
  onLogout?: () => void;
  showAuth?: boolean;
  onLogin?: () => void;
  isLoggingIn?: boolean;
  isAuthenticated?: boolean;
}

export function Header({
  avatarIndex,
  onAvatarClick,
  userName,
  onLogout,
  showAuth = true,
  onLogin,
  isLoggingIn,
  isAuthenticated,
}: HeaderProps) {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 md:px-8"
      style={{
        background: "oklch(0.115 0.015 255 / 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid oklch(var(--border))",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-btn-secondary flex items-center justify-center">
          <Wifi size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-lg neon-text-cyan tracking-tight">
          ConectarCar
        </span>
      </div>

      <div className="flex items-center gap-3">
        {showAuth &&
          (isAuthenticated ? (
            <div className="flex items-center gap-2">
              {userName && (
                <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[120px]">
                  {userName}
                </span>
              )}
              {avatarIndex !== undefined && (
                <AvatarDisplay
                  index={avatarIndex}
                  size="sm"
                  onClick={onAvatarClick}
                  glow
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground text-xs px-2"
                data-ocid="header.button"
              >
                Sair
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              size="sm"
              className="rounded-full border border-neon-cyan bg-transparent text-neon-cyan hover:bg-neon-cyan/10 font-semibold text-sm px-4"
              data-ocid="header.button"
            >
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </Button>
          ))}
      </div>
    </header>
  );
}
