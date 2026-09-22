import { useQuery,useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { api } from "../lib/api";
import { SkeletonCard } from "../components/SkeletonCard";
import { EmptyGallery } from "../components/EmptyGallery";
import { NetworkError } from "../components/NetworkError";
import { ImageCard } from "../components/ImageCard";
import type { GalleryImage } from "../types/gallery";

export function FavoritesPage() {
	const queryClient=useQueryClient();
	// Holds a snapshot of the pre-removal list, in case we need to undo.
	const previousFavoritesRef=useRef<GalleryImage[]|undefined>(undefined);

	const {
		data: favorites=[],
		isLoading,
		isError,
	}=useQuery({
		queryKey: ["favorites"],
		queryFn: async () => {
			const response=await api.get<GalleryImage[]>("/favorites");
			return response.data;
		},
	});

	async function handleOptimisticUnfavorite(imageId: string) {
		// Stop any in-flight refetch of ['favorites'] from overwriting
		// our optimistic edit with stale server data.
		await queryClient.cancelQueries({ queryKey: ["favorites"] });

		// Snapshot current data so we can restore it if the request fails.
		previousFavoritesRef.current=queryClient.getQueryData<GalleryImage[]>(["favorites"]);

		queryClient.setQueryData<GalleryImage[]>(["favorites"],(old) =>
			old?.filter((img) => img.image_id!==imageId)??[]
		);
	}

	function handleUnfavoriteError() {
		queryClient.setQueryData(["favorites"],previousFavoritesRef.current);
	}

	return (
		<div className="min-h-screen bg-bg px-4 py-8">
			<main className="mx-auto mt-8 w-full max-w-5xl">
				{isLoading&&(
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{Array.from({ length: 4 }).map((_,i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				)}

				{isError&&!isLoading&&<NetworkError />}

				{!isLoading&&!isError&&favorites.length===0&&<EmptyGallery />}

				{!isLoading&&!isError&&favorites.length>0&&(
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{favorites.map((image) => (
							<ImageCard
								key={image.image_id}
								image={image}
								isFavorited={true}
								onOptimisticUnfavorite={() => handleOptimisticUnfavorite(image.image_id)}
								onUnfavoriteError={handleUnfavoriteError}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	);
}