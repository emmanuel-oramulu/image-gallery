import { Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

export function EmptyGallery() {
	const navigate = useNavigate();

	return (
		<Empty className="border border-dashed border-border">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Image size={24} />
				</EmptyMedia>
				<EmptyTitle>No images yet</EmptyTitle>

				<EmptyDescription>
					Upload your first image to start building your gallery.
				</EmptyDescription>
			</EmptyHeader>

			<EmptyContent>
				<Button size="sm" onClick={() => navigate("/upload")}>
					Upload Image
				</Button>
			</EmptyContent>
		</Empty>
	);
}