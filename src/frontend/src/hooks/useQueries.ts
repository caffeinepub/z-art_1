import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Artwork, UserProfile } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetAllArtworks() {
  const { actor, isFetching } = useActor();

  return useQuery<Artwork[]>({
    queryKey: ['artworks'],
    queryFn: async () => {
      if (!actor) return [];
      const artworksArray = await actor.listArtworks();
      const artworks = artworksArray.map(([_, artwork]) => artwork);
      
      // Sort deterministically: newest first (createdAt descending), with id as tie-breaker
      return artworks.sort((a, b) => {
        // Primary sort: createdAt descending (newest first)
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        
        // Secondary sort: id ascending for stable ordering when timestamps match
        return a.id.localeCompare(b.id);
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArtwork(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Artwork | null>({
    queryKey: ['artwork', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getArtwork(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artwork: {
      id: string;
      title: string;
      description: string;
      price: bigint;
      image: ExternalBlob;
      imageType: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createArtwork(artwork);
    },
    onSuccess: async () => {
      // Invalidate and refetch the artworks list to show the new upload immediately
      await queryClient.invalidateQueries({ queryKey: ['artworks'] });
      await queryClient.refetchQueries({ queryKey: ['artworks'] });
    },
  });
}

export function useUpdateArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, artwork }: {
      id: string;
      artwork: {
        title: string;
        description: string;
        price: bigint;
        image: ExternalBlob;
        imageType: string;
      };
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateArtwork(id, artwork);
    },
    onSuccess: async (_, variables) => {
      // Invalidate both the artworks list and the specific artwork
      await queryClient.invalidateQueries({ queryKey: ['artworks'] });
      await queryClient.invalidateQueries({ queryKey: ['artwork', variables.id] });
      await queryClient.refetchQueries({ queryKey: ['artworks'] });
    },
  });
}

export function useDeleteArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteArtwork(id);
    },
    onSuccess: async (_, id) => {
      // Invalidate both the artworks list and the specific artwork query
      // This ensures the gallery refreshes and the deleted artwork no longer appears
      await queryClient.invalidateQueries({ queryKey: ['artworks'] });
      await queryClient.invalidateQueries({ queryKey: ['artwork', id] });
      await queryClient.refetchQueries({ queryKey: ['artworks'] });
    },
  });
}

export function useSetArtworkSoldStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ artworkId, isSold }: { artworkId: string; isSold: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setArtworkSoldStatus(artworkId, isSold);
    },
    onSuccess: async (_, variables) => {
      // Invalidate both the artworks list and the specific artwork query
      await queryClient.invalidateQueries({ queryKey: ['artworks'] });
      await queryClient.invalidateQueries({ queryKey: ['artwork', variables.artworkId] });
      // Refetch artworks to ensure UI updates immediately
      await queryClient.refetchQueries({ queryKey: ['artworks'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
