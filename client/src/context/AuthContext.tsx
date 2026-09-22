import { useState,createContext,useContext,useEffect } from 'react';
import { api } from '../lib/api';
import { setToken } from '../lib/tokenStore';

type AccessToken=string;

interface User {
	user_id: string;
	name: string;
	email: string;
}

interface AuthContextType {
	user: User|null;
	loading: boolean;
	accessToken: AccessToken|null;
	login: (user: User,token: AccessToken) => void;
	logout: () => void;
}

const AuthContext=createContext<AuthContextType|undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [loading,setLoading]=useState<boolean>(true);
	const [user,setUser]=useState<User|null>(null);
	const [accessToken,setAccessToken]=useState<AccessToken|null>(null);

	useEffect(() => {
		(async function() {
			try {
				const response=await api.post('/auth/refresh');

				const token=response.data.newAccessToken;
				const res=await api.get('/auth/me',{
					headers: {
						Authorization: `Bearer ${token}`,
					}
				});

				login(res.data,token)

			} catch(err) {

			} finally {
				setLoading(false);
			}
		})()
	},[]);

	function login(user: User,token: AccessToken) {
		if(typeof token!=='string') return;
		setAccessToken(token);
		setToken(token);
		setUser(user);
	}

	function logout() {
		setAccessToken(null);
		setToken(null);
		setUser(null)
	}
	return (
		<AuthContext.Provider value={{ loading,user,accessToken,login,logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context=useContext(AuthContext);
	if(context===undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}