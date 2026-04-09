import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type UserProfile, UserRole } from "./backend";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdvertiserDashboard } from "./components/AdvertiserDashboard";
import { AvatarPicker, Header } from "./components/AvatarPicker";
import { DriverDashboard } from "./components/DriverDashboard";
import { LandingPage } from "./components/LandingPage";
import { PassengerDashboard } from "./components/PassengerDashboard";
import { ProfileSetup } from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useIsCallerAdmin,
  useSaveCallerUserProfile,
} from "./hooks/useQueries";
import { getStoredAvatarIndex, setStoredAvatarIndex } from "./utils/avatars";

export default function App() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const saveProfile = useSaveCallerUserProfile();

  const [selectedRole, setSelectedRole] = useState<
    "passenger" | "driver" | "advertiser" | null
  >(null);
  const [avatarIndex, setAvatarIndex] = useState(getStoredAvatarIndex());
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only sync on auth state change
  useEffect(() => {
    setAvatarIndex(getStoredAvatarIndex());
  }, [isAuthenticated]);

  const showProfileSetup =
    isAuthenticated && profileFetched && userProfile === null;
  const showLoading = isAuthenticated && profileLoading;

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      if (err?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setSelectedRole(null);
    toast.success("Logout realizado com sucesso!");
  };

  const handleRoleSelect = (role: "passenger" | "driver" | "advertiser") => {
    setSelectedRole(role);
    if (!isAuthenticated) {
      handleLogin();
    }
  };

  const handleProfileComplete = async (
    profileData: Omit<UserProfile, "id" | "createdAt">,
    newAvatarIndex: number,
  ) => {
    if (!identity) return;
    setAvatarIndex(newAvatarIndex);
    setStoredAvatarIndex(newAvatarIndex);
    const fullProfile: UserProfile = {
      ...profileData,
      id: identity.getPrincipal(),
      createdAt: BigInt(Date.now()),
    } as UserProfile;
    await saveProfile.mutateAsync(fullProfile);
    toast.success("Perfil criado com sucesso!");
  };

  const handleAvatarChange = (newIndex: number) => {
    setAvatarIndex(newIndex);
    setStoredAvatarIndex(newIndex);
  };

  const renderDashboard = () => {
    if (!userProfile) return null;
    if (isAdmin) {
      return <AdminDashboard />;
    }
    if (userProfile.role === UserRole.driver) {
      return <DriverDashboard profile={userProfile} />;
    }
    if (userProfile.role === UserRole.advertiser) {
      return <AdvertiserDashboard profile={userProfile} />;
    }
    return <PassengerDashboard profile={userProfile} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        avatarIndex={isAuthenticated ? avatarIndex : undefined}
        onAvatarClick={() => setShowAvatarPicker(true)}
        userName={userProfile?.name}
        onLogout={handleLogout}
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        isAuthenticated={isAuthenticated}
      />

      <AnimatePresence mode="wait">
        {showLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center pt-14"
            data-ocid="app.loading_state"
          >
            <div className="space-y-4 w-full max-w-sm px-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-2/3 rounded-xl" />
            </div>
          </motion.div>
        )}

        {!showLoading && !isAuthenticated && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage
              onLogin={handleLogin}
              isLoggingIn={isLoggingIn}
              onRoleSelect={handleRoleSelect}
            />
          </motion.div>
        )}

        {!showLoading && isAuthenticated && showProfileSetup && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfileSetup
              onComplete={handleProfileComplete}
              defaultRole={
                selectedRole ? (selectedRole as UserRole) : undefined
              }
              principalId={identity?.getPrincipal().toString() ?? ""}
            />
          </motion.div>
        )}

        {!showLoading &&
          isAuthenticated &&
          !showProfileSetup &&
          userProfile && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderDashboard()}
            </motion.div>
          )}
      </AnimatePresence>

      <AvatarPicker
        open={showAvatarPicker}
        onOpenChange={setShowAvatarPicker}
        selectedIndex={avatarIndex}
        onSelect={handleAvatarChange}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.145 0.022 255)",
            border: "1px solid oklch(0.25 0.04 255)",
            color: "oklch(0.93 0.01 240)",
          },
        }}
      />
    </div>
  );
}
