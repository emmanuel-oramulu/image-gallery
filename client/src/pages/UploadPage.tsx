import { useState } from 'react'
import { useForm,Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { X,UploadCloud,ImageIcon } from 'lucide-react'
import { imageUploadSchema } from '../schemas/upload.schema'
import convertToWebp from '../utils/convertToWebp'
import { api } from '../lib/api'
import { showToast } from '../components/Toast'
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldDescription,
	FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { z } from 'zod'

type UploadFormValues=z.infer<typeof imageUploadSchema>

export function UploadPage() {
	const navigate=useNavigate()
	const [tagInput,setTagInput]=useState('')
	const [preview,setPreview]=useState<string|null>(null)
	const [isSubmitting,setIsSubmitting]=useState(false)

	const {
		control,
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	}=useForm<UploadFormValues>({
		resolver: zodResolver(imageUploadSchema),
		defaultValues: { title: '',tags: [] },
	})

	const tags=watch('tags')

	function addTag(raw: string) {
		const tag=raw.trim().toLowerCase()
		if(!tag) return
		if(tags.includes(tag)) {
			setTagInput('')
			return
		}
		setValue('tags',[...tags,tag],{ shouldValidate: true })
		setTagInput('')
	}

	function removeTag(tagToRemove: string) {
		setValue(
			'tags',
			tags.filter((t) => t!==tagToRemove),
			{ shouldValidate: true }
		)
	}

	function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if(e.key==='Enter'||e.key===',') {
			e.preventDefault()
			addTag(tagInput)
		} else if(e.key==='Backspace'&&tagInput===''&&tags.length>0) {
			removeTag(tags[tags.length-1])
		}
	}

	async function onSubmit(data: UploadFormValues) {
		setIsSubmitting(true)
		try {
			const imageData=await convertToWebp(data.image)

			await api.post('/images/upload',{
				title: data.title,
				tags: data.tags,
				imageData,
			})

			showToast({ title: 'Image uploaded',type: 'success' })
			navigate('/')
		} catch(err) {
			showToast({ title: 'Upload failed. Please try again.',type: 'error' })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="min-h-screen bg-bg px-4 py-8">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="mx-auto w-full max-w-xl"
			>
				<FieldGroup>
					<Controller
						name="image"
						control={control}
						render={({ field }) => {
							const { getRootProps,getInputProps,isDragActive }=useDropzone({
								accept: { 'image/*': ['.png','.jpg','.jpeg','.webp'] },
								maxFiles: 1,
								onDrop: (acceptedFiles) => {
									const file=acceptedFiles[0]
									if(!file) return
									field.onChange(file)
									setPreview(URL.createObjectURL(file))
								},
							})

							return (
								<Field>
									<FieldLabel>Image</FieldLabel>
									<div
										{...getRootProps()}
										className={`relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${isDragActive
											? 'border-accent bg-accent/5'
											:'border-border bg-surface'
											}`}
									>
										<input {...getInputProps()} />
										{preview? (
											<img
												src={preview}
												alt="Selected preview"
												className="h-full w-full object-cover"
											/>
										):(
											<div className="flex flex-col items-center gap-2 text-text-muted">
												{isDragActive? (
													<UploadCloud size={32} />
												):(
													<ImageIcon size={32} />
												)}
												<p className="text-sm">
													{isDragActive
														? 'Drop the image here'
														:'Drag & drop an image, or click to select'}
												</p>
											</div>
										)}
									</div>
									{errors.image&&(
										<FieldError>{errors.image.message}</FieldError>
									)}
								</Field>
							)
						}}
					/>

					<Field>
						<FieldLabel htmlFor="title">Title</FieldLabel>
						<Input id="title" {...register('title')} placeholder="Give your image a title" />
						<FieldDescription>15–80 characters.</FieldDescription>
						{errors.title&&<FieldError>{errors.title.message}</FieldError>}
					</Field>

					<Field>
						<FieldLabel htmlFor="tags">Tags</FieldLabel>
						<div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
							{tags.map((tag) => (
								<span
									key={tag}
									className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-text-primary"
								>
									#{tag}
									<button
										type="button"
										onClick={() => removeTag(tag)}
										className="text-text-muted hover:text-accent"
									>
										<X size={12} />
									</button>
								</span>
							))}
							<input
								id="tags"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={handleTagKeyDown}
								placeholder={tags.length===0? 'Add a tag and press Enter':''}
								className="flex-1 min-w-[100px] bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
							/>
						</div>
						<FieldDescription>Press Enter or comma to add a tag. 1–10 tags.</FieldDescription>
						{errors.tags&&(
							<FieldError>
								{errors.tags.message??errors.tags.root?.message}
							</FieldError>
						)}
					</Field>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting? 'Uploading...':'Upload'}
					</Button>
				</FieldGroup>
			</form>
		</div>
	)
}