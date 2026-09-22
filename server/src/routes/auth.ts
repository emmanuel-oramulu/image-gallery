import express from 'express';
import {
	registerSchema,
	loginSchema
} from '../schemas/auth.schema.js'
import {
	register,
	login,
	refresh,
	me,
	logout,
} from '../controllers/auth.controller.js';
import {
	validate
} from '../middlewares/auth/validate.js';
import {
	IPRateLimiter,
	EmailRateLimiter
} from '../middlewares/auth/rateLimiter.js'
import requireAuth from '../middlewares/auth/requireAuth.js'

const router=express.Router();

router.post('/register',validate(registerSchema),register);
router.post('/login',IPRateLimiter,validate(loginSchema),EmailRateLimiter,login);
router.post('/refresh',IPRateLimiter,refresh);
router.get('/me',requireAuth,me)
router.post('/logout',logout);

export default router; 