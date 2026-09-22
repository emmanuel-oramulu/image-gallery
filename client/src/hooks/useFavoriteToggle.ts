import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { showToast } from "../components/Toast";

export function useFavoriteToggle(imageId: string) {
	return useMutation({
		mutationFn: async (nextState: boolean) => {
			if(nextState) {
				await api.post(`/images/${imageId}/favorite`);
			} else {
				await api.delete(`/images/${imageId}/favorite`);
			}
		},
		onSuccess: (_data,nextState) => {
			showToast({
				type: 'success',
				description: nextState
					? 'Image added to your favorites'
					:'Image removed from your favorites',
			});
		},
		onError: (_error,nextState) => {
			showToast({
				type: 'error',
				description: nextState
					? 'Image could not be added to your favorites'
					:'Image could not be removed from your favorites',
			});
		},
	});
}