import { Schema, model, Document, Model } from 'mongoose';

interface WhitelistUserDocument extends Document {
	user: string;
	guild: string;
}

const WhitelistUserSchema = new Schema<WhitelistUserDocument>({
	user: {
		type: String,
		required: true,
	},
	guild: {
		type: String,
		required: true,
	},
});

const WhitelistUserModel: Model<WhitelistUserDocument> =
	model<WhitelistUserDocument>('whitelistUser', WhitelistUserSchema);

export default WhitelistUserModel;
