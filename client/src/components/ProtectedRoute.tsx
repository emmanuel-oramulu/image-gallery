import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return (
		<div className="h-dvh w-full flex items-center justify-center">
			<LoaderIcon
				role="status"
				aria-label="Loading"
				className={cn("size-7 animate-spin")}
			/>
		</div>
	);

	if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

	return <>{children}</>;
}