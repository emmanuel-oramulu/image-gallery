import type { GalleryImage } from "../types/gallery";
import { useFavoriteToggle } from "../hooks/useFavoriteToggle"



import { Link } from "react-router-dom"
import { useState,useEffect } from "react"
import { Heart } from "lucide-react"

interface ImageCardProps {
	image: GalleryImage;
	isFavorited: boolean;
	onOptimisticUnfavorite?: () => void; // fires immediately, before the request
	onUnfavoriteError?: () => void;      // fires only if the request fails, to undo
}

export function ImageCard({
	image,
	isFavorited: initialFavorited,
	onOptimisticUnfavorite,
	onUnfavoriteError,
}: ImageCardProps) {
	const [isFavorited,setIsFavorited]=useState(initialFavorited);

	useEffect(() => {
		setIsFavorited(initialFavorited);
	},[initialFavorited]);

	const { mutate }=useFavoriteToggle(image.image_id);

	function handleFavoriteClick(e: React.MouseEvent) {
		e.stopPropagation();
		const nextState=!isFavorited;
		setIsFavorited(nextState);

		// Optimistically remove from any list that cares (e.g. FavoritesPage),
		// before the request even goes out.
		if(!nextState) {
			onOptimisticUnfavorite?.();
		}

		mutate(nextState,{
			onError: () => {
				setIsFavorited(!nextState);
				// Request failed — undo the optimistic removal too.
				if(!nextState) {
					onUnfavoriteError?.();
				}
			},
		});
	}


	return (
		<Link to={`/images/${image.image_id}`}>
			<article className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
				<img
					src={`${import.meta?.env?.VITE_API_URL}/${image.file_path}`}
					alt={image.title}
					loading="lazy"
					className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
				/>

				{/* gradient overlay so text stays legible over any photo */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

				<button
					type="button"
					onClick={handleFavoriteClick}
					className="absolute top-3 right-3 rounded-full bg-black/40 p-2 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/60 active:scale-95"
				>
					<Heart
						size={18}
						className={`transition-all duration-300 ${isFavorited? 'fill-accent text-accent scale-110':'text-white'
							}`}
					/>
				</button>

				<div className="absolute inset-x-0 bottom-0 p-4 text-white">
					<h2 className="line-clamp-1 font-semibold drop-shadow-sm">
						{image.title}
					</h2>
					<p className="mt-1 text-xs text-white/70">
						{new Date(image.uploaded_at).toLocaleDateString()}
					</p>

					{image.tags.length>0&&(
						<div className="mt-2 flex flex-wrap gap-1.5 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
							{image.tags.slice(0,3).map((tag) => (
								<span
									key={tag}
									className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] backdrop-blur-sm"
								>
									#{tag}
								</span>
							))}
							{image.tags.length>3&&(
								<span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
									+{image.tags.length-3}
								</span>
							)}
						</div>
					)}
				</div>
			</article>
		</Link>
	);
}