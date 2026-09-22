import axios from 'axios';
import { getToken } from './tokenStore';

export const api=axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	const token=getToken();
	if(token) {
		config.headers.Authorization=`Bearer ${token}`;
	}
	return config;
});