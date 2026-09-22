const allowedOrigins=(process.env.ALLOWED_ORIGINS??'')
	.split(',')
	.map(o => o.trim())
	.filter(Boolean);

const ALLOWED_ORIGINS=new Set<string>(allowedOrigins);

if(ALLOWED_ORIGINS.size===0) {
	throw new Error('No specified origin');
}

export const CORS_CONFIG_OPTIONS={
	origin(origin: string|undefined,callback: (err: Error|null,allow?: boolean) => void) {
		if(!origin) return callback(null,true);

		if(ALLOWED_ORIGINS.has(origin)) {
			return callback(null,true);
		}

		console.log(`${origin} is not allowed by CORS`);
		return callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
	methods: ['GET','POST','PUT','DELETE','OPTIONS'],
	allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
};