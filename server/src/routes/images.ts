import express from 'express';
import {
	imageUploadSchema
} from '../schemas/imageUpload.schema.js'
import {
	uploadImage,
	getImages,
	getImage,
	deleteImage
} from '../controllers/image.controller.js';
import favoriteController from '../controllers/favorite.controller.js';
import {
	validate
} from '../middlewares/auth/validate.js';
import requireAuth from '../middlewares/auth/requireAuth.js';

const router=express.Router();

router.post('/upload',requireAuth,validate(imageUploadSchema),uploadImage);
router.get('/',getImages);
router.delete('/:imageId',requireAuth,deleteImage);

router.post('/:imageId/favorite',requireAuth,favoriteController.addFavorite);
router.delete('/:imageId/favorite',requireAuth,favoriteController.removeFavorite);
router.get('/favorites',requireAuth,favoriteController.getFavorites);
router.get('/:imageId',getImage);

export default router;