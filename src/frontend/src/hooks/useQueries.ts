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
      return artworksArray.map(([_, artwork]) => artwork);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
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
