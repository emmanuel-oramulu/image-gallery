'use strict';
import { type Request,type Response,type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import generateId from '../utils/generateId.js';
import {
	signAccessToken,
	generateRefreshToken
} from '../utils/generateTokens.js';
import {
	hashToken
} from '../utils/crypto.js';
import {
	getRefreshTokenExpiry,
	REFRESH_TOKEN_MAX_AGE_MS
} from '../utils/dates.js';
import {
	ConflictError,
	InvalidCredentialsError,
	InvalidTokenError,
	InvalidAccessTokenError
} from '../middlewares/errors/errors.js';
import emitter from '../events/emitter.js'

const DUMMY_HASH: string='$2b$10$5zf4gPrWZKwlqPYZ6yPj5Oz3DsjY3H/eji61p/RWPmXIDZYfsWyGS';

const getExistingUserStmt=db.prepare(`SELECT id FROM users WHERE email = ?;`);
const insertUserStmt=db.prepare(`INSERT INTO users (user_id, name, email, password_hash) VALUES (?, ?, ?, ?);`);

const getUserStmt=db.prepare(`SELECT user_id, name, email, password_hash FROM users WHERE email = ?;`);

const insertRefreshTokenStmt=db.prepare(`INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?);`);

const getTokenStmt=db.prepare(`SELECT user_id, expires_at, deleted_at FROM refresh_tokens WHERE token_hash = ? AND deleted_at IS NULL AND expires_at > ?;`);

const updateTokenStmt=db.prepare(`UPDATE refresh_tokens SET deleted_at = ? WHERE token_hash = ?;`);

const getUserByIdStmt=db.prepare(`SELECT name, email FROM users WHERE user_id = ?;`);

interface ReqBody {
	name: string;
	email: string;
	password: string;
}
interface UserRow {
	user_id: string;
	name: string;
	email: string;
	password_hash: string;
}
interface LoginUserRow {
	name: string;
	email: string;
}
interface TokenRow {
	user_id: string;
	expires_at: string;
	deleted_at: string;
}
interface SQLiteError extends Error {
	code?: string;
	errcode?: number;
}
export const register=async (req: Request,res: Response,next: NextFunction) => {
	try {
		const {
			name,
			email,
			password
		}=req.body as ReqBody;

		const user=getExistingUserStmt.get(email) as UserRow|undefined;

		if(user) return next(new ConflictError('You already have an account, try logging in instead'));

		const hashedPassword=await bcrypt.hash(password,10);
		const user_id=generateId();

		insertUserStmt.run(user_id,name,email,hashedPassword);

		res.status(201).json({
			user_id,name
		});

		emitter.emit('user:registered',{
			name,email
		});

	} catch(err) {
		if(err instanceof Error) {
			const sqliteErr=err as SQLiteError;
			if(sqliteErr.code==='ERR_SQLITE_ERROR'&&sqliteErr.errcode===19) return next(new ConflictError('You already have an account, try logging in instead'));
		}
		next(err);
	}
};

export const login=async (req: Request,res: Response,next: NextFunction) => {
	try {
		const {
			email,
			password
		}=req.body;
		const user=getUserStmt.get(email) as UserRow|undefined;

		const hashedPassword: string=user?.password_hash??DUMMY_HASH;
		const match=await bcrypt.compare(password,hashedPassword);
		if(!user||!match) {
			return next(new InvalidCredentialsError('Invalid email or password'));
		}

		const accessToken=signAccessToken(user.user_id);
		const refreshToken=generateRefreshToken();

		const hashedRefreshToken=hashToken(refreshToken);

		const expiresAt=getRefreshTokenExpiry();

		insertRefreshTokenStmt.run(user.user_id,
			hashedRefreshToken,expiresAt);

		res.cookie('refreshToken',
			refreshToken,
			{
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: REFRESH_TOKEN_MAX_AGE_MS,
			});

		const {
			name,user_id
		}=user;

		res.status(200).json({
			accessToken,
			user: {
				user_id,
				name,
				email
			}
		});

	} catch(err) {
		next(err);
	}
}

export const refresh=(req: Request,res: Response,next: NextFunction) => {
	try {
		const oldToken=req.cookies.refreshToken;
		if(!oldToken) return next(new InvalidTokenError());

		const hashedToken=hashToken(oldToken);
		const token=getTokenStmt.get(hashedToken,new Date().toISOString()) as TokenRow|undefined;
		if(!token) return next(new InvalidTokenError());

		const newRefreshToken=generateRefreshToken();
		const newAccessToken=signAccessToken(token.user_id);

		const newHashedToken=hashToken(newRefreshToken);

		insertRefreshTokenStmt.run(token.user_id,newHashedToken,getRefreshTokenExpiry());
		updateTokenStmt.run(new Date().toISOString(),hashedToken);

		res.cookie('refreshToken',newRefreshToken,{
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: REFRESH_TOKEN_MAX_AGE_MS
		});

		res.status(200).json({
			newAccessToken
		});
	} catch(err) {
		next(err);
	}
};

export const me=(req: Request,res: Response,next: NextFunction) => {
	try {
		const { userId }=req;
		if(!userId) {
			return next(new InvalidAccessTokenError('Authentication required'));
		}
		const user=getUserByIdStmt.get(userId) as LoginUserRow|undefined;

		if(!user) return next(new InvalidAccessTokenError('Authentication required'));

		res.status(200).json({ user_id: userId,...user });
	} catch(err) {
		next(err);
	}
}

export const logout=(req: Request,res: Response,next: NextFunction) => {
	try {
		const currentToken=req.cookies.refreshToken;
		if(currentToken) {
			const hashedToken=hashToken(currentToken);

			updateTokenStmt.run(new Date().toISOString(),hashedToken);
		}

		res.clearCookie('refreshToken');
		res.status(200).json({
			message: 'You logged out'
		});

	} catch(err) {
		next(err);
	}
};