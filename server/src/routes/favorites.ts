import express from 'express';
import favoriteController from '../controllers/favorite.controller.js';
import requireAuth from '../middlewares/auth/requireAuth.js';

const router = express.Router();


router.get('/', requireAuth, favoriteController.getFavorites);

export default router;