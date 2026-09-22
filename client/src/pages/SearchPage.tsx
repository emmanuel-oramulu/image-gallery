import { useQuery } from '@tanstack/react-query';
import { api } from "../lib/api";
import { SearchBar } from '../components/SearchBar'
import { ImageCard } from '../components/ImageCard'
import { useState,useEffect,useRef } from 'react'
import { SearchIcon } from 'lucide-react'
import type { GalleryImage } from '../types/gallery'
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_TAGS=['sunset','beach','mountains','city','nature','portrait']

export function SearchPage() {
	const [search,setSearch]=useState<string>('');
	const { user }=useAuth();
	const inputRef=useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus()
	},[])

	const debounceTerm=useDebounce(search,1000);

	const {
		data: results=[],
		isLoading,
		isError,
		refetch }=useQuery({
			queryKey: ["search",debounceTerm],
			queryFn: async () => {
				const response=await api.get<GalleryImage[]>(`/images?search=${debounceTerm}`);
				return response.data
			},
			enabled: !!debounceTerm,
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

	const isPending=search!==debounceTerm||isLoading;

	return (
		<div className="min-h-screen bg-bg px-4 py-8">
			<header className="mx-auto w-full max-w-3xl flex justify-center">
				<SearchBar inputRef={inputRef} search={search} setSearch={setSearch} />
			</header>

			<main className="mx-auto mt-8 w-full max-w-5xl">
				{search===''&&(
					<div className="flex flex-col items-center gap-6 py-16 text-center">
						<div className="flex flex-col items-center gap-3 text-muted-foreground">
							<SearchIcon size={32} className="opacity-50" />
							<p>Search by title or tag</p>
						</div>

						<div className="flex flex-wrap justify-center gap-2 max-w-md">
							{SUGGESTED_TAGS.map((tag) => (
								<button
									key={tag}
									type="button"
									onClick={() => setSearch(tag)}
									className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-muted transition hover:border-accent hover:text-accent"
								>
									#{tag}
								</button>
							))}
						</div>
					</div>
				)}

				{isPending&&!isError&&(
					<div className="flex items-center justify-center py-24 text-muted-foreground">
						Searching...
					</div>
				)}

				{isError&&(
					<div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
						<p>Something went wrong. Please try again.</p>
						<button
							type="button"
							onClick={() => refetch()}
							className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-text-muted transition hover:border-accent hover:text-accent"
						>
							Try again
						</button>
					</div>
				)}

				{search!==''&&!isPending&&!isError&&results.length===0&&(
					<div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
						<p>No images found for "{search}"</p>
					</div>
				)}


				{!isPending&&!isError&&results.length>0&&(
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{results.map((image) => (
							<ImageCard
								key={image.image_id}
								image={image}
								isFavorited={favoritedIds.has(image.image_id)}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	)
}