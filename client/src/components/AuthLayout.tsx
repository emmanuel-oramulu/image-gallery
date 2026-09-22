import { Link, Outlet, useLocation } from 'react-router-dom';

const LOGIN = { headline: "Welcome back", sub: "Your gallery's been waiting" };

const REGISTER = { headline: "Start your gallery.", sub: "Join and start organizing your photos in seconds" };

export function AuthLayout() {
	const location = useLocation();
	const { pathname } = location;

	return (
		<div className="min-h-screen bg-bg text-text-primary flex">
			<div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
				<Link to="/" className="font-bold text-lg mb-12 text-center">
					img<span className="text-accent">app</span>
				</Link>
				<h2 className="text-3xl font-bold mb-2 text-center">
					{pathname === '/login' ? LOGIN["headline"] : REGISTER["headline"]}
				</h2>
				<p className="text-text-muted mb-8 text-sm text-center">
					{pathname === '/login' ? LOGIN["sub"] : REGISTER["sub"]}
				</p>
				<Outlet />

				{pathname === "/login" ? <p className="text-text-muted text-sm text-center mt-2">Don't have an account? <Link to="/register" className="text-bold text-text-primary">Sign Up</Link></p> : <p className="text-text-muted text-sm text-center mt-2">Already have an account? <Link to="/login" className="text-bold text-text-primary">Log In</Link></p>}
			</div>

			<div className="hidden md:flex md:w-1/2 bg-surface border-l border-border items-center justify-center px-16">
				<div className="max-w-sm text-center">
					<h2 className="text-3xl font-bold mb-4">
						Every image tells a story.
					</h2>
					<p className="text-text-muted text-lg">
						Upload, tag, and rediscover your favorite moments — anytime.
					</p>
				</div>
			</div>
		</div>
	);
}
