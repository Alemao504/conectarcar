import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ExternalLink, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MOCK_ADS_WITH_IMAGES, getAdDuration } from "../utils/mockData";

interface AdWatchFlowProps {
  onComplete: () => void;
}

export function AdWatchFlow({ onComplete }: AdWatchFlowProps) {
  const AD_DURATION = getAdDuration();
  const totalAds = 3;
  const ads = MOCK_ADS_WITH_IMAGES.slice(0, totalAds);

  const [currentAd, setCurrentAd] = useState(0);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [showSuccess, setShowSuccess] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-start countdown when ad changes or component mounts
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

  // When countdown hits 0, advance to next ad or show success
  useEffect(() => {
    if (countdown !== 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (currentAd < totalAds - 1) {
      // Short pause before next ad
      successTimerRef.current = setTimeout(() => {
        setCurrentAd((prev) => prev + 1);
      }, 500);
    } else {
      // All ads done — show success for 2s then call onComplete
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

          {/* Dark overlay gradient */}
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
            {/* Progress dots */}
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
              {/* Ad info */}
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

              {/* Contact button */}
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
                data-ocid="ad.secondary_button"
              >
                {ad.whatsapp ? (
                  <MessageCircle size={16} />
                ) : (
                  <ExternalLink size={16} />
                )}
                {ad.whatsapp ? "Chamar no WhatsApp" : "Visitar site"}
              </a>
            </div>

            {/* Progress bar */}
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
