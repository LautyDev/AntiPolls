import { Schema, model, Document, Model } from 'mongoose';

interface LogsDocument extends Document {
	channel: string;
	webhook_id: string;
	webhook_url: string;
	guild: string;
}

const LogsSchema = new Schema<LogsDocument>({
	channel: {
		type: String,
		required: true,
	},
	webhook_id: {
		type: String,
		required: true,
	},
	webhook_url: {
		type: String,
		required: true,
	},
	guild: {
		type: String,
		required: true,
	},
});

const LogsModel: Model<LogsDocument> = model<LogsDocument>('Logs', LogsSchema);

export default LogsModel;
