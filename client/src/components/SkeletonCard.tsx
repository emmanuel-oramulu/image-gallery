import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
	return (
		<div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
			<Skeleton className="h-full w-full" />
			<div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
				<Skeleton className="h-4 w-2/3 bg-white/20" />
				<Skeleton className="h-3 w-1/3 bg-white/10" />
			</div>
		</div>
	)
}