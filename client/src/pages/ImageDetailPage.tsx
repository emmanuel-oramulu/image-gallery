import { useParams,useNavigate,Link } from 'react-router-dom'
import { useQuery,useQueryClient } from '@tanstack/react-query'
import { useState,useEffect } from 'react'
import { ArrowLeftIcon,Heart,Trash2,LoaderIcon,Share2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useFavoriteToggle } from '../hooks/useFavoriteToggle'
import { NetworkError } from '../components/NetworkError'
import type { GalleryImage } from '../types/gallery'

export function ImageDetailPage() {
	const { imageId }=useParams<{ imageId: string }>()
	const navigate=useNavigate()
	const { user }=useAuth()
	const queryClient=useQueryClient()

	const {
		data: image,
		isLoading,
		isError,
	}=useQuery({
		queryKey: ['image',imageId],
		queryFn: async () => {
			const response=await api.get<GalleryImage>(`/images/${imageId}`)
			return response.data
		},
		enabled: !!imageId,
	})

	const { data: favorites=[] }=useQuery({
		queryKey: ['favorites'],
		queryFn: async () => {
			const response=await api.get<GalleryImage[]>('/favorites')
			return response.data
		},
		enabled: !!user,
	})

	const initialFavorited=favorites.some((f) => f.image_id===imageId)
	const [isFavorited,setIsFavorited]=useState(initialFavorited)

	useEffect(() => {
		setIsFavorited(initialFavorited)
	},[initialFavorited])

	const { mutate: toggleFavorite }=useFavoriteToggle(imageId??'')
	const [isDeleting,setIsDeleting]=useState(false)

	function handleFavoriteClick() {
		const nextState=!isFavorited
		setIsFavorited(nextState)
		toggleFavorite(nextState,{
			onError: () => setIsFavorited(!nextState),
		})
	}

	async function handleDelete() {
		if(!imageId) return
		const confirmed=window.confirm('Delete this image? This cannot be undone.')
		if(!confirmed) return

		setIsDeleting(true)
		try {
			await api.delete(`/images/${imageId}`)
			queryClient.setQueryData<GalleryImage[]>(['images'],(old) =>
				old?.filter((img) => img.image_id!==imageId)??[]
			)
			navigate('/')
		} catch {
			setIsDeleting(false)
		}
	}

	async function handleShare() {
		if(!navigator.share) return
		try {
			await navigator.share({
				title: image?.title,
				url: window.location.href,
			})
		} catch {

		}
	}

	const isOwner=!!user&&!!image&&'user_id' in image&&(image as unknown as { user_id: string }).user_id===(user as unknown as { user_id?: string }).user_id

	return (
		<div className="min-h-screen bg-bg">
			<header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-md">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="flex items-center gap-2 rounded-full p-2 text-text-muted transition hover:text-accent"
					aria-label="Go back"
				>
					<ArrowLeftIcon size={20} />
				</button>

				{image&&(
					<div className="flex items-center gap-2">
						{typeof navigator.share==='function'&&(
							<button
								type="button"
								onClick={handleShare}
								className="rounded-full p-2 text-text-muted transition hover:text-accent"
								aria-label="Share image"
							>
								<Share2 size={20} />
							</button>
						)}

						<button
							type="button"
							onClick={handleFavoriteClick}
							className="rounded-full p-2 text-text-muted transition hover:scale-110 hover:text-accent active:scale-95"
							aria-label={isFavorited? 'Remove from favorites':'Add to favorites'}
						>
							<Heart
								size={20}
								className={isFavorited? 'fill-accent text-accent':''}
							/>
						</button>

						{isOwner&&(
							<button
								type="button"
								onClick={handleDelete}
								disabled={isDeleting}
								className="rounded-full p-2 text-text-muted transition hover:text-red-400 disabled:opacity-50"
								aria-label="Delete image"
							>
								{isDeleting? (
									<LoaderIcon size={20} className="animate-spin" />
								):(
									<Trash2 size={20} />
								)}
							</button>
						)}
					</div>
				)}
			</header>

			<main className="mx-auto w-full max-w-3xl px-4 py-8">
				{isLoading&&(
					<div className="flex items-center justify-center py-24 text-text-muted">
						<LoaderIcon size={24} className="animate-spin" />
					</div>
				)}

				{isError&&!isLoading&&<NetworkError />}

				{!isLoading&&!isError&&!image&&(
					<div className="flex flex-col items-center gap-3 py-24 text-center text-text-muted">
						<p>This image couldn't be found.</p>
						<Link to="/" className="text-accent hover:underline">
							Back to gallery
						</Link>
					</div>
				)}

				{!isLoading&&!isError&&image&&(
					<article>
						<div className="overflow-hidden rounded-2xl border border-border">
							<img
								src={`${import.meta.env.VITE_API_URL||'http://localhost:8000'}/${image.file_path}`}
								alt={image.title}
								className="w-full object-cover"
							/>
						</div>

						<div className="mt-6">
							<h1 className="text-xl font-semibold text-text-primary">
								{image.title}
							</h1>
							<p className="mt-1 text-sm text-text-muted">
								{new Date(image.uploaded_at).toLocaleDateString(undefined,{
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</p>

							{image.tags.length>0&&(
								<div className="mt-4 flex flex-wrap gap-2">
									{image.tags.map((tag) => (
										<span
											key={tag}
											className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted"
										>
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>
					</article>
				)}
			</main>
		</div>
	)
}