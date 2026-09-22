import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthLayout } from './components/AuthLayout';
import { GalleryPage } from './pages/GalleryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UploadPage } from './pages/UploadPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SearchPage } from './pages/SearchPage';
import { ImageDetailPage } from './pages/ImageDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router=createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{ path: '/',element: <GalleryPage /> },
			{
				path: '/upload',
				element: (
					<ProtectedRoute>
						<UploadPage />
					</ProtectedRoute>
				),
			},
			{
				path: '/favorites',
				element: (
					<ProtectedRoute>
						<FavoritesPage />
					</ProtectedRoute>
				),
			},
		],
	},
	{
		element: <AuthLayout />,
		children: [
			{ path: '/login',element: <LoginPage /> },
			{ path: '/register',element: <RegisterPage /> },
		],
	},
	{ path: '/images/:imageId',element: <ImageDetailPage /> },
	{ path: '/search',element: <SearchPage /> },
	{ path: '*',element: <NotFoundPage /> }
]);