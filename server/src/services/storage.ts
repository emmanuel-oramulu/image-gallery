import fs from 'node:fs';
import path from 'node:path';
import {
	fileURLToPath
} from 'node:url';

const YEAR=new Date().getUTCFullYear();
const __filename: string=fileURLToPath(import.meta.url);
const __dirname: string=path.dirname(__filename);
const UPLOADS_DIR: string=path.resolve(__dirname,'..','uploads',`${YEAR}`)

fs.mkdirSync(UPLOADS_DIR,{
	recursive: true
})

export function save(base64_img: string,uuid: string,ext: string) {
	if(!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(base64_img)) {
		throw new Error('Invalid image format');
	}
	const base64Str=base64_img.split(',')[1];
	const buffer=Buffer.from(base64Str!,'base64');

	const fileName=`${uuid}_photo.${ext}`;
	const filePath=`uploads/${YEAR}/${fileName}`

	try {
		fs.writeFileSync(path.resolve(UPLOADS_DIR,fileName),buffer);
		return filePath;
	} catch(err) {
		throw new Error(`Could not save image: ${err instanceof Error? err.message:err}`);
	}
}

export function remove(filePath: string) {
	// filepath = uploads/2026/uuid_photo.png
	// __dirname = /data/data/com.termux/files/home/profile-vault/server/src/services
	const DIR: string=path.resolve(__dirname,'..',filePath);

	if(fs.existsSync(DIR)) {
		try {
			fs.unlinkSync(DIR);
			return true;
		} catch(err) {
			throw new Error(`Could not delete file: ${err instanceof Error? err.message:err}`);
		}
	} else {
		console.warn(`File not found, nothing to delete: ${filePath}`);
		return true;
	}
}