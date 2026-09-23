import { parentPort,workerData } from "worker_threads";

interface ImageWithoutId {
	image_id: string;
	title: string;
	tags?: string[];
	file_path: string;
	uploaded_at: string;
}

if(!parentPort) throw new Error("Cannot run file outside a Worker context");

function shuffle(images: ImageWithoutId[]) {
	const a=[...images];
	for(let i=a.length-1;i>0;i--) {
		const j=Math.floor(Math.random()*(i+1));
		[a[i]!,a[j]!]=[a[j]!,a[i]!];
	}
	return a;
}

const result=shuffle(workerData);
parentPort.postMessage(result);