import { Emojis } from '../constants';

export class ReplyClient {
	createReply(text: string, ephemeral?: boolean) {
		return { content: text, ephemeral: ephemeral || false };
	}

	success(text: string, ephemeral?: boolean) {
		return this.createReply(`${Emojis.Success} — ${text}`, ephemeral);
	}

	error(text: string, ephemeral?: boolean) {
		return this.createReply(`${Emojis.Error} — ${text}`, ephemeral);
	}

	loading(text: string, ephemeral?: boolean) {
		return this.createReply(`${Emojis.Loading} — ${text}`, ephemeral);
	}
}
