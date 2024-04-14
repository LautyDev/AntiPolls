import { Schema, model, Document, Model } from 'mongoose';

interface WhitelistRoleDocument extends Document {
	role: string;
	guild: string;
}

const WhitelistRoleSchema = new Schema<WhitelistRoleDocument>({
	role: {
		type: String,
		required: true,
	},
	guild: {
		type: String,
		required: true,
	},
});

const WhitelistRoleModel: Model<WhitelistRoleDocument> =
	model<WhitelistRoleDocument>('whitelistRole', WhitelistRoleSchema);

export default WhitelistRoleModel;
