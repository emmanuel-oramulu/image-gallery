import { type Request, type Response, type NextFunction } from 'express';
import favoriteRepository from '../repositories/favorite.repository.js';
import {
	ImageNotFoundError,
	FavoriteAlreadyExistsError,
	FavoriteNotFoundError,
	InvalidImageIdError,
	InvalidAccessTokenError
} from '../middlewares/errors/errors.js';
import getTags from '../utils/getTags.js';

interface FavoriteImage {
	id: number;
	image_id: string;
	user_id: string;
	title: string;
	tags?: string[];
	file_path: string;
	uploaded_at: string;
};

interface FavoriteImageWithoutId {
	image_id: string;
	title: string;
	tags?: string[];
	file_path: string;
	uploaded_at: string;
}

interface SqliteError extends Error {
	code: string;
	errcode: number;
	errstr: string;
}

const favoriteController = {
	addFavorite(req: Request, res: Response, next: NextFunction) {
		try {
			const imageId = req.params.imageId;
			if (typeof imageId !== 'string') {
				return next(new InvalidImageIdError('A valid image id is required'));
			}
			const { userId } = req;
			if (!userId) {
				return next(new InvalidAccessTokenError('Authentication required'));
			}

			const internalId = favoriteRepository.getImageInternalIdStmt.get(imageId) as unknown as { id: number };

			if (!internalId) {
				return next(new ImageNotFoundError('Image could not be found'));
			}
			favoriteRepository.addFavoriteStmt.run(userId, internalId.id);
			res.status(201).json({ message: 'Image has been added to favorite' });

		} catch (err) {
			if (err instanceof Error) {
				const sqliteErr = err as SqliteError;
				if (sqliteErr.code === 'ERR_SQLITE_ERROR' && sqliteErr.errcode === 1555) return next(new FavoriteAlreadyExistsError());
			}
			next(err);
		}
	},

	removeFavorite(req: Request, res: Response, next: NextFunction) {
		try {
			const imageId = req.params.imageId;
			if (typeof imageId !== 'string') {
				return next(new InvalidImageIdError('A valid image id is required'));
			}
			const { userId } = req;
			if (!userId) {
				return next(new InvalidAccessTokenError('Authentication required'));
			}
			const internalId = favoriteRepository.getImageInternalIdStmt.get(imageId) as unknown as { id: number };

			if (!internalId) {
				return next(new ImageNotFoundError('Image could not be found'));
			}

			const response = favoriteRepository.removeFavoriteStmt.run(userId, internalId.id);

			if (response.changes === 0) {
				return next(new FavoriteNotFoundError());
			}

			res.status(200).json({ message: 'Image has been removed from favorites.' })

		} catch (err) {
			next(err);
		}
	},

	getFavorites(req: Request, res: Response, next: NextFunction) {
		try {
			const { userId } = req;
			if (!userId) {
				return next(new InvalidAccessTokenError('Authentication required'));
			}
			const favoriteImages = favoriteRepository.getFavoritesStmt.all(userId) as unknown as FavoriteImage[];

			const responseData = getTags(favoriteImages);

			res.status(200).json(responseData);

		} catch (err) {
			next(err);
		}
	},
};

export default favoriteController;