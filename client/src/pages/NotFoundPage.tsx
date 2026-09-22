import { SearchIcon } from "lucide-react"
import { Link } from "react-router-dom";

import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty"
import {
	Button
} from "@/components/ui/button"

import { ImageOffIcon } from "lucide-react";


export function NotFoundPage() {
	return (
		<div className="min-h-screen bg-bg text-text-primary">
			<Empty>
				<EmptyHeader>
					<ImageOffIcon className="h-20 w-20 text-muted-foreground" />
					<EmptyTitle>404 - Not Found</EmptyTitle>
					<EmptyDescription>
						Sorry, we couldn't find the page you're looking for.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Link
						to="/"
					>
						<Button>
							Back to Gallery
						</Button>
					</Link>
					<EmptyDescription>
						Need help? <Link to="/support">Contact Support</Link>
					</EmptyDescription>
				</EmptyContent>
			</Empty>
		</div>
	)
}
