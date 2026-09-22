import { Outlet,Link,useLocation,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import NavBar from './NavBar';
import { api } from '../lib/api.ts';
import { showToast } from "../components/Toast";

const PAGE_TITLES: Record<string,string>={
	'/': 'Gallery',
	'/favorites': 'Favorites',
	'/upload': 'Upload',
};

export function Layout() {
	const { user,logout }=useAuth();
	const location=useLocation();
	const navigate=useNavigate();
	const title=PAGE_TITLES[location.pathname]??'';

	async function handleLogout() {
		try {
			const response=await api.post("/auth/logout");
			logout();
			showToast({
				description: response.data.message,
			});
			navigate('/login',{ replace: true });
		} catch(error) {
			if(axios.isAxiosError(error)) {
				showToast({
					description: error?.response?.data?.message??'Could not logout',
				});
			} else {
				showToast({
					description: '⚠ Something went wrong, please try again',
				});
			}
		}
	}

	return (
		<div className="min-h-screen bg-bg text-text-primary pb-16">
			<nav className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
				<Link to="/" className="font-bold text-lg">
					img<span className="text-accent">app</span>
				</Link>
				<span className="text-sm text-text-muted">{title}</span>
				{user? (
					<button onClick={handleLogout} className="bg-accent text-bg font-semibold rounded-lg px-4 py-2 text-sm">
						Log out
					</button>
				):(
					<Link to="/login" className="bg-accent text-bg font-semibold rounded-lg px-4 py-2 text-sm">
						Log in
					</Link>
				)}
			</nav>
			<main className="p-6">
				<Outlet />
			</main>
			<NavBar />
		</div>
	);
}