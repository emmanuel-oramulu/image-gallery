import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	MailIcon,User,Lock,EyeOffIcon,EyeIcon
} from "lucide-react"
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
import { registerSchema,type RegisterFormValues } from '../schemas/register.schema';
import { api } from '../lib/api.ts';

export function RegisterPage() {
	const [registerError,setRegisterError]=useState<string|null>(null);
	const [showPassword,setShowPassword]=useState<boolean>(false)
	const navigate=useNavigate();
	const []=useState<string|null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors,isSubmitting },
	}=useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema),});

	async function onSubmit(data: RegisterFormValues) {
		try {
			setRegisterError("");
			await api.post('/auth/register',data);
			navigate('/login',{ replace: true });
		} catch(error) {
			if(axios.isAxiosError(error)) {
				setRegisterError(error?.response?.data?.message??'Sign Up failed');
			} else {
				setRegisterError("⚠ Something went wrong, please try again");
			}
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
					<InputGroup>
						<InputGroupInput {...register('name')} id="fieldgroup-name" type="text" placeholder="Enter your name" />
						<InputGroupAddon>
							<User />
						</InputGroupAddon>
					</InputGroup>
					{errors.name&&<FieldDescription className="text-red-400 text-sm mt-1">{errors.name.message}</FieldDescription>}
				</Field>
				<Field>
					<FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
					<InputGroup>
						<InputGroupInput  {...register('email')} id="fieldgroup-email" type="email" placeholder="Enter your email" />
						<InputGroupAddon>
							<MailIcon />
						</InputGroupAddon>
					</InputGroup>
					{errors.email&&<FieldDescription className="text-red-400 text-sm mt-1">{errors.email.message}</FieldDescription>}
				</Field>
				<Field>
					<FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
					<InputGroup>
						<InputGroupInput {...register('password')} id="fieldgroup-password" type={showPassword? "text":"password"} placeholder="Enter your password " />
						<InputGroupAddon>
							<Lock />
						</InputGroupAddon>
						<InputGroupAddon align="inline-end">
							{!showPassword? <EyeIcon onClick={() => { setShowPassword(!showPassword) }} />:
								<EyeOffIcon onClick={() => { setShowPassword(!showPassword) }} />}
						</InputGroupAddon>
					</InputGroup>
					{errors.password&&<FieldDescription className="text-red-400 text-sm mt-1">{errors.password.message}</FieldDescription>}
				</Field>
				<Field>
					<Button type="submit" variant={isSubmitting? "outline":"default"} disabled={isSubmitting}>
						{isSubmitting&&<Spinner data-icon="inline-start" />}
						{isSubmitting? "Signing up...":"Sign up"}
					</Button>
				</Field>
				{registerError&&<FieldDescription className="text-red-400 text-sm mt-1">{registerError}</FieldDescription>}
			</FieldGroup>
		</form>
	);
}