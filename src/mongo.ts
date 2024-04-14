import mongoose from 'mongoose';
const db = mongoose.connection;

mongoose.set('strictQuery', true);
mongoose.connect(`${process.env['MONGO_DB']}`).catch((err) => console.log(err));

db.once('open', (_) =>
	console.log('[MONGO]'.green, 'Successfully connected to MongoDB.')
);

db.on('error', (e) => console.error('[MONGO]'.green, e));
