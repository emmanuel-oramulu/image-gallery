import axios from 'axios';
import { getToken } from './tokenStore';

export const api=axios.create({
	baseURL: 'http://localhost:8000/api/v1',
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	const token=getToken();
	if(token) {
		config.headers.Authorization=`Bearer ${token}`;
	}
	return config;
});