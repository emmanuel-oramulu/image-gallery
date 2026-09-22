import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { SkeletonCard } from "../components/SkeletonCard";
import { EmptyGallery } from "../components/EmptyGallery";
import { NetworkError } from "../components/NetworkError";
import { ImageCard } from "../components/ImageCard";
import { SearchBarShortcut } from "../components/SearchBarShortcut";
import { useAuth } from '../context/AuthContext';

import type { GalleryImage } from "../types/gallery";


export function GalleryPage() {
	const { user }=useAuth();

	const {
		data=[],
		isLoading,
		isError,
		refetch,
	}=useQuery({
		queryKey: ["images"],
		queryFn: async () => {
			const response=await api.get<GalleryImage[]>("/images");
			return response.data;
		},
	});

	const { data: favorites=[] }=useQuery({
		queryKey: ["favorites"],
		queryFn: async () => {
			const response=await api.get<GalleryImage[]>('/favorites');
			return response.data;
		},
		enabled: !!user
	});

	const favoritedIds=new Set(favorites.map((f) => f.image_id));

	return (
		<section className="container mx-auto px-2 py-8">
			<div className="mb-6">
				<SearchBarShortcut />
			</div>

			{isLoading&&(
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_,index) => (
						<SkeletonCard key={index} />
					))}
				</div>
			)}

			{isError&&(
				<div className="flex min-h-[50vh] items-center justify-center px-4">
					<div className="max-w-sm">
						<NetworkError refetch={refetch} />
					</div>
				</div>
			)}

			{!isLoading&&!isError&&data.length===0&&(
				<div className="flex min-h-[50vh] items-center justify-center px-4">
					<EmptyGallery />
				</div>
			)}

			{!isLoading&&!isError&&data.length>0&&(
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{data.map((image) => (
						<ImageCard
							key={image.image_id}
							image={image}
							isFavorited={favoritedIds.has(image.image_id)}
						/>
					))}
				</div>
			)}
		</section>
	);
}