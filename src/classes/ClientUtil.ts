import { Message } from 'discord.js';

export class ClientUtil {
	toCodeBlock(code: string, text: string): string {
		return `\`\`\`${code.replace(/```/g, '')}\n${text.replace(
			/```/g,
			''
		)}\n\`\`\``;
	}

	isPoll(message: Message): boolean {
		return (
			message.activity === null &&
			message.cleanContent === '' &&
			message.roleSubscriptionData === null &&
			message.components.length === 0 &&
			message.system === false &&
			message.webhookId === null &&
			message.type === 0 &&
			message.attachments.size === 0 &&
			message.embeds.length === 0 &&
			message.applicationId === null &&
			message.resolved === null &&
			message.position === 0 &&
			message.stickers.size === 0 &&
			message.content === ''
		);
	}
}
