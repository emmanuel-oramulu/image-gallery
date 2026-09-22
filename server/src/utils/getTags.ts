import db from '../config/db.js';

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
	user_id: string;
	image_id: string;
	title: string;
	tags?: string[];
	file_path: string;
	uploaded_at: string;
}

function getTags(images: Image[]) {
	if(images.length===0) return [];

	const imageIds: Array<number>=images.map((i: Image) => i.id);

	const placeholders=imageIds.map(id => ' ?').join(',').trim();

	const imageTags=db.prepare(`
SELECT it.image_id, t.name 
FROM image_tags it 
JOIN tags t ON it.tag_id = t.id
WHERE it.image_id IN (${placeholders});`).all(...imageIds) as unknown as { image_id: number,name: string }[];

	const tagsByImageId=new Map<number,string[]>();
	for(const row of imageTags) {
		if(!tagsByImageId.has(row.image_id)) {
			tagsByImageId.set(row.image_id,[]);
		}
		tagsByImageId.get(row.image_id)!.push(row.name)
	}

	const safeData: ImageWithoutId[]=images.map((i) => {
		const { id,...data }=i;
		data.tags=tagsByImageId.get(id)??[];
		return data;
	});

	return safeData;
}

export default getTags;