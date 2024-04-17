import mongoose from 'mongoose';

const db = mongoose.connection;
mongoose.set('strictQuery', true);

function connectToMongoDB() {
	mongoose
		.connect(`${process.env['MONGO_DB']}`)
		.catch(() => setTimeout(connectToMongoDB, 5000));
}

db.once('open', (_) => {
	console.log('[MONGO]'.green, 'Successfully connected to MongoDB.');
});

db.on('error', (e) => console.error('[MONGO]'.green, e));

connectToMongoDB();
