import AppError from './appError.js';

export class ValidationError extends AppError {
	fieldErrors: Record<string, string>;
	constructor(fieldErrors: Record<string, string>) {
		super('Validation failed', 400);
		this.name = 'ValidationError';
		this.fieldErrors = fieldErrors;
	}
};

export class ConflictError extends AppError {

	constructor(message = 'Resource already exists') {
		super(message, 409);
		this.name = 'ConflictError';
	}
};

export class InvalidCredentialsError extends AppError {
	constructor(message: string) {
		super(message, 401);
		this.name = 'InvalidCredentialsError';
	}
}

export class InvalidTokenError extends AppError {
	constructor(message = 'Invalid or expired token, please login again') {
		super(message, 401);
		this.name = 'InvalidTokenError';
	}
}

export class InvalidAccessTokenError extends AppError {
	constructor(message = 'Invalid or expired token. Authentication failed.') {
		super(message, 401);
		this.name = 'InvalidAccessTokenError';
	}
}

export class ImageNotFoundError extends AppError {
	constructor(message: string) {
		super(message, 404);
		this.name = 'ImageNotFoundError';
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string) {
		super(message, 403);
		this.name = 'AuthorizationError';
	}
}

export class FavoriteAlreadyExistsError extends AppError {

	constructor(message = 'Image is already in your favorites') {
		super(message, 409);
		this.name = 'FavoriteAlreadyExistsError';
	}
};

export class FavoriteNotFoundError extends AppError {
	constructor(message = 'This image is not in your favorites') {
		super(message, 404);
		this.name = 'FavoriteNotFoundError';
	}
};

export class InvalidImageIdError extends AppError {
	constructor(message: string) {
		super(message, 400);
		this.name = 'InvalidImageIdError';
	}
}