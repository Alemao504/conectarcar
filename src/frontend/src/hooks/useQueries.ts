import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminStats, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllDriverProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allDriverProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDriverProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDriverMonthlyEarnings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["driverMonthlyEarnings"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getDriverMonthlyEarnings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdvertiserMonthlyViews() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["advertiserMonthlyViews"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getAdvertiserMonthlyViews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllAds() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allAds"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllAdRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allAdRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAdRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSessions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allSessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllAdvertisers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allAdvertisers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAdvertisers();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin hooks
export function useAdminGetAllProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["adminAllProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalBanned: BigInt(0),
          totalPassengers: BigInt(0),
          totalDrivers: BigInt(0),
          totalAdvertisers: BigInt(0),
          activeSubscriptions: BigInt(0),
        };
      }
      return actor.adminGetStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.adminBanUser(Principal.fromText(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useAdminDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.adminDeleteUser(Principal.fromText(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}
