import { NavLink } from "react-router-dom";
import { House,ImagePlus,Star,Search } from "lucide-react";

interface NavBarProps {
	onSearchClick?: () => void;
}

function NavBar() {
	const navItems=[
		{ to: "/",icon: House,label: "Home" },
		{ to: "/upload",icon: ImagePlus,label: "Upload" },
		{ to: "/favorites",icon: Star,label: "Favorites" },
		{ to: "/search",icon: Search,label: "Search" },
	];

	const linkClasses=({ isActive }: { isActive: boolean }) =>
		`rounded-full p-2 transition-colors ${isActive
			? "text-primary"
			:"text-muted-foreground hover:text-foreground"
		}`;

	return (
		<nav className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-between rounded-3xl bg-surface px-4 py-5">
			{navItems.map(({ to,icon: Icon,label }) => (
				<NavLink key={to} to={to} className={linkClasses} aria-label={label}>
					<Icon size={24} />
				</NavLink>
			))}
		</nav>
	);
}

export default NavBar; 