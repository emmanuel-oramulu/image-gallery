import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

interface NetworkErrorProps {
	refetch?: () => void;
}

export function NetworkError({ refetch }: NetworkErrorProps) {
	return (
		<Empty className="border border-dashed border-border">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<WifiOff size={24} />
				</EmptyMedia>

				<EmptyTitle>Couldn't load images</EmptyTitle>

				<EmptyDescription>
					Check your internet connection and try again.
				</EmptyDescription>
			</EmptyHeader>

			<EmptyContent>
				<Button onClick={() => (refetch ? refetch() : window.location.reload())}>
					Try Again
				</Button>
			</EmptyContent>
		</Empty>
	);
}