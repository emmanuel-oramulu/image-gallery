export default function convertToWebp(file: File,quality=0.8) {
	return new Promise((resolve,reject) => {
		const img=new Image();
		img.onload=() => {
			const canvas=document.createElement('canvas');
			canvas.height=img.height;
			canvas.width=img.width;
			const ctx=canvas.getContext("2d");
			if(!ctx) return reject(new Error("Canvas context is not available"));
			ctx.drawImage(img,0,0);
			canvas.toBlob((blob) => {
				if(!blob) return reject(new Error("WebP conversion failed"));
				const reader=new FileReader();
				reader.onloadend=() => resolve(reader.result as string);
				reader.onerror=reject;
				reader.readAsDataURL(blob);
			},'image/webp',quality);
		}
		img.onerror=reject;
		img.src=URL.createObjectURL(file);
	})
}