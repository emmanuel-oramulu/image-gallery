import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"
import {
	MailIcon, Lock, EyeOffIcon, EyeIcon
} from "lucide-react"

import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api.ts';

import { showToast } from "../components/Toast"

export function LoginPage() {
	const [loginError, setLoginError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const location = useLocation();
	const navigate = useNavigate();
	const from = location.state?.from?.pathname ?? '/';

	const { login } = useAuth();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	async function onSubmit(data: LoginFormValues) {
		try {
			setLoginError("");
			const response = await api.post('/auth/login', data);

			const { user, accessToken } = response.data;
			login(user, accessToken);
			showToast({
				description: "Welcome back!",
			});
			navigate(from, { replace: true });
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setLoginError(error?.response?.data?.message ?? 'Login failed');
			} else {
				setLoginError('⚠ Something went wrong, please try again');
			}
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
					<InputGroup>
						<InputGroupInput  {...register('email')} id="fieldgroup-email" type="email" placeholder="Enter your email" />
						<InputGroupAddon>
							<MailIcon />
						</InputGroupAddon>
					</InputGroup>
					{errors.email && <FieldDescription className="text-red-400 text-sm mt-1">{errors.email.message}</FieldDescription>}
				</Field>
				<Field>
					<FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
					<InputGroup>
						<InputGroupInput {...register('password')} id="fieldgroup-password" type={showPassword ? "text" : "password"} placeholder="Enter your password " />
						<InputGroupAddon>
							<Lock />
						</InputGroupAddon>
						<InputGroupAddon align="inline-end">
							{!showPassword ? <EyeIcon onClick={() => { setShowPassword(!showPassword); }} /> :
								<EyeOffIcon onClick={() => { setShowPassword(!showPassword) }} />}
						</InputGroupAddon>
					</InputGroup>
					{errors.password && <FieldDescription className="text-red-400 text-sm mt-1">{errors.password.message}</FieldDescription>}
				</Field>
				<Field>
					<Button type="submit" variant={isSubmitting ? "outline" : "default"} disabled={isSubmitting}>
						{isSubmitting && <Spinner data-icon="inline-start" />}
						{isSubmitting ? "Logging in..." : "Log in"}
					</Button>
				</Field>
				{loginError && <FieldDescription className="text-red-400 text-sm mt-1">{loginError}</FieldDescription>}
			</FieldGroup >
		</form >
	);
}