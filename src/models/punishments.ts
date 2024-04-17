import { Schema, model, Document, Model } from 'mongoose';

interface PunishmentsDocument extends Document {
	id: number;
	type: string;
	max_polls: number;
	time: number;
	guild: string;
}

const PunishmentsSchema = new Schema<PunishmentsDocument>({
	id: {
		type: Number,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	max_polls: {
		type: Number,
		required: true,
	},
	time: {
		type: Number,
		required: false,
	},
	guild: {
		type: String,
		required: true,
	},
});

const PunishmentsModel: Model<PunishmentsDocument> = model<PunishmentsDocument>(
	'Punishments',
	PunishmentsSchema
);

export default PunishmentsModel;
