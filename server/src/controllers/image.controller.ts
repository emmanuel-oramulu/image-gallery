'use strict';
import { type Request,type Response,type NextFunction } from 'express';
import db from '../config/db.js';
import {
	save,
	remove
} from '../services/storage.js';
import {
	ImageNotFoundError,
	AuthorizationError,
	InvalidAccessTokenError,
	InvalidImageIdError
} from '../middlewares/errors/errors.js';
import generateId from '../utils/generateId.js';
import {
	withTransaction
} from '../utils/withTransaction.js';
import getNumber from '../utils/getNumber.js';
import getTags from '../utils/getTags.js';

const insertImageStmt=db.prepare(`INSERT INTO images (image_id, user_id, title, file_path) VALUES (?, ?, ?, ?);`);

const getTagStmt=db.prepare(`SELECT id FROM tags WHERE name = ?;`);

const insertTagStmt=db.prepare(`INSERT INTO tags (name) VALUES (?);`);

const linkImageToTagStmt=db.prepare(`INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?);`);

const getImageByIdStmt=db.prepare(`SELECT user_id FROM images WHERE image_id = ? AND deleted_at IS NULL;`);

const setSoftDeleteStmt=db.prepare(`UPDATE images SET deleted_at = ? WHERE image_id = ? AND deleted_at IS NULL;`);

const getImageDetailStmt=db.prepare('SELECT id, image_id, user_id, title, file_path, uploaded_at FROM images WHERE image_id = ? AND deleted_at IS NULL;')

interface ReqBody {
	title: string;
	tags: Array<string>;
	imageData: string;
}

interface Image {
	id: number;
	image_id: string;
	user_id: string;
	title: string;
	tags?: string[];
	file_path: string;
	uploaded_at: string;
}
interface ImageWithoutId {
	image_id: string;
	title: string;
	tags?: string[];
	file_path: string;
	uploaded_at: string;
}


export const uploadImage=(req: Request,res: Response,next: NextFunction) => {
	let filePath: string|undefined=undefined;
	try {
		const {
			title,
			tags,
			imageData
		}=req.body as ReqBody;
		const {
			userId
		}=req;

		if(!userId) {
			throw new Error('Unauthorized: no user id on request');
		}

		const match=imageData.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);

		if(!match||!match[1]) {
			throw new Error('Inavalid image format');
		}
		const ext=match[1];

		const fileUuid: string=generateId();
		const imageId: string=generateId();

		filePath=save(imageData,fileUuid,ext);

		const result=withTransaction(db,() => {
			if(!filePath) {
				throw new Error('File path was not set');
			}

			const imageInfo=insertImageStmt.run(imageId,userId,title,filePath);

			tags.forEach(t => {
				const tag=getTagStmt.get(t);
				if(!tag) {
					const tagInfo=insertTagStmt.run(t);

					linkImageToTagStmt.run(imageInfo!.lastInsertRowid,tagInfo!.lastInsertRowid);
				} else {
					linkImageToTagStmt.run(imageInfo!.lastInsertRowid,tag!.id!);
				}
			});

			return {
				image_id: imageId,title,tags,file_path: filePath
			}

		});
		res.status(201).json(result);
	} catch(err) {
		if(filePath) remove(filePath);
		next(err)
	}
};

export const getImages=(req: Request,res: Response,next: NextFunction) => {
	try {
		const page=getNumber(req.query.page,1);
		const limit=getNumber(req.query.limit,20);
		const offset=(page-1)*limit;
		const search=req.query.search;
		const tag=req.query.tag;

		const conditions: string[]=['i.deleted_at IS NULL',];
		const params: any[]=[];

		if(typeof search==='string'&&search&&search.trim()!=='') {
			conditions.push('i.title LIKE ?');
			params.push(`%${search}%`);
		}
		let joinClause='';
		if(typeof tag==='string'&&tag&&tag.trim()!=='') {
			joinClause=`JOIN image_tags it ON i.id = it.image_id JOIN tags t ON it.tag_id = t.id`;
			conditions.push('t.name = ?');
			params.push(tag);
		}

		const whereClause=conditions.join(' AND ');
		const sql=`SELECT i.id, i.image_id, i.user_id, i.title, i.file_path, i.uploaded_at FROM images i ${joinClause} WHERE ${whereClause} LIMIT ? OFFSET ?;`;

		params.push(limit,offset);

		const images=db.prepare(sql).all(...params) as unknown as Image[];

		function shuffle(images: ImageWithoutId[]) {
			const a=[...images];
			for(let i=a.length-1;i>0;i--) {
				const j=Math.floor(Math.random()*(i+1));
				[a[i]!,a[j]!]=[a[j]!,a[i]!];
			}
			return a;
		}

		const responseData=shuffle(getTags(images));

		res.status(200).json(responseData);
	} catch(err) {
		next(err);
	}
};

export const getImage=(req: Request,res: Response,next: NextFunction) => {
	try {
		const imageId=req.params.imageId;
		if(typeof imageId!=='string') {
			return next(new InvalidImageIdError('A valid image id is required'));
		}
		const image=getImageDetailStmt.get(imageId) as Image|undefined;
		if(!image) return next(new ImageNotFoundError('Image could not be found'));

		const fullImage=getTags([image])[0];
		res.status(200).json(fullImage);
	} catch(err) {
		next(err);
	}
}

export const deleteImage=(req: Request,res: Response,next: NextFunction) => {
	try {
		const imageId=req.params.imageId;
		if(typeof imageId!=='string') {
			return next(new InvalidImageIdError('A valid image id is required'));
		}
		const { userId }=req;
		if(!userId) {
			return next(new InvalidAccessTokenError('Authentication required'));
		}

		const image=getImageByIdStmt.get(imageId) as unknown as { user_id: string };
		if(!image) return next(new ImageNotFoundError('Image could not be found'));

		const isUser=userId===image.user_id
		if(!isUser) return next(new AuthorizationError('You can only delete images you uploaded'));

		const response=setSoftDeleteStmt.run(new Date().toISOString(),imageId);

		if(response.changes===0) return next(new ImageNotFoundError('Image could not be found'));

		res.status(200).json({ message: 'Image has been deleted' });
	} catch(err) {
		next(err);
	}
};