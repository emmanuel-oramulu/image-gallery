import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express,{ type Request,type Response,type NextFunction } from "express";
import cors from "cors";
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { CORS_CONFIG_OPTIONS } from './config/cors.js';
import authRouter from "./routes/auth.js";
import imageRouter from "./routes/images.js";
import favoriteRouter from './routes/favorites.js';
import db from "./config/db.js";
import errorHandler from './middlewares/errors/errorHandler.js';
import emitter from './events/emitter.js';
import {
	sendWelcomeEmail
} from './services/emailService.js';

emitter.on('user:registered',async ({
	name,email
}) => {
	try {
		await sendWelcomeEmail(name,email);
	} catch(err) {
		console.error(err);
	}
});

const app=express();
app.set('trust proxy', 1);
app.use(cors(CORS_CONFIG_OPTIONS));
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser())

app.use((req: Request,res: Response,next: NextFunction) => {
	const time=new Date().toLocaleTimeString();

	console.log(`${req.headers.origin} -- ${req.method} → ${req.url} -- "[${time}]\n`);
	next();
});
const __dirname: string=path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

app.use('/uploads',express.static(path.resolve(__dirname,'uploads')));

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/images',imageRouter);
app.use('/api/v1/favorites',favoriteRouter);


app.use(errorHandler);


function boot() {
	try {
		const PORT: number=parseInt(process.env.PORT||"8000",10);
		const server=app.listen(PORT,() => {
			console.log(`Server is listening at port ${PORT}`);
		});

		const shutdown=() => {
			console.log('Shutting down...');
			server.close();
			db.close();
			process.exit(0);
		}

		process.on('SIGTERM',shutdown);
		process.on('SIGINT',shutdown);
	} catch(err) {
		console.error('Failed to start server:',err);
		process.exit(1);
	}
}

boot()