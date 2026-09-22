let currentToken: string|null=null;

export function setToken(token: string|null) {
	currentToken=token;
}

export function getToken() {
	return currentToken;
}