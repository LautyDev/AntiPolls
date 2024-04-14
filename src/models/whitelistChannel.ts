import { Schema, model, Document, Model } from 'mongoose';

interface WhitelistChannelDocument extends Document {
	channel: string;
	guild: string;
}

const WhitelistchannelSchema = new Schema<WhitelistChannelDocument>({
	channel: {
		type: String,
		required: true,
	},
	guild: {
		type: String,
		required: true,
	},
});

const WhitelistChannelModel: Model<WhitelistChannelDocument> =
	model<WhitelistChannelDocument>('whitelisCchannel', WhitelistchannelSchema);

export default WhitelistChannelModel;
